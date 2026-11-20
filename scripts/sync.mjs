#!/usr/bin/env node
// Lit projects.json, interroge GitHub, écrit data.json et dist/index.html (page autonome).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomBytes, pbkdf2Sync, createCipheriv, createHmac } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const USE_GH = process.argv.includes("--gh");
// Un token fine-grained ne couvre qu'un propriétaire : HUB_TOKEN_<OWNER> (ex. HUB_TOKEN_ACME pour l'organisation acme-corp), sinon HUB_TOKEN.
const tokenFor = path => {
  if (USE_GH) return null;
  const owner = (path.match(/^\/repos\/([^/]+)\//) || [])[1] || "";
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
  const [meta, commits, prs, runs] = await Promise.all([
    gh(`/repos/${full}`),
    allCommits(full, since),
    safe(`/repos/${full}/pulls?state=open&per_page=100`, []),
    safe(`/repos/${full}/actions/runs?per_page=5&status=completed`, { workflow_runs: [] }),
  ]);
  // Si rien sur 12 semaines, on garde au moins le dernier commit
  const last = commits.length ? commits : await safe(`/repos/${full}/commits?per_page=3`, []);
  const series = Array(WEEKS).fill(0), days = Array(84).fill(0);
  let c7 = 0, c30 = 0;
  const sessions = [];
  for (const c of commits) {
    const age = now - new Date(c.commit.author.date).getTime();
    const w = Math.floor(age / (7 * DAY));
    if (w < WEEKS) series[WEEKS - 1 - w]++;
    const di = Math.floor(age / DAY); if (di < 84) days[83 - di]++;
    if (age < 7 * DAY) c7++;
    if (age < 30 * DAY) c30++;
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
    series, days, c7, c30,
    recent: last.slice(0, 5).map(c => ({ msg: c.commit.message.split("\n")[0].slice(0, 110), date: c.commit.author.date, author: c.commit.author.name, url: c.html_url })),
    sessions,
  };
}

const cfg = JSON.parse(readFileSync(join(root, "projects.json"), "utf8"));
const prevPath = join(root, "data.json");
const prev = existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, "utf8")) : { projects: [] };

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
  const sessions = repos.flatMap(r => r.sessions).sort((a, b) => b.date.localeCompare(a.date))
    .filter((s, i, a) => a.findIndex(x => x.url === s.url) === i).slice(0, 8);
  const sites = [...new Set(repos.map(r => r.site).filter(Boolean))];
  out.push({
    ...p, status: p.status || auto, autoStatus: auto, created, pushed,
    series: Array.from({ length: WEEKS }, (_, i) => repos.reduce((s, r) => s + (r.series[i] || 0), 0)),
    c7: repos.reduce((s, r) => s + r.c7, 0), c30: repos.reduce((s, r) => s + r.c30, 0),
    issues: repos.reduce((s, r) => s + (r.issues || 0), 0), prs: repos.reduce((s, r) => s + (r.prs || 0), 0),
    sites, sessions, repos,
  });
}
const data = { generated: new Date().toISOString(), weeks: WEEKS, projects: out };
writeFileSync(prevPath, JSON.stringify(data, null, 2));

mkdirSync(join(root, "dist"), { recursive: true });
const rd = f => readFileSync(join(root, f), "utf8");
const logo = rd("logo.svg");
const page = rd("template.html")
  .replace("/*__APP__*/", () => rd("app.js"))
  .replace("/*__LOGO__*/", () => JSON.stringify(logo))
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
