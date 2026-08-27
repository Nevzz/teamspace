import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, BookOpen, CheckSquare, StickyNote, ListChecks, Link2, Users, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo } from 'react';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useApp();
  const navigate = useNavigate();

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const projectsById = useMemo(() => new Map((data?.projects ?? []).map((p) => [p.id, p])), [data]);
  const subjectsById = useMemo(() => new Map((data?.subjects ?? []).map((s) => [s.id, s])), [data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in" />
      <Command
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-card border border-border rounded-card shadow-popover overflow-hidden animate-in"
        shouldFilter
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-border">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Search projects, subjects, tasks, notes, team..."
            className="w-full bg-transparent py-3.5 text-[14px] text-text placeholder:text-text-tertiary focus:outline-none"
          />
          <kbd className="text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary shrink-0">Esc</kbd>
        </div>
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="py-10 text-center text-[13px] text-text-secondary">No results found</Command.Empty>

          <Command.Group heading="Projects" className="text-[11px] font-medium text-text-tertiary px-2 pt-2 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.projects ?? []).map((p) => (
              <Command.Item
                key={p.id}
                value={`${p.projectName} ${p.course}`}
                onSelect={() => go(`/projects/${p.id}`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <FolderKanban size={14} className="text-accent-blue shrink-0" />
                <span className="flex-1 truncate">{p.projectName}</span>
                <span className="text-[11.5px] text-text-tertiary">{p.course}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Subjects" className="[&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.subjects ?? []).map((s) => (
              <Command.Item
                key={s.id}
                value={`${s.name} ${s.code} ${s.professor}`}
                onSelect={() => go(`/subjects/${s.id}`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <BookOpen size={14} className="text-accent-purple shrink-0" />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="text-[11.5px] text-text-tertiary">{s.code}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Tasks" className="[&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.tasks ?? []).slice(0, 30).map((t) => (
              <Command.Item
                key={t.id}
                value={t.taskName}
                onSelect={() => go(`/projects/${t.projectId}`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <CheckSquare size={14} className="text-accent-green shrink-0" />
                <span className="flex-1 truncate">{t.taskName}</span>
                <span className="text-[11.5px] text-text-tertiary truncate max-w-[120px]">{projectsById.get(t.projectId)?.projectName}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Subject Notes" className="[&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.subjectNotes ?? []).slice(0, 20).map((n) => (
              <Command.Item
                key={n.id}
                value={`${n.title} ${n.topic}`}
                onSelect={() => go(`/subjects/${n.subjectId}?tab=notes`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <StickyNote size={14} className="text-accent-orange shrink-0" />
                <span className="flex-1 truncate">{n.title}</span>
                <span className="text-[11.5px] text-text-tertiary truncate max-w-[120px]">{subjectsById.get(n.subjectId)?.name}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Topics" className="[&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.subjectTopics ?? []).slice(0, 20).map((t) => (
              <Command.Item
                key={t.id}
                value={t.topic}
                onSelect={() => go(`/subjects/${t.subjectId}?tab=topics`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <ListChecks size={14} className="text-accent-blue shrink-0" />
                <span className="flex-1 truncate">{t.topic}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Resources" className="[&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.subjectResources ?? []).slice(0, 20).map((r) => (
              <Command.Item
                key={r.id}
                value={r.name}
                onSelect={() => go(`/subjects/${r.subjectId}?tab=resources`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <Link2 size={14} className="text-accent-gray shrink-0" />
                <span className="flex-1 truncate">{r.name}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Team" className="[&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-tertiary">
            {(data?.team ?? []).map((m) => (
              <Command.Item
                key={m.id}
                value={m.name}
                onSelect={() => go('/team')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm2 text-[13.5px] text-text cursor-pointer data-[selected=true]:bg-bg-tertiary"
              >
                <Users size={14} className="text-accent-red shrink-0" />
                <span className="flex-1 truncate">{m.name}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
