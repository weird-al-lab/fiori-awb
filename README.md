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

## Deploy (GitHub Pages + Vercel)

Both platforms build from the same repo. Vite picks the asset base path automatically:

| Platform | URL pattern | Production `base` |
|---|---|---|
| **GitHub Pages** | `https://<user>.github.io/fiori-awb/` | `/fiori-awb/` |
| **Vercel** | `https://<project>.vercel.app/` | `/` |

Vercel sets `VERCEL` during its build. GitHub Actions does not, so Pages keeps the subpath.

**GitHub Pages** — workflow: `.github/workflows/deploy-pages.yml`  
Build: `npm run build:theme && npm run build` · Gate secret: `PROTOTYPE_GATE_PASSWORD`

**Vercel** — import repo, same build command, output `dist`  
Gate env var: `VITE_PROTOTYPE_GATE_PASSWORD` · SPA routing: `vercel.json`

**Preview a GitHub Pages build locally**

```bash
npm run build:theme && npm run build && npm run preview
# open http://localhost:4173/fiori-awb/
```

**Preview a Vercel build locally**

```bash
npm run build:theme && VERCEL=1 npm run build && npm run preview
# open http://localhost:4173/
```

## GitHub Pages + password gate

The published prototype can show a **client-side password screen** before the app loads. This keeps casual visitors and most crawlers out; it is **not** cryptographic security (the bundle can be inspected).

**Enable on GitHub Pages**

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Add secret **`PROTOTYPE_GATE_PASSWORD`** with your chosen password
3. Push to `main` (or re-run **Deploy to GitHub Pages**)

The workflow passes it as `VITE_PROTOTYPE_GATE_PASSWORD` at build time. Without the secret, the gate is **off** in production builds.

**Local development**

- Gate is **off** by default (no password in env).
- To test locally: copy `.env.example` → `.env.local` and set `VITE_PROTOTYPE_GATE_PASSWORD`.

**SEO**

- `index.html` uses `noindex, nofollow`
- `public/robots.txt` disallows all crawlers

## Important

This is **not** a production SAP app: no OData/CAP, no real auth, persistence is `localStorage` (+ unused IndexedDB scaffolding for documents) for demo only.
