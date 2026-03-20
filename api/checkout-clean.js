export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  const priceId = body.priceId;
  const planKey = body.planKey;
  const userId = body.userId;
  const email = body.email;
  const key = process.env.STRIPE_SECRET_KEY;

  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("payment_method_types[]", "card");
  params.append("customer_email", email || "");
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append("success_url", "https://profinder-xi.vercel.app/?upgraded=" + planKey);
  params.append("cancel_url", "https://profinder-xi.vercel.app/?cancelled=1");
  params.append("subscription_data[trial_period_days]", "7");
  params.append("subscription_data[metadata][plan]", planKey);
  params.append("subscription_data[metadata][supabase_user_id]", userId || "");

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const data = await response.json();
  if (!response.ok) return res.status(400).json({ error: data.error && data.error.message ? data.error.message : "Stripe error" });
  return res.json({ url: data.url });
}
