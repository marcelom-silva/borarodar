// src/app/r/[id]/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Página pública de viagem compartilhada: borarodar.vercel.app/r/[id]
// ─────────────────────────────────────────────────────────────────────────────
import { Suspense } from 'react';
import SharedTripClient from './SharedTripClient';

export async function generateMetadata({ params }) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://borarodar.vercel.app';
    const res  = await fetch(`${base}/api/share?id=${params.id}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Viagem - BoraRodar' };
    const data = await res.json();
    const f = data.tripData?.formValues;
    return {
      title: `${f?.origem?.split(',')[0] || '?'} → ${f?.destino?.split(',')[0] || '?'} | BoraRodar`,
      description: `Viagem planejada com BoraRodar: ${f?.origem} → ${f?.destino}. ${data.tripData?.routeData?.distance?.toFixed(0) || '?'} km.`,
      openGraph: {
        title: `Minha rota: ${f?.origem?.split(',')[0]} → ${f?.destino?.split(',')[0]}`,
        description: `Planejada em BoraRodar — ${data.tripData?.budgetData?.total ? 'Orçamento estimado: R$ ' + data.tripData.budgetData.total : ''}`,
        url: `${base}/r/${params.id}`,
      },
    };
  } catch { return { title: 'Viagem - BoraRodar' }; }
}

export default function SharedTripPage({ params }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🚗</div>
          <p className="text-gray-400">Carregando viagem...</p>
        </div>
      </div>
    }>
      <SharedTripClient id={params.id} />
    </Suspense>
  );
}
