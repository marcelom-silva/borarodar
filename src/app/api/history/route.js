// src/app/api/history/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Salva e recupera histórico de viagens do usuário logado
//
// Supabase table (criar via SQL editor):
// CREATE TABLE user_trips (
//   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   name        text,
//   trip_data   jsonb NOT NULL,
//   created_at  timestamptz DEFAULT now(),
//   updated_at  timestamptz DEFAULT now()
// );
// ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "owner_all" ON user_trips
//   USING (auth.uid() = user_id)
//   WITH CHECK (auth.uid() = user_id);
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function getUserFromRequest(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

// POST — salva viagem
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await req.json();
    const { formValues, routeData, budgetData, itinerary, name } = body;

    const tripName = name ||
      `${formValues?.origem?.split(',')[0] || '?'} → ${formValues?.destino?.split(',')[0] || '?'}`;

    const tripData = {
      formValues: {
        origem: formValues?.origem, destino: formValues?.destino,
        passageiros: formValues?.passageiros, noites: formValues?.noites,
        viagem_style: formValues?.viagem_style, vehicle_type: formValues?.vehicle_type,
        combustivel: formValues?.combustivel, travel_profile: formValues?.travel_profile,
        is_round_trip: formValues?.is_round_trip, waypoints: formValues?.waypoints,
        km_litro: formValues?.km_litro, preco_litro: formValues?.preco_litro,
      },
      routeData: routeData ? {
        distance: routeData.distance, duration: routeData.duration,
        origLabel: routeData.origLabel, destLabel: routeData.destLabel,
        waypoints: routeData.waypoints,
      } : null,
      budgetData,
      itinerary: itinerary ? itinerary.substring(0, 15000) : null,
    };

    const { data, error } = await supabase
      .from('user_trips')
      .insert({ user_id: user.id, name: tripName, trip_data: tripData })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id, success: true });
  } catch (err) {
    console.error('History POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — lista viagens (max 20) ou busca uma por ID
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('user_trips')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 });
      return NextResponse.json({ trip: data });
    }

    const { data, error } = await supabase
      .from('user_trips')
      .select('id, name, created_at, trip_data->formValues->origem, trip_data->formValues->destino, trip_data->budgetData->total')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ trips: data || [] });
  } catch (err) {
    console.error('History GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove viagem
export async function DELETE(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabase
      .from('user_trips')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
