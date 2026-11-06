import express from 'express';
import cors from 'cors';
import { db, DB_PATH } from './db.js';
import { seedIfEmpty, resetDatabase } from './seed.js';
import { HttpError } from './lib/http.js';
import vacancies from './routes/vacancies.js';
import candidates from './routes/candidates.js';
import interviews from './routes/interviews.js';
import onboarding from './routes/onboarding.js';
import stats from './routes/stats.js';

// API_PORT (not PORT) so tools that set PORT for the web dev server don't collide with the API.
const PORT = Number(process.env.API_PORT) || 4000;

if (seedIfEmpty()) console.log('🌱 Database seeded with demo workspace data');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/vacancies', vacancies);
app.use('/api/candidates', candidates);
app.use('/api/interviews', interviews);
app.use('/api/onboarding', onboarding);
app.use('/api/stats', stats);

app.get('/api/activity', (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 15, 1), 100);
  res.json(db.prepare('SELECT * FROM activity ORDER BY created_at DESC, id DESC LIMIT ?').all(limit));
});

// Restore the demo workspace (used by Settings → Reset demo data).
app.post('/api/reset', (req, res) => {
  resetDatabase();
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 HireFlow API running on http://localhost:${PORT}`);
  console.log(`🗄️  SQLite database: ${DB_PATH}`);
});
