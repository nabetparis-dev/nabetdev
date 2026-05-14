import { readJson, writeJson } from "../../../../lib/serverData";
import { sendMail } from "../../../../lib/mailer";
import { orderStatusClientTemplate } from "../../../../lib/emailTemplates";

function check(req){
  return req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || readJson("settings").adminPassword || "nabet123");
}

const allowedStatuses = ["pending","received","accepted","confirmed","refused","cancelled","shipped","refund_started","refund_confirmed","refunded"];
const subjects = {
  received:"ההזמנה התקבלה",
  pending:"ההזמנה ממתינה לטיפול",
  accepted:"ההזמנה אושרה",
  confirmed:"ההזמנה אושרה",
  refused:"ההזמנה סורבה",
  cancelled:"ההזמנה בוטלה",
  shipped:"ההזמנה נשלחה",
  refund_started:"החזר כספי בטיפול",
  refund_confirmed:"החזר כספי אושר",
  refunded:"החזר כספי אושר"
};

async function sendStatusEmail(order, status, note=""){
  if(!order.customer?.email) return {ok:false, reason:"NO_CUSTOMER_EMAIL"};
  return sendMail({
    to: order.customer.email,
    subject: `${subjects[status] || "עדכון הזמנה"} ${order.id} - NABET PARIS`,
    html: orderStatusClientTemplate(order, status, note)
  });
}

export default async function handler(req,res){
  if(!check(req)) return res.status(401).json({error:"אין הרשאה"});
  const {id}=req.query;
  let orders=readJson("orders");
  const idx=orders.findIndex(o=>o.id===id);
  if(idx<0) return res.status(404).json({error:"Commande introuvable"});

  if(req.method==="PUT"){
    const previousStatus = orders[idx].status;
    const next = {...orders[idx],...req.body,updatedAt:new Date().toISOString()};
    if(next.status && !allowedStatuses.includes(next.status)) return res.status(400).json({error:"סטטוס לא תקין"});
    orders[idx]=next;
    writeJson("orders",orders);
    let statusMail = null;
    if(req.body?.sendEmail || (req.body?.status && req.body.status !== previousStatus)){
      statusMail = await sendStatusEmail(next, next.status || "pending", req.body?.statusNote || "");
    }
    return res.json({ok:true,order:orders[idx],statusMail});
  }

  if(req.method==="POST"){
    const action = req.body?.action;
    const map = {accept:"accepted",refuse:"refused",cancel:"cancelled",ship:"shipped",refund_start:"refund_started",refund_confirm:"refund_confirmed"};
    const status = map[action] || req.body?.status;
    if(!allowedStatuses.includes(status)) return res.status(400).json({error:"Action inconnue"});
    const note = req.body?.note || "";
    orders[idx] = {...orders[idx], status, statusNote:note, updatedAt:new Date().toISOString()};
    if(status === "refund_confirmed") orders[idx].paymentStatus = "refunded";
    if(status === "refund_started") orders[idx].paymentStatus = "refund_processing";
    writeJson("orders",orders);
    const statusMail = await sendStatusEmail(orders[idx], status, note);
    return res.json({ok:true,order:orders[idx],statusMail});
  }

  if(req.method==="DELETE"){
    orders=orders.filter(o=>o.id!==id);
    writeJson("orders",orders);
    return res.json({ok:true});
  }
  return res.status(405).end();
}
