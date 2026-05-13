'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, LogOut, Map, Award, Eye, EyeOff, Loader2 } from 'lucide-react';

var BADGES = [
  { label: 'Primeira Viagem',       icon: '🚗', color: '#39FF14' },
  { label: 'Explorador',            icon: '🗺️', color: '#00D4FF' },
  { label: 'Cacador de Cachoeiras', icon: '💦', color: '#00D4FF' },
  { label: 'Rei do Asfalto',        icon: '👑', color: '#FFD700' },
  { label: 'Gourmet de Estrada',    icon: '🍔', color: '#FF6B35' },
  { label: '10.000 km Rodados',     icon: '🏆', color: '#B24BF3' },
];

export default function ProfilePage() {
  var [session,     setSession]     = useState(null);
  var [loading,     setLoading]     = useState(true);
  var [authMode,    setAuthMode]    = useState('login');
  var [email,       setEmail]       = useState('');
  var [password,    setPassword]    = useState('');
  var [showPass,    setShowPass]    = useState(false);
  var [authLoading, setAuthLoading] = useState(false);
  var [authError,   setAuthError]   = useState('');
  var [authMsg,     setAuthMsg]     = useState('');

  useEffect(function() {
    supabase.auth.getSession().then(function({ data }) { setSession(data.session); setLoading(false); });
    var sub = supabase.auth.onAuthStateChange(function(_e, s) { setSession(s); });
    return function() { sub.data.subscription.unsubscribe(); };
  }, []);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true); setAuthError(''); setAuthMsg('');
    try {
      if (authMode === 'login') {
        var { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        var { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setAuthMsg('Verifique seu email para confirmar o cadastro!');
      }
    } catch (err) {
      setAuthError(err.message || 'Erro na autenticacao.');
    } finally {
      setAuthLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-br-green" /></div>;

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-br-green/10 border border-br-green/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-br-green" />
          </div>
          <h1 className="font-syne font-extrabold text-2xl">{authMode === 'login' ? 'Entrar na conta' : 'Criar conta gratis'}</h1>
          <p className="text-gray-500 text-sm mt-2">{authMode === 'login' ? 'Acesse suas viagens salvas.' : 'Comece a planejar suas aventuras.'}</p>
        </div>
        <form onSubmit={handleAuth} className="br-card p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input type="email" className="br-input pl-9" placeholder="seu@email.com" value={email} onChange={function(e) { setEmail(e.target.value); }} required />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input type={showPass ? 'text' : 'password'} className="br-input pl-9 pr-10" placeholder="Minimo 6 caracteres" value={password} onChange={function(e) { setPassword(e.target.value); }} required minLength={6} />
              <button type="button" onClick={function() { setShowPass(!showPass); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {authError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{authError}</p>}
          {authMsg   && <p className="text-br-green text-sm bg-br-green/10 border border-br-green/20 rounded-lg px-4 py-3">{authMsg}</p>}
          <button type="submit" disabled={authLoading} className="btn-neon w-full flex items-center justify-center gap-2">
            {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
          <div className="text-center">
            <button type="button" onClick={function() { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); setAuthMsg(''); }} className="text-sm text-gray-500 hover:text-white transition-colors">
              {authMode === 'login' ? 'Nao tem conta? Crie gratis' : 'Ja tem conta? Entrar'}
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-700 mt-4">
          Voce tambem pode <a href="/planejar" className="text-br-green hover:underline">usar sem cadastro</a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-br-green font-mono text-xs uppercase tracking-widest">Meu Espaco</span>
          <h1 className="font-syne font-extrabold text-3xl mt-1">Ola, aventureiro! 👋</h1>
        </div>
        <button onClick={function() { supabase.auth.signOut(); }} className="btn-ghost flex items-center gap-2 text-sm text-gray-400">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      <div className="br-card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-br-green/15 border border-br-green/20 flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-br-green" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="font-syne font-extrabold text-xl">{session.user.email.split('@')[0]}</h2>
          <p className="text-gray-500 text-sm">{session.user.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-4">
            {[{ l: 'Viagens', v: '0' }, { l: 'Km rodados', v: '0' }, { l: 'Dicas', v: '0' }].map(function({ l, v }) {
              return (
                <div key={l} className="text-center sm:text-left">
                  <div className="font-syne font-extrabold text-xl text-br-green">{v}</div>
                  <div className="text-gray-600 text-xs">{l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="br-card p-6 mb-6">
        <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-br-orange" /> Minhas Medalhas</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BADGES.map(function(b, i) {
            return (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/2 opacity-30">
                <span className="text-2xl">{b.icon}</span>
                <span className="text-xs text-gray-500 text-center leading-tight">{b.label}</span>
              </div>
            );
          })}
        </div>
        <p className="text-gray-600 text-xs mt-4">Faca viagens e publique dicas para desbloquear medalhas!</p>
      </div>

      <div className="br-card p-6">
        <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Map className="w-5 h-5 text-br-blue" /> Minhas Viagens</h2>
        <div className="text-center py-12 text-gray-600">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Voce ainda nao salvou viagens.</p>
          <a href="/planejar" className="text-br-green text-sm hover:underline mt-2 inline-block">Planejar minha primeira rota</a>
        </div>
      </div>
    </div>
  );
}
