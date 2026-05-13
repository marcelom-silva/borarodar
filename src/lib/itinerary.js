// =============================================================================
//  src/lib/itinerary.js
//  Gerador de roteiro dia a dia com base no destino, dias e perfil do viajante
// =============================================================================

// Banco de atrações por cidade (distância em km do centro da cidade)
var CITY_ATTRACTIONS = {
  'rio de janeiro': [
    { time:'08:30', name:'Praia de Copacabana',           cat:'Praia',       icon:'🏖️', dist:0,   desc:'A praia mais famosa do mundo. Va cedo para pegar lugar.' },
    { time:'11:00', name:'Cristo Redentor',               cat:'Historia',    icon:'🗿', dist:8,   desc:'Simbolo do Rio. Acesse de trem ou van pelo Cosme Velho.' },
    { time:'14:00', name:'Por do sol no Arpoador',        cat:'Natureza',    icon:'🌅', dist:4,   desc:'Penhasco entre Ipanema e Copacabana. Chegue 30 min antes.' },
    { time:'10:00', name:'Pao de Acucar',                 cat:'Natureza',    icon:'🏔️', dist:5,   desc:'Vista 360 do Rio. Bondinho ate o topo. Inesquecivel.' },
    { time:'09:00', name:'Museu de Arte Moderna (MAM)',   cat:'Cultura',     icon:'🎨', dist:10,  desc:'Acervo impressionante proximo ao Aterro do Flamengo.' },
    { time:'09:00', name:'Estadio do Maracana (Tour)',    cat:'Cultura',     icon:'⚽', dist:12,  desc:'Tour guiado pelo templo do futebol brasileiro.' },
    { time:'09:00', name:'Bairro de Santa Teresa',        cat:'Cultura',     icon:'🚋', dist:6,   desc:'Bonde, galerias de arte, bares e vista linda da cidade.' },
    { time:'11:00', name:'Mercado Sao Jose + almoco',     cat:'Gastronomia', icon:'🍽️', dist:2,   desc:'Frutos do mar frescos e comida carioca no Centro.' },
    { time:'09:00', name:'Parque Nacional da Tijuca',     cat:'Natureza',    icon:'🌿', dist:18,  desc:'Maior floresta urbana do mundo. Cachoeiras e trilhas.' },
    { time:'08:00', name:'Petropolis — Palacio Imperial', cat:'Historia',    icon:'🏰', dist:68,  desc:'Cidade imperial: museu, rosas, chocolate e charme europeu. Dia inteiro.', distante:true },
    { time:'07:30', name:'Arraial do Cabo',               cat:'Praia',       icon:'🤿', dist:165, desc:'O Caribe brasileiro. Aguas cristalinas e dunas de areia branca. Saia cedo!', distante:true },
    { time:'07:00', name:'Angra dos Reis + Ilha Grande',  cat:'Praia',       icon:'🏝️', dist:168, desc:'Ilhas paradisiacas de barco. Hospede na ilha para aproveitar melhor.', distante:true },
  ],

  'sao paulo': [
    { time:'08:00', name:'Parque Ibirapuera',             cat:'Natureza',    icon:'🌳', dist:0,   desc:'Pulmao verde com museus, lagoa e pista de caminhada.' },
    { time:'10:00', name:'MASP — Av. Paulista',           cat:'Cultura',     icon:'🎨', dist:5,   desc:'Maior acervo de arte do Brasil. Embaixo do MASP tem feira aos domingos.' },
    { time:'09:00', name:'Mercado Municipal (Mercadao)',  cat:'Gastronomia', icon:'🥙', dist:3,   desc:'O famoso sanduiche de mortadela e frutas exoticas. Chegue com fome!' },
    { time:'14:00', name:'Vila Madalena + Beco do Batman',cat:'Cultura',     icon:'🖼️', dist:7,   desc:'O bairro hipster de SP. Grafites incriveis e bares artesanais.' },
    { time:'19:00', name:'Liberdade — jantar japones',    cat:'Gastronomia', icon:'🍜', dist:4,   desc:'O maior bairro japones fora do Japao. Sushi, ramen e yakitori.' },
    { time:'09:00', name:'Pinacoteca do Estado',          cat:'Cultura',     icon:'🏛️', dist:4,   desc:'Museu mais importante de arte brasileira. Jardim tambem e otimo.' },
    { time:'08:00', name:'Campos do Jordao',              cat:'Natureza',    icon:'🌲', dist:180, desc:'Suica brasileira: chocolate, fondue, trilhas e frio gostoso. Dia completo.', distante:true },
    { time:'07:30', name:'Praia de Ubatuba',              cat:'Praia',       icon:'🏖️', dist:220, desc:'Mata Atlantica + 72 praias selvagens. Uma das mais bonitas do Brasil.', distante:true },
    { time:'08:00', name:'Embu das Artes',                cat:'Cultura',     icon:'🛍️', dist:28,  desc:'Feira de artesanato, antiguidades e art popular aos fins de semana.' },
  ],

  'belo horizonte': [
    { time:'09:00', name:'Mercado Central de BH',         cat:'Gastronomia', icon:'🧀', dist:0,   desc:'O melhor do mineiro: queijo, goiabada, rapadura e cachaça de qualidade.' },
    { time:'11:00', name:'Igreja Sao Francisco (Pampulha)',cat:'Cultura',    icon:'⛪', dist:8,   desc:'Obra prima de Oscar Niemeyer + Candido Portinari. Patrimonio UNESCO.' },
    { time:'14:00', name:'Parque das Mangabeiras',        cat:'Natureza',    icon:'🌿', dist:10,  desc:'Vista panoramica de BH. Trilhas, pracas e area para piquenique.' },
    { time:'10:00', name:'Savassi — cafe + cultura',      cat:'Gastronomia', icon:'☕', dist:5,   desc:'Bairro boemia com cafes excelentes, galerias e lojas de design.' },
    { time:'08:00', name:'Ouro Preto',                    cat:'Historia',    icon:'🏛️', dist:97,  desc:'Cidade barroca, igrejas douradas, cachaça e historia da Inconfidencia.', distante:false },
    { time:'08:00', name:'Tiradentes',                    cat:'Historia',    icon:'🏰', dist:195, desc:'Centro historico impecavel, cachaçaria, culinaria e casario colonial.', distante:true },
    { time:'08:00', name:'Carrancas — Cachoeira',         cat:'Natureza',    icon:'💦', dist:220, desc:'Cachoeiras de agua limpa, pousadas rusticas e trilhas. Natureza pura.', distante:true },
  ],

  'brasilia': [
    { time:'09:00', name:'Eixo Monumental + Congresso',   cat:'Historia',    icon:'🏛️', dist:0,   desc:'O plano piloto de Lucio Costa e as obras de Niemeyer. Vista aerea incrivel.' },
    { time:'10:30', name:'Catedral Metropolitana',        cat:'Cultura',     icon:'⛪', dist:1,   desc:'Vitrais azuis e escultura de anjos flutuantes. Arquitetura unica no mundo.' },
    { time:'14:00', name:'Parque Nacional de Brasilia',   cat:'Natureza',    icon:'🌿', dist:12,  desc:'Piscinas naturais no Cerrado. Levar repelente e chegar cedo.' },
    { time:'09:00', name:'Palacio da Alvorada + Itamaraty',cat:'Historia',  icon:'🏩', dist:5,   desc:'Obras primas de Niemeyer. Vista do lago Paranoa.' },
    { time:'08:00', name:'Chapada dos Veadeiros',         cat:'Natureza',    icon:'🏞️', dist:262, desc:'Cachoeiras gigantes, quilombo, Cerrado milenio. Minimo 2 dias.', distante:true },
    { time:'08:00', name:'Pirenopolis',                   cat:'Historia',    icon:'🏘️', dist:130, desc:'Cidade historica com festas medievais, cachoeiras e trilhas. Vale o dia.', distante:true },
  ],

  'florianopolis': [
    { time:'08:30', name:'Praia da Joaquina',             cat:'Praia',       icon:'🏄', dist:0,   desc:'Dunas e ondas perfeitas para surf. Locacoes de prancha na praia.' },
    { time:'11:00', name:'Lagoa da Conceicao',            cat:'Natureza',    icon:'⛵', dist:5,   desc:'Por do sol lindo, restaurantes beira-lagoa e esportes nauticos.' },
    { time:'09:00', name:'Fortaleza de Sao Jose',         cat:'Historia',    icon:'🏯', dist:10,  desc:'Fortaleza do seculo XVIII com vista panoramica da ilha.' },
    { time:'08:00', name:'Praia do Campeche',             cat:'Praia',       icon:'🏖️', dist:16,  desc:'Praia selvagem com ilha em frente e aguas cristalinas.' },
    { time:'08:00', name:'Bombinhas — Reserva Marinha',   cat:'Praia',       icon:'🤿', dist:55,  desc:'Mergulho em aguas transparentes e praias sem multidao.', distante:false },
    { time:'07:30', name:'Caminho do Pico da Cruz',       cat:'Natureza',    icon:'🥾', dist:80,  desc:'Trilha com vista 360 da ilha. Alta dificuldade, compensa cada metro.', distante:true },
  ],

  'curitiba': [
    { time:'09:00', name:'Jardim Botanico de Curitiba',   cat:'Natureza',    icon:'🌸', dist:0,   desc:'A estufa art nouveau e jardins impecaveis. Cartao postal da cidade.' },
    { time:'11:00', name:'Museu Oscar Niemeyer',          cat:'Cultura',     icon:'👁️', dist:5,   desc:'O "Museu do Olho". Arquitetura e arte contemporanea brasileira.' },
    { time:'09:00', name:'Trem Curitiba — Morretes',      cat:'Aventura',    icon:'🚂', dist:0,   desc:'A viagem de trem mais bonita do Brasil pela Serra do Mar. Reserve com antecedencia!' },
    { time:'14:00', name:'Mercado Municipal de Curitiba', cat:'Gastronomia', icon:'🥟', dist:3,   desc:'Barreado, pierogi e a culinaria multietnita paranaense.' },
    { time:'09:00', name:'Parque Tanguá',                 cat:'Natureza',    icon:'🌿', dist:8,   desc:'Lago, cascata e pasarela panoramica. Curitiba mostra por que e referencia em parques.' },
    { time:'08:00', name:'Ilha do Mel',                   cat:'Praia',       icon:'🏝️', dist:110, desc:'Sem carros, praias virgens, bioluminescencia e trilhas. Pernoite recomendado.', distante:true },
    { time:'08:00', name:'Vila Velha — Campos Gerais',    cat:'Natureza',    icon:'🪨', dist:100, desc:'Furnas e pedras esculpidas pelo vento ha 300 milhoes de anos.', distante:false },
  ],

  'porto alegre': [
    { time:'10:00', name:'Mercado Publico de POA',        cat:'Gastronomia', icon:'🥩', dist:0,   desc:'Churrasco, vinho colonial e artesanato gaucho no centro historico.' },
    { time:'14:00', name:'Bairro Moinhos de Vento',       cat:'Gastronomia', icon:'☕', dist:5,   desc:'Cafes artesanais, restaurantes e a vibe mais europeia de POA.' },
    { time:'09:00', name:'Parque Farroupilha (Redencao)', cat:'Natureza',    icon:'🌳', dist:3,   desc:'Maior parque da cidade. Feira de artesanato aos domingos.' },
    { time:'08:00', name:'Gramado + Canela',              cat:'Natureza',    icon:'🌲', dist:125, desc:'Serras gauchas, chocolate artesanal, fondue e charme europeu. Dia completo.', distante:true },
    { time:'08:00', name:'Bento Goncalves — Vale dos Vinhedos', cat:'Gastronomia', icon:'🍷', dist:118, desc:'A capital do vinho brasileiro. Enoturismos, cantinas e paisagens da Toscana.', distante:true },
  ],

  'salvador': [
    { time:'09:00', name:'Pelourinho (Centro Historico)', cat:'Historia',    icon:'🏛️', dist:0,   desc:'UNESCO. Casarao coloniais coloridos, igrejas barrocas e capoeira ao vivo.' },
    { time:'11:00', name:'Elevador Lacerda + Mercado Modelo', cat:'Cultura', icon:'🗼', dist:1, desc:'Vista da Baia de Todos os Santos e artesanato baiano.' },
    { time:'14:00', name:'Praia do Porto da Barra',       cat:'Praia',       icon:'🏖️', dist:5,   desc:'Aguas calmas e mornas, pôr do sol famoso e acaraje na beira.' },
    { time:'09:00', name:'Ilha de Itaparica',             cat:'Praia',       icon:'🏝️', dist:15,  desc:'Balsa de Salvador. Praias tranquilas e frutos do mar frescos.' },
    { time:'08:00', name:'Morro de Sao Paulo',            cat:'Praia',       icon:'🌴', dist:260, desc:'Sem carros, praias paradisiacas e vida noturna animada. Minimo 2 noites.', distante:true },
  ],

  'fortaleza': [
    { time:'08:00', name:'Praia do Futuro',               cat:'Praia',       icon:'🏖️', dist:0,   desc:'Barracas de praia com lagosta, peixe e forró ao vivo.' },
    { time:'11:00', name:'Mercado Central',               cat:'Gastronomia', icon:'🥊', dist:3,   desc:'Renda, caju, castanha e cachaça do Ceara. Pechincha garantida.' },
    { time:'08:00', name:'Canoa Quebrada',                cat:'Praia',       icon:'🏄', dist:165, desc:'Falesias vermelhas, lagoas de agua doce e buggy pelas dunas.', distante:true },
    { time:'07:00', name:'Jericoacoara',                  cat:'Praia',       icon:'🌅', dist:300, desc:'Paraíso de lagoas, dunas e pores do sol lendarios. Minimo 2 noites.', distante:true },
  ],

  'recife': [
    { time:'09:00', name:'Marco Zero + Bairro do Recife', cat:'Historia',    icon:'🏛️', dist:0,   desc:'Ponto zero de PE com shows, arte e o Rio Capibaribe ao fundo.' },
    { time:'11:00', name:'Instituto Ricardo Brennand',   cat:'Cultura',      icon:'🏰', dist:12,  desc:'Castelo com acervo artistico impecavel e jardins medievais.' },
    { time:'09:00', name:'Olinda (Patrimonio UNESCO)',    cat:'Historia',    icon:'⛪', dist:6,   desc:'Cidade historica, carnaval famoso e atelies de artistas pernambucanos.' },
    { time:'08:00', name:'Porto de Galinhas',            cat:'Praia',        icon:'🐟', dist:70,  desc:'Piscinas naturais com peixinhos coloridos. Uma das melhores praias do Brasil.', distante:false },
  ],

  'manaus': [
    { time:'09:00', name:'Teatro Amazonas',               cat:'Cultura',     icon:'🎭', dist:0,   desc:'Opera house no meio da selva. Arquitetura europeia em plena Amazonia.' },
    { time:'11:00', name:'Mercado Adolpho Lisboa',        cat:'Gastronomia', icon:'🐟', dist:1,   desc:'Peixe tambaqui, tacacA e frutas da Amazonia que voce nunca viu.' },
    { time:'08:00', name:'Encontro das Aguas',            cat:'Natureza',    icon:'🌊', dist:15,  desc:'Rio Negro encontra o Solimoes sem se misturar por 8km. Fenomeno unico.' },
    { time:'07:00', name:'Tour na Floresta Amazonica',   cat:'Natureza',     icon:'🌿', dist:30,  desc:'Guia local, animais, plantas medicinais e comunidades ribeirinhas. Dia inteiro.' },
  ],
};

// Generico para cidades nao mapeadas
var GENERIC_ATTRACTIONS = [
  { time:'09:00', name:'Centro historico da cidade',    cat:'Historia',    icon:'🏛️', dist:0,   desc:'Explore o patrimonio arquitetonico local.' },
  { time:'11:00', name:'Mercado ou feira regional',     cat:'Gastronomia', icon:'🛒', dist:2,   desc:'Culinaria e produtos tipicos da regiao.' },
  { time:'14:00', name:'Parque ou area verde local',    cat:'Natureza',    icon:'🌿', dist:5,   desc:'Relaxe na natureza local.' },
  { time:'09:00', name:'Museu ou galeria local',        cat:'Cultura',     icon:'🎨', dist:3,   desc:'Cultura e historia da cidade.' },
  { time:'15:00', name:'Bairro boemia + jantar',        cat:'Gastronomia', icon:'🍷', dist:4,   desc:'Explore bares, restaurantes e vida noturna local.' },
  { time:'08:00', name:'Atracao natural proxima',       cat:'Natureza',    icon:'🏞️', dist:45,  desc:'Cachoeira, parque ou reserva na regiao.' },
];

// Normaliza nome da cidade para busca
function normalizeName(name) {
  return (name || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '').trim()
    .split(',')[0].trim();
}

// Icone por categoria
export function catColor(cat) {
  var map = {
    'Praia':       '#00D4FF',
    'Natureza':    '#39FF14',
    'Historia':    '#B24BF3',
    'Cultura':     '#FF6B35',
    'Gastronomia': '#FFD700',
    'Aventura':    '#FF6B35',
    'Logistica':   '#6B7280',
    'Geral':       '#6B7280',
  };
  return map[cat] || '#6B7280';
}

// Gera o plano dia a dia
export function generateDayPlan({ destination, days, interests, tripType }) {
  if (!days || days < 1) return [];
  var days = parseInt(days) || 1;
  var key  = normalizeName(destination);

  // Procura correspondencia no banco
  var found = null;
  var keys  = Object.keys(CITY_ATTRACTIONS);
  for (var i = 0; i < keys.length; i++) {
    if (key.includes(keys[i]) || keys[i].includes(key.split(' ')[0])) {
      found = keys[i];
      break;
    }
  }

  var pool = found ? CITY_ATTRACTIONS[found].slice() : GENERIC_ATTRACTIONS.slice();

  // Filtra por interesses (se houver)
  var interestArr = interests || [];
  var filtered = interestArr.length
    ? pool.filter(function(a) { return interestArr.includes(a.cat) || a.cat === 'Logistica' || a.cat === 'Geral'; })
    : pool;

  // Separa proximas e distantes
  var nearby  = filtered.filter(function(a) { return !a.distante && a.dist < 80; });
  var dayTrips= filtered.filter(function(a) { return a.distante || a.dist >= 80; });

  var plan     = [];
  var nearIdx  = 0;
  var tripIdx  = 0;

  for (var d = 0; d < days; d++) {
    var isFirst = d === 0;
    var isLast  = d === days - 1;
    var acts    = [];

    if (isFirst) {
      acts.push({ time: '12:00', name: 'Chegada + check-in',    cat: 'Logistica', icon: '🔑', dist: 0, desc: 'Settle in, descanso e hidratacao. Primeira impressao da cidade.' });
      acts.push({ time: '15:00', name: 'Passeio de reconhecimento', cat: 'Geral', icon: '🚶', dist: 0, desc: 'Caminhe pelo centro, sinta o ritmo local e escolha onde jantar.' });
      if (nearby[0]) acts.push(Object.assign({}, nearby[nearIdx++], { time: '19:00' }));
    } else if (isLast) {
      acts.push({ time: '09:00', name: 'Cafe da manha + compras', cat: 'Gastronomia', icon: '☕', dist: 0, desc: 'Ultima manha: padaria local e artesanato para levar de lembranca.' });
      acts.push({ time: '12:00', name: 'Almoco e check-out',     cat: 'Logistica', icon: '🧳', dist: 0, desc: 'Aproveite ate a hora de partir.' });
      acts.push({ time: '14:00', name: 'Partida — boa viagem!',  cat: 'Logistica', icon: '🚗', dist: 0, desc: 'Bagagem no carro e rumo a casa com a memoria cheia.' });
    } else {
      // Dia normal: 3-4 atrações próximas + 1 excursão distante a cada 2 dias
      var dailyCount = days <= 3 ? 3 : 4;
      for (var a = 0; a < dailyCount && nearIdx < nearby.length; a++) {
        acts.push(nearby[nearIdx++]);
      }
      // A cada 2 dias insere uma excursão distante
      if (d % 2 === 1 && tripIdx < dayTrips.length) {
        acts = [dayTrips[tripIdx++]].concat(acts.slice(0, 2));
      }
    }

    plan.push({
      day:        d + 1,
      label:      isFirst ? 'Chegada' : isLast ? 'Partida' : 'Dia ' + (d + 1),
      activities: acts,
    });
  }

  return plan;
}
