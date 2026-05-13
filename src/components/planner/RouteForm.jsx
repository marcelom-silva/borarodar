'use client';
import { MapPin, Navigation, Fuel, Users, Moon, Loader2, Car } from 'lucide-react';

const FUEL_TYPES = [
  { value: 'gasolina',      label: 'Gasolina' },
  { value: 'etanol',        label: 'Etanol' },
  { value: 'diesel',        label: 'Diesel' },
  { value: 'flex_gasolina', label: 'Flex (gasolina)' },
  { value: 'flex_etanol',   label: 'Flex (etanol)' },
];

export default function RouteForm({ values, onChange, onCalculate, loading }) {
  function set(k, v) { onChange(function(prev) { return Object.assign({}, prev, { [k]: v }); }); }
  function handle(e)  { set(e.target.name, e.target.value); }
  function submit(e)  { e.preventDefault(); onCalculate(values); }

  return (
    <form onSubmit={submit} className="br-card p-6 space-y-5">
      <h2 className="font-syne font-bold text-lg">Sua Rota</h2>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Origem</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-br-green pointer-events-none" />
          <input name="origem" value={values.origem} onChange={handle} placeholder="Ex: Sao Paulo, SP" className="br-input pl-9" required />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Destino</label>
        <div className="relative">
          <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-br-orange pointer-events-none" />
          <input name="destino" value={values.destino} onChange={handle} placeholder="Ex: Rio de Janeiro, RJ" className="br-input pl-9" required />
        </div>
      </div>

      <hr className="border-white/5" />
      <h3 className="font-syne font-bold text-sm text-gray-300">Veiculo e Combustivel</h3>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Combustivel</label>
        <div className="relative">
          <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select name="combustivel" value={values.combustivel} onChange={handle} className="br-input pl-9 appearance-none cursor-pointer">
            {FUEL_TYPES.map(function(f) { return <option key={f.value} value={f.value} style={{ background: '#141414' }}>{f.label}</option>; })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Km/L do carro</label>
          <input name="km_litro" type="number" min="4" max="30" step="0.5" value={values.km_litro} onChange={handle} className="br-input" placeholder="12" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Preco/litro (R$)</label>
          <input name="preco_litro" type="number" min="3" max="12" step="0.01" value={values.preco_litro} onChange={handle} className="br-input" placeholder="5.89" />
        </div>
      </div>

      <hr className="border-white/5" />
      <h3 className="font-syne font-bold text-sm text-gray-300">Passageiros e Hospedagem</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Passageiros</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input name="passageiros" type="number" min="1" max="9" value={values.passageiros} onChange={handle} className="br-input pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Noites (hotel)</label>
          <div className="relative">
            <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input name="noites" type="number" min="0" max="30" value={values.noites} onChange={handle} className="br-input pl-9" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-2">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</>
          : <><Car className="w-4 h-4" /> Calcular Rota</>
        }
      </button>
    </form>
  );
}
