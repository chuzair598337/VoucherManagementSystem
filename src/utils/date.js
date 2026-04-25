export function toPicker(dmy) {
  if (!dmy) return '';
  const p = dmy.split('.');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '';
}

export function fromPicker(ymd) {
  if (!ymd) return '';
  const p = ymd.split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : '';
}

export function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateToTs(dmy) {
  if (!dmy) return 0;
  const [d, m, y] = dmy.split('.').map(Number);
  return new Date(y, m - 1, d).getTime();
}
