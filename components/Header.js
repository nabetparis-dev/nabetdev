import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function Header({ categories = [], content = {}, cms = {} }) {
  const cart = useCart();
  const [menuOpen,setMenuOpen] = useState(false);
  const header = cms.header || {};
  const menuItems = header.menuItems || [];

  function close(){ setMenuOpen(false); }

  return (
   <header>
      <div className="topbar">{header.topbar || content.topbar || "NABET PARIS"}</div>
      <div className="nav">
        <Link href="/" className="brand" aria-label="NABET PARIS" onClick={close}>
          <img src={header.logo || "/logo-nabet.png"} alt="NABET PARIS" className="brandLogo" />
        </Link>

        <button className={`mobileMenuBtn ${menuOpen ? "active" : ""}`} onClick={()=>setMenuOpen(v=>!v)} type="button" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>

        <nav className={menuOpen ? "open mobileNavOpen" : ""}>
          {menuItems.map((m, i) =>
            m.newTab
              ? <a key={i} href={m.url || "#"} target="_blank" rel="noopener" onClick={close}>{m.label}</a>
              : <Link key={i} href={m.url || "#"} onClick={close}>{m.label}</Link>
          )}
        </nav>

        <button className="cartButton" onClick={() => {cart?.setOpen(true); setMenuOpen(false);}}>
          עגלה <b>{cart?.count || 0}</b>
        </button>
      </div>
    </header>
  );
}
