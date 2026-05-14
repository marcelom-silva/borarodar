'use client';
import { useState } from 'react';
import { generateItinerary } from '@/lib/ai';
import { mapsLink, bookingLink, gygLink } from '@/lib/ai';
import { generateStaticItinerary } from '@/lib/itinerary';
import { Sparkles, Coffee, Sun, Moon, Utensils, Bed, Lightbulb, Calendar, ChevronLeft, ChevronRight, Loader2, AlertCircle, Star, ExternalLink, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var INTERESTS = [
  {id:'gastronomia',label:'Gastronomia'},{id:'natureza',label:'Natureza'},
  {id:'historia',label:'Historia'},{id:'aventura',label:'Aventura'},
  {id:'cultura',label:'Cultura'},{id:'praia',label:'Praia'},
  {id:'compras',label:'Compras'},{id:'relax',label:'Relax'},
];
var BUDGETS = [
  {id:'economico',label:'Economico',desc:'Hostel, lanchonetes'},
  {id:'moderado',label:'Moderado',desc:'Pousadas, restaurantes'},
  {id:'esbanjando',label:'Esbanjando',desc:'Hoteis, fine dining'},
];

// Botao de link externo com aviso
function ExtLink({ href, label, icon, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Abre em nova aba"
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80 active:scale-95"
      style={{background:color+'18', color:color, border:'1px solid '+color+'25'}}
    >
      {icon && <span>{icon}</span>}
      {label}
      <ExternalLink className="w-2.5 h-2.5 opacity-70"/>
    </a>
  );
}

// Extrai nome do lugar de uma string de texto (compatibilidade com formato antigo)
function extractPlaceName(text) {
  if (!text) return '';
  return text.split('—')[0].split(' - ')[0].split(':')[1]?.trim() || text.split(',')[0].trim();
}

// Renderiza um campo de refeicao (suporta formato novo {description, placeName, mapQuery} e antigo string)
function MealRow({ label, meal, color }) {
  var desc    = typeof meal === 'string' ? meal : (meal && meal.description) || '';
  var place   = typeof meal === 'object' && meal ? meal.placeName : null;
  var query   = typeof meal === 'object' && meal ? meal.mapQuery  : null;

  // Tenta extrair nome do lugar se formato antigo
  if (!place && desc) place = extractPlaceName(desc);

  return (
    <div className="mt-1.5">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      {place && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <ExtLink href={mapsLink(query || place)} label="Ver no Maps" icon="🗺️" color="#39FF14"/>
        </div>
      )}
    </div>
  );
}

// Renderiza atracoes com links
function AttractionLinks({ attractions, color }) {
  if (!attractions || !attractions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {attractions.map(function(a, i) {
        return (
          <ExtLink key={i} href={mapsLink(a.mapQuery || a.name)} label={a.name} icon="📍" color={color}/>
        );
      })}
    </div>
  );
}

// Card de um dia
function DayCard({ day, destination }) {
  var accom = day.accommodation;
  var accomDesc  = typeof accom==='string' ? accom : (accom&&accom.description)||'';
  var accomPlace = typeof accom==='object' && accom ? accom.placeName : null;
  var accomMap   = typeof accom==='object' && accom ? accom.mapQuery  : null;
  var accomBook  = typeof accom==='object' && accom ? accom.bookingQuery : destination;

  return (
    <div className="space-y-3">
      {/* Manha */}
      <div className="flex gap-3 p-4 rounded-xl" style={{background:'rgba(234,179,8,0.05)',border:'1px solid rgba(234,179,8,0.1)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(234,179,8,0.12)'}}>
          <Coffee className="w-4 h-4 text-yellow-400"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-yellow-400 font-mono uppercase tracking-wide mb-1">Manha</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.morning}</p>
          <AttractionLinks attractions={day.morningAttractions} color="#FBBF24"/>
          {day.meals&&<MealRow label="☕ Cafe da manha" meal={day.meals.breakfast} color="#FBBF24"/>}
        </div>
      </div>

      {/* Tarde */}
      <div className="flex gap-3 p-4 rounded-xl" style={{background:'rgba(255,107,53,0.05)',border:'1px solid rgba(255,107,53,0.1)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(255,107,53,0.12)'}}>
          <Sun className="w-4 h-4 text-br-orange"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-br-orange font-mono uppercase tracking-wide mb-1">Tarde</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.afternoon}</p>
          <AttractionLinks attractions={day.afternoonAttractions} color="#FF6B35"/>
          {day.meals&&<MealRow label="🍽️ Almoco" meal={day.meals.lunch} color="#FF6B35"/>}
        </div>
      </div>

      {/* Noite */}
      <div className="flex gap-3 p-4 rounded-xl" style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(0,212,255,0.12)'}}>
          <Moon className="w-4 h-4 text-br-blue"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-br-blue font-mono uppercase tracking-wide mb-1">Noite</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.evening}</p>
          {day.meals&&<MealRow label="🌙 Jantar" meal={day.meals.dinner} color="#00D4FF"/>}
        </div>
      </div>

      {/* Hospedagem */}
      {accomDesc && (
        <div className="flex gap-3 p-3 rounded-xl" style={{background:'rgba(178,75,243,0.05)',border:'1px solid rgba(178,75,243,0.1)'}}>
          <Bed className="w-4 h-4 text-br-purple flex-shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-br-purple font-medium">Hospedagem: </span>{accomDesc}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {accomMap  && <ExtLink href={mapsLink(accomMap)}          label={accomPlace||'Ver no Maps'} icon="🗺️" color="#B24BF3"/>}
              {accomBook && <ExtLink href={bookingLink(accomBook)}       label="Booking.com"               icon="🏨" color="#00D4FF"/>}
              {destination && <ExtLink href={gygLink(destination)}       label="Atividades"                icon="🎯" color="#FF6B35"/>}
            </div>
          </div>
        </div>
      )}

      {/* Dica local */}
      {day.tip && (
        <div className="flex gap-3 p-3 rounded-xl" style={{background:'rgba(57,255,20,0.05)',border:'1px solid rgba(57,255,20,0.12)'}}>
          <Lightbulb className="w-4 h-4 text-br-green flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-gray-400"><span className="text-br-green font-medium">Dica local: </span>{day.tip}</p>
        </div>
      )}

      {/* Aviso de links externos */}
      <p className="text-[10px] text-gray-700 flex items-center gap-1">
        <ExternalLink className="w-2.5 h-2.5"/> Os links acima abrem em nova aba, fora do BoraRodar.
      </p>
    </div>
  );
}

export default function DayItinerary({ destination, days, passengers, travelStyle, travelDate }) {
  var { t } = useLanguage();
  var [selectedInterests, setSelectedInterests] = useState(['gastronomia','natureza']);
  var [budget,     setBudget]     = useState(travelStyle||'moderado');
  var [itinerary,  setItinerary]  = useState(null);
  var [loading,    setLoading]    = useState(false);
  var [error,      setError]      = useState('');
  var [activeDay,  setActiveDay]  = useState(0);
  var [usingAI,    setUsingAI]    = useState(false);

  function toggleInterest(id) {
    setSelectedInterests(function(prev) {
      if(prev.includes(id)) return prev.filter(function(x){return x!==id;});
      if(prev.length>=4)    return prev;
      return prev.concat([id]);
    });
  }

  async function generate() {
    if (!destination) { setError(t('itinerary_no_dest')); return; }
    setLoading(true); setError(''); setItinerary(null); setUsingAI(false);
    try {
      var result = await generateItinerary({
        destination: destination, days: days||1, passengers: passengers||1,
        interests: selectedInterests, budget: budget, travelDate: travelDate,
      });
      setItinerary(result); setUsingAI(true);
    } catch(aiErr) {
      var staticResult = generateStaticItinerary({ destination: destination, days: days||1 });
      if (staticResult) {
        setItinerary(staticResult);
        if(aiErr.message==='GEMINI_KEY_MISSING') setError('Roteiro base exibido. Configure NEXT_PUBLIC_GEMINI_API_KEY para roteiros personalizados com IA.');
      } else {
        if(aiErr.message==='GEMINI_KEY_MISSING') setError('Configure a chave Gemini em .env.local para gerar roteiros com IA.');
        else if(aiErr.message==='RATE_LIMIT') setError('Limite da API atingido (1.500/dia gratis). Tente amanha.');
        else setError('Erro ao gerar roteiro: '+aiErr.message);
      }
    } finally { setLoading(false); }
  }

  var totalDays = itinerary&&itinerary.days ? itinerary.days.length : 0;

  return (
    <div className="br-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(178,75,243,0.15)'}}>
          <Sparkles className="w-5 h-5 text-br-purple"/>
        </div>
        <div>
          <h2 className="font-syne font-bold text-lg">{t('itinerary_title')}</h2>
          <p className="text-xs text-gray-600">{t('itinerary_sub')}</p>
        </div>
      </div>

      {!itinerary && (
        <div className="space-y-5">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">{t('itinerary_interests')}</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(function(item) {
                var active=selectedInterests.includes(item.id);
                return (
                  <button key={item.id} type="button" onClick={function(){toggleInterest(item.id);}}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={active?{background:'rgba(178,75,243,0.15)',borderColor:'rgba(178,75,243,0.4)',color:'#B24BF3'}:{background:'rgba(255,255,255,0.04)',borderColor:'rgba(255,255,255,0.08)',color:'#6B7280'}}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">{t('itinerary_budget')}</label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGETS.map(function(b) {
                return (
                  <button key={b.id} type="button" onClick={function(){setBudget(b.id);}}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={budget===b.id?{background:'rgba(57,255,20,0.08)',borderColor:'rgba(57,255,20,0.3)'}:{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.07)'}}>
                    <p className="font-syne font-bold text-xs" style={{color:budget===b.id?'#39FF14':'#fff'}}>{b.label}</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">{b.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{background:'rgba(234,179,8,0.08)',border:'1px solid rgba(234,179,8,0.2)',color:'#d97706'}}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>{error}
            </div>
          )}

          <button type="button" onClick={generate} disabled={loading||!destination}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-syne font-bold text-sm transition-all"
            style={{background:loading||!destination?'rgba(178,75,243,0.3)':'#B24BF3',color:'#fff',cursor:loading||!destination?'not-allowed':'pointer'}}>
            {loading?<><Loader2 className="w-4 h-4 animate-spin"/>{t('itinerary_loading')}</>:<><Sparkles className="w-4 h-4"/>{t('itinerary_btn')}</>}
          </button>
        </div>
      )}

      {itinerary && (
        <div>
          {/* Header */}
          <div className="rounded-xl p-4 mb-5" style={{background:'linear-gradient(135deg,rgba(178,75,243,0.1),rgba(0,212,255,0.08))',border:'1px solid rgba(178,75,243,0.2)'}}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-syne font-extrabold text-lg">{itinerary.destination}</h3>
                <p className="text-gray-400 text-sm mt-1">{itinerary.summary}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {usingAI && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{background:'rgba(178,75,243,0.2)',color:'#B24BF3'}}><Star className="w-3 h-3 fill-current"/> Gemini</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              {itinerary.bestPeriod&&<span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/>{itinerary.bestPeriod}</span>}
              {itinerary.totalBudget&&<span className="text-br-green font-mono">{itinerary.totalBudget}</span>}
            </div>
            {error&&<p className="text-yellow-600 text-xs mt-2">{error}</p>}
          </div>

          {/* Navegacao de dias */}
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={function(){setActiveDay(function(p){return Math.max(0,p-1);});}} disabled={activeDay===0}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{border:'1px solid rgba(255,255,255,0.1)',color:activeDay===0?'#374151':'#9CA3AF'}}>
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
              {itinerary.days.map(function(d,i) {
                return (
                  <button key={i} type="button" onClick={function(){setActiveDay(i);}}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-syne font-bold transition-all"
                    style={activeDay===i?{background:'rgba(178,75,243,0.15)',color:'#B24BF3',border:'1px solid rgba(178,75,243,0.3)'}:{background:'rgba(255,255,255,0.04)',color:'#6B7280',border:'1px solid rgba(255,255,255,0.07)'}}>
                    {t('itinerary_day')} {d.day}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={function(){setActiveDay(function(p){return Math.min(totalDays-1,p+1);});}} disabled={activeDay===totalDays-1}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{border:'1px solid rgba(255,255,255,0.1)',color:activeDay===totalDays-1?'#374151':'#9CA3AF'}}>
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-600 font-mono">{t('itinerary_day').toUpperCase()} {itinerary.days[activeDay].day}</p>
            <h4 className="font-syne font-bold">{itinerary.days[activeDay].title}</h4>
          </div>

          <DayCard day={itinerary.days[activeDay]} destination={itinerary.destination}/>

          <button type="button" onClick={function(){setItinerary(null);setError('');setActiveDay(0);}} className="btn-ghost w-full mt-4 text-sm justify-center">
            {t('itinerary_new')}
          </button>
        </div>
      )}
    </div>
  );
}
