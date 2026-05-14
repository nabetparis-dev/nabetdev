import Head from "next/head";
import { useState } from "react";
import Header from "../components/Header";
import DynamicSections from "../components/DynamicSections";
import SiteFooter from "../components/SiteFooter";

export async function getServerSideProps() {
  const { readJson } = await import("../lib/serverData");
  return { props: { categories: readJson("categories"), content: readJson("content"), cms: readJson("pagesCms") } };
}

export default function Contact({ categories, content, cms }) {
  const contact = cms.contact || {};
  const [sending, setSending] = useState(false);
  return (
    <>
      <Head><title>{contact.seoTitle || "צור קשר | NABET PARIS"}</title><meta name="description" content={contact.seoDescription || ""} /></Head>
      <Header categories={categories} content={content} cms={cms} />
      <main>
        <DynamicSections sections={contact.sections || []} />
        <section className="contactFormBox">
          <h2>השארת הודעה</h2>
          <form onSubmit={async (e)=>{
            e.preventDefault();
            if (sending) return;
            const form = e.currentTarget;
            const fd = new FormData(form);
            const body = {
              name: fd.get("name"),
              phone: fd.get("phone"),
              email: fd.get("email"),
              message: fd.get("message"),
              newsletter: fd.get("newsletter")==="on"
            };
            setSending(true);
            try {
              const res = await fetch("/api/contact/send", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(body)
              });
              const data = await res.json().catch(()=>({ok:false,error:"תשובת שרת לא תקינה"}));
              if(data.ok){
                if(data.adminResult?.reason === "SMTP_NOT_CONFIGURED" || data.adminResult?.reason === "SMTP_SEND_FAILED"){
                  alert("ההודעה נשמרה באתר, אבל המייל לא נשלח. צריך לבדוק SMTP באדמין.");
                } else {
                  alert("ההודעה נשלחה בהצלחה. תודה שפניתם ל-NABET PARIS.");
                }
                form.reset();
              } else {
                alert(data.error || "שגיאה בשליחת ההודעה");
              }
            } catch (err) {
              alert("שגיאה בשליחת ההודעה: " + err.message);
            } finally {
              setSending(false);
            }
          }}>
            <input name="name" placeholder="שם מלא" required />
            <input name="phone" placeholder="טלפון" required />
            <input name="email" placeholder="אימייל" />
            <textarea name="message" placeholder="הודעה" required />
            <label className="newsletterCheck"><input type="checkbox" name="newsletter" defaultChecked /> אני רוצה לקבל עדכונים ומבצעים מ-NABET PARIS</label>
            <button className="btn red" disabled={sending}>{sending ? "שולח..." : "שליחת הודעה במייל"}</button>
          </form>
        </section>
      </main>
      <SiteFooter cms={cms} />
    </>
  );
}