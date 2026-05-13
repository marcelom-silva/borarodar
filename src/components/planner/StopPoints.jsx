'use client';
import { useState } from 'react';
import { Coffee, Fuel, MapPin, Baby, Utensils, Camera, Waves, Landmark, Trees, Star, AlertTriangle, Navigation } from 'lucide-react';

// =============================================================================
// BANCO DE ATRACOES POR REGIAO
// Cada atracao tem: distancia do centro da cidade (km), categoria, rating
// distancia > 40km = Vale o Desvio (alertado mas recomendado)
// =============================================================================
var ATTRACTIONS_DB = {
  'rio':         [
    { name: 'Pedra da Gavea',       dist: 18,  cat: 'Natureza',    stars: 4.8, icon: Trees,    desc: 'Trilha epica com vista de 360 graus da cidade.' },
    { name: 'Petropolis',           dist: 68,  cat: 'Historia',    stars: 4.7, icon: Landmark, desc: 'Palacio imperial, cervejarias e frio gostoso. Vale muito!' },
    { name: 'Angra dos Reis',       dist: 168, cat: 'Praia',       stars: 4.9, icon: Waves,    desc: 'Mais de 300 ilhas. Passeio de barco imperdivel.' },
    { name: 'Buzios',               dist: 172, cat: 'Praia',       stars: 4.8, icon: Waves,    desc: 'Rua das Pedras, praias paradisiacas e frutos do mar.' },
    { name: 'Ilha Grande',          dist: 150, cat: 'Natureza',    stars: 4.9, icon: Trees,    desc: 'Sem carros, trilhas e praias virgens. Acesso por barco.' },
    { name: 'Paraty',               dist: 247, cat: 'Historia',    stars: 4.9, icon: Landmark, desc: 'Centro historico tombado, cachaçarias e a linda baia.' },
  ],
  'sao paulo':   [
    { name: 'Campos do Jordao',     dist: 184, cat: 'Serra',       stars: 4.8, icon: Trees,    desc: 'Visual europeu, frio, chocolate e fondue.' },
    { name: 'Ilhabela',             dist: 218, cat: 'Praia',       stars: 4.9, icon: Waves,    desc: 'Ilha com cachoeiras, praias e mergulho.' },
    { name: 'Brotas',               dist: 240, cat: 'Aventura',    stars: 4.7, icon: Trees,    desc: 'Rafting, rapel e ecoturismo.' },
    { name: 'Holambra',             dist: 138, cat: 'Cultura',     stars: 4.6, icon: Camera,   desc: 'Cidade das flores, heranca holandes, muito colorida.' },
    { name: 'Sao Sebastiao',        dist: 210, cat: 'Praia',       stars: 4.7, icon: Waves,    desc: 'Praias do Litoral Norte, transparentes e tranquilas.' },
    { name: 'Embu das Artes',       dist: 28,  cat: 'Cultura',     stars: 4.5, icon: Camera,   desc: 'Centro historico, feiras de artesanato e antigos.' },
  ],
  'belo horizonte': [
    { name: 'Ouro Preto',           dist: 96,  cat: 'Historia',    stars: 4.9, icon: Landmark, desc: 'Patrimonio da Humanidade. Arte barroca e cachaça.' },
    { name: 'Tiradentes',           dist: 188, cat: 'Historia',    stars: 4.8, icon: Landmark, desc: 'Centro colonial, festival gastro e charme colonial.' },
    { name: 'Serro',                dist: 330, cat: 'Historia',    stars: 4.6, icon: Landmark, desc: 'Queijo do Serro original, vales e serra.' },
    { name: 'Inhotim',              dist: 70,  cat: 'Arte',        stars: 4.9, icon: Camera,   desc: 'O maior museo de arte a ceu aberto do mundo.' },
    { name: 'Serra do Cipo',        dist: 100, cat: 'Natureza',    stars: 4.8, icon: Trees,    desc: 'Cachoeiras, trilhas e rapel no Cerrado.' },
    { name: 'Diamantina',           dist: 296, cat: 'Historia',    stars: 4.8, icon: Landmark, desc: 'Patrimonio historico com diamantes e muito charme.' },
  ],
  'brasilia':    [
    { name: 'Chapada dos Veadeiros', dist: 262, cat: 'Natureza',   stars: 4.9, icon: Trees,    desc: 'Cachoeiras incriveis no Cerrado. Uno dos mais bonitos do Brasil.' },
    { name: 'Pirenopolis',           dist: 150, cat: 'Historia',   stars: 4.7, icon: Landmark, desc: 'Cidade historica com cachoeiras nas redondezas.' },
    { name: 'Cristalina',            dist: 120, cat: 'Compras',    stars: 4.3, icon: Star,     desc: 'Cristais, gemas e pedras preciosas a precos de fabrica.' },
    { name: 'Caldas Novas',          dist: 250, cat: 'Termas',     stars: 4.5, icon: Waves,    desc: 'Aguas termais naturais. Perfeito para relaxar.' },
  ],
  'florianopolis': [
    { name: 'Praia do Campeche',     dist: 25,  cat: 'Praia',      stars: 4.8, icon: Waves,    desc: 'Uma das mais bonitas da ilha. Agua cristalina.' },
    { name: 'Lagoa da Conceicao',    dist: 15,  cat: 'Natureza',   stars: 4.7, icon: Waves,    desc: 'Kitesurf, restaurantes e bares a beira da lagoa.' },
    { name: 'Governador Celso Ramos',dist: 74,  cat: 'Praia',      stars: 4.5, icon: Waves,    desc: 'Ostras fresquissimas direto do produtor. Experiencia unica.' },
    { name: 'Garopaba',              dist: 90,  cat: 'Surf',       stars: 4.7, icon: Waves,    desc: 'Capital nacional do surf. Ondas incriveis.' },
  ],
  'curitiba':    [
    { name: 'Vila Velha',            dist: 100, cat: 'Natureza',   stars: 4.7, icon: Trees,    desc: 'Formacoes rochosas milenares no Parana.' },
    { name: 'Morretes',              dist: 75,  cat: 'Gastronomia',stars: 4.8, icon: Utensils, desc: 'Barreado delicioso e trem da serra como atrativo.' },
    { name: 'Paranagua',             dist: 91,  cat: 'Historia',   stars: 4.4, icon: Landmark, desc: 'Porto historico, frutos do mar e barreado.' },
    { name: 'Antonina',              dist: 83,  cat: 'Historia',   stars: 4.5, icon: Landmark, desc: 'Cidade historica na baia de Paranagua.' },
  ],
  'porto alegre': [
    { name: 'Gramado',               dist: 115, cat: 'Serra',      stars: 4.9, icon: Trees,    desc: 'Chocolate, fondue, festival de cinema e charme europeu.' },
    { name: 'Canela',                dist: 120, cat: 'Natureza',   stars: 4.8, icon: Trees,    desc: 'Parque do Caracol, Catedral de Pedra e cascata.' },
    { name: 'Vale dos Vinhedos',     dist: 130, cat: 'Enoturismo', stars: 4.9, icon: Camera,   desc: 'Vinhos finos, gastronomia italiana e paisagens europeias.' },
    { name: 'Torres',                dist: 186, cat: 'Praia',      stars: 4.7, icon: Waves,    desc: 'Falesias, praias e canyons na fronteira com SC.' },
  ],
  'salvador':    [
    { name: 'Morro de Sao Paulo',    dist: 250, cat: 'Praia',      stars: 4.9, icon: Waves,    desc: 'Sem carros. Praias paradisiacas e vida noturna.' },
    { name: 'Chapada Diamantina',    dist: 424, cat: 'Natureza',   stars: 4.9, icon: Trees,    desc: 'Cachoeiras, grutas e trilhas. Um dos mais bonitos do Brasil.' },
    { name: 'Praia do Forte',        dist: 80,  cat: 'Praia',      stars: 4.7, icon: Waves,    desc: 'Projeto Tamar, coqueiros e aguas cristalinas.' },
    { name: 'Itacare',               dist: 400, cat: 'Surf',       stars: 4.8, icon: Waves,    desc: 'Capital baiana do surf, com cacau e aguas verdes.' },
  ],
};

// Encontra atracoes com base no destino
function findAttractions(destLabel) {
  if (!destLabel) return [];
  var dest = destLabel.toLowerCase();
  var key  = Object.keys(ATTRACTIONS_DB).find(function(k) { return dest.includes(k); });
  return key ? ATTRACTIONS_DB[key] : [];
}

// Paradas de estrada baseadas na distancia
function getStops(distKm) {
  var n    = Math.max(1, Math.floor(distKm / 150));
  var step = distKm / (n + 1);
  var tpls = [
    { type: 'Posto',        icon: Fuel,     color: '#00D4FF', name: 'Posto BR',                   desc: 'Banheiro limpo, loja e cafezinho.' },
    { type: 'Restaurante',  icon: Utensils, color: '#FF6B35', name: 'Churrascaria do Estradeiro',  desc: 'Buffet por kilo, classico da estrada.' },
    { type: 'Cafe',         icon: Coffee,   color: '#39FF14', name: 'Padaria Estrada Real',         desc: 'Cafe forte e salgados quentinhos.' },
    { type: 'Vista',        icon: Camera,   color: '#B24BF3', name: 'Mirante da Serra',             desc: 'Parada obrigatoria para fotos.' },
    { type: 'Fralda+',      icon: Baby,     color: '#39FF14', name: 'Fraldario e Espaco Kids',      desc: 'Estrutura para bebes e criancas.' },
  ];
  var stops = [];
  for (var i = 0; i < n; i++) {
    var t = tpls[i % tpls.length];
    stops.push(Object.assign({}, t, { km: Math.round(step * (i + 1)) }));
  }
  return stops;
}

// =============================================================================
// COMPONENTE: Card de Atracao
// =============================================================================
function AttractionCard({ att, totalDays }) {
  var isDetour = att.dist > 40;
  var dayTrip  = att.dist < 80; // visita rapida no mesmo dia

  return (
    <div className={'border rounded-xl p-4 transition-all hover:-translate-y-0.5' + (isDetour ? ' border-br-orange/20 bg-br-orange/5' : ' border-white/6 bg-white/2')}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isDetour ? 'rgba(255,107,53,0.15)' : 'rgba(0,212,255,0.1)' }}>
            <att.icon className="w-4 h-4" style={{ color: isDetour ? '#FF6B35' : '#00D4FF' }}/>
          </div>
          <div>
            <p className="font-syne font-bold text-sm">{att.name}</p>
            <p className="text-xs text-gray-600">{att.cat}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Distancia */}
          <span className="text-xs font-mono font-bold" style={{ color: isDetour ? '#FF6B35' : '#39FF14' }}>
            {att.dist} km
          </span>
          {/* Rating */}
          <span className="flex items-center gap-0.5 text-yellow-400 text-xs">
            <Star className="w-3 h-3 fill-current"/>
            {att.stars}
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mb-2">{att.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {isDetour ? (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-br-orange/15 text-br-orange font-medium">
            <AlertTriangle className="w-3 h-3"/>
            Vale o Desvio ({att.dist} km)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-br-green/12 text-br-green font-medium">
            <Navigation className="w-3 h-3"/>
            Perto da rota
          </span>
        )}
        {dayTrip && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
            Passeio de 1 dia
          </span>
        )}
        {!dayTrip && totalDays >= 2 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
            Recomendado 1 noite
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function StopPoints({ distance, days, destLabel }) {
  var [tab, setTab] = useState('paradas');
  var stops       = getStops(distance);
  var attractions = findAttractions(destLabel || '');
  var totalDays   = days || 1;

  // Separa atracoes proximas e com desvio
  var nearby  = attractions.filter(function(a) { return a.dist <= 40; });
  var detours = attractions.filter(function(a) { return a.dist > 40; });

  return (
    <div className="br-card p-6">
      {/* Header com dias */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-syne font-bold text-lg">Paradas e Atracoes 📍</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {totalDays === 1
              ? 'Viagem de 1 dia'
              : totalDays + ' dias na regiao — mais tempo para explorar!'
            }
          </p>
        </div>
        {/* Badge de dias */}
        <div className="text-center bg-br-green/10 border border-br-green/20 rounded-xl px-4 py-2 flex-shrink-0">
          <div className="font-syne font-extrabold text-xl text-br-green">{totalDays}</div>
          <div className="text-xs text-gray-500">{totalDays === 1 ? 'dia' : 'dias'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white/3 p-1 rounded-xl">
        {[
          { k: 'paradas', l: 'Pit Stops (' + stops.length + ')' },
          { k: 'atracao', l: 'Atrações (' + attractions.length + ')' },
        ].map(function({ k, l }) {
          return (
            <button
              key={k}
              onClick={function() { setTab(k); }}
              className={'flex-1 py-2 rounded-lg text-sm font-syne font-medium transition-all ' + (tab === k ? 'bg-[#141414] text-white shadow' : 'text-gray-500 hover:text-white')}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* PIT STOPS */}
      {tab === 'paradas' && (
        <div className="space-y-3">
          {stops.map(function(s, i) {
            return (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/3 border border-white/5 rounded-xl">
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-syne font-bold text-sm">{s.name}</span>
                    <span className="text-xs text-gray-600 font-mono flex-shrink-0">km {s.km}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-md flex-shrink-0" style={{ background: s.color + '18', color: s.color }}>{s.type}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ATRACOES */}
      {tab === 'atracao' && (
        <div>
          {attractions.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-20"/>
              <p className="text-sm">Insira um destino conhecido para ver as atracoes da regiao.</p>
              <p className="text-xs text-gray-700 mt-1">Ex: Rio de Janeiro, Belo Horizonte, Florianopolis...</p>
            </div>
          ) : (
            <>
              {/* Proximas da rota */}
              {nearby.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="w-4 h-4 text-br-green"/>
                    <span className="font-syne font-bold text-sm text-br-green">Proximas da rota</span>
                  </div>
                  <div className="space-y-3">
                    {nearby.map(function(a, i) { return <AttractionCard key={i} att={a} totalDays={totalDays}/>; })}
                  </div>
                </div>
              )}

              {/* Vale o Desvio */}
              {detours.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-br-orange"/>
                    <span className="font-syne font-bold text-sm text-br-orange">Vale o Desvio</span>
                    <span className="text-xs text-gray-600">— mais de 40 km, mas valem demais!</span>
                  </div>
                  <div className="space-y-3">
                    {detours.map(function(a, i) { return <AttractionCard key={i} att={a} totalDays={totalDays}/>; })}
                  </div>
                </div>
              )}

              {/* Dica baseada nos dias */}
              <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.15)' }}>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {totalDays === 1 && 'Com 1 dia, foque nas atracoes marcadas como "Perto da rota". Para os desvios, planeje uma viagem mais longa!'}
                  {totalDays === 2 && 'Com 2 dias voce consegue visitar as atracoes proximas com calma e ainda fazer 1 desvio menor.'}
                  {totalDays >= 3 && 'Otimo! Com ' + totalDays + ' dias voce tem tempo para as atracoes proximas E os desvios que valem a pena. Vai com calma e aproveite!'}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
