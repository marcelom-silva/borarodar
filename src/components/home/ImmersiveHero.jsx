'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './ImmersiveHero.css';

/* ─────────────────────────────────────────────────────────
   MEDAL GEOMETRY
   T  = coin thickness (px)
   R  = edge radius  (px) — slightly less than canvas half
   N  = edge segments (more = smoother cylinder)

   Front face canvas: translateZ(+T/2)
   Back  face canvas: translateZ(-T/2) rotateY(180deg)
   Edge segments: rotateZ(θ) translateY(-R) rotateX(90deg)
   → creates a cylinder around the Z-axis (coin axis).
───────────────────────────────────────────────────────── */
const LS = 200, HALF = 100;
const T  = 10;          // coin thickness (thinner, semi-transparent edge)
const N  = 48;          // edge segments
const RE = 96;          // edge radius (keeps segments inside 200px canvas)
const FS = 0.22;        // final scale (header)
const HL = 28, HDR = 68;
const HT    = (HDR - LS * FS) / 2;
const DELTA = HALF * (1 - FS);
const XF    = HL   - DELTA;   // -50
const YF    = HT   - DELTA;   // -66
const SCROLL_END = 500;

const CARDS = [
  { icon:'🗺️', title:'Planejar Rota',        color:'#39FF14', href:'/planejar',  desc:'Calcule rotas com mapas reais, paradas intermediárias e estimativa completa de gastos.' },
  { icon:'🎲', title:'Destino Surpresa',      color:'#FF6B35', href:'/planejar',  desc:'A IA sugere 3 destinos incríveis baseados no seu perfil, cidade de origem e orçamento.' },
  { icon:'🤖', title:'Roteiro com IA',        color:'#B24BF3', href:'/planejar',  desc:'Itinerário personalizado dia a dia com dicas locais exclusivas via Gemini + Llama.' },
  { icon:'📋', title:'Checklist de Viagem',   color:'#00D4FF', href:'/planejar',  desc:'Documentos, itens do carro e requisitos para cruzar fronteiras internacionais com segurança.' },
  { icon:'⛅', title:'Clima em Tempo Real',   color:'#FFD700', href:'/planejar',  desc:'Previsão de 5 dias integrada ao planejador para a data exata da sua viagem.' },
  { icon:'🛡️', title:'Alertas de Segurança', color:'#FF3366', href:'/planejar',  desc:'Trechos perigosos, horários críticos e zonas de risco identificadas na rota.' },
];

/* Lerp between two hex colours */
function lerpHex(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const lerp = (ca, cb) => Math.round(ca + (cb - ca) * t);
  return `rgb(${lerp(ah>>16&0xff,bh>>16&0xff)},${lerp(ah>>8&0xff,bh>>8&0xff)},${lerp(ah&0xff,bh&0xff)})`;
}

export default function ImmersiveHero() {
  const [isMuted, setIsMuted] = useState(true);
  const frontRef = useRef(null);   // front-face canvas
  const ytfRef   = useRef(null);

  const sendYT = (func) =>
    ytfRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: '' }), '*'
    );

  const toggleSound = () => {
    if (isMuted) { sendYT('unMute'); setIsMuted(false); }
    else         { sendYT('mute');   setIsMuted(true);  }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanups = [];

    /* ─── SYNCHRONOUS position set — prevents FOUC on F5/hard-reload ──────
       Must run BEFORE any async import so logo is never at (0,0). */
    (function syncPos() {
      const el = document.getElementById('clogo');
      if (el) el.style.transform =
        'translate(' + (window.innerWidth / 2 - 100) + 'px, 75px)';
    })();

    /* ─────────────────────────────────────────────────────
       1. EDGE SEGMENTS — 3D coin thickness
       Formula: rotateZ(θ) translateY(-R) rotateX(90deg)
       → distributes segments around the Z-axis (coin axis).
       Each segment gets a gold colour based on angle
       to simulate directional lighting.
    ───────────────────────────────────────────────────── */
    const setupEdge = () => {
      /* Skip 3D edge on touch devices — 48 elements + preserve-3d is slow on mobile */
      if (window.matchMedia('(pointer:coarse)').matches) return;
      const edge = document.getElementById('coin-edge');
      if (!edge) return;
      const arcLen = (2 * Math.PI * RE / N).toFixed(2);
      for (let i = 0; i < N; i++) {
        const angleDeg = (i / N) * 360;
        const angleRad = (i / N) * 2 * Math.PI;
        // Directional light: bright at top (θ≈0), dark at bottom (θ≈180)
        const lf  = 0.5 + 0.5 * Math.cos(angleRad - Math.PI * 0.25); // offset for 10 o'clock light
        const col = lerpHex('#0d0d1a', '#7a7aaa', lf); /* dark navy → faint silver */
        const seg = document.createElement('div');
        seg.style.cssText = `
          position:absolute;
          width:${arcLen}px;
          height:${T}px;
          top:50%;left:50%;
          margin-left:-${(arcLen/2)}px;
          margin-top:-${T/2}px;
          background:${col};
          opacity:0.38;
          transform:rotateZ(${angleDeg}deg) translateY(-${RE}px) rotateX(90deg);
        `;
        edge.appendChild(seg);
      }
    };
    setupEdge();

    /* ─────────────────────────────────────────────────────
       2. CANVAS — medal artwork drawn on both faces
       front canvas ref=frontRef at translateZ(+T/2)
       back  canvas #lc-back   at translateZ(-T/2) rotateY(180deg)
       Both get identical pixel data (drawImage copy).
    ───────────────────────────────────────────────────── */
    let rafId = null;
    const frontCanvas = frontRef.current;
    if (frontCanvas) {
      const ctx   = frontCanvas.getContext('2d');
      const back  = document.getElementById('lc-back');
      const bctx  = back?.getContext('2d');
      const img   = new Image();

      img.onload = () => {
        /* Strip black background */
        const tmp = document.createElement('canvas');
        tmp.width = tmp.height = LS;
        const tc  = tmp.getContext('2d');
        tc.drawImage(img, 0, 0, LS, LS);
        const id  = tc.getImageData(0, 0, LS, LS);
        const px  = id.data;
        for (let i = 0; i < px.length; i += 4) {
          const b = px[i] + px[i+1] + px[i+2];
          if      (b < 30) px[i+3] = 0;
          else if (b < 75) px[i+3] = Math.round((b - 30) / 45 * 255);
        }
        tc.putImageData(id, 0, 0);
        const off = document.createElement('canvas');
        off.width = off.height = LS;
        off.getContext('2d').drawImage(tmp, 0, 0);

        const R_OUTER = 98, R_RIM = 91, R_INNER = 82;

        const isMobCanvas = window.matchMedia('(pointer:coarse)').matches;

        const draw = (t) => {
          const glow = 22.5 + 7.5 * Math.sin(t * 0.00224);
          const drawTo = (c) => {
            c.clearRect(0, 0, LS, LS);

            if (isMobCanvas) {
              /* ── Mobile: 2-pass (perf) ─────────────────── */
              c.save();
              c.beginPath(); c.arc(HALF,HALF,R_INNER,0,Math.PI*2); c.clip();
              c.shadowBlur = glow; c.shadowColor = '#FF6B35';
              c.globalAlpha = 0.75; c.drawImage(off,0,0);
              c.shadowBlur = 0;    c.globalAlpha = 1; c.drawImage(off,0,0);
              c.restore();
              /* Mobile rim (CSS-drawn, no conic gradient needed) */
              c.save();
              c.strokeStyle='rgba(200,152,10,0.85)'; c.lineWidth=8;
              c.beginPath(); c.arc(HALF,HALF,R_RIM,0,Math.PI*2); c.stroke();
              c.restore();
            } else {
              /* ── Desktop: 4-pass ───────────────────────── */
              /* 1. Outer neon glow */
              c.save();
              c.shadowBlur = glow * 2.5; c.shadowColor = 'rgba(255,107,53,.55)';
              c.fillStyle  = 'rgba(255,107,53,.005)';
              c.beginPath(); c.arc(HALF, HALF, R_OUTER, 0, Math.PI*2); c.fill();
              c.restore();
              /* 2. Thin dark separator */
              c.save();
              c.strokeStyle = 'rgba(30,30,50,0.5)'; c.lineWidth = 2;
              c.beginPath(); c.arc(HALF,HALF,R_INNER+1,0,Math.PI*2); c.stroke();
              c.restore();
              /* 3. Logo (clipped to inner circle) */
              c.save();
              c.beginPath(); c.arc(HALF,HALF,R_INNER,0,Math.PI*2); c.clip();
              c.shadowBlur=glow*.55; c.shadowColor='#FF6B35'; c.globalAlpha=.7;
              c.drawImage(off,0,0);
              c.shadowBlur=0; c.globalAlpha=1; c.drawImage(off,0,0);
              c.restore();
            }
          };

          drawTo(ctx);
          if (bctx) {
            bctx.clearRect(0,0,LS,LS);
            bctx.drawImage(frontCanvas,0,0); // mirror content from front
          }
          rafId = requestAnimationFrame(draw);
        };
        rafId = requestAnimationFrame(draw);
      };
      img.src = '/logo.png';
      cleanups.push(() => { if (rafId) cancelAnimationFrame(rafId); });
    }

    /* ─────────────────────────────────────────────────────
       3. GSAP — Y-axis coin-flip scroll animation
    ───────────────────────────────────────────────────── */
    const setupGSAP = async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      const XI = window.innerWidth/2  - HALF;
      const YI = 75; /* logo center at ~230px from top — clearly below header */
      const clogo = document.getElementById('clogo');
      if (!clogo) return;
      clogo.style.transform = `translate(${XI}px,${YI}px)`;
      gsap.set('#clogo', { transformPerspective: 900, x:XI, y:YI });
      const onResize = () => {
        const p = ScrollTrigger.getById('lt')?.progress || 0;
        if (p<0.02) gsap.set('#clogo',{x:window.innerWidth/2-HALF,y:75});
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', onResize, {passive:true});
      const tl = gsap.timeline({
        scrollTrigger:{id:'lt',trigger:'#sarea',start:'top top',end:`+=${SCROLL_END}`,scrub:0.9}
      });
      tl
        .to('#clogo',{x:XF,y:YF,scale:FS,rotationY:360,ease:'power2.inOut'},0)
        .to('#medal-shadow',{opacity:0,scale:.15,ease:'power2.in',duration:.4},0);
      ScrollTrigger.create({
        trigger:'#sarea',start:'top top',end:`+=${SCROLL_END}`,
        onUpdate:(s)=>{
          const p=s.progress;
          const w=document.getElementById('ytf-wrap'); if(w) w.style.filter=`blur(${(p*13).toFixed(1)}px)`;
          const vo=document.getElementById('vover');
          if (vo) vo.style.opacity=(0.52 + p * 0.28).toFixed(3);
        }
      });
      gsap.to('#shint',{opacity:0,y:-14,ease:'none',
        scrollTrigger:{trigger:'#sarea',start:'top top',end:'+=155',scrub:true}});
      cleanups.push(()=>{
        window.removeEventListener('resize',onResize);
        ScrollTrigger.getAll().forEach(t=>t.kill());
      });
    };
    setupGSAP().catch(console.error);

    /* ─────────────────────────────────────────────────────
       4. MOUSE SPIN (pure Y-axis, NOT tilt)
       Mouse X position → smooth Y rotation on #medal-inner.
       Moving mouse right → coin spins right.
       Moving mouse left  → coin spins left.
       Effect suppressed during scroll (progress > 0.1).
    ───────────────────────────────────────────────────── */
    const isMobSpin = window.matchMedia('(pointer:coarse)').matches;
    let currentSpinY = 0, spinRaf;

    if (isMobSpin) {
      /* ── Mobile: gentle auto-spin (no mouse) ──────────────
         ~1 revolution / 30 s at 60 fps; pauses when scrolled. */
      const autoSpin = () => {
        const mi = document.getElementById('medal-inner');
        if (mi) {
          currentSpinY += 0.18;
          mi.style.transform = `rotateY(${currentSpinY}deg)`;
        }
        spinRaf = requestAnimationFrame(autoSpin);
      };
      spinRaf = requestAnimationFrame(autoSpin);
      cleanups.push(() => cancelAnimationFrame(spinRaf));
    } else {
      /* ── Desktop: mouse-driven Y spin ─────────────────── */
      let targetSpinY = 0;
      const spinTick = () => {
        currentSpinY += (targetSpinY - currentSpinY) * 0.06;
        const mi = document.getElementById('medal-inner');
        if (mi) mi.style.transform = `rotateY(${currentSpinY}deg)`;
        spinRaf = requestAnimationFrame(spinTick);
      };
      spinRaf = requestAnimationFrame(spinTick);

      const onMouseMove = async (e) => {
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        const p = ScrollTrigger.getById('lt')?.progress || 0;
        if (p > 0.1) { targetSpinY = 0; return; }
        const x = (e.clientX - window.innerWidth/2) / (window.innerWidth * 0.5);
        targetSpinY = x * 40;
      };
      const onMouseLeave = () => { targetSpinY = 0; };
      document.addEventListener('mousemove', onMouseMove, {passive:true});
      document.addEventListener('mouseleave', onMouseLeave);
      cleanups.push(()=>{
        cancelAnimationFrame(spinRaf);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseleave', onMouseLeave);
      });
    }

    /* ─────────────────────────────────────────────────────
       5. INTERSECTION OBSERVER — content reveal
    ───────────────────────────────────────────────────── */
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ih-in');io.unobserve(e.target);}});
    },{threshold:.1,rootMargin:'-20px'});
    document.querySelectorAll('.ih-reveal,.ih-card').forEach(el=>io.observe(el));
    cleanups.push(()=>io.disconnect());

    /* ─────────────────────────────────────────────────────
       6. WHEEL CURSOR (desktop)
    ───────────────────────────────────────────────────── */
    if (!window.matchMedia('(pointer:coarse)').matches) {
      document.documentElement.style.cursor='none';
      let mx=0,my=0,px=0,py=0,rot=0,rv=0,tv=0,cRaf;
      const onMove2=(e)=>{const dx=e.clientX-px,dy=e.clientY-py;tv=Math.sqrt(dx*dx+dy*dy)*.45;px=mx=e.clientX;py=my=e.clientY;const wc=document.getElementById('ih-wc');if(wc)wc.style.opacity='1';};
      const onLeave2=()=>{const wc=document.getElementById('ih-wc');if(wc)wc.style.opacity='0';};
      document.addEventListener('mousemove',onMove2,{passive:true});
      document.addEventListener('mouseleave',onLeave2);
      const cTick=()=>{rv+=(tv-rv)*.12;tv*=.88;rot+=rv;const wc=document.getElementById('ih-wc');if(wc)wc.style.transform=`translate(${mx-22}px,${my-22}px) rotate(${rot}deg)`;cRaf=requestAnimationFrame(cTick);};
      cRaf=requestAnimationFrame(cTick);
      cleanups.push(()=>{document.removeEventListener('mousemove',onMove2);document.removeEventListener('mouseleave',onLeave2);cancelAnimationFrame(cRaf);document.documentElement.style.cursor='';});
    }

    /* ─────────────────────────────────────────────────────
       7. YOUTUBE LOOP GUARD
       YouTube sometimes shows the end screen even with loop=1.
       We listen for state=0 (ended) via postMessage and
       immediately seek to 0 + replay — guarantees seamless loop.
    ───────────────────────────────────────────────────── */
    const ytLoopGuard = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'onStateChange') {
          if (msg.info === 0) {
            /* Ended → seek to 0 and replay immediately */
            const ytf = ytfRef.current;
            if (ytf?.contentWindow) {
              ytf.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo',    args:[0, true] }), '*');
              ytf.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:''        }), '*');
            }
          } else if (msg.info === 1) {
            /* Playing → fade out the loading veil immediately.
               This is the reliable trigger: video IS playing, so
               thumbnail/controls are already gone from the iframe.   */
            const vl = document.getElementById('vload');
            if (vl && parseFloat(getComputedStyle(vl).opacity) > 0.01) {
              vl.style.transition = 'opacity 1.5s ease';
              vl.style.opacity    = '0';
            }
          }
        }
      } catch { /* non-JSON messages from other iframes — ignore */ }
    };
    window.addEventListener('message', ytLoopGuard);
    cleanups.push(() => window.removeEventListener('message', ytLoopGuard));

    /* ─────────────────────────────────────────────────────
       8. AUTO-UNMUTE on first interaction
    ───────────────────────────────────────────────────── */
    const autoUnmute=()=>{sendYT('unMute');setIsMuted(false);};
    document.addEventListener('click', autoUnmute,{once:true});
    document.addEventListener('scroll',autoUnmute,{once:true,passive:true});
    cleanups.push(()=>{document.removeEventListener('click',autoUnmute);document.removeEventListener('scroll',autoUnmute);});

    /* ─────────────────────────────────────────────────────
       9. RESUME VIDEO on page restore (browser back button / bfcache)
       When the user navigates away and returns, the browser may restore
       the page from bfcache with the iframe paused. We resume it here.
    ───────────────────────────────────────────────────── */
    const onPageShow = (e) => {
      if (e.persisted) {
        /* Restored from bfcache → play and reset vload */
        setTimeout(() => sendYT('playVideo'), 400);
        const vl = document.getElementById('vload');
        if (vl) { vl.style.transition='none'; vl.style.opacity='0'; }
      }
    };
    const onVisChange = () => {
      /* Tab becomes visible again after being hidden */
      if (!document.hidden) sendYT('playVideo');
    };
    window.addEventListener('pageshow',     onPageShow);
    document.addEventListener('visibilitychange', onVisChange);
    cleanups.push(() => {
      window.removeEventListener('pageshow',     onPageShow);
      document.removeEventListener('visibilitychange', onVisChange);
    });

    return () => {
      cleanups.forEach(fn => fn?.());
      /* Note: iframe is destroyed on unmount anyway, no need to pauseVideo */
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────────────────────────────────
     JSX
  ───────────────────────────────────────────────────── */
  return (
    <div id="ih-root" style={{background:'#0F0F13',minHeight:'100svh',overflowX:'hidden',touchAction:'pan-y',color:'#fff',fontFamily:'var(--font-sora,system-ui,sans-serif)'}}>

      {/* Wheel cursor */}
      <div id="ih-wc" style={{position:'fixed',top:0,left:0,width:44,height:44,pointerEvents:'none',zIndex:9999,opacity:0,transition:'opacity .2s',willChange:'transform'}}>
        <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="44" fill="#0F0F13" stroke="#FF6B35" strokeWidth="4.5"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,107,53,.2)" strokeWidth="1.5"/>
          {[[50,20,50,50],[50,50,76,65],[50,50,24,65],[50,80,50,50],[50,50,24,35],[50,50,76,35]].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6B35" strokeWidth="4.5" strokeLinecap="round"/>
          ))}
          <circle cx="50" cy="50" r="11" fill="#39FF14" stroke="#0F0F13" strokeWidth="2.5"/>
          <circle cx="50" cy="50" r="5.5" fill="#0F0F13"/>
        </svg>
      </div>

      {/* Header */}
      <header style={{position:'fixed',top:0,left:0,right:0,zIndex:500,height:68,padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(15,15,19,.95)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,107,53,.14)'}}>
        <div style={{display:'flex',alignItems:'baseline',paddingLeft:54}}>
          <span style={{fontSize:18,fontWeight:800,letterSpacing:'-.03em',background:'linear-gradient(135deg,#FF6B35,#FFD700)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            Bora<em style={{fontStyle:'normal',WebkitTextFillColor:'#39FF14'}}>Rodar</em>
          </span>
          <span id="hdrsep" style={{color:'rgba(255,255,255,.2)',margin:'0 10px',fontWeight:300,fontSize:14,alignSelf:'center'}}> — </span>
          <span id="hdrtag" style={{fontSize:12,fontWeight:300,color:'rgba(255,255,255,.42)',letterSpacing:'.045em'}}>
            Transformando viagens em histórias épicas
          </span>
        </div>
        <nav id="ih-nav" style={{display:'flex',gap:22}}>
          {[['Planejar','/planejar'],['Explorar','/explorar'],['Galera','/comunidade'],['Ajuda','/ajuda']].map(([label,href])=>(
            <Link key={href} href={href} className="ih-nav-a">{label}</Link>
          ))}
        </nav>
      </header>

      {/* Video background */}
      <div style={{position:'fixed',inset:0,zIndex:0,overflow:'hidden'}}>
        <iframe ref={ytfRef}
          src="https://www.youtube.com/embed/w1DLJ6xCf7Y?autoplay=1&mute=1&loop=1&playlist=w1DLJ6xCf7Y&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&cc_load_policy=0&fs=0&enablejsapi=1&start=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="BoraRodar Background"
          style={{position:'absolute',width:'177.78vh',minWidth:'100%',height:'100%',minHeight:'56.25vw',top:'50%',left:'50%',transform:'translate(-50%,-50%)',border:'none',pointerEvents:'none'}}
        />
        <div id="vover" style={{position:'absolute',inset:0,background:'#000',opacity:.52,pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse 58% 52% at 35% 56%,rgba(255,107,53,.055),transparent),linear-gradient(to bottom,transparent 63%,rgba(15,15,19,.78) 100%)'}}/>
        <div style={{position:'absolute',inset:0,zIndex:1}}/>{/* Loading veil: starts at 0.70 opacity, CSS-animated to 0 after 3.5s.
             Combined with #vover (0.52) = ~0.82 effective → hides YT thumbnail/controls.
             Fades away via CSS animation; no JS timing required. */}
        <div id="vload" style={{position:'absolute',inset:0,background:'#000',pointerEvents:'none'}}/>
        {/* click-blocker */}
      </div>

      {/* ════════════════════════════════════════════════
          3D MEDAL — true coin depth
          #clogo      : GSAP owns x,y,scale,rotationY
          #medal-inner: mouse Y-spin (no tilt)
          #lc-front   : canvas at Z = +T/2
          #lc-back    : canvas at Z = -T/2 (back face)
          #coin-edge  : N segments → cylinder edge
      ═══════════════════════════════════════════════ */}
      <div id="clogo" style={{position:'fixed',top:0,left:0,width:LS,height:LS,zIndex:600,pointerEvents:'none',transformStyle:'preserve-3d',WebkitTransformStyle:'preserve-3d'}}>

        {/* medal-inner: receives mouse Y-spin via JS spinTick */}
        <div id="medal-inner" style={{position:'absolute',top:0,left:0,width:LS,height:LS,transformStyle:'preserve-3d'}}>

          {/* Front face canvas */}
          <canvas
            ref={frontRef}
            id="lc-front"
            width={LS} height={LS}
            style={{position:'absolute',top:0,left:0,borderRadius:'50%',transform:`translateZ(${T/2}px)`}}
          />

          {/* Back face canvas — copy of front, mirrored by rotateY(180deg) */}
          <canvas
            id="lc-back"
            width={LS} height={LS}
            style={{position:'absolute',top:0,left:0,borderRadius:'50%',transform:`translateZ(-${T/2}px) rotateY(180deg)`}}
          />

          {/* Edge segments injected by setupEdge() in useEffect */}
          <div id="coin-edge" style={{position:'absolute',inset:0,transformStyle:'preserve-3d'}}/>

        </div>

        {/* Floating shadow below medal */}
        <div id="medal-shadow" style={{position:'absolute',left:'50%',top:'calc(100% + 8px)',transform:'translateX(-50%)',width:130,height:16,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,0,0,.6) 0%,transparent 70%)',animation:'shadow-pulse 3.2s ease-in-out infinite',pointerEvents:'none'}}/>
      </div>

      {/* Scroll hint */}
      <div id="shint" style={{position:'fixed',bottom:42,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:10,zIndex:50,pointerEvents:'none'}}>
        <p style={{color:'rgba(255,255,255,.24)',fontSize:10,letterSpacing:'.28em',textTransform:'uppercase'}}>role para descobrir</p>
        <div id="sline" style={{width:1,height:46,background:'linear-gradient(#FF6B35,transparent)'}}/>
      </div>

      {/* Sound toggle */}
      <button onClick={toggleSound}
        style={{position:'fixed',bottom:18,right:22,zIndex:700,background:'rgba(0,0,0,.55)',border:'1px solid rgba(255,107,53,.28)',borderRadius:8,color:'#fff',padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'inherit',transition:'border-color .2s'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,107,53,.65)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,107,53,.28)'}>
        {isMuted?'🔇 Som':'🔊 Mudo'}
      </button>

      <div id="sarea" style={{height:'calc(100svh + 500px)',position:'relative',pointerEvents:'none'}}/>

      {/* Content */}
      <section id="ih-content" style={{background:'#0F0F13',padding:'100px 32px 80px',position:'relative',zIndex:10}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div className="ih-reveal" style={{marginBottom:60}}>
            <p style={{color:'#39FF14',fontSize:11,letterSpacing:'.38em',textTransform:'uppercase',fontWeight:600,marginBottom:14}}>Tudo para sua aventura</p>
            <h2 style={{fontSize:'clamp(2rem,4.5vw,3.5rem)',fontWeight:800,lineHeight:1.08,marginBottom:14,letterSpacing:'-.03em'}}>
              Explore o Brasil{' '}<em style={{fontStyle:'normal',background:'linear-gradient(135deg,#FF6B35,#FFD700)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>sem limites</em>
            </h2>
            <p style={{color:'#6B7280',fontSize:16,fontWeight:300,maxWidth:520,lineHeight:1.65}}>Do Oiapoque ao Chui, do litoral ao sertão — planeje cada detalhe da sua viagem de carro.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20,marginBottom:60}}>
            {CARDS.map((card,i)=>(
              <Link key={card.title} href={card.href} style={{textDecoration:'none'}}>
                <div className="ih-card"
                  style={{'--d':`${i*.1}s`,background:'rgba(255,255,255,.035)',borderRadius:16,padding:28,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${card.color}28`,position:'relative',overflow:'hidden',color:'inherit',height:'100%'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=card.color+'55';e.currentTarget.style.boxShadow=`0 20px 60px ${card.color}18`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=card.color+'28';e.currentTarget.style.boxShadow='none';}}>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${card.color},transparent)`,opacity:.35}}/>
                  <span style={{fontSize:38,display:'block',marginBottom:18}}>{card.icon}</span>
                  <div style={{fontSize:17,fontWeight:700,color:'#fff',marginBottom:10,letterSpacing:'-.01em'}}>{card.title}</div>
                  <div style={{fontSize:14,fontWeight:300,color:'#9CA3AF',lineHeight:1.65,marginBottom:18}}>{card.desc}</div>
                  <div style={{fontSize:13,fontWeight:600,color:card.color,display:'flex',alignItems:'center',gap:6}}>Explorar <span>→</span></div>
                </div>
              </Link>
            ))}
          </div>

          <div id="ih-stats" className="ih-reveal" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:80}}>
            {[['10.000+','Rotas Criadas'],['50+','Destinos Curados'],['100%','Gratuito']].map(([v,l])=>(
              <div key={l} style={{textAlign:'center',padding:'32px 16px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12}}>
                <div style={{fontSize:'clamp(1.6rem,3.5vw,2.5rem)',fontWeight:800,letterSpacing:'-.04em',background:'linear-gradient(135deg,#FF6B35,#FFD700)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{v}</div>
                <div style={{color:'#6B7280',fontSize:13,fontWeight:300,marginTop:8}}>{l}</div>
              </div>
            ))}
          </div>

          <div className="ih-reveal" style={{textAlign:'center'}}>
            <Link href="/planejar"
              style={{display:'inline-flex',alignItems:'center',gap:12,background:'#39FF14',color:'#000',fontWeight:800,fontSize:18,padding:'18px 56px',borderRadius:60,textDecoration:'none',transition:'transform .25s,box-shadow .25s',letterSpacing:'-.01em'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.06)';e.currentTarget.style.boxShadow='0 0 60px rgba(57,255,20,.45)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='none';}}>
              🚗 Partiu, Galera!
            </Link>
            <p style={{color:'#6B7280',fontSize:13,fontWeight:300,marginTop:16}}>Grátis · Sem cadastro · Funciona no celular</p>
          </div>
        </div>
      </section>

      <footer style={{borderTop:'1px solid rgba(255,255,255,.05)',padding:'28px 32px',textAlign:'center',color:'#4B5563',fontSize:13,fontWeight:300}}>
        Feito com ❤️ para quem ama a estrada &nbsp;·&nbsp;
        <Link href="/planejar" style={{color:'#FF6B35',textDecoration:'none'}}>Começar a planejar</Link>
      </footer>
    </div>
  );
}
