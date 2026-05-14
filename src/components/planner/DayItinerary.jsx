'use client';
import { useState } from 'react';
import { generateItinerary, mapsLink, bookingLink, gygLink } from '@/lib/ai';
import { generateStaticItinerary } from '@/lib/itinerary';
import DayTripMap from '@/components/ui/DayTripMap';
import { Sparkles, Coffee, Sun, Moon, Bed, Lightbulb, Calendar, ChevronLeft, ChevronRight, Loader2, AlertCircle, Star, ExternalLink, Map, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var INTERESTS = [
  {id:'gastronomia',label:'Gastronomia'},{id:'natureza',label:'Natureza'},
  {id:'historia',label:'Historia'},{id:'aventura',label:'Aventura'},
  {id:'cultura',label:'Cultura'},{id:'praia',label:'Praia'},
  {id:'compras',label:'Compras'},{id:'relax',label:'Relax'},
];

// Geocodifica um local via Nominatim
async function geocodePlace(name, destination) {
  try {
    var q   = name + ', ' + destination;
    var url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q:q, format:'json', limit:'1' }).toString();
    var res = await fetch(url, { headers:{'Accept-Language':'pt-BR','User-Agent':'BoraRodar/1.0'} });
    var data= await res.json();
    if (data[0]) return { lat:parseFloat(data[0].lat), lng:parseFloat(data[0].lon) };
  } catch(_) {}
  return null;
}

// Monta URL multi-parada do Google Maps
function buildGoogleMapsRoute(points, destination) {
  var stops = points.map(function(p) { return encodeURIComponent(p.name + ', ' + destination); });
  return 'https://www.google.com/maps/dir/' + stops.join('/');
}

function ExtLink({ href, label, icon, color }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80 active:scale-95"
      style={{ background:color+'18', color:color, border:'1px solid '+color+'25' }}>
      {icon && <span>{icon}</span>}
      {label}
      <ExternalLink className="w-2.5 h-2.5 opacity-70"/>
    </a>
  );
}

function extractPlaceName(text) {
  if (!text) return '';
  return text.split('—')[0].split(' - ')[0].trim();
}

function MealRow({ label, meal, t }) {
  var desc  = typeof meal==='string' ? meal : (meal&&meal.description)||'';
  var place = typeof meal==='object'&&meal ? meal.placeName : extractPlaceName(desc);
  var query = typeof meal==='object'&&meal ? meal.mapQuery  : place;
  return (
    <div className="mt-1.5">
      <p className="text-xs text-gray-600 mb-0.5">{label}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      {place && (
        <div className="mt-1.5">
          <ExtLink href={mapsLink(query||place)} label={t('link_maps')} icon="🗺️" color="#39FF14"/>
        </div>
      )}
    </div>
  );
}

function AttractionLinks({ attractions, color, t }) {
  if (!attractions||!attractions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {attractions.map(function(a,i) { return <ExtLink key={i} href={mapsLink(a.mapQuery||a.name)} label={a.name} icon="📍" color={color}/>; })}
    </div>
  );
}

// Card de um dia — agora com mini-mapa e botao Maps
function DayCard({ day, destination, t }) {
  var [showMap,   setShowMap]   = useState(false);
  var [mapPoints, setMapPoints] = useState(null);
  var [geocoding, setGeocoding] = useState(false);

  var accom     = day.accommodation;
  var accomDesc = typeof accom==='string' ? accom : (accom&&accom.description)||'';
  var accomMap  = typeof accom==='object'&&accom ? accom.mapQuery   : null;
  var accomBook = typeof accom==='object'&&accom ? accom.bookingQuery: destination;

  // Coleta todas as atracoes do dia
  function getAllAttractions() {
    var all = [];
    if (day.morningAttractions)   all = all.concat(day.morningAttractions);
    if (day.afternoonAttractions) all = all.concat(day.afternoonAttractions);
    if (day.meals) {
      ['breakfast','lunch','dinner'].forEach(function(m) {
        if (day.meals[m] && day.meals[m].placeName) all.push({ name:day.meals[m].placeName, mapQuery:day.meals[m].mapQuery });
      });
    }
    return all.filter(function(a,i,arr) { return arr.findIndex(function(b){return b.name===a.name;})===i; });
  }

  async function handleShowMap() {
    if (showMap) { setShowMap(false); return; }
    if (mapPoints) { setShowMap(true); return; }

    var attractions = getAllAttractions();
    if (!attractions.length) { setShowMap(true); return; }

    setGeocoding(true);
    try {
      var results = await Promise.all(attractions.map(async function(a) {
        var query = a.mapQuery || (a.name + ', ' + destination);
        var coords= await geocodePlace(query, destination);
        return coords ? Object.assign({}, coords, { name: a.name }) : null;
      }));
      var valid = results.filter(Boolean);
      setMapPoints(valid);
      setShowMap(true);
    } catch(_) {
      setShowMap(true);
    } finally {
      setGeocoding(false);
    }
  }

  var allAttractions = getAllAttractions();
  var mapsUrl = mapPoints && mapPoints.length > 1 ? buildGoogleMapsRoute(mapPoints, destination) : null;

  return (
    <div className="space-y-3">
      {/* Barra de acoes do dia */}
      {allAttractions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl" style={{background:'rgba(57,255,20,0.04)',border:'1px solid rgba(57,255,20,0.12)'}}>
          <Map className="w-3.5 h-3.5 text-br-green flex-shrink-0"/>
          <span className="text-xs text-gray-400 flex-1">{allAttractions.length} {t('daytrip_stops')} {t('daytrip_this_day')}</span>
          <button
            type="button"
            onClick={handleShowMap}
            disabled={geocoding}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
            style={{background:'rgba(57,255,20,0.12)',color:'#39FF14',border:'1px solid rgba(57,255,20,0.25)'}}>
            {geocoding
              ? <><Loader2 className="w-3 h-3 animate-spin"/>{t('itinerary_geocoding')}</>
              : showMap
              ? <><Map className="w-3 h-3"/>{t('daytrip_hide_map')}</>
              : <><Map className="w-3 h-3"/>{t('itinerary_show_map')}</>
            }
          </button>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all font-medium hover:opacity-80"
              style={{background:'rgba(0,212,255,0.12)',color:'#00D4FF',border:'1px solid rgba(0,212,255,0.25)'}}>
              <Navigation className="w-3 h-3"/>
              {t('itinerary_open_day_maps')}
              <ExternalLink className="w-2.5 h-2.5"/>
            </a>
          )}
        </div>
      )}

      {/* Mini-mapa do dia */}
      {showMap && (
        <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(57,255,20,0.2)'}}>
          {mapPoints && mapPoints.length > 0
            ? <DayTripMap points={mapPoints} height={240} accentColor="#39FF14"/>
            : (
              <div className="flex items-center justify-center rounded-xl text-gray-500 text-xs" style={{height:'80px',background:'rgba(255,255,255,0.03)'}}>
                Sem coordenadas disponiveis para este dia.
              </div>
            )
          }
        </div>
      )}

      {/* Manha */}
      <div className="flex gap-3 p-4 rounded-xl" style={{background:'rgba(234,179,8,0.05)',border:'1px solid rgba(234,179,8,0.1)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(234,179,8,0.12)'}}>
          <Coffee className="w-4 h-4 text-yellow-400"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-yellow-400 font-mono uppercase tracking-wide mb-1">{t('itinerary_morning_label')}</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.morning}</p>
          <AttractionLinks attractions={day.morningAttractions} color="#FBBF24" t={t}/>
          {day.meals && <MealRow label={'☕ '+t('itinerary_breakfast')} meal={day.meals.breakfast} t={t}/>}
        </div>
      </div>

      {/* Tarde */}
      <div className="flex gap-3 p-4 rounded-xl" style={{background:'rgba(255,107,53,0.05)',border:'1px solid rgba(255,107,53,0.1)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(255,107,53,0.12)'}}>
          <Sun className="w-4 h-4 text-br-orange"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-br-orange font-mono uppercase tracking-wide mb-1">{t('itinerary_afternoon_label')}</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.afternoon}</p>
          <AttractionLinks attractions={day.afternoonAttractions} color="#FF6B35" t={t}/>
          {day.meals && <MealRow label={'🍽️ '+t('itinerary_lunch')} meal={day.meals.lunch} t={t}/>}
        </div>
      </div>

      {/* Noite */}
      <div className="flex gap-3 p-4 rounded-xl" style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)'}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(0,212,255,0.12)'}}>
          <Moon className="w-4 h-4 text-br-blue"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-br-blue font-mono uppercase tracking-wide mb-1">{t('itinerary_evening_label')}</p>
          <p className="text-sm text-gray-300 leading-relaxed">{day.evening}</p>
          {day.meals && <MealRow label={'🌙 '+t('itinerary_dinner')} meal={day.meals.dinner} t={t}/>}
        </div>
      </div>

      {/* Hospedagem */}
      {accomDesc && (
        <div className="flex gap-3 p-3 rounded-xl" style={{background:'rgba(178,75,243,0.05)',border:'1px solid rgba(178,75,243,0.1)'}}>
          <Bed className="w-4 h-4 text-br-purple flex-shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-br-purple font-medium">{t('itinerary_accommodation_prefix')}: </span>{accomDesc}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {accomMap  && <ExtLink href={mapsLink(accomMap)}     label={t('link_maps')}      icon="🗺️" color="#B24BF3"/>}
              {accomBook && <ExtLink href={bookingLink(accomBook)} label="Booking.com"          icon="🏨" color="#00D4FF"/>}
              {destination && <ExtLink href={gygLink(destination)} label={t('link_activities')} icon="🎯" color="#FF6B35"/>}
            </div>
          </div>
        </div>
      )}

      {/* Dica local */}
      {day.tip && (
        <div className="flex gap-3 p-3 rounded-xl" style={{background:'rgba(57,255,20,0.05)',border:'1px solid rgba(57,255,20,0.12)'}}>
          <Lightbulb className="w-4 h-4 text-br-green flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-gray-400">
            <span className="text-br-green font-medium">{t('itinerary_tip_prefix')}: </span>{day.tip}
          </p>
        </div>
      )}

      <p className="text-[10px] text-gray-700 flex items-center gap-1">
        <ExternalLink className="w-2.5 h-2.5"/> {t('itinerary_external_note')}
      </p>
    </div>
  );
}

export default function DayItinerary({ destination, days, passengers, travelStyle, travelDate, travelProfile }) {
  var { t } = useLanguage();
  var [selectedInterests, setSelectedInterests] = useState(['gastronomia','natureza']);
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
        destination, days:days||1, passengers:passengers||1,
        interests:selectedInterests, budget:travelStyle||'moderado',
        travelDate, travelProfile:travelProfile||'couple',
      });
      setItinerary(result); setUsingAI(true);
    } catch(aiErr) {
      var staticResult = generateStaticItinerary({ destination, days:days||1 });
      if (staticResult) {
        setItinerary(staticResult);
        if(aiErr.message==='GEMINI_KEY_MISSING') setError('Configure NEXT_PUBLIC_GEMINI_API_KEY para roteiros personalizados.');
      } else {
        if(aiErr.message==='GEMINI_KEY_MISSING') setError('Configure a chave Gemini em .env.local.');
        else if(aiErr.message==='RATE_LIMIT')    setError('Limite da API atingido (1.500/dia). Tente amanha.');
        else setError('Erro ao gerar: '+aiErr.message);
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
        <div className="space-y-4">
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
          <div className="rounded-xl p-4 mb-5" style={{background:'linear-gradient(135deg,rgba(178,75,243,0.1),rgba(0,212,255,0.08))',border:'1px solid rgba(178,75,243,0.2)'}}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-syne font-extrabold text-lg">{itinerary.destination}</h3>
                <p className="text-gray-400 text-sm mt-1">{itinerary.summary}</p>
              </div>
              {usingAI && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{background:'rgba(178,75,243,0.2)',color:'#B24BF3'}}>
                  <Star className="w-3 h-3 fill-current"/> Gemini
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              {itinerary.bestPeriod  && <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/>{itinerary.bestPeriod}</span>}
              {itinerary.totalBudget && <span className="text-br-green font-mono">{itinerary.totalBudget}</span>}
            </div>
            {error && <p className="text-yellow-600 text-xs mt-2">{error}</p>}
          </div>

          {/* Navegacao dias */}
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={function(){setActiveDay(function(p){return Math.max(0,p-1);});}} disabled={activeDay===0}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{border:'1px solid rgba(255,255,255,0.1)',color:activeDay===0?'#374151':'#9CA3AF'}}>
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
              {itinerary.days.map(function(d,i){
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
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{border:'1px solid rgba(255,255,255,0.1)',color:activeDay===totalDays-1?'#374151':'#9CA3AF'}}>
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-600 font-mono">{t('itinerary_day').toUpperCase()} {itinerary.days[activeDay].day}</p>
            <h4 className="font-syne font-bold">{itinerary.days[activeDay].title}</h4>
          </div>

          <DayCard key={activeDay} day={itinerary.days[activeDay]} destination={itinerary.destination} t={t}/>

          <button type="button" onClick={function(){setItinerary(null);setError('');setActiveDay(0);}}
            className="btn-ghost w-full mt-4 text-sm justify-center">
            {t('itinerary_new')}
          </button>
        </div>
      )}
    </div>
  );
}
