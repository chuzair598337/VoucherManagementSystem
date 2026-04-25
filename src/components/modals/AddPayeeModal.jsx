import { useState } from 'react';
import { X } from 'lucide-react';
import ErrIcon from '../ErrIcon';

export default function AddPayeeModal({ open, existing, onClose, onAdd }) {
  const [value, setValue] = useState('');
  const [err, setErr] = useState('');

  if (!open) return null;

  const close = () => { setValue(''); setErr(''); onClose(); };

  const submit = () => {
    const name = value.trim().toUpperCase();
    if (!name) { setErr('Please enter a payee name'); return; }
    if (existing.includes(name)) { setErr('This payee already exists'); return; }
    onAdd(name);
    setValue('');
    setErr('');
  };

  return (
    <div className="ov" onClick={close}>
      <div className="sm" onClick={ev => ev.stopPropagation()}>
        <div className="sm-h">
          <h3>Add New Payee</h3>
          <button className="mx" onClick={close}><X size={16} /></button>
        </div>
        <div className="sm-b">
          <label>Payee / Vendor Name *</label>
          <input
            autoFocus
            placeholder="e.g. ANWER ASGHAR BROTHERS"
            value={value}
            onChange={e => { setValue(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={err ? { borderColor: '#DC2626' } : {}}
          />
          {err && <div className="emsg" style={{ marginTop: '5px' }}><ErrIcon />{err}</div>}
        </div>
        <div className="sm-f">
          <button className="btnc" onClick={close}>Cancel</button>
          <button className="btns" onClick={submit}>Add Payee</button>
        </div>
      </div>
    </div>
  );
}
