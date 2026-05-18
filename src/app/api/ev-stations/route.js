// src/app/api/ev-stations/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Proxy para OpenChargeMap API — eletropostos ao longo da rota
// API key gratuita em: openchargemap.org → My Profile → My Apps
// ENV: NEXT_PUBLIC_OCM_API_KEY (pode ser client-side pois a API é pública)
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';

const OCM_KEY = process.env.NEXT_PUBLIC_OCM_API_KEY || process.env.OCM_API_KEY;
const OCM_URL = 'https://api.openchargemap.io/v3/poi/';

export async function POST(req) {
  try {
    const body = await req.json();
    const { waypoints, radiusKm = 20, maxResults = 5 } = body;
    // waypoints: array de { lat, lng } ao longo da rota

    if (!waypoints || waypoints.length === 0) {
      return NextResponse.json({ stations: [] });
    }

    // Busca eletropostos próximos a cada waypoint-chave da rota
    // Para não exceder rate limit, usa apenas origin, middlepoints e destination
    const samplePoints = [];
    if (waypoints.length <= 6) {
      samplePoints.push(...waypoints);
    } else {
      // Sample: início, 4 pontos intermediários, fim
      const step = Math.floor(waypoints.length / 5);
      for (let i = 0; i < 5; i++) samplePoints.push(waypoints[i * step]);
      samplePoints.push(waypoints[waypoints.length - 1]);
    }

    // OCM works without API key (public access, lower rate limit)
    // Register free at openchargemap.org for higher limits
    const headers = { 'Content-Type': 'application/json' };
    if (OCM_KEY) headers['X-API-Key'] = OCM_KEY;

    const promises = samplePoints.map(pt => {
      const url = new URL(OCM_URL);
      url.searchParams.set('output', 'json');
      url.searchParams.set('latitude', pt.lat);
      url.searchParams.set('longitude', pt.lng);
      url.searchParams.set('distance', radiusKm);
      url.searchParams.set('distanceunit', 'KM');
      url.searchParams.set('maxresults', maxResults);
      url.searchParams.set('compact', 'true');
      url.searchParams.set('verbose', 'false');
      url.searchParams.set('statustype', '50'); // 50 = Operational
      if (OCM_KEY) url.searchParams.set('key', OCM_KEY);
      // Note: works without key, just with lower rate limit
      return fetch(url.toString(), { headers }).then(r => r.json()).catch(() => []);
    });

    const results = await Promise.all(promises);
    const allStations = results.flat();

    // Deduplica por ID
    const seen = new Set();
    const unique = allStations.filter(s => {
      if (seen.has(s.ID)) return false;
      seen.add(s.ID);
      return true;
    });

    // Formata para uso no mapa
    const stations = unique.map(s => {
      const addr = s.AddressInfo || {};
      const conns = (s.Connections || []).map(c => ({
        type:  c.ConnectionType?.Title || 'N/A',
        power: c.PowerKW,
        level: c.Level?.Title || '',
      }));
      const maxKW = Math.max(0, ...conns.map(c => c.power || 0));
      return {
        id:       s.ID,
        name:     addr.Title || 'Eletroposto',
        lat:      addr.Latitude,
        lng:      addr.Longitude,
        address:  [addr.AddressLine1, addr.Town, addr.StateOrProvince].filter(Boolean).join(', '),
        country:  addr.Country?.Title || '',
        operator: s.OperatorInfo?.Title || '',
        connections: conns,
        maxKW,
        is_fast: maxKW >= 50,
        status:  s.StatusType?.Title || 'Operacional',
        usageCost: s.UsageCost || 'Verificar local',
        usageType: s.UsageType?.Title || '',
      };
    });

    return NextResponse.json({ stations });
  } catch (err) {
    console.error('EV Stations API error:', err);
    return NextResponse.json({ stations: [], error: err.message });
  }
}
