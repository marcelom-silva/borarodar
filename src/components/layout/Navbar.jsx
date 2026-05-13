'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Users, Compass, User, Menu, X, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

var LANGS = [
  { code: 'pt', flag: 'BR', title: 'Portugues' },
  { code: 'en', flag: 'US', title: 'English'   },
  { code: 'es', flag: 'ES', title: 'Espanol'   },
];

// Bandeiras SVG simples (inline, sem imagens externas)
function FlagIcon({ code, size }) {
  var s = size || 20;
  if (code === 'pt') return (
    <svg width={s} height={s} viewBox="0 0 20 20" style={{ borderRadius: '3px', flexShrink: 0 }}>
      <rect width="20" height="20" fill="#009C3B"/>
      <rect x="7" width="13" height="20" fill="#FFDF00"/>
      <rect x="0" width="7" height="20" fill="#009C3B"/>
      <polygon points="10,4 16,10 10,16 4,10" fill="#FFDF00"/>
      <circle cx="10" cy="10" r="3.5" fill="#002776"/>
      <rect x="6.5" y="9.3" width="7" height="1.4" fill="#fff" opacity="0.9"/>
    </svg>
  );
  if (code === 'en') return (
    <svg width={s} height={s} viewBox="0 0 20 20" style={{ borderRadius: '3px', flexShrink: 0 }}>
      <rect width="20" height="20" fill="#012169"/>
      <line x1="0" y1="0" x2="20" y2="20" stroke="#fff" strokeWidth="3.5"/>
      <line x1="20" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="3.5"/>
      <line x1="0" y1="0" x2="20" y2="20" stroke="#C8102E" strokeWidth="2"/>
      <line x1="20" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2"/>
      <rect x="8.5" y="0" width="3" height="20" fill="#fff"/>
      <rect x="0" y="8.5" width="20" height="3" fill="#fff"/>
      <rect x="9" y="0" width="2" height="20" fill="#C8102E"/>
      <rect x="0" y="9" width="20" height="2" fill="#C8102E"/>
    </svg>
  );
  // es
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" style={{ borderRadius: '3px', flexShrink: 0 }}>
      <rect width="20" height="20" fill="#AA151B"/>
      <rect y="5" width="20" height="10" fill="#F1BF00"/>
      <rect y="0" width="20" height="5" fill="#AA151B"/>
      <rect y="15" width="20" height="5" fill="#AA151B"/>
    </svg>
  );
}

export default function Navbar() {
  var [scrolled, setScrolled] = useState(false);
  var [open,     setOpen]     = useState(false);
  var pathname = usePathname();
  var { lang, setLang, t } = useLanguage();

  useEffect(function() {
    var fn = function() { setScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', fn);
    return function() { window.removeEventListener('scroll', fn); };
  }, []);

  var LINKS = [
    { href: '/planejar',   label: t('nav_planejar'),  icon: Map },
    { href: '/comunidade', label: t('nav_galera'),    icon: Users },
    { href: '/explorar',   label: t('nav_explorar'),  icon: Compass },
    { href: '/ajuda',      label: t('nav_ajuda'),     icon: HelpCircle },
  ];

  return (
    <header className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ' + (scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent')}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-br-green flex items-center justify-center group-hover:shadow-neon-green transition-shadow">
            <span className="text-black font-syne font-black text-sm">BR</span>
          </div>
          <span className="font-syne font-extrabold text-lg tracking-tight">
            Bora<span className="text-br-green">Rodar</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {LINKS.map(function({ href, label, icon: Icon }) {
            var active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ' + (active ? 'bg-br-green/10 text-br-green' : 'text-gray-400 hover:text-white hover:bg-white/5')}
              >
                <Icon className="w-4 h-4"/>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Direita: Perfil + Bandeiras */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Perfil - desktop */}
          <Link
            href="/perfil"
            className={'hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ' + (pathname === '/perfil' ? 'bg-br-green text-black' : 'border border-white/10 text-gray-300 hover:border-br-green/40 hover:text-white')}
          >
            <User className="w-4 h-4"/>
            {t('nav_perfil')}
          </Link>

          {/* Separador */}
          <div className="hidden md:block w-px h-5 bg-white/10"/>

          {/* Bandeiras */}
          <div className="hidden md:flex items-center gap-1.5">
            {LANGS.map(function({ code, flag, title }) {
              var active = lang === code;
              return (
                <button
                  key={code}
                  onClick={function() { setLang(code); }}
                  title={title}
                  className="transition-all hover:scale-110 rounded-sm overflow-hidden"
                  style={{ opacity: active ? 1 : 0.35, transform: active ? 'scale(1.15)' : 'scale(1)', outline: active ? '2px solid rgba(57,255,20,0.6)' : 'none', outlineOffset: '2px' }}
                >
                  <FlagIcon code={code} size={22}/>
                </button>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white" onClick={function() { setOpen(!open); }}>
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0D0D0D]/98 border-b border-white/5 px-4 pb-5">
          {[...LINKS, { href: '/perfil', label: t('nav_perfil'), icon: User }].map(function({ href, label, icon: Icon }) {
            return (
              <Link
                key={href}
                href={href}
                onClick={function() { setOpen(false); }}
                className={'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ' + (pathname === href ? 'bg-br-green/10 text-br-green' : 'text-gray-400 hover:text-white hover:bg-white/5')}
              >
                <Icon className="w-4 h-4"/>
                {label}
              </Link>
            );
          })}

          {/* Bandeiras mobile */}
          <div className="flex items-center gap-3 px-4 pt-3 border-t border-white/5 mt-1">
            <span className="text-xs text-gray-600">Idioma:</span>
            {LANGS.map(function({ code, flag, title }) {
              var active = lang === code;
              return (
                <button
                  key={code}
                  onClick={function() { setLang(code); setOpen(false); }}
                  title={title}
                  className="transition-all rounded-sm overflow-hidden"
                  style={{ opacity: active ? 1 : 0.35, outline: active ? '2px solid rgba(57,255,20,0.6)' : 'none', outlineOffset: '2px' }}
                >
                  <FlagIcon code={code} size={24}/>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
