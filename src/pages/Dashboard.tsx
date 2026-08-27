import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CardSkeleton, ErrorState, Avatar } from '../components/ui';
import { dayLabel, formatDate, priorityMeta } from '../lib/helpers';
import { ChevronRight } from 'lucide-react';

export function Dashboard() {
  const { data, loading, error, refresh, currentUserId } = useApp();

  const stats = useMemo(() => {
    if (!data) return null;
    const activeProjects = data.projects.filter((p) => p.status === 'in-progress' || p.status === 'at-risk').length;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const dueThisWeek = data.projects.filter((p) => {
      const d = new Date(p.deadline);
      return d >= new Date() && d <= weekFromNow;
    }).length;
    const pendingTasks = data.tasks.filter((t) => t.status !== 'done').length;
    const completed = data.tasks.filter((t) => t.status === 'done').length;
    return { activeProjects, dueThisWeek, pendingTasks, completed };
  }, [data]);

  const upcoming = useMemo(() => {
    if (!data) return [];
    const items = [
      ...data.tasks
        .filter((t) => t.status !== 'done')
        .map((t) => ({
          id: t.id,
          title: t.taskName,
          date: t.dueDate,
          sub: data.projects.find((p) => p.id === t.projectId)?.course ?? '',
          assignee: data.team.find((m) => m.id === t.assigneeId)?.name,
          priority: t.priority,
          link: `/projects/${t.projectId}`,
        })),
      ...data.calendar.map((c) => ({
        id: c.id,
        title: c.title,
        date: c.date,
        sub: c.type === 'presentation' ? 'Presentation' : c.type === 'meeting' ? 'Meeting' : 'Milestone',
        assignee: undefined,
        priority: undefined,
        link: c.linkedType === 'project' ? `/projects/${c.linkedId}` : '/calendar',
      })),
    ];
    return items
      .filter((i) => i.date && new Date(i.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [data]);

  const currentUser = data?.team.find((m) => m.id === currentUserId);
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (error && !data?.projects.length) {
    return <ErrorState onRetry={refresh} />;
  }

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-text">
          {greeting}{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ', Team'}
        </h1>
        <p className="text-[14.5px] text-text-secondary mt-1">Here's what's happening with your projects.</p>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <StatCard label="Active Projects" value={stats?.activeProjects ?? 0} />
          <StatCard label="Due This Week" value={stats?.dueThisWeek ?? 0} />
          <StatCard label="Pending Tasks" value={stats?.pendingTasks ?? 0} />
          <StatCard label="Completed" value={stats?.completed ?? 0} />
        </div>
      )}

      <section>
        <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wide mb-3">Upcoming</h2>
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-card border border-border bg-card px-5 py-10 text-center text-[13.5px] text-text-secondary">
            Nothing on the horizon. Enjoy the calm.
          </div>
        ) : (
          <div className="rounded-card border border-border bg-card overflow-hidden">
            {Object.entries(
              upcoming.reduce<Record<string, typeof upcoming>>((acc, item) => {
                const label = dayLabel(item.date);
                acc[label] = acc[label] || [];
                acc[label].push(item);
                return acc;
              }, {}),
            ).map(([label, items], groupIdx) => (
              <div key={label}>
                <div className={`px-5 pt-4 pb-1.5 text-[11px] font-semibold tracking-wide uppercase text-text-tertiary ${groupIdx > 0 ? 'border-t border-border' : ''}`}>
                  {label}
                </div>
                {items.map((item) => (
                  <Link
                    to={item.link}
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-bg-secondary transition-colors duration-150 group"
                  >
                    {item.priority && (
                      <span
                        className="w-[6px] h-[6px] rounded-full shrink-0"
                        style={{ backgroundColor: priorityMeta[item.priority].color }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] text-text truncate">{item.title}</p>
                      <p className="text-[12px] text-text-secondary truncate">
                        {item.sub}
                        {item.assignee ? ` · Assigned to ${item.assignee}` : ''}
                      </p>
                    </div>
                    <span className="text-[11.5px] text-text-tertiary shrink-0">{formatDate(item.date)}</span>
                    <ChevronRight size={14} className="text-text-tertiary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {data && data.team.length > 0 && (
        <section className="mt-10 mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wide">Team</h2>
            <Link to="/team" className="text-[12.5px] text-accent-blue hover:underline">View all</Link>
          </div>
          <div className="flex -space-x-2">
            {data.team.map((m) => (
              <div key={m.id} title={m.name} className="ring-2 ring-bg rounded-full">
                <Avatar name={m.name} color={m.avatarColor} size={34} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-card px-4 py-4">
      <p className="text-[12px] text-text-secondary mb-1">{label}</p>
      <p className="text-[26px] font-semibold text-text tabular-nums">{value}</p>
    </div>
  );
}
