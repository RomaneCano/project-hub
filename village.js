/* ===== Vue Village : un pixel-art par projet, un personnage par dépôt ===== */
let VIEW = location.hash === "#village" ? "village" : "tableau";
let SEL = null;
const PW = 170, PH = 124, FPS = 15;
const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const t = f < 0 ? 0 : 255, k = Math.abs(f);
  return `rgb(${Math.round(r + (t - r) * k)},${Math.round(g + (t - g) * k)},${Math.round(b + (t - b) * k)})`; };
const isNight = () => { const t = document.documentElement.dataset.theme; return t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches); };
const ageDays = iso => iso ? (Date.now() - new Date(iso)) / 864e5 : 999;

function villageHTML() {
  return `<section class="vil">
    <div class="stage" id="stage"><canvas id="cv" aria-label="Village des projets : une maison par projet, un personnage par dépôt"></canvas><div class="tip" id="tip"></div></div>
    <div class="vlegend"><span>🔨 au travail (moins de 2 j)</span><span>🚶 se balade (moins de 14 j)</span><span>💤 dort</span><span>❗ CI en échec</span><span>💬 conversation Claude liée</span><span>Cliquez une maison ou un personnage</span></div>
    <div class="panel info" id="info"></div></section>`;
}

function infoHTML() {
  const p = SEL.p, r = SEL.r;
  const sess = (r && r.sessions[0]) || p.sessions[0];
  const links = `<div class="links">${sess ? `<a class="btn main" href="${esc(sess.url)}">💬 Reprendre la conversation</a>` : ""}
    ${r ? `<a class="btn ${sess ? "" : "main"}" href="${esc(r.url)}">Ouvrir le dépôt</a>${r.site ? `<a class="btn" href="${esc(r.site)}">🌐 Site</a>` : ""}`
        : p.sites.map(u => `<a class="btn" href="${esc(u)}">🌐 ${esc(u.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`).join("")}</div>`;
  if (r) return `<div style="--c:${p.color}"><h3>${esc(p.emoji)} ${esc(r.name)} <span class="tag">${esc(p.name)}</span></h3>
    <p>Dernière activité ${rel(r.pushed)} · créé le ${fdate(r.created)} · ${r.c7} commits cette semaine · ${r.prs ?? 0} PR · ${r.issues ?? 0} issues</p>
    <p>Dernier commit : ${esc(r.recent[0]?.msg || "—")}</p>${links}</div>`;
  return `<div style="--c:${p.color}"><h3>${esc(p.emoji)} ${esc(p.name)} <span class="pill s-${p.status}">${STATUS[p.status]}</span></h3>
    <p>${esc(p.description)}</p><p>${p.repos.length} dépôt(s) · dernière activité ${rel(p.pushed)} · ${p.c7} commits cette semaine · créé le ${fdate(p.created)}</p>${p.next ? `<div class="next"><em>Prochaine étape :</em> ${esc(p.next)}</div>` : ""}${links}</div>`;
}

let RAF = 0;
function startVillage() {
  cancelAnimationFrame(RAF);
  const cv = $("#cv"), stage = $("#stage"), tip = $("#tip"), ctx = cv.getContext("2d");
  const P = [...D.projects].sort((a, b) => (b.pushed || "").localeCompare(a.pushed || ""));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  SEL = SEL && P.find(p => p.id === SEL.p.id) ? SEL : { p: P[0], r: null };
  const showInfo = () => { $("#info").innerHTML = infoHTML(); $("#info").style.setProperty("--c", SEL.p.color); };
  showInfo();

  // personnages
  const chars = [];
  P.forEach((p, pi) => [...p.repos].sort((a, b) => (b.pushed || "").localeCompare(a.pushed || "")).forEach((r, ri) => {
    const rnd = mulberry(hashStr(r.full)), age = ageDays(r.pushed);
    chars.push({ p, pi, r, rnd, mode: age < 2 ? "work" : age < 14 ? "stroll" : "sleep",
      x: 14 + rnd() * (PW - 28), y: 84 + rnd() * 22, tx: 14 + rnd() * (PW - 28), ty: 84 + rnd() * 22,
      skin: ["#f5c9a0", "#e0a97a", "#b9784a", "#8a5a3a"][Math.floor(rnd() * 4)],
      hair: ["#2b1d12", "#6b3f1d", "#d6a73a", "#c8431f", "#222", "#8b8b8b"][Math.floor(rnd() * 6)],
      tone: [-0.2, 0.15, 0, 0.3][ri % 4], pause: rnd() * 30, f: Math.floor(rnd() * 20), dir: 1, moving: false });
  }));

  let cols = 1, rows = 1, scale = 2;
  const layout = () => {
    const w = stage.clientWidth - 20;
    cols = Math.max(1, Math.min(P.length, Math.floor(w / (PW * 2))));
    scale = Math.max(1, Math.min(4, Math.floor(w / (cols * PW)) || 1));
    rows = Math.ceil(P.length / cols);
    cv.width = cols * PW * scale; cv.height = rows * PH * scale;
    cv.style.width = cv.width + "px"; cv.style.height = cv.height + "px";
  };

  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const txt = (t, x, y, size, c) => { ctx.font = `${size}px "Press Start 2P", monospace`; ctx.textBaseline = "top"; ctx.fillStyle = c; ctx.fillText(t, Math.round(x), Math.round(y)); };

  function plot(p, pi, t, night) {
    const rnd = mulberry(hashStr(p.id)), age = ageDays(p.pushed), busy = age < 2;
    // ciel + collines
    R(0, 0, PW, 70, night ? "#0f1838" : "#8fd0ff"); R(0, 44, PW, 26, night ? "#18265a" : "#b6e2ff");
    if (night) { for (let i = 0; i < 18; i++) { const sx = rnd() * PW, sy = rnd() * 40; if ((t + i * 7) % 40 < 34) R(sx, sy, 1, 1, "#fff"); } R(PW - 26, 8, 8, 8, "#f6f1c8"); R(PW - 23, 8, 5, 8, "#0f1838"); }
    else { R(PW - 28, 8, 9, 9, "#ffe27a"); for (let k = 0; k < 3; k++) { const cx = ((t * 0.12 + k * 64 + pi * 20) % (PW + 40)) - 24, cy = 10 + k * 11; R(cx, cy, 20, 5, "#fff"); R(cx + 4, cy - 3, 12, 4, "#fff"); } }
    const ph = rnd() * 6;
    for (let x = 0; x < PW; x++) R(x, 70 - (7 + 4 * Math.sin(x / 13 + ph)), 1, 12, night ? "#17406a" : "#7dc88a");
    // sol
    R(0, 70, PW, PH - 70, night ? "#1f5a3a" : "#5fbf5a");
    for (let i = 0; i < 34; i++) { const gx = rnd() * PW, gy = 72 + rnd() * 40; R(gx, gy, 2, 1, night ? "#287046" : "#4aa84a"); if (i % 9 === 0) R(gx, gy - 2, 1, 1, ["#ff7aa8", "#ffd34a", "#fff"][i % 3]); }
    // maison
    const n = Math.min(p.repos.length, 13), hw = 38 + n * 2, hx = Math.round((PW - hw) / 2), cx = hx + hw / 2;
    R(cx - 5, 78, 10, PH - 14 - 78, night ? "#a58c5a" : "#dcc58f");                           // chemin
    R(hx + 2, 78, hw, 2, "rgba(0,0,0,.2)");
    if (busy) for (let k = 0; k < 4; k++) { const o = (t * 0.5 + k * 8) % 30; ctx.globalAlpha = 1 - o / 30; R(hx + hw - 12 + Math.sin((o + k) / 3) * 2, 28 - o, 3 + o / 8, 3 + o / 8, night ? "#aab" : "#fff"); ctx.globalAlpha = 1; }
    R(hx + hw - 14, 26, 6, 14, shade(p.color, -0.5));                                        // cheminée
    R(hx, 44, hw, 34, p.color); R(hx + hw - 4, 44, 4, 34, shade(p.color, -0.25)); R(hx, 44, hw, 2, shade(p.color, 0.2));
    for (let k = 0; k < 15; k++) { const half = Math.round((k + 1) / 15 * (hw / 2 + 4)); R(cx - half, 30 + k, half * 2, 1, shade(p.color, k % 4 === 3 ? -0.55 : -0.4)); }
    R(cx - 4, 64, 8, 14, "#5a3a22"); R(cx + 2, 71, 1, 1, "#ffd34a");                         // porte
    const lit = night || busy;
    [hx + 5, hx + hw - 14].forEach(wx => { R(wx, 52, 9, 8, "#3a2c20"); R(wx + 1, 53, 7, 6, lit ? "#ffe58a" : "#2b3a4d"); R(wx + 4, 53, 1, 6, "#3a2c20"); });
    // drapeau d'état
    const fc = { active: "#2fbf5e", recent: "#e8a317", dormant: "#8b97a6", paused: "#8b97a6" }[p.status];
    R(10, 48, 2, 30, "#6b5a45"); const wave = Math.round(Math.sin(t / 5)); R(12, 49, 12, 7, fc); R(24 + wave, 50, 2, 5, fc);
    // HUD
    R(0, PH - 14, PW, 14, "rgba(10,16,28,.82)");
    const label = (p.name.length > 15 ? p.name.slice(0, 14) + "…" : p.name);
    txt(label, 5, PH - 10, 6, "#fff");
    const lvl = 1 + Math.floor(Math.sqrt(p.series.reduce((a, b) => a + b, 0)));
    txt("NIV " + lvl, PW - 44, PH - 10, 6, "#ffd34a");
    if (SEL.p.id === p.id && !SEL.r) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(hx - 3.5, 26.5, hw + 7, 52); }
    return { hx, hw };
  }

  function step(c) {
    c.f++;
    if (c.mode === "sleep") { c.moving = false; return; }
    if (c.pause > 0) { c.pause--; c.moving = false; return; }
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    if (d < 1) { c.pause = c.mode === "work" ? 18 + c.rnd() * 35 : 30 + c.rnd() * 90; c.tx = 14 + c.rnd() * (PW - 28); c.ty = 84 + c.rnd() * 22; c.moving = false; return; }
    const sp = c.mode === "work" ? 0.5 : 0.22; c.x += dx / d * sp; c.y += dy / d * sp; c.dir = dx >= 0 ? 1 : -1; c.moving = true;
  }

  function drawChar(c, t, night) {
    const X = Math.round(c.x), Y = Math.round(c.y), body = shade(c.p.color, c.tone);
    R(X - 3, Y - 1, 7, 2, "rgba(0,0,0,.25)");
    if (c.mode === "sleep") {
      R(X - 3, Y - 5, 7, 5, body); R(X - 2, Y - 9, 5, 4, c.skin); R(X - 2, Y - 10, 5, 2, c.hair); R(X - 1, Y - 7, 1, 1, "#222"); R(X + 1, Y - 7, 1, 1, "#222");
      const k = (t / 14 + c.pi) % 3; ctx.globalAlpha = 1 - k / 3; txt("z", X + 4, Y - 13 - k * 3, 5, night ? "#dfe8ff" : "#fff"); ctx.globalAlpha = 1;
    } else {
      const alt = c.moving && Math.floor(c.f / 3) % 2;
      R(X - 2, Y - 3 + (alt ? 1 : 0), 2, 3 - (alt ? 1 : 0), "#2a2f45"); R(X, Y - 3 + (alt ? 0 : 1), 2, 3 - (alt ? 0 : 1), "#2a2f45");
      R(X - 3, Y - 8, 6, 5, body);
      const hammer = c.mode === "work" && !c.moving && c.pause > 0, up = hammer && Math.floor(c.f / 4) % 2;
      R(X - 4, Y - 8, 1, 3, c.skin); R(X + 3, Y - (up ? 11 : 8), 1, 3, c.skin);
      if (hammer) { R(X + 3, Y - (up ? 13 : 7 ), 3, 2, "#9aa4b2"); if (!up && c.f % 8 === 4) { R(X + 6, Y - 6, 1, 1, "#ffd34a"); R(X + 7, Y - 8, 1, 1, "#ffd34a"); } }
      R(X - 2, Y - 12, 5, 4, c.skin); R(X - 2, Y - 13, 5, 2, c.hair); R(X - 1 + (c.dir > 0 ? 1 : 0), Y - 11, 1, 1, "#222"); R(X + (c.dir > 0 ? 1 : 0), Y - 11, 1, 1, "#222");
    }
    if (c.r.ci?.status === "failure") { if (Math.floor(t / 8) % 2) { R(X, Y - 21, 2, 4, "#ff3b3b"); R(X, Y - 16, 2, 2, "#ff3b3b"); } }
    else if (c.r.sessions.length && c.mode !== "sleep") { R(X - 4, Y - 20, 9, 5, "#fff"); R(X - 1, Y - 15, 2, 1, "#fff"); [-2, 0, 2].forEach(o => R(X + o, Y - 18, 1, 1, "#4a5568")); }
    if (SEL.r === c.r) { const b = Math.round(Math.sin(t / 4)); R(X - 1, Y - 25 + b, 3, 1, "#fff"); R(X, Y - 24 + b, 1, 1, "#fff"); }
  }

  let t = 0, last = 0, hov = null, geo = [];
  function draw() {
    const night = isNight();
    ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.imageSmoothingEnabled = false; geo = [];
    P.forEach((p, i) => {
      const ox = (i % cols) * PW, oy = Math.floor(i / cols) * PH;
      ctx.save(); ctx.translate(ox, oy); ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip();
      const g = plot(p, i, t, night); geo.push({ p, ox, oy, ...g });
      chars.filter(c => c.pi === i).sort((a, b) => a.y - b.y).forEach(c => drawChar(c, t, night));
      ctx.restore();
    });
  }
  function loop(ts) {
    if (!document.contains(cv)) return;
    RAF = requestAnimationFrame(loop);
    if (ts - last < 1000 / FPS) return;
    last = ts; t++; chars.forEach(step); draw();
  }

  const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / scale, y: (e.clientY - b.top) / scale, px: e.clientX - stage.getBoundingClientRect().left, py: e.clientY - stage.getBoundingClientRect().top }; };
  const hit = m => {
    const i = Math.floor(m.y / PH) * cols + Math.floor(m.x / PW); if (m.x < 0 || m.y < 0 || i >= P.length) return null;
    const lx = m.x % PW, ly = m.y % PH;
    const c = chars.filter(c => c.pi === i && Math.abs(lx - c.x) < 6 && ly < c.y + 2 && ly > c.y - 15).sort((a, b) => b.y - a.y)[0];
    if (c) return { p: c.p, r: c.r, kind: "r" };
    const g = geo[i]; if (g && lx > g.hx - 3 && lx < g.hx + g.hw + 3 && ly > 26 && ly < 79) return { p: P[i], r: null, kind: "p" };
    return null;
  };
  cv.onpointermove = e => { const m = pos(e), h = hit(m); cv.style.cursor = h ? "pointer" : "default";
    if (!h) { tip.style.display = "none"; return; }
    tip.innerHTML = h.r ? `<b>${esc(h.r.name)}</b><br>${esc(h.r.recent[0]?.msg || "")}<br>${rel(h.r.pushed)}` : `<b>${esc(h.p.name)}</b><br>${h.p.repos.length} dépôt(s) · ${rel(h.p.pushed)}`;
    tip.style.display = "block"; tip.style.left = Math.min(m.px + 14, stage.clientWidth - 200) + "px"; tip.style.top = m.py + 14 + "px"; };
  cv.onpointerleave = () => { tip.style.display = "none"; };
  cv.onclick = e => { const h = hit(pos(e)); if (!h) return; SEL = { p: h.p, r: h.r }; showInfo(); if (reduce) draw(); };

  layout(); draw();
  new ResizeObserver(() => { layout(); draw(); }).observe(stage);
  document.fonts?.ready.then(draw);
  if (!reduce) RAF = requestAnimationFrame(loop);
}
