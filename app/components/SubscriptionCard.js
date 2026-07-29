"use client";

import React, { useTransition, useState } from 'react';

const CONFIGS = {
    Free: { dot: 'bg-emerald-200/50', text: 'text-emerald-400', pulse: 'bg-emerald-500', title: 'group-hover:text-emerald-500' },
    Paid: { dot: 'bg-blue-300/60', text: 'text-blue-400', pulse: 'bg-blue-500', title: 'group-hover:text-blue-400' },
    Active: { dot: 'bg-cyan-300/60', text: 'text-cyan-400', pulse: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]', title: 'group-hover:text-cyan-400' }
};

export default function SubscriptionCard({ userId, userEmail, user, appTitle, strategy, fee, type, isActiveSubscription, subdomainUrl, appStatus, isOnline }) {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");

    const isFree = type === "Free";
    const statusKey = isActiveSubscription ? 'Active' : type;
    const c = CONFIGS[statusKey] || CONFIGS.Paid;

    let appId = appTitle.toLowerCase().replace(/\s+/g, '');
    if (appId === "trafficinfringements") appId = "fines";

    // Assert that the app must be Active in the database and responding to network pings to launch or upgrade
    const isAppLaunchable = appStatus === "Active" && isOnline !== false;

    const handleUpgrade = () => {
        if (isFree || isActiveSubscription || fee === "Custom Quote") return;
        setErrorMsg("");

        if (appStatus !== "Active") {
            setErrorMsg(`This tool is currently configured as ${appStatus || 'maintenance'}. Subscriptions are locked.`);
            return;
        }

        if (isOnline === false) {
            setErrorMsg("This tool's host server is currently offline. Subscriptions are temporarily paused to protect your wallet.");
            return;
        }

        if (!userId || !userEmail) {
            setErrorMsg("Please log in first to upgrade.");
            return;
        }

        const cents = parseInt(fee.replace(/[^0-9]/g, ''), 10) * 100;
        if (isNaN(cents) || cents <= 0) return setErrorMsg("Invalid fee metadata.");

        startTransition(async () => {
            try {
                const response = await fetch('/api/checkout/initialize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        userEmail,
                        appId,
                        amount: cents
                    })
                });

                const res = await response.json();
                if (res?.success && res?.url) {
                    window.location.href = res.url;
                } else {
                    throw new Error(res?.error || "Checkout session failed to construct gateway authorization link.");
                }
            } catch (err) {
                setErrorMsg(err.message);
            }
        });
    };

    // FIXED: Safely parsing string variables to prevent syntax errors during compilation
    const parts = (fee || "").split(fee.includes('/') ? '/' : ' ');
    const priceStr = isFree ? "R0" : fee === "Custom Quote" ? "Quote" : (parts[0] || "");
    const periodStr = isFree ? "/ Always" : fee === "Custom Quote" ? " / Custom" : fee.includes('/') ? ` / ${parts[1] || 'month'}` : ` ${parts[1] || 'once'}`;

    const displayStatusLabel = appStatus !== "Active" ? appStatus : "Offline";


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
                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isOnline ? c.pulse : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
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

                    {/* FIXED: Removed raw functional emojis from string output maps */}
                    {errorMsg && <div className="mb-2 text-[10px] font-mono text-rose-400 block whitespace-normal">System Alert: {errorMsg}</div>}

                    <div className="space-y-2">
                        {isActiveSubscription || isFree ? (
                            isAppLaunchable ? (
                                <a href={subdomainUrl || "#"} target="_blank" rel="noopener noreferrer" className={`inline-flex w-full justify-center items-center border font-medium text-xs py-2 px-3 rounded-lg transition-all duration-200 bg-slate-950 group/btn ${isActiveSubscription ? 'border-cyan-500/30 text-cyan-400 hover:border-cyan-400' : 'border-slate-800 text-slate-300 hover:border-emerald-500/40'}`}>
                                    {isActiveSubscription ? "Launch Workspace" : "Launch Free App"}
                                    <svg className="w-3 h-3 ml-2 group-hover/btn:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                            ) : (
                                <button disabled className="inline-flex w-full justify-center items-center border font-medium text-xs py-2 px-3 rounded-lg bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed select-none">
                                    Disabled ({displayStatusLabel})
                                    <svg className="w-3 h-3 ml-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </button>
                            )
                        ) : fee === "Custom Quote" ? (
                            <a href="/#contact" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs py-2 px-3 rounded-md transition-colors text-center block uppercase tracking-wider font-mono text-[10px]">Contact Enterprise</a>
                        ) : (
                            <button type="button" onClick={handleUpgrade} disabled={isPending || !isOnline} className={`w-full text-white font-medium text-xs py-2 px-3 rounded-md transition-all duration-200 shadow-sm flex items-center justify-center ${isAppLaunchable ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'}`}>
                                {isPending ? "Routing..." : isAppLaunchable ? "Unlock Features" : `Unavailable (${displayStatusLabel})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
