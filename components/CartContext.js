import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { shekel } from "../lib/format";
import { useLang } from "./LanguageContext";

const CartContext = createContext(null);
const SHIPPING_PER_ORDER = 59.9;

function stockUrgency(p, t){
  if(!p) return "";
  if(p.stock <= 0) return t("outOfStock");
  if(p.urgentText) return p.urgentText;
  if(p.showStockUrgency === false) return "";
  if(Number(p.stock) === 1) return t("lastStock");
  if(Number(p.stock) <= 3) return t("limitedStock");
  return "";
}

export function CartProvider({ children }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [productsMap, setProductsMap] = useState({});
  const [addedNotice, setAddedNotice] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nabet_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("nabet_cart", JSON.stringify(items)); } catch {}
  }, [items]);

  function registerProducts(products = []) {
    const map = {};
    products.forEach(p => map[p.id] = p);
    setProductsMap(prev => ({ ...prev, ...map }));
  }

  function add(product, qty = 1) {
    if (!product || product.stock <= 0) return alert(t("productUnavailable"));
    setProductsMap(prev => ({ ...prev, [product.id]: product }));
    setItems(prev => {
      const found = prev.find(x => x.id === product.id);
      if (found) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { id: product.id, qty }];
    });
    setAddedNotice(product.name || t("addedToCart"));
    clearTimeout(window.__nabetAddedTimer);
    window.__nabetAddedTimer = setTimeout(() => setAddedNotice(null), 2600);
  }

  function changeQty(id, delta) {
    setItems(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));
  }

  function remove(id) { setItems(prev => prev.filter(x => x.id !== id)); }
  function clear() { setItems([]); try { localStorage.removeItem("nabet_cart"); } catch {} }

  const count = items.reduce((s, x) => s + x.qty, 0);
  const subtotal = items.reduce((s, x) => s + ((productsMap[x.id]?.price || 0) * x.qty), 0);
  const shipping = count > 0 ? SHIPPING_PER_ORDER : 0;

  const value = useMemo(() => ({
    items, productsMap, open, setOpen, add, changeQty, remove, clear, count, subtotal, shipping, registerProducts, addedNotice, setAddedNotice
  }), [items, productsMap, open, count, subtotal, shipping, addedNotice]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {addedNotice && (
        <div className="addedNotice">
          <div>
            <b>נוסף לעגלה</b>
            <span>{addedNotice}</span>
          </div>
          <button onClick={() => { setOpen(true); setAddedNotice(null); }}>צפייה בעגלה</button>
          <button className="addedClose" onClick={() => setAddedNotice(null)}>×</button>
        </div>
      )}
      <CartDrawer />
      <a className="whatsappFloat" href="https://wa.me/972538298484" target="_blank" rel="noopener">WhatsApp</a>
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }

function CartDrawer() {
  const cart = useCart();
  const { t } = useLang();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState("shipping");
  const [paymentMode, setPaymentMode] = useState("cod");
  const [customer, setCustomer] = useState({
    firstName:"",
    lastName:"",
    street:"",
    apartment:"",
    city:"",
    postalCode:"",
    country:"ישראל",
    phone:"",
    email:""
  });
  const [submitting, setSubmitting] = useState(false);
  if (!cart) return null;

  const shippingCost = deliveryMode === "shipping" ? cart.shipping : 0;
  const discount = cart.count >= 2 ? cart.subtotal * 0.10 : 0;
  const total = cart.subtotal - discount + shippingCost;

  async function checkout() {
    if (submitting) return;
    if (!cart.items.length) return alert(t("alertEmpty"));
    if (!acceptedTerms) return alert(t("alertTerms"));
    const required = ["firstName","lastName","street","apartment","city","postalCode","phone","email"];
    const missing = required.some(k => !String(customer[k] || "").trim());
    if(missing) return alert("נא למלא את כל פרטי הלקוח: שם, משפחה, כתובת, דלת, עיר, מיקוד, טלפון ואימייל");
    const customerForOrder = {
      ...customer,
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      address: `${customer.street}, ${customer.apartment}, ${customer.city}, ${customer.postalCode}, ישראל`
    };

    setSubmitting(true);
    try {
      if (paymentMode === "cod") {
        const orderRes = await fetch("/api/orders/create", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({items:cart.items, customer:customerForOrder, deliveryMode, paymentMethod:"cod", shipping:shippingCost, discount})
        });
        const orderData = await orderRes.json().catch(()=>({ok:false,error:"תשובת שרת לא תקינה"}));
        if(!orderRes.ok || !orderData.ok) {
          alert(orderData.error || "שגיאה ביצירת ההזמנה");
          return;
        }
        const order = orderData.order;
        const msg = encodeURIComponent(
          `שלום NABET PARIS, אישרתי את ההזמנה מספר ${order.id}.\n` +
          `אני רוצה לתאם זמינות לקבלת / איסוף ההזמנה הכי מהר שאפשר.\n` +
          `שם: ${customerForOrder.name}\nטלפון: ${customerForOrder.phone}\nכתובת: ${customerForOrder.address}\n` +
          `שיטת אספקה: ${deliveryMode === "pickup" ? "איסוף עצמי" : "משלוח"}\n` +
          `סה״כ: ${shekel(total)}\n` +
          `הזמינות שלי: `
        );
        cart.clear();
        cart.setOpen(false);
        window.location.href = `/order/thank-you?id=${order.id}&total=${encodeURIComponent(total)}&wa=${msg}`;
        return;
      }

      if(paymentMode === "grow"){
        const orderRes = await fetch("/api/orders/create", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({items:cart.items, customer:customerForOrder, deliveryMode, paymentMethod:"grow", shipping:shippingCost, discount})
        });
        const orderData = await orderRes.json().catch(()=>({ok:false,error:"תשובת שרת לא תקינה"}));
        if(!orderRes.ok || !orderData.ok) {
          alert(orderData.error || "שגיאה ביצירת ההזמנה");
          return;
        }
        const res = await fetch("/api/grow-checkout", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({orderId:orderData.order.id})
        });
        const data = await res.json().catch(()=>({}));
        if(data.url) window.location.href = data.url;
        else alert(data.error || "תשלום בכרטיס אשראי עדיין לא מוגדר באדמין");
        return;
      }
    } catch (e) {
      alert("שגיאה בשליחת ההזמנה: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={`cartShade ${cart.open ? "show" : ""}`} onClick={() => cart.setOpen(false)} />
      <aside className={`cartDrawer ${cart.open ? "open" : ""}`}>
        <div className="cartHead">
          <div><small>NABET PARIS</small><h2>{t("cartTitle")}</h2></div>
          <button className="continueShopBtn" onClick={() => cart.setOpen(false)}>חזרה לחנות</button><button className="x" onClick={() => cart.setOpen(false)} aria-label="סגור עגלה">×</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="emptyCart"><b>{t("emptyCart")}</b><p>{t("emptyCartText")}</p></div>
        ) : (
          <>
            <div className="cartList">
              {cart.items.map(item => {
                const p = cart.productsMap[item.id];
                const urgent = stockUrgency(p, t);
                if (!p) return null;
                return (
                  <div className="cartItem" key={item.id}>
                    <img src={(p.images && p.images[0]) || p.image} alt={p.name} />
                    <div>
                      <b>{p.name}</b><span>{shekel(p.price)}</span>
                      {urgent && <em className="cartUrgent">{urgent}</em>}
                      <div className="qty">
                        <button onClick={() => cart.changeQty(item.id, -1)}>-</button>
                        <strong>{item.qty}</strong>
                        <button onClick={() => cart.changeQty(item.id, 1)}>+</button>
                        <button className="remove" onClick={() => cart.remove(item.id)}>{t("remove")}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="customerBox">
              <h3>פרטי לקוח למשלוח</h3>
              <div className="checkoutGrid two">
                <input required placeholder="שם פרטי *" value={customer.firstName} onChange={e=>setCustomer({...customer,firstName:e.target.value})} />
                <input required placeholder="שם משפחה *" value={customer.lastName} onChange={e=>setCustomer({...customer,lastName:e.target.value})} />
              </div>
              <input required placeholder="כתובת — רחוב / סמטה / מספר בית *" value={customer.street} onChange={e=>setCustomer({...customer,street:e.target.value})} />
              <input required placeholder="דירה / קומה / דלת *" value={customer.apartment} onChange={e=>setCustomer({...customer,apartment:e.target.value})} />
              <div className="checkoutGrid two">
                <input required placeholder="עיר *" value={customer.city} onChange={e=>setCustomer({...customer,city:e.target.value})} />
                <input required placeholder="מיקוד *" value={customer.postalCode} onChange={e=>setCustomer({...customer,postalCode:e.target.value})} />
              </div>
              <input value="ישראל" readOnly className="countryLocked" aria-label="Pays Israël" />
              <input required type="tel" placeholder="טלפון *" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} />
              <input required type="email" placeholder="אימייל *" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} />
            </div>

            <div className="checkoutOptions">
              <h3>{t("deliveryOptions")}</h3>
              <label><input type="radio" checked={deliveryMode==="shipping"} onChange={()=>setDeliveryMode("shipping")} /> {t("homeDelivery")}</label>
              <label><input type="radio" checked={deliveryMode==="pickup"} onChange={()=>setDeliveryMode("pickup")} /> {t("pickup")}</label>
              <h3>{t("paymentOptions")}</h3>
              <label><input type="radio" checked={paymentMode==="cod"} onChange={()=>setPaymentMode("cod")} /> {t("payOnReceive")}</label>
              <label><input type="radio" checked={paymentMode==="grow"} onChange={()=>setPaymentMode("grow")} /> תשלום בכרטיס אשראי</label>
            </div>

            <div className="cartTotal"><span>{t("productsAmount")}</span><b>{shekel(cart.subtotal)}</b></div>
            <div className="cartTotal soft"><span>{t("shipping")}</span><b>{shekel(shippingCost)}</b></div>
            {discount > 0 && <div className="cartTotal discountLine"><span>{t("discountLine")}</span><b>-{shekel(discount)}</b></div>}
            {discount === 0 && <div className="cartUpsellHint">{t("upsell")}</div>}
            <div className="cartTotal grand"><span>{t("total")}</span><b>{shekel(total)}</b></div>

            <label className="termsAccept">
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
              <span><a href="/terms" target="_blank" rel="noopener">{t("terms")}</a></span>
            </label>

            <button className="checkoutBtn" onClick={checkout} disabled={submitting}>
              {submitting ? "שולח הזמנה..." : (paymentMode === "cod" ? t("validateOrder") : "תשלום בכרטיס אשראי")}
            </button>
            <p className="cartNote">{t("cartNote")}</p>
          </>
        )}
      </aside>
    </>
  );
}