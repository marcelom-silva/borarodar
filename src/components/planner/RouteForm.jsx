'use client';
import { Fuel, Users, Moon, Loader2, Car, Plus, X, RotateCcw, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import VehicleSelect from '@/components/planner/VehicleSelect';
import SurpriseMode from '@/components/planner/SurpriseMode';
import { getSeasonalTips } from '@/lib/budget';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

var FUEL_TYPES = [
  {value:'gasolina',label:'Gasolina'},{value:'etanol',label:'Etanol'},
  {value:'diesel',label:'Diesel'},{value:'flex_gasolina',label:'Flex (gasolina)'},
  {value:'flex_etanol',label:'Flex (etanol)'},
];
var TRAVEL_STYLES   = [
  {id:'economico',emoji:'💰',color:'#39FF14'},{id:'moderado',emoji:'⚖️',color:'#00D4FF'},{id:'esbanjando',emoji:'✨',color:'#FF6B35'},
];
var TRAVEL_PROFILES = [
  {id:'solo',emoji:'🧍',color:'#39FF14'},{id:'couple',emoji:'👫',color:'#FF6B35'},
  {id:'women_only',emoji:'👩',color:'#FF69B4'},{id:'family_baby',emoji:'👶',color:'#00D4FF'},
  {id:'family_senior',emoji:'👴',color:'#B24BF3'},{id:'friends',emoji:'👥',color:'#FFD700'},
  {id:'pets',emoji:'🐾',color:'#FF9500'},
];

function calcNights(from, to) {
  if (!from||!to) return null;
  var diff=Math.round((new Date(to+'T12:00:00')-new Date(from+'T12:00:00'))/(864e5));
  return diff>0?diff:null;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

// Campo com erro visual
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs mt-1" style={{color:'#FF6B35'}}>
      <AlertTriangle className="w-3 h-3"/>{msg}
    </p>
  );
}

export default function RouteForm({ values, onChange, onCalculate, loading }) {
  var { t }  = useLanguage();
  var [errors, setErrors] = useState({});
  var isItineraryOnly = (values.plan_mode||'completo')==='roteiro';

  function set(k, v) { onChange(function(prev){return Object.assign({},prev,{[k]:v});}); }
  function handle(e) { set(e.target.name, e.target.value); }
  function clearError(k) { setErrors(function(prev){var n=Object.assign({},prev);delete n[k];return n;}); }

  // ===== VALIDACAO =====
  function validate() {
    var errs = {};
    var today = todayStr();

    if (!values.origem||values.origem.trim().length<3) errs.origem = t('validation_required');
    if (!values.destino||values.destino.trim().length<3) errs.destino = t('validation_required');
    if (values.origem&&values.destino&&values.origem.trim().toLowerCase()===values.destino.trim().toLowerCase())
      errs.destino = t('validation_same_city');

    if (values.date_from&&values.date_from<today)
      errs.date_from = t('validation_date_past');
    if (values.date_from&&values.date_to&&values.date_to<values.date_from)
      errs.date_to = t('validation_date_order');

    var pax=parseInt(values.passageiros||1);
    if (isNaN(pax)||pax<1||pax>12) errs.passageiros = t('validation_passengers');

    var kml=parseFloat(values.km_litro||13);
    if (!isItineraryOnly&&(isNaN(kml)||kml<3||kml>60)) errs.km_litro = t('validation_kml');

    var price=parseFloat(values.preco_litro||5.89);
    if (!isItineraryOnly&&(isNaN(price)||price<2||price>25)) errs.preco_litro = t('validation_price');

    return errs;
  }

  function submit(e) {
    e.preventDefault();
    var errs = validate();
    if (Object.keys(errs).length>0) { setErrors(errs); return; }
    setErrors({});
    onCalculate(values);
  }

  // Auto-calcula noites ao mudar datas
  function handleDate(e) {
    var name=e.target.name, value=e.target.value;
    clearError(name);
    var newFrom=name==='date_from'?value:(values.date_from||'');
    var newTo  =name==='date_to'  ?value:(values.date_to  ||'');
    var nights =calcNights(newFrom,newTo);
    onChange(function(prev){
      var u=Object.assign({},prev,{[name]:value});
      if(nights!==null){u.noites=String(nights);u.nights_auto_set=true;}
      return u;
    });
  }

  var seasonalTips = getSeasonalTips(values.date_from||'', values.interests||[], t);
  var isRoundTrip  = values.is_round_trip||false;
  var avoidTolls   = values.avoid_tolls  ||false;
  var style        = values.viagem_style ||'moderado';
  var profile      = values.travel_profile||'couple';
  var autoNights   = calcNights(values.date_from, values.date_to);
  var totalDays    = parseInt(values.noites||'0')+1;

  function inputStyle(key) {
    return errors[key] ? {borderColor:'rgba(255,107,53,0.6)',background:'rgba(255,107,53,0.04)'} : {};
  }

  return (
    <form onSubmit={submit} className="br-card p-5 space-y-5" noValidate>
      <h2 className="font-syne font-bold text-lg">{t('planner_title')}</h2>

      {/* MODO */}
      <div className="grid grid-cols-2 gap-2">
        {[{id:'completo',label:t('mode_complete'),desc:t('mode_complete_desc')},{id:'roteiro',label:t('mode_itinerary'),desc:t('mode_itinerary_desc')}].map(function(m){
          var active=(values.plan_mode||'completo')===m.id;
          return(
            <button key={m.id} type="button" onClick={function(){set('plan_mode',m.id);}}
              className="p-3 rounded-xl border text-left transition-all"
              style={active?{background:'rgba(57,255,20,0.08)',borderColor:'rgba(57,255,20,0.35)'}:{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.07)'}}>
              <p className="font-syne font-bold text-xs" style={{color:active?'#39FF14':'#fff'}}>{m.label}</p>
              <p className="text-gray-600 text-[10px] mt-0.5 leading-tight">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* PERFIL */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">{t('profile_traveler_label')}</label>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {TRAVEL_PROFILES.map(function(p){
            var active=profile===p.id;
            return(
              <button key={p.id} type="button" onClick={function(){set('travel_profile',p.id);}}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all"
                style={active?{background:p.color+'14',borderColor:p.color+'50'}:{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.07)'}}>
                <span className="text-lg">{p.emoji}</span>
                <span className="text-[8px] text-center leading-tight font-medium" style={{color:active?p.color:'#9CA3AF'}}>{t('profile_'+p.id)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODO SURPRESA */}
      <SurpriseMode
        formValues={values}
        onChooseDestination={function(dest){set('destino',dest);clearError('destino');}}
      />

      {/* ORIGEM */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_origem')} <span className="text-red-400">*</span></label>
        <CityAutocomplete value={values.origem}
          onChange={function(v){set('origem',v);clearError('origem');}}
          placeholder="Ex: Brasilia, DF" iconColor="#39FF14"
          inputStyle={inputStyle('origem')}/>
        <FieldError msg={errors.origem}/>
      </div>

      {/* WAYPOINTS */}
      {(values.waypoints||[]).map(function(wp,i){
        return(
          <div key={i}>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_stop')} {i+1}</label>
            <div className="relative">
              <CityAutocomplete value={wp.name}
                onChange={function(v){var wps=(values.waypoints||[]).slice();wps[i]=Object.assign({},wps[i],{name:v});set('waypoints',wps);}}
                placeholder="Ex: Belo Horizonte, MG" iconColor="#FF6B35"/>
              <button type="button"
                onClick={function(){set('waypoints',(values.waypoints||[]).filter(function(_,idx){return idx!==i;}));}}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-gray-600 hover:text-red-400 transition-colors bg-[#141414] rounded-md p-1">
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>
        );
      })}
      {(values.waypoints||[]).length<4&&(
        <button type="button"
          onClick={function(){set('waypoints',(values.waypoints||[]).concat([{name:'',coords:null}]));}}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/12 text-gray-500 hover:text-br-orange hover:border-br-orange/30 transition-all text-xs">
          <Plus className="w-3.5 h-3.5"/>{t('planner_add_wp')}
        </button>
      )}

      {/* DESTINO */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_destino')} <span className="text-red-400">*</span></label>
        <CityAutocomplete value={values.destino}
          onChange={function(v){set('destino',v);clearError('destino');}}
          placeholder="Ex: Campos do Jordao, SP" iconColor="#FF6B35"
          inputStyle={inputStyle('destino')}/>
        <FieldError msg={errors.destino}/>
      </div>

      {/* VEICULO (modo completo) */}
      {!isItineraryOnly&&(
        <>
          <div className="grid grid-cols-2 gap-2">
            {[
              {key:'is_round_trip',label:t('trip_roundtrip'),color:'#00D4FF',icon:RotateCcw},
              {key:'avoid_tolls',  label:t('avoid_tolls'),  color:'#FF6B35',icon:X},
            ].map(function(toggle){
              var active=values[toggle.key]||false;
              var Icon=toggle.icon;
              return(
                <label key={toggle.key} className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none"
                  style={active?{background:toggle.color+'08',borderColor:toggle.color+'30'}:{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.07)'}}>
                  <input type="checkbox" className="sr-only" checked={active}
                    onChange={function(e){set(toggle.key,e.target.checked);}}/>
                  <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
                    style={{background:active?toggle.color:'rgba(255,255,255,0.1)'}}>
                    {active&&<Icon className="w-2.5 h-2.5 text-black"/>}
                  </div>
                  <span className="text-xs font-medium" style={{color:active?toggle.color:'#9CA3AF'}}>{toggle.label}</span>
                </label>
              );
            })}
          </div>
          {avoidTolls&&(
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
              style={{background:'rgba(255,107,53,0.08)',border:'1px solid rgba(255,107,53,0.2)',color:'#FF6B35'}}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{t('avoid_tolls_note')}
            </div>
          )}
          <hr className="border-white/5"/>
          <VehicleSelect values={values} onChange={onChange}/>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_fuel')}</label>
            <div className="relative">
              <Fuel className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{left:'12px'}}/>
              <select name="combustivel" value={values.combustivel} onChange={handle}
                className="br-input appearance-none cursor-pointer" style={{paddingLeft:'2.25rem'}}>
                {FUEL_TYPES.map(function(f){return <option key={f.value} value={f.value} style={{background:'#1A1A22'}}>{f.label}</option>;})}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_kml')}</label>
              <input name="km_litro" type="number" min="3" max="60" step="0.5"
                value={values.km_litro}
                onChange={function(e){handle(e);set('kml_custom',true);clearError('km_litro');}}
                className="br-input" placeholder="13" style={inputStyle('km_litro')}/>
              <FieldError msg={errors.km_litro}/>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_price')}</label>
              <input name="preco_litro" type="number" min="2" max="25" step="0.01"
                value={values.preco_litro}
                onChange={function(e){handle(e);clearError('preco_litro');}}
                className="br-input" placeholder="5.89" style={inputStyle('preco_litro')}/>
              <FieldError msg={errors.preco_litro}/>
            </div>
          </div>
          <hr className="border-white/5"/>
        </>
      )}

      {/* ESTILO */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">{t('style_label')}</label>
        <div className="grid grid-cols-3 gap-2">
          {TRAVEL_STYLES.map(function(s){
            var active=style===s.id;
            return(
              <button key={s.id} type="button" onClick={function(){set('viagem_style',s.id);}}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all"
                style={active?{background:s.color+'14',borderColor:s.color+'45'}:{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.07)'}}>
                <span className="text-xl">{s.emoji}</span>
                <span className="font-syne font-bold text-[10px]" style={{color:active?s.color:'#fff'}}>{t('style_'+s.id)}</span>
                <span className="text-gray-600 text-[9px] leading-tight text-center">{t('style_'+s.id+'_desc')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-white/5"/>

      {/* PERIODO */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5"/>
          {t('period_label')}{' '}<span className="normal-case text-gray-600 font-normal">{t('date_optional')}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-gray-600 mb-1">{t('period_from')}</p>
            <input type="date" name="date_from" value={values.date_from||''}
              min={todayStr()} max="2030-12-31"
              onChange={handleDate}
              className="br-input text-sm" style={Object.assign({paddingLeft:'12px',colorScheme:'dark'},inputStyle('date_from'))}/>
            <FieldError msg={errors.date_from}/>
          </div>
          <div>
            <p className="text-[10px] text-gray-600 mb-1">{t('period_to')}</p>
            <input type="date" name="date_to" value={values.date_to||''}
              min={values.date_from||todayStr()} max="2030-12-31"
              onChange={handleDate}
              className="br-input text-sm" style={Object.assign({paddingLeft:'12px',colorScheme:'dark'},inputStyle('date_to'))}/>
            <FieldError msg={errors.date_to}/>
          </div>
        </div>
        {autoNights!==null&&(
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{background:'rgba(57,255,20,0.06)',border:'1px solid rgba(57,255,20,0.2)'}}>
            <CheckCircle className="w-3.5 h-3.5 text-br-green flex-shrink-0"/>
            <span className="text-br-green font-medium">{autoNights} noites → {autoNights+1} dias de roteiro</span>
            <span className="text-gray-600 ml-auto">{t('period_nights_auto')}</span>
          </div>
        )}
        {seasonalTips.length>0&&(
          <div className="mt-2 space-y-1.5">
            {seasonalTips.map(function(tip,i){
              return(
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                  style={{background:tip.color+'0D',border:'1px solid '+tip.color+'25'}}>
                  <span className="flex-shrink-0">{tip.icon}</span>
                  <span style={{color:tip.color}}>{tip.msg}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-white/5"/>

      {/* PASSAGEIROS / NOITES */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">{t('planner_pax')}</label>
          <div className="relative">
            <Users className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{left:'12px'}}/>
            <input name="passageiros" type="number" min="1" max="12"
              value={values.passageiros}
              onChange={function(e){handle(e);clearError('passageiros');}}
              className="br-input" style={Object.assign({paddingLeft:'2.25rem'},inputStyle('passageiros'))}/>
          </div>
          <FieldError msg={errors.passageiros}/>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
            {t('planner_nights')}
            {values.nights_auto_set&&<span className="ml-1.5 text-br-green font-normal normal-case text-[9px]">✓ auto</span>}
          </label>
          <div className="relative">
            <Moon className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{left:'12px'}}/>
            <input name="noites" type="number" min="0" max="60"
              value={values.noites}
              onChange={function(e){handle(e);set('nights_auto_set',false);}}
              className="br-input"
              style={{paddingLeft:'2.25rem',borderColor:values.nights_auto_set?'rgba(57,255,20,0.35)':undefined}}/>
          </div>
          {values.nights_auto_set&&<p className="text-[10px] text-gray-600 mt-1">Altere se necessario</p>}
        </div>
      </div>

      {parseInt(values.noites||'0')>0&&(
        <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs"
          style={{background:'rgba(178,75,243,0.06)',border:'1px solid rgba(178,75,243,0.15)'}}>
          <span className="text-br-purple">🗓️</span>
          <span className="text-gray-400">Roteiro de</span>
          <span className="font-syne font-bold text-br-purple">{totalDays} dias</span>
          <span className="text-gray-400">/ {values.noites} noites no destino</span>
        </div>
      )}

      {/* Erros gerais */}
      {Object.keys(errors).length>0&&(
        <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{background:'rgba(255,107,53,0.08)',border:'1px solid rgba(255,107,53,0.25)',color:'#FF6B35'}}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
          {t('validation_fix_errors')}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="btn-neon w-full flex items-center justify-center gap-2 mt-1">
        {loading
          ?<><Loader2 className="w-4 h-4 animate-spin"/>{t('planner_loading')}</>
          :<><Car className="w-4 h-4"/>{t('planner_btn')}</>
        }
      </button>
    </form>
  );
}
