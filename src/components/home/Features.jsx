import { Route, Coins, MapPin, ShieldAlert, Users, Download } from 'lucide-react';

const FEATURES = [
  { icon: Route,       color: '#39FF14', title: 'Rotas Inteligentes',   desc: 'Calcule o melhor caminho considerando pedagios, balsas e trechos ruins. Dados reais do Brasil.' },
  { icon: Coins,       color: '#FF6B35', title: 'Orcamento Detalhado',  desc: 'Combustivel, pedagios, alimentacao e hospedagem calculados antes de sair. Sem surpresas.' },
  { icon: MapPin,      color: '#00D4FF', title: 'Pit Stops Incriveis',  desc: 'Restaurantes, postos, cachoeiras, mirantes e apoio para bebes ao longo da rota.' },
  { icon: ShieldAlert, color: '#B24BF3', title: 'Alertas de Seguranca', desc: 'Avisos sobre trechos ruins, condicoes da pista e dicas para uma viagem mais segura.' },
  { icon: Users,       color: '#39FF14', title: 'Comunidade',           desc: 'Avalie rotas, compartilhe dicas, ganha medalhas e suba no ranking dos exploradores.' },
  { icon: Download,    color: '#FF6B35', title: 'Exportar Tudo',        desc: 'Mande o roteiro pelo WhatsApp, salve em PDF, envie por e-mail. Simples assim.' },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-br-green font-mono text-xs uppercase tracking-widest">Por que usar</span>
        <h2 className="font-syne font-extrabold text-4xl sm:text-5xl mt-3 mb-4">
          Tudo que sua viagem precisa
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          De Oiapoque ao Chuí, do litoral ao sertao. O BoraRodar tem tudo para sua aventura ser incrivel.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(function({ icon: Icon, color, title, desc }, i) {
          return (
            <div key={i} className="br-card p-6 hover:-translate-y-1 transition-transform cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '18' }}>
                <Icon className="w-5 h-5" style={{ color: color }} />
              </div>
              <h3 className="font-syne font-bold text-base mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
