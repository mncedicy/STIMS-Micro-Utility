// app/layout.js
"use client";

import "./globals.css";
import React, { useState } from "react";
import CommandPalette from "./components/CommandPalette";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authStatus, setAuthStatus] = useState({ success: null, message: "" });
  // State flag used purely to trigger an immediate, live re-fetch inside child nodes
  const [sessionKey, setSessionKey] = useState(0);

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthStatus({ success: null, message: "" });
    setIsModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsModalOpen(false); // 1. Hide the popup interface box immediately
    setSessionKey(prev => prev + 1); // 2. Force the Navbar component to reload user data
  };

  return (
    <html lang="en" className="text-slate-100">
      <body className="antialiased min-h-screen relative pt-[72px]">
        <div className="stims-ambient-glow" />
        <CommandPalette />

        {/* Passing the sessionKey down to push real-time authentication rendering updates */}
        <Navbar onAuthClick={handleOpenAuth} key={sessionKey} />

        <AuthModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={authMode}
          setMode={setAuthMode}
          status={authStatus}
          setStatus={setAuthStatus}
          onLoginSuccess={handleLoginSuccess}
        />

        <main className="relative z-10">
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
