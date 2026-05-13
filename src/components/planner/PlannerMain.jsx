'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RouteForm from './RouteForm';
import MapView from './MapView';
import BudgetBreakdown from './BudgetBreakdown';
import StopPoints from './StopPoints';
import SafetyAlerts from './SafetyAlerts';
import ExportOptions from './ExportOptions';
import { calculateRoute, geocode } from '@/lib/routing';
import { calculateBudget } from '@/lib/budget';
import { Map, AlertCircle } from 'lucide-react';

function formatDuration(hours) {
  var h = Math.floor(hours);
  var m = Math.round((hours - h) * 60);
  if (h === 0) return m + ' min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}

export default function PlannerMain() {
  var searchParams = useSearchParams();
  var [routeData,  setRouteData]  = useState(null);
  var [budgetData, setBudgetData] = useState(null);
  var [loading,    setLoading]    = useState(false);
  var [error,      setError]      = useState('');
  var [formValues, setFormValues] = useState({
    origem:      searchParams.get('origem')  || '',
    destino:     searchParams.get('destino') || '',
    combustivel: 'gasolina',
    km_litro:    '12',
    preco_litro: '5.89',
    passageiros: '2',
    noites:      '0',
    waypoints:   [], // V2: paradas intermediarias
  });

  useEffect(function() {
    if (formValues.origem && formValues.destino) handleCalculate(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCalculate(values) {
    setLoading(true); setError(''); setRouteData(null); setBudgetData(null);
    try {
      // Geocodificar origem e destino
      var origResults = await geocode(values.origem);
      var destResults = await geocode(values.destino);
      if (!origResults.length) throw new Error('Origem nao encontrada. Seja mais especifico (ex: Sao Paulo, SP).');
      if (!destResults.length) throw new Error('Destino nao encontrado. Seja mais especifico.');

      var orig = { lat: parseFloat(origResults[0].lat), lng: parseFloat(origResults[0].lon) };
      var dest = { lat: parseFloat(destResults[0].lat), lng: parseFloat(destResults[0].lon) };

      // Geocodificar waypoints
      var resolvedWaypoints = [];
      for (var i = 0; i < (values.waypoints || []).length; i++) {
        var wp = values.waypoints[i];
        if (wp.name && wp.name.trim()) {
          var wpResults = await geocode(wp.name);
          if (wpResults.length) {
            resolvedWaypoints.push({
              name: wp.name,
              coords: { lat: parseFloat(wpResults[0].lat), lng: parseFloat(wpResults[0].lon) },
              label: wpResults[0].display_name,
            });
          }
        }
      }

      // Calcular rota (com waypoints se houver)
      var route = await calculateRoute(orig, dest, resolvedWaypoints);
      if (!route) throw new Error('Nao foi possivel calcular a rota.');

      var distKm = route.distance / 1000;
      var durHrs = route.duration / 3600;

      var rd = {
        distance:    distKm,
        duration:    durHrs,
        geometry:    route.geometry,
        origin:      orig,
        destination: dest,
        origLabel:   values.origem,
        destLabel:   values.destino,
        waypoints:   resolvedWaypoints,
      };
      setRouteData(rd);
      setBudgetData(calculateBudget({
        distanceKm:    distKm,
        fuelType:      values.combustivel,
        kmPerLiter:    parseFloat(values.km_litro)    || 12,
        pricePerLiter: parseFloat(values.preco_litro) || 5.89,
        passengers:    parseInt(values.passageiros)   || 2,
        nights:        parseInt(values.noites)        || 0,
      }));
    } catch (err) {
      setError(err.message || 'Erro ao calcular rota.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <span className="text-br-green font-mono text-xs uppercase tracking-widest">Planejador</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">Pit Stop do Role 🗺️</h1>
        <p className="text-gray-500 mt-2">Calcule sua rota, adicione paradas e saiba quanto vai gastar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <RouteForm values={formValues} onChange={setFormValues} onCalculate={handleCalculate} loading={loading} />
        </div>
        <div className="lg:col-span-3">
          <div className="br-card overflow-hidden h-[420px] sm:h-[500px] flex items-center justify-center">
            {routeData
              ? <MapView routeData={routeData} />
              : (
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Map className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Preencha a rota e clique em Calcular</p>
                  <p className="text-xs text-gray-700">Suporte a paradas intermediarias</p>
                </div>
              )
            }
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-br-green/30 border-t-br-green rounded-full animate-spin" />
          Calculando sua rota...
        </div>
      )}

      {routeData && budgetData && (
        <div className="mt-8 space-y-6 animate-slide-up">
          {/* Waypoints confirmados */}
          {routeData.waypoints && routeData.waypoints.length > 0 && (
            <div className="br-card p-4">
              <p className="font-syne font-bold text-sm mb-3 text-br-orange">Paradas intermediarias confirmadas:</p>
              <div className="flex flex-wrap gap-2">
                {routeData.waypoints.map(function(wp, i) {
                  return (
                    <span key={i} className="waypoint-item text-xs">
                      📍 {wp.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Distancia',   v: routeData.distance.toFixed(0) + ' km', c: '#39FF14' },
              { l: 'Tempo est.',  v: formatDuration(routeData.duration),     c: '#00D4FF' },
              { l: 'Total gasto', v: 'R$ ' + budgetData.total.toLocaleString('pt-BR'), c: '#FF6B35' },
            ].map(function({ l, v, c }, i) {
              return (
                <div key={i} className="br-card p-5 text-center">
                  <div className="font-syne font-extrabold text-2xl sm:text-3xl mb-1" style={{ color: c }}>{v}</div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide">{l}</div>
                </div>
              );
            })}
          </div>

          <BudgetBreakdown budget={budgetData} />
          <SafetyAlerts distance={routeData.distance} />
          <StopPoints distance={routeData.distance} />
          <ExportOptions routeData={routeData} budgetData={budgetData} formValues={formValues} />
        </div>
      )}
    </div>
  );
}
