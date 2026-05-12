import { readJson, writeJson } from "../../../../lib/serverData";

function check(req){
  return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123");
}

export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  const { id } = req.query;
  let categories = readJson("categories");

  if(req.method === "PUT"){
    const i = categories.findIndex(c => c.id === id);
    if(i < 0) return res.status(404).json({error:"קטגוריה לא נמצאה"});
    categories[i] = {...categories[i], ...req.body, id};
    categories[i].order = Number(categories[i].order || 0);
    writeJson("categories", categories);
    return res.json({ok:true, category:categories[i]});
  }

  if(req.method === "DELETE"){
    const products = readJson("products");
    const used = products.some(p => p.categoryId === id);
    if(used) return res.status(400).json({error:"אי אפשר למחוק קטגוריה שיש בה מוצרים. קודם שנה את קטגוריית המוצרים או מחק אותם."});
    categories = categories.filter(c => c.id !== id);
    writeJson("categories", categories);
    return res.json({ok:true});
  }

  return res.status(405).end();
}