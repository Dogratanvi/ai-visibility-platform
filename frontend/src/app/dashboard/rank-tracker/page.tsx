import { Suspense } from 'react';
import RankTrackerClient from './RankTrackerClient';

export default function RankTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent text-slate-400 p-6 font-semibold text-sm">Loading...</div>}>
      <RankTrackerClient />
    </Suspense>
  );
}
