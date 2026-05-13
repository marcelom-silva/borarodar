'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Car, Zap } from 'lucide-react';

function WheelSVG({ spinning }) {
  var spokes = [0, 72, 144, 216, 288];
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        width: '100%',
        height: '100%',
        animation: spinning ? 'spin 0.7s linear infinite' : 'none',
        transformOrigin: '50% 50%',
        filter: spinning
          ? 'drop-shadow(0 0 8px rgba(57,255,20,0.5))'
          : 'drop-shadow(0 0 2px rgba(57,255,20,0.15))',
        transition: 'filter 0.3s ease',
      }}
    >
      <circle cx="100" cy="100" r="98" fill="#0A0A0A"/>
      <circle cx="100" cy="100" r="92" fill="#0D0D0D" stroke="#1a1a1a" strokeWidth="1"/>
      <circle cx="100" cy="100" r="85" fill="none" stroke="#151515" strokeWidth="3"/>
      <circle cx="100" cy="100" r="78" fill="#161616"/>
      <circle cx="100" cy="100" r="72" fill="#121212"/>
      {spokes.map(function(angle) {
        return (
          <g key={angle} transform={'rotate(' + angle + ' 100 100)'}>
            <path d="M 100 100 L 86 32 L 94 28 L 100 72 Z" fill="#222" stroke="#2d2d2d" strokeWidth="0.5"/>
            <path d="M 100 100 L 106 28 L 114 32 L 100 72 Z" fill="#2a2a2a" stroke="#333" strokeWidth="0.5"/>
            <path d="M 100 100 L 98 60 L 100 55 L 102 60 L 100 100 Z" fill="#353535" opacity="0.7"/>
            <ellipse cx="100" cy="31" rx="8" ry="4" fill="#1E1E1E" stroke="#2d2d2d" strokeWidth="0.5"/>
          </g>
        );
      })}
      <circle cx="100" cy="100" r="25" fill="#111" stroke="#2a2a2a" strokeWidth="1"/>
      <circle cx="100" cy="100" r="19" fill="#1a1a1a" stroke="#333" strokeWidth="0.5"/>
      <circle cx="100" cy="100" r="13" fill="#0D0D0D" stroke="#252525" strokeWidth="1"/>
      <circle cx="100" cy="100" r="6"  fill="#39FF14" opacity="0.9"/>
      <circle cx="100" cy="100" r="3"  fill="#0A0A0A"/>
      <ellipse cx="72" cy="58" rx="14" ry="6" fill="rgba(255,255,255,0.05)" transform="rotate(-35 72 58)"/>
    </svg>
  );
}

function Counter({ target, label }) {
  var [value, setValue] = useState(0);
  var ref     = useRef(null);
  var started = useRef(false);
  useEffect(function() {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        var num   = parseInt(String(target).replace(/\D/g, ''));
        var steps = 45;
        var inc   = num / steps;
        var cur   = 0;
        var t     = setInterval(function() {
          cur = Math.min(cur + inc, num);
          setValue(Math.floor(cur));
          if (cur >= num) clearInterval(t);
        }, 1400 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return function() { obs.disconnect(); };
  }, [target]);
  return (
    <div ref={ref} className="flex items-center gap-1.5">
      <span className="font-mono font-bold text-white tabular-nums">{value.toLocaleString('pt-BR')}</span>
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

var PARTICLES = [
  { x:'8%',  y:'15%', size:4, color:'#39FF14', dur:3.2, delay:0    },
  { x:'15%', y:'70%', size:3, color:'#FF6B35', dur:4.1, delay:0.5  },
  { x:'22%', y:'35%', size:2, color:'#00D4FF', dur:3.7, delay:1.0  },
  { x:'30%', y:'80%', size:4, color:'#B24BF3', dur:4.5, delay:0.3  },
  { x:'42%', y:'12%', size:3, color:'#39FF14', dur:3.0, delay:1.5  },
  { x:'58%', y:'88%', size:2, color:'#FF6B35', dur:3.9, delay:0.8  },
  { x:'67%', y:'20%', size:4, color:'#00D4FF', dur:4.2, delay:0.2  },
  { x:'72%', y:'60%', size:3, color:'#39FF14', dur:3.5, delay:1.2  },
  { x:'80%', y:'40%', size:2, color:'#B24BF3', dur:4.8, delay:0.6  },
  { x:'88%', y:'75%', size:4, color:'#FF6B35', dur:3.3, delay:1.8  },
  { x:'93%', y:'25%', size:3, color:'#39FF14', dur:4.0, delay:0.4  },
  { x:'50%', y:'50%', size:2, color:'#00D4FF', dur:5.0, delay:2.0  },
];

var GRAD = {
  background: 'linear-gradient(135deg, #FFFFFF 10%, rgba(57,255,20,0.95) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export default function Hero() {
  var [origem,   setOrigem]   = useState('');
  var [destino,  setDestino]  = useState('');
  var [hovering, setHovering] = useState(false);
  var [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  var heroRef = useRef(null);
  var router  = useRouter();

  var handleMouseMove = useCallback(function(e) {
    if (!heroRef.current) return;
    var rect = heroRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  useEffect(function() {
    window.addEventListener('mousemove', handleMouseMove);
    return function() { window.removeEventListener('mousemove', handleMouseMove); };
  }, [handleMouseMove]);

  function handleSearch(e) {
    e.preventDefault();
    if (origem && destino) {
      router.push('/planejar?origem=' + encodeURIComponent(origem) + '&destino=' + encodeURIComponent(destino));
    }
  }

  var titleSize = 'clamp(2.6rem, 9.5vw, 8.5rem)';
  var wheelSize = 'clamp(2.3rem, 8.4vw, 7.5rem)';

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(57,255,20,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.028) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}/>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 65%, rgba(57,255,20,0.06) 0%, transparent 70%)' }}/>
        <div className="absolute pointer-events-none" style={{
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 65%)',
          left: mousePos.x - 350, top: mousePos.y - 350,
          transition: 'left 0.12s ease-out, top 0.12s ease-out',
        }}/>
        <div className="absolute left-0 right-0 pointer-events-none" style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.15), transparent)',
          animation: 'scan-line 6s ease-in-out 2s infinite',
        }}/>
        <div className="absolute inset-0 flex justify-center overflow-hidden opacity-35 pointer-events-none">
          <div className="road-lane" style={{ marginTop: '-100%' }}>
            {Array.from({ length: 30 }).map(function(_, i) { return <div key={i} className="road-dash"/>; })}
          </div>
        </div>
        {PARTICLES.map(function(p, i) {
          return (
            <div key={i} className="absolute rounded-full pointer-events-none" style={{
              width: p.size + 'px', height: p.size + 'px',
              background: p.color, left: p.x, top: p.y, opacity: 0.35,
              boxShadow: '0 0 ' + (p.size * 2) + 'px ' + p.color,
              animation: 'float ' + p.dur + 's ease-in-out ' + p.delay + 's infinite',
            }}/>
          );
        })}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center w-full">

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 animate-fade-in animate-glow">
          <Zap className="w-3.5 h-3.5 text-br-green"/>
          <span className="text-xs text-gray-400 font-medium">Nova forma de explorar o Brasil</span>
          <span className="text-xs">BR</span>
        </div>

        <div
          className="mb-6 select-none"
          onMouseEnter={function() { setHovering(true); }}
          onMouseLeave={function() { setHovering(false); }}
          style={{ cursor: 'default' }}
        >
          <div className="flex items-center justify-center font-syne font-extrabold tracking-tighter" style={{ fontSize: titleSize, lineHeight: 0.95 }}>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.05s' })}>B</span>
            <span className="inline-block flex-shrink-0 animate-letter" style={{ width: wheelSize, height: wheelSize, animationDelay: '0.12s', marginLeft: '0.03em', marginRight: '0.03em' }}>
              <WheelSVG spinning={hovering}/>
            </span>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.18s' })}>R</span>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.23s' })}>A</span>
          </div>

          <div className="flex items-center justify-center font-syne font-extrabold tracking-tighter" style={{ fontSize: titleSize, lineHeight: 0.95 }}>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.28s' })}>R</span>
            <span className="inline-block flex-shrink-0 animate-letter" style={{ width: wheelSize, height: wheelSize, animationDelay: '0.34s', marginLeft: '0.03em', marginRight: '0.03em' }}>
              <WheelSVG spinning={hovering}/>
            </span>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.40s' })}>D</span>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.45s' })}>A</span>
            <span className="animate-letter" style={Object.assign({}, GRAD, { animationDelay: '0.50s' })}>R</span>
          </div>
        </div>

        <p className="text-gray-600 text-xs mb-3 animate-fade-in" style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}>
          passe o mouse no titulo para ver as rodas girarem
        </p>

        <p className="text-base sm:text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
          Planeje sua rota, calcule os gastos e viva a viagem dos sonhos.{' '}
          <span className="text-br-orange font-medium">Partiu, galera?</span>
        </p>

        <form onSubmit={handleSearch} className="glass rounded-2xl p-3 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-br-green pointer-events-none z-10" style={{ left: '12px' }}/>
              <input className="br-input text-sm" style={{ paddingLeft: '2.25rem' }} placeholder="De onde voce vai sair?" value={origem} onChange={function(e) { setOrigem(e.target.value); }}/>
            </div>
            <div className="relative flex-1">
              <Navigation className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-br-orange pointer-events-none z-10" style={{ left: '12px' }}/>
              <input className="br-input text-sm" style={{ paddingLeft: '2.25rem' }} placeholder="Onde voce quer chegar?" value={destino} onChange={function(e) { setDestino(e.target.value); }}/>
            </div>
            <button type="submit" className="btn-neon flex items-center gap-2 px-6 whitespace-nowrap text-sm animate-glow">
              <Car className="w-4 h-4"/> BORA!
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm animate-fade-in" style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}>
          <Counter target={2847}  label="rotas criadas"/>
          <span className="w-1 h-1 rounded-full bg-gray-700"/>
          <Counter target={12340} label="viajantes"/>
          <span className="w-1 h-1 rounded-full bg-gray-700"/>
          <Counter target={847}   label="destinos"/>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-700 animate-fade-in" style={{ animationDelay: '1.4s', opacity: 0, animationFillMode: 'forwards' }}>
        <span className="text-[9px] uppercase tracking-[0.2em]">Role para baixo</span>
        <div className="w-5 h-8 border border-gray-700 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-br-green rounded-full animate-bounce"/>
        </div>
      </div>
    </section>
  );
}
