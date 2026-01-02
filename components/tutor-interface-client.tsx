'use client';

import dynamic from 'next/dynamic';

const TutorInterface = dynamic(() => import('@/components/tutor-interface-v2').then(mod => ({ default: mod.TutorInterface })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  ),
});

export default function TutorInterfaceClient() {
  return <TutorInterface />;
}
