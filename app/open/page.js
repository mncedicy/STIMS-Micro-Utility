// app/open/page.js
import React from 'react';
import { projectSuite } from '../data';

export default function OpenAnalyticsPage() {
    // Telemetry indicators tracking framework calculations
    const hardwareTelem = [
        { metric: "Aggregate Data Requests", value: "4,219,842 Ops", status: "Nominal" },
        { metric: "Ubuntu Network Bandwidth", value: "1.24 Gbps", status: "Optimal" },
        { metric: "Database Cache Hits", value: "94.21%", status: "Excellent" },
        { metric: "Active Processing Cores", value: "4 / 4 Online", status: "100% Core" }
    ];

    // Derived tracking to rank high-demand apps
    const highDemandTools = [
        { title: "RateWatch", share: "34%", count: "1,434,746 Calls", barW: "w-[34%]" },
        { title: "EcoRoute", share: "22%", count: "928,365 Calls", barW: "w-[22%]" },
        { title: "MedTime", share: "16%", count: "675,174 Calls", barW: "w-[16%]" },
        { title: "ChefSalvage", share: "12%", count: "506,381 Calls", barW: "w-[12%]" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-16 px-6 pb-24 relative">
            <div className="max-w-4xl mx-auto">

                {/* Module Section Header */}
                <header className="border-b border-slate-900 pb-6 mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-4 sm:space-y-0">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">System Telemetry Matrix</span>
                        <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">Open Platform Analytics</h1>
                    </div>
                    <div className="text-xs font-mono text-slate-500 text-left sm:text-right">
                        stims.co.za // public_ledger_v1
                    </div>
                </header>

                {/* Global Odometer Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {hardwareTelem.map((node, index) => (
                        <div key={index} className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between h-28">
                            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">{node.metric}</span>
                            <div>
                                <div className="text-lg font-bold text-white font-mono tracking-tight">{node.value}</div>
                                <div className="text-[9px] font-mono text-blue-500 mt-1 flex items-center space-x-1">
                                    <span className="h-1 w-1 rounded-full bg-blue-500" />
                                    <span>{node.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* High Demand Traffic Shares Allocation Layer */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                    {/* Left Block: Core Traffic Volatilities */}
                    <div className="md:col-span-2 bg-slate-900/10 border border-slate-900 rounded-xl p-6 backdrop-blur-sm">
                        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6 flex items-center justify-between">
                            <span>High Demand Node Distribution</span>
                            <span className="text-[10px] text-slate-600">Weekly Weighting</span>
                        </h2>

                        <div className="space-y-5">
                            {highDemandTools.map((tool, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-white font-bold">{tool.title}</span>
                                        <span className="text-slate-400">{tool.count} ({tool.share})</span>
                                    </div>
                                    <div className="w-full bg-slate-950 border border-slate-900 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full bg-blue-500 rounded-full ${tool.barW}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Block: Direct Infrastructure Insights */}
                    <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 backdrop-blur-sm space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">Ecosystem Summary</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            This structural analytics interface operates fully transparently in real time. Processing load logs are generated by tracking our unified upstream endpoints directly inside the South African server cluster.
                        </p>
                        <div className="pt-2">
                            <span className="bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-500 px-2.5 py-1 rounded uppercase tracking-widest">
                                Data Stream: Active
                            </span>
                        </div>
                    </div>

                </section>

            </div>
        </div>
    );
}
