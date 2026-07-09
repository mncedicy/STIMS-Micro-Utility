// app/status/page.js
import React from 'react';
import { projectSuite } from '../data';
import { fetchLiveSystemTelemetry, pingSubdomainNode } from '../utils/telemetry';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
    const liveStats = await fetchLiveSystemTelemetry();

    const evaluatedNodes = await Promise.all(
        projectSuite.map(async (tool) => {
            const health = await pingSubdomainNode(tool.title, tool.link);
            return { ...tool, health };
        })
    );

    const hardwareMetrics = [
        { label: "Server Load", value: liveStats.serverLoad },
        { label: "Memory Cache", value: liveStats.memoryCache },
        { label: "Latency", value: liveStats.networkLatency }
    ];

    const totalOffline = evaluatedNodes.filter(n => !n.health.online).length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-12 px-6 pb-24 relative">
            <div className="max-w-4xl mx-auto">

                <header className="border-b border-slate-900 pb-4 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-3 sm:space-y-0">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">System Status</span>
                        <h1 className="text-2xl font-bold text-white mt-0.5 tracking-tight">Perimeter Monitor</h1>
                    </div>

                    {totalOffline === 0 ? (
                        <div className="inline-flex items-center space-x-2 bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-mono text-emerald-400 font-medium">ONLINE</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center space-x-2 bg-rose-950/20 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[11px] font-mono text-rose-400 font-medium">{totalOffline} OFFLINE</span>
                        </div>
                    )}
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {hardwareMetrics.map((metric, index) => (
                        <div key={index} className="bg-slate-900/30 border border-slate-900 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mb-0.5">{metric.label}</div>
                            <div className="text-base font-bold text-white font-mono tracking-tight">{metric.value}</div>
                        </div>
                    ))}
                </section>

                <section className="pt-8 space-y-3.5">
                    <h2 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-4 block">
                        Service Ledger
                    </h2>

                    {evaluatedNodes.map((tool, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-900/20 border border-slate-900/40 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 transition-all duration-300 ease-out stims-hover-glow"
                        >
                            <div className="flex flex-col min-w-[200px]">
                                <span className="text-base font-extrabold text-white tracking-tight">{tool.title}</span>
                                <span className="text-xs font-mono text-slate-400 truncate max-w-[220px] mt-0.5">{tool.link}</span>
                            </div>

                            <div className="flex items-center space-x-1 overflow-hidden">
                                {[...Array(28)].map((_, i) => (
                                    <div key={i} className="h-5 w-1 rounded-sm bg-blue-500/80" />
                                ))}
                            </div>

                            <div className="text-left sm:text-right">
                                {tool.health.online ? (
                                    <span className="bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-md tracking-wider">
                                        ONLINE
                                    </span>
                                ) : (
                                    <span className="bg-slate-950 border border-rose-900/50 text-xs font-mono font-bold text-rose-400 px-3 py-1 rounded-md tracking-wider animate-pulse">
                                        OFFLINE
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </section>

            </div>
        </div>
    );
}
