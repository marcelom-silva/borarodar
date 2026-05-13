'use client';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var TIPS = [
  { user:'RodrigoK',     av:'R', color:'#39FF14', time:'2h',  icon:CheckCircle,   msg:'BR-040 entre BH e Congonhas perfeita hoje. Zero engarrafamento!' },
  { user:'CarolViajante',av:'C', color:'#FF6B35', time:'4h',  icon:AlertTriangle, msg:'Chuva forte na Serra da Mantiqueira. Visibilidade baixa, cuidado!' },
  { user:'PedroEstrada', av:'P', color:'#00D4FF', time:'6h',  icon:MessageCircle, msg:'Posto Shell km 185 da Castelo Branco tem o melhor cafe da rota.' },
  { user:'AnaFamilia',   av:'A', color:'#B24BF3', time:'8h',  icon:CheckCircle,   msg:'Pousada Vista Serra em Campos do Jordao - R$ 180 o casal. Vale!' },
];

export default function CommunityPreview() {
  var { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
        <div>
          <span className="text-br-blue font-mono text-xs uppercase tracking-widest">{t('community_tag')}</span>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl mt-2">{t('community_title')}</h2>
        </div>
        <Link href="/comunidade" className="btn-ghost text-sm flex items-center gap-2">
          {t('community_all')} <ArrowRight className="w-4 h-4"/>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {TIPS.map(function(tip, i) {
          return (
            <div key={i} className="br-card p-5 flex gap-4">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-syne font-bold text-sm" style={{ background:tip.color+'22', color:tip.color }}>{tip.av}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-syne font-bold text-sm">{tip.user}</span>
                  <span className="text-gray-600 text-xs">{tip.time}</span>
                  <tip.icon className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color:tip.color }}/>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{tip.msg}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-8 text-center" style={{ background:'linear-gradient(135deg,rgba(57,255,20,0.08) 0%,rgba(0,212,255,0.08) 100%)', border:'1px solid rgba(57,255,20,0.15)' }}>
        <h3 className="font-syne font-extrabold text-2xl mb-2">{t('community_cta_title')}</h3>
        <p className="text-gray-400 text-sm mb-6">{t('community_cta_sub')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/perfil"   className="btn-neon px-8">{t('community_cta_btn1')}</Link>
          <Link href="/planejar" className="btn-ghost px-8">{t('community_cta_btn2')}</Link>
        </div>
      </div>
    </section>
  );
}
