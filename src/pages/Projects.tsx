import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CardSkeleton, ErrorState, EmptyState, StatusPill, Field, inputClass, Modal } from '../components/ui';
import { formatDate, projectProgress, projectStatusMeta } from '../lib/helpers';
import type { Project, ProjectStatus, Priority } from '../types';

const statusFilters: (ProjectStatus | 'all')[] = ['all', 'not-started', 'in-progress', 'at-risk', 'completed'];

export function Projects() {
  const { data, loading, error, refresh } = useApp();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const projects = useMemo(() => {
    if (!data) return [];
    const list = filter === 'all' ? data.projects : data.projects.filter((p) => p.status === filter);
    return [...list].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [data, filter]);

  if (error && !data?.projects.length) return <ErrorState onRetry={refresh} />;

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text">Projects</h1>
          <p className="text-[13.5px] text-text-secondary mt-0.5">{data?.projects.length ?? 0} total across your subjects</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm2 bg-accent-blue text-white text-[13px] font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={15} /> New
        </button>
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto no-scrollbar">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150 ${
              filter === f ? 'bg-text text-bg' : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            {f === 'all' ? 'All' : projectStatusMeta[f].label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects here yet" subtitle="Create a project to start tracking tasks and deadlines." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} taskCount={data?.tasks.filter((t) => t.projectId === p.id) ?? []} />
          ))}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />
    </div>
  );
}

function ProjectCard({ project, taskCount }: { project: Project; taskCount: { status: string }[] }) {
  const meta = projectStatusMeta[project.status];
  const progress = projectProgress(taskCount.map((t) => t.status as any));
  const memberCount = new Set(taskCount.map((t: any) => t.assigneeId).filter(Boolean)).size;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="rounded-card border border-border bg-card p-5 hover:shadow-card transition-shadow duration-150 flex flex-col"
    >
      <p className="text-[11.5px] text-text-secondary mb-1">{project.course}</p>
      <h3 className="text-[15px] font-semibold text-text mb-3 leading-snug">{project.projectName}</h3>
      <div className="mb-3">
        <StatusPill label={meta.label} color={meta.color} bg={meta.bg} />
      </div>
      <div className="mb-1.5">
        <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: meta.color }} />
        </div>
      </div>
      <p className="text-[11.5px] text-text-tertiary mb-4">{progress}% complete</p>
      <div className="mt-auto flex items-center justify-between text-[12px] text-text-secondary pt-3 border-t border-border">
        <span>Due {formatDate(project.deadline)}</span>
        <span>{memberCount || 1} member{memberCount === 1 ? '' : 's'}</span>
      </div>
    </Link>
  );
}

function CreateProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { data } = useApp();
  const [form, setForm] = useState({
    projectName: '', subjectId: data?.subjects[0]?.id ?? '', description: '', objective: '',
    status: 'not-started' as ProjectStatus, priority: 'medium' as Priority, deadline: '', presentationDate: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.projectName.trim() || !form.subjectId) return;
    setSaving(true);
    const subject = data?.subjects.find((s) => s.id === form.subjectId);
    await api.createProject({
      ...form,
      course: subject?.name ?? '',
      professor: subject?.professor ?? '',
      startDate: new Date().toISOString(),
      submissionRequirements: '', submissionLink: '', driveLink: '',
    });
    setSaving(false);
    onCreated();
    onClose();
    setForm({ projectName: '', subjectId: data?.subjects[0]?.id ?? '', description: '', objective: '', status: 'not-started', priority: 'medium', deadline: '', presentationDate: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <Field label="Project name">
        <input className={inputClass} value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="Market Entry Analysis" />
      </Field>
      <Field label="Subject">
        <select className={inputClass} value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
          {data?.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Objective">
        <textarea className={inputClass} rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="What does success look like?" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
            {(['not-started', 'in-progress', 'at-risk', 'completed'] as ProjectStatus[]).map((s) => <option key={s} value={s}>{projectStatusMeta[s].label}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Deadline">
          <input type="date" className={inputClass} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>
        <Field label="Presentation date">
          <input type="date" className={inputClass} value={form.presentationDate} onChange={(e) => setForm({ ...form, presentationDate: e.target.value })} />
        </Field>
      </div>
      <button
        disabled={saving || !form.projectName.trim()}
        onClick={submit}
        className="w-full mt-2 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {saving ? 'Creating...' : 'Create Project'}
      </button>
    </Modal>
  );
}
