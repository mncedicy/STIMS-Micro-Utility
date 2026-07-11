// app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize the Stripe engine with your private server key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use Service Role Key here to bypass all Row Level Security (RLS) policies 
// since this background worker acts as a system administrator updating ledger entries.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    let body;
    let signature;

    try {
        body = await req.text(); // Stream raw request string for signature validation
        signature = req.headers.get('stripe-signature');
    } catch (err) {
        return NextResponse.json({ error: "Invalid payload request headers." }, { status: 400 });
    }

    let event;

    // 1. Verify the signature securely to ensure this call strictly originated from Stripe
    try {
        if (!signature || !endpointSecret) throw new Error("Missing transaction verification signatures.");
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
        console.error(`🚨 Webhook Signature Check Failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // 2. Route incoming webhook event types
    const session = event.data.object;

    switch (event.type) {
        case 'checkout.session.completed': {
            // Retrieve the custom metadata markers we pass down when spawning the payment session link
            const userId = session.metadata?.user_id;
            const appId = session.metadata?.app_id;
            const tier = session.metadata?.tier || 'premium';

            if (!userId || !appId) {
                console.error("🚨 Billing Failure: Event missing user_id or app_id tracking parameters.");
                break;
            }

            // Upsert billing row inside the master subscriptions matrix
            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert(
                    {
                        user_id: userId,
                        app_id: appId,
                        tier: tier,
                        status: 'active',
                        stripe_customer_id: session.customer?.toString() || null,
                        stripe_subscription_id: session.subscription?.toString() || null,
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,app_id' } // Merges cleanly on our unique composite index constraint
                );

            if (error) console.error(`🚨 DB Sync Error on Checkout: ${error.message}`);
            break;
        }

        case 'customer.subscription.updated': {
            // Handle mid-cycle tier shifts, payment successes, or account restorations
            const stripeSubId = session.id;
            const newStatus = session.status === 'active' ? 'active' : 'past_due';

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('stripe_subscription_id', stripeSubId);

            if (error) console.error(`🚨 DB Sync Error on Update: ${error.message}`);
            break;
        }

        case 'customer.subscription.deleted': {
            // Downgrade user back to the default free tier limits instantly if subscription is cancelled
            const stripeSubId = session.id;

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', stripeSubId);

            if (error) console.error(`🚨 DB Sync Error on Expiration: ${error.message}`);
            break;
        }

        default:
            // Acknowledge unhandled checkout hooks gracefully to prevent Stripe retries
            break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
