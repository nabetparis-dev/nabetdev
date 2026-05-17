export default async function handler(req, res) {
  try {
    const amount = req.body?.amount || 0;

    const params = new URLSearchParams({
      action: "APISign",
      What: "SIGN",
      KEY: process.env.HYP_API_KEY,
      PassP: process.env.HYP_PASSP,
      Masof: process.env.HYP_TERMINAL,
      Amount: String(amount),
      PageLang: "HEB",
      Coin: "1",
      Info: "Nabet Paris Order",
      Order: `NP-${Date.now()}`,
      Sign: "True",
      Tmp: "2",
    });

    const response = await fetch(
      `https://pay.hyp.co.il/p/?${params.toString()}`
    );

    const text = await response.text();

    if (text.includes("CCode=") && !text.includes("CCode=0")) {
      return res.status(500).json({
        error: "HYP ERROR",
        raw: text,
      });
    }

    const paymentUrl = `https://pay.hyp.co.il/p/?${text}`;

    return res.status(200).json({
      ok: true,
      paymentUrl,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
