// app/status/page.js
import React from 'react';
import { projectSuite } from '../data';

export default function StatusPage() {
    const hardwareMetrics = [
        { label: "Ubuntu Server Load", value: "14% Stable" },
        { label: "Memory Cache Efficiency", value: "98.4%" },
        { label: "Network Latency (JHB)", value: "11 ms" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-12 px-6 pb-24 relative">
            <div className="max-w-4xl mx-auto">

                {/* Standard Status Hub Header section */}
                <header className="border-b border-slate-900 pb-4 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-3 sm:space-y-0">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">Real-Time Infrastructure Ledger</span>
                        <h1 className="text-2xl font-bold text-white mt-0.5 tracking-tight">System Status Perimeter</h1>
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-mono text-emerald-400 font-medium">All Nodes Operational</span>
                    </div>
                </header>

                {/* Standard Server Performance Gauges */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {hardwareMetrics.map((metric, index) => (
                        <div key={index} className="bg-slate-900/30 border border-slate-900 rounded-lg p-4 backdrop-blur-sm transition-all duration-300 ease-out stims-hover-glow">
                            <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mb-0.5">{metric.label}</div>
                            <div className="text-base font-bold text-white font-mono tracking-tight">{metric.value}</div>
                        </div>
                    ))}
                </section>

                {/* ENLARGED: Service Health Grids System Ledger (Moved down via pt-8) */}
                <section className="pt-8 space-y-3.5">
                    {/* Section header typography slightly increased for balance */}
                    <h2 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-4 block">
                        Service Health Grids (90-Day Ledgers)
                    </h2>

                    {projectSuite.map((tool, idx) => (
                        <div
                            key={idx}
                            // Card row dimensions and vertical clearance spaces heavily scaled up
                            className="bg-slate-900/20 border border-slate-900/40 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 transition-all duration-300 ease-out stims-hover-glow"
                        >

                            {/* Left Identity Context (Scaled up to bold base sizes) */}
                            <div className="flex flex-col min-w-[200px]">
                                <span className="text-base font-extrabold text-white tracking-tight">{tool.title} Node</span>
                                <span className="text-xs font-mono text-slate-400 truncate max-w-[220px] mt-0.5">{tool.link}</span>
                            </div>

                            {/* Center Timeline Visual Simulation (Taller, broader visual tracking ticks) */}
                            <div className="flex items-center space-x-1 overflow-hidden" title="90 Days Uptime Network Logs">
                                {[...Array(28)].map((_, i) => (
                                    <div
                                        key={i}
                                        // Individual bars increased to h-5 height and w-1 thickness
                                        className={`h-5 w-1 rounded-sm ${i === 22 ? 'bg-amber-500/80' : 'bg-blue-500/80'}`}
                                    />
                                ))}
                                {/* Percentage values increased to text-xs */}
                                <span className="text-xs font-mono font-bold text-slate-300 pl-3">99.98%</span>
                            </div>

                            {/* Right Operational Status Node Badge (Comfortable tag structure) */}
                            <div className="text-left sm:text-right">
                                <span className="bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-md tracking-wider">
                                    ONLINE // STABLE
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

            </div>
        </div>
    );
}
