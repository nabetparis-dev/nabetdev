import Head from "next/head";
import Link from "next/link";

export default function SecurityBagsPage() {
  return (
    <main className="legalPage" dir="rtl">
      <Head>
        <title>תיקים לנשק | תיקי עור ותיקים לכוחות הביטחון - NABET PARIS</title>
        <meta name="description" content="תיקי עור ותיקים מקצועיים לנשיאה ואחסון חוקי של ציוד לכוחות הביטחון, מאבטחים ושימוש מקצועי. NABET PARIS." />
      </Head>

      <h1>תיקים לנשק ואביזרי אבטחה</h1>

      <p>
        קטגוריית תיקים מקצועיים לנשיאה ואחסון חוקי של ציוד אישי,
        לכוחות הביטחון, מאבטחים ושימוש מקצועי.
      </p>

      <p>
        המוצרים מיועדים לנשיאה, אחסון ושימוש חוקי בלבד ובהתאם לחוקי מדינת ישראל.
      </p>

      <Link href="/">חזרה לחנות</Link>
    </main>
  );
}
