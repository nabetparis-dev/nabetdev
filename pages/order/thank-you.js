import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";

export default function ThankYou(){
  const {query}=useRouter(); const id=query.id||""; const total=query.total||""; const wa=query.wa||"";
  const waUrl = `https://wa.me/972538298484?text=${wa || encodeURIComponent(`שלום NABET PARIS, אישרתי את ההזמנה מספר ${id}. אני רוצה לתאם זמינות לקבלת / איסוף ההזמנה הכי מהר שאפשר:`)}`;
  useEffect(()=>{ if(id){ const t=setTimeout(()=>{ try{ window.open(waUrl, "_blank"); }catch{} }, 1200); return ()=>clearTimeout(t); } }, [id]);
  return <main className="thankYouPage" dir="rtl"><div className="thankCard">
    <img src="/logo-nabet.png" alt="NABET PARIS" />
    <h1>הזמנתך התקבלה בהצלחה</h1>
    <p>תודה על האמון ב-NABET PARIS. אנחנו נעשה הכל כדי למסור לך את ההזמנה במהירות ובשירות הטוב ביותר.</p>
    <div className="orderNumber">מספר הזמנה: <b>{id}</b></div>
    {total && <div className="orderNumber">סה״כ לתשלום: <b>{total} ₪</b></div>}
    <p>כדי לסיים את התיאום, שלחו לנו עכשיו ב-WhatsApp את הזמינות שלכם לקבלת / איסוף ההזמנה.</p>
    <a className="btn red" href={waUrl} target="_blank" rel="noopener">תיאום זמינות ב-WhatsApp</a>
    <Link className="btn light" href="/">חזרה לחנות</Link>
  </div></main>
}