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

    // DEBUG LOG ENGINE: Prints the exact JSON structure into your Vercel deployment runtime logs
    console.log("📦 COMPLETE PAYSTACK PAYLOAD:", JSON.stringify(payload, null, 2));

    const event = payload.event;
    const eventData = payload.data;

    switch (event) {
        case 'charge.success': {
            const userId = eventData.metadata?.user_id;
            const appId = eventData.metadata?.app_id;
            const tier = eventData.metadata?.tier || 'premium';

            if (!userId || !appId) {
                console.error("🚨 Paystack Hook: Empty tracking parameters metadata inside charge.success.");
                break;
            }

            // Extract subscription identifier if attached to transaction object, fallback to processing reference string
            const resolvedToken = eventData.subscription_code || eventData.reference || `one-time-${eventData.id}`;

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert(
                    {
                        user_id: userId,
                        app_id: appId,
                        tier: tier,
                        status: 'active',
                        stripe_customer_id: eventData.customer?.customer_code || null,
                        stripe_subscription_id: resolvedToken.trim(),
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

            // 1. EXTRACTION STRATEGY A: Direct lookup from metadata object
            let userId = eventData.customer?.metadata?.user_id;

            // 2. EXTRACTION STRATEGY B: Look inside array structure for old customer migrations
            if (!userId && eventData.customer?.metadata?.custom_fields) {
                const userIdField = eventData.customer.metadata.custom_fields.find(
                    (field) => field.variable_name === 'user_id'
                );
                if (userIdField) userId = userIdField.value;
            }

            if (!paystackSubCode || !customerCode || !planCode) {
                console.error("🚨 Paystack Hook: Missing core subscription parameters inside subscription.create payload.");
                break;
            }

            // STEP A: Map the incoming plan_code to locate the target multi-tenant app_id from the application register
            const { data: targetApp, error: appErr } = await supabaseAdmin
                .from('applications')
                .select('app_id')
                .eq('paystack_plan_id', planCode)
                .maybeSingle();

            if (appErr || !targetApp) {
                console.error(`🚨 Paystack Hook: Could not resolve app registration mapping for Plan Code: ${planCode}`);
                break;
            }

            // 3. FAILSAFE BACKUP METHOD: If user_id wasn't in the customer payload (existing profiles), 
            // query the db row built previously by the charge.success webhook event using customerCode
            if (!userId) {
                console.warn(`⚠️ Paystack Hook: user_id missing in customer metadata object. Resolving via database record reference...`);

                const { data: matchedSub, error: lookUpError } = await supabaseAdmin
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', customerCode)
                    .eq('app_id', targetApp.app_id)
                    .maybeSingle();

                if (lookUpError || !matchedSub) {
                    console.error(`🚨 Paystack Hook: Recovery lookup completely failed for Customer Code: ${customerCode}`);
                    break;
                }

                userId = matchedSub.user_id; // Securely recovered
            }

            // STEP B & C: Directly update the verified unique record matching user_id + app_id
            const { error: finalSyncError } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    stripe_subscription_id: paystackSubCode.trim(),
                    stripe_customer_id: customerCode,
                    paystack_email_token: paystackEmailToken,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('app_id', targetApp.app_id);

            if (finalSyncError) {
                console.error(`🚨 Paystack Hook: Failed to lock subscription_code into user row ledger - ${finalSyncError.message}`);
            } else {
                console.log(`[Paystack Webhook Sync Success]: Locked subscription ${paystackSubCode} to user ID ${userId}`);
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
