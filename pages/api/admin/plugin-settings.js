import { readJson, writeJson } from "../../../lib/serverData";
function check(req){ return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123"); }
function safe(n,f){ try{return readJson(n)}catch{return f} }
export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  if(req.method==="GET") return res.json({apiSettings:safe("apiSettings",{}),socialSettings:safe("socialSettings",{}),designSettings:safe("designSettings",{}),coupons:safe("coupons",[]),translations:safe("translations",{})});
  if(req.method==="PUT"){
    const b=req.body||{};
    if(b.apiSettings) writeJson("apiSettings",b.apiSettings);
    if(b.socialSettings) writeJson("socialSettings",b.socialSettings);
    if(b.designSettings) writeJson("designSettings",b.designSettings);
    if(b.coupons) writeJson("coupons",b.coupons);
    if(b.translations) writeJson("translations",b.translations);
    res.json({ok:true});
  } else res.status(405).end();
}