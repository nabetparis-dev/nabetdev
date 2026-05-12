import { readJson } from "../../../lib/serverData";
export default function handler(req,res){
  const pass = process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123";
  const ok = req.body.password === pass;
  res.json({ok, token: ok ? pass : ""});
}