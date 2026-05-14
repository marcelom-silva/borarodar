'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import RouteForm from './RouteForm';
import MapView from './MapView';
import BudgetBreakdown from './BudgetBreakdown';
import StopPoints from './StopPoints';
import SafetyAlerts from './SafetyAlerts';
import ExportOptions from './ExportOptions';
import DayItinerary from './DayItinerary';
import { calculateRoute, geocode } from '@/lib/routing';
import { calculateBudget, getStyleLabel, DEFAULT_KML } from '@/lib/budget';
import { DEFAULT_VEHICLE } from '@/lib/vehicleData';
import { Map, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function formatDuration(hours) {
  var h=Math.floor(hours); var m=Math.round((hours-h)*60);
  if(h===0) return m+' min'; if(m===0) return h+'h'; return h+'h '+m+'min';
}

export default function PlannerMain() {
  var searchParams = useSearchParams();
  var { t } = useLanguage();

  var [routeData,  setRouteData]  = useState(null);
  var [budgetData, setBudgetData] = useState(null);
  var [loading,    setLoading]    = useState(false);
  var [error,      setError]      = useState('');

  var [formValues, setFormValues] = useState({
    origem:           searchParams.get('origem')  || '',
    destino:          searchParams.get('destino') || '',
    combustivel:      'gasolina',
    km_litro:         String(DEFAULT_VEHICLE.kml),
    preco_litro:      '5.89',
    passageiros:      '2',
    noites:           '0',
    waypoints:        [],
    viagem_style:     'moderado',
    vehicle_type:     DEFAULT_VEHICLE.vtype,
    vehicle_brand:    '',
    vehicle_model_name:'',
    vehicle_year:     '',
    kml_custom:       false,
    is_round_trip:    false,
    avoid_tolls:      false,
    date_from:        '',
    date_to:          '',
    plan_mode:        'completo',
  });

  // Limpar erro ao mudar valores do formulario
  var handleFormChange = useCallback(function(updater) {
    setFormValues(updater);
    setError(''); // auto-clear erro anterior
  }, []);

  useEffect(function() {
    if (formValues.origem && formValues.destino) handleCalculate(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCalculate(values) {
    setLoading(true); setError(''); setRouteData(null); setBudgetData(null);
    try {
      var origResults = await geocode(values.origem);
      var destResults = await geocode(values.destino);
      if (!origResults.length) throw new Error('Origem nao encontrada. Use: Cidade, Estado (ex: Brasilia, DF)');
      if (!destResults.length) throw new Error('Destino nao encontrado. Use: Cidade, Estado (ex: Sobral, CE)');

      var orig = {lat:parseFloat(origResults[0].lat), lng:parseFloat(origResults[0].lon)};
      var dest = {lat:parseFloat(destResults[0].lat), lng:parseFloat(destResults[0].lon)};

      var resolvedWaypoints = [];
      for (var i=0; i<(values.waypoints||[]).length; i++) {
        var wp = values.waypoints[i];
        if (wp.name&&wp.name.trim()) {
          var wpRes = await geocode(wp.name);
          if (wpRes.length) resolvedWaypoints.push({name:wp.name, coords:{lat:parseFloat(wpRes[0].lat),lng:parseFloat(wpRes[0].lon)}});
        }
      }

      // km/l: custom > modelo selecionado > default do tipo de veiculo > 13
      var kml = values.kml_custom
        ? parseFloat(values.km_litro) || 13
        : parseFloat(values.km_litro) || DEFAULT_KML[values.vehicle_type] || DEFAULT_VEHICLE.kml;

      var route = await calculateRoute(orig, dest, resolvedWaypoints);
      if (!route) throw new Error('Nao foi possivel calcular a rota.');

      var distKm = route.distance/1000;
      var durHrs = route.duration/3600;

      var rd = {
        distance:distKm, duration:durHrs, geometry:route.geometry,
        origin:orig, destination:dest,
        origLabel:values.origem, destLabel:values.destino,
        waypoints:resolvedWaypoints,
      };
      setRouteData(rd);

      setBudgetData(calculateBudget({
        distanceKm:    distKm,
        fuelType:      values.combustivel,
        kmPerLiter:    kml,
        pricePerLiter: parseFloat(values.preco_litro)||5.89,
        passengers:    parseInt(values.passageiros)||2,
        nights:        parseInt(values.noites)||0,
        travelStyle:   values.viagem_style||'moderado',
        vehicleType:   values.vehicle_type||DEFAULT_VEHICLE.vtype,
        isRoundTrip:   values.is_round_trip||false,
        avoidTolls:    values.avoid_tolls||false,
      }));
    } catch(err) {
      setError(err.message||t('common_error'));
    } finally {
      setLoading(false);
    }
  }

  var totalDays  = parseInt(formValues.noites)+1||1;
  var passengers = parseInt(formValues.passageiros)||1;
  var style      = formValues.viagem_style||'moderado';
  var planMode   = formValues.plan_mode||'completo';
  var onlyItinerary = planMode==='roteiro';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-6">
        <span className="text-br-green font-mono text-xs uppercase tracking-widest">{t('planner_tag')}</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">{t('planner_title')} 🗺️</h1>
        <p className="text-gray-500 mt-2">{t('planner_sub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <RouteForm values={formValues} onChange={handleFormChange} onCalculate={handleCalculate} loading={loading}/>
        </div>
        <div className="lg:col-span-3">
          {onlyItinerary ? (
            <div className="br-card h-full min-h-[300px] p-6 flex flex-col items-center justify-center gap-4 text-center" style={{background:'linear-gradient(135deg,rgba(178,75,243,0.06) 0%,rgba(0,212,255,0.06) 100%)',border:'1px solid rgba(178,75,243,0.15)'}}>
              <Sparkles className="w-12 h-12 text-br-purple opacity-60"/>
              <div>
                <h3 className="font-syne font-bold text-lg mb-1">{t('mode_itinerary')}</h3>
                <p className="text-gray-500 text-sm max-w-xs">{t('mode_itinerary_hint')}</p>
              </div>
            </div>
          ) : (
            <div className="br-card overflow-hidden h-[420px] sm:h-[500px] flex items-center justify-center">
              {routeData
                ? <MapView routeData={routeData}/>
                : (
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <Map className="w-12 h-12 opacity-30"/>
                    <p className="text-sm">{t('planner_map_hint')}</p>
                  </div>
                )
              }
            </div>
          )}
        </div>
      </div>

      {/* ERRO — aparece logo abaixo do grid, some automaticamente apos nova calculo com sucesso */}
      {error && (
        <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0"/>{error}
          <button onClick={function(){setError('');}} className="ml-auto text-red-400/60 hover:text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-br-green/30 border-t-br-green rounded-full animate-spin"/>
          {t('common_loading')}
        </div>
      )}

      {(routeData||onlyItinerary) && (budgetData||onlyItinerary) && (
        <div className="mt-8 space-y-6 animate-slide-up">
          {routeData&&routeData.waypoints&&routeData.waypoints.length>0 && (
            <div className="br-card p-4">
              <p className="font-syne font-bold text-sm mb-3 text-br-orange">{t('planner_stop')}s confirmadas:</p>
              <div className="flex flex-wrap gap-2">
                {routeData.waypoints.map(function(wp,i){return <span key={i} className="waypoint-item text-xs">📍 {wp.name}</span>;})}
              </div>
            </div>
          )}

          {!onlyItinerary&&routeData&&budgetData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {l:'Distancia',v:routeData.distance.toFixed(0)+' km',c:'#39FF14'},
                {l:'Tempo est.',v:formatDuration(routeData.duration),c:'#00D4FF'},
                {l:t('budget_total'),v:'R$ '+budgetData.total.toLocaleString('pt-BR'),c:'#FF6B35'},
                {l:t('cost_per_person'),v:'R$ '+budgetData.perPerson.toLocaleString('pt-BR'),c:'#B24BF3'},
              ].map(function({l,v,c},i){
                return (
                  <div key={i} className="br-card p-4 text-center">
                    <div className="font-syne font-extrabold text-lg sm:text-2xl mb-1" style={{color:c}}>{v}</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wide leading-tight">{l}</div>
                  </div>
                );
              })}
            </div>
          )}

          {!onlyItinerary&&budgetData&&<BudgetBreakdown budget={budgetData} passengers={passengers} travelStyle={style}/>}
          {!onlyItinerary&&routeData&&<SafetyAlerts distance={routeData.distance} vehicleType={formValues.vehicle_type} isRoundTrip={formValues.is_round_trip}/>}
          {!onlyItinerary&&routeData&&<StopPoints distance={routeData.distance} days={totalDays} destLabel={formValues.destino} travelStyle={style}/>}

          <DayItinerary
            destination={formValues.destino}
            days={totalDays}
            passengers={passengers}
            travelStyle={style}
            travelDate={formValues.date_from}
          />

          {!onlyItinerary&&routeData&&budgetData&&<ExportOptions routeData={routeData} budgetData={budgetData} formValues={formValues}/>}
        </div>
      )}
    </div>
  );
}
