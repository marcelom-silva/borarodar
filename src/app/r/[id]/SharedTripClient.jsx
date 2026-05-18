'use client';
// src/app/r/[id]/SharedTripClient.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Fuel, CreditCard, Users, Moon, Share2, ExternalLink, Car } from 'lucide-react';

function formatDuration(hours) {
  const h = Math.floor(hours), m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

export default function SharedTripClient({ id }) {
  const [tripData, setTripData]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    fetch(`/api/share?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setTripData(data);
        setLoading(false);
      })
      .catch(() => { setError('Falha ao carregar viagem'); setLoading(false); });
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
      <div className="text-white text-center animate-pulse">
        <div className="text-5xl mb-4">🛣️</div>
        <p className="text-gray-400">Carregando rota...</p>
      </div>
    </div>
  );

  if (error || !tripData) return (
    <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-bold mb-2">Viagem não encontrada</h1>
        <p className="text-gray-400 mb-6">Este link pode ter expirado ou sido removido.</p>
        <Link href="/" className="bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          Planejar minha viagem
        </Link>
      </div>
    </div>
  );

  const { formValues: f, routeData: r, budgetData: b, itinerary } = tripData.tripData;
  const PROFILE_LABELS = {
    solo:'Solo', couple:'Casal', women_only:'Só Mulheres', family_baby:'Família+Bebê',
    family_senior:'Com Idosos', friends:'Grupo', pets:'Com Pets',
    accessibility:'Acessibilidade', lgbt_friendly:'LGBT+ Friendly', esporte_aventura:'Aventura',
  };
  const STYLE_LABELS = { economico:'Econômico 💰', moderado:'Moderado ⚖️', esbanjando:'Esbanjando ✨' };

  return (
    <div className="min-h-screen bg-[#0F0F13] text-white">
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-xl">
            <span className="text-[#FF6B35]">Bora</span>
            <span className="text-[#39FF14]">Rodar</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <button onClick={copyLink} aria-label={copied ? "Link copiado" : "Copiar link da viagem"}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Share2 className="w-4 h-4" />
            {copied ? 'Copiado! ✓' : 'Copiar link'}
          </button>
          <Link href={`/planejar?origem=${encodeURIComponent(f?.origem||'')}&destino=${encodeURIComponent(f?.destino||'')}`}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[#39FF14] text-black font-semibold hover:scale-105 transition-transform">
            <Car className="w-4 h-4" />
            Planejar igual
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Route header */}
        <div className="br-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rota compartilhada</p>
              <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                <span className="text-[#39FF14]">{f?.origem?.split(',')[0]}</span>
                <span className="text-gray-500">→</span>
                <span className="text-[#FF6B35]">{f?.destino?.split(',')[0]}</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">{f?.origem} → {f?.destino}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Visualizações</div>
              <div className="text-lg font-bold text-[#B24BF3]">{tripData.views}</div>
            </div>
          </div>

          {/* Waypoints */}
          {f?.waypoints?.filter(w => w.name)?.length > 0 && (
            <div className="mb-4 pl-4 border-l-2 border-[#39FF14]/30">
              <p className="text-xs text-gray-500 mb-1">Paradas intermediárias</p>
              {f.waypoints.filter(w => w.name).map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-3 h-3 text-[#FF6B35]" />
                  {w.name}
                </div>
              ))}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {r?.distance && <StatCard icon={MapPin}  label="Distância"    value={`${r.distance.toFixed(0)} km`} color="#39FF14"/>}
            {r?.duration  && <StatCard icon={Clock}   label="Duração est." value={formatDuration(r.duration)}   color="#00D4FF"/>}
            {f?.passageiros && <StatCard icon={Users} label="Passageiros"  value={f.passageiros}                  color="#B24BF3"/>}
            {f?.noites != null && f.noites > 0 && <StatCard icon={Moon}  label="Noites"      value={f.noites}                       color="#FF6B35"/>}
          </div>
        </div>

        {/* Trip details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {f?.viagem_style && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-500">Estilo</div>
              <div className="text-sm font-semibold">{STYLE_LABELS[f.viagem_style] || f.viagem_style}</div>
            </div>
          )}
          {f?.travel_profile && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-500">Perfil</div>
              <div className="text-sm font-semibold">{PROFILE_LABELS[f.travel_profile] || f.travel_profile}</div>
            </div>
          )}
          {f?.vehicle_type && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-500">Veículo</div>
              <div className="text-sm font-semibold capitalize">{f.vehicle_type}</div>
            </div>
          )}
          {f?.combustivel && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-500">Combustível</div>
              <div className="text-sm font-semibold capitalize">{f.combustivel}</div>
            </div>
          )}
          {f?.is_round_trip && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-500">Tipo</div>
              <div className="text-sm font-semibold">Ida e Volta</div>
            </div>
          )}
        </div>

        {/* Budget */}
        {b && (
          <div className="br-card p-6">
            <h2 className="font-bold text-lg mb-4">💰 Orçamento Estimado</h2>
            <div className="space-y-2 mb-4">
              {[
                { l:'Combustível',  v:b.fuel,          c:'#39FF14' },
                { l:'Pedágios',     v:b.toll,           c:'#FF6B35' },
                { l:'Alimentação',  v:b.food,           c:'#00D4FF' },
                { l:'Hospedagem',   v:b.accommodation,  c:'#B24BF3' },
              ].filter(x => x.v > 0).map(x => (
                <div key={x.l} className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400">{x.l}</span>
                  <span className="font-semibold" style={{ color: x.c }}>R$ {x.v.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-extrabold text-[#39FF14]">R$ {b.total?.toLocaleString('pt-BR')}</span>
            </div>
            {b.perPerson && (
              <p className="text-gray-500 text-sm mt-1 text-right">≈ R$ {b.perPerson} por pessoa</p>
            )}
          </div>
        )}

        {/* Itinerary preview */}
        {itinerary && (
          <div className="br-card p-6">
            <h2 className="font-bold text-lg mb-4">📅 Roteiro</h2>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {itinerary}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="br-card p-6 text-center">
          <p className="text-gray-400 mb-4">Quer planejar uma viagem parecida?</p>
          <Link href={`/planejar?origem=${encodeURIComponent(f?.origem||'')}&destino=${encodeURIComponent(f?.destino||'')}`}
            className="inline-flex items-center gap-2 bg-[#39FF14] text-black font-extrabold px-8 py-3 rounded-2xl text-lg hover:scale-105 transition-transform">
            <ExternalLink className="w-5 h-5" />
            Planejar no BoraRodar
          </Link>
          <p className="text-gray-600 text-xs mt-3">Grátis · Sem cadastro · Com IA</p>
        </div>
      </div>
    </div>
  );
}
