import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "price_mock_starter_mo"]: "Starter",
  [process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "price_mock_starter_yr"]: "Starter",
  [process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || "price_mock_professional_mo"]: "Professional",
  [process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || "price_mock_professional_yr"]: "Professional",
  [process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_mock_enterprise_mo"]: "Enterprise",
  [process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_mock_enterprise_yr"]: "Enterprise",
};

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET is not configured. Webhooks are disabled.");
    return new Response(JSON.stringify({ error: "Webhooks not configured" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const workspaceId = session.metadata?.workspaceId;
        const stripeCustomerId = session.customer as string;

        if (workspaceId) {
          await db.workspace.update({
            where: { id: workspaceId },
            data: { stripeCustomerId },
          });
          console.log(`Updated Workspace ${workspaceId} with Stripe Customer ID: ${stripeCustomerId}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        // Search metadata in subscription or its items
        const workspaceId = subscription.metadata?.workspaceId;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || "Professional";

        if (workspaceId) {
          await db.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              plan,
              status: subscription.status, // "active", "trialing", "past_due", etc.
              planSelected: true,
            },
          });
          console.log(`Subscription synced for Workspace ${workspaceId}: Plan = ${plan}, Status = ${subscription.status}`);
        } else {
          // If workspaceId is missing in subscription metadata, find by Customer ID
          const stripeCustomerId = subscription.customer as string;
          const workspace = await db.workspace.findFirst({
            where: { stripeCustomerId },
          });
          if (workspace) {
            await db.workspace.update({
              where: { id: workspace.id },
              data: {
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                plan,
                status: subscription.status,
                planSelected: true,
              },
            });
            console.log(`Subscription synced via Customer ID mapping for Workspace ${workspace.id}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer as string;
        
        const workspace = await db.workspace.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { stripeCustomerId },
            ],
          },
        });

        if (workspace) {
          await db.workspace.update({
            where: { id: workspace.id },
            data: {
              status: "expired",
            },
          });
          console.log(`Subscription canceled. Set Workspace ${workspace.id} status to expired.`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
