// src/lib/export.js
// ─────────────────────────────────────────────────────────────────────────────
// Exportação de roteiro: PDF (via print), WhatsApp, Email, Link público
// Zero dependências extras — usa APIs nativas do browser
// ─────────────────────────────────────────────────────────────────────────────

// ── Formata texto simples para compartilhar ──────────────────────────────────
export function buildShareText({ formValues, routeData, budgetData }) {
  const f = formValues, r = routeData, b = budgetData;
  const lines = [
    '🚗 BoraRodar — Roteiro de Viagem',
    `📍 ${f?.origem} → ${f?.destino}`,
    '',
    r?.distance ? `📏 Distância: ${r.distance.toFixed(0)} km` : '',
    b?.fuel  ? `⛽ Combustível: R$ ${b.fuel}` : '',
    b?.toll  ? `🛣️ Pedágios: R$ ${b.toll}` : '',
    b?.total ? `💰 Total estimado: R$ ${b.total}` : '',
    '',
    f?.passageiros ? `👥 Passageiros: ${f.passageiros}` : '',
    f?.noites > 0  ? `🌙 Noites: ${f.noites}` : '',
    '',
    '🔗 Planejado em BoraRodar.com.br — Grátis, sem cadastro.',
  ];
  return lines.filter(Boolean).join('\n');
}

// ── Abre compartilhamento no WhatsApp ────────────────────────────────────────
export function shareWhatsApp(data) {
  const text = buildShareText(data);
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

// ── Abre cliente de e-mail ───────────────────────────────────────────────────
export function shareEmail(data) {
  const { formValues: f } = data;
  const text    = buildShareText(data);
  const subject = `Roteiro BoraRodar: ${f?.origem?.split(',')[0]} → ${f?.destino?.split(',')[0]}`;
  window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
}

// ── Gera PDF via print (nativa, zero deps) ───────────────────────────────────
// Cria uma nova janela com HTML estilizado e dispara o diálogo de impressão.
// O usuário escolhe "Salvar como PDF" no diálogo do sistema.
export function exportToPDF({ formValues: f, routeData: r, budgetData: b, itinerary }) {
  const STYLE_LABELS = { economico:'Econômico 💰', moderado:'Moderado ⚖️', esbanjando:'Esbanjando ✨' };
  const PROFILE_LABELS = {
    solo:'Solo', couple:'Casal', women_only:'Só Mulheres', family_baby:'Família+Bebê',
    family_senior:'Com Idosos', friends:'Grupo', pets:'Com Pets',
    accessibility:'Acessibilidade', lgbt_friendly:'LGBT+ Friendly', esporte_aventura:'Aventura',
  };

  function formatDur(hours) {
    const h = Math.floor(hours), m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  }

  const itineraryHtml = itinerary
    ? itinerary
        .replace(/^(#+\s.+)$/gm, '<h3 class="section">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>BoraRodar — ${f?.origem?.split(',')[0] || ''} → ${f?.destino?.split(',')[0] || ''}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; color:#1a1a2e; padding:32px; max-width:800px; margin:0 auto; }
  .header { border-bottom: 3px solid #39FF14; padding-bottom:16px; margin-bottom:24px; }
  .logo { font-size:26px; font-weight:800; }
  .logo .bora { color:#FF6B35; }
  .logo .rodar { color:#39FF14; }
  h1 { font-size:22px; font-weight:800; margin:8px 0 4px; }
  h2 { font-size:16px; font-weight:700; margin:20px 0 10px; padding:6px 12px; background:#f5f5f5; border-radius:8px; }
  h3.section { font-size:14px; font-weight:700; color:#FF6B35; margin:14px 0 6px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:12px 0; }
  .card { background:#f9f9f9; border-radius:8px; padding:12px; }
  .card .label { font-size:11px; color:#666; margin-bottom:2px; }
  .card .value { font-size:18px; font-weight:700; }
  .budget-table { width:100%; border-collapse:collapse; margin:12px 0; }
  .budget-table td { padding:8px 0; border-bottom:1px solid #eee; font-size:14px; }
  .budget-table .val { text-align:right; font-weight:600; color:#FF6B35; }
  .budget-table .total td { font-weight:800; font-size:16px; border-top:2px solid #1a1a2e; }
  .itinerary { font-size:13px; line-height:1.7; color:#333; white-space:pre-wrap; }
  .itinerary p { margin-bottom:8px; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid #eee; font-size:11px; color:#999; text-align:center; }
  .waypoints { font-size:13px; color:#666; margin:8px 0; }
  .tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; margin:2px; }
  @media print {
    body { padding:20px; }
    h2 { background:transparent; border-left:3px solid #39FF14; border-radius:0; padding-left:10px; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="logo"><span class="bora">Bora</span><span class="rodar">Rodar</span> — Planejador de Viagens</div>
  <h1>${f?.origem || ''} → ${f?.destino || ''}</h1>
  ${f?.waypoints?.filter(w => w.name).length > 0
    ? `<div class="waypoints">Paradas: ${f.waypoints.filter(w => w.name).map(w => w.name).join(' → ')}</div>`
    : ''}
  <div style="font-size:12px;color:#999;margin-top:4px;">Gerado em ${new Date().toLocaleDateString('pt-BR', { dateStyle:'long' })}</div>
</div>

<h2>📋 Resumo da Viagem</h2>
<div class="grid">
  ${r?.distance ? `<div class="card"><div class="label">Distância</div><div class="value" style="color:#39FF14">${r.distance.toFixed(0)} km</div></div>` : ''}
  ${r?.duration ? `<div class="card"><div class="label">Tempo estimado</div><div class="value">${formatDur(r.duration)}</div></div>` : ''}
  ${f?.passageiros ? `<div class="card"><div class="label">Passageiros</div><div class="value">${f.passageiros}</div></div>` : ''}
  ${f?.noites > 0 ? `<div class="card"><div class="label">Noites</div><div class="value">${f.noites}</div></div>` : ''}
</div>
<div style="margin-bottom:8px">
  ${f?.viagem_style ? `<span class="tag" style="background:#ff6b3520;color:#FF6B35">${STYLE_LABELS[f.viagem_style] || f.viagem_style}</span>` : ''}
  ${f?.travel_profile ? `<span class="tag" style="background:#39ff1420;color:#39FF14">${PROFILE_LABELS[f.travel_profile] || f.travel_profile}</span>` : ''}
  ${f?.vehicle_type ? `<span class="tag" style="background:#00d4ff20;color:#00D4FF">${f.vehicle_type}</span>` : ''}
  ${f?.combustivel ? `<span class="tag" style="background:#b24bf320;color:#B24BF3">${f.combustivel}</span>` : ''}
  ${f?.is_round_trip ? `<span class="tag" style="background:#ff950020;color:#FF9500">Ida e Volta</span>` : ''}
</div>

${b ? `
<h2>💰 Orçamento Estimado</h2>
<table class="budget-table">
  ${b.fuel  > 0 ? `<tr><td>⛽ Combustível</td><td class="val">R$ ${b.fuel.toLocaleString('pt-BR')}</td></tr>` : ''}
  ${b.toll  > 0 ? `<tr><td>🛣️ Pedágios</td><td class="val">R$ ${b.toll.toLocaleString('pt-BR')}</td></tr>` : ''}
  ${b.food  > 0 ? `<tr><td>🍽️ Alimentação</td><td class="val">R$ ${b.food.toLocaleString('pt-BR')}</td></tr>` : ''}
  ${b.accommodation > 0 ? `<tr><td>🏨 Hospedagem</td><td class="val">R$ ${b.accommodation.toLocaleString('pt-BR')}</td></tr>` : ''}
  <tr class="total"><td><strong>TOTAL</strong></td><td class="val"><strong>R$ ${b.total?.toLocaleString('pt-BR')}</strong></td></tr>
  ${b.perPerson ? `<tr><td colspan="2" style="font-size:12px;color:#666;text-align:right">≈ R$ ${b.perPerson} por pessoa</td></tr>` : ''}
</table>
` : ''}

${itinerary ? `
<h2>📅 Roteiro Dia a Dia</h2>
<div class="itinerary"><p>${itineraryHtml}</p></div>
` : ''}

<div class="footer">
  Planejado gratuitamente em <strong>BoraRodar.com.br</strong> · Transformando viagens em histórias épicas 🚗
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
  if (!win) { alert('Habilite pop-ups para gerar o PDF.'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    setTimeout(() => {
      win.print();
    }, 500);
  };
}

// ── Salva viagem no histórico (usuário logado) ───────────────────────────────
export async function saveToHistory({ formValues, routeData, budgetData, itinerary }, authToken) {
  if (!authToken) return null;
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ formValues, routeData, budgetData, itinerary }),
    });
    const data = await res.json();
    return data.id || null;
  } catch { return null; }
}

// ── Cria link público compartilhável ─────────────────────────────────────────
export async function createShareLink({ formValues, routeData, budgetData, itinerary }) {
  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formValues, routeData, budgetData, itinerary }),
    });
    const data = await res.json();
    if (data.id) {
      return `${window.location.origin}/r/${data.id}`;
    }
    return null;
  } catch { return null; }
}
