'use client';
import { Fuel, BarChart2, Utensils, Bed, CreditCard, Users, Car, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function CostRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color+'18' }}>
          <Icon className="w-3.5 h-3.5" style={{ color: color }}/>
        </div>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className="font-mono font-bold text-sm" style={{ color: color }}>R$ {value.toLocaleString('pt-BR')}</span>
    </div>
  );
}

function SectionTotal({ label, value, color }) {
  return (
    <div className="flex items-center justify-between pt-2 mt-1">
      <span className="font-syne font-bold text-sm" style={{ color: color }}>{label}</span>
      <span className="font-syne font-extrabold text-lg" style={{ color: color }}>R$ {value.toLocaleString('pt-BR')}</span>
    </div>
  );
}

export default function BudgetBreakdown({ budget, passengers, travelStyle }) {
  var { t } = useLanguage();
  var pax   = parseInt(passengers) || 1;

  return (
    <div className="br-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-br-green"/>
          <h2 className="font-syne font-bold text-lg">{t('budget_title')} 💰</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {budget.isRoundTrip && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background:'rgba(0,212,255,0.1)', color:'#00D4FF' }}>
              <RotateCcw className="w-3 h-3"/> {t('trip_roundtrip')}
            </span>
          )}
          {budget.avoidTolls && (
            <span className="px-2 py-1 rounded-full" style={{ background:'rgba(255,107,53,0.1)', color:'#FF6B35' }}>
              {t('budget_no_tolls')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">

        {/* ===== COLUNA 1: CUSTOS DO VEICULO ===== */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-br-blue"/>
            <h3 className="font-syne font-bold text-sm text-br-blue">{t('cost_vehicle')}</h3>
          </div>
          <CostRow icon={Fuel}     label={t('budget_fuel')} value={budget.fuel} color="#39FF14"/>
          <CostRow icon={BarChart2} label={t('budget_toll')} value={budget.toll} color="#00D4FF"/>
          <SectionTotal label={t('cost_vehicle_total')} value={budget.vehicleTotal || 0} color="#00D4FF"/>
        </div>

        {/* ===== COLUNA 2: CUSTOS DO ROTEIRO ===== */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bed className="w-4 h-4 text-br-purple"/>
            <h3 className="font-syne font-bold text-sm text-br-purple">{t('cost_itinerary')}</h3>
          </div>
          <CostRow icon={Utensils} label={t('budget_food')}  value={budget.food}          color="#FF6B35"/>
          <CostRow icon={Bed}      label={t('budget_hotel')} value={budget.accommodation} color="#B24BF3"/>
          <SectionTotal label={t('cost_itinerary_total')} value={budget.itineraryTotal || 0} color="#B24BF3"/>
        </div>
      </div>

      {/* ===== TOTAIS + RACHA ===== */}
      <div className="p-5 border-t border-white/5" style={{ background:'rgba(57,255,20,0.03)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Total geral */}
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('budget_total')}</p>
            <p className="font-syne font-extrabold text-3xl text-br-green">
              R$ {(budget.total || 0).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Divisor */}
          <div className="hidden sm:block w-px h-12 bg-white/10"/>

          {/* Por pessoa (racha) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-br-green/10 border border-br-green/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-br-green"/>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('cost_per_person')} ({pax} {pax > 1 ? t('people') : t('person')})</p>
              <p className="font-syne font-extrabold text-xl text-br-green">
                R$ {(budget.perPerson || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {budget.isRoundTrip && (
          <p className="text-xs text-gray-600 mt-3">* Combustivel e pedagios calculados para ida e volta ({budget.totalKm || 0} km total).</p>
        )}
        <p className="text-xs text-gray-600 mt-1">{t('budget_note')}</p>
      </div>
    </div>
  );
}
