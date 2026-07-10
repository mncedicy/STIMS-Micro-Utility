// app/components/Faq.js
"use client";

import React, { useState } from 'react';

export default function Faq() {
    const faqData = [
        {
            question: "Are these web tools completely free to use?",
            answer: "The basic web tools and dashboard features are free to use. However, advanced automation options (like automatic multi-driver logs on EcoRoute, custom text message alerts on MedTime, or real-time currency webhooks on RateWatch) require a small monthly subscription fee."
        },
        {
            question: "How do the paid premium features work?",
            answer: "We use Stripe to safely manage payments. If you need higher search limits, instant automation, or downloadable PDF certificates, you can unlock them through our affordable monthly subscription tiers."
        },
        {
            question: "Do I need an account to use the basic apps?",
            answer: "No. You can open any tool node and use its manual dashboard features instantly without creating an account. Setting up an account helps you buy paid plans or link up with our support pipelines."
        },
        {
            question: "Do you save my search or calculation data?",
            answer: "We use fast data layers to save public answers and save you time. Your personal choices are kept private and secure, and we never use intrusive marketing trackers or ads."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
            <div className="text-center mb-12">
                <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">Common Questions</span>
                <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
                {faqData.map((item, idx) => {
                    const isOpen = openIndex === idx;

                    return (
                        <div
                            key={idx}
                            className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden transition-all duration-300"
                        >
                            <button
                                type="button"
                                onClick={() => toggleFaq(idx)}
                                className="w-full text-left px-6 py-4 flex justify-between items-center text-sm font-bold text-white hover:text-blue-500 transition-colors cursor-pointer select-none"
                            >
                                <span>{item.question}</span>
                                <svg
                                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 border-t border-slate-900/50 bg-slate-950/20' : 'max-h-0'
                                    }`}
                            >
                                <p className="px-6 py-4 text-xs text-slate-400 leading-relaxed font-sans">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
