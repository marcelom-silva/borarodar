// src/app/api/share/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Cria e recupera viagens compartilhadas publicamente
//
// Supabase table (criar via SQL editor):
// CREATE TABLE shared_trips (
//   id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   trip_data  jsonb NOT NULL,
//   created_at timestamptz DEFAULT now(),
//   expires_at timestamptz DEFAULT (now() + interval '6 months'),
//   views      integer DEFAULT 0
// );
// ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public_read"  ON shared_trips FOR SELECT USING (true);
// CREATE POLICY "public_insert" ON shared_trips FOR INSERT WITH CHECK (true);
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// POST /api/share — salva e retorna o ID público
export async function POST(req) {
  try {
    const body = await req.json();
    const { formValues, routeData, budgetData, itinerary } = body;

    if (!formValues?.destino) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    // Sanitiza dados (remove campos sensíveis, limita tamanho)
    const tripData = {
      formValues: {
        origem:         formValues.origem,
        destino:        formValues.destino,
        passageiros:    formValues.passageiros,
        noites:         formValues.noites,
        viagem_style:   formValues.viagem_style,
        vehicle_type:   formValues.vehicle_type,
        combustivel:    formValues.combustivel,
        travel_profile: formValues.travel_profile,
        is_round_trip:  formValues.is_round_trip,
        waypoints:      formValues.waypoints,
      },
      routeData: routeData ? {
        distance:   routeData.distance,
        duration:   routeData.duration,
        origLabel:  routeData.origLabel,
        destLabel:  routeData.destLabel,
        waypoints:  routeData.waypoints,
        // geometry omitida (pesada) — rota recalculada ao visualizar
      } : null,
      budgetData,
      itinerary: itinerary ? itinerary.substring(0, 15000) : null, // max 15k chars
      sharedAt: new Date().toISOString(),
      version: '1.0',
    };

    const { data, error } = await supabase
      .from('shared_trips')
      .insert({ trip_data: tripData })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, success: true });
  } catch (err) {
    console.error('Share API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/share?id=xxx — recupera viagem compartilhada
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    // Busca viagem + incrementa visualizações
    const { data, error } = await supabase
      .from('shared_trips')
      .select('id, trip_data, created_at, views')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Viagem não encontrada' }, { status: 404 });
    }

    // Incrementa views async (não bloqueia response)
    supabase.from('shared_trips')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return NextResponse.json({
      id: data.id,
      tripData: data.trip_data,
      createdAt: data.created_at,
      views: (data.views || 0) + 1,
    });
  } catch (err) {
    console.error('Share GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
