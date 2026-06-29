import { Suspense } from 'react';
import RankTrackerClient from './RankTrackerClient';

export default function RankTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1117] text-white p-6">Loading...</div>}>
      <RankTrackerClient />
    </Suspense>
  );
}
