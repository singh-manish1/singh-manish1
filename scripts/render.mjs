// Renders the profile README and its SVGs from data/state.json.
// The README is a small full stack app: seats are the UI, a GitHub issue is the
// request, the booking workflow is the server, state.json is the database.
// Run: node scripts/render.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const path = (p) => new URL(p, ROOT);
const REPO = "singh-manish1/singh-manish1";
export const ROWS = ["A", "B", "C", "D"];
export const COLS = 8;

const C = {
  sky: "#E3ECEF", paper: "#F6F8F8", ink: "#1C2433", inkSoft: "#4A5568", line: "rgba(28,36,51,.14)",
  lichen: "#A9B66E", clay: "#E0AE4C", sand: "#F3D08A", shale: "#7C8C99", slate: "#5E6E7B",
  bedrock: "#2E3150", probe: "#12B5CB", echo: "#F2C14E", ok: "#5E8C4A", warn: "#C2543A",
};
const SANS = `-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
const SERIF = `Georgia, 'Times New Roman', serif`;
const MONO = `ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;
const frame = (W, H, body, { title, desc, style = "", bg = C.paper, r = 20 }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
${style ? `<style>${style}${REDUCED}</style>` : ""}
<defs><clipPath id="clip"><rect width="${W}" height="${H}" rx="${r}"/></clipPath></defs>
<g clip-path="url(#clip)"><rect width="${W}" height="${H}" fill="${bg}"/>
${body}
</g></svg>`;

export const seatIds = () => ROWS.flatMap((r) => Array.from({ length: COLS }, (_, i) => `${r}${i + 1}`));

// ---------- hero ----------
function hero() {
  const W = 1200, H = 250;
  const body = `
<text x="56" y="104" font-family="${SERIF}" font-size="66" fill="${C.ink}" letter-spacing="-1">Manish Singh</text>
<text x="60" y="148" font-family="${SANS}" font-size="21" fill="${C.inkSoft}">Full stack engineer. React and Next.js up top, Node.js and PostgreSQL underneath.</text>
<text x="60" y="196" font-family="${SANS}" font-size="16" fill="${C.ink}">This README is a working app. Book a seat below and watch your request go through the stack.</text>
<g transform="translate(960,36)">
  <defs><clipPath id="pot"><path d="M50,150 C36,118 44,88 66,74 C74,68 72,52 66,44 L114,44 C108,52 106,68 114,74 C136,88 144,118 130,150 Z"/></clipPath></defs>
  <rect x="78" y="164" width="24" height="26" fill="${C.slate}"/>
  <ellipse cx="90" cy="160" rx="88" ry="15" fill="${C.slate}"/>
  <ellipse cx="90" cy="155" rx="88" ry="15" fill="${C.shale}"/>
  <path d="M50,150 C36,118 44,88 66,74 C74,68 72,52 66,44 L114,44 C108,52 106,68 114,74 C136,88 144,118 130,150 Z" fill="${C.clay}"/>
  <g clip-path="url(#pot)" stroke="${C.ink}" stroke-opacity=".35" stroke-width="2.5" fill="none">
    <path class="ring" d="M20,92 H160"/><path class="ring r2" d="M20,112 H160"/><path class="ring" d="M20,132 H160"/>
  </g>
  <path d="M50,150 C36,118 44,88 66,74 C74,68 72,52 66,44 L114,44 C108,52 106,68 114,74 C136,88 144,118 130,150 Z" fill="none" stroke="${C.ink}" stroke-width="3"/>
  <ellipse cx="90" cy="44" rx="24" ry="6" fill="${C.sand}" stroke="${C.ink}" stroke-width="3"/>
  <path class="ring" d="M8,158 Q90,180 172,158" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
</g>`;
  const style = `.ring{stroke-dasharray:10 14;animation:spin 1.1s linear infinite}.r2{animation-duration:1.4s}@keyframes spin{to{stroke-dashoffset:-48}}`;
  return frame(W, H, body, { title: "Manish Singh, full stack engineer", desc: "Header with a pot spinning on a wheel. This README is a working app: book a seat below.", style, bg: C.sky });
}

// ---------- seats ----------
function seatSvg(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" role="img" aria-label="Free seat ${id}">
<rect x="6" y="10" width="76" height="66" rx="16" fill="${C.sand}" stroke="${C.clay}" stroke-width="3"/>
<rect x="14" y="62" width="60" height="10" rx="5" fill="${C.clay}" opacity=".55"/>
<text x="44" y="48" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="600" fill="${C.ink}">${id}</text>
</svg>`;
}
function rowLabel(r) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 88" width="48" height="88" role="img" aria-label="Row ${r}">
<text x="24" y="52" text-anchor="middle" font-family="${SERIF}" font-size="26" font-style="italic" fill="#8A94A6">${r}</text></svg>`;
}
function wheelSvg(state) {
  const n = Object.keys(state.seats).length, total = ROWS.length * COLS;
  const W = 760, H = 96;
  const body = `<path d="M40,34 Q380,2 720,34" fill="none" stroke="${C.clay}" stroke-width="10" stroke-linecap="round"/>
<text x="380" y="50" text-anchor="middle" font-family="${SERIF}" font-size="20" font-style="italic" fill="${C.ink}">the wheel</text>
<text x="380" y="70" text-anchor="middle" font-family="${SANS}" font-size="14" fill="${C.inkSoft}">${n} of ${total} seats taken</text>`;
  return frame(W, H, body, { title: "The wheel", desc: `The front of the room. ${n} of ${total} seats taken.`, bg: "none", r: 0 }).replace(`<rect width="${W}" height="${H}" fill="none"/>`, "");
}

// ---------- architecture (live counters) ----------
function arch(state) {
  const W = 1200, H = 340;
  const s = state.stats;
  const nodes = [
    { x: 40, t: "You", d: "click a free seat" },
    { x: 272, t: "Request", d: "an issue: book A1" },
    { x: 504, t: "Server", d: "GitHub Action, Node.js" },
    { x: 736, t: "Database", d: "data/state.json" },
    { x: 968, t: "UI", d: "README re-rendered" },
  ];
  const y = 70, w = 192, h = 104;
  let body = "";
  nodes.forEach((n, i) => {
    const fill = [C.sand, C.lichen, C.clay, C.shale, C.sky][i];
    body += `<rect x="${n.x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${C.ink}" stroke-opacity=".25"/>`;
    body += `<text x="${n.x + 20}" y="${y + 44}" font-family="${SERIF}" font-size="24" font-style="italic" fill="${C.ink}">${n.t}</text>`;
    body += `<text x="${n.x + 20}" y="${y + 74}" font-family="${SANS}" font-size="14" fill="${C.ink}">${n.d}</text>`;
    if (i < nodes.length - 1) body += `<path d="M${n.x + w + 6},${y + h / 2} L${n.x + w + 34},${y + h / 2}" stroke="${C.ink}" stroke-width="2" marker-end="url(#arrow)"/>`;
  });
  // lock on the server
  body += `<g class="lock" transform="translate(${504 + w - 40},${y + 14})"><rect x="0" y="9" width="22" height="17" rx="3" fill="${C.ink}"/><path d="M5,9 V5 a6,6 0 0 1 12,0 V9" fill="none" stroke="${C.ink}" stroke-width="2.6"/></g>`;
  body += `<text x="${504}" y="${y + h + 28}" font-family="${MONO}" font-size="12.5" fill="${C.inkSoft}">retries if the data changed</text>`;
  body += `<text x="${736}" y="${y + h + 28}" font-family="${MONO}" font-size="12.5" fill="${C.inkSoft}">git push = compare-and-swap</text>`;
  // packet travelling along the arrows
  body += `<circle class="pkt" cx="136" cy="${y + h}" r="9" fill="${C.probe}" stroke="#fff" stroke-width="2.5"/>`;
  // counters
  const stats = [
    [s.requests, "requests served"],
    [s.booked, "seats booked"],
    [s.conflicts, "double bookings stopped (409)"],
    [s.rejected, "bad requests turned away (400)"],
  ];
  stats.forEach(([v, label], i) => {
    const x = 40 + i * 290;
    body += `<text x="${x}" y="${H - 44}" font-family="${SANS}" font-size="34" font-weight="600" fill="${C.ink}">${v}</text>`;
    body += `<text x="${x + 16 + String(v).length * 21}" y="${H - 50}" font-family="${SANS}" font-size="14" fill="${C.inkSoft}">${label}</text>`;
  });
  body += `<line x1="40" y1="${H - 96}" x2="${W - 40}" y2="${H - 96}" stroke="${C.line}"/>`;
  const style = `.pkt{animation:pkt 6s cubic-bezier(.6,0,.4,1) infinite}
@keyframes pkt{0%{transform:translateX(0);opacity:0}6%{opacity:1}20%,26%{transform:translateX(232px)}44%,58%{transform:translateX(464px)}72%,78%{transform:translateX(696px)}94%{transform:translateX(928px);opacity:1}100%{transform:translateX(928px);opacity:0}}
.lock{animation:lock 6s linear infinite}@keyframes lock{0%,42%{opacity:.25}46%,58%{opacity:1}62%,100%{opacity:.25}}`;
  body = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${C.ink}"/></marker></defs>` + body;
  return frame(W, H, body, { title: "How this README works", desc: `Clicking a seat opens an issue (the request). A GitHub Action (the server) books it with optimistic locking, saves it to data/state.json (the database) and re-renders this README (the UI). So far: ${s.requests} requests, ${s.booked} seats booked, ${s.conflicts} double bookings stopped, ${s.rejected} bad requests turned away.`, style });
}

// ---------- request traces (projects) ----------
function trace({ name, kind, link, req, spans, note }) {
  const W = 1200, rowH = 34, top = 112, labelW = 380, x0 = 440, x1 = 1150;
  const H = top + spans.length * rowH + 64;
  const end = Math.max(...spans.map((s) => s[1] + s[2]));
  const X = (t) => x0 + (t / end) * (x1 - x0);
  const kinds = { client: C.lichen, server: C.clay, db: C.shale, async: C.sand };
  let body = `<text x="40" y="54" font-family="${SERIF}" font-size="30" font-style="italic" fill="${C.ink}">${esc(name)}</text>`;
  body += `<text x="40" y="84" font-family="${SANS}" font-size="15" fill="${C.inkSoft}">${esc(kind)}${link ? `, ${esc(link)}` : ""}</text>`;
  body += `<text x="${x1}" y="54" text-anchor="end" font-family="${MONO}" font-size="15" fill="${C.ink}">${esc(req)}</text>`;
  for (let t = 0; t <= 4; t++) body += `<line x1="${x0 + (t * (x1 - x0)) / 4}" y1="${top - 6}" x2="${x0 + (t * (x1 - x0)) / 4}" y2="${top + spans.length * rowH}" stroke="${C.line}"/>`;
  spans.forEach(([label, start, dur, k, depth = 0], i) => {
    const y = top + i * rowH;
    if (i % 2 === 0) body += `<rect x="24" y="${y}" width="${W - 48}" height="${rowH}" fill="rgba(28,36,51,.03)"/>`;
    body += `<text x="${40 + depth * 18}" y="${y + 22}" font-family="${MONO}" font-size="13.5" fill="${C.ink}">${esc(label)}</text>`;
    const cls = `s${i}`;
    body += `<rect class="${cls}" x="${X(start)}" y="${y + 8}" width="${Math.max(X(start + dur) - X(start), 6)}" height="${rowH - 16}" rx="4" fill="${kinds[k]}"/>`;
  });
  // legend
  const legend = [["client", "browser"], ["server", "server"], ["db", "database"], ["async", "after commit"]];
  legend.forEach(([k, l], i) => {
    const x = 40 + i * 150, y = H - 26;
    body += `<rect x="${x}" y="${y - 11}" width="14" height="14" rx="3" fill="${kinds[k]}"/><text x="${x + 22}" y="${y + 1}" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">${l}</text>`;
  });
  body += `<text x="${x1}" y="${H - 25}" text-anchor="end" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">${esc(note)}</text>`;
  // bars draw in, in order, once per loop
  const P = 7;
  let style = "";
  spans.forEach(([, start], i) => {
    const a = ((start / end) * 55).toFixed(1), b = Math.min(+a + 8, 70).toFixed(1);
    style += `.s${i}{transform-box:fill-box;transform-origin:left;animation:g${i} ${P}s ease-out infinite}@keyframes g${i}{0%,${a}%{transform:scaleX(0)}${b}%,92%{transform:scaleX(1)}100%{transform:scaleX(0)}}\n`;
  });
  return frame(W, H, body, { title: `${name}: request trace`, desc: `${name}, ${kind}. Trace of ${req}: ${spans.map((s) => s[0]).join(", ")}.`, style });
}

const projects = [
  { file: "trace-geeli-maati.svg", name: "Geeli Maati", kind: "Pottery studio booking and shop, private repo", req: "POST  book a workshop seat", note: "The shape of the request, not a benchmark.",
    spans: [
      ["Book button (Server Action form)", 0, 6, "client"],
      ["bookSeat()  service layer", 6, 70, "server"],
      ["BEGIN", 10, 3, "db", 1],
      ["SELECT session … FOR UPDATE", 13, 14, "db", 1],
      ["check capacity and holds", 27, 8, "server", 1],
      ["INSERT booking  (30 min hold)", 35, 12, "db", 1],
      ["INSERT email_outbox  (same tx)", 47, 9, "db", 1],
      ["COMMIT", 56, 6, "db", 1],
      ["revalidate, render page", 76, 14, "client"],
      ["after(): send email via Resend", 80, 30, "async"],
    ] },
  { file: "trace-repset.svg", name: "Repset", kind: "Multi-tenant gym SaaS", link: "repset.in", req: "PATCH  mark member attendance", note: "Optimistic UI: the screen updates before the server answers.",
    spans: [
      ["optimistic update (React Query)", 0, 4, "client"],
      ["API route handler", 4, 52, "server"],
      ["Clerk session + role check (RBAC)", 6, 12, "server", 1],
      ["tenant scope: where gym_id = …", 18, 6, "server", 1],
      ["UPDATE attendance", 24, 20, "db", 1],
      ["200 OK", 56, 3, "server"],
      ["invalidate + refetch analytics", 59, 22, "client"],
    ] },
  { file: "trace-rachnakaar.svg", name: "Rachnakaar", kind: "Writing in Indian languages", link: "rachnakaar.vercel.app", req: "POST  publish a story", note: "Indic text stays UTF-8 from the editor to the database.",
    spans: [
      ["rich text editor serialises", 0, 8, "client"],
      ["API route handler", 8, 48, "server"],
      ["Clerk auth", 10, 9, "server", 1],
      ["validate title + body", 19, 6, "server", 1],
      ["prisma.story.create()", 25, 24, "db", 1],
      ["enter competition entry", 49, 5, "server", 1],
      ["render story page", 56, 18, "client"],
    ] },
];

// ---------- experience as git log --graph ----------
function gitlog() {
  const W = 1200;
  const commits = [
    { lane: 1, hash: "a7c2e19", when: "Feb 2026", msg: "Associate Software Engineer @ Appbrew Technologies", sub: "Cross-platform apps on React Native's Fabric architecture", head: true },
    { lane: 0, hash: "5d03b8f", when: "Jun 2025", msg: "Graduate: B.Tech Computer Science, UIT RGPV", sub: "merge: internships into main" },
    { lane: 2, hash: "e91f4aa", when: "May 2023", msg: "SDE Intern @ Braktt Technologies", sub: "Dashboards on REST APIs, 25% faster Largest Contentful Paint" },
    { lane: 2, hash: "3b7e0c2", when: "Oct 2022", msg: "Frontend Intern @ Braktt Technologies", sub: "React component library, JWT sign-in flows" },
    { lane: 0, hash: "0f1a2b3", when: "Jun 2021", msg: "init: start B.Tech, UIT RGPV", sub: "" },
  ];
  const top = 90, step = 74, laneX = (l) => 70 + l * 36;
  const H = top + commits.length * step + 10;
  const colors = [C.slate, C.ok, C.clay];
  let body = `<text x="40" y="54" font-family="${MONO}" font-size="15" fill="${C.inkSoft}">$ git log --graph --oneline career</text>`;
  const Y = (i) => top + i * step;
  // main lane, full height
  body += `<line x1="${laneX(0)}" y1="${Y(0) - 20}" x2="${laneX(0)}" y2="${Y(4)}" stroke="${colors[0]}" stroke-width="4"/>`;
  // internship branch: off main after init, merged at graduation
  body += `<path d="M${laneX(0)},${Y(4)} C${laneX(0)},${Y(4) - 30} ${laneX(2)},${Y(4) - 30} ${laneX(2)},${Y(3)} L${laneX(2)},${Y(2)} C${laneX(2)},${Y(1) + 20} ${laneX(0)},${Y(1) + 30} ${laneX(0)},${Y(1)}" fill="none" stroke="${colors[2]}" stroke-width="4"/>`;
  // work branch from graduation
  body += `<path d="M${laneX(0)},${Y(1)} C${laneX(0)},${Y(1) - 34} ${laneX(1)},${Y(1) - 30} ${laneX(1)},${Y(0) + 14} L${laneX(1)},${Y(0)}" fill="none" stroke="${colors[1]}" stroke-width="4"/>`;
  commits.forEach((c, i) => {
    const y = Y(i), x = laneX(c.lane);
    body += `<circle class="c${i}" cx="${x}" cy="${y}" r="9" fill="${C.paper}" stroke="${colors[c.lane]}" stroke-width="4"/>`;
    body += `<text x="200" y="${y + 5}" font-family="${MONO}" font-size="14" fill="${C.clay}">${c.hash}</text>`;
    if (c.head) body += `<text x="282" y="${y + 5}" font-family="${MONO}" font-size="14" fill="${C.ok}">(HEAD -&gt; work)</text>`;
    body += `<text x="${c.head ? 420 : 282}" y="${y + 5}" font-family="${SANS}" font-size="17" font-weight="600" fill="${C.ink}">${esc(c.msg)}</text>`;
    body += `<text x="${W - 40}" y="${y + 5}" text-anchor="end" font-family="${SANS}" font-size="14" fill="${C.inkSoft}">${c.when}</text>`;
    if (c.sub) body += `<text x="282" y="${y + 29}" font-family="${SANS}" font-size="14" fill="${C.inkSoft}">${esc(c.sub)}</text>`;
  });
  const style = `.c0{animation:head 2s ease-in-out infinite}@keyframes head{50%{fill:${C.ok}}}`;
  return frame(W, H, body, { title: "Experience as a git log", desc: commits.map((c) => `${c.when}: ${c.msg}. ${c.sub}`).join(" "), style });
}

// ---------- README ----------
function readme(state) {
  const issueUrl = (id) => `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(`book ${id}`)}&body=${encodeURIComponent("Press **Create** to send this request. A GitHub Action will try to book the seat and reply here in about a minute.")}`;
  const seatRows = ROWS.map((r) => {
    const cells = Array.from({ length: COLS }, (_, i) => {
      const id = `${r}${i + 1}`;
      const taken = state.seats[id];
      if (taken) return `<a href="https://github.com/${esc(taken.user)}"><img src="https://github.com/${esc(taken.user)}.png?size=88" width="44" height="44" alt="${id}: booked by @${esc(taken.user)}" title="${id}: @${esc(taken.user)}"/></a>`;
      return `<a href="${issueUrl(id)}"><img src="./assets/seats/${id}.svg" width="44" height="44" alt="Book seat ${id}" title="Book ${id}"/></a>`;
    }).join("");
    return `<img src="./assets/seats/row-${r}.svg" width="24" height="44" alt="Row ${r}"/>${cells}`;
  }).join("<br/>\n");
  const log = state.log.slice(-6).reverse();
  const logRows = log.length
    ? log.map((e) => `| ${e.at.slice(0, 16).replace("T", " ")} | [@${e.user}](https://github.com/${e.user}) | \`book ${e.seat ?? "?"}\` | ${e.code} ${e.status} |`).join("\n")
    : "| | | No requests yet. Be the first. | |";
  return `<!-- Generated by scripts/render.mjs from data/state.json. Edit those, not this file. -->

<p align="center">
  <img src="./assets/hero.svg" width="100%" alt="Manish Singh, full stack engineer. This README is a working app: book a seat below."/>
</p>

<p align="center">
  <a href="https://manishsingh-tau.vercel.app/">Portfolio</a> &nbsp;/&nbsp;
  <a href="https://linkedin.com/in/singh-manish1">LinkedIn</a> &nbsp;/&nbsp;
  <a href="mailto:smanish14322@gmail.com">smanish14322@gmail.com</a> &nbsp;/&nbsp;
  Bhopal, India
</p>

## Book a seat at the wheel

Pick a free seat. GitHub opens an issue with your request filled in; press **Create**. About a minute later your avatar takes the seat and the Action replies on your issue. One seat per person, and two people can never get the same seat.

<p align="center">
${seatRows}
<br/>
<img src="./assets/wheel.svg" width="560" alt="The wheel: ${Object.keys(state.seats).length} of ${ROWS.length * COLS} seats taken"/>
</p>

| Time (UTC) | Who | Request | Response |
| --- | --- | --- | --- |
${logRows}

## How this README works

<p align="center">
  <img src="./assets/arch.svg" width="100%" alt="Clicking a seat opens an issue (the request). A GitHub Action (the server) books it with optimistic locking, saves it to data/state.json (the database) and re-renders this README (the UI)."/>
</p>

The [booking workflow](.github/workflows/book.yml) uses optimistic concurrency: each run books against the latest \`state.json\` and pushes, and if another booking landed first the push is rejected, so it re-reads and tries again. Two clicks on the same seat can never both win. It's the guarantee I get from \`SELECT … FOR UPDATE\` row locks in production, built from git instead of PostgreSQL. The seat is matched from the issue title with a strict pattern and never executed.

## Experience

<p align="center">
  <img src="./assets/gitlog.svg" width="100%" alt="Experience as a git log. Feb 2026: Associate Software Engineer at Appbrew Technologies. Jun 2025: B.Tech Computer Science, UIT RGPV. May 2023 to Jan 2024: SDE Intern at Braktt Technologies. Oct 2022 to Apr 2023: Frontend Intern at Braktt Technologies. Jun 2021: started B.Tech."/>
</p>

Also: ran React workshops for 35+ students at CodeCult, and 20+ sessions for 100+ people as Web Master of Asper Club.

## Projects

Each project as a trace of one real request, from the browser down to the database.

<p align="center">
  <img src="./assets/trace-geeli-maati.svg" width="100%" alt="Geeli Maati trace, booking a workshop seat: Server Action, BEGIN, SELECT FOR UPDATE on the session row, capacity check, insert booking with a 30 minute hold, insert email outbox row in the same transaction, COMMIT, then the email is sent after commit."/>
</p>

**Geeli Maati** (private, in progress). Workshop booking, a shop that ships across India and an admin dashboard. Next.js 16, PostgreSQL, Drizzle, Better Auth, UPI payments with UTR verification, a transactional email outbox, 247 Vitest tests including race-condition tests.

<p align="center">
  <a href="https://repset.in"><img src="./assets/trace-repset.svg" width="100%" alt="Repset trace, marking attendance: optimistic update in React Query, API route, Clerk role check, tenant scope by gym, UPDATE in PostgreSQL, 200 OK, refetch analytics."/></a>
</p>

**[Repset](https://repset.in)**. Multi-tenant gym management with role-based access, Razorpay billing and optimistic UI for 30% faster interactions.

<p align="center">
  <a href="https://rachnakaar.vercel.app/"><img src="./assets/trace-rachnakaar.svg" width="100%" alt="Rachnakaar trace, publishing a story: editor serialises, API route, Clerk auth, validation, Prisma create, competition entry, render."/></a>
</p>

**[Rachnakaar](https://rachnakaar.vercel.app/)**. A platform for Indian writers to publish in their own scripts, with a rich text editor and writing competitions.

Also built: [Onezy](https://onezy.in), an agency website, and [Gurukool](https://gurukool.tech), a learning platform that answers questions from your own PDFs.

## Skills

| Layer | What I use |
| --- | --- |
| Browser | React, Next.js, React Native, TypeScript, Tailwind CSS, React Query, Redux Toolkit, Zustand |
| Server | Node.js, Next.js Server Actions and Route Handlers, REST APIs, tRPC, Zod, GitHub Actions |
| Database | PostgreSQL, Drizzle ORM, Prisma ORM, schema design, transactions, row locking |
| Plumbing | Better Auth, Clerk, JWT, OAuth, RBAC, Razorpay, UPI, Cloudinary, Resend, Vitest |

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${REPO}/output/github-contribution-grid-snake-dark.svg"/>
    <img alt="Animated snake eating Manish Singh's GitHub contribution graph" src="https://raw.githubusercontent.com/${REPO}/output/github-contribution-grid-snake.svg"/>
  </picture>
</p>

<p align="center">
  <a href="https://holopin.io/@manish0204"><img src="https://holopin.me/manish0204" alt="Holopin badges" width="410"/></a>
</p>
`;
}

export function render() {
  const state = JSON.parse(readFileSync(path("data/state.json"), "utf8"));
  mkdirSync(path("assets/seats/"), { recursive: true });
  writeFileSync(path("assets/hero.svg"), hero());
  for (const id of seatIds()) writeFileSync(path(`assets/seats/${id}.svg`), seatSvg(id));
  for (const r of ROWS) writeFileSync(path(`assets/seats/row-${r}.svg`), rowLabel(r));
  writeFileSync(path("assets/wheel.svg"), wheelSvg(state));
  writeFileSync(path("assets/arch.svg"), arch(state));
  for (const p of projects) writeFileSync(path(`assets/${p.file}`), trace(p));
  writeFileSync(path("assets/gitlog.svg"), gitlog());
  writeFileSync(path("README.md"), readme(state));
}

if (process.argv[1]?.endsWith("render.mjs")) {
  render();
  console.log("rendered");
}
