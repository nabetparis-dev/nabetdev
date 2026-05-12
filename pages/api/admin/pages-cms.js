import { readJson, writeJson } from "../../../lib/serverData";

function check(req){
  return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123");
}

export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  if(req.method === "PUT"){
    writeJson("pagesCms", req.body);
    return res.json({ok:true});
  }
  return res.status(405).end();
}