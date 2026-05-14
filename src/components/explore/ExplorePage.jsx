'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Waves, Utensils, Music, Landmark, Trees, Sun, MapPin, Star, ArrowRight, Navigation, Map, Clock, ExternalLink, ChevronDown } from 'lucide-react';
import DayTripMap from '@/components/ui/DayTripMap';
import { useLanguage } from '@/contexts/LanguageContext';

// ===== ROTAS TEMATICAS =====
var THEMATIC = [
  { icon:Waves,    color:'#00D4FF', title:'Rota das Cachoeiras',  desc:'Chapada Diamantina, Bonito, Chapada dos Veadeiros.',tag:'Natureza',    km:'800+ km' },
  { icon:Utensils, color:'#FF6B35', title:'Rota Gastro do Sul',   desc:'Caminhos de Pedra, Vale dos Vinhedos, colonia gaucha.', tag:'Gastronomia', km:'350 km' },
  { icon:Music,    color:'#B24BF3', title:'Rota do Rock',         desc:'Porto Alegre, Curitiba, Sao Paulo. Os melhores palcos.', tag:'Cultura',     km:'1.100 km' },
  { icon:Landmark, color:'#39FF14', title:'Rota Colonial MG',     desc:'Ouro Preto, Tiradentes, Mariana. Arte barroca.',          tag:'Historia',    km:'420 km' },
  { icon:Trees,    color:'#39FF14', title:'Transpantaneira',      desc:'Jacarés, capivaras e tuiuius no Pantanal.',             tag:'Aventura',    km:'148 km' },
  { icon:Sun,      color:'#FF6B35', title:'Rota do Sol (RN-CE)',  desc:'Natal, Pipa, Canoa Quebrada, Jericoacoara.',            tag:'Praia',       km:'530 km' },
];

// ===== DESTINOS =====
var DESTINATIONS = [
  { city:'Bonito',             state:'MS', desc:'Snorkel em rios cristalinos, grutas e ecoturismo.',rating:4.9, cat:'Natureza',    color:'#00D4FF' },
  { city:'Gramado',            state:'RS', desc:'Culinaria europeia, chocolate artesanal e cinema.',rating:4.8, cat:'Gastronomia', color:'#FF6B35' },
  { city:'Chapada Diamantina', state:'BA', desc:'Cachoeiras, cavernas e trilhas no coracao do Brasil.',rating:4.9, cat:'Natureza',    color:'#39FF14' },
  { city:'Tiradentes',         state:'MG', desc:'Centro historico barroco, cachacaria e festival gastro.',rating:4.7, cat:'Historia',    color:'#B24BF3' },
  { city:'Jericoacoara',       state:'CE', desc:'Dunas, kitesurf, lagoas e pores do sol lendarios.',rating:4.9, cat:'Praia',       color:'#FF6B35' },
  { city:'Sao Thome',          state:'MG', desc:'Misticismo, trilhas e cachoeiras na Serra da Mantiqueira.',rating:4.6, cat:'Aventura',    color:'#B24BF3' },
];

// ===== PASSEIOS DE UM DIA (curados) =====
var DAY_TRIPS = [
  {
    id:'ouro-preto', emoji:'⛪', color:'#B24BF3',
    title:'Ouro Preto em Um Dia',
    subtitle:'Arte barroca, cachaça e historia da Inconfidencia',
    destination:'Ouro Preto, MG',
    duration:'8h', category:'Historia',
    stops:[
      { name:'Praca Tiradentes',           time:'9:00',  desc:'Ponto central, com o Museu da Inconfidencia.',   lat:-20.3855, lng:-43.5034 },
      { name:'Igreja Sao Francisco de Assis, Ouro Preto',time:'10:00',desc:'Obra-prima do Aleijadinho, barroco brasileiro.',lat:-20.3870, lng:-43.5052 },
      { name:'Mina do Chico Rei, Ouro Preto', time:'11:30',desc:'Visitacao a minas historicas com trilhas subterraneas.',lat:-20.3831, lng:-43.5014 },
      { name:'Casa do Ouvidor Restaurante, Ouro Preto', time:'13:00',desc:'Almoco com culinaria mineira tradicional.',        lat:-20.3859, lng:-43.5041 },
      { name:'Museu do Oratorio, Ouro Preto', time:'15:00',desc:'Colecao de oratorios barrocos em casarao historico.',  lat:-20.3871, lng:-43.5025 },
      { name:'Cachaçaria Nacão Mineira, Ouro Preto', time:'17:00',desc:'Degustacao de cachacas artesanais com vista incrivel.', lat:-20.3849, lng:-43.5038 },
    ],
  },
  {
    id:'gramado', emoji:'🍫', color:'#FF6B35',
    title:'Gramado e Canela',
    subtitle:'Chocolates, fondue e natureza na Serra Gaucha',
    destination:'Gramado, RS',
    duration:'9h', category:'Gastronomia',
    stops:[
      { name:'Avenida Borges de Medeiros, Gramado', time:'9:00',  desc:'Cafe da manha com croissants nas cafeterias da avenida.',lat:-29.3793, lng:-50.8763 },
      { name:'Chocolates Prawer, Gramado',  time:'10:00',desc:'A mais famosa chocolateria de Gramado.',              lat:-29.3778, lng:-50.8751 },
      { name:'Mini Mundo, Gramado',         time:'11:00',desc:'Miniaturas 1:24 de monumentos mundiais em jardim.',   lat:-29.3743, lng:-50.8835 },
      { name:'Fondue Serra Palace, Gramado',time:'12:30',desc:'O classico fondue de queijo e chocolate.',             lat:-29.3765, lng:-50.8762 },
      { name:'Parque do Caracol, Canela',   time:'14:30',desc:'Cachoeira de 131m e trilhas na mata nativa.',         lat:-29.3424, lng:-50.8387 },
      { name:'Lago Negro, Gramado',         time:'17:00',desc:'Passeio de pedalinho no lago entre pinheiros.',       lat:-29.3741, lng:-50.8686 },
    ],
  },
  {
    id:'bonito', emoji:'💦', color:'#00D4FF',
    title:'Bonito — Aguas Cristalinas',
    subtitle:'Snorkel, grutas e ecoturismo de alto nivel',
    destination:'Bonito, MS',
    duration:'8h', category:'Natureza',
    stops:[
      { name:'Gruta do Lago Azul, Bonito',  time:'7:30',  desc:'Caverna com lago azul turquesa, visita guiada.',    lat:-21.1618, lng:-56.5010 },
      { name:'Aquario Natural, Bonito',      time:'10:00',desc:'Snorkel em rio cristalino com peixes coloridos.',   lat:-21.1389, lng:-56.5063 },
      { name:'Restaurante Taboa, Bonito',    time:'12:30',desc:'Almoco regional com peixe do Pantanal e buffet.',   lat:-21.1333, lng:-56.4868 },
      { name:'Rio da Prata, Bonito',         time:'14:00',desc:'Flutuacao com visibilidade incrivel.',               lat:-21.1567, lng:-56.3817 },
      { name:'Estancia Mimosa, Bonito',      time:'17:30',desc:'Trilha leve com vista para o cerrado ao por do sol.',lat:-21.1443, lng:-56.4712 },
    ],
  },
  {
    id:'campos-jordao', emoji:'🌲', color:'#39FF14',
    title:'Campos do Jordao em Um Dia',
    subtitle:'Serra, chocolates e natureza a 2h de SP',
    destination:'Campos do Jordao, SP',
    duration:'8h', category:'Natureza',
    stops:[
      { name:'Capivari Campos do Jordao',   time:'9:00',  desc:'Cafe da manha com quentao e broa de milho.',       lat:-22.7333, lng:-45.5912 },
      { name:'Horto Florestal, Campos do Jordao',time:'10:30',desc:'Parque com trilhas entre pinheiros e lagos.',       lat:-22.7186, lng:-45.5983 },
      { name:'Baden Baden Pub, Campos do Jordao', time:'13:00',desc:'Hamburguer artesanal e chope da cervejaria iconica.', lat:-22.7340, lng:-45.5894 },
      { name:'Teleferico de Campos do Jordao',time:'15:00',desc:'Vista panoramica a 1.900m de altitude.',             lat:-22.7350, lng:-45.5921 },
      { name:'Pico do Itapeva, Campos do Jordao', time:'16:30',desc:'Mirante mais alto: vista de ate 40km em dia claro.',  lat:-22.7025, lng:-45.5742 },
    ],
  },
  {
    id:'chapada-veadeiros', emoji:'🌄', color:'#FFD700',
    title:'Chapada dos Veadeiros',
    subtitle:'Cachoeiras, trilhas e cristais no Cerrado',
    destination:'Alto Paraiso de Goias, GO',
    duration:'9h', category:'Aventura',
    stops:[
      { name:'Cachoeira de Santa Barbara, Alto Paraiso',time:'7:00',desc:'Piscinas naturais azul-turquesa. Va cedo!',        lat:-14.1167, lng:-47.6333 },
      { name:'Alto Paraiso de Goias',       time:'10:00',desc:'Lojas de cristais e pedras semi-preciosas.',          lat:-14.1128, lng:-47.5089 },
      { name:'Quintal do Cerrado, Alto Paraiso',time:'12:00',desc:'Almoco com ingredientes e temperos do Cerrado.',      lat:-14.1133, lng:-47.5075 },
      { name:'Parque Nacional Chapada dos Veadeiros',time:'14:00',desc:'Trilha pelas Cariocas (cachoeiras gemeas).',          lat:-14.1667, lng:-47.6500 },
      { name:'Vale da Lua, Chapada dos Veadeiros',time:'17:00',desc:'Formacoes rochosas que parecem paisagem lunar.',     lat:-14.1583, lng:-47.5917 },
    ],
  },
  {
    id:'paraty', emoji:'🏖️', color:'#FF3366',
    title:'Paraty — Historica e Natural',
    subtitle:'Centro colonial, cachaca e praias selvagens',
    destination:'Paraty, RJ',
    duration:'8h', category:'Historia',
    stops:[
      { name:'Centro Historico de Paraty',  time:'8:30',  desc:'Ruas de pedra portuguesa e casaröes coloniais.',    lat:-23.2177, lng:-44.7131 },
      { name:'Alambique Corisco, Paraty',   time:'10:00',desc:'Visita e degustacao de cachaca artesanal regional.', lat:-23.2200, lng:-44.7250 },
      { name:'Cantina do Pescador, Paraty', time:'12:00',desc:'Frutos do mar e moqueca fresquissimos.',              lat:-23.2175, lng:-44.7127 },
      { name:'Praia do Sono, Paraty',       time:'14:00',desc:'Praia selvagem com trilha ou barco, mar calmo.',     lat:-23.2767, lng:-44.7083 },
      { name:'Baia de Paraty',              time:'17:30',desc:'Passeio de escuna com ilhas e por do sol incrivel.', lat:-23.2150, lng:-44.7100 },
    ],
  },
];

// Monta URL multi-parada do Google Maps
function buildMapsRoute(stops, destination) {
  var parts = stops.map(function(s) { return encodeURIComponent(s.name + ', ' + destination); });
  return 'https://www.google.com/maps/dir/' + parts.join('/');
}

// Card de passeio com mapa expansivel
function DayTripCard({ trip, t }) {
  var [showMap, setShowMap] = useState(false);
  var mapsUrl = buildMapsRoute(trip.stops, trip.destination);

  return (
    <div className="br-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{trip.emoji}</span>
            <div>
              <h3 className="font-syne font-bold text-base">{trip.title}</h3>
              <p className="text-gray-500 text-sm">{trip.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:trip.color+'18',color:trip.color}}>{trip.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{trip.duration}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{trip.destination}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 opacity-0"/>{trip.stops.length} {t('daytrip_stops')}</span>
        </div>
      </div>

      {/* Lista de paradas */}
      <div className="p-5 space-y-2">
        {trip.stops.map(function(s, i) {
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-black mt-0.5"
                style={{background: trip.color}}>
                {i+1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-white font-medium">{s.name.split(',')[0]}</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">{s.time}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mapa expandivel */}
      {showMap && (
        <div className="px-5 pb-4">
          <DayTripMap points={trip.stops} height={260} accentColor={trip.color}/>
        </div>
      )}

      {/* Botoes de acao */}
      <div className="px-5 pb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={function() { setShowMap(!showMap); }}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all"
          style={{background:trip.color+'14',color:trip.color,border:'1px solid '+trip.color+'30'}}>
          <Map className="w-3.5 h-3.5"/>
          {showMap ? t('daytrip_hide_map') : t('daytrip_show_map')}
          <ChevronDown className="w-3 h-3" style={{transform:showMap?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
        </button>

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
          style={{background:'rgba(0,212,255,0.12)',color:'#00D4FF',border:'1px solid rgba(0,212,255,0.25)'}}>
          <Navigation className="w-3.5 h-3.5"/>
          {t('daytrip_open_maps')}
          <ExternalLink className="w-2.5 h-2.5"/>
        </a>

        <Link
          href={'/planejar?destino='+encodeURIComponent(trip.destination)}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
          style={{background:'rgba(57,255,20,0.12)',color:'#39FF14',border:'1px solid rgba(57,255,20,0.25)'}}>
          <ArrowRight className="w-3.5 h-3.5"/>
          {t('explore_plan')}
        </Link>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  var { t } = useLanguage();
  var [tab, setTab] = useState('passeios');
  var [cat, setCat] = useState('Todos');

  var CATS    = [t('explore_all'), 'Natureza', 'Gastronomia', 'Historia', 'Praia', 'Aventura', 'Cultura'];
  var filtered= cat === t('explore_all') ? DESTINATIONS : DESTINATIONS.filter(function(d){return d.cat===cat;});

  var TABS = [
    { k:'passeios',  l:t('explore_daytrips') },
    { k:'rotas',     l:t('explore_routes')   },
    { k:'destinos',  l:t('explore_dest')     },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <span className="text-br-purple font-mono text-xs uppercase tracking-widest">{t('explore_tag')}</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">{t('explore_title')} 🌄</h1>
        <p className="text-gray-500 mt-2">{t('explore_sub')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/5">
        {TABS.map(function({ k, l }) {
          return (
            <button key={k} onClick={function(){setTab(k);}}
              className={'px-5 py-2.5 font-syne font-bold text-sm border-b-2 transition-all -mb-px '+(tab===k?'border-br-purple text-br-purple':'border-transparent text-gray-500 hover:text-white')}>
              {l}
            </button>
          );
        })}
      </div>

      {/* ===== PASSEIOS DE UM DIA ===== */}
      {tab === 'passeios' && (
        <div>
          <p className="text-gray-500 text-sm mb-6">{t('explore_daytrips_sub')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAY_TRIPS.map(function(trip) {
              return <DayTripCard key={trip.id} trip={trip} t={t}/>;
            })}
          </div>
        </div>
      )}

      {/* ===== ROTAS TEMATICAS ===== */}
      {tab === 'rotas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMATIC.map(function(r, i) {
            return (
              <Link key={i} href="/planejar" className="br-card p-6 block hover:-translate-y-1 transition-transform group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{background:r.color+'18'}}>
                  <r.icon className="w-5 h-5" style={{color:r.color}}/>
                </div>
                <h3 className="font-syne font-bold text-base mb-2 group-hover:text-br-green transition-colors">{r.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{r.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 rounded" style={{background:r.color+'18',color:r.color}}>{r.tag}</span>
                  <span className="text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3"/>{r.km}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ===== DESTINOS ===== */}
      {tab === 'destinos' && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATS.map(function(c) {
              return (
                <button key={c} onClick={function(){setCat(c);}}
                  className={'px-4 py-1.5 rounded-full text-sm font-medium transition-all '+(cat===c?'bg-br-green text-black':'bg-white/5 text-gray-400 hover:text-white border border-white/5')}>
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
                      <Star className="w-4 h-4 fill-current"/>
                      <span className="font-bold">{d.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{d.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded" style={{background:d.color+'18',color:d.color}}>{d.cat}</span>
                    <Link href={'/planejar?destino='+encodeURIComponent(d.city+', '+d.state)}
                      className="text-xs text-gray-500 hover:text-br-green flex items-center gap-1 transition-colors">
                      {t('explore_plan')} <ArrowRight className="w-3 h-3"/>
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
