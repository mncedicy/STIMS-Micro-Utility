// app/reset-password/page.js
"use client";

import React, { useState, useTransition } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResetPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState({ success: null, message: "" });

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        setStatus({ success: null, message: "" });

        const password = new FormData(e.currentTarget).get("password")?.toString();

        if (!password || password.length < 6) {
            setStatus({ success: false, message: "Password must be at least 6 characters." });
            return;
        }

        startTransition(async () => {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                setStatus({ success: false, message: error.message });
            } else {
                setStatus({ success: true, message: "Your password has been saved! You can now log in securely." });
                e.target.reset();
            }
        });
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 relative z-10">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 shadow-2xl relative shadow-blue-500/5">
                <h2 className="text-xl font-bold text-white mb-1">New Password</h2>
                <p className="text-xs text-slate-400 mb-6 font-mono">Type a new secret password below.</p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Type New Password</label>
                        <input type="password" name="password" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                    </div>

                    {status.message && (
                        <div className={`p-2.5 rounded text-[11px] font-mono border ${status.success ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                            }`}>{status.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 px-4 rounded-md transition-colors cursor-pointer disabled:opacity-50">
                        {isPending ? "Saving..." : "Save Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
