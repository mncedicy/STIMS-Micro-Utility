// app/components/About.js
import React from 'react';

export default function About() {
    return (
        <section id="about" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
            <div className="text-center mb-12">
                <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">Our Tools</span>
                <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">How We Help You</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-slate-400 text-sm leading-relaxed">
                {/* Left Block - Specific ways the tools help */}
                <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-6 transition-all duration-300 ease-out stims-hover-glow space-y-4">
                    <p>
                        Our tools solve real problems fast. For example, <strong className="text-white font-medium">RateWatch</strong> helps freelancers find the best days to send invoices to global clients, and <strong className="text-white font-medium">EcoRoute</strong> tracks carbon numbers for local delivery trucks.
                    </p>
                    <p>
                        We also make hard data simple. Our tool <strong className="text-white font-medium">MedTime</strong> turns confusing medical labels into easy daily guides. Every tool does one single job perfectly so you can get fast results.
                    </p>
                </div>

                {/* Right Block - Why they are better */}
                <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-6 transition-all duration-300 ease-out stims-hover-glow space-y-4">
                    <p>
                        You do not need to sign up, fill out long forms, or deal with annoying ads. We remove all the extra weight so our pages open immediately in your browser.
                    </p>
                    <p>
                        We run our software on fast local servers in South Africa. This keeps connections quick and saves data safely in the background to protect your privacy.
                    </p>
                </div>
            </div>
        </section>
    );
}
