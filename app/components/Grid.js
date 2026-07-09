// app/components/Grid.js
import React from 'react';
import Image from 'next/image';

export default function Grid({ initialNodesWithHealth = [] }) {
    return (
        <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
            <div className="border-b border-slate-800/60 pb-3 mb-6 flex justify-between items-center">
                <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                    Directory ({initialNodesWithHealth.length})
                </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialNodesWithHealth.map((project, index) => {
                    const isNodeOnline = project.health?.online ?? true;

                    return (
                        <div
                            key={index}
                            className={`group relative bg-slate-900/40 border rounded-xl p-5 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 ease-out stims-hover-glow ${isNodeOnline ? 'border-slate-900' : 'border-rose-950/60 bg-rose-950/5'
                                }`}
                        >
                            {/* Graphic Canvas Layer behind text content */}
                            <div className="absolute top-0 left-0 right-0 h-56 overflow-hidden select-none pointer-events-none z-0">
                                {/* Ambient grid overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_24px] opacity-10" />

                                {/* Background gradient map based on state */}
                                <div className={`absolute inset-0 bg-gradient-to-tr via-transparent to-transparent ${isNodeOnline ? 'from-blue-500/5' : 'from-rose-500/5'
                                    }`} />

                                {/* Reduced Header Overlay Section */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-center border-b border-slate-900/40 pb-1 z-20">
                                    <div className="flex space-x-1">
                                        <div className={`h-1 w-1 rounded-full ${isNodeOnline ? 'bg-slate-800 group-hover:bg-blue-500/40' : 'bg-rose-900'} transition-colors`} />
                                        <div className={`h-1 w-1 rounded-full ${isNodeOnline ? 'bg-slate-800 group-hover:bg-blue-500/40' : 'bg-rose-900'} transition-colors`} />
                                        <div className={`h-1 w-1 rounded-full ${isNodeOnline ? 'bg-slate-800 group-hover:bg-blue-500/40' : 'bg-rose-900'} transition-colors`} />
                                    </div>

                                    {/* Swapped version tag for simple ONLINE/OFFLINE text indicator */}
                                    {isNodeOnline ? (
                                        <span className="text-[9px] font-mono text-emerald-500 font-bold tracking-wider flex items-center space-x-1">
                                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>ONLINE</span>
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-mono text-rose-400 font-bold tracking-wider flex items-center space-x-1 animate-pulse">
                                            <span className="h-1 w-1 rounded-full bg-rose-500" />
                                            <span>OFFLINE</span>
                                        </span>
                                    )}
                                </div>

                                {/* Full-width Image Asset Frame */}
                                <div className="relative w-full h-full pt-10 px-2 flex items-center justify-center">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover mix-blend-screen opacity-60 group-hover:opacity-90 group-hover:scale-102 transition-all duration-500 ease-out filter drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Blending transparent mask that ends cleanly at the bottom */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-[#020617] z-10" />
                            </div>

                            {/* Main Foreground Text Content */}
                            <div className="relative z-10 pt-28">
                                {/* Title and Category tag positioned inline side-by-side */}
                                <div className="flex items-baseline justify-between mb-1.5">
                                    <h3 className={`text-base font-bold transition-colors duration-200 ${isNodeOnline ? 'text-white group-hover:text-blue-500' : 'text-white/90 group-hover:text-rose-400'
                                        }`}>
                                        {project.title}
                                    </h3>

                                    {/* Category tag moved to the right side of the title */}
                                    <span className="bg-slate-950/90 border border-slate-800 text-[9px] font-mono px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider select-none">
                                        {project.category}
                                    </span>
                                </div>

                                <p className="text-[11px] text-slate-400 font-mono mb-3 italic">
                                    {project.tagline}
                                </p>

                                <p className="text-slate-400 text-xs leading-relaxed mb-5">
                                    {project.description}
                                </p>
                            </div>

                            {/* Bottom Actions Row Layout */}
                            <div className="relative z-10 pt-3 border-t border-slate-900/60 mt-auto">
                                <div className="text-[10px] font-mono text-slate-500 mb-2.5 truncate">
                                    <span className="text-slate-600">API:</span> {project.apiUsed}
                                </div>

                                {isNodeOnline ? (
                                    <a
                                        href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full justify-center items-center border font-medium text-xs py-2 px-3 rounded-lg transition-all duration-200 bg-slate-950 border-slate-800 hover:border-blue-500/40 hover:bg-blue-950/20 hover:text-blue-500 text-slate-300"
                                    >
                                        Launch
                                        <svg className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex w-full justify-center items-center border font-medium text-xs py-2 px-3 rounded-lg bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed select-none"
                                    >
                                        Disabled
                                        <svg className="w-3 h-3 ml-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
