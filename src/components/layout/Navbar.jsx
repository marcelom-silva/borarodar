'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Users, Compass, User, Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/planejar',   label: 'Planejar',  icon: Map },
  { href: '/comunidade', label: 'Galera',    icon: Users },
  { href: '/explorar',   label: 'Explorar',  icon: Compass },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ' + (scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent')}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-br-green flex items-center justify-center group-hover:shadow-neon-green transition-shadow">
            <span className="text-black font-syne font-black text-sm">BR</span>
          </div>
          <span className="font-syne font-extrabold text-lg tracking-tight">
            Bora<span className="text-br-green">Rodar</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(function({ href, label, icon: Icon }) {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (active ? 'bg-br-green/10 text-br-green' : 'text-gray-400 hover:text-white hover:bg-white/5')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/perfil"
            className={'hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (pathname === '/perfil' ? 'bg-br-green text-black' : 'border border-white/10 text-gray-300 hover:border-br-green/40 hover:text-white')}
          >
            <User className="w-4 h-4" />
            Perfil
          </Link>
          <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0D0D0D]/98 border-b border-white/5 px-4 pb-4">
          {[...LINKS, { href: '/perfil', label: 'Perfil', icon: User }].map(function({ href, label, icon: Icon }) {
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ' + (pathname === href ? 'bg-br-green/10 text-br-green' : 'text-gray-400 hover:text-white hover:bg-white/5')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
