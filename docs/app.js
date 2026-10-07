// The Ancient Taxation Database — frontend for index.html (filters and payment list) and payment.html (one payment).
// Reads atd.csv from the repository (CSV_URL in config.js).

const { CSV_URL } = window.ATD_CONFIG;
const COLS = ['id', 'date', 'location', 'tax', 'payer', 'collector', 'type', 'amount', 'unit', 'source', 'notes'];
// Table columns; notes (the long original text) is shown only on a payment's own page.
const LIST_COLS = COLS.filter((c) => c !== 'notes');

// Source → its online edition. Papyri and ostraca: papyri.info, from the citation
// ('O.Heid. 100' → o.heid;;100, 'P.Oxy. 3 506' → p.oxy;3;506, 'O.Petr. Mus. 553' → o.petr.mus;;553).
function sourceUrl(src) {
  const m = String(src).match(/^(.+?)\.? (?:(\d+) )?(\d+[a-z]?)$/);
  if (!m) return null;
  const series = m[1].toLowerCase().replace(/\.\s*/g, '.').replace(/\s+/g, '.');
  return `https://papyri.info/ddbdp/${series};${m[2] || ''};${m[3]}`;
}
const fmtSource = (p) => {
  const url = sourceUrl(p.source);
  return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(p.source)}</a>` : esc(p.source);
};
const cellHtml = (p, c) => (c === 'source' ? fmtSource(p) : esc(p[c]).replace(/\n/g, '<br>'));

const $ = (id) => document.getElementById(id);
const state = { all: [], sortKey: 'id', sortDir: 1, shown: [], picked: { location: new Set(), tax: new Set() } };

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
    p.yearEnd = yearEndOf(p.date);
    return p;
  });
}

// ---------- dates ----------

// Date field → sortable year (a range sorts by its start): '30 BC' → -30, '128 AD' / '8 Aug 128 AD' → 128,
// '138-139 AD' → 138, 'Feb-Apr 190 AD (?)' → 190, '30 BC-14 AD' → -30; null if blank or not a date.
function yearOf(date) {
  const m = String(date).replace(/ \(\?\)$/, '').match(/(\d+)(?: (BC|AD))?(?:-.*?\d+)? (BC|AD)$/);
  if (!m) return null;
  return (m[2] || m[3]) === 'BC' ? -Number(m[1]) : Number(m[1]);
}

// Date field → last year it may fall in: '138-139 AD' → 139, '30 BC-14 AD' → 14, '128 AD' → 128.
function yearEndOf(date) {
  const m = String(date).replace(/ \(\?\)$/, '').match(/(\d+) (BC|AD)$/);
  if (!m) return null;
  return m[2] === 'BC' ? -Number(m[1]) : Number(m[1]);
}

// Date field → sortable value: year, then month, then day of the range's start.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dateValue(p) {
  if (p.year == null) return NaN;
  const m = p.date.match(/^(?:(\d+) )?([A-Z][a-z]{2})[ -]/);
  return p.year * 10000 + (m ? (MONTHS.indexOf(m[2]) + 1) * 100 + Number(m[1] || 0) : 0);
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

// ---------- multi-select filters (type to search, pick several) ----------

// Columns with a multi-select filter. A blank value is offered as BLANK[col].
const MULTI = ['location', 'tax'];
const BLANK = { location: '(location unknown)', tax: '(tax not named)' };
const shownValue = (col, v) => (v === '' ? BLANK[col] : v);

// Fill each filter's suggestion list with the values not yet picked, with their number of payments.
function fillOptions() {
  MULTI.forEach((col) => {
    const counts = new Map();
    state.all.forEach((p) => counts.set(p[col], (counts.get(p[col]) || 0) + 1));
    $(`dl-${col}`).innerHTML = [...counts].filter(([v]) => !state.picked[col].has(v))
      .sort((a, b) => shownValue(col, a[0]).localeCompare(shownValue(col, b[0])))
      .map(([v, n]) => `<option value="${esc(shownValue(col, v))}">${n.toLocaleString()} payments</option>`).join('');
  });
}

// Picked values, shown as buttons; clicking one removes it.
function showPicked() {
  MULTI.forEach((col) => {
    $(`picked-${col}`).innerHTML = [...state.picked[col]].map((v) =>
      `<button type="button" data-col="${col}" data-value="${esc(v)}" title="Remove">${esc(shownValue(col, v))} ×</button>`).join(' ');
  });
}

// Typed text → the value it names (exact, else the only or first value containing it); null if none.
function matchValue(col, text) {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const vals = [...new Set(state.all.map((p) => p[col]))].filter((v) => !state.picked[col].has(v));
  return vals.find((v) => shownValue(col, v).toLowerCase() === t)
    ?? vals.filter((v) => shownValue(col, v).toLowerCase().includes(t)).sort()[0] ?? null;
}

function pick(col, v) {
  state.picked[col].add(v);
  $(`f-${col}`).value = '';
  update();
}

// ---------- filters in the URL (shareable links) ----------
// #from=100 AD&to=200 AD&location=Thebes|Karanis&tax=poll tax&q=Pebrichis

function writeHash() {
  const prm = new URLSearchParams();
  if ($('f-from').value.trim()) prm.set('from', $('f-from').value.trim());
  if ($('f-to').value.trim()) prm.set('to', $('f-to').value.trim());
  MULTI.forEach((col) => { if (state.picked[col].size) prm.set(col, [...state.picked[col]].join('|')); });
  if ($('f-search').value.trim()) prm.set('q', $('f-search').value.trim());
  const h = prm.toString();
  history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search);
}

function readHash() {
  const prm = new URLSearchParams(location.hash.slice(1));
  $('f-from').value = prm.get('from') || '';
  $('f-to').value = prm.get('to') || '';
  $('f-search').value = prm.get('q') || '';
  MULTI.forEach((col) => { state.picked[col] = new Set(prm.has(col) ? prm.get(col).split('|') : []); });
}

// ---------- formatting ----------

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function setStatus(msg) {
  $('status').textContent = msg;
}

// ---------- filtering & table ----------

// A payment matches when it is in any picked value of each multi-select filter, its date range
// overlaps the year range, and it contains the search text.
function filtered() {
  const s = $('f-search').value.trim().toLowerCase();
  const from = parseYear($('f-from').value), to = parseYear($('f-to').value);
  return state.all.filter((p) => {
    if (MULTI.some((col) => state.picked[col].size && !state.picked[col].has(p[col]))) return false;
    if (from != null && (p.yearEnd == null || p.yearEnd < from)) return false;
    if (to != null && (p.year == null || p.year > to)) return false;
    if (s && !LIST_COLS.map((c) => p[c]).join(' ').toLowerCase().includes(s)) return false;
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
    <tr><td><a href="payment.html?id=${encodeURIComponent(p.id)}">${esc(p.id)}</a></td>${
      LIST_COLS.slice(1).map((c) => `<td>${cellHtml(p, c)}</td>`).join('')}</tr>`).join('');

  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.dataset.label ||= th.textContent;
    th.textContent = th.dataset.label + (th.dataset.sort === state.sortKey ? (state.sortDir === 1 ? ' ▲' : ' ▼') : '');
  });
  const bad = ['f-from', 'f-to'].filter((id) => Number.isNaN(parseYear($(id).value)));
  setStatus(bad.length
    ? 'Year not understood: enter a year like 100 BC or 57 AD.'
    : `${state.shown.length.toLocaleString()} of ${state.all.length.toLocaleString()} payments`);
}

// Filters changed: refresh picked values, suggestions, table and URL.
function update() {
  showPicked();
  fillOptions();
  render();
  writeHash();
}

async function load() {
  try {
    state.all = await fetchPayments();
  } catch (err) {
    return setStatus(`Could not load data. ${err.message}`);
  }
  const ys = state.all.map((p) => p.year).filter((y) => y != null);
  $('f-from').placeholder = fmtYear(Math.min(...ys));
  $('f-to').placeholder = fmtYear(Math.max(...ys));
  readHash();
  update();
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

// ---------- payment page ----------

async function loadPayment() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return setStatus('No payment ID given.');
  try {
    const p = (await fetchPayments()).find((r) => r.id === id);
    if (!p) return setStatus(`Payment ${id} not found.`);
    document.title = `${p.id} | Ancient Taxation Database`;
    $('payment-id').textContent = p.id;
    const label = (c) => c[0].toUpperCase() + c.slice(1);
    $('payment').innerHTML = COLS.slice(1).map((c) =>
      `<tr><th align="left">${label(c)}</th><td>${cellHtml(p, c)}</td></tr>`).join('');
    setStatus('');
  } catch (err) {
    setStatus(`Could not load data. ${err.message}`);
  }
}

// ---------- wiring ----------

if ($('payment')) {
  loadPayment();
} else {
  MULTI.forEach((col) => {
    const input = $(`f-${col}`);
    // A value chosen from the suggestion list is picked at once; Enter picks the best match of the typed text.
    input.addEventListener('input', () => {
      const v = matchValue(col, input.value);
      if (v != null && shownValue(col, v).toLowerCase() === input.value.trim().toLowerCase()) pick(col, v);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const v = matchValue(col, input.value);
      if (v != null) pick(col, v);
    });
    $(`picked-${col}`).addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      state.picked[col].delete(b.dataset.value);
      update();
    });
  });
  ['f-from', 'f-to', 'f-search'].forEach((id) => $(id).addEventListener('input', () => { render(); writeHash(); }));
  $('btn-reset').addEventListener('click', () => {
    ['f-from', 'f-to', 'f-search', ...MULTI.map((c) => `f-${c}`)].forEach((id) => { $(id).value = ''; });
    MULTI.forEach((col) => state.picked[col].clear());
    update();
  });
  $('btn-csv').addEventListener('click', downloadCsv);
  document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
    state.sortDir = state.sortKey === th.dataset.sort ? -state.sortDir : 1;
    state.sortKey = th.dataset.sort;
    render();
  }));
  load();
}
