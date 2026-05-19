import Head from "next/head";
import Link from "next/link";

export default function WalletLeatherPage() {
  return (
    <main className="legalPage" dir="rtl">
      <Head>
        <title>ארנקי עור | ארנקים יוקרתיים - NABET PARIS</title>
        <meta name="description" content="ארנקי עור יוקרתיים, ארנקים נשלפים ומתנות איכותיות מבית NABET PARIS." />
      </Head>

      <h1>ארנקי עור וארנקים יוקרתיים</h1>

      <p>
        מבחר ארנקי עור, ארנקים נשלפים וארנקים אלגנטיים בעיצוב יוקרתי.
      </p>

      <Link href="/">חזרה לחנות</Link>
    </main>
  );
}
