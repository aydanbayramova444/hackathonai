import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, MapPin, Video, Inbox } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, Progress, Skeleton } from '@/components/ui/misc';
import { Badge } from '@/components/ui/badge';
import { cn, formatTime, relativeDay, timeAgo, formatDate } from '@/lib/utils';
import { INTERVIEW_TYPE_STYLES } from '@/lib/constants';
import { ACTIVITY_ICONS } from '@/lib/activity';
import { ChartTooltip } from './ChartTooltip';
import { CHART } from './chartTheme';

function CardLink({ to, children }) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-primary hover:underline">
      {children} <ArrowRight className="size-3.5" />
    </Link>
  );
}

function Empty({ icon: Icon = Inbox, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {children && <p className="mt-1 text-xs text-muted-foreground">{children}</p>}
    </div>
  );
}

const ListSkeleton = ({ rows = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export function UpcomingInterviews({ interviews, loading }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Upcoming interviews</CardTitle>
          <CardDescription>{loading ? 'Loading…' : `${interviews?.length ?? 0} scheduled`}</CardDescription>
        </div>
        <CardLink to="/interview-kits">Prepare kits</CardLink>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton />
        ) : !interviews?.length ? (
          <Empty icon={CalendarDays} title="No interviews scheduled">Move a candidate to Interview to plan one.</Empty>
        ) : (
          <ul className="space-y-2">
            {interviews.slice(0, 4).map((iv) => {
              const remote = /meet|zoom|teams/i.test(iv.mode);
              return (
                <li key={iv.id}>
                  <Link
                    to={`/candidates?candidate=${iv.candidate_id}`}
                    className="group -mx-2 flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/70"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg border bg-card py-1.5 shadow-soft">
                      <span className="text-[10px] font-semibold text-primary uppercase">
                        {new Date(iv.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg leading-none font-semibold tabular-nums">{new Date(iv.scheduled_at).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold group-hover:text-primary">{iv.candidate_name}</span>
                        <span className={cn('rounded px-1.5 py-px text-[10px] font-semibold ring-1 ring-inset', INTERVIEW_TYPE_STYLES[iv.type])}>
                          {iv.type}
                        </span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{iv.vacancy_title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {relativeDay(iv.scheduled_at)}, {formatTime(iv.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          {remote ? <Video className="size-3" /> : <MapPin className="size-3" />} {iv.mode}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentActivity({ activity, loading }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest updates across your workspace</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : !activity?.length ? (
          <Empty title="No activity yet" />
        ) : (
          <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border">
            {activity.slice(0, 6).map((a) => {
              const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.candidate;
              const Icon = meta.icon;
              return (
                <li key={a.id} className="relative flex gap-3">
                  <span className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card', meta.tone)}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[13px] leading-snug">{a.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function OnboardingProgress({ employees, totals, loading }) {
  const pending = totals?.pending_onboarding_tasks ?? 0;
  const done = totals?.completed_onboarding_tasks ?? 0;
  const overall = pending + done ? Math.round((done / (pending + done)) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Onboarding progress</CardTitle>
          <CardDescription>{loading ? 'Loading…' : `${pending} task${pending === 1 ? '' : 's'} pending`}</CardDescription>
        </div>
        <CardLink to="/onboarding">View all</CardLink>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton />
        ) : (
          <>
            <div className="mb-5 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-indigo-950/80">Overall completion</span>
                <span className="text-xl font-semibold tabular-nums text-indigo-950">{overall}%</span>
              </div>
              <Progress value={overall} className="mt-2 bg-white/80" />
              <div className="mt-2 text-xs text-indigo-950/60">
                {done} of {pending + done} tasks done
              </div>
            </div>
            {!employees?.length ? (
              <Empty title="No new hires onboarding" />
            ) : (
              <ul className="space-y-4">
                {employees.slice(0, 4).map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <Avatar name={e.name} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{e.name}</span>
                        <span className="text-xs font-semibold tabular-nums">{e.progress}%</span>
                      </div>
                      <div className="mb-1.5 truncate text-xs text-muted-foreground">
                        {e.position} · {new Date(`${e.start_date}T00:00:00`) > new Date() ? 'Starts' : 'Started'} {formatDate(`${e.start_date}T00:00:00`)}
                      </div>
                      <Progress value={e.progress} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function OpenRoles({ vacancies, loading }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Open roles</CardTitle>
          <CardDescription>Candidate flow per active vacancy</CardDescription>
        </div>
        <CardLink to="/job-posts">New job post</CardLink>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {loading ? (
          <div className="space-y-3 px-5 pb-3">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Role</th>
                  <th className="px-3 py-2.5 font-medium">Department</th>
                  <th className="px-3 py-2.5 text-right font-medium">Candidates</th>
                  <th className="px-3 py-2.5 text-right font-medium">Interview / Offer</th>
                  <th className="px-5 py-2.5 font-medium">Hired</th>
                </tr>
              </thead>
              <tbody>
                {(vacancies || []).map((v) => (
                  <tr key={v.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link to={`/candidates?vacancy=${v.id}`} className="font-medium hover:text-primary">
                        {v.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary">{v.department}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{v.candidates}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{v.in_progress}</td>
                    <td className="px-5 py-3">
                      {v.hired > 0 ? (
                        <Badge variant="success">{v.hired} hired</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Open</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CandidateSources({ sources, loading }) {
  const data = sources || [];
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Candidate sources</CardTitle>
          <CardDescription>Where applicants come from</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <div className="h-56" role="img" aria-label={`Candidate sources: ${data.map((s) => `${s.source} ${s.count}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }} barCategoryGap={6}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="source"
                  width={112}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART.axis, fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: CHART.cursor }} content={<ChartTooltip format={(v) => `${v} candidate${v === 1 ? '' : 's'}`} />} />
                <Bar dataKey="count" fill={CHART.series} radius={[0, 4, 4, 0]} maxBarSize={18} animationDuration={700}>
                  <LabelList dataKey="count" position="right" className="fill-foreground text-xs font-semibold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
