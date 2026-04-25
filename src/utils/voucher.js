export function nextNo(entries, type) {
  const p = type === 'Debit' ? 'DV' : 'CV';
  const nums = entries
    .filter(e => e.voucher_type === type)
    .map(e => parseInt((e.voucher_no || '0').split('-')[1]) || 0);
  return `${p}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
}

export function validate(form) {
  const e = {};
  if (!form.date) e.date = 'Date is required';
  if (!form.debit_category) e.debit_category = 'Category is required';
  if (!form.pay_to) e.pay_to = 'Payee is required';
  if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) e.amount = 'Enter a valid amount greater than 0';
  return e;
}
