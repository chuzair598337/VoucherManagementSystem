import { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Eye, Printer, Download, ArrowLeft, Search, TrendingDown, TrendingUp, Hash, Layers, FileText, UserPlus, X, Tag, ArrowUpDown } from "lucide-react";

// ── Amount helpers ─────────────────────────────────────────────────────────────
function parseAmt(val) {
  const n = parseFloat(val) || 0;
  const rs = Math.floor(n);
  const ps = Math.round((n - rs) * 100);
  return { rs, ps };
}
function fmtAmt(val) {
  const { rs, ps } = parseAmt(val);
  return `${rs.toLocaleString('en-US')}.${String(ps).padStart(2, '0')}`;
}
function fmtAmtRs(val) { return parseInt(parseAmt(val).rs).toLocaleString('en-US'); }
function fmtAmtPs(val) { return String(parseAmt(val).ps).padStart(2, '0'); }

// ── Number to words ────────────────────────────────────────────────────────────
function numToWords(n) {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  if (!n || n === 0) return 'ZERO ONLY';
  function w(x) {
    if (x === 0) return ''; if (x < 20) return ones[x] + ' ';
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '') + ' ';
    if (x < 1000) return ones[Math.floor(x / 100)] + ' HUNDRED ' + w(x % 100);
    if (x < 100000) return w(Math.floor(x / 1000)) + 'THOUSAND ' + w(x % 1000);
    if (x < 10000000) return w(Math.floor(x / 100000)) + 'LAKH ' + w(x % 100000);
    return w(Math.floor(x / 10000000)) + 'CRORE ' + w(x % 10000000);
  }
  return w(n).trim() + ' ONLY';
}
function nextNo(entries, type) {
  const p = type === 'Debit' ? 'DV' : 'CV';
  const nums = entries.filter(e => e.voucher_type === type).map(e => parseInt((e.voucher_no || '0').split('-')[1]) || 0);
  return `${p}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
}
function toPicker(dmy) { if (!dmy) return ''; const p = dmy.split('.'); return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '' }
function fromPicker(ymd) { if (!ymd) return ''; const p = ymd.split('-'); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : '' }
function todayYMD() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function dateToTs(dmy) { if (!dmy) return 0; const [d, m, y] = dmy.split('.').map(Number); return new Date(y, m - 1, d).getTime(); }

// ── Constants ──────────────────────────────────────────────────────────────────
const INIT_CATS = ['CHEMICALS UNDER FREE LIST IMPORT', 'DYES UNDER FREE LIST IMPORT', 'TEXTILES UNDER FREE LIST IMPORT', 'PHARMACEUTICALS UNDER FREE LIST IMPORT', 'MACHINERY & EQUIPMENT IMPORT', 'RAW MATERIALS IMPORT', 'CLEARING & FORWARDING CHARGES', 'IMPORT DUTIES & LEVIES', 'FREIGHT & TRANSPORTATION', 'GENERAL PAYABLES', 'GENERAL RECEIVABLES', 'BANK CHARGES', 'OTHER'];
const INIT_PAYEES = ['ANWER ASGHAR BROTHERS', 'TARIQ ENTERPRISES', 'HASSAN FABRICS LTD', 'NATIONAL CLEARING AGENTS', 'KARACHI PORT TRUST'];
const SAMPLE = [
  { id: 1, voucher_no: 'DV-001', voucher_type: 'Debit', date: '13.01.2026', debit_category: 'CHEMICALS UNDER FREE LIST IMPORT', pay_to: 'ANWER ASGHAR BROTHERS', lc_number: 'LCU/1/30/1945', bill_no: '0149', item_description: 'CLEARING CHARGES FOR IN BOND 3000 KG BLANCOROL MGO', amount: 71978.00 },
  { id: 2, voucher_no: 'DV-002', voucher_type: 'Debit', date: '13.01.2026', debit_category: 'DYES UNDER FREE LIST IMPORT', pay_to: 'ANWER ASGHAR BROTHERS', lc_number: '', bill_no: '', item_description: 'CLEARING CHARGES FOR IN BOND 4860 KOSELLA FAST BEIGE', amount: 81968.00 },
  { id: 3, voucher_no: 'CV-001', voucher_type: 'Credit', date: '15.01.2026', debit_category: 'GENERAL RECEIVABLES', pay_to: 'TARIQ ENTERPRISES', lc_number: '', bill_no: 'B-205', item_description: 'PAYMENT RECEIVED AGAINST DELIVERY OF GOODS', amount: 45000.00 },
  { id: 4, voucher_no: 'DV-003', voucher_type: 'Debit', date: '18.01.2026', debit_category: 'TEXTILES UNDER FREE LIST IMPORT', pay_to: 'HASSAN FABRICS LTD', lc_number: 'LCU/2/18/2026', bill_no: '0212', item_description: 'CLEARING CHARGES FOR IN BOND 5200 METRES COTTON FABRIC', amount: 38500.50 },
];
const EMPTY = { voucher_no: '', voucher_type: 'Debit', date: '', debit_category: '', pay_to: '', lc_number: '', bill_no: '', item_description: '', amount: '' };

function validate(form) {
  const e = {};
  if (!form.date) e.date = 'Date is required';
  if (!form.debit_category) e.debit_category = 'Category is required';
  if (!form.pay_to) e.pay_to = 'Payee is required';
  if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) e.amount = 'Enter a valid amount greater than 0';
  return e;
}

// ── Voucher HTML ───────────────────────────────────────────────────────────────
function voucherHtml(e) {
  const { rs, ps } = parseAmt(e.amount);
  const rsStr = rs.toLocaleString('en-US');
  const psStr = String(ps).padStart(2, '0');
  const words = numToWords(rs);
  const isD = e.voucher_type === 'Debit';

  // Build narration lines
  const narLines = [
    'BEING THE AMOUNT CHARGED BY THE ABOVE AS',
    e.item_description || '',
    [e.lc_number ? `IMPORT UNDER L/C NO. ${e.lc_number}` : '', e.bill_no ? `AS PER BILL NO. ${e.bill_no}` : ''].filter(Boolean).join('  '),
  ].filter(Boolean);
  const narration = narLines.join('<br/>');

  return `<div style="font-family:Arial,sans-serif;max-width:660px;margin:0 auto">
  <table style="width:100%;border-collapse:collapse;font-size:11px">
    <tr><td colspan="4" style="border:2px solid #1F3864;padding:13px;background:#1F3864;color:#fff;text-align:center;font-size:17px;font-weight:bold;letter-spacing:1px">HAFEEZ TRADING COMPANY</td></tr>
    <tr>
      <td colspan="2" style="border:1px solid #ccc;padding:9px;background:#D9EEF7;color:#1F3864;text-align:center;font-size:13px;font-weight:bold">${isD ? 'DEBIT' : 'CREDIT'} VOUCHER</td>
      <td style="border:1px solid #ccc;padding:5px 7px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px;color:#1F3864;width:48px">NO.</td>
      <td style="border:1px solid #ccc;padding:5px 9px;text-align:center;font-weight:bold;width:80px">${e.voucher_no || ''}</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc;padding:5px 7px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px;color:#1F3864;width:60px">${isD ? 'DEBIT' : 'CREDIT'}</td>
      <td style="border:1px solid #ccc;padding:5px 9px;background:#EBF3FB;font-weight:bold">${e.debit_category || ''}</td>
      <td style="border:1px solid #ccc;padding:5px 7px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">DATE</td>
      <td style="border:1px solid #ccc;padding:5px 9px;text-align:center">${e.date || ''}</td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #ccc;padding:4px"></td>
      <td style="border:1px solid #ccc;padding:4px 7px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">Rs.</td>
      <td style="border:1px solid #ccc;padding:4px 7px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">Ps.</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc;padding:5px 7px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">PAY TO</td>
      <td style="border:1px solid #ccc;padding:5px 9px;background:#EBF3FB;font-weight:bold">${e.pay_to || ''}</td>
      <td style="border:1px solid #ccc;padding:5px 9px;text-align:right;font-weight:bold;font-size:12px">${rsStr}</td>
      <td style="border:1px solid #ccc;padding:5px 9px;text-align:center">${psStr}</td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #ccc;padding:9px 11px;font-size:10px;line-height:1.85">${narration}</td>
      <td colspan="2" style="border:1px solid #ccc;padding:5px"></td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #ccc;padding:8px 9px;background:#D9EEF7;color:#1F3864;font-weight:bold;text-align:right;font-size:12px">TOTAL</td>
      <td style="border:1px solid #ccc;padding:8px 9px;background:#D9EEF7;color:#1F3864;font-weight:bold;text-align:right;font-size:13px">${rsStr}</td>
      <td style="border:1px solid #ccc;padding:8px 9px;background:#D9EEF7;color:#1F3864;font-weight:bold;text-align:center">${psStr}</td>
    </tr>
    <tr>
      <td colspan="4" style="border:1px solid #ccc;padding:8px 10px;background:#FFF2CC;font-size:10px;color:#7F6000">
        <strong>RUPEES</strong>&nbsp;&nbsp;<u>${words}</u>
      </td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc;padding:22px 7px;background:#f5f5f5;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">PAYMENT<br/>RECEIVED</td>
      <td style="border:1px solid #ccc;padding:22px 7px;background:#f5f5f5;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">ACCOUNTANT / CASHIER</td>
      <td colspan="2" style="border:1px solid #ccc;padding:22px 7px;background:#f5f5f5;font-weight:bold;text-align:center;font-size:9px;color:#1F3864">PASSED FOR PAYMENT</td>
    </tr>
  </table></div>`;
}

// ── PDF generation (programmatic jsPDF, no html2canvas) ───────────────────────
async function generatePDF(entry, showToast) {
  const load = (src, key) => new Promise(res => {
    if (window[key]) { res(); return; }
    const ex = document.querySelector(`script[data-k="${key}"]`);
    if (ex) { const t = setInterval(() => { if (window[key]) { clearInterval(t); res(); } }, 80); return; }
    const s = document.createElement('script'); s.src = src; s.setAttribute('data-k', key);
    s.onload = res; s.onerror = res; document.head.appendChild(s);
  });
  await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');
  if (!window.jspdf) { showToast('PDF engine unavailable', 'error'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ml = 14, pw = 182; let y = 14;
  const NAVY = [31, 56, 100], LB = [217, 238, 247], LG = [240, 240, 240], YEL = [255, 242, 204], W = [255, 255, 255], BLK = [0, 0, 0], GOLD = [127, 96, 0];
  const { rs, ps } = parseAmt(entry.amount);
  const rsStr = rs.toLocaleString('en-US'), psStr = String(ps).padStart(2, '0');
  const words = numToWords(rs);
  const isD = entry.voucher_type === 'Debit';

  function cell(x, cy, w, h, bg, text, tc, sz, bold, align = 'left', pad = 2) {
    doc.setFillColor(...bg); doc.rect(x, cy, w, h, 'F');
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.25); doc.rect(x, cy, w, h, 'S');
    if (text) {
      doc.setTextColor(...tc); doc.setFontSize(sz); doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const mx = w - pad * 2; const lines = doc.splitTextToSize(String(text), mx);
      const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w - pad : x + pad;
      doc.text(lines[0] || '', tx, cy + h / 2, { align, baseline: 'middle' });
    }
  }

  const noW = 22, noVW = 28, labW = 22, amtW = 22, psW = 18;
  const bodyW = pw - noW - noVW, catW = bodyW - labW;

  // Header
  cell(ml, y, pw, 10, NAVY, 'HAFEEZ TRADING COMPANY', W, 13, true, 'center'); y += 10;
  // Title row
  cell(ml, y, bodyW, 8, LB, `${isD ? 'DEBIT' : 'CREDIT'} VOUCHER`, NAVY, 11, true, 'center');
  cell(ml + bodyW, y, noW, 8, LG, 'NO.', NAVY, 7, true, 'center');
  cell(ml + bodyW + noW, y, noVW, 8, W, entry.voucher_no || '', BLK, 8, true, 'center'); y += 8;
  // Debit/Category/Date
  cell(ml, y, labW, 7, LG, isD ? 'DEBIT' : 'CREDIT', NAVY, 6, true, 'center');
  cell(ml + labW, y, catW, 7, LB, entry.debit_category || '', NAVY, 6, true, 'left');
  cell(ml + bodyW, y, noW, 7, LG, 'DATE', NAVY, 6, true, 'center');
  cell(ml + bodyW + noW, y, noVW, 7, W, entry.date || '', BLK, 7, false, 'center'); y += 7;
  // Rs/Ps headers
  const descW = pw - amtW - psW;
  cell(ml, y, descW, 5, W, '', W, 1, false);
  cell(ml + descW, y, amtW, 5, LG, 'Rs.', NAVY, 6, true, 'center');
  cell(ml + descW + amtW, y, psW, 5, LG, 'Ps.', NAVY, 6, true, 'center'); y += 5;
  // PAY TO
  cell(ml, y, labW, 8, LG, 'PAY TO', NAVY, 6, true, 'center');
  cell(ml + labW, y, catW, 8, LB, entry.pay_to || '', NAVY, 7.5, true, 'left');
  cell(ml + descW, y, amtW, 8, W, rsStr, BLK, 9, true, 'right');
  cell(ml + descW + amtW, y, psW, 8, W, psStr, BLK, 8, false, 'center'); y += 8;
  // Narration block
  const narLines = [
    'BEING THE AMOUNT CHARGED BY THE ABOVE AS',
    entry.item_description || '',
    [entry.lc_number ? `IMPORT UNDER L/C NO. ${entry.lc_number}` : '', entry.bill_no ? `AS PER BILL NO. ${entry.bill_no}` : ''].filter(Boolean).join('  '),
  ].filter(Boolean);
  const narH = Math.max(20, narLines.length * 6 + 6);
  doc.setFillColor(...W); doc.rect(ml, y, descW, narH, 'F');
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.25); doc.rect(ml, y, descW, narH, 'S');
  doc.setTextColor(...BLK); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  narLines.forEach((line, i) => { if (line) doc.text(doc.splitTextToSize(line, descW - 4)[0] || '', ml + 2, y + 6 + i * 6); });
  cell(ml + descW, y, amtW + psW, narH, W, '', W, 1, false); y += narH;
  // Total
  cell(ml, y, descW, 8, LB, 'TOTAL', NAVY, 10, true, 'right');
  cell(ml + descW, y, amtW, 8, LB, rsStr, NAVY, 10, true, 'right');
  cell(ml + descW + amtW, y, psW, 8, LB, psStr, NAVY, 9, true, 'center'); y += 8;
  // Rupees in words
  doc.setFillColor(...YEL); doc.rect(ml, y, pw, 8, 'F');
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.25); doc.rect(ml, y, pw, 8, 'S');
  doc.setTextColor(...GOLD); doc.setFontSize(7);
  doc.setFont('helvetica', 'bold'); doc.text('RUPEES', ml + 2, y + 4, { baseline: 'middle' });
  doc.setFont('helvetica', 'normal');
  const wordsLine = doc.splitTextToSize(words, pw - 22)[0] || '';
  doc.text(wordsLine, ml + 20, y + 4, { baseline: 'middle' }); y += 8;
  // Signatures
  const sw = pw / 3;
  ['PAYMENT RECEIVED', 'ACCOUNTANT / CASHIER', 'PASSED FOR PAYMENT'].forEach((lbl, i) => {
    cell(ml + i * sw, y, sw, 14, LG, lbl, NAVY, 7, true, 'center');
  });

  doc.save(`${entry.voucher_no || 'voucher'}_Hafeez_Trading.pdf`);
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.app{min-height:100vh;background:#EEF2F7;font-family:'IBM Plex Sans',sans-serif}
@media print{
  body>*{visibility:hidden !important}
  #htc-print,#htc-print *{visibility:visible !important}
  #htc-print{position:fixed !important;top:0;left:0;width:100% !important;background:#fff;z-index:99999;padding:16px}
}
.hdr{background:#1F3864;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:58px;border-bottom:3px solid #00A0D2}
.hdr-brand{display:flex;align-items:center;gap:12px}
.hdr-ico{width:34px;height:34px;background:#00A0D2;border-radius:6px;display:flex;align-items:center;justify-content:center}
.hdr-t{color:#fff;font-size:14px;font-weight:600}
.hdr-s{color:#7BA7CC;font-size:10px;margin-top:1px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px 24px 0}
.sc{background:#fff;border-radius:10px;padding:14px 16px;border:1px solid #E2E8F0;display:flex;align-items:center;gap:12px}
.si{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sl{font-size:10px;color:#64748b;font-weight:500;margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em}
.sv{font-size:20px;font-weight:600;font-family:'IBM Plex Mono',monospace}
.main{padding:18px 24px 28px}
.card{background:#fff;border-radius:10px;border:1px solid #E2E8F0;overflow:hidden}
.ch{padding:13px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F1F5F9;background:#FAFBFC;flex-wrap:wrap;gap:10px}
.ct{font-size:13px;font-weight:600;color:#1F3864}
.ctrls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.sw{position:relative}.sw svg{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#94a3b8}
.sw input{padding:7px 10px 7px 28px;border:1px solid #E2E8F0;border-radius:7px;font-size:12px;width:190px;outline:none;font-family:inherit;color:#1e293b;background:#fff}
.sw input:focus{border-color:#00A0D2}
select.flt{padding:7px 10px;border:1px solid #E2E8F0;border-radius:7px;font-size:12px;outline:none;background:#fff;font-family:inherit;color:#1e293b;cursor:pointer}
select.flt:focus{border-color:#00A0D2}
.sort-btn{display:flex;align-items:center;gap:5px;padding:7px 11px;border:1px solid #E2E8F0;border-radius:7px;font-size:12px;background:#fff;cursor:pointer;color:#475569;font-family:inherit}
.sort-btn:hover{background:#F8FAFC;border-color:#00A0D2;color:#1F3864}
table.lg{width:100%;border-collapse:collapse;font-size:12px}
table.lg th{padding:9px 12px;text-align:left;background:#1F3864;color:#CBD5E1;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap}
table.lg td{padding:9px 12px;border-bottom:1px solid #F8FAFC;vertical-align:middle;color:#334155}
table.lg tr:hover td{background:#F8FBFF}
table.lg tfoot td{background:#EBF3FB;border-top:2px solid #D9EEF7;font-weight:600;color:#1F3864;padding:9px 12px}
.vno{font-family:'IBM Plex Mono',monospace;font-weight:500;color:#1F3864;font-size:12px}
.badge{display:inline-flex;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:600}
.bd{background:#FEE2E2;color:#991B1B}.bc{background:#DCFCE7;color:#166534}
.amc{font-family:'IBM Plex Mono',monospace;font-weight:500;text-align:right;font-size:12px}
/* Action buttons: 2 rows of 3 */
.acts{display:flex;flex-direction:column;gap:3px}
.acts-row{display:flex;gap:3px}
.ab{width:27px;height:27px;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s;flex-shrink:0}
.ab:hover{opacity:.7}.ab:disabled{opacity:.35;cursor:not-allowed}
.apv{background:#EDE9FE;color:#7C3AED}.aed{background:#DBEAFE;color:#1D4ED8}
.apr{background:#DCFCE7;color:#15803D}.adl{background:#FEF3C7;color:#B45309}
.adx{background:#FEE2E2;color:#DC2626}.aph{background:#F0F9FF;color:#0077A8}
.btnp{background:#1F3864;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;white-space:nowrap}
.btnp:hover{background:#163060}.btnp.tl{background:#0077A8}.btnp.tl:hover{background:#005f87}
.btnp.gn{background:#15803D}.btnp.gn:hover{background:#166534}.btnp:disabled{opacity:.45;cursor:not-allowed}
.empty{text-align:center;padding:56px 20px;color:#94a3b8}
.empty svg{margin-bottom:10px;opacity:.25}.empty p{font-size:13px}
/* Form */
.fw{max-width:760px;margin:0 auto}
.bk{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;background:#fff;border:1px solid #E2E8F0;border-radius:7px;font-size:12px;cursor:pointer;color:#64748b;font-family:inherit;margin-bottom:14px}
.bk:hover{background:#F8FAFC}
.fc{background:#fff;border-radius:10px;border:1px solid #E2E8F0;overflow:hidden}
.fh{background:#1F3864;padding:15px 20px;border-bottom:3px solid #00A0D2}
.fh h2{color:#fff;font-size:15px;font-weight:600}.fh p{color:#7BA7CC;font-size:11px;margin-top:2px}
.fb{padding:22px 20px}
.fs{margin-bottom:22px}
.fst{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.09em;color:#94a3b8;margin-bottom:12px;padding-bottom:5px;border-bottom:1px solid #F1F5F9}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px 18px}
.ff{grid-column:1/-1}
.fgrp{display:flex;flex-direction:column}
.fgrp label{font-size:11px;font-weight:600;color:#475569;margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
.fgrp input,.fgrp select,.fgrp textarea{width:100%;padding:9px 11px;border:1px solid #E2E8F0;border-radius:7px;font-size:13px;outline:none;font-family:inherit;color:#1e293b;background:#fff;transition:border-color .15s}
.fgrp input:focus,.fgrp select:focus,.fgrp textarea:focus{border-color:#00A0D2;box-shadow:0 0 0 3px #E0F4FA}
.fgrp input.ei,.fgrp select.ei{border-color:#DC2626}
.fgrp input.ei:focus,.fgrp select.ei:focus{border-color:#DC2626;box-shadow:0 0 0 3px #FEE2E2}
.fgrp input.ro{background:#F8FAFC;color:#64748b;cursor:default;border-color:#E2E8F0 !important;box-shadow:none !important}
.fgrp textarea{resize:vertical;min-height:78px}
.amt-derived{margin-top:5px;padding:6px 10px;background:#EBF3FB;border-radius:6px;font-size:11px;font-weight:600;color:#1F3864;font-family:'IBM Plex Mono',monospace;display:flex;gap:16px}
.amt-derived span{color:#64748b;font-weight:400;font-family:'IBM Plex Sans',sans-serif;margin-right:4px}
.emsg{font-size:11px;color:#DC2626;margin-top:4px;display:flex;align-items:center;gap:4px;line-height:1.3}
.sel-row{display:flex;gap:8px}.sel-row select{flex:1}
.add-btn{display:flex;align-items:center;gap:5px;padding:0 12px;border:1px solid #00A0D2;border-radius:7px;font-size:12px;font-weight:600;color:#0077A8;background:#F0F9FF;cursor:pointer;font-family:inherit;white-space:nowrap;height:39px;flex-shrink:0}
.add-btn:hover{background:#E0F4FA}
.wp{margin-top:12px;padding:9px 13px;background:#FFF9E6;border-radius:7px;border:1px solid #F0D878;font-size:11px;font-weight:600;color:#7F6000}
.fa{display:flex;gap:9px;padding:14px 20px;border-top:1px solid #F1F5F9;background:#FAFBFC;justify-content:flex-end}
.btnc{padding:8px 16px;border:1px solid #E2E8F0;border-radius:7px;font-size:12px;cursor:pointer;color:#64748b;background:#fff;font-family:inherit}
.btnc:hover{background:#F8FAFC}
.btns{padding:9px 22px;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;background:#1F3864;color:#fff;font-family:inherit}
.btns:hover{background:#163060}
/* Modals */
.ov{position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(2px)}
.modal{background:#fff;border-radius:12px;width:100%;max-width:700px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.mh{background:#1F3864;padding:15px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #00A0D2;flex-shrink:0}
.mt2{color:#fff;font-size:14px;font-weight:600}.ms{color:#7BA7CC;font-size:11px;margin-top:2px}
.mx{background:transparent;border:none;color:#7BA7CC;cursor:pointer;font-size:20px;line-height:1;padding:4px;border-radius:4px;display:flex;align-items:center}
.mx:hover{color:#fff}
.mb{overflow-y:auto;flex:1;padding:20px;background:#F8FAFC}
.mf{padding:11px 18px;border-top:1px solid #F1F5F9;display:flex;gap:9px;justify-content:flex-end;background:#FAFBFC;flex-shrink:0}
.sm{background:#fff;border-radius:12px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
.sm-h{background:#1F3864;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #00A0D2}
.sm-h h3{color:#fff;font-size:14px;font-weight:600}
.sm-b{padding:20px}
.sm-b label{display:block;font-size:11px;font-weight:600;color:#475569;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
.sm-b input{width:100%;padding:9px 11px;border:1px solid #E2E8F0;border-radius:7px;font-size:13px;outline:none;font-family:inherit;color:#1e293b}
.sm-b input:focus{border-color:#00A0D2;box-shadow:0 0 0 3px #E0F4FA}
.sm-f{padding:12px 18px;border-top:1px solid #F1F5F9;display:flex;gap:8px;justify-content:flex-end;background:#FAFBFC}
.conf{background:#fff;border-radius:12px;padding:26px;max-width:370px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.conf h3{font-size:15px;font-weight:600;color:#1F3864;margin-bottom:7px}
.conf p{font-size:13px;color:#64748b;line-height:1.6;margin-bottom:20px}
.cbts{display:flex;gap:9px;justify-content:flex-end}
.btnd{padding:8px 18px;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;background:#DC2626;color:#fff;font-family:inherit}
.toast{position:fixed;bottom:20px;right:20px;z-index:9999;padding:11px 18px;border-radius:8px;font-size:13px;font-weight:500;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);animation:su .2s ease}
@keyframes su{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
input[type=date]{color:#1e293b}
`;

const ErrIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;

export default function App() {
  const [entries, setEntries] = useState(SAMPLE);
  const [categories, setCategories] = useState(INIT_CATS);
  const [payees, setPayees] = useState(INIT_PAYEES);
  const [view, setView] = useState('ledger');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [preview, setPreview] = useState(null);
  const [delId, setDelId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [printEntry, setPrintEntry] = useState(null);
  // Add-new modals
  const [payeeModal, setPayeeModal] = useState(false);
  const [newPayee, setNewPayee] = useState('');
  const [newPayeeErr, setNewPayeeErr] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newCatErr, setNewCatErr] = useState('');

  const showToast = useCallback((msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }, []);

  // ── Filter + Sort ────────────────────────────────────────────────────────────
  const filtered = entries.filter(e => {
    const okT = typeFilter === 'All' || e.voucher_type === typeFilter;
    const q = search.toLowerCase();
    const okQ = !q || [e.voucher_no, e.pay_to, e.debit_category, e.bill_no, e.lc_number].some(f => (f || '').toLowerCase().includes(q));
    return okT && okQ;
  });
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return dateToTs(b.date) - dateToTs(a.date);
      case 'date-asc': return dateToTs(a.date) - dateToTs(b.date);
      case 'amt-desc': return (+b.amount || 0) - (+a.amount || 0);
      case 'amt-asc': return (+a.amount || 0) - (+b.amount || 0);
      case 'type': return a.voucher_type.localeCompare(b.voucher_type);
      case 'category': return (a.debit_category || '').localeCompare(b.debit_category || '');
      case 'voucher': return (a.voucher_no || '').localeCompare(b.voucher_no || '');
      default: return 0;
    }
  });

  const totalD = entries.filter(e => e.voucher_type === 'Debit').reduce((s, e) => s + (+e.amount || 0), 0);
  const totalC = entries.filter(e => e.voucher_type === 'Credit').reduce((s, e) => s + (+e.amount || 0), 0);

  // ── Form ─────────────────────────────────────────────────────────────────────
  const openCreate = () => { setForm({ ...EMPTY, date: fromPicker(todayYMD()), voucher_no: nextNo(entries, 'Debit') }); setEditId(null); setFormErrors({}); setTouched({}); setView('form'); };
  const openEdit = (e) => { setForm({ ...e }); setEditId(e.id); setFormErrors({}); setTouched({}); setView('form'); };
  const handleChange = (field, val) => {
    setForm(prev => {
      const u = { ...prev, [field]: val };
      if (field === 'voucher_type') { const r = editId ? entries.filter(e => e.id !== editId) : entries; u.voucher_no = nextNo(r, val); }
      return u;
    });
    if (touched[field]) { setFormErrors(prev => { const u = { ...prev }; const errs = validate({ ...form, [field]: val }); if (errs[field]) u[field] = errs[field]; else delete u[field]; return u; }); }
  };
  const handleBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    const errs = validate(form);
    setFormErrors(p => { const u = { ...p }; if (errs[field]) u[field] = errs[field]; else delete u[field]; return u; });
  };
  const handleSave = () => {
    setTouched({ date: true, debit_category: true, pay_to: true, amount: true });
    const errs = validate(form); setFormErrors(errs);
    if (Object.keys(errs).length > 0) { showToast('Please fix the errors below', 'error'); return; }
    if (editId) { setEntries(p => p.map(e => e.id === editId ? { ...form, id: editId } : e)); showToast('Entry updated successfully'); }
    else { setEntries(p => [...p, { ...form, id: Date.now() }]); showToast('Entry created successfully'); }
    setView('ledger');
  };
  const handleDelete = (id) => { setEntries(p => p.filter(e => e.id !== id)); setDelId(null); showToast('Entry deleted'); };

  // ── Add Payee ────────────────────────────────────────────────────────────────
  const addPayee = () => {
    const name = newPayee.trim().toUpperCase();
    if (!name) { setNewPayeeErr('Please enter a payee name'); return; }
    if (payees.includes(name)) { setNewPayeeErr('This payee already exists'); return; }
    setPayees(p => [...p, name]);
    setForm(p => ({ ...p, pay_to: name }));
    if (touched.pay_to) setFormErrors(p => { const u = { ...p }; delete u.pay_to; return u; });
    setPayeeModal(false); setNewPayee(''); setNewPayeeErr('');
    showToast(`Payee "${name}" added`);
  };

  // ── Add Category ─────────────────────────────────────────────────────────────
  const addCategory = () => {
    const name = newCat.trim().toUpperCase();
    if (!name) { setNewCatErr('Please enter a category name'); return; }
    if (categories.includes(name)) { setNewCatErr('This category already exists'); return; }
    setCategories(p => [...p, name]);
    setForm(p => ({ ...p, debit_category: name }));
    if (touched.debit_category) setFormErrors(p => { const u = { ...p }; delete u.debit_category; return u; });
    setCatModal(false); setNewCat(''); setNewCatErr('');
    showToast(`Category added`);
  };

  // ── Print ─────────────────────────────────────────────────────────────────────
  const handlePrint = (entry) => {
    setPrintEntry(entry);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print();
      setTimeout(() => setPrintEntry(null), 1500);
    }));
  };

  // ── PDF ───────────────────────────────────────────────────────────────────────
  const handleDownload = async (entry) => {
    if (pdfBusy) return;
    setPdfBusy(true); showToast('Generating PDF…', 'info');
    try { await generatePDF(entry, showToast); showToast('PDF downloaded!'); }
    catch (err) { console.error(err); showToast('PDF failed — try Print → Save as PDF', 'error'); }
    finally { setPdfBusy(false); }
  };

  const isErr = (f) => formErrors[f] && touched[f];
  const Err = ({ field }) => isErr(field) ? <div className="emsg"><ErrIcon />{formErrors[field]}</div> : null;

  const PrintArea = (
    <div id="htc-print" style={{ position: 'fixed', left: '-9999px', top: 0, width: '720px', background: '#fff', visibility: 'hidden' }}>
      {printEntry && <div dangerouslySetInnerHTML={{ __html: voucherHtml(printEntry) }} />}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  //  LEDGER VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'ledger') return (
    <div className="app">
      <style>{CSS}</style>
      {PrintArea}
      <div className="hdr">
        <div className="hdr-brand">
          <div className="hdr-ico"><Layers size={18} color="#fff" /></div>
          <div><div className="hdr-t">HAFEEZ TRADING COMPANY</div><div className="hdr-s">Voucher Management System</div></div>
        </div>
        <button className="btnp" onClick={openCreate}><Plus size={14} />New Entry</button>
      </div>

      <div className="stats">
        <div className="sc"><div className="si" style={{ background: '#EFF6FF' }}><Hash size={17} color="#1D4ED8" /></div><div><div className="sl">Total Vouchers</div><div className="sv" style={{ color: '#1F3864' }}>{entries.length}</div></div></div>
        <div className="sc"><div className="si" style={{ background: '#FEF2F2' }}><TrendingDown size={17} color="#DC2626" /></div><div><div className="sl">Total Debit (Rs.)</div><div className="sv" style={{ color: '#991B1B', fontSize: '15px' }}>{fmtAmt(totalD)}</div></div></div>
        <div className="sc"><div className="si" style={{ background: '#F0FDF4' }}><TrendingUp size={17} color="#16A34A" /></div><div><div className="sl">Total Credit (Rs.)</div><div className="sv" style={{ color: '#15803D', fontSize: '15px' }}>{fmtAmt(totalC)}</div></div></div>
        <div className="sc"><div className="si" style={{ background: '#F0F9FF' }}><Layers size={17} color="#0284C7" /></div><div><div className="sl">Net Balance (Rs.)</div><div className="sv" style={{ color: '#0C4A6E', fontSize: '15px' }}>{fmtAmt(Math.abs(totalD - totalC))}</div></div></div>
      </div>

      <div className="main">
        <div className="card">
          <div className="ch">
            <span className="ct">Voucher Ledger — {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}</span>
            <div className="ctrls">
              <div className="sw"><Search size={13} /><input placeholder="Search vouchers…" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <select className="flt" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="All">All Types</option><option>Debit</option><option>Credit</option>
              </select>
              <select className="flt" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <option value="">Sort By…</option>
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amt-desc">Amount (High → Low)</option>
                <option value="amt-asc">Amount (Low → High)</option>
                <option value="type">Type (A → Z)</option>
                <option value="category">Category (A → Z)</option>
                <option value="voucher">Voucher No.</option>
              </select>
              {sortBy && <button className="sort-btn" onClick={() => setSortBy('')} title="Clear sort"><X size={12} />Clear</button>}
            </div>
          </div>

          <table className="lg">
            <thead>
              <tr>{['#', 'Voucher No.', 'Type', 'Date', 'Category', 'Pay To', 'Amount (Rs.)', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {sorted.length === 0
                ? <tr><td colSpan={8}><div className="empty"><FileText size={34} /><p>{search ? `No results for "${search}"` : 'No entries yet. Click New Entry to get started.'}</p></div></td></tr>
                : sorted.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ color: '#cbd5e1', fontSize: '11px' }}>{i + 1}</td>
                    <td><span className="vno">{e.voucher_no}</span></td>
                    <td><span className={`badge ${e.voucher_type === 'Debit' ? 'bd' : 'bc'}`}>{e.voucher_type}</span></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{e.date}</td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }} title={e.debit_category}>{e.debit_category}</td>
                    <td style={{ fontWeight: 500, fontSize: '12px' }}>{e.pay_to}</td>
                    <td className="amc">{fmtAmt(e.amount)}</td>
                    <td>
                      {/* Row 1: Preview, Edit, Print */}
                      <div className="acts">
                        <div className="acts-row">
                          <button title="Preview" className="ab apv" onClick={() => setPreview(e)}><Eye size={12} /></button>
                          <button title="Edit" className="ab aed" onClick={() => openEdit(e)}><Edit2 size={12} /></button>
                          <button title="Print" className="ab apr" onClick={() => handlePrint(e)}><Printer size={12} /></button>
                        </div>
                        {/* Row 2: Download, Delete */}
                        <div className="acts-row">
                          <button title="Download PDF" className="ab adl" onClick={() => handleDownload(e)} disabled={pdfBusy}><Download size={12} /></button>
                          <button title="Delete" className="ab adx" onClick={() => setDelId(e.id)}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
            {sorted.length > 0 && <tfoot><tr>
              <td colSpan={6} style={{ textAlign: 'right', fontSize: '11px', letterSpacing: '.04em' }}>FILTERED TOTAL</td>
              <td className="amc">{fmtAmt(sorted.reduce((s, e) => s + (+e.amount || 0), 0))}</td>
              <td></td>
            </tr></tfoot>}
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && <div className="ov" onClick={() => setPreview(null)}>
        <div className="modal" onClick={ev => ev.stopPropagation()}>
          <div className="mh">
            <div>
              <div className="mt2">Voucher Preview — {preview.voucher_no}</div>
              <div className="ms">{preview.pay_to} · Rs. {fmtAmt(preview.amount)}</div>
            </div>
            <button className="mx" onClick={() => setPreview(null)}><X size={18} /></button>
          </div>
          <div className="mb"><div dangerouslySetInnerHTML={{ __html: voucherHtml(preview) }} /></div>
          <div className="mf">
            <button className="btnc" onClick={() => setPreview(null)}>Close</button>
            <button className="btnp gn" onClick={() => { setPreview(null); setTimeout(() => handlePrint(preview), 120); }}><Printer size={13} />Print</button>
            <button className="btnp tl" onClick={() => handleDownload(preview)} disabled={pdfBusy}><Download size={13} />{pdfBusy ? 'Generating…' : 'Download PDF'}</button>
          </div>
        </div>
      </div>}

      {/* Delete Confirm */}
      {delId && <div className="ov" onClick={() => setDelId(null)}>
        <div className="conf" onClick={ev => ev.stopPropagation()}>
          <h3>Delete Voucher Entry</h3>
          <p>This voucher will be permanently deleted and cannot be recovered.</p>
          <div className="cbts">
            <button className="btnc" onClick={() => setDelId(null)}>Cancel</button>
            <button className="btnd" onClick={() => handleDelete(delId)}>Yes, Delete</button>
          </div>
        </div>
      </div>}

      {toast && <div className="toast" style={{ background: toast.type === 'error' ? '#DC2626' : toast.type === 'info' ? '#1F3864' : '#15803D' }}>{toast.msg}</div>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  //  FORM VIEW
  // ════════════════════════════════════════════════════════════════════════════
  const { rs: dRs, ps: dPs } = parseAmt(form.amount);
  return (
    <div className="app">
      <style>{CSS}</style>
      {PrintArea}
      <div className="hdr">
        <div className="hdr-brand">
          <div className="hdr-ico"><Layers size={18} color="#fff" /></div>
          <div><div className="hdr-t">HAFEEZ TRADING COMPANY</div><div className="hdr-s">Voucher Management System</div></div>
        </div>
      </div>
      <div className="main">
        <div className="fw">
          <button className="bk" onClick={() => setView('ledger')}><ArrowLeft size={13} />Back to Ledger</button>
          <div className="fc">
            <div className="fh">
              <h2>{editId ? 'Edit Voucher Entry' : 'New Voucher Entry'}</h2>
              <p>Fields marked * are required</p>
            </div>
            <div className="fb">

              {/* ── Section 1: Identity ── */}
              <div className="fs">
                <div className="fst">Voucher Identity</div>
                <div className="fg2">
                  <div className="fgrp">
                    <label>Voucher Type *</label>
                    <select value={form.voucher_type} onChange={e => handleChange('voucher_type', e.target.value)}>
                      <option>Debit</option><option>Credit</option>
                    </select>
                  </div>
                  <div className="fgrp">
                    <label>Voucher No. (Auto)</label>
                    <input className="ro" value={form.voucher_no} readOnly />
                  </div>
                  <div className="fgrp">
                    <label>Date *</label>
                    <input type="date" className={isErr('date') ? 'ei' : ''} value={toPicker(form.date)} onChange={e => handleChange('date', fromPicker(e.target.value))} onBlur={() => handleBlur('date')} />
                    <Err field="date" />
                  </div>
                  <div className="fgrp">
                    <label>Category *</label>
                    <div className="sel-row">
                      <select className={isErr('debit_category') ? 'ei' : ''} value={form.debit_category} onChange={e => handleChange('debit_category', e.target.value)} onBlur={() => handleBlur('debit_category')}>
                        <option value="">— Select category —</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button type="button" className="add-btn" onClick={() => { setNewCat(''); setNewCatErr(''); setCatModal(true); }}><Tag size={12} />New</button>
                    </div>
                    <Err field="debit_category" />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Party, Amount & References ── */}
              <div className="fs">
                <div className="fst">Party, Amount & References</div>

                {/* Pay To — full width */}
                <div className="fg2" style={{ marginBottom: '14px' }}>
                  <div className="fgrp ff">
                    <label>Pay To (Payee) *</label>
                    <div className="sel-row">
                      <select className={isErr('pay_to') ? 'ei' : ''} value={form.pay_to} onChange={e => handleChange('pay_to', e.target.value)} onBlur={() => handleBlur('pay_to')}>
                        <option value="">— Select payee —</option>
                        {payees.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button type="button" className="add-btn" onClick={() => { setNewPayee(''); setNewPayeeErr(''); setPayeeModal(true); }}><UserPlus size={12} />New</button>
                    </div>
                    <Err field="pay_to" />
                  </div>
                </div>

                {/* Amount · L/C · Bill — same row (3 cols) */}
                <div className="fg3" style={{ marginBottom: '14px' }}>
                  <div className="fgrp">
                    <label>Amount * (e.g. 92150.25)</label>
                    <input
                      type="number" min="0.01" step="0.01" placeholder="0.00"
                      className={isErr('amount') ? 'ei' : ''}
                      value={form.amount}
                      onChange={e => handleChange('amount', e.target.value)}
                      onBlur={() => handleBlur('amount')}
                    />
                    {form.amount && +form.amount > 0 && (
                      <div className="amt-derived">
                        <div><span>Rs.</span>{dRs.toLocaleString('en-US')}</div>
                        <div><span>Ps.</span>{String(dPs).padStart(2, '0')}</div>
                      </div>
                    )}
                    <Err field="amount" />
                  </div>
                  <div className="fgrp">
                    <label>L/C Number</label>
                    <input placeholder="e.g. LCU/1/30/1945" value={form.lc_number} onChange={e => handleChange('lc_number', e.target.value)} />
                  </div>
                  <div className="fgrp">
                    <label>Bill / Invoice No.</label>
                    <input placeholder="e.g. 0149" value={form.bill_no} onChange={e => handleChange('bill_no', e.target.value)} />
                  </div>
                </div>

                {/* Item description — full width */}
                <div className="fg2">
                  <div className="fgrp ff">
                    <label>Item Description</label>
                    <textarea placeholder="Quantity, item name, bond details, clearing info…" value={form.item_description} onChange={e => handleChange('item_description', e.target.value)} />
                  </div>
                </div>

                {form.amount && +form.amount > 0 && (
                  <div className="wp" style={{ marginTop: '12px' }}>
                    <strong>RUPEES</strong>&nbsp;&nbsp;<u>{numToWords(dRs)}</u>
                  </div>
                )}
              </div>

            </div>
            <div className="fa">
              <button className="btnc" onClick={() => setView('ledger')}>Cancel</button>
              <button className="btns" onClick={handleSave}>{editId ? 'Update Entry' : 'Create Entry'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Payee Modal ── */}
      {payeeModal && <div className="ov" onClick={() => setPayeeModal(false)}>
        <div className="sm" onClick={ev => ev.stopPropagation()}>
          <div className="sm-h"><h3>Add New Payee</h3><button className="mx" onClick={() => setPayeeModal(false)}><X size={16} /></button></div>
          <div className="sm-b">
            <label>Payee / Vendor Name *</label>
            <input autoFocus placeholder="e.g. ANWER ASGHAR BROTHERS" value={newPayee} onChange={e => { setNewPayee(e.target.value); setNewPayeeErr(''); }} onKeyDown={e => e.key === 'Enter' && addPayee()} style={newPayeeErr ? { borderColor: '#DC2626' } : {}} />
            {newPayeeErr && <div className="emsg" style={{ marginTop: '5px' }}><ErrIcon />{newPayeeErr}</div>}
          </div>
          <div className="sm-f"><button className="btnc" onClick={() => setPayeeModal(false)}>Cancel</button><button className="btns" onClick={addPayee}>Add Payee</button></div>
        </div>
      </div>}

      {/* ── Add Category Modal ── */}
      {catModal && <div className="ov" onClick={() => setCatModal(false)}>
        <div className="sm" onClick={ev => ev.stopPropagation()}>
          <div className="sm-h"><h3>Add New Category</h3><button className="mx" onClick={() => setCatModal(false)}><X size={16} /></button></div>
          <div className="sm-b">
            <label>Category / Account Name *</label>
            <input autoFocus placeholder="e.g. MACHINERY UNDER FREE LIST IMPORT" value={newCat} onChange={e => { setNewCat(e.target.value); setNewCatErr(''); }} onKeyDown={e => e.key === 'Enter' && addCategory()} style={newCatErr ? { borderColor: '#DC2626' } : {}} />
            {newCatErr && <div className="emsg" style={{ marginTop: '5px' }}><ErrIcon />{newCatErr}</div>}
          </div>
          <div className="sm-f"><button className="btnc" onClick={() => setCatModal(false)}>Cancel</button><button className="btns" onClick={addCategory}>Add Category</button></div>
        </div>
      </div>}

      {toast && <div className="toast" style={{ background: toast.type === 'error' ? '#DC2626' : toast.type === 'info' ? '#1F3864' : '#15803D' }}>{toast.msg}</div>}
    </div>
  );
}