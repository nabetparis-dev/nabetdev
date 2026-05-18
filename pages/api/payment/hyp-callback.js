import fs from "fs";
import path from "path";

const ordersFile = path.join(process.cwd(), "data", "orders.json");

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ordersFile, "utf8"));
  } catch {
    return [];
  }
}

function saveOrders(data) {
  fs.writeFileSync(ordersFile, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
  try {
    const body = req.method === "POST" ? req.body : req.query;

    const orderId =
      body?.Order ||
      body?.orderId ||
      body?.order ||
      "";

    if (!orderId) {
      return res.status(400).json({
        ok: false,
        error: "Missing orderId",
      });
    }

    const orders = readOrders();

    const idx = orders.findIndex(o => o.id === orderId);

    if (idx < 0) {
      return res.status(404).json({
        ok: false,
        error: "Order not found",
      });
    }

    orders[idx].status = "confirmed";
    orders[idx].paymentStatus = "paid";
    orders[idx].paidAt = new Date().toISOString();

    saveOrders(orders);

    return res.status(200).json({
      ok: true,
      order: orders[idx],
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
}
