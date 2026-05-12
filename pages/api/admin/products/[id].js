import { readJson, writeJson } from "../../../../lib/serverData";
function check(req){ return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123"); }
export default function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  const { id } = req.query;
  let products = readJson("products");
  if(req.method==="PUT"){
    const i = products.findIndex(p=>p.id===id);
    if(i<0) return res.status(404).json({error:"not found"});
    products[i] = {...products[i], ...req.body, id};
    products[i].price = Number(products[i].price || 0);
    products[i].oldPrice = Number(products[i].oldPrice || 0);
    products[i].stock = Number(products[i].stock || 0);
    writeJson("products", products);
    return res.json({ok:true});
  }
  if(req.method==="DELETE"){
    products = products.filter(p=>p.id!==id);
    writeJson("products", products);
    return res.json({ok:true});
  }
  return res.status(405).end();
}