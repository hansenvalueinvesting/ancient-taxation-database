# The Ancient Taxation Database (ATD)

A standardized, open record of individual tax payments in the ancient world, for scholars of the ancient economy. Each surviving tax receipt is broken into its individual transactions, one row per payment, so that trends can be analyzed by date, location, payer, collector, tax, amount and payment type. Created and maintained by Hansen Zheng. Separate from the Ancient Loans Database (ALD).

Scope: starting with Roman Egypt (mainly papyri and ostraca from Thebes and Karanis); to be expanded to other regions and periods.

Data: `atd.csv`. Viewer: `docs/` (GitHub Pages).

## Fields (`atd.csv`, columns in this order)

| Column | Content | Example |
|--------|---------|---------|
| id | `ATD-` + 6-digit zero-padded sequential number; never reused | `ATD-000001` |
| date | BC/AD date, to the precision the receipt gives | `128 AD` / `8 Aug 128 AD` / `30 BC` |
| location | Place of payment; if not stated on the receipt, the document's provenance | `Thebes` |
| payer | Name as written on the document, transliterated in that language's form (Greek names keep Greek spelling, Latin names Latin), with patronym if given | `Pamonthes son of Haryothes` |
| collector | Name as written, as for payer; several collectors separated by `; ` | `Apollonios; Herakleides` |
| tax | The tax or charge paid for | `bath tax (βαλανευτικόν)` |
| amount | Purely numeric | `8.2857` |
| unit | Currency or measure of the amount | `drachmas` / `denarii` / `artabas` |
| type | `money`, or the commodity paid | `money` / `wheat` / `barley` |
| source | Standard publication reference of the document | `O.Lips. 123` |
| source_url | The online edition (papyri: `https://papyri.info/ddbdp/<DDbDP id>`); the site links the source to it | `https://papyri.info/ddbdp/o.heid;;100` |
| notes | Original text of the document and an English translation, then the credit line (see below) | |

## Conventions

1. **What counts**: a tax is a payment to the government (working definition; to be refined).
2. **One row per transaction.** A receipt with several payments becomes several rows sharing the same source. Payments in different currencies or commodities on the same receipt are separate rows.
3. **Money** converts only within its own currency system, into that system's main unit; never between systems.
   - Greek/Egyptian drachma system: 1 drachma = 7 obols; 1 obol = 8 chalkoi (1 drachma = 56 chalkoi). Recorded in drachmas, rounded to 4 decimals. Example: 8 dr. 2 ob. = 8.2857 drachmas.
   - Roman denarius system: recorded in denarii, not drachmas.
   - Any new currency system: its denominations and main unit are confirmed before data is entered, and its rates are documented here.
4. **In-kind payments** keep their own unit (e.g. wheat in artabas). Commodities are never converted to money.
5. **Dates**: regnal years (emperor + year) and local calendars are recorded in BC/AD form: `128 AD` (year only), `8 Aug 128 AD` (full date), `30 BC`.
6. **Unknown or lost values**: the field is left blank. Nothing is guessed.

7. **Notes**: two sections, then the credit line:
   ```
   Original Text:
   <the original text, line by line with line numbers, copied exactly from the edition in its
   Leiden notation: [ ] restored, ( ) expanded, ⟦ ⟧ deleted, ⟨ ⟩ added, { } surplus, [...] lost>

   English translation:
   <faithful translation of exactly that text; lost text as [...]; uncertain words marked (?)>

   <credit line of the source corpus and its licence>
   ```
   All rows from one document share its note. Papyri credit line: "Original text: Duke Databank of Documentary Papyri (DDbDP); metadata: Heidelberger Gesamtverzeichnis der griechischen Papyrusurkunden Ägyptens (HGV); via papyri.info (github.com/papyri/idp.data), licensed CC BY 3.0."

## Sources

Roman Egyptian texts: papyri.info, Trismegistos.

## Change log

**2026-10-07 (source links)**
- New column `source_url` (after `source`), filled for ATD-000001 - 000024; sources on the site link to the online edition.

**2026-10-07 (first data)**
- Added ATD-000001 - 000024 (24 payments): 22 tax receipts on ostraca from Thebes, O.Heid. 100-144 (2nd century AD; DDbDP/HGV via papyri.info). Pilot: formats still under review. Database: 24 payments.

**2026-10-07 (schema)**
- New columns `tax` (after `collector`) and `notes` (last). Names: as on the document, in its language's spelling.

**2026-10-07**
- Repository created: `atd.csv` (headers only), README, viewer (`docs/`). Database: 0 payments.
