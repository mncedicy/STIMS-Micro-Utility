import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req) {
    let rawBody;
    let paystackSignature;

    try {
        rawBody = await req.text();
        paystackSignature = req.headers.get('x-paystack-signature');
    } catch (err) {
        return NextResponse.json({ error: "Invalid request payload attributes." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        console.error("🚨 STIMS Billing: PAYSTACK_SECRET_KEY missing from environment configurations.");
        return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    // Verify webhook security signature originates authentically from Paystack
    const computedHash = crypto.createHmac('sha512', secretKey.trim()).update(rawBody).digest('hex');
    if (computedHash !== paystackSignature) {
        console.error("🚨 STIMS Billing: Paystack verification signature mismatch.");
        return NextResponse.json({ error: "Unauthorized transaction source signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("📦 COMPLETE PAYSTACK PAYLOAD:", JSON.stringify(payload, null, 2));

    const event = payload.event;
    const eventData = payload.data;

    // Identify user and multi-tenant app routing parameters from payloads
    let userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
    let planCode = eventData.plan?.plan_code || eventData.plan_object?.plan_code;
    let resolvedAppId = eventData.metadata?.app_id || 'ecoroute';

    // Strategy A: Deep extraction from custom_fields array fallback if metadata object collapses
    if (!userId && eventData.customer?.metadata?.custom_fields) {
        const userIdField = eventData.customer.metadata.custom_fields.find(f => f.variable_name === 'user_id');
        if (userIdField) userId = userIdField.value;
    }

    // Strategy B: Resolve targeted tenant application mapping dynamically via Plan database registry entries
    if (planCode && !eventData.metadata?.app_id) {
        const { data: appRegister } = await supabaseAdmin
            .from('applications')
            .select('app_id')
            .eq('paystack_plan_id', planCode)
            .maybeSingle();
        if (appRegister) resolvedAppId = appRegister.app_id;
    }

    // Strategy C: Last-mile recovery matching permanent profile customer references
    if (!userId && eventData.customer?.customer_code) {
        const { data: legacySub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', eventData.customer.customer_code)
            .eq('app_id', resolvedAppId)
            .maybeSingle();
        if (legacySub) userId = legacySub.user_id;
    }

    if (!userId) {
        console.error(`🚨 Paystack Webhook Error: Could not resolve target user identification context.`);
        return NextResponse.json({ error: "Unable to process identity context mapping." }, { status: 200 });
    }

    // 1. CHRONOLOGICAL HISTORY LEDGER AUDITING (Save everything)
    const { error: ledgerError } = await supabaseAdmin
        .from('billing_transactions_ledger')
        .insert({
            user_id: userId,
            app_id: resolvedAppId,
            event_type: event,
            paystack_reference: eventData.reference || null,
            paystack_subscription_code: eventData.subscription_code || null,
            amount_cents: eventData.amount || 0,
            currency: eventData.currency || 'ZAR',
            payment_channel: eventData.channel || null,
            gateway_status: eventData.status || 'processed',
            raw_payload: payload
        });

    if (ledgerError) console.error(`🚨 History Ledger Audit Failure: ${ledgerError.message}`);

    // 2. TRANSACTION DISPATCH LIFECYCLE ROUTER
    switch (event) {
        case 'charge.success': {
            const tier = eventData.metadata?.tier || 'premium';
            const periodStart = eventData.paid_at || new Date().toISOString();

            // Temporary baseline fallback token calculation (used only until subscription.create updates it milliseconds later)
            const tempToken = eventData.subscription_code || eventData.reference || `pending-tx-${eventData.id}`;
            const calculatedEnd = new Date(periodStart);
            calculatedEnd.setDate(calculatedEnd.getDate() + 30);

            // Establish row or update initial transaction status markers
            await supabaseAdmin
                .from('user_subscriptions')
                .upsert(
                    {
                        user_id: userId,
                        app_id: resolvedAppId,
                        tier: tier,
                        status: 'active',
                        plan_amount_cents: eventData.amount || 28000,
                        currency: eventData.currency || 'ZAR',
                        stripe_customer_id: eventData.customer?.customer_code || null,
                        stripe_subscription_id: tempToken.trim(),
                        current_period_start: periodStart,
                        current_period_end: eventData.next_payment_date || calculatedEnd.toISOString(),
                        cancel_reason: null,
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,app_id' }
                );
            console.log(`[Webhook charge.success]: Initialized/Updated active sub row state profile shell for user ${userId}`);
            break;
        }

        case 'subscription.create': {
            const realSubscriptionCode = (eventData.subscription_code || "").trim();
            const realEmailToken = (eventData.email_token || "").trim();
            const periodStart = eventData.created_at || new Date().toISOString();

            if (!realSubscriptionCode || !realSubscriptionCode.startsWith('SUB_')) {
                console.error(`🚨 Webhook Error: subscription.create payload missing valid 'SUB_' code. Received: "${realSubscriptionCode}"`);
                break;
            }

            // AUTHORITATIVE CORE OVERWRITE UPDATE:
            // Explicitly updates your user profile matching user_id + app_id, 
            // swapping the initial temporary transaction ID with the verified SUB_ subscription code!
            const { error: syncError } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    stripe_subscription_id: realSubscriptionCode, // Overwrites code safely with SUB_xxxxxxxxxx
                    paystack_email_token: realEmailToken,       // Sets your verified email token parameters
                    stripe_customer_id: eventData.customer?.customer_code || null,
                    status: 'active',
                    plan_amount_cents: eventData.plan?.amount || 28000,
                    currency: eventData.plan?.currency || 'ZAR',
                    current_period_start: periodStart,
                    current_period_end: eventData.next_payment_date,
                    cancel_reason: null,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('app_id', resolvedAppId);

            if (syncError) {
                console.error(`🚨 Webhook Update Error on subscription.create: ${syncError.message}`);
            } else {
                console.log(`🎉 [Webhook subscription.create Success]: Authority lock confirmed! Updated user row ${userId} with real subscription code: ${realSubscriptionCode}`);
            }
            break;
        }

        case 'subscription.disable': {
            const disablingSubCode = (eventData.subscription_code || "").trim();

            const { error: disableError } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'cancelled',
                    cancel_reason: 'User initialized remote cancellation request pipeline via system profile interface.',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', disablingSubCode);

            if (disableError) console.error(`🚨 Webhook update failed on subscription.disable: ${disableError.message}`);
            break;
        }

        case 'invoice.payment_failed':
        case 'subscription.not_renewed': {
            const faultingSubCode = (eventData.subscription_code || "").trim();

            await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    status: 'cancelled',
                    tier: 'free',
                    cancel_reason: `Automatic recurring billing loop collection execution fault: ${event}`,
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', faultingSubCode);
            break;
        }

        default:
            break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
