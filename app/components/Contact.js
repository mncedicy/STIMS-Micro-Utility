// app/components/Contact.js
"use client";

import React, { useState, useTransition } from 'react';
import { dispatchTransmission } from '../actions/contact';

export default function Contact() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState({ success: null, message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ success: null, message: "" });

        const formData = new FormData(e.currentTarget);

        // Client-side quick check before dispatching pipeline
        if (!formData.get("name") || !formData.get("email") || !formData.get("message")) {
            setStatus({ success: false, message: "Please fill out all operational fields before dispatching." });
            return;
        }

        startTransition(async () => {
            const result = await dispatchTransmission(formData);
            if (result.success) {
                setStatus({ success: true, message: result.message });
                e.target.reset(); // Safely clear inputs on node success
            } else {
                setStatus({ success: false, message: result.error });
            }
        });
    };

    return (
        <section id="contact" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
            <div className="text-center mb-12">
                <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">02 // Communication Gateways</span>
                <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">Connect with Stims</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-sm transition-all duration-300 ease-out stims-hover-glow">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Identification Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. John Doe"
                                required
                                disabled={isPending}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Secure Return Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.co.za"
                                required
                                disabled={isPending}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Operational Channel Queue</label>
                        <select
                            name="queue"
                            disabled={isPending}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                        >
                            <option value="API Proposals">System Integration Inquiries (New API Proposals)</option>
                            <option value="Rate Extensions">Ecosystem Support (Rate-Limit Extensions)</option>
                            <option value="Node Feedback">General Node Feedback</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Transmission Message</label>
                        <textarea
                            name="message"
                            rows={4}
                            placeholder="Describe your technical request or implementation details..."
                            required
                            disabled={isPending}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none disabled:opacity-50"
                        />
                    </div>

                    {/* Server Feedback Reporting Area */}
                    {status.message && (
                        <div className={`p-3 rounded-lg text-xs font-mono border ${status.success
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                            }`}>
                            <div className="flex items-center space-x-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${status.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span>{status.message}</span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-200 shadow-md shadow-blue-500/10 cursor-pointer disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isPending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Synchronizing Pipeline Logs...</span>
                            </>
                        ) : (
                            <span>Dispatch Transmission</span>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}
