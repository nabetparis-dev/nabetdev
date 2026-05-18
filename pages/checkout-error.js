export default function ErrorPage() {
  return (
    <main className="legalPage" dir="rtl" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>
      <h1>⚠️ שגיאה בתשלום</h1>

      <p>
        אירעה שגיאה במהלך ביצוע התשלום.
      </p>

      <p>
        ניתן לנסות שוב מאוחר יותר או ליצור קשר עם שירות הלקוחות.
      </p>

      <a href="/">
        חזרה לחנות
      </a>
    </main>
  );
}
