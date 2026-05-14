'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, Map, Award, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var BADGES = [
  { id:'first_trip', label:'Primeira Viagem',       icon:'🚗', color:'#39FF14' },
  { id:'explorer',   label:'Explorador',             icon:'🗺️', color:'#00D4FF' },
  { id:'waterfall',  label:'Cacador de Cachoeiras',  icon:'💦', color:'#00D4FF' },
  { id:'king_road',  label:'Rei do Asfalto',         icon:'👑', color:'#FFD700' },
  { id:'foodie',     label:'Gourmet de Estrada',     icon:'🍔', color:'#FF6B35' },
  { id:'marathon',   label:'Maratonista',            icon:'🏆', color:'#B24BF3' },
  { id:'community',  label:'Voz da Estrada',         icon:'📢', color:'#00D4FF' },
  { id:'sharer',     label:'Compartilhador',         icon:'📤', color:'#FF6B35' },
  { id:'south',      label:'Sul em Peso',            icon:'🌲', color:'#39FF14' },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function ProfilePage() {
  var { t } = useLanguage();
  var [session,     setSession]     = useState(null);
  var [loading,     setLoading]     = useState(true);
  var [authMode,    setAuthMode]    = useState('login');
  var [email,       setEmail]       = useState('');
  var [password,    setPassword]    = useState('');
  var [showPass,    setShowPass]    = useState(false);
  var [authLoading, setAuthLoading] = useState(false);
  var [googleLoad,  setGoogleLoad]  = useState(false);
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
    } catch (err) { setAuthError(err.message || t('common_error')); }
    finally { setAuthLoading(false); }
  }

  async function handleGoogle() {
    setGoogleLoad(true); setAuthError('');
    try {
      var { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/perfil',
          // Força sempre mostrar o seletor de conta Google
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (err) { setAuthError('Erro Google: ' + err.message); setGoogleLoad(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-br-green"/>
    </div>
  );

  // Tela de login
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-br-green/10 border border-br-green/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-br-green"/>
          </div>
          <h1 className="font-syne font-extrabold text-2xl">
            {authMode === 'login' ? t('profile_login_title') : t('profile_register_title')}
          </h1>
        </div>

        <div className="br-card p-6 space-y-4">
          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoad} className="btn-google">
            {googleLoad ? <Loader2 className="w-4 h-4 animate-spin"/> : <GoogleIcon/>}
            {googleLoad ? t('common_loading') : t('profile_google')}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="text-gray-600 text-xs">ou</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"/>
                <input type="email" className="br-input" style={{ paddingLeft:'2.25rem' }} placeholder={t('profile_email_ph')}
                  value={email} onChange={function(e) { setEmail(e.target.value); }} required/>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"/>
                <input type={showPass ? 'text' : 'password'} className="br-input" style={{ paddingLeft:'2.25rem', paddingRight:'2.5rem' }}
                  placeholder={t('profile_pass_ph')} value={password} onChange={function(e) { setPassword(e.target.value); }} required minLength={6}/>
                <button type="button" onClick={function() { setShowPass(!showPass); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            {authError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{authError}</p>}
            {authMsg   && <p className="text-br-green text-sm bg-br-green/10 border border-br-green/20 rounded-lg px-4 py-3">{authMsg}</p>}

            <button type="submit" disabled={authLoading} className="btn-neon w-full flex items-center justify-center gap-2">
              {authLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
              {authMode === 'login' ? t('profile_login_btn') : t('profile_register_btn')}
            </button>
          </form>

          <div className="text-center">
            <button type="button"
              onClick={function() { setAuthMode(authMode==='login' ? 'register' : 'login'); setAuthError(''); setAuthMsg(''); }}
              className="text-sm text-gray-500 hover:text-white transition-colors">
              {authMode === 'login' ? t('profile_no_account') : t('profile_has_account')}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          <a href="/planejar" className="text-br-green hover:underline">{t('profile_use_free')} →</a>
        </p>
      </div>
    );
  }

  // Tela de perfil logado
  var userName   = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  var userAvatar = session.user.user_metadata?.avatar_url;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <span className="text-br-green font-mono text-xs uppercase tracking-widest">Meu Espaco</span>
        <h1 className="font-syne font-extrabold text-3xl mt-1">
          {t('profile_greeting').replace('aventureiro', userName.split(' ')[0])} 👋
        </h1>
      </div>

      {/* Card de perfil */}
      <div className="br-card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-br-green/15 border border-br-green/20 flex items-center justify-center">
          {userAvatar
            ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
            : <User className="w-10 h-10 text-br-green"/>
          }
        </div>
        <div className="text-center sm:text-left">
          <h2 className="font-syne font-extrabold text-xl">{userName}</h2>
          <p className="text-gray-500 text-sm">{session.user.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-4">
            {[
              { l: t('profile_trips'),    v:'0' },
              { l: t('profile_km'),       v:'0' },
              { l: t('profile_tips_ct'),  v:'0' },
            ].map(function({ l, v }) {
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

      {/* Medalhas */}
      <div className="br-card p-6 mb-6">
        <h2 className="font-syne font-bold text-lg mb-1 flex items-center gap-2">
          <Award className="w-5 h-5 text-br-orange"/>{t('profile_badges')}
        </h2>
        <p className="text-gray-600 text-xs mb-5">{t('profile_badges_sub')}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {BADGES.map(function(b) {
            return (
              <div key={b.id} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/2 opacity-30">
                <span className="text-2xl" style={{ filter:'grayscale(1)' }}>{b.icon}</span>
                <span className="text-xs text-gray-500 text-center leading-tight">{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historico */}
      <div className="br-card p-6">
        <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2">
          <Map className="w-5 h-5 text-br-blue"/>{t('profile_history')}
        </h2>
        <div className="text-center py-12 text-gray-600">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-20"/>
          <p className="text-sm">{t('profile_empty')}</p>
          <a href="/planejar" className="text-br-green text-sm hover:underline mt-2 inline-block">{t('profile_plan_first')} →</a>
        </div>
      </div>
    </div>
  );
}
