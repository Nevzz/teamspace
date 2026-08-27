import { useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Kanban } from '../components/Kanban';
import { StatusPill, Modal, Field, inputClass, EmptyState } from '../components/ui';
import { formatDate, formatRelativeTime, projectProgress, projectStatusMeta } from '../lib/helpers';
import type { Task, TaskStatus, Priority } from '../types';

const tabs = ['Overview', 'Tasks', 'Timeline', 'Resources', 'Notes'] as const;
type Tab = (typeof tabs)[number];

export function ProjectDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { data, refresh, currentUserId } = useApp();
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'Overview');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const project = data?.projects.find((p) => p.id === id);
  const tasks = useMemo(() => data?.tasks.filter((t) => t.projectId === id) ?? [], [data, id]);
  const resources = useMemo(() => data?.resources.filter((r) => r.projectId === id) ?? [], [data, id]);
  const notes = useMemo(() => data?.notes.filter((n) => n.projectId === id) ?? [], [data, id]);
  const milestones = useMemo(() => data?.milestones.filter((m) => m.projectId === id) ?? [], [data, id]);
  const subject = data?.subjects.find((s) => s.id === project?.subjectId);

  if (!data) return null;
  if (!project) {
    return (
      <div className="px-4 md:px-8 pt-8 max-w-5xl mx-auto">
        <EmptyState title="Project not found" subtitle="It may have been deleted." action={<Link to="/projects" className="text-accent-blue text-[13.5px]">Back to projects</Link>} />
      </div>
    );
  }

  const meta = projectStatusMeta[project.status];
  const progress = projectProgress(tasks.map((t) => t.status));

  const changeTab = (t: Tab) => {
    setTab(t);
    setParams(t === 'Overview' ? {} : { tab: t.toLowerCase() });
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await api.updateTask(taskId, { status });
    refresh();
  };

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-5xl mx-auto">
      <Link to="/projects" className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-text mb-4 transition-colors">
        <ChevronLeft size={15} /> Projects
      </Link>

      <div className="mb-6">
        <p className="text-[12.5px] text-text-secondary mb-1">{project.course}{subject ? ` · ${subject.professor}` : ''}</p>
        <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text mb-3">{project.projectName}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusPill label={meta.label} color={meta.color} bg={meta.bg} />
          <span className="text-[12.5px] text-text-secondary">Due {formatDate(project.deadline)}</span>
          {project.presentationDate && <span className="text-[12.5px] text-text-secondary">· Presenting {formatDate(project.presentationDate)}</span>}
        </div>
      </div>

      <div className="flex gap-5 border-b border-border mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => changeTab(t)}
            className={`pb-2.5 text-[13.5px] whitespace-nowrap border-b-2 transition-colors duration-150 ${
              tab === t ? 'border-text text-text font-medium' : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-card p-5">
            <h3 className="text-[13px] font-medium text-text-secondary mb-2">Objective</h3>
            <p className="text-[14px] text-text leading-relaxed">{project.objective || 'No objective set yet.'}</p>
          </div>
          <div className="rounded-card border border-border bg-card p-5">
            <h3 className="text-[13px] font-medium text-text-secondary mb-2">Description</h3>
            <p className="text-[14px] text-text leading-relaxed">{project.description || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-card border border-border bg-card p-5">
              <p className="text-[12px] text-text-secondary mb-1">Progress</p>
              <p className="text-[22px] font-semibold text-text mb-2">{progress}%</p>
              <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: meta.color }} />
              </div>
            </div>
            <div className="rounded-card border border-border bg-card p-5">
              <p className="text-[12px] text-text-secondary mb-1">Tasks</p>
              <p className="text-[22px] font-semibold text-text">{tasks.filter((t) => t.status === 'done').length}/{tasks.length}</p>
              <p className="text-[12px] text-text-tertiary mt-1">completed</p>
            </div>
          </div>
          {project.driveLink && (
            <a href={project.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13.5px] text-accent-blue hover:underline">
              <ExternalLink size={14} /> Open project drive folder
            </a>
          )}
        </div>
      )}

      {tab === 'Tasks' && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-accent-blue text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity">
              <Plus size={14} /> Add Task
            </button>
          </div>
          <Kanban tasks={tasks} team={data.team} onStatusChange={handleStatusChange} onTaskClick={(t) => { setEditingTask(t); setTaskModalOpen(true); }} />
        </div>
      )}

      {tab === 'Timeline' && (
        <div className="rounded-card border border-border bg-card divide-y divide-border">
          {[...milestones, { id: 'deadline', title: 'Project deadline', date: project.deadline, type: 'deadline' as const, notes: '', projectId: project.id, createdAt: '' }]
            .filter((m) => m.date)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="w-2 h-2 rounded-full bg-accent-blue shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-text truncate">{m.title}</p>
                  <p className="text-[11.5px] text-text-tertiary capitalize">{m.type}</p>
                </div>
                <span className="text-[12px] text-text-secondary shrink-0">{formatDate(m.date)}</span>
              </div>
            ))}
        </div>
      )}

      {tab === 'Resources' && (
        <ResourcesTab resources={resources} team={data.team} projectId={project.id} onChange={refresh} />
      )}

      {tab === 'Notes' && (
        <NotesTab notes={notes} team={data.team} projectId={project.id} currentUserId={currentUserId} onChange={refresh} />
      )}

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={editingTask}
        projectId={project.id}
        team={data.team}
        onSaved={refresh}
      />
    </div>
  );
}

function ResourcesTab({ resources, team, projectId, onChange }: { resources: any[]; team: any[]; projectId: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', type: 'Link' });

  const submit = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    await api.createResource({ ...form, projectId, addedBy: team[0]?.id ?? '' });
    setForm({ name: '', url: '', type: 'Link' });
    setOpen(false);
    onChange();
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-accent-blue text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity">
          <Plus size={14} /> Add Resource
        </button>
      </div>
      {resources.length === 0 ? (
        <EmptyState title="No resources yet" subtitle="Save links to slides, docs, or references for this project." />
      ) : (
        <div className="rounded-card border border-border bg-card divide-y divide-border">
          {resources.map((r) => {
            const author = team.find((m: any) => m.id === r.addedBy);
            return (
              <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-secondary transition-colors">
                <ExternalLink size={14} className="text-text-tertiary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-text truncate">{r.name}</p>
                  <p className="text-[11.5px] text-text-tertiary">{r.type}{author ? ` · Added by ${author.name}` : ''}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Resource">
        <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lecture slides" /></Field>
        <Field label="URL"><input className={inputClass} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></Field>
        <Field label="Type">
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['Link', 'Google Drive', 'Google Docs', 'YouTube', 'Article', 'Case Study', 'Dataset'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <button onClick={submit} className="w-full mt-2 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">Add Resource</button>
      </Modal>
    </div>
  );
}

function NotesTab({ notes, team, projectId, currentUserId, onChange }: { notes: any[]; team: any[]; projectId: string; currentUserId: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const submit = async () => {
    if (!form.title.trim()) return;
    await api.createNote({ ...form, projectId, authorId: currentUserId });
    setForm({ title: '', content: '' });
    setOpen(false);
    onChange();
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-accent-blue text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity">
          <Plus size={14} /> Add Note
        </button>
      </div>
      {notes.length === 0 ? (
        <EmptyState title="No notes yet" subtitle="Capture meeting notes or decisions for this project." />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => {
            const author = team.find((m: any) => m.id === n.authorId);
            return (
              <div key={n.id} className="rounded-card border border-border bg-card p-5">
                <h4 className="text-[14px] font-medium text-text mb-1.5">{n.title}</h4>
                <p className="text-[13.5px] text-text-secondary leading-relaxed whitespace-pre-wrap mb-2">{n.content}</p>
                <p className="text-[11.5px] text-text-tertiary">{author?.name ?? 'Unknown'} · {formatRelativeTime(n.updatedAt)}</p>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Note" wide>
        <Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kickoff meeting notes" /></Field>
        <Field label="Content"><textarea className={inputClass} rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your note..." /></Field>
        <button onClick={submit} className="w-full mt-2 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">Save Note</button>
      </Modal>
    </div>
  );
}

function TaskModal({ open, onClose, task, projectId, team, onSaved }: {
  open: boolean; onClose: () => void; task: Task | null; projectId: string; team: any[]; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    taskName: task?.taskName ?? '', description: task?.description ?? '', assigneeId: task?.assigneeId ?? team[0]?.id ?? '',
    status: task?.status ?? 'todo', priority: task?.priority ?? 'medium', dueDate: task?.dueDate?.slice(0, 10) ?? '',
  });

  useState(() => {
    setForm({
      taskName: task?.taskName ?? '', description: task?.description ?? '', assigneeId: task?.assigneeId ?? team[0]?.id ?? '',
      status: task?.status ?? 'todo', priority: task?.priority ?? 'medium', dueDate: task?.dueDate?.slice(0, 10) ?? '',
    });
  });

  const submit = async () => {
    if (!form.taskName.trim()) return;
    if (task) {
      await api.updateTask(task.id, form as any);
    } else {
      await api.createTask({ ...form, projectId, notes: '' } as any);
    }
    onSaved();
    onClose();
  };

  const del = async () => {
    if (!task) return;
    await api.deleteTask(task.id);
    onSaved();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <Field label="Task name"><input className={inputClass} value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} placeholder="Complete competitor analysis" /></Field>
      <Field label="Description"><textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Assignee">
          <select className={inputClass} value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
            {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
            <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority">
          <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </Field>
        <Field label="Due date">
          <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
      </div>
      <div className="flex gap-2 mt-2">
        {task && (
          <button onClick={del} className="px-3.5 py-2.5 rounded-sm2 border border-border text-accent-red text-[13.5px] font-medium hover:bg-accent-red/5 transition-colors flex items-center gap-1.5">
            <Trash2 size={14} /> Delete
          </button>
        )}
        <button onClick={submit} className="flex-1 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">
          {task ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </Modal>
  );
}
