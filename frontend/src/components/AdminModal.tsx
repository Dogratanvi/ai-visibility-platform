"use client";

import { ReactNode } from 'react';

export default function AdminModal({ open, onClose, children }: { open: boolean; onClose: () => void; children?: ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl rounded-2xl bg-[#0f1117] border border-[#2a2d3a] shadow-lg overflow-auto max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2d3a]">
          <h3 className="text-lg font-semibold text-white">Panel</h3>
          <button onClick={onClose} className="text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded">Close</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
