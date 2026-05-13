var NOMINATIM = 'https://nominatim.openstreetmap.org';
var OSRM      = 'https://router.project-osrm.org';

// Geocodifica um endereco e retorna array de resultados
export async function geocode(query) {
  var params = new URLSearchParams({ q: query, format: 'json', countrycodes: 'br', limit: '5', addressdetails: '1' });
  var res = await fetch(NOMINATIM + '/search?' + params.toString(), {
    headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'BoraRodar/1.0' },
  });
  if (!res.ok) throw new Error('Erro ao buscar localizacao.');
  return res.json();
}

// Calcula rota entre MULTIPLOS pontos (origem + waypoints + destino)
// coords: array de { lat, lng }
export async function calculateRoute(origin, destination, waypoints) {
  // Montar string de coordenadas: lng,lat separados por ;
  var points = [origin];
  if (waypoints && waypoints.length) {
    waypoints.forEach(function(wp) { if (wp.coords) points.push(wp.coords); });
  }
  points.push(destination);

  var coordStr = points.map(function(p) { return p.lng + ',' + p.lat; }).join(';');
  var params   = 'overview=full&geometries=geojson&steps=false';
  var url      = OSRM + '/route/v1/driving/' + coordStr + '?' + params;

  var res  = await fetch(url);
  if (!res.ok) throw new Error('Erro ao calcular rota.');
  var data = await res.json();
  if (data.code !== 'Ok' || !data.routes || !data.routes.length) {
    throw new Error('Rota nao encontrada. Tente destinos mais especificos.');
  }
  return data.routes[0];
}
