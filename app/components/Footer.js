// app/components/Footer.js
import React from 'react';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="relative border-t border-slate-900 bg-slate-950/60 pt-16 pb-12 z-10 font-mono">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-900/60">

                {/* Brand Logo and Description */}
                <div className="md:col-span-4 space-y-3">
                    <a href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <Image src="/logo.png" alt="STIMS Logo" width={110} height={44} className="object-contain" />
                    </a>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                        A single place for fast web tools. Our links load instantly to process your data without any slowdowns.
                    </p>
                </div>

                {/* Quick Navigation Links */}
                <div className="md:col-span-3 space-y-2">
                    <h4 className="text-[11px] font-mono font-bold tracking-wider text-slate-500 uppercase">Pages</h4>
                    <ul className="space-y-1.5 text-xs">
                        <li><a href="/#about" className="text-slate-400 hover:text-blue-500 transition-colors">About Us</a></li>
                        <li><a href="/#contact" className="text-slate-400 hover:text-blue-500 transition-colors">Contact</a></li>
                        <li><a href="/status" className="text-slate-400 hover:text-blue-500 transition-colors">System Status</a></li>
                        <li><a href="/open" className="text-slate-400 hover:text-blue-500 transition-colors">Live Metrics</a></li>
                        {/* NEW CHANGELOG LINK ADDED HERE */}
                        <li><a href="/changelog" className="text-slate-400 hover:text-blue-500 transition-colors font-bold">What's New (Changelog)</a></li>
                    </ul>
                </div>

                {/* Simple Tools Breakdown List */}
                <div className="md:col-span-5 space-y-2">
                    <h4 className="text-[11px] font-mono font-bold tracking-wider text-slate-500 uppercase">Our Tools</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-400">
                        <div>• RateWatch (Finance)</div>
                        <div>• EcoRoute (Logistics)</div>
                        <div>• MedTime (Health)</div>
                        <div>• ChefSalvage (Business)</div>
                        <div>• JobPulse (Jobs)</div>
                        <div>• TIMS (Traffic Fines)</div>
                    </div>
                </div>

            </div>

            {/* Bottom Copyright Row */}
            <div className="max-w-6xl mx-auto px-6 pt-6 text-xs text-slate-500 text-center sm:text-left">
                &copy; {new Date().getFullYear()} STIMS. All rights reserved.
            </div>
        </footer>
    );
}
