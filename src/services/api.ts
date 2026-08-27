import type {
  AppData, TeamMember, Subject, Project, Task, Milestone, Resource, Note,
  CalendarEvent, SubjectNote, SubjectTopic, SubjectResource, SheetName,
} from '../types';
import { mockData } from '../data/mockData';

const API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;
const DEMO_MODE = !API_URL || API_URL.includes('YOUR_SCRIPT_ID');
const STORAGE_KEY = 'teamspace_demo_data_v1';

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- Demo-mode local store (used when no Apps Script URL is configured) ----------

function loadDemoStore(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // fall through to seed
  }
  const seeded = JSON.parse(JSON.stringify(mockData)) as AppData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveDemoStore(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function demoDelay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const collectionKey: Record<SheetName, keyof AppData> = {
  Team: 'team',
  Projects: 'projects',
  Tasks: 'tasks',
  Milestones: 'milestones',
  Resources: 'resources',
  Notes: 'notes',
  Calendar: 'calendar',
  Subjects: 'subjects',
  SubjectNotes: 'subjectNotes',
  SubjectTopics: 'subjectTopics',
  SubjectResources: 'subjectResources',
};

// ---------- Low-level transport ----------

async function callAppsScript<T = unknown>(
  action: string,
  sheet: SheetName,
  payload?: Record<string, unknown>,
  method: 'GET' | 'POST' = 'GET',
): Promise<T> {
  if (!API_URL) throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not configured');

  if (method === 'GET') {
    const params = new URLSearchParams({ action, sheet });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data as T;
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    // Apps Script web apps require a "simple" content-type to avoid CORS preflight.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, sheet, ...payload }),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

// ---------- Generic CRUD used by the demo store ----------

function demoList<T>(sheet: SheetName): Promise<T[]> {
  const store = loadDemoStore();
  return demoDelay((store[collectionKey[sheet]] as unknown as T[]) ?? []);
}

function demoCreate<T extends { id: string }>(sheet: SheetName, record: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
  const store = loadDemoStore();
  const key = collectionKey[sheet];
  const now = new Date().toISOString();
  const newRecord = { ...record, id: genId(sheet.toLowerCase()), createdAt: now, updatedAt: now } as unknown as T;
  (store[key] as unknown as T[]).unshift(newRecord);
  saveDemoStore(store);
  return demoDelay(newRecord);
}

function demoUpdate<T extends { id: string }>(sheet: SheetName, id: string, updates: Partial<T>): Promise<T> {
  const store = loadDemoStore();
  const key = collectionKey[sheet];
  const list = store[key] as unknown as T[];
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Record not found');
  const updated = { ...list[idx], ...updates, updatedAt: new Date().toISOString() } as T;
  list[idx] = updated;
  saveDemoStore(store);
  return demoDelay(updated);
}

function demoDelete(sheet: SheetName, id: string): Promise<{ id: string }> {
  const store = loadDemoStore();
  const key = collectionKey[sheet];
  const list = store[key] as unknown as { id: string }[];
  const next = list.filter((r) => r.id !== id);
  (store[key] as unknown) = next;
  saveDemoStore(store);
  return demoDelay({ id });
}

// ---------- Public API ----------

async function list<T>(sheet: SheetName): Promise<T[]> {
  if (DEMO_MODE) return demoList<T>(sheet);
  return callAppsScript<T[]>('list', sheet);
}

async function create<T extends { id: string }>(sheet: SheetName, record: Partial<T>): Promise<T> {
  if (DEMO_MODE) return demoCreate<T>(sheet, record as Omit<T, 'id' | 'createdAt' | 'updatedAt'>);
  return callAppsScript<T>('create', sheet, { record }, 'POST');
}

async function update<T extends { id: string }>(sheet: SheetName, id: string, updates: Partial<T>): Promise<T> {
  if (DEMO_MODE) return demoUpdate<T>(sheet, id, updates);
  return callAppsScript<T>('update', sheet, { id, record: updates }, 'POST');
}

async function remove(sheet: SheetName, id: string): Promise<{ id: string }> {
  if (DEMO_MODE) return demoDelete(sheet, id);
  return callAppsScript<{ id: string }>('delete', sheet, { id }, 'POST');
}

export async function fetchAllData(): Promise<AppData> {
  if (DEMO_MODE) {
    return loadDemoStore();
  }
  const [team, subjects, projects, tasks, milestones, resources, notes, calendar, subjectNotes, subjectTopics, subjectResources] =
    await Promise.all([
      list<TeamMember>('Team'),
      list<Subject>('Subjects'),
      list<Project>('Projects'),
      list<Task>('Tasks'),
      list<Milestone>('Milestones'),
      list<Resource>('Resources'),
      list<Note>('Notes'),
      list<CalendarEvent>('Calendar'),
      list<SubjectNote>('SubjectNotes'),
      list<SubjectTopic>('SubjectTopics'),
      list<SubjectResource>('SubjectResources'),
    ]);
  return { team, subjects, projects, tasks, milestones, resources, notes, calendar, subjectNotes, subjectTopics, subjectResources };
}

export const isDemoMode = DEMO_MODE;

export const api = {
  // Team
  getTeam: () => list<TeamMember>('Team'),
  createTeamMember: (r: Partial<TeamMember>) => create<TeamMember>('Team', r),
  updateTeamMember: (id: string, r: Partial<TeamMember>) => update<TeamMember>('Team', id, r),
  deleteTeamMember: (id: string) => remove('Team', id),

  // Subjects
  getSubjects: () => list<Subject>('Subjects'),
  createSubject: (r: Partial<Subject>) => create<Subject>('Subjects', r),
  updateSubject: (id: string, r: Partial<Subject>) => update<Subject>('Subjects', id, r),
  deleteSubject: (id: string) => remove('Subjects', id),

  // Projects
  getProjects: () => list<Project>('Projects'),
  createProject: (r: Partial<Project>) => create<Project>('Projects', r),
  updateProject: (id: string, r: Partial<Project>) => update<Project>('Projects', id, r),
  deleteProject: (id: string) => remove('Projects', id),

  // Tasks
  getTasks: () => list<Task>('Tasks'),
  createTask: (r: Partial<Task>) => create<Task>('Tasks', r),
  updateTask: (id: string, r: Partial<Task>) => update<Task>('Tasks', id, r),
  deleteTask: (id: string) => remove('Tasks', id),

  // Milestones
  getMilestones: () => list<Milestone>('Milestones'),
  createMilestone: (r: Partial<Milestone>) => create<Milestone>('Milestones', r),
  deleteMilestone: (id: string) => remove('Milestones', id),

  // Resources (project-level)
  getResources: () => list<Resource>('Resources'),
  createResource: (r: Partial<Resource>) => create<Resource>('Resources', r),
  deleteResource: (id: string) => remove('Resources', id),

  // Notes (project-level)
  getNotes: () => list<Note>('Notes'),
  createNote: (r: Partial<Note>) => create<Note>('Notes', r),
  updateNote: (id: string, r: Partial<Note>) => update<Note>('Notes', id, r),
  deleteNote: (id: string) => remove('Notes', id),

  // Calendar
  getCalendar: () => list<CalendarEvent>('Calendar'),
  createCalendarEvent: (r: Partial<CalendarEvent>) => create<CalendarEvent>('Calendar', r),
  deleteCalendarEvent: (id: string) => remove('Calendar', id),

  // Subject Notes
  getSubjectNotes: () => list<SubjectNote>('SubjectNotes'),
  createSubjectNote: (r: Partial<SubjectNote>) => create<SubjectNote>('SubjectNotes', r),
  updateSubjectNote: (id: string, r: Partial<SubjectNote>) => update<SubjectNote>('SubjectNotes', id, r),
  deleteSubjectNote: (id: string) => remove('SubjectNotes', id),

  // Subject Topics
  getSubjectTopics: () => list<SubjectTopic>('SubjectTopics'),
  createSubjectTopic: (r: Partial<SubjectTopic>) => create<SubjectTopic>('SubjectTopics', r),
  updateSubjectTopic: (id: string, r: Partial<SubjectTopic>) => update<SubjectTopic>('SubjectTopics', id, r),
  deleteSubjectTopic: (id: string) => remove('SubjectTopics', id),

  // Subject Resources
  getSubjectResources: () => list<SubjectResource>('SubjectResources'),
  createSubjectResource: (r: Partial<SubjectResource>) => create<SubjectResource>('SubjectResources', r),
  deleteSubjectResource: (id: string) => remove('SubjectResources', id),
};
