# 📒 Hafeez Trading Company — Voucher Management System

A professional **Debit/Credit Voucher Management System** built with React + Vite. Designed to replace Excel-based voucher records with a fully interactive web application supporting CRUD operations, PDF generation, and print-ready voucher output.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [VS Code Setup](#vs-code-setup)
- [Project Structure](#project-structure)
  - [Current Single-File Structure](#current-single-file-structure)
  - [Recommended Component Structure](#recommended-component-structure)
- [Component Breakdown](#component-breakdown)
- [Utility Functions](#utility-functions)
- [Data Model](#data-model)
- [State Management](#state-management)
- [Feature Guide](#feature-guide)
- [Print & PDF System](#print--pdf-system)
- [How to Extend with a Database](#how-to-extend-with-a-database)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

This system was built to modernize the paper/Excel-based voucher workflow at Hafeez Trading Company. It manages **Debit and Credit vouchers** used in import/export operations, generates properly formatted voucher printouts matching the original Excel design, and maintains a searchable, sortable ledger of all transactions.

---

## Features

| Feature | Description |
|---|---|
| **Ledger View** | Full table of all voucher entries with search, filter, and sort |
| **Create / Edit** | Form to add or modify voucher entries with real-time validation |
| **Debit & Credit** | Supports both voucher types with auto-incremented numbering (DV-001, CV-001) |
| **Amount Parsing** | Single decimal input (e.g. `71978.50`) auto-splits into Rs. and Paisa |
| **Amount in Words** | Converts numeric amount to Pakistani format (Lakhs/Crores) |
| **Dynamic Payees** | Select from dropdown or add a new payee via modal |
| **Dynamic Categories** | Select from dropdown or add a new category via modal |
| **Voucher Preview** | Modal showing the formatted voucher exactly as it prints |
| **Print** | Uses CSS `@media print` — works in sandboxed environments |
| **PDF Download** | Programmatic jsPDF generation — no html2canvas, no sandbox block |
| **Delete** | Confirmation modal before permanent deletion |
| **Sort** | Sort by Date, Amount, Type, Category, Voucher No. |
| **Filter** | Filter ledger by Debit / Credit / All |
| **Search** | Search across voucher no., payee, category, bill no., L/C no. |
| **Field Validation** | Per-field error messages on blur + full validation on submit |
| **Toast Notifications** | Success, info, and error feedback toasts |
| **Stats Dashboard** | Total vouchers, total debit, total credit, net balance |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 |
| **Build Tool** | Vite |
| **Language** | JavaScript (JSX) |
| **Icons** | lucide-react |
| **PDF** | jsPDF (loaded from CDN at runtime) |
| **Styling** | Plain CSS (injected via JS string — no framework) |
| **Fonts** | IBM Plex Sans + IBM Plex Mono (Google Fonts) |

---

## Prerequisites

Install the following before starting:

### 1. Node.js (v18 or higher)
Download from [nodejs.org](https://nodejs.org) — choose the **LTS** version.

Verify installation:
```bash
node -v     # Expected: v18.x.x or v20.x.x
npm -v      # Expected: 9.x.x or 10.x.x
```

### 2. VS Code
Download from [code.visualstudio.com](https://code.visualstudio.com)

### 3. Git (Optional but recommended)
Download from [git-scm.com](https://git-scm.com)

---

## Installation & Setup

### Step 1 — Create the Vite + React project

Open a terminal and run:

```bash
npm create vite@latest hafeez-voucher -- --template react
cd hafeez-voucher
```

### Step 2 — Install dependencies

```bash
npm install
npm install lucide-react
```

### Step 3 — Replace `src/App.jsx`

Delete all content in `src/App.jsx` and paste the full application code.

### Step 4 — Clear global CSS files

**`src/App.css`** — delete all content (leave the file empty).

**`src/index.css`** — replace with:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
```

### Step 5 — Run the development server

```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**

The app loads with 4 sample voucher entries ready to explore.

---

## VS Code Setup

### Open the project

```bash
cd hafeez-voucher
code .
```

### Recommended Extensions

Install from the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`):

| Extension | ID | Purpose |
|---|---|---|
| **ES7+ React Snippets** | `dsznajder.es7-react-js-snippets` | React component shortcuts (`rafce`, `useState`, etc.) |
| **Prettier** | `esbenp.prettier-vscode` | Auto-format on save |
| **ESLint** | `dbaeumer.vscode-eslint` | Catch JS/React errors in real time |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | Rename JSX opening/closing tags together |
| **Path Intellisense** | `christian-kohler.path-intellisense` | Auto-complete import paths |
| **GitLens** | `eamodio.gitlens` | Git history and blame in editor |

### Recommended VS Code Settings

Create `.vscode/settings.json` in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  }
}
```

### Useful Commands

```bash
npm run dev       # Start dev server with hot reload  → http://localhost:5173
npm run build     # Build for production              → /dist folder
npm run preview   # Preview production build locally
```

---

## Project Structure

### Current Single-File Structure

Right now, the entire app lives in `App.jsx`. Here is what that single file contains, section by section:

```
src/App.jsx
│
├── [1] Amount Helpers          parseAmt(), fmtAmt(), fmtAmtRs(), fmtAmtPs()
├── [2] Number to Words         numToWords()
├── [3] Date Helpers            toPicker(), fromPicker(), todayYMD(), dateToTs()
├── [4] Voucher Helpers         nextNo(), validate()
├── [5] Constants               INIT_CATS, INIT_PAYEES, SAMPLE data, EMPTY form
├── [6] Voucher HTML Generator  voucherHtml()  — builds HTML string for preview/print
├── [7] PDF Generator           generatePDF()  — draws PDF programmatically with jsPDF
├── [8] CSS String              CSS            — all styles as a JS template literal
└── [9] App Component           export default function App()
        ├── All useState hooks
        ├── Filter + Sort logic
        ├── Form handlers
        ├── Add Payee handler
        ├── Add Category handler
        ├── Print handler
        ├── PDF download handler
        ├── PrintArea div (hidden, used by @media print)
        ├── LEDGER VIEW (rendered when view === 'ledger')
        │     ├── Header
        │     ├── Stats cards (4)
        │     ├── Controls (search, filter, sort)
        │     ├── Ledger table
        │     ├── Preview Modal
        │     └── Delete Confirm Modal
        └── FORM VIEW (rendered when view === 'form')
              ├── Header
              ├── Back button
              ├── Voucher Identity section
              ├── Party, Amount & References section
              ├── Add Payee Modal
              └── Add Category Modal
```

---

### Recommended Component Structure

When you are ready to split the single file into a proper multi-file project, follow this structure. Each file is described in detail in the [Component Breakdown](#component-breakdown) section below.

```
hafeez-voucher/
│
├── public/
│   └── favicon.ico
│
├── src/
│   │
│   ├── main.jsx                          ← React entry point (do not modify)
│   │
│   ├── App.jsx                           ← Root component: holds global state,
│   │                                         routes between Ledger and Form views
│   │
│   ├── constants/
│   │   └── data.js                       ← INIT_CATS, INIT_PAYEES, SAMPLE, EMPTY
│   │
│   ├── utils/
│   │   ├── amountHelpers.js              ← parseAmt, fmtAmt, fmtAmtRs, fmtAmtPs
│   │   ├── numberToWords.js              ← numToWords (Pakistani Lakh/Crore format)
│   │   ├── dateHelpers.js                ← toPicker, fromPicker, todayYMD, dateToTs
│   │   ├── voucherHelpers.js             ← nextNo (auto-increment), validate (form)
│   │   ├── voucherHtml.js                ← voucherHtml() — HTML string for preview/print
│   │   └── generatePDF.js                ← generatePDF() — jsPDF programmatic draw
│   │
│   ├── styles/
│   │   └── app.css                       ← All CSS extracted from the CSS string
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   └── Header.jsx                ← Top navy bar with brand + action button
│   │   │
│   │   ├── common/
│   │   │   ├── Toast.jsx                 ← Slide-up notification (success/error/info)
│   │   │   ├── ErrorMessage.jsx          ← Red field-level validation message
│   │   │   └── StatCard.jsx              ← Dashboard summary card (icon + label + value)
│   │   │
│   │   └── modals/
│   │       ├── PreviewModal.jsx          ← Full voucher preview with Print/PDF buttons
│   │       ├── DeleteConfirmModal.jsx    ← Confirmation dialog before delete
│   │       ├── AddPayeeModal.jsx         ← Input modal to create a new payee
│   │       └── AddCategoryModal.jsx      ← Input modal to create a new category
│   │
│   ├── screens/
│   │   ├── LedgerScreen.jsx              ← Stats + search/filter/sort + table
│   │   └── VoucherFormScreen.jsx         ← Create / Edit voucher form
│   │
│   └── hooks/
│       └── useVoucherForm.js             ← Custom hook: form state, validation,
│                                             handleChange, handleBlur, handleSave
│
├── index.html                            ← Vite HTML template (do not modify)
├── vite.config.js                        ← Vite configuration (do not modify)
├── package.json                          ← Dependencies and scripts
└── README.md                             ← This file
```

---

## Component Breakdown

This section explains what each file does and what code to move into it.

---

### `src/constants/data.js`

Holds all static data and default values. Nothing dynamic — just arrays and objects.

```js
// Move these from App.jsx:
export const INIT_CATS = [ 'CHEMICALS UNDER FREE LIST IMPORT', ... ];
export const INIT_PAYEES = [ 'ANWER ASGHAR BROTHERS', ... ];
export const SAMPLE = [ { id:1, voucher_no:'DV-001', ... }, ... ];
export const EMPTY_FORM = { voucher_no:'', voucher_type:'Debit', ... };
```

**Import in App.jsx:**
```js
import { INIT_CATS, INIT_PAYEES, SAMPLE, EMPTY_FORM } from './constants/data';
```

---

### `src/utils/amountHelpers.js`

All functions that deal with the amount decimal field.

```js
// Move these from App.jsx:
export function parseAmt(val) { ... }   // "71978.50" → { rs: 71978, ps: 50 }
export function fmtAmt(val) { ... }     // "71978.50" → "71,978.50"
export function fmtAmtRs(val) { ... }   // "71978.50" → "71,978"
export function fmtAmtPs(val) { ... }   // "71978.50" → "50"
```

---

### `src/utils/numberToWords.js`

Converts a number to words in Pakistani format (ones, lakhs, crores).

```js
// Move this from App.jsx:
export function numToWords(n) { ... }
// Usage: numToWords(71978) → "SEVENTY ONE THOUSAND NINE HUNDRED SEVENTY EIGHT ONLY"
```

---

### `src/utils/dateHelpers.js`

Converts between date formats because `<input type="date">` uses `YYYY-MM-DD` internally but the voucher displays `DD.MM.YYYY`.

```js
// Move these from App.jsx:
export function toPicker(dmy) { ... }     // "13.01.2026" → "2026-01-13"
export function fromPicker(ymd) { ... }   // "2026-01-13" → "13.01.2026"
export function todayYMD() { ... }        // Returns today as "2026-01-13"
export function dateToTs(dmy) { ... }     // "13.01.2026" → Unix timestamp (for sorting)
```

---

### `src/utils/voucherHelpers.js`

Business logic for voucher numbering and form validation.

```js
// Move these from App.jsx:

// Auto-generates next voucher number: DV-001, DV-002, CV-001 etc.
export function nextNo(entries, type) { ... }

// Returns an errors object. Empty object = form is valid.
export function validate(form) {
  const errors = {};
  if (!form.date)          errors.date = 'Date is required';
  if (!form.debit_category) errors.debit_category = 'Category is required';
  if (!form.pay_to)        errors.pay_to = 'Payee is required';
  if (!form.amount || +form.amount <= 0) errors.amount = 'Enter a valid amount';
  return errors;
}
```

---

### `src/utils/voucherHtml.js`

Generates the complete voucher HTML string used by both the **Preview Modal** and the **Print** system. Returns raw HTML as a string — not a React component.

```js
// Move this from App.jsx:
export function voucherHtml(entry) {
  // Builds a <table> HTML string matching the original Excel voucher layout.
  // Used by:
  //   1. PreviewModal  → dangerouslySetInnerHTML
  //   2. handlePrint   → injected into #htc-print div before window.print()
  return `<div style="..."><table>...</table></div>`;
}
```

---

### `src/utils/generatePDF.js`

Draws the voucher PDF programmatically using jsPDF. Loads jsPDF from CDN on first use. Does **not** use html2canvas — draws rectangles, fills, and text directly to avoid sandbox restrictions.

```js
// Move this from App.jsx:
export async function generatePDF(entry, showToast) {
  // 1. Loads jsPDF from CDN if not already loaded
  // 2. Creates an A4 jsPDF instance
  // 3. Draws: header, voucher title, category row, PAY TO row,
  //           narration block, TOTAL row, RUPEES row, signature row
  // 4. Calls doc.save() to trigger browser download
}
```

---

### `src/styles/app.css`

Extract the `CSS` string from `App.jsx` and put it in a real `.css` file.

In `App.jsx`, replace:
```jsx
<style>{CSS}</style>
```
With a standard import at the top of `App.jsx`:
```js
import './styles/app.css';
```

And delete the `const CSS = \`...\`` string entirely.

---

### `src/components/layout/Header.jsx`

The top navigation bar — navy background, company brand, and optional action button.

```jsx
// Props:
// - title: string        "HAFEEZ TRADING COMPANY"
// - subtitle: string     "Voucher Management System"
// - action: node         Optional button on the right (e.g. "New Entry")

export default function Header({ title, subtitle, action }) {
  return (
    <div className="hdr">
      <div className="hdr-brand">
        <div className="hdr-ico">...</div>
        <div>
          <div className="hdr-t">{title}</div>
          <div className="hdr-s">{subtitle}</div>
        </div>
      </div>
      {action}
    </div>
  );
}
```

---

### `src/components/common/StatCard.jsx`

One of the four summary cards shown above the ledger table.

```jsx
// Props:
// - icon: node           Lucide icon component
// - iconBg: string       Background colour e.g. "#EFF6FF"
// - iconColor: string    Icon colour e.g. "#1D4ED8"
// - label: string        "Total Debit (Rs.)"
// - value: string        "71,978.00"
// - valueColor: string   Text colour for the value

export default function StatCard({ icon, iconBg, iconColor, label, value, valueColor }) { ... }
```

---

### `src/components/common/Toast.jsx`

Slide-up notification that auto-dismisses after 3 seconds.

```jsx
// Props:
// - message: string      The notification text
// - type: string         'success' | 'error' | 'info'
// - onDismiss: func      Called after timeout (to clear toast state)

export default function Toast({ message, type, onDismiss }) { ... }
```

---

### `src/components/common/ErrorMessage.jsx`

The small red message shown below invalid form fields.

```jsx
// Props:
// - message: string    The error text to display

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="emsg">
      <ErrorIcon />
      {message}
    </div>
  );
}
```

---

### `src/components/modals/PreviewModal.jsx`

Shows the formatted voucher in a scrollable modal with Print and Download PDF buttons.

```jsx
// Props:
// - entry: object        The voucher entry to preview
// - onClose: func        Close the modal
// - onPrint: func        Trigger print for this entry
// - onDownload: func     Trigger PDF download for this entry
// - pdfBusy: boolean     Disable download button while generating

export default function PreviewModal({ entry, onClose, onPrint, onDownload, pdfBusy }) { ... }
```

---

### `src/components/modals/DeleteConfirmModal.jsx`

Asks the user to confirm before deleting an entry.

```jsx
// Props:
// - onConfirm: func      Called when user clicks "Yes, Delete"
// - onCancel: func       Called when user clicks "Cancel"

export default function DeleteConfirmModal({ onConfirm, onCancel }) { ... }
```

---

### `src/components/modals/AddPayeeModal.jsx`

Small modal with a single text input to add a new payee to the dropdown list.

```jsx
// Props:
// - onAdd: func(name)    Called with the new payee name (UPPERCASE)
// - onClose: func        Close without adding

export default function AddPayeeModal({ onAdd, onClose }) { ... }
```

---

### `src/components/modals/AddCategoryModal.jsx`

Identical in structure to AddPayeeModal but for categories.

```jsx
// Props:
// - onAdd: func(name)    Called with the new category name (UPPERCASE)
// - onClose: func        Close without adding

export default function AddCategoryModal({ onAdd, onClose }) { ... }
```

---

### `src/screens/LedgerScreen.jsx`

The main view. Contains the stats dashboard, search/filter/sort controls, and the voucher table with action buttons.

```jsx
// Props passed down from App.jsx:
// - entries: array         All voucher entries
// - onEdit: func           Open form in edit mode for a specific entry
// - onDelete: func         Mark entry for deletion (shows confirm modal)
// - onPreview: func        Open preview modal for entry
// - onPrint: func          Trigger print for entry
// - onDownload: func       Trigger PDF download for entry
// - onNewEntry: func       Open form in create mode
// - totalDebit: number     Sum of all debit amounts
// - totalCredit: number    Sum of all credit amounts
// - pdfBusy: boolean       PDF generation in progress

export default function LedgerScreen({ entries, onEdit, onDelete, onPreview,
  onPrint, onDownload, onNewEntry, totalDebit, totalCredit, pdfBusy }) { ... }
```

---

### `src/screens/VoucherFormScreen.jsx`

The Create / Edit form. Handles its own internal field state using the `useVoucherForm` custom hook, and calls `onSave` when complete.

```jsx
// Props:
// - editEntry: object|null    null = create mode, object = edit mode
// - entries: array            Needed to calculate next voucher number
// - payees: array             List of payees for the dropdown
// - categories: array         List of categories for the dropdown
// - onSave: func(formData)    Called with the completed form object
// - onCancel: func            Go back to ledger without saving
// - onAddPayee: func(name)    Add a new payee to the global list
// - onAddCategory: func(name) Add a new category to the global list

export default function VoucherFormScreen({
  editEntry, entries, payees, categories,
  onSave, onCancel, onAddPayee, onAddCategory }) { ... }
```

---

### `src/hooks/useVoucherForm.js`

Custom React hook that encapsulates all form state logic so `VoucherFormScreen` stays clean.

```js
// Usage inside VoucherFormScreen:
// const { form, errors, touched, handleChange, handleBlur, handleSave } = useVoucherForm(props);

export function useVoucherForm({ editEntry, entries, payees, onSave }) {
  const [form, setForm] = useState(...);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => { ... };
  const handleBlur   = (field) => { ... };
  const handleSave   = () => { ... };  // validates then calls onSave()

  return { form, errors, touched, handleChange, handleBlur, handleSave };
}
```

---

## Data Model

Each voucher entry is a plain JavaScript object:

```js
{
  id:               1,                                    // number  — unique identifier
  voucher_no:       'DV-001',                             // string  — auto-generated
  voucher_type:     'Debit',                              // string  — 'Debit' | 'Credit'
  date:             '13.01.2026',                         // string  — DD.MM.YYYY format
  debit_category:   'CHEMICALS UNDER FREE LIST IMPORT',   // string  — account head
  pay_to:           'ANWER ASGHAR BROTHERS',              // string  — payee / vendor name
  lc_number:        'LCU/1/30/1945',                      // string  — letter of credit ref
  bill_no:          '0149',                               // string  — bill / invoice number
  item_description: 'CLEARING CHARGES FOR IN BOND ...',   // string  — goods / narration
  amount:           71978.50,                             // number  — decimal (Rs.Ps format)
}
```

**Derived values** (not stored — computed on the fly):

| Derived | Source | Function |
|---|---|---|
| `rs` (Rupees)  | `amount` | `Math.floor(amount)` |
| `ps` (Paisa)   | `amount` | `Math.round((amount % 1) * 100)` |
| Amount in words | `rs` | `numToWords(rs)` |
| Display format | `amount` | `fmtAmt(amount)` → `"71,978.50"` |

---

## State Management

All state lives in `App.jsx` (no Redux or external state library needed at this scale).

```
App.jsx  ←─────────────────── holds all state
│
├── entries[]          All voucher records
├── categories[]       List of category options (can grow via modal)
├── payees[]           List of payee options (can grow via modal)
├── view               'ledger' | 'form'
├── editId             null (create) or number (edit)
├── form               Current form field values
├── formErrors         Validation error messages per field
├── touched            Which fields user has interacted with
├── preview            Entry currently shown in preview modal (or null)
├── delId              ID of entry pending deletion (or null)
├── search             Search input string
├── typeFilter         'All' | 'Debit' | 'Credit'
├── sortBy             Sort key string
├── pdfBusy            Boolean — PDF generating in progress
├── toast              { msg, type } or null
├── printEntry         Entry to print (triggers @media print CSS)
├── payeeModal         Boolean
├── catModal           Boolean
└── new*               Temp state for the add modals
```

**Data flows downward** (App → Screens → Components) via props.
**Events flow upward** via callback props (e.g. `onSave`, `onDelete`, `onAddPayee`).

---

## Feature Guide

### Creating a Voucher

1. Click **New Entry** in the top-right header
2. Select **Voucher Type** — Voucher No. auto-updates (DV-xxx or CV-xxx)
3. Pick a **Date** from the date picker
4. Select a **Category** from the dropdown or click **New** to add one
5. Select a **Payee** from the dropdown or click **New** to add one
6. Enter the **Amount** as a decimal (e.g. `71978.50`) — Rs. and Paisa split automatically
7. Optionally fill in **L/C Number**, **Bill No.**, and **Item Description**
8. The **RUPEES in words** preview updates live as you type
9. Click **Create Entry** — validation runs on all required fields first

### Editing a Voucher

Click the **blue pencil icon** in the Actions column. The form opens pre-filled with the entry's data. Voucher No. is read-only. Make changes and click **Update Entry**.

### Printing a Voucher

Click the **green printer icon**. The app injects the formatted voucher HTML into a hidden `#htc-print` div, then calls `window.print()`. CSS `@media print` hides everything else on the page. The browser print dialog opens — use **Ctrl+P** / **Cmd+P** settings to select the printer or save as PDF.

### Downloading PDF

Click the **yellow download icon**. jsPDF is loaded from CDN on first use (one-time, ~200kb). The voucher is drawn programmatically using jsPDF's rect/text API — no screenshot taken. The PDF saves automatically to your Downloads folder.

### Searching & Filtering

- **Search box** — matches against: Voucher No., Payee, Category, Bill No., L/C No.
- **Type filter** — All / Debit / Credit
- **Sort dropdown** — Date (newest/oldest), Amount (high/low), Type, Category, Voucher No.
- **Clear sort** — X button appears next to the sort dropdown when active

---

## Print & PDF System

### Why not `window.open()`?

When running inside a sandboxed iframe (like Claude's artifact environment), `window.open()` is blocked. The print system uses CSS `@media print` instead:

```css
@media print {
  body > * { visibility: hidden !important; }
  #htc-print, #htc-print * { visibility: visible !important; }
  #htc-print { position: fixed; top: 0; left: 0; width: 100%; }
}
```

A `<div id="htc-print">` always exists in the DOM, positioned off-screen. When Print is clicked, the voucher HTML is rendered into it and `window.print()` is called — the CSS makes only the voucher visible.

### Why not html2canvas for PDF?

`html2canvas` takes a screenshot of DOM content — this is blocked by CSP in sandboxed environments ("This content is blocked" error). Instead, the PDF is **drawn programmatically**: jsPDF's `rect()`, `text()`, `setFillColor()` etc. draw every row of the voucher from scratch. This is 100% sandbox-safe.

---

## How to Extend with a Database

Currently all data is stored in React `useState` — it resets on page refresh. To persist data, connect **Supabase** (free Postgres database with REST API).

### Setup

```bash
npm install @supabase/supabase-js
```

Create `src/utils/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_PROJECT.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Replace useState with Supabase queries

In `App.jsx`, replace the `entries` state with real database calls:

```js
// Load entries on mount
useEffect(() => {
  async function load() {
    const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    if (data) setEntries(data);
  }
  load();
}, []);

// Create
const handleSave = async (formData) => {
  const { data } = await supabase.from('vouchers').insert([formData]).select();
  setEntries(prev => [data[0], ...prev]);
};

// Update
const handleUpdate = async (id, formData) => {
  await supabase.from('vouchers').update(formData).eq('id', id);
  setEntries(prev => prev.map(e => e.id === id ? { ...formData, id } : e));
};

// Delete
const handleDelete = async (id) => {
  await supabase.from('vouchers').delete().eq('id', id);
  setEntries(prev => prev.filter(e => e.id !== id));
};
```

### Supabase Table Schema

Run this SQL in your Supabase project's SQL editor:

```sql
CREATE TABLE vouchers (
  id              BIGSERIAL PRIMARY KEY,
  voucher_no      TEXT NOT NULL,
  voucher_type    TEXT NOT NULL CHECK (voucher_type IN ('Debit', 'Credit')),
  date            TEXT NOT NULL,
  debit_category  TEXT NOT NULL,
  pay_to          TEXT NOT NULL,
  lc_number       TEXT,
  bill_no         TEXT,
  item_description TEXT,
  amount          NUMERIC(12, 2) NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Troubleshooting

### `npm run dev` fails — port in use

```bash
npm run dev -- --port 3000
```

### Google Fonts not loading

The app imports IBM Plex Sans from Google Fonts. If you are offline or fonts are blocked, the browser falls back to system sans-serif. The app still works — only the typography changes.

### PDF download says "PDF engine unavailable"

jsPDF loads from `cdnjs.cloudflare.com`. If your network blocks CDN requests:
```bash
npm install jspdf
```
Then in `generatePDF.js`, replace the dynamic loader with:
```js
import { jsPDF } from 'jspdf';
```

### Print dialog shows blank page

This can happen if `window.print()` is called before the `#htc-print` div renders. The app uses two `requestAnimationFrame` calls to ensure the DOM updates first. If it still fails, increase the timeout:

```js
// In handlePrint(), change:
requestAnimationFrame(() => requestAnimationFrame(() => { window.print(); }));
// To:
setTimeout(() => { window.print(); }, 500);
```

### Amount in words is wrong

`numToWords()` uses the Pakistani number system (Lakhs and Crores). It only converts the **Rupees** (integer) portion — Paisa is shown separately as a two-digit number. Maximum supported value is approximately 99 Crore (999,999,999).

### Voucher numbers reset on refresh

Voucher numbers (DV-001, CV-002 etc.) are generated from the current `entries` array in state. Since state is in-memory, it resets on refresh. Once you connect a database, numbers will generate correctly from the persisted data.

---

## License

This project was built for **Hafeez Trading Company** internal use.

---

## Author

Built with React + Vite. PDF generation via jsPDF. Icons by Lucide React.
