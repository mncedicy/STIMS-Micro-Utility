import React from 'react';

export default function MessageLogs() {
    return (
        <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Message Logs</h3>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs text-slate-500 font-sans text-center">
                No contact submissions found matching your active session.
            </div>
        </div>
    );
}
