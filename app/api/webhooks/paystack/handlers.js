// src/app/api/webhooks/paystack/handlers.js

export async function handleChargeSuccess(supabaseAdmin, eventData, userId, resolvedAppId) {
    const tier = eventData.metadata?.tier || 'premium';
    const periodStart = eventData.paid_at || new Date().toISOString();

    const tempToken = eventData.subscription_code || eventData.reference || `pending-tx-${eventData.id}`;
    const calculatedEnd = new Date(periodStart);
    calculatedEnd.setDate(calculatedEnd.getDate() + 30);

    const { error } = await supabaseAdmin
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

    if (error) throw new Error(`DB Sync Error: ${error.message}`);
    console.log(`[Webhook charge.success]: Synced transaction metrics for user ${userId}`);
}

export async function handleSubscriptionCreate(supabaseAdmin, eventData, userId, resolvedAppId) {
    const realSubscriptionCode = (eventData.subscription_code || "").trim();
    const realEmailToken = (eventData.email_token || "").trim();
    const periodStart = eventData.created_at || new Date().toISOString();

    if (!realSubscriptionCode || !realSubscriptionCode.startsWith('SUB_')) {
        throw new Error(`subscription.create payload missing valid 'SUB_' code. Received: "${realSubscriptionCode}"`);
    }

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            stripe_subscription_id: realSubscriptionCode,
            paystack_email_token: realEmailToken,
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

    if (error) throw new Error(`DB Update Error: ${error.message}`);
    console.log(`🎉 [Webhook subscription.create Success]: Authority lock confirmed! Linked code: ${realSubscriptionCode}`);
}

export async function handleSubscriptionDisable(supabaseAdmin, eventData) {
    const disablingSubCode = (eventData.subscription_code || "").trim();

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            tier: 'free',
            status: 'cancelled',
            cancel_reason: 'User initialized remote cancellation request pipeline.',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', disablingSubCode);

    if (error) throw new Error(`DB Update Error: ${error.message}`);
    console.log(`[Webhook subscription.disable]: Cancelled contract code ${disablingSubCode}`);
}

export async function handlePaymentFailure(supabaseAdmin, eventData, eventName) {
    const faultingSubCode = (eventData.subscription_code || "").trim();

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            status: 'cancelled',
            tier: 'free',
            cancel_reason: `Automatic recurring billing loop collection execution fault: ${eventName}`,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', faultingSubCode);

    if (error) throw new Error(`DB Update Error: ${error.message}`);
    console.log(`[Webhook payment failure]: Flagged contract code ${faultingSubCode} as cancelled due to ${eventName}`);
}
