// Run: node --test scripts/
import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "./book.mjs";

const fresh = () => ({ seats: {}, log: [], stats: { requests: 0, booked: 0, conflicts: 0, rejected: 0, sessions: 1 } });
const req = (title, user) => ({ title, user, issue: 1 });

test("books a free seat", () => {
  const s = fresh();
  assert.equal(handle(s, req("book A1", "alice")).code, 200);
  assert.equal(s.seats.A1.user, "alice");
});

test("a taken seat is a 409, not a double booking", () => {
  const s = fresh();
  handle(s, req("book A1", "alice"));
  assert.equal(handle(s, req("book a1", "bob")).code, 409);
  assert.equal(s.seats.A1.user, "alice");
});

test("one seat per person", () => {
  const s = fresh();
  handle(s, req("book A1", "alice"));
  assert.equal(handle(s, req("book B2", "alice")).code, 409);
  assert.equal(s.seats.B2, undefined);
});

test("only an exact seat pattern is accepted", () => {
  const s = fresh();
  for (const t of ["hello", "book E1", "book A9", "book A1; rm -rf /", "book $(whoami)", "", null]) {
    assert.equal(handle(s, req(t, "eve")).code, 400, String(t));
  }
  assert.equal(handle(s, req("  BOOK c 8 ", "bob")).code, 200);
  assert.deepEqual(Object.keys(s.seats), ["C8"]);
});

test("a full room starts a new session", () => {
  const s = fresh();
  let n = 0;
  for (const r of "ABCD") for (let c = 1; c <= 8; c++) handle(s, req(`book ${r}${c}`, `u${n++}`));
  assert.equal(Object.keys(s.seats).length, 32);
  const res = handle(s, req("book A1", "late"));
  assert.equal(res.code, 200);
  assert.deepEqual(Object.keys(s.seats), ["A1"]);
  assert.equal(s.stats.sessions, 2);
});

test("stats and log track every request", () => {
  const s = fresh();
  handle(s, req("book A1", "alice"));
  handle(s, req("book A1", "bob"));
  handle(s, req("nope", "eve"));
  assert.deepEqual(s.stats, { requests: 3, booked: 1, conflicts: 1, rejected: 1, sessions: 1 });
  assert.deepEqual(s.log.map((e) => e.code), [200, 409, 400]);
});
