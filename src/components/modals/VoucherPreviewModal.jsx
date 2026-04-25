import { Printer, Download, X } from 'lucide-react';
import { voucherHtml } from '../../services/voucherHtml';
import { fmtAmt } from '../../utils/amount';

export default function VoucherPreviewModal({ entry, pdfBusy, onClose, onPrint, onDownload }) {
  if (!entry) return null;
  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={ev => ev.stopPropagation()}>
        <div className="mh">
          <div>
            <div className="mt2">Voucher Preview — {entry.voucher_no}</div>
            <div className="ms">{entry.pay_to} · Rs. {fmtAmt(entry.amount)}</div>
          </div>
          <button className="mx" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mb">
          <div dangerouslySetInnerHTML={{ __html: voucherHtml(entry) }} />
        </div>
        <div className="mf">
          <button className="btnc" onClick={onClose}>Close</button>
          <button
            className="btnp gn"
            onClick={() => {
              onClose();
              setTimeout(() => onPrint(entry), 120);
            }}
          >
            <Printer size={13} />Print
          </button>
          <button className="btnp tl" onClick={() => onDownload(entry)} disabled={pdfBusy}>
            <Download size={13} />{pdfBusy ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
