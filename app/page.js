"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Hero from './components/Hero';
import Grid from './components/Grid';
import About from './components/About';
import Contact from './components/Contact';
import Faq from './components/Faq';
import Footer from './components/Footer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [sortedNodes, setSortedNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Client-Side Ping Processor
  const checkSubdomainHealth = async (url) => {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 Second Network Timeout Limit

      const response = await fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors', // Bypasses CORS browser restrictions for cross-subdomain pings
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);
      return { online: true };
    } catch (error) {
      return { online: false }; // Handled as offline if network drops or times out
    }
  };

  // Core Data Processing Loop Engine
  const fetchAndProcessApplications = useCallback(async () => {
    try {
      // 1. Fetch live application configurations straight from database columns
      const { data: dbApplications, error } = await supabase
        .from('applications')
        .select('*');

      if (error) throw error;
      const processedApps = dbApplications || [];

      // 2. CLIENT-SIDE PING FIRST LAYER:
      // Concurrently pings every subdomain link directly from the browser window track
      const mappedNodes = await Promise.all(
        processedApps.map(async (tool) => {
          const health = await checkSubdomainHealth(tool.app_link);

          return {
            ...tool,
            description: tool.description,
            category: tool.category,
            tagline: tool.tagline || "",
            link: tool.app_link,
            image: tool.image_url,
            status: tool.status,
            apiUsed: tool.api_used,
            health // Inject live active network ping results into the card light
          };
        })
      );

      // 3. SORTING ENGINE: Prioritise 'Active' status configurations first
      const sorted = mappedNodes.sort((a, b) => {
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        return 0;
      });

      setSortedNodes(sorted);
    } catch (err) {
      console.error("🚨 Home Realtime Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial dataset hydration load
    fetchAndProcessApplications();

    // ========================================================================
    // LIVE LANDING GRID REALTIME WEB-SOCKET LISTENERS
    // ========================================================================
    const landingPageChannel = supabase
      .channel('public-directory-live-stream')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          console.log('⚡ [Landing Page Realtime]: Directory change database transaction:', payload);
          fetchAndProcessApplications();
        }
      )
      .subscribe();

    return () => {
      if (landingPageChannel) supabase.removeChannel(landingPageChannel);
    };
  }, [fetchAndProcessApplications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs font-mono text-slate-500">
        Waking up core network utilities directory...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-slate-950 antialiased">
      <Hero />
      <Grid initialNodesWithHealth={sortedNodes} />
      <About />
      <Contact />
      <Faq />
      <Footer />
    </div>
  );
}
