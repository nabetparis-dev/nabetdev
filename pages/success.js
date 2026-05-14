import Head from "next/head";
import Link from "next/link";
export default function Success(){
  return <main className="success"><Head><title>תודה על ההזמנה | NABET PARIS</title></Head><h1>תודה על ההזמנה שלך</h1><p>התשלום התקבל בהצלחה. נשלח אליך אישור הזמנה במייל.</p><Link className="btn red" href="/">חזרה לחנות</Link></main>;
}