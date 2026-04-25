import { parseAmt, numToWords } from '../utils/amount';

export function voucherHtml(e) {
  const { rs, ps } = parseAmt(e.amount);
  const rsStr = rs.toLocaleString('en-US');
  const psStr = String(ps).padStart(2, '0');
  const words = numToWords(rs);
  const isD = e.voucher_type === 'Debit';

  const narLines = [
    'BEING THE AMOUNT CHARGED BY THE ABOVE AS',
    e.item_description || '',
    [
      e.lc_number ? `IMPORT UNDER L/C NO. ${e.lc_number}` : '',
      e.bill_no ? `AS PER BILL NO. ${e.bill_no}` : '',
    ].filter(Boolean).join('  '),
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
