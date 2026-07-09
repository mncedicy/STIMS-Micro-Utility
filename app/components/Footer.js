// app/components/Footer.js
import React from 'react';

export default function Footer() {
    return (
        <footer className="relative border-t border-slate-900 bg-slate-950/40 py-12 z-10 text-center">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs font-mono text-slate-400">
                <div>
                    &copy; {new Date().getFullYear()} STIMS Ecosystem. All rights reserved.
                </div>
                <div className="text-slate-600">
                    Enviroment: Linux Ubuntu // Location: Johannesburg Node // Security: Encrypted
                </div>
            </div>
        </footer>
    );
}
