# IntelFlow Pro: Stripe Integration Setup Guide

This guide walks you through setting up Stripe in your developer dashboard (Test Mode) and linking it to IntelFlow Pro's recurring 3-month free trial billing engine.

---

## Step 1: Access Stripe Test Mode
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) and create or log in to your account.
2. In the top-right corner of the Stripe dashboard, toggle the **"Test Mode"** switch on.
   > [!IMPORTANT]
   > Make sure Test Mode is **ON** before configuring anything, as we are creating test product credentials.

---

## Step 2: Retrieve API Credentials
1. Navigate to **Developers -> API keys** in the left sidebar.
2. Copy the **Secret key** (it will look like `sk_test_...`).
3. Open your local `C:\projects\intelflow-pro\.env` file and paste it:
   ```env
   STRIPE_SECRET_KEY="sk_test_your_copied_secret_key"
   ```

---

## Step 3: Configure Pricing Tiers and Products
IntelFlow Pro supports three tiers (Starter, Professional, and Enterprise) with monthly and yearly options. You will create these as products in the Stripe Dashboard.

1. Navigate to **Product Catalog** in the Stripe Dashboard and click **Add Product**.
2. Create **three separate products** using the parameters below:

### Tier 1: Starter Plan
- **Name:** `IntelFlow Pro - Starter`
- **Pricing Configuration (Monthly):**
  - Amount: `$29.00 USD`
  - Recurring: `Monthly`
  - Save the price. Copy the resulting Price ID (looks like `price_...`).
- **Pricing Configuration (Yearly):**
  - Amount: `$290.00 USD` (or any custom discount)
  - Recurring: `Yearly`
  - Save the price. Copy the resulting Price ID.

### Tier 2: Professional Plan
- **Name:** `IntelFlow Pro - Professional`
- **Pricing Configuration (Monthly):**
  - Amount: `$79.00 USD`
  - Recurring: `Monthly`
  - Copy the Price ID.
- **Pricing Configuration (Yearly):**
  - Amount: `$790.00 USD`
  - Recurring: `Yearly`
  - Copy the Price ID.

### Tier 3: Enterprise Plan
- **Name:** `IntelFlow Pro - Enterprise`
- **Pricing Configuration (Monthly):**
  - Amount: `$199.00 USD`
  - Recurring: `Monthly`
  - Copy the Price ID.
- **Pricing Configuration (Yearly):**
  - Amount: `$1990.00 USD`
  - Recurring: `Yearly`
  - Copy the Price ID.

---

## Step 4: Populate Price IDs in `.env`
Update the corresponding price keys inside your `C:\projects\intelflow-pro\.env` file with the values generated from Step 3:

```env
STRIPE_STARTER_MONTHLY_PRICE_ID="price_1Q..."
STRIPE_STARTER_YEARLY_PRICE_ID="price_1Q..."

STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID="price_1Q..."
STRIPE_PROFESSIONAL_YEARLY_PRICE_ID="price_1Q..."

STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_1Q..."
STRIPE_ENTERPRISE_YEARLY_PRICE_ID="price_1Q..."
```

---

## Step 5: Configure Local Webhook Listening
To capture subscription activations, renewals, and cancellations, Stripe needs to forward events to your local server.

1. **Install the Stripe CLI:**
   - On Windows, download the Stripe CLI zip file from the [Stripe CLI releases page on GitHub](https://github.com/stripe/stripe-cli/releases), extract it, and add it to your System PATH.
   - Alternatively, run `scoop install stripe-cli` or download directly.
2. **Log in to Stripe CLI:**
   ```bash
   stripe login
   ```
   Follow the browser instructions to authenticate.
3. **Listen and Forward Events:**
   Run the forwarding listener in a separate terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. **Copy the Webhook Secret:**
   - When the listener starts, it prints a signing secret (looks like `whsec_...`).
   - Copy this value and add it to your `.env` file:
     ```env
     STRIPE_WEBHOOK_SECRET="whsec_your_webhook_signing_secret"
     ```
5. Keep the command terminal running. Stripe events will now sync with your SQLite database in real-time!
