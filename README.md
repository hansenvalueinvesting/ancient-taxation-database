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
| tax | One category: `poll tax`, `bath tax`, `dike tax`, `guard tax`, `land tax`, `crop tax`, `trade tax`, `customs`, `sales tax`, `burial tax`, `levy`, `animal tax`, `other`; `mixed` when one sum pays several taxes; blank if lost | `bath tax` |
| payer | Name as written on the document, transliterated in that language's form (Greek names keep Greek spelling, Latin names Latin), with patronym if given | `Pamonthes son of Haryothes` |
| collector | Name as written, as for payer; several collectors separated by `; ` | `Apollonios; Herakleides` |
| type | `currency`, or the commodity paid | `currency` / `wheat` / `barley` |
| amount | Purely numeric | `8.2857` |
| unit | Currency or measure of the amount | `drachmas` / `denarii` / `artabas` |
| source | Standard publication reference of the document; the site links it to the online edition (papyri: papyri.info) | `O.Lips. 123` |
| notes | Original text of the document and an English translation, then the credit line (see below) | |

## Conventions

1. **What counts**: a tax is a payment to the government. Counted: poll, bath, dike and guard taxes, taxes on land and crops (in money or in kind), levies, trade taxes, customs and tolls, sales and burial taxes. Rent, prices for goods, fees for a service the payer chose and labour duties are not taxes.
2. **One row per transaction.** A receipt with several payments (or sums stated separately for different taxes) becomes several rows sharing the same source; one sum paying several taxes is one row, tax `mixed`. Payments in different currencies or commodities on the same receipt are separate rows.
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

**2026-10-07 (columns)**
- Column order now id, date, location, tax, payer, collector, type, amount, unit, source, notes (CSV and site); type `money` renamed `currency`.

**2026-10-07 (site)**
- Catalogue replaced by filters: date range, location and tax (type to search, several at once), and search.

**2026-10-07 (Roman Egypt)**
- Added ATD-000279 - 003278 (3,000 payments): all remaining tax receipts of Roman Egypt, 30 BC - AD 284, in the DDbDP/HGV corpus (papyri.info): 1,612 further documents reviewed (HGV tax receipts plus receipts titled "Quittung" that are not rent, wages, loans or labour), 1,379 with tax payments. Largest places: Soknopaiou Nesos, Elephantine/Syene, Tebtunis, Thebes, Karanis, Memnonia, Philadelphia, Theadelphia. Left out: 85 too fragmentary, 23 rent, 14 prices, 12 labour (dike work), 99 not tax payments (army supplies, private receipts, transport, loans); 18 have no text online. Database: 3,278 payments.
- Locations: ancient names, Latinized as in the ALD (Tebtunis, Bacchias, Coptos, Oxyrhynchus), "Arsinoite nome" where only the nome is known, "X or Y" where the provenance is uncertain between two places.

**2026-10-07 (Thebes)**
- Added ATD-000025 - 000278 (254 payments): 201 further tax receipts from Thebes (O.Heid., O.Petr. Mus., O.Strasb. 2, P.Bagnall, P.Sijp., P.Hoogendijk, P.Rein. 2, SB), 1st century BC - 3rd century AD (DDbDP/HGV via papyri.info). 14 receipts left out (12 too fragmentary, 2 rent; O.Heid. 93 has no text online).
- Tax recorded as one standard category (English only); one sum paying several taxes = `mixed`. Applied to ATD-000001 - 000024. Dates with alternative readings span earliest to latest (ATD-000005, 000017 - 000019 corrected). Database: 278 payments.

**2026-10-07 (source links)**
- Sources on the site link to the online edition (papyri.info).

**2026-10-07 (first data)**
- Added ATD-000001 - 000024 (24 payments): 22 tax receipts on ostraca from Thebes, O.Heid. 100-144 (2nd century AD; DDbDP/HGV via papyri.info). Pilot: formats still under review. Database: 24 payments.

**2026-10-07 (schema)**
- New columns `tax` (after `collector`) and `notes` (last). Names: as on the document, in its language's spelling.

**2026-10-07**
- Repository created: `atd.csv` (headers only), README, viewer (`docs/`). Database: 0 payments.
