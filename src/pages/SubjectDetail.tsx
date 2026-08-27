import { useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, ExternalLink, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { EmptyState, Modal, Field, inputClass, StatusPill, PriorityDot } from '../components/ui';
import { NoteEditor } from '../components/NoteEditor';
import { formatRelativeTime, priorityMeta, projectStatusMeta, formatDate } from '../lib/helpers';
import type { SubjectNote, SubjectTopic, Priority } from '../types';

const tabs = ['Notes', 'Topics', 'Resources', 'Projects'] as const;
type Tab = (typeof tabs)[number];

export function SubjectDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { data, refresh, currentUserId } = useApp();
  const initial = (params.get('tab') || 'notes') as string;
  const [tab, setTab] = useState<Tab>((tabs.find((t) => t.toLowerCase() === initial) as Tab) || 'Notes');

  const subject = data?.subjects.find((s) => s.id === id);
  const notes = useMemo(() => data?.subjectNotes.filter((n) => n.subjectId === id) ?? [], [data, id]);
  const topics = useMemo(() => data?.subjectTopics.filter((t) => t.subjectId === id) ?? [], [data, id]);
  const resources = useMemo(() => data?.subjectResources.filter((r) => r.subjectId === id) ?? [], [data, id]);
  const projects = useMemo(() => data?.projects.filter((p) => p.subjectId === id) ?? [], [data, id]);

  if (!data) return null;
  if (!subject) {
    return (
      <div className="px-4 md:px-8 pt-8 max-w-4xl mx-auto">
        <EmptyState title="Subject not found" action={<Link to="/subjects" className="text-accent-blue text-[13.5px]">Back to subjects</Link>} />
      </div>
    );
  }

  const changeTab = (t: Tab) => {
    setTab(t);
    setParams({ tab: t.toLowerCase() });
  };

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-4xl mx-auto">
      <Link to="/subjects" className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-text mb-4 transition-colors">
        <ChevronLeft size={15} /> Subjects
      </Link>

      <div className="mb-6">
        <p className="text-[12.5px] text-text-secondary mb-1">{subject.code} · {subject.professor}</p>
        <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text mb-2">{subject.name}</h1>
        <p className="text-[13.5px] text-text-secondary">{subject.schedule}</p>
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

      {tab === 'Notes' && <NotesTab notes={notes} team={data.team} subjectId={subject.id} currentUserId={currentUserId} onChange={refresh} />}
      {tab === 'Topics' && <TopicsTab topics={topics} subjectId={subject.id} onChange={refresh} />}
      {tab === 'Resources' && <ResourcesTab resources={resources} team={data.team} subjectId={subject.id} onChange={refresh} />}
      {tab === 'Projects' && (
        projects.length === 0 ? (
          <EmptyState title="No projects for this subject yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => {
              const meta = projectStatusMeta[p.status];
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="rounded-card border border-border bg-card p-5 hover:shadow-card transition-shadow">
                  <h3 className="text-[14.5px] font-semibold text-text mb-2">{p.projectName}</h3>
                  <StatusPill label={meta.label} color={meta.color} bg={meta.bg} />
                  <p className="text-[12px] text-text-secondary mt-3">Due {formatDate(p.deadline)}</p>
                </Link>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function NotesTab({ notes, team, subjectId, currentUserId, onChange }: {
  notes: SubjectNote[]; team: any[]; subjectId: string; currentUserId: string; onChange: () => void;
}) {
  const [openNote, setOpenNote] = useState<SubjectNote | 'new' | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpenNote('new')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-accent-blue text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity">
          <Plus size={14} /> New Note
        </button>
      </div>
      {notes.length === 0 ? (
        <EmptyState title="No notes yet" subtitle="Start a shared note for the whole team to collaborate on." />
      ) : (
        <div className="rounded-card border border-border bg-card divide-y divide-border">
          {[...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((n) => {
            const author = team.find((m) => m.id === n.authorId);
            return (
              <button key={n.id} onClick={() => setOpenNote(n)} className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-bg-secondary transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] text-text truncate">{n.title}</p>
                  <p className="text-[11.5px] text-text-tertiary truncate">{n.topic}</p>
                </div>
                <p className="text-[11.5px] text-text-tertiary shrink-0">{author?.name.split(' ')[0] ?? 'Unknown'} · {formatRelativeTime(n.updatedAt)}</p>
              </button>
            );
          })}
        </div>
      )}
      <NoteEditorModal
        note={openNote === 'new' ? null : openNote}
        open={openNote !== null}
        onClose={() => setOpenNote(null)}
        subjectId={subjectId}
        currentUserId={currentUserId}
        onSaved={onChange}
      />
    </div>
  );
}

function NoteEditorModal({ note, open, onClose, subjectId, currentUserId, onSaved }: {
  note: SubjectNote | null; open: boolean; onClose: () => void; subjectId: string; currentUserId: string; onSaved: () => void;
}) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [topic, setTopic] = useState(note?.topic ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  if (open && note && title === '' && content === '' && note.title !== title) {
    // sync when switching notes (simple approach since modal remounts on key change below)
  }

  const submit = async () => {
    if (!title.trim()) return;
    if (note) {
      await api.updateSubjectNote(note.id, { title, topic, content });
    } else {
      await api.createSubjectNote({ title, topic, content, subjectId, authorId: currentUserId });
    }
    onSaved();
    onClose();
  };

  const del = async () => {
    if (!note) return;
    await api.deleteSubjectNote(note.id);
    onSaved();
    onClose();
  };

  return (
    <Modal key={note?.id ?? 'new'} open={open} onClose={onClose} title={note ? 'Edit Note' : 'New Note'} wide>
      <input
        className="w-full text-[18px] font-semibold text-text bg-transparent focus:outline-none mb-1 placeholder:text-text-tertiary"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="w-full text-[13px] text-text-secondary bg-transparent focus:outline-none mb-4 placeholder:text-text-tertiary"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <NoteEditor value={content} onChange={setContent} placeholder="Start writing..." />
      <div className="flex gap-2 mt-4">
        {note && (
          <button onClick={del} className="px-3.5 py-2.5 rounded-sm2 border border-border text-accent-red text-[13.5px] font-medium hover:bg-accent-red/5 transition-colors flex items-center gap-1.5">
            <Trash2 size={14} /> Delete
          </button>
        )}
        <button onClick={submit} className="flex-1 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">
          {note ? 'Save Changes' : 'Create Note'}
        </button>
      </div>
    </Modal>
  );
}

function TopicsTab({ topics, subjectId, onChange }: { topics: SubjectTopic[]; subjectId: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ topic: '', priority: 'medium' as Priority });
  const completed = topics.filter((t) => t.status === 'complete').length;

  const toggle = async (t: SubjectTopic) => {
    await api.updateSubjectTopic(t.id, { status: t.status === 'complete' ? 'pending' : 'complete' });
    onChange();
  };

  const remove = async (id: string) => {
    await api.deleteSubjectTopic(id);
    onChange();
  };

  const submit = async () => {
    if (!form.topic.trim()) return;
    await api.createSubjectTopic({ ...form, subjectId, status: 'pending', notes: '' });
    setForm({ topic: '', priority: 'medium' });
    setOpen(false);
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12.5px] text-text-secondary">{completed} of {topics.length} topics completed</p>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-accent-blue text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity">
          <Plus size={14} /> Add Topic
        </button>
      </div>
      <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden mb-5">
        <div className="h-full rounded-full bg-accent-green transition-all duration-300" style={{ width: `${topics.length ? (completed / topics.length) * 100 : 0}%` }} />
      </div>
      {topics.length === 0 ? (
        <EmptyState title="No topics yet" subtitle="Track what's covered for this subject." />
      ) : (
        <div className="rounded-card border border-border bg-card divide-y divide-border">
          {topics.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-5 py-3 group">
              <button onClick={() => toggle(t)} className="shrink-0 text-text-secondary">
                {t.status === 'complete' ? <CheckSquare size={17} className="text-accent-green" /> : <Square size={17} />}
              </button>
              <PriorityDot color={priorityMeta[t.priority].color} />
              <span className={`flex-1 text-[13.5px] ${t.status === 'complete' ? 'text-text-tertiary line-through' : 'text-text'}`}>{t.topic}</span>
              <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-red transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Topic">
        <Field label="Topic"><input className={inputClass} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Blue Ocean Strategy" /></Field>
        <Field label="Priority">
          <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </Field>
        <button onClick={submit} className="w-full mt-2 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">Add Topic</button>
      </Modal>
    </div>
  );
}

function ResourcesTab({ resources, team, subjectId, onChange }: { resources: any[]; team: any[]; subjectId: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', type: 'Link', description: '' });

  const submit = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    await api.createSubjectResource({ ...form, subjectId, addedBy: team[0]?.id ?? '' });
    setForm({ name: '', url: '', type: 'Link', description: '' });
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
        <EmptyState title="No resources yet" subtitle="Save lecture slides, docs, or reference material here." />
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
        <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Strategy Lecture Slides" /></Field>
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
