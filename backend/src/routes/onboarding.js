import { Router } from 'express';
import { db, logActivity, nowIso, LEVELS } from '../db.js';
import { validate, parseId, notFound, setClause } from '../lib/http.js';
import { generateOnboardingTasks, DEPARTMENTS } from '../lib/onboardingTemplates.js';

const router = Router();

const employeeRules = {
  name: { type: 'string', required: true, maxLength: 100 },
  position: { type: 'string', required: true, maxLength: 120 },
  department: { type: 'string', required: true, maxLength: 60 },
  start_date: { type: 'string', required: true, date: true },
  level: { type: 'string', required: true, oneOf: LEVELS },
  candidate_id: { type: 'number', integer: true, min: 1, nullable: true },
};

const taskRules = {
  title: { type: 'string', required: true, maxLength: 200 },
  category: { type: 'string', maxLength: 60 },
  assignee: { type: 'string', maxLength: 80 },
  due_date: { type: 'string', date: true },
  done: { type: 'boolean' },
};

const listTasks = db.prepare('SELECT * FROM onboarding_tasks WHERE employee_id = ? ORDER BY sort_order, id');

function withTasks(employee) {
  const tasks = listTasks.all(employee.id).map((t) => ({ ...t, done: Boolean(t.done) }));
  const completed = tasks.filter((t) => t.done).length;
  return {
    ...employee,
    tasks,
    total_tasks: tasks.length,
    completed_tasks: completed,
    progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

const getEmployee = (id) => {
  const row = db.prepare('SELECT * FROM onboarding_employees WHERE id = ?').get(id);
  return row ? withTasks(row) : null;
};

const getTask = (id) => {
  const t = db.prepare('SELECT * FROM onboarding_tasks WHERE id = ?').get(id);
  return t ? { ...t, done: Boolean(t.done) } : null;
};

router.get('/meta', (req, res) => {
  res.json({ departments: DEPARTMENTS, levels: LEVELS });
});

// Preview the generated checklist without saving it.
router.post('/preview', (req, res) => {
  const { department, level, start_date } = validate(req.body, {
    department: employeeRules.department,
    level: employeeRules.level,
    start_date: employeeRules.start_date,
  });
  res.json(generateOnboardingTasks({ department, level, startDate: start_date.slice(0, 10) }));
});

router.get('/employees', (req, res) => {
  const rows = db.prepare('SELECT * FROM onboarding_employees ORDER BY start_date DESC').all();
  res.json(rows.map(withTasks));
});

router.get('/employees/:id', (req, res) => {
  const employee = getEmployee(parseId(req.params.id));
  if (!employee) throw notFound('Employee');
  res.json(employee);
});

// Creates the employee and auto-generates a role-based checklist.
router.post('/employees', (req, res) => {
  const data = validate(req.body, employeeRules);
  const startDate = data.start_date.slice(0, 10);
  const generate = req.body?.generate_tasks !== false;

  const id = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO onboarding_employees (name, position, department, start_date, level, candidate_id, created_at)
         VALUES (@name, @position, @department, @start_date, @level, @candidate_id, @created_at)`
      )
      .run({ candidate_id: null, ...data, start_date: startDate, created_at: nowIso() });
    const employeeId = Number(info.lastInsertRowid);
    if (generate) {
      const insert = db.prepare(
        `INSERT INTO onboarding_tasks (employee_id, title, category, assignee, due_date, done, sort_order)
         VALUES (@employee_id, @title, @category, @assignee, @due_date, 0, @sort_order)`
      );
      generateOnboardingTasks({ department: data.department, level: data.level, startDate }).forEach((t) =>
        insert.run({ ...t, employee_id: employeeId })
      );
    }
    return employeeId;
  })();

  logActivity('onboarding', `Onboarding plan created for ${data.name}`);
  res.status(201).json(getEmployee(id));
});

router.patch('/employees/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!getEmployee(id)) throw notFound('Employee');
  const data = validate(req.body, employeeRules, { partial: true });
  if (data.start_date) data.start_date = data.start_date.slice(0, 10);
  if (Object.keys(data).length) {
    db.prepare(`UPDATE onboarding_employees SET ${setClause(data)} WHERE id = @id`).run({ ...data, id });
  }
  res.json(getEmployee(id));
});

router.delete('/employees/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getEmployee(id);
  if (!existing) throw notFound('Employee');
  db.prepare('DELETE FROM onboarding_employees WHERE id = ?').run(id);
  logActivity('onboarding', `Onboarding plan removed for ${existing.name}`);
  res.status(204).end();
});

router.post('/employees/:id/tasks', (req, res) => {
  const employeeId = parseId(req.params.id);
  const employee = getEmployee(employeeId);
  if (!employee) throw notFound('Employee');
  const data = validate(req.body, taskRules);
  const { next } = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM onboarding_tasks WHERE employee_id = ?')
    .get(employeeId);
  const info = db
    .prepare(
      `INSERT INTO onboarding_tasks (employee_id, title, category, assignee, due_date, done, completed_at, sort_order)
       VALUES (@employee_id, @title, @category, @assignee, @due_date, @done, @completed_at, @sort_order)`
    )
    .run({
      category: 'General', assignee: 'HR', due_date: employee.start_date,
      ...data,
      done: data.done ? 1 : 0,
      completed_at: data.done ? nowIso() : null,
      employee_id: employeeId,
      sort_order: next,
    });
  res.status(201).json(getTask(info.lastInsertRowid));
});

// Toggle completion, reassign, rename or reschedule a task.
router.patch('/tasks/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = getTask(id);
  if (!existing) throw notFound('Task');
  const data = validate(req.body, taskRules, { partial: true });
  const update = { ...data };
  if ('done' in data) {
    update.done = data.done ? 1 : 0;
    update.completed_at = data.done ? existing.completed_at || nowIso() : null;
  }
  if (Object.keys(update).length) {
    db.prepare(`UPDATE onboarding_tasks SET ${setClause(update)} WHERE id = @id`).run({ ...update, id });
    if ('done' in data && data.done !== existing.done && data.done) {
      const { name } = db.prepare('SELECT name FROM onboarding_employees WHERE id = ?').get(existing.employee_id);
      logActivity('onboarding', `Task completed for ${name}: ${existing.title}`);
    }
  }
  res.json(getTask(id));
});

router.delete('/tasks/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!getTask(id)) throw notFound('Task');
  db.prepare('DELETE FROM onboarding_tasks WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
