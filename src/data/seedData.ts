import { AppData, Task, JournalEntry, Habit, ProgressMeter } from '../types';

// Format Date object to YYYY-MM-DD in local time (immune to UTC timezone shift)
const formatLocalYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper to format dates YYYY-MM-DD with local day offset
const getDateStr = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatLocalYMD(d);
};

// Helper to generate realistic habit completed dates for 365 days across all 12 months
const generateYearlyCompletedDates = (daysAgoStart: number = 365, completionRate: number = 0.78, seed: number = 1): string[] => {
  const dates: string[] = [];
  const now = new Date();
  
  for (let i = daysAgoStart; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = formatLocalYMD(d);
    
    // Pseudo-random deterministic check based on day index & seed
    const pseudoRand = (Math.sin(i * 9999 + seed * 7777) + 1) / 2;
    if (pseudoRand < completionRate) {
      dates.push(dateStr);
    }
  }
  return dates;
};

// Helper to generate realistic 365-day progress meter entries across 1 year
const generateYearlyMeterEntries = (daysAgoStart: number = 365, baseVal: number, variance: number, minVal: number, maxVal: number, stepDays: number = 1): Record<string, number> => {
  const entries: Record<string, number> = {};
  const now = new Date();
  for (let i = daysAgoStart; i >= 0; i -= stepDays) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = formatLocalYMD(d);
    const pseudoRand = (Math.sin(i * 1234 + baseVal * 5678) + 1) / 2;
    const val = Math.round(Math.min(maxVal, Math.max(minVal, baseVal + (pseudoRand - 0.5) * variance)));
    entries[dateStr] = val;
  }
  return entries;
};

// Helper to generate realistic 365-day completed tasks across 1 year for task analytics
const generateYearlyCompletedTasks = (daysAgoStart: number = 365): Task[] => {
  const generatedTasks: Task[] = [];
  const now = new Date();
  const categories = ['Design', 'Personal', 'Learning', 'Writing', 'Health', 'Focus'];
  const titles = [
    'Refine interface layout and padding symmetry',
    'Synthesize qualitative feedback on color tokens',
    'Evaluate daily velocity ratios and deep sessions',
    'Consolidate local backups with IndexedDB checks',
    'Conduct comparative analysis of habit indicators',
    'Review performance curves and stretch indicators',
    'Optimize asset loader and compressed textures',
    'Calibrate workflow priority queue weights',
    'Examine focus metric distribution trends',
    'Draft newsletter editorial on visual minimalism'
  ];

  for (let i = daysAgoStart; i >= 5; i -= 3) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = formatLocalYMD(d);
    
    const catIdx = Math.abs(Math.sin(i * 1234.5)) * categories.length;
    const category = categories[Math.floor(catIdx)];
    
    const titleIdx = Math.abs(Math.sin(i * 5678.9)) * titles.length;
    const baseTitle = titles[Math.floor(titleIdx)];
    const priority = i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low';

    generatedTasks.push({
      id: `task-gen-${i}`,
      title: `${category}: ${baseTitle}`,
      description: `Mindfully logged outcome completed during deep work session.`,
      dueDate: dateStr,
      priority: priority as 'high' | 'medium' | 'low',
      completed: true,
      completedAt: `${dateStr}T16:00:00Z`,
      createdAt: formatLocalYMD(new Date(d.getTime() - 2 * 24 * 60 * 60 * 1000)),
      category: category,
      subtasks: [],
    });
  }
  return generatedTasks;
};

export const getInitialSeedData = (): AppData => {
  const today = getDateStr(0);
  const yesterday = getDateStr(-1);
  const day2Ago = getDateStr(-2);
  const day3Ago = getDateStr(-3);
  const day4Ago = getDateStr(-4);
  const day5Ago = getDateStr(-5);
  const day6Ago = getDateStr(-6);
  const tomorrow = getDateStr(1);
  const dayAfterTomorrow = getDateStr(2);

  // Month-start reference string for current month (e.g., "2026-09-01")
  const currentMonthStart = `${today.substring(0, 7)}-01`;

  return {
    userPreferences: {
      userName: 'Ehsaan',
      avatarEmoji: '🌿',
    },
    tasks: [
      ...generateYearlyCompletedTasks(365),
      // --- CURRENT MONTH (Active & Everyday Tasks) ---
      {
        id: 'task-1',
        title: 'Complete Chromatic Design System Specification',
        description: 'Review color tokens, contrast ratios, and component border radii for the new release.',
        dueDate: today,
        dueTime: '10:30',
        priority: 'high',
        completed: false,
        createdAt: day2Ago,
        category: 'Design',
        isRecurring: 'none',
        subtasks: [
          { id: 'sub-1-1', title: 'Verify contrast AAA rating on warm cream backgrounds', completed: true, parentTaskId: 'task-1' },
          { id: 'sub-1-2', title: 'Export color palette CSS custom properties', completed: true, parentTaskId: 'task-1' },
          { id: 'sub-1-3', title: 'Finalize mobile drawer component proportions', completed: false, parentTaskId: 'task-1' },
        ],
      },
      {
        id: 'task-2',
        title: 'Review Weekly Progress Meters & Trends',
        description: 'Analyze mood and focus scores across the past 7 days in the Insights tab.',
        dueDate: today,
        dueTime: '14:00',
        priority: 'medium',
        completed: false,
        createdAt: day1Ago(1),
        category: 'Personal',
        isRecurring: 'weekly',
        subtasks: [
          { id: 'sub-2-1', title: 'Check average daily focus duration', completed: true, parentTaskId: 'task-2' },
          { id: 'sub-2-2', title: 'Log energy level for today', completed: false, parentTaskId: 'task-2' },
        ],
      },
      {
        id: 'task-3',
        title: 'Daily Deep Reading & Reflection',
        description: 'Read 20 pages of "Form & Colour" and record key insights in the Journal.',
        dueDate: today,
        dueTime: '18:00',
        priority: 'low',
        completed: true,
        completedAt: `${today}T08:15:00Z`,
        createdAt: currentMonthStart,
        startDate: currentMonthStart,
        category: 'Learning',
        isRecurring: 'daily',
        subtasks: [
          { id: 'sub-3-1', title: 'Chapter 4: Spatial Tension', completed: true, parentTaskId: 'task-3' },
          { id: 'sub-3-2', title: 'Write 3 key takeaways in journal', completed: true, parentTaskId: 'task-3' },
        ],
      },
      {
        id: 'task-4',
        title: 'Prepare Atelier Journal Bi-Weekly Newsletter',
        description: 'Draft the main article on chromatic balance and tactile UI serenity.',
        dueDate: tomorrow,
        dueTime: '11:00',
        priority: 'high',
        completed: false,
        createdAt: day3Ago,
        category: 'Writing',
        isRecurring: 'none',
        subtasks: [
          { id: 'sub-4-1', title: 'Outline editorial highlights section', completed: true, parentTaskId: 'task-4' },
          { id: 'sub-4-2', title: 'Select high resolution visual samples', completed: false, parentTaskId: 'task-4' },
        ],
      },
      {
        id: 'task-5',
        title: 'Conduct Studio Ergonomics & Lighting Audit',
        description: 'Adjust ambient warm lighting and monitor distance to reduce eye fatigue.',
        dueDate: dayAfterTomorrow,
        priority: 'low',
        completed: false,
        createdAt: day2Ago,
        category: 'Health',
        subtasks: [],
      },
      {
        id: 'task-6',
        title: 'Complete Zen Ceramics Color Palette Mapping',
        description: 'Map matte terra-cotta, rich chocolate, and warm cream swatches.',
        dueDate: yesterday,
        priority: 'medium',
        completed: true,
        completedAt: `${yesterday}T16:30:00Z`,
        createdAt: day4Ago,
        category: 'Design',
        subtasks: [
          { id: 'sub-6-1', title: 'Mix earthenware pigments', completed: true, parentTaskId: 'task-6' },
        ],
      },
      {
        id: 'task-7',
        title: 'Morning Yoga & Mindfulness Routine',
        description: '15 minutes stretch and breathwork before deep focus session.',
        dueDate: today,
        priority: 'low',
        completed: false,
        createdAt: currentMonthStart,
        startDate: currentMonthStart,
        category: 'Health',
        isRecurring: 'daily',
        subtasks: [],
      },

      // --- HISTORICAL YEARLY COMPLETED TASKS (Spanning 12 Months) ---
      {
        id: 'task-hist-1',
        title: 'August Atelier Retrospective & Metrics Sync',
        description: 'Evaluate productivity trends and habit completion rates from August.',
        dueDate: getDateStr(-25),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-25)}T14:00:00Z`,
        createdAt: getDateStr(-35),
        category: 'Focus',
        subtasks: [],
      },
      {
        id: 'task-hist-2',
        title: 'July Design System Accessibility AAA Audit',
        description: 'Verify color contrast levels and screen reader navigational semantics.',
        dueDate: getDateStr(-55),
        priority: 'medium',
        completed: true,
        completedAt: `${getDateStr(-55)}T11:30:00Z`,
        createdAt: getDateStr(-65),
        category: 'Design',
        subtasks: [],
      },
      {
        id: 'task-hist-3',
        title: 'June Studio Infrastructure & Asset Optimization',
        description: 'Compress high-res image assets and optimize IndexedDB local caching.',
        dueDate: getDateStr(-85),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-85)}T16:45:00Z`,
        createdAt: getDateStr(-95),
        category: 'Design',
        subtasks: [],
      },
      {
        id: 'task-hist-4',
        title: 'May Spring Ceramics Product Line Launch',
        description: 'Finalize physical studio collection catalog and photo documentation.',
        dueDate: getDateStr(-115),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-115)}T15:00:00Z`,
        createdAt: getDateStr(-125),
        category: 'Design',
        subtasks: [],
      },
      {
        id: 'task-hist-5',
        title: 'April Focus & Deep Work Time Block Refinement',
        description: 'Establish 90-minute uninterrupted daily deep work windows.',
        dueDate: getDateStr(-145),
        priority: 'medium',
        completed: true,
        completedAt: `${getDateStr(-145)}T10:00:00Z`,
        createdAt: getDateStr(-155),
        category: 'Personal',
        subtasks: [],
      },
      {
        id: 'task-hist-6',
        title: 'March Q1 Performance & Progress Meter Audit',
        description: 'Cross-reference habit consistency against task velocity metrics.',
        dueDate: getDateStr(-175),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-175)}T17:20:00Z`,
        createdAt: getDateStr(-185),
        category: 'Focus',
        subtasks: [],
      },
      {
        id: 'task-hist-7',
        title: 'February Winter Design Workshop Presentation',
        description: 'Deliver keynote on warm palette UI principles and cognitive serenity.',
        dueDate: getDateStr(-205),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-205)}T12:00:00Z`,
        createdAt: getDateStr(-215),
        category: 'Writing',
        subtasks: [],
      },
      {
        id: 'task-hist-8',
        title: 'January New Year Goal Mapping & Milestone Setting',
        description: 'Define key yearly objectives across design, study, health, and focus.',
        dueDate: getDateStr(-235),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-235)}T09:30:00Z`,
        createdAt: getDateStr(-245),
        category: 'Personal',
        subtasks: [],
      },
      {
        id: 'task-hist-9',
        title: 'December Year-End Portfolio Synthesis',
        description: 'Curate top creative works and reflection entries into annual retrospective.',
        dueDate: getDateStr(-265),
        priority: 'medium',
        completed: true,
        completedAt: `${getDateStr(-265)}T16:00:00Z`,
        createdAt: getDateStr(-275),
        category: 'Design',
        subtasks: [],
      },
      {
        id: 'task-hist-10',
        title: 'November Autumn Atelier Print Catalog Production',
        description: 'Prepare high resolution PDF export with warm earthen color profiles.',
        dueDate: getDateStr(-295),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-295)}T14:15:00Z`,
        createdAt: getDateStr(-305),
        category: 'Writing',
        subtasks: [],
      },
      {
        id: 'task-hist-11',
        title: 'October Annual Creative Retrospective & Vision Board',
        description: 'Synthesize insights from journals and progress meters across the year.',
        dueDate: getDateStr(-325),
        priority: 'medium',
        completed: true,
        completedAt: `${getDateStr(-325)}T16:00:00Z`,
        createdAt: getDateStr(-335),
        category: 'Personal',
        subtasks: [],
      },
      {
        id: 'task-hist-12',
        title: 'September Studio Initial Setup & Baseline Philosophy',
        description: 'Establish initial workspace environment, color tokens, and backup protocols.',
        dueDate: getDateStr(-355),
        priority: 'high',
        completed: true,
        completedAt: `${getDateStr(-355)}T10:00:00Z`,
        createdAt: getDateStr(-360),
        category: 'Focus',
        subtasks: [],
      },
    ],
    journalEntries: [
      {
        id: 'journal-today',
        date: today,
        title: 'Clarity through Spatial Harmony',
        content: 'Started the morning with quiet focus and a warm cup of filter coffee. Spent two uninterrupted hours refining the grid system and typography hierarchy. Noticed how soft warm backgrounds reduce eye strain significantly.',
        moodEmoji: '😊',
        tags: ['Reflections', 'Design', 'Mindfulness'],
        createdAt: `${today}T08:30:00Z`,
        updatedAt: `${today}T08:30:00Z`,
      },
      {
        id: 'journal-yesterday',
        date: yesterday,
        title: 'Embracing Tactile Serenity in Daily Workflows',
        content: 'Completed the Zen Ceramics color mapping task today ahead of schedule. Taking time to break down large tasks into smaller subtasks gave me a huge sense of momentum.',
        moodEmoji: '⚡',
        tags: ['Productivity', 'Ceramics'],
        createdAt: `${yesterday}T20:15:00Z`,
        updatedAt: `${yesterday}T20:15:00Z`,
      },
      {
        id: 'journal-day2ago',
        date: day2Ago,
        title: 'Deep Focus & Creative Flow',
        content: 'Reflected on how consistency compounds over time. Even completing 2 out of 3 subtasks moves the needle forward. Practiced 30 minutes of intentional stillness in the evening.',
        moodEmoji: '🧘',
        tags: ['Flow', 'Mindfulness'],
        createdAt: `${day2Ago}T21:00:00Z`,
        updatedAt: `${day2Ago}T21:00:00Z`,
      },
      {
        id: 'journal-day3ago',
        date: day3Ago,
        title: 'Weekly Planning & Intentionality',
        content: 'Set clear priorities for the week ahead. Grouped my tasks into High, Medium, and Low buckets to ensure high-leverage work happens during morning peak energy hours.',
        moodEmoji: '📚',
        tags: ['Planning', 'Organization'],
        createdAt: `${day3Ago}T19:40:00Z`,
        updatedAt: `${day3Ago}T19:40:00Z`,
      },
      {
        id: 'journal-m1',
        date: getDateStr(-30),
        title: 'August Reflection: Consistency over Intensity',
        content: 'Reflecting on the past month of habit tracking. Small 15-minute daily habits create far more momentum than sporadic burst efforts. Feeling centered.',
        moodEmoji: '🔥',
        tags: ['Monthly Sync', 'Habits'],
        createdAt: `${getDateStr(-30)}T19:00:00Z`,
        updatedAt: `${getDateStr(-30)}T19:00:00Z`,
      },
      {
        id: 'journal-m2',
        date: getDateStr(-60),
        title: 'July Notes on Visual Calm & Minimalism',
        content: 'Simplified my daily task queue to maximum 3 high priority items. The cognitive relief is immediate and noticeable.',
        moodEmoji: '🌿',
        tags: ['Minimalism', 'Focus'],
        createdAt: `${getDateStr(-60)}T20:00:00Z`,
        updatedAt: `${getDateStr(-60)}T20:00:00Z`,
      },
      {
        id: 'journal-m3',
        date: getDateStr(-90),
        title: 'June Deep Work Log: Architectural Principles',
        content: 'Reflecting on design principles and tactile interface warm palettes. High contrast borders with warm ceramic cream textures create an inviting environment.',
        moodEmoji: '✨',
        tags: ['Design', 'Philosophy'],
        createdAt: `${getDateStr(-90)}T21:00:00Z`,
        updatedAt: `${getDateStr(-90)}T21:00:00Z`,
      },
      {
        id: 'journal-m4',
        date: getDateStr(-120),
        title: 'May Spring Milestone & Creative Flow',
        content: 'Launched the Spring ceramic palette. Taking time to celebrate minor milestones before immediately jumping into the next backlog item.',
        moodEmoji: '🎉',
        tags: ['Milestone', 'Ceramics'],
        createdAt: `${getDateStr(-120)}T18:30:00Z`,
        updatedAt: `${getDateStr(-120)}T18:30:00Z`,
      },
      {
        id: 'journal-m5',
        date: getDateStr(-150),
        title: 'April Retrospective: Balancing Energy & Rest',
        content: 'Monitored energy level trends across the past 4 weeks. Morning walk and hydrations directly correlate with high focus ratings.',
        moodEmoji: '⚡',
        tags: ['Health', 'Energy'],
        createdAt: `${getDateStr(-150)}T21:15:00Z`,
        updatedAt: `${getDateStr(-150)}T21:15:00Z`,
      },
      {
        id: 'journal-m6',
        date: getDateStr(-180),
        title: 'March Half-Year Check-in: Gratitude & Discipline',
        content: 'Mid-year mark. Reviewing completed task velocity and habit check-in heatmaps. Seeing 6 solid months of colored matrix squares is incredibly rewarding.',
        moodEmoji: '❤️',
        tags: ['Gratitude', 'Retrospective'],
        createdAt: `${getDateStr(-180)}T20:45:00Z`,
        updatedAt: `${getDateStr(-180)}T20:45:00Z`,
      },
      {
        id: 'journal-m7',
        date: getDateStr(-210),
        title: 'February Winter Insights: Rhythm of Focus',
        content: 'Deep winter study sessions. Practicing PYQs and active recall before rest creates quiet mental clarity.',
        moodEmoji: '📖',
        tags: ['Study', 'Recall'],
        createdAt: `${getDateStr(-210)}T22:00:00Z`,
        updatedAt: `${getDateStr(-210)}T22:00:00Z`,
      },
      {
        id: 'journal-m8',
        date: getDateStr(-240),
        title: 'January New Year Entry: Foundation & Vision',
        content: 'Committing to 365 days of intentional outcome tracking. Building an environment that encourages quiet focus and steady execution.',
        moodEmoji: '🎯',
        tags: ['Vision', 'Goals'],
        createdAt: `${getDateStr(-240)}T09:00:00Z`,
        updatedAt: `${getDateStr(-240)}T09:00:00Z`,
      },
      {
        id: 'journal-m9',
        date: getDateStr(-300),
        title: 'Late Autumn Log: Digital Solitude & Peace',
        content: 'Keeping screen time under 2 hours daily has transformed sleep quality and mental endurance during deep creative sessions.',
        moodEmoji: '🌙',
        tags: ['Mindfulness', 'ScreenTime'],
        createdAt: `${getDateStr(-300)}T21:30:00Z`,
        updatedAt: `${getDateStr(-300)}T21:30:00Z`,
      },
      {
        id: 'journal-m10',
        date: getDateStr(-350),
        title: 'First Year Entry: Studio Genesis',
        content: 'First journal entry in the workspace. Setting up foundational habits and progress meters to track health, focus, and study outcomes over the coming year.',
        moodEmoji: '🌱',
        tags: ['Genesis', 'Beginning'],
        createdAt: `${getDateStr(-350)}T08:00:00Z`,
        updatedAt: `${getDateStr(-350)}T08:00:00Z`,
      },
    ],
    habits: [
      {
        id: 'habit-1',
        name: 'PURE POTENTIAL',
        emoji: '🔥',
        description: 'Having the screen time of less than 2 hour',
        category: 'Focus',
        startDate: getDateStr(-365),
        targetDaysPerWeek: 7,
        frequency: 'daily',
        createdAt: getDateStr(-365),
        order: 0,
        completedDates: generateYearlyCompletedDates(365, 0.80, 1),
      },
      {
        id: 'habit-2',
        name: 'EXERCISE',
        emoji: '🏃',
        description: '30 minutes workout or morning cardio session',
        category: 'Health',
        startDate: getDateStr(-365),
        targetDaysPerWeek: 7,
        frequency: 'daily',
        createdAt: getDateStr(-365),
        order: 1,
        completedDates: generateYearlyCompletedDates(365, 0.74, 2),
      },
      {
        id: 'habit-3',
        name: 'PYQs and Writting',
        emoji: '✍️',
        description: 'Practice previous year questions and editorial writing',
        category: 'Study',
        startDate: getDateStr(-365),
        targetDaysPerWeek: 7,
        frequency: 'daily',
        createdAt: getDateStr(-365),
        order: 2,
        completedDates: generateYearlyCompletedDates(365, 0.72, 3),
      },
      {
        id: 'habit-4',
        name: 'POWER FOCS BACK',
        emoji: '🎯',
        description: 'Deep focus blocks without multitasking or phone check',
        category: 'Productivity',
        startDate: getDateStr(-365),
        targetDaysPerWeek: 7,
        frequency: 'daily',
        createdAt: getDateStr(-365),
        order: 3,
        completedDates: generateYearlyCompletedDates(365, 0.85, 4),
      },
      {
        id: 'habit-5',
        name: 'Daily recall before sleep',
        emoji: '🌙',
        description: '10-minute active mental recall and gratitude before sleeping',
        category: 'Mindfulness',
        startDate: getDateStr(-365),
        targetDaysPerWeek: 7,
        frequency: 'daily',
        createdAt: getDateStr(-365),
        order: 4,
        completedDates: generateYearlyCompletedDates(365, 0.78, 5),
      },
    ],
    progressMeters: [
      {
        id: 'meter-mood',
        name: 'Mood',
        emojiIcon: '😊',
        unitType: 'scale_1_5',
        goalValue: 5,
        unitLabel: 'score',
        createdAt: getDateStr(-365),
        entries: generateYearlyMeterEntries(365, 4, 1.5, 1, 5, 1),
      },
      {
        id: 'meter-focus',
        name: 'Focus',
        emojiIcon: '🎯',
        unitType: 'percentage',
        goalValue: 100,
        unitLabel: '%',
        createdAt: getDateStr(-365),
        entries: generateYearlyMeterEntries(365, 82, 20, 40, 100, 1),
      },
      {
        id: 'meter-study',
        name: 'Study & Reading',
        emojiIcon: '📚',
        unitType: 'time',
        goalValue: 180, // 3 hours = 180 mins
        unitLabel: 'hours',
        createdAt: getDateStr(-365),
        entries: generateYearlyMeterEntries(365, 140, 60, 30, 240, 1),
      },
      {
        id: 'meter-energy',
        name: 'Energy',
        emojiIcon: '⚡',
        unitType: 'scale_1_5',
        goalValue: 5,
        unitLabel: 'score',
        createdAt: getDateStr(-365),
        entries: generateYearlyMeterEntries(365, 4, 1, 2, 5, 1),
      },
      {
        id: 'meter-discipline',
        name: 'Discipline',
        emojiIcon: '🧘',
        unitType: 'percentage',
        goalValue: 100,
        unitLabel: '%',
        createdAt: getDateStr(-365),
        entries: generateYearlyMeterEntries(365, 88, 15, 50, 100, 1),
      },
    ],
    notes: [
      {
        id: 'note-1',
        title: 'Chromatic Balance & Visual Serenity Principles',
        content: 'Design Philosophy:\n1. Allocate color with strict 60-30-10 discipline. Background neutral canvas occupies 60%, structural cards 30%, and high-intent terracotta accent 10%.\n2. Maintain spatial padding ratio where container outer margin is greater than inner gap.\n3. Favor clean unboxed text metadata over static pill capsules.',
        category: 'Ideas',
        tags: ['Design', 'Philosophy', 'UI'],
        isPinned: true,
        color: '#f8db97',
        createdAt: `${today}T10:00:00Z`,
        updatedAt: `${today}T10:00:00Z`,
      },
      {
        id: 'note-2',
        title: 'Deep Work & Focus Routine Blocks',
        content: 'Morning Window (8:00 AM - 10:30 AM):\n- Uninterrupted outcome execution on High Priority task.\n- Zero notifications or tab switching.\n\nAfternoon Window (2:00 PM - 3:30 PM):\n- Subtask review, progress logging, and journal synthesis.',
        category: 'Work',
        tags: ['Focus', 'Routine', 'TimeBlocking'],
        isPinned: true,
        color: '#f6e9d7',
        createdAt: `${yesterday}T14:30:00Z`,
        updatedAt: `${yesterday}T14:30:00Z`,
      },
      {
        id: 'note-3',
        title: 'Book Takeaways: Form & Spatial Tension',
        content: 'Key insights from Chapter 4:\n- Spatial contrast creates immediate hierarchy without relying on heavy borders.\n- Soft warm tones reduce cognitive fatigue during extended reading sessions.\n- Tabular numerals preserve vertical visual alignment across data metrics.',
        category: 'Learning',
        tags: ['Reading', 'Typography', 'Quotes'],
        isPinned: false,
        color: '#edd8c2',
        createdAt: `${day2Ago}T09:15:00Z`,
        updatedAt: `${day2Ago}T09:15:00Z`,
      },
      {
        id: 'note-4',
        title: 'Personal Reflections on Habit Compound Ratios',
        content: 'A 15-minute daily ritual completed consistently for 30 consecutive days generates stronger momentum than sporadic 3-hour weekend sprints.\n\nConsistency > Intensity.',
        category: 'Personal',
        tags: ['Habits', 'Mindset'],
        isPinned: false,
        color: '#eec7a7',
        createdAt: `${day3Ago}T18:00:00Z`,
        updatedAt: `${day3Ago}T18:00:00Z`,
      },
    ],
  };
};

function day1Ago(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return formatLocalYMD(date);
}
