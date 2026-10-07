# The Ancient Taxation Database (ATD)
Created and maintained by Hansen Zheng. Separate from the Ancient Loans Database (ALD).

## Purpose
Standardized, open database of individual tax payments from the ancient world: each surviving
tax receipt broken into individual transactions, one row per payment. Starting with Roman Egypt
(Thebes, Karanis); nothing in the structure is Egypt-specific.

## Working rules (read first)
- Hansen decides. Start simple; do nothing beyond what Hansen explicitly asks.
- Never change the schema, field formats or conventions on your own; ask Hansen.
- Repo holds only clean data + docs + the viewer. No pipeline, scraping or data-acquisition code.
- Keep this file and the README current: Hansen's decisions here; every data change in the README
  change log, most recent first.

## Architecture (Hansen, Oct 2026)
- Data: `atd.csv` in the repo (no Supabase or other backend). Columns in this exact order:
  id, date, location, payer, collector, tax, amount, unit, type, source, notes (tax and notes added by
  Hansen, Oct 2026). No source_url column (Hansen: "don't add a column, just hyperlink it"). Field docs + conventions in `README.md`.
- Viewer: `docs/` (GitHub Pages), same style as the ALD site (plain HTML + `docs/app.js`, no CSS).
  Reads `atd.csv` from the main branch (`CSV_URL` in `docs/config.js`). Catalogue tree under
  "All payments": location > century, earliest first, unknowns last; URL hash `#loc=Thebes&c=2`.
  Table sortable by every column (notes not in the table); filters: search, Location, Tax, Unit, Type,
  from/to year; CSV download. `payment.html?id=ATD-000001` shows one payment incl. notes. Source is hyperlinked, the URL
  built from the citation in app.js (`sourceUrl`: papyri.info/ddbdp/<series>;<vol>;<no>, e.g. `o.heid;;100`).
- Merge to main automatically when a task is finished (Hansen, Oct 2026).

## Data standards (Hansen's handoff)
- id `ATD-` + 6 digits, sequential, never reused. One row per transaction; different currencies or
  commodities on one receipt = separate rows.
- Money converts only within its own system into the main unit: drachma system 1 dr. = 7 ob.,
  1 ob. = 8 chalkoi (1 dr. = 56 ch.), in drachmas, 4 decimals (8 dr. 2 ob. = 8.2857); denarius system in
  denarii. New currency system: confirm denominations and main unit with Hansen first, then document in README.
- In-kind keeps its own unit; never converted to money.
- Dates in BC/AD: `128 AD`, `8 Aug 128 AD`, `30 BC`.
- Unknown or lost = blank. Never guess.
- Tax = a payment to the government (Hansen, Oct 2026; "keep the original definition"). Poll, bath, dike,
  guard and burial taxes count (Hansen: "in that case these count"). Rent, prices, fees for a chosen
  service and labour duties (penthemeros) are left out.
- tax field (Hansen, Oct 2026: "very clear ... no Greek ... standardized into large categories"): one of
  poll tax, bath tax, dike tax, guard tax, land tax, crop tax, trade tax, customs, sales tax, burial tax,
  levy, animal tax, other; one sum for several taxes = `mixed` (Hansen); lost = blank. Mapping used:
  land survey (geometria), palm groves, granary grain = land tax; "price of" dates/wine/wheat = crop tax;
  agoranomia = sales tax; ferry = customs; weavers, menders, clothing sellers, hunting = trade tax;
  pasture, sheep = animal tax; crown tax, canal, double charges (diploi), supplement (prosthesis),
  arrears, pentaphylia, brick, unnamed monthly tax = other.
- Dates from HGV; alternative dates -> span earliest to latest, uncertain -> ` (?)`; a payment dated
  differently on the receipt gets its own converted date.
- Names (Hansen, Oct 2026): "use whatever is on the original document": Greek documents keep Greek
  spelling (Apollonios), Latin ones Latin, etc.
- notes: same structure as the ALD (Original Text, English translation, credit line), see README.

## Method (Roman Egypt)
- Source: github.com/papyri/idp.data (CC BY 3.0). DDbDP texts are now at `DDbDP/<TM//1000>/<TM>.xml`
  (named by TM number), HGV metadata at `HGV_meta_EpiDoc`. Candidates: HGV terms `Quittung` + `Steuer`,
  dated 30 BC-AD 284: 976 texts (Thebes 239, Elephantine 89, Memnoneia 66, Soknopaiou Nesos 61, ...);
  a wider net (titles with `Quittung`) gives ~1,540 incl. rent, rations, granary receipts.
- Original text rendered from the EpiDoc by script (scratch folder; not in the repo).
- Extraction: subagents (batches of ~24) read the Greek, return rows (amounts as dr/ob/ch, converted by
  script) and a line-by-line translation (line numbers checked by script).

## Status
- Oct 2026: repo created (atd.csv headers only, README, viewer). 0 rows.
- Oct 2026: pilot of 25 Theban tax receipts (O.Heid. 100-144): 24 rows ATD-000001 - 000024 in atd.csv
  (Hansen wanted data on the site). O.Heid. 103, 114, 120 left out (no amount or tax preserved).
  Open questions to Hansen (rows to be corrected on his answers): editor-restored amounts (109, 110, 136:
  editor's figure used), receipts without amount (kept, amount/unit/type blank), date-range format
  (`Feb-Apr 190 AD (?)`, `138-139 AD`), several taxes for one sum (one row, `dike tax; bath tax (χωματικόν;
  βαλανευτικόν)`; separately itemised sums = separate rows), dirty drachmas (as `drachmas`), "X and
  partners" collectors, in-kind fractions (1/12 artaba = 0.0833), O.Heid. 139 sum mismatch (text figure used).
- Oct 2026: Thebes done: all 240 HGV tax receipts from Thebes (30 BC-AD 284 by start date) reviewed;
  ATD-000001 - 000278. Left out: O.Heid. 103, 114, 120, 206, 207, 214, 217, 470, 500, 54, 99, 160,
  O.Petr. Mus. 315, 330 (fragments), O.Heid. 219, 251 (rent), O.Heid. 93 (no text).
  Open for Hansen: several receipts (O.Petr. Mus. 307-310, O.Strasb. 2 819, 822, P.Hoogendijk 14,
  P.Bagnall 60) only add up with 6 obols to the drachma (converted at 7 per the handoff); O.Strasb.
  citations link wrongly (DDbDP series o.stras); many other series differ between citation and DDbDP id.
- Deferred (Hansen, Oct 2026): loading data on demand as the CSV grows (options discussed: per-node
  split files built by an Action; SQLite via sql.js-httpvfs). The site loads the whole atd.csv for now.
