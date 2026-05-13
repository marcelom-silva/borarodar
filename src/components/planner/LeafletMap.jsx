'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

function makeIcon(L, color, glow) {
  return L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;background:' + color + ';border-radius:50%;border:2px solid #000;box-shadow:0 0 8px ' + glow + '"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function makeWaypointIcon(L, index) {
  return L.divIcon({
    className: '',
    html: '<div style="width:20px;height:20px;background:#FF6B35;border-radius:50%;border:2px solid #000;box-shadow:0 0 8px rgba(255,107,53,0.8);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;color:#000;">' + (index + 1) + '</div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function LeafletMap({ routeData }) {
  var mapRef    = useRef(null);
  var mapObjRef = useRef(null);
  var layerRef  = useRef(null);

  useEffect(function() {
    if (typeof window === 'undefined') return;
    var L = require('leaflet');

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapObjRef.current && mapRef.current) {
      mapObjRef.current = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapObjRef.current);
    }

    var map = mapObjRef.current;
    if (!map) return;
    if (layerRef.current) map.removeLayer(layerRef.current);

    if (routeData) {
      var group  = L.layerGroup();
      var coords = routeData.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });

      // Linha da rota
      L.polyline(coords, { color: '#39FF14', weight: 4, opacity: 0.9 }).addTo(group);

      // Marcador de origem (verde)
      L.marker([routeData.origin.lat, routeData.origin.lng], { icon: makeIcon(L, '#39FF14', 'rgba(57,255,20,0.8)') })
        .bindPopup('<b>Origem</b><br>' + routeData.origLabel).addTo(group);

      // Marcadores de waypoints (laranja numerados)
      if (routeData.waypoints && routeData.waypoints.length) {
        routeData.waypoints.forEach(function(wp, i) {
          if (wp.coords) {
            L.marker([wp.coords.lat, wp.coords.lng], { icon: makeWaypointIcon(L, i) })
              .bindPopup('<b>Parada ' + (i + 1) + '</b><br>' + wp.name).addTo(group);
          }
        });
      }

      // Marcador de destino (vermelho/laranja)
      L.marker([routeData.destination.lat, routeData.destination.lng], { icon: makeIcon(L, '#FF6B35', 'rgba(255,107,53,0.8)') })
        .bindPopup('<b>Destino</b><br>' + routeData.destLabel).addTo(group);

      group.addTo(map);
      layerRef.current = group;
      map.fitBounds(L.latLngBounds(coords), { padding: [30, 30] });
    }
  }, [routeData]);

  return <div ref={mapRef} className="w-full h-full" />;
}
