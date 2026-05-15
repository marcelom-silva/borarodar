'use client';
import { useState } from 'react';
import { generateChecklist } from '@/lib/ai';
import { ClipboardList, ChevronDown, AlertTriangle, Shield, Loader2, CheckSquare, Square, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var LEVEL_COLORS = { alto:'#FF3333', medio:'#FF9500', info:'#00D4FF' };
var LEVEL_ICONS  = { alto:'🔴', medio:'🟡', info:'🔵' };
var PRIORITY_COLORS = { alta:'#FF6B35', media:'#FFD700', baixa:'#39FF14' };

function SecurityAlerts({ alerts }) {
  if (!alerts||!alerts.length) return null;
  return (
    <div className="mb-4 rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,51,51,0.25)'}}>
      <div className="flex items-center gap-2 px-4 py-3" style={{background:'rgba(255,51,51,0.12)'}}>
        <Shield className="w-4 h-4 text-red-400"/>
        <span className="font-syne font-bold text-sm text-red-400">Alertas de Segurança</span>
      </div>
      <div className="p-3 space-y-2">
        {alerts.map(function(a,i){
          var color=LEVEL_COLORS[a.level]||'#FF9500';
          return (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg text-xs"
              style={{background:color+'0D',border:'1px solid '+color+'25'}}>
              <span className="flex-shrink-0 text-base">{LEVEL_ICONS[a.level]||'⚠️'}</span>
              <span style={{color:color}} className="leading-relaxed">{a.msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BorderRequirements({ border }) {
  var [open,setOpen]=useState(true);
  if (!border||!border.country||!border.items||!border.items.length) return null;
  return (
    <div className="mb-3 rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,165,0,0.3)'}}>
      <button type="button" onClick={function(){setOpen(!open);}}
        className="w-full flex items-center justify-between gap-3 px-4 py-3"
        style={{background:'rgba(255,165,0,0.1)'}}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🛂</span>
          <span className="font-syne font-bold text-sm" style={{color:'#FFA500'}}>
            Requisitos de Fronteira — {border.country}
          </span>
        </div>
        <ChevronDown className="w-4 h-4" style={{color:'#FFA500',transform:open?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
      </button>
      {open&&(
        <div className="p-3 space-y-1.5">
          {border.items.map(function(item,i){return <CheckItem key={i} item={item} color="#FFA500"/>;}) }
        </div>
      )}
    </div>
  );
}

function CheckItem({ item, color, onToggle }) {
  var [checked,setChecked]=useState(item.checked||false);
  function toggle(){setChecked(!checked);if(onToggle)onToggle(!checked);}
  return (
    <div className="flex items-start gap-2.5 py-1.5 cursor-pointer group" onClick={toggle}>
      <div className="flex-shrink-0 mt-0.5" style={{color:checked?color:'rgba(255,255,255,0.3)'}}>
        {checked?<CheckSquare className="w-4 h-4"/>:<Square className="w-4 h-4"/>}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm" style={{color:checked?'#6B7280':'#D1D5DB',textDecoration:checked?'line-through':'none'}}>
          {item.required&&<span className="text-red-400 mr-1 text-[10px] font-bold">*</span>}
          {item.text}
        </span>
        {item.note&&<p className="text-[10px] text-gray-600 mt-0.5">{item.note}</p>}
      </div>
    </div>
  );
}

function CategorySection({ cat }) {
  var [open,setOpen]=useState(cat.priority==='alta');
  var [items,setItems]=useState(cat.items||[]);
  var checked=items.filter(function(i){return i.checked;}).length;
  var total=items.length;
  var color=PRIORITY_COLORS[cat.priority]||'#39FF14';

  function toggleItem(idx,val){
    setItems(function(prev){
      var next=prev.slice(); next[idx]=Object.assign({},next[idx],{checked:val}); return next;
    });
  }

  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{border:'1px solid rgba(255,255,255,0.06)',background:'rgba(20,20,27,0.8)'}}>
      <button type="button" onClick={function(){setOpen(!open);}}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
        <span className="text-xl">{cat.icon}</span>
        <div className="flex-1 text-left">
          <p className="font-syne font-bold text-sm">{cat.title}</p>
          <p className="text-xs" style={{color:color}}>{checked}/{total} itens</p>
        </div>
        {/* Progress mini */}
        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
          <div className="h-full rounded-full transition-all duration-500"
            style={{width:total>0?(checked/total*100)+'%':0,background:color}}/>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0"
          style={{transform:open?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
      </button>
      {open&&(
        <div className="px-4 pb-3 space-y-0.5 border-t border-white/5">
          {items.map(function(item,i){
            return <CheckItem key={i} item={item} color={color} onToggle={function(v){toggleItem(i,v);}} />;
          })}
        </div>
      )}
    </div>
  );
}

export default function TravelChecklist({ destination, travelProfile, dateFrom, dateTo }) {
  var { t } = useLanguage();
  var [checklist, setChecklist] = useState(null);
  var [loading,   setLoading]   = useState(false);
  var [error,     setError]     = useState('');

  // Total de progresso geral
  var totalItems  = checklist ? checklist.categories.reduce(function(sum,c){return sum+(c.items?c.items.length:0);},0) : 0;
  var checkedItems= 0; // simplified — categories track their own state

  async function generate() {
    if (!destination){setError(t('itinerary_no_dest'));return;}
    setLoading(true); setError(''); setChecklist(null);
    try {
      var result = await generateChecklist({ destination, travelProfile, dateFrom, dateTo });
      setChecklist(result);
    } catch(err) {
      if(err.message==='ALL_LIMITS_REACHED') setError(t('itinerary_all_limits'));
      else if(err.message==='NO_API_KEY')     setError(t('itinerary_no_key'));
      else setError(t('checklist_error')+': '+err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="br-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(0,212,255,0.15)'}}>
          <ClipboardList className="w-5 h-5 text-br-blue"/>
        </div>
        <div>
          <h2 className="font-syne font-bold text-lg">{t('checklist_title')} 📋</h2>
          <p className="text-xs text-gray-600">{t('checklist_sub')}</p>
        </div>
      </div>

      {!checklist&&(
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.15)'}}>
            <Info className="w-4 h-4 text-br-blue flex-shrink-0 mt-0.5"/>
            <p className="text-gray-400">{t('checklist_hint')}</p>
          </div>
          {error&&(
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
              style={{background:'rgba(255,107,53,0.08)',border:'1px solid rgba(255,107,53,0.2)',color:'#FF6B35'}}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"/>{error}
            </div>
          )}
          <button type="button" onClick={generate} disabled={loading||!destination}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-syne font-bold text-sm transition-all"
            style={{background:loading||!destination?'rgba(0,212,255,0.2)':'#00D4FF',color:'#000',cursor:loading||!destination?'not-allowed':'pointer'}}>
            {loading
              ?<><Loader2 className="w-4 h-4 animate-spin"/>{t('checklist_loading')}</>
              :<><ClipboardList className="w-4 h-4"/>{t('checklist_btn')}</>
            }
          </button>
        </div>
      )}

      {checklist&&(
        <div>
          {/* Destino + Internacional */}
          <div className="mb-4 p-3 rounded-xl flex items-center justify-between"
            style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.15)'}}>
            <div>
              <p className="font-syne font-bold text-sm">{checklist.destination}</p>
              <p className="text-xs text-gray-500">
                {checklist.isInternational ? '✈️ Destino Internacional' : '🇧🇷 Destino Nacional'}
              </p>
            </div>
            <span className="text-2xl">{checklist.isInternational?'🛂':'🚗'}</span>
          </div>

          {/* Alertas de Seguranca */}
          <SecurityAlerts alerts={checklist.securityAlerts}/>

          {/* Requisitos de Fronteira */}
          <BorderRequirements border={checklist.borderRequirements}/>

          {/* Categorias com checkboxes */}
          {(checklist.categories||[]).map(function(cat,i){
            return <CategorySection key={i} cat={cat}/>;
          })}

          {/* Nota obrigatoria */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{background:'rgba(255,165,0,0.08)',border:'1px solid rgba(255,165,0,0.2)'}}>
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5"/>
            <p className="text-gray-400">{t('checklist_confirm_note')}</p>
          </div>

          <button type="button" onClick={function(){setChecklist(null);}}
            className="btn-ghost w-full mt-4 text-sm justify-center">
            {t('checklist_regenerate')}
          </button>
        </div>
      )}
    </div>
  );
}
