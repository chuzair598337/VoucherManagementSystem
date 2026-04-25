export function parseAmt(val) {
  const n = parseFloat(val) || 0;
  const rs = Math.floor(n);
  const ps = Math.round((n - rs) * 100);
  return { rs, ps };
}

export function fmtAmt(val) {
  const { rs, ps } = parseAmt(val);
  return `${rs.toLocaleString('en-US')}.${String(ps).padStart(2, '0')}`;
}

export function fmtAmtRs(val) {
  return parseInt(parseAmt(val).rs).toLocaleString('en-US');
}

export function fmtAmtPs(val) {
  return String(parseAmt(val).ps).padStart(2, '0');
}

export function numToWords(n) {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  if (!n || n === 0) return 'ZERO ONLY';
  function w(x) {
    if (x === 0) return '';
    if (x < 20) return ones[x] + ' ';
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '') + ' ';
    if (x < 1000) return ones[Math.floor(x / 100)] + ' HUNDRED ' + w(x % 100);
    if (x < 100000) return w(Math.floor(x / 1000)) + 'THOUSAND ' + w(x % 1000);
    if (x < 10000000) return w(Math.floor(x / 100000)) + 'LAKH ' + w(x % 100000);
    return w(Math.floor(x / 10000000)) + 'CRORE ' + w(x % 10000000);
  }
  return w(n).trim() + ' ONLY';
}
