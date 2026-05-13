import Link from "next/link";
import SEO from "../components/SEO";

export default function Custom404(){
  return <main className="notFoundPage" dir="rtl">
    <SEO title="העמוד לא נמצא | NABET PARIS" description="העמוד שחיפשתם לא נמצא. חזרו לחנות NABET PARIS." />
    <section style={{minHeight:"70vh",display:"grid",placeItems:"center",padding:"40px 18px",background:"linear-gradient(135deg,#fff7ed,#ffffff,#fef2f2)"}}>
      <div style={{maxWidth:680,textAlign:"center",background:"#fff",border:"1px solid #ead7bb",borderRadius:28,padding:36,boxShadow:"0 24px 70px rgba(72,45,19,.12)"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:900,color:"#b91c1c",letterSpacing:2}}>NABET PARIS</div>
        <h1 style={{fontSize:54,margin:"12px 0",color:"#111"}}>404</h1>
        <h2 style={{fontSize:28,margin:"0 0 10px"}}>העמוד לא נמצא</h2>
        <p style={{fontSize:18,lineHeight:1.8,color:"#6b5b4a",margin:"0 0 24px"}}>יכול להיות שזה קישור ישן מגוגל. אין בעיה — אפשר לחזור לחנות ולמצוא את המוצרים שלנו.</p>
        <Link href="/" style={{display:"inline-block",background:"#b91c1c",color:"#fff",textDecoration:"none",borderRadius:999,padding:"14px 28px",fontWeight:900}}>חזרה לחנות</Link>
      </div>
    </section>
  </main>
}
