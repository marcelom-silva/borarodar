'use client';
import { useState } from 'react';
import { generateDayPlan, catColor } from '@/lib/itinerary';
import { ChevronDown, ChevronUp, AlertTriangle, Car, MapPin, Clock } from 'lucide-react';

var CAT_ICONS = {
  'Praia':       '🏖️',
  'Natureza':    '🌿',
  'Historia':    '🏛️',
  'Cultura':     '🎨',
  'Gastronomia': '🍽️',
  'Aventura':    '🏄',
  'Logistica':   '📌',
  'Geral':       '📍',
};

function ActivityCard({ act, index }) {
  var [open, setOpen] = useState(false);
  var color = catColor(act.cat);
  var isDistante = act.distante || act.dist >= 80;
  var isLogistica = act.cat === 'Logistica' || act.cat === 'Geral';

  return (
    <div
      className="relative pl-8 pb-5 last:pb-0"
      style={{ borderLeft: '2px solid ' + (isLogistica ? 'rgba(255,255,255,0.06)' : color + '30') }}
    >
      {/* Bolinha na linha do tempo */}
      <div
        className="absolute left-[-7px] top-1 w-3 h-3 rounded-full border-2 border-[#141414]"
        style={{ background: isLogistica ? '#333' : color }}
      />

      <div
        className="br-card p-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
        onClick={function() { setOpen(!open); }}
        style={{ borderColor: open ? (color + '30') : 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Horario + icone */}
            <div className="flex-shrink-0 text-center">
              <div className="text-xs font-mono text-gray-500">{act.time}</div>
              <div className="text-lg mt-0.5">{act.icon || CAT_ICONS[act.cat] || '📍'}</div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-syne font-bold text-sm">{act.name}</span>

                {/* Badge distante */}
                {isDistante && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(255,107,53,0.15)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    EXCURSAO — {act.dist} km
                  </span>
                )}

                {/* Badge distancia normal */}
                {!isDistante && act.dist > 0 && !isLogistica && (
                  <span className="text-[10px] text-gray-600 font-mono">{act.dist} km</span>
                )}
              </div>

              {/* Categoria */}
              {!isLogistica && (
                <span
                  className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 font-medium"
                  style={{ background: color + '14', color: color }}
                >
                  {act.cat}
                </span>
              )}
            </div>
          </div>

          {/* Toggle */}
          <button className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Descricao expandida */}
        {open && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-sm text-gray-400 leading-relaxed">{act.desc}</p>
            {isDistante && (
              <div className="mt-2 flex items-center gap-2 text-xs text-br-orange">
                <Car className="w-3.5 h-3.5" />
                <span>Saida recomendada: {act.time} — retorno previsto a noite. Vale muito a visita!</span>
              </div>
            )}
            {act.dist > 0 && !isDistante && !isLogistica && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <MapPin className="w-3.5 h-3.5" />
                <span>Aproximadamente {act.dist} km do centro</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DayCard({ dayPlan }) {
  var [open, setOpen] = useState(dayPlan.day <= 2);
  var isFirst = dayPlan.label === 'Chegada';
  var isLast  = dayPlan.label === 'Partida';

  return (
    <div className="br-card overflow-hidden">
      {/* Header do dia */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
        onClick={function() { setOpen(!open); }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-syne font-black text-sm flex-shrink-0"
            style={isFirst || isLast
              ? { background: 'rgba(255,255,255,0.08)', color: '#aaa' }
              : { background: 'rgba(57,255,20,0.12)', color: '#39FF14' }
            }
          >
            {dayPlan.day}
          </div>
          <div className="text-left">
            <div className="font-syne font-bold text-sm">{dayPlan.label}</div>
            <div className="text-xs text-gray-600">{dayPlan.activities.length} atividade{dayPlan.activities.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="text-gray-600">{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2">
          {dayPlan.activities.map(function(act, i) {
            return <ActivityCard key={i} act={act} index={i} />;
          })}
        </div>
      )}
    </div>
  );
}

export default function DayItinerary({ formValues, routeData }) {
  var dias      = parseInt(formValues.noites) || 0;
  var interests = formValues.interesses || [];
  var tripType  = formValues.perfil || 'casal';
  var dest      = formValues.destino || '';

  if (!dias || dias < 1 || !dest) return null;

  var plan = generateDayPlan({ destination: dest, days: dias + 1, interests: interests, tripType: tripType });

  if (!plan || !plan.length) return null;

  var distantes = plan.flatMap(function(d) { return d.activities; }).filter(function(a) { return a.distante; });

  return (
    <div className="br-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-syne font-bold text-lg">Roteiro Dia a Dia 📅</h2>
          <p className="text-gray-500 text-sm mt-1">
            {dias} noite{dias !== 1 ? 's' : ''} em <span className="text-white font-medium">{dest.split(',')[0]}</span>
            {' '} — {dias + 1} dia{dias + 1 !== 1 ? 's' : ''}
          </p>
        </div>
        {distantes.length > 0 && (
          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.2)' }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {distantes.length} excursao{distantes.length !== 1 ? 'es' : ''} sugerida{distantes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Aviso sobre excursoes distantes */}
      {distantes.length > 0 && (
        <div
          className="mb-5 flex items-start gap-3 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}
        >
          <Car className="w-4 h-4 text-br-orange flex-shrink-0 mt-0.5" />
          <p className="text-gray-300 leading-relaxed">
            <span className="text-br-orange font-semibold">Excursoes marcadas:</span> algumas atrações ficam mais longe, mas como voce esta de carro, vale totalmente a pena! 
            Planeje sair cedo e reserve um dia exclusivo para elas.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {plan.map(function(dayPlan) {
          return <DayCard key={dayPlan.day} dayPlan={dayPlan} />;
        })}
      </div>

      <p className="text-xs text-gray-700 mt-5">
        * Roteiro sugerido com base no destino. Clique em cada atividade para ver detalhes e dicas.
      </p>
    </div>
  );
}
