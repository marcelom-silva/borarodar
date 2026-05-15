'use client';
import { useState, useEffect } from 'react';
import { Cloud, Loader2, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// Converte codigo de condicao em emoji
function weatherEmoji(icon) {
  if (!icon) return '🌤️';
  var code = icon.replace('d','').replace('n','');
  var map  = {'01':'☀️','02':'⛅','03':'🌥️','04':'☁️','09':'🌧️','10':'🌦️','11':'⛈️','13':'❄️','50':'🌫️'};
  return map[code] || '🌤️';
}

// Busca coordenadas da cidade via Nominatim (ja usamos no projeto)
async function geocodeCity(city) {
  var res  = await fetch('https://nominatim.openstreetmap.org/search?'+new URLSearchParams({q:city,format:'json',limit:'1'}).toString(),{headers:{'User-Agent':'BoraRodar/1.0','Accept-Language':'pt-BR'}});
  var data = await res.json();
  if (data[0]) return {lat:parseFloat(data[0].lat), lon:parseFloat(data[0].lon)};
  return null;
}

// Busca previsao via OpenWeatherMap
async function fetchForecast(lat, lon) {
  var res  = await fetch('https://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+OWM_KEY+'&units=metric&lang=pt_br&cnt=40');
  if (!res.ok) throw new Error('OWM_ERROR_'+res.status);
  return res.json();
}

// Agrupa forecast por dia (pega max/min de cada dia)
function groupByDay(list) {
  var days = {};
  list.forEach(function(item) {
    var day = item.dt_txt.split(' ')[0];
    if (!days[day]) days[day] = {temps:[], icons:[], desc:'', humidity:[], wind:[]};
    days[day].temps.push(item.main.temp_max, item.main.temp_min);
    days[day].icons.push(item.weather[0].icon);
    days[day].desc = item.weather[0].description;
    days[day].humidity.push(item.main.humidity);
    days[day].wind.push(item.wind.speed);
  });
  return Object.entries(days).slice(0, 5).map(function([date, d]) {
    return {
      date,
      max:   Math.round(Math.max.apply(null, d.temps)),
      min:   Math.round(Math.min.apply(null, d.temps)),
      icon:  d.icons[Math.floor(d.icons.length/2)],
      desc:  d.desc,
      humidity: Math.round(d.humidity.reduce(function(a,b){return a+b;},0)/d.humidity.length),
      wind:  Math.round(d.wind.reduce(function(a,b){return a+b;},0)/d.wind.length * 3.6),
    };
  });
}

function ForecastDay({ day }) {
  var dt    = new Date(day.date+'T12:00:00');
  var label = dt.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'});
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl flex-1 min-w-0"
      style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
      <p className="text-[10px] text-gray-600 font-mono text-center">{label}</p>
      <span className="text-2xl">{weatherEmoji(day.icon)}</span>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{day.max}°</p>
        <p className="text-xs text-gray-600">{day.min}°</p>
      </div>
      <p className="text-[9px] text-gray-600 text-center leading-tight capitalize">{day.desc}</p>
      <div className="flex items-center gap-1 text-[9px] text-gray-700">
        <Droplets className="w-2.5 h-2.5"/>{day.humidity}%
      </div>
    </div>
  );
}

export default function WeatherWidget({ destination, dateFrom }) {
  var { t } = useLanguage();
  var [forecast, setForecast] = useState(null);
  var [loading,  setLoading]  = useState(false);
  var [error,    setError]    = useState('');

  useEffect(function() {
    if (!destination||destination.length<3) return;
    if (!OWM_KEY) { setError('no_key'); return; }

    var timer = setTimeout(function() {
      setLoading(true); setError(''); setForecast(null);
      geocodeCity(destination)
        .then(function(coords) {
          if (!coords) throw new Error('Cidade não encontrada');
          return fetchForecast(coords.lat, coords.lon);
        })
        .then(function(data) {
          setForecast(groupByDay(data.list));
        })
        .catch(function(err) {
          setError(err.message);
        })
        .finally(function() { setLoading(false); });
    }, 800);

    return function() { clearTimeout(timer); };
  }, [destination]);

  if (!OWM_KEY) return (
    <div className="flex items-start gap-2 p-3 rounded-xl text-xs mt-2"
      style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.15)'}}>
      <AlertCircle className="w-4 h-4 text-br-blue flex-shrink-0 mt-0.5"/>
      <p className="text-gray-500">{t('weather_no_key')}</p>
    </div>
  );

  if (!destination||destination.length<3) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{border:'1px solid rgba(0,212,255,0.15)'}}>
      <div className="flex items-center gap-2 px-4 py-2.5"
        style={{background:'rgba(0,212,255,0.08)'}}>
        <Cloud className="w-4 h-4 text-br-blue"/>
        <span className="font-syne font-bold text-xs text-br-blue">{t('weather_forecast')}</span>
        <span className="text-xs text-gray-600 ml-auto">{destination.split(',')[0]}</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-br-blue"/>
          {t('weather_loading')}
        </div>
      )}

      {error && !loading && (
        <div className="p-3 text-xs text-gray-600 text-center">{t('weather_error')}</div>
      )}

      {forecast && !loading && (
        <div className="p-3 flex gap-2 overflow-x-auto">
          {forecast.map(function(day,i) { return <ForecastDay key={i} day={day}/>; })}
        </div>
      )}
    </div>
  );
}
