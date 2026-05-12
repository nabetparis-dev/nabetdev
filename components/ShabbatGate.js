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
        <img src="/logo-nabet.png" alt="NABET PARIS" />
        <div className="shabbatBadge">שבת שלום</div>
        <h1>האתר סגור כעת לכבוד שבת</h1>
        <p>{status.message || "האתר סגור כעת לכבוד שבת וייפתח בצאת השבת."}</p>
        <div className="shabbatTimeBox">
          <span>האתר ייפתח בצאת שבת:</span>
          <b>{status.opensAtText || status.havdalahText}</b>
        </div>
        <p className="shabbatSmall">
          תודה על ההבנה. נשמח לראותכם שוב לאחר צאת השבת.
        </p>
      </div>
    </main>
  );
}