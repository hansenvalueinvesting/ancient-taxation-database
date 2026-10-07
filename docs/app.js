// The Ancient Taxation Database — frontend for index.html (catalogue and payment lists).
// Reads atd.csv from the repository (CSV_URL in config.js).

const { CSV_URL } = window.ATD_CONFIG;
const COLS = ['id', 'date', 'location', 'payer', 'collector', 'amount', 'unit', 'type', 'source'];

const $ = (id) => document.getElementById(id);
const state = { all: [], rows: [], sortKey: 'id', sortDir: 1, shown: [] };

// ---------- data ----------

// CSV text → array of rows (arrays of strings); handles quoted fields, "" escapes, CRLF.
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ''));
}

async function fetchPayments() {
  const res = await fetch(CSV_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const [head, ...body] = parseCsv(await res.text());
  return body.map((r) => {
    const p = Object.fromEntries(head.map((h, i) => [h, r[i] ?? '']));
    p.year = yearOf(p.date);
    return p;
  });
}

// ---------- dates ----------

// Date field → sortable year: '30 BC' → -30, '128 AD' / '8 Aug 128 AD' → 128; null if blank or not a date.
function yearOf(date) {
  const m = String(date).match(/(\d+) (BC|AD)$/);
  return m ? (m[2] === 'BC' ? -Number(m[1]) : Number(m[1])) : null;
}

// Date field → sortable day number within its year order (year, then month, then day).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dateValue(p) {
  if (p.year == null) return NaN;
  const m = p.date.match(/^(?:(\d+) )?(?:([A-Z][a-z]{2}) )?\d+ (?:BC|AD)$/);
  const month = m && m[2] ? MONTHS.indexOf(m[2]) + 1 : 0, day = m && m[1] ? Number(m[1]) : 0;
  return p.year * 10000 + month * 100 + day;
}

// Year filter input → sortable number: '100 BC' → -100, '57 AD' / 'AD 57' / '57' → 57.
// Returns null for empty input, NaN for input that is not a year.
function parseYear(s) {
  s = s.trim().toUpperCase();
  if (!s) return null;
  const m = s.match(/^(?:(\d+)\s*(BC|AD)?|(AD|BC)\s*(\d+))$/);
  if (!m) return NaN;
  const n = Number(m[1] ?? m[4]), era = m[2] ?? m[3];
  if (n === 0) return NaN;
  return era === 'BC' ? -n : n;
}

const fmtYear = (n) => (n < 0 ? `${-n} BC` : `${n} AD`);

// ---------- catalogue ----------

const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const centuryLabel = (c) => (c < 0 ? `${ordinal(-c)} century BC` : `${ordinal(c)} century AD`);
// Year → century: 1-100 AD = 1, 100-1 BC = -1.
const centuryOf = (y) => (y == null ? null : y > 0 ? Math.ceil(y / 100) : -Math.ceil(-y / 100));
const q = encodeURIComponent;

// Selection (from the URL hash) → title and row test.
// '#all'; '#loc=Thebes' (empty = location unknown); '&c=2' adds a century (2 = 101-200 AD,
// -1 = 100-1 BC; empty = date unknown).
function selection() {
  const h = location.hash.slice(1);
  if (!h) return null;
  if (h === 'all') return { title: 'All payments', test: () => true };
  const prm = new URLSearchParams(h);
  if (!prm.has('loc')) return null;
  const loc = prm.get('loc');
  let title = loc || 'Location unknown';
  let test = (p) => p.location === loc;
  if (prm.has('c')) {
    const c = prm.get('c') === '' ? null : Number(prm.get('c'));
    title += c == null ? ', date unknown' : `, ${centuryLabel(c)}`;
    const byLoc = test;
    test = (p) => byLoc(p) && centuryOf(p.year) === c;
  }
  return { title, test };
}

const node = (href, label, n) => `<a href="#${href}">${esc(label)}</a> (${n.toLocaleString()})`;

// Catalogue: one tree, location > century; earliest first at each level, unknowns last.
function renderCatalogue() {
  $('cat-total').textContent = `(${state.all.length.toLocaleString()})`;
  const locs = new Map();
  state.all.forEach((p) => {
    if (!locs.has(p.location)) locs.set(p.location, { n: 0, first: Infinity, cents: new Map() });
    const l = locs.get(p.location), c = centuryOf(p.year);
    l.n++;
    l.first = Math.min(l.first, p.year ?? Infinity);
    l.cents.set(c, (l.cents.get(c) || 0) + 1);
  });
  const order = (a, b) => (a[0] === '') - (b[0] === '') || a[1].first - b[1].first || a[0].localeCompare(b[0]);
  $('cat-tree').innerHTML = [...locs].sort(order).map(([loc, l]) => {
    const cents = [...l.cents].sort((a, b) => (a[0] ?? Infinity) - (b[0] ?? Infinity)).map(([c, n]) => `<li>${
      node(`loc=${q(loc)}&c=${c ?? ''}`, c == null ? 'Date unknown' : centuryLabel(c), n)}</li>`).join('');
    return `<li><details><summary>${node(`loc=${q(loc)}`, loc || 'Location unknown', l.n)}</summary><ul>${cents}</ul></details></li>`;
  }).join('');
}

async function load() {
  try {
    state.all = await fetchPayments();
  } catch (err) {
    return setStatus(`Could not load data. ${err.message}`);
  }
  renderCatalogue();
  showSelection();
}

// Show the payments of the selected catalogue node.
function showSelection() {
  const sel = selection();
  ['sel-title', 'controls', 'payments'].forEach((id) => { $(id).hidden = !sel; });
  if (!sel) { state.rows = []; return setStatus(state.all.length ? 'Choose a category above.' : 'No payments recorded yet.'); }
  $('sel-title').textContent = sel.title;
  state.rows = state.all.filter(sel.test);
  ['f-location', 'f-unit', 'f-type'].forEach((id) => { $(id).length = 1; });
  ['f-search', 'f-from', 'f-to'].forEach((id) => { $(id).value = ''; });
  fillSelect('f-location', state.rows.map((p) => p.location));
  fillSelect('f-unit', state.rows.map((p) => p.unit));
  fillSelect('f-type', state.rows.map((p) => p.type));
  setYearPlaceholders();
  render();
}

// ---------- formatting ----------

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Year filter hints: earliest and latest year on record.
function setYearPlaceholders() {
  const ys = state.rows.map((p) => p.year).filter((y) => y != null);
  $('f-from').placeholder = ys.length ? fmtYear(Math.min(...ys)) : '';
  $('f-to').placeholder = ys.length ? fmtYear(Math.max(...ys)) : '';
}

function setStatus(msg) {
  $('status').textContent = msg;
}

function fillSelect(id, values) {
  const sel = $(id);
  [...new Set(values.filter((v) => v !== ''))].sort().forEach((v) => sel.add(new Option(v, v)));
}

// ---------- filtering & table ----------

function filtered() {
  const s = $('f-search').value.trim().toLowerCase();
  const loc = $('f-location').value, unit = $('f-unit').value, type = $('f-type').value;
  const from = parseYear($('f-from').value), to = parseYear($('f-to').value);

  return state.rows.filter((p) => {
    if (loc && p.location !== loc) return false;
    if (unit && p.unit !== unit) return false;
    if (type && p.type !== type) return false;
    if (from != null && (p.year == null || p.year < from)) return false;
    if (to != null && (p.year == null || p.year > to)) return false;
    if (s && !COLS.map((c) => p[c]).join(' ').toLowerCase().includes(s)) return false;
    return true;
  });
}

function sortRows(rows) {
  const { sortKey: k, sortDir: d } = state;
  const numeric = k === 'date' || k === 'amount';
  const num = (p) => (k === 'date' ? dateValue(p) : p[k] === '' ? NaN : Number(p[k]));
  return rows.sort((a, b) => {
    const x = numeric ? num(a) : a[k], y = numeric ? num(b) : b[k];
    const blank = (v) => v === '' || Number.isNaN(v);
    if (blank(x)) return blank(y) ? 0 : 1;
    if (blank(y)) return -1;
    return (numeric ? x - y : String(x).localeCompare(String(y))) * d;
  });
}

function render() {
  state.shown = sortRows(filtered());
  $('payments').querySelector('tbody').innerHTML = state.shown.map((p) => `
    <tr>${COLS.map((c) => `<td>${esc(p[c])}</td>`).join('')}</tr>`).join('');

  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.dataset.label ||= th.textContent;
    th.textContent = th.dataset.label + (th.dataset.sort === state.sortKey ? (state.sortDir === 1 ? ' ▲' : ' ▼') : '');
  });
  const bad = ['f-from', 'f-to'].filter((id) => Number.isNaN(parseYear($(id).value)));
  setStatus(bad.length
    ? 'Year filter not understood: enter a year like 100 BC or 57 AD.'
    : `${state.shown.length.toLocaleString()} of ${state.rows.length.toLocaleString()} payments`);
}

// ---------- CSV export ----------

function downloadCsv() {
  const cell = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = [COLS.join(','), ...state.shown.map((p) => COLS.map((c) => cell(p[c])).join(','))].join('\n') + '\n';
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: 'atd.csv',
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- wiring ----------

const FILTERS = ['f-search', 'f-location', 'f-unit', 'f-type', 'f-from', 'f-to'];
FILTERS.forEach((id) => $(id).addEventListener('input', render));
$('btn-reset').addEventListener('click', () => {
  FILTERS.forEach((id) => { $(id).value = ''; });
  render();
});
$('btn-csv').addEventListener('click', downloadCsv);
window.addEventListener('hashchange', showSelection);
document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
  state.sortDir = state.sortKey === th.dataset.sort ? -state.sortDir : 1;
  state.sortKey = th.dataset.sort;
  render();
}));
load();
