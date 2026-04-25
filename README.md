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
  - [Layout overview](#layout-overview)
- [Component Breakdown](#component-breakdown)
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
| **Styling** | Plain CSS in `src/styles/*.css` — no framework |
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

### Step 1 — Clone or open the project

```bash
cd voucherManagementSystem
```

### Step 2 — Install dependencies

```bash
npm install
```

This installs `react`, `react-dom`, `lucide-react`, `jspdf`, and the Vite/ESLint dev tooling listed in `package.json`.

### Step 3 — Run the development server

```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**

The app loads with 4 sample voucher entries ready to explore.

---

## VS Code Setup

### Open the project

```bash
cd voucherManagementSystem
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

The app uses a **Sidebar + TopBar shell** with a slim `App.jsx` that delegates to per-page modules. Voucher state is owned by `pages/vouchers/VouchersPage.jsx`; routing-level state (current page, toast, print) lives in `App.jsx`.

```
voucherManagementSystem/
│
├── public/
│   └── favicon.ico
│
├── src/
│   │
│   ├── main.jsx                          ← React entry; imports global stylesheets
│   ├── index.css                         ← CSS reset
│   ├── App.jsx                           ← Routing state + AppShell + active page
│   │
│   ├── constants/
│   │   └── seed.js                       ← INIT_CATS, INIT_PAYEES, SAMPLE, EMPTY, COMPANY
│   │
│   ├── utils/
│   │   ├── amount.js                     ← parseAmt, fmtAmt, fmtAmtRs, fmtAmtPs, numToWords
│   │   ├── date.js                       ← toPicker, fromPicker, todayYMD, dateToTs
│   │   └── voucher.js                    ← nextNo (auto-increment), validate (form)
│   │
│   ├── services/
│   │   ├── voucherHtml.js                ← voucherHtml() — HTML string for preview/print
│   │   └── pdf.js                        ← generatePDF() — programmatic jsPDF draw
│   │
│   ├── styles/
│   │   ├── shared.css                    ← Buttons, modals, toast, print rules, fonts
│   │   ├── layout.css                    ← App shell, Sidebar, TopBar
│   │   ├── ledger.css                    ← Stats grid, ledger table, action buttons
│   │   ├── form.css                      ← Voucher form sections and inputs
│   │   └── dashboard.css                 ← Dashboard welcome card and module tiles
│   │
│   ├── context/
│   │   ├── TopBarContext.js              ← React context for TopBar title + actions
│   │   └── TopBarProvider.jsx            ← Provider component wrapping the app
│   │
│   ├── hooks/
│   │   ├── useToast.js                   ← Toast state + auto-dismiss timer
│   │   └── useTopBar.js                  ← useTopBar(title, actions, deps) + useTopBarState
│   │
│   ├── layout/
│   │   ├── AppShell.jsx                  ← CSS-grid shell: Sidebar | TopBar / content
│   │   ├── Sidebar.jsx                   ← Company header + Dashboard / Modules nav
│   │   └── TopBar.jsx                    ← Current screen title + action buttons
│   │
│   ├── components/
│   │   ├── PrintArea.jsx                 ← Hidden #htc-print div used by @media print
│   │   ├── Toast.jsx                     ← Slide-up notification renderer
│   │   ├── ErrIcon.jsx                   ← Red field-level error icon
│   │   └── modals/
│   │       ├── VoucherPreviewModal.jsx   ← Full voucher preview + Print/PDF actions
│   │       ├── DeleteConfirmModal.jsx    ← Confirmation dialog before delete
│   │       ├── AddPayeeModal.jsx         ← Input modal to create a new payee
│   │       └── AddCategoryModal.jsx      ← Input modal to create a new category
│   │
│   └── pages/
│       ├── DashboardPage.jsx             ← Welcome card + module tiles
│       └── vouchers/
│           ├── VouchersPage.jsx          ← Owns voucher state; switches Ledger ↔ Form
│           ├── LedgerView.jsx            ← Stats + search/filter/sort + table
│           └── VoucherForm.jsx           ← Create / edit form + add-payee / add-cat modals
│
├── index.html                            ← Vite HTML template (do not modify)
├── vite.config.js                        ← Vite configuration
├── eslint.config.js                      ← ESLint flat config
├── package.json                          ← Dependencies and scripts
└── README.md                             ← This file
```

### Layout overview

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (240px)        │  TopBar (60px)                     │
│ ┌────────────────────┐ │  ┌──────────────────────────────┐  │
│ │ Company Name       │ │  │ <Title>      [+ New] [🔔][⚙] │  │
│ │ Voucher Mgmt Sys.  │ │  └──────────────────────────────┘  │
│ ├────────────────────┤ │  ┌──────────────────────────────┐  │
│ │ Dashboard          │ │  │                              │  │
│ │                    │ │  │   <Active page content>      │  │
│ │ MODULES            │ │  │                              │  │
│ │ • Vouchers ◀active │ │  │   (scrollable)               │  │
│ └────────────────────┘ │  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **AppShell** is a CSS grid (`grid-template-columns: 240px 1fr; grid-template-rows: 60px 1fr;`) with the sidebar spanning both rows.
- **TopBar** reads its title and action buttons from `TopBarContext`. Each page calls `useTopBar(title, actions, deps)` so sub-views (e.g. Ledger vs Form) can swap them dynamically.
- **Notifications** and **Settings** icon buttons in the TopBar are placeholders — they render but have no handlers wired yet.

---

## Component Breakdown

What each file does at a glance.

| File | Responsibility |
|---|---|
| `App.jsx` | Holds `currentPage`, `printEntry`, and the toast hook. Renders `<TopBarProvider>` → `<AppShell>` → active page, plus `<PrintArea>` and `<Toast>` siblings. |
| `main.jsx` | Vite entry. Imports `index.css`, `styles/shared.css`, `styles/layout.css`, then mounts `<App>`. |
| `constants/seed.js` | `INIT_CATS`, `INIT_PAYEES`, `SAMPLE`, `EMPTY` form, and `COMPANY` (name/tagline shown in the sidebar). |
| `utils/amount.js` | `parseAmt`, `fmtAmt`, `fmtAmtRs`, `fmtAmtPs`, `numToWords` (Pakistani Lakh/Crore format). |
| `utils/date.js` | `toPicker`, `fromPicker`, `todayYMD`, `dateToTs`. Bridges `DD.MM.YYYY` storage with `<input type="date">`'s `YYYY-MM-DD`. |
| `utils/voucher.js` | `nextNo(entries, type)` for auto-numbering and `validate(form)` returning per-field errors. |
| `services/voucherHtml.js` | `voucherHtml(entry)` — HTML string used by both the preview modal and the print path. |
| `services/pdf.js` | `generatePDF(entry, showToast)` — loads jsPDF from CDN on first call, then draws cells/text directly (no html2canvas). |
| `styles/*.css` | Plain CSS. `shared` and `layout` load globally; `ledger`, `form`, `dashboard` are imported by their owning pages. |
| `context/TopBarContext.js` | The React context object (kept in its own file so React Fast Refresh stays happy). |
| `context/TopBarProvider.jsx` | Provider holding `{ title, actions, setTitle, setActions }`. |
| `hooks/useToast.js` | Returns `{ toast, showToast(msg, type) }`. Auto-dismisses after 3s. |
| `hooks/useTopBar.js` | `useTopBar(title, actions, deps)` lets a page declare its TopBar title + action node. `useTopBarState()` is consumed by `TopBar.jsx`. |
| `layout/AppShell.jsx` | The CSS-grid shell. Renders `<Sidebar>`, `<TopBar>`, and `{children}`. |
| `layout/Sidebar.jsx` | Company header + a static `NAV` array of groups/items. Calls `onNavigate(id)` on click. |
| `layout/TopBar.jsx` | Reads `title` and `actions` from `TopBarContext`. Renders Notifications and Settings icon buttons. |
| `components/PrintArea.jsx` | Renders the hidden `#htc-print` div used by `@media print`. Receives the entry to print. |
| `components/Toast.jsx` | Slide-up notification. Background colour driven by `toast.type` (`success` / `error` / `info`). |
| `components/ErrIcon.jsx` | Small red icon used in inline form error messages. |
| `components/modals/VoucherPreviewModal.jsx` | Voucher preview with Print + Download PDF buttons. Receives `pdfBusy` to disable the download. |
| `components/modals/DeleteConfirmModal.jsx` | Confirmation dialog. Controlled via `open` / `onCancel` / `onConfirm` props. |
| `components/modals/AddPayeeModal.jsx` | Self-contained input modal. Uppercases + dedupes against `existing`, calls `onAdd(name)`. |
| `components/modals/AddCategoryModal.jsx` | Same shape as the payee modal but for categories. |
| `pages/DashboardPage.jsx` | Welcome card + clickable module tile. Sets TopBar title to "Dashboard". |
| `pages/vouchers/VouchersPage.jsx` | Owns `entries`, `categories`, `payees`, `view`, `editEntry`, `pdfBusy`. Switches between `LedgerView` and `VoucherForm`. |
| `pages/vouchers/LedgerView.jsx` | Stats grid, search/filter/sort controls, table, preview + delete modals. Sets TopBar title "Vouchers" with the `+ New Entry` action button. |
| `pages/vouchers/VoucherForm.jsx` | Create/edit form with inline field validation, derived Rs./Ps. preview, "RUPEES in words" line, and the AddPayee + AddCategory modals. Sets TopBar title "New Voucher" / "Edit Voucher". |

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

State is split by concern across three layers — no Redux or external store needed.

```
App.jsx  ─── routing + shell-wide state
│
├── currentPage        'dashboard' | 'vouchers'
├── printEntry         Entry to print (triggers @media print CSS)
└── toast              { msg, type } or null   (via useToast hook)

TopBarProvider  ─── TopBar contents (set by the active page)
│
├── title              Current screen title shown in the top bar
└── actions            JSX node for page-specific action buttons

pages/vouchers/VouchersPage.jsx  ─── all voucher domain state
│
├── entries[]          All voucher records
├── categories[]       Category options (grows via modal)
├── payees[]           Payee options (grows via modal)
├── view               'ledger' | 'form'
├── editEntry          null (create) or the entry being edited
└── pdfBusy            Boolean — PDF generating in progress

LedgerView.jsx  ─── view-local UI state
│
├── search · typeFilter · sortBy
├── preview            Entry currently shown in preview modal (or null)
└── delId              ID of entry pending deletion (or null)

VoucherForm.jsx  ─── form-local state
│
├── form               Current form field values
├── formErrors         Validation error messages per field
├── touched            Which fields the user has interacted with
└── payeeModal · catModal     Open flags for the add-new modals
```

**Data flows downward** (App → Page → View / Form) via props. **Events flow upward** via callback props (`onSave`, `onDelete`, `onAddPayee`, `onRequestPrint`, …). The TopBar gets its content **sideways** through `TopBarContext`, set by whichever page is mounted.

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
