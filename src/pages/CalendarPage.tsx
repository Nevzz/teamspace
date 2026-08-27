import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/helpers';

const typeColor: Record<string, string> = {
  deadline: '#FF453A',
  presentation: '#0A84FF',
  meeting: '#BF5AF2',
  milestone: '#FF9F0A',
};

export function CalendarPage() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const events = useMemo(() => {
    if (!data) return [];
    const projectDeadlines = data.projects.map((p) => ({
      id: `pd-${p.id}`, title: p.projectName, date: p.deadline, type: 'deadline' as const, linkedType: 'project' as const, linkedId: p.id,
    }));
    const taskDeadlines = data.tasks.filter((t) => t.status !== 'done').map((t) => ({
      id: `td-${t.id}`, title: t.taskName, date: t.dueDate, type: 'deadline' as const, linkedType: 'project' as const, linkedId: t.projectId,
    }));
    return [...data.calendar, ...projectDeadlines, ...taskDeadlines].filter((e) => e.date);
  }, [data]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const days = useMemo(() => {
    const start = new Date(cursor);
    const startWeekday = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startWeekday);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [cursor]);

  const eventsFor = (day: Date) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
    });

  const today = new Date();

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text">Calendar</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-bg-secondary transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13.5px] font-medium text-text w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-bg-secondary transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[11px] font-medium text-text-tertiary py-2.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const isToday = day.toDateString() === today.toDateString();
            const dayEvents = eventsFor(day);
            return (
              <div
                key={i}
                className={`min-h-[76px] sm:min-h-[92px] p-1.5 border-b border-r border-border last-in-row:border-r-0 ${!inMonth ? 'bg-bg-secondary/40' : ''}`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11.5px] mb-1 ${
                  isToday ? 'bg-accent-blue text-white font-medium' : inMonth ? 'text-text' : 'text-text-tertiary'
                }`}>
                  {day.getDate()}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => e.linkedType === 'project' && navigate(`/projects/${e.linkedId}`)}
                      className="block w-full text-left truncate text-[10px] px-1 py-[1px] rounded"
                      style={{ backgroundColor: `${typeColor[e.type] ?? '#8E8E93'}18`, color: typeColor[e.type] ?? '#8E8E93' }}
                      title={e.title}
                    >
                      {e.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && <span className="text-[10px] text-text-tertiary px-1">+{dayEvents.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 mt-4 flex-wrap">
        {Object.entries(typeColor).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-[12px] text-text-secondary capitalize">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} /> {type}
          </div>
        ))}
      </div>

      {events.filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wide mb-3">Next up</h2>
          <div className="rounded-card border border-border bg-card divide-y divide-border">
            {events
              .filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 6)
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => e.linkedType === 'project' && navigate(`/projects/${e.linkedId}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-bg-secondary transition-colors text-left"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeColor[e.type] ?? '#8E8E93' }} />
                  <span className="flex-1 text-[13.5px] text-text truncate">{e.title}</span>
                  <span className="text-[12px] text-text-secondary shrink-0">{formatDate(e.date)}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
