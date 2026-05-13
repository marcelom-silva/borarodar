'use client';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SafetyAlerts({ distance, vehicleType, isRoundTrip }) {
  var { t } = useLanguage();

  var alerts = [];

  // Alerta de viagem longa
  if (distance > 200) {
    alerts.push({ icon:AlertTriangle, color:'#FF6B35',
      msg: t('safety_long_trip') });
  }

  // Verificar veiculo antes de sair
  if (distance > 100) {
    alerts.push({ icon:Info, color:'#00D4FF',
      msg: t('safety_check_car') });
  }

  // Cinto de seguranca (sempre)
  alerts.push({ icon:ShieldCheck, color:'#39FF14',
    msg: t('safety_seatbelt') });

  // Considerar pernoite
  if (distance > 400) {
    alerts.push({ icon:AlertTriangle, color:'#FF6B35',
      msg: t('safety_overnight') });
  }

  // Motociclista
  if (vehicleType === 'moto') {
    alerts.push({ icon:AlertTriangle, color:'#B24BF3',
      msg: t('safety_moto') });
  }

  // Ida e volta
  if (isRoundTrip) {
    alerts.push({ icon:Info, color:'#00D4FF',
      msg: t('safety_roundtrip') });
  }

  return (
    <div className="br-card p-6">
      <h2 className="font-syne font-bold text-lg mb-4">{t('safety_title')} 🛡️</h2>
      <div className="space-y-3">
        {alerts.map(function(a, i) {
          return (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background:a.color+'0F', border:'1px solid '+a.color+'28' }}>
              <a.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:a.color }}/>
              <p className="text-sm text-gray-300 leading-relaxed">{a.msg}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
