import Head from "next/head";
import "../styles/globals.css";
import FloatingCheckoutButton from "../components/FloatingCheckoutButton";
import { CartProvider } from "../components/CartContext";
import ShabbatGate from "../components/ShabbatGate";
import ScrollTopButton from "../components/ScrollTopButton";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="google-site-verification" content="3BThLCe0Gv_0_oTq8SMHlwoq0_e1oJSUkSSXUu6_NtI" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RPKL73CDC5"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RPKL73CDC5');
            `,
          }}
        />
      
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              fbq('init', '868126445621384');
              fbq('track', 'PageView');
            `,
          }}
        />

      </Head>

      <CartProvider>
        <ShabbatGate>
          <Component {...pageProps} />
        </ShabbatGate>
        <ScrollTopButton />
        <FloatingCheckoutButton />
      </CartProvider>
    </>
  );
}
