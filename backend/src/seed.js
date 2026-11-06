import { db, logActivity } from './db.js';

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days, hour = 10, minute = 0) {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
const daysFromNow = (days, hour, minute = 0) => daysAgo(-days, hour, minute);
const dateOnly = (iso) => iso.slice(0, 10);

const VACANCIES = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Baku, Azerbaijan (Hybrid)',
    employment_type: 'Full-time',
    level: 'Senior',
    skills: 'React, TypeScript, Tailwind CSS, Testing, Performance',
    description: 'Lead the development of our customer-facing web platform and mentor a growing frontend team.',
    created: 30,
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    employment_type: 'Full-time',
    level: 'Mid-level',
    skills: 'Figma, Design Systems, User Research, Prototyping',
    description: 'Own end-to-end product design for core workflows, from discovery to polished UI.',
    created: 24,
  },
  {
    title: 'Data Analyst',
    department: 'Data',
    location: 'Baku, Azerbaijan',
    employment_type: 'Full-time',
    level: 'Junior',
    skills: 'SQL, Python, Power BI, Statistics',
    description: 'Turn product and business data into clear insights and dashboards for decision makers.',
    created: 18,
  },
  {
    title: 'HR Business Partner',
    department: 'People',
    location: 'Baku, Azerbaijan (On-site)',
    employment_type: 'Full-time',
    level: 'Mid-level',
    skills: 'Employee Relations, Talent Management, HR Analytics, Coaching',
    description: 'Partner with leadership on people strategy, performance and employee experience.',
    created: 10,
  },
];

// [name, vacancyIndex, stage, rating, experienceYears, source, location, appliedDaysAgo, skills, notes]
const CANDIDATES = [
  ['Aysel Huseynova', 0, 'Applied', 3, 4, 'LinkedIn', 'Baku', 1, 'React, JavaScript, CSS', 'Strong portfolio of e-commerce projects.'],
  ['Marco Rossi', 0, 'Applied', 3, 6, 'Referral', 'Milan', 2, 'React, TypeScript, Next.js', 'Referred by Murad Aliyev.'],
  ['Nigar Aliyeva', 2, 'Applied', 3, 1, 'Company website', 'Baku', 3, 'SQL, Excel, Python', 'Recent graduate, statistics major.'],
  ['Ethan Brooks', 1, 'Applied', 3, 3, 'LinkedIn', 'London', 1, 'Figma, UX Writing, Prototyping', ''],
  ['Sabina Karimova', 3, 'Applied', 3, 4, 'Job board', 'Baku', 4, 'Recruitment, Employee Relations', ''],
  ['Rashad Guliyev', 0, 'Screening', 4, 7, 'LinkedIn', 'Baku', 9, 'React, TypeScript, GraphQL', 'Phone screen went well, salary expectations aligned.'],
  ['Sofia Martinez', 1, 'Screening', 4, 5, 'Dribbble', 'Barcelona', 11, 'Figma, Design Systems, Motion', 'Beautiful case studies on onboarding flows.'],
  ['Farid Ismayilov', 2, 'Screening', 3, 2, 'University fair', 'Ganja', 8, 'SQL, Power BI', ''],
  ['Hannah Weber', 3, 'Screening', 4, 6, 'Referral', 'Berlin', 12, 'HR Analytics, Coaching', 'Open to relocation.'],
  ['Elvin Mammadov', 0, 'Interview', 4, 8, 'Referral', 'Baku', 16, 'React, TypeScript, Testing, Node.js', 'Technical round scheduled.'],
  ['Chloe Dubois', 1, 'Interview', 5, 4, 'LinkedIn', 'Paris', 15, 'Figma, User Research, Prototyping', 'Portfolio review: excellent.'],
  ['Kamran Abbasov', 2, 'Interview', 4, 1, 'LinkedIn', 'Baku', 14, 'Python, SQL, Statistics', 'Take-home task submitted.'],
  ['Priya Sharma', 3, 'Interview', 4, 7, 'Job board', 'Dubai', 18, 'Talent Management, Employee Relations', ''],
  ['Lucas Andersson', 0, 'Offer', 5, 9, 'LinkedIn', 'Stockholm', 25, 'React, TypeScript, Performance, Leadership', 'Offer sent, awaiting response.'],
  ['Gunay Rzayeva', 3, 'Offer', 5, 8, 'Referral', 'Baku', 22, 'HR Analytics, Coaching, Talent Management', 'Verbal acceptance received.'],
  ['Leyla Mammadova', 1, 'Hired', 5, 6, 'Dribbble', 'Baku', 34, 'Figma, Design Systems, User Research', 'Starts this week.'],
  ['Daniel Kim', 2, 'Hired', 5, 2, 'Company website', 'Baku', 30, 'SQL, Python, Power BI', 'Started recently.'],
  ['Orkhan Safarov', 0, 'Rejected', 2, 3, 'Job board', 'Baku', 20, 'JavaScript, jQuery', 'Not enough React experience for a senior role.'],
  ['Emily Carter', 1, 'Rejected', 2, 2, 'LinkedIn', 'Manchester', 19, 'Illustrator, Branding', 'Portfolio is brand-focused rather than product.'],
  ['Tural Hasanov', 2, 'Rejected', 2, 1, 'Company website', 'Sumgait', 21, 'Excel', 'Withdrew application.'],
];

const toEmail = (name) =>
  name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@example.com';

const phoneFor = (i) => `+994 50 ${String(210 + i * 7).padStart(3, '0')} ${String(10 + i * 3).slice(-2)} ${String(40 + i).slice(-2)}`;

export function seed() {
  const insertVacancy = db.prepare(`
    INSERT INTO vacancies (title, department, location, employment_type, level, skills, description, status, created_at)
    VALUES (@title, @department, @location, @employment_type, @level, @skills, @description, 'open', @created_at)
  `);
  const insertCandidate = db.prepare(`
    INSERT INTO candidates (name, email, phone, vacancy_id, stage, rating, experience_years, location, source, skills, notes, applied_at, updated_at)
    VALUES (@name, @email, @phone, @vacancy_id, @stage, @rating, @experience_years, @location, @source, @skills, @notes, @applied_at, @updated_at)
  `);
  const insertInterview = db.prepare(`
    INSERT INTO interviews (candidate_id, vacancy_id, type, scheduled_at, duration_minutes, interviewer, mode, status, created_at)
    VALUES (@candidate_id, @vacancy_id, @type, @scheduled_at, @duration_minutes, @interviewer, @mode, 'scheduled', @created_at)
  `);
  const insertEmployee = db.prepare(`
    INSERT INTO onboarding_employees (name, position, department, start_date, level, candidate_id, created_at)
    VALUES (@name, @position, @department, @start_date, @level, @candidate_id, @created_at)
  `);
  const insertTask = db.prepare(`
    INSERT INTO onboarding_tasks (employee_id, title, category, assignee, due_date, done, completed_at, sort_order)
    VALUES (@employee_id, @title, @category, @assignee, @due_date, @done, @completed_at, @sort_order)
  `);

  const run = db.transaction(() => {
    const vacancyIds = VACANCIES.map(({ created, ...v }) =>
      Number(insertVacancy.run({ ...v, created_at: daysAgo(created, 9) }).lastInsertRowid)
    );

    const candidateIds = {};
    CANDIDATES.forEach(([name, vi, stage, rating, exp, source, location, applied, skills, notes], i) => {
      const appliedAt = daysAgo(applied, 9 + (i % 8), (i * 13) % 60);
      const updatedAt = stage === 'Applied' ? appliedAt : daysAgo(Math.max(0, Math.floor(applied / 3)), 15, (i * 7) % 60);
      candidateIds[name] = Number(
        insertCandidate.run({
          name,
          email: toEmail(name),
          phone: phoneFor(i),
          vacancy_id: vacancyIds[vi],
          stage,
          rating,
          experience_years: exp,
          location,
          source,
          skills,
          notes,
          applied_at: appliedAt,
          updated_at: updatedAt,
        }).lastInsertRowid
      );
    });

    const interviews = [
      { name: 'Elvin Mammadov', vi: 0, type: 'Technical', at: daysFromNow(1, 10), duration: 60, interviewer: 'Murad Aliyev (Engineering Lead)', mode: 'Office – Room 3B' },
      { name: 'Chloe Dubois', vi: 1, type: 'Behavioral', at: daysFromNow(2, 14), duration: 45, interviewer: 'Sarah Lin (Design Director)', mode: 'Google Meet' },
      { name: 'Priya Sharma', vi: 3, type: 'HR', at: daysFromNow(3, 11, 30), duration: 45, interviewer: 'Nargiz Hajiyeva (HR Manager)', mode: 'Zoom' },
    ];
    interviews.forEach((iv) =>
      insertInterview.run({
        candidate_id: candidateIds[iv.name],
        vacancy_id: vacancyIds[iv.vi],
        type: iv.type,
        scheduled_at: iv.at,
        duration_minutes: iv.duration,
        interviewer: iv.interviewer,
        mode: iv.mode,
        created_at: daysAgo(2, 12),
      })
    );

    // 2 new hires × 4 tasks = 8 onboarding tasks
    const employees = [
      {
        name: 'Leyla Mammadova', position: 'Product Designer', department: 'Design', level: 'Mid-level', start: 3,
        tasks: [
          ['Prepare company email account', 'IT Setup', 'IT Support', 0, true],
          ['Prepare laptop and accessories', 'IT Setup', 'IT Support', 1, true],
          ['Complete HR documentation and contract', 'HR Admin', 'HR', 2, false],
          ['Schedule team introduction meeting', 'Team', 'Hiring Manager', 3, false],
        ],
      },
      {
        name: 'Daniel Kim', position: 'Data Analyst', department: 'Data', level: 'Junior', start: -4,
        tasks: [
          ['Assign onboarding mentor', 'Team', 'Hiring Manager', -4, true],
          ['Data model and key metrics walkthrough', 'Training', 'Data Lead', -2, true],
          ['Schedule first-week check-in', 'Check-ins', 'HR', 0, false],
          ['Organize department training', 'Training', 'Data Lead', 3, false],
        ],
      },
    ];
    employees.forEach((e) => {
      const startDate = dateOnly(daysFromNow(e.start, 9));
      const employeeId = Number(
        insertEmployee.run({
          name: e.name,
          position: e.position,
          department: e.department,
          start_date: startDate,
          level: e.level,
          candidate_id: candidateIds[e.name],
          created_at: daysAgo(6, 11),
        }).lastInsertRowid
      );
      e.tasks.forEach(([title, category, assignee, dueOffset, done], i) =>
        insertTask.run({
          employee_id: employeeId,
          title,
          category,
          assignee,
          due_date: dateOnly(daysFromNow(dueOffset, 9)),
          done: done ? 1 : 0,
          completed_at: done ? daysAgo(1, 16) : null,
          sort_order: i,
        })
      );
    });

    const activity = [
      ['vacancy', 'New vacancy published: HR Business Partner', daysAgo(10, 9)],
      ['onboarding', 'Onboarding plan created for Daniel Kim', daysAgo(6, 11)],
      ['candidate', 'Lucas Andersson moved to Offer', daysAgo(4, 15)],
      ['candidate', 'Gunay Rzayeva moved to Offer', daysAgo(3, 16)],
      ['interview', 'Interview scheduled with Elvin Mammadov (Technical)', daysAgo(2, 12)],
      ['interview', 'Interview scheduled with Chloe Dubois (Behavioral)', daysAgo(2, 12, 10)],
      ['interview', 'Interview scheduled with Priya Sharma (HR)', daysAgo(2, 12, 20)],
      ['candidate', 'Sofia Martinez moved to Screening', daysAgo(1, 14)],
      ['candidate', 'New application: Ethan Brooks for Product Designer', daysAgo(1, 16)],
      ['candidate', 'New application: Aysel Huseynova for Senior Frontend Engineer', daysAgo(1, 17)],
    ];
    activity.forEach(([type, message, at]) => logActivity(type, message, at));
  });

  run();
}

export function clearAll() {
  db.transaction(() => {
    for (const table of ['onboarding_tasks', 'onboarding_employees', 'interviews', 'candidates', 'vacancies', 'activity']) {
      db.prepare(`DELETE FROM ${table}`).run();
    }
    db.prepare(`DELETE FROM sqlite_sequence`).run();
  })();
}

export function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM vacancies').get();
  if (count === 0) {
    seed();
    return true;
  }
  return false;
}

export function resetDatabase() {
  clearAll();
  seed();
}
