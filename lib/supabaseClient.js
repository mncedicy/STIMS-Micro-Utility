// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("STIMS Security Guard: Missing core Supabase configuration tokens.");
}

// Determines the correct cookie cookie domain for port-sharing vs subdomain-sharing
const getCookieOptions = () => {
    if (typeof window === 'undefined') return {};

    const hostname = window.location.hostname;

    // LOCAL TESTING: If on localhost, omit 'domain' so cookies naturally flow across all arbitrary ports!
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            path: '/',
            sameSite: 'lax',
            secure: false, // Must be false for standard http://localhost ports
            maxAge: 60 * 60 * 24 * 7 // 1 Week
        };
    }

    // VERCEL PRODUCTION: Force wildcard subdomains across *.stims.co.za
    return {
        domain: '.stims.co.za',
        path: '/',
        sameSite: 'lax', // Required to allow cookies to bridge across different app instances safely
        secure: true,    // Production requires explicit HTTPS enforcement
        maxAge: 60 * 60 * 24 * 7 // 1 Week
    };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'stims-enterprise-sso',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // Enables robust secure cross-app sync workflows
        cookieOptions: getCookieOptions()
    }
});
