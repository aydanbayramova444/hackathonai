# HireFlow – HR Daily Workspace

> Your HR workflow. Simplified.

## Run

```bash
npm run install:all
npm run dev
```

This starts both servers:

- Web app: http://localhost:5173 (Vite, proxies `/api` to the backend)
- API: http://localhost:4000 (set `API_PORT` to change it)

On first start the API it creates `backend/data/hireflow.db` and seeds it with demo data (4 vacancies, 20 candidates, 3 interviews, 8 onboarding tasks).

Reset to demo data: `npm --prefix backend run reset-db` or `POST /api/reset`.

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/stats` | Dashboard totals, pipeline, funnel, weekly trend, per-vacancy and per-source breakdowns |
| GET | `/api/activity?limit=15` | Recent activity feed |
| GET/POST | `/api/vacancies` | `?status=open` |
| GET/PATCH/DELETE | `/api/vacancies/:id` | |
| GET/POST | `/api/candidates` | `?search=&vacancy_id=&stage=` |
| GET/PATCH/DELETE | `/api/candidates/:id` | `PATCH {stage}` moves a candidate on the Kanban board |
| GET/POST | `/api/interviews` | `?upcoming=true`, `?status=` |
| GET/PATCH/DELETE | `/api/interviews/:id` | |
| GET | `/api/onboarding/meta` | Departments and levels |
| POST | `/api/onboarding/preview` | Generated checklist without saving |
| GET/POST | `/api/onboarding/employees` | POST auto-generates a role-based checklist |
| GET/PATCH/DELETE | `/api/onboarding/employees/:id` | |
| POST | `/api/onboarding/employees/:id/tasks` | Add a custom task |
| PATCH/DELETE | `/api/onboarding/tasks/:id` | `PATCH {done}` toggles completion |
| POST | `/api/reset` | Restore demo data |

Validation errors return `400 { error, details: { field: message } }`.
