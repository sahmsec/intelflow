import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

const PRICE_IDS: Record<string, Record<string, string>> = {
  Starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "price_mock_starter_mo",
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "price_mock_starter_yr",
  },
  Professional: {
    monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || "price_mock_professional_mo",
    yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || "price_mock_professional_yr",
  },
  Enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_mock_enterprise_mo",
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_mock_enterprise_yr",
  },
};

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { plan = "Professional", cycle = "monthly", action } = body;

    // 1. Get or create Workspace for the user
    let member = await db.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    });

    let workspace;
    if (!member) {
      // Lazy initialize workspace if it doesn't exist
      workspace = await db.workspace.create({
        data: {
          name: `${session.user.name}'s Workspace`,
          members: {
            create: {
              userId: session.user.id,
              role: "owner",
            },
          },
        },
      });
    } else {
      workspace = member.workspace;
    }

    if (action === "cancel") {
      if (workspace.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
        try {
          await stripe.subscriptions.cancel(workspace.stripeSubscriptionId);
        } catch (e) {
          console.error("Stripe subscription cancel error:", e);
        }
      }

      await db.workspace.update({
        where: { id: workspace.id },
        data: {
          plan: "Free",
          status: "active",
          stripePriceId: null,
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
        },
      });

      return new Response(JSON.stringify({ success: true, plan: "Free" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const priceId = PRICE_IDS[plan]?.[cycle];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan or billing cycle" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If Stripe is running in mock mode because keys are not added yet
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock flow: update database workspace directly for dev convenience
      const updatedWorkspace = await db.workspace.update({
        where: { id: workspace.id },
        data: {
          plan,
          status: "trialing",
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        },
      });

      return new Response(
        JSON.stringify({
          url: `${appUrl}/settings?checkout=success&plan=${plan}`,
          mocked: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Stripe Checkout config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 90, // First 3 months free
        metadata: {
          workspaceId: workspace.id,
          plan,
          cycle,
        },
      },
      metadata: {
        workspaceId: workspace.id,
        plan,
        cycle,
      },
      success_url: `${appUrl}/settings?checkout=success&plan=${plan}`,
      cancel_url: `${appUrl}/settings?checkout=cancel`,
    };

    if (workspace.stripeCustomerId) {
      sessionConfig.customer = workspace.stripeCustomerId;
    } else {
      sessionConfig.customer_email = session.user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Checkout session error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
