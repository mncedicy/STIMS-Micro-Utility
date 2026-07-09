// app/components/CommandPalette.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { projectSuite } from '../data';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const resultsContainerRef = useRef(null);

    // Global listener for shortcut combination keys and arrow navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Autofocus input box when modal pops open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setSelectedIndex(0);
        } else {
            setSearch('');
        }
    }, [isOpen]);

    // Filter project records dynamically based on input values
    const filteredTools = projectSuite.filter(tool =>
        tool.title.toLowerCase().includes(search.toLowerCase()) ||
        tool.category.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase())
    );

    // Reset selected index when the search query updates
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Handle interactive internal keyboard operations
    const handleNavigation = (e) => {
        if (filteredTools.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const targetTool = filteredTools[selectedIndex];
            if (targetTool) {
                const targetUrl = targetTool.link.startsWith('http') ? targetTool.link : `https://${targetTool.link}`;
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                setIsOpen(false);
            }
        }
    };

    // Auto-scroll the container to keep the selected item visible
    useEffect(() => {
        if (resultsContainerRef.current) {
            const activeElement = resultsContainerRef.current.children[selectedIndex];
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden shadow-blue-500/5">

                {/* Main Search Input Track */}
                <div className="border-b border-slate-800 px-4 py-3 flex items-center space-x-3">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a metric keyword (e.g. logistics, currency, fda)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleNavigation}
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-mono border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded hover:bg-slate-950 transition-colors"
                    >
                        ESC
                    </button>
                </div>

                {/* Results Stream Listing Area */}
                <div ref={resultsContainerRef} className="max-h-60 overflow-y-auto p-2 space-y-1">
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool, idx) => {
                            const isSelected = idx === selectedIndex;
                            return (
                                <a
                                    key={idx}
                                    href={tool.link.startsWith('http') ? tool.link : `https://${tool.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-150 group ${isSelected
                                        ? 'bg-blue-950/40 border-blue-500/40 text-blue-400'
                                        : 'bg-transparent border-transparent hover:bg-blue-950/20 hover:border-blue-500/10'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-white group-hover:text-blue-500'
                                            }`}>
                                            {tool.title}
                                        </span>
                                        <span className={`text-xs font-mono truncate max-w-[340px] sm:max-w-md ${isSelected ? 'text-slate-300' : 'text-slate-400'
                                            }`}>
                                            {tool.tagline}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-mono bg-slate-950 border px-2 py-0.5 rounded uppercase tracking-wider ${isSelected ? 'border-blue-500/30 text-blue-400' : 'border-slate-800 text-slate-500 group-hover:text-blue-500'
                                        }`}>
                                        {tool.category}
                                    </span>
                                </a>
                            );
                        })
                    ) : (
                        <div className="text-center py-6 text-xs font-mono text-slate-500">
                            No micro-utility matches found.
                        </div>
                    )}
                </div>

                {/* System Ledger Navigation Hint Footer */}
                <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-600">
                    <span className="flex items-center space-x-2">
                        <span>STIMS Search Directory Platform</span>
                        {filteredTools.length > 0 && (
                            <span className="text-[9px] bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-500">
                                {selectedIndex + 1} / {filteredTools.length}
                            </span>
                        )}
                    </span>
                    <span>↑↓ to navigate // ↵ to execute pipeline</span>
                </div>

            </div>
        </div>
    );
}
