import React from 'react';

export default function ProfileCard({ displayName, userEmail, userSurname }) {
    return (
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">Your Profile</h3>
            <div className="space-y-2 text-xs font-sans">
                <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase">First Name</span>
                    <span className="text-white font-medium">{displayName}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase">Surname</span>
                    <span className="text-white font-medium">{userSurname || "Not added"}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase">Email Address</span>
                    <span className="text-white font-medium font-mono text-[11px]">{userEmail}</span>
                </div>
            </div>
        </div>
    );
}
