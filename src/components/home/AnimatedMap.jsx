'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Clock, Fuel } from 'lucide-react';

function useReveal(delay) {
  var ref = useRef(null);
  var [visible, setVisible] = useState(false);
  useEffect(function() {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        setTimeout(function() { setVisible(true); obs.disconnect(); }, delay || 0);
      }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return function() { obs.disconnect(); };
  }, [delay]);
  return { ref, visible };
}

// Cidades e posicoes no mapa esquematico (viewBox 860 x 480)
var CITIES = [
  { id: 'poa',  name: 'Porto Alegre',  x: 138, y: 432, size: 5 },
  { id: 'cwb',  name: 'Curitiba',      x: 178, y: 360, size: 5 },
  { id: 'sao',  name: 'Sao Paulo',     x: 200, y: 298, size: 7 },
  { id: 'rio',  name: 'Rio de Janeiro',x: 360, y: 282, size: 7 },
  { id: 'bho',  name: 'Belo Horizonte',x: 308, y: 218, size: 6 },
  { id: 'bsb',  name: 'Brasilia',      x: 310, y: 148, size: 6 },
  { id: 'goi',  name: 'Goiania',       x: 262, y: 172, size: 4 },
  { id: 'ssa',  name: 'Salvador',      x: 490, y: 172, size: 5 },
  { id: 'rec',  name: 'Recife',        x: 566, y: 128, size: 5 },
  { id: 'for',  name: 'Fortaleza',     x: 510, y: 82,  size: 4 },
  { id: 'cgr',  name: 'Campo Grande',  x: 218, y: 262, size: 4 },
  { id: 'bel',  name: 'Belem',         x: 340, y: 68,  size: 4 },
  { id: 'man',  name: 'Manaus',        x: 158, y: 88,  size: 4 },
  { id: 'vix',  name: 'Vitoria',       x: 420, y: 228, size: 3 },
];

// Estradas de fundo (BR-116, BR-101, BR-040, etc.) — linhas sutis
var BACKGROUND_ROADS = [
  // BR-116 espinha dorsal
  'M 138,432 L 178,360 L 200,298 L 240,210 L 262,172 L 310,148',
  // BR-101 litoral
  'M 138,432 L 178,360 L 230,320 L 360,282 L 420,228 L 490,172 L 566,128 L 510,82',
  // BR-040 interior
  'M 360,282 L 308,218 L 310,148',
  // BR-060
  'M 310,148 L 262,172 L 218,262 L 200,298',
  // Conexoes nordeste
  'M 490,172 L 566,128 L 510,82 L 340,68',
  // Norte
  'M 310,148 L 340,68 L 158,88',
  // Mato Grosso
  'M 218,262 L 200,298',
  // Espirito Santo
  'M 360,282 L 420,228 L 490,172',
];

// Rota animada do carrinho: SP → RJ → BH → Brasilia → Goiania → SP
var ROUTE_PATH = 'M 200,298 C 270,292 330,286 360,282 C 338,258 320,236 308,218 C 308,188 309,168 310,148 C 290,154 274,163 262,172 C 240,210 222,256 200,298 Z';

// Rota em linha reta simples para o animateMotion (precisa ser um path aberto)
var MOTION_PATH = 'M 200,298 C 270,292 330,286 360,282 C 338,258 320,236 308,218 C 308,188 309,168 310,148 C 290,154 274,163 262,172 C 240,210 222,256 200,298';

var ROUTE_INFO = [
  { from: 'Sao Paulo', to: 'Rio de Janeiro', km: '431 km', time: '~5h',   price: 'R$ 180' },
  { from: 'Rio de Janeiro', to: 'Belo Horizonte', km: '434 km', time: '~5h',   price: 'R$ 185' },
  { from: 'Belo Horizonte', to: 'Brasilia', km: '716 km', time: '~7h30', price: 'R$ 290' },
  { from: 'Brasilia', to: 'Sao Paulo', km: '1.015 km', time: '~10h',  price: 'R$ 400' },
];

export default function AnimatedMap() {
  var [activeCity,   setActiveCity]   = useState(null);
  var [activeRoute,  setActiveRoute]  = useState(0);
  var { ref: leftRef,  visible: leftVis  } = useReveal(0);
  var { ref: rightRef, visible: rightVis } = useReveal(150);

  useEffect(function() {
    var t = setInterval(function() {
      setActiveRoute(function(prev) { return (prev + 1) % ROUTE_INFO.length; });
    }, 3000);
    return function() { clearInterval(t); };
  }, []);

  var route = ROUTE_INFO[activeRoute];

  return (
    <section className="section-alt py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-br-blue font-mono text-xs uppercase tracking-[0.2em]">Cobertura Nacional</span>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl mt-3">
            De qualquer cidade{' '}
            <span style={{ background: 'linear-gradient(135deg,#fff 20%,#00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              a qualquer destino
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
            Calcule rotas em todo o Brasil. O carrinho abaixo percorre uma das rotas mais populares do pais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">

          {/* Painel esquerdo — info da rota */}
          <div
            ref={leftRef}
            className={'lg:col-span-2 reveal-left' + (leftVis ? ' visible' : '')}
          >
            <div className="br-card p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-br-green animate-pulse" />
                <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Rota em destaque</span>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Origem</div>
                  <div className="font-syne font-bold text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-br-green" />
                    {route.from}
                  </div>
                </div>
                <div className="text-gray-700 font-mono">→</div>
                <div className="flex-1 text-right">
                  <div className="text-xs text-gray-600 mb-1">Destino</div>
                  <div className="font-syne font-bold text-sm flex items-center justify-end gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-br-orange" />
                    {route.to}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Navigation, label: 'Distancia', value: route.km,    color: '#39FF14' },
                  { icon: Clock,      label: 'Tempo',     value: route.time,  color: '#00D4FF' },
                  { icon: Fuel,       label: 'Combustivel', value: route.price, color: '#FF6B35' },
                ].map(function({ icon: Icon, label, value, color }, i) {
                  return (
                    <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
                      <Icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color: color }} />
                      <div className="font-syne font-bold text-sm" style={{ color: color }}>{value}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dots de progresso */}
            <div className="flex justify-center gap-2 mb-6">
              {ROUTE_INFO.map(function(_, i) {
                return (
                  <button
                    key={i}
                    onClick={function() { setActiveRoute(i); }}
                    className="transition-all duration-300 rounded-full"
                    style={{ width: activeRoute === i ? '24px' : '8px', height: '8px', background: activeRoute === i ? '#39FF14' : 'rgba(255,255,255,0.15)' }}
                  />
                );
              })}
            </div>

            <Link href="/planejar" className="btn-neon w-full flex items-center justify-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              Planejar minha rota
            </Link>
          </div>

          {/* MAPA SVG ANIMADO */}
          <div
            ref={rightRef}
            className={'lg:col-span-3 reveal-right' + (rightVis ? ' visible' : '')}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ background: '#0D0D0D', border: '1px solid rgba(57,255,20,0.15)' }}
            >
              {/* Label do mapa */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-br-green animate-pulse" />
                <span className="text-xs text-gray-400 font-mono">BRASIL — MAPA ESQUEMATICO</span>
              </div>

              <svg
                viewBox="0 0 640 420"
                className="w-full"
                style={{ display: 'block' }}
              >
                {/* Fundo */}
                <rect width="640" height="420" fill="#0D0D0D"/>

                {/* Grid interno do mapa */}
                <defs>
                  <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"/>
                  </pattern>
                  <filter id="glow-green">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="glow-car">
                    <feGaussianBlur stdDeviation="4" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <rect width="640" height="420" fill="url(#map-grid)"/>

                {/* === ESTRADAS DE FUNDO (sutis) === */}
                {BACKGROUND_ROADS.map(function(d, i) {
                  return (
                    <path
                      key={i}
                      d={d}
                      fill="none"
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* === ROTA DESTACADA (glow verde) === */}
                {/* Sombra da rota */}
                <path
                  d={ROUTE_PATH}
                  fill="none"
                  stroke="rgba(57,255,20,0.15)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Rota principal */}
                <path
                  id="main-route"
                  d={ROUTE_PATH}
                  fill="none"
                  stroke="#39FF14"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 3"
                  filter="url(#glow-green)"
                />

                {/* === CIDADES === */}
                {CITIES.map(function(city) {
                  var isActive = activeCity === city.id;
                  var isOnRoute = ['sao','rio','bho','bsb','goi'].includes(city.id);
                  return (
                    <g
                      key={city.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={function() { setActiveCity(city.id); }}
                      onMouseLeave={function() { setActiveCity(null); }}
                    >
                      {/* Ping ao redor das cidades da rota */}
                      {isOnRoute && (
                        <circle
                          cx={city.x} cy={city.y}
                          r={city.size + 3}
                          fill="none"
                          stroke="rgba(57,255,20,0.4)"
                          strokeWidth="1"
                          style={{ animation: 'ping-city 2s ease-out infinite', transformOrigin: city.x + 'px ' + city.y + 'px' }}
                        />
                      )}
                      {/* Dot da cidade */}
                      <circle
                        cx={city.x} cy={city.y}
                        r={city.size}
                        fill={isOnRoute ? '#39FF14' : '#2a2a2a'}
                        stroke={isOnRoute ? 'rgba(57,255,20,0.5)' : 'rgba(255,255,255,0.1)'}
                        strokeWidth="1"
                        opacity={isActive ? 1 : 0.85}
                      />
                      {/* Nome da cidade */}
                      <text
                        x={city.x + city.size + 4}
                        y={city.y + 4}
                        fill={isOnRoute ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight={isOnRoute ? '700' : '400'}
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}

                {/* === CARRINHO ANIMADO === */}
                <g filter="url(#glow-car)" style={{ animation: 'car-glow 1.8s ease-in-out infinite' }}>
                  <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#main-route" />
                  </animateMotion>

                  {/* Corpo do carro (top-down view) */}
                  <rect x="-8" y="-13" width="16" height="26" rx="4" fill="#39FF14"/>
                  {/* Parabrisas */}
                  <rect x="-5.5" y="-11" width="11" height="7" rx="1.5" fill="rgba(0,0,0,0.45)"/>
                  {/* Vidro traseiro */}
                  <rect x="-5.5" y="4"  width="11" height="6" rx="1.5" fill="rgba(0,0,0,0.35)"/>
                  {/* Rodas */}
                  <rect x="-10" y="-9"  width="4"  height="7" rx="1.5" fill="#0A0A0A"/>
                  <rect x="6"   y="-9"  width="4"  height="7" rx="1.5" fill="#0A0A0A"/>
                  <rect x="-10" y="3"   width="4"  height="7" rx="1.5" fill="#0A0A0A"/>
                  <rect x="6"   y="3"   width="4"  height="7" rx="1.5" fill="#0A0A0A"/>
                  {/* Detalhe central */}
                  <rect x="-2" y="-4" width="4" height="8" rx="1" fill="rgba(0,0,0,0.3)"/>
                </g>

                {/* Legenda */}
                <g transform="translate(450, 370)">
                  <rect width="175" height="40" rx="6" fill="rgba(0,0,0,0.7)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
                  <circle cx="14" cy="14" r="4" fill="#39FF14"/>
                  <text x="24" y="18" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">Rota destacada</text>
                  <circle cx="14" cy="28" r="4" fill="rgba(42,42,42,1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                  <text x="24" y="32" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">Outras cidades</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
