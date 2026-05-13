'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Car, Zap } from 'lucide-react';

export default function Hero() {
  const [origem,  setOrigem]  = useState('');
  const [destino, setDestino] = useState('');
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (origem && destino) {
      router.push('/planejar?origem=' + encodeURIComponent(origem) + '&destino=' + encodeURIComponent(destino));
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Fundo */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 65%, rgba(57,255,20,0.06) 0%, transparent 70%)' }} />
        {/* Animacao de estrada */}
        <div className="absolute inset-0 flex justify-center overflow-hidden opacity-40 pointer-events-none">
          <div className="road-lane" style={{ marginTop: '-100%' }}>
            {Array.from({ length: 30 }).map(function(_, i) { return <div key={i} className="road-dash" />; })}
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5 text-br-green" />
          <span className="text-xs text-gray-400 font-medium">Nova forma de explorar o Brasil</span>
          <span className="text-xs">🇧🇷</span>
        </div>

        {/* Titulo */}
        <h1
          className="font-syne font-extrabold leading-[0.9] tracking-tighter mb-6 animate-slide-up"
          style={{
            fontSize: 'clamp(5rem, 18vw, 14rem)',
            background: 'linear-gradient(135deg, #FFFFFF 20%, rgba(57,255,20,0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          BORA<br />RODAR
        </h1>

        {/* Subtitulo */}
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          Planeje sua rota, calcule os gastos e viva a viagem dos sonhos.{' '}
          <span className="text-br-orange">Partiu, galera?</span>
        </p>

        {/* Formulario de busca */}
        <form onSubmit={handleSearch} className="glass rounded-2xl p-3 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-br-green pointer-events-none" />
              <input
                className="br-input pl-9 text-sm"
                placeholder="De onde voce vai sair?"
                value={origem}
                onChange={function(e) { setOrigem(e.target.value); }}
              />
            </div>
            <div className="relative flex-1">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-br-orange pointer-events-none" />
              <input
                className="br-input pl-9 text-sm"
                placeholder="Onde voce quer chegar?"
                value={destino}
                onChange={function(e) { setDestino(e.target.value); }}
              />
            </div>
            <button type="submit" className="btn-neon flex items-center gap-2 px-6 whitespace-nowrap">
              <Car className="w-4 h-4" /> BORA!
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-gray-600 text-sm animate-fade-in">
          {[
            { n: '2.847',  l: 'rotas criadas' },
            { n: '12.340', l: 'viajantes' },
            { n: '847',    l: 'destinos' },
          ].map(function({ n, l }, i) {
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-700" />}
                <span className="font-mono font-bold text-white">{n}</span>
                <span>{l}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-[10px] uppercase tracking-widest">Role para baixo</span>
        <div className="w-5 h-8 border border-gray-700 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-br-green rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
