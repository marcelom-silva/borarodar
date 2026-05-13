'use client';
import { useState } from 'react';
import { ThumbsUp, AlertTriangle, CheckCircle, Info, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var TIPS_INIT = [
  { user:'RodrigoK',     av:'R', color:'#39FF14', time:'2h',  icon:CheckCircle,   type:'Estrada OK', msg:'BR-040 entre BH e Congonhas perfeita hoje. Asfalto novo, zero furo!', likes:42 },
  { user:'CarolViaja',   av:'C', color:'#FF6B35', time:'4h',  icon:AlertTriangle, type:'Alerta',     msg:'Chuva forte na Serra da Mantiqueira. Reducao de visibilidade!',        likes:38 },
  { user:'PedroEstrada', av:'P', color:'#00D4FF', time:'6h',  icon:Info,          type:'Dica',       msg:'Posto Shell km 185 da Castelo Branco — melhor cafe da rota.',          likes:71 },
  { user:'AnaFamilia',   av:'A', color:'#B24BF3', time:'10h', icon:CheckCircle,   type:'Hospedagem', msg:'Pousada Vista Serra em Campos do Jordao — R$ 180 o casal. Super indico!', likes:55 },
  { user:'MarceloTruck', av:'M', color:'#FF6B35', time:'1d',  icon:AlertTriangle, type:'Perigo',     msg:'Buracao enorme no km 312 da Dutra sentido Rio. Cuidado a noite!',      likes:89 },
];

var RANKINGS = [
  { pos:1, user:'MarceloTruck', av:'M', color:'#FF6B35', km:'48.320', trips:127, badge:'Rei do Asfalto 👑' },
  { pos:2, user:'JuliaBrasil',  av:'J', color:'#39FF14', km:'31.200', trips:89,  badge:'Cacadora de Cachoeiras 💦' },
  { pos:3, user:'RodrigoK',     av:'R', color:'#00D4FF', km:'28.500', trips:74,  badge:'Explorador do Cerrado 🌵' },
  { pos:4, user:'CarolViaja',   av:'C', color:'#B24BF3', km:'19.800', trips:52,  badge:'Aventureira Solo 🎒' },
  { pos:5, user:'PedroEstrada', av:'P', color:'#FF6B35', km:'17.100', trips:45,  badge:'Mestre dos Pit Stops ☕' },
];

export default function CommunityPage() {
  var { t } = useLanguage();
  var [tab,    setTab]    = useState('feed');
  var [newTip, setNewTip] = useState('');
  var [tips,   setTips]   = useState(TIPS_INIT);
  var [liked,  setLiked]  = useState({});

  function postTip() {
    if (!newTip.trim()) return;
    setTips(function(prev) { return [{ user:'Voce', av:'V', color:'#39FF14', time:'Agora', icon:Info, type:'Dica', msg:newTip, likes:0 }].concat(prev); });
    setNewTip('');
  }
  function like(i) {
    if (liked[i]) return;
    setLiked(function(prev) { return Object.assign({}, prev, { [i]: true }); });
    setTips(function(prev) { return prev.map(function(tip, idx) { return idx === i ? Object.assign({}, tip, { likes: tip.likes+1 }) : tip; }); });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <span className="text-br-blue font-mono text-xs uppercase tracking-widest">{t('comm_tag')}</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">{t('comm_title')} 🏆</h1>
        <p className="text-gray-500 mt-2">{t('comm_sub')}</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-white/5">
        {[{ k:'feed', l:t('comm_feed') }, { k:'ranking', l:t('comm_ranking') }].map(function({ k, l }) {
          return (
            <button key={k} onClick={function() { setTab(k); }} className={'px-5 py-2.5 font-syne font-bold text-sm border-b-2 transition-all -mb-px '+(tab===k ? 'border-br-green text-br-green' : 'border-transparent text-gray-500 hover:text-white')}>
              {l}
            </button>
          );
        })}
      </div>

      {tab === 'feed' && (
        <div className="space-y-4">
          <div className="br-card p-4 flex gap-3">
            <div className="w-9 h-9 rounded-full bg-br-green/20 flex items-center justify-center font-syne font-bold text-br-green text-sm flex-shrink-0">V</div>
            <div className="flex-1">
              <textarea className="br-input resize-none h-20 text-sm" placeholder={t('comm_placeholder')} value={newTip} onChange={function(e) { setNewTip(e.target.value); }}/>
              <div className="flex justify-end mt-2">
                <button onClick={postTip} className="btn-neon px-5 py-2 text-sm flex items-center gap-2">
                  <Send className="w-3.5 h-3.5"/>{t('comm_publish')}
                </button>
              </div>
            </div>
          </div>
          {tips.map(function(tip, i) {
            return (
              <div key={i} className="br-card p-5 flex gap-4">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-syne font-bold" style={{ background:tip.color+'22', color:tip.color }}>{tip.av}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-syne font-bold text-sm">{tip.user}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background:tip.color+'18', color:tip.color }}>{tip.type}</span>
                    <span className="text-gray-600 text-xs ml-auto">{tip.time}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{tip.msg}</p>
                  <button onClick={function() { like(i); }} className={'flex items-center gap-1.5 text-xs transition-colors '+(liked[i] ? 'text-br-green' : 'text-gray-600 hover:text-white')}>
                    <ThumbsUp className="w-3.5 h-3.5"/>{tip.likes}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'ranking' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[{ l:t('comm_km'), v:'2.1M' }, { l:t('comm_tips'), v:'8.340' }, { l:t('comm_explorers'), v:'12.3k' }].map(function({ l, v }) {
              return (
                <div key={l} className="br-card p-4 text-center">
                  <div className="font-syne font-extrabold text-2xl text-br-green">{v}</div>
                  <div className="text-gray-500 text-xs mt-1">{l}</div>
                </div>
              );
            })}
          </div>
          {RANKINGS.map(function(r) {
            var posClass = r.pos===1 ? 'bg-yellow-400 text-black' : r.pos===2 ? 'bg-gray-400 text-black' : r.pos===3 ? 'bg-amber-700 text-white' : 'bg-white/5 text-gray-400';
            return (
              <div key={r.pos} className="br-card p-5 flex items-center gap-4">
                <div className={'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-syne font-black text-sm '+posClass}>{r.pos}</div>
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-syne font-bold" style={{ background:r.color+'22', color:r.color }}>{r.av}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-syne font-bold text-sm">{r.user}</div>
                  <div className="text-xs text-gray-500">{r.badge}</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="font-mono font-bold text-sm text-br-green">{r.km} km</div>
                  <div className="text-xs text-gray-600">{r.trips} {t('profile_trips').toLowerCase()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
