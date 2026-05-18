export default function CancelPage() {
  return (
    <main className="legalPage" dir="rtl" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>
      <h1>❌ התשלום בוטל</h1>

      <p>
        נראה שהתשלום לא הושלם או בוטל.
      </p>

      <p>
        ניתן לנסות שוב או לחזור לחנות.
      </p>

      <a href="/">
        חזרה לחנות
      </a>
    </main>
  );
}
