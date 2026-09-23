# Aus- und Weiterbildung — Fiori Prototype

Clickable React prototype for HR **Aus- und Weiterbildung** (Antrag → Vereinbarung → Ausbildung → Abschluss). Built for UX validation and as a **basis for SAP implementation effort estimates**.

Stack: React 19 + Vite + TypeScript + UI5 Web Components for React (Horizon).

The **handover baseline is V1 (Wizard)** under `/home`. A form-based alternate exists under `/v2` (same data model); it is not the estimation baseline — see [HANDOVER.md](./HANDOVER.md).

## Quick start

```bash
npm install
npm run build:theme   # once, or after theme token changes
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). Use **one** active Vite instance — multiple ports can serve stale bundles.

Node **22** matches the GitHub Pages workflow.

## How to explore (V1)

1. Open `/` (prototype index) and choose **Variante mit Wizard**.
2. On the launchpad, open the tile **Aus- und Weiterbildung**.
3. Switch persona via the ShellBar profile menu:
   - **Markus Mettler** — Vorgesetzte/r (sees employee list)
   - **Fankhauser Fabian** — Mitarbeitende/r (lands on own object page)
4. Create or open an Antrag, walk the **3-step wizard**, then use the review page actions per role.

**Demo lists:** Fankhauser Fabian’s object page shows **one Antrag for every Haupt-/Unterstatus** (status showcase). Other employees each have **two** navigable demo Anträge. Seed resets when `DEMO_ANTRAEGE_VERSION` changes (see HANDOVER.md).

## Screens (V1)

| Route | Floorplan / pattern |
|-------|---------------------|
| `/` | Prototype index (pick V1 Wizard) |
| `/home` | Launchpad (Meine Startseite) |
| `/weiterbildung` | List Report (employees; VG only) |
| `/weiterbildung/:employeeId` | Object Page (employee + Weiterbildungen table) |
| `.../antrag/neu/:step` / `.../bearbeiten/:step` | Wizard — Grunddaten, Kosten, Arbeitszeit |
| `.../antrag/:antragId` | Object Page / review (Antrag, Vereinbarung, Ausbildung, Aktivitäten) |

## Documentation for SAP handover

See **[HANDOVER.md](./HANDOVER.md)** for role & status matrices, data model, demo inventory, and suggested SAP mapping. Estimators should use **V1** as product evidence.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run build:theme` | Compile custom theme LESS → CSS |
| `npm run dev` | Local prototype |
| `npm run build` | Typecheck + production build |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview production build |

## Important

This is **not** a production SAP app: no OData/CAP, no real auth, persistence is `localStorage` (+ unused IndexedDB scaffolding for documents) for demo only.
