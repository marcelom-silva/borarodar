'use client';
import { useEffect, useRef } from 'react';

// Carrega Leaflet do CDN se ainda nao estiver disponivel
function ensureLeaflet() {
  return new Promise(function(resolve) {
    if (window.L) { resolve(window.L); return; }
    if (!document.getElementById('leaflet-css-dt')) {
      var css = document.createElement('link');
      css.id  = 'leaflet-css-dt';
      css.rel = 'stylesheet';
      css.href= 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    if (document.getElementById('leaflet-js-dt')) {
      // script ja em processo de carregamento
      var wait = setInterval(function() {
        if (window.L) { clearInterval(wait); resolve(window.L); }
      }, 50);
      return;
    }
    var script  = document.createElement('script');
    script.id   = 'leaflet-js-dt';
    script.src  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = function() { resolve(window.L); };
    document.head.appendChild(script);
  });
}

// Icone numerado com cor customizavel
function makeNumberedIcon(L, number, color) {
  return L.divIcon({
    html: '<div style="'
      + 'background:' + color + ';color:#000;'
      + 'width:26px;height:26px;border-radius:50%;'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'font-weight:900;font-size:11px;font-family:system-ui;'
      + 'border:2.5px solid rgba(0,0,0,0.8);'
      + 'box-shadow:0 2px 6px rgba(0,0,0,0.4);">'
      + number
      + '</div>',
    iconSize:   [26, 26],
    iconAnchor: [13, 13],
    className:  '',
  });
}

var COLORS = ['#39FF14','#FF6B35','#00D4FF','#B24BF3','#FFD700','#FF3366'];

export default function DayTripLeaflet({ points, height, accentColor }) {
  var containerRef = useRef(null);
  var mapRef       = useRef(null);

  useEffect(function() {
    if (!containerRef.current || !points || !points.length) return;

    ensureLeaflet().then(function(L) {
      // Destrói instância anterior
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      var validPoints = points.filter(function(p) { return p.lat && p.lng; });
      if (!validPoints.length) return;

      var map = L.map(containerRef.current, {
        center:           [validPoints[0].lat, validPoints[0].lng],
        zoom:             13,
        zoomControl:      true,
        attributionControl:false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);

      // Marcadores numerados
      validPoints.forEach(function(pt, i) {
        var color = accentColor || COLORS[i % COLORS.length];
        var icon  = makeNumberedIcon(L, i + 1, color);
        L.marker([pt.lat, pt.lng], { icon: icon })
          .addTo(map)
          .bindPopup(
            '<div style="color:#111;font-family:system-ui;font-size:13px;">'
            + '<strong>' + (i+1) + '. ' + pt.name + '</strong>'
            + (pt.time ? '<br><span style="color:#666;font-size:11px;">⏰ ' + pt.time + '</span>' : '')
            + '</div>',
            { maxWidth: 200 }
          );
      });

      // Linha pontilhada conectando os pontos em sequencia
      if (validPoints.length > 1) {
        var latlngs = validPoints.map(function(p) { return [p.lat, p.lng]; });
        L.polyline(latlngs, {
          color:     accentColor || '#39FF14',
          weight:    3,
          opacity:   0.75,
          dashArray: '7 5',
        }).addTo(map);
      }

      // Ajusta zoom para cobrir todos os pontos
      var bounds = L.latLngBounds(validPoints.map(function(p) { return [p.lat, p.lng]; }));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });

      mapRef.current = map;
    });

    return function() {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{ height: (height || 260) + 'px', width:'100%', borderRadius:'12px', overflow:'hidden', background:'#111' }}
    />
  );
}
