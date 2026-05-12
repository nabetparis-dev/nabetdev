const SITE_URL = "https://www.nabet-paris.com";
const LOGO = "cid:nabet-logo";

function money(n){ return `${Number(n || 0).toLocaleString("he-IL")} ₪`; }

function baseTemplate({title, eyebrow, subtitle, content, buttonText, buttonUrl, footerNote}) {
  return `
  <!doctype html>
  <html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5efe6;font-family:Arial,Helvetica,sans-serif;color:#191512;direction:rtl;text-align:right;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5efe6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#ffffff;border-radius:30px;overflow:hidden;border:1px solid #e7d5b8;box-shadow:0 24px 80px rgba(72,45,19,.14);">
            <tr>
              <td style="background:linear-gradient(135deg,#111 0%,#2a211b 58%,#7f1d1d 100%);padding:34px 28px;text-align:center;">
                <a href="${SITE_URL}" style="text-decoration:none;">
                  <img src="${LOGO}" width="220" alt="NABET PARIS" style="display:block;margin:0 auto 16px;max-width:220px;height:auto;border:0;"/><div style="font-size:12px;color:#f7ead6;">NABET PARIS</div>
                </a>
                <div style="color:#d8b56a;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-family:Georgia,serif;">NABET PARIS</div>
                <h1 style="margin:14px 0 0;color:#fff;font-size:32px;line-height:1.25;font-weight:800;font-family:Georgia,serif;">${title}</h1>
                ${subtitle ? `<p style="margin:12px auto 0;color:#f7ead6;font-size:18px;line-height:1.65;max-width:620px;">${subtitle}</p>` : ""}
              </td>
            </tr>

            <tr>
              <td style="padding:30px;">
                ${eyebrow ? `<div style="display:inline-block;background:#fff3e2;border:1px solid #ead7bb;color:#7a4b12;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:900;margin-bottom:18px;">${eyebrow}</div>` : ""}

                <div style="background:#fffaf4;border:1px solid #ead7bb;border-radius:24px;padding:24px;line-height:1.85;font-size:17px;color:#2a221c;">
                  ${content}
                </div>

                ${buttonText && buttonUrl ? `
                <div style="text-align:center;margin:30px 0 18px;">
                  <a href="${buttonUrl}" style="display:inline-block;background:#b91c1c;color:#fff;text-decoration:none;border-radius:999px;padding:16px 30px;font-size:17px;font-weight:900;box-shadow:0 16px 34px rgba(185,28,28,.24);">${buttonText}</a>
                </div>` : ""}

                <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                  <tr>
                    <td style="padding:8px;">
                      <div style="background:#111;color:#fff;border-radius:18px;padding:18px;text-align:center;font-weight:900;">🧳 מזוודות פרימיום</div>
                    </td>
                    <td style="padding:8px;">
                      <div style="background:#111;color:#fff;border-radius:18px;padding:18px;text-align:center;font-weight:900;">🎒 תיקי גב</div>
                    </td>
                    <td style="padding:8px;">
                      <div style="background:#111;color:#fff;border-radius:18px;padding:18px;text-align:center;font-weight:900;">👛 ארנקים</div>
                    </td>
                  </tr>
                </table>

                <p style="margin:22px 0 0;color:#7c6b5c;font-size:14px;line-height:1.7;text-align:center;">
                  ${footerNote || "NABET PARIS — איכות פרימיום, מחירי אאוטלט ושירות אישי."}
                </p>
                <p style="margin:8px 0 0;text-align:center;">
                  <a href="${SITE_URL}" style="color:#b91c1c;font-weight:900;text-decoration:none;">www.nabet-paris.com</a>
                </p>
              </td>
            </tr>
          </table>

          <div style="max-width:760px;margin:14px auto 0;color:#8a7a68;font-size:12px;line-height:1.6;text-align:center;">
            הודעה אוטומטית מאתר NABET PARIS. האתר מאובטח ב-HTTPS.
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

export function contactAdminTemplate({name,email,phone,message}) {
  return baseTemplate({
    title:"פנייה חדשה מהאתר",
    eyebrow:"צור קשר",
    subtitle:"לקוח שלח הודעה דרך טופס צור קשר באתר NABET PARIS.",
    content:`
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;"><b>שם הלקוח:</b> ${name || "-"}</td></tr>
        <tr><td style="padding:8px 0;"><b>טלפון:</b> ${phone || "-"}</td></tr>
        <tr><td style="padding:8px 0;"><b>אימייל:</b> ${email || "-"}</td></tr>
      </table>
      <hr style="border:0;border-top:1px solid #ead7bb;margin:18px 0"/>
      <div style="white-space:pre-wrap;">${message || ""}</div>
    `,
    buttonText:"השב ללקוח",
    buttonUrl:`mailto:${email || ""}`,
    footerNote:"פנייה חדשה לטיפול מהיר — שירות לקוחות NABET PARIS."
  });
}

export function contactClientTemplate({name}) {
  return baseTemplate({
    title:"ההודעה שלכם התקבלה",
    eyebrow:"NABET PARIS",
    subtitle:`שלום ${name || ""}, תודה שפניתם אלינו. ההודעה שלכם התקבלה בהצלחה.`,
    content:`
      <p style="margin:0 0 12px;">קיבלנו את הפנייה שלכם ונחזור אליכם בהקדם.</p>
      <p style="margin:0 0 12px;">בינתיים אתם מוזמנים להיכנס לאתר ולגלות מוצרי פרימיום במחירי אאוטלט: מזוודות, תיקי גב, ארנקים ואביזרי נסיעות.</p>
      <p style="margin:0;color:#b91c1c;font-weight:900;">הירשמו לעדכונים כדי לקבל ראשונים מבצעים, קולקציות חדשות והטבות מיוחדות.</p>
    `,
    buttonText:"כניסה לחנות",
    buttonUrl:SITE_URL
  });
}

export function orderAdminTemplate(order) {
  const rows = (order.items || []).map(i => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #ead7bb;">
        <b>${i.name}</b><br/>
        <small style="color:#7c6b5c;">ID: ${i.id}</small><br/>
        <a href="${SITE_URL}/product/${i.id}" style="color:#b91c1c;font-weight:900;text-decoration:none;">קישור למוצר</a>
      </td>
      <td style="padding:12px;border-bottom:1px solid #ead7bb;text-align:center;font-weight:900;">${i.qty}</td>
      <td style="padding:12px;border-bottom:1px solid #ead7bb;font-weight:900;">${money(i.total)}</td>
    </tr>`).join("");

  return baseTemplate({
    title:`הזמנה חדשה ${order.id}`,
    eyebrow:"ניהול הזמנות",
    subtitle:"התקבלה הזמנה חדשה באתר. יש לתאם עם הלקוח זמינות למסירה / איסוף.",
    content:`
      <div style="background:#fff;border:1px solid #ead7bb;border-radius:18px;padding:16px;margin-bottom:18px;">
        <p style="margin:0 0 8px;"><b>לקוח:</b> ${order.customer?.name || "-"}</p>
        <p style="margin:0 0 8px;"><b>טלפון:</b> ${order.customer?.phone || "-"}</p>
        <p style="margin:0 0 8px;"><b>אימייל:</b> ${order.customer?.email || "-"}</p>
        <p style="margin:0;"><b>כתובת / הערות:</b> ${order.customer?.address || "-"}</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border-radius:18px;overflow:hidden;">
        <tr style="background:#111;color:#fff;">
          <th style="padding:12px;text-align:right;">מוצר</th>
          <th style="padding:12px;text-align:center;">כמות</th>
          <th style="padding:12px;text-align:right;">סה״כ</th>
        </tr>
        ${rows}
      </table>
      <h2 style="color:#b91c1c;margin:20px 0 0;">סה״כ הזמנה: ${money(order.total)}</h2>
      <p style="font-weight:900;margin:10px 0 0;">תשלום: ${order.paymentMethod === "grow" ? "כרטיס אשראי" : "בעת קבלת ההזמנה / במקום"}</p>
    `,
    buttonText:"שליחת WhatsApp ללקוח",
    buttonUrl:`https://wa.me/${String(order.customer?.phone || "").replace(/\D/g,"")}`,
    footerNote:"הזמנה חדשה — נא לטפל במהירות ולשמור על חוויית שירות יוקרתית."
  });
}

export function orderClientTemplate(order) {
  const rows = (order.items || []).map(i => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #ead7bb;"><b>${i.name}</b></td>
      <td style="padding:12px;border-bottom:1px solid #ead7bb;text-align:center;font-weight:900;">${i.qty}</td>
      <td style="padding:12px;border-bottom:1px solid #ead7bb;font-weight:900;">${money(i.total)}</td>
    </tr>`).join("");

  return baseTemplate({
    title:"תודה על ההזמנה",
    eyebrow:`מספר הזמנה: ${order.id}`,
    subtitle:"ההזמנה שלכם התקבלה בהצלחה ב-NABET PARIS.",
    content:`
      <p style="margin:0 0 16px;font-size:18px;">תודה על האמון. אנחנו מטפלים בהזמנה שלכם ונעשה הכל כדי למסור אותה במהירות ובשירות הטוב ביותר.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border-radius:18px;overflow:hidden;">
        <tr style="background:#111;color:#fff;">
          <th style="padding:12px;text-align:right;">מוצר</th>
          <th style="padding:12px;text-align:center;">כמות</th>
          <th style="padding:12px;text-align:right;">סה״כ</th>
        </tr>
        ${rows}
      </table>
      <h2 style="color:#b91c1c;margin:20px 0 0;">סה״כ לתשלום: ${money(order.total)}</h2>
      <p style="margin:12px 0 0;font-weight:900;">שיטת תשלום: ${order.paymentMethod === "grow" ? "כרטיס אשראי" : "בעת קבלת ההזמנה / במקום"}</p>
      <p style="margin:12px 0 0;">לסיום התיאום, שלחו לנו ב-WhatsApp את הזמינות שלכם לקבלת / איסוף ההזמנה.</p>
    `,
    buttonText:"תיאום זמינות ב-WhatsApp",
    buttonUrl:`https://wa.me/972538298484?text=${encodeURIComponent(`שלום NABET PARIS, מספר הזמנה ${order.id}. אני רוצה לתאם זמינות לקבלת / איסוף ההזמנה:`)}`,
    footerNote:"NABET PARIS — תודה שבחרתם בנו."
  });
}