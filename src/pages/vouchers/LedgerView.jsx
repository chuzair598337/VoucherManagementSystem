import { useMemo, useState } from 'react';
import {
  Plus, Edit2, Trash2, Eye, Printer, Download, Search, TrendingDown, TrendingUp,
  Hash, Layers, FileText, X,
} from 'lucide-react';
import { useTopBar } from '../../hooks/useTopBar';
import { fmtAmt } from '../../utils/amount';
import { dateToTs } from '../../utils/date';
import VoucherPreviewModal from '../../components/modals/VoucherPreviewModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import '../../styles/ledger.css';

export default function LedgerView({
  entries,
  pdfBusy,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onPrint,
  onDownload,
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [preview, setPreview] = useState(null);
  const [delId, setDelId] = useState(null);

  useTopBar(
    'Vouchers',
    (
      <button className="btnp" onClick={onOpenCreate}>
        <Plus size={14} />New Entry
      </button>
    ),
    [onOpenCreate],
  );

  const filtered = useMemo(() => entries.filter(e => {
    const okT = typeFilter === 'All' || e.voucher_type === typeFilter;
    const q = search.toLowerCase();
    const okQ = !q || [e.voucher_no, e.pay_to, e.debit_category, e.bill_no, e.lc_number]
      .some(f => (f || '').toLowerCase().includes(q));
    return okT && okQ;
  }), [entries, typeFilter, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
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
    return arr;
  }, [filtered, sortBy]);

  const totalD = entries.filter(e => e.voucher_type === 'Debit')
    .reduce((s, e) => s + (+e.amount || 0), 0);
  const totalC = entries.filter(e => e.voucher_type === 'Credit')
    .reduce((s, e) => s + (+e.amount || 0), 0);

  const confirmDelete = () => {
    onDelete(delId);
    setDelId(null);
  };

  return (
    <div>
      <div className="stats">
        <div className="sc">
          <div className="si" style={{ background: '#EFF6FF' }}><Hash size={17} color="#1D4ED8" /></div>
          <div>
            <div className="sl">Total Vouchers</div>
            <div className="sv" style={{ color: '#1F3864' }}>{entries.length}</div>
          </div>
        </div>
        <div className="sc">
          <div className="si" style={{ background: '#FEF2F2' }}><TrendingDown size={17} color="#DC2626" /></div>
          <div>
            <div className="sl">Total Debit (Rs.)</div>
            <div className="sv" style={{ color: '#991B1B', fontSize: '15px' }}>{fmtAmt(totalD)}</div>
          </div>
        </div>
        <div className="sc">
          <div className="si" style={{ background: '#F0FDF4' }}><TrendingUp size={17} color="#16A34A" /></div>
          <div>
            <div className="sl">Total Credit (Rs.)</div>
            <div className="sv" style={{ color: '#15803D', fontSize: '15px' }}>{fmtAmt(totalC)}</div>
          </div>
        </div>
        <div className="sc">
          <div className="si" style={{ background: '#F0F9FF' }}><Layers size={17} color="#0284C7" /></div>
          <div>
            <div className="sl">Net Balance (Rs.)</div>
            <div className="sv" style={{ color: '#0C4A6E', fontSize: '15px' }}>{fmtAmt(Math.abs(totalD - totalC))}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ch">
          <span className="ct">Voucher Ledger — {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}</span>
          <div className="ctrls">
            <div className="sw">
              <Search size={13} />
              <input placeholder="Search vouchers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="flt" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option>Debit</option>
              <option>Credit</option>
            </select>
            <select className="flt" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="">Sort By…</option>
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amt-desc">Amount (High → Low)</option>
              <option value="amt-asc">Amount (Low → High)</option>
              <option value="type">Type (A → Z)</option>
              <option value="category">Category (A → Z)</option>
              <option value="voucher">Voucher No.</option>
            </select>
            {sortBy && (
              <button className="sort-btn" onClick={() => setSortBy('')} title="Clear sort">
                <X size={12} />Clear
              </button>
            )}
          </div>
        </div>

        <table className="lg">
          <thead>
            <tr>
              {['#', 'Voucher No.', 'Type', 'Date', 'Category', 'Pay To', 'Amount (Rs.)', 'Actions']
                .map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty">
                    <FileText size={34} />
                    <p>{search ? `No results for "${search}"` : 'No entries yet. Click New Entry to get started.'}</p>
                  </div>
                </td>
              </tr>
            ) : sorted.map((e, i) => (
              <tr key={e.id}>
                <td style={{ color: '#cbd5e1', fontSize: '11px' }}>{i + 1}</td>
                <td><span className="vno">{e.voucher_no}</span></td>
                <td><span className={`badge ${e.voucher_type === 'Debit' ? 'bd' : 'bc'}`}>{e.voucher_type}</span></td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{e.date}</td>
                <td
                  style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}
                  title={e.debit_category}
                >
                  {e.debit_category}
                </td>
                <td style={{ fontWeight: 500, fontSize: '12px' }}>{e.pay_to}</td>
                <td className="amc">{fmtAmt(e.amount)}</td>
                <td>
                  <div className="acts">
                    <div className="acts-row">
                      <button title="Preview" className="ab apv" onClick={() => setPreview(e)}><Eye size={12} /></button>
                      <button title="Edit" className="ab aed" onClick={() => onOpenEdit(e)}><Edit2 size={12} /></button>
                      <button title="Print" className="ab apr" onClick={() => onPrint(e)}><Printer size={12} /></button>
                    </div>
                    <div className="acts-row">
                      <button title="Download PDF" className="ab adl" onClick={() => onDownload(e)} disabled={pdfBusy}>
                        <Download size={12} />
                      </button>
                      <button title="Delete" className="ab adx" onClick={() => setDelId(e.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontSize: '11px', letterSpacing: '.04em' }}>FILTERED TOTAL</td>
                <td className="amc">{fmtAmt(sorted.reduce((s, e) => s + (+e.amount || 0), 0))}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <VoucherPreviewModal
        entry={preview}
        pdfBusy={pdfBusy}
        onClose={() => setPreview(null)}
        onPrint={onPrint}
        onDownload={onDownload}
      />
      <DeleteConfirmModal
        open={delId !== null}
        onCancel={() => setDelId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
