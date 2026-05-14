import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, `${name}.json`), "utf8"));
}

export function writeJson(name, data) {
  fs.writeFileSync(path.join(dataDir, `${name}.json`), JSON.stringify(data, null, 2), "utf8");
}

export function siteUrl() {
  return process.env.SITE_URL || readJson("settings").siteUrl || "http://localhost:3000";
}