import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const DB_PATH = process.env.DB_PATH || path.join(dataDir, 'hireflow.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
export const INTERVIEW_TYPES = ['HR', 'Technical', 'Behavioral'];
export const LEVELS = ['Junior', 'Mid-level', 'Senior'];
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const inList = (values) => values.map((v) => `'${v}'`).join(', ');

db.exec(`
  CREATE TABLE IF NOT EXISTS vacancies (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    department      TEXT NOT NULL,
    location        TEXT NOT NULL,
    employment_type TEXT NOT NULL CHECK (employment_type IN (${inList(EMPLOYMENT_TYPES)})),
    level           TEXT NOT NULL DEFAULT 'Mid-level' CHECK (level IN (${inList(LEVELS)})),
    skills          TEXT NOT NULL DEFAULT '',
    description     TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),
    created_at      TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL,
    email            TEXT NOT NULL,
    phone            TEXT NOT NULL DEFAULT '',
    vacancy_id       INTEGER REFERENCES vacancies(id) ON DELETE SET NULL,
    stage            TEXT NOT NULL DEFAULT 'Applied' CHECK (stage IN (${inList(STAGES)})),
    rating           INTEGER NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    experience_years INTEGER NOT NULL DEFAULT 0,
    location         TEXT NOT NULL DEFAULT '',
    source           TEXT NOT NULL DEFAULT '',
    skills           TEXT NOT NULL DEFAULT '',
    notes            TEXT NOT NULL DEFAULT '',
    applied_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id     INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    vacancy_id       INTEGER REFERENCES vacancies(id) ON DELETE SET NULL,
    type             TEXT NOT NULL CHECK (type IN (${inList(INTERVIEW_TYPES)})),
    scheduled_at     TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    interviewer      TEXT NOT NULL DEFAULT '',
    mode             TEXT NOT NULL DEFAULT 'Google Meet',
    status           TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS onboarding_employees (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    position     TEXT NOT NULL,
    department   TEXT NOT NULL,
    start_date   TEXT NOT NULL,
    level        TEXT NOT NULL DEFAULT 'Mid-level' CHECK (level IN (${inList(LEVELS)})),
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE SET NULL,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id  INTEGER NOT NULL REFERENCES onboarding_employees(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    category     TEXT NOT NULL DEFAULT 'General',
    assignee     TEXT NOT NULL DEFAULT 'HR',
    due_date     TEXT NOT NULL,
    done         INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
    completed_at TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS activity (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
  CREATE INDEX IF NOT EXISTS idx_candidates_vacancy ON candidates(vacancy_id);
  CREATE INDEX IF NOT EXISTS idx_interviews_time ON interviews(scheduled_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_employee ON onboarding_tasks(employee_id);
`);

export const nowIso = () => new Date().toISOString();

const insertActivity = db.prepare('INSERT INTO activity (type, message, created_at) VALUES (?, ?, ?)');
export function logActivity(type, message, createdAt = nowIso()) {
  insertActivity.run(type, message, createdAt);
}
