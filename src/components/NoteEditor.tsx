import { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, CheckSquare, Heading2, Link as LinkIcon } from 'lucide-react';

export function NoteEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
  };

  const addChecklist = () => {
    document.execCommand('insertUnorderedList');
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const tools = [
    { icon: Heading2, label: 'Heading', action: () => exec('formatBlock', 'h3') },
    { icon: Bold, label: 'Bold', action: () => exec('bold') },
    { icon: Italic, label: 'Italic', action: () => exec('italic') },
    { icon: List, label: 'Bullet list', action: () => exec('insertUnorderedList') },
    { icon: ListOrdered, label: 'Numbered list', action: () => exec('insertOrderedList') },
    { icon: CheckSquare, label: 'Checklist', action: addChecklist },
    { icon: LinkIcon, label: 'Link', action: addLink },
  ];

  return (
    <div className="rounded-sm2 border border-border bg-bg-secondary overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-bg-tertiary/40">
        {tools.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={action}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-text-secondary hover:bg-bg-tertiary hover:text-text transition-colors"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        className="note-editable min-h-[180px] max-h-[50vh] overflow-y-auto px-4 py-3 text-[14px] text-text leading-relaxed focus:outline-none [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent-blue [&_a]:underline"
      />
      <style>{`
        .note-editable:empty:before {
          content: attr(data-placeholder);
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
}
