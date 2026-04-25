import { useState } from 'react';
import { ArrowLeft, UserPlus, Tag } from 'lucide-react';
import { useTopBar } from '../../hooks/useTopBar';
import { parseAmt, numToWords } from '../../utils/amount';
import { toPicker, fromPicker, todayYMD } from '../../utils/date';
import { nextNo, validate } from '../../utils/voucher';
import { EMPTY } from '../../constants/seed';
import ErrIcon from '../../components/ErrIcon';
import AddPayeeModal from '../../components/modals/AddPayeeModal';
import AddCategoryModal from '../../components/modals/AddCategoryModal';
import '../../styles/form.css';

export default function VoucherForm({
  editEntry,
  entries,
  categories,
  payees,
  onCancel,
  onSave,
  onAddPayee,
  onAddCategory,
  showToast,
}) {
  const editId = editEntry?.id ?? null;

  const [form, setForm] = useState(() => {
    if (editEntry) return { ...editEntry };
    return { ...EMPTY, date: fromPicker(todayYMD()), voucher_no: nextNo(entries, 'Debit') };
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [payeeModal, setPayeeModal] = useState(false);
  const [catModal, setCatModal] = useState(false);

  useTopBar(editId ? 'Edit Voucher' : 'New Voucher', null, [editId]);

  const handleChange = (field, val) => {
    setForm(prev => {
      const u = { ...prev, [field]: val };
      if (field === 'voucher_type') {
        const r = editId ? entries.filter(e => e.id !== editId) : entries;
        u.voucher_no = nextNo(r, val);
      }
      return u;
    });
    if (touched[field]) {
      setFormErrors(prev => {
        const u = { ...prev };
        const errs = validate({ ...form, [field]: val });
        if (errs[field]) u[field] = errs[field];
        else delete u[field];
        return u;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    const errs = validate(form);
    setFormErrors(p => {
      const u = { ...p };
      if (errs[field]) u[field] = errs[field];
      else delete u[field];
      return u;
    });
  };

  const handleSave = () => {
    setTouched({ date: true, debit_category: true, pay_to: true, amount: true });
    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast('Please fix the errors below', 'error');
      return;
    }
    onSave(form, editId);
  };

  const submitPayee = (name) => {
    onAddPayee(name);
    setForm(p => ({ ...p, pay_to: name }));
    if (touched.pay_to) {
      setFormErrors(p => { const u = { ...p }; delete u.pay_to; return u; });
    }
    setPayeeModal(false);
    showToast(`Payee "${name}" added`);
  };

  const submitCategory = (name) => {
    onAddCategory(name);
    setForm(p => ({ ...p, debit_category: name }));
    if (touched.debit_category) {
      setFormErrors(p => { const u = { ...p }; delete u.debit_category; return u; });
    }
    setCatModal(false);
    showToast('Category added');
  };

  const isErr = (f) => formErrors[f] && touched[f];
  const renderErr = (field) => isErr(field)
    ? <div className="emsg"><ErrIcon />{formErrors[field]}</div>
    : null;

  const { rs: dRs, ps: dPs } = parseAmt(form.amount);

  return (
    <div className="fw">
      <button className="bk" onClick={onCancel}>
        <ArrowLeft size={13} />Back to Ledger
      </button>

      <div className="fc">
        <div className="fh">
          <h2>{editId ? 'Edit Voucher Entry' : 'New Voucher Entry'}</h2>
          <p>Fields marked * are required</p>
        </div>
        <div className="fb">

          <div className="fs">
            <div className="fst">Voucher Identity</div>
            <div className="fg2">
              <div className="fgrp">
                <label>Voucher Type *</label>
                <select value={form.voucher_type} onChange={e => handleChange('voucher_type', e.target.value)}>
                  <option>Debit</option>
                  <option>Credit</option>
                </select>
              </div>
              <div className="fgrp">
                <label>Voucher No. (Auto)</label>
                <input className="ro" value={form.voucher_no} readOnly />
              </div>
              <div className="fgrp">
                <label>Date *</label>
                <input
                  type="date"
                  className={isErr('date') ? 'ei' : ''}
                  value={toPicker(form.date)}
                  onChange={e => handleChange('date', fromPicker(e.target.value))}
                  onBlur={() => handleBlur('date')}
                />
                {renderErr("date")}
              </div>
              <div className="fgrp">
                <label>Category *</label>
                <div className="sel-row">
                  <select
                    className={isErr('debit_category') ? 'ei' : ''}
                    value={form.debit_category}
                    onChange={e => handleChange('debit_category', e.target.value)}
                    onBlur={() => handleBlur('debit_category')}
                  >
                    <option value="">— Select category —</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" className="add-btn" onClick={() => setCatModal(true)}>
                    <Tag size={12} />New
                  </button>
                </div>
                {renderErr("debit_category")}
              </div>
            </div>
          </div>

          <div className="fs">
            <div className="fst">Party, Amount & References</div>

            <div className="fg2" style={{ marginBottom: '14px' }}>
              <div className="fgrp ff">
                <label>Pay To (Payee) *</label>
                <div className="sel-row">
                  <select
                    className={isErr('pay_to') ? 'ei' : ''}
                    value={form.pay_to}
                    onChange={e => handleChange('pay_to', e.target.value)}
                    onBlur={() => handleBlur('pay_to')}
                  >
                    <option value="">— Select payee —</option>
                    {payees.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button type="button" className="add-btn" onClick={() => setPayeeModal(true)}>
                    <UserPlus size={12} />New
                  </button>
                </div>
                {renderErr("pay_to")}
              </div>
            </div>

            <div className="fg3" style={{ marginBottom: '14px' }}>
              <div className="fgrp">
                <label>Amount * (e.g. 92150.25)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
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
                {renderErr("amount")}
              </div>
              <div className="fgrp">
                <label>L/C Number</label>
                <input
                  placeholder="e.g. LCU/1/30/1945"
                  value={form.lc_number}
                  onChange={e => handleChange('lc_number', e.target.value)}
                />
              </div>
              <div className="fgrp">
                <label>Bill / Invoice No.</label>
                <input
                  placeholder="e.g. 0149"
                  value={form.bill_no}
                  onChange={e => handleChange('bill_no', e.target.value)}
                />
              </div>
            </div>

            <div className="fg2">
              <div className="fgrp ff">
                <label>Item Description</label>
                <textarea
                  placeholder="Quantity, item name, bond details, clearing info…"
                  value={form.item_description}
                  onChange={e => handleChange('item_description', e.target.value)}
                />
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
          <button className="btnc" onClick={onCancel}>Cancel</button>
          <button className="btns" onClick={handleSave}>
            {editId ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>

      <AddPayeeModal
        open={payeeModal}
        existing={payees}
        onClose={() => setPayeeModal(false)}
        onAdd={submitPayee}
      />
      <AddCategoryModal
        open={catModal}
        existing={categories}
        onClose={() => setCatModal(false)}
        onAdd={submitCategory}
      />
    </div>
  );
}
