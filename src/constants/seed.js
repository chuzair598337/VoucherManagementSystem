export const INIT_CATS = [
  'CHEMICALS UNDER FREE LIST IMPORT',
  'DYES UNDER FREE LIST IMPORT',
  'TEXTILES UNDER FREE LIST IMPORT',
  'PHARMACEUTICALS UNDER FREE LIST IMPORT',
  'MACHINERY & EQUIPMENT IMPORT',
  'RAW MATERIALS IMPORT',
  'CLEARING & FORWARDING CHARGES',
  'IMPORT DUTIES & LEVIES',
  'FREIGHT & TRANSPORTATION',
  'GENERAL PAYABLES',
  'GENERAL RECEIVABLES',
  'BANK CHARGES',
  'OTHER',
];

export const INIT_PAYEES = [
  'ANWER ASGHAR BROTHERS',
  'TARIQ ENTERPRISES',
  'HASSAN FABRICS LTD',
  'NATIONAL CLEARING AGENTS',
  'KARACHI PORT TRUST',
];

export const SAMPLE = [
  { id: 1, voucher_no: 'DV-001', voucher_type: 'Debit', date: '13.01.2026', debit_category: 'CHEMICALS UNDER FREE LIST IMPORT', pay_to: 'ANWER ASGHAR BROTHERS', lc_number: 'LCU/1/30/1945', bill_no: '0149', item_description: 'CLEARING CHARGES FOR IN BOND 3000 KG BLANCOROL MGO', amount: 71978.00 },
  { id: 2, voucher_no: 'DV-002', voucher_type: 'Debit', date: '13.01.2026', debit_category: 'DYES UNDER FREE LIST IMPORT', pay_to: 'ANWER ASGHAR BROTHERS', lc_number: '', bill_no: '', item_description: 'CLEARING CHARGES FOR IN BOND 4860 KOSELLA FAST BEIGE', amount: 81968.00 },
  { id: 3, voucher_no: 'CV-001', voucher_type: 'Credit', date: '15.01.2026', debit_category: 'GENERAL RECEIVABLES', pay_to: 'TARIQ ENTERPRISES', lc_number: '', bill_no: 'B-205', item_description: 'PAYMENT RECEIVED AGAINST DELIVERY OF GOODS', amount: 45000.00 },
  { id: 4, voucher_no: 'DV-003', voucher_type: 'Debit', date: '18.01.2026', debit_category: 'TEXTILES UNDER FREE LIST IMPORT', pay_to: 'HASSAN FABRICS LTD', lc_number: 'LCU/2/18/2026', bill_no: '0212', item_description: 'CLEARING CHARGES FOR IN BOND 5200 METRES COTTON FABRIC', amount: 38500.50 },
];

export const EMPTY = {
  voucher_no: '',
  voucher_type: 'Debit',
  date: '',
  debit_category: '',
  pay_to: '',
  lc_number: '',
  bill_no: '',
  item_description: '',
  amount: '',
};

export const COMPANY = {
  name: 'HAFEEZ TRADING COMPANY',
  tagline: 'Voucher Management System',
};
