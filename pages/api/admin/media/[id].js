import fs from "fs";
import path from "path";
import { readJson, writeJson } from "../../../../lib/serverData";
function check(req){ return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123"); }
export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  if(req.method!=="DELETE") return res.status(405).end();
  const {id}=req.query;
  let media=[]; try{media=readJson("media")}catch{}
  const item=media.find(m=>m.id===id);
  if(item?.url?.startsWith("/uploads/")){
    const filePath=path.join(process.cwd(),"public",item.url);
    try{ if(fs.existsSync(filePath)) fs.unlinkSync(filePath); }catch{}
  }
  media=media.filter(m=>m.id!==id);
  writeJson("media",media);
  res.json({ok:true});
}