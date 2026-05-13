'use client';
import { useEffect, useRef, useState } from 'react';
import { Route, Coins, MapPin, ShieldAlert, Users, Download } from 'lucide-react';

function useReveal(delay) {
  var ref = useRef(null);
  var [visible, setVisible] = useState(false);
  useEffect(function() {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        setTimeout(function() { setVisible(true); obs.disconnect(); }, delay || 0);
      }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return function() { obs.disconnect(); };
  }, [delay]);
  return { ref, visible };
}

var FEATURES = [
  { icon: Route,       color: '#39FF14', title: 'Rotas Inteligentes',   desc: 'Melhor caminho considerando pedagios, balsas e trechos ruins. Dados reais do Brasil.',          detail: 'OpenStreetMap + OSRM' },
  { icon: Coins,       color: '#FF6B35', title: 'Orcamento Detalhado',  desc: 'Combustivel, pedagios, alimentacao e hospedagem calculados antes de sair. Sem surpresas.',      detail: 'Combustivel, pedagios, hotel' },
  { icon: MapPin,      color: '#00D4FF', title: 'Pit Stops Incriveis',  desc: 'Restaurantes, postos, cachoeiras, mirantes e apoio para bebes ao longo da rota.',              detail: 'Restaurantes, postos, atrações' },
  { icon: ShieldAlert, color: '#B24BF3', title: 'Alertas de Seguranca', desc: 'Avisos sobre trechos ruins, condicoes da pista e dicas para uma viagem mais tranquila.',       detail: 'Pista, clima, segurança' },
  { icon: Users,       color: '#39FF14', title: 'Comunidade',           desc: 'Avalie rotas, compartilhe dicas, ganha medalhas e suba no ranking dos exploradores.',          detail: 'Rankings, medalhas, feed' },
  { icon: Download,    color: '#FF6B35', title: 'Exportar Tudo',        desc: 'Mande o roteiro pelo WhatsApp, salve em PDF, envie por e-mail. Simples assim.',               detail: 'WhatsApp, PDF, E-mail' },
];

function FeatureCard({ feature, index }) {
  var { ref, visible } = useReveal(index * 90);
  var [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      /* ===== BUG CORRIGIDO: classe 'visible' agora e adicionada corretamente ===== */
      className={'reveal br-card p-6 group relative overflow-hidden' + (visible ? ' visible' : '')}
      style={{ transitionDelay: (index * 90) + 'ms' }}
      onMouseEnter={function() { setHovered(true); }}
      onMouseLeave={function() { setHovered(false); }}
    >
      {/* Glow de fundo */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(circle at 30% 40%, ' + feature.color + '08 0%, transparent 65%)' }}
      />
      {/* Linha superior colorida */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-all duration-300 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, transparent, ' + feature.color + ', transparent)', opacity: hovered ? 0.7 : 0 }}
      />

      {/* Numero */}
      <div className="absolute top-4 right-5 font-mono text-xs opacity-10 group-hover:opacity-30 transition-opacity" style={{ color: feature.color }}>
        {'0' + (index + 1)}
      </div>

      {/* Icone */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: feature.color + '14', border: '1px solid ' + feature.color + '22' }}
      >
        <feature.icon
          className="w-5 h-5 transition-all duration-300"
          style={{ color: feature.color, filter: hovered ? ('drop-shadow(0 0 5px ' + feature.color + ')') : 'none' }}
        />
      </div>

      <h3 className="font-syne font-bold text-base mb-2">{feature.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{feature.desc}</p>

      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: feature.color + '12', color: feature.color }}>
        {feature.detail}
      </span>
    </div>
  );
}

export default function Features() {
  var { ref: titleRef, visible: titleVis } = useReveal(0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 section-glow-green">
      <div ref={titleRef} className={'text-center mb-16 reveal' + (titleVis ? ' visible' : '')}>
        <span className="text-br-green font-mono text-xs uppercase tracking-[0.2em]">Por que usar</span>
        <h2 className="font-syne font-extrabold text-4xl sm:text-5xl mt-3 mb-4 leading-tight">
          Tudo que sua{' '}
          <span style={{ background: 'linear-gradient(135deg,#fff 20%,#39FF14 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            viagem precisa
          </span>
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          De Oiapoque ao Chuí, do litoral ao sertao. O BoraRodar tem tudo para sua aventura ser incrivel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(function(f, i) { return <FeatureCard key={i} feature={f} index={i} />; })}
      </div>

      {/* Banner inferior */}
      <div
        className="mt-12 rounded-2xl p-6 sm:p-8 grid grid-cols-3 gap-4 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(57,255,20,0.05) 0%,rgba(0,212,255,0.05) 100%)', border: '1px solid rgba(57,255,20,0.12)' }}
      >
        {[{ v:'100%', l:'Gratis para usar'}, {v:'OSM', l:'Mapas open source'}, {v:'0', l:'API keys obrigatorias'}].map(function({ v, l }) {
          return (
            <div key={l}>
              <div className="font-syne font-extrabold text-2xl sm:text-3xl text-br-green">{v}</div>
              <div className="text-gray-500 text-xs mt-1">{l}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
