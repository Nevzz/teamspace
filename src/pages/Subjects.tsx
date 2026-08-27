import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CardSkeleton, ErrorState, EmptyState, Modal, Field, inputClass } from '../components/ui';
import { formatRelativeTime } from '../lib/helpers';

export function Subjects() {
  const { data, loading, error, refresh } = useApp();
  const [createOpen, setCreateOpen] = useState(false);

  if (error && !data?.subjects.length) return <ErrorState onRetry={refresh} />;

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text">Subjects</h1>
          <p className="text-[13.5px] text-text-secondary mt-0.5">This trimester's coursework</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm2 bg-accent-blue text-white text-[13px] font-medium hover:opacity-90 transition-opacity shrink-0">
          <Plus size={15} /> New
        </button>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data?.subjects.length ? (
        <EmptyState title="No subjects yet" subtitle="Add a subject to start organizing notes and resources." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjects.map((s) => {
            const noteCount = data.subjectNotes.filter((n) => n.subjectId === s.id).length;
            const resourceCount = data.subjectResources.filter((r) => r.subjectId === s.id).length;
            const lastUpdate = [...data.subjectNotes.filter((n) => n.subjectId === s.id)].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )[0]?.updatedAt ?? s.updatedAt;
            return (
              <Link key={s.id} to={`/subjects/${s.id}`} className="rounded-card border border-border bg-card p-5 hover:shadow-card transition-shadow duration-150">
                <p className="text-[11.5px] text-text-secondary mb-1">{s.code}</p>
                <h3 className="text-[15px] font-semibold text-text mb-1.5">{s.name}</h3>
                <p className="text-[12.5px] text-text-secondary mb-4">{s.professor}</p>
                <p className="text-[12.5px] text-text-secondary mb-3">{noteCount} notes · {resourceCount} resources</p>
                <p className="text-[11.5px] text-text-tertiary pt-3 border-t border-border">Updated {formatRelativeTime(lastUpdate)}</p>
              </Link>
            );
          })}
        </div>
      )}

      <CreateSubjectModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />
    </div>
  );
}

function CreateSubjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', code: '', professor: '', description: '', schedule: '' });
  const submit = async () => {
    if (!form.name.trim()) return;
    await api.createSubject({ ...form, trimester: 'Trimester 3' });
    setForm({ name: '', code: '', professor: '', description: '', schedule: '' });
    onCreated();
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="New Subject">
      <Field label="Subject name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Strategic Management" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Code"><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="MGT501" /></Field>
        <Field label="Professor"><input className={inputClass} value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} placeholder="Dr. Sharma" /></Field>
      </div>
      <Field label="Schedule"><input className={inputClass} value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon / Wed · 9:00 AM" /></Field>
      <Field label="Description"><textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <button onClick={submit} className="w-full mt-2 px-4 py-2.5 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity">Create Subject</button>
    </Modal>
  );
}
