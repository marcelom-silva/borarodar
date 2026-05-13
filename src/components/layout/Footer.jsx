import Link from 'next/link';
import { Github, Instagram, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080808] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-br-green flex items-center justify-center">
                <span className="text-black font-syne font-black text-sm">BR</span>
              </div>
              <span className="font-syne font-extrabold text-xl">
                Bora<span className="text-br-green">Rodar</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Planejador de viagens de carro feito para quem ama a estrada.
              Calcule, descubra e compartilhe.
            </p>
            <div className="flex gap-3 mt-6">
              {[Github, Instagram, Twitter].map(function(Icon, i) {
                return (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center text-gray-500 hover:text-br-green hover:border-br-green/30 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-syne font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Navegacao</h4>
            <ul className="space-y-2">
              {[
                { href: '/planejar',   l: 'Planejar Rota' },
                { href: '/comunidade', l: 'Comunidade' },
                { href: '/explorar',   l: 'Explorar' },
                { href: '/perfil',     l: 'Meu Perfil' },
              ].map(function({ href, l }) {
                return (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{l}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-syne font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Rotas Tematicas</h4>
            <ul className="space-y-2">
              {['Rota Gaucha', 'Rota das Cachoeiras', 'Rota Gastro', 'Rota do Rock', 'Rota Colonial'].map(function(l) {
                return (
                  <li key={l}>
                    <Link href="/explorar" className="text-sm text-gray-500 hover:text-white transition-colors">{l}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            2025 BoraRodar. Feito com amor para quem ama a estrada.
          </p>
          <p className="text-xs text-gray-700">Mapas: OpenStreetMap | Rotas: OSRM</p>
        </div>
      </div>
    </footer>
  );
}
