import Stripe from "stripe";
import { readJson, siteUrl } from "../../lib/serverData";

export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).end();
  try{
    const apiSettings = (()=>{try{return readJson("apiSettings")}catch{return {}}})();
    const stripeKey = process.env.STRIPE_SECRET_KEY || apiSettings?.stripe?.secretKey || "";
    if(!stripeKey || stripeKey.includes("REPLACE_ME")) {
      return res.status(400).json({error:"תשלום אשראי עדיין לא הוגדר. בחר תשלום בקבלת המוצר או הוסף STRIPE_SECRET_KEY בקובץ .env.local"});
    }
    const stripe = new Stripe(stripeKey);
    const products = readJson("products");
    const cart = req.body.cart || [];
    const totalQty = cart.reduce((s, item) => s + Number(item.qty || 1), 0);
    const line_items = cart.map(item => {
      const p = products.find(x=>x.id===item.id);
      if(!p) throw new Error("מוצר לא נמצא");
      return {
        price_data:{currency:"ils",product_data:{name:p.name,description:p.shortDescription||""},unit_amount:Math.round(Number(p.price)*100)},
        quantity:Number(item.qty||1)
      };
    });

    const shippingCost = Number(req.body.shippingCost || 0);
    if (shippingCost > 0) {
      line_items.push({
        price_data:{currency:"ils",product_data:{name:"דמי משלוח"},unit_amount:Math.round(shippingCost*100)},
        quantity:1
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode:"payment",
      line_items,
      success_url:`${siteUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${siteUrl()}/`,
      customer_creation:"if_required",
      phone_number_collection:{enabled:true},
      discounts: totalQty >= 2 ? [{coupon: await stripe.coupons.create({percent_off:10,duration:"once",name:"10% בקנייה של 2+"}).then(c=>c.id)}] : [],
      billing_address_collection:"auto",
      shipping_address_collection:{allowed_countries:["IL","FR","US","GB"]}
    });
    res.json({url:session.url});
  }catch(e){ res.status(500).json({error:e.message}); }
}