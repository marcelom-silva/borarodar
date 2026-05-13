// src/lib/itinerary.js
// Roteiro estatico como fallback quando a API Gemini nao esta configurada

var DB = {
  'campos do jordao': {
    summary: 'A Suica brasileira na Serra da Mantiqueira. Frio, chocolate, fondue e paisagens europeias.',
    bestPeriod: 'Junho a Agosto (Festival de Inverno). Qualquer mes para frio e natureza.',
    totalBudget: 'R$ 800 a R$ 1.800 por pessoa para 3 dias',
    days: [
      {
        title: 'Chegada e Centro Historico',
        morning: 'Chegada e check-in. Cafe da manha serrano com quentao e broa de milho.',
        afternoon: 'Passeio pela Avenida Macedo Soares. Visite as chocolaterias, compre queijos e embutidos locais.',
        evening: 'Jantar com fondue de queijo ou carne. Aproveite o frio!',
        tip: 'Evite o centro nos fins de semana em alta temporada — prefira chegar na quinta ou sexta.',
        meals: {
          breakfast: 'Padaria Bauernbrot — broa de centeio e cappuccino. R$ 20/pessoa',
          lunch: 'Baden Baden Pub — hamburguer artesanal. Media R$ 45/pessoa',
          dinner: 'Restaurante Geneva — fondue classico. Media R$ 90/pessoa',
        },
        accommodation: 'Pousadas no bairro Capivari: R$ 250 a R$ 600/noite casal',
      },
      {
        title: 'Natureza e Telecabine',
        morning: 'Pico do Itapeva — vista espetacular da Serra. Leve agasalho! Acesso de carro.',
        afternoon: 'Telecabine (Morro do Elefante) — subida de 20 min com vista panoramica. Funciona 10h-17h.',
        evening: 'Passeio de trem historico e happy hour com cerveja Baden Baden gelada.',
        tip: 'O Parque Estadual do Horto Florestal e gratuito e tem trilhas — pouco visitado.',
        meals: {
          breakfast: 'Villa Caffe — croissants e sucos. R$ 25/pessoa',
          lunch: 'Piquenique no Parque do Horto com queijos e frios da avenida',
          dinner: 'Restaurante Harry Pisek — cozinha alema autentica. R$ 75/pessoa',
        },
        accommodation: 'Mesma pousada do dia anterior',
      },
      {
        title: 'Artesanato e Volta',
        morning: 'Bairro Abernesia — arquitetura inglesa, artesanato e cachaças artesanais.',
        afternoon: 'Palacio Boa Vista (gratuito aos fins de semana). Check-out e viagem de volta.',
        evening: 'Parada em Santo Antonio do Pinhal ou Sao Bento do Sapucai no caminho de volta.',
        tip: 'Compre queijo da Mantiqueira direto nos produtores — muito mais barato que nas lojas.',
        meals: {
          breakfast: 'Cafe do Sertao — cafe colonial completo. R$ 35/pessoa',
          lunch: 'Vila dos Sabores — buffet regional. R$ 50/pessoa',
          dinner: 'No caminho de volta',
        },
        accommodation: 'Check-out',
      },
    ],
  },
  'gramado': {
    summary: 'Cidade gaucha com influencia europeia, famosa pelo Festival de Cinema e pelo inverno rigoroso.',
    bestPeriod: 'Inverno (Jun-Ago) para o frio. Dezembro para a Natal Luz.',
    totalBudget: 'R$ 700 a R$ 1.500 por pessoa para 3 dias',
    days: [
      {
        title: 'Chegada e Gastronomia',
        morning: 'Chegada. Cafe da manha com cafe colonial gaucho completo.',
        afternoon: 'Rua Coberta e Rua Garibaldi — chocolates, fondue e artesanato.',
        evening: 'Mini Mundo — miniaturas europeias em escala. Jantar com fondue.',
        tip: 'Canela fica a 6 km e tem o Parque do Caracol — facil combinar no mesmo dia.',
        meals: {
          breakfast: 'Cafe colonial com frios e pes variados. R$ 45/pessoa',
          lunch: 'Bella Mia — massas artesanais. R$ 55/pessoa',
          dinner: 'Fondue Gasthof — tradicional. R$ 100/pessoa',
        },
        accommodation: 'Pousadas no centro: R$ 350 a R$ 800/noite casal',
      },
    ],
  },
  'ouro preto': {
    summary: 'Patrimonio da Humanidade com arte barroca, historia da Inconfidencia e cachaça artesanal.',
    bestPeriod: 'Ano todo. Carnaval para festa; inverno para clima agradavel.',
    totalBudget: 'R$ 500 a R$ 1.000 por pessoa para 2 dias',
    days: [
      {
        title: 'Barroco e Historia',
        morning: 'Igreja de Sao Francisco de Assis (Aleijadinho) e Museu da Inconfidencia na Praca Tiradentes.',
        afternoon: 'Mina do Veloso ou Mina da Passagem — tour pelas minas de ouro históricas.',
        evening: 'Bar do Careca e bares da Rua Direita — vida noturna universitaria vibrante.',
        tip: 'Use calcados confortaveis — as pedras portuguesas sao irregulares.',
        meals: {
          breakfast: 'Cafe do Padeiro — po de queijo e cafe forte. R$ 15/pessoa',
          lunch: 'Restaurante Chafariz — tropeiro, tutu e costelinha. R$ 50/pessoa',
          dinner: 'Casa do Ouvidor — frango ao molho pardo. R$ 60/pessoa',
        },
        accommodation: 'Pousadas no historico: R$ 200 a R$ 500/noite casal',
      },
    ],
  },
};

function normalizeName(destination) {
  if (!destination) return '';
  return destination
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

export function generateStaticItinerary(param) {
  var destination = param.destination;
  var days        = param.days;

  if (!days || days < 1) return null;
  var totalDays = parseInt(days) || 1; // FIX: sem redeclaracao de 'days'
  var key       = normalizeName(destination);

  var found = null;
  var keys  = Object.keys(DB);
  for (var i = 0; i < keys.length; i++) {
    if (key.includes(keys[i]) || keys[i].includes(key)) {
      found = DB[keys[i]];
      break;
    }
  }
  if (!found) return null;

  var daysList = [];
  for (var d = 0; d < totalDays; d++) {
    var template = found.days[d % found.days.length];
    daysList.push(Object.assign({}, template, { day: d + 1 }));
  }

  return {
    destination: destination,
    summary:     found.summary,
    bestPeriod:  found.bestPeriod,
    totalBudget: found.totalBudget,
    days:        daysList,
    isStatic:    true,
  };
}
