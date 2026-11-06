import { Router } from 'express';
import { db, nowIso, STAGES } from '../db.js';

const router = Router();

const WEEKS = 8;

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

// Everything the dashboard needs in one request.
router.get('/', (req, res) => {
  const one = (sql, ...params) => db.prepare(sql).get(...params).n;
  const now = nowIso();

  const totals = {
    active_vacancies: one(`SELECT COUNT(*) AS n FROM vacancies WHERE status = 'open'`),
    total_candidates: one(`SELECT COUNT(*) AS n FROM candidates`),
    active_candidates: one(`SELECT COUNT(*) AS n FROM candidates WHERE stage NOT IN ('Hired', 'Rejected')`),
    interviews_scheduled: one(`SELECT COUNT(*) AS n FROM interviews WHERE status = 'scheduled' AND scheduled_at >= ?`, now),
    pending_onboarding_tasks: one(`SELECT COUNT(*) AS n FROM onboarding_tasks WHERE done = 0`),
    completed_onboarding_tasks: one(`SELECT COUNT(*) AS n FROM onboarding_tasks WHERE done = 1`),
    hired: one(`SELECT COUNT(*) AS n FROM candidates WHERE stage = 'Hired'`),
    new_this_week: one(`SELECT COUNT(*) AS n FROM candidates WHERE applied_at >= ?`, startOfWeek(new Date()).toISOString()),
  };

  const stageCounts = Object.fromEntries(
    db.prepare('SELECT stage, COUNT(*) AS count FROM candidates GROUP BY stage').all().map((r) => [r.stage, r.count])
  );
  const pipeline = STAGES.map((stage) => ({ stage, count: stageCounts[stage] || 0 }));

  // Weekly applications for the last N weeks (oldest first).
  const firstWeek = startOfWeek(new Date());
  firstWeek.setDate(firstWeek.getDate() - (WEEKS - 1) * 7);
  const buckets = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(firstWeek);
    start.setDate(start.getDate() + i * 7);
    return { week_start: start.toISOString().slice(0, 10), label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), applications: 0, hired: 0 };
  });
  const bucketFor = (iso) => {
    const idx = Math.floor((new Date(iso) - firstWeek) / (7 * 24 * 60 * 60 * 1000));
    return idx >= 0 && idx < WEEKS ? buckets[idx] : null;
  };
  for (const { applied_at, stage, updated_at } of db.prepare('SELECT applied_at, stage, updated_at FROM candidates').all()) {
    const b = bucketFor(applied_at);
    if (b) b.applications += 1;
    if (stage === 'Hired') {
      const h = bucketFor(updated_at);
      if (h) h.hired += 1;
    }
  }

  const by_vacancy = db
    .prepare(
      `SELECT v.id, v.title, v.department,
              COUNT(c.id) AS candidates,
              SUM(CASE WHEN c.stage IN ('Interview', 'Offer') THEN 1 ELSE 0 END) AS in_progress,
              SUM(CASE WHEN c.stage = 'Hired' THEN 1 ELSE 0 END) AS hired
       FROM vacancies v LEFT JOIN candidates c ON c.vacancy_id = v.id
       WHERE v.status = 'open'
       GROUP BY v.id ORDER BY candidates DESC`
    )
    .all();

  const by_source = db
    .prepare(`SELECT source, COUNT(*) AS count FROM candidates GROUP BY source ORDER BY count DESC`)
    .all();

  // Share of all candidates that reached each stage or beyond (Rejected excluded from the funnel).
  const funnelStages = STAGES.filter((s) => s !== 'Rejected');
  const reached = funnelStages.map((stage, i) => ({
    stage,
    count: funnelStages.slice(i).reduce((sum, s) => sum + (stageCounts[s] || 0), 0),
  }));

  res.json({ totals, pipeline, funnel: reached, weekly: buckets, by_vacancy, by_source });
});

export default router;
