'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap({ routeData }) {
  var mapRef    = useRef(null);
  var mapObjRef = useRef(null);
  var layerRef  = useRef(null);

  useEffect(function() {
    if (typeof window === 'undefined') return;
    var L = require('leaflet');

    // Corrigir icones no webpack
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

      L.polyline(coords, { color: '#39FF14', weight: 4, opacity: 0.9 }).addTo(group);

      var makeIcon = function(color, glow) {
        return L.divIcon({
          className: '',
          html: '<div style="width:14px;height:14px;background:' + color + ';border-radius:50%;border:2px solid #000;box-shadow:0 0 8px ' + glow + '"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
      };

      L.marker([routeData.origin.lat,      routeData.origin.lng],      { icon: makeIcon('#39FF14', 'rgba(57,255,20,0.8)') })
        .bindPopup('<b>Origem</b><br>' + routeData.origLabel).addTo(group);
      L.marker([routeData.destination.lat, routeData.destination.lng], { icon: makeIcon('#FF6B35', 'rgba(255,107,53,0.8)') })
        .bindPopup('<b>Destino</b><br>' + routeData.destLabel).addTo(group);

      group.addTo(map);
      layerRef.current = group;
      map.fitBounds(L.latLngBounds(coords), { padding: [30, 30] });
    }
  }, [routeData]);

  return <div ref={mapRef} className="w-full h-full" />;
}
