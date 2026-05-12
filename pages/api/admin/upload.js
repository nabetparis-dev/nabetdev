import fs from "fs";
import path from "path";
import formidable from "formidable";
import sharp from "sharp";
import { readJson, writeJson } from "../../../lib/serverData";

export const config = { api: { bodyParser: false } };

function check(req){
  return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123");
}

function clean(name){
  return String(name||"image")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g,"-")
    .replace(/-+/g,"-")
    .replace(/^-|-$/g,"")
    .slice(0,80);
}

async function optimizeToWebp(inputPath, outputPath){
  await sharp(inputPath)
    .rotate()
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 76, effort: 5 })
    .toFile(outputPath);
}

export default async function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  if(req.method !== "POST") return res.status(405).end();

  const tmpDir = path.join(process.cwd(), "tmp_uploads");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(tmpDir,{recursive:true});
  fs.mkdirSync(uploadDir,{recursive:true});

  const form = formidable({ multiples:true, uploadDir:tmpDir, keepExtensions:true, maxFileSize: 60*1024*1024 });

  form.parse(req, async (err,fields,files)=>{
    if(err) return res.status(500).json({error:err.message});
    try{
      const incoming = files.files || files.file || [];
      const arr = Array.isArray(incoming) ? incoming : [incoming];
      const urls = [];

      for(const file of arr){
        if(!file?.filepath) continue;
        const original = file.originalFilename || file.newFilename || "image";
        const base = `${Date.now()}-${Math.random().toString(16).slice(2)}-${clean(original)}`.replace(/\.[^.]+$/,"");
        const finalName = `${base}.webp`;
        const dest = path.join(uploadDir, finalName);

        try{
          await optimizeToWebp(file.filepath, dest);
          urls.push(`/uploads/${finalName}`);
        }catch(e){
          const ext = path.extname(original) || ".jpg";
          const fallbackName = `${base}${ext}`;
          const fallback = path.join(uploadDir, fallbackName);
          fs.renameSync(file.filepath, fallback);
          urls.push(`/uploads/${fallbackName}`);
        }

        try{ if(fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath); }catch{}
      }

      let media=[]; try{ media=readJson("media"); }catch{}
      const newItems = urls.map(url=>({
        id:`media-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        url,
        name:url.split("/").pop(),
        optimized:true,
        createdAt:new Date().toISOString()
      }));

      writeJson("media",[...newItems,...media]);
      res.json({ok:true,files:urls,media:newItems});
    }catch(e){
      res.status(500).json({error:e.message});
    }
  });
}