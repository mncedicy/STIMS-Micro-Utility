"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { verifyLocalTransactionSession } from '../actions/checkout';
import ProfileCard from '../components/dashboard/ProfileCard';
import EcosystemGrid from '../components/dashboard/EcosystemGrid';
import SavedApps from '../components/dashboard/SavedApps';
import MessageLogs from '../components/dashboard/MessageLogs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("User");
    const [activeSubscriptions, setActiveSubscriptions] = useState({});
    const [dbProjects, setDbProjects] = useState([]);

    const fetchFreshEcosystemData = useCallback(async (currentUserId) => {
        if (!currentUserId) return;

        const { data: appsData } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: true });

        if (appsData) setDbProjects(appsData);

        const { data: subs } = await supabase
            .from('user_subscriptions')
            .select('app_id, status, tier')
            .eq('user_id', currentUserId);

        const subMap = {};
        if (subs) {
            subs.forEach(s => {
                subMap[s.app_id] = (s.status === 'active' && s.tier === 'premium') ? 'premium' : 'free';
            });
        }
        setActiveSubscriptions(subMap);
    }, []);

    useEffect(() => {
        let subscriptionsChannel;
        let applicationsChannel;

        const initializeSecureSessionAndRealtime = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                setUser(currentUser);
                const firstName = currentUser.user_metadata?.first_name;
                if (firstName) setDisplayName(firstName);

                await fetchFreshEcosystemData(currentUser.id);

                const urlParams = new URLSearchParams(window.location.search);
                const referenceToken = urlParams.get('trxref') || urlParams.get('reference');
                const targetAppId = urlParams.get('stims_app_id');

                if (referenceToken && targetAppId) {
                    const verificationResult = await verifyLocalTransactionSession(referenceToken, targetAppId, currentUser.id);
                    if (verificationResult.success) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                        await fetchFreshEcosystemData(currentUser.id);
                    }
                }

                subscriptionsChannel = supabase
                    .channel(`user-sub-changes-${currentUser.id}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_subscriptions', filter: `user_id=eq.${currentUser.id}` },
                        () => fetchFreshEcosystemData(currentUser.id)
                    ).subscribe();

                applicationsChannel = supabase
                    .channel('global-apps-catalog-changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' },
                        () => fetchFreshEcosystemData(currentUser.id)
                    ).subscribe();
            }
            setLoading(false);
        };

        initializeSecureSessionAndRealtime();

        return () => {
            if (subscriptionsChannel) supabase.removeChannel(subscriptionsChannel);
            if (applicationsChannel) supabase.removeChannel(applicationsChannel);
        };
    }, [fetchFreshEcosystemData]);

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
                    <div className="lg:col-span-3">
                        <ProfileCard displayName={displayName} userEmail={user.email} userSurname={user.user_metadata?.surname} />
                    </div>

                    <div className="lg:col-span-9 bg-slate-900/10 border border-slate-900 rounded-xl p-6 backdrop-blur-sm space-y-8">
                        <EcosystemGrid dbProjects={dbProjects} activeSubscriptions={activeSubscriptions} user={user} />
                        <SavedApps />
                        <MessageLogs />
                    </div>
                </div>
            </div>
        </div>
    );
}
