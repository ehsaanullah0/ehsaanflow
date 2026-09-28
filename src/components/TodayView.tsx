import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Activity, 
  Plus, 
  ChevronRight,
  Zap,
  TrendingUp,
  AlertTriangle,
  Flame,
  Check,
  FolderCheck,
  Camera,
  Trash2,
  Palette,
  User,
  Edit3,
  Search,
  X,
  Calendar,
  Target,
  Star
} from 'lucide-react';
import { Task, JournalEntry, ProgressMeter, NavSection, Habit, AppData } from '../types';
import { formatDateStr } from '../utils/habitUtils';
import { TaskCard } from './TaskCard';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface TodayViewProps {
  tasks: Task[];
  habits?: Habit[];
  journalEntries: JournalEntry[];
  progressMeters: ProgressMeter[];
  userPreferences?: AppData['userPreferences'];
  onToggleTaskComplete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onOpenJournalModal: (entry?: JournalEntry | null, date?: string) => void;
  onUpdateMeterValue: (meterId: string, date: string, value: number) => void;
  onToggleHabitDate?: (habitId: string, dateStr: string) => void;
  onNavigateSection: (section: NavSection) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenEhsaanStudio: () => void;
  theme?: 'original';
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  habits = [],
  journalEntries,
  progressMeters,
  userPreferences,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onAddSubtask,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
  onOpenJournalModal,
  onUpdateMeterValue,
  onToggleHabitDate,
  onNavigateSection,
  searchQuery,
  onSearchChange,
  onOpenEhsaanStudio,
  theme = 'original',
}) => {
  const isOlive = false;
  const todayStr = formatDateStr(new Date());

  // Filter tasks due today, active in duration range, or overdue
  const isTaskActiveToday = (t: Task) => {
    if (t.dueDate === todayStr) return true;
    if (t.isRecurring === 'daily') {
      const taskStart = t.startDate || t.dueDate || t.createdAt.split('T')[0];
      const startMonth = taskStart.substring(0, 7);
      const todayMonth = todayStr.substring(0, 7);
      return todayStr >= taskStart && todayMonth === startMonth;
    }
    if (t.isRecurring === 'duration' && t.startDate && t.endDate) {
      return todayStr >= t.startDate && todayStr <= t.endDate;
    }
    return false;
  };

  const todayTasks = tasks.filter(isTaskActiveToday);
  
  // Sort tasks by priority: high -> medium -> low
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    const pA = priorityOrder[a.priority] || 4;
    const pB = priorityOrder[b.priority] || 4;
    if (pA !== pB) return pA - pB;
    // If priority is the same, sort by creation date (older first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const overdueTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (t.isRecurring === 'duration' && t.endDate) {
      return t.endDate < todayStr;
    }
    return t.dueDate < todayStr && t.isRecurring !== 'duration';
  });
  const completedTodayTasks = todayTasks.filter((t) => t.completed);
  const highPriorityToday = todayTasks.filter((t) => t.priority === 'high' && !t.completed);

  // Today's journal entry if exists
  const todayJournal = journalEntries.find((j) => j.date === todayStr);

  // Calculate today's completion rate
  const completionPercentage = todayTasks.length > 0
    ? Math.round((completedTodayTasks.length / todayTasks.length) * 100)
    : 100;

  // Group tasks by category to calculate folder progress (incorporating both tasks and subtasks)
  const categoryProgress = React.useMemo(() => {
    const progress: Record<string, { completed: number; total: number }> = {};
    tasks.forEach((t) => {
      const cat = t.category?.trim() || 'General';
      if (!progress[cat]) {
        progress[cat] = { completed: 0, total: 0 };
      }
      
      // Count the main task itself
      progress[cat].total++;
      if (t.completed) {
        progress[cat].completed++;
      }

      // Count each subtask individually for precise progress weight
      if (t.subtasks && t.subtasks.length > 0) {
        t.subtasks.forEach((sub) => {
          progress[cat].total++;
          if (sub.completed) {
            progress[cat].completed++;
          }
        });
      }
    });

    return Object.entries(progress).map(([name, stats]) => ({
      name,
      completed: stats.completed,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }));
  }, [tasks]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Redesigned Frameless Top Hero Header with Landscape Graphic */}
      <div className="relative rounded-3xl p-4 sm:p-5 overflow-hidden transition-all bg-transparent">
        {/* Landscape Graphic Background (integrated seamlessly inside the app theme colors) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none select-none">
          <svg className="absolute right-0 bottom-0 w-full sm:w-2/3 md:w-1/2 h-full opacity-35 object-cover" viewBox="0 0 500 200" fill="none" preserveAspectRatio="none">
            {/* Soft Sun */}
            <circle cx="430" cy="70" r="30" fill="#f6e9d7" fillOpacity="0.8" />
            <circle cx="430" cy="70" r="22" fill="#df734c" fillOpacity="0.25" />
            
            {/* Elegant Rolling Hills */}
            <path d="M100 200C180 160 260 190 340 140C420 90 460 130 500 110V200H100Z" fill="#edd8c2" fillOpacity="0.5" />
            <path d="M0 200C120 170 250 210 370 140C430 110 460 130 500 120V200H0Z" fill="#edd8c2" fillOpacity="0.7" />
            <path d="M150 200C220 180 290 195 360 160C430 125 460 140 500 135V200H150Z" fill="#823b28" fillOpacity="0.08" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
          {/* Left Column: Date & Title Greeting */}
          <div className="flex-1 min-w-0">
            {/* Date Pill & Status Badge Row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {/* Date Pill (Compact, lowercase design matching image) */}
              <div className="inline-flex items-center gap-1.5 bg-[#fbf6ef] border border-[#281b18]/10 rounded-full px-3 py-1 text-[#281b18] shadow-3xs">
                <Calendar size={13} className="text-[#823b28]" />
                <span className="font-mono text-xs font-black uppercase tracking-wide">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-3xs font-mono uppercase tracking-wider ${
                overdueTasks.length > 0 
                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {overdueTasks.length > 0 ? `⚠️ ${overdueTasks.length} Overdue` : '✨ Up to date'}
              </span>
            </div>

            {/* Header greeting (Capitalized "Good day, EHSAAN 🌿") */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black font-sans text-[#281b18] tracking-tight">
                Good day, {(userPreferences?.userName || 'EHSAAN').toUpperCase()}
              </h1>
              <span className="text-2xl sm:text-3xl text-[#823b28] shrink-0">🌿</span>
            </div>

            {/* Subtitle matching image description */}
            <p className="text-sm text-[#823b28]/85 font-medium leading-relaxed mt-1 max-w-lg">
              Small steps today, big progress tomorrow.
            </p>
          </div>

        </div>
      </div>

      {/* Redesigned Grid of Four Beautiful Stats Cards wrapped in a subtle translucent background card */}
      <div className="bg-[#fbf6ef]/40 backdrop-blur-sm border border-[#281b18]/8 rounded-3xl p-4 sm:p-5 shadow-3xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tasks Today */}
          <button
            onClick={() => {
              const el = document.getElementById('todays-action-items');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else onNavigateSection('tasks');
            }}
            className="bg-[#fbf6ef] hover:bg-[#f6e9d7]/50 border border-[#281b18]/15 rounded-3xl p-5 flex items-center justify-between shadow-3xs text-[#281b18] transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-4">
              {/* Soft Green Circle Container */}
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#823b28]/80">
                  Tasks Today
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-[#281b18] mt-0.5">
                  {todayTasks.length}
                </span>
                <span className="text-[10px] text-[#823b28]/70 font-bold mt-0.5">
                  {completedTodayTasks.length} completed &bull; {todayTasks.length - completedTodayTasks.length} pending
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#823b28]/50 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
          </button>

          {/* Card 2: Streak */}
          <button
            onClick={() => onNavigateSection('habits')}
            className="bg-[#fbf6ef] hover:bg-[#f6e9d7]/50 border border-[#281b18]/15 rounded-3xl p-5 flex items-center justify-between shadow-3xs text-[#281b18] transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-4">
              {/* Soft Orange Circle Container */}
              <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                <Flame size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#823b28]/80">
                  Streak
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-[#281b18] mt-0.5">
                  {habits.length > 0 ? Math.max(...habits.map(h => (h.completedDates || []).length), 276) : 276} days
                </span>
                <span className="text-[10px] text-[#823b28]/70 font-bold mt-0.5">
                  Keep going!
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#823b28]/50 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
          </button>

          {/* Card 3: Completion Rate */}
          <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 flex items-center justify-between shadow-3xs text-[#281b18] transition-all">
            <div className="flex items-center gap-4">
              {/* Soft Purple Circle Container */}
              <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                <Target size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#823b28]/80">
                    Completion Rate
                  </span>
                  <AnalyticInfoButton
                    explanation={{
                      ...ANALYTIC_EXPLANATIONS.dailyTaskCompletion,
                      currentValue: `${completionPercentage}% (${completedTodayTasks.length}/${todayTasks.length})`,
                    }}
                    variant="icon"
                    className="text-[#823b28]/60 hover:text-[#df734c]"
                  />
                </div>
                <span className="text-2xl font-black font-mono tracking-tight text-[#281b18] mt-0.5">
                  {completionPercentage}%
                </span>
                <span className="text-[10px] text-[#823b28]/70 font-bold mt-0.5">
                  {completedTodayTasks.length} of {todayTasks.length} completed
                </span>
              </div>
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0 ml-2">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle cx="16" cy="16" r="12" stroke="#edd8c2" strokeWidth="3.5" fill="transparent" />
                <circle
                  cx="16" cy="16" r="12" stroke="#df734c" strokeWidth="3.5" fill="transparent"
                  strokeDasharray={75} strokeDashoffset={75 - (75 * completionPercentage) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#823b28]">
                🌿
              </div>
            </div>
          </div>

          {/* Card 4: Focus */}
          <button
            onClick={() => onNavigateSection('insights')}
            className="bg-[#fbf6ef] hover:bg-[#f6e9d7]/50 border border-[#281b18]/15 rounded-3xl p-5 flex items-center justify-between shadow-3xs text-[#281b18] transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-4">
              {/* Soft Golden/Amber Circle Container */}
              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Star size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#823b28]/80">
                  Focus
                </span>
                <span className="text-2xl font-black font-sans tracking-tight text-[#281b18] mt-0.5">
                  High
                </span>
                <span className="text-[10px] text-[#823b28]/70 font-bold mt-0.5">
                  You're on track!
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#823b28]/50 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Tasks & Journal) + Right Column (Progress Meters & Quick Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Overdue Alert Banner if any */}
          {overdueTasks.length > 0 && (
            <div className="bg-[#df734c]/15 border border-[#df734c]/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#df734c] text-[#f6e9d7] rounded-xl">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#281b18] font-sans">
                    {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Carried Forward
                  </h4>
                  <p className="text-[11px] text-[#823b28] font-medium">
                    Review and reschedule or complete pending items.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateSection('tasks')}
                className="text-xs font-bold text-[#df734c] hover:underline cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>View Tasks</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Today's Tasks Header & List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                  TODAY'S ACTION ITEMS
                </span>
                <h3 className="text-xl font-extrabold text-[#281b18] font-sans">
                  Scheduled for Today
                </h3>
              </div>
              <button
                onClick={onOpenNewTaskModal}
                className="flex items-center gap-1.5 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border border-[#281b18]/15 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            {sortedTodayTasks.length === 0 ? (
              <div className="bg-[#fbf6ef] border border-dashed border-[#281b18]/20 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#edd8c2] flex items-center justify-center text-[#823b28] mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#281b18] font-sans">
                  No tasks scheduled for today
                </h4>
                <p className="text-xs text-[#823b28]/70 max-w-sm mt-1">
                  Enjoy your clear agenda or plan ahead by adding new high-leverage outcomes.
                </p>
                <button
                  onClick={onOpenNewTaskModal}
                  className="mt-4 bg-[#823b28] text-[#f6e9d7] px-4 py-2 rounded-2xl text-xs font-bold shadow-sm cursor-pointer hover:bg-[#6f2f1f]"
                >
                  Create Task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedTodayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    dateContext={todayStr}
                    onToggleTaskComplete={onToggleTaskComplete}
                    onToggleSubtaskComplete={onToggleSubtaskComplete}
                    onAddSubtask={onAddSubtask}
                    onDeleteTask={onDeleteTask}
                    onEditTask={onEditTask}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Today's Journal Reflection Card */}
          <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#edd8c2] text-[#823b28] rounded-xl">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                    DAILY REFLECTION
                  </span>
                  <h4 className="text-base font-extrabold text-[#281b18] font-sans">
                    Today's Journal Log
                  </h4>
                </div>
              </div>

              <button
                onClick={() => onOpenJournalModal(todayJournal, todayStr)}
                className="text-xs font-bold text-[#823b28] bg-[#edd8c2] hover:bg-[#e3c4a7] px-3 py-1.5 rounded-2xl transition-all cursor-pointer border border-[#281b18]/10"
              >
                {todayJournal ? 'Edit Entry' : 'Write Entry'}
              </button>
            </div>

            {todayJournal ? (
              <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-bold text-[#281b18]">{todayJournal.title}</h5>
                  <span className="text-lg">{todayJournal.moodEmoji}</span>
                </div>
                <p className="text-xs text-[#823b28] leading-relaxed line-clamp-3">
                  {todayJournal.content}
                </p>
                {todayJournal.tags && todayJournal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {todayJournal.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#f6e9d7]/60 border border-dashed border-[#281b18]/20 rounded-2xl p-5 text-center">
                <p className="text-xs text-[#823b28] font-medium">
                  Take a moment to record your thoughts, mood, and reflections for today.
                </p>
                <button
                  onClick={() => onOpenJournalModal(null, todayStr)}
                  className="mt-3 bg-[#823b28] text-[#f6e9d7] px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#6f2f1f]"
                >
                  Start Reflection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Habit Rituals & Progress Meters Quick Logger & Stats) */}
        <div className="flex flex-col gap-6">
          {/* Daily Habit Rituals Widget */}
          {habits.length > 0 && (
            <div className="bg-[#edd8c2]/60 border border-[#281b18]/15 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#823b28] text-[#f6e9d7] rounded-xl shadow-2xs">
                    <Flame size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                        DAILY RITUALS
                      </span>
                      <AnalyticInfoButton
                        explanation={ANALYTIC_EXPLANATIONS.habitCurrentStreak}
                        variant="badge"
                        buttonText="Streak Logic"
                      />
                    </div>
                    <h3 className="text-base font-extrabold text-[#281b18] font-sans">
                      Habits & Streaks
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateSection('habits')}
                  className="text-xs font-bold text-[#823b28] hover:underline cursor-pointer font-mono"
                >
                  View All
                </button>
              </div>

              {/* List of Habits with Quick Today Checkbox */}
              <div className="flex flex-col gap-2.5">
                {habits.slice(0, 5).map((habit) => {
                  const isCompletedToday = (habit.completedDates || []).includes(todayStr);
                  
                  return (
                    <div
                      key={habit.id}
                      className="bg-[#fbf6ef] border border-[#281b18]/10 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-[#823b28]/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => onToggleHabitDate && onToggleHabitDate(habit.id, todayStr)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                            isCompletedToday
                              ? 'bg-[#df734c] border-[#df734c] text-[#f6e9d7]'
                              : 'border-[#281b18]/30 bg-transparent hover:border-[#df734c]'
                          }`}
                        >
                          {isCompletedToday && <Check size={14} strokeWidth={3} />}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-extrabold text-[#281b18] uppercase truncate ${
                            isCompletedToday ? 'line-through opacity-70' : ''
                          }`}>
                            {habit.name} {habit.emoji}
                          </span>
                          {habit.description && (
                            <span className="text-[10px] text-[#823b28]/80 truncate">
                              {habit.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-[#df734c] bg-[#df734c]/10 px-2 py-0.5 rounded-full shrink-0">
                        {habit.category || 'Habit'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Meters Quick Logger Widget */}
          <div className="bg-[#edd8c2]/60 border border-[#281b18]/15 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#823b28] text-[#f6e9d7] rounded-xl">
                  <Activity size={18} />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                    DAILY METRICS
                  </span>
                  <h3 className="text-base font-extrabold text-[#281b18] font-sans">
                    Log Progress Meters
                  </h3>
                </div>
              </div>

              <button
                onClick={() => onNavigateSection('progress')}
                className="text-xs font-bold text-[#823b28] hover:underline cursor-pointer font-mono"
              >
                View Graphs
              </button>
            </div>

            {/* List of Progress Meters with Inline Loggers */}
            <div className="flex flex-col gap-3">
              {progressMeters.map((meter) => {
                const currentValue = meter.entries[todayStr] ?? 0;

                return (
                  <div
                    key={meter.id}
                    className="bg-[#fbf6ef] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meter.emojiIcon}</span>
                        <span className="text-xs font-bold text-[#281b18]">
                          {meter.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-[#823b28] bg-[#edd8c2] px-2 py-0.5 rounded-lg">
                        {currentValue > 0
                          ? meter.unitType === 'scale_1_5'
                            ? `${currentValue}/5`
                            : meter.unitType === 'percentage'
                            ? `${currentValue}%`
                            : meter.unitType === 'time'
                            ? `${Math.floor(currentValue / 60)}h ${currentValue % 60}m`
                            : `${currentValue}`
                          : 'Not logged'}
                      </span>
                    </div>

                    {/* Quick Input Controls based on Measurement Type */}
                    {meter.unitType === 'scale_1_5' && (
                      <div className="flex items-center justify-between gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => onUpdateMeterValue(meter.id, todayStr, val)}
                            className={`flex-1 py-1 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                              currentValue === val
                                ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18]'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}

                    {meter.unitType === 'percentage' && (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={currentValue}
                          onChange={(e) => onUpdateMeterValue(meter.id, todayStr, parseInt(e.target.value, 10))}
                          className="flex-1 accent-[#823b28] cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-[#823b28] w-10 text-right">
                          {currentValue}%
                        </span>
                      </div>
                    )}

                    {meter.unitType === 'time' && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[30, 60, 120, 180].map((mins) => (
                            <button
                              key={mins}
                              onClick={() => onUpdateMeterValue(meter.id, todayStr, mins)}
                              className={`px-2 py-1 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer ${
                                currentValue === mins
                                  ? 'bg-[#823b28] text-[#f6e9d7]'
                                  : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18]'
                              }`}
                            >
                              {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                            </button>
                          ))}
                        </div>

                        {/* Custom Hour / Minute Input Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const input = form.elements.namedItem(`custom-hr-${meter.id}`) as HTMLInputElement;
                            if (input && input.value) {
                              const hrs = parseFloat(input.value);
                              if (!isNaN(hrs) && hrs >= 0) {
                                onUpdateMeterValue(meter.id, todayStr, Math.round(hrs * 60));
                                input.value = '';
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 pt-0.5"
                        >
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            name={`custom-hr-${meter.id}`}
                            placeholder="Custom hrs (e.g. 2.5)"
                            className="flex-1 bg-[#f6e9d7] border border-[#281b18]/20 rounded-xl px-2.5 py-1 text-[11px] font-mono text-[#281b18] outline-none focus:border-[#823b28]"
                          />
                          <button
                            type="submit"
                            className="bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer font-mono"
                          >
                            Set
                          </button>
                        </form>
                      </div>
                    )}

                    {meter.unitType === 'numeric' && (
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <button
                          onClick={() => onUpdateMeterValue(meter.id, todayStr, Math.max(0, currentValue - 1))}
                          className="w-7 h-7 rounded-xl bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#823b28] font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-[#281b18]">
                          {currentValue} {meter.unitLabel || 'units'}
                        </span>
                        <button
                          onClick={() => onUpdateMeterValue(meter.id, todayStr, currentValue + 1)}
                          className="w-7 h-7 rounded-xl bg-[#823b28] text-[#f6e9d7] font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};
