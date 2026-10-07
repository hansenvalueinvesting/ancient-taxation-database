# The Ancient Taxation Database (ATD)

A standardized, open record of individual tax payments in the ancient world, for scholars of the ancient economy. Each surviving tax receipt is broken into its individual transactions, one row per payment, so that trends can be analyzed by date, location, payer, collector, amount and payment type. Created and maintained by Hansen Zheng. Separate from the Ancient Loans Database (ALD).

Scope: starting with Roman Egypt (mainly papyri and ostraca from Thebes and Karanis); to be expanded to other regions and periods.

Data: `atd.csv`. Viewer: `docs/` (GitHub Pages).

## Fields (`atd.csv`, columns in this order)

| Column | Content | Example |
|--------|---------|---------|
| id | `ATD-` + 6-digit zero-padded sequential number; never reused | `ATD-000001` |
| date | BC/AD date, to the precision the receipt gives | `128 AD` / `8 Aug 128 AD` / `30 BC` |
| location | Place of payment; if not stated on the receipt, the document's provenance | `Thebes` |
| payer | Name as written (transliterated), with patronym if given | `Pamonthes son of Haryothes` |
| collector | Name as written; several collectors separated by `; ` | `Apollonios; Herakleides` |
| amount | Purely numeric | `8.2857` |
| unit | Currency or measure of the amount | `drachmas` / `denarii` / `artabas` |
| type | `money`, or the commodity paid | `money` / `wheat` / `barley` |
| source | Standard publication reference of the document | `O.Lips. 123` |

## Conventions

1. **One row per transaction.** A receipt with several payments becomes several rows sharing the same source. Payments in different currencies or commodities on the same receipt are separate rows.
2. **Money** converts only within its own currency system, into that system's main unit; never between systems.
   - Greek/Egyptian drachma system: 1 drachma = 7 obols; 1 obol = 8 chalkoi (1 drachma = 56 chalkoi). Recorded in drachmas, rounded to 4 decimals. Example: 8 dr. 2 ob. = 8.2857 drachmas.
   - Roman denarius system: recorded in denarii, not drachmas.
   - Any new currency system: its denominations and main unit are confirmed before data is entered, and its rates are documented here.
3. **In-kind payments** keep their own unit (e.g. wheat in artabas). Commodities are never converted to money.
4. **Dates**: regnal years (emperor + year) and local calendars are recorded in BC/AD form: `128 AD` (year only), `8 Aug 128 AD` (full date), `30 BC`.
5. **Unknown or lost values**: the field is left blank. Nothing is guessed.

## Sources

Roman Egyptian texts: papyri.info, Trismegistos.

## Change log

**2026-10-07**
- Repository created: `atd.csv` (headers only), README, viewer (`docs/`). Database: 0 payments.
