import React from 'react';
import { Category, Priority, Task } from '../types';

export interface ColorScheme {
  id: string;
  name: string;
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
  dotBg: string;
  accentHex: string;
}

export interface TaskColorOption {
  id: string;
  name: string;
  bgLight: string;
  borderLight: string;
  bgDark: string;
  borderDark: string;
  dotColor: string;
  hex: string;
  lightBg: string;
  lightBorder: string;
  darkBg: string;
  darkBorder: string;
}

export const TASK_COLOR_PALETTE: Record<string, TaskColorOption> = {
  default: {
    id: 'default',
    name: 'Default',
    bgLight: 'bg-white',
    borderLight: 'border-neutral-200/90',
    bgDark: 'dark:bg-neutral-900',
    borderDark: 'dark:border-neutral-800',
    dotColor: 'bg-neutral-400',
    hex: '#737373',
    lightBg: '#ffffff',
    lightBorder: '#e5e5e5',
    darkBg: '#171717',
    darkBorder: '#262626',
  },
  emerald: {
    id: 'emerald',
    name: 'Soft Sage',
    bgLight: 'bg-emerald-50/90',
    borderLight: 'border-emerald-300',
    bgDark: 'dark:bg-emerald-950/40',
    borderDark: 'dark:border-emerald-800',
    dotColor: 'bg-emerald-600',
    hex: '#10b981',
    lightBg: '#ecfdf5',
    lightBorder: '#6ee7b7',
    darkBg: '#064e3b',
    darkBorder: '#065f46',
  },
  sky: {
    id: 'sky',
    name: 'Soft Sky',
    bgLight: 'bg-sky-50/90',
    borderLight: 'border-sky-300',
    bgDark: 'dark:bg-sky-950/40',
    borderDark: 'dark:border-sky-800',
    dotColor: 'bg-sky-600',
    hex: '#0ea5e9',
    lightBg: '#f0f9ff',
    lightBorder: '#7dd3fc',
    darkBg: '#0c4a6e',
    darkBorder: '#075985',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    bgLight: 'bg-purple-50/90',
    borderLight: 'border-purple-300',
    bgDark: 'dark:bg-purple-950/40',
    borderDark: 'dark:border-purple-800',
    dotColor: 'bg-purple-600',
    hex: '#a855f7',
    lightBg: '#faf5ff',
    lightBorder: '#d8b4fe',
    darkBg: '#581c87',
    darkBorder: '#6b21a8',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    bgLight: 'bg-violet-50/90',
    borderLight: 'border-violet-300',
    bgDark: 'dark:bg-violet-950/40',
    borderDark: 'dark:border-violet-800',
    dotColor: 'bg-violet-600',
    hex: '#8b5cf6',
    lightBg: '#f5f3ff',
    lightBorder: '#c4b5fd',
    darkBg: '#4c1d95',
    darkBorder: '#5b21b6',
  },
  amber: {
    id: 'amber',
    name: 'Soft Amber',
    bgLight: 'bg-amber-50/90',
    borderLight: 'border-amber-300',
    bgDark: 'dark:bg-amber-950/40',
    borderDark: 'dark:border-amber-800',
    dotColor: 'bg-amber-600',
    hex: '#f59e0b',
    lightBg: '#fffbeb',
    lightBorder: '#fcd34d',
    darkBg: '#78350f',
    darkBorder: '#92400e',
  },
  rose: {
    id: 'rose',
    name: 'Soft Rose',
    bgLight: 'bg-rose-50/90',
    borderLight: 'border-rose-300',
    bgDark: 'dark:bg-rose-950/40',
    borderDark: 'dark:border-rose-800',
    dotColor: 'bg-rose-600',
    hex: '#f43f5e',
    lightBg: '#fff1f2',
    lightBorder: '#fda4af',
    darkBg: '#881337',
    darkBorder: '#9f1239',
  },
  indigo: {
    id: 'indigo',
    name: 'Soft Indigo',
    bgLight: 'bg-indigo-50/90',
    borderLight: 'border-indigo-300',
    bgDark: 'dark:bg-indigo-950/40',
    borderDark: 'dark:border-indigo-800',
    dotColor: 'bg-indigo-600',
    hex: '#6366f1',
    lightBg: '#eef2ff',
    lightBorder: '#a5b4fc',
    darkBg: '#312e81',
    darkBorder: '#3730a3',
  },
  teal: {
    id: 'teal',
    name: 'Soft Teal',
    bgLight: 'bg-teal-50/90',
    borderLight: 'border-teal-300',
    bgDark: 'dark:bg-teal-950/40',
    borderDark: 'dark:border-teal-800',
    dotColor: 'bg-teal-600',
    hex: '#14b8a6',
    lightBg: '#f0fdfa',
    lightBorder: '#5eead4',
    darkBg: '#134e4a',
    darkBorder: '#115e59',
  },
  lemon: {
    id: 'lemon',
    name: 'Soft Lemon',
    bgLight: 'bg-yellow-50/90',
    borderLight: 'border-yellow-300',
    bgDark: 'dark:bg-yellow-950/40',
    borderDark: 'dark:border-yellow-800',
    dotColor: 'bg-yellow-600',
    hex: '#eab308',
    lightBg: '#fefce8',
    lightBorder: '#fde047',
    darkBg: '#713f12',
    darkBorder: '#854d0e',
  },
  coral: {
    id: 'coral',
    name: 'Soft Coral',
    bgLight: 'bg-orange-50/90',
    borderLight: 'border-orange-300',
    bgDark: 'dark:bg-orange-950/40',
    borderDark: 'dark:border-orange-800',
    dotColor: 'bg-orange-600',
    hex: '#f97316',
    lightBg: '#fff7ed',
    lightBorder: '#fdba74',
    darkBg: '#7c2d12',
    darkBorder: '#9a3412',
  },
  slate: {
    id: 'slate',
    name: 'Soft Slate',
    bgLight: 'bg-slate-100/90',
    borderLight: 'border-slate-300',
    bgDark: 'dark:bg-slate-900/70',
    borderDark: 'dark:border-slate-800',
    dotColor: 'bg-slate-600',
    hex: '#64748b',
    lightBg: '#f1f5f9',
    lightBorder: '#cbd5e1',
    darkBg: '#1e293b',
    darkBorder: '#334155',
  },
};

export const COLOR_OPTIONS: Record<string, ColorScheme> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40',
    textDark: 'dark:text-emerald-400',
    borderDark: 'dark:border-emerald-800/50',
    dotBg: 'bg-emerald-500',
    accentHex: '#10b981',
  },
  sky: {
    id: 'sky',
    name: 'Sky Blue',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-700',
    borderLight: 'border-sky-200',
    bgDark: 'dark:bg-sky-950/40',
    textDark: 'dark:text-sky-400',
    borderDark: 'dark:border-sky-800/50',
    dotBg: 'bg-sky-500',
    accentHex: '#0ea5e9',
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    borderLight: 'border-indigo-200',
    bgDark: 'dark:bg-indigo-950/40',
    textDark: 'dark:text-indigo-400',
    borderDark: 'dark:border-indigo-800/50',
    dotBg: 'bg-indigo-500',
    accentHex: '#6366f1',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    bgLight: 'bg-violet-50',
    textLight: 'text-violet-700',
    borderLight: 'border-violet-200',
    bgDark: 'dark:bg-violet-950/40',
    textDark: 'dark:text-violet-400',
    borderDark: 'dark:border-violet-800/50',
    dotBg: 'bg-violet-500',
    accentHex: '#8b5cf6',
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    bgDark: 'dark:bg-amber-950/40',
    textDark: 'dark:text-amber-400',
    borderDark: 'dark:border-amber-800/50',
    dotBg: 'bg-amber-500',
    accentHex: '#f59e0b',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    borderLight: 'border-rose-200',
    bgDark: 'dark:bg-rose-950/40',
    textDark: 'dark:text-rose-400',
    borderDark: 'dark:border-rose-800/50',
    dotBg: 'bg-rose-500',
    accentHex: '#f43f5e',
  },
  teal: {
    id: 'teal',
    name: 'Teal',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-700',
    borderLight: 'border-teal-200',
    bgDark: 'dark:bg-teal-950/40',
    textDark: 'dark:text-teal-400',
    borderDark: 'dark:border-teal-800/50',
    dotBg: 'bg-teal-500',
    accentHex: '#14b8a6',
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-700',
    borderLight: 'border-slate-300',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-300',
    borderDark: 'dark:border-slate-700',
    dotBg: 'bg-slate-500',
    accentHex: '#64748b',
  },
};

export const PRIORITY_CONFIG: Record<
  string,
  {
    label: string;
    hex: string;
    bgLight: string;
    borderLight: string;
    textLight: string;
    bgDark: string;
    borderDark: string;
    textDark: string;
    dotBg: string;
  }
> = {
  urgent: {
    label: 'Urgent',
    hex: '#f43f5e',
    bgLight: 'bg-rose-100/90',
    borderLight: 'border-rose-300',
    textLight: 'text-neutral-950',
    bgDark: 'dark:bg-rose-950/60',
    borderDark: 'dark:border-rose-800',
    textDark: 'dark:text-white',
    dotBg: 'bg-rose-500',
  },
  high: {
    label: 'High',
    hex: '#f59e0b',
    bgLight: 'bg-amber-100/90',
    borderLight: 'border-amber-300',
    textLight: 'text-neutral-950',
    bgDark: 'dark:bg-amber-950/60',
    borderDark: 'dark:border-amber-800',
    textDark: 'dark:text-white',
    dotBg: 'bg-amber-500',
  },
  medium: {
    label: 'Medium',
    hex: '#3b82f6',
    bgLight: 'bg-blue-100/90',
    borderLight: 'border-blue-300',
    textLight: 'text-neutral-950',
    bgDark: 'dark:bg-blue-950/60',
    borderDark: 'dark:border-blue-800',
    textDark: 'dark:text-white',
    dotBg: 'bg-blue-500',
  },
  low: {
    label: 'Low',
    hex: '#64748b',
    bgLight: 'bg-slate-100/90',
    borderLight: 'border-slate-300',
    textLight: 'text-neutral-950',
    bgDark: 'dark:bg-slate-800/60',
    borderDark: 'dark:border-slate-700',
    textDark: 'dark:text-white',
    dotBg: 'bg-slate-400',
  },
};

export function getColorScheme(colorKey?: string): ColorScheme {
  if (colorKey && COLOR_OPTIONS[colorKey]) {
    return COLOR_OPTIONS[colorKey];
  }
  return COLOR_OPTIONS.emerald;
}

/**
 * Returns the active color option for a task, checking task.color then category color.
 */
export function getTaskColorOption(task: Task, categoryMap?: Map<string, Category>): TaskColorOption | null {
  if (task.color && task.color !== 'default' && TASK_COLOR_PALETTE[task.color]) {
    return TASK_COLOR_PALETTE[task.color];
  }
  if (task.category && categoryMap) {
    const cat = categoryMap.get(task.category);
    if (cat?.color && TASK_COLOR_PALETTE[cat.color]) {
      return TASK_COLOR_PALETTE[cat.color];
    }
  }
  return null;
}

/**
 * Computes dynamic Tailwind CSS class names for task cards across all views.
 */
export function getTaskCardClasses(
  taskOrColorKey?: any,
  completedOrCategoryMap?: any,
  isOverdue?: boolean,
  isSelected?: boolean
): string {
  if (taskOrColorKey && typeof taskOrColorKey === 'object') {
    const task: Task = taskOrColorKey;
    const categoryMap: Map<string, Category> | undefined =
      completedOrCategoryMap instanceof Map ? completedOrCategoryMap : undefined;

    if (task.completed) {
      return 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 opacity-75';
    }

    const colorOpt = getTaskColorOption(task, categoryMap);
    if (colorOpt) {
      return `${colorOpt.bgLight} ${colorOpt.bgDark} ${colorOpt.borderLight} ${colorOpt.borderDark} text-neutral-950 dark:text-neutral-50 shadow-2xs`;
    }

    return 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 shadow-xs';
  }

  const colorKey = typeof taskOrColorKey === 'string' ? taskOrColorKey : undefined;
  const completed = Boolean(completedOrCategoryMap);

  if (completed) {
    return 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 opacity-75';
  }

  if (isSelected) {
    return 'bg-neutral-100 dark:bg-neutral-800 border-neutral-900 dark:border-white shadow-xs';
  }

  if (isOverdue) {
    return 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-xs';
  }

  if (colorKey && colorKey !== 'default' && TASK_COLOR_PALETTE[colorKey]) {
    const pal = TASK_COLOR_PALETTE[colorKey];
    return `${pal.bgLight} ${pal.bgDark} ${pal.borderLight} ${pal.borderDark} text-neutral-950 dark:text-neutral-50 shadow-2xs`;
  }

  return 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 shadow-xs';
}

/**
 * Returns inline CSS styles for calendar chips, ensuring custom task colors and priority colors
 * render with 100% fidelity.
 */
export function getCalendarChipStyle(
  taskOrPriority?: any,
  colorKeyOrCategoryMap?: any,
  completed?: boolean
): string {
  if (taskOrPriority && typeof taskOrPriority === 'object') {
    const task: Task = taskOrPriority;
    const categoryMap: Map<string, Category> | undefined =
      colorKeyOrCategoryMap instanceof Map ? colorKeyOrCategoryMap : undefined;

    if (task.completed) {
      return 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 dark:text-neutral-500 line-through border border-transparent';
    }

    const colorOpt = getTaskColorOption(task, categoryMap);
    if (colorOpt) {
      return `${colorOpt.bgLight} ${colorOpt.bgDark} ${colorOpt.borderLight} ${colorOpt.borderDark} text-neutral-950 dark:text-neutral-100 font-bold border`;
    }

    if (task.priority === 'urgent') {
      return 'bg-rose-100 text-neutral-950 font-bold dark:bg-rose-950/80 dark:text-rose-100 border border-rose-300 dark:border-rose-800';
    }
    if (task.priority === 'high') {
      return 'bg-amber-100 text-neutral-950 font-bold dark:bg-amber-950/80 dark:text-amber-100 border border-amber-300 dark:border-amber-800';
    }
    if (task.priority === 'medium') {
      return 'bg-blue-100 text-neutral-950 font-bold dark:bg-blue-950/80 dark:text-blue-100 border border-blue-300 dark:border-blue-800';
    }
    if (task.priority === 'low') {
      return 'bg-slate-100 text-neutral-950 font-semibold dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700';
    }

    return 'bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700';
  }

  const priority = typeof taskOrPriority === 'string' ? taskOrPriority : undefined;
  const colorKey = typeof colorKeyOrCategoryMap === 'string' ? colorKeyOrCategoryMap : undefined;

  if (completed) {
    return 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 dark:text-neutral-500 line-through border border-transparent';
  }

  if (colorKey && colorKey !== 'default' && TASK_COLOR_PALETTE[colorKey]) {
    const pal = TASK_COLOR_PALETTE[colorKey];
    return `${pal.bgLight} ${pal.bgDark} ${pal.borderLight} ${pal.borderDark} text-neutral-950 dark:text-white font-semibold border`;
  }

  if (priority === 'urgent') {
    return 'bg-rose-100 text-neutral-950 font-bold dark:bg-rose-950/80 dark:text-rose-100 border border-rose-300 dark:border-rose-800';
  }
  if (priority === 'high') {
    return 'bg-amber-100 text-neutral-950 font-bold dark:bg-amber-950/80 dark:text-amber-100 border border-amber-300 dark:border-amber-800';
  }
  if (priority === 'medium') {
    return 'bg-blue-100 text-neutral-950 font-bold dark:bg-blue-950/80 dark:text-blue-100 border border-blue-300 dark:border-blue-800';
  }
  if (priority === 'low') {
    return 'bg-slate-100 text-neutral-950 font-semibold dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700';
  }

  return 'bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700';
}
