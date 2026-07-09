// app/page.js
import React from 'react';
import Hero from './components/Hero';
import Grid from './components/Grid';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-slate-950 antialiased">
      {/* Primary Landing Page Core Architecture Flow Lineup */}
      <Hero />
      <Grid />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
