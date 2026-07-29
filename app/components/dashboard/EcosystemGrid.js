import React, { useState, useEffect } from 'react';
import SubscriptionCard from '../SubscriptionCard';

export default function EcosystemGrid({ dbProjects, activeSubscriptions, user }) {
    const [liveHealthStates, setLiveHealthStates] = useState({});

    // Client-Side Zero-CORS Live Network Telemetry Check
    const evaluateLiveNodeHealth = async (url) => {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000); // 2-second timeout barrier

            await fetch(targetUrl, {
                method: 'GET',
                mode: 'no-cors', // Prevents browser cross-origin policy exceptions
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(id);
            return true; // Node responded successfully
        } catch (e) {
            return false; // Connection timed out or failed
        }
    };

    // Dynamically poll/evaluate network state variations when the dataset hydrates
    useEffect(() => {
        if (dbProjects.length === 0) return;

        const checkAllNodes = async () => {
            const healthMap = {};
            await Promise.all(
                dbProjects.map(async (project) => {
                    const isOnline = await evaluateLiveNodeHealth(project.app_link);
                    healthMap[project.app_id] = isOnline;
                })
            );
            setLiveHealthStates(healthMap);
        };

        checkAllNodes();
    }, [dbProjects]);

    return (
        <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">Ecosystem Access Matrix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {dbProjects.map((project, idx) => {
                    const queryAppId = project.app_id;
                    const hasActiveSubscription = activeSubscriptions[queryAppId] === 'premium';

                    // Resolve live telemetry check status, fallback to true until network check resolves
                    const isNetworkOnline = liveHealthStates[queryAppId] !== false;

                    return (
                        <SubscriptionCard
                            key={idx}
                            userId={user.id}
                            userEmail={user.email}
                            user={user}
                            appTitle={project.title}
                            strategy={project.monetization_strategy || ""}
                            fee={project.monetization_fee_display || "Free"}
                            type={project.monetization_type || "Free"}
                            isActiveSubscription={hasActiveSubscription}
                            subdomainUrl={project.app_link}
                            appStatus={project.status}
                            // FORWARD THE REAL-TIME NETWORK HEALTH TRACE:
                            isOnline={isNetworkOnline}
                        />
                    );
                })}
            </div>
        </div>
    );
}
