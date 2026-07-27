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
        case 'charge.success': {
            let userId = eventData.metadata?.user_id;
            let appId = eventData.metadata?.app_id;
            const tier = eventData.metadata?.tier || 'premium';

            const customerEmail = eventData.customer?.email;
            const planCode = eventData.plan?.plan_code;

            // RECOVERY MATRIX: If Paystack clears the metadata layer inside plan transaction pipelines,
            // query database structures dynamically to resolve the target app_id and user profile records natively.
            if ((!userId || !appId) && customerEmail && planCode) {
                // STEP A: Locate the matching app_id identifier mapped to this plan code inside our register
                const { data: appDetails } = await supabaseAdmin
                    .from('applications')
                    .select('app_id')
                    .eq('paystack_plan_id', planCode)
                    .maybeSingle();

                if (appDetails) {
                    appId = appDetails.app_id;
                }

                // STEP B: Trace the user identity by cross-referencing the billing email parameter string
                const { data: userProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .ilike('email', customerEmail.trim())
                    .maybeSingle();

                if (userProfile) {
                    userId = userProfile.id;
                }
            }

            if (!userId || !appId) {
                console.error(`🚨 Paystack Hook: Unable to resolve identity bounds for client email: ${customerEmail} / Plan: ${planCode}`);
                break;
            }

            // NESTING CORRECTION FLOW: Prioritizes Paystack's structural subscription object properties block
            let resolvedSubscriptionToken = null;
            let resolvedEmailToken = null;

            if (eventData.subscription?.subscription_code) {
                resolvedSubscriptionToken = eventData.subscription.subscription_code;
                resolvedEmailToken = eventData.subscription.email_token || null;
            } else if (eventData.subscription_code) {
                resolvedSubscriptionToken = eventData.subscription_code;
            }

            // Flat-rate product fallbacks
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
                        paystack_email_token: resolvedEmailToken,
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,app_id' }
                );

            if (error) console.error(`🚨 Paystack charge.success DB Sync Error: ${error.message}`);
            break;
        }

        case 'subscription.create': {
            const paystackSubCode = eventData.subscription_code;
            const customerCode = eventData.customer?.customer_code;
            const planCode = eventData.plan?.plan_code;
            const paystackEmailToken = eventData.email_token || null;

            if (!paystackSubCode || !customerCode || !planCode) {
                console.error("🚨 Paystack Hook: Missing core subscription parameters inside subscription.create payload.");
                break;
            }

            const { data: targetApp, error: appErr } = await supabaseAdmin
                .from('applications')
                .select('app_id')
                .eq('paystack_plan_id', planCode)
                .maybeSingle();

            if (appErr || !targetApp) {
                console.error(`🚨 Paystack Hook: Could not resolve app registration mapping for Plan Code: ${planCode}`);
                break;
            }

            const { data: activeSub, error: subFindErr } = await supabaseAdmin
                .from('user_subscriptions')
                .select('id, user_id')
                .eq('stripe_customer_id', customerCode)
                .eq('app_id', targetApp.app_id)
                .maybeSingle();

            if (subFindErr || !activeSub) {
                console.error(`🚨 Paystack Hook: No ledger row found matching customer: ${customerCode} for app: ${targetApp.app_id}`);
                break;
            }

            const { error: finalSyncError } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    stripe_subscription_id: paystackSubCode.trim(),
                    paystack_email_token: paystackEmailToken,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeSub.id);

            if (finalSyncError) {
                console.error(`🚨 Paystack Hook: Failed to lock subscription_code into user row ledger - ${finalSyncError.message}`);
            } else {
                console.log(`[Paystack Webhook Sync Success]: Locked subscription ${paystackSubCode} to user ID ${activeSub.user_id}`);
            }
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
