// app/actions/contact.js
"use server";

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase Platform Hook
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Resend Email Engine Hook
const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;
const destinationEmail = process.env.FORWARD_DESTINATION_EMAIL;

export async function dispatchTransmission(formData) {
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const queue = formData.get("queue")?.toString();
    const message = formData.get("message")?.toString().trim();

    // 1. Structural Server-Side Validations
    if (!name || !email || !message) {
        return { success: false, error: "All structural identification data fields must be populated." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "The provided secure return email address layout is invalid." };
    }

    try {
        // 2. Dual Pipeline Component A: Commit directly to Supabase Table
        const { error: dbError } = await supabase
            .from('contacts')
            .insert([
                {
                    name,
                    email,
                    channel_queue: queue,
                    message,
                    created_at: new Date().toISOString()
                }
            ]);

        if (dbError) throw dbError;

        // 3. Dual Pipeline Component B: Forward Summary Ledger via Email
        if (resend && destinationEmail) {
            await resend.emails.send({
                from: 'STIMS Gateways <onboarding@resend.dev>', // Swap for your own verified custom domain in production
                to: [destinationEmail],
                subject: `[STIMS Engine] Transmission Route: ${queue}`,
                html: `
                    <div style="font-family: monospace; background-color: #020617; color: #94a3b8; padding: 24px; border: 1px solid #1e293b; border-radius: 8px;">
                        <h2 style="color: #ffffff; border-b: 1px solid #1e293b; padding-bottom: 8px; font-size: 16px;">STIMS INCOMING LOG DISPATCH</h2>
                        <p style="margin: 8px 0;"><strong style="color: #3b82f6;">Identity:</strong> ${name}</p>
                        <p style="margin: 8px 0;"><strong style="color: #3b82f6;">Return Path:</strong> ${email}</p>
                        <p style="margin: 8px 0;"><strong style="color: #3b82f6;">Channel Queue:</strong> ${queue}</p>
                        <div style="margin-top: 16px; padding: 12px; background-color: #0f172a; border-left: 3px solid #3b82f6; color: #f8fafc; font-size: 13px;">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                        <p style="font-size: 10px; color: #475569; margin-top: 24px;">Timestamp: ${new Date().toUTCString()} // Johannesburg Node Security Locked</p>
                    </div>
                `
            });
        }

        return { success: true, message: "Transmission successfully routed to database and dispatch email inbox." };
    } catch (err) {
        console.error("Ecosystem Handshake Sync Error:", err);
        return { success: false, error: "Node handshake failed. System was unable to fully process telemetry pipelines." };
    }
}
