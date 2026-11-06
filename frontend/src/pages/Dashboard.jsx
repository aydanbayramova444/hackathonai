import { Link } from 'react-router-dom';
import { Briefcase, Users, CalendarCheck, ListChecks, Megaphone, ClipboardList, UserPlus, Rocket, ArrowRight } from 'lucide-react';
import { useApi } from '@/lib/api';
import { greeting } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { ApplicationsChart } from '@/components/dashboard/ApplicationsChart';
import { PipelineOverview } from '@/components/dashboard/PipelineOverview';
import { UpcomingInterviews, RecentActivity, OnboardingProgress, OpenRoles, CandidateSources } from '@/components/dashboard/Widgets';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { label: 'Create Job Post', description: 'LinkedIn, Instagram, Facebook', icon: Megaphone, to: '/job-posts', tone: 'from-indigo-500 to-blue-500' },
  { label: 'Generate Interview Kit', description: 'Questions & scorecard', icon: ClipboardList, to: '/interview-kits', tone: 'from-violet-500 to-purple-500' },
  { label: 'Add Candidate', description: 'Add to the pipeline', icon: UserPlus, to: '/candidates?new=1', tone: 'from-sky-500 to-indigo-500' },
  { label: 'Create Onboarding Plan', description: 'Role-based checklist', icon: Rocket, to: '/onboarding?new=1', tone: 'from-fuchsia-500 to-violet-500' },
];

export default function Dashboard() {
  const stats = useApi('/stats');
  const interviews = useApi('/interviews?upcoming=true');
  const activity = useApi('/activity?limit=8');
  const employees = useApi('/onboarding/employees');

  const t = stats.data?.totals;
  const loading = stats.loading && !stats.data;
  const nextInterview = interviews.data?.[0];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (stats.error && !stats.data) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h2 className="text-lg font-semibold">Can’t reach the HireFlow API</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Make sure the backend is running on port 4000 (<code className="rounded bg-muted px-1">npm run dev</code> from the project root).
        </p>
        <Button className="mt-5" onClick={stats.reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-gradient-to-br from-indigo-200/60 to-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[13px] font-medium text-muted-foreground">{today}</div>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {greeting()}, <span className="text-brand-gradient">HR Team!</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {loading
                ? 'Loading your workspace…'
                : `You have ${t.interviews_scheduled} interview${t.interviews_scheduled === 1 ? '' : 's'} coming up, ${t.new_this_week} new application${t.new_this_week === 1 ? '' : 's'} this week and ${t.pending_onboarding_tasks} onboarding task${t.pending_onboarding_tasks === 1 ? '' : 's'} waiting.`}
            </p>
          </div>
          <Button asChild variant="gradient" size="lg" className="self-start lg:self-auto">
            <Link to="/candidates">
              Open pipeline <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="stagger relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, description, icon: Icon, to, tone }) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col items-start gap-2.5 rounded-xl border sm:flex-row sm:items-center sm:gap-3 bg-white/70 p-3 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-lift focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none"
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white shadow-soft transition-transform group-hover:scale-105`}>
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] leading-snug font-semibold sm:truncate">{label}</span>
                <span className="hidden truncate text-xs text-muted-foreground sm:block">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          to="/job-posts"
          label="Active vacancies"
          value={t?.active_vacancies}
          icon={Briefcase}
          tone="bg-indigo-50 text-indigo-600"
          hint={t && `${t.hired} hired so far`}
          loading={loading}
        />
        <StatCard
          to="/candidates"
          label="Total candidates"
          value={t?.total_candidates}
          icon={Users}
          tone="bg-violet-50 text-violet-600"
          hint={t && `${t.active_candidates} in progress · +${t.new_this_week} this week`}
          loading={loading}
        />
        <StatCard
          to="/interview-kits"
          label="Interviews scheduled"
          value={t?.interviews_scheduled}
          icon={CalendarCheck}
          tone="bg-sky-50 text-sky-600"
          hint={nextInterview ? `Next: ${nextInterview.candidate_name.split(' ')[0]}, ${new Date(nextInterview.scheduled_at).toLocaleDateString('en-US', { weekday: 'short' })}` : 'Nothing scheduled'}
          loading={loading}
        />
        <StatCard
          to="/onboarding"
          label="Pending onboarding tasks"
          value={t?.pending_onboarding_tasks}
          icon={ListChecks}
          tone="bg-emerald-50 text-emerald-600"
          hint={t && `${t.completed_onboarding_tasks} completed`}
          loading={loading}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ApplicationsChart weekly={stats.data?.weekly} totals={t} loading={loading} />
        <PipelineOverview pipeline={stats.data?.pipeline} totals={t} loading={loading} />
      </section>

      {/* Lists */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UpcomingInterviews interviews={interviews.data} loading={interviews.loading && !interviews.data} />
        <RecentActivity activity={activity.data} loading={activity.loading && !activity.data} />
        <OnboardingProgress employees={employees.data} totals={t} loading={(employees.loading && !employees.data) || loading} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <OpenRoles vacancies={stats.data?.by_vacancy} loading={loading} />
        <CandidateSources sources={stats.data?.by_source} loading={loading} />
      </section>
    </div>
  );
}
