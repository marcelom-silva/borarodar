'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RouteForm from './RouteForm';
import MapView from './MapView';
import BudgetBreakdown from './BudgetBreakdown';
import StopPoints from './StopPoints';
import SafetyAlerts from './SafetyAlerts';
import ExportOptions from './ExportOptions';
import DayItinerary from './DayItinerary';
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
    noites:      '2',
    perfil:      'casal',
    interesses:  [],
    waypoints:   [],
  });

  useEffect(function() {
    if (formValues.origem && formValues.destino) handleCalculate(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCalculate(values) {
    setLoading(true); setError(''); setRouteData(null); setBudgetData(null);
    try {
      var origResults = await geocode(values.origem);
      var destResults = await geocode(values.destino);
      if (!origResults.length) throw new Error('Origem nao encontrada. Tente: "Sao Paulo, SP"');
      if (!destResults.length) throw new Error('Destino nao encontrado. Tente: "Rio de Janeiro, RJ"');

      var orig = { lat: parseFloat(origResults[0].lat), lng: parseFloat(origResults[0].lon) };
      var dest = { lat: parseFloat(destResults[0].lat), lng: parseFloat(destResults[0].lon) };

      // Resolver waypoints
      var resolvedWPs = [];
      for (var i = 0; i < (values.waypoints || []).length; i++) {
        var wp = values.waypoints[i];
        if (wp.name && wp.name.trim()) {
          var res = await geocode(wp.name);
          if (res.length) {
            resolvedWPs.push({ name: wp.name, coords: { lat: parseFloat(res[0].lat), lng: parseFloat(res[0].lon) }, label: res[0].display_name });
          }
        }
      }

      var route  = await calculateRoute(orig, dest, resolvedWPs);
      var distKm = route.distance / 1000;
      var durHrs = route.duration / 3600;

      var rd = { distance: distKm, duration: durHrs, geometry: route.geometry, origin: orig, destination: dest, origLabel: values.origem, destLabel: values.destino, waypoints: resolvedWPs };
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
        <p className="text-gray-500 mt-2">Rota, orcamento, paradas e roteiro dia a dia — tudo em um lugar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <RouteForm values={formValues} onChange={setFormValues} onCalculate={handleCalculate} loading={loading} />
        </div>
        <div className="lg:col-span-3">
          <div className="br-card overflow-hidden h-[480px] sm:h-[560px] flex items-center justify-center">
            {routeData
              ? <MapView routeData={routeData} />
              : (
                <div className="flex flex-col items-center gap-3 text-gray-600 p-6 text-center">
                  <Map className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Preencha origem e destino e clique em Calcular</p>
                  <p className="text-xs text-gray-700">Suporte a paradas intermediarias e roteiro dia a dia</p>
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
          Calculando rota e montando seu roteiro...
        </div>
      )}

      {routeData && budgetData && (
        <div className="mt-8 space-y-6 animate-slide-up">

          {/* Waypoints confirmados */}
          {routeData.waypoints && routeData.waypoints.length > 0 && (
            <div className="br-card p-4">
              <p className="font-syne font-bold text-sm mb-3 text-br-orange">Paradas confirmadas na rota:</p>
              <div className="flex flex-wrap gap-2">
                {routeData.waypoints.map(function(wp, i) {
                  return <span key={i} className="waypoint-item text-xs">📍 {wp.name}</span>;
                })}
              </div>
            </div>
          )}

          {/* Cards de resumo */}
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

          {/* ROTEIRO DIA A DIA (novo!) */}
          <DayItinerary
            destination={formValues.destino}
            days={parseInt(formValues.noites) + 1 || 1}
            passengers={parseInt(formValues.passageiros) || 1}
          />

          <SafetyAlerts distance={routeData.distance} />
          <StopPoints
            distance={routeData.distance}
            days={parseInt(formValues.noites) + 1 || 1}
            destLabel={formValues.destino}
          />
          <ExportOptions routeData={routeData} budgetData={budgetData} formValues={formValues} />
        </div>
      )}
    </div>
  );
}
