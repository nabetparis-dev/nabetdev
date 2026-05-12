import nodemailer from "nodemailer";
import path from "path";
import { readJson, writeJson } from "./serverData";

export function adminEmail(){
  try {
    const api = readJson("apiSettings");
    return api.email?.adminEmail || api.email?.fromEmail || "nabet.paris@gmail.com";
  } catch {
    return "nabet.paris@gmail.com";
  }
}

function logEmail(entry) {
  try {
    const logs = readJson("emailLogs");
    writeJson("emailLogs", [entry, ...logs].slice(0, 500));
  } catch {
    try { writeJson("emailLogs", [entry]); } catch {}
  }
}

export async function sendMail({to, subject, html, replyTo}) {
  let api = {};
  try { api = readJson("apiSettings"); } catch {}

  const email = api.email || {};
  const admin = adminEmail();
  const from = email.fromEmail || process.env.SMTP_FROM || admin || "nabet.paris@gmail.com";

  const smtpHost = email.smtpHost || process.env.SMTP_HOST || "";
  const smtpPort = String(email.smtpPort || process.env.SMTP_PORT || "465");
  const smtpUser = email.smtpUser || process.env.SMTP_USER || "";
  const smtpPass = email.smtpPass || process.env.SMTP_PASS || "";

  const log = {to, subject, html, replyTo, date:new Date().toISOString(), sent:false};

  if (!smtpHost || !smtpUser || !smtpPass) {
    logEmail({...log, note:"SMTP_NOT_CONFIGURED"});
    return {ok:false, stored:true, reason:"SMTP_NOT_CONFIGURED"};
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `NABET PARIS Official <${from}>`,
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
      attachments: [
        {
          filename: "logo-nabet.png",
          path: path.join(process.cwd(), "public", "logo-nabet.png"),
          cid: "nabet-logo"
        }
      ]
    });

    logEmail({...log, sent:true});
    return {ok:true};
  } catch (e) {
    logEmail({...log, sent:false, error:e.message, note:"SMTP_SEND_FAILED"});
    return {ok:false, stored:true, reason:"SMTP_SEND_FAILED", error:e.message};
  }
}