import { AppData, Task, JournalEntry, ProgressMeter } from '../types';
import { getInitialSeedData } from '../data/seedData';

const STORAGE_KEY = 'ehsaan_flow_app_data_v1';

export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Basic validation / fallback
    if (!parsed.tasks || !parsed.journalEntries || !parsed.progressMeters) {
      const initial = getInitialSeedData();
      saveAppData(initial);
      return initial;
    }
    // Populate habits if missing from older storage versions
    if (!Array.isArray(parsed.habits) || parsed.habits.length === 0) {
      const initial = getInitialSeedData();
      parsed.habits = initial.habits;
      saveAppData(parsed);
    }
    // Populate notes if missing from older storage versions
    if (!Array.isArray(parsed.notes)) {
      const initial = getInitialSeedData();
      parsed.notes = initial.notes || [];
      saveAppData(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load local storage, loading seed data instead:', err);
    return getInitialSeedData();
  }
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
};

export const resetToSeedData = (): AppData => {
  const seed = getInitialSeedData();
  saveAppData(seed);
  return seed;
};

export const exportDataAsJSON = (data: AppData): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ehsaan_flow_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (jsonString: string): AppData => {
  const parsed = JSON.parse(jsonString) as AppData;
  if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.journalEntries) || !Array.isArray(parsed.progressMeters)) {
    throw new Error('Invalid backup file format. Missing tasks, journalEntries, or progressMeters array.');
  }
  
  // Ensure subtasks are correctly structured
  parsed.tasks = (parsed.tasks || []).map(t => ({
    ...t,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : []
  }));

  // Ensure habits array
  parsed.habits = Array.isArray(parsed.habits) ? parsed.habits : (getInitialSeedData().habits || []);

  // Ensure default preferences
  parsed.userPreferences = parsed.userPreferences || {
    userName: 'User',
    avatarEmoji: '🌿'
  };

  saveAppData(parsed);
  return parsed;
};
