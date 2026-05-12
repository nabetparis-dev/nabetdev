import fs from "fs";
import path from "path";
import sharp from "sharp";
import { readJson, writeJson } from "../../../lib/serverData";

function check(req){
  return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123");
}

const exts = new Set([".jpg",".jpeg",".png",".webp"]);

function walk(dir){
  let out = [];
  if(!fs.existsSync(dir)) return out;
  for(const item of fs.readdirSync(dir)){
    const p = path.join(dir,item);
    const stat = fs.statSync(p);
    if(stat.isDirectory()) out = out.concat(walk(p));
    else if(exts.has(path.extname(p).toLowerCase())) out.push(p);
  }
  return out;
}

function localUrl(filePath){
  return "/" + path.relative(path.join(process.cwd(),"public"), filePath).replace(/\\/g,"/");
}

async function optimizeFile(filePath){
  const ext = path.extname(filePath).toLowerCase();
  const outputPath = filePath.replace(/\.[^.]+$/, ".webp");

  const before = fs.statSync(filePath).size;

  await sharp(filePath)
    .rotate()
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 76, effort: 5 })
    .toFile(outputPath + ".tmp");

  fs.renameSync(outputPath + ".tmp", outputPath);

  if(filePath !== outputPath && fs.existsSync(filePath)){
    try{ fs.unlinkSync(filePath); }catch{}
  }

  const after = fs.statSync(outputPath).size;
  return {old:localUrl(filePath), url:localUrl(outputPath), before, after};
}

function replaceInJson(name, mapping){
  let data;
  try{ data = readJson(name); }catch{return}
  let txt = JSON.stringify(data);
  for(const m of mapping){
    txt = txt.split(m.old).join(m.url);
  }
  writeJson(name, JSON.parse(txt));
}

export default async function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  if(req.method !== "POST") return res.status(405).end();

  try{
    const base = path.join(process.cwd(),"public","uploads");
    const files = walk(base);
    const mapping = [];
    let beforeTotal = 0;
    let afterTotal = 0;
    let optimized = 0;
    let errors = [];

    for(const file of files){
      try{
        const result = await optimizeFile(file);
        mapping.push(result);
        beforeTotal += result.before;
        afterTotal += result.after;
        optimized++;
      }catch(e){
        errors.push({file:localUrl(file), error:e.message});
      }
    }

    ["products","media","pagesCms","content","categories"].forEach(name=>replaceInJson(name,mapping));

    res.json({
      ok:true,
      optimized,
      errors,
      beforeMB:Math.round(beforeTotal/1024/1024*100)/100,
      afterMB:Math.round(afterTotal/1024/1024*100)/100,
      reductionPercent: beforeTotal ? Math.round((1-afterTotal/beforeTotal)*1000)/10 : 0
    });
  }catch(e){
    res.status(500).json({ok:false,error:e.message});
  }
}