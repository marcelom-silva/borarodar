'use client';
import { useState } from 'react';
import { generateSurpriseDestinations } from '@/lib/ai';
import { Shuffle, Loader2, MapPin, Clock, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var TYPE_CONFIG = {
  proximo:   { label:'Próximo',  emoji:'🏙️', color:'#39FF14', desc:'Até 3h de viagem' },
  medio:     { label:'Médio',    emoji:'🏔️', color:'#00D4FF', desc:'3 a 6h de viagem' },
  aventura:  { label:'Aventura', emoji:'🌍', color:'#B24BF3', desc:'+6h ou internacional' },
};

function DestCard({ dest, onChoose, t }) {
  var cfg = TYPE_CONFIG[dest.type] || TYPE_CONFIG.medio;
  return (
    <div className="rounded-xl p-4 transition-all hover:-translate-y-0.5"
      style={{background:'rgba(20,20,27,0.9)',border:'1px solid '+cfg.color+'25'}}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{dest.emoji||cfg.emoji}</span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{background:cfg.color+'18',color:cfg.color}}>
              {cfg.label}
            </span>
            <h3 className="font-syne font-bold text-base mt-1 leading-tight">{dest.destination}</h3>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{dest.driveTime}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{dest.distanceKm} km</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-2">{dest.why}</p>
      <p className="text-xs mb-3" style={{color:cfg.color}}>
        ✨ <strong>{dest.highlight}</strong>
      </p>
      {dest.tip && (
        <p className="text-xs text-gray-600 italic mb-3">💡 {dest.tip}</p>
      )}
      <button type="button" onClick={function(){onChoose(dest.destination);}}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-syne font-bold transition-all hover:opacity-80"
        style={{background:cfg.color+'18',color:cfg.color,border:'1px solid '+cfg.color+'30'}}>
        <ArrowRight className="w-3.5 h-3.5"/>
        {t('surprise_choose')}
      </button>
    </div>
  );
}

export default function SurpriseMode({ formValues, onChooseDestination }) {
  var { t } = useLanguage();
  var [open,         setOpen]         = useState(false);
  var [suggestions,  setSuggestions]  = useState(null);
  var [loading,      setLoading]      = useState(false);
  var [error,        setError]        = useState('');

  async function generate() {
    if (!formValues.origem) {
      setError(t('surprise_need_origin'));
      return;
    }
    setLoading(true); setError(''); setSuggestions(null);
    try {
      var result = await generateSurpriseDestinations({
        departure:    formValues.origem,
        budget:       formValues.viagem_style || 'moderado',
        travelProfile:formValues.travel_profile || 'couple',
        dateFrom:     formValues.date_from || '',
      });
      var arr = Array.isArray(result) ? result : (result.destinations || []);
      setSuggestions(arr.slice(0, 3));
    } catch(err) {
      setError(t('common_error')+': '+err.message);
    } finally { setLoading(false); }
  }

  function choose(destination) {
    onChooseDestination(destination);
    setOpen(false);
    setSuggestions(null);
  }

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <button type="button" onClick={function(){setOpen(!open); if(!open&&!suggestions)generate();}}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border"
        style={open
          ? {background:'rgba(178,75,243,0.12)',borderColor:'rgba(178,75,243,0.35)',color:'#B24BF3'}
          : {background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.08)',color:'#9CA3AF'}
        }>
        <Shuffle className="w-4 h-4"/>
        {open ? t('surprise_title') : t('surprise_toggle')}
        <Sparkles className="w-3.5 h-3.5"/>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-syne font-bold text-sm">{t('surprise_title')}</p>
              <p className="text-xs text-gray-600">{t('surprise_sub')}</p>
            </div>
            {suggestions && (
              <button type="button" onClick={generate} disabled={loading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{background:'rgba(178,75,243,0.1)',color:'#B24BF3',border:'1px solid rgba(178,75,243,0.25)'}}>
                <RefreshCw className="w-3 h-3"/>
                {t('surprise_new')}
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-br-purple"/>
              {t('surprise_loading')}
            </div>
          )}

          {error && (
            <div className="text-xs text-br-orange p-3 rounded-xl"
              style={{background:'rgba(255,107,53,0.08)',border:'1px solid rgba(255,107,53,0.2)'}}>
              {error}
            </div>
          )}

          {suggestions && !loading && (
            <div className="grid grid-cols-1 gap-3">
              {suggestions.map(function(dest, i) {
                return <DestCard key={i} dest={dest} onChoose={choose} t={t}/>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
