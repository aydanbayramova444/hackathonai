export const COMPANY = 'Brightwave Technologies';

export const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

// Stage = state, so each gets a soft badge tone + dot (always shown with its label).
export const STAGE_STYLES = {
  Applied: { badge: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  Screening: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  Interview: { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200', dot: 'bg-indigo-500' },
  Offer: { badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  Hired: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  Rejected: { badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-400' },
};

export const INTERVIEW_TYPE_STYLES = {
  HR: 'bg-sky-50 text-sky-700 ring-sky-200',
  Technical: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Behavioral: 'bg-violet-50 text-violet-700 ring-violet-200',
};
