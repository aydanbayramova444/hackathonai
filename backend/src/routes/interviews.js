import { Router } from 'express';
import { db, logActivity, nowIso, INTERVIEW_TYPES } from '../db.js';
import { validate, parseId, notFound, setClause, HttpError } from '../lib/http.js';

const router = Router();

const rules = {
  candidate_id: { type: 'number', integer: true, min: 1, required: true },
  type: { type: 'string', required: true, oneOf: INTERVIEW_TYPES },
  scheduled_at: { type: 'string', required: true, date: true },
  duration_minutes: { type: 'number', integer: true, min: 15, max: 480 },
  interviewer: { type: 'string', maxLength: 120 },
  mode: { type: 'string', maxLength: 120 },
  status: { type: 'string', oneOf: ['scheduled', 'completed', 'cancelled'] },
};

const SELECT = `
  SELECT i.*, c.name AS candidate_name, c.email AS candidate_email, c.stage AS candidate_stage,
         v.title AS vacancy_title
  FROM interviews i
  JOIN candidates c ON c.id = i.candidate_id
  LEFT JOIN vacancies v ON v.id = i.vacancy_id
`;

const getInterview = (id) => db.prepare(`${SELECT} WHERE i.id = ?`).get(id);

// GET /api/interviews?upcoming=true&status=scheduled
router.get('/', (req, res) => {
  const where = [];
  const params = {};
  if (req.query.upcoming === 'true') {
    where.push(`i.status = 'scheduled' AND i.scheduled_at >= @now`);
    params.now = nowIso();
  }
  if (req.query.status) {
    where.push('i.status = @status');
    params.status = req.query.status;
  }
  const sql = `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY i.scheduled_at ASC`;
  res.json(db.prepare(sql).all(params));
});

router.get('/:id', (req, res) => {
  const interview = getInterview(parseId(req.params.id));
  if (!interview) throw notFound('Interview');
  res.json(interview);
});

router.post('/', (req, res) => {
  const data = validate(req.body, rules);
  const candidate = db.prepare('SELECT id, name, vacancy_id FROM candidates WHERE id = ?').get(data.candidate_id);
  if (!candidate) throw new HttpError(400, 'Validation failed', { candidate_id: 'Candidate does not exist' });

  const info = db
    .prepare(
      `INSERT INTO interviews (candidate_id, vacancy_id, type, scheduled_at, duration_minutes, interviewer, mode, status, created_at)
       VALUES (@candidate_id, @vacancy_id, @type, @scheduled_at, @duration_minutes, @interviewer, @mode, @status, @created_at)`
    )
    .run({
      duration_minutes: 45, interviewer: '', mode: 'Google Meet', status: 'scheduled',
      ...data,
      scheduled_at: new Date(data.scheduled_at).toISOString(),
      vacancy_id: candidate.vacancy_id,
      created_at: nowIso(),
    });
  logActivity('interview', `Interview scheduled with ${candidate.name} (${data.type})`);
  res.status(201).json(getInterview(info.lastInsertRowid));
});

router.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getInterview(id);
  if (!existing) throw notFound('Interview');
  const { candidate_id, ...editable } = rules;
  const data = validate(req.body, editable, { partial: true });
  if (data.scheduled_at) data.scheduled_at = new Date(data.scheduled_at).toISOString();

  if (Object.keys(data).length) {
    db.prepare(`UPDATE interviews SET ${setClause(data)} WHERE id = @id`).run({ ...data, id });
    if (data.status && data.status !== existing.status) {
      logActivity('interview', `Interview with ${existing.candidate_name} marked ${data.status}`);
    } else if (data.scheduled_at && data.scheduled_at !== existing.scheduled_at) {
      logActivity('interview', `Interview with ${existing.candidate_name} rescheduled`);
    }
  }
  res.json(getInterview(id));
});

router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!getInterview(id)) throw notFound('Interview');
  db.prepare('DELETE FROM interviews WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
