// app/components/Stats.js
import React from 'react';

export default function Stats() {
    const analyticsNodes = [
        { label: "OPERATIONAL SERVICES", value: "10 Nodes Active" },
        { label: "CONNECTED CORE PIPELINES", value: "14 Upstream APIs" },
        { label: "GLOBAL PLATFORM UPTIME", value: "99.98% Monitored" }
    ];

    return (
        <section className="max-w-5xl mx-auto px-6 mb-16 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm">
                {analyticsNodes.map((node, idx) => (
                    <div key={idx} className="flex flex-col space-y-1 text-center sm:text-left sm:first:border-0 border-t sm:border-t-0 border-slate-800/60 pt-4 sm:pt-0 first:pt-0">
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                            {node.label}
                        </span>
                        <span className="text-xl font-bold text-white tracking-tight">
                            {node.value}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
