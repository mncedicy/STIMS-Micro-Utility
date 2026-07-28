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

    const computedHash = crypto.createHmac('sha512', secretKey.trim()).update(rawBody).digest('hex');
    if (computedHash !== paystackSignature) {
        console.error("🚨 STIMS Billing: Paystack verification signature mismatch.");
        return NextResponse.json({ error: "Unauthorized transaction source signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("📦 COMPLETE PAYSTACK PAYLOAD:", JSON.stringify(payload, null, 2));

    const event = payload.event;
    const eventData = payload.data;

    let userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
    let planCode = eventData.plan?.plan_code || eventData.plan_object?.plan_code;
    let resolvedAppId = eventData.metadata?.app_id || 'ecoroute';

    if (!userId && eventData.customer?.metadata?.custom_fields) {
        const userIdField = eventData.customer.metadata.custom_fields.find(f => f.variable_name === 'user_id');
        if (userIdField) userId = userIdField.value;
    }

    if (planCode && !eventData.metadata?.app_id) {
        const { data: appRegister } = await supabaseAdmin
            .from('applications')
            .select('app_id')
            .eq('paystack_plan_id', planCode)
            .maybeSingle();
        if (appRegister) resolvedAppId = appRegister.app_id;
    }

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
        console.error(`🚨 Paystack Webhook Error: Could not resolve user identification context.`);
        return NextResponse.json({ error: "Unable to process identity context mapping." }, { status: 200 });
    }

    // Capture comprehensive auditing trace logic
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

    // Core transaction lifecycle matrix handling
    switch (event) {
        case 'charge.success': {
            const tier = eventData.metadata?.tier || 'premium';
            const resolvedSubToken = eventData.subscription_code || eventData.reference;
            const periodStart = eventData.paid_at || new Date().toISOString();

            // Calculate next renewal period dates (add 30 days fallback)
            const calculatedEnd = new Date(periodStart);
            calculatedEnd.setDate(calculatedEnd.getDate() + 30);

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
                        stripe_subscription_id: resolvedSubToken,
                        current_period_start: periodStart,
                        current_period_end: eventData.next_payment_date || calculatedEnd.toISOString(),
                        cancel_reason: null, // Clear past cancellation traces on repayment
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,app_id' }
                );
            break;
        }

        case 'subscription.create': {
            const periodStart = eventData.created_at || new Date().toISOString();

            await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    stripe_subscription_id: eventData.subscription_code.trim(),
                    stripe_customer_id: eventData.customer?.customer_code,
                    paystack_email_token: eventData.email_token || null,
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
            break;
        }

        case 'subscription.disable': {
            await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'cancelled',
                    cancel_reason: 'User initialized remote subscription termination request pipeline.',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', eventData.subscription_code.trim());
            break;
        }

        case 'invoice.payment_failed':
        case 'subscription.not_renewed': {
            await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    status: 'cancelled', // Downgrade state gracefully upon consecutive invoice faults
                    tier: 'free',
                    cancel_reason: `Billing loop execution failure logic triggered: ${event}`,
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', eventData.subscription_code.trim());
            break;
        }

        default:
            break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
