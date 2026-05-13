'use client';
import { MessageCircle, Mail, FileText, Share2 } from 'lucide-react';
import { exportToPDF } from '@/lib/export';

function buildText(routeData, budgetData, formValues) {
  var lines = [
    '🚗 BORA RODAR - Roteiro de Viagem',
    '',
    'Origem: ' + formValues.origem,
    'Destino: ' + formValues.destino,
    'Distancia: ' + routeData.distance.toFixed(0) + ' km',
    '',
    'ORCAMENTO ESTIMADO:',
    '  Combustivel: R$ ' + budgetData.fuel,
    '  Pedagios:    R$ ' + budgetData.toll,
    '  Alimentacao: R$ ' + budgetData.food,
    '  Hospedagem:  R$ ' + budgetData.accommodation,
    '  TOTAL:       R$ ' + budgetData.total,
    '',
    'Planejado em BoraRodar.com.br',
  ];
  return lines.join('\n');
}

export default function ExportOptions({ routeData, budgetData, formValues }) {
  function whatsapp() {
    var text = buildText(routeData, budgetData, formValues);
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }
  function email() {
    var text    = buildText(routeData, budgetData, formValues);
    var subject = 'Roteiro: ' + formValues.origem + ' - ' + formValues.destino;
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
  }
  function pdf() { exportToPDF({ routeData, budgetData, formValues }); }
  function copyLink() {
    var url = window.location.origin + '/planejar?origem=' + encodeURIComponent(formValues.origem) + '&destino=' + encodeURIComponent(formValues.destino);
    navigator.clipboard.writeText(url).then(function() { alert('Link copiado!'); });
  }

  var BTNS = [
    { icon: MessageCircle, label: 'WhatsApp',   color: '#25D366', bg: 'rgba(37,211,102,0.1)',  fn: whatsapp },
    { icon: Mail,          label: 'E-mail',      color: '#00D4FF', bg: 'rgba(0,212,255,0.1)',   fn: email },
    { icon: FileText,      label: 'PDF',         color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',  fn: pdf },
    { icon: Share2,        label: 'Copiar link', color: '#B24BF3', bg: 'rgba(178,75,243,0.1)',  fn: copyLink },
  ];

  return (
    <div className="br-card p-6">
      <h2 className="font-syne font-bold text-lg mb-1">Exportar Roteiro 📤</h2>
      <p className="text-gray-500 text-sm mb-5">Compartilhe com a galera ou salve para depois.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BTNS.map(function({ icon: Icon, label, color, bg, fn }) {
          return (
            <button key={label} onClick={fn} className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-white/5 transition-all hover:scale-105 active:scale-95" style={{ background: bg }}>
              <Icon className="w-6 h-6" style={{ color: color }} />
              <span className="text-xs font-medium text-gray-300">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
