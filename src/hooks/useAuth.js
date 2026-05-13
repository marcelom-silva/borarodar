'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  var [session, setSession] = useState(null);
  var [loading, setLoading] = useState(true);
  useEffect(function() {
    supabase.auth.getSession().then(function({ data }) { setSession(data.session); setLoading(false); });
    var sub = supabase.auth.onAuthStateChange(function(_e, s) { setSession(s); });
    return function() { sub.data.subscription.unsubscribe(); };
  }, []);
  return { session, user: session ? session.user : null, loading };
}
