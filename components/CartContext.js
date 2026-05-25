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

  function add(product, qty = 1, options = {}) {
    if (!product || Number(options.stock ?? product.stock ?? 0) <= 0) return 
    const color = options.color || product.selectedColor || "";
    const colorHex = options.colorHex || product.selectedColorHex || "";
    const size = options.size || product.selectedSize || "";
    const variantImage = options.image || product.selectedImage || product.image || (product.images && product.images[0]) || "";
    const variantKey = options.variantKey || [product.id, color, size].filter(Boolean).join("__") || product.id;
    const cartBaseName = product.baseName || product.name;
    const displayName = [cartBaseName, color, size].filter(Boolean).join(" - ");
    const finalPrice = Number(options.price ?? product.price ?? 0);
    const finalOldPrice = Number(options.oldPrice ?? product.oldPrice ?? 0);
    const finalStock = Number(options.stock ?? product.stock ?? 0);
    const cartProduct = { ...product, name: displayName, price: finalPrice, oldPrice: finalOldPrice, stock: finalStock, image: variantImage, images: [variantImage, ...((product.images||[]).filter(x=>x!==variantImage))], selectedColor: color, selectedColorHex: colorHex, selectedSize: size };
    setProductsMap(prev => ({ ...prev, [variantKey]: cartProduct }));
    setItems(prev => {
      const found = prev.find(x => x.key === variantKey);
      if (found) return prev.map(x => x.key === variantKey ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { key: variantKey, id: product.id, qty, color, colorHex, size, image: variantImage }];
    });
    setAddedNotice(displayName || t("addedToCart"));
    clearTimeout(window.__nabetAddedTimer);
    window.__nabetAddedTimer = setTimeout(() => setAddedNotice(null), 2600);
  }

  function changeQty(key, delta) {
    setItems(prev => prev.map(x => (x.key || x.id) === key ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));
  }

  function remove(key) { setItems(prev => prev.filter(x => (x.key || x.id) !== key)); }
  function clear() { setItems([]); try { localStorage.removeItem("nabet_cart"); } catch {} }

  const count = items.reduce((s, x) => s + x.qty, 0);
  const subtotal = items.reduce((s, x) => s + (Number(x.price ?? productsMap[x.key || x.id]?.price ?? productsMap[x.id]?.price ?? 0) * x.qty), 0);
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
const [paymentMode, setPaymentMode] = useState("grow");
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
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  if (!cart) return null;

  const shippingCost = deliveryMode === "shipping" ? cart.shipping : 0;
  const automaticDiscount = cart.count >= 2 ? cart.subtotal * 0.10 : 0;
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const couponPercent =
    normalizedCoupon === "FACEBOOK10" ? 10 :
    normalizedCoupon === "TIKTOK10" ? 10 :
    normalizedCoupon === "NABET10" ? 10 :
    normalizedCoupon === "VIP15" ? 15 :
    0;
  const couponDiscount = couponPercent > 0 ? cart.subtotal * (couponPercent / 100) : 0;
  const discount = Math.max(automaticDiscount, couponDiscount);
  const total = cart.subtotal - discount + shippingCost;

  async function checkout() {
    if (submitting) return;
    if (!cart.items.length) return 
    if (!acceptedTerms) return 
    const required = ["firstName","phone","email","city","street"];
    const missing = required.some(k => !String(customer[k] || "").trim());
    if(missing) return 
    const customerForOrder = {
      ...customer,
      name: `${customer.firstName}`.trim(),
      address: `${customer.street}, ${customer.city}, ישראל`
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
    
      const orderRes = await fetch("/api/orders/create", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          items:cart.items,
          customer:customerForOrder,
          deliveryMode,
          paymentMethod:"card_hyp",
          shipping:shippingCost,
          discount
        })
      });

      const orderData = await orderRes.json().catch(()=>({ok:false,error:"תשובת שרת לא תקינה"}));

      if(!orderRes.ok || !orderData.ok) {
        
        return;
      }
const payRes = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          amount: total,
          orderId: orderData.order.id,
          items: cart.items,
          customer: customerForOrder,
          deliveryMode,
          shipping: shippingCost,
          discount
        })
      });

      const payData = await payRes.json();

      if (!payRes.ok || !payData.url) {
        
        return;
      }

      window.location.href = payData.url;
      return;
    } catch (e) {
      
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
                const p = cart.productsMap[item.key || item.id] || cart.productsMap[item.id];
                const urgent = stockUrgency(p, t);
                if (!p) return null;
                return (
                  <div className="cartItem" key={item.key || item.id}>
                    <img src={item.image || (p.images && p.images[0]) || p.image} alt={p.name} />
                    <div>
                      <b>{item.name || p.name}</b>{(item.color || item.size) && <small className="cartVariantLine">{item.color && <>צבע: {item.color}</>}{item.color && item.size ? " · " : ""}{item.size && <>מידה: {item.size}</>}</small>}<span>{shekel(Number(item.price ?? p.price ?? 0))}</span>
                      {urgent && <em className="cartUrgent">{urgent}</em>}
                      <div className="qty">
                        <button onClick={() => cart.changeQty(item.key || item.id, -1)}>-</button>
                        <strong>{item.qty}</strong>
                        <button onClick={() => cart.changeQty(item.key || item.id, 1)}>+</button>
                        <button className="remove" onClick={() => cart.remove(item.key || item.id)}>{t("remove")}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="customerBox compactCheckoutBox">
              <h3>פרטי משלוח מהירים</h3>
              <input required placeholder="שם פרטי ושם משפחה *" value={customer.firstName} onChange={e=>setCustomer({...customer,firstName:e.target.value})} />
              <input required type="tel" placeholder="טלפון *" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} />
              <input required type="email" placeholder="אימייל לקבלת אישור הזמנה *" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} />
              <input required placeholder="עיר *" value={customer.city} onChange={e=>setCustomer({...customer,city:e.target.value})} />
              <input required placeholder="כתובת מלאה למשלוח — רחוב / מספר בית / דלת *" value={customer.street} onChange={e=>setCustomer({...customer,street:e.target.value})} />
            </div>

<div className="checkoutOptions">

  <h3>אפשרויות משלוח</h3>

  <label className="modernOption">
    <input
      type="radio"
      checked={deliveryMode==="shipping"}
      onChange={()=>setDeliveryMode("shipping")}
    />
    🚚 משלוח עד הבית
  </label>

  <label className="modernOption">
    <input
      type="radio"
      checked={deliveryMode==="pickup"}
      onChange={()=>setDeliveryMode("pickup")}
    />
🏬 איסוף חינם בירושלים
  </label>
<h3>אמצעי תשלום</h3>

<label className="modernOption">
  <input
    type="radio"
    checked={paymentMode==="grow"}
    onChange={()=>setPaymentMode("grow")}
  />
  💳 תשלום בכרטיס אשראי / Apple Pay / Google Pay / bit
</label>

{deliveryMode === "pickup" && (
  <label className="modernOption">
    <input
      type="radio"
      checked={paymentMode==="cod"}
      onChange={()=>setPaymentMode("cod")}
    />
    💵 תשלום בעת קבלת המוצר
  </label>
)}
</div>
            <div className="couponBox">
              <h3>קוד קופון</h3>
              <div className="couponInputRow">
                <input
                  placeholder="הזן קוד קופון"
                  value={couponCode}
                  onChange={e=>{
                    setCouponCode(e.target.value);
                    setCouponMessage("");
                  }}
                />
                <button onClick={()=>{
                  if(couponPercent > 0){
                    setCouponMessage(`🎉 חסכת ${shekel(couponDiscount)} בקנייה הזו`);
                  } else {
                    setCouponMessage("קוד הקופון לא תקין");
                  }
                }}>
                  הפעל קופון
                </button>
              </div>
              {couponMessage && <div className={couponPercent > 0 ? "couponSuccess" : "couponError"}>{couponMessage}</div>}
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
