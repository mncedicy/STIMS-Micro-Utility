// app/page.js
import React from 'react';
import Hero from './components/Hero';
import Grid from './components/Grid';
import About from './components/About';
import Contact from './components/Contact';
import Faq from './components/Faq'; // Imported our new component
import Footer from './components/Footer';
import { projectSuite } from './data';
import { pingSubdomainNode } from './utils/telemetry';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const dynamicNodesWithHealth = await Promise.all(
    projectSuite.map(async (tool) => {
      const health = await pingSubdomainNode(tool.title, tool.link);
      return { ...tool, health };
    })
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-slate-950 antialiased">
      {/* <Hero /> */}
      <Grid initialNodesWithHealth={dynamicNodesWithHealth} />
      <About />
      <Contact />
      {/* FIXED: Placed the FAQ block right below the Contact section */}
      <Faq />
      <Footer />
    </div>
  );
}
