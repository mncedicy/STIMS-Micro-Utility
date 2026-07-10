// app/components/Navbar.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar({ onAuthClick }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [displayName, setDisplayName] = useState("User");
    const [userEmail, setUserEmail] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cachedActive = localStorage.getItem('stims_session_active');
            const cachedName = localStorage.getItem('stims_user_name');
            if (cachedActive === 'true') {
                setIsLoggedIn(true);
                if (cachedName) setDisplayName(cachedName);
            }
        }

        const verifyLiveSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                setUserEmail(user.email || "");
                const firstName = user.user_metadata?.first_name;
                if (firstName) {
                    setDisplayName(firstName);
                    localStorage.setItem('stims_user_name', firstName);
                }
                localStorage.setItem('stims_session_active', 'true');
            } else {
                setIsLoggedIn(false);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('stims_session_active');
                    localStorage.removeItem('stims_user_name');
                }
            }
        };
        verifyLiveSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setIsLoggedIn(true);
                setUserEmail(session.user.email || "");
                const fn = session.user.user_metadata?.first_name;
                if (fn) {
                    setDisplayName(fn);
                    localStorage.setItem('stims_user_name', fn);
                }
                localStorage.setItem('stims_session_active', 'true');
            } else if (event === 'SIGNED_OUT') {
                setIsLoggedIn(false);
                setDisplayName("User");
                setUserEmail("");
                localStorage.removeItem('stims_session_active');
                localStorage.removeItem('stims_user_name');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setDropdownOpen(false);
        setIsLoggedIn(false);
        setDisplayName("User");
        setUserEmail("");
        if (typeof window !== 'undefined') {
            localStorage.removeItem('stims_session_active');
            localStorage.removeItem('stims_user_name');
        }
        await supabase.auth.signOut();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-900 bg-transparent backdrop-blur-md px-6 py-3">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <Image src="/logo.png" alt="Stims Logo" width={110} height={44} priority className="object-contain" />
                    </a>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-xs font-mono font-bold tracking-wider">
                    <a href="/#about" className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]">ABOUT</a>
                    <a href="/#contact" className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]">CONTACT</a>
                    <a href="/status" className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]">STATUS</a>
                    <a href="/open" className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]">METRICS</a>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono font-bold relative" ref={dropdownRef}>
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-md border border-slate-900 bg-slate-950/40 select-none font-sans"
                            >
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span>Hi, {displayName}</span>
                                <svg className={`w-3 h-3 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 overflow-hidden z-50 animate-fade-in font-mono text-xs">
                                    {/* FIXED: Added a working link to the Dashboard page */}
                                    <a
                                        href="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="block px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        Account Dashboard
                                    </a>
                                    <div className="px-3 py-1.5 text-[9px] text-slate-500 border-b border-slate-800/60 truncate">
                                        {userEmail}
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors cursor-pointer flex items-center justify-between font-mono"
                                    >
                                        <span>Log Out</span>
                                        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={() => onAuthClick('signin')} className="text-slate-400 hover:text-white transition-colors cursor-pointer px-1 py-1.5">LOG IN</button>
                            <button onClick={() => onAuthClick('signup')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md transition-colors cursor-pointer shadow-md shadow-blue-500/10">SIGN UP</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
