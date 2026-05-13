'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Waves, Utensils, Music, Landmark, Trees, Sun, MapPin, Star, ArrowRight } from 'lucide-react';

var THEMATIC = [
  { icon: Waves,    color: '#00D4FF', title: 'Rota das Cachoeiras',  desc: 'Chapada Diamantina, Bonito, Chapada dos Veadeiros. Agua pura e trilhas de tirar o folego.',     tag: 'Natureza',    km: '800+ km' },
  { icon: Utensils, color: '#FF6B35', title: 'Rota Gastro do Sul',   desc: 'Caminhos de Pedra, Vale dos Vinhedos, colonia gaucha. Comida de raiz e vinho artesanal.',        tag: 'Gastronomia', km: '350 km' },
  { icon: Music,    color: '#B24BF3', title: 'Rota do Rock',         desc: 'Porto Alegre, Curitiba, Sao Paulo. Os melhores palcos e bares do rock nacional.',                tag: 'Cultura',     km: '1.100 km' },
  { icon: Landmark, color: '#39FF14', title: 'Rota Colonial MG',     desc: 'Ouro Preto, Tiradentes, Mariana, Congonhas. Arte barroca e historia da inconfidencia.',         tag: 'Historia',    km: '420 km' },
  { icon: Trees,    color: '#39FF14', title: 'Transpantaneira',      desc: 'A estrada mais selvagem do Brasil. Jacarés, capivaras e tuiuius a cada curva no Pantanal.',     tag: 'Aventura',    km: '148 km' },
  { icon: Sun,      color: '#FF6B35', title: 'Rota do Sol (RN-CE)',  desc: 'Natal, Pipa, Canoa Quebrada, Jericoacoara. Dunas, lagoas e falesias laranja no por do sol.',    tag: 'Praia',       km: '530 km' },
];

var DESTINATIONS = [
  { city: 'Bonito',               state: 'MS', desc: 'Snorkel em rios cristalinos, grutas e ecoturismo de alto nivel.',           rating: 4.9, cat: 'Natureza',    color: '#00D4FF' },
  { city: 'Gramado',              state: 'RS', desc: 'Culinaria europeia, chocolate artesanal e festival de cinema.',              rating: 4.8, cat: 'Gastronomia', color: '#FF6B35' },
  { city: 'Chapada Diamantina',   state: 'BA', desc: 'Cachoeiras, cavernas e trilhas incriveis no coracao do Brasil.',            rating: 4.9, cat: 'Natureza',    color: '#39FF14' },
  { city: 'Tiradentes',           state: 'MG', desc: 'Centro historico barroco, cachaçaria e festival de gastronomia.',           rating: 4.7, cat: 'Historia',    color: '#B24BF3' },
  { city: 'Jericoacoara',         state: 'CE', desc: 'Dunas, kitesurf, lagoas e pores do sol lendarios.',                        rating: 4.9, cat: 'Praia',       color: '#FF6B35' },
  { city: 'Sao Thome das Letras', state: 'MG', desc: 'Misticismo, trilhas e cachoeiras na Serra da Mantiqueira.',                 rating: 4.6, cat: 'Aventura',    color: '#B24BF3' },
];

var CATS = ['Todos', 'Natureza', 'Gastronomia', 'Historia', 'Praia', 'Aventura', 'Cultura'];

export default function ExplorePage() {
  var [tab, setTab] = useState('rotas');
  var [cat, setCat] = useState('Todos');
  var filtered = cat === 'Todos' ? DESTINATIONS : DESTINATIONS.filter(function(d) { return d.cat === cat; });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <span className="text-br-purple font-mono text-xs uppercase tracking-widest">Descubra</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">Explorar o Brasil 🌄</h1>
        <p className="text-gray-500 mt-2">Rotas tematicas, destinos incriveis e achados secretos.</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-white/5">
        {[{ k: 'rotas', l: 'Rotas Tematicas' }, { k: 'destinos', l: 'Destinos' }].map(function({ k, l }) {
          return (
            <button key={k} onClick={function() { setTab(k); }} className={'px-5 py-2.5 font-syne font-bold text-sm border-b-2 transition-all -mb-px ' + (tab === k ? 'border-br-purple text-br-purple' : 'border-transparent text-gray-500 hover:text-white')}>
              {l}
            </button>
          );
        })}
      </div>

      {tab === 'rotas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMATIC.map(function(r, i) {
            return (
              <Link key={i} href="/planejar" className="br-card p-6 block hover:-translate-y-1 transition-transform group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: r.color + '18' }}>
                  <r.icon className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <h3 className="font-syne font-bold text-base mb-2 group-hover:text-br-green transition-colors">{r.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{r.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 rounded" style={{ background: r.color + '18', color: r.color }}>{r.tag}</span>
                  <span className="text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{r.km}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {tab === 'destinos' && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATS.map(function(c) {
              return (
                <button key={c} onClick={function() { setCat(c); }} className={'px-4 py-1.5 rounded-full text-sm font-medium transition-all ' + (cat === c ? 'bg-br-green text-black' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5')}>
                  {c}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(function(d, i) {
              return (
                <div key={i} className="br-card p-6 hover:-translate-y-1 transition-transform">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-syne font-bold text-lg">{d.city}</h3>
                      <span className="text-gray-500 text-sm">{d.state}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{d.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{d.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: d.color + '18', color: d.color }}>{d.cat}</span>
                    <Link href={'/planejar?destino=' + encodeURIComponent(d.city + ', ' + d.state)} className="text-xs text-gray-500 hover:text-br-green flex items-center gap-1 transition-colors">
                      Planejar <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
