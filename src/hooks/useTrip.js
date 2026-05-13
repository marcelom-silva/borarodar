'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useTrip() {
  var [saving, setSaving] = useState(false);
  var [error,  setError]  = useState('');

  async function saveTrip({ userId, tripData, isPublic }) {
    if (!userId) { setError('Faca login para salvar viagens.'); return false; }
    setSaving(true); setError('');
    try {
      var rec = {
        user_id:            userId,
        title:              tripData.origLabel + ' -> ' + tripData.destLabel,
        origin:             tripData.origLabel,
        destination:        tripData.destLabel,
        origin_coords:      { lat: tripData.origin.lat, lng: tripData.origin.lng },
        destination_coords: { lat: tripData.destination.lat, lng: tripData.destination.lng },
        distance_km:        tripData.distance,
        duration_hours:     tripData.duration,
        is_public:          isPublic || false,
      };
      var { error: err } = await supabase.from('trips').insert(rec);
      if (err) throw err;
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { saveTrip, saving, error };
}
