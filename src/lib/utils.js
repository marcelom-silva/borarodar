export function cn() {
  return Array.from(arguments).filter(Boolean).join(' ');
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatKm(km) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(km) + ' km';
}

export function formatDuration(hours) {
  var h = Math.floor(hours);
  var m = Math.round((hours - h) * 60);
  if (h === 0) return m + ' min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}
