'use client';
import Link from 'next/link';
import { ArrowRight, Clock, Fuel, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var ROUTES = [
  { orig:'Sao Paulo, SP', dest:'Rio de Janeiro, RJ', title:'Sao Paulo - Rio de Janeiro', tag:'Classico', tagColor:'#39FF14', dist:'431 km', time:'5h', fuel:'R$ 180', rating:4.8, reviews:342, desc:'A mais famosa do Sudeste. Via Dutra ou pelo Litoral Sul, paisagem incrivel.' },
  { orig:'Florianopolis, SC', dest:'Gramado, RS', title:'Florianopolis - Gramado', tag:'Serrano', tagColor:'#00D4FF', dist:'456 km', time:'5h30', fuel:'R$ 190', rating:4.9, reviews:218, desc:'Praias, serras gauchas, vinherias. Uma das mais bonitas do Sul.' },
  { orig:'Brasilia, DF', dest:'Chapada dos Veadeiros, GO', title:'Brasilia - Chapada dos Veadeiros', tag:'Aventura', tagColor:'#FF6B35', dist:'262 km', time:'3h', fuel:'R$ 110', rating:4.7, reviews:156, desc:'Cachoeiras, trilhas e Cerrado puro. Imperdivel para quem curte natureza.' },
  { orig:'Belo Horizonte, MG', dest:'Ouro Preto, MG', title:'Belo Horizonte - Ouro Preto', tag:'Historia', tagColor:'#B24BF3', dist:'98 km', time:'1h30', fuel:'R$ 42', rating:4.9, reviews:401, desc:'Patrimonio da Humanidade a poucos km da capital. Arte barroca e cachaca boa.' },
];

export default function TrendingRoutes() {
  var { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
        <div>
          <span className="text-br-orange font-mono text-xs uppercase tracking-widest">{t('trending_tag')}</span>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl mt-2">{t('trending_title')}</h2>
        </div>
        <Link href="/explorar" className="btn-ghost text-sm flex items-center gap-2">
          {t('trending_all')} <ArrowRight className="w-4 h-4"/>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROUTES.map(function(r, i) {
          return (
            <Link key={i} href={'/planejar?origem='+encodeURIComponent(r.orig)+'&destino='+encodeURIComponent(r.dest)} className="br-card p-6 block hover:-translate-y-1 transition-transform group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:r.tagColor+'18', color:r.tagColor }}>{r.tag}</span>
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current"/>
                  <span className="font-bold">{r.rating}</span>
                  <span className="text-gray-600">({r.reviews})</span>
                </div>
              </div>
              <h3 className="font-syne font-bold text-lg mb-2 group-hover:text-br-green transition-colors">{r.title}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{r.desc}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3"/>{r.dist}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{r.time}</span>
                <span className="flex items-center gap-1"><Fuel className="w-3 h-3"/>{r.fuel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
