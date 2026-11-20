/* ===== Romy's Projects Hub ===== */
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const ext = u => `href="${esc(u)}" target="_blank" rel="noopener noreferrer"`;
const DAY = 864e5, REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ageDays = iso => iso ? (Date.now() - new Date(iso)) / DAY : 999;
const rel = iso => {
  if (!iso) return "—";
  const d = ageDays(iso);
  if (d < 1 / 24) return "il y a moins d'1 h";
  if (d < 1) return `il y a ${Math.floor(d * 24)} h`;
  if (d < 2) return "hier";
  if (d < 30) return `il y a ${Math.floor(d)} j`;
  if (d < 365) return `il y a ${Math.floor(d / 30)} mois`;
  return `il y a ${Math.floor(d / 365)} an(s)`;
};
const fdate = iso => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";
const STATUS = { active: "Actif", recent: "Récent", dormant: "Endormi", paused: "En pause", pending: "En construction" };
const STCOL = { active: "var(--mint)", recent: "var(--warn)", dormant: "#8d8ab8", paused: "#8d8ab8", pending: "var(--violet)" };
const MODE = { work: "Au travail", stroll: "Se promène", sleep: "Dort" };

/* ---------- couleurs ---------- */
function hex2hsl(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2hex(h, s, l) { const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  const x = v => Math.round(v * 255).toString(16).padStart(2, "0"); return "#" + x(f(0)) + x(f(8)) + x(f(4)); }
const tune = hex => { const [h, s, l] = hex2hsl(/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#8b6bff"); return hsl2hex(h, Math.min(.82, Math.max(.6, s)), Math.min(.62, Math.max(.54, l))); };
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = n >> 8 & 255, b = n & 255, t = f < 0 ? 0 : 255, k = Math.abs(f);
  return `rgb(${Math.round(r + (t - r) * k)},${Math.round(g + (t - g) * k)},${Math.round(b + (t - b) * k)})`; };
const lerp = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), m = s => Math.round((A >> s & 255) * (1 - t) + (B >> s & 255) * t); return `rgb(${m(16)},${m(8)},${m(0)})`; };
const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- icônes d'interface ---------- */
const IC = {
  commit: '<circle cx="12" cy="12" r="3.5"/><path d="M3 12h5.5M15.5 12H21"/>',
  flame: '<path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.4 1 2 1.6 2.2C10.3 8 10.5 5.5 12 3z"/>',
  pr: '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M6 8.2v7.6M18 15.8V10a3 3 0 0 0-3-3h-3"/>',
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>', repo: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>', play: '<path d="M8 5v14l11-7z"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  out: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-5-4-11-8-11z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
};
const ic = (n, c = "") => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- logos de projets (pixel-art 12×12) ---------- */
const EMB = {
  medic: ["............", ".wwwwwwwwww.", ".wwwwrrwwww.", ".wwwwrrwwww.", ".wwrrrrrrww.", ".wwrrrrrrww.", ".wwwwrrwwww.", ".wwwwrrwwww.", ".wwwwwwwwww.", ".kkkkkkkkkk.", ".kgkgkgkgkgk", "............"],
  mariage: ["............", ".....p......", "....ppp.....", ".....p......", "............", "..ggg.ggg...", ".g...g...g..", ".g...g...g..", ".g...g...g..", "..ggg.ggg...", "............", "............"],
  cine: ["............", ".wwkkwwkkww.", ".kkwwkkwwkk.", "............", ".kkkkkkkkkk.", ".kkgkkkkkkk.", ".kkggkkkkkk.", ".kkgggkkkkk.", ".kkggkkkkkk.", ".kkgkkkkkkk.", ".kkkkkkkkkk.", "............"],
};
const EMBCOL = { w: "#ffffff", r: "#ff5a6e", k: "#3b3475", g: "#ffc857", p: "#ff7ab6" };
const embKey = p => { const s = (p.id + " " + p.name).toLowerCase(); return /care|sant[eé]|m[eé]dic|health/.test(s) ? "medic" : /mariage|wedding|noces/.test(s) ? "mariage" : /cin[eé]|film|movie/.test(s) ? "cine" : null; };
function emb(p, px = 24) {
  const e = EMB[embKey(p)];
  if (!e) return `<svg class="emb" width="${px}" height="${px}" viewBox="0 0 12 12" aria-hidden="true"><rect width="12" height="12" rx="3" fill="${p.col}"/><text x="6" y="8.6" text-anchor="middle" font-family="'Press Start 2P',monospace" font-size="6.5" fill="#fff">${esc((p.name.trim()[0] || "?").toUpperCase())}</text></svg>`;
  let r = ""; e.forEach((row, y) => [...row].forEach((c, x) => { if (c !== ".") r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${EMBCOL[c]}"/>`; }));
  return `<svg class="emb" width="${px}" height="${px}" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true"><rect width="12" height="12" rx="2" fill="${p.col}" fill-opacity=".28"/>${r}</svg>`;
}
function drawEmblem(p, x, y) {   // enseigne sur le toit (canvas, 14×14)
  R(x, y, 14, 14, "#1b1740"); R(x, y, 14, 1, p.col); R(x, y + 13, 14, 1, p.col); R(x, y, 1, 14, p.col); R(x + 13, y, 1, 14, p.col);
  const e = EMB[embKey(p)];
  if (!e) { G.font = '8px "Press Start 2P",monospace'; G.textBaseline = "top"; G.fillStyle = "#fff"; G.fillText((p.name.trim()[0] || "?").toUpperCase(), x + 3, y + 3); return; }
  e.forEach((row, j) => [...row].forEach((c, i) => { if (c !== ".") R(x + 1 + i, y + 1 + j, 1, 1, EMBCOL[c]); }));
}

/* ---------- données ---------- */
const P = [...D.projects].sort((a, b) => (b.pushed || "").localeCompare(a.pushed || ""));
const NW = D.weeks;
const zeros = n => Array(n).fill(0);
P.forEach(p => { p.repos.sort((a, b) => (b.pushed || "").localeCompare(a.pushed || "")); });
function prep(p) {
  p.col = tune(p.color || "#8b6bff");
  const h = hex2hsl(p.col); p.roof = hsl2hex((h[0] + 22) % 360, h[1] * .8, .32);
  p.total = p.series.reduce((a, b) => a + b, 0);
  p.lvl = 1 + Math.floor(Math.sqrt(p.total));
  p.xp = p.pending ? 0 : (p.total - (p.lvl - 1) ** 2) / (p.lvl ** 2 - (p.lvl - 1) ** 2);
  p.ciFail = p.repos.filter(r => r.ci?.status === "failure").length;
  p.prev7 = p.series[NW - 2] || 0;
  p.days = Array.from({ length: 84 }, (_, i) => p.repos.reduce((s, r) => s + ((r.days && r.days[i]) || 0), 0));
}
// projets ajoutés depuis la page, en attente du prochain rafraîchissement
let PENDING = []; try { PENDING = JSON.parse(lsGet("rph.pending", "[]")); } catch {}
PENDING = PENDING.filter(q => !P.some(p => p.id === q.id));
lsSet("rph.pending", JSON.stringify(PENDING));
const mkPending = q => ({ id: q.id, name: q.name, emoji: q.emoji, color: q.color, description: q.description || "", repos: [], wanted: q.repos, pending: true, status: "pending",
  series: zeros(NW), c7: 0, c30: 0, issues: 0, prs: 0, sites: [], sessions: [], pushed: null, created: null, links: [] });
PENDING.forEach(q => P.push(mkPending(q)));
P.forEach(prep);
const REAL = () => P.filter(p => !p.pending);
const SESS = () => REAL().flatMap(p => p.sessions.map(s => ({ ...s, p }))).sort((a, b) => b.date.localeCompare(a.date));
const G7 = REAL().reduce((s, p) => s + p.c7, 0), GPREV = REAL().reduce((s, p) => s + p.prev7, 0);
const trendPct = (a, b) => b ? Math.round((a - b) / b * 100) : (a ? 100 : 0);
const gSeries = Array.from({ length: NW }, (_, i) => REAL().reduce((s, p) => s + p.series[i], 0));
const streak = (() => { let n = 0; for (let i = NW - 1; i >= 0 && gSeries[i] > 0; i--) n++; return n; })();
const nActive = REAL().filter(p => p.status === "active").length;
const trendHTML = (a, b) => { const t = trendPct(a, b); return t === 0 ? "" : `<span class="tr ${t > 0 ? "up" : "down"}">${t > 0 ? "▲" : "▼"} ${Math.abs(t)}%</span>`; };
const HUBREPO = (() => { const m = location.hostname.match(/^([^.]+)\.github\.io$/), r = location.pathname.split("/")[1]; return m && r ? `${m[1]}/${r}` : "RomaneCano/project-hub"; })();

/* ---------- ambiance (heure du jour) ---------- */
const PHASES = ["auto", "dawn", "day", "dusk", "night"], PHN = { auto: "Auto (selon l'heure)", dawn: "Aube", day: "Jour", dusk: "Crépuscule", night: "Nuit" };
let PHASE = lsGet("rph.phase", "auto"); if (!PHASES.includes(PHASE)) PHASE = "auto";
const curPhase = () => { if (PHASE !== "auto") return PHASE; const h = new Date().getHours(); return h >= 6 && h < 9 ? "dawn" : h >= 9 && h < 18 ? "day" : h >= 18 && h < 21 ? "dusk" : "night"; };
const PAL = {
  day: { sky: ["#3f9bff", "#8fd3ff", "#d9f3ff"], hill: ["#6cc58a", "#57b273"], grass: "#5ec45c", tuft: "#49a94b", flower: ["#ff7aa8", "#ffd34a", "#fff"], tree: ["#2f9e57", "#42b86b", "#237a45"], trunk: "#6b4a2b", path: "#e8d4a0", water: "#58b8ff", cloud: "#ffffff", glass: "#7fb2d9", lit: false },
  dawn: { sky: ["#6f64d1", "#ff9fb6", "#ffe0b0"], hill: ["#78b38d", "#66a07b"], grass: "#69b55f", tuft: "#52a050", flower: ["#ff8fb0", "#ffd34a", "#fff"], tree: ["#2c8f55", "#3ba865", "#216f42"], trunk: "#6b4a2b", path: "#e6caa0", water: "#79b9e8", cloud: "#ffd6e0", glass: "#f3b9b0", lit: false },
  dusk: { sky: ["#34286f", "#b4579b", "#ff9f6b"], hill: ["#3d6a78", "#335c68"], grass: "#3d8c5a", tuft: "#2f7649", flower: ["#ff8fb0", "#ffd34a", "#e8d8ff"], tree: ["#216b48", "#2a8156", "#185238"], trunk: "#4d3822", path: "#c2a77d", water: "#5a86c9", cloud: "#e59ab8", glass: "#ffcf7a", lit: true },
  night: { sky: ["#070a24", "#131b4f", "#27377d"], hill: ["#16355f", "#112d4f"], grass: "#1b5a44", tuft: "#144a38", flower: ["#a96bd1", "#d9b84a", "#cfd8ff"], tree: ["#18603f", "#1f7149", "#124a31"], trunk: "#3a2a1c", path: "#82745a", water: "#2d68ab", cloud: "#34437f", glass: "#ffe58a", lit: true, stars: true },
};

/* ---------- barre du haut ---------- */
$("#brand").innerHTML = `${LOGO}<span class="bt"><b>Romy's</b><i>Projects Hub</i></span>`;
const PHICON = { auto: "clock", dawn: "sun", day: "sun", dusk: "moon", night: "moon" };
let THEME = lsGet("rph.theme", "auto");
function applyTheme() { if (THEME === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", THEME); }
applyTheme();
$("#tools").innerHTML = `
  <button class="tb primary" id="btnResume">${ic("play")}<span>Reprendre</span></button>
  <button class="tb" id="btnAdd">${ic("plus")}<span>Projet</span></button>
  <button class="tb ico" id="btnSearch" aria-label="Rechercher (Ctrl+K)" title="Rechercher (Ctrl+K)">${ic("search")}</button>
  <button class="tb ico" id="btnPhase"></button>
  <button class="tb ico" id="btnTheme" aria-label="Thème de l'interface" title="Thème de l'interface">${ic("palette")}</button>
  <button class="tb ico" id="btnHelp" aria-label="Aide et tutoriel" title="Aide et tutoriel">${ic("help")}</button>
  <button class="tb ico" id="btnOut" aria-label="Se déconnecter" title="Se déconnecter de cet appareil">${ic("out")}</button>`;
function phaseBtn() { const b = $("#btnPhase"); b.innerHTML = ic(PHICON[PHASE === "auto" ? curPhase() : PHASE]); b.title = b.ariaLabel = "Ambiance du village : " + PHN[PHASE]; }
phaseBtn();
$("#helpfab").innerHTML = `<button class="tb" id="btnGuide">${ic("help")}<span>Comment lire le village ?</span></button>`;

/* ---------- HUD ---------- */
function chip(icon, col, val, label, extra = "", title = "") { return `<div class="chip" style="--a:${col}" title="${esc(title)}"><div class="bub">${ic(icon)}</div><div><b>${val}${extra}</b><small>${label}</small></div></div>`; }
function renderHud() {
  const prs = REAL().reduce((s, p) => s + p.prs, 0);
  $("#hud").innerHTML = chip("commit", "var(--gold)", G7, "commits sur 7 jours", trendHTML(G7, GPREV), "Sauvegardes de code des 7 derniers jours, comparées aux 7 jours d'avant")
    + chip("pulse", "var(--mint)", `${nActive}<small style="display:inline;font-size:13px">/${REAL().length}</small>`, "projets actifs", "", "Projets modifiés ces 7 derniers jours")
    + chip("pr", "var(--coral)", prs, "propositions en attente", "", "Pull requests ouvertes : des modifications à relire ou fusionner")
    + chip("flame", "var(--violet)", streak, "semaines d'affilée", "", "Semaines consécutives avec au moins un commit");
}

/* ===================== VILLAGE ===================== */
const stage = $("#stage"), cv = $("#cv"), ctx = cv.getContext("2d"), tip = $("#tip");
let G = ctx, k = 3, cols = 1, rows = 1, PW = 170, PH = 140, LW = 0, LH = 0, hz = 70, plots = [], chars = [], T = REDUCE ? 999 : 0;
let SEL = null;
const R = (x, y, w, h, c) => { G.fillStyle = c; G.fillRect(Math.round(x), Math.round(y), w, h); };
const FAKEREPO = { name: "chantier", ci: null, sessions: [], pushed: new Date().toISOString(), full: "chantier" };

function layout() {
  const W = stage.clientWidth, H = stage.clientHeight, n = P.length;
  const ks = W < 560 ? [2] : W < 1000 ? [3, 2] : [4, 3, 2];
  let f = null;
  for (const kk of ks) { for (let c = n; c >= 1 && !f; c--) { const r = Math.ceil(n / c), pw = Math.floor(W / kk / c), ph = Math.floor(H / kk / r); if (pw >= 150 && ph >= 120) f = { k: kk, cols: c, rows: r, pw, ph }; } if (f) break; }
  if (!f) { const kk = ks[ks.length - 1]; f = { k: kk, cols: 1, rows: n, pw: Math.floor(W / kk), ph: Math.max(120, Math.floor(H / kk / n)) }; }
  ({ k, cols, rows } = f); PW = f.pw; const hzMin = Math.ceil(44 + 116 / k); PH = Math.max(f.ph, hzMin + 64); LW = PW * cols; LH = PH * rows; hz = Math.max(Math.round(PH * .44), hzMin);
  cv.width = LW * k; cv.height = LH * k; cv.style.width = cv.width + "px"; cv.style.height = cv.height + "px";
  plots = P.map((p, i) => {
    const rnd = mulberry(hashStr(p.id + "x")), hw = 40 + Math.min(p.repos.length || 3, 13) * 2, cx = Math.round(PW / 2), hy = hz + 14;
    const trees = [], tufts = [];
    const nT = Math.max(3, Math.round(PW * (PH - hz) / 2600));
    for (let j = 0, g = 0; j < nT && g < 90; g++) { const x = 8 + rnd() * (PW - 16), y = hz + 26 + rnd() * (PH - hz - 34); if (Math.abs(x - cx) < hw / 2 + 16 && y < hy + 36) continue; if (Math.abs(x - cx) < 9) continue; trees.push({ x: Math.round(x), y: Math.round(y), s: rnd() < .3 ? 1 : 0 }); j++; }
    for (let j = 0; j < Math.round(PW * (PH - hz) / 150); j++) tufts.push({ x: rnd() * PW, y: hz + 4 + rnd() * (PH - hz - 6), f: rnd() < .12 ? Math.floor(rnd() * 3) : -1 });
    let pond = null; if (rnd() < .65) { const sx = rnd() < .5 ? -1 : 1; pond = { x: Math.max(26, Math.min(PW - 26, Math.round(cx + sx * (hw / 2 + 34 + rnd() * 8)))), y: Math.round(hy + 46 + rnd() * 18) }; }
    return { p, i, ox: (i % cols) * PW, oy: Math.floor(i / cols) * PH, hw, cx, hx: cx - Math.round(hw / 2), hy, trees, tufts, pond, born: i * 10, flies: Array.from({ length: 7 }, () => ({ x: rnd() * PW, y: hy + rnd() * (PH - hy), p: rnd() * 6 })) };
  });
  chars = [];
  P.forEach((p, pi) => {
    const list = p.pending ? [FAKEREPO] : p.repos;
    list.forEach((r, ri) => {
      const rnd = mulberry(hashStr(r.full || r.name)), age = ageDays(r.pushed);
      chars.push({ p, pi, r, rnd, mode: age < 2 ? "work" : age < 14 ? "stroll" : "sleep", x: 14 + rnd() * (PW - 28), y: hy0() + rnd() * (PH - hy0() - 10), tx: 14 + rnd() * (PW - 28), ty: hy0() + rnd() * (PH - hy0() - 10),
        skin: ["#f5c9a0", "#e0a97a", "#b9784a", "#8a5a3a"][Math.floor(rnd() * 4)], hair: ["#2b1d12", "#6b3f1d", "#d6a73a", "#c8431f", "#222", "#8b8b8b"][Math.floor(rnd() * 6)],
        tone: [-0.2, 0.15, 0, 0.3][ri % 4], pause: rnd() * 30, f: Math.floor(rnd() * 20), dir: 1, moving: false, hop: 0 });
    });
  });
  buildPlates();
}
const hy0 = () => hz + 14 + 24;

function buildPlates() {
  $("#plates").innerHTML = plots.map(pl => {
    const p = pl.p, left = (pl.ox + pl.cx) * k, top = (pl.oy + pl.hy - 58) * k;
    return `<button class="plate${SEL && SEL.p === p && !SEL.r ? " sel" : ""}" data-id="${esc(p.id)}" style="--c:${p.col};left:${left}px;top:${top}px;animation-delay:${REDUCE ? 0 : 350 + pl.i * 160}ms;max-width:${PW * k * .94}px" aria-label="Projet ${esc(p.name)}, niveau ${p.lvl}">
      <span class="row"><span class="st s-${p.status}"></span>${emb(p, 20)}<span class="nm">${esc(p.name)}</span><span class="lv">NIV ${p.lvl}</span></span>
      ${p.pending ? '<span class="pend">EN CONSTRUCTION</span>' : `<i class="xp"><b style="width:${Math.round(p.xp * 100)}%"></b></i>`}</button>`;
  }).join("");
  $$(".plate").forEach(b => b.onclick = () => select(P.find(p => p.id === b.dataset.id), null));
}

/* --- dessin --- */
function band(r, pal, ph) {
  const oy = r * PH;
  for (let y = 0; y < hz; y += 4) { const f = y / hz; R(0, oy + y, LW, 4, f < .5 ? lerp(pal.sky[0], pal.sky[1], f * 2) : lerp(pal.sky[1], pal.sky[2], (f - .5) * 2)); }
  if (pal.stars) for (let i = 0; i < LW / 5; i++) { const x = (i * 97 + r * 31) % LW, y = (i * 53 + r * 17) % (hz - 24); if ((Math.floor(T / 6) + i) % 9) R(x, oy + y, 1, 1, "#fff"); }
  const sx = ph === "night" ? LW * .84 : ph === "dawn" ? LW * .14 : ph === "dusk" ? LW * .86 : LW * .8, sy = ph === "day" ? 16 : ph === "night" ? 14 : hz - 30;
  if (ph === "night") { R(sx, oy + sy, 12, 12, "#fdf3c4"); R(sx + 4, oy + sy, 8, 12, pal.sky[1]); } else { R(sx - 2, oy + sy - 2, 16, 16, ph === "day" ? "rgba(255,230,120,.3)" : "rgba(255,150,100,.35)"); R(sx, oy + sy, 12, 12, ph === "day" ? "#ffe27a" : "#ff9a52"); }
  for (let i = 0; i < Math.max(2, Math.round(LW / 130)); i++) { const x = ((T * .1 + i * 140 + r * 40) % (LW + 60)) - 30, y = oy + 12 + (i * 17) % 30; ctx.globalAlpha = pal.lit && ph === "night" ? .5 : .92; R(x, y, 24, 5, pal.cloud); R(x + 4, y - 3, 14, 4, pal.cloud); ctx.globalAlpha = 1; }
  if (ph === "day" || ph === "dawn") for (let i = 0; i < 3; i++) { const x = ((T * .35 + i * 90 + r * 20) % (LW + 30)) - 15, y = oy + 16 + i * 9 + Math.sin(T / 9 + i) * 2, fl = Math.floor(T / 5) % 2; R(x, y, 2, 1, "#2a2f45"); R(x + 2, y + (fl ? -1 : 1), 2, 1, "#2a2f45"); R(x + 4, y, 2, 1, "#2a2f45"); }
  for (let x = 0; x < LW; x += 2) { const a = 11 + 6 * Math.sin(x / 23 + r) + 4 * Math.sin(x / 9); R(x, oy + hz - a, 2, a + 2, pal.hill[0]); const b = 5 + 4 * Math.sin(x / 15 + 2 + r); R(x, oy + hz - b, 2, b + 1, pal.hill[1]); }
  R(0, oy + hz, LW, PH - hz, pal.grass); R(0, oy + PH - 1, LW, 1, "rgba(0,0,0,.18)");
}
function tree(x, y, s, pal) {
  R(x - 1, y - 6, 3, 6, pal.trunk); R(x - 4, y + 0, 9, 2, "rgba(0,0,0,.2)");
  const rows = s ? [[-18, 8], [-15, 12], [-12, 14], [-9, 12], [-6, 8]] : [[-15, 6], [-12, 10], [-9, 12], [-6, 8]];
  rows.forEach(([dy, w], i) => { R(x - w / 2, y + dy, w, 3, pal.tree[i % 3 === 0 ? 1 : 0]); R(x - w / 2, y + dy, 2, 3, pal.tree[1]); R(x + w / 2 - 2, y + dy, 2, 3, pal.tree[2]); });
}
function lamp(x, y, lit) { R(x, y - 14, 1, 14, "#2b2b3a"); R(x - 2, y - 17, 5, 3, "#2b2b3a"); R(x - 1, y - 16, 3, 2, lit ? "#ffe58a" : "#9aa"); if (lit) { ctx.globalAlpha = .18; R(x - 9, y - 24, 19, 20, "#ffe58a"); ctx.globalAlpha = 1; } }
function drawHouse(pl, pal, ph) {
  const p = pl.p, { hw, cx, hx, hy, ox, oy } = pl, X = x => ox + x, Y = y => oy + y;
  const f = Math.max(0, Math.min(1, (T - pl.born) / 36)), age = ageDays(p.pushed), busy = age < 2, lit = pal.lit || busy;
  R(X(hx) + 3, Y(hy), hw, 3, "rgba(0,0,0,.22)");
  if (p.pending) { drawSite(pl, f); return; }
  ctx.save(); ctx.beginPath(); ctx.rect(X(hx) - 22, Y(hy) + 3 - 70 * f, hw + 44, 70 * f); ctx.clip();
  if (busy) for (let j = 0; j < 4; j++) { const o = (T * .5 + j * 8) % 30; ctx.globalAlpha = 1 - o / 30; R(X(hx + hw - 14) + Math.sin((o + j) / 3) * 2, Y(hy - 54) - o, 3 + o / 8, 3 + o / 8, pal.lit ? "#aab" : "#fff"); ctx.globalAlpha = 1; }
  R(X(hx + hw - 16), Y(hy - 54), 6, 18, shade(p.roof, -.35));
  R(X(hx), Y(hy - 38), hw, 38, p.col); R(X(hx + hw - 5), Y(hy - 38), 5, 38, shade(p.col, -.24)); R(X(hx), Y(hy - 38), hw, 2, shade(p.col, .28)); R(X(hx), Y(hy - 3), hw, 3, shade(p.col, -.32));
  for (let j = 0; j < 16; j++) { const half = Math.round((j + 1) / 16 * (hw / 2 + 5)); R(X(cx - half), Y(hy - 54 + j), half * 2, 1, j % 4 === 3 ? shade(p.roof, -.2) : p.roof); R(X(cx - half), Y(hy - 54 + j), 1, 1, shade(p.roof, .25)); }
  drawEmblem(p, X(cx - 7), Y(hy - 51));
  R(X(cx - 5), Y(hy - 17), 10, 17, "#5a3a22"); R(X(cx - 4), Y(hy - 18), 8, 1, "#5a3a22"); R(X(cx + 2), Y(hy - 9), 1, 1, "#ffd34a"); R(X(cx - 7), Y(hy - 1), 14, 2, "#9a8a6a");
  [hx + 6, hx + hw - 16].forEach(wx => { R(X(wx), Y(hy - 30), 10, 9, "#3a2c20"); R(X(wx + 1), Y(hy - 29), 8, 7, lit ? "#ffe58a" : pal.glass); R(X(wx + 4), Y(hy - 29), 1, 7, "#3a2c20"); if (lit && pal.lit) { ctx.globalAlpha = .16; R(X(wx - 3), Y(hy - 33), 16, 15, "#ffe58a"); ctx.globalAlpha = 1; } });
  ctx.restore();
  // drapeau d'état
  const fc = { active: "#2fd37a", recent: "#f0a823", dormant: "#8d8ab8", paused: "#8d8ab8" }[p.status] || "#8d8ab8", wv = Math.round(Math.sin(T / 5));
  R(X(hx - 14), Y(hy - 32), 2, 32, "#6b5a45"); R(X(hx - 12), Y(hy - 31), 12, 7, fc); R(X(hx) - 0 + wv - 2, Y(hy - 30), 2, 5, fc);
  // boîte aux lettres (PR) et colis (issues)
  const mx = X(hx - 24), my = Y(hy + 14); R(mx, my - 8, 2, 8, "#6b5a45"); R(mx - 3, my - 13, 8, 5, "#4a6cf7"); R(mx - 3, my - 13, 8, 1, "#7d96ff");
  if (p.prs > 0) { R(mx + 5, my - 17, 2, 7, "#ff4d6a"); R(mx + 5, my - 17, 4, 2, "#ff4d6a"); }
  const nc = Math.min(6, Math.ceil(p.issues / 3)); for (let j = 0; j < nc; j++) { const bx = X(hx + hw + 6) + (j % 3) * 7, by = Y(hy + 3) - Math.floor(j / 3) * 6; R(bx, by - 6, 6, 6, "#b9824a"); R(bx, by - 6, 6, 1, "#d9a366"); R(bx + 2, by - 6, 1, 6, "#8a5a2c"); }
  if (p.ciFail) { ctx.globalAlpha = .95; R(X(cx - 12), Y(hy - 70), 24, 6, "#6b7391"); R(X(cx - 8), Y(hy - 73), 16, 4, "#6b7391"); ctx.globalAlpha = 1; for (let j = 0; j < 6; j++) R(X(cx - 10 + j * 4), Y(hy - 63) + ((T + j * 3) % 10), 1, 3, "#7fb2ff"); }
  if (SEL && SEL.p === p && !SEL.r) { ctx.strokeStyle = Math.floor(T / 8) % 2 ? "#ffc857" : "#fff"; ctx.lineWidth = 1; ctx.strokeRect(X(hx) - 3.5, Y(hy - 56) - .5, hw + 7, 60); }
  if (f < 1) for (let j = 0; j < 8; j++) R(X(hx) + ((j * 37 + T * 3) % hw), Y(hy) - ((T + j * 5) % 12), 2, 2, "rgba(255,255,255,.7)");
}
function drawSite(pl, f) {   // chantier : projet ajouté, en attente du prochain rafraîchissement
  const { hw, cx, hx, hy, ox, oy, p } = pl, X = x => ox + x, Y = y => oy + y;
  R(X(hx), Y(hy - 2), hw, 4, "#8a7a5a"); R(X(hx + 4), Y(hy - 14), hw - 8, 12, shade(p.col, -.1)); R(X(hx + 4), Y(hy - 14), hw - 8, 2, shade(p.col, .3));
  for (let j = 0; j < 3; j++) { R(X(hx + 2 + j * (hw - 6) / 2), Y(hy - 40), 2, 40, "#b9824a"); }
  R(X(hx), Y(hy - 26), hw, 2, "#d9a366"); R(X(hx), Y(hy - 40), hw, 2, "#d9a366"); R(X(hx + 2), Y(hy - 40), 2, 40, "#8a5a2c");
  R(X(cx + hw / 2 - 4), Y(hy - 60), 2, 60, "#f0a823"); R(X(cx + hw / 2 - 4), Y(hy - 60), 26, 2, "#f0a823"); const sw = Math.round(Math.sin(T / 9) * 3); R(X(cx + hw / 2 + 22) + sw, Y(hy - 58), 1, 14, "#6b5a45"); R(X(cx + hw / 2 + 19) + sw, Y(hy - 44), 7, 5, "#8a5a2c");
  R(X(cx - 14), Y(hy - 36), 28, 9, "#f0a823"); for (let j = 0; j < 7; j++) R(X(cx - 14 + j * 4), Y(hy - 36), 2, 9, "#2a2230");
}
function drawChar(c, t, night) {
  const X = Math.round(c.x), Y = Math.round(c.y) - Math.round(Math.abs(Math.sin(c.hop / 3)) * (c.hop > 0 ? 6 : 0)), body = shade(c.p.col, c.tone);
  R(X - 3, Math.round(c.y) - 1, 7, 2, "rgba(0,0,0,.25)");
  if (c.mode === "sleep") {
    R(X - 3, Y - 5, 7, 5, body); R(X - 2, Y - 9, 5, 4, c.skin); R(X - 2, Y - 10, 5, 2, c.hair); R(X - 1, Y - 7, 1, 1, "#222"); R(X + 1, Y - 7, 1, 1, "#222");
    const q = (t / 14 + c.pi) % 3; G.globalAlpha = 1 - q / 3; G.font = '5px "Press Start 2P",monospace'; G.textBaseline = "top"; G.fillStyle = night ? "#dfe8ff" : "#fff"; G.fillText("z", X + 4, Y - 14 - q * 3); G.globalAlpha = 1;
  } else {
    const alt = c.moving && Math.floor(c.f / 3) % 2;
    R(X - 2, Y - 3 + (alt ? 1 : 0), 2, 3 - (alt ? 1 : 0), "#2a2f45"); R(X, Y - 3 + (alt ? 0 : 1), 2, 3 - (alt ? 0 : 1), "#2a2f45");
    R(X - 3, Y - 8, 6, 5, body);
    const hammer = c.mode === "work" && !c.moving && c.pause > 0, up = hammer && Math.floor(c.f / 4) % 2;
    R(X - 4, Y - 8, 1, 3, c.skin); R(X + 3, Y - (up ? 11 : 8), 1, 3, c.skin);
    if (hammer) { R(X + 3, Y - (up ? 13 : 7), 3, 2, "#9aa4b2"); if (!up && c.f % 8 === 4) { R(X + 6, Y - 6, 1, 1, "#ffd34a"); R(X + 7, Y - 8, 1, 1, "#ffd34a"); } }
    R(X - 2, Y - 12, 5, 4, c.skin); R(X - 2, Y - 13, 5, 2, c.hair); R(X - 1 + (c.dir > 0 ? 1 : 0), Y - 11, 1, 1, "#222"); R(X + (c.dir > 0 ? 1 : 0), Y - 11, 1, 1, "#222");
  }
  if (c.r.ci?.status === "failure") { if (Math.floor(t / 8) % 2) { R(X, Y - 21, 2, 4, "#ff3b3b"); R(X, Y - 16, 2, 2, "#ff3b3b"); } }
  else if (c.r.sessions?.length && c.mode !== "sleep") { R(X - 4, Y - 20, 9, 5, "#fff"); R(X - 1, Y - 15, 2, 1, "#fff"); [-2, 0, 2].forEach(o => R(X + o, Y - 18, 1, 1, "#4a5568")); }
  if (SEL && SEL.r && SEL.r === c.r && SEL.p === c.p) { const b = Math.round(Math.sin(t / 4)); R(X - 1, Y - 26 + b, 3, 1, "#ffc857"); R(X, Y - 25 + b, 1, 1, "#ffc857"); }
}
function stepChar(c) {
  c.f++; if (c.hop > 0) c.hop--;
  if (c.mode === "sleep") { c.moving = false; return; }
  if (c.pause > 0) { c.pause--; c.moving = false; return; }
  const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
  if (d < 1) { c.pause = c.mode === "work" ? 18 + c.rnd() * 35 : 30 + c.rnd() * 90; c.tx = 14 + c.rnd() * (PW - 28); c.ty = hy0() + c.rnd() * (PH - hy0() - 10); c.moving = false; return; }
  const sp = c.mode === "work" ? .5 : .22; c.x += dx / d * sp; c.y += dy / d * sp; c.dir = dx >= 0 ? 1 : -1; c.moving = true;
}
function frame() {
  G = ctx; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.imageSmoothingEnabled = false;
  const ph = curPhase(), pal = PAL[ph]; stage.style.background = pal.grass;
  for (let r = 0; r < rows; r++) band(r, pal, ph);
  plots.forEach(pl => {
    const { ox, oy, cx, hy, hw } = pl; ctx.save(); ctx.translate(ox, oy); ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip(); ctx.translate(-ox, -oy);
    pl.tufts.forEach(u => { R(ox + u.x, oy + u.y, 2, 1, pal.tuft); if (u.f >= 0) R(ox + u.x, oy + u.y - 2, 1, 1, pal.flower[u.f]); });
    R(ox + cx - 5, oy + hy, 10, PH - hy, pal.path); R(ox + cx - 5, oy + hy, 1, PH - hy, "rgba(0,0,0,.08)");
    if (pl.pond) { const { x, y } = pl.pond; [[-2, 14], [0, 22], [2, 26], [4, 22], [6, 14]].forEach(([dy, w]) => R(ox + x - w / 2, oy + y + dy, w, 2, pal.water)); R(ox + x - 6, oy + y + 1, 6, 1, "rgba(255,255,255,.5)"); }
    drawHouse(pl, pal, ph);
    const items = pl.trees.map(t => ({ y: t.y, d: () => tree(ox + t.x, oy + t.y, t.s, pal) }));
    items.push({ y: hy + 30, d: () => lamp(ox + cx + 13, oy + hy + 30, pal.lit) });
    const alive = T >= pl.born + 36;
    if (alive) chars.filter(c => c.pi === pl.i).forEach(c => items.push({ y: c.y, d: () => { ctx.save(); ctx.translate(ox, oy); drawChar(c, T, pal.lit); ctx.restore(); } }));
    items.sort((a, b) => a.y - b.y).forEach(it => it.d());
    if (pal.lit) pl.flies.forEach((f, j) => { if (Math.floor(T / 5 + j * 3) % 4) R(ox + f.x + Math.sin(T / 17 + f.p) * 9, oy + f.y + Math.cos(T / 13 + f.p) * 6, 1, 1, "#d8ff7a"); });
    ctx.restore();
  });
}
function tick() { T++; chars.forEach(c => { if (T >= (plots[c.pi]?.born || 0) + 36) stepChar(c); }); }
let last = 0, rafId = 0;
function loop(ts) { rafId = requestAnimationFrame(loop); if (ts - last < 1000 / 20) return; last = ts; if (document.hidden || $("#vv").hidden) return; tick(); frame(); }

/* --- interactions village --- */
const cpos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / k, y: (e.clientY - b.top) / k, px: e.clientX - $("#vv").getBoundingClientRect().left, py: e.clientY - $("#vv").getBoundingClientRect().top }; };
function hit(m) {
  const i = Math.floor(m.y / PH) * cols + Math.floor(m.x / PW); if (m.x < 0 || m.y < 0 || i >= P.length || i < 0) return null;
  const pl = plots[i], lx = m.x % PW, ly = m.y % PH;
  const c = chars.filter(c => c.pi === i && T >= pl.born + 36 && Math.abs(lx - c.x) < 6 && ly < c.y + 2 && ly > c.y - 15).sort((a, b) => b.y - a.y)[0];
  if (c) return { p: c.p, r: c.p.pending ? null : c.r, c };
  if (lx > pl.hx - 4 && lx < pl.hx + pl.hw + 4 && ly > pl.hy - 58 && ly < pl.hy + 4) return { p: pl.p, r: null };
  return null;
}
cv.onpointermove = e => {
  const m = cpos(e), h = hit(m); cv.style.cursor = h ? "pointer" : "default";
  if (!h) { tip.style.display = "none"; return; }
  tip.innerHTML = h.r ? `<b>${esc(h.r.name)}</b>${esc(MODE[h.c?.mode] || "")} · ${rel(h.r.pushed)}<small>${esc(h.r.recent?.[0]?.msg || "")}</small>` : `<b>${esc(h.p.name)}</b>${h.p.pending ? "En construction" : `${h.p.repos.length} dépôt(s) · ${rel(h.p.pushed)}`}`;
  tip.style.display = "block"; tip.style.left = Math.min(m.px + 14, $("#vv").clientWidth - 270) + "px"; tip.style.top = m.py + 16 + "px";
};
cv.onpointerleave = () => { tip.style.display = "none"; };
cv.onclick = e => { const h = hit(cpos(e)); if (!h) { if (SEL) deselect(); return; } if (h.c) h.c.hop = 12; select(h.p, h.r); };
function select(p, r) { SEL = { p, r }; $$(".plate").forEach(b => b.classList.toggle("sel", !r && b.dataset.id === p.id)); renderDrawer(); if (REDUCE) frame(); }
function deselect() { SEL = null; $$(".plate").forEach(b => b.classList.remove("sel")); $("#drawer").hidden = true; if (REDUCE) frame(); }

/* ===================== TIROIR DE DÉTAILS ===================== */
function bars(series, color, h = 56) {
  const w = 240, n = series.length, bw = w / n, mx = Math.max(1, ...series);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Commits par semaine : ${series.join(", ")}"><line x1="0" x2="${w}" y1="${h - .5}" y2="${h - .5}" stroke="var(--line)"/>
    ${series.map((v, i) => { const bh = v ? Math.max(3, v / mx * (h - 6)) : 0; return `<rect x="${i * bw + 2}" y="${h - bh - 1}" width="${bw - 4}" height="${bh}" rx="2" fill="${color}" opacity="${i === n - 1 ? 1 : .55}"><title>${v} commit(s)</title></rect>`; }).join("")}</svg>`;
}
function badgesOf(p) {
  const b = [], a = ageDays(p.pushed);
  if (a < 1) b.push("⚡ Actif aujourd'hui"); if (p.c7 >= 100) b.push("🔥 En feu"); if (p.ciFail) b.push(`🚨 ${p.ciFail} dépôt(s) avec tests en échec`);
  if (!p.prs && !p.issues && !p.pending) b.push("✨ Rien en attente"); if (p.sessions.length >= 5) b.push("💬 Beaucoup de conversations");
  if (p.series.filter(v => v > 0).length >= 8) b.push("🏅 Régulier"); if (a > 30) b.push("😴 Endormi depuis un moment");
  return b.map(x => `<span class="badge">${x}</span>`).join("");
}
function renderDrawer() {
  const d = $("#drawer"); if (!SEL) { d.hidden = true; return; }
  const { p, r } = SEL; d.hidden = false; d.style.setProperty("--c", p.col); d.scrollTop = 0;
  d.innerHTML = p.pending ? pendingHTML(p) : r ? repoHTML(p, r) : projHTML(p);
  $("#dx", d).onclick = deselect;
  $$("[data-r]", d).forEach(b => b.onclick = () => { const rr = p.repos.find(x => x.full === b.dataset.r); const c = chars.find(c => c.r === rr); if (c) c.hop = 12; select(p, rr); });
  $$("[data-back]", d).forEach(b => b.onclick = () => select(p, null));
  const note = $("#note", d); if (note) note.oninput = () => lsSet("rph.note." + p.id, note.value);
  $$("[data-rm]", d).forEach(b => b.onclick = () => { PENDING = PENDING.filter(q => q.id !== b.dataset.rm); lsSet("rph.pending", JSON.stringify(PENDING)); const i = P.findIndex(x => x.id === b.dataset.rm); if (i >= 0) P.splice(i, 1); SEL = null; d.hidden = true; layout(); renderHud(); });
}
const tile = (v, l) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`;
function projHTML(p) {
  const s = p.sessions[0], main = p.repos[0], noteV = lsGet("rph.note." + p.id, p.next || "");
  return `<div class="dh"><div class="dt">${emb(p, 46)}<div style="min-width:0"><h2>${esc(p.name)}</h2><span class="pill" style="--pc:${STCOL[p.status]}"><span class="st s-${p.status}"></span>${STATUS[p.status]} · Niveau ${p.lvl}</span></div></div><button class="x" id="dx" aria-label="Fermer">${ic("close")}</button></div>
  <p class="hint">${esc(p.description)}</p>
  <div class="tiles">${tile(rel(p.pushed), "Dernière activité")}${tile(`${p.c7} ${trendHTML(p.c7, p.prev7)}`, "Commits sur 7 jours")}${tile(`${p.prs} · ${p.issues}`, "Propositions · tâches ouvertes")}${tile(fdate(p.created), "Créé le")}</div>
  <div class="spark"><h3>Activité, 12 dernières semaines</h3>${bars(p.series, p.col)}</div>
  <div class="badges">${badgesOf(p)}</div>
  <div class="acts">${s ? `<a class="btn main" ${ext(s.url)}>${ic("chat")}Reprendre la conversation</a>` : ""}${main ? `<a class="btn ${s ? "" : "main"}" ${ext(main.url)}>${ic("repo")}${esc(main.name)}</a>` : ""}${p.sites.map(u => `<a class="btn" ${ext(u)}>${ic("ext")}Ouvrir le site</a>`).join("")}${(p.links || []).map(l => `<a class="btn" ${ext(l.url)}>${esc(l.label)}</a>`).join("")}</div>
  <div class="field"><label for="note">Ma prochaine étape (enregistrée sur cet appareil)</label><textarea id="note" rows="3" placeholder="Ex. finir la page de paiement, relancer un client…">${esc(noteV)}</textarea></div>
  <h3>Dépôts de code (${p.repos.length})</h3><ul class="list">${p.repos.map(r => `<li><button data-r="${esc(r.full)}"><span class="st s-${ageDays(r.pushed) < 7 ? "active" : ageDays(r.pushed) < 30 ? "recent" : "dormant"}"></span><span class="t"><b>${esc(r.name)}</b><small>${rel(r.pushed)} · ${esc(r.recent?.[0]?.msg || "—")}</small></span></button></li>`).join("")}</ul>
  <h3>Conversations avec Claude (${p.sessions.length})</h3>${p.sessions.length ? `<ul class="list">${p.sessions.map(s => `<li><a ${ext(s.url)}><span class="t"><b>${esc(s.title)}</b><small>${esc(s.repo)} · ${rel(s.date)}</small></span>${ic("ext")}</a></li>`).join("")}</ul>` : `<p class="hint">Aucune trouvée. Elles sont repérées dans les messages de commit.</p>`}`;
}
function repoHTML(p, r) {
  const c = chars.find(c => c.r === r), s = r.sessions[0] || p.sessions[0];
  return `<div class="dh"><div class="dt">${emb(p, 46)}<div style="min-width:0"><h2>${esc(r.name)}</h2><span class="pill" style="--pc:${STCOL[ageDays(r.pushed) < 7 ? "active" : ageDays(r.pushed) < 30 ? "recent" : "dormant"]}">${esc(MODE[c?.mode] || "")} · ${esc(p.name)}</span></div></div><button class="x" id="dx" aria-label="Fermer">${ic("close")}</button></div>
  <p class="hint">${esc(r.description || "Dépôt de code du projet " + p.name)}</p>
  <div class="tiles">${tile(rel(r.pushed), "Dernière activité")}${tile(`${r.c7} ${trendHTML(r.c7, r.series?.[NW - 2] || 0)}`, "Commits sur 7 jours")}${tile(`${r.prs ?? 0} · ${r.issues ?? 0}`, "Propositions · tâches")}${tile(esc(r.language || "—"), "Langage principal")}</div>
  <div class="spark"><h3>Activité, 12 dernières semaines</h3>${bars(r.series, p.col)}</div>
  <div class="badges"><span class="badge ${r.ci?.status === "failure" ? "ko" : ""}">${r.ci ? (r.ci.status === "success" ? "✅ Tests automatiques OK" : r.ci.status === "failure" ? "❗ Tests automatiques en échec" : "⏳ Tests en cours") : "Pas de tests automatiques"}</span>${r.private ? '<span class="badge">🔒 Privé</span>' : '<span class="badge">🌍 Public</span>'}</div>
  <div class="acts">${s ? `<a class="btn main" ${ext(s.url)}>${ic("chat")}Reprendre la conversation</a>` : ""}<a class="btn ${s ? "" : "main"}" ${ext(r.url)}>${ic("repo")}Ouvrir le dépôt</a>${r.site ? `<a class="btn" ${ext(r.site)}>${ic("ext")}Site</a>` : ""}${r.ci?.url ? `<a class="btn" ${ext(r.ci.url)}>Tests</a>` : ""}</div>
  <h3>Derniers commits</h3><ul class="list">${(r.recent || []).map(m => `<li><a ${ext(m.url)}><span class="t"><b>${esc(m.msg)}</b><small>${esc(m.author)} · ${rel(m.date)}</small></span></a></li>`).join("") || '<li><span class="hint">Aucun commit récent.</span></li>'}</ul>
  <button class="btn" data-back>← Retour à ${esc(p.name)}</button>`;
}
function pendingHTML(p) {
  return `<div class="dh"><div class="dt">${emb(p, 46)}<div style="min-width:0"><h2>${esc(p.name)}</h2><span class="pill" style="--pc:var(--violet)">🚧 En construction</span></div></div><button class="x" id="dx" aria-label="Fermer">${ic("close")}</button></div>
  <p class="hint">Ce projet a été ajouté depuis cette page, mais ses données ne sont pas encore lues. Pour que la maison soit terminée :</p>
  <ol class="steps"><li><span>Copiez la nouvelle configuration (menu « Projet »).</span></li><li><span>Collez-la dans le secret <b>HUB_PROJECTS</b> sur GitHub.</span></li><li><span>Lancez « Run workflow » : le village se met à jour en 1 à 2 minutes.</span></li></ol>
  <p class="hint">Dépôts prévus : ${(p.wanted || []).map(esc).join(", ") || "—"}</p>
  <div class="acts"><button class="btn main" id="reopenAdd">${ic("plus")}Revoir les étapes</button><button class="btn" data-rm="${esc(p.id)}">Retirer ce chantier</button></div>`;
}
document.addEventListener("click", e => { if (e.target.closest("#reopenAdd") && SEL) openAdd(SEL.p); });

/* ===================== FENÊTRES ===================== */
const layer = $("#layer");
function closeModal() { $$(".modal", layer).forEach(m => m.remove()); }
function modal(html) { closeModal(); const m = document.createElement("div"); m.className = "modal"; m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; m.addEventListener("mousedown", e => { if (e.target === m) closeModal(); }); layer.appendChild(m); const x = $("[data-close]", m); if (x) x.onclick = closeModal; return m.firstElementChild; }
const shead = t => `<div class="sh"><h2>${t}</h2><button class="x" data-close aria-label="Fermer">${ic("close")}</button></div>`;
function openLink(url) { const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; document.body.appendChild(a); a.click(); a.remove(); }

/* --- recherche --- */
function openSearch() {
  const items = [...P.map(p => ({ k: "p", t: p.name, s: p.pending ? "En construction" : `${p.repos.length} dépôt(s)`, p, h: p.name + " " + p.id })),
    ...REAL().flatMap(p => p.repos.map(r => ({ k: "r", t: r.name, s: p.name + " · " + rel(r.pushed), p, r, h: r.name + " " + p.name }))),
    ...SESS().map(s => ({ k: "s", t: s.title, s: "Conversation · " + s.p.name, url: s.url, p: s.p, h: s.title + " " + s.p.name + " conversation" }))];
  const sh = modal(`${shead("Rechercher")}<input id="q" class="fi" type="text" placeholder="Un projet, un dépôt, une conversation…" autocomplete="off"><div class="sr" id="sr" role="listbox"></div><p class="hint">↑ ↓ pour naviguer, Entrée pour ouvrir, Échap pour fermer.</p>`);
  const q = $("#q", sh), box = $("#sr", sh); let on = 0, list = [];
  const IC2 = { p: "🏠", r: "🧑‍💻", s: "💬" };
  const draw = () => { const w = q.value.toLowerCase().split(/\s+/).filter(Boolean); list = items.filter(i => w.every(x => i.h.toLowerCase().includes(x))).slice(0, 40); on = Math.min(on, Math.max(0, list.length - 1));
    box.innerHTML = list.map((i, n) => `<button role="option" class="${n === on ? "on" : ""}" data-n="${n}"><span>${IC2[i.k]}</span><b>${esc(i.t)}</b><small>${esc(i.s)}</small></button>`).join("") || '<p class="hint">Aucun résultat.</p>';
    $$("button", box).forEach(b => b.onclick = () => go(list[+b.dataset.n])); const a = $(".on", box); if (a) a.scrollIntoView({ block: "nearest" }); };
  const go = i => { if (!i) return; closeModal(); if (i.k === "p") select(i.p, null); else if (i.k === "r") select(i.p, i.r); else openLink(i.url); };
  q.oninput = () => { on = 0; draw(); };
  q.onkeydown = e => { if (e.key === "ArrowDown") { on = Math.min(list.length - 1, on + 1); draw(); e.preventDefault(); } else if (e.key === "ArrowUp") { on = Math.max(0, on - 1); draw(); e.preventDefault(); } else if (e.key === "Enter") go(list[on]); };
  draw(); q.focus();
}

/* --- aide / légende --- */
function miniSprite(canvas, mode, extra) {
  const g = canvas.getContext("2d"); canvas.width = 24; canvas.height = 24; const prev = G; G = g; g.imageSmoothingEnabled = false;
  const fake = { p: { col: "#8b6bff" }, pi: 0, r: { ci: extra === "ci" ? { status: "failure" } : null, sessions: extra === "chat" ? [1] : [] }, mode, x: 12, y: 21, skin: "#f5c9a0", hair: "#6b3f1d", tone: 0, f: 4, dir: 1, moving: mode === "stroll", pause: mode === "work" ? 5 : 0, hop: 0 };
  drawChar(fake, 8, false); G = prev;
}
function openHelp() {
  const sh = modal(`${shead("Comment lire le village")}
    <p class="hint">Chaque <b>maison</b> est un projet. Chaque <b>petit personnage</b> est un « dépôt », c'est-à-dire un dossier de code de ce projet. Son comportement montre à quand remonte la dernière modification.</p>
    <div class="acts"><button class="btn main" id="goTour">${ic("play")}Lancer la visite guidée</button></div>
    <div class="legrow"><canvas data-m="work"></canvas><div><b>Il travaille, marteau en main</b><span>Du code a été enregistré il y a moins de 2 jours.</span></div></div>
    <div class="legrow"><canvas data-m="stroll"></canvas><div><b>Il se promène</b><span>Dernière modification il y a entre 2 et 14 jours.</span></div></div>
    <div class="legrow"><canvas data-m="sleep"></canvas><div><b>Il dort, avec des « z »</b><span>Rien depuis plus de 14 jours.</span></div></div>
    <div class="legrow"><canvas data-m="work" data-x="ci"></canvas><div><b>Point d'exclamation rouge</b><span>Les tests automatiques de ce dépôt échouent. Il faut y jeter un œil.</span></div></div>
    <div class="legrow"><canvas data-m="stroll" data-x="chat"></canvas><div><b>Bulle « … »</b><span>Une conversation avec Claude est liée à ce dépôt. Cliquez le personnage pour la reprendre.</span></div></div>
    <div class="legrow"><div class="ico">⭐</div><div><b>NIV et barre sous le nom</b><span>Le niveau monte avec le nombre de commits (sauvegardes de code) des 12 dernières semaines. La barre montre la progression vers le niveau suivant.</span></div></div>
    <div class="legrow"><div class="ico">📬</div><div><b>Boîte aux lettres, drapeau levé</b><span>Des propositions de modifications (pull requests) attendent une relecture.</span></div></div>
    <div class="legrow"><div class="ico">📦</div><div><b>Colis devant la maison</b><span>Un colis pour environ 3 tâches ouvertes (issues).</span></div></div>
    <div class="legrow"><div class="ico">🚩</div><div><b>Drapeau et fumée</b><span>Drapeau vert : actif cette semaine. Orange : actif ce mois-ci. Gris : endormi. Fumée et fenêtres allumées : activité très récente.</span></div></div>
    <div class="legrow"><div class="ico">🌧️</div><div><b>Nuage de pluie sur la maison</b><span>Au moins un dépôt du projet a des tests automatiques en échec.</span></div></div>
    <p class="hint">Astuces : Ctrl+K pour chercher, ← → pour passer d'un projet à l'autre, le bouton 🌗 change l'heure de la journée dans le village.</p>`);
  $$("canvas[data-m]", sh).forEach(c => miniSprite(c, c.dataset.m, c.dataset.x)); $("#goTour", sh).onclick = startTour;
}

/* --- visite guidée --- */
function startTour() {
  closeModal(); deselect(); $("#tabVillage").click();
  const steps = [
    { t: "Bienvenue dans votre village", x: "Ici, tous vos projets sont réunis. Cette visite dure une minute." },
    { sel: ".plate", t: "Une maison = un projet", x: "Au-dessus de chaque maison, une plaque affiche le nom du projet et son niveau. La barre montre la progression vers le niveau suivant." },
    { t: "Un personnage = un dépôt de code", x: "Il travaille s'il y a eu du code récemment, se promène un peu après, et dort quand rien ne bouge depuis plus de 14 jours. Survolez-en un pour voir son dernier commit." },
    { sel: ".plate", t: "Cliquez pour ouvrir", x: "Un clic sur une maison ou un personnage ouvre sa fiche : chiffres, activité, liens, conversations avec Claude et un espace pour votre prochaine étape. Les liens s'ouvrent dans un nouvel onglet." },
    { sel: "#hud", t: "Les chiffres du moment", x: "Commits de la semaine avec la tendance, projets actifs, propositions de modifications en attente et régularité." },
    { sel: "#btnResume", t: "Reprendre en un clic", x: "Ce bouton ouvre la conversation la plus récente avec Claude, pour reprendre exactement là où vous vous êtes arrêtée." },
    { sel: "#btnSearch", t: "Tout retrouver vite", x: "Cherchez un projet, un dépôt ou une conversation. Raccourci : Ctrl+K." },
    { sel: "#tabStats", t: "Les statistiques", x: "Calendrier d'activité, classement des dépôts, langages et fiches détaillées de chaque projet." },
    { sel: "#btnAdd", t: "Ajouter un projet", x: "Donnez un nom et les dépôts GitHub : la page prépare la configuration, et un chantier apparaît dans le village en attendant la mise à jour." },
    { sel: "#btnPhase", t: "L'heure du village", x: "Aube, jour, crépuscule ou nuit. En mode Auto, le village suit l'heure de votre appareil." },
    { t: "C'est parti !", x: "Vous pouvez relancer cette visite à tout moment depuis le bouton « ? » en haut à droite." },
  ];
  let i = 0; const spot = document.createElement("div"), dim = document.createElement("div"), card = document.createElement("div");
  spot.className = "spot"; dim.className = "tdim"; card.className = "tcard"; layer.append(dim, spot, card);
  const end = () => { spot.remove(); dim.remove(); card.remove(); document.removeEventListener("keydown", key, true); lsSet("rph.tour", "1"); };
  const key = e => { if (e.key === "Escape") { end(); e.stopPropagation(); } else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
  document.addEventListener("keydown", key, true);
  function go(d) { i = Math.max(0, Math.min(steps.length - 1, i + d)); show(); }
  function show() {
    const s = steps[i], el = s.sel && $(s.sel), last = i === steps.length - 1;
    card.innerHTML = `<h3>${esc(s.t)}</h3><p>${esc(s.x)}</p><div class="tnav"><div class="dots">${steps.map((_, n) => `<i class="${n === i ? "on" : ""}"></i>`).join("")}</div>${i ? '<button class="btn" id="tp">Précédent</button>' : '<button class="btn" id="ts">Passer</button>'}<button class="btn main" id="tn">${last ? "Terminer" : "Suivant"}</button></div>`;
    $("#tn", card).onclick = () => last ? end() : go(1); const p = $("#tp", card); if (p) p.onclick = () => go(-1); const sk = $("#ts", card); if (sk) sk.onclick = end;
    const W = innerWidth, H = innerHeight, cw = card.offsetWidth || 340, ch = card.offsetHeight || 160;
    if (el) { const r = el.getBoundingClientRect(), pad = 6; dim.style.display = "none"; spot.style.display = "block"; Object.assign(spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
      const below = r.bottom + ch + 24 < H, top = below ? r.bottom + 16 : Math.max(12, r.top - ch - 16); card.style.top = top + "px"; card.style.left = Math.max(12, Math.min(W - cw - 12, r.left + r.width / 2 - cw / 2)) + "px"; card.style.transform = "";
    } else { spot.style.display = "none"; dim.style.display = "block"; card.style.top = Math.max(12, H / 2 - ch / 2) + "px"; card.style.left = Math.max(12, W / 2 - cw / 2) + "px"; }
  }
  show();
}

/* --- ajouter un projet --- */
const SWATCH = ["#19c3b1", "#ff7ab6", "#ffb23f", "#8b6bff", "#4aa8ff", "#7ae25c", "#ff6b6b", "#c084fc"];
function parseRepos(txt) {
  const out = [], bad = [];
  txt.split(/[\n,;\s]+/).map(s => s.trim()).filter(Boolean).forEach(s => { const m = s.replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/+$/, "").match(/^([\w.-]+)\/([\w.-]+)$/); if (m) out.push(m[1] + "/" + m[2]); else bad.push(s); });
  return { out: [...new Set(out)], bad };
}
function fullConfig(extra) {
  const strip = p => ({ id: p.id, name: p.name, emoji: p.emoji, color: p.color, description: p.description || "", next: p.next || "", links: p.links || [], repos: p.repos.map(r => r.full) });
  return { projects: [...REAL().map(strip), ...(extra ? [extra] : [])] };
}
function openAdd(existing) {
  const sh = modal(`${shead("Ajouter un projet")}
    <p class="hint">Pour votre sécurité, cette page ne peut pas modifier vos secrets GitHub. Elle prépare la configuration, vous la collez en 3 clics, et un chantier apparaît dans le village en attendant.</p>
    <div class="row2"><div class="field"><label for="an">Emoji</label><input id="ae" class="fi" type="text" value="${esc(existing?.emoji || "🚀")}" maxlength="4"></div><div class="field"><label for="an">Nom du projet</label><input id="an" class="fi" type="text" placeholder="Ex. Mon appli de recettes" value="${esc(existing?.name || "")}"></div></div>
    <div class="field"><label for="ar">Dépôts GitHub (un par ligne : propriétaire/nom ou lien)</label><textarea id="ar" rows="3" placeholder="RomaneCano/mon-appli">${esc((existing?.wanted || []).join("\n"))}</textarea></div>
    <div class="field"><label>Couleur de la maison</label><div class="sw" id="asw">${SWATCH.map((c, n) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="Couleur ${n + 1}" aria-pressed="${(existing?.color || SWATCH[3]) === c}"></button>`).join("")}</div></div>
    <div class="field"><label for="ad">Description (facultatif)</label><input id="ad" class="fi" type="text" value="${esc(existing?.description || "")}"></div>
    <p id="aerr" class="warn" hidden></p>
    <div class="acts"><button class="btn main" id="agen">Préparer la configuration</button></div><div id="aout"></div>`);
  let color = existing?.color || SWATCH[3]; $$("#asw button", sh).forEach(b => b.onclick = () => { color = b.dataset.c; $$("#asw button", sh).forEach(x => x.setAttribute("aria-pressed", x === b)); });
  $("#agen", sh).onclick = () => {
    const name = $("#an", sh).value.trim(), { out, bad } = parseRepos($("#ar", sh).value), err = $("#aerr", sh); err.hidden = true;
    if (!name) { err.textContent = "Donnez un nom au projet."; err.hidden = false; return; }
    if (!out.length) { err.textContent = "Ajoutez au moins un dépôt au format propriétaire/nom."; err.hidden = false; return; }
    if (bad.length) { err.textContent = "Ces entrées ne sont pas valides : " + bad.join(", "); err.hidden = false; return; }
    let id = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "projet"; if (!existing) { let n = 2, b = id; while (P.some(p => p.id === id)) id = b + "-" + n++; } else id = existing.id;
    const proj = { id, name, emoji: $("#ae", sh).value.trim() || "🚀", color, description: $("#ad", sh).value.trim(), next: "", links: [], repos: out };
    const cfg = JSON.stringify(fullConfig(proj), null, 2), owners = [...new Set(out.map(r => r.split("/")[0]))], known = new Set(REAL().flatMap(p => p.repos.map(r => r.full.split("/")[0].toLowerCase())));
    const unk = owners.filter(o => !known.has(o.toLowerCase()));
    $("#aout", sh).innerHTML = `<ol class="steps"><li><span>Copiez la configuration complète</span><button class="btn" id="acopy">${ic("copy")}Copier</button></li>
      <li><span>Collez-la dans le secret <b>HUB_PROJECTS</b></span><a class="btn" ${ext(`https://github.com/${HUBREPO}/settings/secrets/actions/HUB_PROJECTS`)}>${ic("ext")}Ouvrir</a></li>
      <li><span>Lancez la mise à jour (Run workflow)</span><a class="btn" ${ext(`https://github.com/${HUBREPO}/actions/workflows/sync.yml`)}>${ic("ext")}Ouvrir</a></li></ol>
      ${unk.length ? `<p class="warn">Le propriétaire <b>${unk.map(esc).join(", ")}</b> n'est pas encore lu par le hub. Créez un token en lecture seule pour lui et ajoutez-le comme secret <b>HUB_TOKEN_${esc(unk[0].split("-")[0].toUpperCase())}</b>, puis déclarez-le dans le workflow (le README explique comment).</p>` : ""}
      <p class="hint">🚧 Un chantier a été posé dans le village en attendant la mise à jour. Vous pouvez le retirer depuis sa fiche.</p><pre class="json" id="ajson">${esc(cfg)}</pre>`;
    const copy = $("#acopy", sh); copy.onclick = async () => { try { await navigator.clipboard.writeText(cfg); copy.textContent = "Copié ✓"; } catch { const r = document.createRange(); r.selectNodeContents($("#ajson", sh)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = "Sélectionné, faites Ctrl+C"; } };
    PENDING = PENDING.filter(q => q.id !== id); PENDING.push({ id, name, emoji: proj.emoji, color, description: proj.description, repos: out }); lsSet("rph.pending", JSON.stringify(PENDING));
    const np = mkPending(PENDING[PENDING.length - 1]); prep(np); const pi = P.findIndex(p => p.id === id && p.pending); if (pi >= 0) P[pi] = np; else P.push(np); layout(); renderHud(); if (REDUCE) frame();
    $("#aout", sh).scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  $("#an", sh).focus();
}

/* ===================== STATS ===================== */
function spark(series, col) { const w = 84, h = 30, mx = Math.max(1, ...series), pts = series.map((v, i) => `${(i / (series.length - 1) * w).toFixed(1)},${(h - 3 - v / mx * (h - 6)).toFixed(1)}`).join(" ");
  return `<svg class="sp" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polygon points="0,${h} ${pts} ${w},${h}" fill="${col}" opacity=".2"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function kpi(icon, col, val, label, extra, series) { return `<div class="kpi" style="--a:${col}"><div class="bub">${ic(icon)}</div><b>${val}${extra || ""}</b><small>${label}</small>${series ? spark(series, col) : ""}</div>`; }
function stacked() {
  const R_ = REAL(), w = 560, h = 150, pad = 24, n = NW, bw = (w - pad) / n, tot = gSeries, mx = Math.max(1, ...tot), sc = (h - 20) / mx; let g = "";
  [0, .5, 1].forEach(f => { const y = h - 4 - f * (h - 20); g += `<line x1="${pad}" x2="${w}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pad - 4}" y="${y + 3}" text-anchor="end" font-size="9" fill="var(--muted)">${Math.round(mx * f)}</text>`; });
  for (let i = 0; i < n; i++) { let y = h - 4; R_.forEach(p => { const v = p.series[i] * sc; if (!v) return; y -= v; g += `<rect x="${pad + i * bw + 3}" y="${y}" width="${bw - 6}" height="${v}" rx="2" fill="${p.col}"><title>${esc(p.name)} : ${p.series[i]}</title></rect>`; });
    if (i % 2 === (n - 1) % 2) g += `<text x="${pad + i * bw + bw / 2}" y="${h + 10}" text-anchor="middle" font-size="9" fill="var(--muted)">${i === n - 1 ? "ces 7 j" : "S-" + (n - 1 - i)}</text>`; }
  return `<svg viewBox="0 0 ${w} ${h + 14}" style="width:100%;height:auto" role="img" aria-label="Commits par semaine, tous projets">${g}</svg>`;
}
function heatmap() {
  const days = Array.from({ length: 84 }, (_, i) => REAL().reduce((s, p) => s + p.days[i], 0)), mx = Math.max(1, ...days), cw = 16, gap = 3; let c = "";
  days.forEach((v, i) => { const col = Math.floor(i / 7), row = i % 7, lvl = v === 0 ? 0 : Math.ceil(v / mx * 4), d = new Date(Date.now() - (83 - i) * DAY).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    c += `<rect x="${col * (cw + gap)}" y="${row * (cw + gap)}" width="${cw}" height="${cw}" rx="4" fill="${lvl ? "var(--violet)" : "var(--bg2)"}" fill-opacity="${lvl ? .25 + lvl * .19 : 1}"><title>${d} : ${v} commit(s)</title></rect>`; });
  return `<div style="overflow-x:auto"><svg viewBox="0 0 ${12 * (cw + gap)} ${7 * (cw + gap)}" style="min-width:420px;width:100%;height:auto" role="img" aria-label="Calendrier d'activité sur 12 semaines">${c}</svg></div><p class="hint">Chaque case est un jour (les plus anciens à gauche). Plus c'est foncé, plus il y a eu de commits.</p>`;
}
const LCOL = ["#8b6bff", "#ff7a9c", "#ffc857", "#46e6a8", "#4aa8ff", "#ff9f6b", "#c084fc", "#7ae25c"];
function renderStats() {
  const all = REAL().flatMap(p => p.repos.map(r => ({ ...r, p }))), top = [...all].sort((a, b) => b.c7 - a.c7).slice(0, 8), mx = Math.max(1, top[0]?.c7 || 1);
  const lg = {}; all.forEach(r => { const l = r.language || "Autre"; lg[l] = (lg[l] || 0) + 1; }); const lgs = Object.entries(lg).sort((a, b) => b[1] - a[1]);
  const prs = REAL().reduce((s, p) => s + p.prs, 0), iss = REAL().reduce((s, p) => s + p.issues, 0), conv = SESS().length;
  $("#sv").innerHTML = `<div class="wrap">
    <div class="kpis">${kpi("commit", "var(--gold)", G7, "commits sur 7 jours", trendHTML(G7, GPREV), gSeries)}${kpi("pulse", "var(--mint)", `${nActive}/${REAL().length}`, "projets actifs")}${kpi("repo", "var(--violet)", all.length, "dépôts suivis")}
      ${kpi("pr", "var(--coral)", prs, "propositions en attente")}${kpi("box", "var(--warn)", iss, "tâches ouvertes")}${kpi("chat", "var(--violet)", conv, "conversations liées")}${kpi("flame", "var(--coral)", streak, "semaines d'affilée")}</div>
    <div class="g2"><section class="panel"><h2>Commits par semaine</h2>${stacked()}<div class="legend">${REAL().map(p => `<span><i style="background:${p.col}"></i>${esc(p.name)}</span>`).join("")}</div></section>
      <section class="panel"><h2>Calendrier d'activité</h2>${heatmap()}</section></div>
    <div class="g2"><section class="panel"><h2>Dépôts les plus actifs cette semaine</h2><div class="bars">${top.map(r => `<div class="bar"><span class="n" title="${esc(r.name)}">${esc(r.name)}</span><span class="tr"><b style="width:${r.c7 / mx * 100}%;background:${r.p.col}"></b></span><span class="v">${r.c7}</span></div>`).join("")}</div></section>
      <section class="panel"><h2>Langages (par dépôt)</h2><div class="langs">${lgs.map(([l, n], i) => `<span title="${esc(l)} : ${n}" style="width:${n / all.length * 100}%;background:${LCOL[i % LCOL.length]}"></span>`).join("")}</div><div class="legend">${lgs.map(([l, n], i) => `<span><i style="background:${LCOL[i % LCOL.length]}"></i>${esc(l)} · ${n}</span>`).join("")}</div></section></div>
    <div class="cards">${REAL().map(projCard).join("")}</div></div>`;
  $$("[data-go]", $("#sv")).forEach(b => b.onclick = () => { $("#tabVillage").click(); select(P.find(p => p.id === b.dataset.go), null); });
}
function projCard(p) {
  const s = p.sessions[0];
  return `<article class="pc" style="--c:${p.col}"><header><div style="display:flex;gap:12px;align-items:center;min-width:0">${emb(p, 42)}<div style="min-width:0"><h2>${esc(p.name)}</h2><span class="pill" style="--pc:${STCOL[p.status]}"><span class="st s-${p.status}"></span>${STATUS[p.status]} · NIV ${p.lvl}</span></div></div><button class="btn" data-go="${esc(p.id)}">Voir au village</button></header>
    <p class="hint" style="margin:0">${esc(p.description)}</p>
    <div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">${tile(rel(p.pushed), "Dernière activité")}${tile(`${p.c7} ${trendHTML(p.c7, p.prev7)}`, "Commits sur 7 jours")}${tile(`${p.prs} · ${p.issues}`, "PR · tâches")}${tile(fdate(p.created), "Créé le")}</div>
    <div class="spark">${bars(p.series, p.col)}</div>
    <div class="acts">${s ? `<a class="btn main" ${ext(s.url)}>${ic("chat")}Reprendre</a>` : ""}${p.sites.map(u => `<a class="btn" ${ext(u)}>${ic("ext")}Site</a>`).join("")}${p.repos[0] ? `<a class="btn" ${ext(p.repos[0].url)}>${ic("repo")}${esc(p.repos[0].name)}</a>` : ""}</div>
    <details><summary class="hint" style="cursor:pointer">Dépôts (${p.repos.length})</summary><div class="tbl"><table><thead><tr><th>Dépôt</th><th>Activité</th><th>Tests</th><th>PR · tâches</th><th>Dernier commit</th></tr></thead><tbody>
      ${p.repos.map(r => `<tr><td><a ${ext(r.url)}>${esc(r.name)}</a>${r.private ? " 🔒" : ""}${r.error ? `<div class="ko">Erreur de lecture</div>` : ""}</td><td class="n">${rel(r.pushed)}</td><td>${r.ci ? `<a class="${r.ci.status === "success" ? "ok" : r.ci.status === "failure" ? "ko" : ""}" ${ext(r.ci.url)}>${r.ci.status === "success" ? "●" : r.ci.status === "failure" ? "✕" : "◐"}</a>` : "○"}</td><td class="n">${r.prs ?? 0} · ${r.issues ?? 0}</td><td class="m">${esc(r.recent?.[0]?.msg || "—")}</td></tr>`).join("")}</tbody></table></div></details></article>`;
}

/* ===================== VUES & ÉVÉNEMENTS ===================== */
function showView(v) {
  const vil = v === "village"; $("#vv").hidden = !vil; $("#sv").hidden = vil; $("#tabVillage").setAttribute("aria-pressed", vil); $("#tabStats").setAttribute("aria-pressed", !vil);
  document.documentElement.style.setProperty("--x", 0); try { history.replaceState(null, "", "#" + v); } catch {}
  if (vil) { layout(); frame(); } else renderStats();
}
$("#tabVillage").onclick = () => showView("village"); $("#tabStats").onclick = () => showView("stats"); $("#brand").onclick = () => { showView("village"); deselect(); };
$("#btnResume").onclick = () => { const s = SESS()[0]; if (s) openLink(s.url); else { const r = REAL()[0]?.repos[0]; if (r) openLink(r.url); } };
$("#btnResume").title = (() => { const s = SESS()[0]; return s ? `Reprendre : ${s.title} (${s.p.name}, ${rel(s.date)})` : "Ouvrir le dépôt le plus récent"; })();
$("#btnAdd").onclick = () => openAdd(); $("#btnSearch").onclick = openSearch; $("#btnHelp").onclick = openHelp; $("#btnGuide").onclick = openHelp;
$("#btnPhase").onclick = () => { PHASE = PHASES[(PHASES.indexOf(PHASE) + 1) % PHASES.length]; lsSet("rph.phase", PHASE); phaseBtn(); frame(); };
$("#btnTheme").onclick = () => { THEME = THEME === "auto" ? "dark" : THEME === "dark" ? "light" : "auto"; lsSet("rph.theme", THEME); applyTheme(); $("#btnTheme").title = "Thème de l'interface : " + { auto: "automatique", dark: "sombre", light: "clair" }[THEME]; };
$("#btnOut").onclick = () => { try { const r = indexedDB.deleteDatabase("rph"); r.onsuccess = r.onerror = r.onblocked = () => location.reload(); } catch { location.reload(); } };
document.addEventListener("keydown", e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
  else if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
  else if (e.key === "Escape") { if ($(".modal", layer)) closeModal(); else if (SEL) deselect(); }
  else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !typing && !$(".modal", layer) && !$("#vv").hidden && !$(".tcard", layer)) { const i = SEL ? P.indexOf(SEL.p) : -1; select(P[(i + (e.key === "ArrowRight" ? 1 : -1) + P.length) % P.length], null); }
});
new ResizeObserver(() => { if (!$("#vv").hidden) { layout(); frame(); } }).observe(stage);
renderHud();
showView(location.hash === "#stats" ? "stats" : "village");
if (!REDUCE) rafId = requestAnimationFrame(loop);
if (lsGet("rph.tour", "") !== "1") setTimeout(() => { if (!$(".modal", layer)) startTour(); }, 2200);
