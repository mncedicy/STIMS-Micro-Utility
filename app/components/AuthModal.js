// app/components/AuthModal.js
"use client";

import React, { useTransition } from 'react';
import { registerNewUser } from "../actions/auth";
import { requestPasswordReset } from "../actions/auth-signin";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuthModal({ isOpen, onClose, mode, setMode, status, setStatus, onLoginSuccess }) {
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ success: null, message: "" });
        const formData = new FormData(e.currentTarget);

        // 1. Client-Side Login Logic
        if (mode === 'signin') {
            const email = formData.get("email")?.toString().trim();
            const password = formData.get("password")?.toString();

            if (!email || !password) {
                setStatus({ success: false, message: "Please fill out all fields." });
                return;
            }

            startTransition(async () => {
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;

                    if (data?.user) {
                        const firstName = data.user.user_metadata?.first_name || "User";
                        localStorage.setItem('stims_session_active', 'true');
                        localStorage.setItem('stims_user_name', firstName);

                        setStatus({ success: true, message: "Welcome back! Login successful." });
                        setTimeout(() => onLoginSuccess(), 400);
                    }
                } catch (err) {
                    setStatus({ success: false, message: err.message || "Invalid credentials." });
                }
            });
            return;
        }

        // 2. Server Action pipelines for Register and Reset Requests
        startTransition(async () => {
            let res;
            if (mode === 'signup') {
                res = await registerNewUser(formData);
            } else if (mode === 'forgot') {
                res = await requestPasswordReset(formData);
            }

            if (res.success) {
                if (mode === 'signup') {
                    // FIX: Automatically move the user directly to the Login Form screen
                    setStatus({ success: true, message: "Account created successfully! Please log in below." });
                    setTimeout(() => {
                        setMode('signin');
                        setStatus({ success: null, message: "" }); // Clear messages for a clean login box view
                    }, 1500);
                } else {
                    setStatus({ success: true, message: res.message });
                    e.target.reset();
                }
            } else {
                setStatus({ success: false, message: res.error });
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 shadow-2xl relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-xs font-mono text-slate-500 hover:text-white cursor-pointer">ESC</button>

                <h3 className="text-lg font-bold text-white mb-4">
                    {mode === 'signin' && "Log In"}
                    {mode === 'signup' && "Create Account"}
                    {mode === 'forgot' && "Reset Password"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">First Name</label>
                                <input type="text" name="firstName" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Surname</label>
                                <input type="text" name="surname" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email</label>
                        <input type="email" name="email" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                    </div>

                    {mode !== 'forgot' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[10px] font-mono text-slate-400 uppercase">Password</label>
                                {mode === 'signin' && <button type="button" onClick={() => { setMode('forgot'); setStatus({ success: null, message: "" }); }} className="text-[10px] text-blue-500 hover:underline cursor-pointer">Forgot?</button>}
                            </div>
                            <input type="password" name="password" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                    )}

                    {status.message && (
                        <div className={`p-2.5 rounded text-[11px] font-mono border ${status.success ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'}`}>{status.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 px-4 rounded-md transition-colors cursor-pointer disabled:opacity-50">
                        {isPending ? "Processing..." : (mode === 'signin' ? "Log In" : mode === 'signup' ? "Register" : "Send Link")}
                    </button>
                </form>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-center space-x-1 text-[11px] text-slate-400">
                    {mode === 'signin' && <><span className="text-[11px]">New user?</span><button type="button" onClick={() => { setMode('signup'); setStatus({ success: null, message: "" }); }} className="text-blue-500 hover:underline font-bold cursor-pointer">Create account</button></>}
                    {mode === 'signup' && <><span className="text-[11px]">Have an account?</span><button type="button" onClick={() => { setMode('signin'); setStatus({ success: null, message: "" }); }} className="text-blue-500 hover:underline font-bold cursor-pointer">Log in</button></>}
                    {mode === 'forgot' && <button type="button" onClick={() => { setMode('signin'); setStatus({ success: null, message: "" }); }} className="text-blue-500 hover:underline font-bold cursor-pointer">Return to log in</button>}
                </div>
            </div>
        </div>
    );
}
