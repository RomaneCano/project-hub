#!/usr/bin/env node
// Usage : node scripts/add.mjs <owner/repo> [--project <id>] [--name "Nom"] [--emoji 🚀] [--desc "..."]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const file = join(dirname(fileURLToPath(import.meta.url)), "..", "projects.json");
const a = process.argv.slice(2);
const repo = a.find(x => /^[\w.-]+\/[\w.-]+$/.test(x));
const opt = k => { const i = a.indexOf("--" + k); return i > -1 ? a[i + 1] : undefined; };
if (!repo) { console.error("Usage: node scripts/add.mjs owner/repo [--project id] [--name ..] [--emoji ..] [--desc ..]"); process.exit(1); }
const cfg = JSON.parse(readFileSync(file, "utf8"));
const id = opt("project") || repo.split("/")[1].toLowerCase();
let p = cfg.projects.find(x => x.id === id);
if (!p) {
  const palette = ["#6366f1", "#22c55e", "#ef4444", "#06b6d4", "#a855f7", "#eab308", "#f97316"];
  p = { id, name: opt("name") || repo.split("/")[1], emoji: opt("emoji") || "🚀", color: palette[cfg.projects.length % palette.length],
        description: opt("desc") || "", next: "", links: [], repos: [] };
  cfg.projects.push(p);
}
if (p.repos.includes(repo)) console.log("Déjà présent :", repo);
else { p.repos.push(repo); console.log(`Ajouté ${repo} → projet « ${p.name} »`); }
writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
