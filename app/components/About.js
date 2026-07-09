// app/components/About.js
import React from 'react';

export default function About() {
    return (
        <section id="about" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
            <div className="text-center mb-12">
                <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">01 // Architectural Mandate</span>
                <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">Ecosystem Philosophy</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-slate-400 text-sm leading-relaxed">
                {/* Left Block with subtle hover tracking */}
                <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-6 transition-all duration-300 ease-out stims-hover-glow space-y-4">
                    <p>
                        <strong className="text-white font-medium">Stims</strong> was engineered to fight modern internet bloat. We believe software should not require heavy tracking cookies, invasive registrations, or marketing filler just to execute a straightforward data workflow.
                    </p>
                    <p>
                        Every micro-utility in our directory is built with a single goal: absolute processing efficiency. We strip away the unnecessary overhead to deliver instantly loading, single-purpose software solutions.
                    </p>
                </div>

                {/* Right Block with matching interactive highlight */}
                <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-6 transition-all duration-300 ease-out stims-hover-glow space-y-4">
                    <p>
                        By running a dedicated, optimized <strong className="text-white font-medium">Ubuntu Server environment</strong> right here in South Africa, we bridge the gap between heavy upstream public API pipelines and fast client interfaces.
                    </p>
                    <p>
                        Our core caching technology stores external request states securely. This ensures high-speed, high-availability access while completely respecting user privacy boundaries.
                    </p>
                </div>
            </div>
        </section>
    );
}
