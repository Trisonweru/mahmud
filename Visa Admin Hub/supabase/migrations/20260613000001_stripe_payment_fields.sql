-- Stripe payment integration: track the PaymentIntent and Customer used for an
-- application's payment, so the admin refund flow can look up the right charge.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS stripe_customer_id text;
