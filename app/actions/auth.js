// app/actions/auth.js
"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function registerNewUser(formData) {
    const firstName = formData.get("firstName")?.toString().trim();
    const surname = formData.get("surname")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!firstName || !surname || !email || !password) {
        return { success: false, error: "Please fill out all fields." };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    surname: surname
                }
            }
        });

        if (error) throw error;

        // If your Supabase dashboard has "Confirm Email" toggled ON, remind the user
        if (data?.user && data.user.identities?.length === 0) {
            return { success: false, error: "This email is already registered." };
        }

        return { success: true, message: "Registration successful! Please check your email or log in." };
    } catch (err) {
        return { success: false, error: err.message || "Registration failed." };
    }
}
