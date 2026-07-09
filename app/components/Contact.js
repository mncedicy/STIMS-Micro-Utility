// app/components/Contact.js
"use client"; // Enforcing user-interactivity tracking for event handlers

import React from 'react';

export default function Contact() {
    return (
        <section id="contact" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
            <div className="text-center mb-12">
                <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">02 // Communication Gateways</span>
                <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">Connect with Stims</h2>
            </div>

            {/* Added your enhanced high-intensity neon glow system utility wrapper here */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-sm transition-all duration-300 ease-out stims-hover-glow">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Identification Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Secure Return Email</label>
                            <input
                                type="email"
                                placeholder="name@company.co.za"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Operational Channel Queue</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors">
                            <option>System Integration Inquiries (New API Proposals)</option>
                            <option>Ecosystem Support (Rate-Limit Extensions)</option>
                            <option>General Node Feedback</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Transmission Message</label>
                        <textarea
                            rows={4}
                            placeholder="Describe your technical request or implementation details..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        onClick={(e) => e.preventDefault()}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-200 shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                        Dispatch Transmission
                    </button>
                </form>
            </div>
        </section>
    );
}
