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
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>', users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3 3 0 0 1 0 6M18 14.5c1.8.8 3 2.6 3 5.5"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>',
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
  rings: ["............", ".....p......", "....ppp.....", ".....p......", "............", "..ggg.ggg...", ".g...g...g..", ".g...g...g..", ".g...g...g..", "..ggg.ggg...", "............", "............"],
  clap: ["............", ".wwkkwwkkww.", ".kkwwkkwwkk.", "............", ".kkkkkkkkkk.", ".kkgkkkkkkk.", ".kkggkkkkkk.", ".kkgggkkkkk.", ".kkggkkkkkk.", ".kkgkkkkkkk.", ".kkkkkkkkkk.", "............"],
  house: ["............", ".....rr.....", "....rrrr....", "...rrrrrr...", "..rrrrrrrr..", ".rrrrrrrrrr.", "..wwwwwwww..", "..wwggwwww..", "..wwggwkkw..", "..wwwwwkkw..", "..wwwwwkkw..", "............"],
  rocket: ["............", ".....kk.....", "....kwwk....", "....kwwk....", "....kbbk....", "...kkwwkk...", "...kwwwwk...", "..rkwwwwkr..", "..r..gg..r..", ".....gg.....", "............", "............"],
  heart: ["............", "..rr....rr..", ".rrrr..rrrr.", ".rwrrrrrrrr.", ".rrrrrrrrrr.", "..rrrrrrrr..", "...rrrrrr...", "....rrrr....", ".....rr.....", "............", "............", "............"],
  star: ["............", ".....gg.....", "....gggg....", "gggggggggggg", ".gggggggggg.", "..gggggggg..", "..gggggggg..", ".gggg..gggg.", ".ggg....ggg.", "............", "............", "............"],
  book: ["............", "............", ".bbbbbbbbbb.", ".bwwwwwwwwb.", ".bwkkkkkkwb.", ".bwwwwwwwwb.", ".bwkkkkkwwb.", ".bwwwwwwwwb.", ".bbbbbbbbbb.", "............", "............", "............"],
  camera: ["............", "....kkkk....", ".kkkkkkkkkk.", ".kwwkkkkkkk.", ".kkkkbbkkkk.", ".kkkbwwbkkk.", ".kkkbwwbkkk.", ".kkkkbbkkkk.", ".kkkkkkkkkk.", "............", "............", "............"],
  code: ["............", ".bbbbbbbbbb.", ".bkkkkkkkkb.", ".bkgkkkkkkb.", ".bkkgkkwwkb.", ".bkgkkkkkkb.", ".bkkkkkkkkb.", ".bbbbbbbbbb.", "....bbbb....", "...bbbbbb...", "............", "............"],
  shop: ["............", ".rwrwrwrwrw.", ".rwrwrwrwrw.", "..wwwwwwww..", "..wkkwwbbw..", "..wkkwwbbw..", "..wkkwwwww..", "..wwwwwwww..", "............", "............", "............", "............"],
  music: ["............", "....bbbbbb..", "....bwwwwb..", "....b....b..", "....b....b..", "....b....b..", "..bbb..bbb..", ".bbbb.bbbb..", "..bb...bb...", "............", "............", "............"],
};
const EMBNAME = { medic: "Santé", rings: "Mariage", clap: "Cinéma", house: "Maison", rocket: "Fusée", heart: "Cœur", star: "Étoile", book: "Livre", camera: "Photo", code: "Code", shop: "Boutique", music: "Musique" };
const EMBCOL = { w: "#ffffff", r: "#ff5a6e", k: "#3b3475", g: "#ffc857", p: "#ff7ab6", b: "#4aa8ff", n: "#46e6a8" };
const embKey = p => {
  if (p.logo === "initial") return null; if (p.logo && EMB[p.logo]) return p.logo;
  const s = (p.id + " " + p.name).toLowerCase();
  return /care|sant[eé]|m[eé]dic|health/.test(s) ? "medic" : /mariage|wedding|noces/.test(s) ? "rings" : /cin[eé]|film|movie/.test(s) ? "clap" : null;
};
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
const lower = s => String(s || "").toLowerCase();
const zeros = n => Array(n).fill(0);
const NW = D.weeks;
const P = [...D.projects].sort((a, b) => (b.pushed || "").localeCompare(a.pushed || ""));
P.forEach(p => { p.repos.sort((a, b) => (b.pushed || "").localeCompare(a.pushed || "")); });
// modifications faites sur cet appareil (nom, logo, couleur…) : appliquées tout de suite, exportables dans la configuration
let EDITS = {}; try { EDITS = JSON.parse(lsGet("rph.edits", "{}")); } catch {}
const saveEdits = () => lsSet("rph.edits", JSON.stringify(EDITS));
function applyEdit(p) { if (!p.orig) p.orig = { name: p.name, color: p.color, logo: p.logo, description: p.description }; Object.assign(p, p.orig); const e = EDITS[p.id]; if (e) { if (e.name) p.name = e.name; if (e.color) p.color = e.color; if (e.logo) p.logo = e.logo; if (e.description !== undefined) p.description = e.description; } }
// qui contribue : moi, équipe, externe ou agent IA
let LOCALTEAM = []; try { LOCALTEAM = JSON.parse(lsGet("rph.team", "[]")); } catch {}
const ME = new Set((D.me || []).map(lower));
const KIND = { me: "Moi", team: "Équipe", ext: "Externe", ia: "Agent IA" };
function kindOf(a, p) {
  if (a.bot) return "ia";
  const ks = [lower(a.login), lower(a.name)].filter(Boolean);
  if (ks.some(x => ME.has(x))) return "me";
  const team = new Set([...(D.team || []), ...(p.team || []), ...LOCALTEAM].map(lower));
  return ks.some(x => team.has(x)) ? "team" : "ext";
}
const sum = (arr, n, off = 0) => (arr || []).slice(Math.max(0, 84 - n - off), 84 - off).reduce((s, v) => s + v, 0);
function mergeAuthors(list) {
  const m = new Map();
  list.forEach(a => { const key = lower(a.login || a.name), e = m.get(key); if (!e) m.set(key, { ...a, days: [...(a.days || zeros(84))] }); else { e.n += a.n; if (a.last > e.last) e.last = a.last; if (!e.avatar && a.avatar) e.avatar = a.avatar; (a.days || []).forEach((v, i) => { e.days[i] += v; }); } });
  return [...m.values()].sort((x, y) => y.n - x.n);
}
// période des statistiques
let PERIOD = +lsGet("rph.period", "7"); if (![7, 30, 84].includes(PERIOD)) PERIOD = 7;
const PLABEL = { 7: "7 jours", 30: "30 jours", 84: "12 semaines" };
const cP = d => sum(d, PERIOD), cPrev = d => PERIOD * 2 <= 84 ? sum(d, PERIOD, PERIOD) : null;
function prep(p) {
  applyEdit(p);
  p.col = tune(p.color || "#8b6bff");
  const h = hex2hsl(p.col); p.roof = hsl2hex((h[0] + 22) % 360, h[1] * .8, .32);
  p.total = p.series.reduce((a, b) => a + b, 0);
  p.lvl = 1 + Math.floor(Math.sqrt(p.total));
  p.xp = p.pending ? 0 : (p.total - (p.lvl - 1) ** 2) / (p.lvl ** 2 - (p.lvl - 1) ** 2);
  p.ciFail = p.repos.filter(r => r.ci?.status === "failure").length;
  p.days = Array.from({ length: 84 }, (_, i) => p.repos.reduce((s, r) => s + ((r.days && r.days[i]) || 0), 0));
  p.authors = mergeAuthors(p.repos.flatMap(r => r.authors || [])).map(a => ({ ...a, kind: kindOf(a, p) }));
  p.exts = p.authors.filter(a => a.kind === "ext");
  p.pulls = p.repos.flatMap(r => (r.pulls || []).map(x => ({ ...x, repo: r.name, full: r.full }))).sort((a, b) => a.created.localeCompare(b.created));
  p.issuesL = p.repos.flatMap(r => (r.issuesList || []).map(x => ({ ...x, repo: r.name, full: r.full }))).sort((a, b) => b.updated.localeCompare(a.updated));
}
// projets ajoutés depuis la page, en attente du prochain rafraîchissement
let PENDING = []; try { PENDING = JSON.parse(lsGet("rph.pending", "[]")); } catch {}
PENDING = PENDING.filter(q => !P.some(p => p.id === q.id));
lsSet("rph.pending", JSON.stringify(PENDING));
const mkPending = q => ({ id: q.id, name: q.name, emoji: q.emoji, color: q.color, logo: q.logo, description: q.description || "", repos: [], wanted: q.repos, pending: true, status: "pending",
  series: zeros(NW), c7: 0, c30: 0, issues: 0, prs: 0, sites: [], sessions: [], pushed: null, created: null, links: [] });
PENDING.forEach(q => P.push(mkPending(q)));
P.forEach(prep);
const REAL = () => P.filter(p => !p.pending);
const SESS = () => REAL().flatMap(p => p.sessions.map(s => ({ ...s, p }))).sort((a, b) => b.date.localeCompare(a.date));
const gSeries = Array.from({ length: NW }, (_, i) => REAL().reduce((s, p) => s + p.series[i], 0));
const streak = (() => { let n = 0; for (let i = NW - 1; i >= 0 && gSeries[i] > 0; i--) n++; return n; })();
const nActive = REAL().filter(p => p.status === "active").length;
const trendPct = (a, b) => b ? Math.round((a - b) / b * 100) : (a ? 100 : 0);
const trendHTML = (a, b) => { if (b == null) return ""; const t = trendPct(a, b); return t === 0 ? "" : `<span class="tr ${t > 0 ? "up" : "down"}">${t > 0 ? "▲" : "▼"} ${Math.abs(t)}%</span>`; };
const HUBREPO = (() => { const m = location.hostname.match(/^([^.]+)\.github\.io$/), r = location.pathname.split("/")[1]; return m && r ? `${m[1]}/${r}` : "RomaneCano/project-hub"; })();
// conversation principale : choisie sur l'appareil > définie dans la configuration > la plus active > la plus récente
function mainOf(p) {
  const loc = lsGet("rph.main." + p.id, ""), url = loc || p.main || p.mainAuto || p.sessions[0]?.url; if (!url) return null;
  const s = p.sessions.find(x => x.url === url);
  return { url, title: s?.title, n: s?.n, src: loc ? "choisie sur cet appareil" : p.main ? "définie dans la configuration" : p.mainAuto === url ? "détectée : la plus active" : "la plus récente" };
}
const parseRepos = txt => {   // accepte liens, « owner/nom », commandes git clone, adresses SSH…
  const out = [], bad = [], seen = new Set();
  txt.split(/[\s,;"'<>()]+/).filter(Boolean).forEach(tok => {
    if (/^(git|clone|-.*|https?:|ssh:)$/i.test(tok)) return;
    const t = tok.replace(/^git@github\.com:/i, "").replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
    const m = t.match(/^([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[\/?#].*)?$/);
    if (m && !/^\.+$/.test(m[2])) { const f = m[1] + "/" + m[2]; if (!seen.has(f.toLowerCase())) { seen.add(f.toLowerCase()); out.push(f); } } else if (/github\.com|\//.test(tok)) bad.push(tok);
  });
  return { out, bad };
};

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
  <button class="tb primary" id="btnConvs" title="Conversations principales de chaque projet">${ic("chat")}<span>Conversations</span></button>
  <button class="tb" id="btnInbox" title="Demandes en attente : propositions et tâches">${ic("pr")}<span>Demandes</span><i class="badge2" id="inboxN" hidden></i></button>
  <button class="tb" id="btnAdd">${ic("plus")}<span>Projet</span></button>
  <button class="tb ico" id="btnSearch" aria-label="Rechercher (Ctrl+K)" title="Rechercher (Ctrl+K)">${ic("search")}</button>
  <button class="tb ico" id="btnPhase"></button>
  <button class="tb ico" id="btnTheme" aria-label="Thème de l'interface" title="Thème de l'interface">${ic("palette")}</button>
  <button class="tb ico" id="btnHelp" aria-label="Aide et tutoriel" title="Aide et tutoriel">${ic("help")}</button>
  <button class="tb ico" id="btnOut" aria-label="Se déconnecter" title="Se déconnecter de cet appareil">${ic("out")}</button>`;
$("#per").innerHTML = `<span class="pl">Période</span>` + [[7, "7 j"], [30, "30 j"], [84, "12 sem."]].map(([n, l]) => `<button data-p="${n}" aria-pressed="${n === PERIOD}" title="Statistiques sur ${PLABEL[n]}">${l}</button>`).join("");
function phaseBtn() { const b = $("#btnPhase"); b.innerHTML = ic(PHICON[PHASE === "auto" ? curPhase() : PHASE]); b.title = b.ariaLabel = "Ambiance du village : " + PHN[PHASE]; }
phaseBtn();
$("#helpfab").innerHTML = `<button class="tb" id="btnGuide">${ic("help")}<span>Comment lire le village ?</span></button>`;

/* ---------- HUD ---------- */
function chip(icon, col, val, label, extra = "", title = "", act = "") { const tag = act ? "button" : "div"; return `<${tag} class="chip" ${act ? `data-act="${act}"` : ""} style="--a:${col}" title="${esc(title)}"><div class="bub">${ic(icon)}</div><div><b>${val}${extra}</b><small>${label}</small></div></${tag}>`; }
const gDays = () => Array.from({ length: 84 }, (_, i) => REAL().reduce((s, p) => s + p.days[i], 0));
function extHumans() { const m = new Map(); REAL().forEach(p => p.exts.forEach(a => { const k = lower(a.login || a.name), e = m.get(k); if (!e) m.set(k, { ...a, projects: [p.name], c: sum(a.days, PERIOD) }); else { e.projects.push(p.name); e.c += sum(a.days, PERIOD); } })); return [...m.values()]; }
function renderHud() {
  const gd = gDays(), cur = cP(gd), prv = cPrev(gd), prs = REAL().reduce((s, p) => s + p.prs, 0), ex = extHumans().length;
  $("#hud").innerHTML = chip("commit", "var(--gold)", cur, `commits sur ${PLABEL[PERIOD]}`, trendHTML(cur, prv), "Sauvegardes de code sur la période choisie, comparées à la période précédente")
    + chip("pulse", "var(--mint)", `${nActive}<small style="display:inline;font-size:13px">/${REAL().length}</small>`, "projets actifs", "", "Projets modifiés ces 7 derniers jours")
    + chip("pr", "var(--coral)", prs, "demandes à traiter", "", "Propositions de modifications (pull requests) en attente. Cliquez pour répondre.", "inbox")
    + chip("users", "var(--mint)", ex, ex > 1 ? "collaborateurs externes" : "collaborateur externe", "", "Personnes extérieures à votre équipe qui ont contribué ces 12 dernières semaines", "contrib")
    + chip("flame", "var(--violet)", streak, "semaines d'affilée", "", "Semaines consécutives avec au moins un commit");
  const n = $("#inboxN"); n.textContent = prs; n.hidden = !prs;
  $$("#hud [data-act]").forEach(b => b.onclick = () => b.dataset.act === "inbox" ? openInbox() : openContrib());
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
    (p.exts || []).slice(0, 3).forEach(a => {
      const rnd = mulberry(hashStr("v" + (a.login || a.name))), age = ageDays(a.last);
      chars.push({ p, pi, r: { name: a.name || a.login, ci: null, sessions: [], pushed: a.last, full: "v:" + (a.login || a.name) }, vis: a, rnd, mode: age < 2 ? "work" : "stroll", x: 14 + rnd() * (PW - 28), y: hy0() + rnd() * (PH - hy0() - 10), tx: 14 + rnd() * (PW - 28), ty: hy0() + rnd() * (PH - hy0() - 10),
        skin: ["#f5c9a0", "#e0a97a", "#b9784a", "#8a5a3a"][Math.floor(rnd() * 4)], hair: ["#2b1d12", "#6b3f1d", "#d6a73a", "#222"][Math.floor(rnd() * 4)], tone: 0, pause: rnd() * 30, f: Math.floor(rnd() * 20), dir: 1, moving: false, hop: 0 });
    });
  });
  buildPlates();
}
const hy0 = () => hz + 14 + 24;

function buildPlates() {
  $("#plates").innerHTML = plots.map(pl => {
    const p = pl.p, left = (pl.ox + pl.cx) * k, top = (pl.oy + pl.hy - 58) * k, m = mainOf(p), nx = p.exts.length;
    return `<div class="plw" style="left:${left}px;top:${top}px;animation-delay:${REDUCE ? 0 : 350 + pl.i * 160}ms">
      ${p.prs > 0 ? `<button class="plmini plreq" data-req="${esc(p.id)}" title="${p.prs} proposition(s) en attente : cliquer pour répondre" aria-label="Répondre aux ${p.prs} demandes de ${esc(p.name)}">${ic("pr")}<b>${p.prs}</b></button>` : ""}
      <button class="plate${SEL && SEL.p === p && !SEL.r ? " sel" : ""}" data-id="${esc(p.id)}" style="--c:${p.col};max-width:${PW * k * .94}px" aria-label="Projet ${esc(p.name)}, niveau ${p.lvl}">
        <span class="row"><span class="st s-${p.status}"></span>${emb(p, 20)}<span class="nm">${esc(p.name)}</span><span class="lv">NIV ${p.lvl}</span></span>
        ${p.pending ? '<span class="pend">EN CONSTRUCTION</span>' : `<i class="xp"><b style="width:${Math.round(p.xp * 100)}%"></b></i>`}
        ${nx ? `<span class="xt" title="Collaborateurs externes sur ce projet">👥 ${nx} externe${nx > 1 ? "s" : ""}</span>` : ""}</button>
      ${m ? `<a class="plmini plchat" ${ext(m.url)} title="Conversation principale de ${esc(p.name)}" aria-label="Ouvrir la conversation principale de ${esc(p.name)}">${ic("chat")}</a>` : ""}</div>`;
  }).join("");
  $$(".plate").forEach(b => b.onclick = () => select(P.find(p => p.id === b.dataset.id), null));
  $$(".plreq").forEach(b => b.onclick = () => openInbox(b.dataset.req, "pr"));
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
  const X = Math.round(c.x), Y = Math.round(c.y) - Math.round(Math.abs(Math.sin(c.hop / 3)) * (c.hop > 0 ? 6 : 0)), body = c.vis ? "#ff9f43" : shade(c.p.col, c.tone);
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
  if (c.vis) { const hy = c.mode === "sleep" ? 11 : 14; R(X - 3, Y - hy, 7, 2, "#ffd84a"); R(X - 2, Y - hy - 1, 5, 1, "#ffd84a"); }
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
  if (c) return { p: c.p, r: c.vis || c.p.pending ? null : c.r, c };
  if (!pl.p.pending && lx > pl.hx - 28 && lx < pl.hx - 14 && ly > pl.hy - 5 && ly < pl.hy + 15) return { p: pl.p, inbox: "pr" };
  if (!pl.p.pending && pl.p.issues > 0 && lx > pl.hx + pl.hw + 4 && lx < pl.hx + pl.hw + 28 && ly > pl.hy - 14 && ly < pl.hy + 5) return { p: pl.p, inbox: "is" };
  if (lx > pl.hx - 4 && lx < pl.hx + pl.hw + 4 && ly > pl.hy - 58 && ly < pl.hy + 4) return { p: pl.p, r: null };
  return null;
}
cv.onpointermove = e => {
  const m = cpos(e), h = hit(m); cv.style.cursor = h ? "pointer" : "default";
  if (!h) { tip.style.display = "none"; return; }
  tip.innerHTML = h.inbox ? `<b>${h.inbox === "pr" ? "Boîte aux lettres" : "Colis à traiter"}</b>${h.inbox === "pr" ? h.p.prs + " proposition(s) en attente" : h.p.issues + " tâche(s) ouverte(s)"}<small>Cliquez pour répondre</small>` : h.c?.vis ? `<b>${esc(h.c.vis.name || h.c.vis.login)}</b>Collaborateur externe · ${sum(h.c.vis.days, PERIOD)} commit(s) sur ${PLABEL[PERIOD]}` : h.r ? `<b>${esc(h.r.name)}</b>${esc(MODE[h.c?.mode] || "")} · ${rel(h.r.pushed)}<small>${esc(h.r.recent?.[0]?.msg || "")}</small>` : `<b>${esc(h.p.name)}</b>${h.p.pending ? "En construction" : `${h.p.repos.length} dépôt(s) · ${rel(h.p.pushed)}`}`;
  tip.style.display = "block"; tip.style.left = Math.min(m.px + 14, $("#vv").clientWidth - 270) + "px"; tip.style.top = m.py + 16 + "px";
};
cv.onpointerleave = () => { tip.style.display = "none"; };
cv.onclick = e => { const h = hit(cpos(e)); if (!h) { if (SEL) deselect(); return; } if (h.inbox) { openInbox(h.p.id, h.inbox); return; } if (h.c) h.c.hop = 12; select(h.p, h.r); if (h.c?.vis) setTimeout(() => { const c = $("#contrib"); if (c) c.scrollIntoView({ block: "start" }); }, 60); };
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
  if (a < 1) b.push("⚡ Actif aujourd'hui"); if (sum(p.days, 7) >= 100) b.push("🔥 En feu"); if (p.ciFail) b.push(`🚨 ${p.ciFail} dépôt(s) avec tests en échec`);
  if (!p.prs && !p.issues && !p.pending) b.push("✨ Rien en attente"); if (p.sessions.length >= 5) b.push("💬 Beaucoup de conversations");
  if (p.series.filter(v => v > 0).length >= 8) b.push("🏅 Régulier"); if (a > 30) b.push("😴 Endormi depuis un moment"); if (p.exts.length) b.push(`👥 ${p.exts.length} collaborateur${p.exts.length > 1 ? "s" : ""} externe${p.exts.length > 1 ? "s" : ""}`);
  return b.map(x => `<span class="badge">${x}</span>`).join("");
}
const tile = (v, l) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`;
const av = a => { const nm = a.name || a.login || "?", ini = nm.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase() || "?"; return `<span class="av" style="--bg:${a.avatar ? `url('${esc(a.avatar)}')` : "none"}"><i>${esc(ini)}</i></span>`; };
function contribHTML(authors, p, title) {
  const rows = authors.map(a => ({ ...a, k: a.kind || kindOf(a, p), c: sum(a.days, PERIOD) })).filter(a => a.c > 0).sort((x, y) => y.c - x.c);
  const tot = rows.reduce((s, a) => s + a.c, 0), ex = rows.filter(a => a.k === "ext"), ec = ex.reduce((s, a) => s + a.c, 0);
  const msg = !tot ? `Aucun commit sur ${PLABEL[PERIOD]}.` : ex.length ? `🧑‍🤝‍🧑 <b>Alimenté par ${ex.length} collaborateur${ex.length > 1 ? "s" : ""} externe${ex.length > 1 ? "s" : ""}</b> : ${Math.round(ec / tot * 100)} % des commits sur ${PLABEL[PERIOD]}.` : `✅ Aucun collaborateur externe sur ${PLABEL[PERIOD]}.`;
  return `<section id="contrib"><h3>${title || "Qui contribue ?"}</h3><p class="hint ${ex.length ? "extmsg" : ""}">${msg}</p>
    <ul class="list">${rows.slice(0, 8).map(a => { const key = esc(lower(a.login || a.name)); return `<li class="two"><div class="who">${av(a)}<span class="t"><b>${esc(a.name || a.login)}</b><small>${a.c} commit${a.c > 1 ? "s" : ""} · ${rel(a.last)}</small></span><span class="kind k-${a.k}">${KIND[a.k]}</span></div>${a.k === "ext" ? `<button class="mini" data-team="${key}" title="Compter cette personne dans votre équipe">C'est l'équipe</button>` : LOCALTEAM.includes(lower(a.login || a.name)) ? `<button class="mini" data-unteam="${key}">Retirer de l'équipe</button>` : ""}</li>`; }).join("")}</ul>
    <p class="hint">« Externe » : ni vous, ni votre équipe, ni un robot. Classement d'après les commits des 12 dernières semaines.</p></section>`;
}
const reqRow = (x, kind) => `<li><a ${ext(x.url)}><span class="t"><b>${kind === "pr" ? "🔀" : "📌"} ${esc(x.title)}</b><small>${esc(x.repo)}#${x.n} · par ${esc(x.by || "?")} · ${kind === "pr" ? "attend depuis " + esc(rel(x.created).replace("il y a ", "")) : "maj " + esc(rel(x.updated))}${x.draft ? " · brouillon" : ""}${x.reviewers?.some(r => ME.has(lower(r))) ? " · <b class=\"warnt\">votre avis est demandé</b>" : ""}</small></span>${ic("ext")}</a></li>`;
function reqBlock(p, pulls, issues, nPR, nIS) {
  const has = pulls.length || issues.length;
  return `<section><h3>Demandes en attente</h3>${has ? `<ul class="list">${pulls.slice(0, 4).map(x => reqRow(x, "pr")).join("")}${issues.slice(0, 3).map(x => reqRow(x, "is")).join("")}</ul>` : '<p class="hint">Rien en attente. 🎉</p>'}
    ${nPR + nIS ? `<button class="btn main" data-inbox="${esc(p.id)}">Tout voir et répondre (${nPR} proposition${nPR > 1 ? "s" : ""} · ${nIS} tâche${nIS > 1 ? "s" : ""})</button>` : ""}</section>`;
}
function mainBlock(p) {
  const m = mainOf(p), loc = lsGet("rph.main." + p.id, "");
  return `<section class="mainc" id="mainc"><h3>Conversation principale</h3>
    ${m ? `<a class="btn main big" ${ext(m.url)}>${ic("chat")}<span><b>Ouvrir la conversation principale</b><small>${m.title ? "Dernier travail : " + esc(m.title) : "Conversation Claude"} · ${esc(m.src)}${m.n ? ` · ${m.n} commit${m.n > 1 ? "s" : ""}` : ""}</small></span></a>` : '<p class="hint">Aucune conversation principale pour le moment. Collez le lien de la conversation Claude de ce projet ci-dessous.</p>'}
    <details ${m ? "" : "open"}><summary class="hint" style="cursor:pointer">Choisir ou changer</summary><div class="field" style="margin-top:8px"><input id="mainurl" class="fi" type="text" placeholder="https://claude.ai/code/session_…" value="${esc(loc)}">
      <div class="acts"><button class="btn" id="mainsave">Enregistrer</button>${loc ? '<button class="btn" id="mainreset">Revenir à l\'automatique</button>' : ""}<button class="btn" id="mainperm">Rendre permanent</button></div><p class="hint" id="mainmsg">Enregistré sur cet appareil. Vous pouvez aussi cliquer « ☆ Principale » sur une conversation de la liste plus bas.</p></div></details></section>`;
}
function convList(p) {
  const m = mainOf(p);
  return `<h3>Conversations avec Claude (${p.sessions.length})</h3>${p.sessions.length ? `<ul class="list">${p.sessions.map(s => `<li class="two"><a ${ext(s.url)}><span class="t"><b>${esc(s.title)}</b><small>${esc(s.repo)} · ${rel(s.date)}${s.n ? ` · ${s.n} commit${s.n > 1 ? "s" : ""}` : ""}</small></span>${ic("ext")}</a><button class="mini" data-setmain="${esc(s.url)}">${m?.url === s.url ? "★ Principale" : "☆ Principale"}</button></li>`).join("")}</ul>` : '<p class="hint">Aucune trouvée dans les commits des 12 dernières semaines.</p>'}`;
}
function projHTML(p) {
  const main = p.repos[0], noteV = lsGet("rph.note." + p.id, p.next || ""), cur = cP(p.days);
  return `<div class="dh"><div class="dt">${emb(p, 46)}<div style="min-width:0"><h2>${esc(p.name)}</h2><span class="pill" style="--pc:${STCOL[p.status]}"><span class="st s-${p.status}"></span>${STATUS[p.status]} · Niveau ${p.lvl}</span></div></div><div class="dbtn"><button class="x" id="dedit" aria-label="Modifier le projet" title="Modifier le nom, le logo, les dépôts">${ic("edit")}</button><button class="x" id="dx" aria-label="Fermer">${ic("close")}</button></div></div>
  <p class="hint">${esc(p.description)}</p>
  ${mainBlock(p)}
  <div class="tiles">${tile(rel(p.pushed), "Dernière activité")}${tile(`${cur} ${trendHTML(cur, cPrev(p.days))}`, `Commits sur ${PLABEL[PERIOD]}`)}${tile(`${p.prs} · ${p.issues}`, "Propositions · tâches")}${tile(fdate(p.created), "Créé le")}</div>
  <div class="spark"><h3>Activité, 12 dernières semaines</h3>${bars(p.series, p.col)}</div>
  <div class="badges">${badgesOf(p)}</div>
  <div class="acts">${main ? `<a class="btn" ${ext(main.url)}>${ic("repo")}${esc(main.name)}</a>` : ""}${p.sites.map(u => `<a class="btn" ${ext(u)}>${ic("ext")}Ouvrir le site</a>`).join("")}${(p.links || []).map(l => `<a class="btn" ${ext(l.url)}>${esc(l.label)}</a>`).join("")}</div>
  ${reqBlock(p, p.pulls, p.issuesL, p.prs, p.issues)}
  ${contribHTML(p.authors, p)}
  <div class="field"><label for="note">Ma prochaine étape (enregistrée sur cet appareil)</label><textarea id="note" rows="3" placeholder="Ex. finir la page de paiement, relancer un client…">${esc(noteV)}</textarea></div>
  <h3>Dépôts de code (${p.repos.length})</h3><ul class="list">${p.repos.map(r => { const nx = (r.authors || []).filter(a => kindOf(a, p) === "ext").length; return `<li><button data-r="${esc(r.full)}"><span class="st s-${ageDays(r.pushed) < 7 ? "active" : ageDays(r.pushed) < 30 ? "recent" : "dormant"}"></span><span class="t"><b>${esc(r.name)}${nx ? ` <span class="xt">👥 ${nx}</span>` : ""}</b><small>${rel(r.pushed)} · ${esc(r.recent?.[0]?.msg || "—")}</small></span></button></li>`; }).join("")}</ul>
  ${convList(p)}`;
}
function repoHTML(p, r) {
  const c = chars.find(c => c.r === r), cur = cP(r.days), m = mainOf(p);
  const au = (r.authors || []).map(a => ({ ...a, kind: kindOf(a, p) }));
  return `<div class="dh"><div class="dt">${emb(p, 46)}<div style="min-width:0"><h2>${esc(r.name)}</h2><span class="pill" style="--pc:${STCOL[ageDays(r.pushed) < 7 ? "active" : ageDays(r.pushed) < 30 ? "recent" : "dormant"]}">${esc(MODE[c?.mode] || "")} · ${esc(p.name)}</span></div></div><div class="dbtn"><button class="x" id="dx" aria-label="Fermer">${ic("close")}</button></div></div>
  <p class="hint">${esc(r.description || "Dépôt de code du projet " + p.name)}</p>
  <div class="tiles">${tile(rel(r.pushed), "Dernière activité")}${tile(`${cur} ${trendHTML(cur, cPrev(r.days))}`, `Commits sur ${PLABEL[PERIOD]}`)}${tile(`${r.prs ?? 0} · ${r.issues ?? 0}`, "Propositions · tâches")}${tile(esc(r.language || "—"), "Langage principal")}</div>
  <div class="spark"><h3>Activité, 12 dernières semaines</h3>${bars(r.series, p.col)}</div>
  <div class="badges"><span class="badge ${r.ci?.status === "failure" ? "ko" : ""}">${r.ci ? (r.ci.status === "success" ? "✅ Tests automatiques OK" : r.ci.status === "failure" ? "❗ Tests automatiques en échec" : "⏳ Tests en cours") : "Pas de tests automatiques"}</span>${r.private ? '<span class="badge">🔒 Privé</span>' : '<span class="badge">🌍 Public</span>'}</div>
  <div class="acts">${m ? `<a class="btn main" ${ext(m.url)}>${ic("chat")}Conversation principale</a>` : ""}<a class="btn ${m ? "" : "main"}" ${ext(r.url)}>${ic("repo")}Ouvrir le dépôt</a>${r.site ? `<a class="btn" ${ext(r.site)}>${ic("ext")}Site</a>` : ""}${r.ci?.url ? `<a class="btn" ${ext(r.ci.url)}>Tests</a>` : ""}</div>
  ${reqBlock(p, (r.pulls || []).map(x => ({ ...x, repo: r.name })), (r.issuesList || []).map(x => ({ ...x, repo: r.name })), r.prs ?? 0, r.issues ?? 0)}
  ${contribHTML(au, p, "Qui contribue à ce dépôt ?")}
  <h3>Derniers commits</h3><ul class="list">${(r.recent || []).map(mm => `<li><a ${ext(mm.url)}><span class="t"><b>${esc(mm.msg)}</b><small>${esc(mm.author)} · ${rel(mm.date)}</small></span></a></li>`).join("") || '<li><span class="hint">Aucun commit récent.</span></li>'}</ul>
  <button class="btn" data-back>← Retour à ${esc(p.name)}</button>`;
}
function pendingHTML(p) {
  return `<div class="dh"><div class="dt">${emb(p, 46)}<div style="min-width:0"><h2>${esc(p.name)}</h2><span class="pill" style="--pc:var(--violet)">🚧 En construction</span></div></div><div class="dbtn"><button class="x" id="dx" aria-label="Fermer">${ic("close")}</button></div></div>
  <p class="hint">Ce projet a été ajouté depuis cette page, mais ses données ne sont pas encore lues. Pour que la maison soit terminée :</p>
  <ol class="steps"><li><span>Copiez la nouvelle configuration (bouton « Revoir les étapes »).</span></li><li><span>Collez-la dans le secret <b>HUB_PROJECTS</b> sur GitHub.</span></li><li><span>Lancez « Run workflow » : le village se met à jour en 1 à 2 minutes.</span></li></ol>
  <p class="hint">Dépôts prévus : ${(p.wanted || []).map(esc).join(", ") || "—"}</p>
  <div class="acts"><button class="btn main" id="reopenAdd">${ic("plus")}Revoir les étapes</button><button class="btn" data-rm="${esc(p.id)}">Retirer ce chantier</button></div>`;
}
function renderDrawer() {
  const d = $("#drawer"); if (!SEL) { d.hidden = true; return; }
  const { p, r } = SEL; d.hidden = false; d.style.setProperty("--c", p.col); const keep = d.scrollTop;
  d.innerHTML = p.pending ? pendingHTML(p) : r ? repoHTML(p, r) : projHTML(p); d.scrollTop = keep;
  $("#dx", d).onclick = deselect;
  const ed = $("#dedit", d); if (ed) ed.onclick = () => openEdit(p);
  $$("[data-r]", d).forEach(b => b.onclick = () => { const rr = p.repos.find(x => x.full === b.dataset.r); const c = chars.find(c => c.r === rr); if (c) c.hop = 12; select(p, rr); });
  $$("[data-back]", d).forEach(b => b.onclick = () => select(p, null));
  const note = $("#note", d); if (note) note.oninput = () => lsSet("rph.note." + p.id, note.value);
  $$("[data-rm]", d).forEach(b => b.onclick = () => { PENDING = PENDING.filter(q => q.id !== b.dataset.rm); lsSet("rph.pending", JSON.stringify(PENDING)); const i = P.findIndex(x => x.id === b.dataset.rm); if (i >= 0) P.splice(i, 1); SEL = null; d.hidden = true; layout(); renderHud(); });
  $$("[data-inbox]", d).forEach(b => b.onclick = () => openInbox(b.dataset.inbox, "pr"));
  $$("[data-team]", d).forEach(b => b.onclick = () => { if (!LOCALTEAM.includes(b.dataset.team)) LOCALTEAM.push(b.dataset.team); lsSet("rph.team", JSON.stringify(LOCALTEAM)); reclassify(); });
  $$("[data-unteam]", d).forEach(b => b.onclick = () => { LOCALTEAM = LOCALTEAM.filter(x => x !== b.dataset.unteam); lsSet("rph.team", JSON.stringify(LOCALTEAM)); reclassify(); });
  const ms = $("#mainsave", d);
  if (ms) {
    ms.onclick = () => { const v = $("#mainurl", d).value.trim(); if (v && !/^https?:\/\//i.test(v)) { $("#mainmsg", d).textContent = "Collez un lien complet, qui commence par https://"; return; } lsSet("rph.main." + p.id, v); refreshAll(); };
    const mr = $("#mainreset", d); if (mr) mr.onclick = () => { lsSet("rph.main." + p.id, ""); refreshAll(); };
    $("#mainperm", d).onclick = () => openConfig("Votre conversation principale est enregistrée sur cet appareil. Pour la retrouver partout, mettez à jour la configuration :");
  }
  $$("[data-setmain]", d).forEach(b => b.onclick = () => { lsSet("rph.main." + p.id, b.dataset.setmain); refreshAll(); });
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
    ...REAL().flatMap(p => p.pulls.map(x => ({ k: "q", t: x.title, s: "Proposition · " + x.repo + "#" + x.n, url: x.url, p, h: x.title + " " + x.repo + " proposition demande pr" }))),
    ...SESS().map(s => ({ k: "s", t: s.title, s: "Conversation · " + s.p.name, url: s.url, p: s.p, h: s.title + " " + s.p.name + " conversation" }))];
  const sh = modal(`${shead("Rechercher")}<input id="q" class="fi" type="text" placeholder="Un projet, un dépôt, une conversation…" autocomplete="off"><div class="sr" id="sr" role="listbox"></div><p class="hint">↑ ↓ pour naviguer, Entrée pour ouvrir, Échap pour fermer.</p>`);
  const q = $("#q", sh), box = $("#sr", sh); let on = 0, list = [];
  const IC2 = { p: "🏠", r: "🧑‍💻", s: "💬", q: "🔀" };
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
    <div class="legrow"><div class="ico">🦺</div><div><b>Visiteur au gilet orange et casque jaune</b><span>Un collaborateur externe a contribué au code de ce projet. Survolez-le pour voir son nom.</span></div></div>
    <div class="legrow"><div class="ico">💬</div><div><b>Bouton de conversation à droite de la plaque</b><span>Ouvre directement la conversation principale du projet. Vous la choisissez dans la fiche du projet.</span></div></div>
    <div class="legrow"><div class="ico">🔀</div><div><b>Bouton rose à gauche de la plaque</b><span>Nombre de propositions de modifications en attente. Cliquez pour les ouvrir et y répondre. La boîte aux lettres et les colis sont aussi cliquables.</span></div></div>
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
    { sel: ".plchat", t: "Sa conversation principale", x: "Le bouton à droite de la plaque ouvre en un clic la conversation principale du projet, pas la dernière de n'importe quel agent. Vous la choisissez dans la fiche du projet." },
    { sel: ".plreq", t: "Les demandes en attente", x: "Le bouton à gauche indique les propositions de modifications qui attendent une réponse. Un clic les liste, un second ouvre la demande sur GitHub pour y répondre." },
    { t: "Un personnage = un dépôt de code", x: "Il travaille s'il y a eu du code récemment, se promène un peu après, et dort quand rien ne bouge depuis plus de 14 jours. Un visiteur au gilet orange est un collaborateur externe." },
    { sel: ".plate", t: "Cliquez pour ouvrir", x: "Un clic sur une maison ou un personnage ouvre sa fiche : conversation principale, demandes, qui contribue, activité, liens et vos notes. Les liens s'ouvrent dans un nouvel onglet. Le crayon permet de changer le nom et le logo." },
    { sel: "#hud", t: "Les chiffres du moment", x: "Commits, projets actifs, demandes à traiter et collaborateurs externes. Les deux derniers sont cliquables." },
    { sel: "#per", t: "Choisir la période", x: "7 jours, 30 jours ou 12 semaines : les chiffres, les statistiques et le classement s'adaptent." },
    { sel: "#btnConvs", t: "Toutes les conversations", x: "La conversation principale de chaque projet, et les dernières de tous les agents, en un seul endroit." },
    { sel: "#btnSearch", t: "Tout retrouver vite", x: "Cherchez un projet, un dépôt, une proposition ou une conversation. Raccourci : Ctrl+K." },
    { sel: "#tabStats", t: "Les statistiques", x: "Calendrier d'activité, classement des dépôts, qui alimente chaque projet, langages et fiches détaillées." },
    { sel: "#btnAdd", t: "Ajouter un projet", x: "Choisissez vos dépôts dans une liste ou collez un lien : la page prépare la configuration, et un chantier apparaît dans le village." },
    { t: "C'est parti !", x: "Vous pouvez relancer cette visite à tout moment depuis le bouton « ? » en haut à droite." },
  ];
  let i = 0; const spot = document.createElement("div"), dim = document.createElement("div"), card = document.createElement("div");
  spot.className = "spot"; dim.className = "tdim"; card.className = "tcard"; layer.append(dim, spot, card);
  const end = () => { spot.remove(); dim.remove(); card.remove(); document.removeEventListener("keydown", key, true); lsSet("rph.tour", "1"); };
  const key = e => { if (e.key === "Escape") { end(); e.stopPropagation(); } else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
  document.addEventListener("keydown", key, true);
  function go(d) { i = Math.max(0, Math.min(steps.length - 1, i + d)); show(); }
  function show() {
    while (steps[i].sel && !$(steps[i].sel) && i < steps.length - 1) i++;
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

/* --- demandes en attente --- */
function openInbox(pid = "all", tab = "pr") {
  const st = { pid, tab, old: true }, sh = modal(`<div id="inb"></div>`), box = $("#inb", sh);
  const draw = () => {
    const ps = REAL().filter(p => st.pid === "all" || p.id === st.pid), totPR = REAL().reduce((s, p) => s + p.prs, 0), totIS = REAL().reduce((s, p) => s + p.issues, 0);
    const items = ps.flatMap(p => (st.tab === "pr" ? p.pulls : p.issuesL).map(x => ({ ...x, p })));
    items.sort((a, b) => st.tab === "pr" ? (st.old ? a.created.localeCompare(b.created) : b.created.localeCompare(a.created)) : b.updated.localeCompare(a.updated));
    const total = ps.reduce((s, p) => s + (st.tab === "pr" ? p.prs : p.issues), 0), hidden = Math.max(0, total - items.length);
    box.innerHTML = `${shead("Demandes en attente")}
      <p class="hint">Cliquez une demande : elle s'ouvre sur GitHub dans un nouvel onglet, où vous pouvez répondre, relire ou fusionner.</p>
      <div class="seg" role="group"><button data-t="pr" aria-pressed="${st.tab === "pr"}">Propositions (${totPR})</button><button data-t="is" aria-pressed="${st.tab === "is"}">Tâches (${totIS})</button></div>
      <div class="chips2"><button data-pid="all" aria-pressed="${st.pid === "all"}">Tous</button>${REAL().map(p => `<button data-pid="${esc(p.id)}" aria-pressed="${st.pid === p.id}">${emb(p, 16)}${esc(p.name)} <b>${st.tab === "pr" ? p.prs : p.issues}</b></button>`).join("")}</div>
      ${st.tab === "pr" ? `<div><button class="mini" id="isort">${st.old ? "Les plus anciennes d'abord" : "Les plus récentes d'abord"} ⇅</button></div>` : ""}
      <ul class="list">${items.map(x => `<li><a ${ext(x.url)} style="--c:${x.p.col}">${emb(x.p, 22)}<span class="t"><b>${st.tab === "pr" ? "🔀" : "📌"} ${esc(x.title)}</b><small>${esc(x.repo)}#${x.n} · par ${esc(x.by || "?")} · ${st.tab === "pr" ? "attend depuis " + esc(rel(x.created).replace("il y a ", "")) : "maj " + esc(rel(x.updated))}${x.draft ? " · brouillon" : ""}${x.reviewers?.some(r => ME.has(lower(r))) ? ' · <b class="warnt">votre avis est demandé</b>' : ""}${x.comments ? ` · ${x.comments} commentaire(s)` : ""}</small></span>${ic("ext")}</a></li>`).join("") || '<li><span class="hint">Rien en attente ici. 🎉</span></li>'}</ul>
      ${hidden ? `<p class="hint">${hidden} autre(s) non listée(s) ici (seules ${st.tab === "pr" ? "les 15 plus anciennes propositions" : "les 15 tâches les plus récentes"} de chaque dépôt sont chargées). Tout voir sur GitHub : ${ps.flatMap(p => p.repos).filter(r => (st.tab === "pr" ? r.prs : r.issues) > 0).map(r => `<a ${ext(r.url + (st.tab === "pr" ? "/pulls" : "/issues"))}>${esc(r.name)}</a>`).join(", ")}.</p>` : ""}`;
    $("[data-close]", box).onclick = closeModal;
    $$("[data-t]", box).forEach(b => b.onclick = () => { st.tab = b.dataset.t; draw(); });
    $$("[data-pid]", box).forEach(b => b.onclick = () => { st.pid = b.dataset.pid; draw(); });
    const so = $("#isort", box); if (so) so.onclick = () => { st.old = !st.old; draw(); };
  };
  draw();
}

/* --- collaborateurs externes --- */
function reclassify() { P.forEach(prep); layout(); refreshAll(); if (REDUCE) frame(); }
function openContrib() {
  const ex = extHumans().sort((a, b) => b.c - a.c);
  const sh = modal(`${shead("Collaborateurs externes")}
    <p class="hint">Personnes qui ne sont ni vous, ni dans votre équipe, ni des robots, et qui ont écrit du code ces 12 dernières semaines. Les commits indiqués couvrent ${PLABEL[PERIOD]}.</p>
    ${ex.length ? `<ul class="list">${ex.map(a => `<li class="two"><div class="who">${av(a)}<span class="t"><b>${esc(a.name || a.login)}</b><small>${a.c} commit${a.c > 1 ? "s" : ""} sur ${PLABEL[PERIOD]} · ${esc([...new Set(a.projects)].join(", "))} · ${rel(a.last)}</small></span></div><button class="mini" data-team="${esc(lower(a.login || a.name))}">C'est l'équipe</button></li>`).join("")}</ul>` : '<p class="warn" style="--w:var(--mint)">✅ Aucun collaborateur externe détecté : tout est écrit par vous, votre équipe ou des robots.</p>'}
    <div class="acts"><button class="btn" id="cperm">Rendre l'équipe permanente</button></div>`);
  $$("[data-team]", sh).forEach(b => b.onclick = () => { if (!LOCALTEAM.includes(b.dataset.team)) LOCALTEAM.push(b.dataset.team); lsSet("rph.team", JSON.stringify(LOCALTEAM)); reclassify(); openContrib(); });
  $("#cperm", sh).onclick = () => openConfig("Les personnes marquées « équipe » sont enregistrées sur cet appareil. Pour les garder partout :");
}

/* --- conversations --- */
function openConvs() {
  const sh = modal(`${shead("Conversations")}
    <h3>Principale de chaque projet</h3>
    <ul class="list">${REAL().map(p => { const m = mainOf(p), inner = `${emb(p, 26)}<span class="t"><b>${esc(p.name)}</b><small>${m ? esc((m.title || "Conversation Claude") + " · " + m.src) : "Aucune conversation principale : cliquez pour en choisir une"}</small></span>${m ? ic("ext") : ""}`;
      return `<li class="two">${m ? `<a ${ext(m.url)} style="--c:${p.col}">${inner}</a>` : `<button data-def="${esc(p.id)}" style="--c:${p.col}">${inner}</button>`}<button class="mini" data-def="${esc(p.id)}">Changer</button></li>`; }).join("")}</ul>
    <h3>Dernières conversations, tous agents</h3>
    <ul class="list">${SESS().slice(0, 6).map(s => `<li><a ${ext(s.url)} style="--c:${s.p.col}">${emb(s.p, 22)}<span class="t"><b>${esc(s.title)}</b><small>${esc(s.p.name)} · ${rel(s.date)}</small></span>${ic("ext")}</a></li>`).join("") || '<li><span class="hint">Aucune conversation détectée.</span></li>'}</ul>`);
  $$("[data-def]", sh).forEach(b => b.onclick = () => { closeModal(); $("#tabVillage").click(); select(P.find(p => p.id === b.dataset.def), null); setTimeout(() => { const m = $("#mainc"); if (m) { m.scrollIntoView({ block: "start" }); const dt = $("details", m); if (dt) dt.open = true; } }, 60); });
}

/* --- configuration (rendre permanent) --- */
function fullConfig(extra) {
  const team = [...new Set([...(D.team || []), ...LOCALTEAM])];
  const strip = p => { const e = EDITS[p.id] || {}, o = { id: p.id, name: p.name, emoji: p.emoji || "🚀", color: p.color, description: p.description || "", next: p.next || "", links: p.links || [], repos: e.repos || p.repos.map(r => r.full) };
    if (p.logo) o.logo = p.logo; const mn = lsGet("rph.main." + p.id, "") || p.main; if (mn) o.main = mn; if (p.team?.length) o.team = p.team; return o; };
  const pend = PENDING.filter(q => q.id !== extra?.id).map(q => ({ id: q.id, name: q.name, emoji: q.emoji || "🚀", color: q.color, description: q.description || "", next: "", links: [], repos: q.repos, ...(q.logo ? { logo: q.logo } : {}) }));
  return { ...(D.me?.length ? { me: D.me } : {}), ...(team.length ? { team } : {}), projects: [...REAL().map(strip), ...pend, ...(extra ? [extra] : [])] };
}
const stepsHTML = (cfg, unk = []) => `<ol class="steps"><li><span>Copiez la configuration complète</span><button class="btn" id="acopy">${ic("copy")}Copier</button></li>
  <li><span>Collez-la dans le secret <b>HUB_PROJECTS</b></span><a class="btn" ${ext(`https://github.com/${HUBREPO}/settings/secrets/actions/HUB_PROJECTS`)}>${ic("ext")}Ouvrir</a></li>
  <li><span>Lancez la mise à jour (Run workflow)</span><a class="btn" ${ext(`https://github.com/${HUBREPO}/actions/workflows/sync.yml`)}>${ic("ext")}Ouvrir</a></li></ol>
  ${unk.length ? `<p class="warn">Le propriétaire <b>${unk.map(esc).join(", ")}</b> n'est pas encore lu par le hub. Créez un token en lecture seule pour lui et ajoutez-le comme secret <b>HUB_TOKEN_${esc(unk[0].split("-")[0].toUpperCase())}</b>, puis déclarez-le dans le workflow (le README explique comment).</p>` : ""}
  <pre class="json" id="ajson">${esc(cfg)}</pre>`;
function bindSteps(sh, cfg) {
  const copy = $("#acopy", sh); if (!copy) return;
  copy.onclick = async () => { try { await navigator.clipboard.writeText(cfg); copy.textContent = "Copié ✓"; } catch { const r = document.createRange(); r.selectNodeContents($("#ajson", sh)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = "Sélectionné, faites Ctrl+C"; } };
}
function openConfig(intro) {
  const cfg = JSON.stringify(fullConfig(), null, 2);
  const sh = modal(`${shead("Rendre permanent")}<p class="hint">${esc(intro || "Ces réglages sont enregistrés sur cet appareil. Pour les garder partout, mettez à jour la configuration :")}</p>${stepsHTML(cfg)}`); bindSteps(sh, cfg);
}

/* --- choix des dépôts : liste, collage de liens, puces --- */
function repoPicker(host, initial, selfId) {
  let sel = [...initial]; const cat = D.catalog || [], owner = new Map();
  REAL().forEach(p => p.repos.forEach(r => owner.set(lower(r.full), p)));
  host.innerHTML = `<div class="rchips" id="rpc"></div>
    <input id="rpi" class="fi" type="text" autocomplete="off" placeholder="Collez un lien, « propriétaire/nom » ou une commande git clone, puis Entrée">
    <p class="hint" id="rpe" role="status"></p>
    ${cat.length ? `<details open><summary class="hint" style="cursor:pointer">Choisir dans mes dépôts (${cat.length})</summary><input id="rps" class="fi" type="text" placeholder="Filtrer la liste…" style="margin:8px 0"><div class="rplist" id="rpl"></div></details>` : '<p class="hint">Astuce : après la prochaine mise à jour, la liste de tous vos dépôts apparaîtra ici pour choisir d\'un clic.</p>'}`;
  const chips = $("#rpc", host), err = $("#rpe", host), inp = $("#rpi", host), has = f => sel.some(x => lower(x) === lower(f));
  function drawChips() {
    chips.innerHTML = sel.map(f => `<span class="rchip" title="${esc(f)}">${esc(f.split("/")[0])}/<b>${esc(f.split("/")[1])}</b><button type="button" data-x="${esc(f)}" aria-label="Retirer ${esc(f)}">×</button></span>`).join("") || '<span class="hint">Aucun dépôt choisi pour l\'instant.</span>';
    $$("[data-x]", chips).forEach(b => b.onclick = () => { sel = sel.filter(x => x !== b.dataset.x); drawChips(); drawList(); });
  }
  function add(txt) { const { out, bad } = parseRepos(txt); let n = 0; out.forEach(f => { if (!has(f)) { sel.push(f); n++; } }); err.textContent = bad.length ? "Non reconnu : " + bad.join(", ") : out.length && !n ? "Déjà dans la liste." : ""; drawChips(); drawList(); return n; }
  inp.addEventListener("paste", e => { const t = (e.clipboardData || window.clipboardData)?.getData("text"); if (t) { e.preventDefault(); add(t); inp.value = ""; } });
  inp.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(inp.value); inp.value = ""; } });
  inp.addEventListener("blur", () => { if (inp.value.trim()) { add(inp.value); inp.value = ""; } });
  function drawList() {
    const l = $("#rpl", host); if (!l) return; const q = lower($("#rps", host).value);
    l.innerHTML = cat.filter(r => !r.archived && (!q || lower(r.full + " " + r.desc).includes(q))).slice(0, 80).map(r => { const on = has(r.full), o = owner.get(lower(r.full)), dis = o && o.id !== selfId;
      return `<button type="button" class="rp${on ? " on" : ""}" data-f="${esc(r.full)}" ${dis ? "disabled" : ""}><span class="rpm">${on ? "✓" : "+"}</span><span class="t"><b>${esc(r.full)}</b><small>${r.private ? "🔒 " : ""}${esc(r.desc || r.language || "")}${dis ? " · déjà dans " + esc(o.name) : ""}</small></span></button>`; }).join("") || '<p class="hint">Aucun dépôt ne correspond.</p>';
    $$("[data-f]", l).forEach(b => b.onclick = () => { const f = b.dataset.f; sel = has(f) ? sel.filter(x => lower(x) !== lower(f)) : [...sel, f]; drawChips(); drawList(); });
  }
  const rs = $("#rps", host); if (rs) rs.oninput = drawList;
  drawChips(); drawList();
  return { get: () => { if (inp.value.trim()) { add(inp.value); inp.value = ""; } return sel; } };
}

/* --- formulaire projet (ajout et modification) --- */
const SWATCH = ["#19c3b1", "#ff7ab6", "#ffb23f", "#8b6bff", "#4aa8ff", "#7ae25c", "#ff6b6b", "#c084fc"];
const LOGOS = ["initial", ...Object.keys(EMB)];
const formHTML = init => `<div class="field"><label for="fn">Nom du projet</label><input id="fn" class="fi" type="text" value="${esc(init.name || "")}" placeholder="Ex. Mon appli de recettes" maxlength="60"></div>
  <div class="field"><label>Logo</label><div class="logos" id="flogos"></div></div>
  <div class="field"><label>Couleur de la maison</label><div class="sw" id="fsw"></div></div>
  <div class="field"><label for="fd">Description (facultatif)</label><input id="fd" class="fi" type="text" value="${esc(init.description || "")}"></div>
  <div class="field"><label>Dépôts GitHub du projet</label><div id="frepos"></div></div>`;
function bindForm(sh, init, selfId, repos) {
  let color = init.color || SWATCH[3], logo = init.logo || "initial";
  const drawLogos = () => { $("#flogos", sh).innerHTML = LOGOS.map(kk => `<button type="button" data-l="${kk}" aria-pressed="${kk === logo}" title="${kk === "initial" ? "Initiale" : EMBNAME[kk]}">${emb({ id: "x", name: $("#fn", sh).value || "?", col: tune(color), logo: kk }, 34)}<span>${kk === "initial" ? "Initiale" : EMBNAME[kk]}</span></button>`).join("");
    $$("[data-l]", sh).forEach(b => b.onclick = () => { logo = b.dataset.l; drawLogos(); }); };
  const drawSw = () => { const all = SWATCH.includes(color) ? SWATCH : [color, ...SWATCH]; $("#fsw", sh).innerHTML = all.map((c, n) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="Couleur ${n + 1}" aria-pressed="${c === color}"></button>`).join("");
    $$("[data-c]", sh).forEach(b => b.onclick = () => { color = b.dataset.c; drawSw(); drawLogos(); }); };
  drawLogos(); drawSw(); $("#fn", sh).addEventListener("input", drawLogos);
  const picker = repoPicker($("#frepos", sh), repos, selfId);
  return { values: () => ({ name: $("#fn", sh).value.trim(), color, logo, description: $("#fd", sh).value.trim(), repos: picker.get() }) };
}
function openAdd(existing) {
  const init = existing ? { id: existing.id, name: existing.name, color: existing.orig?.color || existing.color, logo: existing.logo, description: existing.description } : {};
  const sh = modal(`${shead(existing ? "Revoir l'ajout du projet" : "Ajouter un projet")}
    <p class="hint">Pour votre sécurité, cette page ne peut pas modifier vos secrets GitHub. Elle prépare la configuration, vous la collez en 3 clics, et un chantier apparaît dans le village en attendant.</p>
    ${formHTML(init)}<p id="aerr" class="warn" hidden></p><div class="acts"><button class="btn main" id="agen">Préparer la configuration</button></div><div id="aout"></div>`);
  const F = bindForm(sh, init, existing?.id, existing?.wanted || []);
  $("#agen", sh).onclick = () => {
    const v = F.values(), err = $("#aerr", sh); err.hidden = true;
    if (!v.name) { err.textContent = "Donnez un nom au projet."; err.hidden = false; return; }
    if (!v.repos.length) { err.textContent = "Ajoutez au moins un dépôt (choisissez-en un dans la liste ou collez un lien)."; err.hidden = false; return; }
    let id = existing?.id || v.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "projet";
    if (!existing) { let n = 2; const b = id; while (P.some(p => p.id === id)) id = b + "-" + n++; }
    const proj = { id, name: v.name, emoji: "🚀", color: v.color, logo: v.logo, description: v.description, next: "", links: [], repos: v.repos };
    const cfg = JSON.stringify(fullConfig(proj), null, 2), known = new Set(REAL().flatMap(p => p.repos.map(r => r.full.split("/")[0].toLowerCase())));
    const unk = [...new Set(v.repos.map(r => r.split("/")[0]))].filter(o => !known.has(o.toLowerCase()));
    $("#aout", sh).innerHTML = `${stepsHTML(cfg, unk)}<p class="hint">🚧 Un chantier a été posé dans le village en attendant la mise à jour. Vous pouvez le retirer depuis sa fiche.</p>`; bindSteps(sh, cfg);
    PENDING = PENDING.filter(q => q.id !== id); PENDING.push({ id, name: v.name, emoji: "🚀", color: v.color, logo: v.logo, description: v.description, repos: v.repos }); lsSet("rph.pending", JSON.stringify(PENDING));
    const np = mkPending(PENDING[PENDING.length - 1]); prep(np); const pi = P.findIndex(p => p.id === id && p.pending); if (pi >= 0) P[pi] = np; else P.push(np); layout(); renderHud(); if (REDUCE) frame();
    $("#aout", sh).scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  $("#fn", sh).focus();
}
function openEdit(p) {
  const o = p.orig, auto = embKey({ id: p.id, name: o.name, logo: o.logo }) || "initial", init = { id: p.id, name: p.name, color: p.color, logo: embKey(p) || "initial", description: p.description || "" };
  const repos0 = EDITS[p.id]?.repos || p.repos.map(r => r.full);
  const sh = modal(`${shead("Modifier le projet")}
    <p class="hint">Le nom, le logo et la couleur changent tout de suite sur cet appareil. La liste des dépôts, elle, se met à jour au prochain rafraîchissement. Pour tout garder partout, mettez ensuite la configuration à jour.</p>
    ${formHTML(init)}<p id="aerr" class="warn" hidden></p><div class="acts"><button class="btn main" id="esave">Enregistrer</button><button class="btn" id="ereset">Rétablir l'original</button></div><div id="aout"></div>`);
  const F = bindForm(sh, init, p.id, repos0);
  $("#esave", sh).onclick = () => {
    const v = F.values(), err = $("#aerr", sh); err.hidden = true;
    if (!v.name) { err.textContent = "Le nom ne peut pas être vide."; err.hidden = false; return; }
    if (!v.repos.length) { err.textContent = "Un projet doit garder au moins un dépôt."; err.hidden = false; return; }
    const e = {}; if (v.name !== o.name) e.name = v.name; if (v.color !== o.color) e.color = v.color; if (v.logo !== auto) e.logo = v.logo; if (v.description !== (o.description || "")) e.description = v.description;
    const r0 = p.repos.map(r => r.full); if (JSON.stringify([...v.repos].map(lower).sort()) !== JSON.stringify([...r0].map(lower).sort())) e.repos = v.repos;
    if (Object.keys(e).length) EDITS[p.id] = e; else delete EDITS[p.id]; saveEdits(); reclassify();
    const cfg = JSON.stringify(fullConfig(), null, 2);
    $("#aout", sh).innerHTML = `<p class="hint">✅ Enregistré sur cet appareil.${e.repos ? " Les dépôts ajoutés ou retirés apparaîtront après la mise à jour de la configuration." : ""}</p>${stepsHTML(cfg)}`; bindSteps(sh, cfg);
    $("#aout", sh).scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  $("#ereset", sh).onclick = () => { delete EDITS[p.id]; saveEdits(); reclassify(); closeModal(); };
}

/* ===================== STATS ===================== */
function spark(series, col) { const w = 84, h = 30, mx = Math.max(1, ...series), pts = series.map((v, i) => `${(i / (series.length - 1) * w).toFixed(1)},${(h - 3 - v / mx * (h - 6)).toFixed(1)}`).join(" ");
  return `<svg class="sp" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polygon points="0,${h} ${pts} ${w},${h}" fill="${col}" opacity=".2"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function kpi(icon, col, val, label, extra, series) { return `<div class="kpi" style="--a:${col}"><div class="bub">${ic(icon)}</div><b>${val}${extra || ""}</b><small>${label}</small>${series ? spark(series, col) : ""}</div>`; }
function stacked() {
  const RP = REAL(), daily = PERIOD <= 30, n = daily ? PERIOD : 12, w = 560, h = 150, pad = 24, bw = (w - pad) / n;
  const val = (p, i) => daily ? p.days[84 - n + i] : sum(p.days, 7, (n - 1 - i) * 7);
  const tot = Array.from({ length: n }, (_, i) => RP.reduce((s, p) => s + val(p, i), 0)), mx = Math.max(1, ...tot), sc = (h - 20) / mx; let g = "";
  [0, .5, 1].forEach(f => { const y = h - 4 - f * (h - 20); g += `<line x1="${pad}" x2="${w}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pad - 4}" y="${y + 3}" text-anchor="end" font-size="9" fill="var(--muted)">${Math.round(mx * f)}</text>`; });
  for (let i = 0; i < n; i++) {
    let y = h - 4; RP.forEach(p => { const v = val(p, i) * sc; if (!v) return; y -= v; g += `<rect x="${pad + i * bw + (daily && n > 14 ? 1 : 3)}" y="${y}" width="${Math.max(1, bw - (daily && n > 14 ? 2 : 6))}" height="${v}" rx="${daily && n > 14 ? 1 : 2}" fill="${p.col}"><title>${esc(p.name)} : ${val(p, i)}</title></rect>`; });
    const back = n - 1 - i, show = daily ? back % (n > 14 ? 5 : 1) === 0 : back % 2 === 0;
    if (show) g += `<text x="${pad + i * bw + bw / 2}" y="${h + 10}" text-anchor="middle" font-size="9" fill="var(--muted)">${back === 0 ? (daily ? "auj." : "ces 7 j") : daily ? new Date(Date.now() - back * DAY).getDate() : "S-" + back}</text>`;
  }
  return `<svg viewBox="0 0 ${w} ${h + 14}" style="width:100%;height:auto" role="img" aria-label="Commits par ${daily ? "jour" : "semaine"}, tous projets">${g}</svg>`;
}
function heatmap() {
  const days = gDays(), mx = Math.max(1, ...days), cw = 16, gap = 3; let c = "";
  days.forEach((v, i) => { const col = Math.floor(i / 7), row = i % 7, lvl = v === 0 ? 0 : Math.ceil(v / mx * 4), inP = i >= 84 - PERIOD, d = new Date(Date.now() - (83 - i) * DAY).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    c += `<rect x="${col * (cw + gap)}" y="${row * (cw + gap)}" width="${cw}" height="${cw}" rx="4" fill="${lvl ? "var(--violet)" : "var(--bg2)"}" fill-opacity="${(lvl ? .25 + lvl * .19 : 1) * (inP ? 1 : .3)}"><title>${d} : ${v} commit(s)</title></rect>`; });
  return `<div style="overflow-x:auto"><svg viewBox="0 0 ${12 * (cw + gap)} ${7 * (cw + gap)}" style="min-width:420px;width:100%;height:auto" role="img" aria-label="Calendrier d'activité sur 12 semaines">${c}</svg></div><p class="hint">Chaque case est un jour (les plus anciens à gauche). Les cases pâles sont hors de la période choisie.</p>`;
}
const LCOL = ["#8b6bff", "#ff7a9c", "#ffc857", "#46e6a8", "#4aa8ff", "#ff9f6b", "#c084fc", "#7ae25c"], KCOL = { me: "var(--violet)", team: "var(--mint)", ext: "var(--ext)", ia: "#8d8ab8" };
function whoBar(p) {
  const c = { me: 0, team: 0, ext: 0, ia: 0 }; p.authors.forEach(a => { c[a.kind] += sum(a.days, PERIOD); }); const t = Object.values(c).reduce((s, v) => s + v, 0);
  return `<div class="bar2"><span class="n">${emb(p, 18)} ${esc(p.name)}</span>${t ? `<span class="tr2">${Object.entries(c).filter(([, v]) => v).map(([k, v]) => `<b title="${KIND[k]} : ${v} commit(s)" style="width:${v / t * 100}%;background:${KCOL[k]}"></b>`).join("")}</span>` : '<span class="hint">aucun commit</span>'}<span class="v">${p.exts.length ? `👥 ${p.exts.length}` : "—"}</span></div>`;
}
function renderStats() {
  const all = REAL().flatMap(p => p.repos.map(r => ({ ...r, p }))), top = [...all].sort((a, b) => cP(b.days) - cP(a.days)).slice(0, 8), mx = Math.max(1, cP(top[0]?.days) || 1);
  const lg = {}; all.forEach(r => { const l = r.language || "Autre"; lg[l] = (lg[l] || 0) + 1; }); const lgs = Object.entries(lg).sort((a, b) => b[1] - a[1]);
  const prs = REAL().reduce((s, p) => s + p.prs, 0), iss = REAL().reduce((s, p) => s + p.issues, 0), conv = SESS().length, gd = gDays(), cur = cP(gd), ex = extHumans();
  $("#sv").innerHTML = `<div class="wrap">
    <p class="hint" style="margin:0">Période affichée : <b>${PLABEL[PERIOD]}</b>. Elle se change avec les boutons « Période » en haut de la page et s'applique aux commits, au classement, aux collaborateurs et au calendrier.</p>
    <div class="kpis">${kpi("commit", "var(--gold)", cur, `commits sur ${PLABEL[PERIOD]}`, trendHTML(cur, cPrev(gd)), gd.slice(-Math.max(PERIOD, 14)))}${kpi("pulse", "var(--mint)", `${nActive}/${REAL().length}`, "projets actifs")}${kpi("repo", "var(--violet)", all.length, "dépôts suivis")}
      ${kpi("pr", "var(--coral)", prs, "propositions en attente")}${kpi("box", "var(--warn)", iss, "tâches ouvertes")}${kpi("users", "var(--ext)", ex.length, "collaborateurs externes")}${kpi("chat", "var(--violet)", conv, "conversations liées")}</div>
    <div class="g2"><section class="panel"><h2>Commits par ${PERIOD <= 30 ? "jour" : "semaine"}</h2>${stacked()}<div class="legend">${REAL().map(p => `<span><i style="background:${p.col}"></i>${esc(p.name)}</span>`).join("")}</div></section>
      <section class="panel"><h2>Calendrier d'activité</h2>${heatmap()}</section></div>
    <div class="g2"><section class="panel"><h2>Dépôts les plus actifs sur ${PLABEL[PERIOD]}</h2><div class="bars">${top.map(r => `<div class="bar"><span class="n" title="${esc(r.name)}">${esc(r.name)}</span><span class="tr"><b style="width:${cP(r.days) / mx * 100}%;background:${r.p.col}"></b></span><span class="v">${cP(r.days)}</span></div>`).join("")}</div></section>
      <section class="panel"><h2>Qui alimente les projets ?</h2><div class="bars2">${REAL().map(whoBar).join("")}</div>
        <div class="legend">${Object.keys(KIND).map(k => `<span><i style="background:${KCOL[k]}"></i>${KIND[k]}</span>`).join("")}</div>
        ${ex.length ? `<p class="hint" style="margin-top:8px">Externes : ${ex.sort((a, b) => b.c - a.c).slice(0, 5).map(a => `<b>${esc(a.name || a.login)}</b> (${a.c})`).join(", ")}. <button class="mini" id="stc">Voir et classer</button></p>` : '<p class="hint" style="margin-top:8px">✅ Aucun collaborateur externe détecté.</p>'}</section></div>
    <section class="panel"><h2>Langages (par dépôt)</h2><div class="langs">${lgs.map(([l, n], i) => `<span title="${esc(l)} : ${n}" style="width:${n / all.length * 100}%;background:${LCOL[i % LCOL.length]}"></span>`).join("")}</div><div class="legend">${lgs.map(([l, n], i) => `<span><i style="background:${LCOL[i % LCOL.length]}"></i>${esc(l)} · ${n}</span>`).join("")}</div></section>
    <div class="cards">${REAL().map(projCard).join("")}</div></div>`;
  $$("[data-go]", $("#sv")).forEach(b => b.onclick = () => { $("#tabVillage").click(); select(P.find(p => p.id === b.dataset.go), null); });
  const st = $("#stc"); if (st) st.onclick = openContrib;
  $$("[data-inb]", $("#sv")).forEach(b => b.onclick = () => openInbox(b.dataset.inb, "pr"));
}
function projCard(p) {
  const m = mainOf(p), cur = cP(p.days);
  return `<article class="pc" style="--c:${p.col}"><header><div style="display:flex;gap:12px;align-items:center;min-width:0">${emb(p, 42)}<div style="min-width:0"><h2>${esc(p.name)}</h2><span class="pill" style="--pc:${STCOL[p.status]}"><span class="st s-${p.status}"></span>${STATUS[p.status]} · NIV ${p.lvl}</span></div></div><button class="btn" data-go="${esc(p.id)}">Voir au village</button></header>
    <p class="hint" style="margin:0">${esc(p.description)}</p>
    <div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">${tile(rel(p.pushed), "Dernière activité")}${tile(`${cur} ${trendHTML(cur, cPrev(p.days))}`, `Commits sur ${PLABEL[PERIOD]}`)}${tile(`${p.prs} · ${p.issues}`, "PR · tâches")}${tile(p.exts.length ? `👥 ${p.exts.length}` : "Aucun", "Collaborateurs externes")}</div>
    <div class="spark">${bars(p.series, p.col)}</div>
    <div class="acts">${m ? `<a class="btn main" ${ext(m.url)}>${ic("chat")}Conversation principale</a>` : ""}${p.prs ? `<button class="btn" data-inb="${esc(p.id)}">${ic("pr")}${p.prs} à traiter</button>` : ""}${p.sites.map(u => `<a class="btn" ${ext(u)}>${ic("ext")}Site</a>`).join("")}${p.repos[0] ? `<a class="btn" ${ext(p.repos[0].url)}>${ic("repo")}${esc(p.repos[0].name)}</a>` : ""}</div>
    <details><summary class="hint" style="cursor:pointer">Dépôts (${p.repos.length})</summary><div class="tbl"><table><thead><tr><th>Dépôt</th><th>Activité</th><th>Tests</th><th>PR · tâches</th><th>Dernier commit</th></tr></thead><tbody>
      ${p.repos.map(r => `<tr><td><a ${ext(r.url)}>${esc(r.name)}</a>${r.private ? " 🔒" : ""}${r.error ? `<div class="ko">Erreur de lecture</div>` : ""}</td><td class="n">${rel(r.pushed)}</td><td>${r.ci ? `<a class="${r.ci.status === "success" ? "ok" : r.ci.status === "failure" ? "ko" : ""}" ${ext(r.ci.url)}>${r.ci.status === "success" ? "●" : r.ci.status === "failure" ? "✕" : "◐"}</a>` : "○"}</td><td class="n">${r.prs ?? 0} · ${r.issues ?? 0}</td><td class="m">${esc(r.recent?.[0]?.msg || "—")}</td></tr>`).join("")}</tbody></table></div></details></article>`;
}

/* ===================== VUES & ÉVÉNEMENTS ===================== */
function refreshAll() { renderHud(); buildPlates(); if (!$("#sv").hidden) renderStats(); if (SEL) renderDrawer(); if (REDUCE) frame(); }
function showView(v) {
  const vil = v === "village"; $("#vv").hidden = !vil; $("#sv").hidden = vil; $("#tabVillage").setAttribute("aria-pressed", vil); $("#tabStats").setAttribute("aria-pressed", !vil);
  try { history.replaceState(null, "", "#" + v); } catch {}
  if (vil) { layout(); frame(); } else renderStats();
}
$("#tabVillage").onclick = () => showView("village"); $("#tabStats").onclick = () => showView("stats"); $("#brand").onclick = () => { showView("village"); deselect(); };
$$("#per [data-p]").forEach(b => b.onclick = () => { PERIOD = +b.dataset.p; lsSet("rph.period", String(PERIOD)); $$("#per [data-p]").forEach(x => x.setAttribute("aria-pressed", x === b)); refreshAll(); });
$("#btnConvs").onclick = openConvs; $("#btnInbox").onclick = () => openInbox();
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
