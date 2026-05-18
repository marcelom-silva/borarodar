'use client';
// src/components/planner/EVWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Calculadora de autonomia de bateria + eletropostos ao longo da rota
// Exibido apenas quando o veículo selecionado é elétrico (EV)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { Zap, AlertTriangle, CheckCircle, MapPin, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EV_MODELS } from '@/lib/vehicleData';

function RangeBar({ pct, label, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span style={{ color }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function EVWidget({ vehicleModel, routeData, waypoints }) {
  const { t } = useLanguage();
  const [stations,   setStations]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [expanded,   setExpanded]   = useState(true);
  const fetchedRef = useRef(false);

  // Modelo EV atual (do vehicleData.js)
  const evModel = EV_MODELS.find(m => m.name === vehicleModel);
  const batteryKwh    = evModel?.batteryKwh    || 60;
  const consumoKwhPer100 = evModel?.consumoKwh100 || 18;
  const maxRangeKm    = Math.round((batteryKwh / consumoKwhPer100) * 100);
  const distanceKm    = routeData?.distance || 0;

  // Segmentos de rota entre paradas
  const stops = [
    { name: routeData?.origLabel || 'Origem', km: 0 },
    ...(routeData?.waypoints || []).map(w => ({ name: w.name, km: null })),
    { name: routeData?.destLabel || 'Destino', km: distanceKm },
  ];

  // Estimativa de bateria restante após a rota
  const energyNeeded    = (distanceKm / 100) * consumoKwhPer100;
  const batteryUsedPct  = Math.min((energyNeeded / batteryKwh) * 100, 100);
  const batteryLeftPct  = Math.max(100 - batteryUsedPct, 0);
  const needsCharge     = distanceKm > maxRangeKm * 0.8; // recarrega se >80% da autonomia
  const canMakeIt       = distanceKm <= maxRangeKm * 0.9;

  // Status da rota
  const routeStatus = canMakeIt
    ? { color: '#39FF14', icon: CheckCircle, msg: `Autonomia suficiente! Chega com ~${Math.round(batteryLeftPct)}% de bateria restante.` }
    : needsCharge
    ? { color: '#FF9500', icon: AlertTriangle, msg: `Rota de ${distanceKm.toFixed(0)} km excede ${Math.round(maxRangeKm * 0.8)} km (80% da autonomia). Planeje 1 recarga.` }
    : { color: '#FF3B30', icon: AlertTriangle, msg: `Rota de ${distanceKm.toFixed(0)} km excede a autonomia máxima (${maxRangeKm} km). Necessário pelo menos ${Math.ceil(distanceKm / maxRangeKm)} recargas.` };

  const StatusIcon = routeStatus.icon;

  // Busca eletropostos
  useEffect(() => {
    if (fetchedRef.current) return;
    if (!routeData?.geometry?.coordinates?.length) return;
    fetchedRef.current = true;
    setLoading(true);

    // Extrai pontos-amostra da geometria da rota
    const coords = routeData.geometry.coordinates; // [[lng, lat], ...]
    const step = Math.max(1, Math.floor(coords.length / 8));
    const pts = [];
    for (let i = 0; i < coords.length; i += step) {
      pts.push({ lat: coords[i][1], lng: coords[i][0] });
    }

    fetch('/api/ev-stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints: pts, radiusKm: 25, maxResults: 4 }),
    })
      .then(r => r.json())
      .then(data => {
        setStations(data.stations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [routeData]);

  if (!evModel && !distanceKm) return null;

  return (
    <div className="br-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#39FF14]" />
          <h2 className="font-syne font-bold text-base">Autonomia do Elétrico ⚡</h2>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-gray-500 hover:text-gray-300">
          {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
        </button>
      </div>

      {expanded && (
        <>
          {/* Modelo EV */}
          {evModel && (
            <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-gray-500">Bateria</div>
                  <div className="text-lg font-bold text-[#39FF14]">{batteryKwh} kWh</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Consumo</div>
                  <div className="text-lg font-bold text-[#00D4FF]">{consumoKwhPer100} kWh/100km</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Autonomia máx.</div>
                  <div className="text-lg font-bold text-[#FF6B35]">{maxRangeKm} km</div>
                </div>
              </div>
            </div>
          )}

          {/* Status da rota */}
          {distanceKm > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: routeStatus.color + '11', borderLeft: `3px solid ${routeStatus.color}` }}>
              <StatusIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: routeStatus.color }} />
              <p className="text-sm text-gray-300">{routeStatus.msg}</p>
            </div>
          )}

          {/* Barra de bateria */}
          {distanceKm > 0 && (
            <div className="space-y-3">
              <RangeBar pct={100}           label="Bateria no início"  color="#39FF14"/>
              <RangeBar pct={batteryLeftPct} label="Bateria ao chegar"  color={batteryLeftPct > 20 ? '#00D4FF' : '#FF3B30'}/>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Energia necessária: {energyNeeded.toFixed(1)} kWh</span>
                <span>~R$ {(energyNeeded * 2.5).toFixed(0)} (carga rápida)</span>
              </div>
            </div>
          )}

          {/* Segmentos de rota */}
          {stops.length > 2 && distanceKm > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Análise por trecho</p>
              <div className="space-y-1">
                {stops.slice(0, -1).map((s, i) => {
                  const segKm = distanceKm / (stops.length - 1);
                  const segOk = segKm <= maxRangeKm;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-white/3">
                      <div className={`w-2 h-2 rounded-full ${segOk ? 'bg-[#39FF14]' : 'bg-[#FF9500]'}`}/>
                      <span className="text-gray-400">{s.name}</span>
                      <span className="text-gray-600 text-xs">→</span>
                      <span className="text-gray-400">{stops[i+1].name}</span>
                      <span className="ml-auto text-xs" style={{ color: segOk ? '#39FF14' : '#FF9500' }}>
                        ~{segKm.toFixed(0)} km
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Eletropostos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Eletropostos na Rota</p>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-gray-500"/>}
            </div>
            {!loading && stations.length === 0 && (
              <p className="text-sm text-gray-500 py-2">Nenhum eletroposto encontrado no raio de 25 km da rota.</p>
            )}
            <div className="space-y-2">
              {stations.slice(0, 6).map(s => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="mt-0.5">
                    <Zap className={`w-4 h-4 ${s.is_fast ? 'text-[#39FF14]' : 'text-[#00D4FF]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">{s.address}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.is_fast && (
                        <span className="text-xs bg-[#39FF14]/10 text-[#39FF14] px-2 py-0.5 rounded-full">
                          Carga rápida {s.maxKW}kW
                        </span>
                      )}
                      {s.operator && (
                        <span className="text-xs text-gray-600">{s.operator}</span>
                      )}
                      {s.usageCost && s.usageCost !== 'Verificar local' && (
                        <span className="text-xs text-gray-500">{s.usageCost}</span>
                      )}
                    </div>
                  </div>
                  {s.lat && s.lng && (
                    <a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                      target="_blank" rel="noreferrer"
                      className="text-[#00D4FF] hover:underline text-xs flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4"/>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dica */}
          <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-xl p-3 text-xs text-gray-400 leading-relaxed">
            💡 <strong className="text-gray-300">Dica:</strong> Mantenha a bateria acima de 20% para preservar a vida útil. 
            Procure carregadores rápidos (DC) para viagens longas — carregam a 80% em ~30-45 min.
            Apps úteis: <span className="text-[#00D4FF]">PlugShare</span>, <span className="text-[#00D4FF]">ABEV</span>.
          </div>
        </>
      )}
    </div>
  );
}
