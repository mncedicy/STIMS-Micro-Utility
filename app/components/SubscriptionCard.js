// app/components/SubscriptionCard.js
"use client";

import React, { useTransition, useState } from 'react';
import { generatePaymentLink } from '../actions/checkout';

export default function SubscriptionCard({ userId, userEmail, appTitle, strategy, fee, type, isActiveSubscription }) {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");

    const isTotallyFree = type === "Free";

    const handleUpgradeClick = () => {
        if (isTotallyFree || isActiveSubscription || fee === "Custom Quote") return;
        setErrorMsg("");

        if (!userId || !userEmail) {
            setErrorMsg("Please log into your user account first to upgrade.");
            return;
        }

        let appId = appTitle.toLowerCase().replace(/\s+/g, '');
        if (appId === "trafficinfringements") appId = "fines";

        const numericString = fee.replace(/[^0-9]/g, '');
        const baseAmount = parseInt(numericString, 10);

        if (isNaN(baseAmount) || baseAmount <= 0) {
            setErrorMsg("Invalid subscription amount configuration metadata.");
            return;
        }

        const parsedAmountInCents = baseAmount * 100;

        startTransition(async () => {
            const result = await generatePaymentLink(userId, appId, parsedAmountInCents, userEmail);

            if (result && result.success && result.url) {
                window.location.href = result.url;
            } else {
                setErrorMsg(result?.error || "Could not spawn checkout session. Check network logs.");
            }
        });
    };

    const renderPriceLayout = () => {
        if (isTotallyFree) return { price: "R0", period: "/ Always" };
        if (fee === "Custom Quote") return { price: "Quote", period: " / Custom" };

        if (fee.includes('/')) {
            const parts = fee.split('/');
            return { price: parts, period: ` / ${parts}` };
        }

        if (fee.includes(' ')) {
            const parts = fee.split(' ');
            return { price: parts, period: ` ${parts}` };
        }

        return { price: fee, period: "" };
    };

    const priceLayout = renderPriceLayout();

    return (
        <div className={`border rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between transition-all duration-300 ease-out stims-hover-glow h-64 ${isActiveSubscription ? 'bg-emerald-950/10 border-emerald-500/30 shadow-emerald-500/5' : 'bg-slate-900/40 border border-slate-800'
            }`}>
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white tracking-tight">{appTitle}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${isActiveSubscription
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : isTotallyFree
                            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                            : 'bg-blue-950/20 border-blue-500/20 text-blue-400'
                        }`}>
                        {isActiveSubscription ? "Active" : type}
                    </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
                    {strategy}
                </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60">
                <div className="flex items-baseline space-x-1 mb-3">
                    <span className="text-2xl font-extrabold text-white font-mono">
                        {priceLayout.price}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {priceLayout.period}
                    </span>
                </div>

                {errorMsg && (
                    <div className="mb-2 text-[10px] font-mono text-rose-400 block whitespace-normal" title={errorMsg}>
                        ⚠️ {errorMsg}
                    </div>
                )}

                {isActiveSubscription ? (
                    <div className="w-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] py-2 px-3 rounded-md text-center uppercase tracking-wider font-bold select-none">
                        ✓ Premium Features Unlocked
                    </div>
                ) : isTotallyFree ? (
                    <div className="w-full bg-slate-950 border border-slate-900 text-slate-500 font-mono text-[10px] py-2 px-3 rounded-md text-center uppercase tracking-wider select-none">
                        Included Globally
                    </div>
                ) : fee === "Custom Quote" ? (
                    <a
                        href="/#contact"
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs py-2 px-3 rounded-md transition-colors text-center block uppercase tracking-wider font-mono text-[10px]"
                    >
                        Contact Enterprise
                    </a>
                ) : (
                    <button
                        type="button"
                        onClick={handleUpgradeClick}
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-3 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center space-x-2"
                    >
                        {isPending ? <span>Routing...</span> : <span>Unlock Features</span>}
                    </button>
                )}
            </div>
        </div>
    );
}
