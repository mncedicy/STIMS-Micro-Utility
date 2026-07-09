// app/layout.js
import "./globals.css";
import Image from "next/image";
import CommandPalette from "./components/CommandPalette";

export const metadata = {
  title: "STIMS | Micro-Utility Software Engine",
  description: "A centralized ecosystem of high-performance, automated web tools powered by optimized data layers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="text-slate-100">
      <body className="antialiased min-h-screen relative pt-[72px]">
        {/* Fixed background: Curved glass layer layout block */}
        <div className="stims-ambient-glow" />

        {/* Keyboard search input box listener */}
        <CommandPalette />

        {/* Global Navigation Bar - Fixed to top with frosted blur */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-900 bg-transparent backdrop-blur-md px-6 py-3">
          <div className="max-w-6xl mx-auto flex justify-between items-center">

            {/* Left Side: Logo and Shortcut Hint Only */}
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="Stims Logo"
                  width={110}
                  height={44}
                  priority
                  className="object-contain"
                />
              </a>
              <div className="hidden md:flex items-center">
                <kbd className="bg-slate-950 border border-slate-800/80 px-1.5 py-0.5 text-[9px] font-mono text-slate-500 rounded">
                  Ctrl K
                </kbd>
              </div>
            </div>

            {/* Center Side: Clean Navigation Links without Numbers */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono font-bold tracking-wider">
              <a
                href="/#about"
                className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]"
              >
                ABOUT
              </a>
              <a
                href="/#contact"
                className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]"
              >
                CONTACT
              </a>
              <a
                href="/status"
                className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]"
              >
                STATUS
              </a>
              <a
                href="/open"
                className="px-3 py-1.5 rounded-md text-slate-400 border border-transparent hover:text-blue-500 transition-all duration-200 stims-hover-glow text-[11px]"
              >
                METRICS
              </a>
            </div>

            {/* Right Side: Server Signal Marker */}
            <div className="flex items-center space-x-2 bg-slate-900/40 border border-slate-900/60 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>JHB-NODE</span>
            </div>

          </div>
        </nav>

        {/* Dynamic Page Target Content Slot */}
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
