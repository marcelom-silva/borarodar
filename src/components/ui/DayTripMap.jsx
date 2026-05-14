'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

var DayTripLeaflet = dynamic(
  function() { return import('@/components/ui/DayTripLeaflet'); },
  {
    ssr: false,
    loading: function() {
      return (
        <div className="flex items-center justify-center rounded-xl" style={{ height:'260px', background:'#111', border:'1px solid rgba(255,255,255,0.05)' }}>
          <Loader2 className="w-6 h-6 animate-spin text-br-green"/>
        </div>
      );
    },
  }
);

export default function DayTripMap({ points, height, accentColor }) {
  if (!points || !points.length) return null;
  return <DayTripLeaflet points={points} height={height} accentColor={accentColor}/>;
}
