export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority?: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  notes?: string;
  tags?: string[];
  createdAt?: string;
}

export type TaskColor =
  | 'default'
  | 'emerald'
  | 'sky'
  | 'indigo'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'teal'
  | 'coral'
  | 'slate'
  | 'lemon'
  | 'lavender';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // Optional HH:mm
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  category?: string; // Category ID
  color?: TaskColor | string; // Minimal custom color with high-contrast text
  subtasks?: Subtask[];
  tags?: string[]; // e.g. ['work', 'urgent', 'read']
  pinned?: boolean; // Star / pin to top
  status?: 'todo' | 'in_progress' | 'done'; // Kanban workflow status
  wontDo?: boolean; // won't do / skipped
  order: number;
  createdAt: string; // YYYY-MM-DD
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type MoodLevel = 'great' | 'good' | 'neutral' | 'low' | 'bad';
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  tags?: string[];
  gratitude?: string[];
  highlight?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  hasSeenWelcome: boolean;
  sidebarCollapsed?: boolean;
}

export interface AppData {
  version: number;
  tasks: Task[];
  categories: Category[];
  journalEntries?: JournalEntry[];
  settings: UserSettings;
  lastBackupDate?: string;
}

export type ActiveTab =
  | 'today'
  | 'tasks'
  | 'kanban'
  | 'calendar'
  | 'weekly'
  | 'journal'
  | 'stats'
  | 'settings';

