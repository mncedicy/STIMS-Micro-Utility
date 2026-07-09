// app/components/Hero.js
"use client";

import React from 'react';
import Image from 'next/image';

export default function Hero() {
    return (
        <header className="relative max-w-4xl mx-auto text-center pt-20 pb-14 px-6 z-10 select-none">

            {/* 1. Logo Display - Immediate fade entry */}
            <div className="flex justify-center mb-6 animate-fade-in-up">
                <Image
                    src="/logo.png"
                    alt="Stims Ecosystem Logo"
                    width={260}
                    height={104}
                    priority
                    className="object-contain filter drop-shadow-[0_0_25px_rgba(59,130,246,0.15)]"
                />
            </div>

            {/* 2. Micro Info Tag - Stagger delay 100ms */}
            <div className="inline-flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full mb-6 shadow-sm animate-fade-in-up delay-100">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">Automated Data Orchestration Ecosystem</span>
            </div>

            {/* 3. Primary Typography Title - Stagger delay 200ms */}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight animate-fade-in-up delay-200">
                The Automated <br />
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    Micro-Utility Engine
                </span>
            </h1>

            {/* 4. Supporting Narrative Text - Stagger delay 200ms */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8 animate-fade-in-up delay-200">
                A centralized directory routing data workflows into ten purpose-built, high-speed interfaces. We manage complex API caching layers so you can deploy zero-overhead operations seamlessly.
            </p>

            {/* 5. Center Spotlight Search Input - Stagger delay 300ms */}
            <div className="max-w-md mx-auto animate-fade-in-up delay-300">
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                    className="w-full flex items-center justify-between bg-slate-900/40 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-500 font-mono transition-all duration-300 ease-out stims-hover-glow shadow-sm cursor-pointer"
                >
                    <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="group-hover:text-slate-400 transition-colors">Search core utility nodes registry...</span>
                    </div>
                    <kbd className="hidden sm:inline-block bg-slate-950 border border-slate-800/80 px-1.5 py-0.5 rounded text-[10px] text-slate-500">Ctrl + K</kbd>
                </button>
            </div>

        </header>
    );
}
