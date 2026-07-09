"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { projectSuite } from '../data';

export default function Hero() {
    const ref = useRef(null);
    const [motion, setMotion] = useState('');
    const [glow, setGlow] = useState({ opacity: 0 });
    const imgs = projectSuite.map(p => p.image);

    const onMove = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setMotion(`translate(${(e.clientX - (r.left + r.width / 2)) / 30}px, ${(e.clientY - (r.top + r.height / 2)) / 30}px)`);
        setGlow({ opacity: 1, left: `${e.clientX - r.left}px`, top: `${e.clientY - r.top}px` });
    };

    return (
        <header ref={ref} onMouseMove={onMove} onMouseLeave={() => { setMotion(''); setGlow({ opacity: 0 }); }}
            className="relative max-w-6xl mx-auto pt-24 pb-16 px-6 my-4 rounded-3xl border border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/10 to-slate-950 overflow-hidden select-none group">

            {/* Background Marquee Grid Layout */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden flex flex-col justify-between opacity-80">

                {/* Upper Track */}
                <div className="flex w-[200%] h-[50%] animate-[marquee_40s_linear_infinite] space-x-12 items-center border-b border-slate-900/10 overflow-hidden">
                    {[...imgs, ...imgs].map((src, i) => (
                        <div key={i} className="relative h-[95%] aspect-square shrink-0">
                            <img src={src} alt="" className="w-full h-full object-contain opacity-20" />
                        </div>
                    ))}
                </div>

                {/* Lower Track */}
                <div className="flex w-[200%] h-[50%] animate-[marqueeReverse_45s_linear_infinite] space-x-12 items-center overflow-hidden">
                    {[...imgs, ...imgs].reverse().map((src, i) => (
                        <div key={i} className="relative h-[95%] aspect-square shrink-0">
                            <img src={src} alt="" className="w-full h-full object-contain opacity-20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Ambient Lighting Layers */}
            <div style={{ background: 'radial-gradient(280px circle at center, rgba(59,130,246,0.15), transparent 80%)', transform: 'translate(-50%, -50%)', ...glow }} className="absolute pointer-events-none z-10 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-transparent to-[#020617]/90 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/85 via-transparent to-[#020617]/85 pointer-events-none z-10" />

            {/* Main Center Content */}
            <div style={{ transform: motion }} className="relative max-w-2xl mx-auto text-center flex flex-col items-center justify-center z-20 space-y-6 transition-transform duration-200 ease-out">
                <div className="inline-flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-slate-400">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75" /><span className="h-2 w-2 bg-blue-500 rounded-full" /></span>
                    <span>SYS.NODE // RUNNING</span>
                </div>

                <div className="relative w-64 h-24 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.25)]"><Image src="/logo.png" alt="STIMS Logo" fill priority className="object-contain" /></div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
                    <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent">Micro-Utility Engine</span>
                </h1>

                {/* UPDATED: Clear, simple description describing the tools directly */}
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed bg-slate-950/50 border border-slate-900/30 rounded-xl py-2 backdrop-blur-md px-3 shadow-xl">
                    A collection of single-purpose web tools built for absolute speed. These utilities process financial rates, logistics metrics, and data tracking pipelines instantly without any overhead.
                </p>

                <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                    className="w-full max-w-sm flex items-center justify-between bg-slate-950 border border-slate-800/80 hover:border-blue-500/40 px-4 py-3 rounded-xl text-xs text-slate-500 font-mono transition-colors duration-200 shadow-lg shadow-black/50 cursor-pointer backdrop-blur-md">
                    <span>Search web tools...</span>
                    <kbd className="hidden sm:inline-block bg-slate-900 border border-slate-800 text-[10px] text-slate-500 px-1.5 py-0.5 rounded shadow-inner">Ctrl K</kbd>
                </button>
            </div>
        </header>
    );
}
