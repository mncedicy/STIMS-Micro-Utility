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
    console.log(`🎉 [Webhook subscription.create Success]: Linked code: ${realSubscriptionCode}`);
}

export async function handleSubscriptionNotRenew(supabaseAdmin, eventData, userId, resolvedAppId) {
    const disablingSubCode = (eventData.subscription_code || eventData.code || "").trim();

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            tier: 'free',
            status: 'cancelled',
            cancel_reason: 'User initialized an active non-renewing subscription termination request.',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('app_id', resolvedAppId);

    if (error) throw new Error(`DB Update Error: ${error.message}`);
    console.log(`[Webhook subscription.not_renew]: Flipped user ${userId} status cleanly to cancelled for sub: ${disablingSubCode}`);

    // SET TO FALSE ON CANCELLATION
    const { error: vehicleError } = await supabaseAdmin
        .from('ecoroute_vehicles')
        .update({ is_active: false })
        .eq('user_id', userId);

    if (vehicleError) console.error(`[Webhook subscription.not_renew] Vehicle Deactivation Error: ${vehicleError.message}`);
}

export async function handleSubscriptionDisable(supabaseAdmin, eventData, userId, resolvedAppId) {
    const disablingSubCode = (eventData.subscription_code || "").trim();

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            tier: 'free',
            status: 'cancelled',
            cancel_reason: 'Subscription has reached its final period limit and is completely deactivated.',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('app_id', resolvedAppId);

    if (error) throw new Error(`DB Update Error: ${error.message}`);
    console.log(`[Webhook subscription.disable]: Terminated contract code ${disablingSubCode} for user ${userId}`);

    // SET TO FALSE ON CANCELLATION
    const { error: vehicleError } = await supabaseAdmin
        .from('ecoroute_vehicles')
        .update({ is_active: false })
        .eq('user_id', userId);

    if (vehicleError) console.error(`[Webhook subscription.disable] Vehicle Deactivation Error: ${vehicleError.message}`);
}

// INSTALLED HANDLER FOR AUTO-RENEWAL PROCESSING
export async function handleInvoiceUpdate(supabaseAdmin, eventData, userId, resolvedAppId) {
    const invoiceStatus = (eventData.status || "").toLowerCase();

    if (invoiceStatus !== 'success') {
        console.log(`[Webhook invoice.update]: Invoice state is "${invoiceStatus}". Skipping database subscription extension.`);
        return;
    }

    const paidAt = eventData.paid_at || new Date().toISOString();
    const nextPeriodEnd = new Date(paidAt);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);

    const subscriptionCode = (eventData.subscription?.subscription_code || "").trim();

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            status: 'active',
            tier: 'premium',
            plan_amount_cents: eventData.amount || 28000,
            currency: eventData.currency || 'ZAR',
            current_period_start: paidAt,
            current_period_end: eventData.subscription?.next_payment_date || nextPeriodEnd.toISOString(),
            cancel_reason: null,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('app_id', resolvedAppId);

    if (error) throw new Error(`DB Subscription Extension Error: ${error.message}`);
    console.log(`🔁 [Webhook invoice.update Success]: Subscription auto-renew confirmed for user ${userId} on app ${resolvedAppId}. Contract: ${subscriptionCode}`);
}

export async function handlePaymentFailure(supabaseAdmin, eventData, eventName, userId, resolvedAppId) {
    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
            status: 'cancelled',
            tier: 'free',
            cancel_reason: `Automatic recurring billing loop collection execution fault: ${eventName}`,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('app_id', resolvedAppId);

    if (error) throw new Error(`DB Update Error: ${error.message}`);
    console.log(`[Webhook payment failure]: Flagged user ${userId} as cancelled due to ${eventName}`);

    // SET TO FALSE ON CANCELLATION
    const { error: vehicleError } = await supabaseAdmin
        .from('ecoroute_vehicles')
        .update({ is_active: false })
        .eq('user_id', userId);

    if (vehicleError) console.error(`[Webhook payment failure] Vehicle Deactivation Error: ${vehicleError.message}`);
}
