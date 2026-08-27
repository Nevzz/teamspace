// Core domain types — mirror the Google Sheets column headers exactly.

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type ProjectStatus = 'not-started' | 'in-progress' | 'at-risk' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type TopicStatus = 'pending' | 'complete';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  description: string;
  trimester: string;
  schedule: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectName: string;
  subjectId: string;
  course: string;
  description: string;
  objective: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  deadline: string;
  professor: string;
  presentationDate: string;
  submissionRequirements: string;
  submissionLink: string;
  driveLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  taskName: string;
  description: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  date: string;
  type: 'deadline' | 'presentation' | 'meeting' | 'milestone';
  notes: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  projectId: string;
  name: string;
  url: string;
  type: string;
  addedBy: string;
  createdAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'presentation' | 'meeting' | 'milestone';
  linkedType: 'project' | 'task' | 'subject' | 'none';
  linkedId: string;
  createdAt: string;
}

export interface SubjectNote {
  id: string;
  subjectId: string;
  title: string;
  topic: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectTopic {
  id: string;
  subjectId: string;
  topic: string;
  status: TopicStatus;
  priority: Priority;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectResource {
  id: string;
  subjectId: string;
  name: string;
  url: string;
  type: string;
  description: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  team: TeamMember[];
  subjects: Subject[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  resources: Resource[];
  notes: Note[];
  calendar: CalendarEvent[];
  subjectNotes: SubjectNote[];
  subjectTopics: SubjectTopic[];
  subjectResources: SubjectResource[];
}

export type SheetName =
  | 'Team'
  | 'Projects'
  | 'Tasks'
  | 'Milestones'
  | 'Resources'
  | 'Notes'
  | 'Calendar'
  | 'Subjects'
  | 'SubjectNotes'
  | 'SubjectTopics'
  | 'SubjectResources';
