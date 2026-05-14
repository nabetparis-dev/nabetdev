import { readJson } from "../../lib/serverData";
function safe(name, fallback){ try { return readJson(name); } catch { return fallback; } }
export default function handler(req,res){
  const settings = safe("settings", {});
  delete settings.adminPassword;
  res.json({
    products:safe("products",[]),
    categories:safe("categories",[]),
    content:safe("content",{}),
    settings,
    pagesCms:safe("pagesCms",{}),
    orders:safe("orders",[]),
    customers:safe("customers",[]),
    coupons:safe("coupons",[]),
    media:safe("media",[]),
    apiSettings:safe("apiSettings",{}),
    socialSettings:safe("socialSettings",{}),
    designSettings:safe("designSettings",{}),
    translations:safe("translations",{})
  });
}