import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Check,
  CheckCircle2,
  Calendar as CalendarIcon,
  ListFilter,
  Layers,
  ChevronDown,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight,
  ListTree,
} from 'lucide-react';
import { AppData, Priority, Subtask, Task } from '../types';
import {
  formatDisplayDate,
  getMonthDays,
  getTodayKey,
} from '../utils/dateUtils';
import { getCalendarChipStyle, getTaskCardClasses, PRIORITY_CONFIG } from '../utils/colorUtils';

interface CalendarViewProps {
  data: AppData;
  todayStr: string;
  onSelectDate: (dateStr: string) => void;
  onAddTaskForDate: (dateStr: string) => void;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  data,
  todayStr,
  onSelectDate,
  onAddTaskForDate,
  onToggleTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteTask,
  onEditTask,
}) => {
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});
  const [expandedSubtaskTaskId, setExpandedSubtaskTaskId] = useState<string | null>(null);

  const weekStartsOn = data.settings.weekStartsOn ?? 1;

  // Month navigation
  const prevMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentYearMonth({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDate(todayStr);
  };

  // Calendar days grid
  const calendarDays = getMonthDays(
    currentYearMonth.year,
    currentYearMonth.month,
    weekStartsOn
  );

  // Group tasks by dueDate
  const tasksByDate = new Map<string, Task[]>();
  data.tasks.forEach((t) => {
    if (!t.dueDate) return;
    const list = tasksByDate.get(t.dueDate) || [];
    list.push(t);
    tasksByDate.set(t.dueDate, list);
  });

  const categoryMap = new Map(data.categories.map((c) => [c.id, c]));

  const monthTitle = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYearMonth.year, currentYearMonth.month, 1));

  // Day header labels
  const dayNames =
    weekStartsOn === 1
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Tasks for currently selected day
  const selectedDateTasks = tasksByDate.get(selectedDate) || [];
  const selectedDateCompletedCount = selectedDateTasks.filter((t) => t.completed).length;

  // Expressive task chips styling with priority colors and high-contrast deep black text
  const getTaskChipStyle = (task: Task) => {
    return getCalendarChipStyle(task, categoryMap);
  };

  const handleInlineAddSubtask = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = (newSubtaskInputs[taskId] || '').trim();
    if (!title) return;
    onAddSubtask(taskId, title);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Material Expressive Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        {/* Title & Today Button */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-md">
            <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {monthTitle}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Material Expressive Task Schedule
            </p>
          </div>
        </div>

        {/* Expressive Navigation & Segmented View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Today Button - Material Tonal Pill */}
          <button
            onClick={jumpToToday}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-all shadow-xs"
          >
            Today
          </button>

          {/* Month Steppers - Expressive Circle Controls */}
          <div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented View Mode (Grid vs Agenda) */}
          <div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-xs font-medium">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Material Expressive FAB Button */}
          <button
            onClick={() => onAddTaskForDate(selectedDate)}
            className="px-4 py-2 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main Material Expressive Layout */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Month Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            {/* Weekday Column Headers with Material Expressive Styling */}
            <div className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 text-center py-3">
              {dayNames.map((name, i) => (
                <div
                  key={name}
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    (weekStartsOn === 1 && (i === 5 || i === 6)) || (weekStartsOn === 0 && (i === 0 || i === 6))
                      ? 'text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar Cells with Expressive Rounded Hover & Tonal Chips */}
            <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {calendarDays.map((cell) => {
                const dateStr = cell.dateStr;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const tasksOnDate = tasksByDate.get(dateStr) || [];
                const completedCount = tasksOnDate.filter((t) => t.completed).length;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[92px] sm:min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-all duration-150 group relative ${
                      cell.isCurrentMonth
                        ? 'bg-white dark:bg-neutral-900 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40'
                        : 'bg-neutral-50/30 dark:bg-neutral-950/30 text-neutral-300 dark:text-neutral-700'
                    } ${
                      isSelected
                        ? 'ring-2 ring-inset ring-neutral-900 dark:ring-white bg-neutral-50/90 dark:bg-neutral-800/60'
                        : ''
                    }`}
                  >
                    {/* Top Row: Date Pill & Quick Add Icon */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full transition-transform ${
                          isToday
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs'
                            : isSelected
                            ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold'
                            : cell.isCurrentMonth
                            ? 'text-neutral-800 dark:text-neutral-200 group-hover:scale-105'
                            : 'text-neutral-400 dark:text-neutral-600'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Add task quick button appears on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTaskForDate(dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-opacity"
                        title={`Add task for ${dateStr}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle: Priority & Category Styled Event Chips */}
                    <div className="space-y-1 my-1">
                      {tasksOnDate.slice(0, 2).map((t) => {
                        const subtasks = t.subtasks || [];
                        const subCompleted = subtasks.filter((s) => s.completed).length;
                        const priorityConf = PRIORITY_CONFIG[t.priority || 'medium'];

                        return (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(dateStr);
                              setExpandedSubtaskTaskId(t.id);
                            }}
                            className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold flex items-center justify-between gap-1 shadow-2xs truncate transition-all ${getTaskChipStyle(
                              t
                            )}`}
                            style={!t.completed ? { color: '#0a0a0a' } : undefined}
                          >
                            <div className="flex items-center gap-1 min-w-0 truncate">
                              {!t.completed && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: priorityConf.hex }}
                                  title={`Priority: ${t.priority}`}
                                />
                              )}
                              <span className="truncate">{t.title}</span>
                            </div>

                            {/* Subtask micro count */}
                            {subtasks.length > 0 && (
                              <span className="text-[9px] font-bold opacity-80 shrink-0">
                                {subCompleted}/{subtasks.length}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {tasksOnDate.length > 2 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 block text-center">
                          +{tasksOnDate.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Bottom Status Row */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      {tasksOnDate.length > 0 ? (
                        <span className="font-mono">
                          {completedCount}/{tasksOnDate.length}
                        </span>
                      ) : (
                        <span />
                      )}

                      {tasksOnDate.some((t) => t.priority === 'urgent' && !t.completed) && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Material Expressive Selected Day Inspector Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm p-5 space-y-4">
              {/* Day Header */}
              <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Day Schedule
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatDisplayDate(selectedDate, 'full')}
                  </h3>
                  {selectedDate === todayStr && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 mt-1">
                      Today
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAddTaskForDate(selectedDate)}
                  className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                  title="Add task for this day"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar for selected day */}
              {selectedDateTasks.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Progress</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {selectedDateCompletedCount} of {selectedDateTasks.length} tasks (
                      {Math.round((selectedDateCompletedCount / selectedDateTasks.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                      style={{
                        width: `${(selectedDateCompletedCount / selectedDateTasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tasks List for Selected Day with Interactive Subtasks */}
              <div className="space-y-3">
                {selectedDateTasks.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-neutral-50/60 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800">
                    <CheckCircle2 className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      No tasks scheduled for this day
                    </p>
                    <button
                      onClick={() => onAddTaskForDate(selectedDate)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Task</span>
                    </button>
                  </div>
                ) : (
                  selectedDateTasks.map((task) => {
                    const subtasks = task.subtasks || [];
                    const completedSubtasks = subtasks.filter((s) => s.completed).length;
                    const isSubtasksExpanded = expandedSubtaskTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all ${getTaskCardClasses(
                          task,
                          categoryMap
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                                task.completed
                                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                  : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                              }`}
                            >
                              {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-xs font-semibold block ${
                                  task.completed
                                    ? 'text-neutral-400 line-through'
                                    : 'text-neutral-900 dark:text-white'
                                }`}
                              >
                                {task.title}
                              </span>

                              {task.dueTime && (
                                <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {task.dueTime}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-neutral-400 hover:text-rose-500"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtasks Collapsible Trigger */}
                        <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSubtaskTaskId(
                                isSubtasksExpanded ? null : task.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          >
                            <ListTree className="w-3.5 h-3.5" />
                            <span>
                              {subtasks.length === 0
                                ? '+ Add sub-task'
                                : `${completedSubtasks}/${subtasks.length} sub-tasks`}
                            </span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                isSubtasksExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Expanded Subtasks Checklist + Inline Adder */}
                        {isSubtasksExpanded && (
                          <div className="mt-2 pl-2 border-l-2 border-neutral-200 dark:border-neutral-700 space-y-1.5">
                            {subtasks.map((sub) => (
                              <div
                                key={sub.id}
                                onClick={() => onToggleSubtask(task.id, sub.id)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-xs"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                                    sub.completed
                                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                      : 'border border-neutral-300 dark:border-neutral-600'
                                  }`}
                                >
                                  {sub.completed && <Check className="w-2 h-2 stroke-[3]" />}
                                </div>
                                <span
                                  className={`flex-1 ${
                                    sub.completed
                                      ? 'text-neutral-400 line-through'
                                      : 'text-neutral-800 dark:text-neutral-200'
                                  }`}
                                >
                                  {sub.title}
                                </span>
                              </div>
                            ))}

                            {/* Inline input to add subtask */}
                            <form
                              onSubmit={(e) => handleInlineAddSubtask(task.id, e)}
                              className="flex items-center gap-1.5 pt-1"
                            >
                              <input
                                type="text"
                                placeholder="Add sub-task... (Press Enter)"
                                value={newSubtaskInputs[task.id] || ''}
                                onChange={(e) =>
                                  setNewSubtaskInputs((prev) => ({
                                    ...prev,
                                    [task.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                              />
                              <button
                                type="submit"
                                disabled={!(newSubtaskInputs[task.id] || '').trim()}
                                className="px-2.5 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[11px] font-semibold disabled:opacity-30"
                              >
                                Add
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Agenda View - Material Expressive Timeline */
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Monthly Agenda Overview
              </h3>
              <p className="text-xs text-neutral-500">
                Chronological list of all scheduled tasks in {monthTitle}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {calendarDays
              .filter((c) => c.isCurrentMonth && (tasksByDate.get(c.dateStr) || []).length > 0)
              .map((cell) => {
                const tasks = tasksByDate.get(cell.dateStr) || [];
                const isToday = cell.dateStr === todayStr;

                return (
                  <div key={cell.dateStr} className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Date badge */}
                    <div className="sm:w-36 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isToday
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {formatDisplayDate(cell.dateStr, 'short')}
                      </span>
                    </div>

                    {/* Tasks for date */}
                    <div className="flex-1 w-full space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${getTaskCardClasses(
                            task,
                            categoryMap
                          )}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className={`w-4 h-4 rounded flex items-center justify-center ${
                                task.completed
                                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                  : 'border border-neutral-300 dark:border-neutral-600'
                              }`}
                            >
                              {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>
                            <span
                              className={`text-xs font-medium ${
                                task.completed ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="text-[10px] text-neutral-400">
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} sub-tasks
                              </span>
                            )}
                            <button
                              onClick={() => onEditTask(task)}
                              className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white p-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
