import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:3001',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req) {
    // Instantiate our private administrative bypass client to search registry structures securely
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { userId, userEmail, appId, amount } = await req.json();
        if (!userId || !userEmail || !appId || !amount) {
            return NextResponse.json({ success: false, error: "Missing parameters." }, { status: 400, headers: corsHeaders });
        }

        // DYNAMIC BASE URL EXTRACTION:
        const { origin: baseUrl } = new URL(req.url);

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            console.error("🚨 Main Hub Checkout: PAYSTACK_SECRET_KEY is missing from environment variables.");
            return NextResponse.json({ success: false, error: "Server misconfiguration." }, { status: 500, headers: corsHeaders });
        }

        // ========================================================================
        // DYNAMIC MULTI-TENANT PLATFORM LOOKUP ENGINE
        // ========================================================================
        // Queries the authoritative catalog table to pull real plan parameters for this appId
        const { data: appConfig, error: appQueryError } = await supabaseAdmin
            .from('applications')
            .select('fee_amount_cents, paystack_plan_id')
            .eq('app_id', appId)
            .maybeSingle();

        if (appQueryError) {
            console.warn(`[Hub Billing Guard]: Database query trace warning: ${appQueryError.message}`);
        }

        // Assign core monetization variables dynamically from database rows, fallback to input payload values if blank
        const dynamicAmount = appConfig?.fee_amount_cents || amount;
        const globalPlanIdToken = appConfig?.paystack_plan_id ? appConfig.paystack_plan_id.trim() : null;

        // Dispatches parameters natively over to Paystack transaction engines
        const response = await fetch(process.env.PAYSTACK_INITIALIZE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail.trim().toLowerCase(),
                amount: dynamicAmount,
                currency: 'ZAR',
                callback_url: `${baseUrl}/dashboard?stims_app_id=${appId}`,
                // If a paystack_plan_id is active in the database row, attach it to initialize a subscription
                ...(globalPlanIdToken && { plan: globalPlanIdToken }),
                metadata: {
                    user_id: userId,
                    app_id: appId,
                    tier: 'premium'
                },
                // INJECTED PERSISTENT CUSTOMER PROFILE METADATA LAYER:
                // Stores user_id inside customer object arrays so it flows directly into subscription.create events natively
                customer: {
                    metadata: {
                        user_id: userId,
                        custom_fields: [
                            {
                                variable_name: "user_id",
                                display_name: "User ID",
                                value: userId
                            }
                        ]
                    }
                }
            }),
            cache: 'no-store'
        });

        const result = await response.json();
        if (!result.status) throw new Error(result.message || "Paystack initialization failed.");

        return NextResponse.json({ success: true, url: result.data.authorization_url }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("🚨 Hub Initialization Route Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}
