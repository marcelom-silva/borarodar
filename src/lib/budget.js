// src/lib/budget.js
var FUEL_PRICES = { gasolina:5.89, etanol:3.99, diesel:6.19, flex_gasolina:5.89, flex_etanol:3.99 };

export var DEFAULT_KML = { carro:13, suv:10, pickup:9, moto:22, motohome:6, caminhao:8 };

var TOLL_MULT = { carro:1.0, suv:1.0, pickup:1.5, moto:0.5, motohome:2.0, caminhao:2.5 };
var HOTEL_COST = { economico:80, moderado:150, esbanjando:420 };
var FOOD_COST  = { economico:15, moderado:28,  esbanjando:75  };

export function calculateBudget({ distanceKm, fuelType, kmPerLiter, pricePerLiter, passengers, nights, travelStyle, vehicleType, isRoundTrip, avoidTolls }) {
  var style     = travelStyle || 'moderado';
  var vType     = vehicleType || 'carro';
  var roundTrip = isRoundTrip || false;
  var noTolls   = avoidTolls  || false;
  var litPrice  = pricePerLiter || FUEL_PRICES[fuelType] || 5.89;
  var kml       = kmPerLiter  || DEFAULT_KML[vType] || 13;
  var tollMult  = TOLL_MULT[vType] || 1.0;
  var totalKm   = roundTrip ? distanceKm * 2 : distanceKm;

  var liters        = totalKm / kml;
  var fuel          = Math.round(liters * litPrice);
  var toll          = noTolls ? 0 : Math.round(totalKm * 0.07 * tollMult);
  var vehicleTotal  = fuel + toll;

  var tripDays      = Math.max(1, Math.ceil(totalKm / 500)) + (nights || 0);
  var foodSessions  = Math.max(2, tripDays * 3);
  var food          = Math.round(passengers * foodSessions * FOOD_COST[style]);
  var rooms         = Math.ceil(passengers / 2);
  var accommodation = (nights||0) > 0 ? Math.round(nights * rooms * HOTEL_COST[style]) : 0;
  var itineraryTotal= food + accommodation;
  var total         = vehicleTotal + itineraryTotal;
  var perPerson     = Math.round(total / Math.max(1, passengers));

  return { fuel, toll, vehicleTotal, food, accommodation, itineraryTotal, total, perPerson,
    liters:Math.round(liters*10)/10, isRoundTrip:roundTrip, avoidTolls:noTolls, totalKm:Math.round(totalKm) };
}

export function getStyleLabel(style) {
  var m = { economico:'Economico 💰', moderado:'Moderado ⚖️', esbanjando:'Esbanjando ✨' };
  return m[style] || m.moderado;
}

/**
 * Retorna dicas sazonais com base na data e interesses.
 * Recebe `t` (funcao de traducao) para retornar mensagens no idioma correto.
 * @param {string} dateStr - formato 'YYYY-MM-DD'
 * @param {string[]} interests
 * @param {function} t - funcao de traducao do LanguageContext
 */
export function getSeasonalTips(dateStr, interests, t) {
  if (!dateStr || !t) return [];
  var tips  = [];
  var d     = new Date(dateStr + 'T12:00:00');
  var month = d.getMonth();
  var day   = d.getDate();

  var isSummer = month >= 11 || month <= 2;
  var isWinter = month >= 6  && month <= 8;
  var isRainy  = month >= 10 || month <= 3;

  if (isSummer) tips.push({ icon:'🌡️', color:'#FF6B35', msg: t('seasonal_summer') });
  if (isWinter) tips.push({ icon:'🧥', color:'#00D4FF', msg: t('seasonal_winter') });
  if (!isSummer && !isWinter) tips.push({ icon:'🌤️', color:'#39FF14', msg: t('seasonal_mild') });
  if (isRainy)  tips.push({ icon:'🌧️', color:'#FF6B35', msg: t('seasonal_rainy') });

  if (month === 1 || (month === 2 && day <= 15)) tips.push({ icon:'🎭', color:'#B24BF3', msg: t('seasonal_carnival') });
  if (month === 3)  tips.push({ icon:'✝️',  color:'#00D4FF', msg: t('seasonal_easter')  });
  if (month === 5 || month === 6) tips.push({ icon:'🎪', color:'#FF6B35', msg: t('seasonal_junefest') });

  var inter = Array.isArray(interests) ? interests : (interests ? [interests] : []);
  if (inter.includes('aventura')) tips.push({ icon:'🥾', color:'#B24BF3', msg: t('seasonal_adventure') });
  if (inter.includes('praia'))    tips.push({ icon:'🏖️', color:'#00D4FF', msg: t('seasonal_beach')     });
  if (inter.includes('natureza')) tips.push({ icon:'🌿', color:'#39FF14', msg: t('seasonal_nature')    });

  return tips.slice(0, 4);
}
