import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/ui';
import { ErrorState } from '../components/ui';

export function Team() {
  const { data, error, refresh } = useApp();

  const rows = useMemo(() => {
    if (!data) return [];
    return data.team.map((m) => {
      const memberTasks = data.tasks.filter((t) => t.assigneeId === m.id);
      const active = memberTasks.filter((t) => t.status !== 'done').length;
      const completed = memberTasks.filter((t) => t.status === 'done').length;
      return { member: m, active, completed, total: memberTasks.length };
    });
  }, [data]);

  if (error && !data?.team.length) return <ErrorState onRetry={refresh} />;
  const maxTotal = Math.max(1, ...rows.map((r) => r.total));

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text">Team</h1>
        <p className="text-[13.5px] text-text-secondary mt-0.5">{data?.team.length ?? 0} members this trimester</p>
      </div>

      <div className="rounded-card border border-border bg-card divide-y divide-border">
        {rows.map(({ member, active, completed, total }) => (
          <div key={member.id} className="flex items-center gap-3.5 px-5 py-4">
            <Avatar name={member.name} color={member.avatarColor} size={38} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-text">{member.name}</p>
              <p className="text-[12.5px] text-text-secondary">{active} active task{active === 1 ? '' : 's'} · {completed} completed</p>
              <div className="h-1 rounded-full bg-bg-tertiary overflow-hidden mt-2 max-w-[160px]">
                <div className="h-full rounded-full bg-accent-blue" style={{ width: `${(total / maxTotal) * 100}%` }} />
              </div>
            </div>
            <span className="text-[11.5px] text-text-tertiary shrink-0">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
