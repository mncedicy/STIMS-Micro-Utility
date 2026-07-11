// app/dashboard/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectSuite } from '../data';
import { verifyLocalTransactionSession } from '../actions/checkout';
import SubscriptionCard from '../components/SubscriptionCard';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("User");
    const [activeSubscriptions, setActiveSubscriptions] = useState({});

    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const firstName = user.user_metadata?.first_name;
                if (firstName) setDisplayName(firstName);

                const { data: subs } = await supabase
                    .from('user_subscriptions')
                    .select('app_id, status, tier')
                    .eq('user_id', user.id)
                    .eq('status', 'active');

                const subMap = {};
                if (subs) subs.forEach(s => { subMap[s.app_id] = s.tier; });

                const urlParams = new URLSearchParams(window.location.search);
                const referenceToken = urlParams.get('trxref') || urlParams.get('reference');
                const targetAppId = urlParams.get('stims_app_id');

                if (referenceToken && targetAppId && !subMap[targetAppId]) {
                    setLoading(true);
                    const verificationResult = await verifyLocalTransactionSession(referenceToken, targetAppId, user.id);
                    if (verificationResult.success) {
                        subMap[targetAppId] = 'premium';
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }
                setActiveSubscriptions(subMap);
            }
            setLoading(false);
        };
        checkUserSession();
    }, []);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-slate-500">Synchronizing your secure workspace...</div>;
    if (!user) return <div className="min-h-[60vh] flex items-center justify-center p-6"><div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 text-center shadow-xl"><h3 className="text-base font-bold text-white mb-2">Access Denied</h3><p className="text-xs text-slate-400 mb-4 font-sans">You need to log in first to see your account dashboard.</p></div></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-16 px-6 pb-24 relative z-10">
            <div className="max-w-6xl mx-auto">
                <header className="border-b border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-2 sm:space-y-0">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase">User Workspace</span>
                        <h1 className="text-2xl font-bold text-white mt-0.5 tracking-tight">Welcome, {displayName}!</h1>
                    </div>
                    <div className="text-xs font-mono text-slate-500">stims.co.za // Account Active</div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-3 bg-slate-900/30 border border-slate-900 rounded-xl p-5 backdrop-blur-sm space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">Your Profile</h3>
                        <div className="space-y-2 text-xs font-sans">
                            <div><span className="block text-[10px] font-mono text-slate-500 uppercase">First Name</span><span className="text-white font-medium">{displayName}</span></div>
                            <div><span className="block text-[10px] font-mono text-slate-500 uppercase">Surname</span><span className="text-white font-medium">{user.user_metadata?.surname || "Not added"}</span></div>
                            <div><span className="block text-[10px] font-mono text-slate-500 uppercase">Email Address</span><span className="text-white font-medium font-mono text-[11px]">{user.email}</span></div>
                        </div>
                    </div>

                    <div className="lg:col-span-9 bg-slate-900/10 border border-slate-900 rounded-xl p-6 backdrop-blur-sm space-y-8">
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">Ecosystem Access Matrix</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {projectSuite.map((project, idx) => {
                                    let queryAppId = project.title.toLowerCase().replace(/\s+/g, '');
                                    if (queryAppId === "trafficinfringements") queryAppId = "fines";
                                    const hasActiveSubscription = activeSubscriptions[queryAppId] === 'premium';

                                    return (
                                        <SubscriptionCard
                                            key={idx}
                                            userId={user.id}
                                            userEmail={user.email}
                                            appTitle={project.title}
                                            strategy={project.monetizationStrategy}
                                            fee={project.monetizationFee}
                                            type={project.monetization}
                                            isActiveSubscription={hasActiveSubscription}
                                            subdomainUrl={project.link}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Saved Apps</h3>
                            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-4 text-xs text-slate-500 font-sans text-center">You have not pinned any favorited tools yet. Head over to our home page grid to launch a tool.</div>
                        </div>

                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Message Logs</h3>
                            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-4 text-xs text-slate-500 font-sans text-center">No contact submissions found matching your active session.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
