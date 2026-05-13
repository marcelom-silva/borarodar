var FUEL_PRICES = { gasolina: 5.89, etanol: 3.99, diesel: 6.19, flex_gasolina: 5.89, flex_etanol: 3.99 };

export function calculateBudget({ distanceKm, fuelType, kmPerLiter, pricePerLiter, passengers, nights }) {
  var literPrice  = pricePerLiter || FUEL_PRICES[fuelType] || 5.89;
  var liters      = distanceKm / (kmPerLiter || 12);
  var fuel        = Math.round(liters * literPrice);
  var toll        = Math.round(distanceKm * 0.07);
  var foodSess    = Math.max(1, Math.floor(distanceKm / 300) + nights * 3);
  var food        = Math.round(passengers * foodSess * 25);
  var rooms       = Math.ceil(passengers / 2);
  var accommodation = nights > 0 ? Math.round(nights * rooms * 150) : 0;
  var total       = fuel + toll + food + accommodation;
  return { fuel, toll, food, accommodation, total, liters: Math.round(liters * 10) / 10 };
}
