import { Habit } from '../types';
import { formatDateStr, parseDateStr } from './habitUtils';

export interface TrendChartPoint {
  label: string;
  dateStr: string;
  value: number; // consistency %
  completed: number;
  scheduled: number;
}

export interface DeepConsistencyTrendData {
  currentConsistency: number;
  previousConsistency: number;
  diffPp: number;
  trendState: 'improving' | 'stable' | 'declining';
  chartPoints: TrendChartPoint[];
}

export interface DeepMissedOpportunitiesData {
  scheduled: number;
  completed: number;
  missed: number;
  completedPct: number;
  missedPct: number;
}

export interface DeepRecentMomentumData {
  currentPct: number;
  previousPct: number;
  diffPp: number;
  state: 'IMPROVING' | 'STABLE' | 'DECLINING';
  symbol: string;
}

export interface DeepRecoveryData {
  hasData: boolean;
  averageDays: number;
  longestDays: number;
  recentDays: number;
  totalMissesCount: number;
}

/**
 * Helper to generate an array of YYYY-MM-DD date strings for a given range (inclusive)
 */
export const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const dates: string[] = [];
  const start = parseDateStr(startStr);
  const end = parseDateStr(endStr);
  
  const curr = new Date(start);
  while (curr.getTime() <= end.getTime()) {
    dates.push(formatDateStr(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

/**
 * OVERALL — Consistency Trend calculation (7D / 30D / 90D)
 */
export const calculateOverallConsistencyTrend = (
  habits: Habit[],
  daysRange: number,
  todayStr: string = formatDateStr(new Date())
): DeepConsistencyTrendData => {
  const activeHabits = habits.filter((h) => !h.isArchived && !h.excludeFromAnalytics);
  if (activeHabits.length === 0) {
    return {
      currentConsistency: 0,
      previousConsistency: 0,
      diffPp: 0,
      trendState: 'stable',
      chartPoints: [],
    };
  }

  const today = parseDateStr(todayStr);

  // Current period date range
  const currentStart = new Date(today);
  currentStart.setDate(today.getDate() - daysRange + 1);
  const currentStartStr = formatDateStr(currentStart);

  // Previous period date range
  const prevEnd = new Date(currentStart);
  prevEnd.setDate(currentStart.getDate() - 1);
  const prevEndStr = formatDateStr(prevEnd);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - daysRange + 1);
  const prevStartStr = formatDateStr(prevStart);

  // Calculate Scheduled & Completed for a date window
  const getWindowMetrics = (startStr: string, endStr: string) => {
    let scheduled = 0;
    let completed = 0;
    const dates = getDatesInRange(startStr, endStr);

    for (const dStr of dates) {
      if (dStr > todayStr) continue; // Never count future dates

      for (const h of activeHabits) {
        const hStart = h.startDate || h.createdAt || todayStr;
        if (dStr >= hStart) {
          scheduled += 1;
          if (h.completedDates && h.completedDates.includes(dStr)) {
            completed += 1;
          }
        }
      }
    }

    const consistency = Math.round((completed / Math.max(1, scheduled)) * 100);
    return { scheduled, completed, consistency };
  };

  const currentMetrics = getWindowMetrics(currentStartStr, todayStr);
  const prevMetrics = getWindowMetrics(prevStartStr, prevEndStr);

  const diffPp = currentMetrics.consistency - prevMetrics.consistency;
  const trendState = diffPp > 0 ? 'improving' : diffPp < 0 ? 'declining' : 'stable';

  // Build Chart Points across the current period
  const numPoints = daysRange === 7 ? 7 : daysRange === 30 ? 10 : 12;
  const currentDates = getDatesInRange(currentStartStr, todayStr);
  const step = Math.max(1, Math.floor(currentDates.length / numPoints));

  const chartPoints: TrendChartPoint[] = [];
  
  for (let i = 0; i < currentDates.length; i += step) {
    // Window of sub-period up to this point or moving window
    const pointDateStr = currentDates[i];
    const pointDate = parseDateStr(pointDateStr);
    
    // 3-day or 7-day trailing window for smooth trend chart representation
    const windowStart = new Date(pointDate);
    const windowSize = daysRange === 7 ? 1 : daysRange === 30 ? 3 : 7;
    windowStart.setDate(pointDate.getDate() - windowSize + 1);
    const windowStartStr = formatDateStr(windowStart);

    const pMetrics = getWindowMetrics(windowStartStr, pointDateStr);

    let label = '';
    if (daysRange === 7) {
      label = pointDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      label = `${pointDate.getMonth() + 1}/${pointDate.getDate()}`;
    }

    chartPoints.push({
      label,
      dateStr: pointDateStr,
      value: pMetrics.consistency,
      completed: pMetrics.completed,
      scheduled: pMetrics.scheduled,
    });
  }

  return {
    currentConsistency: currentMetrics.consistency,
    previousConsistency: prevMetrics.consistency,
    diffPp,
    trendState,
    chartPoints,
  };
};

/**
 * OVERALL — Missed Opportunities calculation
 */
export const calculateOverallMissedOpportunities = (
  habits: Habit[],
  todayStr: string = formatDateStr(new Date())
): DeepMissedOpportunitiesData => {
  const activeHabits = habits.filter((h) => !h.isArchived && !h.excludeFromAnalytics);
  let scheduled = 0;
  let completed = 0;

  for (const h of activeHabits) {
    const hStart = h.startDate || h.createdAt || todayStr;
    const dates = getDatesInRange(hStart, todayStr);

    for (const dStr of dates) {
      if (dStr > todayStr) continue; // Skip future dates
      scheduled += 1;
      if (h.completedDates && h.completedDates.includes(dStr)) {
        completed += 1;
      }
    }
  }

  const missed = Math.max(0, scheduled - completed);
  const completedPct = Math.round((completed / Math.max(1, scheduled)) * 100);
  const missedPct = 100 - completedPct;

  return {
    scheduled,
    completed,
    missed,
    completedPct,
    missedPct,
  };
};

/**
 * OVERALL — Recent Momentum calculation (14 days vs prev 14 days)
 */
export const calculateOverallRecentMomentum = (
  habits: Habit[],
  todayStr: string = formatDateStr(new Date())
): DeepRecentMomentumData => {
  const activeHabits = habits.filter((h) => !h.isArchived && !h.excludeFromAnalytics);
  const today = parseDateStr(todayStr);

  const curStart = new Date(today);
  curStart.setDate(today.getDate() - 13);
  const curStartStr = formatDateStr(curStart);

  const prevEnd = new Date(curStart);
  prevEnd.setDate(curStart.getDate() - 1);
  const prevEndStr = formatDateStr(prevEnd);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - 13);
  const prevStartStr = formatDateStr(prevStart);

  const getWindowRate = (startStr: string, endStr: string) => {
    let scheduled = 0;
    let completed = 0;
    const dates = getDatesInRange(startStr, endStr);

    for (const dStr of dates) {
      if (dStr > todayStr) continue;
      for (const h of activeHabits) {
        const hStart = h.startDate || h.createdAt || todayStr;
        if (dStr >= hStart) {
          scheduled += 1;
          if (h.completedDates && h.completedDates.includes(dStr)) {
            completed += 1;
          }
        }
      }
    }
    return Math.round((completed / Math.max(1, scheduled)) * 100);
  };

  const currentPct = getWindowRate(curStartStr, todayStr);
  const previousPct = getWindowRate(prevStartStr, prevEndStr);
  const diffPp = currentPct - previousPct;

  let state: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  let symbol = '→';

  if (diffPp > 0) {
    state = 'IMPROVING';
    symbol = '↑';
  } else if (diffPp < 0) {
    state = 'DECLINING';
    symbol = '↓';
  }

  return {
    currentPct,
    previousPct,
    diffPp,
    state,
    symbol,
  };
};

/**
 * INDIVIDUAL HABIT — Consistency Trend calculation
 */
export const calculateHabitConsistencyTrend = (
  habit: Habit,
  daysRange: number,
  todayStr: string = formatDateStr(new Date())
): DeepConsistencyTrendData => {
  const today = parseDateStr(todayStr);

  const curStart = new Date(today);
  curStart.setDate(today.getDate() - daysRange + 1);
  const curStartStr = formatDateStr(curStart);

  const prevEnd = new Date(curStart);
  prevEnd.setDate(curStart.getDate() - 1);
  const prevEndStr = formatDateStr(prevEnd);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - daysRange + 1);
  const prevStartStr = formatDateStr(prevStart);

  const getHabitWindowMetrics = (startStr: string, endStr: string) => {
    let scheduled = 0;
    let completed = 0;
    const dates = getDatesInRange(startStr, endStr);
    const hStart = habit.startDate || habit.createdAt || todayStr;

    for (const dStr of dates) {
      if (dStr > todayStr) continue; // Never treat future as missed/scheduled
      if (dStr >= hStart) {
        scheduled += 1;
        if (habit.completedDates && habit.completedDates.includes(dStr)) {
          completed += 1;
        }
      }
    }

    const consistency = Math.round((completed / Math.max(1, scheduled)) * 100);
    return { scheduled, completed, consistency };
  };

  const currentMetrics = getHabitWindowMetrics(curStartStr, todayStr);
  const prevMetrics = getHabitWindowMetrics(prevStartStr, prevEndStr);

  const diffPp = currentMetrics.consistency - prevMetrics.consistency;
  const trendState = diffPp > 0 ? 'improving' : diffPp < 0 ? 'declining' : 'stable';

  // Build chart points
  const currentDates = getDatesInRange(curStartStr, todayStr);
  const numPoints = daysRange === 7 ? 7 : daysRange === 30 ? 10 : 12;
  const step = Math.max(1, Math.floor(currentDates.length / numPoints));

  const chartPoints: TrendChartPoint[] = [];

  for (let i = 0; i < currentDates.length; i += step) {
    const pointDateStr = currentDates[i];
    const pointDate = parseDateStr(pointDateStr);

    const windowStart = new Date(pointDate);
    const windowSize = daysRange === 7 ? 1 : daysRange === 30 ? 3 : 7;
    windowStart.setDate(pointDate.getDate() - windowSize + 1);
    const windowStartStr = formatDateStr(windowStart);

    const pMetrics = getHabitWindowMetrics(windowStartStr, pointDateStr);

    let label = '';
    if (daysRange === 7) {
      label = pointDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      label = `${pointDate.getMonth() + 1}/${pointDate.getDate()}`;
    }

    chartPoints.push({
      label,
      dateStr: pointDateStr,
      value: pMetrics.consistency,
      completed: pMetrics.completed,
      scheduled: pMetrics.scheduled,
    });
  }

  return {
    currentConsistency: currentMetrics.consistency,
    previousConsistency: prevMetrics.consistency,
    diffPp,
    trendState,
    chartPoints,
  };
};

/**
 * INDIVIDUAL HABIT — Missed Opportunities
 */
export const calculateHabitMissedOpportunities = (
  habit: Habit,
  todayStr: string = formatDateStr(new Date())
): DeepMissedOpportunitiesData => {
  const hStart = habit.startDate || habit.createdAt || todayStr;
  const dates = getDatesInRange(hStart, todayStr);

  let scheduled = 0;
  let completed = 0;

  for (const dStr of dates) {
    if (dStr > todayStr) continue; // Skip future dates
    scheduled += 1;
    if (habit.completedDates && habit.completedDates.includes(dStr)) {
      completed += 1;
    }
  }

  const missed = Math.max(0, scheduled - completed);
  const completedPct = Math.round((completed / Math.max(1, scheduled)) * 100);
  const missedPct = 100 - completedPct;

  return {
    scheduled,
    completed,
    missed,
    completedPct,
    missedPct,
  };
};

/**
 * INDIVIDUAL HABIT — Recovery After a Miss
 * Analyzes how quickly the user returns to the habit after missing a scheduled day.
 */
export const calculateHabitRecoveryAfterMiss = (
  habit: Habit,
  todayStr: string = formatDateStr(new Date())
): DeepRecoveryData => {
  const hStart = habit.startDate || habit.createdAt || todayStr;
  const dates = getDatesInRange(hStart, todayStr);
  const completedSet = new Set(habit.completedDates || []);

  const recoveries: number[] = [];
  let isCurrentlyInMiss = false;
  let missCount = 0;

  for (const dStr of dates) {
    if (dStr > todayStr) break;

    const isDone = completedSet.has(dStr);

    if (!isDone) {
      isCurrentlyInMiss = true;
      missCount += 1;
    } else {
      if (isCurrentlyInMiss) {
        // We recovered! missCount is how many days were missed before returning
        recoveries.push(missCount);
        isCurrentlyInMiss = false;
        missCount = 0;
      }
    }
  }

  if (recoveries.length === 0) {
    return {
      hasData: false,
      averageDays: 0,
      longestDays: 0,
      recentDays: 0,
      totalMissesCount: 0,
    };
  }

  const sum = recoveries.reduce((acc, curr) => acc + curr, 0);
  const averageDays = parseFloat((sum / recoveries.length).toFixed(1));
  const longestDays = Math.max(...recoveries);
  const recentDays = recoveries[recoveries.length - 1];

  return {
    hasData: true,
    averageDays,
    longestDays,
    recentDays,
    totalMissesCount: recoveries.length,
  };
};

/**
 * INDIVIDUAL HABIT — Recent Momentum
 */
export const calculateHabitRecentMomentum = (
  habit: Habit,
  todayStr: string = formatDateStr(new Date())
): DeepRecentMomentumData => {
  const today = parseDateStr(todayStr);

  const curStart = new Date(today);
  curStart.setDate(today.getDate() - 13);
  const curStartStr = formatDateStr(curStart);

  const prevEnd = new Date(curStart);
  prevEnd.setDate(curStart.getDate() - 1);
  const prevEndStr = formatDateStr(prevEnd);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - 13);
  const prevStartStr = formatDateStr(prevStart);

  const getHabitRate = (startStr: string, endStr: string) => {
    let scheduled = 0;
    let completed = 0;
    const dates = getDatesInRange(startStr, endStr);
    const hStart = habit.startDate || habit.createdAt || todayStr;

    for (const dStr of dates) {
      if (dStr > todayStr) continue;
      if (dStr >= hStart) {
        scheduled += 1;
        if (habit.completedDates && habit.completedDates.includes(dStr)) {
          completed += 1;
        }
      }
    }
    return Math.round((completed / Math.max(1, scheduled)) * 100);
  };

  const currentPct = getHabitRate(curStartStr, todayStr);
  const previousPct = getHabitRate(prevStartStr, prevEndStr);
  const diffPp = currentPct - previousPct;

  let state: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  let symbol = '→';

  if (diffPp > 0) {
    state = 'IMPROVING';
    symbol = '↑';
  } else if (diffPp < 0) {
    state = 'DECLINING';
    symbol = '↓';
  }

  return {
    currentPct,
    previousPct,
    diffPp,
    state,
    symbol,
  };
};
