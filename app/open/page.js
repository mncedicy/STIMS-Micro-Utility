// app/open/page.js
import React from 'react';
import { fetchLiveSystemTelemetry, fetchLiveDatabaseMetrics } from '../utils/telemetry';

export const dynamic = 'force-dynamic';

export default async function OpenAnalyticsPage() {
    const liveStats = await fetchLiveSystemTelemetry();
    let liveDbVolume = await fetchLiveDatabaseMetrics();

    // Safe check: If the database value fails or returns NaN, show a clean zero or a default count
    if (!liveDbVolume || liveDbVolume === "NaN") {
        liveDbVolume = "0";
    }

    const metricsList = [
        { name: "Total Messages Saved", value: liveDbVolume },
        { name: "Server Load Capacity", value: liveStats.serverLoad },
        { name: "Memory Efficiency", value: liveStats.memoryCache },
        { name: "Active Processor Cores", value: liveStats.coresActive }
    ];

    const popularTools = [
        { title: "RateWatch", percentage: "34%", width: "w-[34%]" },
        { title: "EcoRoute", percentage: "22%", width: "w-[22%]" },
        { title: "MedTime", percentage: "16%", width: "w-[16%]" },
        { title: "ChefSalvage", percentage: "12%", width: "w-[12%]" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-16 px-6 pb-24 relative">
            <div className="max-w-4xl mx-auto">

                <header className="border-b border-slate-900 pb-6 mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-4 sm:space-y-0">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">Live Data</span>
                        <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">System Metrics</h1>
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                        stims.co.za // Current Numbers
                    </div>
                </header>

                {/* Main System Grid Card Metrics */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {metricsList.map((item, index) => (
                        <div key={index} className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between h-28">
                            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">{item.name}</span>
                            <div className="text-xl font-bold text-white font-mono tracking-tight">{item.value}</div>
                        </div>
                    ))}
                </section>

                {/* Popular Tool Utilization Share Layer */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 bg-slate-900/10 border border-slate-900 rounded-xl p-6 backdrop-blur-sm">
                        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6">
                            Tool Usage Share
                        </h2>
                        <div className="space-y-5">
                            {popularTools.map((tool, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-white font-bold">{tool.title}</span>
                                        <span className="text-slate-400">{tool.percentage}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 border border-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full bg-blue-500 rounded-full ${tool.width}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FIXED: Changed Ecosystem Info to use very simple English without any technical words */}
                    <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 backdrop-blur-sm space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">About This Page</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            This page updates every time you open it. It displays the total count of messages sent through our contact form and shows how much memory and speed our local computer system is using right now.
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}
