const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');

// ─── Self-contained helpers (copied from src/utils/amount.js) ─────────────
function parseAmt(val) {
  const n = parseFloat(val) || 0;
  const rs = Math.floor(n);
  const ps = Math.round((n - rs) * 100);
  return { rs, ps };
}

function numToWords(n) {
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

function sanitizePayee(name) {
  const cleaned = String(name || '').replace(/[\\/:*?"<>|]/g, '-').trim();
  return cleaned || 'UNKNOWN-PAYEE';
}

// ─── PDF generation (programmatic jsPDF, mirrors src/services/pdf.js) ─────
function buildVoucherPDF(entry) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const ml = 14;
  const pw = 182;
  let y = 14;

  const NAVY = [31, 56, 100];
  const LBLUE = [217, 238, 247];
  const LGREY = [240, 240, 240];
  const YELLOW = [255, 242, 204];
  const WHITE = [255, 255, 255];
  const BLACK = [0, 0, 0];
  const GOLD = [127, 96, 0];

  const { rs, ps } = parseAmt(entry.amount);
  const rsStr = rs.toLocaleString('en-US');
  const psStr = String(ps).padStart(2, '0');
  const words = numToWords(rs);
  const isD = entry.voucher_type === 'Debit';

  function cell(x, cy, w, h, bg, text, tc, sz, bold, align = 'left', pad = 2) {
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(x, cy, w, h, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.25);
    doc.rect(x, cy, w, h, 'S');
    if (text) {
      doc.setTextColor(tc[0], tc[1], tc[2]);
      doc.setFontSize(sz);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const mx = w - pad * 2;
      const lines = doc.splitTextToSize(String(text), mx);
      const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w - pad : x + pad;
      doc.text(lines[0] || '', tx, cy + h / 2, { align, baseline: 'middle' });
    }
  }

  const noW = 22;
  const noVW = 28;
  const labW = 22;
  const amtW = 22;
  const psW = 18;
  const bodyW = pw - noW - noVW;
  const catW = bodyW - labW;
  const descW = pw - amtW - psW;

  // Row 1 — Company header
  cell(ml, y, pw, 10, NAVY, 'HAFEEZ TRADING COMPANY', WHITE, 13, true, 'center'); y += 10;

  // Row 2 — Title row
  cell(ml, y, bodyW, 8, LBLUE, `${isD ? 'DEBIT' : 'CREDIT'} VOUCHER`, NAVY, 11, true, 'center');
  cell(ml + bodyW, y, noW, 8, LGREY, 'NO.', NAVY, 7, true, 'center');
  cell(ml + bodyW + noW, y, noVW, 8, WHITE, entry.voucher_no || '', BLACK, 8, true, 'center'); y += 8;

  // Row 3 — Type / Category / Date
  cell(ml, y, labW, 7, LGREY, isD ? 'DEBIT' : 'CREDIT', NAVY, 6, true, 'center');
  cell(ml + labW, y, catW, 7, LBLUE, entry.debit_category || '', NAVY, 6, true, 'left');
  cell(ml + bodyW, y, noW, 7, LGREY, 'DATE', NAVY, 6, true, 'center');
  cell(ml + bodyW + noW, y, noVW, 7, WHITE, entry.date || '', BLACK, 7, false, 'center'); y += 7;

  // Row 4 — Rs./Ps. column headers
  cell(ml, y, descW, 5, WHITE, '', WHITE, 1, false);
  cell(ml + descW, y, amtW, 5, LGREY, 'Rs.', NAVY, 6, true, 'center');
  cell(ml + descW + amtW, y, psW, 5, LGREY, 'Ps.', NAVY, 6, true, 'center'); y += 5;

  // Row 5 — PAY TO
  cell(ml, y, labW, 8, LGREY, 'PAY TO', NAVY, 6, true, 'center');
  cell(ml + labW, y, catW, 8, LBLUE, entry.pay_to || '', NAVY, 7.5, true, 'left');
  cell(ml + descW, y, amtW, 8, WHITE, rsStr, BLACK, 9, true, 'right');
  cell(ml + descW + amtW, y, psW, 8, WHITE, psStr, BLACK, 8, false, 'center'); y += 8;

  // Row 6 — Narration block
  const narLines = [
    'BEING THE AMOUNT CHARGED BY THE ABOVE AS',
    entry.item_description || '',
    [
      entry.lc_number ? `IMPORT UNDER L/C NO. ${entry.lc_number}` : '',
      entry.bill_no ? `AS PER BILL NO. ${entry.bill_no}` : '',
    ].filter(Boolean).join('  '),
  ].filter(Boolean);
  const narH = Math.max(20, narLines.length * 6 + 6);
  doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.rect(ml, y, descW, narH, 'F');
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.25);
  doc.rect(ml, y, descW, narH, 'S');
  doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  narLines.forEach((line, i) => {
    if (line) doc.text(doc.splitTextToSize(line, descW - 4)[0] || '', ml + 2, y + 6 + i * 6);
  });
  cell(ml + descW, y, amtW + psW, narH, WHITE, '', WHITE, 1, false);
  y += narH;

  // Row 7 — TOTAL
  cell(ml, y, descW, 8, LBLUE, 'TOTAL', NAVY, 10, true, 'right');
  cell(ml + descW, y, amtW, 8, LBLUE, rsStr, NAVY, 10, true, 'right');
  cell(ml + descW + amtW, y, psW, 8, LBLUE, psStr, NAVY, 9, true, 'center'); y += 8;

  // Row 8 — RUPEES in words
  doc.setFillColor(YELLOW[0], YELLOW[1], YELLOW[2]);
  doc.rect(ml, y, pw, 8, 'F');
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.25);
  doc.rect(ml, y, pw, 8, 'S');
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('RUPEES', ml + 2, y + 4, { baseline: 'middle' });
  doc.setFont('helvetica', 'normal');
  const wordsLine = doc.splitTextToSize(words, pw - 22)[0] || '';
  doc.text(wordsLine, ml + 20, y + 4, { baseline: 'middle' });
  y += 8;

  // Row 9 — Signatures
  const sw = pw / 3;
  ['PAYMENT RECEIVED', 'ACCOUNTANT / CASHIER', 'PASSED FOR PAYMENT'].forEach((lbl, i) => {
    cell(ml + i * sw, y, sw, 14, LGREY, lbl, NAVY, 7, true, 'center');
  });

  return doc;
}

// ─── BrowserWindow ────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── IPC: save-voucher-pdf ────────────────────────────────────────────────
ipcMain.handle('save-voucher-pdf', async (_event, voucherData) => {
  try {
    const {
      voucher_no,
      voucher_type,
      pay_to,
    } = voucherData;

    const safeName = sanitizePayee(pay_to);

    const dirPath = path.join(
      app.getPath('documents'),
      'VoucherDoc',
      safeName,
      voucher_type,
    );
    fs.mkdirSync(dirPath, { recursive: true });

    const fileName = `${voucher_no}.pdf`;
    const filePath = path.join(dirPath, fileName);

    const doc = buildVoucherPDF(voucherData);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filePath, pdfBuffer);

    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
