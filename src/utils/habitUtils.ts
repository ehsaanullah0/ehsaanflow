import { Habit, Task } from '../types';

export interface StreakSegment {
  date: string;
  dayNum: number;
  dayName: string; // "MON", "TUE", etc.
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  // Position in consecutive streak run for connected pill visualization
  connectionType: 'single' | 'start' | 'middle' | 'end' | 'none';
}

export interface HabitMetrics {
  consistencyPercentage: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  totalDaysTracked: number;
  startedMonthYear: string;
  isCompletedToday: boolean;
  completedThisWeek: number;
}

// Format Date object to YYYY-MM-DD in local time
export const formatDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Parse YYYY-MM-DD string to Date
export const parseDateStr = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

// Short weekday names
export const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const WEEKDAY_MON_FIRST = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculate streak and consistency metrics for a habit
 */
export const getHabitMetrics = (habit: Habit, todayStr: string = formatDateStr(new Date())): HabitMetrics => {
  const completedSet = new Set(habit.completedDates || []);
  const isCompletedToday = completedSet.has(todayStr);

  const startDate = habit.startDate ? parseDateStr(habit.startDate) : parseDateStr(habit.createdAt || todayStr);
  const todayDate = parseDateStr(todayStr);

  // Total days since start (minimum 1)
  const diffTime = Math.max(0, todayDate.getTime() - startDate.getTime());
  const totalDaysTracked = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

  // Consistency %
  const totalCompletions = completedSet.size;
  const consistencyPercentage = Math.min(100, Math.round((totalCompletions / totalDaysTracked) * 100)) || 0;

  // Calculate Current Streak and Best Streak
  // Sort all unique completed dates ascending
  const sortedDates = Array.from(completedSet).sort();

  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const currDate = parseDateStr(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        tempStreak += 1;
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  // Calculate Current Streak backwards from today or yesterday
  let currentStreak = 0;
  let checkDate = new Date(todayDate);

  // If today is not completed, check if yesterday was completed to keep streak alive
  if (!completedSet.has(formatDateStr(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (completedSet.has(formatDateStr(checkDate))) {
    currentStreak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Started Month Year e.g. "Aug 2026"
  const startMonthName = MONTH_NAMES[startDate.getMonth()] ? MONTH_NAMES[startDate.getMonth()].slice(0, 3) : '';
  const startedMonthYear = `${startMonthName} ${startDate.getFullYear()}`;

  // Completed in current calendar week
  // find Monday of this week
  const dayOfWeek = todayDate.getDay(); // 0 is Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() + mondayOffset);

  let completedThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (completedSet.has(formatDateStr(d))) {
      completedThisWeek += 1;
    }
  }

  return {
    consistencyPercentage,
    currentStreak,
    bestStreak,
    totalCompletions,
    totalDaysTracked,
    startedMonthYear,
    isCompletedToday,
    completedThisWeek,
  };
};

/**
 * Generate streak segments for a continuous list of dates (for horizontal pill strip or calendar row)
 */
export const getStreakSegments = (
  dates: Date[],
  completedDates: string[],
  todayStr: string = formatDateStr(new Date())
): StreakSegment[] => {
  const completedSet = new Set(completedDates || []);

  const segments: StreakSegment[] = dates.map((date) => {
    const dStr = formatDateStr(date);
    const dayName = WEEKDAY_SHORT[date.getDay()];
    const dayNum = date.getDate();
    const isCompleted = completedSet.has(dStr);
    const isToday = dStr === todayStr;
    const isFuture = dStr > todayStr;

    return {
      date: dStr,
      dayNum,
      dayName,
      isCompleted,
      isToday,
      isFuture,
      connectionType: 'none',
    };
  });

  // Second pass: determine connectionType ('single', 'start', 'middle', 'end', 'none')
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].isCompleted) {
      segments[i].connectionType = 'none';
      continue;
    }

    const prevCompleted = i > 0 && segments[i - 1].isCompleted;
    const nextCompleted = i < segments.length - 1 && segments[i + 1].isCompleted;

    if (prevCompleted && nextCompleted) {
      segments[i].connectionType = 'middle';
    } else if (prevCompleted && !nextCompleted) {
      segments[i].connectionType = 'end';
    } else if (!prevCompleted && nextCompleted) {
      segments[i].connectionType = 'start';
    } else {
      segments[i].connectionType = 'single';
    }
  }

  return segments;
};

/**
 * Get current 7-day or 14-day strip around given reference date (Monday to Sunday)
 */
export const getWeekDaysRange = (referenceDate: Date = new Date(), numDays: number = 7): Date[] => {
  const dates: Date[] = [];
  const curr = new Date(referenceDate);
  const dayOfWeek = curr.getDay(); // 0 Sun, 1 Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const startMonday = new Date(curr);
  startMonday.setDate(curr.getDate() + mondayOffset);

  for (let i = 0; i < numDays; i++) {
    const d = new Date(startMonday);
    d.setDate(startMonday.getDate() + i);
    dates.push(d);
  }

  return dates;
};

/**
 * Get matrix of days for a monthly calendar view (weeks as rows)
 */
export interface MonthCalendarData {
  year: number;
  month: number; // 0-indexed
  monthName: string;
  weeks: (StreakSegment | null)[][];
}

export const getMonthCalendar = (
  year: number,
  month: number, // 0-11
  completedDates: string[],
  todayStr: string = formatDateStr(new Date())
): MonthCalendarData => {
  const completedSet = new Set(completedDates || []);
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Find day of week for 1st day (0 Sun, 1 Mon...)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  // Monday as first day of week: Mon=0, Tue=1, ..., Sun=6
  const paddingBefore = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const weeks: (StreakSegment | null)[][] = [];
  let currentWeek: (StreakSegment | null)[] = [];

  // Add empty placeholders before 1st day
  for (let i = 0; i < paddingBefore; i++) {
    currentWeek.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const dStr = formatDateStr(d);
    const isCompleted = completedSet.has(dStr);
    const isToday = dStr === todayStr;
    const isFuture = dStr > todayStr;

    const segment: StreakSegment = {
      date: dStr,
      dayNum: day,
      dayName: WEEKDAY_SHORT[d.getDay()],
      isCompleted,
      isToday,
      isFuture,
      connectionType: 'none',
    };

    currentWeek.push(segment);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad the remaining of the last week if not full
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Calculate connectionType per week row for continuous pill display
  for (const week of weeks) {
    for (let i = 0; i < week.length; i++) {
      const seg = week[i];
      if (!seg || !seg.isCompleted) continue;

      const prevCompleted = i > 0 && week[i - 1]?.isCompleted;
      const nextCompleted = i < week.length - 1 && week[i + 1]?.isCompleted;

      if (prevCompleted && nextCompleted) {
        seg.connectionType = 'middle';
      } else if (prevCompleted && !nextCompleted) {
        seg.connectionType = 'end';
      } else if (!prevCompleted && nextCompleted) {
        seg.connectionType = 'start';
      } else {
        seg.connectionType = 'single';
      }
    }
  }

  return {
    year,
    month,
    monthName: MONTH_NAMES[month],
    weeks,
  };
};

/**
 * Overall Habit Analytics Calculation
 */
export interface OverallAnalyticsData {
  overallConsistency: number;
  totalHabits: number;
  activeStreaksCount: number;
  totalCheckIns: number;
  completedTodayCount: number;
  ranking: {
    habitId: string;
    name: string;
    emoji: string;
    consistency: number;
    streak: number;
  }[];
  weekdayBreakdown: {
    dayName: string; // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
    fullDayName: string; // 'Monday', 'Tuesday', ...
    completionsCount: number;
    completionPercentage: number;
  }[];
}

export const calculateOverallAnalytics = (
  habits: Habit[],
  todayStr: string = formatDateStr(new Date())
): OverallAnalyticsData => {
  if (habits.length === 0) {
    return {
      overallConsistency: 0,
      totalHabits: 0,
      activeStreaksCount: 0,
      totalCheckIns: 0,
      completedTodayCount: 0,
      ranking: [],
      weekdayBreakdown: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
        dayName: d.charAt(0),
        fullDayName: d,
        completionsCount: 0,
        completionPercentage: 0,
      })),
    };
  }

  const activeHabits = habits.filter((h) => !h.isArchived && !h.excludeFromAnalytics);
  let sumConsistency = 0;
  let totalCheckIns = 0;
  let activeStreaksCount = 0;
  let completedTodayCount = 0;

  const ranking = activeHabits
    .map((h) => {
      const metrics = getHabitMetrics(h, todayStr);
      sumConsistency += metrics.consistencyPercentage;
      totalCheckIns += metrics.totalCompletions;
      if (metrics.currentStreak > 0) activeStreaksCount += 1;
      if (metrics.isCompletedToday) completedTodayCount += 1;

      return {
        habitId: h.id,
        name: h.name,
        emoji: h.emoji || '🔥',
        consistency: metrics.consistencyPercentage,
        streak: metrics.currentStreak,
      };
    })
    .sort((a, b) => b.consistency - a.consistency);

  const overallConsistency = Math.round(sumConsistency / Math.max(1, activeHabits.length)) || 0;

  // Weekday Breakdown across all completions
  // Mon (1) to Sun (0)
  const dayCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
  let totalDaysMeasured = 0;

  for (const h of activeHabits) {
    for (const dStr of h.completedDates || []) {
      const d = parseDateStr(dStr);
      const day = d.getDay(); // 0 Sun, 1 Mon...
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      totalDaysMeasured += 1;
    }
  }

  const daysMeta = [
    { key: 1, name: 'M', full: 'Monday' },
    { key: 2, name: 'T', full: 'Tuesday' },
    { key: 3, name: 'W', full: 'Wednesday' },
    { key: 4, name: 'T', full: 'Thursday' },
    { key: 5, name: 'F', full: 'Friday' },
    { key: 6, name: 'S', full: 'Saturday' },
    { key: 0, name: 'S', full: 'Sunday' },
  ];

  const maxDayCount = Math.max(1, ...Object.values(dayCounts));

  const weekdayBreakdown = daysMeta.map((dm) => {
    const count = dayCounts[dm.key] || 0;
    return {
      dayName: dm.name,
      fullDayName: dm.full,
      completionsCount: count,
      completionPercentage: Math.round((count / maxDayCount) * 100),
    };
  });

  return {
    overallConsistency,
    totalHabits: activeHabits.length,
    activeStreaksCount,
    totalCheckIns,
    completedTodayCount,
    ranking,
    weekdayBreakdown,
  };
};

/**
 * Check if a task is completed on a specific date (YYYY-MM-DD)
 */
export const isTaskCompletedOnDate = (task: Task, dateStr?: string): boolean => {
  if (task.isRecurring === 'daily') {
    if (!dateStr) return task.completed;
    return !!(task.completedDates && task.completedDates.includes(dateStr));
  }
  return task.completed;
};
