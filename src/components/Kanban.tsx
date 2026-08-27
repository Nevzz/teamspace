import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import type { Task, TaskStatus, TeamMember } from '../types';
import { Avatar, PriorityDot } from './ui';
import { formatDate, isOverdue, priorityMeta, taskStatusMeta } from '../lib/helpers';

const columns: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

export function Kanban({
  tasks, team, onStatusChange, onTaskClick,
}: {
  tasks: Task[];
  team: TeamMember[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
        {columns.map((col) => (
          <Column
            key={col}
            status={col}
            tasks={tasks.filter((t) => t.status === col)}
            team={team}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} team={team} onClick={() => {}} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({ status, tasks, team, onTaskClick }: { status: TaskStatus; tasks: Task[]; team: TeamMember[]; onTaskClick: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div className="w-[260px] shrink-0 flex flex-col">
      <div className="flex items-center gap-2 px-1 mb-2.5">
        <h3 className="text-[12.5px] font-semibold text-text-secondary uppercase tracking-wide">{taskStatusMeta[status].label}</h3>
        <span className="text-[11.5px] text-text-tertiary">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 rounded-card p-2 flex-1 min-h-[120px] transition-colors duration-150 ${
          isOver ? 'bg-accent-blue/[0.06]' : 'bg-bg-secondary'
        }`}
      >
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} team={team} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  );
}

function DraggableTaskCard({ task, team, onClick }: { task: Task; team: TeamMember[]; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} team={team} onClick={onClick} />
    </div>
  );
}

function TaskCard({ task, team, onClick, dragging }: { task: Task; team: TeamMember[]; onClick: () => void; dragging?: boolean }) {
  const assignee = team.find((m) => m.id === task.assigneeId);
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-sm2 p-3 cursor-pointer hover:border-text-tertiary transition-colors duration-150 ${dragging ? 'shadow-popover rotate-1' : ''}`}
    >
      <div className="flex items-start gap-1.5 mb-2">
        <PriorityDot color={priorityMeta[task.priority].color} />
        <p className="text-[13px] text-text leading-snug flex-1">{task.taskName}</p>
      </div>
      <div className="flex items-center justify-between">
        {assignee ? <Avatar name={assignee.name} color={assignee.avatarColor} size={20} /> : <span />}
        {task.dueDate && (
          <span className={`text-[11px] ${overdue ? 'text-accent-red font-medium' : 'text-text-tertiary'}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
