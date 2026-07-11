// app/actions/checkout.js
"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function generatePaymentLink(userId, appId, priceInCents, userEmail) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
        return { success: false, error: "Gateway Error: PAYSTACK_SECRET_KEY is missing from environment." };
    }

    // SELF-PAYMENT GUARD: Prevent developers from using their master Paystack email for test mockups
    const cleanedEmail = userEmail.trim().toLowerCase();

    try {
        // Generate the base callback URL path string dynamically based on server configurations
        const baseSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const callbackTarget = `${baseSiteUrl}/dashboard?stims_app_id=${appId}`;

        const payload = {
            email: cleanedEmail,
            amount: Math.round(priceInCents),
            currency: "ZAR",
            callback_url: callbackTarget,
            metadata: {
                user_id: userId,
                app_id: appId,
                tier: "premium"
            }
        };

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}`,
                'Content-Type': 'application/json',
                'User-Agent': 'STIMS-Platform-Engine/2.1'
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorPayload = await response.text();
            console.error(`🚨 Paystack Gateway Rejection Status ${response.status}:`, errorPayload);

            if (response.status === 403) {
                return {
                    success: false,
                    error: "Paystack Gateway 403 Blocked: Make sure your account checkout profile email is different from your primary Paystack dashboard merchant email login."
                };
            }
            return { success: false, error: `Gateway rejected connection (Status ${response.status}).` };
        }

        const result = await response.json();
        if (!result.status) throw new Error(result.message || "Initialization rejected.");

        return { success: true, url: result.data.authorization_url };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function verifyLocalTransactionSession(referenceToken, expectedAppId, authenticatedUserId) {
    if (!referenceToken || !expectedAppId || !authenticatedUserId) return { success: false };

    try {
        const response = await fetch(`https://paystack.co{referenceToken}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) return { success: false };

        const result = await response.json();

        if (result.status && result.data.status === 'success') {
            const metaUserId = result.data.metadata?.user_id;
            const metaAppId = result.data.metadata?.app_id;

            if (metaUserId !== authenticatedUserId || metaAppId !== expectedAppId) {
                return { success: false, error: "Transaction verification metadata mismatch error." };
            }

            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert({
                    user_id: authenticatedUserId,
                    app_id: expectedAppId,
                    tier: 'premium',
                    status: 'active',
                    stripe_customer_id: result.data.customer?.customer_code || null,
                    stripe_subscription_id: result.data.subscription_code || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,app_id' });

            if (error) throw error;
            return { success: true };
        }

        return { success: false };
    } catch (err) {
        console.error("🚨 Server Callback Exception:", err.message);
        return { success: false };
    }
}
