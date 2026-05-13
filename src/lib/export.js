export async function exportToPDF({ routeData, budgetData, formValues }) {
  var jspdfModule = await import('jspdf');
  var jsPDF = jspdfModule.jsPDF;
  var doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  var W     = 210;
  var M     = 20;
  var y     = M;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, W, 40, 'F');
  doc.setTextColor(57, 255, 20);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BORA RODAR', M, 22);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Roteiro de Viagem', M, 32);

  y = 55;
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(M, y, W - M * 2, 30, 3, 3, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(formValues.origem + ' -> ' + formValues.destino, M + 8, y + 11);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Distancia: ' + routeData.distance.toFixed(0) + ' km', M + 8, y + 21);

  y += 43;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(57, 255, 20);
  doc.text('Orcamento Estimado', M, y);
  y += 8;

  var rows = [
    ['Combustivel', 'R$ ' + budgetData.fuel],
    ['Pedagios',    'R$ ' + budgetData.toll],
    ['Alimentacao', 'R$ ' + budgetData.food],
    ['Hospedagem',  'R$ ' + budgetData.accommodation],
    ['TOTAL',       'R$ ' + budgetData.total],
  ];

  rows.forEach(function(row, i) {
    var isTotal = i === rows.length - 1;
    if (isTotal) { doc.setFillColor(57, 255, 20); } else { doc.setFillColor(22, 22, 22); }
    doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F');
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setTextColor(isTotal ? 0 : 200, isTotal ? 0 : 200, isTotal ? 0 : 200);
    doc.setFontSize(9);
    doc.text(row[0], M + 5, y + 7);
    doc.text(row[1], W - M - 5, y + 7, { align: 'right' });
    y += 12;
  });

  y += 8;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('* Valores estimados. Gerado em BoraRodar.com.br', M, y);

  var fname = 'BoraRodar_' + formValues.origem.replace(/\s/g, '') + '_' + formValues.destino.replace(/\s/g, '') + '.pdf';
  doc.save(fname);
}
