// src/lib/budget.js
var FUEL_PRICES = {
  gasolina:      5.89,
  etanol:        3.99,
  diesel:        6.19,
  flex_gasolina: 5.89,
  flex_etanol:   3.99,
};

export var DEFAULT_KML = {
  carro:    13.0,
  suv:      10.0,
  pickup:    9.0,
  moto:     22.0,
  motohome:  6.0,
  caminhao:  8.0,
};

var TOLL_MULT = {
  carro:    1.0,
  suv:      1.0,
  pickup:   1.5,
  moto:     0.5,
  motohome: 2.0,
  caminhao: 2.5,
};

var HOTEL_COST = {
  economico:  80,
  moderado:   150,
  esbanjando: 420,
};

var FOOD_COST = {
  economico:  15,
  moderado:   28,
  esbanjando: 75,
};

export function calculateBudget({ distanceKm, fuelType, kmPerLiter, pricePerLiter, passengers, nights, travelStyle, vehicleType, isRoundTrip, avoidTolls }) {
  var style     = travelStyle  || 'moderado';
  var vType     = vehicleType  || 'carro';
  var roundTrip = isRoundTrip  || false;
  var noTolls   = avoidTolls   || false;
  var litPrice  = pricePerLiter || FUEL_PRICES[fuelType] || 5.89;
  var kml       = kmPerLiter   || DEFAULT_KML[vType] || 13;
  var tollMult  = TOLL_MULT[vType] || 1.0;
  var totalKm   = roundTrip ? distanceKm * 2 : distanceKm;

  var liters       = totalKm / kml;
  var fuel         = Math.round(liters * litPrice);
  var toll         = noTolls ? 0 : Math.round(totalKm * 0.07 * tollMult);
  var vehicleTotal = fuel + toll;

  var tripDays      = Math.max(1, Math.ceil(totalKm / 500)) + (nights || 0);
  var foodSessions  = Math.max(2, tripDays * 3);
  var food          = Math.round(passengers * foodSessions * FOOD_COST[style]);
  var rooms         = Math.ceil(passengers / 2);
  var accommodation = (nights || 0) > 0 ? Math.round(nights * rooms * HOTEL_COST[style]) : 0;
  var itineraryTotal= food + accommodation;

  var total     = vehicleTotal + itineraryTotal;
  var perPerson = Math.round(total / Math.max(1, passengers));

  return { fuel, toll, vehicleTotal, food, accommodation, itineraryTotal, total, perPerson, liters: Math.round(liters * 10) / 10, isRoundTrip: roundTrip, avoidTolls: noTolls, totalKm: Math.round(totalKm) };
}

export function getStyleLabel(style) {
  var m = { economico:'Economico 💰', moderado:'Moderado ⚖️', esbanjando:'Esbanjando ✨' };
  return m[style] || m.moderado;
}

// Aceita dateStr no formato 'YYYY-MM-DD' para dicas mais precisas
export function getSeasonalTips(dateStr, interests) {
  if (!dateStr) return [];
  var tips  = [];
  var d     = new Date(dateStr + 'T12:00:00');
  var month = d.getMonth();    // 0-11
  var day   = d.getDate();     // 1-31

  // Estacoes (Hemisferio Sul / Sudeste)
  var isSummer = month >= 11 || month <= 2;
  var isWinter = month >= 6  && month <= 8;
  var isRainy  = month >= 10 || month <= 3;

  if (isSummer) {
    tips.push({ icon:'🌡️', color:'#FF6B35', msg:'Verao: calor intenso. Leve muita agua, protetor solar FPS50+ e repelente.' });
  }
  if (isWinter) {
    tips.push({ icon:'🧥', color:'#00D4FF', msg:'Inverno: frio no Sul e na Serra. Leve agasalho para manha e noite.' });
  }
  if (isRainy) {
    tips.push({ icon:'🌧️', color:'#FF6B35', msg:'Epoca de chuvas (nov-abr): atencao a alagamentos e deslizamentos em estradas serranas.' });
  }
  if (!isSummer && !isWinter) {
    tips.push({ icon:'🌤️', color:'#39FF14', msg:'Clima agradavel para viagem — dias amenos e noites frescas.' });
  }

  // Eventos especiais por data
  if (month === 1 || (month === 2 && day <= 15)) {
    tips.push({ icon:'🎭', color:'#B24BF3', msg:'Periodo de Carnaval: transito intenso nas estradas, reserve hospedagem com antecedencia.' });
  }
  if (month === 3 && day >= 15 && month <= 3) {
    tips.push({ icon:'✝️', color:'#00D4FF', msg:'Semana Santa: destinos historicos com alta ocupacao. Reserve com antecedencia.' });
  }
  if (month === 5 || month === 6) {
    tips.push({ icon:'🎪', color:'#FF6B35', msg:'Festas Juninas: excelente epoca para o Nordeste! Sao Joao em Campina Grande e Caruaru sao imperdíveis.' });
  }

  // Interesses especificos
  var inter = Array.isArray(interests) ? interests : (interests ? [interests] : []);
  if (inter.includes('aventura')) {
    tips.push({ icon:'🥾', color:'#B24BF3', msg:'Aventura: leve calcado antiderrapante, roupas de secagem rapida e repelente DEET 20%+.' });
  }
  if (inter.includes('praia')) {
    tips.push({ icon:'🏖️', color:'#00D4FF', msg:'Praia: protetor solar FPS50+, roupa UV, chapeu. Evite sol entre 10h e 16h.' });
  }
  if (inter.includes('natureza')) {
    tips.push({ icon:'🌿', color:'#39FF14', msg:'Trilhas: leve lanterna, kit de primeiros socorros e muita agua.' });
  }

  return tips.slice(0, 4); // max 4 dicas para nao poluir o formulario
}
