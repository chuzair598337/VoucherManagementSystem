import { useCallback, useState } from 'react';
import { INIT_CATS, INIT_PAYEES, SAMPLE } from '../../constants/seed';
import { generatePDF, printVoucher } from '../../services/pdf';
import LedgerView from './LedgerView';
import VoucherForm from './VoucherForm';

export default function VouchersPage({ showToast }) {
  const [entries, setEntries] = useState(SAMPLE);
  const [categories, setCategories] = useState(INIT_CATS);
  const [payees, setPayees] = useState(INIT_PAYEES);
  const [view, setView] = useState('ledger');
  const [editEntry, setEditEntry] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const openCreate = useCallback(() => {
    setEditEntry(null);
    setView('form');
  }, []);

  const openEdit = useCallback((entry) => {
    setEditEntry(entry);
    setView('form');
  }, []);

  const cancelForm = useCallback(() => {
    setView('ledger');
    setEditEntry(null);
  }, []);

  const saveEntry = useCallback((form, editId) => {
    if (editId) {
      setEntries(p => p.map(e => e.id === editId ? { ...form, id: editId } : e));
      showToast('Entry updated successfully');
    } else {
      setEntries(p => [...p, { ...form, id: Date.now() }]);
      showToast('Entry created successfully');
    }

    // ── Electron: auto-save PDF to VoucherDoc directory ──
    const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    if (isElectron) {
      const entryForPDF = editId
        ? { ...form, id: editId }
        : { ...form, id: Date.now() };

      window.electronAPI.saveVoucherPDF(entryForPDF)
        .then(result => {
          if (result.success) {
            showToast(`PDF saved → VoucherDoc/${form.pay_to}/${form.voucher_type}`, 'info');
          } else {
            showToast(`Auto-save failed: ${result.error}`, 'error');
          }
        })
        .catch(() => showToast('Auto-save failed', 'error'));
    }

    setView('ledger');
    setEditEntry(null);
  }, [showToast]);

  const deleteEntry = useCallback((id) => {
    setEntries(p => p.filter(e => e.id !== id));
    showToast('Entry deleted');
  }, [showToast]);

  const addPayee = useCallback((name) => {
    setPayees(p => p.includes(name) ? p : [...p, name]);
  }, []);

  const addCategory = useCallback((name) => {
    setCategories(p => p.includes(name) ? p : [...p, name]);
  }, []);

  const handlePrint = useCallback(async (entry) => {
    if (pdfBusy) return;
    setPdfBusy(true);
    showToast('Preparing print…', 'info');
    try {
      await printVoucher(entry, showToast);
    } catch (err) {
      console.error(err);
      showToast('Print failed', 'error');
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy, showToast]);

  const handleDownload = useCallback(async (entry) => {
    if (pdfBusy) return;
    setPdfBusy(true);
    showToast('Generating PDF…', 'info');
    try {
      await generatePDF(entry, showToast);
      showToast('PDF downloaded!');
    } catch (err) {
      console.error(err);
      showToast('PDF failed — try Print → Save as PDF', 'error');
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy, showToast]);

  if (view === 'form') {
    return (
      <VoucherForm
        editEntry={editEntry}
        entries={entries}
        categories={categories}
        payees={payees}
        onCancel={cancelForm}
        onSave={saveEntry}
        onAddPayee={addPayee}
        onAddCategory={addCategory}
        showToast={showToast}
      />
    );
  }

  return (
    <LedgerView
      entries={entries}
      pdfBusy={pdfBusy}
      onOpenCreate={openCreate}
      onOpenEdit={openEdit}
      onDelete={deleteEntry}
      onPrint={handlePrint}
      onDownload={handleDownload}
    />
  );
}
