import "../styles/globals.css";
import { CartProvider } from "../components/CartContext";
import ShabbatGate from "../components/ShabbatGate";
import ScrollTopButton from "../components/ScrollTopButton";

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <ShabbatGate><Component {...pageProps} /></ShabbatGate>
    <ScrollTopButton />
    </CartProvider>
  );
}