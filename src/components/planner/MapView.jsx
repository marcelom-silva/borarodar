'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: function() {
    return (
      <div className="w-full h-full flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando mapa...</span>
      </div>
    );
  },
});

export default function MapView({ routeData }) {
  return <LeafletMap routeData={routeData} />;
}
