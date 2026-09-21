import React, { useState } from 'react';
import {
  Check,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  ListTodo,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ListTree,
  X,
  Star,
} from 'lucide-react';
import { ActiveTab, AppData, Priority, Subtask, Task } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { COLOR_OPTIONS, getTaskCardClasses, getTaskColorOption, PRIORITY_CONFIG } from '../utils/colorUtils';
import { parseNaturalLanguageTask } from '../utils/nlpParser';

interface TodayDashboardProps {
  data: AppData;
  todayStr: string;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onOpenQuickAdd: (defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
  onTogglePin?: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onRescheduleTask: (taskId: string, newDate: string) => void;
  onQuickCreateTask: (
    title: string,
    priority: Priority,
    categoryId?: string,
    dueDate?: string,
    dueTime?: string,
    tags?: string[]
  ) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  data,
  todayStr,
  onToggleTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onEditSubtask,
  onOpenQuickAdd,
  onEditTask,
  onSelectTask,
  onTogglePin,
  onDeleteTask,
  onRescheduleTask,
  onQuickCreateTask,
  onNavigateTab,
}) => {
  // Inline quick-add state
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<Priority>('medium');
  const [inlineCategory, setInlineCategory] = useState('');

  // Expandable subtasks for today's tasks
  const [expandedSubtasksTaskId, setExpandedSubtasksTaskId] = useState<string | null>(null);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');

  // Priority badge styling
  const priorityBadgeStyle: Record<Priority, string> = {
    urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    high: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
  };

  // Today's tasks (due today) sorted with pinned first
  const todayTasks = [...data.tasks.filter((t) => t.dueDate === todayStr)].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.order - b.order;
  });
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;

  // Overdue tasks (due before today and not completed)
  const overdueTasks = data.tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  );

  // Overall counts
  const totalTodayItems = todayTasks.length;
  const progressPercent =
    totalTodayItems > 0 ? Math.round((completedTodayCount / totalTodayItems) * 100) : 0;
  const totalOpenTasks = data.tasks.filter((t) => !t.completed).length;
  const totalCompletedAllTime = data.tasks.filter((t) => t.completed).length;

  const categoryMap = new Map(data.categories.map((c) => [c.id, c]));

  // Handle inline quick task creation with NLP parsing
  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    const parsed = parseNaturalLanguageTask(inlineTitle, todayStr);
    const matchedCategory = parsed.categoryName
      ? data.categories.find(
          (c) => c.name.toLowerCase() === parsed.categoryName?.toLowerCase()
        )
      : undefined;
    const finalPriority: Priority = parsed.priority || inlinePriority;
    const finalCategory = matchedCategory ? matchedCategory.id : inlineCategory || undefined;
    const finalDueDate = parsed.dueDate || todayStr;
    const finalDueTime = parsed.dueTime || undefined;

    onQuickCreateTask(
      parsed.cleanTitle,
      finalPriority,
      finalCategory,
      finalDueDate,
      finalDueTime,
      parsed.tags
    );
    setInlineTitle('');
  };

  const toggleExpandSubtasks = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubtasksTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleInlineAddSubtaskSubmit = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = (newSubtaskInputs[taskId] || '').trim();
    if (!title) return;
    onAddSubtask(taskId, title);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleStartEditSubtask = (sub: Subtask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubtaskId(sub.id);
    setEditSubtaskTitle(sub.title);
  };

  const handleSaveEditSubtask = (taskId: string, subId: string) => {
    if (editSubtaskTitle.trim()) {
      onEditSubtask(taskId, subId, editSubtaskTitle.trim());
    }
    setEditingSubtaskId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {formatDisplayDate(todayStr, 'full')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-0.5">
            Today's Focus
          </h2>
        </div>

        <button
          onClick={() => onOpenQuickAdd(todayStr)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Progress & Overview Card */}
      <div
        id="today-progress-card"
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Daily Task Progress
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {totalTodayItems === 0
                ? 'No tasks scheduled for today yet'
                : `${completedTodayCount} of ${totalTodayItems} tasks completed today`}
            </p>
          </div>
          <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {progressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">
              Completed Today
            </span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {completedTodayCount} / {totalTodayItems}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">
              Overdue Tasks
            </span>
            <span
              className={`text-lg font-bold ${
                overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'
              }`}
            >
              {overdueTasks.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">
              Total Open Tasks
            </span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {totalOpenTasks}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">
              All Completed
            </span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {totalCompletedAllTime}
            </span>
          </div>
        </div>
      </div>

      {/* Overdue Alert Section (if any overdue tasks exist) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Overdue Tasks ({overdueTasks.length})
              </span>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400">
              Reschedule or check off below
            </span>
          </div>

          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="w-4 h-4 rounded border-2 border-rose-400 hover:border-rose-600 flex items-center justify-center shrink-0"
                  />
                  <div className="truncate cursor-pointer" onClick={() => onSelectTask?.(task)}>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate block">
                      {task.title}
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400">
                      Due {formatDisplayDate(task.dueDate, 'relative')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onRescheduleTask(task.id, todayStr)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Reschedule Today
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Quick-Add Task Bar with NLP hints */}
      <form
        onSubmit={handleInlineSubmit}
        className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row gap-2.5"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Plus className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Quick add: 'Review project 3pm !urgent #Work #Focus'..."
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            className="flex-1 text-xs bg-transparent border-none text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 justify-end">
          <select
            value={inlinePriority}
            onChange={(e) => setInlinePriority(e.target.value as Priority)}
            className="text-[11px] font-medium px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={inlineCategory}
            onChange={(e) => setInlineCategory(e.target.value)}
            className="text-[11px] font-medium px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none max-w-[130px]"
          >
            <option value="">No Category</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!inlineTitle.trim()}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold disabled:opacity-30 transition-all shadow-xs"
          >
            Add
          </button>
        </div>
      </form>

      {/* Today's Tasks List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-neutral-500" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Today's To-Do List
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              {completedTodayCount}/{todayTasks.length}
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>All Tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center bg-white/50 dark:bg-neutral-900/50">
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-2.5 text-neutral-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              All clear for today
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 mb-4">
              Add your first task for today using the input above or the button below.
            </p>
            <button
              onClick={() => onOpenQuickAdd(todayStr)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task) => {
              const category = task.category ? categoryMap.get(task.category) : undefined;
              const subtasks = task.subtasks || [];
              const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
              const isSubtasksExpanded = expandedSubtasksTaskId === task.id;

              const colorOpt = getTaskColorOption(task, categoryMap);

              return (
                <div
                  key={task.id}
                  id={`today-task-${task.id}`}
                  className={`group rounded-2xl border transition-all ${getTaskCardClasses(
                    task,
                    categoryMap
                  )}`}
                >
                  <div className="flex items-start justify-between p-3.5 sm:p-4 gap-3">
                    {/* Checkbox & content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTask(task.id);
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                            : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              task.completed
                                ? 'text-neutral-400 line-through'
                                : 'text-neutral-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* Pinned Star */}
                          {task.pinned && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}

                          {/* Priority badge */}
                          {task.priority !== 'medium' && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                priorityBadgeStyle[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}

                          {/* Category */}
                          {category && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                              {category.name}
                            </span>
                          )}

                          {/* Tags */}
                          {task.tags &&
                            task.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium"
                              >
                                #{t}
                              </span>
                            ))}

                          {/* Time if present */}
                          {task.dueTime && (
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueTime}
                            </span>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 whitespace-pre-line line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(task.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            task.pinned
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                          title={task.pinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Star className={`w-3.5 h-3.5 ${task.pinned ? 'fill-amber-500' : ''}`} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSubtasksTaskId(task.id);
                        }}
                        className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1"
                        title="Add sub-task"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Subtask</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-tasks section */}
                  {subtasks.length > 0 && (
                    <div
                      className="px-4 pb-3.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs"
                      onClick={(e) => toggleExpandSubtasks(task.id, e)}
                    >
                      <div className="flex items-center gap-2 text-neutral-500">
                        <ListTree className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {completedSubtasksCount} of {subtasks.length} subtasks done
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                          isSubtasksExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  )}

                  {/* Expanded Subtasks details */}
                  {isSubtasksExpanded && (
                    <div
                      className="px-4 pb-4 space-y-2 border-t border-neutral-100 dark:border-neutral-800/80 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-1.5">
                        {subtasks.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 text-xs group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => onToggleSubtask(task.id, sub.id)}
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                                  sub.completed
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                    : 'border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                                }`}
                              >
                                {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </button>

                              {editingSubtaskId === sub.id ? (
                                <input
                                  type="text"
                                  value={editSubtaskTitle}
                                  onChange={(e) => setEditSubtaskTitle(e.target.value)}
                                  onBlur={() => handleSaveEditSubtask(task.id, sub.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditSubtask(task.id, sub.id);
                                  }}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onDoubleClick={(e) => handleStartEditSubtask(sub, e)}
                                  className={`truncate ${
                                    sub.completed
                                      ? 'line-through text-neutral-400'
                                      : 'text-neutral-700 dark:text-neutral-300'
                                  }`}
                                >
                                  {sub.title}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => handleStartEditSubtask(sub, e)}
                                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteSubtask(task.id, sub.id)}
                                className="p-1 text-neutral-400 hover:text-rose-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add subtask input */}
                      <form
                        onSubmit={(e) => handleInlineAddSubtaskSubmit(task.id, e)}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          placeholder="Add sub-task item... (Press Enter)"
                          value={newSubtaskInputs[task.id] || ''}
                          onChange={(e) =>
                            setNewSubtaskInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!(newSubtaskInputs[task.id] || '').trim()}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold disabled:opacity-40"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
