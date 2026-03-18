const stripe = require(‘stripe’)(process.env.STRIPE_SECRET_KEY);
const SUPABASE_URL = ‘https://xtmwnbbbuufywifdgdtp.supabase.co’;

module.exports = async (req, res) => {
const sig = req.headers[‘stripe-signature’];
let event;

try {
event = process.env.STRIPE_WEBHOOK_SECRET
? stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
: (typeof req.body === ‘string’ ? JSON.parse(req.body) : req.body);
} catch (err) {
return res.status(400).send(’Webhook error: ’ + err.message);
}

const obj = event.data.object;
const userId = obj.metadata?.supabase_user_id;
const plan = obj.metadata?.plan;

if (userId && plan) {
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (serviceKey) {
if (event.type === ‘customer.subscription.created’ || event.type === ‘customer.subscription.updated’) {
if (obj.status === ‘active’ || obj.status === ‘trialing’) {
await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
method: ‘PATCH’,
headers: { ‘Content-Type’: ‘application/json’, ‘apikey’: serviceKey, ‘Authorization’: `Bearer ${serviceKey}` },
body: JSON.stringify({ plan })
});
}
} else if (event.type === ‘customer.subscription.deleted’) {
await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
method: ‘PATCH’,
headers: { ‘Content-Type’: ‘application/json’, ‘apikey’: serviceKey, ‘Authorization’: `Bearer ${serviceKey}` },
body: JSON.stringify({ plan: ‘starter’ })
});
}
}
}

res.json({ received: true });
};
