import { readJson, writeJson } from "../../../lib/serverData";
import { sendMail, adminEmail } from "../../../lib/mailer";
import { contactAdminTemplate, contactClientTemplate } from "../../../lib/emailTemplates";
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  const {name,email,phone,message,newsletter}=req.body||{};
  if(!name || !phone || !message) return res.status(400).json({error:"חסר שם, טלפון או הודעה"});
  if(newsletter && email){ try{const list=readJson("newsletter"); if(!list.find(x=>x.email===email)) writeJson("newsletter",[{email,name,phone,date:new Date().toISOString()},...list])}catch{} }
  try { const logs = readJson("contactMessages"); writeJson("contactMessages", [{name,email,phone,message,date:new Date().toISOString()}, ...logs].slice(0,300)); } catch { writeJson("contactMessages", [{name,email,phone,message,date:new Date().toISOString()}]); }
  const adminResult=await sendMail({to:adminEmail(),subject:`פנייה חדשה מהאתר - ${name}`,html:contactAdminTemplate({name,email,phone,message}),replyTo:email});
  let clientResult={ok:false}; if(email){ clientResult=await sendMail({to:email,subject:"ההודעה שלכם התקבלה ב-NABET PARIS",html:contactClientTemplate({name})}); }
  res.json({ok:true,adminResult,clientResult});
}