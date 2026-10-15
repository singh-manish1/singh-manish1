// Generates the profile README's SVG assets: the stack drawn as a geological cross-section.
import { writeFileSync } from "node:fs";

const C = {
  sky: "#E3ECEF",
  ink: "#1C2433",
  inkSoft: "#4A5568",
  lichen: "#A9B66E",   // interface
  ochre: "#E0AE4C",    // server
  shale: "#7C8C99",    // data
  bedrock: "#2E3150",  // foundations
  probe: "#12B5CB",    // request
  echo: "#F2C14E",     // response
  paper: "#F6F8F8",
};
const SANS = `-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
const SERIF = `Georgia, 'Times New Roman', serif`;
const MONO = `ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace`;

// A wavy horizontal boundary from x0 to x1 around y, deterministic.
function wave(x0, x1, y, amp, seed, step = 60) {
  let d = `M${x0},${y}`;
  let i = 0;
  for (let x = x0; x < x1; x += step) {
    const nx = Math.min(x + step, x1);
    const r = Math.sin((x + seed * 97) * 0.013) * amp + Math.cos((x + seed * 31) * 0.031) * amp * 0.5;
    const cy = y + r;
    d += ` Q${x + step / 2},${cy} ${nx},${y + Math.sin((nx + seed * 53) * 0.02) * amp * 0.3}`;
    i++;
  }
  return d;
}
function band(x0, x1, yTop, yBot, seed, fill, extra = "") {
  const top = wave(x0, x1, yTop, 7, seed);
  const bottom = `L${x1},${yBot} L${x0},${yBot} Z`;
  return `<path d="${top} ${bottom}" fill="${fill}" ${extra}/>`;
}
// Speckle texture for a layer.
function speckle(x0, x1, y0, y1, n, color, seed) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const b = Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345;
    const x = x0 + (a - Math.floor(a)) * (x1 - x0);
    const y = y0 + (b - Math.floor(b)) * (y1 - y0);
    const r = 0.8 + ((a * 7) % 1 + 1) % 1 * 1.6;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`;
  }
  return s;
}
const reduced = `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

// ---------- HERO ----------
function hero() {
  const W = 1200, H = 600;
  const layers = [
    { y: 200, h: 96,  fill: C.lichen,  text: C.ink,   depth: "0 m",    name: "Interface", tools: "React, Next.js, React Native, TypeScript, Tailwind" },
    { y: 296, h: 96,  fill: C.ochre,   text: C.ink,   depth: "−1 m",   name: "Server",    tools: "Node.js, Server Actions, REST, tRPC, Zod" },
    { y: 392, h: 96,  fill: C.shale,   text: "#fff",  depth: "−2 m",   name: "Data",      tools: "PostgreSQL, Drizzle, Prisma, transactions, row locks" },
    { y: 488, h: 112, fill: C.bedrock, text: "#fff",  depth: "−3 m",   name: "Bedrock",   tools: "Auth, payments, email outbox, 240+ tests" },
  ];
  const shaftX = 1010;
  let body = "";
  layers.forEach((l, i) => {
    body += band(0, W, l.y, H, i + 1, l.fill);
    body += speckle(0, W, l.y + 14, l.y + l.h - 6, 70, l.text === "#fff" ? "rgba(255,255,255,.10)" : "rgba(28,36,51,.10)", i + 3);
  });
  layers.forEach((l) => {
    const ty = l.y + l.h / 2 + 4;
    body += `<text x="48" y="${ty - 8}" font-family="${SANS}" font-size="13" fill="${l.text}" opacity=".75">${l.depth}</text>`;
    body += `<text x="120" y="${ty - 6}" font-family="${SERIF}" font-size="26" font-style="italic" fill="${l.text}">${l.name}</text>`;
    body += `<text x="120" y="${ty + 18}" font-family="${SANS}" font-size="15" fill="${l.text}" opacity=".9">${l.tools.replace(/&/g, "&amp;")}</text>`;
  });
  // Borehole
  body += `<rect x="${shaftX - 9}" y="188" width="18" height="${H - 188}" fill="rgba(0,0,0,.18)"/>`;
  body += `<rect x="${shaftX - 9}" y="188" width="18" height="${H - 188}" fill="none" stroke="rgba(255,255,255,.35)" stroke-dasharray="2 6"/>`;
  // Rig on the surface
  body += `<path d="M${shaftX - 34},196 L${shaftX},120 L${shaftX + 34},196" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  body += `<line x1="${shaftX - 22}" y1="166" x2="${shaftX + 22}" y2="166" stroke="${C.ink}" stroke-width="2"/>`;
  body += `<line x1="${shaftX}" y1="120" x2="${shaftX}" y2="196" stroke="${C.ink}" stroke-width="2"/>`;
  body += `<text x="${shaftX + 48}" y="150" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">request</text>`;
  body += `<text x="${shaftX + 48}" y="168" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">goes down,</text>`;
  body += `<text x="${shaftX + 48}" y="186" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">data comes up</text>`;
  // Lock at the data layer
  body += `<g class="lock" transform="translate(${shaftX + 26},436)"><rect x="0" y="6" width="18" height="14" rx="2" fill="#fff"/><path d="M4,6 V2 a5,5 0 0 1 10,0 V6" fill="none" stroke="#fff" stroke-width="2.4"/></g>`;
  body += `<text class="lock" x="${shaftX + 52}" y="453" font-family="${MONO}" font-size="12" fill="#fff">FOR UPDATE</text>`;
  // Probe + echo
  body += `<circle class="probe" cx="${shaftX}" cy="200" r="7" fill="${C.probe}" stroke="#fff" stroke-width="2"/>`;
  body += `<circle class="echo" cx="${shaftX}" cy="440" r="7" fill="${C.echo}" stroke="${C.ink}" stroke-width="2"/>`;

  const css = `
    .probe { animation: down 6s cubic-bezier(.5,0,.6,1) infinite; }
    .echo  { animation: up 6s cubic-bezier(.4,0,.5,1) infinite; opacity: 0; }
    .lock  { animation: lock 6s linear infinite; opacity: 0; }
    @keyframes down { 0% { transform: translateY(0); opacity: 0 } 5% { opacity: 1 } 40% { transform: translateY(240px); opacity: 1 } 45%,100% { transform: translateY(240px); opacity: 0 } }
    @keyframes lock { 0%,38% { opacity: 0 } 42%,58% { opacity: 1 } 62%,100% { opacity: 0 } }
    @keyframes up { 0%,55% { transform: translateY(0); opacity: 0 } 58% { opacity: 1 } 92% { transform: translateY(-240px); opacity: 1 } 96%,100% { transform: translateY(-240px); opacity: 0 } }
    ${reduced}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Manish Singh, full stack engineer</title>
<desc id="d">The full stack drawn as rock layers: Interface (React, Next.js), Server (Node.js, REST), Data (PostgreSQL, Drizzle, Prisma) and Bedrock (auth, payments, tests). A request drops down a borehole to the data layer and the response rises back up.</desc>
<style>${css}</style>
<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>
<g clip-path="url(#r)">
<rect width="${W}" height="${H}" fill="${C.sky}"/>
<text x="48" y="104" font-family="${SERIF}" font-size="64" fill="${C.ink}" letter-spacing="-1">Manish Singh</text>
<text x="52" y="146" font-family="${SANS}" font-size="20" fill="${C.inkSoft}">Full stack engineer. I build from the pixel down to the row lock.</text>
${body}
</g>
</svg>`;
}

// ---------- DRILL CORES (projects) ----------
function core({ file, name, kind, when, segments, note }) {
  const W = 380, H = 470;
  const cx = 110, top = 70, bottom = 410, rx = 46, ry = 12;
  const total = segments.reduce((a, s) => a + s.w, 0);
  let y = top, body = "";
  segments.forEach((s, i) => {
    const h = ((bottom - top) * s.w) / total;
    body += `<path d="M${cx - rx},${y} L${cx - rx},${y + h} A${rx},${ry} 0 0 0 ${cx + rx},${y + h} L${cx + rx},${y} A${rx},${ry} 0 0 1 ${cx - rx},${y} Z" fill="${s.fill}"/>`;
    body += speckle(cx - rx + 4, cx + rx - 4, y + 4, y + h - 2, Math.round(h / 4), s.dark ? "rgba(255,255,255,.12)" : "rgba(28,36,51,.12)", i + name.length);
    // label with leader line
    const ly = y + h / 2 + 4;
    body += `<line x1="${cx + rx + 6}" y1="${ly - 4}" x2="${cx + rx + 26}" y2="${ly - 4}" stroke="${C.inkSoft}" stroke-width="1"/>`;
    body += `<text x="${cx + rx + 32}" y="${ly}" font-family="${SANS}" font-size="13.5" fill="${C.ink}">${s.label}</text>`;
    y += h;
  });
  // top face + shading
  body += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${segments[0].fill}" stroke="rgba(28,36,51,.35)"/>`;
  body += `<ellipse cx="${cx}" cy="${top}" rx="${rx - 10}" ry="${ry - 4}" fill="rgba(255,255,255,.25)"/>`;
  body += `<path d="M${cx + rx - 14},${top} L${cx + rx - 14},${bottom + 8}" stroke="rgba(0,0,0,.12)" stroke-width="12"/>`;
  return [file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name}: ${kind}. Built with ${segments.map(s => s.label).join(", ")}.">
<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs>
<g clip-path="url(#r)">
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<rect width="${W}" height="${H}" fill="none" stroke="rgba(28,36,51,.12)" stroke-width="2" rx="18"/>
<text x="28" y="40" font-family="${SERIF}" font-size="26" font-style="italic" fill="${C.ink}">${name}</text>
${body}
<text x="28" y="${H - 28}" font-family="${SANS}" font-size="14" fill="${C.ink}">${kind}</text>
<text x="${W - 28}" y="${H - 28}" text-anchor="end" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">${when}</text>
</g>
</svg>`];
}

const cores = [
  core({ file: "core-geeli-maati.svg", name: "Geeli Maati", kind: "Pottery studio booking + shop", when: "2026 – now",
    segments: [
      { label: "Next.js 16, React 19", w: 2, fill: C.lichen },
      { label: "Server Actions", w: 1.4, fill: C.ochre },
      { label: "UPI payments, refunds", w: 1.4, fill: "#D49A3A" },
      { label: "PostgreSQL, Drizzle", w: 2, fill: C.shale, dark: true },
      { label: "Row locks, no overbooking", w: 1.4, fill: "#5F6F7C", dark: true },
      { label: "247 Vitest tests", w: 1.4, fill: C.bedrock, dark: true },
    ] }),
  core({ file: "core-repset.svg", name: "Repset", kind: "Multi-tenant gym SaaS", when: "2025",
    segments: [
      { label: "Next.js 14, React Query", w: 2.2, fill: C.lichen },
      { label: "Optimistic UI", w: 1.2, fill: "#BCC784" },
      { label: "APIs + RBAC (Clerk)", w: 2, fill: C.ochre },
      { label: "Razorpay billing", w: 1.4, fill: "#D49A3A" },
      { label: "PostgreSQL, per tenant", w: 2.2, fill: C.shale, dark: true },
    ] }),
  core({ file: "core-rachnakaar.svg", name: "Rachnakaar", kind: "Writing in Indian languages", when: "2025",
    segments: [
      { label: "Rich text editor", w: 2, fill: C.lichen },
      { label: "Indic scripts end to end", w: 1.6, fill: "#BCC784" },
      { label: "Writing competitions", w: 1.8, fill: C.ochre },
      { label: "Clerk auth", w: 1.2, fill: "#D49A3A" },
      { label: "Prisma data model", w: 2.2, fill: C.shale, dark: true },
    ] }),
];

// ---------- ROCK COLUMN (career) ----------
// A stratigraphic column: one layer per role or project, newest on top, oldest at the bottom.
function timeline() {
  const kinds = {
    Work: { fill: C.lichen, text: C.ink },
    Project: { fill: C.ochre, text: C.ink },
    Education: { fill: C.bedrock, text: "#fff" },
  };
  const rows = [
    { when: "Oct 2026 – now", label: "Geeli Maati", kind: "Project" },
    { when: "Feb 2026 – now", label: "Associate Software Engineer, Appbrew", kind: "Work" },
    { when: "Nov – Dec 2025", label: "Rachnakaar", kind: "Project" },
    { when: "Sep – Nov 2025", label: "Repset", kind: "Project" },
    { when: "May 2023 – Jan 2024", label: "SDE Intern, Braktt Technologies", kind: "Work" },
    { when: "Oct 2022 – Apr 2023", label: "Frontend Intern, Braktt Technologies", kind: "Work" },
    { when: "Jun 2021 – Jun 2025", label: "B.Tech in Computer Science, UIT RGPV", kind: "Education" },
  ];
  const W = 1200, top = 112, rowH = 54, xa = 290, xb = 1140;
  const H = top + rows.length * rowH + 64;
  let body = `<g clip-path="url(#col)">`;
  rows.forEach((r, i) => {
    const k = kinds[r.kind];
    const y = top + i * rowH;
    body += band(xa, xb, y, y + rowH + 8, i + 5, k.fill);
    if (i > 0) body += `<path d="${wave(xa, xb, y, 7, i + 5)}" fill="none" stroke="rgba(28,36,51,.28)" stroke-width="1.5"/>`;
    body += speckle(xa, xb, y + 10, y + rowH - 4, 40, k.text === "#fff" ? "rgba(255,255,255,.12)" : "rgba(28,36,51,.10)", i + 11);
  });
  body += `</g>`;
  rows.forEach((r, i) => {
    const k = kinds[r.kind];
    const cy = top + i * rowH + rowH / 2 + 6;
    body += `<text x="60" y="${cy}" font-family="${SANS}" font-size="15" fill="${C.inkSoft}">${r.when}</text>`;
    body += `<text x="${xa + 24}" y="${cy}" font-family="${SERIF}" font-size="20" font-style="italic" fill="${k.text}">${r.label}</text>`;
    body += `<text x="${xb - 24}" y="${cy}" text-anchor="end" font-family="${SANS}" font-size="14" fill="${k.text}" opacity=".8">${r.kind}</text>`;
  });
  const bottom = top + rows.length * rowH;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Career, newest first: Geeli Maati project from Oct 2026. Associate Software Engineer at Appbrew from Feb 2026. Rachnakaar project Nov to Dec 2025. Repset project Sep to Nov 2025. SDE Intern at Braktt Technologies May 2023 to Jan 2024. Frontend Intern at Braktt Technologies Oct 2022 to Apr 2023. B.Tech in Computer Science at UIT RGPV Jun 2021 to Jun 2025.">
<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="22"/></clipPath><clipPath id="col"><rect x="${xa}" y="${top - 12}" width="${xb - xa}" height="${bottom - top + 12}" rx="8"/></clipPath></defs>
<g clip-path="url(#r)">
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<text x="60" y="56" font-family="${SERIF}" font-size="28" font-style="italic" fill="${C.ink}">How the layers were laid down</text>
<text x="60" y="84" font-family="${SANS}" font-size="15" fill="${C.inkSoft}">Read it like rock: the newest layer is on top, the oldest at the bottom.</text>
${body}
</g>
</svg>`;
}

// ---------- SURFACE (footer) ----------
function surface() {
  const W = 1200, H = 150;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Response 200 OK. Thanks for digging this far.">
<style>.e{animation:rise 3.2s ease-out infinite}@keyframes rise{0%{transform:translateY(40px);opacity:0}30%{opacity:1}80%,100%{transform:translateY(-6px);opacity:0}} ${reduced}</style>
<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>
<g clip-path="url(#r)">
<rect width="${W}" height="${H}" fill="${C.sky}"/>
${band(0, W, 112, H, 2, C.lichen)}
<circle class="e" cx="1010" cy="100" r="7" fill="${C.echo}" stroke="${C.ink}" stroke-width="2"/>
<text x="60" y="66" font-family="${SERIF}" font-size="30" font-style="italic" fill="${C.ink}">200 OK. Thanks for digging this far.</text>
<text x="60" y="94" font-family="${SANS}" font-size="15" fill="${C.inkSoft}">Say hello: smanish14322@gmail.com</text>
</g>
</svg>`;
}

const out = new URL("./assets/", import.meta.url);
writeFileSync(new URL("strata.svg", out), hero());
for (const [f, svg] of cores) writeFileSync(new URL(f, out), svg);
writeFileSync(new URL("timeline.svg", out), timeline());
writeFileSync(new URL("surface.svg", out), surface());
console.log("ok");
