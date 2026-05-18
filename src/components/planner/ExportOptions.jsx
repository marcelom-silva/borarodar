'use client';
import { useState } from 'react';
import { MessageCircle, Mail, FileText, Share2, Loader2, Check } from 'lucide-react';
import { exportToPDF, createShareLink, shareWhatsApp, shareEmail } from '@/lib/export';
import { useLanguage } from '@/contexts/LanguageContext';

function buildText(routeData, budgetData, formValues) {
  return [
    'BORA RODAR - Roteiro de Viagem',
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
  ].join('\n');
}

export default function ExportOptions({ routeData, budgetData, formValues, itinerary }) {
  var { t } = useLanguage();
  var [sharing, setSharing] = useState(false);
  var [linkCopied, setLinkCopied] = useState(false);

  function whatsapp() {
    var text = buildText(routeData, budgetData, formValues);
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }
  function email() {
    var text = buildText(routeData, budgetData, formValues);
    var subject = 'Roteiro: ' + formValues.origem + ' - ' + formValues.destino;
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
  }
  function pdf() { exportToPDF({ routeData, budgetData, formValues, itinerary }); }
  function copyLink() {
    setSharing(true);
    createShareLink({ formValues, routeData, budgetData, itinerary }).then(function(url) {
      setSharing(false);
      if (url) {
        navigator.clipboard.writeText(url).then(function() {
          setLinkCopied(true);
          setTimeout(function(){ setLinkCopied(false); }, 3000);
        });
      } else {
        // Fallback: link simples de planejar
        var fallback = window.location.origin + '/planejar?origem=' + encodeURIComponent(formValues.origem) + '&destino=' + encodeURIComponent(formValues.destino);
        navigator.clipboard.writeText(fallback).then(function() {
          alert(t('export_copied'));
        });
      }
    });
  }

  var BTNS = [
    { icon:MessageCircle, label:t('export_whats'), color:'#25D366', bg:'rgba(37,211,102,0.1)',  fn:whatsapp },
    { icon:Mail,          label:t('export_email'), color:'#00D4FF', bg:'rgba(0,212,255,0.1)',   fn:email },
    { icon:FileText,      label:t('export_pdf'),   color:'#FF6B35', bg:'rgba(255,107,53,0.1)',  fn:pdf },
    { icon: sharing ? Loader2 : linkCopied ? Check : Share2, label: linkCopied ? 'Link copiado!' : sharing ? 'Gerando...' : t('export_link'), color:'#B24BF3', bg:'rgba(178,75,243,0.1)', fn:copyLink },
  ];

  return (
    <div className="br-card p-6">
      <h2 className="font-syne font-bold text-lg mb-1">{t('export_title')} 📤</h2>
      <p className="text-gray-500 text-sm mb-5">{t('export_sub')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BTNS.map(function({ icon:Icon, label, color, bg, fn }) {
          return (
            <button key={label} onClick={fn} className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-white/5 transition-all hover:scale-105 active:scale-95" style={{ background:bg }}>
              <Icon className="w-6 h-6" style={{ color:color }}/>
              <span className="text-xs font-medium text-gray-300">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
