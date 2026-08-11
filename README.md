# Aus- und Weiterbildung — Fiori Prototype

Clickable React prototype for HR **Aus- und Weiterbildung** (Antrag → Vereinbarung → Ausbildung → Abschluss). Built for UX validation and as a **basis for SAP implementation effort estimates**.

Stack: React 19 + Vite + TypeScript + UI5 Web Components for React (Horizon).

## Quick start

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). Use **one** active Vite instance — multiple ports can serve stale bundles.

## How to explore

1. Open the launchpad (`/`).
2. Open the tile **Aus- und Weiterbildung**.
3. Switch persona via the ShellBar profile menu:
   - **Markus Mettler** — Vorgesetzte/r (sees employee list)
   - **Fankhauser Fabian** — Mitarbeitende/r (lands on own object page)
4. Create or open an Antrag, walk the wizard, then use the review page actions per role.

**Demo lists:** Fankhauser Fabian’s object page shows **one Antrag for every Haupt-/Unterstatus** (status showcase). Other employees each have **two** navigable demo Anträge. Seed resets when `DEMO_ANTRAEGE_VERSION` changes (see HANDOVER.md).

## Screens

| Route | Floorplan / pattern |
|-------|---------------------|
| `/` | Launchpad (Meine Startseite) |
| `/weiterbildung` | List Report (employees; VG only) |
| `/weiterbildung/:employeeId` | Object Page (employee + Weiterbildungen table) |
| `.../antrag/neu` / `.../bearbeiten/:step` | Wizard (4 steps) |
| `.../antrag/:antragId` | Object Page / review with process tabs |

## Documentation for SAP handover

See **[HANDOVER.md](./HANDOVER.md)** for:

- Role & status/action matrix
- Data model sketch
- Navigable demo Anträge (Fabian showcase + 2 per other employee)
- What is prototype plumbing vs product intent
- Suggested mapping to a real SAP stack

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local prototype |
| `npm run build` | Typecheck + production build |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview production build |

## Important

This is **not** a production SAP app: no OData/CAP, no real auth, persistence is `localStorage` + IndexedDB for demo only.
