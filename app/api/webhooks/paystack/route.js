// app/api/webhooks/paystack/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize our administrative bypass database node client using our Service Role Key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    let rawBody;
    let paystackSignature;

    try {
        rawBody = await req.text(); // Stream raw string payload to accurately compute security signatures
        paystackSignature = req.headers.get('x-paystack-signature');
    } catch (err) {
        return NextResponse.json({ error: "Invalid payload request headers." }, { status: 400 });
    }

    // 1. SECURITY SECURITY CHECK: Verify the signature to ensure this request genuinely originated from Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        console.error("🚨 STIMS Billing Firewall: PAYSTACK_SECRET_KEY is missing from environment variables.");
        return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    const computedHash = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

    if (computedHash !== paystackSignature) {
        console.error("🚨 STIMS Billing Firewall: Paystack signature hash comparison verification failed!");
        return NextResponse.json({ error: "Unauthorized transaction origin signature." }, { status: 401 });
    }

    // 2. PARSE DATA TRANSITIONS: Safely unpack verified payload structure
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const eventData = payload.data;

    console.log(`📡 STIMS Webhook Logger: Intercepted verified Paystack event loop: ${event}`);

    switch (event) {
        case 'charge.success':
        case 'subscription.create': {
            // Paystack passes custom application markers down inside the standard 'metadata' object parameter block
            const userId = eventData.metadata?.user_id;
            const appId = eventData.metadata?.app_id;
            const tier = eventData.metadata?.tier || 'premium';

            if (!userId || !appId) {
                console.error("🚨 Paystack Sync Failure: Received successful transaction hook but tracking parameters are empty.");
                break;
            }

            // Perform a clean, atomic database upsert on our multi-tenant subscriptions matrix ledger
            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert(
                    {
                        user_id: userId,
                        app_id: appId,
                        tier: tier,
                        status: 'active',
                        stripe_customer_id: eventData.customer?.customer_code || null, // Map customer code parameters
                        stripe_subscription_id: eventData.subscription_code || eventData.reference || null, // Map transaction references securely
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,app_id' } // Evaluates seamlessly against our unique Postgres layout index rule
                );

            if (error) {
                console.error(`🚨 Paystack DB Upsert Failure: ${error.message}`);
            } else {
                console.log(`✅ STIMS Ledger Updated: Subdomain app [${appId}] successfully upgraded to [${tier}] for user [${userId}]`);
            }
            break;
        }

        case 'subscription.disable': {
            // Triggered by Paystack if a user cancels or their subscription payment fails completely after retries
            const paystackSubCode = eventData.subscription_code;

            if (!paystackSubCode) break;

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', paystackSubCode);

            if (error) {
                console.error(`🚨 Paystack Subscription Downgrade Failure: ${error.message}`);
            } else {
                console.log(`📉 STIMS Ledger Updated : Subscription [${paystackSubCode}] disabled and downgraded to free.`);
            }
            break;
        }

        default:
            // Gracefully acknowledge unhandled operational webhooks to clear Paystack transmission queue rails
            break;
    }

    // Always respond with an HTTP 200 OK so Paystack knows the event was successfully ingested
    return NextResponse.json({ received: true }, { status: 200 });
}
