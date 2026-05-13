var NOMINATIM = 'https://nominatim.openstreetmap.org';
var OSRM      = 'https://router.project-osrm.org';

export async function geocode(query) {
  var params = new URLSearchParams({ q: query, format: 'json', countrycodes: 'br', limit: '5', addressdetails: '1' });
  var res = await fetch(NOMINATIM + '/search?' + params.toString(), {
    headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'BoraRodar/1.0' },
  });
  if (!res.ok) throw new Error('Erro ao buscar localizacao.');
  return res.json();
}

export async function calculateRoute(origin, destination) {
  var coords = origin.lng + ',' + origin.lat + ';' + destination.lng + ',' + destination.lat;
  var params = 'overview=full&geometries=geojson&steps=false';
  var res = await fetch(OSRM + '/route/v1/driving/' + coords + '?' + params);
  if (!res.ok) throw new Error('Erro ao calcular rota.');
  var data = await res.json();
  if (data.code !== 'Ok' || !data.routes || !data.routes.length) throw new Error('Rota nao encontrada. Tente destinos mais especificos.');
  return data.routes[0];
}
