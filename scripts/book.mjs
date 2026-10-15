// Handles one "book <seat>" issue: the server side of this README.
// Reads the GitHub event, updates data/state.json, re-renders the README and
// writes the reply for the issue to reply.md. Never executes issue text.
// Run by .github/workflows/book.yml; locally: GITHUB_EVENT_PATH=event.json node scripts/book.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { render, seatIds, ROWS, COLS } from "./render.mjs";

const ROOT = new URL("../", import.meta.url);
const statePath = new URL("data/state.json", ROOT);
const LOG_LIMIT = 50;

export function handle(state, { title, user, issue, now = new Date().toISOString() }) {
  const total = ROWS.length * COLS;
  const m = /^\s*book\s+([a-d])\s*([1-8])\s*$/i.exec(title ?? "");
  const seat = m ? `${m[1].toUpperCase()}${m[2]}` : null;
  let code, status, reply;

  if (!seat) {
    code = 400; status = "Bad Request";
    state.stats.rejected++;
    reply = `**400 Bad Request.** I couldn't find a seat in \`${String(title).slice(0, 40)}\`. Click a free seat in the README and the title is filled in for you, like \`book B4\`.`;
  } else {
    let fresh = "";
    if (Object.keys(state.seats).length >= total) {
      state.seats = {};
      state.stats.sessions++;
      fresh = " The room was full, so a new session started and you're its first booking.";
    }
    const mine = Object.entries(state.seats).find(([, v]) => v.user === user);
    if (mine) {
      code = 409; status = "Conflict";
      state.stats.conflicts++;
      reply = `**409 Conflict.** You already have seat **${mine[0]}**. One seat per person, so everyone gets a turn at the wheel.`;
    } else if (state.seats[seat]) {
      code = 409; status = "Conflict";
      state.stats.conflicts++;
      reply = `**409 Conflict.** Seat **${seat}** was taken by @${state.seats[seat].user} first. That is the double booking this app exists to stop. Pick another free seat.`;
    } else {
      state.seats[seat] = { user, at: now, issue };
      state.stats.booked++;
      code = 200; status = "Booked";
      reply = `**200 Booked.** Seat **${seat}** is yours, @${user}. Your avatar is on the README now.${fresh}\n\nWhat just happened: this issue was the request, a GitHub Action read it, checked the seat against \`data/state.json\`, saved your booking and re-rendered the README. If someone else had booked at the same moment, git would have rejected one push and that run would have retried on fresh data.`;
    }
  }
  state.stats.requests++;
  state.log.push({ at: now, user, seat, code, status, issue });
  state.log = state.log.slice(-LOG_LIMIT);
  return { code, status, reply };
}

if (process.argv[1]?.endsWith("book.mjs")) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const issue = event.issue;
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const result = handle(state, { title: issue.title, user: issue.user.login, issue: issue.number });
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
  render();
  writeFileSync(new URL("reply.md", ROOT), result.reply + "\n");
  writeFileSync(new URL("result.txt", ROOT), `${result.code} ${result.status}\n`);
  console.log(`${result.code} ${result.status}`);
}

export { seatIds };
