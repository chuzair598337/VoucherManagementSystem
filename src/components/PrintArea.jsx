import { voucherHtml } from '../services/voucherHtml';

export default function PrintArea({ entry }) {
  return (
    <div
      id="htc-print"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '720px',
        background: '#fff',
        visibility: 'hidden',
      }}
    >
      {entry && <div dangerouslySetInnerHTML={{ __html: voucherHtml(entry) }} />}
    </div>
  );
}
