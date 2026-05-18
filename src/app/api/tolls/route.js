// src/app/api/tolls/route.js
// calcularpedagio.com.br (grátis) + SA estático + cache Supabase
// ENV: CALCPEDAGIO_API_KEY — cadastro GRÁTIS em calcularpedagio.com.br/register
//      Trial: 350 req/mês por 30 dias. Cache Supabase evita requisições repetidas.
// Supabase cache table (SQL Editor):
//   CREATE TABLE IF NOT EXISTS toll_cache (
//     cache_key text PRIMARY KEY, result jsonb NOT NULL,
//     created_at timestamptz DEFAULT now()
//   );
//   ALTER TABLE toll_cache ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "all" ON toll_cache USING (true) WITH CHECK (true);
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CP_KEY = process.env.CALCPEDAGIO_API_KEY;
const CP_URL = 'https://www.calcularpedagio.com.br/api/coordenadas/v3';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const SA_DB = {
  AR:{name:'Argentina',currency:'ARS',symbol:'$',acceptsCard:true,tag:'TelePASE',tagDiscount:'15-20%',
    info:'A maioria das rodovias federais aceita débito/crédito e dinheiro. TelePASE funciona em todo o país com 15-20% de desconto. Nas estradas remotas (Patagônia, NOA) prefira dinheiro.',
    corridors:[
      {route:'Ruta 2',name:'Buenos Aires → Mar del Plata',km:404,ars:18000,plazas:8},
      {route:'Ruta 9',name:'Buenos Aires → Córdoba',km:715,ars:25000,plazas:7},
      {route:'Ruta 7',name:'Buenos Aires → Mendoza',km:1058,ars:38000,plazas:13},
      {route:'Ruta 12',name:'Buenos Aires → Puerto Iguazú',km:1371,ars:46000,plazas:16},
      {route:'Ruta 3',name:'Buenos Aires → Bariloche',km:1633,ars:22000,plazas:9},
      {route:'Ruta 7',name:'Mendoza → Santiago (Los Libertadores)',km:345,ars:12000,plazas:5},
    ]},
  CL:{name:'Chile',currency:'CLP',symbol:'CLP',acceptsCard:true,tag:'TAG Electrónico',tagDiscount:'Obrigatório em Free Flow',
    info:'⚠️ ATENÇÃO: Chile usa Free Flow eletrônico — sem cabines físicas nas rodovias modernas! Baixe o app "Autopista.cl" e cadastre a placa antes de sair. Sem pagamento = multa. Estradas antigas têm cabines com cartão/dinheiro.',
    corridors:[
      {route:'Ruta 5S',name:'Santiago → Temuco',km:677,clp:30000,plazas:9},
      {route:'Ruta 5S',name:'Santiago → Puerto Montt',km:1020,clp:48000,plazas:14},
      {route:'Ruta 5N',name:'Santiago → Antofagasta',km:1370,clp:38000,plazas:8},
      {route:'Ruta 68',name:'Santiago → Valparaíso',km:115,clp:14000,plazas:5},
      {route:'Ruta 60',name:'Santiago → Mendoza',km:245,clp:9000,plazas:3},
    ]},
  UY:{name:'Uruguai',currency:'UYU',symbol:'$U',acceptsCard:true,tag:'Telepeaje',tagDiscount:'22%',
    info:'Poucos pedágios. Aceita débito/crédito e dinheiro. Telepeaje = 22% de desconto.',
    corridors:[
      {route:'Ruta 1',name:'Montevideo → Colônia del Sacramento',km:180,uyu:550,plazas:2},
      {route:'Ruta 5',name:'Montevideo → Rivera',km:490,uyu:1300,plazas:5},
      {route:'Ruta 8',name:'Montevideo → Chuy',km:335,uyu:900,plazas:3},
    ]},
  PY:{name:'Paraguai',currency:'PYG',symbol:'Gs.',acceptsCard:false,tag:'Sem TAG',tagDiscount:null,
    info:'Somente DINHEIRO (Guaranis). Câmbio informal aceita Reais. Valores baixos (~R$ 3-10 por praça).',
    corridors:[
      {route:'Ruta 7',name:'Assunção → Ciudad del Este',km:327,pyg:90000,plazas:4},
      {route:'Ruta 1',name:'Assunção → Encarnación',km:371,pyg:80000,plazas:3},
    ]},
  BO:{name:'Bolívia',currency:'BOB',symbol:'Bs.',acceptsCard:false,tag:'Sem TAG',tagDiscount:null,
    info:'Poucos pedágios, valores mínimos (R$ 1-3). Somente dinheiro.',
    corridors:[{route:'Ruta 4',name:'La Paz → Santa Cruz',km:620,bob:20,plazas:2}]},
  PE:{name:'Peru',currency:'PEN',symbol:'S/',acceptsCard:true,tag:'PeajeNet',tagDiscount:'10%',
    info:'Aceita cartão e dinheiro. Panamericana bem mantida.',
    corridors:[{route:'Panamerica',name:'Lima → Arequipa',km:1009,pen:120,plazas:8}]},
  CO:{name:'Colômbia',currency:'COP',symbol:'COP',acceptsCard:true,tag:'TAG Vial',tagDiscount:'Alguns',
    info:'Sistema bem desenvolvido. Aceita cartão e dinheiro.',
    corridors:[{route:'Ruta 45',name:'Bogotá → Medellín',km:415,cop:95000,plazas:6}]},
};

function detectForeignCountries(orig, dest) {
  const text = ((orig||'')+' '+(dest||'')).toLowerCase();
  const checks = {
    AR:['argentin','buenos aires','mendoza','bariloche','iguazú','patagônia','córdoba','rosário'],
    CL:['chile','santiago','temuco','valparaíso','puerto montt','antofagasta','arica'],
    UY:['uruguai','uruguay','montevideo','colônia del sacramento','rivera'],
    PY:['paraguai','paraguay','assunção','asunción','ciudad del este'],
    BO:['bolívia','bolivia','la paz','santa cruz de la sierra','oruro'],
    PE:['peru','lima','arequipa','trujillo','cusco'],
    CO:['colômbia','colombia','bogotá','medellín','cali','cartagena'],
  };
  return Object.keys(checks).filter(c => checks[c].some(kw => text.includes(kw)));
}

function getCostField(vt) {
  return {carro:'auto2eixos',suv:'auto2eixos',pickup:'auto3eixos',moto:'moto2eixos',
    motohome:'motorHome2eixos',caminhao:'valorPorEixoCaminhao',
    ev:'auto2eixos','ev-suv':'auto2eixos','ev-pickup':'auto3eixos'}[vt] || 'auto2eixos';
}

function buildCacheKey(coords, vt) {
  const first = coords?.[0] || [];
  const last  = coords?.[coords.length-1] || [];
  return `t:${first.map(n=>n?.toFixed(2)).join(',')}_${last.map(n=>n?.toFixed(2)).join(',')}_${vt}`;
}

export async function POST(req) {
  try {
    const { origLabel, destLabel, vehicleType='carro', coordinates } = await req.json();
    const foreign = detectForeignCountries(origLabel, destLabel);

    // Real tolls for Brazil
    if (foreign.length === 0 && CP_KEY && coordinates?.length >= 2) {
      const ck = buildCacheKey(coordinates, vehicleType);
      const exp = new Date(Date.now() - 30*86400000).toISOString();
      const { data: cached } = await supabase.from('toll_cache')
        .select('result').eq('cache_key', ck).gt('created_at', exp).maybeSingle();
      if (cached?.result) return NextResponse.json({...cached.result, cached:true});

      const cf = getCostField(vehicleType);
      const cpRes = await fetch(CP_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${CP_KEY}`},
        body: JSON.stringify({ pontos: coordinates }),
        signal: AbortSignal.timeout(10000),
      });

      if (cpRes.ok) {
        const d = (await cpRes.json()).dados;
        if (d) {
          const totalToll = d.custoTotalPedagiosTag?.[cf] ?? d.custoTotalPedagiosDinheiro?.[cf] ?? 0;
          const plazas = (d.pedagiosRota||[]).map(p => ({
            name:    p.localidade || p.nomeRodovia || 'Praça',
            road:    p.rodovia || '', state: p.estado || '',
            cashCost:p.custosDinheiro?.[cf] ?? null,
            tagCost: p.custoTag?.[cf]        ?? null,
            amount:  p.custoTag?.[cf] ?? p.custosDinheiro?.[cf] ?? 0,
            acceptsCard: p.dinheiro !== 'not available',
            currency:'BRL',
          }));
          const result = {source:'calcularpedagio',totalToll,currency:'BRL',plazas,
            totalDinheiro:d.custoTotalPedagiosDinheiro?.[cf],
            totalTag:d.custoTotalPedagiosTag?.[cf],
            acceptsCard:plazas.some(p=>p.acceptsCard)};
          await supabase.from('toll_cache').upsert({cache_key:ck,result,created_at:new Date().toISOString()});
          return NextResponse.json(result);
        }
      }
    }

    // Static data for South America
    if (foreign.length > 0) {
      return NextResponse.json({source:'static', countries:foreign.map(c=>({country:c,...SA_DB[c]}))});
    }

    return NextResponse.json({source:'estimate', totalToll:null,
      hint: CP_KEY ? 'api_unavailable' : 'Adicione CALCPEDAGIO_API_KEY no .env.local — cadastro grátis em calcularpedagio.com.br/register'});

  } catch(err) {
    console.error('tolls route error:', err);
    return NextResponse.json({source:'estimate', error:err.message});
  }
}
