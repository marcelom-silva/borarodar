'use client';
import { ExternalLink, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Monta URL do Google Maps com multi-paradas
function buildGoogleMapsUrl(origem, destino, waypoints) {
  var parts = [origem];
  (waypoints || []).forEach(function(wp) {
    if (wp && wp.name && wp.name.trim().length > 2) parts.push(wp.name.trim());
  });
  parts.push(destino);
  // Formato amigavel para mobile: abre no app Google Maps instalado
  return 'https://www.google.com/maps/dir/' + parts.map(encodeURIComponent).join('/');
}

// Monta URL do Waze (suporta destino final com navigate=yes)
function buildWazeUrl(destino) {
  return 'https://waze.com/ul?q=' + encodeURIComponent(destino) + '&navigate=yes';
}

export default function RouteNavButtons({ origem, destino, waypoints, routeResult }) {
  var { t } = useLanguage();

  // So mostra quando a rota foi calculada com sucesso
  if (!routeResult || !origem || !destino) return null;

  var gmapsUrl = buildGoogleMapsUrl(origem, destino, waypoints);
  var wazeUrl  = buildWazeUrl(destino);
  var stops    = (waypoints || []).filter(function(wp) { return wp && wp.name && wp.name.trim().length > 2; });

  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{border:'1px solid rgba(255,255,255,0.06)', background:'rgba(14,14,19,0.9)'}}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
        style={{background:'rgba(255,255,255,0.025)'}}>
        <Navigation className="w-4 h-4 text-br-green flex-shrink-0"/>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-syne font-bold text-white">{t('route_open_nav')}</p>
          <p className="text-[10px] text-gray-600 truncate">
            {origem.split(',')[0]} → {stops.map(function(wp){return wp.name.split(',')[0];}).join(' → ')}{stops.length ? ' → ' : ''}{destino.split(',')[0]}
          </p>
        </div>
        {stops.length > 0 && (
          <span className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0"
            style={{background:'rgba(57,255,20,0.1)', color:'#39FF14'}}>
            {stops.length + 2} {t('route_stops')}
          </span>
        )}
      </div>

      {/* Botoes */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {/* Google Maps */}
        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95 select-none"
          style={{
            background:'rgba(66,133,244,0.1)',
            border:'1px solid rgba(66,133,244,0.28)',
            color:'#4285F4',
          }}>
          <span className="text-lg leading-none">🗺️</span>
          <span className="font-syne font-bold">Google Maps</span>
          <ExternalLink className="w-3 h-3 opacity-60"/>
        </a>

        {/* Waze */}
        <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95 select-none"
          style={{
            background:'rgba(0,212,255,0.08)',
            border:'1px solid rgba(0,212,255,0.25)',
            color:'#00D4FF',
          }}>
          <span className="text-lg leading-none">🚗</span>
          <span className="font-syne font-bold">Waze</span>
          <ExternalLink className="w-3 h-3 opacity-60"/>
        </a>
      </div>

      <p className="text-[10px] text-gray-700 text-center pb-2.5">{t('route_open_nav_sub')}</p>
    </div>
  );
}
