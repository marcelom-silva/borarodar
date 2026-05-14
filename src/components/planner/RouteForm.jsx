'use client';
import { Fuel, Users, Moon, Loader2, Car, Plus, X, RotateCcw, CalendarRange, AlertTriangle } from 'lucide-react';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import VehicleSelect from '@/components/planner/VehicleSelect';
import { getSeasonalTips } from '@/lib/budget';
import { useLanguage } from '@/contexts/LanguageContext';

var FUEL_TYPES = [
  { value:'gasolina',      label:'Gasolina'        },
  { value:'etanol',        label:'Etanol'          },
  { value:'diesel',        label:'Diesel'          },
  { value:'flex_gasolina', label:'Flex (gasolina)' },
  { value:'flex_etanol',   label:'Flex (etanol)'   },
];

var TRAVEL_STYLES = [
  { id:'economico',  emoji:'💰', color:'#39FF14' },
  { id:'moderado',   emoji:'⚖️', color:'#00D4FF' },
  { id:'esbanjando', emoji:'✨', color:'#FF6B35' },
];

export default function RouteForm({ values, onChange, onCalculate, loading }) {
  var { t } = useLanguage();

  // Modo de planejamento: 'completo' ou 'roteiro'
  var isItineraryOnly = (values.plan_mode || 'completo') === 'roteiro';

  function set(k, v) { onChange(function(prev) { return Object.assign({}, prev, { [k]: v }); }); }
  function handle(e) { set(e.target.name, e.target.value); }
  function submit(e) { e.preventDefault(); onCalculate(values); }

  function addWaypoint()     { set('waypoints', (values.waypoints || []).concat([{ name:'', coords:null }])); }
  function removeWaypoint(i) { set('waypoints', (values.waypoints || []).filter(function(_, idx) { return idx !== i; })); }
  function updateWaypoint(i, name) {
    var wps = (values.waypoints || []).slice();
    wps[i]  = Object.assign({}, wps[i], { name: name });
    set('waypoints', wps);
  }

  // Dicas sazonais baseadas em date_from
  var seasonalTips = [];
  if (values.date_from) {
    var month = new Date(values.date_from + '-01').getMonth();
    seasonalTips = getSeasonalTips(month, values.interests || []);
  }

  var isRoundTrip = values.is_round_trip || false;
  var avoidTolls  = values.avoid_tolls   || false;
  var style       = values.viagem_style  || 'moderado';

  return (
    <form onSubmit={submit} className="br-card p-5 space-y-5">
      <h2 className="font-syne font-bold text-lg">{t('planner_title')}</h2>

      {/* ===== MODO ===== */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { id:'completo', label:t('mode_complete'),   desc:t('mode_complete_desc')   },
          { id:'roteiro',  label:t('mode_itinerary'),  desc:t('mode_itinerary_desc')  },
        ].map(function(m) {
          var active = (values.plan_mode || 'completo') === m.id;
          return (
            <button key={m.id} type="button" onClick={function() { set('plan_mode', m.id); }}
              className="p-3 rounded-xl border text-left transition-all"
              style={active
                ? { background:'rgba(57,255,20,0.08)', borderColor:'rgba(57,255,20,0.35)' }
                : { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }
              }>
              <p className="font-syne font-bold text-xs" style={{ color: active ? '#39FF14' : '#fff' }}>{m.label}</p>
              <p className="text-gray-600 text-[10px] mt-0.5 leading-tight">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ===== ORIGEM ===== */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_origem')}</label>
        <CityAutocomplete value={values.origem} onChange={function(v) { set('origem', v); }} placeholder="Ex: Brasilia, DF" iconColor="#39FF14" required/>
      </div>

      {/* ===== WAYPOINTS ===== */}
      {(values.waypoints || []).map(function(wp, i) {
        return (
          <div key={i}>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_stop')} {i+1}</label>
            <div className="relative">
              <CityAutocomplete value={wp.name} onChange={function(v) { updateWaypoint(i, v); }} placeholder="Ex: Belo Horizonte, MG" iconColor="#FF6B35"/>
              <button type="button" onClick={function() { removeWaypoint(i); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-gray-600 hover:text-red-400 transition-colors bg-[#141414] rounded-md p-1">
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>
        );
      })}
      {(values.waypoints || []).length < 4 && (
        <button type="button" onClick={addWaypoint}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/12 text-gray-500 hover:text-br-orange hover:border-br-orange/30 transition-all text-xs">
          <Plus className="w-3.5 h-3.5"/>{t('planner_add_wp')}
        </button>
      )}

      {/* ===== DESTINO ===== */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_destino')}</label>
        <CityAutocomplete value={values.destino} onChange={function(v) { set('destino', v); }} placeholder="Ex: Campos do Jordao, SP" iconColor="#FF6B35" required/>
      </div>

      {/* ===== IDA E VOLTA + PEDAGIOS (apenas planejamento completo) ===== */}
      {!isItineraryOnly && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none"
              style={isRoundTrip
                ? { background:'rgba(0,212,255,0.08)', borderColor:'rgba(0,212,255,0.3)' }
                : { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }
              }>
              <input type="checkbox" className="sr-only" checked={isRoundTrip} onChange={function(e) { set('is_round_trip', e.target.checked); }}/>
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center" style={{ background: isRoundTrip ? '#00D4FF' : 'rgba(255,255,255,0.1)' }}>
                {isRoundTrip && <RotateCcw className="w-2.5 h-2.5 text-black"/>}
              </div>
              <span className="text-xs font-medium" style={{ color: isRoundTrip ? '#00D4FF' : '#9CA3AF' }}>{t('trip_roundtrip')}</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none"
              style={avoidTolls
                ? { background:'rgba(255,107,53,0.08)', borderColor:'rgba(255,107,53,0.3)' }
                : { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }
              }>
              <input type="checkbox" className="sr-only" checked={avoidTolls} onChange={function(e) { set('avoid_tolls', e.target.checked); }}/>
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center" style={{ background: avoidTolls ? '#FF6B35' : 'rgba(255,255,255,0.1)' }}>
                {avoidTolls && <X className="w-2.5 h-2.5 text-black"/>}
              </div>
              <span className="text-xs font-medium" style={{ color: avoidTolls ? '#FF6B35' : '#9CA3AF' }}>{t('avoid_tolls')}</span>
            </label>
          </div>

          {avoidTolls && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background:'rgba(255,107,53,0.08)', border:'1px solid rgba(255,107,53,0.2)', color:'#FF6B35' }}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{t('avoid_tolls_note')}
            </div>
          )}

          <hr className="border-white/5"/>

          {/* ===== VEICULO (apenas planejamento completo) ===== */}
          <VehicleSelect values={values} onChange={onChange}/>

          {/* ===== COMBUSTIVEL + KML (apenas planejamento completo) ===== */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_fuel')}</label>
            <div className="relative">
              <Fuel className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{ left:'12px' }}/>
              <select name="combustivel" value={values.combustivel} onChange={handle} className="br-input appearance-none cursor-pointer" style={{ paddingLeft:'2.25rem' }}>
                {FUEL_TYPES.map(function(f) { return <option key={f.value} value={f.value} style={{ background:'#141414' }}>{f.label}</option>; })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_kml')}</label>
              <input name="km_litro" type="number" min="3" max="40" step="0.5" value={values.km_litro}
                onChange={function(e) { handle(e); set('kml_custom', true); }} className="br-input" placeholder="13"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_price')}</label>
              <input name="preco_litro" type="number" min="3" max="15" step="0.01" value={values.preco_litro} onChange={handle} className="br-input" placeholder="5.89"/>
            </div>
          </div>

          <hr className="border-white/5"/>
        </>
      )}

      {/* ===== ESTILO DE VIAGEM (ambos os modos) ===== */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">{t('style_label')}</label>
        <div className="grid grid-cols-3 gap-2">
          {TRAVEL_STYLES.map(function(s) {
            var active = style === s.id;
            return (
              <button key={s.id} type="button" onClick={function() { set('viagem_style', s.id); }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all"
                style={active
                  ? { background: s.color+'14', borderColor: s.color+'45' }
                  : { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }
                }>
                <span className="text-xl">{s.emoji}</span>
                <span className="font-syne font-bold text-[10px]" style={{ color: active ? s.color : '#fff' }}>{t('style_'+s.id)}</span>
                <span className="text-gray-600 text-[9px] leading-tight text-center">{t('style_'+s.id+'_desc')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-white/5"/>

      {/* ===== PERIODO DA VIAGEM (ambos os modos) ===== */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-2">
          <CalendarRange className="w-3.5 h-3.5"/>
          {t('period_label')}{' '}
          <span className="normal-case text-gray-600 font-normal">{t('date_optional')}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-gray-600 mb-1">{t('period_from')}</p>
            <input type="month" name="date_from" value={values.date_from || ''} onChange={handle}
              className="br-input text-sm" style={{ paddingLeft:'12px', colorScheme:'dark' }}/>
          </div>
          <div>
            <p className="text-[10px] text-gray-600 mb-1">{t('period_to')}</p>
            <input type="month" name="date_to" value={values.date_to || ''} onChange={handle}
              className="br-input text-sm" style={{ paddingLeft:'12px', colorScheme:'dark' }}
              min={values.date_from || undefined}/>
          </div>
        </div>
        {seasonalTips.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {seasonalTips.map(function(tip, i) {
              return (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg text-xs" style={{ background: tip.color+'0D', border:'1px solid '+tip.color+'25' }}>
                  <span className="flex-shrink-0">{tip.icon}</span>
                  <span style={{ color: tip.color }}>{tip.msg}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-white/5"/>

      {/* ===== PASSAGEIROS / NOITES (ambos os modos) ===== */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_pax')}</label>
          <div className="relative">
            <Users className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{ left:'12px' }}/>
            <input name="passageiros" type="number" min="1" max="9" value={values.passageiros} onChange={handle} className="br-input" style={{ paddingLeft:'2.25rem' }}/>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_nights')}</label>
          <div className="relative">
            <Moon className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{ left:'12px' }}/>
            <input name="noites" type="number" min="0" max="30" value={values.noites} onChange={handle} className="br-input" style={{ paddingLeft:'2.25rem' }}/>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-1">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin"/>{t('planner_loading')}</>
          : <><Car className="w-4 h-4"/>{t('planner_btn')}</>
        }
      </button>
    </form>
  );
}
