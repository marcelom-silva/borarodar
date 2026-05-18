'use client';
// src/components/planner/TollWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Exibe pedágios reais (TollGuru) + info América do Sul
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { CreditCard, MapPin, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const COUNTRY_FLAGS = { BR:'🇧🇷', AR:'🇦🇷', CL:'🇨🇱', UY:'🇺🇾', PY:'🇵🇾', BO:'🇧🇴', PE:'🇵🇪', CO:'🇨🇴' };

function PlazaItem({ plaza }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <MapPin className="w-4 h-4 text-[#FF6B35] mt-0.5 flex-shrink-0"/>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-200 truncate">{plaza.name}</div>
        {plaza.road && <div className="text-xs text-gray-500">{plaza.road}{plaza.state ? ` · ${plaza.state}` : ''}</div>}
        <div className="flex gap-3 mt-1 text-xs">
          {plaza.cashCost != null && <span className="text-gray-400">💵 R$ {plaza.cashCost?.toFixed(2)}</span>}
          {plaza.tagCost  != null && <span className="text-[#39FF14]">📡 R$ {plaza.tagCost?.toFixed(2)} (TAG)</span>}
        </div>
      </div>
      {plaza.acceptsCard && (
        <span title="Aceita cartão" className="text-[#00D4FF]"><CreditCard className="w-3 h-3"/></span>
      )}
    </div>
  );
}

function CountryInfo({ data }) {
  const [open, setOpen] = useState(false);
  const flag = COUNTRY_FLAGS[data.country] || '🌎';
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <div className="text-left">
            <div className="font-semibold text-sm">{data.name}</div>
            <div className="text-xs text-gray-500">
              Moeda: {data.currency}
              {data.acceptsCard ? ' · Aceita cartão ✓' : ' · Somente dinheiro ⚠️'}
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500"/> : <ChevronDown className="w-4 h-4 text-gray-500"/>}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Info geral */}
          <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-xl p-3 text-xs text-gray-300 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1 text-[#FF6B35]"/>
            {data.info}
          </div>

          {/* TAG */}
          {data.tag && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#39FF14]">📡</span>
              <span className="text-gray-400">TAG:</span>
              <span className="text-gray-200">{data.tag}</span>
              {data.tagDiscount && <span className="text-xs text-[#39FF14]">({data.tagDiscount})</span>}
            </div>
          )}

          {/* Corredores principais */}
          {data.corridors?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Principais corredores</p>
              <div className="space-y-1">
                {data.corridors.map((c, i) => {
                  // Formata valor estimado na moeda local
                  const val = c.ars ?? c.clp ?? c.uyu ?? c.pyg ?? c.bob ?? c.pen ?? c.cop ?? null;
                  const currency = data.currency;
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 text-sm">
                      <span className="text-xs text-gray-600 w-16 flex-shrink-0">{c.route}</span>
                      <span className="text-gray-300 flex-1">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.km} km</span>
                      {val != null && (
                        <span className="text-xs text-[#FF6B35] font-medium">
                          ~{currency} {val.toLocaleString()}
                        </span>
                      )}
                      {c.plazas != null && (
                        <span className="text-xs text-gray-600">{c.plazas} praças</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TollWidget({ tollData, budgetToll }) {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  if (!tollData) return null;

  const { source, totalToll, currency, plazas, staticCountries, countries } = tollData;
  const isReal    = source === 'tollguru';
  const isStatic  = source === 'static';
  const hasForeign = (staticCountries?.length > 0 || countries?.length > 0);
  const foreignList = staticCountries || countries || [];

  const displayedPlazas = showAll ? plazas : plazas?.slice(0, 5);

  return (
    <div className="br-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛣️</span>
          <div>
            <h2 className="font-syne font-bold text-base">Pedágios</h2>
            <p className="text-xs text-gray-500">
              {isReal ? 'Dados reais via TollGuru ✓' : isStatic ? 'Referência manual (América do Sul)' : 'Estimativa local'}
            </p>
          </div>
        </div>
        {isReal && totalToll != null && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Total pedágios</div>
            <div className="text-xl font-extrabold text-[#FF6B35]">
              {currency === 'BRL' || currency === 'R$' ? 'R$' : currency} {typeof totalToll === 'number' ? totalToll.toFixed(2) : totalToll}
            </div>
          </div>
        )}
      </div>

      {/* Praças individuais (TollGuru) */}
      {isReal && plazas?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {plazas.length} praças na rota
          </p>
          <div className="divide-y divide-white/5">
            {displayedPlazas.map((p, i) => <PlazaItem key={i} plaza={p}/>)}
          </div>
          {plazas.length > 5 && (
            <button onClick={() => setShowAll(s => !s)}
              className="w-full mt-2 text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1">
              {showAll ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
              {showAll ? 'Ver menos' : `Ver mais ${plazas.length - 5} praças`}
            </button>
          )}
          {plazas.some(p => p.acceptsCard) && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#00D4FF]">
              <CreditCard className="w-3 h-3"/>
              Maioria das praças aceita cartão
            </div>
          )}
        </div>
      )}

      {/* Sem praças reais mas com estimativa */}
      {!isReal && budgetToll != null && budgetToll > 0 && !isStatic && (
        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
          <span className="text-gray-400 text-sm">Estimativa de pedágios</span>
          <span className="font-bold text-[#FF6B35]">R$ {budgetToll}</span>
        </div>
      )}

      {/* Info países estrangeiros */}
      {hasForeign && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Países na rota</p>
          {foreignList.map(c => <CountryInfo key={c.country} data={c}/>)}
        </div>
      )}

      {/* Aviso TollGuru não configurado */}
      {source === 'estimate' && !isReal && (
        <div className="text-xs text-gray-600 border border-white/5 rounded-xl p-3">
          💡 Para pedágios em tempo real, configure <code className="text-[#39FF14]">TOLLGURU_API_KEY</code> no <code>.env.local</code>.
          Chave gratuita em{' '}
          <a href="https://tollguru.com" target="_blank" rel="noreferrer"
            className="text-[#00D4FF] hover:underline inline-flex items-center gap-1">
            tollguru.com <ExternalLink className="w-3 h-3"/>
          </a>
        </div>
      )}
    </div>
  );
}
