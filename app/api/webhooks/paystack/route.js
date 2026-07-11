// app/api/webhooks/paystack/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// CRITICAL COMPILER FIX: Tells Next.js to skip pre-rendering optimization loops 
// and handle this route as a dynamic server-side background worker channel.
export const dynamic = 'force-dynamic';

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

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert(
                    {
                        user_id: userId,
                        app_id: appId,
                        tier: tier,
                        status: 'active',
                        stripe_customer_id: eventData.customer?.customer_code || null,
                        stripe_subscription_id: eventData.subscription_code || eventData.reference || null,
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
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', paystackSubCode);

            if (error) console.error(`🚨 Paystack Subscription Disable Error: ${error.message}`);
            break;
        }

        default:
            break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
