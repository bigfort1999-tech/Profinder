const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

try {
const { priceId, planKey, userId, email } = req.body;

```
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  customer_email: email,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: 'https://profinder-xi.vercel.app/?upgraded=' + planKey + '&session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://profinder-xi.vercel.app/?cancelled=1',
  subscription_data: {
    trial_period_days: 7,
    metadata: { supabase_user_id: userId, plan: planKey }
  },
  metadata: { supabase_user_id: userId, plan: planKey }
});

res.json({ url: session.url });
```

} catch (err) {
console.error(‘Stripe error:’, err);
res.status(400).json({ error: err.message });
}
};
