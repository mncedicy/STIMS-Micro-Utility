// app/actions/auth-signin.js (and auth.js)
"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail gracefully instead of letting the async function panic
if (!supabaseAnonKey) {
    console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey || "dummy_key");


export async function loginExistingUser(formData) {
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return { success: false, error: "Please fill out all fields." };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, message: "Welcome back! Login successful." };
    } catch (err) {
        return { success: false, error: err.message || "Invalid credentials." };
    }
}

export async function requestPasswordReset(formData) {
    const email = formData.get("email")?.toString().trim();

    if (!email) {
        return { success: false, error: "Please provide your email address." };
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stims.co.za'}/reset-password`,
        });

        if (error) throw error;

        return { success: true, message: "Password reset link sent to your email inbox." };
    } catch (err) {
        return { success: false, error: err.message || "Reset request failed." };
    }
}
