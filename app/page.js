// app/page.js
import React from 'react';
import Hero from './components/Hero';
import Grid from './components/Grid';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { projectSuite } from './data';
import { pingSubdomainNode } from './utils/telemetry';

// Enforce modern on-demand processing checks whenever a guest hits the homepage path
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fire simultaneous asynchronous network status pings for all 11 tool subdomains
  const dynamicNodesWithHealth = await Promise.all(
    projectSuite.map(async (tool) => {
      const health = await pingSubdomainNode(tool.title, tool.link);
      return { ...tool, health };
    })
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-slate-950 antialiased">
      {/* Primary Landing Page Core Architecture Flow Lineup */}
      <Hero />
      {/* Forward the calculated network states directly into the presentation Grid layout component */}
      <Grid initialNodesWithHealth={dynamicNodesWithHealth} />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
