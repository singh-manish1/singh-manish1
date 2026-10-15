// Builds the profile README and every SVG in assets/. Nothing here needs visitors:
// all motion runs inside the SVGs, and the README's interactivity is in-page
// <details> sections, so nobody has to leave the profile.
// Run: node scripts/build.mjs
import { writeFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const path = (p) => new URL(p, ROOT);

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


// ---------- timeline helper for self-running SVGs ----------
function timeline(P) {
  let css = "", n = 0;
  const pct = (t) => +((t / P) * 100).toFixed(2);
  // visible from t until `until`, then hidden until the loop restarts
  const show = (t, until = P - 0.5) => {
    const k = `v${n++}`;
    const a = pct(t), b = Math.min(pct(t + 0.12), 99), c = pct(until), d = Math.min(pct(until + 0.3), 100);
    css += `.${k}{opacity:0;animation:${k} ${P}s linear infinite}@keyframes ${k}{0%,${a}%{opacity:0}${b}%,${c}%{opacity:1}${d}%,100%{opacity:0}}\n`;
    return k;
  };
  return { show, pct, css: () => css };
}

// ---------- hero: a request for me, and the response ----------
function hero() {
  const W = 1200, H = 480, P = 13;
  const tl = timeline(P);
  let body = `<text x="56" y="92" font-family="${SERIF}" font-size="62" fill="${C.ink}" letter-spacing="-1">Manish Singh</text>`;
  body += `<text x="60" y="132" font-family="${SANS}" font-size="20" fill="${C.inkSoft}">Full stack engineer. I build the screen, the API behind it and the database under that.</text>`;
  // panels
  body += `<rect x="56" y="168" width="410" height="272" rx="14" fill="${C.paper}" stroke="${C.line}"/>`;
  body += `<rect x="512" y="168" width="632" height="272" rx="14" fill="${C.paper}" stroke="${C.line}"/>`;
  body += `<text x="76" y="196" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">Request</text>`;
  body += `<text x="532" y="196" font-family="${SANS}" font-size="13" fill="${C.inkSoft}">Response</text>`;
  // typed request line
  const cmd = "GET /singh-manish1 HTTP/2";
  let typed = `<text x="76" y="232" font-family="${MONO}" font-size="16" fill="${C.ink}">`;
  [...cmd].forEach((ch, i) => { typed += `<tspan class="${tl.show(0.3 + i * 0.05)}">${esc(ch)}</tspan>`; });
  body += typed + `</text>`;
  body += `<text class="${tl.show(1.8)}" x="76" y="260" font-family="${MONO}" font-size="16" fill="${C.inkSoft}">Host: github.com</text>`;
  body += `<text class="${tl.show(2.0)}" x="76" y="288" font-family="${MONO}" font-size="16" fill="${C.inkSoft}">Accept: application/json</text>`;
  // packet across the gap
  body += `<path d="M466,304 L512,304" stroke="${C.ink}" stroke-opacity=".3" stroke-width="2" stroke-dasharray="3 5"/>`;
  body += `<circle class="pk" cx="466" cy="304" r="7" fill="${C.probe}" stroke="#fff" stroke-width="2"/>`;
  const p0 = tl.pct(2.3), p1 = tl.pct(3.0), p2 = tl.pct(3.1);
  // response
  body += `<text class="${tl.show(3.2)}" x="532" y="232" font-family="${MONO}" font-size="16" fill="${C.ok}" font-weight="700">HTTP/2 200 OK</text>`;
  const json = [
    ["{", ""],
    [`  "name": `, `"Manish Singh",`],
    [`  "role": `, `"Full stack engineer",`],
    [`  "client": `, `["React", "Next.js", "React Native"],`],
    [`  "server": `, `["Node.js", "REST", "tRPC", "Server Actions"],`],
    [`  "data": `, `["PostgreSQL", "Prisma", "Drizzle"],`],
    [`  "now": `, `"Software Engineer @ Appbrew"`],
    ["}", ""],
  ];
  json.forEach(([k, v], i) => {
    body += `<text class="${tl.show(3.6 + i * 0.3)}" x="532" y="${262 + i * 22}" font-family="${MONO}" font-size="15" xml:space="preserve"><tspan fill="${C.slate}">${esc(k)}</tspan><tspan fill="${C.ink}">${esc(v)}</tspan></text>`;
  });
  body += `<g class="${tl.show(3.6 + json.length * 0.3)}"><rect class="cur" x="550" y="${262 + 7 * 22 - 14}" width="9" height="17" fill="${C.ink}"/></g>`;
  body += `<text x="60" y="466" font-family="${SANS}" font-size="15" fill="${C.ink}">Scroll down and open any layer of the stack. Everything opens right here on the page.</text>`;
  const style = tl.css() + `.pk{opacity:0;animation:pk ${P}s linear infinite}@keyframes pk{0%,${p0}%{opacity:0;transform:translateX(0)}${(p0 + 0.5).toFixed(2)}%{opacity:1}${p1}%{opacity:1;transform:translateX(46px)}${p2}%,100%{opacity:0;transform:translateX(46px)}}
.cur{animation:blink 1s steps(2) infinite}@keyframes blink{50%{opacity:0}}`;
  return frame(W, H, body, { title: "Manish Singh, full stack engineer", desc: "An HTTP request for Manish Singh and its 200 OK JSON response: full stack engineer; client React, Next.js, React Native; server Node.js, REST, tRPC, Server Actions; data PostgreSQL, Prisma, Drizzle; now Software Engineer at Appbrew.", style, bg: C.sky });
}

// ---------- layer banners (the <summary> of each expandable layer) ----------
function banner({ name, line, fill, text, scene, desc }) {
  const W = 1200, H = 150;
  const { body: sceneBody, style } = scene();
  const body = `<text x="48" y="66" font-family="${SERIF}" font-size="34" font-style="italic" fill="${text}">${name}</text>
<text x="50" y="98" font-family="${SANS}" font-size="16" fill="${text}" opacity=".9">${esc(line)}</text>
<text x="50" y="128" font-family="${SANS}" font-size="13" fill="${text}" opacity=".65">Click to open</text>
${sceneBody}`;
  return frame(W, H, body, { title: `${name} layer`, desc, style, bg: fill, r: 16 });
}

const scenes = {
  client() {
    const P = 5, x = 760, y = 18;
    const body = `<rect x="${x}" y="${y}" width="380" height="114" rx="10" fill="${C.paper}" stroke="${C.ink}" stroke-opacity=".25"/>
<rect x="${x}" y="${y}" width="380" height="22" rx="10" fill="${C.sky}"/><rect x="${x}" y="${y + 12}" width="380" height="10" fill="${C.sky}"/>
<circle cx="${x + 14}" cy="${y + 11}" r="4" fill="${C.warn}"/><circle cx="${x + 28}" cy="${y + 11}" r="4" fill="${C.clay}"/><circle cx="${x + 42}" cy="${y + 11}" r="4" fill="${C.ok}"/>
<rect x="${x + 20}" y="${y + 38}" width="200" height="10" rx="5" fill="${C.line}"/>
<rect x="${x + 20}" y="${y + 56}" width="150" height="10" rx="5" fill="${C.line}"/>
<rect class="sk" x="${x + 20}" y="${y + 80}" width="220" height="14" rx="7" fill="${C.lichen}"/>
<g class="btn"><rect x="${x + 270}" y="${y + 72}" width="88" height="30" rx="15" fill="${C.ink}"/><text x="${x + 314}" y="${y + 92}" text-anchor="middle" font-family="${SANS}" font-size="13" fill="#fff">Save</text></g>
<text class="ok" x="${x + 20}" y="${y + 92}" font-family="${SANS}" font-size="13" fill="${C.ok}" font-weight="600">Saved, 0 page reloads</text>
<path class="cursor" d="M0,0 L0,16 L4,12 L7,19 L10,18 L7,11 L12,11 Z" fill="${C.ink}" stroke="#fff" stroke-width="1"/>`;
    const style = `.cursor{animation:cur ${P}s ease-in-out infinite}@keyframes cur{0%{transform:translate(${x + 120}px,${y + 120}px)}30%,45%{transform:translate(${x + 318}px,${y + 90}px)}100%{transform:translate(${x + 318}px,${y + 90}px)}}
.btn{transform-box:fill-box;transform-origin:center;animation:btn ${P}s linear infinite}@keyframes btn{0%,32%{transform:scale(1)}35%{transform:scale(.92)}39%,100%{transform:scale(1)}}
.sk{transform-box:fill-box;transform-origin:left;animation:sk ${P}s ease-out infinite}@keyframes sk{0%,36%{transform:scaleX(0);opacity:.6}58%{transform:scaleX(1);opacity:.6}62%,100%{opacity:0;transform:scaleX(1)}}
.ok{opacity:0;animation:okk ${P}s linear infinite}@keyframes okk{0%,62%{opacity:0}66%,94%{opacity:1}100%{opacity:0}}`;
    return { body, style };
  },
  api() {
    const P = 4.4, y = 75;
    const body = `<rect x="770" y="${y - 26}" width="110" height="52" rx="12" fill="${C.sand}" stroke="${C.ink}" stroke-opacity=".3"/>
<text x="825" y="${y + 5}" text-anchor="middle" font-family="${SANS}" font-size="15" fill="${C.ink}">client</text>
<rect x="1030" y="${y - 26}" width="110" height="52" rx="12" fill="${C.paper}" stroke="${C.ink}" stroke-opacity=".3"/>
<text x="1085" y="${y + 5}" text-anchor="middle" font-family="${SANS}" font-size="15" fill="${C.ink}">API</text>
<line x1="884" y1="${y}" x2="1026" y2="${y}" stroke="${C.ink}" stroke-opacity=".25" stroke-width="2"/>
<g class="req"><circle cx="890" cy="${y}" r="7" fill="${C.probe}"/><text x="890" y="${y - 14}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${C.ink}">POST /members</text></g>
<g class="chk"><rect x="1048" y="${y + 32}" width="74" height="22" rx="11" fill="${C.ok}"/><text x="1085" y="${y + 47}" text-anchor="middle" font-family="${MONO}" font-size="12" fill="#fff">zod ok</text></g>
<g class="res"><circle cx="1020" cy="${y}" r="7" fill="${C.echo}" stroke="${C.ink}"/><text x="1020" y="${y + 26}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${C.ink}">201 Created</text></g>`;
    const style = `.req{opacity:0;animation:req ${P}s ease-in-out infinite}@keyframes req{0%{opacity:0;transform:translateX(0)}5%{opacity:1}35%{opacity:1;transform:translateX(130px)}38%,100%{opacity:0;transform:translateX(130px)}}
.chk{opacity:0;animation:chk ${P}s linear infinite}@keyframes chk{0%,36%{opacity:0}40%,58%{opacity:1}62%,100%{opacity:0}}
.res{opacity:0;animation:res ${P}s ease-in-out infinite}@keyframes res{0%,56%{opacity:0;transform:translateX(0)}60%{opacity:1}90%{opacity:1;transform:translateX(-130px)}95%,100%{opacity:0;transform:translateX(-130px)}}`;
    return { body, style };
  },
  data() {
    const P = 5.2, x = 790, y = 16, cw = [70, 150, 90], rh = 22;
    // table background, then the row highlight, then the cells on top
    let body = `<rect x="${x}" y="${y}" width="310" height="${rh * 4 + 6}" rx="8" fill="${C.paper}" opacity=".95"/>`;
    body += `<rect class="hl" x="${x + 4}" y="${y + 4 + 2 * rh}" width="302" height="${rh}" rx="4" fill="${C.echo}"/>`;
    const rows = [["id", "member", "status"], ["41", "Asha", "active"], ["42", "Ravi", "paused"], ["43", "Meera", "active"]];
    rows.forEach((r, i) => {
      let cx = x + 12;
      r.forEach((cell, j) => {
        const isVal = i === 2 && j === 2;
        if (isVal) {
          body += `<text class="old" x="${cx}" y="${y + 20 + i * rh}" font-family="${MONO}" font-size="13" fill="${C.ink}">paused</text>`;
          body += `<text class="new" x="${cx}" y="${y + 20 + i * rh}" font-family="${MONO}" font-size="13" fill="${C.ok}" font-weight="700">active</text>`;
        } else body += `<text x="${cx}" y="${y + 20 + i * rh}" font-family="${MONO}" font-size="13" fill="${i === 0 ? C.inkSoft : C.ink}">${cell}</text>`;
        cx += cw[j];
      });
    });
    body += `<g class="lk" transform="translate(${x + 318},${y + 2 * rh + 2})"><rect x="0" y="8" width="16" height="13" rx="2" fill="#fff"/><path d="M3.5,8 V5 a4.5,4.5 0 0 1 9,0 V8" fill="none" stroke="#fff" stroke-width="2.2"/></g>`;
    body += `<text class="sql1" x="${x}" y="${y + 118}" font-family="${MONO}" font-size="13" fill="#fff">BEGIN; SELECT … FOR UPDATE</text>`;
    body += `<text class="sql2" x="${x}" y="${y + 118}" font-family="${MONO}" font-size="13" fill="#fff">UPDATE … ; COMMIT</text>`;
    const style = `.hl{opacity:0;animation:hl ${P}s linear infinite}@keyframes hl{0%,15%{opacity:0}20%,75%{opacity:.55}80%,100%{opacity:0}}
.lk{opacity:0;animation:lk ${P}s linear infinite}@keyframes lk{0%,18%{opacity:0}22%,72%{opacity:1}76%,100%{opacity:0}}
.old{animation:old ${P}s linear infinite}@keyframes old{0%,45%{opacity:1}48%,96%{opacity:0}100%{opacity:1}}
.new{opacity:0;animation:nw ${P}s linear infinite}@keyframes nw{0%,45%{opacity:0}48%,96%{opacity:1}100%{opacity:0}}
.sql1{opacity:0;animation:s1 ${P}s linear infinite}@keyframes s1{0%,15%{opacity:0}20%,45%{opacity:1}48%,100%{opacity:0}}
.sql2{opacity:0;animation:s2 ${P}s linear infinite}@keyframes s2{0%,46%{opacity:0}50%,75%{opacity:1}80%,100%{opacity:0}}`;
    return { body, style };
  },
  ops() {
    const P = 5, steps = ["lint", "test", "build", "deploy"], x0 = 760, y = 60;
    let body = "", style = "";
    steps.forEach((s, i) => {
      const x = x0 + i * 98;
      if (i > 0) body += `<line x1="${x - 18}" y1="${y + 16}" x2="${x}" y2="${y + 16}" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`;
      body += `<rect x="${x}" y="${y}" width="80" height="32" rx="16" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".35"/>`;
      body += `<rect class="p${i}" x="${x}" y="${y}" width="80" height="32" rx="16" fill="${C.ok}"/>`;
      body += `<text x="${x + 40}" y="${y + 21}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="#fff">${s}</text>`;
      const a = 8 + i * 18, b = a + 4;
      style += `.p${i}{opacity:0;animation:p${i} ${P}s linear infinite}@keyframes p${i}{0%,${a}%{opacity:0}${b}%,90%{opacity:1}96%,100%{opacity:0}}\n`;
    });
    body += `<text class="done" x="${x0}" y="${y + 66}" font-family="${SANS}" font-size="14" fill="#fff">All checks passed. Shipped.</text>`;
    style += `.done{opacity:0;animation:dn ${P}s linear infinite}@keyframes dn{0%,${8 + 3 * 18 + 6}%{opacity:0}${8 + 3 * 18 + 10}%,90%{opacity:1}96%,100%{opacity:0}}`;
    return { body, style };
  },
};

const layers = [
  { file: "layer-client.svg", name: "Client", line: "What people see and touch: fast, accessible interfaces on web and mobile.", fill: C.lichen, text: C.ink, scene: scenes.client,
    desc: "Client layer. A cursor presses Save in a small browser window, the change loads in place and shows Saved." },
  { file: "layer-api.svg", name: "API", line: "What answers: typed, validated endpoints with auth checked on every request.", fill: C.clay, text: C.ink, scene: scenes.api,
    desc: "API layer. A POST request travels from the client to the API, passes validation and 201 Created travels back." },
  { file: "layer-data.svg", name: "Data", line: "What remembers: relational schemas, transactions and locks that keep data correct.", fill: C.slate, text: "#fff", scene: scenes.data,
    desc: "Data layer. A table row is locked with SELECT FOR UPDATE, its status changes from paused to active, and the transaction commits." },
  { file: "layer-ops.svg", name: "Ops", line: "What keeps it running: auth, payments, email, tests and deploys.", fill: C.bedrock, text: "#fff", scene: scenes.ops,
    desc: "Ops layer. A pipeline lights up step by step: lint, test, build, deploy, then all checks passed." },
];

// ---------- project cards (the <summary> of each expandable project) ----------
function card({ name, line, stack, meta }) {
  const W = 1200, H = 120;
  const body = `<rect x="0" y="0" width="10" height="${H}" fill="${C.clay}"/>
<text x="44" y="52" font-family="${SERIF}" font-size="30" font-style="italic" fill="${C.ink}">${esc(name)}</text>
<text x="46" y="86" font-family="${SANS}" font-size="16" fill="${C.inkSoft}">${esc(line)}</text>
<text x="1150" y="52" text-anchor="end" font-family="${MONO}" font-size="14" fill="${C.ink}">${esc(stack)}</text>
<text x="1150" y="86" text-anchor="end" font-family="${SANS}" font-size="14" fill="${C.inkSoft}">${esc(meta)}</text>`;
  return frame(W, H, body, { title: name, desc: `${name}: ${line}. Built with ${stack}.`, r: 14 });
}

const projects = [
  { slug: "repset", name: "Repset", line: "Multi-tenant gym management SaaS", stack: "Next.js 14, PostgreSQL, Clerk, Razorpay", meta: "2025, live at repset.in", url: "https://repset.in",
    text: "Each gym's data stays its own. Role-based access through Clerk, Razorpay billing, and React Query with optimistic updates for 30% faster interactions.",
    trace: { name: "Repset", kind: "Multi-tenant gym SaaS", link: "repset.in", req: "PATCH  mark member attendance", note: "Optimistic UI: the screen updates before the server answers.",
      spans: [["optimistic update (React Query)", 0, 4, "client"], ["API route handler", 4, 52, "server"], ["Clerk session + role check (RBAC)", 6, 12, "server", 1], ["tenant scope: where gym_id = …", 18, 6, "server", 1], ["UPDATE attendance", 24, 20, "db", 1], ["200 OK", 56, 3, "server"], ["invalidate + refetch analytics", 59, 22, "client"]] } },
  { slug: "rachnakaar", name: "Rachnakaar", line: "A platform for Indian writers, in their own scripts", stack: "Next.js, TypeScript, Prisma, Clerk", meta: "2025, live", url: "https://rachnakaar.vercel.app/",
    text: "Writers publish stories and poems in Indian languages, with a rich text editor and writing competitions. Indic text stays intact from the editor to the database.",
    trace: { name: "Rachnakaar", kind: "Writing in Indian languages", link: "rachnakaar.vercel.app", req: "POST  publish a story", note: "Indic text stays UTF-8 from the editor to the database.",
      spans: [["rich text editor serialises", 0, 8, "client"], ["API route handler", 8, 48, "server"], ["Clerk auth", 10, 9, "server", 1], ["validate title + body", 19, 6, "server", 1], ["prisma.story.create()", 25, 24, "db", 1], ["enter competition entry", 49, 5, "server", 1], ["render story page", 56, 18, "client"]] } },
  { slug: "gurukool", name: "Gurukool", line: "AI learning platform that answers from your own PDFs", stack: "Next.js, LangChain, OpenAI", meta: "live at gurukool.tech", url: "https://gurukool.tech",
    text: "Study material, previous year papers, and answers grounded in the PDF you're reading, built with LangChain and OpenAI.",
    trace: { name: "Gurukool", kind: "AI learning platform", link: "gurukool.tech", req: "POST  ask about this PDF", note: "The answer streams in while it's being written.",
      spans: [["question from the reader", 0, 5, "client"], ["API route handler", 5, 70, "server"], ["load the PDF's text", 8, 10, "server", 1], ["find the relevant passages (LangChain)", 18, 14, "server", 1], ["OpenAI completion with context", 32, 40, "async", 1], ["stream answer to the page", 36, 44, "client"]] } },
  { slug: "geeli-maati", name: "Geeli Maati", line: "Workshop booking and shop for a pottery studio", stack: "Next.js 16, PostgreSQL, Drizzle", meta: "2026, in progress, private repo", url: null,
    text: "Booking, a shop that ships across India and an admin dashboard. Transactions and row locks stop double bookings, payments run over UPI with verification, and 247 Vitest tests cover it, including race conditions.",
    trace: { name: "Geeli Maati", kind: "Pottery studio booking and shop", req: "POST  book a workshop seat", note: "The shape of the request, not a benchmark.",
      spans: [["Book button (Server Action form)", 0, 6, "client"], ["bookSeat()  service layer", 6, 70, "server"], ["BEGIN", 10, 3, "db", 1], ["SELECT session … FOR UPDATE", 13, 14, "db", 1], ["check capacity and holds", 27, 8, "server", 1], ["INSERT booking  (30 min hold)", 35, 12, "db", 1], ["INSERT email_outbox  (same tx)", 47, 9, "db", 1], ["COMMIT", 56, 6, "db", 1], ["revalidate, render page", 76, 14, "client"], ["after(): send email via Resend", 80, 30, "async"]] } },
  { slug: "onezy", name: "Onezy", line: "Agency website with an admin panel", stack: "Next.js 15, React 19, TypeScript", meta: "live at onezy.in", url: "https://onezy.in",
    text: "A portfolio and agency site with an admin panel for managing its content.", trace: null },
];

// ---------- README ----------
function readme() {
  const layerBody = {
    Client: `- **Appbrew**: cross-platform apps in React Native on the new Fabric architecture.
- **Braktt**: React and Next.js dashboards, a reusable component library, and a 25% cut in Largest Contentful Paint through lazy loading, code splitting and asset optimization.
- **Repset**: optimistic updates with React Query for 30% faster interactions.
- **Rachnakaar**: a rich text editor with full support for Indian scripts.

React, Next.js, React Native, TypeScript, Tailwind CSS, Material UI, Framer Motion, React Query, Redux Toolkit, Zustand`,
    API: `- **Repset**: API routes with role-based access through Clerk, scoped to each gym.
- **Braktt**: JWT authentication flows and protected routes.
- **Gurukool**: question answering over uploaded PDFs with LangChain and OpenAI.
- **Geeli Maati**: Server Actions over a service layer, with Zod validation at the edge.

Node.js, Next.js Server Actions and Route Handlers, REST APIs, tRPC, Zod`,
    Data: `- **Repset**: a PostgreSQL schema for a multi-tenant SaaS.
- **Rachnakaar**: a Prisma data model for writers, stories and competitions.
- **Geeli Maati**: transactions and row locks that make double booking impossible, with versioned SQL migrations.

PostgreSQL, Prisma, Drizzle, schema design, transactions, row locking`,
    Ops: `- **Auth**: Clerk, Better Auth with Google sign-in, JWT.
- **Payments**: Razorpay billing, UPI with manual verification and refunds.
- **Email and media**: Resend with a retrying outbox, Cloudinary signed uploads.
- **Quality and shipping**: Vitest including race-condition tests, Lighthouse audits, Vercel, GitHub Actions.`,
  };
  const layerHtml = layers.map((l) => `<details>
<summary><img src="./assets/${l.file}" width="96%" alt="${esc(l.name)}: ${esc(l.line)} Click to open."/></summary>

${layerBody[l.name]}

</details>`).join("\n\n");
  const projectHtml = projects.map((p) => `<details>
<summary><img src="./assets/card-${p.slug}.svg" width="96%" alt="${esc(p.name)}: ${esc(p.line)}. Click to open."/></summary>
${p.trace ? `
<img src="./assets/trace-${p.slug}.svg" width="100%" alt="${esc(p.name)}: trace of ${esc(p.trace.req)}: ${esc(p.trace.spans.map((s) => s[0]).join(", "))}."/>
` : ""}
${p.text}${p.url ? ` [Open ${p.name}](${p.url})` : ""}

</details>`).join("\n\n");

  return `<!-- Generated by scripts/build.mjs. Edit that, then run: node scripts/build.mjs -->

<p align="center">
  <img src="./assets/hero.svg" width="100%" alt="Manish Singh, full stack engineer. An HTTP request for Manish Singh returns 200 OK with his stack: React, Next.js and React Native on the client, Node.js, REST, tRPC and Server Actions on the server, PostgreSQL, Prisma and Drizzle for data."/>
</p>

<p align="center">
  <a href="https://manishsingh-tau.vercel.app/">Portfolio</a> &nbsp;/&nbsp;
  <a href="https://linkedin.com/in/singh-manish1">LinkedIn</a> &nbsp;/&nbsp;
  <a href="mailto:smanish14322@gmail.com">smanish14322@gmail.com</a> &nbsp;/&nbsp;
  Bhopal, India
</p>

## The stack, top to bottom

${layerHtml}

## Experience

<p align="center">
  <img src="./assets/gitlog.svg" width="100%" alt="Experience as a git log. Feb 2026: Associate Software Engineer at Appbrew Technologies. Jun 2025: B.Tech Computer Science, UIT RGPV. May 2023 to Jan 2024: SDE Intern at Braktt Technologies. Oct 2022 to Apr 2023: Frontend Intern at Braktt Technologies. Jun 2021: started B.Tech."/>
</p>

Also: ran React workshops for 35+ students at CodeCult, and 20+ sessions for 100+ people as Web Master of Asper Club.

## Projects

Open one to watch a single request travel through it, from the browser to the database.

${projectHtml}

<br/>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/singh-manish1/singh-manish1/output/github-contribution-grid-snake-dark.svg"/>
    <img alt="Animated snake eating Manish Singh's GitHub contribution graph" src="https://raw.githubusercontent.com/singh-manish1/singh-manish1/output/github-contribution-grid-snake.svg"/>
  </picture>
</p>

<p align="center">
  <a href="https://holopin.io/@manish0204"><img src="https://holopin.me/manish0204" alt="Holopin badges" width="410"/></a>
</p>
`;
}

writeFileSync(path("assets/hero.svg"), hero());
for (const l of layers) writeFileSync(path(`assets/${l.file}`), banner(l));
for (const p of projects) {
  writeFileSync(path(`assets/card-${p.slug}.svg`), card(p));
  if (p.trace) writeFileSync(path(`assets/trace-${p.slug}.svg`), trace(p.trace));
}
writeFileSync(path("assets/gitlog.svg"), gitlog());
writeFileSync(path("README.md"), readme());
console.log("built");
