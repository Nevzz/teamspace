# TeamSpace

A calm, Apple-inspired productivity portal for a six-person student team — projects, tasks, subjects, shared notes, resources, and a calendar in one simple app.

- **Frontend:** React + Vite + TypeScript + Tailwind CSS, hosted on GitHub Pages
- **Backend:** Google Apps Script (a REST-style API attached to a Google Sheet)
- **Database:** Google Sheets — no paid backend, no Firebase/Supabase

```
React + Vite  ──▶  Google Apps Script API  ──▶  Google Sheets
```

The frontend never talks to Google Sheets directly — every read and write goes through `src/services/api.ts`, which calls the Apps Script Web App.

---

## 1. Quick start (demo mode)

The app runs out of the box with realistic local sample data, no Google setup required — handy for previewing the UI.

```bash
npm install
npm run dev
```

Open the printed local URL. You'll see a small banner noting you're in demo mode. Data is kept in your browser's local storage, so it persists across reloads but isn't shared with teammates. To connect the real backend, follow the steps below.

---

## 2. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet. Name it **TeamSpace Database** (or anything you like).
2. You don't need to create tabs by hand — the Apps Script setup function creates all of them automatically. The tabs it creates are:

   ```
   Team, Projects, Tasks, Milestones, Resources, Notes,
   Calendar, Subjects, SubjectNotes, SubjectTopics, SubjectResources
   ```

   Each tab's header row (column names) matches the field names used by the app — see `google-apps-script/Code.gs` → `SHEETS` for the exact list per tab.

---

## 3. Install the Apps Script backend

1. In your spreadsheet, go to **Extensions → Apps Script**.
2. Delete the default `myFunction()` boilerplate in `Code.gs`.
3. Copy the entire contents of [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) from this repo and paste it in.
4. Save the project (name it "TeamSpace API" or similar).
5. In the function dropdown at the top, select **`seedSampleData`** and click **Run**.
   - The first run will ask you to authorize the script — approve it (it only touches this spreadsheet).
   - This creates all 11 tabs with correct headers *and* fills them with sample data (6 team members, 4 subjects, 4 projects, ~18 tasks, 10 subject notes, 10 subject resources, and a few deadlines) so the app looks useful immediately.
   - If you'd rather start empty, run **`setupSheets`** instead (creates tabs/headers only, no sample rows).

---

## 4. Deploy the Apps Script as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure:
   - **Execute as:** Me
   - **Who has access:** Anyone with the link *(required so your 5 teammates can use it without individually authorizing the script)*
4. Click **Deploy**, authorize again if prompted, and copy the **Web app URL** — it looks like:

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

   Keep this URL handy for the next step. If you ever change the code, use **Deploy → Manage deployments → Edit → New version** to publish updates to the same URL.

---

## 5. Configure the frontend API URL

Copy the example env file and paste in your Web App URL:

```bash
cp .env.example .env
```

```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```

Restart `npm run dev` after editing `.env`. The demo-mode banner disappears once a real URL is set, and the app now reads and writes to your Google Sheet.

> The frontend never receives or stores any Google credentials — the Apps Script Web App URL is the only thing it needs, and it's safe to keep out of version control (it's already in `.gitignore`).

---

## 6. Run locally

```bash
npm install
npm run dev       # start the dev server
npm run build      # type-check and produce a production build in dist/
npm run preview    # preview the production build locally
```

---

## 7. Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys automatically on every push to `main`.

1. **Push this project to a GitHub repository.**
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Set the Apps Script URL as a repository secret so it's baked into the production build:
   - **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_GOOGLE_APPS_SCRIPT_URL`
   - Value: your `/exec` URL from step 4
4. (Optional) If your repository name isn't `teamspace`, add a repository **variable** named `VITE_BASE_PATH` set to `/your-repo-name/` — this must match your repo name so built asset paths resolve correctly on GitHub Pages. Alternatively, edit the default in `vite.config.ts`.
5. Push to `main`. The workflow builds the app and publishes `dist/` to GitHub Pages. Your app will be live at:

   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

The app uses hash-based routing (`react-router-dom`'s `HashRouter`), so deep links like `.../#/projects/proj-1` work correctly on GitHub Pages without any 404 issues or extra rewrite rules.

---

## 8. How the architecture works

- **`src/services/api.ts`** is the single point of contact with the backend. Every page calls functions like `api.getProjects()` / `api.createTask()` / `api.updateSubjectNote()` — none of them know or care whether that hits Google Apps Script or local demo storage.
- **Demo mode** kicks in automatically when `VITE_GOOGLE_APPS_SCRIPT_URL` is unset (or still the placeholder value). It reads/writes to `localStorage`, seeded from `src/data/mockData.ts`, so you can preview and develop the UI without any Google setup.
- **Live mode** sends `GET`/`POST` requests to your Apps Script Web App. Reads use `?action=list&sheet=Projects`; writes POST a small JSON envelope (`{ action, sheet, id, record }`) as `text/plain` (this avoids a CORS preflight, which Apps Script Web Apps don't support).
- **`Code.gs`** is a generic CRUD layer: one `SHEETS` schema object drives sheet creation, row↔object conversion, and validation for all 11 tabs, so adding a new field is a one-line change in `Code.gs` and the matching TypeScript type.
- **`LockService`** wraps every write in `doPost` so that if two teammates save at the same moment, one waits for the other rather than corrupting a row.
- IDs are generated server-side with `Utilities.getUuid()` (or client-side in demo mode) — the app never relies on spreadsheet row numbers as identifiers, so rows can be freely reordered or deleted without breaking references.

### Frontend structure

```
src/
  types/           TypeScript types mirroring the sheet schema
  data/mockData.ts Sample data (used for demo mode and as the seed data reference)
  services/api.ts  The only module that talks to the backend
  context/         Global app state (data, theme, current user)
  components/      Shared UI: Sidebar, BottomNav, Kanban, CommandPalette, NoteEditor, etc.
  pages/           Dashboard, Projects, ProjectDetail, Subjects, SubjectDetail, Team, Calendar, Settings
```

---

## 9. Design notes

The UI follows Apple's design language (Settings / Notes / Reminders / macOS) rather than a typical SaaS dashboard:

- System font stack (`-apple-system`, `SF Pro`, `Inter` fallback), restrained type weights
- Near-monochrome palette; color is reserved for status (blue = active, green = done, orange = at risk, red = overdue, gray = not started)
- 16px rounded cards with subtle borders/shadows, generous spacing
- Minimal sidebar on desktop, compact bottom navigation on mobile
- Full dark mode using CSS variables (deep charcoal, not pure black)
- ⌘K / Ctrl K global command-palette search across projects, subjects, tasks, notes, topics, resources, and team members

---

## 10. What's implemented

- Full CRUD: projects, tasks, subjects, subject notes, subject topics, subject resources, project notes, project resources
- Drag-and-drop Kanban board per project, persisted to Google Sheets
- Task assignment, priority, and due dates
- Subject workspace with a distraction-free note editor (headings, bold/italic, lists, checklists, links)
- Topics checklist with progress tracking per subject
- Team workload view
- Month calendar aggregating project deadlines, task due dates, and calendar events
- Global ⌘K search
- Skeleton loading states and a "Couldn't connect / Try again" error state
- Responsive layout (desktop sidebar / mobile bottom nav), dark mode
- Demo mode with local sample data, so the app works immediately with or without the Google Sheets backend

## 11. Notes on scope

This is a small, six-person student-team tool, not a hardened multi-tenant SaaS product — a few deliberate simplifications:

- Authentication is a simple "I am ___" picker (`Settings` page) rather than real login, since the Web App is shared by link with your team. If you need to restrict access, change the Apps Script deployment's "Who has access" setting to your Google Workspace domain.
- The shared note editor renders saved HTML directly; since only your six trusted teammates can write to it, this is acceptable for this use case but isn't intended for a public-facing deployment.
- Google Apps Script Web Apps have per-execution quotas on free accounts; for a 6-person trimester project this is comfortably within limits.
