// app/components/SubscriptionCard.js
"use client";

import React, { useTransition, useState } from 'react';
import { generatePaymentLink } from '../actions/checkout';

const CONFIGS = {
    Free: { dot: 'bg-emerald-200/50', text: 'text-emerald-400', pulse: 'bg-emerald-500', title: 'group-hover:text-emerald-500' },
    Paid: { dot: 'bg-blue-300/60', text: 'text-blue-400', pulse: 'bg-blue-500', title: 'group-hover:text-blue-400' },
    Active: { dot: 'bg-cyan-300/60', text: 'text-cyan-400', pulse: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]', title: 'group-hover:text-cyan-400' }
};

export default function SubscriptionCard({ userId, userEmail, appTitle, strategy, fee, type, isActiveSubscription, subdomainUrl }) {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");

    const isFree = type === "Free";
    const statusKey = isActiveSubscription ? 'Active' : type;
    const c = CONFIGS[statusKey] || CONFIGS.Paid;

    const handleUpgrade = () => {
        if (isFree || isActiveSubscription || fee === "Custom Quote") return;
        setErrorMsg("");

        if (!userId || !userEmail) {
            setErrorMsg("Please log in first to upgrade.");
            return;
        }

        let appId = appTitle.toLowerCase().replace(/\s+/g, '');
        if (appId === "trafficinfringements") appId = "fines";

        const cents = parseInt(fee.replace(/[^0-9]/g, ''), 10) * 100;
        if (isNaN(cents) || cents <= 0) return setErrorMsg("Invalid fee metadata.");

        startTransition(async () => {
            const res = await generatePaymentLink(userId, appId, cents, userEmail);
            if (res?.success && res?.url) window.location.href = res.url;
            else setErrorMsg(res?.error || "Checkout session failed.");
        });
    };

    const parts = fee.split(fee.includes('/') ? '/' : ' ');
    const priceStr = isFree ? "R0" : fee === "Custom Quote" ? "Quote" : parts[0];
    const periodStr = isFree ? "/ Always" : fee === "Custom Quote" ? " / Custom" : fee.includes('/') ? ` / ${parts[1]}` : ` ${parts[1] || 'once'}`;

    return (
        <div className={`group relative bg-slate-900/40 border rounded-xl p-5 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 ease-out stims-hover-glow h-64 ${isActiveSubscription ? 'border-cyan-500/30 bg-cyan-950/5' : 'border-slate-900'}`}>
            <div className="absolute top-0 left-0 right-0 h-56 overflow-hidden select-none pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_24px] opacity-10" />
                <div className={`absolute inset-0 bg-gradient-to-tr via-transparent to-transparent ${isActiveSubscription ? 'from-cyan-500/5' : isFree ? 'from-emerald-500/5' : 'from-blue-500/5'}`} />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center border-b border-slate-900/40 pb-1 z-20">
                    <div className="flex space-x-1">
                        {[1, 2, 3].map(d => <div key={d} className={`h-1 w-1 rounded-full ${c.dot}`} />)}
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${c.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${c.pulse}`} />
                        {isActiveSubscription ? "Active Plan" : type}
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-[#020617] z-10" />
            </div>

            <div className="relative z-10 pt-8 flex flex-col justify-between h-full">
                <div className="space-y-1">
                    <h3 className={`text-base font-bold text-white transition-colors duration-200 ${c.title}`}>{appTitle}</h3>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">{strategy}</p>
                </div>

                <div className="pt-3 border-t border-slate-900/60 mt-auto">
                    <div className="flex items-baseline space-x-1 mb-3">
                        <span className="text-2xl font-extrabold text-white font-mono">{priceStr}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{periodStr}</span>
                    </div>

                    {errorMsg && <div className="mb-2 text-[10px] font-mono text-rose-400 block whitespace-normal">⚠️ {errorMsg}</div>}

                    {isActiveSubscription || isFree ? (
                        <a href={subdomainUrl || "#"} target="_blank" rel="noopener noreferrer" className={`inline-flex w-full justify-center items-center border font-medium text-xs py-2 px-3 rounded-lg transition-all duration-200 bg-slate-950 group/btn ${isActiveSubscription ? 'border-cyan-500/30 text-cyan-400 hover:border-cyan-400' : 'border-slate-800 text-slate-300 hover:border-emerald-500/40'}`}>
                            {isActiveSubscription ? "Launch Workspace" : "Launch Free App"}
                            <svg className="w-3 h-3 ml-2 group-hover/btn:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    ) : fee === "Custom Quote" ? (
                        <a href="/#contact" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs py-2 px-3 rounded-md transition-colors text-center block uppercase tracking-wider font-mono text-[10px]">Contact Enterprise</a>
                    ) : (
                        <button type="button" onClick={handleUpgrade} disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-3 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm flex items-center justify-center">{isPending ? "Routing..." : "Unlock Features"}</button>
                    )}
                </div>
            </div>
        </div>
    );
}
