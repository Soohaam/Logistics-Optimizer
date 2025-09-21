"use client";

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import VesselPrediction from '@/components/VesselPrediction';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>
  );
}

export default function VesselPredictionPage() {
  const params = useParams();

  if (!params.vesselId) {
    return <div>Invalid vessel ID</div>;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <VesselPrediction />
    </Suspense>
  );
}