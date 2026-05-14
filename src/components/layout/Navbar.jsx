'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

var FLAGS = {
  pt: (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect width="20" height="14" rx="2" fill="#009C3B"/>
      <rect x="6" width="8" height="14" fill="#009C3B"/>
      <polygon points="0,0 8,7 0,14" fill="#FEDF00"/>
      <polygon points="20,0 12,7 20,14" fill="#FEDF00"/>
      <circle cx="10" cy="7" r="3.5" fill="#002776"/>
      <path d="M6.8 7.2 Q10 5.5 13.2 7.2" stroke="white" strokeWidth="0.7" fill="none"/>
    </svg>
  ),
  en: (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect width="20" height="14" rx="2" fill="#012169"/>
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="white" strokeWidth="2.5"/>
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#C8102E" strokeWidth="1.5"/>
      <path d="M10 0 V14 M0 7 H20" stroke="white" strokeWidth="3.5"/>
      <path d="M10 0 V14 M0 7 H20" stroke="#C8102E" strokeWidth="2"/>
    </svg>
  ),
  es: (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect width="20" height="14" rx="2" fill="#AA151B"/>
      <rect y="3.5" width="20" height="7" fill="#F1BF00"/>
      <rect y="3.5" width="20" height="1" fill="#AA151B"/>
      <rect y="9.5" width="20" height="1" fill="#AA151B"/>
    </svg>
  ),
};

// Avatar do usuario logado
function UserAvatar({ user, size }) {
  var s = size || 28;
  var name = user.user_metadata?.full_name || user.email || 'U';
  var initial = name[0].toUpperCase();
  if (user.user_metadata?.avatar_url) {
    return (
      <img
        src={user.user_metadata.avatar_url}
        alt={name}
        width={s}
        height={s}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width:s+'px', height:s+'px', border:'2px solid rgba(57,255,20,0.4)' }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center font-syne font-black text-black flex-shrink-0"
      style={{ width:s+'px', height:s+'px', background:'#39FF14', fontSize:Math.floor(s*0.42)+'px' }}>
      {initial}
    </div>
  );
}

export default function Navbar() {
  var { lang, setLang, t }   = useLanguage();
  var [open,    setOpen]     = useState(false);
  var [user,    setUser]     = useState(null);
  var [menuOpen, setMenuOpen]= useState(false);
  var pathname = usePathname();
  var menuRef  = useRef(null);

  // Auth state
  useEffect(function() {
    supabase.auth.getSession().then(function({ data }) {
      setUser(data.session ? data.session.user : null);
    });
    var sub = supabase.auth.onAuthStateChange(function(_, session) {
      setUser(session ? session.user : null);
    });
    return function() { sub.data.subscription.unsubscribe(); };
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(function() {
    function fn(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', fn);
    return function() { document.removeEventListener('mousedown', fn); };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  var NAV = [
    { href:'/planejar',   label: t('nav_planejar')  },
    { href:'/comunidade', label: t('nav_galera')    },
    { href:'/explorar',   label: t('nav_explorar')  },
    { href:'/ajuda',      label: t('nav_ajuda')     },
  ];

  var firstName = user
    ? (user.user_metadata?.full_name || user.email || '').split(' ')[0]
    : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background:'rgba(10,10,10,0.85)', backdropFilter:'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-br-green flex items-center justify-center">
            <span className="text-black font-syne font-black text-sm">BR</span>
          </div>
          <span className="font-syne font-extrabold text-lg hidden sm:block">
            Bora<span className="text-br-green">Rodar</span>
          </span>
        </Link>

        {/* Links — desktop */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV.map(function({ href, label }) {
            var active = pathname === href;
            return (
              <Link key={href} href={href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: active ? '#39FF14' : '#9CA3AF', background: active ? 'rgba(57,255,20,0.08)' : 'transparent' }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Direita: flags + perfil */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {/* Seletor de idioma */}
          {Object.keys(FLAGS).map(function(l) {
            return (
              <button key={l} onClick={function() { setLang(l); }} title={l.toUpperCase()}
                className="rounded-md overflow-hidden transition-all hover:opacity-100"
                style={{ opacity: lang === l ? 1 : 0.4, outline: lang === l ? '2px solid rgba(57,255,20,0.5)' : 'none', borderRadius:'4px' }}>
                {FLAGS[l]}
              </button>
            );
          })}

          {/* Perfil ou Avatar */}
          {user ? (
            <div ref={menuRef} className="relative ml-1">
              <button
                onClick={function() { setMenuOpen(!menuOpen); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all hover:border-br-green/30"
                style={{ border:'1px solid rgba(57,255,20,0.2)', background:'rgba(57,255,20,0.06)' }}>
                <UserAvatar user={user} size={26}/>
                <span className="text-sm font-medium text-white max-w-[90px] truncate">{firstName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-card z-50"
                  style={{ background:'#111', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <div className="p-3 border-b border-white/5">
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link href="/perfil" onClick={function(){ setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5">
                    <User className="w-4 h-4 text-br-green"/>
                    {t('nav_perfil')}
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5">
                    <LogOut className="w-4 h-4"/>
                    {t('profile_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/perfil"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors border border-white/8 hover:border-white/20">
              <User className="w-4 h-4"/>
              {t('nav_perfil')}
            </Link>
          )}
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user && <UserAvatar user={user} size={30}/>}
          <button onClick={function() { setOpen(!open); }} className="text-gray-400 hover:text-white transition-colors">
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1" style={{ background:'rgba(10,10,10,0.95)' }}>
          {NAV.map(function({ href, label }) {
            return (
              <Link key={href} href={href} onClick={function() { setOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: pathname===href ? '#39FF14' : '#9CA3AF', background: pathname===href ? 'rgba(57,255,20,0.08)' : 'transparent' }}>
                {label}
              </Link>
            );
          })}

          {/* Perfil mobile */}
          {user ? (
            <div className="pt-2 border-t border-white/5 mt-2">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <UserAvatar user={user} size={36}/>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.user_metadata?.full_name || firstName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/perfil" onClick={function(){ setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5">
                <User className="w-4 h-4 text-br-green"/>{t('nav_perfil')}
              </Link>
              <button onClick={function(){ handleLogout(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-white/5 mt-1">
                <LogOut className="w-4 h-4"/>{t('profile_logout')}
              </button>
            </div>
          ) : (
            <Link href="/perfil" onClick={function(){ setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400">
              <User className="w-4 h-4"/>{t('nav_perfil')}
            </Link>
          )}

          {/* Flags mobile */}
          <div className="flex gap-2 px-3 pt-2 border-t border-white/5 mt-1">
            {Object.keys(FLAGS).map(function(l) {
              return (
                <button key={l} onClick={function() { setLang(l); setOpen(false); }}
                  className="rounded overflow-hidden" style={{ opacity: lang===l ? 1 : 0.4 }}>
                  {FLAGS[l]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
