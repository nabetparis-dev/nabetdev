import { useCart } from "./CartContext";

export default function FloatingCheckoutButton(){
  const cart = useCart();
  const items = cart?.items || [];
  const count = items.reduce((sum,item)=>sum + (item.qty || 1), 0);

  if(count < 1 || cart?.open) return null;

  return (
    <button
      type="button"
      className="floatingCheckoutBtn"
      onClick={() => cart.setOpen(true)}
    >
      🔥 תשלום בקופה
    </button>
  );
}
