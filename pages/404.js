import { useEffect } from "react";
import Head from "next/head";

export default function Custom404() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return (
    <main className="legalPage" dir="rtl" style={{
      minHeight:"70vh",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      textAlign:"center",
      padding:"40px"
    }}>
      <Head>
        <title>מעבר לחנות | NABET PARIS</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1>NABET PARIS</h1>
      <p>העמוד לא נמצא. מעבירים אותך לחנות הראשית...</p>
    </main>
  );
}
