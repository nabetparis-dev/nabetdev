import { readJson, writeJson } from "../../../lib/serverData";
import { sendMail, adminEmail } from "../../../lib/mailer";
import { orderAdminTemplate, orderClientTemplate } from "../../../lib/emailTemplates";

export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).end();
  const products = readJson("products");
  const orders = readJson("orders");
  const body = req.body || {};
  const items = (body.items || body.cart || []).map(item => {
    const p = products.find(x => x.id === item.id);
    const qty = Number(item.qty || 1);
    const price = Number(p?.price || item.price || 0);
    return {id:item.id,name:p?.name||item.name||item.id,image:p?.image||"",price,qty,total:price*qty};
  });
  const subtotal = items.reduce((s,i)=>s+i.total,0);
  const discount = Number(body.discount || 0);
  const shipping = Number(body.shipping || body.shippingCost || 0);
  const total = Math.max(0, subtotal - discount + shipping);
  const deliveryMode = body.deliveryMode || "shipping";
  const paymentMethod = body.paymentMethod || body.paymentMode || "cod";
  const order = {
    id:`NP-${Date.now()}`,
    date:new Date().toISOString(),
    status: paymentMethod==="cod" ? "confirmed" : "pending",
    paymentStatus: paymentMethod==="cod" ? "pay_on_receive" : "unpaid",
    paymentMethod,
    deliveryMode,
    customer: body.customer || {name:"",phone:"",email:"",address:""},
    items, subtotal, discount, shipping, total,
    notes: body.notes || ""
  };
  orders.unshift(order);
  writeJson("orders", orders);

  const adminMail = await sendMail({to:adminEmail(),subject:`הזמנה חדשה ${order.id} - NABET PARIS`,html:orderAdminTemplate(order),replyTo:order.customer?.email});
  let clientMail = {ok:false};
  if(order.customer?.email){
    clientMail = await sendMail({to:order.customer.email,subject:`אישור הזמנה ${order.id} - NABET PARIS`,html:orderClientTemplate(order)});
  }
  res.json({ok:true,order,adminMail,clientMail});
}