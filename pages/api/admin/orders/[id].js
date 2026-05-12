import { readJson, writeJson } from "../../../../lib/serverData";
function check(req){ return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123"); }
export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  const {id}=req.query; let orders=readJson("orders"); const idx=orders.findIndex(o=>o.id===id);
  if(idx<0) return res.status(404).json({error:"Commande introuvable"});
  if(req.method==="PUT"){ orders[idx]={...orders[idx],...req.body,updatedAt:new Date().toISOString()}; writeJson("orders",orders); return res.json({ok:true,order:orders[idx]}); }
  if(req.method==="DELETE"){ orders=orders.filter(o=>o.id!==id); writeJson("orders",orders); return res.json({ok:true}); }
  return res.status(405).end();
}