import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Flag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Layers,
  LayoutGrid,
  ListTodo,
  Columns,
  ListTree,
  Tag,
} from 'lucide-react';
import { AppData, Task } from '../types';
import {
  addDays,
  formatDisplayDate,
  getTodayKey,
  getWeekDays,
} from '../utils/dateUtils';
import { getTaskCardClasses, PRIORITY_CONFIG } from '../utils/colorUtils';

interface WeeklyViewProps {
  data: AppData;
  todayStr: string;
  onToggleTask: (taskId: string) => void;
  onSelectDate: (dateStr: string) => void;
  onAddTaskForDate: (dateStr: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onMoveTaskDate?: (taskId: string, newDateStr: string) => void;
}

type WeeklyLayout = 'spacious' | 'focus' | 'matrix';

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  data,
  todayStr,
  onToggleTask,
  onSelectDate,
  onAddTaskForDate,
  onDeleteTask,
  onEditTask,
  onMoveTaskDate,
}) => {
  const weekStartsOn = data.settings.weekStartsOn ?? 1;
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeFocusDayIndex, setActiveFocusDayIndex] = useState(() => {
    const today = getTodayKey();
    const days = getWeekDays(today, weekStartsOn);
    const idx = days.indexOf(today);
    return idx >= 0 ? idx : 0;
  });
  const [layoutMode, setLayoutMode] = useState<WeeklyLayout>('spacious');

  // Compute anchor date based on weekOffset
  const anchorDateStr = addDays(todayStr, weekOffset * 7);
  const weekDays = getWeekDays(anchorDateStr, weekStartsOn);

  const prevWeek = () => setWeekOffset((prev) => prev - 1);
  const nextWeek = () => setWeekOffset((prev) => prev + 1);
  const jumpToCurrentWeek = () => {
    setWeekOffset(0);
    const todayIndex = weekDays.indexOf(todayStr);
    if (todayIndex !== -1) setActiveFocusDayIndex(todayIndex);
  };

  const startDate = weekDays[0];
  const endDate = weekDays[6];

  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>();
  data.tasks.forEach((t) => {
    if (!t.dueDate) return;
    const list = tasksByDate.get(t.dueDate) || [];
    list.push(t);
    tasksByDate.set(t.dueDate, list);
  });

  // Calculate weekly statistics
  let weeklyTotal = 0;
  let weeklyCompleted = 0;
  let urgentCount = 0;
  let highCount = 0;

  weekDays.forEach((d) => {
    const list = tasksByDate.get(d) || [];
    weeklyTotal += list.length;
    weeklyCompleted += list.filter((t) => t.completed).length;
    urgentCount += list.filter((t) => t.priority === 'urgent' && !t.completed).length;
    highCount += list.filter((t) => t.priority === 'high' && !t.completed).length;
  });

  const weeklyPercent = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
  const categoryMap = new Map(data.categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                Weekly Schedule & Planner
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                {formatDisplayDate(startDate, 'short')} – {formatDisplayDate(endDate, 'short')} • {weeklyCompleted}/{weeklyTotal} completed ({weeklyPercent}%)
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Layout Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLayoutMode('spacious')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                layoutMode === 'spacious'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Expanded multi-column grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expanded Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('focus')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                layoutMode === 'focus'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Day-by-day focus view"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Day Focus</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('matrix')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                layoutMode === 'matrix'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="7-Day horizontal board"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">7-Day Strip</span>
            </button>
          </div>

          {weekOffset !== 0 && (
            <button
              onClick={jumpToCurrentWeek}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white transition-all shadow-2xs"
            >
              This Week
            </button>
          )}

          {/* Week Prev / Next Navigation */}
          <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 p-1">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              title="Previous Week"
              aria-label="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2.5 text-neutral-950 dark:text-white min-w-[90px] text-center">
              {weekOffset === 0 ? 'Current Week' : `${weekOffset > 0 ? '+' : ''}${weekOffset} Wk`}
            </span>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              title="Next Week"
              aria-label="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Day Quick Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {weekDays.map((dateStr, idx) => {
          const isToday = dateStr === todayStr;
          const isSelected = activeFocusDayIndex === idx;
          const count = (tasksByDate.get(dateStr) || []).length;
          const completedDayCount = (tasksByDate.get(dateStr) || []).filter((t) => t.completed).length;
          const dateObj = new Date(dateStr + 'T00:00:00');
          const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);
          const dayNum = dateObj.getDate();

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                setActiveFocusDayIndex(idx);
                if (layoutMode === 'matrix') {
                  const el = document.getElementById(`weekly-day-${dateStr}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
              }}
              className={`flex-1 min-w-[76px] sm:min-w-[96px] py-2.5 px-2 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-bold uppercase">{dayName}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-amber-400' : 'bg-neutral-950 dark:bg-white'
                    }`}
                  />
                )}
              </div>
              <span className="text-base sm:text-lg font-black block leading-tight mt-0.5">{dayNum}</span>
              <span className="text-[10px] font-bold opacity-75 block mt-0.5">
                {completedDayCount}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: Spacious Multi-Column Grid (Expanded, comfortable 2-4 columns per row) */}
      {layoutMode === 'spacious' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {weekDays.map((dateStr) => {
            const isToday = dateStr === todayStr;
            const tasks = tasksByDate.get(dateStr) || [];
            const completedCount = tasks.filter((t) => t.completed).length;
            const dayPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateObj);
            const dayNumber = dateObj.getDate();

            return (
              <div
                key={dateStr}
                id={`weekly-day-${dateStr}`}
                className={`rounded-3xl border flex flex-col min-h-[440px] transition-all bg-white dark:bg-neutral-900 shadow-xs ${
                  isToday
                    ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900/10 dark:ring-white/20'
                    : 'border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                {/* Day Header Box */}
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 rounded-t-3xl bg-neutral-50/50 dark:bg-neutral-800/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                          {dayName}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight mt-0.5 block">
                        {formatDisplayDate(dateStr, 'short')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectDate(dateStr)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                        title="Open Day Inspector"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddTaskForDate(dateStr)}
                        className="p-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 transition-opacity"
                        title="Add task for this day"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 font-bold">
                    <span>
                      {completedCount} of {tasks.length} completed
                    </span>
                    <span>{dayPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200/70 dark:bg-neutral-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto max-h-[500px]">
                  {tasks.map((task) => {
                    const priorityConf = PRIORITY_CONFIG[task.priority || 'medium'];
                    const subtasks = task.subtasks || [];
                    const subCompleted = subtasks.filter((s) => s.completed).length;
                    const category = task.category ? categoryMap.get(task.category) : undefined;

                    return (
                      <div
                        key={task.id}
                        className={`group p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${getTaskCardClasses(
                          task,
                          categoryMap
                        )} ${task.completed ? 'opacity-70' : 'shadow-2xs hover:shadow-xs'}`}
                      >
                        {/* Top row: Checkbox, Title & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className={`mt-0.5 w-4.5 h-4.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                                  : 'border-2 border-neutral-400 hover:border-neutral-900 bg-white dark:bg-neutral-800'
                              }`}
                              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <span
                                className={`font-bold text-xs sm:text-sm block leading-snug break-words ${
                                  task.completed ? 'line-through opacity-70' : ''
                                }`}
                                style={!task.completed ? { color: '#0a0a0a' } : undefined}
                              >
                                {task.title}
                              </span>

                              {task.notes && (
                                <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1">
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick action buttons (Pencil Edit & Delete) */}
                          <div className="flex items-center gap-1 shrink-0">
                            {onEditTask && (
                              <button
                                type="button"
                                onClick={() => onEditTask(task)}
                                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                title="Edit task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Info Strip: Time, Priority, Category, Subtasks, Move Day */}
                        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10 text-[11px] flex-wrap gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Priority Flag */}
                            <span
                              className="inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md text-[10px]"
                              style={{
                                backgroundColor: `${priorityConf.hex}18`,
                                color: '#0a0a0a',
                              }}
                            >
                              <Flag className="w-2.5 h-2.5" style={{ fill: priorityConf.hex, stroke: priorityConf.hex }} />
                              <span className="capitalize">{task.priority}</span>
                            </span>

                            {/* Time badge */}
                            {task.dueTime && (
                              <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1 text-[10px]">
                                <Clock className="w-2.5 h-2.5" />
                                {task.dueTime}
                              </span>
                            )}

                            {/* Subtask count */}
                            {subtasks.length > 0 && (
                              <span className="font-bold text-[10px] text-neutral-600 dark:text-neutral-400 flex items-center gap-0.5 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                <ListTree className="w-2.5 h-2.5" />
                                {subCompleted}/{subtasks.length}
                              </span>
                            )}
                          </div>

                          {/* Move day arrows (Quick schedule) */}
                          {onMoveTaskDate && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onMoveTaskDate(task.id, addDays(dateStr, -1))}
                                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-neutral-600 dark:text-neutral-300 transition-colors"
                                title="Move to previous day"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onMoveTaskDate(task.id, addDays(dateStr, 1))}
                                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-neutral-600 dark:text-neutral-300 transition-colors"
                                title="Move to next day"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <div className="py-8 flex flex-col items-center justify-center p-4 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                      <span className="text-xs font-bold text-neutral-400">No scheduled tasks</span>
                      <button
                        onClick={() => onAddTaskForDate(dateStr)}
                        className="mt-2 text-xs font-bold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Schedule task</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Add Action */}
                <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => onAddTaskForDate(dateStr)}
                    className="w-full py-2 text-xs font-bold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: Day Focus (Rich detailed active day + adjacent previews) */}
      {layoutMode === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Focused Day (8 cols) */}
          {(() => {
            const activeDateStr = weekDays[activeFocusDayIndex] || todayStr;
            const isToday = activeDateStr === todayStr;
            const tasks = tasksByDate.get(activeDateStr) || [];
            const completedCount = tasks.filter((t) => t.completed).length;
            const dayPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

            return (
              <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Focused Day Plan
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                          Today
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight mt-1">
                      {formatDisplayDate(activeDateStr, 'full')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectDate(activeDateStr)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Day Inspector
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddTaskForDate(activeDateStr)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                    <span>Daily Completion</span>
                    <span>
                      {completedCount} of {tasks.length} tasks ({dayPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>

                {/* Task Cards in Focused Day */}
                <div className="space-y-3 pt-2">
                  {tasks.map((task) => {
                    const priorityConf = PRIORITY_CONFIG[task.priority || 'medium'];
                    const subtasks = task.subtasks || [];
                    const subCompleted = subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${getTaskCardClasses(
                          task,
                          categoryMap
                        )} ${task.completed ? 'opacity-70' : 'shadow-2xs'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                                  : 'border-2 border-neutral-400 hover:border-neutral-900 bg-white dark:bg-neutral-800'
                              }`}
                            >
                              {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <span
                                className={`font-bold text-sm sm:text-base block leading-snug break-words ${
                                  task.completed ? 'line-through opacity-70' : ''
                                }`}
                                style={!task.completed ? { color: '#0a0a0a' } : undefined}
                              >
                                {task.title}
                              </span>

                              {task.notes && (
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {onEditTask && (
                              <button
                                type="button"
                                onClick={() => onEditTask(task)}
                                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                title="Edit task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card meta */}
                        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10 text-xs flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-xs"
                              style={{
                                backgroundColor: `${priorityConf.hex}18`,
                                color: '#0a0a0a',
                              }}
                            >
                              <Flag className="w-3 h-3" style={{ fill: priorityConf.hex, stroke: priorityConf.hex }} />
                              <span className="capitalize">{task.priority}</span>
                            </span>

                            {task.dueTime && (
                              <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.dueTime}
                              </span>
                            )}

                            {subtasks.length > 0 && (
                              <span className="font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                                <ListTree className="w-3 h-3" />
                                {subCompleted}/{subtasks.length} subtasks
                              </span>
                            )}
                          </div>

                          {onMoveTaskDate && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onMoveTaskDate(task.id, addDays(activeDateStr, -1))}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Prev Day</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onMoveTaskDate(task.id, addDays(activeDateStr, 1))}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                              >
                                <span>Next Day</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center p-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
                      <CheckCircle2 className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                        No tasks scheduled for {formatDisplayDate(activeDateStr, 'short')}
                      </p>
                      <button
                        onClick={() => onAddTaskForDate(activeDateStr)}
                        className="mt-3 px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
                      >
                        + Schedule Task Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Adjacent Days Mini-Column List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Rest of the Week
            </h4>
            {weekDays.map((dateStr, idx) => {
              if (idx === activeFocusDayIndex) return null;
              const isToday = dateStr === todayStr;
              const tasks = tasksByDate.get(dateStr) || [];
              const completedCount = tasks.filter((t) => t.completed).length;
              const dateObj = new Date(dateStr + 'T00:00:00');
              const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);

              return (
                <div
                  key={dateStr}
                  onClick={() => setActiveFocusDayIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs ${
                    isToday ? 'border-neutral-900 dark:border-white' : 'border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase">
                        {dayName}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {formatDisplayDate(dateStr, 'short')}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                          Today
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-neutral-500">
                      {completedCount}/{tasks.length} tasks
                    </span>
                  </div>

                  {tasks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {tasks.slice(0, 2).map((t) => (
                        <p
                          key={t.id}
                          className={`text-xs truncate ${
                            t.completed ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          • {t.title}
                        </p>
                      ))}
                      {tasks.length > 2 && (
                        <span className="text-[10px] font-bold text-neutral-400 block">
                          +{tasks.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: 7-Day Horizontal Scroll Strip (Expanded min-width 280px per column) */}
      {layoutMode === 'matrix' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
          {weekDays.map((dateStr) => {
            const isToday = dateStr === todayStr;
            const tasks = tasksByDate.get(dateStr) || [];
            const completedCount = tasks.filter((t) => t.completed).length;
            const dayPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);
            const dayNumber = dateObj.getDate();

            return (
              <div
                key={dateStr}
                id={`weekly-day-${dateStr}`}
                className={`w-72 sm:w-80 shrink-0 rounded-3xl border flex flex-col min-h-[460px] transition-all bg-white dark:bg-neutral-900 shadow-xs ${
                  isToday
                    ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900/10'
                    : 'border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 rounded-t-3xl bg-neutral-50/50 dark:bg-neutral-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                        {dayName}
                      </span>
                      <span className="text-xl font-bold text-neutral-950 dark:text-white">
                        {dayNumber} {dateObj.toLocaleString('en-US', { month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                          Today
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onAddTaskForDate(dateStr)}
                        className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-bold">
                    <span>
                      {completedCount}/{tasks.length} done
                    </span>
                    <span>{dayPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[460px]">
                  {tasks.map((task) => {
                    const priorityConf = PRIORITY_CONFIG[task.priority || 'medium'];

                    return (
                      <div
                        key={task.id}
                        className={`group p-3 rounded-2xl border text-xs transition-all flex flex-col justify-between gap-1.5 ${getTaskCardClasses(
                          task,
                          categoryMap
                        )} ${task.completed ? 'opacity-65 line-through' : 'shadow-2xs'}`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                                  : 'border border-neutral-400 hover:border-neutral-900 bg-white dark:bg-neutral-800'
                              }`}
                            >
                              {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <span
                                className="font-bold block truncate"
                                style={!task.completed ? { color: '#0a0a0a' } : undefined}
                              >
                                {task.title}
                              </span>

                              {task.dueTime && (
                                <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {task.dueTime}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEditTask && (
                              <button
                                type="button"
                                onClick={() => onEditTask(task)}
                                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-neutral-500 hover:text-rose-500 rounded-md"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center p-3 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                      <span className="text-[11px] font-bold text-neutral-400">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
