export default async function handler(req, res) {
  try {
    const amount = req.body?.amount || 0;

    const hypRes = await fetch(
      `${process.env.SITE_URL}/api/payment/hyp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      }
    );

    const data = await hypRes.json();

    if (!data.ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      url: data.paymentUrl,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
