// Rule-based onboarding checklist generator.
// offset = days relative to the start date (negative = before day one).

const BASE_TASKS = [
  { title: 'Prepare company email account', category: 'IT Setup', assignee: 'IT Support', offset: -3 },
  { title: 'Prepare laptop and accessories', category: 'IT Setup', assignee: 'IT Support', offset: -2 },
  { title: 'Complete HR documentation and contract', category: 'HR Admin', assignee: 'HR', offset: -1 },
  { title: 'Send welcome pack and first-day agenda', category: 'HR Admin', assignee: 'HR', offset: -1 },
  { title: 'Schedule team introduction meeting', category: 'Team', assignee: 'Hiring Manager', offset: 0 },
  { title: 'Assign onboarding mentor', category: 'Team', assignee: 'Hiring Manager', offset: 0 },
  { title: 'Company policies and security training', category: 'Training', assignee: 'HR', offset: 2 },
  { title: 'Schedule first-week check-in', category: 'Check-ins', assignee: 'HR', offset: 4 },
  { title: '30-day goals and feedback session', category: 'Check-ins', assignee: 'Hiring Manager', offset: 30 },
];

const DEPARTMENT_TASKS = {
  Engineering: [
    { title: 'Grant GitHub, CI and cloud access', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Set up local development environment', category: 'Training', assignee: 'Mentor', offset: 1 },
    { title: 'Architecture and codebase walkthrough', category: 'Training', assignee: 'Tech Lead', offset: 2 },
    { title: 'Ship a first small pull request', category: 'Training', assignee: 'Mentor', offset: 7 },
  ],
  Design: [
    { title: 'Grant Figma and design system access', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Design system and brand guidelines walkthrough', category: 'Training', assignee: 'Design Lead', offset: 2 },
    { title: 'Shadow a user research session', category: 'Training', assignee: 'Mentor', offset: 6 },
  ],
  Data: [
    { title: 'Grant data warehouse and BI tool access', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Data model and key metrics walkthrough', category: 'Training', assignee: 'Data Lead', offset: 2 },
    { title: 'Deliver a first dashboard or analysis', category: 'Training', assignee: 'Mentor', offset: 10 },
  ],
  People: [
    { title: 'Grant HRIS and payroll system access', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Labour law and internal HR policy training', category: 'Training', assignee: 'HR Lead', offset: 2 },
    { title: 'Meet department heads (intro round)', category: 'Team', assignee: 'HR Lead', offset: 5 },
  ],
  Sales: [
    { title: 'Grant CRM access and set up pipeline', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Product and pricing training', category: 'Training', assignee: 'Sales Lead', offset: 2 },
    { title: 'Shadow three client calls', category: 'Training', assignee: 'Mentor', offset: 5 },
  ],
  Marketing: [
    { title: 'Grant CMS, analytics and social tool access', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Brand voice and campaign calendar walkthrough', category: 'Training', assignee: 'Marketing Lead', offset: 2 },
  ],
  Operations: [
    { title: 'Grant ERP and internal tooling access', category: 'IT Setup', assignee: 'IT Support', offset: -1 },
    { title: 'Process and SLA walkthrough', category: 'Training', assignee: 'Operations Lead', offset: 2 },
  ],
};

const LEVEL_TASKS = {
  Junior: [
    { title: 'Weekly mentor 1:1s for the first month', category: 'Check-ins', assignee: 'Mentor', offset: 3 },
    { title: 'Complete fundamentals learning path', category: 'Training', assignee: 'Mentor', offset: 14 },
  ],
  'Mid-level': [
    { title: 'Align on 90-day objectives', category: 'Check-ins', assignee: 'Hiring Manager', offset: 7 },
  ],
  Senior: [
    { title: 'Stakeholder meetings with cross-functional leads', category: 'Team', assignee: 'Hiring Manager', offset: 5 },
    { title: 'Present first-month observations and plan', category: 'Check-ins', assignee: 'Hiring Manager', offset: 21 },
  ],
};

export const DEPARTMENTS = Object.keys(DEPARTMENT_TASKS);

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateOnboardingTasks({ department, level, startDate }) {
  const tasks = [
    ...BASE_TASKS,
    ...(DEPARTMENT_TASKS[department] || []),
    ...(LEVEL_TASKS[level] || []),
  ];
  return tasks
    .map((t) => ({ ...t, due_date: addDays(startDate, t.offset) }))
    .sort((a, b) => a.offset - b.offset)
    .map(({ offset, ...t }, i) => ({ ...t, sort_order: i }));
}
