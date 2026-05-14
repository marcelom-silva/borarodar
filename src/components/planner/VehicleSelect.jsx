'use client';
import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { BRANDS, MODELS, getYears, DEFAULT_VEHICLE } from '@/lib/vehicleData';
import { useLanguage } from '@/contexts/LanguageContext';

function FilterSelect({ options, value, onChange, placeholder, disabled, t }) {
  var [filter, setFilter] = useState('');
  var [open,   setOpen]   = useState(false);

  var filtered = useMemo(function() {
    if (!filter) return options;
    var f = filter.toLowerCase();
    return options.filter(function(o) { return o.label.toLowerCase().includes(f); });
  }, [options, filter]);

  var selected = options.find(function(o) { return o.value === value; });

  function select(v) { onChange(v); setOpen(false); setFilter(''); }

  return (
    <div className="relative">
      <button type="button" disabled={disabled} onClick={function() { setOpen(!open); }}
        className="br-input flex items-center justify-between gap-2 text-left"
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
        <span className={selected ? 'text-white text-sm' : 'text-gray-600 text-sm'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0"/>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-card"
          style={{ background:'#111', border:'1px solid rgba(255,255,255,0.1)' }}>
          <div className="p-2 border-b border-white/5">
            <input type="text" className="br-input text-sm" style={{ padding:'8px 12px' }}
              placeholder={t('vehicle_filter_ph')} value={filter}
              onChange={function(e) { setFilter(e.target.value); }} autoFocus/>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(function(o) {
              return (
                <button key={o.value} type="button"
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/3 last:border-0"
                  style={{ color: o.value === value ? '#39FF14' : '#d1d5db' }}
                  onMouseEnter={function(e) { e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background='transparent'; }}
                  onClick={function() { select(o.value); }}>
                  {o.label}
                  {o.kml && <span className="text-xs text-gray-600 ml-2">~ {o.kml} km/L</span>}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-600 px-4 py-3">{t('vehicle_no_results')}</p>
            )}
          </div>
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={function() { setOpen(false); setFilter(''); }}/>}
    </div>
  );
}

export default function VehicleSelect({ values, onChange }) {
  var { t } = useLanguage();

  var brand = values.vehicle_brand     || '';
  var model = values.vehicle_model_name|| '';
  var year  = values.vehicle_year      || '';

  var brandOptions = BRANDS.map(function(b) { return { value:b.id, label:b.name }; });
  var modelOptions = useMemo(function() {
    if (!brand) return [];
    return (MODELS[brand] || []).map(function(m) { return { value:m.name, label:m.name, kml:m.kml, vtype:m.vtype }; });
  }, [brand]);
  var yearOptions = getYears().map(function(y) { return { value:String(y), label:String(y) }; });

  function selectBrand(v) {
    onChange(Object.assign({}, values, { vehicle_brand:v, vehicle_model_name:'', vehicle_year:'', km_litro:String(DEFAULT_VEHICLE.kml), vehicle_type:'carro', kml_custom:false }));
  }
  function selectModel(v) {
    var found = (MODELS[brand]||[]).find(function(m) { return m.name===v; });
    var kml   = found ? String(found.kml)  : String(DEFAULT_VEHICLE.kml);
    var vtype = found ? found.vtype         : DEFAULT_VEHICLE.vtype;
    onChange(Object.assign({}, values, { vehicle_model_name:v, km_litro:kml, vehicle_type:vtype, kml_custom:false }));
  }
  function selectYear(v) {
    onChange(Object.assign({}, values, { vehicle_year:v }));
  }

  var selectedModel = model && brand ? (MODELS[brand]||[]).find(function(m) { return m.name===model; }) : null;

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 uppercase tracking-wide block">{t('vehicle_label')}</label>
      <div className="grid grid-cols-1 gap-2">
        <FilterSelect options={brandOptions} value={brand} onChange={selectBrand} placeholder={t('vehicle_brand_ph')} t={t}/>
        <FilterSelect options={modelOptions} value={model} onChange={selectModel} placeholder={t('vehicle_model_ph2')} disabled={!brand} t={t}/>
        <FilterSelect options={yearOptions}  value={year}  onChange={selectYear}  placeholder={t('vehicle_year_ph')}   disabled={!model} t={t}/>
      </div>
      {selectedModel && (
        <p className="text-xs text-br-green flex items-center gap-1.5 mt-1">
          <span>⛽</span>{t('vehicle_kml_hint')} <strong>{selectedModel.kml} km/L</strong>
          <span className="text-gray-600">— {t('vehicle_kml_editable')}</span>
        </p>
      )}
      {!brand && <p className="text-xs text-gray-600">{t('vehicle_default_note')}</p>}
    </div>
  );
}
