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
  id, date, location, payer, collector, amount, unit, type, source. Field docs + conventions in `README.md`.
- Viewer: `docs/` (GitHub Pages), same style as the ALD site (plain HTML + `docs/app.js`, no CSS).
  Reads `atd.csv` from the main branch (`CSV_URL` in `docs/config.js`). Catalogue tree under
  "All payments": location > century, earliest first, unknowns last; URL hash `#loc=Thebes&c=2`.
  Table sortable by every column; filters: search, Location, Unit, Type, from/to year; CSV download.

## Data standards (Hansen's handoff)
- id `ATD-` + 6 digits, sequential, never reused. One row per transaction; different currencies or
  commodities on one receipt = separate rows.
- Money converts only within its own system into the main unit: drachma system 1 dr. = 7 ob.,
  1 ob. = 8 chalkoi (1 dr. = 56 ch.), in drachmas, 4 decimals (8 dr. 2 ob. = 8.2857); denarius system in
  denarii. New currency system: confirm denominations and main unit with Hansen first, then document in README.
- In-kind keeps its own unit; never converted to money.
- Dates in BC/AD: `128 AD`, `8 Aug 128 AD`, `30 BC`.
- Unknown or lost = blank. Never guess.

## Status
- Oct 2026: repo created (atd.csv headers only, README, viewer). 0 rows.
- Deferred (Hansen, Oct 2026): loading data on demand as the CSV grows (options discussed: per-node
  split files built by an Action; SQLite via sql.js-httpvfs). The site loads the whole atd.csv for now.
