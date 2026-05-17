import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ShabbatGate({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let alive = true;

    async function check() {
      try {
        const res = await fetch("/api/shabbat-status", { cache: "no-store" });
        const data = await res.json();
        if (alive) setStatus(data);
      } catch {
        if (alive) setStatus({ closed: false });
      }
    }

    check();
    const id = setInterval(check, 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const path = router?.pathname || "";
  const allow =
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next");

  if (allow) return children;
  if (!status || !status.closed) return children;

  return (
    <main className="shabbatClosedPage" dir="rtl">
      <div className="shabbatCard">
        {status.image ? (
          <div className="shabbatHeroImage" style={{backgroundImage:`url(${status.image})`}} aria-hidden="true" />
        ) : (
          <div className="shabbatVisual" aria-hidden="true">
            <div className="candle c1"><span></span></div>
            <div className="candle c2"><span></span></div>
            <div className="challah"></div>
          </div>
        )}
        <img src={status.logo || "/logo-nabet.png"} alt="NABET PARIS" />
        <div className="shabbatBadge">{status.badge || "שבת שלום"}</div>
        <h1>{status.title || "האתר סגור כעת לכבוד שבת"}</h1>
        <p>{status.message || "האתר סגור כעת לכבוד שבת וייפתח בצאת השבת."}</p>
        <div className="shabbatTimeBox">
          <span>האתר ייפתח בצאת שבת:</span>
          <b>{status.opensAtText || status.havdalahText || "בקרוב"}</b>
        </div>
        {status.saleText && <div className="shabbatSaleBox">{status.saleText}</div>}
        {status.smallText && <p className="shabbatSmall">{status.smallText}</p>}
      </div>
    </main>
  );
}