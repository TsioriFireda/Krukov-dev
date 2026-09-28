import React from 'react';

export default function Logo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#541515] to-[#7f1d1d] text-white shadow-md font-bold overflow-hidden select-none ${className}`}>
      <span className="text-xs sm:text-sm font-black tracking-tighter">KT</span>
      <div className="absolute inset-0 bg-white/10 opacity-50 pointer-events-none" />
    </div>
  );
}
