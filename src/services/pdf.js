import { parseAmt, numToWords } from '../utils/amount';

function loadScript(src, key) {
  return new Promise(res => {
    if (window[key]) { res(); return; }
    const ex = document.querySelector(`script[data-k="${key}"]`);
    if (ex) {
      const t = setInterval(() => {
        if (window[key]) { clearInterval(t); res(); }
      }, 80);
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.setAttribute('data-k', key);
    s.onload = res;
    s.onerror = res;
    document.head.appendChild(s);
  });
}

async function buildVoucherDoc(entry) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');
  if (!window.jspdf) return null;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ml = 14, pw = 182;
  let y = 14;

  const NAVY = [31, 56, 100];
  const LB = [217, 238, 247];
  const LG = [240, 240, 240];
  const YEL = [255, 242, 204];
  const W = [255, 255, 255];
  const BLK = [0, 0, 0];
  const GOLD = [127, 96, 0];

  const { rs, ps } = parseAmt(entry.amount);
  const rsStr = rs.toLocaleString('en-US');
  const psStr = String(ps).padStart(2, '0');
  const words = numToWords(rs);
  const isD = entry.voucher_type === 'Debit';

  function cell(x, cy, w, h, bg, text, tc, sz, bold, align = 'left', pad = 2) {
    doc.setFillColor(...bg);
    doc.rect(x, cy, w, h, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.25);
    doc.rect(x, cy, w, h, 'S');
    if (text) {
      doc.setTextColor(...tc);
      doc.setFontSize(sz);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const mx = w - pad * 2;
      const lines = doc.splitTextToSize(String(text), mx);
      const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w - pad : x + pad;
      doc.text(lines[0] || '', tx, cy + h / 2, { align, baseline: 'middle' });
    }
  }

  const noW = 22, noVW = 28, labW = 22, amtW = 22, psW = 18;
  const bodyW = pw - noW - noVW, catW = bodyW - labW;

  cell(ml, y, pw, 10, NAVY, 'HAFEEZ TRADING COMPANY', W, 13, true, 'center'); y += 10;

  cell(ml, y, bodyW, 8, LB, `${isD ? 'DEBIT' : 'CREDIT'} VOUCHER`, NAVY, 11, true, 'center');
  cell(ml + bodyW, y, noW, 8, LG, 'NO.', NAVY, 7, true, 'center');
  cell(ml + bodyW + noW, y, noVW, 8, W, entry.voucher_no || '', BLK, 8, true, 'center'); y += 8;

  cell(ml, y, labW, 7, LG, isD ? 'DEBIT' : 'CREDIT', NAVY, 6, true, 'center');
  cell(ml + labW, y, catW, 7, LB, entry.debit_category || '', NAVY, 6, true, 'left');
  cell(ml + bodyW, y, noW, 7, LG, 'DATE', NAVY, 6, true, 'center');
  cell(ml + bodyW + noW, y, noVW, 7, W, entry.date || '', BLK, 7, false, 'center'); y += 7;

  const descW = pw - amtW - psW;
  cell(ml, y, descW, 5, W, '', W, 1, false);
  cell(ml + descW, y, amtW, 5, LG, 'Rs.', NAVY, 6, true, 'center');
  cell(ml + descW + amtW, y, psW, 5, LG, 'Ps.', NAVY, 6, true, 'center'); y += 5;

  cell(ml, y, labW, 8, LG, 'PAY TO', NAVY, 6, true, 'center');
  cell(ml + labW, y, catW, 8, LB, entry.pay_to || '', NAVY, 7.5, true, 'left');
  cell(ml + descW, y, amtW, 8, W, rsStr, BLK, 9, true, 'right');
  cell(ml + descW + amtW, y, psW, 8, W, psStr, BLK, 8, false, 'center'); y += 8;

  const narLines = [
    'BEING THE AMOUNT CHARGED BY THE ABOVE AS',
    entry.item_description || '',
    [
      entry.lc_number ? `IMPORT UNDER L/C NO. ${entry.lc_number}` : '',
      entry.bill_no ? `AS PER BILL NO. ${entry.bill_no}` : '',
    ].filter(Boolean).join('  '),
  ].filter(Boolean);
  const narH = Math.max(20, narLines.length * 6 + 6);
  doc.setFillColor(...W); doc.rect(ml, y, descW, narH, 'F');
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.25); doc.rect(ml, y, descW, narH, 'S');
  doc.setTextColor(...BLK); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  narLines.forEach((line, i) => {
    if (line) doc.text(doc.splitTextToSize(line, descW - 4)[0] || '', ml + 2, y + 6 + i * 6);
  });
  cell(ml + descW, y, amtW + psW, narH, W, '', W, 1, false); y += narH;

  cell(ml, y, descW, 8, LB, 'TOTAL', NAVY, 10, true, 'right');
  cell(ml + descW, y, amtW, 8, LB, rsStr, NAVY, 10, true, 'right');
  cell(ml + descW + amtW, y, psW, 8, LB, psStr, NAVY, 9, true, 'center'); y += 8;

  doc.setFillColor(...YEL); doc.rect(ml, y, pw, 8, 'F');
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.25); doc.rect(ml, y, pw, 8, 'S');
  doc.setTextColor(...GOLD); doc.setFontSize(7);
  doc.setFont('helvetica', 'bold'); doc.text('RUPEES', ml + 2, y + 4, { baseline: 'middle' });
  doc.setFont('helvetica', 'normal');
  const wordsLine = doc.splitTextToSize(words, pw - 22)[0] || '';
  doc.text(wordsLine, ml + 20, y + 4, { baseline: 'middle' }); y += 8;

  const sw = pw / 3;
  ['PAYMENT RECEIVED', 'ACCOUNTANT / CASHIER', 'PASSED FOR PAYMENT'].forEach((lbl, i) => {
    cell(ml + i * sw, y, sw, 14, LG, lbl, NAVY, 7, true, 'center');
  });

  return doc;
}

export async function generatePDF(entry, showToast) {
  const doc = await buildVoucherDoc(entry);
  if (!doc) { showToast('PDF engine unavailable', 'error'); return; }
  doc.save(`${entry.voucher_no || 'voucher'}_Hafeez_Trading.pdf`);
}

export async function printVoucher(entry, showToast) {
  const doc = await buildVoucherDoc(entry);
  if (!doc) { showToast('PDF engine unavailable', 'error'); return; }

  doc.autoPrint();
  const blobUrl = doc.output('bloburl');

  const prev = document.getElementById('htc-print-frame');
  if (prev) prev.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'htc-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Print failed', e);
      showToast('Print failed', 'error');
    }
  };
}
