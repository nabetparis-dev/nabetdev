import { sendMail, adminEmail } from "../../lib/mailer";

export default async function handler(req, res) {
  const to = req.query.to || adminEmail();
  const result = await sendMail({
    to,
    subject: "בדיקת מייל NABET PARIS",
    html: `
      <div style="font-family:Arial;background:#fff8ee;padding:30px;direction:rtl;text-align:right">
        <div style="max-width:640px;margin:auto;background:#fff;border-radius:24px;padding:28px;border:1px solid #ead7bb">
          <h1 style="color:#111">NABET PARIS</h1>
          <p>בדיקת מייל מהאתר.</p>
          <p>אם קיבלת את ההודעה הזאת, SMTP מוגדר נכון.</p>
        </div>
      </div>`
  });
  res.status(result.ok ? 200 : 500).json({ ok: result.ok, result });
}