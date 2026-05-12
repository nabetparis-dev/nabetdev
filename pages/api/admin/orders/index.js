import { readJson, writeJson } from "../../../../lib/serverData";
function check(req){ return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123"); }
export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  const orders=readJson("orders");
  if(req.method==="GET") return res.json(orders);
  if(req.method==="POST"){ const order={id:req.body.id||`NP-${Date.now()}`,date:new Date().toISOString(),status:req.body.status||"pending",...req.body}; orders.unshift(order); writeJson("orders",orders); return res.json({ok:true,order}); }
  return res.status(405).end();
}