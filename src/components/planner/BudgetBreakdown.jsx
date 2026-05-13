import { Fuel, BarChart2, Utensils, Bed, CreditCard } from 'lucide-react';

var ITEMS = [
  { key: 'fuel',          label: 'Combustivel',     icon: Fuel,      color: '#39FF14' },
  { key: 'toll',          label: 'Pedagios (est.)', icon: BarChart2, color: '#00D4FF' },
  { key: 'food',          label: 'Alimentacao',     icon: Utensils,  color: '#FF6B35' },
  { key: 'accommodation', label: 'Hospedagem',      icon: Bed,       color: '#B24BF3' },
];

export default function BudgetBreakdown({ budget }) {
  return (
    <div className="br-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-br-green" />
        <h2 className="font-syne font-bold text-lg">Orcamento do Role 💰</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {ITEMS.map(function({ key, label, icon: Icon, color }) {
          return (
            <div key={key} className="bg-white/3 border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: color }} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <div className="font-syne font-extrabold text-xl" style={{ color: color }}>
                R$ {(budget[key] || 0).toLocaleString('pt-BR')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {ITEMS.map(function({ key, label, color }) {
          var pct = budget.total > 0 ? ((budget[key] || 0) / budget.total) * 100 : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{label}</span>
                <span>{pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: pct + '%', background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-gray-400">Total estimado</span>
        <span className="font-syne font-extrabold text-2xl text-br-green">
          R$ {(budget.total || 0).toLocaleString('pt-BR')}
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-2">* Pedagios estimados por media por km. Valores de alimentacao e hospedagem sao medias nacionais.</p>
    </div>
  );
}
