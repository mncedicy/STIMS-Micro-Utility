// app/components/Grid.js
import React from 'react';
import { projectSuite } from '../data';

export default function Grid() {
    return (
        <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
            <div className="border-b border-slate-800/60 pb-4 mb-8 flex justify-between items-center">
                <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                    Ecosystem Pipeline Directory ({projectSuite.length})
                </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectSuite.map((project, index) => (
                    <div
                        key={index}
                        className="group relative bg-slate-900/40 border border-slate-900 rounded-xl p-5 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 ease-out stims-hover-glow"
                    >
                        <div>
                            {/* Category Node and Platform Metadata */}
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-slate-950 border border-slate-800 text-[10px] font-mono px-2.5 py-0.5 rounded text-slate-400 uppercase tracking-wider">
                                    {project.category}
                                </span>
                                <span className="text-[10px] font-mono text-slate-600 group-hover:text-blue-500 transition-colors duration-200">
                                    Subdomain Active
                                </span>
                            </div>

                            {/* LIVE REPLACEMENT: Pure CSS Glassy Software UI Canvas Container */}
                            <div className="relative w-full h-32 bg-slate-950/80 border border-slate-900 rounded-lg mb-4 overflow-hidden p-3 flex flex-col justify-between select-none">
                                {/* Visual grid line overlays */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_24px] opacity-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent pointer-events-none" />

                                {/* Simulated Glass Software Header */}
                                <div className="relative z-10 flex justify-between items-center border-b border-slate-900 pb-1.5">
                                    <div className="flex space-x-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                                        pipeline_monitor_v1.0
                                    </span>
                                </div>

                                {/* Simulated Glass Core Visual Metrics */}
                                <div className="relative z-10 flex justify-between items-end mt-2">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">SYS.NODE</span>
                                        <span className="text-sm font-bold text-white font-mono group-hover:text-blue-500 transition-colors">
                                            {project.title}
                                        </span>
                                    </div>
                                    {/* Floating abstract graphic chart block */}
                                    <div className="flex items-end space-x-0.5 h-8 pb-0.5">
                                        <div className="w-1.5 h-3 bg-slate-800 rounded-xs group-hover:bg-blue-500/40 transition-colors" />
                                        <div className="w-1.5 h-5 bg-slate-800 rounded-xs group-hover:bg-blue-500/60 transition-colors" />
                                        <div className="w-1.5 h-4 bg-slate-800 rounded-xs group-hover:bg-blue-500/50 transition-colors" />
                                        <div className="w-1.5 h-7 bg-slate-800 rounded-xs group-hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    </div>
                                </div>
                            </div>

                            {/* Title & Tagline Hierarchy */}
                            <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-blue-500 transition-colors duration-200">
                                {project.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono mb-3 italic">
                                {project.tagline}
                            </p>

                            {/* Core Context Description */}
                            <p className="text-slate-400 text-xs leading-relaxed mb-5">
                                {project.description}
                            </p>
                        </div>

                        {/* Integration Anchor Link */}
                        <div className="pt-3 border-t border-slate-900/60 mt-auto">
                            <div className="text-[10px] font-mono text-slate-500 mb-2.5 truncate">
                                <span className="text-slate-600">Core Architecture:</span> {project.apiUsed}
                            </div>
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full justify-center items-center bg-slate-950 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-950/20 hover:text-blue-500 text-slate-300 font-medium text-xs py-2 px-3 rounded-lg transition-all duration-200"
                            >
                                Launch Utility Node
                                <svg className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
