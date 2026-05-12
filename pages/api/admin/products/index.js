import { readJson, writeJson } from "../../../../lib/serverData";
function check(req){ return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123"); }
function slug(s){ return String(s||"").trim().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"") || Date.now().toString(); }
export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  if(req.method==="POST"){
    const products = readJson("products");
    const p = {...req.body};
    p.id = p.id || slug(p.name);
    p.slug = p.slug || slug(p.name);
    p.price = Number(p.price || 0);
    p.oldPrice = Number(p.oldPrice || 0);
    p.stock = Number(p.stock || 0);
    products.push(p);
    writeJson("products", products);
    return res.json({ok:true, product:p});
  }
  return res.status(405).end();
}