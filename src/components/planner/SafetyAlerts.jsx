'use client';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function getAlerts(dist, t) {
  var alerts = [];
  if (dist > 200) alerts.push({ icon:AlertTriangle, color:'#FF6B35', msg: t('safety_long_trip')   || 'Viagem longa: descanse a cada 2h. Fadiga e a principal causa de acidentes.' });
  if (dist > 100) alerts.push({ icon:Info,          color:'#00D4FF', msg: t('safety_check_car')   || 'Verifique oleo, agua do radiador e calibragem dos pneus antes de sair.' });
  alerts.push(       { icon:ShieldCheck,  color:'#39FF14', msg: t('safety_seatbelt')  || 'Sempre use cinto de seguranca e evite o celular ao volante.' });
  if (dist > 400) alerts.push({ icon:AlertTriangle, color:'#FF6B35', msg: t('safety_overnight')   || 'Trecho longo: considere pernoitar no meio do caminho para maior seguranca.' });
  return alerts;
}

export default function SafetyAlerts({ distance }) {
  var { t } = useLanguage();
  var alerts = getAlerts(distance, t);
  return (
    <div className="br-card p-6">
      <h2 className="font-syne font-bold text-lg mb-4">{t('safety_title')} 🛡️</h2>
      <div className="space-y-3">
        {alerts.map(function(a, i) {
          return (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background:a.color+'10', border:'1px solid '+a.color+'25' }}>
              <a.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:a.color }}/>
              <p className="text-sm text-gray-300 leading-relaxed">{a.msg}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
