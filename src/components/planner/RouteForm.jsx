'use client';
import { MapPin, Navigation, Fuel, Users, Moon, Loader2, Car, Plus, X } from 'lucide-react';

var FUEL_TYPES = [
  { value: 'gasolina',      label: 'Gasolina' },
  { value: 'etanol',        label: 'Etanol' },
  { value: 'diesel',        label: 'Diesel' },
  { value: 'flex_gasolina', label: 'Flex (gasolina)' },
  { value: 'flex_etanol',   label: 'Flex (etanol)' },
];

var PERFIS = [
  { value: 'solo',     label: '🎒 Solo' },
  { value: 'casal',    label: '💑 Casal' },
  { value: 'familia',  label: '👨‍👩‍👧 Familia' },
  { value: 'galera',   label: '🤙 Galera' },
];

var INTERESSES = [
  { value: 'Praia',       label: '🏖️ Praia' },
  { value: 'Natureza',    label: '🌿 Natureza' },
  { value: 'Historia',    label: '🏛️ Historia' },
  { value: 'Cultura',     label: '🎨 Cultura' },
  { value: 'Gastronomia', label: '🍽️ Gastronomia' },
  { value: 'Aventura',    label: '🏄 Aventura' },
];

export default function RouteForm({ values, onChange, onCalculate, loading }) {
  function set(k, v) { onChange(function(prev) { return Object.assign({}, prev, { [k]: v }); }); }
  function handle(e) { set(e.target.name, e.target.value); }
  function submit(e) { e.preventDefault(); onCalculate(values); }

  // Waypoints
  function addWaypoint()       { set('waypoints', (values.waypoints || []).concat([{ name:'', coords:null }])); }
  function removeWaypoint(i)   { set('waypoints', (values.waypoints || []).filter(function(_, idx) { return idx !== i; })); }
  function updateWaypoint(i,v) { var wps = (values.waypoints || []).slice(); wps[i] = Object.assign({}, wps[i], { name:v }); set('waypoints', wps); }

  // Interesses (multi-select toggle)
  function toggleInteresse(val) {
    var cur = values.interesses || [];
    if (cur.includes(val)) {
      set('interesses', cur.filter(function(v) { return v !== val; }));
    } else {
      set('interesses', cur.concat([val]));
    }
  }

  var interesses = values.interesses || [];

  return (
    <form onSubmit={submit} className="br-card p-6 space-y-5">
      <h2 className="font-syne font-bold text-lg">Sua Rota</h2>

      {/* Origem */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Origem</label>
        <div className="relative">
          <MapPin className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-br-green pointer-events-none z-10" style={{ left:'12px' }} />
          <input name="origem" value={values.origem} onChange={handle} placeholder="Ex: Sao Paulo, SP" className="br-input" style={{ paddingLeft:'2.25rem' }} required />
        </div>
      </div>

      {/* Waypoints */}
      {(values.waypoints || []).map(function(wp, i) {
        return (
          <div key={i}>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Parada {i + 1}</label>
            <div className="relative">
              <MapPin className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-br-orange pointer-events-none z-10" style={{ left:'12px' }} />
              <input value={wp.name} onChange={function(e) { updateWaypoint(i, e.target.value); }} placeholder="Ex: Belo Horizonte, MG" className="br-input pr-10" style={{ paddingLeft:'2.25rem' }} />
              <button type="button" onClick={function() { removeWaypoint(i); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {(values.waypoints || []).length < 4 && (
        <button type="button" onClick={addWaypoint} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/12 text-gray-500 hover:text-br-orange hover:border-br-orange/30 transition-all text-sm">
          <Plus className="w-4 h-4" /> Adicionar parada intermediaria
        </button>
      )}

      {/* Destino */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Destino</label>
        <div className="relative">
          <Navigation className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-br-orange pointer-events-none z-10" style={{ left:'12px' }} />
          <input name="destino" value={values.destino} onChange={handle} placeholder="Ex: Rio de Janeiro, RJ" className="br-input" style={{ paddingLeft:'2.25rem' }} required />
        </div>
      </div>

      <hr className="border-white/5" />
      <h3 className="font-syne font-bold text-sm text-gray-300">Perfil da Viagem</h3>

      {/* Perfil */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Quem vai?</label>
        <div className="grid grid-cols-2 gap-2">
          {PERFIS.map(function(p) {
            return (
              <button
                key={p.value}
                type="button"
                onClick={function() { set('perfil', p.value); }}
                className="py-2 px-3 rounded-xl text-sm font-medium transition-all border"
                style={values.perfil === p.value
                  ? { background:'rgba(57,255,20,0.12)', borderColor:'rgba(57,255,20,0.4)', color:'#39FF14' }
                  : { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)', color:'#9CA3AF' }
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interesses */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Interesses (multi)</label>
        <div className="flex flex-wrap gap-2">
          {INTERESSES.map(function(it) {
            var active = interesses.includes(it.value);
            return (
              <button
                key={it.value}
                type="button"
                onClick={function() { toggleInteresse(it.value); }}
                className="py-1.5 px-3 rounded-full text-xs font-medium transition-all border"
                style={active
                  ? { background:'rgba(0,212,255,0.12)', borderColor:'rgba(0,212,255,0.4)', color:'#00D4FF' }
                  : { background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)', color:'#6B7280' }
                }
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Noites no destino */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
          Noites no destino <span className="text-gray-600">(gera roteiro dia a dia)</span>
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={function() { var v = Math.max(0, (parseInt(values.noites)||0) - 1); set('noites', String(v)); }} className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 text-gray-300 hover:bg-white/10 transition-colors font-bold text-lg flex items-center justify-center">-</button>
          <div className="flex-1 text-center">
            <div className="font-syne font-extrabold text-2xl text-br-green">{values.noites || '0'}</div>
            <div className="text-xs text-gray-600">{values.noites === '1' ? '1 noite' : (values.noites || '0') + ' noites'}</div>
          </div>
          <button type="button" onClick={function() { var v = Math.min(30, (parseInt(values.noites)||0) + 1); set('noites', String(v)); }} className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 text-gray-300 hover:bg-white/10 transition-colors font-bold text-lg flex items-center justify-center">+</button>
        </div>
      </div>

      <hr className="border-white/5" />
      <h3 className="font-syne font-bold text-sm text-gray-300">Veiculo e Combustivel</h3>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Combustivel</label>
        <div className="relative">
          <Fuel className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{ left:'12px' }} />
          <select name="combustivel" value={values.combustivel} onChange={handle} className="br-input appearance-none cursor-pointer" style={{ paddingLeft:'2.25rem' }}>
            {FUEL_TYPES.map(function(f) { return <option key={f.value} value={f.value} style={{ background:'#141414' }}>{f.label}</option>; })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Km/L</label>
          <input name="km_litro" type="number" min="4" max="30" step="0.5" value={values.km_litro} onChange={handle} className="br-input" placeholder="12" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Preco/litro (R$)</label>
          <input name="preco_litro" type="number" min="3" max="12" step="0.01" value={values.preco_litro} onChange={handle} className="br-input" placeholder="5.89" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Passageiros</label>
        <div className="relative">
          <Users className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" style={{ left:'12px' }} />
          <input name="passageiros" type="number" min="1" max="9" value={values.passageiros} onChange={handle} className="br-input" style={{ paddingLeft:'2.25rem' }} />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</> : <><Car className="w-4 h-4" /> Calcular Rota</>}
      </button>
    </form>
  );
}
