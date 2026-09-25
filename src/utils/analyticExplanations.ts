import { AnalyticExplanation } from '../components/AnalyticInfoModal';

export const ANALYTIC_EXPLANATIONS: Record<string, AnalyticExplanation> = {
  dailyTaskCompletion: {
    category: 'TASK EXECUTION',
    title: 'Daily Task Completion Rate',
    formula: 'Daily Rate (%) = (Tasks Completed Today / Total Tasks Scheduled Today) × 100',
    description: 'Measures the percentage of scheduled outcomes successfully completed for today.',
    dataPoints: [
      'Tasks where dueDate matches today date',
      'Tasks marked completed directly or in completion dates array for today',
    ],
    example: 'If 4 tasks are due today and 3 are marked completed, Daily Rate = (3 / 4) × 100 = 75%.',
    tips: [
      'Aim for 80%+ daily completion for steady progress without burnout.',
      'Defer non-essential tasks if daily capacity exceeds 5 outcomes.',
    ],
  },

  overallTaskCompletion: {
    category: 'WORKSPACE METRICS',
    title: 'Overall Workspace Completion Ratio',
    formula: 'Overall Ratio (%) = (Total Finished Tasks / Total Workspace Tasks) × 100',
    description: 'Calculates overall task completion across your entire task backlog.',
    dataPoints: ['All active and archived Task objects in local storage'],
    example: 'If you have created 20 total tasks and 15 are completed, Overall Ratio = (15 / 20) × 100 = 75%.',
    tips: [
      'Archive or clean up obsolete tasks to keep your workspace ratio accurate.',
    ],
  },

  habitCurrentStreak: {
    category: 'HABIT DISCIPLINE',
    title: 'Current Consecutive Streak',
    formula: 'Streak = Count of consecutive past days ending today (or yesterday) with logged check-ins',
    description: 'Tracks unbroken daily check-ins for this habit. Missing an active day resets the current streak.',
    dataPoints: ['Habit.completedDates array of YYYY-MM-DD string records'],
    example: 'If checked in today, yesterday, and the day before, Current Streak = 3 Days.',
    tips: [
      'Checking in at the same time each day builds procedural memory.',
      'Even a partial check-in maintains momentum and prevents streak decay.',
    ],
  },

  habitBestStreak: {
    category: 'HABIT DISCIPLINE',
    title: 'All-Time Best Streak',
    formula: 'Best Streak = Max consecutive completed days sequence in Habit.completedDates',
    description: 'Records your highest historical unbroken streak for this habit.',
    dataPoints: ['Habit.completedDates array parsed across all historical records'],
    example: 'If your longest unbroken streak was 14 days last month, Best Streak = 14 Days.',
    tips: ['Use your Best Streak as a personal benchmark to challenge yourself.'],
  },

  habitMonthlyConsistency: {
    category: 'HABIT ANALYTICS',
    title: 'Monthly Habit Consistency Rate',
    formula: 'Monthly Consistency (%) = (Check-ins in Month / Days in Month) × 100',
    description: 'Calculates overall check-in density for the selected calendar month.',
    dataPoints: ['Habit.completedDates matched against year and month dates'],
    example: 'In a 30-day month, 21 check-ins = (21 / 30) × 100 = 70% consistency.',
    tips: ['Focus on high monthly consistency rather than panicking if a streak breaks once.'],
  },

  overallHabitConsistency: {
    category: 'SUITE ANALYTICS',
    title: 'Overall Habit Consistency (30-Day)',
    formula: 'Overall Consistency (%) = (Total Check-ins in 30 Days / (Active Habits × 30)) × 100',
    description: 'Measures collective execution across your entire habit collection over 30 days.',
    dataPoints: ['All Habit.completedDates within past 30 days', 'Total active habits count'],
    example: '3 habits with 60 combined check-ins over 30 days = 60 / (3 × 30) = 66.7%.',
    tips: ['Consistency above 70% indicates sustainable habit building.'],
  },

  activeStreaksCount: {
    category: 'HABIT DISCIPLINE',
    title: 'Active Streaks Count',
    formula: 'Active Streaks = Count of Habits where currentStreak ≥ 1',
    description: 'Counts how many habits currently have an active unbroken streak of at least 1 day.',
    dataPoints: ['Individual currentStreak calculated for each habit'],
    example: 'If 4 out of 5 habits have logged check-ins today or yesterday, Active Streaks = 4.',
    tips: ['Protect active streaks by completing low-effort versions on busy days.'],
  },

  heatmapActivityIndex: {
    category: 'OUTPUT MATRIX',
    title: '365-Day Activity Heatmap Intensity',
    formula: 'Daily Intensity Level (0-4) = Min(4, Floor(Task Completions + Habit Check-ins on Date))',
    description: 'Calculates activity output intensity for each date in the 365-day calendar grid.',
    dataPoints: ['Task.completedDates', 'Habit.completedDates', 'JournalEntry.date'],
    example: '2 completed tasks + 1 habit check-in = 3 total actions (Shade Level 3).',
    tips: ['Consistency over 365 days builds compound growth across all personal outcomes.'],
  },

  workloadIndex: {
    category: 'CAPACITY PLANNING',
    title: 'Workload Density & Overload Alert',
    formula: 'Overloaded Flag = True if Scheduled Tasks on same Date ≥ 4',
    description: 'Scans upcoming dates to detect heavy task concentration that might trigger burnout.',
    dataPoints: ['Task.dueDate counts grouped by date'],
    example: 'If 5 tasks are set for tomorrow, tomorrow is flagged as an Overloaded Day.',
    tips: ['Reschedule non-urgent tasks to quieter days to preserve cognitive focus.'],
  },

  journalConsistency: {
    category: 'MINDFULNESS',
    title: 'Journal Reflection Consistency',
    formula: 'Unique Reflected Days = Count of unique dates with stored Journal Entries',
    description: 'Measures how regularly you practice daily journaling and reflection.',
    dataPoints: ['JournalEntry.date unique string set'],
    example: 'Entries written on 12 distinct dates = 12 Reflected Days.',
    tips: ['Reflecting at night helps process completed outcomes and clear mental clutter.'],
  },

  progressMeterPercentage: {
    category: 'GOALS & PROGRESS',
    title: 'Progress Goal Completion %',
    formula: 'Completion (%) = (Current Progress Value / Target Goal Value) × 100',
    description: 'Tracks percentage completed towards a quantitative target goal.',
    dataPoints: ['ProgressMeter.currentValue', 'ProgressMeter.targetValue'],
    example: 'Current Value = 45, Target = 100 → Completion = (45 / 100) × 100 = 45%.',
    tips: ['Update current value whenever you complete incremental units.'],
  },

  progressPaceRate: {
    category: 'GOAL PACING',
    title: 'Required Daily Pace Rate',
    formula: 'Daily Pace = (Target Value - Current Value) / Max(1, Days Remaining until Target Date)',
    description: 'Calculates the exact daily velocity needed to hit your target by the deadline.',
    dataPoints: ['ProgressMeter.targetValue', 'ProgressMeter.currentValue', 'ProgressMeter.targetDate'],
    example: '50 units remaining with 10 days left = 50 / 10 = 5 units per day required.',
    tips: ['If daily pace requirement rises too high, consider extending deadline or increasing daily effort.'],
  },

  habitRecoveryRate: {
    category: 'RESILIENCE ANALYTICS',
    title: 'Habit Recovery Rate After Miss',
    formula: 'Recovery Rate (%) = (Check-ins on day immediately after a miss / Total Missed Days) × 100',
    description: 'Measures your psychological resilience: how reliably you resume a habit after missing a day.',
    dataPoints: ['Historical miss dates compared with next-day check-in status'],
    example: 'If you missed 4 days historically and checked in the next day 3 times, Recovery Rate = 75%.',
    tips: ['Never miss twice in a row—a single miss is an accident, two misses is a new habit.'],
  },

  productivityMomentumScore: {
    category: 'HOLISTIC PERFORMANCE',
    title: 'Productivity Momentum Index',
    formula: 'Momentum Score = (40% × Task Ratio) + (40% × Habit Consistency) + (20% × Journal Rate)',
    description: 'Combines task execution velocity, habit discipline, and mindfulness reflection into one score.',
    dataPoints: ['Task completion ratio', '30-day habit consistency %', 'Journal entry frequency'],
    example: '80% Task Ratio + 70% Habit Consistency + 50% Journal Rate = (32 + 28 + 10) = 70 Momentum Score.',
    tips: ['Maintaining balanced effort across tasks, habits, and journals produces maximum growth.'],
  },
};
