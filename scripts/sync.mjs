#!/usr/bin/env node
// Lit projects.json, interroge GitHub, écrit data.json et dist/index.html (page autonome).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomBytes, pbkdf2Sync, createCipheriv, createHmac } from "node:crypto";
import tls from "node:tls";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const USE_GH = process.argv.includes("--gh");
// Un token fine-grained ne couvre qu'un propriétaire : HUB_TOKEN_<OWNER> (ex. HUB_TOKEN_ACME pour l'organisation acme-corp), sinon HUB_TOKEN.
const tokenFor = path => {
  if (USE_GH) return null;
  const owner = (path.match(/^\/(?:repos|orgs|users)\/([^/?]+)/) || [])[1] || "";
  return process.env["HUB_TOKEN_" + owner.split("-")[0].toUpperCase()] || process.env.HUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
};
const DAY = 864e5, WEEKS = 12;
const now = Date.now();

async function gh(path) {
  const TOKEN = tokenFor(path);
  if (TOKEN) {
    const r = await fetch("https://api.github.com" + path, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return r.json();
  }
  // Repli local : CLI gh déjà authentifiée
  return JSON.parse(execFileSync("gh", ["api", path], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
}
const safe = async (p, d = null) => { try { return await gh(p); } catch { return d; } };

async function allCommits(full, since) {
  let out = [];
  for (let page = 1; page <= 5; page++) {
    const r = await safe(`/repos/${full}/commits?since=${since}&per_page=100&page=${page}`, []);
    out = out.concat(r); if (r.length < 100) break;
  }
  return out;
}

async function fetchRepo(full) {
  const [owner, name] = full.split("/");
  const since = new Date(now - WEEKS * 7 * DAY).toISOString();
  const [meta, commits, prs, runs, iss] = await Promise.all([
    gh(`/repos/${full}`),
    allCommits(full, since),
    safe(`/repos/${full}/pulls?state=open&per_page=100`, []),
    safe(`/repos/${full}/actions/runs?per_page=5&status=completed`, { workflow_runs: [] }),
    safe(`/repos/${full}/issues?state=open&sort=updated&per_page=40`, []),
  ]);
  // Si rien sur 12 semaines, on garde au moins le dernier commit
  const last = commits.length ? commits : await safe(`/repos/${full}/commits?per_page=3`, []);
  const series = Array(WEEKS).fill(0), days = Array(84).fill(0);
  let c7 = 0, c30 = 0, release = null;
  const sessions = [], authors = new Map();
  for (const c of commits) {
    const age = now - new Date(c.commit.author.date).getTime();
    const w = Math.floor(age / (7 * DAY));
    if (w < WEEKS) series[WEEKS - 1 - w]++;
    const di = Math.floor(age / DAY); if (di < 84) days[83 - di]++;
    if (age < 7 * DAY) c7++;
    if (age < 30 * DAY) c30++;
    if (!release) { const first = c.commit.message.split("\n")[0], m = first.match(/release[^\d\n]*v?(\d+\.\d+\.\d+)/i) || first.match(/^v(\d+\.\d+\.\d+)\b/i); if (m) release = { v: m[1], date: c.commit.author.date, url: c.html_url }; }
    // qui a écrit ce commit ? (login GitHub si disponible, sinon le nom)
    const al = c.author?.login || null, an = c.commit.author.name || "", ae = c.commit.author.email || "", ak = (al || an).toLowerCase();
    if (ak) {
      const bot = /\bbot\b/i.test(an) || /\[bot\]$/i.test(al || "") || /^(dependabot|github-actions|renovate|copilot|claude)/i.test(al || an) || /anthropic\.com$/i.test(ae);
      const e = authors.get(ak) || { login: al, name: an, avatar: c.author?.avatar_url || null, n: 0, last: c.commit.author.date, bot, days: Array(84).fill(0) };
      e.n++; if (di < 84) e.days[83 - di]++; if (c.commit.author.date > e.last) e.last = c.commit.author.date; authors.set(ak, e);
    }
    for (const m of c.commit.message.matchAll(/https:\/\/claude\.ai\/code\/session_[A-Za-z0-9]+/g))
      sessions.push({ url: m[0], date: c.commit.author.date, title: c.commit.message.split("\n")[0].slice(0, 90), repo: name });
  }
  let pages = null;
  if (meta.has_pages) pages = (await safe(`/repos/${full}/pages`))?.html_url || `https://${owner.toLowerCase()}.github.io/${name}/`;
  const run = runs.workflow_runs?.[0];
  return {
    full, name, url: meta.html_url, description: meta.description || "",
    private: meta.private, archived: meta.archived, language: meta.language,
    created: meta.created_at, pushed: meta.pushed_at, branch: meta.default_branch,
    issues: Math.max(0, meta.open_issues_count - prs.length), prs: prs.length,
    site: meta.homepage || pages, ci: run ? { status: run.conclusion, name: run.name, url: run.html_url, date: run.updated_at } : null,
    series, days, c7, c30, release,
    recent: last.slice(0, 5).map(c => ({ msg: c.commit.message.split("\n")[0].slice(0, 110), date: c.commit.author.date, author: c.commit.author.name, url: c.html_url })),
    sessions,
    authors: [...authors.values()].sort((a, b) => b.n - a.n).slice(0, 20),
    // demandes en attente : on garde les plus anciennes en premier pour les propositions, les plus récentes pour les tâches
    pulls: prs.map(x => ({ n: x.number, title: (x.title || "").slice(0, 120), url: x.html_url, by: x.user?.login || "", draft: !!x.draft, created: x.created_at, updated: x.updated_at,
      reviewers: (x.requested_reviewers || []).map(u => u.login), labels: (x.labels || []).map(l => l.name).slice(0, 3) })).sort((a, b) => a.created.localeCompare(b.created)).slice(0, 15),
    issuesList: iss.filter(x => !x.pull_request).slice(0, 15).map(x => ({ n: x.number, title: (x.title || "").slice(0, 120), url: x.html_url, by: x.user?.login || "", comments: x.comments,
      created: x.created_at, updated: x.updated_at, labels: (x.labels || []).map(l => l.name).slice(0, 3), assignees: (x.assignees || []).map(u => u.login) })),
  };
}

const cfg = JSON.parse(readFileSync(process.env.HUB_CONFIG || join(root, "projects.json"), "utf8"));
const prevPath = join(root, "data.json");
const prev = existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, "utf8")) : { projects: [] };

// ---- usage des applications : lit uniquement des totaux agrégés (aucune donnée personnelle) ----
const todayUTC = Date.parse(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
const toArr = obj => { const a = Array(84).fill(0); Object.entries(obj || {}).forEach(([d, c]) => { const i = 83 - Math.round((todayUTC - Date.parse(String(d).slice(0, 10) + "T00:00:00Z")) / DAY); if (i >= 0 && i < 84) a[i] += +c || 0; }); return a; };
function normalizeUsage(raw, ignore = []) {
  const tables = (raw.tables || []).filter(t => !ignore.includes(t.name)).map(t => ({ name: t.name, rows: +t.rows || 0, n7: +t.n7 || 0, n30: +t.n30 || 0, last: t.last || null, bytes: +t.bytes || 0, days: toArr(t.days) }));
  const events = Array(84).fill(0); tables.forEach(t => t.days.forEach((v, i) => { events[i] += v; }));
  const a = raw.auth;
  return { ok: true, at: new Date().toISOString(), dbBytes: +raw.db_bytes || 0, tables, events,
    users: a ? { total: +a.users || 0, active7: +a.active7 || 0, active30: +a.active30 || 0, newDays: toArr(a.created), seenDays: toArr(a.seen), last: a.last_seen || null } : null,
    last: [...tables.map(t => t.last), a?.last_seen].filter(Boolean).sort().at(-1) || null };
}
async function collectUsage(p) {
  const u = p.usage; if (!u) return null;
  try {
    let r;
    if (u.supabase?.url) {
      const key = process.env.HUB_USAGE_KEY; if (!key) return { ok: false, error: "no-key" };
      const anon = u.supabase.anon || "";
      r = await fetch(u.supabase.url.replace(/\/$/, "") + "/rest/v1/rpc/hub_stats", { method: "POST", headers: { apikey: anon, Authorization: "Bearer " + anon, "Content-Type": "application/json" }, body: JSON.stringify({ p_key: key }) });
    } else if (u.endpoint?.url) {   // n'importe quelle API qui renvoie le même JSON que hub_stats
      const tok = process.env[u.endpoint.tokenEnv || "HUB_USAGE_TOKEN"]; if (!tok) return { ok: false, error: "no-key" };
      r = await fetch(u.endpoint.url, { headers: { Authorization: "Bearer " + tok } });
    } else return null;
    if (!r.ok) return { ok: false, error: "http-" + r.status };
    return normalizeUsage(await r.json(), u.ignore || []);
  } catch { return { ok: false, error: "fetch" }; }
}

// ---- disponibilité des sites ----
async function checkSite(url) {
  const t0 = Date.now(), out = { url, ok: false, status: 0, ms: 0, certDays: null };
  try {
    const ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(url, { signal: ctrl.signal, redirect: "follow", headers: { "User-Agent": "projects-hub-monitor" } });
    clearTimeout(to); out.status = r.status; out.ms = Date.now() - t0; out.ok = r.status < 400; await r.body?.cancel?.();
  } catch { out.ms = Date.now() - t0; }
  try {
    const u = new URL(url);
    if (u.protocol === "https:") out.certDays = await new Promise(res => {
      const sk = tls.connect({ host: u.hostname, port: 443, servername: u.hostname, timeout: 6000 }, () => { const c = sk.getPeerCertificate(); sk.end(); res(c?.valid_to ? Math.round((Date.parse(c.valid_to) - Date.now()) / DAY) : null); });
      sk.on("error", () => res(null)); sk.on("timeout", () => { sk.destroy(); res(null); });
    });
  } catch {}
  return out;
}

let ok = 0, ko = 0;
const out = [];
for (const p of cfg.projects) {
  const old = prev.projects.find(x => x.id === p.id);
  const repos = [];
  for (const full of p.repos) {
    try { repos.push(await fetchRepo(full)); ok++; }
    catch (e) {
      ko++; console.warn("✗ un dépôt n'a pas pu être lu (HTTP " + (e.message.match(/^\d+/)?.[0] || "?") + ")");
      const o = old?.repos.find(r => r.full === full);   // on garde les dernières données connues
      repos.push({ ...(o || { full, name: full.split("/")[1], url: `https://github.com/${full}`, series: Array(WEEKS).fill(0), recent: [], sessions: [], c7: 0, c30: 0 }), error: e.message });
    }
  }
  const pushed = repos.map(r => r.pushed).filter(Boolean).sort().at(-1);
  const created = repos.map(r => r.created).filter(Boolean).sort()[0];
  const age = pushed ? (now - new Date(pushed)) / DAY : Infinity;
  const auto = age <= 7 ? "active" : age <= 30 ? "recent" : "dormant";
  // conversations : une entrée par lien, avec le nombre de commits qui y sont rattachés
  const smap = new Map();
  repos.flatMap(r => r.sessions).forEach(s => {
    const e = smap.get(s.url);
    if (!e) smap.set(s.url, { ...s, n: 1, first: s.date });
    else { e.n++; if (s.date > e.date) { e.date = s.date; e.title = s.title; e.repo = s.repo; } if (s.date < e.first) e.first = s.date; }
  });
  const all = [...smap.values()];
  const sessions = [...all].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const mainAuto = [...all].sort((a, b) => b.n - a.n || b.date.localeCompare(a.date))[0]?.url || null;
  const sites = [...new Set(repos.map(r => r.site).filter(Boolean))];
  out.push({
    ...p, status: p.status || auto, autoStatus: auto, created, pushed,
    series: Array.from({ length: WEEKS }, (_, i) => repos.reduce((s, r) => s + (r.series[i] || 0), 0)),
    c7: repos.reduce((s, r) => s + r.c7, 0), c30: repos.reduce((s, r) => s + r.c30, 0),
    issues: repos.reduce((s, r) => s + (r.issues || 0), 0), prs: repos.reduce((s, r) => s + (r.prs || 0), 0),
    sites, sessions, mainAuto, repos, usageData: await collectUsage(p), checks: await Promise.all(sites.filter(u => /^https?:/.test(u)).slice(0, 4).map(checkSite)),
  });
}
// « moi » : le propriétaire du hub (dans le workflow) ou la valeur « me » de la configuration
let me = [].concat(cfg.me || process.env.HUB_ME || process.env.GITHUB_REPOSITORY_OWNER || []).map(x => String(x).toLowerCase());
if (!me.length && USE_GH) { try { me = [JSON.parse(execFileSync("gh", ["api", "user"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })).login.toLowerCase()]; } catch {} }
// catalogue des dépôts accessibles : permet de choisir dans une liste au lieu de taper « propriétaire/nom »
const assigned = new Set(cfg.projects.flatMap(p => p.repos.map(r => r.toLowerCase())));
const owners = [...new Set(cfg.projects.flatMap(p => p.repos.map(r => r.split("/")[0])).concat(me))];
const catalog = [], seen = new Set();
for (const o of owners) {
  const lists = me.includes(o.toLowerCase()) ? ["/user/repos?affiliation=owner&sort=pushed&per_page=100"] : [`/orgs/${o}/repos?sort=pushed&per_page=100`, `/users/${o}/repos?sort=pushed&per_page=100`];
  let got = []; for (const l of lists) { got = await safe(l, []); if (Array.isArray(got) && got.length) break; got = []; }
  got.forEach(r => { if (seen.has(r.full_name)) return; seen.add(r.full_name);
    catalog.push({ full: r.full_name, desc: (r.description || "").slice(0, 100), pushed: r.pushed_at, private: r.private, language: r.language, archived: !!r.archived, assigned: assigned.has(r.full_name.toLowerCase()) }); });
}
console.log(`catalogue : ${catalog.length} dépôts proposés`);
const data = { generated: new Date().toISOString(), weeks: WEEKS, me, team: cfg.team || [], hub: cfg.hub || {}, catalog, projects: out };
writeFileSync(prevPath, JSON.stringify(data, null, 2));

mkdirSync(join(root, "dist"), { recursive: true });
const rd = f => readFileSync(join(root, f), "utf8");
const logo = rd("logo.svg");
const page = rd("template.html")
  .replace("/*__APP__*/", () => rd("app.js"))
  .replace("/*__LOGO__*/", () => JSON.stringify(logo))
  .replace("/*__SQL__*/", () => JSON.stringify(rd("usage/hub-stats.sql")))
  .replace("/*__DATA__*/null", () => JSON.stringify(data).replace(/</g, "\\u003c"));
const doc = '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + page;

const CI = !!process.env.GITHUB_ACTIONS, PW = process.env.HUB_PASSWORD;
if (CI && !PW) { console.error("HUB_PASSWORD manquant : refus de publier la page en clair."); process.exit(1); }
if (PW && PW.length < 16) { console.error("HUB_PASSWORD trop court (16 caractères minimum)."); process.exit(1); }

writeFileSync(join(root, "dist/favicon.svg"), logo);
writeFileSync(join(root, "dist/manifest.webmanifest"), JSON.stringify({
  name: "Romy's Projects Hub", short_name: "Projects Hub", start_url: ".", display: "standalone",
  background_color: "#0f0d24", theme_color: "#0f0d24", icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
}));
if (PW) {
  // AES-256-GCM. Clé = PBKDF2-SHA256(mot de passe, sel dérivé du mot de passe, 600 000 it.).
  // Le sel est stable d'un déploiement à l'autre : la clé mémorisée sur un appareil reste valable, seul l'IV change.
  const salt = createHmac("sha256", PW).update("romys-projects-hub/v1").digest().subarray(0, 16), iv = randomBytes(12), ITER = 600000;
  const c = createCipheriv("aes-256-gcm", pbkdf2Sync(PW, salt, ITER, 32, "sha256"), iv);
  const ct = Buffer.concat([c.update(doc, "utf8"), c.final(), c.getAuthTag()]).toString("base64");
  writeFileSync(join(root, "dist/index.html"), rd("unlock.html").replace("<!--LOGO-->", () => logo)
    .replace("__SALT__", salt.toString("base64")).replace("__IV__", iv.toString("base64")).replace("__ITER__", ITER).replace("__CT__", ct));
} else {
  writeFileSync(join(root, "dist/index.html"), doc);   // local uniquement (dist/ est ignoré par git)
  writeFileSync(join(root, "preview.html"), page);
}
console.log(`OK — ${ok} dépôts lus, ${ko} en erreur, ${out.length} projets${PW ? " (page chiffrée)" : ""}`);
