import { AppData, Category, Task } from '../types';
import { addDays, getTodayKey } from './dateUtils';

export const STORAGE_KEY = 'todo_app_data_v2';
export const LEGACY_STORAGE_KEY = 'habit_tracker_data_v1';
export const CURRENT_VERSION = 2;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work & Projects', color: 'amber' },
  { id: 'cat-personal', name: 'Personal & Home', color: 'violet' },
  { id: 'cat-health', name: 'Health & Wellness', color: 'emerald' },
  { id: 'cat-study', name: 'Learning & Study', color: 'indigo' },
  { id: 'cat-finance', name: 'Finance & Bills', color: 'rose' },
  { id: 'cat-errands', name: 'Errands & Shopping', color: 'sky' },
];

export function getStarterData(): AppData {
  const today = getTodayKey();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const inTwoDays = addDays(today, 2);
  const inThreeDays = addDays(today, 3);
  const inFiveDays = addDays(today, 5);

  const initialTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Review quarterly budget & subscriptions',
      notes: 'Check online bank ledger, cancel unused trial subscriptions, and log upcoming tax deductions.',
      dueDate: today,
      dueTime: '11:00',
      completed: false,
      priority: 'urgent',
      category: 'cat-finance',
      color: 'rose',
      subtasks: [
        { id: 'sub-1', title: 'Export monthly bank statement', completed: true, priority: 'high', dueDate: today },
        { id: 'sub-2', title: 'Flag recurring SaaS subscriptions', completed: false, priority: 'urgent', dueTime: '10:30' },
        { id: 'sub-3', title: 'Update spreadsheet with savings rate', completed: false, priority: 'medium' },
      ],
      order: 0,
      createdAt: yesterday,
    },
    {
      id: 'task-2',
      title: 'Finalize team sprint deliverables & sync slides',
      notes: 'Prepare concise summary for the afternoon engineering and design sync.',
      dueDate: today,
      dueTime: '15:30',
      completed: true,
      completedAt: today,
      priority: 'high',
      category: 'cat-work',
      color: 'amber',
      subtasks: [
        { id: 'sub-4', title: 'Collect updates from async thread', completed: true },
        { id: 'sub-5', title: 'Draft release milestone notes', completed: true },
      ],
      order: 1,
      createdAt: yesterday,
    },
    {
      id: 'task-3',
      title: 'Study Chapter 4: Distributed Systems consensus',
      notes: 'Focus on Raft leader election and log replication principles.',
      dueDate: today,
      completed: false,
      priority: 'medium',
      category: 'cat-study',
      color: 'sky',
      subtasks: [
        { id: 'sub-6', title: 'Read pages 82–110', completed: true },
        { id: 'sub-7', title: 'Draw state machine diagram', completed: false },
      ],
      order: 2,
      createdAt: today,
    },
    {
      id: 'task-4',
      title: 'Schedule dentist routine hygiene checkup',
      notes: 'Request a late afternoon appointment for minimal work interruption.',
      dueDate: tomorrow,
      dueTime: '10:00',
      completed: false,
      priority: 'low',
      category: 'cat-health',
      color: 'emerald',
      order: 3,
      createdAt: today,
    },
    {
      id: 'task-5',
      title: 'Grocery restocking for weekly meal prep',
      notes: 'Fresh greens, olive oil, Greek yogurt, chicken breast, sourdough bread, and sparkling water.',
      dueDate: inTwoDays,
      completed: false,
      priority: 'medium',
      category: 'cat-errands',
      color: 'lavender',
      subtasks: [
        { id: 'sub-8', title: 'Check fridge inventory', completed: true },
        { id: 'sub-9', title: 'Buy farmers market seasonal fruits', completed: false },
      ],
      order: 4,
      createdAt: today,
    },
    {
      id: 'task-6',
      title: 'Organize home desk workspace & clean keyboard',
      notes: 'Cable management and wipe monitors.',
      dueDate: inThreeDays,
      completed: false,
      priority: 'low',
      category: 'cat-personal',
      order: 5,
      createdAt: today,
    },
    {
      id: 'task-7',
      title: 'Submit quarterly insurance policy renewal form',
      notes: 'Policy doc is in digital downloads folder.',
      dueDate: inFiveDays,
      completed: false,
      priority: 'high',
      category: 'cat-finance',
      order: 6,
      createdAt: today,
    },
    {
      id: 'task-8',
      title: 'Morning 20-minute mobility and foam roll routine',
      notes: 'Focus on hip flexors and thoracic spine stretch.',
      dueDate: yesterday,
      completed: true,
      completedAt: yesterday,
      priority: 'medium',
      category: 'cat-health',
      order: 7,
      createdAt: addDays(today, -2),
    },
  ];

  // Starter sample journal entries spanning current and previous years
  const currentYear = new Date().getFullYear();
  const monthDay = today.slice(5); // e.g. "09-20"
  
  const sampleJournals = [
    {
      id: 'j-today',
      date: today,
      title: 'Clarity and Deep Work Morning',
      content: 'Woke up early with renewed focus. Tackled high-priority tasks first before diving into communication. Took a 25-minute brisk walk during lunch which helped clear my mind for afternoon problem-solving.',
      mood: 'great' as const,
      energy: 5 as const,
      highlight: 'Finished the main architectural design ahead of schedule.',
      gratitude: ['Peaceful morning quietude', 'A good cup of black coffee', 'Encouraging sync with team'],
      tags: ['productivity', 'health', 'focus'],
      createdAt: today,
    },
    {
      id: 'j-yesterday',
      date: yesterday,
      title: 'Steady Progress and Balanced Evening',
      content: 'A busy Tuesday with several collaborative meetings. Kept my energy up with proper hydration and regular stretch breaks.',
      mood: 'good' as const,
      energy: 4 as const,
      highlight: 'Resolved a long-standing roadblock in our distributed system project.',
      gratitude: ['Supportive colleagues', 'Healthy home-cooked dinner', 'Deep night rest'],
      tags: ['work', 'balance'],
      createdAt: yesterday,
    },
    {
      id: 'j-prev-year-1',
      date: `${currentYear - 1}-${monthDay}`,
      title: 'Looking Back One Year Ago',
      content: 'Reflecting on personal growth. One year ago I started adopting structured daily time-blocking and deliberate journaling.',
      mood: 'good' as const,
      energy: 4 as const,
      highlight: 'Completed first month of consistent daily workouts.',
      gratitude: ['Good health', 'Growth mindset', 'Morning sunshine'],
      tags: ['reflection', 'habits'],
      createdAt: `${currentYear - 1}-${monthDay}`,
    },
    {
      id: 'j-prev-year-2',
      date: `${currentYear - 2}-${monthDay}`,
      title: 'Two Years Ago Reflection',
      content: 'Setting the foundation for new career milestones. Grateful for the journey and consistency built step by step.',
      mood: 'great' as const,
      energy: 4 as const,
      highlight: 'Launched my first major open-source module.',
      gratitude: ['Mentors who believed in me', 'Curiosity to learn', 'A supportive circle'],
      tags: ['milestones', 'learning'],
      createdAt: `${currentYear - 2}-${monthDay}`,
    },
  ];

  return {
    version: CURRENT_VERSION,
    tasks: initialTasks,
    categories: DEFAULT_CATEGORIES,
    journalEntries: sampleJournals,
    settings: {
      theme: 'light',
      weekStartsOn: 1, // Monday
      hasSeenWelcome: false,
      sidebarCollapsed: false,
    },
    lastBackupDate: undefined,
  };
}

export function createBlankData(): AppData {
  return {
    version: CURRENT_VERSION,
    tasks: [],
    categories: DEFAULT_CATEGORIES,
    journalEntries: [],
    settings: {
      theme: 'light',
      weekStartsOn: 1,
      hasSeenWelcome: true,
      sidebarCollapsed: false,
    },
  };
}

export function loadAppData(): AppData {
  try {
    // 1. Try modern key
    let raw = localStorage.getItem(STORAGE_KEY);

    // 2. If not found, check legacy key to migrate existing tasks smoothly
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (legacyParsed && Array.isArray(legacyParsed.tasks) && legacyParsed.tasks.length > 0) {
            const migratedData: AppData = {
              version: CURRENT_VERSION,
              tasks: legacyParsed.tasks,
              categories: Array.isArray(legacyParsed.categories) && legacyParsed.categories.length > 0
                ? legacyParsed.categories
                : DEFAULT_CATEGORIES,
              journalEntries: Array.isArray(legacyParsed.journalEntries) ? legacyParsed.journalEntries : [],
              settings: {
                theme: legacyParsed.settings?.theme === 'dark' ? 'dark' : 'light',
                weekStartsOn: legacyParsed.settings?.weekStartsOn === 0 ? 0 : 1,
                hasSeenWelcome: true,
                sidebarCollapsed: !!legacyParsed.settings?.sidebarCollapsed,
              },
              lastBackupDate: legacyParsed.lastBackupDate,
            };
            saveAppData(migratedData);
            return migratedData;
          }
        } catch {
          // ignore legacy parse errors
        }
      }

      const starter = getStarterData();
      saveAppData(starter);
      return starter;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return getStarterData();
    }

    const userTheme = parsed.settings?.theme;
    // Default to 'light' if 'system' or undefined
    const resolvedTheme = userTheme === 'dark' ? 'dark' : userTheme === 'system' ? 'light' : (userTheme || 'light');

    const data: AppData = {
      version: parsed.version || CURRENT_VERSION,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES,
      journalEntries: Array.isArray(parsed.journalEntries) && parsed.journalEntries.length > 0
        ? parsed.journalEntries
        : getStarterData().journalEntries,
      settings: {
        theme: resolvedTheme,
        weekStartsOn: parsed.settings?.weekStartsOn === 0 ? 0 : 1,
        hasSeenWelcome: !!parsed.settings?.hasSeenWelcome,
        sidebarCollapsed: !!parsed.settings?.sidebarCollapsed,
      },
      lastBackupDate: parsed.lastBackupDate,
    };

    return data;
  } catch (err) {
    console.error('Error loading app data from localStorage:', err);
    return getStarterData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Error saving app data to localStorage:', err);
  }
}

export function exportAppDataAsJson(data: AppData): void {
  const today = getTodayKey();
  const payload = {
    ...data,
    lastBackupDate: today,
    exportedAt: new Date().toISOString(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `todo-list-backup-${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export interface ValidationResult {
  valid: boolean;
  data?: AppData;
  error?: string;
  summary?: {
    tasksCount: number;
    categoriesCount: number;
    completedCount: number;
  };
}

export function validateImportJson(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File does not contain a valid JSON object.' };
    }

    if (!Array.isArray(parsed.tasks) && !Array.isArray(parsed.habits)) {
      return {
        valid: false,
        error: 'JSON must contain a tasks array matching the to-do schema.',
      };
    }

    const tasks: Task[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const categories: Category[] = Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES;

    const validatedData: AppData = {
      version: CURRENT_VERSION,
      tasks,
      categories,
      settings: {
        theme: parsed.settings?.theme || 'system',
        weekStartsOn: parsed.settings?.weekStartsOn === 0 ? 0 : 1,
        hasSeenWelcome: true,
      },
      lastBackupDate: parsed.lastBackupDate,
    };

    const completedCount = tasks.filter((t) => t.completed).length;

    return {
      valid: true,
      data: validatedData,
      summary: {
        tasksCount: tasks.length,
        categoriesCount: categories.length,
        completedCount,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON file';
    return { valid: false, error: message };
  }
}

export function mergeAppData(existing: AppData, incoming: AppData): AppData {
  // Merge categories by ID
  const categoryMap = new Map<string, Category>();
  existing.categories.forEach((c) => categoryMap.set(c.id, c));
  incoming.categories.forEach((c) => categoryMap.set(c.id, c));

  // Merge tasks by ID
  const taskMap = new Map<string, Task>();
  existing.tasks.forEach((t) => taskMap.set(t.id, t));
  incoming.tasks.forEach((t) => taskMap.set(t.id, t));

  return {
    version: CURRENT_VERSION,
    tasks: Array.from(taskMap.values()),
    categories: Array.from(categoryMap.values()),
    settings: {
      ...existing.settings,
      ...incoming.settings,
    },
    lastBackupDate: incoming.lastBackupDate || existing.lastBackupDate,
  };
}

export function clearAllAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing localStorage:', err);
  }
}
