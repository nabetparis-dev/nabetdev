import { useEffect, useState } from "react";

export default function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 420);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`scrollTopButton ${show ? "show" : ""}`}
      onClick={() => window.scrollTo({top:0, behavior:"smooth"})}
      aria-label="חזרה למעלה"
      type="button"
    >
      ↑
    </button>
  );
}