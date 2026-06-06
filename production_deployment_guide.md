# Production Deployment Guide: IntelFlow Pro

This guide outlines how to deploy your Next.js application to **Vercel** and connect all core integrations (Supabase PostgreSQL, Better Auth, Google OAuth, and Stripe Subscriptions) for production-grade capability.

---

## Step 1: Connect your Database & Migrate (Supabase)

Your application uses **Supabase PostgreSQL** as the database, managed via **Prisma ORM**.

1. Verify that your local tables and schemas are pushed to Supabase by running:
   ```bash
   npx prisma db push
   ```
2. Make sure your database contains the tables for Better Auth (sessions, accounts, users, verification tokens) and billing profiles.
3. Save your Supabase connection strings from the Supabase Project Settings under **Database**:
   * **Connection String (Transaction/Pooler - port 6543):** Set this as `DATABASE_URL` with `?pgbouncer=true`.
   * **Connection String (Session/Direct - port 5432):** Set this as `DIRECT_URL`.

---

## Step 2: Deploy the Next.js Frontend to Vercel

1. Push your repository to **GitHub**.
2. Sign in to your [Vercel Dashboard](https://vercel.com) and click **Add New... > Project**.
3. Import your `intelflow-pro` repository.
4. Expand **Environment Variables** and add all the required production keys (replacing local values):

| Variable Name | Production Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | The live URL Vercel gives your project | `https://intelflow-pro.vercel.app` |
| `BETTER_AUTH_URL` | Match the live Vercel URL (required for redirects) | `https://intelflow-pro.vercel.app` |
| `DATABASE_URL` | Connection string to your production Supabase pooler | `postgresql://...:6543/...` |
| `DIRECT_URL` | Direct connection string to your production Supabase database | `postgresql://...:5432/...` |
| `BETTER_AUTH_SECRET` | Generate a 32-character secure secret | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console | `257428976949-...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret from Google Cloud Console | `GOCSPX-...` |
| `STRIPE_SECRET_KEY` | Stripe Live Secret Key (starts with `sk_live_` or `sk_test_`) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret generated from Stripe Developer Panel (Step 4) | `whsec_...` |

*(Also add all Stripe Price IDs (`STRIPE_STARTER_MONTHLY_PRICE_ID`, etc.) exactly as defined in your local `.env` file.)*

5. Click **Deploy**. Vercel will run `prisma generate` (configured in `package.json`) and compile your Next.js application cleanly.
6. Once deployed, note down your live domain (e.g., `https://intelflow-pro.vercel.app`).

---

## Step 3: Configure Google OAuth Login Redirects

To prevent OAuth redirection failures (`base URL could not be determined` or `Redirect URI mismatch` errors), you must register your live domain with Google:

1. Open your [Google Cloud Console Credentials Screen](https://console.cloud.google.com/apis/credentials).
2. Click to edit your OAuth 2.0 Client ID.
3. In **Authorized JavaScript origins**, add:
   * `https://intelflow-pro.vercel.app` (replace with your Vercel domain)
4. In **Authorized redirect URIs**, add the callback endpoint:
   * `https://intelflow-pro.vercel.app/api/auth/callback/google`
5. Click **Save**. *Note: It may take a couple of minutes for Google DNS changes to take effect.*

---

## Step 4: Configure Stripe Subscriptions & Webhook

To ensure subscription checkouts and account upgrades work properly:

1. **Verify Price IDs:** Check your Stripe Dashboard Products tab. Confirm that the Price IDs in Vercel environment variables match the actual prices configured in your Stripe dashboard.
2. **Add a Webhook Endpoint:**
   * In the [Stripe Developer Panel](https://dashboard.stripe.com/test/webhooks), click **Add Endpoint**.
   * Set the **Endpoint URL** to:
     `https://intelflow-pro.vercel.app/api/webhooks/stripe`
   * Select **events to listen to**:
     * `checkout.session.completed`
     * `customer.subscription.updated`
     * `customer.subscription.deleted`
   * Click **Add Endpoint**.
3. **Save Webhook Secret:** Copy the signing secret (starts with `whsec_`) and update the `STRIPE_WEBHOOK_SECRET` environment variable in your **Vercel Project Settings > Environment Variables** page. Redeploy the Vercel branch for the changes to take effect.
4. **Configure Customer Portal (Stripe billing redirects):**
5. **Configure Customer Portal (Stripe billing redirects):**
   * Go to **Stripe Dashboard > Settings > Billing > Customer Portal**.
   * Turn on features you want users to have (e.g., allow cancellations, plan upgrades/downgrades).
   * Save the portal settings.

---

## Step 5: Test the Live App

1. Visit your live domain.
2. Sign Up/Login using Google OAuth or Email & Password.
3. Go to **Pricing**, click a subscription package, complete the checkout flow via Stripe, and confirm that your dashboard updates to reflect the active tier (e.g., "Starter" or "Professional") instantly upon callback.
