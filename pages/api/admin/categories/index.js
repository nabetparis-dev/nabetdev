import { readJson, writeJson } from "../../../../lib/serverData";

function check(req){
  return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123");
}

function slug(s){
  return String(s || "")
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    || Date.now().toString();
}

export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});

  if(req.method === "POST"){
    const categories = readJson("categories");
    const c = {...req.body};
    c.id = c.id || slug(c.name);
    c.slug = c.slug || slug(c.name);
    c.description = c.description || "";
    c.order = Number(c.order || categories.length + 1);
    categories.push(c);
    writeJson("categories", categories);
    return res.json({ok:true, category:c});
  }

  return res.status(405).end();
}