import Head from "next/head";
import Link from "next/link";

export default function Success() {
  return (
    <main className="legalPage" dir="rtl" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>
      <Head>
        <title>ההזמנה התקבלה | NABET PARIS</title>
      </Head>

      <h1>✅ ההזמנה התקבלה בהצלחה</h1>

      <p>
        תודה שקניתם ב־NABET PARIS.
      </p>

      <p>
        ההזמנה התקבלה ונמצאת כעת בטיפול.
      </p>

      <p>
        לאחר אימות התשלום והמלאי יישלח אישור הזמנה סופי.
      </p>

      <Link href="/">
        חזרה לחנות
      </Link>
    </main>
  );
}
