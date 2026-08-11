# Handover — Aus- und Weiterbildung Prototype

Audience: SAP developers estimating implementation effort in a real SAP environment (e.g. S/4HANA / SuccessFactors / CAP + Fiori).

This document describes **product intent** encoded in the prototype. Treat React + localStorage as disposable scaffolding.

---

## 1. In scope vs out of scope

### In scope (requirements evidence)

- End-to-end process: **Antrag → Vereinbarung → Ausbildung → Abschluss**
- Role-based actions for **Mitarbeitende/r (MA)** and **Vorgesetzte/r (VG)**
- Wizard capture of Grunddaten, Kosten, Arbeitszeit, Dokumente, Kommentar
- Review/approval, send-back (“Zur Überarbeitung”), resubmit with change highlighting
- Offer creation (Vereinbarung), send to MA, accept/reject
- Ausbildung outcomes (bestanden / nicht bestanden / Abbruch) and timeline feed
- Micro process visualization of Hauptstatus progress

### Out of scope (do not reimplement as-is)

- Auth / real identity (persona switcher only)
- OData, CAP, RAP, workflow engine, HR master data services
- Production attachment service (prototype uses IndexedDB blobs, 2 MB cap)
- Fiori Elements metadata (this prototype is freestyle UI5 Web Components React)
- i18n framework (UI strings are hardcoded German)
- Multi-language, audit logging, authorization concepts beyond MA/VG demo

---

## 2. Screen map

```text
Launchpad (/)
  └─ Aus- und Weiterbildung
       ├─ Employee list (VG)           /weiterbildung
       └─ Employee object page         /weiterbildung/:employeeId
            ├─ Wizard (create/edit)    .../antrag/neu|bearbeiten/:step
            └─ Review object page      .../antrag/:antragId
                 ├─ Tab Antrag
                 ├─ Tab Vereinbarung
                 ├─ Tab Ausbildung
                 └─ Feed (Kommentare / Aktivitäten)
```

**MA:** no navigable breadcrumbs to the employee list; list route redirects to own case.

---

## 3. Roles

| Persona (demo) | Role | Capabilities (summary) |
|----------------|------|------------------------|
| Markus Mettler | Vorgesetzte/r | List employees, review Anträge, edit while in Prüfung, create/send Angebot, reject, confirm Ausbildung updates (as modeled) |
| Fankhauser Fabian | Mitarbeitende/r | Own case only: create/edit Entwurf, revise after send-back, accept/reject Angebot, update Ausbildung outcomes |

Access guard: `ownsEmployee(employeeId)` — VG owns all; MA only own `employeeId`.

---

## 4. Status model

### Hauptstatus

`Antrag` → `Vereinbarung` → `Ausbildung` → `Abschluss`

### Unterstatus (selected)

| Unterstatus | Meaning (prototype) |
|-------------|---------------------|
| `Entwurf` | Editable draft (MA create, or VG edit after moving from Prüfung) |
| `Zur Überarbeitung` | VG sent back; waiting for MA |
| `In Überarbeitung` | MA currently saving in revision (`Zur Überarbeitung` → draft-like work) |
| `Eingereicht` / `Wieder eingereicht` | Submitted / resubmitted for VG |
| `In Prüfung VG` | With supervisor |
| `Angebot erstellen` | VG builds Vereinbarung |
| `Angebot zur Prüfung` | MA reviews offer |
| `Angebot angenommen` / `Ausbildung gestartet` | Offer accepted; training running |
| Terminal statuses | e.g. abgelehnt, abgebrochen, bestanden, Prüfung nicht bestanden |

**Naming note for estimators:** `Zur Überarbeitung` = sent back; `In Überarbeitung` = MA actively editing after send-back. Both are MA-side revision.

### Action matrix (happy path)

| From | Actor | Action | To (typical) |
|------|-------|--------|--------------|
| Entwurf | MA | Einreichen | In Prüfung VG (+ timeline) |
| In Prüfung / Wieder eingereicht | VG | Zur Überarbeitung | Zur Überarbeitung |
| Zur Überarbeitung | MA | Bearbeiten + Einreichen | Wieder eingereicht (changes highlighted) |
| In Prüfung / Wieder eingereicht | VG | Genehmigen | Angebot erstellen |
| Angebot erstellen | VG | An MA senden | Angebot zur Prüfung |
| Angebot zur Prüfung | MA | Akzeptieren / Ablehnen | Ausbildung gestartet / Angebot abgelehnt |
| In Prüfung | VG | Ablehnen | Antrag abgelehnt |
| Ausbildung | MA/VG (as modeled) | Outcome confirm | Abschluss variants |

VG edit special case: opening the wizard from `In Prüfung VG` / `Wieder eingereicht` moves to `Entwurf` via `beginVgAntragEdit`; submitting returns to `In Prüfung VG` **without** a new timeline entry (`isVgDraftResubmit`).

---

## 5. Data model sketch

```text
WeiterbildungAntrag
  id, employeeId
  hauptstatus, unterstatus
  ausbildung, anbieter, von, bis, hasVertrag
  form: AntragFormData          // wizard fields
  dokumente: AntragDokument[]   // metadata; blobs in IndexedDB
  vereinbarung?: VereinbarungData
  ausbildungUpdate?: AusbildungUpdateDraft
  kommentareAktivitaeten: FeedEintrag[]
  aktuellBeiLabel
  formBaselineVorUeberarbeitung / dokumenteBaseline…  // change highlighting
  createdAt, updatedAt
```

Domain modules (after cleanup):

| Module | Responsibility |
|--------|----------------|
| `src/data/antrag/types.ts` | Types |
| `constants.ts` | Options, thresholds, storage keys |
| `format.ts` | Display / date helpers |
| `kosten.ts` | CHF / Beteiligung / Vertragsschwelle |
| `phases.ts` | Phase predicates, change diff |
| `feed.ts` | Timeline / comments |
| `dokumente.ts` | IndexedDB blobs |
| `service.ts` | CRUD + status transitions |
| `demoSeed.ts` | Navigable demo Anträge (localStorage seed) |
| `antraege.ts` | Barrel re-export (legacy import path) |

Master / status data:

- `employees.ts` — demo employees
- `personas.ts` — MA/VG switcher
- `weiterbildungen.ts` — status catalog (`STATUS_CATALOG`), Aktuell-bei, phase order helpers (no list seed rows)

---

## 6. Demo Anträge (navigable seed)

All employee object-page rows are **real** `WeiterbildungAntrag` records in `localStorage` (`awb-antraege`). There is no display-only / non-navigable list anymore.

Seeded on app start by `ensureDemoAntraege()` in [`src/data/antrag/demoSeed.ts`](src/data/antrag/demoSeed.ts) (called from `main.tsx`).

| Employee | Demo inventory |
|----------|----------------|
| **Fankhauser Fabian** (`emp-006`) | **One Antrag per valid Haupt-/Unterstatus pair** from `STATUS_CATALOG` (**18** rows) — full status showcase |
| **Every other employee** | Exactly **2** Anträge; statuses chosen with a deterministic PRNG from the same catalog |
| **Total** | 18 + 14×2 = **46** Anträge |

Ids are stable (`demo-{employeeId}-{hauptstatus}-{unterstatus}`). Rows open in review (or wizard for `Entwurf`).

### Reset rule

- Version key: `awb-demo-antraege-version` (constant `DEMO_ANTRAEGE_VERSION` in `demoSeed.ts`).
- On version **mismatch**, the entire `awb-antraege` store is **replaced** with the generated demo set.
- Bump `DEMO_ANTRAEGE_VERSION` (or clear both storage keys) to refresh demo data.
- **Note:** a version bump wipes ad-hoc Anträge created during a session (prototype intentional).

Documents: metadata on the Antrag; binary in IndexedDB (`awb-dokumente`).

---

## 7. Suggested SAP mapping (non-binding)

| Prototype concern | Typical SAP direction |
|-------------------|----------------------|
| Floorplans | List Report + Object Page (+ Wizard or guided activity) |
| Status / actions | RAP determinations / actions or workflow; expose as OData |
| Roles | PFCG / IAS + backend auth; not UI persona switch |
| Attachments | Content repository / Attachment Service |
| Feed | Timeline / notes BO or change documents |
| Kosten / Vertrag rules | Backend calculation; UI displays results |
| Freestyle UI5 vs Fiori Elements | Decide per complexity (Vereinbarung rules may stay freestyle sections) |

Effort drivers visible in the prototype: multi-step wizard validation, revision loop + field highlighting, offer/cost matrix, role-gated Object Page actions, document upload, process timeline.

---

## 8. Code map for reviewers

| Path | Why it matters |
|------|----------------|
| `src/App.tsx` | Routes / screen inventory |
| `src/data/weiterbildungen.ts` | `STATUS_CATALOG` — valid Haupt-/Unterstatus pairs |
| `src/data/antrag/demoSeed.ts` | Navigable demo inventory + versioned reset |
| `src/data/antrag/service.ts` | Status transitions (core process) |
| `src/data/antrag/phases.ts` | When UI enables actions |
| `src/data/antrag/kosten.ts` | Business rules for Beteiligung / Vertrag |
| `src/pages/AusbildungAntragWizardPage.tsx` | Capture UX |
| `src/pages/AusbildungAntragReviewPage.tsx` | Approval / offer / Ausbildung UX |
| `src/context/PrototypePersonaContext.tsx` | Demo roles only |

---

## 9. Cleanup already done for handover

- Debug ingest logging removed
- Domain logic split under `src/data/antrag/`
- Shared `OwnCaseGuard` for case access messaging
- Vite `code-inspector` plugin removed from config
- Non-navigable `WEITERBILDUNGEN` list removed; `getMergedWeiterbildungenByEmployee` lists persisted Anträge only
- Versioned navigable demo seed (`demoSeed.ts`) with Fabian status showcase
- README rewritten; this file maintained as the SAP estimator entry point

Optional follow-ups: extract wizard step sections into components; migrate imports from `antraege` to `antrag`.
