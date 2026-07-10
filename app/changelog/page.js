// app/changelog/page.js
import React from 'react';

export default function ChangelogPage() {
    // Clean data list for your system updates
    const updates = [
        {
            date: "July 2026",
            version: "v2.1",
            title: "User Accounts & Real Live Checks",
            changes: [
                "Added a secure login and signup system using Supabase.",
                "Made the status page timelines show real network response speeds.",
                "Updated the contact form so users can choose a specific tool.",
                "Changed all website text to clear and simple English."
            ]
        },
        {
            date: "June 2026",
            version: "v2.0",
            title: "New Tools & Premium Design",
            changes: [
                "Added the Traffic Infringements (TIMS) tool to translate paper tickets.",
                "Redesigned the main header card with smooth mouse-movement effects.",
                "Added 10 professional blue-glowing tool icons to the dashboard.",
                "Wired up the Ctrl+K search box for faster keyboard navigation."
            ]
        },
        {
            date: "May 2026",
            version: "v1.0",
            title: "Platform Launch",
            changes: [
                "Launched the core STIMS utility engine workspace.",
                "Deployed RateWatch, EcoRoute, and MedTime subdomains.",
                "Set up local South African hosting servers for low delay speeds."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-16 px-6 pb-24 relative">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <header className="border-b border-slate-900 pb-6 mb-12">
                    <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">System History</span>
                    <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">Changelog</h1>
                    <p className="text-xs text-slate-400 mt-2 font-sans">
                        Track every tool update and system fix we make to the ecosystem.
                    </p>
                </header>

                {/* Timeline Stream Layout */}
                <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-slate-900">
                    {updates.map((item, idx) => (
                        <div key={idx} className="relative pl-10 group animate-fade-in-up">

                            {/* Timeline Node Point Indicator */}
                            <div className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full bg-slate-950 border-2 border-slate-800 group-hover:border-blue-500 transition-colors duration-200 z-10">
                                <div className="h-1 w-1 bg-blue-500 rounded-full mx-auto mt-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Date Badge and Version Tag */}
                            <div className="flex items-center space-x-3 mb-2 font-mono text-xs">
                                <span className="text-slate-500">{item.date}</span>
                                <span className="bg-blue-950/40 border border-blue-900/40 px-2 py-0.5 rounded text-blue-400 font-bold text-[10px] uppercase">
                                    {item.version}
                                </span>
                            </div>

                            {/* Main Change Content Panel Block */}
                            <div className="bg-slate-900/20 border border-slate-900/60 rounded-xl p-5 backdrop-blur-sm stims-hover-glow transition-all duration-300">
                                <h3 className="text-base font-bold text-white mb-3 group-hover:text-blue-500 transition-colors">
                                    {item.title}
                                </h3>
                                <ul className="space-y-2 text-xs text-slate-400 list-disc pl-4 font-sans">
                                    {item.changes.map((change, i) => (
                                        <li key={i} className="leading-relaxed">
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
