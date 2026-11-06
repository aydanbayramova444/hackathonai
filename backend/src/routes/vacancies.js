import { Router } from 'express';
import { db, logActivity, nowIso, EMPLOYMENT_TYPES, LEVELS } from '../db.js';
import { validate, parseId, notFound, setClause } from '../lib/http.js';

const router = Router();

const rules = {
  title: { type: 'string', required: true, maxLength: 120 },
  department: { type: 'string', required: true, maxLength: 60 },
  location: { type: 'string', required: true, maxLength: 120 },
  employment_type: { type: 'string', required: true, oneOf: EMPLOYMENT_TYPES },
  level: { type: 'string', oneOf: LEVELS },
  skills: { type: 'string', maxLength: 500 },
  description: { type: 'string', maxLength: 5000 },
  status: { type: 'string', oneOf: ['open', 'paused', 'closed'] },
};

const SELECT = `
  SELECT v.*,
    (SELECT COUNT(*) FROM candidates c WHERE c.vacancy_id = v.id) AS candidate_count,
    (SELECT COUNT(*) FROM candidates c WHERE c.vacancy_id = v.id AND c.stage NOT IN ('Hired', 'Rejected')) AS active_candidate_count,
    (SELECT COUNT(*) FROM candidates c WHERE c.vacancy_id = v.id AND c.stage = 'Hired') AS hired_count
  FROM vacancies v
`;

const getVacancy = (id) => db.prepare(`${SELECT} WHERE v.id = ?`).get(id);

router.get('/', (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db.prepare(`${SELECT} WHERE v.status = ? ORDER BY v.created_at DESC`).all(status)
    : db.prepare(`${SELECT} ORDER BY v.created_at DESC`).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const vacancy = getVacancy(parseId(req.params.id));
  if (!vacancy) throw notFound('Vacancy');
  res.json(vacancy);
});

router.post('/', (req, res) => {
  const data = validate(req.body, rules);
  const info = db
    .prepare(
      `INSERT INTO vacancies (title, department, location, employment_type, level, skills, description, status, created_at)
       VALUES (@title, @department, @location, @employment_type, @level, @skills, @description, @status, @created_at)`
    )
    .run({ level: 'Mid-level', skills: '', description: '', status: 'open', ...data, created_at: nowIso() });
  logActivity('vacancy', `New vacancy published: ${data.title}`);
  res.status(201).json(getVacancy(info.lastInsertRowid));
});

router.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getVacancy(id);
  if (!existing) throw notFound('Vacancy');
  const data = validate(req.body, rules, { partial: true });
  if (Object.keys(data).length) {
    db.prepare(`UPDATE vacancies SET ${setClause(data)} WHERE id = @id`).run({ ...data, id });
    if (data.status && data.status !== existing.status) {
      logActivity('vacancy', `Vacancy ${existing.title} is now ${data.status}`);
    }
  }
  res.json(getVacancy(id));
});

router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getVacancy(id);
  if (!existing) throw notFound('Vacancy');
  db.prepare('DELETE FROM vacancies WHERE id = ?').run(id);
  logActivity('vacancy', `Vacancy removed: ${existing.title}`);
  res.status(204).end();
});

export default router;
