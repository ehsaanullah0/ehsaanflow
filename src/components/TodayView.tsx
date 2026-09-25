import React from 'react';
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
  FolderCheck
} from 'lucide-react';
import { Task, JournalEntry, ProgressMeter, NavSection, Habit } from '../types';
import { formatDateStr } from '../utils/habitUtils';
import { TaskCard } from './TaskCard';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface TodayViewProps {
  tasks: Task[];
  habits?: Habit[];
  journalEntries: JournalEntry[];
  progressMeters: ProgressMeter[];
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
  theme?: 'original';
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  habits = [],
  journalEntries,
  progressMeters,
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
      {/* Top Hero Command Banner */}
      <div className={`relative rounded-3xl p-6 sm:p-8 shadow-xl border overflow-hidden transition-all ${
        isOlive 
          ? 'bg-[#9ba87c] text-[#f4f1e8] border-[#879667]' 
          : 'bg-[#281b18] text-[#f6e9d7] border-[#422119]'
      }`}>
        {/* Decorative background and warm landscape illustration */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-[#823b28]/25 rounded-full blur-3xl" />
          <svg className="absolute right-0 bottom-0 w-1/2 h-full opacity-40 object-cover hidden md:block" viewBox="0 0 500 300" fill="none" preserveAspectRatio="none">
            <path d="M0 300V200C100 180 200 220 300 150C400 80 450 120 500 100V300H0Z" fill="#df734c" fillOpacity="0.25"/>
            <path d="M0 300V240C120 220 250 260 380 180C440 140 470 160 500 150V300H0Z" fill="#823b28" fillOpacity="0.4"/>
            <circle cx="380" cy="90" r="45" fill="#f6e9d7" fillOpacity="0.2"/>
            <path d="M340 300V180C340 140 370 120 410 120C450 120 480 140 480 180V300" fill="#281b18" fillOpacity="0.3"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          {/* Left Content Area */}
          <div className="max-w-lg flex-1">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border bg-[#422119]/80 border-[#823b28]/50 text-[#df734c] font-mono text-[10px] font-extrabold uppercase tracking-widest shadow-2xs">
              <Sparkles size={12} />
              <span>TODAY'S FOCUS</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight text-[#f6e9d7] leading-tight">
              Progress, not perfection.
            </h2>
            
            <p className="text-xs sm:text-sm mt-2 font-medium leading-relaxed text-[#eb9d7d]">
              {overdueTasks.length > 0 ? (
                <>You're <span className="font-bold bg-[#df734c]/20 text-[#f6e9d7] px-2 py-0.5 rounded-md border border-[#df734c]/40">{overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''}</span> behind schedule. Let's get back on track and make today count!</>
              ) : (
                <>You're on top of your schedule. Keep the momentum going with high-leverage outcomes!</>
              )}
            </p>

            <div className="mt-6">
              <button
                onClick={() => {
                  const el = document.getElementById('todays-action-items');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else onNavigateSection('tasks');
                }}
                className="inline-flex items-center gap-2 bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#281b18] px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer border border-[#281b18]/20 active:scale-95"
              >
                <span>View Today's Tasks</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Cards Container (Completion Rate + Streak) */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 shrink-0">
            {/* Completion Rate Card */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 flex items-center justify-between gap-6 w-full sm:w-[260px] shadow-lg text-[#281b18]">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-extrabold text-[#823b28]">
                    COMPLETION RATE
                  </span>
                  <AnalyticInfoButton
                    explanation={{
                      ...ANALYTIC_EXPLANATIONS.dailyTaskCompletion,
                      currentValue: `${completionPercentage}% (${completedTodayTasks.length}/${todayTasks.length})`,
                    }}
                    variant="icon"
                    className="text-[#823b28] hover:text-[#df734c]"
                  />
                </div>
                <span className="text-3xl font-black font-mono tracking-tight text-[#281b18]">
                  {completionPercentage}%
                </span>
                <span className="text-[11px] text-[#823b28]/80 font-medium mt-1">
                  {completedTodayTasks.length} of {todayTasks.length} completed
                </span>
              </div>

              {/* Circular Progress Meter */}
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="#edd8c2"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="#df734c"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={138}
                    strokeDashoffset={138 - (138 * completionPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[#823b28]">
                  🌿
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 flex flex-col justify-between w-full sm:w-[200px] shadow-lg text-[#281b18]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#df734c]/15 text-[#df734c] flex items-center justify-center font-bold">
                  <Flame size={16} />
                </div>
                <span className="font-mono text-[10px] uppercase font-black tracking-wider text-[#823b28]">
                  STREAK
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#281b18]">
                  {habits.length > 0 ? Math.max(...habits.map(h => (h.completedDates || []).length), 4) : 4} days
                </span>
                <p className="text-[11px] text-[#823b28]/80 font-medium mt-0.5">
                  Keep going!
                </p>
              </div>
            </div>
          </div>
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
                              ? 'bg-[#823b28] border-[#823b28] text-[#f6e9d7]'
                              : 'border-[#281b18]/30 bg-transparent hover:border-[#823b28]'
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

          {/* Useful Daily Quote / Principle Card */}
          <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] font-bold uppercase text-[#df734c]">
              <Sparkles size={12} />
              <span>PRINCIPLE OF THE DAY</span>
            </div>
            <p className="text-xs font-medium text-[#281b18] leading-relaxed italic">
              "Action precedes motivation. Break down intimidating goals into tiny 5-minute subtasks to build instant momentum."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
