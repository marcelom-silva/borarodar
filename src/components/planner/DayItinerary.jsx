'use client';
import { useState } from 'react';
import { generateItinerary } from '@/lib/ai';
import { generateStaticItinerary } from '@/lib/itinerary';
import { Sparkles, Coffee, Sun, Moon, Utensils, Bed, Lightbulb, Calendar, ChevronLeft, ChevronRight, Loader2, AlertCircle, Star } from 'lucide-react';

var INTERESTS = [
  { id: 'gastronomia', label: 'Gastronomia', emoji: 'X' },
  { id: 'natureza',    label: 'Natureza',    emoji: 'O' },
  { id: 'historia',    label: 'Historia',    emoji: 'H' },
  { id: 'aventura',    label: 'Aventura',    emoji: 'A' },
  { id: 'cultura',     label: 'Cultura',     emoji: 'C' },
  { id: 'praia',       label: 'Praia',       emoji: 'P' },
  { id: 'compras',     label: 'Compras',     emoji: 'S' },
  { id: 'relax',       label: 'Relax',       emoji: 'R' },
];

var BUDGETS = [
  { id: 'economico',   label: 'Economico',   desc: 'Hostel, lanchonetes' },
  { id: 'medio',       label: 'Moderado',    desc: 'Pousadas, restaurantes' },
  { id: 'confortavel', label: 'Confortavel', desc: 'Hoteis, jantares' },
];

function DayCard({ day }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(234,179,8,0.12)' }}>
          <Coffee className="w-4 h-4 text-yellow-400"/>
        </div>
        <div>
          <p className="text-xs text-yellow-400 font-mono uppercase tracking-wide mb-1">Manha</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.morning}</p>
          {day.meals && day.meals.breakfast && (
            <p className="text-xs text-gray-600 mt-1.5">Cafe: {day.meals.breakfast}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,53,0.12)' }}>
          <Sun className="w-4 h-4 text-br-orange"/>
        </div>
        <div>
          <p className="text-xs text-br-orange font-mono uppercase tracking-wide mb-1">Tarde</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.afternoon}</p>
          {day.meals && day.meals.lunch && (
            <p className="text-xs text-gray-600 mt-1.5">Almoco: {day.meals.lunch}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.12)' }}>
          <Moon className="w-4 h-4 text-br-blue"/>
        </div>
        <div>
          <p className="text-xs text-br-blue font-mono uppercase tracking-wide mb-1">Noite</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.evening}</p>
          {day.meals && day.meals.dinner && (
            <p className="text-xs text-gray-600 mt-1.5">Jantar: {day.meals.dinner}</p>
          )}
        </div>
      </div>

      {day.accommodation && (
        <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(178,75,243,0.05)', border: '1px solid rgba(178,75,243,0.1)' }}>
          <Bed className="w-4 h-4 text-br-purple flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-gray-400"><span className="text-br-purple font-medium">Hospedagem: </span>{day.accommodation}</p>
        </div>
      )}

      {day.tip && (
        <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.12)' }}>
          <Lightbulb className="w-4 h-4 text-br-green flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-gray-400"><span className="text-br-green font-medium">Dica local: </span>{day.tip}</p>
        </div>
      )}
    </div>
  );
}

export default function DayItinerary({ destination, days, passengers }) {
  var [selectedInterests, setSelectedInterests] = useState(['gastronomia', 'natureza']);
  var [budget,     setBudget]     = useState('medio');
  var [itinerary,  setItinerary]  = useState(null);
  var [loading,    setLoading]    = useState(false);
  var [error,      setError]      = useState('');
  var [activeDay,  setActiveDay]  = useState(0);
  var [usingAI,    setUsingAI]    = useState(false);

  function toggleInterest(id) {
    setSelectedInterests(function(prev) {
      if (prev.includes(id)) return prev.filter(function(x) { return x !== id; });
      if (prev.length >= 4) return prev;
      return prev.concat([id]);
    });
  }

  async function generate() {
    if (!destination) { setError('Calcule uma rota primeiro para definir o destino.'); return; }
    setLoading(true); setError(''); setItinerary(null); setUsingAI(false);
    try {
      var result = await generateItinerary({
        destination: destination, days: days || 1,
        passengers: passengers || 1, interests: selectedInterests, budget: budget,
      });
      setItinerary(result); setUsingAI(true);
    } catch (aiErr) {
      var staticResult = generateStaticItinerary({ destination: destination, days: days || 1 });
      if (staticResult) {
        setItinerary(staticResult);
        if (aiErr.message === 'GEMINI_KEY_MISSING') {
          setError('Roteiro base exibido. Adicione NEXT_PUBLIC_GEMINI_API_KEY para roteiros personalizados por IA.');
        }
      } else {
        if (aiErr.message === 'GEMINI_KEY_MISSING') {
          setError('Configure a chave Gemini em .env.local para gerar roteiros com IA.');
        } else if (aiErr.message === 'RATE_LIMIT') {
          setError('Limite da API atingido (1.500/dia gratis). Tente amanha.');
        } else {
          setError('Erro ao gerar roteiro: ' + aiErr.message);
        }
      }
    } finally { setLoading(false); }
  }

  var totalDays = itinerary && itinerary.days ? itinerary.days.length : 0;

  return (
    <div className="br-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(178,75,243,0.15)' }}>
          <Sparkles className="w-5 h-5 text-br-purple"/>
        </div>
        <div>
          <h2 className="font-syne font-bold text-lg">Roteiro com IA</h2>
          <p className="text-xs text-gray-600">Google Gemini — 1.500 req/dia gratis</p>
        </div>
      </div>

      {!itinerary && (
        <div className="space-y-5">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Interesses (ate 4)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(function(item) {
                var active = selectedInterests.includes(item.id);
                return (
                  <button key={item.id} type="button" onClick={function() { toggleInterest(item.id); }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={active
                      ? { background: 'rgba(178,75,243,0.15)', borderColor: 'rgba(178,75,243,0.4)', color: '#B24BF3' }
                      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#6B7280' }
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Perfil de orcamento</label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGETS.map(function(b) {
                return (
                  <button key={b.id} type="button" onClick={function() { setBudget(b.id); }}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={budget === b.id
                      ? { background: 'rgba(57,255,20,0.08)', borderColor: 'rgba(57,255,20,0.3)' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }
                    }
                  >
                    <p className="font-syne font-bold text-xs" style={{ color: budget === b.id ? '#39FF14' : '#fff' }}>{b.label}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{b.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl text-xs text-gray-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-white font-medium">{destination || 'Defina um destino acima'}</span>
            {' · '}{days || 1} dia(s) · {passengers || 1} pessoa(s)
            {' · '}<span style={{ color: '#B24BF3' }}>{selectedInterests.join(', ')}</span>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', color: '#d97706' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/> {error}
            </div>
          )}

          <button type="button" onClick={generate} disabled={loading || !destination}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-syne font-bold text-sm transition-all"
            style={{ background: loading || !destination ? 'rgba(178,75,243,0.3)' : '#B24BF3', color: '#fff', cursor: loading || !destination ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Gerando roteiro...</> : <><Sparkles className="w-4 h-4"/> Gerar Roteiro</>}
          </button>
        </div>
      )}

      {itinerary && (
        <div>
          <div className="rounded-xl p-4 mb-5" style={{ background: 'linear-gradient(135deg,rgba(178,75,243,0.1),rgba(0,212,255,0.08))', border: '1px solid rgba(178,75,243,0.2)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-syne font-extrabold text-lg">{itinerary.destination}</h3>
                <p className="text-gray-400 text-sm mt-1">{itinerary.summary}</p>
              </div>
              {usingAI && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(178,75,243,0.2)', color: '#B24BF3' }}>
                  <Star className="w-3 h-3 fill-current"/> Gemini
                </span>
              )}
            </div>
            {(itinerary.bestPeriod || itinerary.totalBudget) && (
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                {itinerary.bestPeriod && <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/>{itinerary.bestPeriod}</span>}
                {itinerary.totalBudget && <span className="text-br-green font-mono">{itinerary.totalBudget}</span>}
              </div>
            )}
            {error && <p className="text-yellow-600 text-xs mt-2">{error}</p>}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={function() { setActiveDay(function(p) { return Math.max(0, p-1); }); }} disabled={activeDay===0}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)', color: activeDay===0 ? '#374151' : '#9CA3AF' }}>
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
              {itinerary.days.map(function(d, i) {
                return (
                  <button key={i} type="button" onClick={function() { setActiveDay(i); }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-syne font-bold transition-all"
                    style={activeDay===i
                      ? { background: 'rgba(178,75,243,0.15)', color: '#B24BF3', border: '1px solid rgba(178,75,243,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.07)' }
                    }
                  >Dia {d.day}</button>
                );
              })}
            </div>
            <button type="button" onClick={function() { setActiveDay(function(p) { return Math.min(totalDays-1, p+1); }); }} disabled={activeDay===totalDays-1}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)', color: activeDay===totalDays-1 ? '#374151' : '#9CA3AF' }}>
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-600 font-mono">DIA {itinerary.days[activeDay].day}</p>
            <h4 className="font-syne font-bold">{itinerary.days[activeDay].title}</h4>
          </div>

          <DayCard day={itinerary.days[activeDay]}/>

          <button type="button" onClick={function() { setItinerary(null); setError(''); setActiveDay(0); }}
            className="btn-ghost w-full mt-4 text-sm justify-center">
            Gerar novo roteiro
          </button>
        </div>
      )}
    </div>
  );
}
