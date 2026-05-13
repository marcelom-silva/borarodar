// src/lib/budget.js

var FUEL_PRICES = {
  gasolina:      5.89,
  etanol:        3.99,
  diesel:        6.19,
  flex_gasolina: 5.89,
  flex_etanol:   3.99,
};

// Consumo padrao por tipo de veiculo (km/L)
export var DEFAULT_KML = {
  carro:    12,
  suv:      10,
  pickup:    9,
  moto:     22,
  motohome:  6,
  caminhao:  8,
};

// Multiplicador de pedagio por tipo de veiculo (relativo ao carro basico)
var TOLL_MULT = {
  carro:    1.0,
  suv:      1.0,
  pickup:   1.5,
  moto:     0.5,
  motohome: 2.0,
  caminhao: 2.5,
};

// Custo de hospedagem por quarto/noite por estilo
var HOTEL_COST = {
  economico:  80,
  moderado:   150,
  esbanjando: 420,
};

// Custo de alimentacao por pessoa/refeicao por estilo
var FOOD_COST = {
  economico:  15,
  moderado:   28,
  esbanjando: 75,
};

export function calculateBudget({
  distanceKm,
  fuelType,
  kmPerLiter,
  pricePerLiter,
  passengers,
  nights,
  travelStyle,
  vehicleType,
  isRoundTrip,
  avoidTolls,
}) {
  var style       = travelStyle  || 'moderado';
  var vType       = vehicleType  || 'carro';
  var roundTrip   = isRoundTrip  || false;
  var noTolls     = avoidTolls   || false;
  var litPrice    = pricePerLiter || FUEL_PRICES[fuelType] || 5.89;
  var kml         = kmPerLiter   || DEFAULT_KML[vType] || 12;
  var tollMult    = TOLL_MULT[vType] || 1.0;

  // Distancia total (dobra se for ida e volta)
  var totalKm = roundTrip ? distanceKm * 2 : distanceKm;

  // Combustivel
  var liters = totalKm / kml;
  var fuel   = Math.round(liters * litPrice);

  // Pedagio (estimativa ~R$ 0,07/km + multiplicador de veiculo)
  var toll = noTolls ? 0 : Math.round(totalKm * 0.07 * tollMult);

  // Total do veiculo
  var vehicleTotal = fuel + toll;

  // Alimentacao (refeicoes na estrada + dias de destino)
  var tripDays    = Math.max(1, Math.ceil(totalKm / 500)) + (nights || 0);
  var foodSessions= Math.max(2, tripDays * 3);
  var food        = Math.round(passengers * foodSessions * FOOD_COST[style]);

  // Hospedagem
  var rooms         = Math.ceil(passengers / 2);
  var accommodation = (nights || 0) > 0 ? Math.round(nights * rooms * HOTEL_COST[style]) : 0;

  // Total do roteiro
  var itineraryTotal = food + accommodation;

  // Total geral e por pessoa
  var total     = vehicleTotal + itineraryTotal;
  var perPerson = Math.round(total / Math.max(1, passengers));

  return {
    // Custos do veiculo
    fuel:          fuel,
    toll:          toll,
    vehicleTotal:  vehicleTotal,
    // Custos do roteiro
    food:          food,
    accommodation: accommodation,
    itineraryTotal: itineraryTotal,
    // Totais
    total:         total,
    perPerson:     perPerson,
    // Meta
    liters:        Math.round(liters * 10) / 10,
    isRoundTrip:   roundTrip,
    avoidTolls:    noTolls,
    totalKm:       Math.round(totalKm),
  };
}

export function getStyleLabel(style) {
  var m = { economico:'Economico 💰', moderado:'Moderado ⚖️', esbanjando:'Esbanjando ✨' };
  return m[style] || m.moderado;
}

// Dicas de clima/vestuario por mes (0=jan ... 11=dez)
export function getSeasonalTips(month, interests) {
  var tips  = [];
  var month = parseInt(month);

  // Estacoes no Brasil (Hemisferio Sul / Sudeste-Centro-Oeste)
  var isSummer = month >= 11 || month <= 2;   // dez-fev
  var isAutumn = month >= 3  && month <= 5;   // mar-mai
  var isWinter = month >= 6  && month <= 8;   // jun-ago
  var isSpring = month >= 9  && month <= 11;  // set-nov
  var isRainy  = month >= 10 || month <= 3;   // nov-abr

  if (isSummer) {
    tips.push({ icon:'🌡️', color:'#FF6B35', msg:'Verao: calor intenso no SE/CO. Carregue muita agua, protetor solar e repelente.' });
  }
  if (isWinter) {
    tips.push({ icon:'🧥', color:'#00D4FF', msg:'Inverno: frio no Sul/Serra. Leve agasalho, principalmente para noites e manha.' });
  }
  if (isAutumn || isSpring) {
    tips.push({ icon:'🌤️', color:'#39FF14', msg:'Outono/Primavera: clima agradavel. Ideal para viagem — dias amenos e noites frescas.' });
  }
  if (isRainy) {
    tips.push({ icon:'🌧️', color:'#FF6B35', msg:'Epoca de chuvas no Sudeste (nov-abr). Atencao a deslizamentos em estradas serranas.' });
  }

  if (interests) {
    var inter = Array.isArray(interests) ? interests : [interests];
    if (inter.includes('aventura')) {
      tips.push({ icon:'🥾', color:'#B24BF3', msg:'Aventura: leve calcado antiderrapante, roupas de secagem rapida, mochila com snacks e muito repelente.' });
    }
    if (inter.includes('praia')) {
      tips.push({ icon:'🏖️', color:'#00D4FF', msg:'Praia: protetor solar FPS 50+, roupa UV, chapeu de aba. Evite sol entre 10h-16h.' });
    }
    if (inter.includes('natureza')) {
      tips.push({ icon:'🌿', color:'#39FF14', msg:'Trilhas: repelente DEET 20%+, calca comprida, lanterna extra e kit de primeiros socorros.' });
    }
  }

  return tips;
}
