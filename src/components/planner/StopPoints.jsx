import { Coffee, Fuel, Sunset, Baby, Utensils } from 'lucide-react';

function getStops(distKm) {
  var n    = Math.max(1, Math.floor(distKm / 150));
  var step = distKm / (n + 1);
  var tpls = [
    { type: 'Posto',        icon: Fuel,     color: '#00D4FF', name: 'Posto BR',                    desc: 'Banheiro limpo, loja e cafezinho.' },
    { type: 'Restaurante',  icon: Utensils, color: '#FF6B35', name: 'Churrascaria do Estradeiro',  desc: 'Buffet por kilo, classico da estrada.' },
    { type: 'Cafe',         icon: Coffee,   color: '#39FF14', name: 'Padaria Estrada Real',         desc: 'Cafe forte e salgados quentinhos.' },
    { type: 'Vista',        icon: Sunset,   color: '#B24BF3', name: 'Mirante da Serra',             desc: 'Parada obrigatoria para fotos.' },
    { type: 'Bebe',         icon: Baby,     color: '#39FF14', name: 'Fraldario Completo',           desc: 'Fraldario e espaco kids equipado.' },
  ];
  var stops = [];
  for (var i = 0; i < n; i++) {
    var t = tpls[i % tpls.length];
    stops.push(Object.assign({}, t, { km: Math.round(step * (i + 1)) }));
  }
  return stops;
}

export default function StopPoints({ distance }) {
  var stops = getStops(distance);
  return (
    <div className="br-card p-6">
      <h2 className="font-syne font-bold text-lg mb-1">Paradas Sugeridas 📍</h2>
      <p className="text-gray-500 text-sm mb-5">Pontos de descanso e abastecimento ao longo da rota.</p>
      <div className="space-y-3">
        {stops.map(function(s, i) {
          return (
            <div key={i} className="flex items-start gap-4 p-4 bg-white/3 border border-white/5 rounded-xl">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: s.color + '18' }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-syne font-bold text-sm">{s.name}</span>
                  <span className="text-xs text-gray-600 font-mono flex-shrink-0">km {s.km}</span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-md flex-shrink-0" style={{ background: s.color + '18', color: s.color }}>{s.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
