'use client';

import { ReactNode } from 'react';

export default function AdminModal({ open, onClose, children }: { open: boolean; onClose: () => void; children?: ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 mt-10">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-auto max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50/50">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide">System Control</h3>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
