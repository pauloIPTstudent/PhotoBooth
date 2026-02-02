'use client';

import { AppContainer } from '@/components/app/AppContainer';
import { Suspense } from 'react';

export default function Home() {
  return (
    // O Next.js exige esse Suspense aqui para permitir o uso de useSearchParams()
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando interface...</p>
      </div>
    }>
      <AppContainer />
    </Suspense>
  );
}
