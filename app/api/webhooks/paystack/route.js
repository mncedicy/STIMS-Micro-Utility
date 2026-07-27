// app/api/webhooks/paystack/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req) {
    let rawBody;
    let paystackSignature;

    try {
        rawBody = await req.text(); // Stream raw string to compute HMAC verification hashes
        paystackSignature = req.headers.get('x-paystack-signature');
    } catch (err) {
        return NextResponse.json({ error: "Invalid payload request headers." }, { status: 400 });
    }

    // Initialize the admin client inside the request scope so it safely builds at runtime
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. SECURITY VALIDATION: Verify the transaction genuinely originated from Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        console.error("🚨 STIMS Billing: PAYSTACK_SECRET_KEY is missing from environment variables.");
        return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    const computedHash = crypto
        .createHmac('sha512', secretKey.trim())
        .update(rawBody)
        .digest('hex');

    if (computedHash !== paystackSignature) {
        console.error("🚨 STIMS Billing: Paystack verification signature mismatch.");
        return NextResponse.json({ error: "Unauthorized transaction origin signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const eventData = payload.data;

    switch (event) {
        case 'charge.success':
        case 'subscription.create': {
            const userId = eventData.metadata?.user_id;
            const appId = eventData.metadata?.app_id;
            const tier = eventData.metadata?.tier || 'premium';

            if (!userId || !appId) {
                console.error("🚨 Paystack Hook: Empty tracking parameters metadata.");
                break;
            }

            // EXTRACT CORRECT SUBSCRIPTION CODE (SUB_xxxx):
            // Prioritize tracking fields that specifically yield unique customer subscription instances
            let resolvedSubscriptionToken = null;

            if (eventData.subscription_code) {
                // Populates natively during subscription events or direct payload roots
                resolvedSubscriptionToken = eventData.subscription_code;
            } else if (eventData.subscription) {
                // Triggers when subscription code is passed as an implicit field/string value
                resolvedSubscriptionToken = typeof eventData.subscription === 'string'
                    ? eventData.subscription
                    : (eventData.subscription?.subscription_code || null);
            }

            // Fallback cleanly to your processing references string only if it is a flat, non-recurring product sale.
            // Notice we do NOT check eventData.plan.plan_code here anymore, preventing the template PLN_ text overwrite!
            if (!resolvedSubscriptionToken) {
                resolvedSubscriptionToken = eventData.reference || `one-time-${eventData.id}`;
            }

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert(
                    {
                        user_id: userId,
                        app_id: appId,
                        tier: tier,
                        status: 'active',
                        stripe_customer_id: eventData.customer?.customer_code || null,
                        stripe_subscription_id: resolvedSubscriptionToken.trim(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,app_id' }
                );

            if (error) console.error(`🚨 Paystack DB Sync Error: ${error.message}`);
            break;
        }

        case 'subscription.disable': {
            const paystackSubCode = eventData.subscription_code;
            if (!paystackSubCode) break;

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', paystackSubCode.trim());

            if (error) console.error(`🚨 Paystack Subscription Disable Error: ${error.message}`);
            break;
        }

        default:
            break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
