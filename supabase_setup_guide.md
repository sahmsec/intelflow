# Supabase PostgreSQL Configuration Guide

This guide walks you through setting up a Supabase PostgreSQL database for **IntelFlow Pro** and syncing the database schema.

---

## 1. Create a Supabase Project

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and sign in or sign up.
2. Click **New Project** and select your organization.
3. Configure your project details:
   - **Name:** `IntelFlow Pro`
   - **Database Password:** *Choose a secure password and save it somewhere safe.*
   - **Region:** Choose the region closest to your users or server (e.g. `East US` or `West US`).
   - **Pricing Plan:** Select the **Free** tier.
4. Click **Create new project** and wait a few minutes for the database instance to provision.

---

## 2. Get the Connection URI String

Once your project is provisioned, get the connection URI:

1. In the Supabase sidebar, go to **Settings** (gear icon) > **Database**.
2. Scroll down to the **Connection Pooler** section.
3. Set the mode toggle to **Transaction** (recommended for serverless environments like Next.js).
4. Copy the connection string under **URI**. It should look like this:
   ```text
   postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you chose in Step 1.

---

## 3. Update Environment Variables

1. Open your local `C:\projects\intelflow-pro\.env` file.
2. Replace the old SQLite database variable:
   ```env
   # Replace this:
   DATABASE_URL="file:./dev.db"

   # With your copied Supabase Connection String:
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
3. Save the `.env` file.

---

## 4. Push Schema Tables to Supabase

Prisma 7 uses the `prisma.config.ts` file to read the database URL. To push the tables to Supabase:

1. Open a terminal in the root of your project (`C:\projects\intelflow-pro`).
2. Execute the schema synchronization command:
   ```bash
   npx prisma db push
   ```
3. This will parse your models and create the matching SQL tables (`User`, `Workspace`, `Competitor`, `Insight`, etc.) in Supabase.

---

## 5. Verify the Connection

1. Go back to your Supabase Dashboard.
2. Click on the **Table Editor** (grid icon) in the sidebar.
3. You should see all the schema tables synced and ready:
   - `User`
   - `Session`
   - `Workspace`
   - `WorkspaceMember`
   - `Competitor`
   - `Insight`
   - `Alert`
4. Start your development server with `npm run dev` and register a new account to test database writes!
