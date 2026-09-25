export type Priority = 'high' | 'medium' | 'low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  parentTaskId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startDate?: string; // YYYY-MM-DD for duration tasks
  endDate?: string; // YYYY-MM-DD for duration tasks
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  category?: string;
  tags?: string[];
  isRecurring?: 'daily' | 'weekly' | 'duration' | 'none';
  completedDates?: string[]; // Array of YYYY-MM-DD dates completed for daily recurring tasks
  subtasks: SubTask[];
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  moodEmoji?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type MeasurementType = 'scale_1_5' | 'percentage' | 'time' | 'numeric';

export interface ProgressMeter {
  id: string;
  name: string;
  emojiIcon: string;
  unitType: MeasurementType;
  goalValue?: number; // e.g. 5 for scale_1_5, 100 for percentage, 180 (minutes) for time, 10 for numeric
  unitLabel?: string; // e.g. "hours", "glasses", "%"
  // Map date (YYYY-MM-DD) to numeric value or formatted string
  entries: Record<string, number>; 
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji?: string; // e.g. "🔥", "🏃", "📚", "⚡", "🌿"
  description?: string; // e.g. "Having the screen time of less than 2 hour"
  category?: string; // e.g. "Focus", "Health", "Study", "Productivity", "Mindfulness"
  startDate: string; // YYYY-MM-DD (e.g. "2026-08-01")
  targetDaysPerWeek?: number; // default 7
  frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  color?: string; // e.g. "#823b28" or custom accent
  completedDates: string[]; // List of YYYY-MM-DD dates when completed
  order?: number; // Display order index for drag/reordering
  createdAt: string;
  isArchived?: boolean;
  excludeFromAnalytics?: boolean;
  isHidden?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string; // warm card accent e.g. '#fbf6ef', '#f6e9d7', '#edd8c2', '#f8db97', '#eec7a7'
  createdAt: string;
  updatedAt: string;
}

export type NavSection = 'today' | 'habits' | 'tasks' | 'notes' | 'calendar' | 'journal' | 'progress' | 'insights' | 'settings';

export interface AppData {
  tasks: Task[];
  habits: Habit[];
  journalEntries: JournalEntry[];
  progressMeters: ProgressMeter[];
  notes?: Note[];
  userPreferences: {
    userName: string;
    avatarEmoji: string;
    defaultHomeScreen?: string;
    theme?: 'original' | 'olive';
  };
  autoBackupConfig?: {
    enabled: boolean;
    intervalHours: number;
    retentionCount: number;
    lastBackupTime?: string;
    folderName?: string;
  };
}
