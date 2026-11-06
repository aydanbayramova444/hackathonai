import { Router } from 'express';
import { db, logActivity, nowIso, STAGES } from '../db.js';
import { validate, parseId, notFound, setClause, HttpError } from '../lib/http.js';

const router = Router();

const rules = {
  name: { type: 'string', required: true, maxLength: 100 },
  email: { type: 'string', required: true, email: true, maxLength: 160 },
  phone: { type: 'string', maxLength: 40 },
  vacancy_id: { type: 'number', integer: true, min: 1, nullable: true },
  stage: { type: 'string', oneOf: STAGES },
  rating: { type: 'number', integer: true, min: 0, max: 5 },
  experience_years: { type: 'number', integer: true, min: 0, max: 60 },
  location: { type: 'string', maxLength: 120 },
  source: { type: 'string', maxLength: 60 },
  skills: { type: 'string', maxLength: 500 },
  notes: { type: 'string', maxLength: 5000 },
};

const SELECT = `
  SELECT c.*, v.title AS vacancy_title, v.department AS vacancy_department
  FROM candidates c
  LEFT JOIN vacancies v ON v.id = c.vacancy_id
`;

const getCandidate = (id) => db.prepare(`${SELECT} WHERE c.id = ?`).get(id);

function assertVacancy(vacancyId) {
  if (vacancyId == null) return;
  const exists = db.prepare('SELECT 1 FROM vacancies WHERE id = ?').get(vacancyId);
  if (!exists) throw new HttpError(400, 'Validation failed', { vacancy_id: 'Vacancy does not exist' });
}

// GET /api/candidates?search=&vacancy_id=&stage=
router.get('/', (req, res) => {
  const where = [];
  const params = {};
  const { search, vacancy_id, stage } = req.query;
  if (search && String(search).trim()) {
    where.push('(c.name LIKE @search OR c.email LIKE @search OR c.skills LIKE @search OR v.title LIKE @search)');
    params.search = `%${String(search).trim()}%`;
  }
  if (vacancy_id) {
    where.push('c.vacancy_id = @vacancy_id');
    params.vacancy_id = parseId(vacancy_id);
  }
  if (stage) {
    if (!STAGES.includes(stage)) throw new HttpError(400, `stage must be one of: ${STAGES.join(', ')}`);
    where.push('c.stage = @stage');
    params.stage = stage;
  }
  const sql = `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.updated_at DESC`;
  res.json(db.prepare(sql).all(params));
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const candidate = getCandidate(id);
  if (!candidate) throw notFound('Candidate');
  const interviews = db
    .prepare('SELECT * FROM interviews WHERE candidate_id = ? ORDER BY scheduled_at DESC')
    .all(id);
  res.json({ ...candidate, interviews });
});

router.post('/', (req, res) => {
  const data = validate(req.body, rules);
  assertVacancy(data.vacancy_id);
  const now = nowIso();
  const row = {
    phone: '', vacancy_id: null, stage: 'Applied', rating: 0, experience_years: 0,
    location: '', source: 'Manual', skills: '', notes: '',
    ...data, applied_at: now, updated_at: now,
  };
  const info = db
    .prepare(
      `INSERT INTO candidates (name, email, phone, vacancy_id, stage, rating, experience_years, location, source, skills, notes, applied_at, updated_at)
       VALUES (@name, @email, @phone, @vacancy_id, @stage, @rating, @experience_years, @location, @source, @skills, @notes, @applied_at, @updated_at)`
    )
    .run(row);
  const created = getCandidate(info.lastInsertRowid);
  logActivity('candidate', `New candidate added: ${created.name}${created.vacancy_title ? ` for ${created.vacancy_title}` : ''}`);
  res.status(201).json(created);
});

// PATCH is used by the Kanban board to move candidates between stages.
router.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getCandidate(id);
  if (!existing) throw notFound('Candidate');
  const data = validate(req.body, rules, { partial: true });
  if ('vacancy_id' in data) assertVacancy(data.vacancy_id);

  if (Object.keys(data).length) {
    db.prepare(`UPDATE candidates SET ${setClause(data)}, updated_at = @updated_at WHERE id = @id`).run({
      ...data,
      updated_at: nowIso(),
      id,
    });
    if (data.stage && data.stage !== existing.stage) {
      logActivity('candidate', `${existing.name} moved from ${existing.stage} to ${data.stage}`);
    }
  }
  res.json(getCandidate(id));
});

router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getCandidate(id);
  if (!existing) throw notFound('Candidate');
  db.prepare('DELETE FROM candidates WHERE id = ?').run(id);
  logActivity('candidate', `Candidate removed: ${existing.name}`);
  res.status(204).end();
});

export default router;
