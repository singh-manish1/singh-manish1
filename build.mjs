// Generates assets/journey.svg: one continuous dig from the surface to bedrock.
// A request drops down the borehole, each entry lights up as it passes,
// "200 OK" fires at the bottom and the response rises back to the surface.
// Run: node build.mjs
import { writeFileSync } from "node:fs";

const C = {
  sky: "#E3ECEF",
  ink: "#1C2433",
  inkSoft: "#4A5568",
  topsoil: "#A9B66E",
  topsoil2: "#B7C27F",
  clay: "#E0AE4C",
  sand: "#F3D08A",
  shale: "#5E6E7B",
  shaleLight: "#7C8C99",
  bedrock: "#2E3150",
  probe: "#12B5CB",
  echo: "#F2C14E",
};
const SANS = `-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
const SERIF = `Georgia, 'Times New Roman', serif`;
const MONO = `ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------- geometry helpers ----------
function wave(x0, x1, y, amp, seed, step = 60) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < x1; x += step) {
    const nx = Math.min(x + step, x1);
    const cy = y + Math.sin((x + seed * 97) * 0.013) * amp + Math.cos((x + seed * 31) * 0.031) * amp * 0.5;
    d += ` Q${x + step / 2},${cy.toFixed(1)} ${nx},${(y + Math.sin((nx + seed * 53) * 0.02) * amp * 0.3).toFixed(1)}`;
  }
  return d;
}
const band = (x0, x1, yTop, yBot, seed, fill, amp = 8) =>
  `<path d="${wave(x0, x1, yTop, amp, seed)} L${x1},${yBot} L${x0},${yBot} Z" fill="${fill}"/>`;
const seam = (x0, x1, y, seed, color = "rgba(28,36,51,.25)") =>
  `<path d="${wave(x0, x1, y, 5, seed)}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
function speckle(x0, x1, y0, y1, n, color, seed) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const b = Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345;
    const x = x0 + (a - Math.floor(a)) * (x1 - x0);
    const y = y0 + (b - Math.floor(b)) * (y1 - y0);
    const r = 0.8 + (((a * 7) % 1) + 1) % 1 * 1.6;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`;
  }
  return s;
}

// ---------- layout ----------
const W = 1200;
const SHAFT = 1118;           // borehole x
const TOP = 262;              // where the probe enters the ground
const S = {                   // section tops
  exp: 250,
  proj: 610,
  stack: 1120,
  rock: 1480,
  end: 1820,
};
const TURN = 1726;            // where the probe turns around
const H = S.end;

// ---------- timing (seconds) ----------
const V_DOWN = 210, V_UP = 420, HOLD_BOTTOM = 1.0, HOLD_TOP = 1.4;
const T_DOWN = (TURN - TOP) / V_DOWN;
const T_UP = (TURN - TOP) / V_UP;
const P = +(T_DOWN + HOLD_BOTTOM + T_UP + HOLD_TOP).toFixed(2);
const pct = (t) => +((t / P) * 100).toFixed(2);
const passAt = (y) => (y - TOP) / V_DOWN; // when the probe reaches depth y

let css = "";
let kf = 0;
// Something that lights up when the probe passes depth y and stays lit for the rest of the cycle.
function revealClass(y) {
  const name = `r${kf++}`;
  const a = pct(passAt(y)), b = Math.min(a + 2.5, 99);
  css += `.${name}{animation:${name} ${P}s linear infinite}
@keyframes ${name}{0%,${a}%{opacity:.42;transform:translateX(14px)}${b}%,97%{opacity:1;transform:translateX(0)}100%{opacity:.42;transform:translateX(14px)}}\n`;
  return name;
}
// A short flash around the moment the probe passes depth y (or at time t).
function flashClass({ y, t, hold = 1.2 }) {
  const name = `f${kf++}`;
  const at = t ?? passAt(y);
  const a = pct(Math.max(at - 0.1, 0)), b = pct(at + 0.15), c = pct(at + hold), d = pct(at + hold + 0.3);
  css += `.${name}{animation:${name} ${P}s linear infinite;opacity:0}
@keyframes ${name}{0%,${a}%{opacity:0}${b}%,${c}%{opacity:1}${d}%,100%{opacity:0}}\n`;
  return name;
}

let g = "";

// ---------- 1. Surface ----------
g += `<rect width="${W}" height="${S.exp + 20}" fill="${C.sky}"/>`;
g += `<text x="60" y="112" font-family="${SERIF}" font-size="68" fill="${C.ink}" letter-spacing="-1">Manish Singh</text>`;
g += `<text x="64" y="156" font-family="${SANS}" font-size="21" fill="${C.inkSoft}">Full stack engineer. I build from the pixel down to the row lock.</text>`;
g += `<text x="64" y="206" font-family="${SANS}" font-size="16" fill="${C.inkSoft}">A request is about to dig through everything I've built. Follow it down.</text>`;
// drilling rig
g += `<g stroke="${C.ink}" stroke-linejoin="round" fill="none">
  <path d="M${SHAFT - 36},${S.exp + 6} L${SHAFT},${S.exp - 92} L${SHAFT + 36},${S.exp + 6}" stroke-width="3"/>
  <line x1="${SHAFT - 24}" y1="${S.exp - 30}" x2="${SHAFT + 24}" y2="${S.exp - 30}" stroke-width="2"/>
  <line x1="${SHAFT - 14}" y1="${S.exp - 58}" x2="${SHAFT + 14}" y2="${S.exp - 58}" stroke-width="2"/>
  <line x1="${SHAFT}" y1="${S.exp - 92}" x2="${SHAFT}" y2="${S.exp + 6}" stroke-width="2"/>
</g>`;
g += `<circle class="beacon" cx="${SHAFT}" cy="${S.exp - 96}" r="4" fill="${C.probe}"/>`;
css += `.beacon{animation:beacon 1.6s ease-in-out infinite}@keyframes beacon{50%{opacity:.2}}\n`;

// ---------- 2. Experience (topsoil) ----------
const exp = [
  { when: "Feb 2026 – now", role: "Associate Software Engineer", org: "Appbrew Technologies", note: "Cross-platform apps on React Native's Fabric architecture" },
  { when: "May 2023 – Jan 2024", role: "SDE Intern", org: "Braktt Technologies", note: "Data dashboards on REST APIs, 25% faster Largest Contentful Paint" },
  { when: "Oct 2022 – Apr 2023", role: "Frontend Intern", org: "Braktt Technologies", note: "Reusable React component library and JWT sign-in flows" },
];
g += band(0, W, S.exp, S.proj + 20, 1, C.topsoil, 9);
g += speckle(0, W, S.exp + 14, S.proj, 160, "rgba(28,36,51,.10)", 2);
g += `<text x="60" y="${S.exp + 62}" font-family="${SERIF}" font-size="34" font-style="italic" fill="${C.ink}">Experience</text>`;
g += `<text x="${SHAFT - 40}" y="${S.exp + 58}" text-anchor="end" font-family="${SANS}" font-size="14" fill="${C.ink}" opacity=".7">−1 m</text>`;
exp.forEach((e, i) => {
  const y = S.exp + 92 + i * 86;
  if (i > 0) g += seam(40, SHAFT - 30, y - 4, i + 4);
  const cy = y + 40;
  const cls = revealClass(cy);
  g += `<g class="${cls}">
  <text x="60" y="${y + 34}" font-family="${SANS}" font-size="15" fill="${C.ink}" opacity=".75">${e.when}</text>
  <text x="300" y="${y + 34}" font-family="${SERIF}" font-size="23" font-style="italic" fill="${C.ink}">${e.role}, ${e.org}</text>
  <text x="300" y="${y + 60}" font-family="${SANS}" font-size="15" fill="${C.ink}" opacity=".85">${esc(e.note)}</text>
</g>`;
  g += `<circle class="${flashClass({ y: cy, hold: 0.5 })}" cx="${SHAFT}" cy="${cy}" r="15" fill="none" stroke="${C.probe}" stroke-width="2"/>`;
});

// ---------- 3. Projects (clay) ----------
const projects = [
  { name: "Geeli Maati", kind: "Pottery studio booking and shop", when: "2026 – now",
    seg: [["Next.js 16, React 19", 2, C.topsoil], ["Server Actions", 1.3, C.sand], ["UPI payments, refunds", 1.3, C.sand], ["PostgreSQL, Drizzle", 1.8, C.shaleLight, 1], ["Row locks, no overbooking", 1.3, C.shale, 1], ["247 Vitest tests", 1.3, C.bedrock, 1]] },
  { name: "Repset", kind: "Multi-tenant gym SaaS", when: "2025",
    seg: [["Next.js 14, React Query", 2, C.topsoil], ["Optimistic UI", 1.2, C.topsoil2], ["APIs and RBAC (Clerk)", 1.8, C.sand], ["Razorpay billing", 1.3, C.sand], ["PostgreSQL, per tenant", 2.2, C.shaleLight, 1]] },
  { name: "Rachnakaar", kind: "Writing in Indian languages", when: "2025",
    seg: [["Rich text editor", 1.8, C.topsoil], ["Indic scripts end to end", 1.5, C.topsoil2], ["Writing competitions", 1.8, C.sand], ["Clerk auth", 1.2, C.sand], ["Prisma data model", 2.2, C.shaleLight, 1]] },
];
g += band(0, W, S.proj, S.stack + 20, 7, C.clay, 9);
g += speckle(0, W, S.proj + 14, S.stack, 220, "rgba(28,36,51,.10)", 8);
g += `<text x="60" y="${S.proj + 66}" font-family="${SERIF}" font-size="34" font-style="italic" fill="${C.ink}">Projects</text>`;
g += `<text x="300" y="${S.proj + 64}" font-family="${SANS}" font-size="15" fill="${C.ink}" opacity=".8">Each one pulled up as a drill core, interface on top, data at the bottom.</text>`;
g += `<text x="${SHAFT - 40}" y="${S.proj + 62}" text-anchor="end" font-family="${SANS}" font-size="14" fill="${C.ink}" opacity=".7">−2 m</text>`;
projects.forEach((p, i) => {
  const cx = 112 + i * 336, top = S.proj + 150, bottom = S.proj + 400, rx = 40, ry = 11;
  const total = p.seg.reduce((a, s) => a + s[1], 0);
  const cls = revealClass(top + 60);
  let core = "", y = top;
  p.seg.forEach(([label, w, fill, dark], j) => {
    const h = ((bottom - top) * w) / total;
    core += `<path d="M${cx - rx},${y} L${cx - rx},${y + h} A${rx},${ry} 0 0 0 ${cx + rx},${y + h} L${cx + rx},${y} A${rx},${ry} 0 0 1 ${cx - rx},${y} Z" fill="${fill}" stroke="rgba(28,36,51,.3)"/>`;
    core += speckle(cx - rx + 4, cx + rx - 4, y + 4, y + h - 2, Math.round(h / 5), dark ? "rgba(255,255,255,.14)" : "rgba(28,36,51,.12)", i * 10 + j);
    const ly = y + h / 2 + 4;
    core += `<line x1="${cx + rx + 6}" y1="${ly - 4}" x2="${cx + rx + 20}" y2="${ly - 4}" stroke="${C.ink}" stroke-opacity=".5"/>`;
    core += `<text x="${cx + rx + 26}" y="${ly}" font-family="${SANS}" font-size="13" fill="${C.ink}">${label}</text>`;
    y += h;
  });
  core += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${p.seg[0][2]}" stroke="rgba(28,36,51,.35)"/>`;
  core += `<ellipse cx="${cx}" cy="${top}" rx="${rx - 10}" ry="${ry - 4}" fill="rgba(255,255,255,.3)"/>`;
  core += `<path d="M${cx + rx - 12},${top} L${cx + rx - 12},${bottom + 8}" stroke="rgba(0,0,0,.12)" stroke-width="10"/>`;
  g += `<g class="${cls}">
  <text x="${cx - rx}" y="${top - 30}" font-family="${SERIF}" font-size="25" font-style="italic" fill="${C.ink}">${p.name}</text>
  ${core}
  <text x="${cx - rx}" y="${bottom + 50}" font-family="${SANS}" font-size="15" fill="${C.ink}">${p.kind}</text>
  <text x="${cx - rx}" y="${bottom + 72}" font-family="${SANS}" font-size="14" fill="${C.ink}" opacity=".7">${p.when}</text>
</g>`;
});
g += `<circle class="${flashClass({ y: S.proj + 210, hold: 0.6 })}" cx="${SHAFT}" cy="${S.proj + 210}" r="15" fill="none" stroke="${C.probe}" stroke-width="2"/>`;

// ---------- 4. Stack (shale) ----------
const stack = [
  ["Interface", "React, Next.js, React Native, TypeScript, Tailwind CSS, React Query, Redux Toolkit, Zustand"],
  ["Server", "Node.js, Next.js Server Actions and Route Handlers, REST APIs, tRPC, Zod"],
  ["Data", "PostgreSQL, Drizzle ORM, Prisma ORM, schema design, transactions, row locking"],
  ["Plumbing", "Better Auth, Clerk, JWT, OAuth, RBAC, Razorpay, UPI, Cloudinary, Resend, Vitest"],
];
g += band(0, W, S.stack, S.rock + 20, 13, C.shale, 9);
g += speckle(0, W, S.stack + 14, S.rock, 200, "rgba(255,255,255,.08)", 14);
g += `<text x="60" y="${S.stack + 64}" font-family="${SERIF}" font-size="34" font-style="italic" fill="#fff">Stack</text>`;
g += `<text x="${SHAFT - 40}" y="${S.stack + 60}" text-anchor="end" font-family="${SANS}" font-size="14" fill="#fff" opacity=".7">−3 m</text>`;
let lockY = 0;
stack.forEach(([name, tools], i) => {
  const y = S.stack + 120 + i * 58;
  if (i > 0) g += seam(40, SHAFT - 30, y - 30, i + 20, "rgba(255,255,255,.18)");
  const cls = revealClass(y);
  g += `<g class="${cls}">
  <text x="60" y="${y}" font-family="${SERIF}" font-size="22" font-style="italic" fill="#fff">${name}</text>
  <text x="300" y="${y}" font-family="${SANS}" font-size="15.5" fill="#fff" opacity=".92">${esc(tools)}</text>
</g>`;
  if (name === "Data") lockY = y - 6;
});
// the row lock, taken as the request passes the data layer
const lockCls = flashClass({ y: lockY, hold: 1.0 });
g += `<g class="${lockCls}">
  <g transform="translate(${SHAFT + 24},${lockY - 13})"><rect x="0" y="7" width="18" height="14" rx="2" fill="#fff"/><path d="M4,7 V3 a5,5 0 0 1 10,0 V7" fill="none" stroke="#fff" stroke-width="2.4"/></g>
  <text x="${SHAFT - 26}" y="${lockY + 32}" text-anchor="end" font-family="${MONO}" font-size="13" fill="#fff">SELECT … FOR UPDATE</text>
</g>`;

// ---------- 5. Bedrock ----------
g += band(0, W, S.rock, S.end, 21, C.bedrock, 9);
g += speckle(0, W, S.rock + 14, S.end, 220, "rgba(255,255,255,.08)", 22);
g += `<text x="60" y="${S.rock + 64}" font-family="${SERIF}" font-size="34" font-style="italic" fill="#fff">Foundation</text>`;
g += `<text x="${SHAFT - 40}" y="${S.rock + 60}" text-anchor="end" font-family="${SANS}" font-size="14" fill="#fff" opacity=".7">−4 m</text>`;
const found = [
  ["Jun 2021 – Jun 2025", "B.Tech in Computer Science, UIT RGPV, Bhopal"],
  ["Teaching", "React workshops for 35+ students at CodeCult; 20+ sessions as Web Master, Asper Club"],
];
found.forEach(([when, what], i) => {
  const y = S.rock + 116 + i * 40;
  g += `<g class="${revealClass(y)}">
  <text x="60" y="${y}" font-family="${SANS}" font-size="15" fill="#fff" opacity=".75">${when}</text>
  <text x="300" y="${y}" font-family="${SANS}" font-size="16" fill="#fff">${what}</text>
</g>`;
});
g += `<line x1="60" y1="${S.rock + 196}" x2="${SHAFT - 40}" y2="${S.rock + 196}" stroke="rgba(255,255,255,.18)"/>`;
g += `<text x="60" y="${S.rock + 256}" font-family="${SERIF}" font-size="34" font-style="italic" fill="#fff">200 OK. Thanks for digging this far.</text>`;
g += `<text x="62" y="${S.rock + 292}" font-family="${SANS}" font-size="16" fill="#fff" opacity=".8">Say hello: smanish14322@gmail.com</text>`;
// turnaround burst
const turnCls = flashClass({ t: T_DOWN, hold: HOLD_BOTTOM });
g += `<g class="${turnCls}">
  <circle cx="${SHAFT}" cy="${TURN}" r="20" fill="none" stroke="${C.echo}" stroke-width="2.5"/>
  <circle cx="${SHAFT}" cy="${TURN}" r="32" fill="none" stroke="${C.echo}" stroke-width="1.5" opacity=".5"/>
  <text x="${SHAFT - 44}" y="${TURN + 6}" text-anchor="end" font-family="${MONO}" font-size="16" fill="${C.echo}">200</text>
</g>`;

// ---------- borehole + travellers ----------
let shaft = `<rect x="${SHAFT - 9}" y="${S.exp - 2}" width="18" height="${TURN - S.exp + 26}" rx="4" fill="rgba(0,0,0,.2)"/>`;
shaft += `<line x1="${SHAFT}" y1="${S.exp}" x2="${SHAFT}" y2="${TURN + 20}" stroke="rgba(255,255,255,.35)" stroke-dasharray="2 7"/>`;
shaft += `<path d="M${SHAFT - 9},${TURN + 24} L${SHAFT},${TURN + 40} L${SHAFT + 9},${TURN + 24} Z" fill="rgba(0,0,0,.25)"/>`;

const dDown = TURN - TOP;
const a1 = pct(0.15), a2 = pct(T_DOWN), a3 = pct(T_DOWN + 0.05);
const b0 = pct(T_DOWN + HOLD_BOTTOM - 0.05), b1 = pct(T_DOWN + HOLD_BOTTOM), b2 = pct(T_DOWN + HOLD_BOTTOM + T_UP), b3 = pct(T_DOWN + HOLD_BOTTOM + T_UP + 0.1);
css += `.probe{animation:probe ${P}s linear infinite;opacity:0}
@keyframes probe{0%{transform:translateY(0);opacity:0}${a1}%{opacity:1;transform:translateY(${(0.15 * V_DOWN).toFixed(1)}px)}${a2}%{transform:translateY(${dDown}px);opacity:1}${a3}%,100%{transform:translateY(${dDown}px);opacity:0}}
.echo{animation:echo ${P}s linear infinite;opacity:0}
@keyframes echo{0%,${b0}%{transform:translateY(0);opacity:0}${b1}%{transform:translateY(0);opacity:1}${b2}%{transform:translateY(-${dDown}px);opacity:1}${b3}%,100%{transform:translateY(-${dDown}px);opacity:0}}
.trail{animation:probe ${P}s linear infinite;opacity:0}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.probe,.echo,.trail{display:none}}\n`;
shaft += `<rect class="trail" x="${SHAFT - 2}" y="${TOP - 46}" width="4" height="40" rx="2" fill="${C.probe}" opacity=".5"/>`;
shaft += `<circle class="probe" cx="${SHAFT}" cy="${TOP}" r="8" fill="${C.probe}" stroke="#fff" stroke-width="2.5"/>`;
shaft += `<circle class="echo" cx="${SHAFT}" cy="${TURN}" r="8" fill="${C.echo}" stroke="${C.ink}" stroke-width="2.5"/>`;

const desc = [
  "Manish Singh, full stack engineer.",
  "Experience: " + exp.map((e) => `${e.role} at ${e.org}, ${e.when}`).join("; ") + ".",
  "Projects: " + projects.map((p) => `${p.name}, ${p.kind}`).join("; ") + ".",
  "Stack: " + stack.map(([n, t]) => `${n}: ${t}`).join(". ") + ".",
  "Foundation: B.Tech in Computer Science, UIT RGPV, 2021 to 2025.",
].join(" ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Manish Singh: a dig through the full stack</title>
<desc id="d">${esc(desc)}</desc>
<style>
${css}</style>
<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="24"/></clipPath></defs>
<g clip-path="url(#r)">
${g}
${shaft}
</g>
</svg>`;

writeFileSync(new URL("./assets/journey.svg", import.meta.url), svg);
console.log(`journey.svg written: ${H}px tall, cycle ${P}s (down ${T_DOWN.toFixed(1)}s, up ${T_UP.toFixed(1)}s)`);
