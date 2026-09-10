# Handover — Aus- und Weiterbildung Prototype

Audience: SAP developers estimating implementation effort in a real SAP environment (e.g. S/4HANA / SuccessFactors / CAP + Fiori).

This document describes **product intent** encoded in the prototype. Treat React + localStorage as disposable scaffolding.

**Baseline:** **V1 (Wizard)** — routes under `/home` and `/weiterbildung/...`. A form-based alternate under `/v2` shares the same domain layer but is **not** the handover baseline.

---

## 1. In scope vs out of scope

### In scope (requirements evidence — V1)

- End-to-end process: **Antrag → Vereinbarung → Ausbildung → Abschluss**
- Role-based actions for **Mitarbeitende/r (MA)** and **Vorgesetzte/r (VG)**
- Wizard capture of Grunddaten, Kosten, Arbeitszeit (3 steps)
- Field validation with MessageStrip / MessageView (wizard Absenden and Ausbildung Bestätigen)
- Review/approval, send-back (“Zur Überarbeitung”), resubmit with change highlighting
- Offer creation (Vereinbarung), send to MA, accept/reject
- Positive confirmation strips after MA Absenden, VG Angebot send, and MA Angebot accept
- Ausbildung outcomes (bestanden / nicht bestanden + Wiederholung / Abbruch) with consequence confirm dialogs where repayment / HR follow-up applies
- Micro process visualization of Hauptstatus progress
- Timeline feed (Kommentare / Aktivitäten)

### Out of scope (do not reimplement as-is)

- Auth / real identity (persona switcher only)
- OData, CAP, RAP, workflow engine, HR master data services
- Production attachment service (`dokumente.ts` / IndexedDB exists as unused plumbing; **no Dokumente step in the V1 wizard**)
- Fiori Elements metadata (this prototype is freestyle UI5 Web Components React)
- i18n framework (UI strings are hardcoded German)
- Multi-language, audit logging, authorization concepts beyond MA/VG demo
- V2 form variant as estimation evidence

---

## 2. Screen map (V1)

```text
Prototype index (/)
  └─ Variante mit Wizard → Launchpad (/home)
       └─ Aus- und Weiterbildung
            ├─ Employee list (VG)           /weiterbildung
            └─ Employee object page         /weiterbildung/:employeeId
                 ├─ Wizard (create/edit)    .../antrag/neu|bearbeiten/:step
                 │     1 Grunddaten · 2 Kosten · 3 Arbeitszeit
                 └─ Review object page      .../antrag/:antragId
                      ├─ Tab Antrag
                      ├─ Tab Vereinbarung
                      ├─ Tab Ausbildung
                      └─ Tab Aktivitäten
```

**MA:** no navigable breadcrumbs to the employee list; list route redirects to own case.

---

## 3. Roles

| Persona (demo) | Role | Capabilities (summary) |
|----------------|------|------------------------|
| Markus Mettler | Vorgesetzte/r | List employees, review Anträge, edit while in Prüfung, create/send Angebot, reject |
| Fankhauser Fabian | Mitarbeitende/r | Own case only: create/edit Entwurf, revise after send-back, accept/reject Angebot, confirm Ausbildung outcomes |

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
| `In Überarbeitung` | MA currently saving in revision |
| `Eingereicht` / `Wieder eingereicht` | Submitted / resubmitted for VG |
| `In Prüfung VG` | With supervisor |
| `Angebot erstellen` | VG builds Vereinbarung |
| `Angebot zur Prüfung` | MA reviews offer |
| `Angebot angenommen` / `Ausbildung gestartet` | Offer accepted; training running |
| Terminal statuses | e.g. abgelehnt, abgebrochen, bestanden, Prüfung nicht bestanden |

**Naming note for estimators:** `Zur Überarbeitung` = sent back; `In Überarbeitung` = MA actively editing after send-back.

### Action matrix (happy path)

| From | Actor | Action | To (typical) |
|------|-------|--------|--------------|
| Entwurf | MA | Absenden | In Prüfung VG (+ Positive strip on review) |
| In Prüfung / Wieder eingereicht | VG | Zur Überarbeitung | Zur Überarbeitung |
| Zur Überarbeitung | MA | Bearbeiten + Absenden | Wieder eingereicht (changes highlighted) |
| In Prüfung / Wieder eingereicht | VG | Genehmigen | Angebot erstellen |
| Angebot erstellen | VG | An MA senden | Angebot zur Prüfung (+ Positive strip for VG) |
| Angebot zur Prüfung | MA | Akzeptieren / Ablehnen | Ausbildung gestartet / Angebot abgelehnt (+ Positive strip on accept) |
| In Prüfung | VG | Ablehnen | Antrag abgelehnt |
| Ausbildung | **MA** | Bestätigen (validated; consequence dialog for Abbruch / keine Wiederholung) | Abschluss or retry Ausbildung |

VG edit special case: opening the wizard from `In Prüfung VG` / `Wieder eingereicht` moves to `Entwurf` via `beginVgAntragEdit`; submitting returns to `In Prüfung VG` **without** a new timeline entry (`isVgDraftResubmit`).

---

## 5. Data model sketch

```text
WeiterbildungAntrag
  id, employeeId
  hauptstatus, unterstatus
  ausbildung, anbieter, von, bis, hasVertrag
  form: AntragFormData          // wizard fields
  dokumente: AntragDokument[]   // unused in V1 UI; blobs scaffolding in IndexedDB
  vereinbarung?: VereinbarungData
  ausbildungUpdate?: AusbildungUpdateDraft
  kommentareAktivitaeten: FeedEintrag[]
  aktuellBeiLabel
  formBaselineVorUeberarbeitung / dokumenteBaseline…  // change highlighting
  createdAt, updatedAt
```

Domain modules:

| Module | Responsibility |
|--------|----------------|
| `src/data/antrag/types.ts` | Types |
| `constants.ts` | Options, thresholds, storage keys |
| `format.ts` | Display / date helpers |
| `kosten.ts` | CHF / Beteiligung / Vertragsschwelle |
| `phases.ts` | Phase predicates, Ausbildung draft helpers |
| `validation.ts` | Wizard form validation |
| `ausbildungValidation.ts` | Ausbildung confirm validation + consequence copy |
| `feed.ts` | Timeline / comments (chronological) |
| `dokumente.ts` | IndexedDB blobs (unused in V1 UI) |
| `service.ts` | CRUD + status transitions |
| `demoSeed.ts` | Navigable demo Anträge (localStorage seed) |
| `antraege.ts` | Barrel re-export (legacy import path) |

Master / status data:

- `employees.ts` — demo employees
- `personas.ts` — MA/VG switcher
- `weiterbildungen.ts` — `STATUS_CATALOG`, Aktuell-bei, phase order helpers

---

## 6. Demo Anträge (navigable seed)

All employee object-page rows are **real** `WeiterbildungAntrag` records in `localStorage` (`awb-antraege`).

Seeded on app start by `ensureDemoAntraege()` in [`src/data/antrag/demoSeed.ts`](src/data/antrag/demoSeed.ts) (called from `main.tsx`).

| Employee | Demo inventory |
|----------|----------------|
| **Fankhauser Fabian** (`emp-006`) | **One Antrag per** `STATUS_CATALOG` pair (**17** rows) — full status showcase |
| **Every other employee** (14) | Exactly **2** Anträge; statuses chosen with a deterministic PRNG |
| **Total** | 17 + 14×2 = **45** Anträge |

Ids are stable (`demo-{employeeId}-{hauptstatus}-{unterstatus}`). Rows open in review (or wizard for `Entwurf`).

### Reset rule

- Version key: `awb-demo-antraege-version` (constant `DEMO_ANTRAEGE_VERSION` in `demoSeed.ts`).
- On version **mismatch**, the entire `awb-antraege` store is **replaced** with the generated demo set.
- Bump `DEMO_ANTRAEGE_VERSION` (or clear both storage keys) to refresh demo data.
- **Note:** a version bump wipes ad-hoc Anträge created during a session (prototype intentional).

---

## 7. Suggested SAP mapping (non-binding)

| Prototype concern | Typical SAP direction |
|-------------------|----------------------|
| Floorplans | List Report + Object Page (+ Wizard or guided activity) |
| Status / actions | RAP determinations / actions or workflow; expose as OData |
| Roles | PFCG / IAS + backend auth; not UI persona switch |
| Attachments | Content repository / Attachment Service (if required; not in V1 UX) |
| Feed | Timeline / notes BO or change documents |
| Kosten / Vertrag rules | Backend calculation; UI displays results |
| Freestyle UI5 vs Fiori Elements | Decide per complexity (Vereinbarung rules may stay freestyle sections) |

Effort drivers visible in V1: multi-step wizard validation, revision loop + field highlighting, offer/cost matrix, role-gated Object Page actions, Ausbildung confirmation with validation and consequence dialogs, process timeline.

---

## 8. Code map for reviewers (V1)

| Path | Why it matters |
|------|----------------|
| `src/App.tsx` | Routes / screen inventory |
| `src/pages/AusbildungAntragWizardPage.tsx` | Capture UX + form validation |
| `src/pages/AusbildungAntragReviewPage.tsx` | Approval / offer / Ausbildung UX |
| `src/components/VereinbarungSection.tsx` | Angebot / Beitrag / Vertrag |
| `src/components/AusbildungSection.tsx` | Ausbildung status UI |
| `src/data/weiterbildungen.ts` | `STATUS_CATALOG` |
| `src/data/antrag/demoSeed.ts` | Navigable demo inventory + versioned reset |
| `src/data/antrag/service.ts` | Status transitions (core process) |
| `src/data/antrag/phases.ts` | When UI enables actions |
| `src/data/antrag/kosten.ts` | Beteiligung / Vertrag rules |
| `src/data/antrag/validation.ts` | Wizard field validation |
| `src/data/antrag/ausbildungValidation.ts` | Ausbildung validation + consequence confirm |
| `src/context/PrototypePersonaContext.tsx` | Demo roles only |

**V2 footnote:** pages under `src/pages/v2/` implement a single-page form capture. Same `src/data/antrag/` domain. Prefer V1 for UX and estimation.