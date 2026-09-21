import React, { useState, useMemo } from 'react';
import {
  Plus,
  Check,
  Star,
  Calendar,
  Clock,
  Flag,
  ListTree,
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  Filter,
  Columns,
  Search,
  Edit2,
} from 'lucide-react';
import { AppData, Category, Priority, Task } from '../types';
import { addDays, formatDisplayDate } from '../utils/dateUtils';
import { COLOR_OPTIONS, getTaskCardClasses, getTaskColorOption } from '../utils/colorUtils';

interface KanbanBoardViewProps {
  data: AppData;
  todayStr: string;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onQuickCreateTask: (title: string, priority: Priority, categoryId?: string, dueDate?: string) => void;
  onMoveTaskStatus: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onMoveTaskPriority: (taskId: string, newPriority: Priority) => void;
  onMoveTaskCategory: (taskId: string, newCategory?: string) => void;
}

type GroupBy = 'status' | 'priority' | 'category' | 'date';

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  data,
  todayStr,
  onToggleTask,
  onSelectTask,
  onQuickCreateTask,
  onMoveTaskStatus,
  onMoveTaskPriority,
  onMoveTaskCategory,
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCardInput, setNewCardInput] = useState<{ [columnKey: string]: string }>({});
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(data.categories.map((c) => [c.id, c])), [data.categories]);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return data.tasks;
    const q = searchQuery.toLowerCase();
    return data.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [data.tasks, searchQuery]);

  // Group columns definition
  const columns = useMemo(() => {
    if (groupBy === 'status') {
      return [
        {
          key: 'todo',
          title: 'To Do',
          color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
          tasks: filteredTasks.filter((t) => (!t.status && !t.completed) || t.status === 'todo'),
        },
        {
          key: 'in_progress',
          title: 'In Progress',
          color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          tasks: filteredTasks.filter((t) => t.status === 'in_progress' && !t.completed),
        },
        {
          key: 'done',
          title: 'Completed',
          color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
          tasks: filteredTasks.filter((t) => t.status === 'done' || t.completed),
        },
      ];
    }

    if (groupBy === 'priority') {
      const pOrder: Priority[] = ['urgent', 'high', 'medium', 'low'];
      return pOrder.map((p) => ({
        key: p,
        title: p.charAt(0).toUpperCase() + p.slice(1),
        color:
          p === 'urgent'
            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
            : p === 'high'
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
            : p === 'medium'
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
        tasks: filteredTasks.filter((t) => t.priority === p),
      }));
    }

    if (groupBy === 'category') {
      const catCols = data.categories.map((c) => ({
        key: c.id,
        title: c.name,
        color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
        tasks: filteredTasks.filter((t) => t.category === c.id),
      }));
      catCols.push({
        key: 'uncategorized',
        title: 'Uncategorized',
        color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
        tasks: filteredTasks.filter((t) => !t.category),
      });
      return catCols;
    }

    // Date grouping
    const tomorrow = addDays(todayStr, 1);
    const nextWeekEnd = addDays(todayStr, 7);

    return [
      {
        key: 'overdue',
        title: 'Overdue',
        color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300',
        tasks: filteredTasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr),
      },
      {
        key: 'today',
        title: 'Today',
        color: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
        tasks: filteredTasks.filter((t) => t.dueDate === todayStr),
      },
      {
        key: 'tomorrow',
        title: 'Tomorrow',
        color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
        tasks: filteredTasks.filter((t) => t.dueDate === tomorrow),
      },
      {
        key: 'upcoming',
        title: 'Next 7 Days',
        color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
        tasks: filteredTasks.filter((t) => t.dueDate > tomorrow && t.dueDate <= nextWeekEnd),
      },
      {
        key: 'later',
        title: 'Later / Someday',
        color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
        tasks: filteredTasks.filter((t) => !t.dueDate || t.dueDate > nextWeekEnd),
      },
    ];
  }, [groupBy, filteredTasks, data.categories, todayStr]);

  const handleInlineCardSubmit = (columnKey: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = (newCardInput[columnKey] || '').trim();
    if (!title) return;

    if (groupBy === 'status') {
      onQuickCreateTask(title, 'medium');
    } else if (groupBy === 'priority') {
      onQuickCreateTask(title, columnKey as Priority);
    } else if (groupBy === 'category') {
      onQuickCreateTask(title, 'medium', columnKey === 'uncategorized' ? undefined : columnKey);
    } else if (groupBy === 'date') {
      let dateVal = todayStr;
      if (columnKey === 'tomorrow') dateVal = addDays(todayStr, 1);
      if (columnKey === 'upcoming') dateVal = addDays(todayStr, 3);
      if (columnKey === 'later') dateVal = addDays(todayStr, 14);
      onQuickCreateTask(title, 'medium', undefined, dateVal);
    }

    setNewCardInput((prev) => ({ ...prev, [columnKey]: '' }));
    setAddingInColumn(null);
  };

  const priorityBadgeStyle: Record<Priority, string> = {
    urgent: 'text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400',
    high: 'text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400',
    medium: 'text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400',
    low: 'text-neutral-400',
  };

  return (
    <div className="space-y-6 max-w-full pb-16">
      {/* Board Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Kanban Board
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            TickTick-style visual columns to plan, track workflow, and conquer tasks.
          </p>
        </div>

        {/* Group By Selector & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none w-36 sm:w-44"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs">
            <span className="text-[11px] font-semibold text-neutral-400 px-1.5">Group:</span>
            {(['status', 'priority', 'category', 'date'] as GroupBy[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupBy(g)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  groupBy === g
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
        {columns.map((col) => {
          // Sort tasks: pinned first, then order
          const sortedTasks = [...col.tasks].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return a.order - b.order;
          });

          const isAdding = addingInColumn === col.key;

          return (
            <div
              key={col.key}
              className="w-72 sm:w-80 shrink-0 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-col max-h-[calc(100vh-220px)]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {col.title}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700">
                    {col.tasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAddingInColumn(col.key)}
                  className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
                  title="Add card"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards List */}
              <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
                {sortedTasks.map((task) => {
                  const category = task.category ? categoryMap.get(task.category) : undefined;
                  const subtasks = task.subtasks || [];
                  const completedSubtasks = subtasks.filter((s) => s.completed).length;
                  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

                  return (
                    <div
                      key={task.id}
                      className={`group p-3 rounded-xl border transition-all shadow-2xs hover:shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 ${getTaskCardClasses(
                        task,
                        categoryMap
                      )}`}
                    >
                      {/* Top Row: Checkbox, Title, Pin, Edit */}
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                          }}
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            task.completed
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                              : 'border border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                          }`}
                        >
                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-semibold truncate block ${
                                task.completed
                                  ? 'line-through text-neutral-400'
                                  : 'text-neutral-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.pinned && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>

                          {task.notes && (
                            <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                              {task.notes}
                            </p>
                          )}
                        </div>

                        {/* Edit Button (Pencil) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                          title="Edit task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Card Meta row: Tags & Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px]">
                        {/* Priority Flag */}
                        <div className="flex items-center gap-0.5">
                          <Flag className={`w-3 h-3 ${priorityBadgeStyle[task.priority]}`} />
                          <span className="capitalize text-neutral-500">{task.priority}</span>
                        </div>

                        {/* Due Date */}
                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-neutral-400'
                          }`}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{formatDisplayDate(task.dueDate, 'relative')}</span>
                        </div>

                        {/* Subtasks Fraction */}
                        {subtasks.length > 0 && (
                          <div className="flex items-center gap-1 text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            <ListTree className="w-2.5 h-2.5" />
                            <span>
                              {completedSubtasks}/{subtasks.length}
                            </span>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags &&
                          task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>

                      {/* Quick Move Status Trigger if grouping by status */}
                      {groupBy === 'status' && !task.completed && (
                        <div className="flex items-center justify-end gap-1 mt-1.5 pt-1">
                          {col.key === 'todo' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveTaskStatus(task.id, 'in_progress');
                              }}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
                            >
                              <span>Start</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.key === 'in_progress' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveTaskStatus(task.id, 'done');
                              }}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                            >
                              <span>Done</span>
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Inline Card Creator */}
                {isAdding ? (
                  <form
                    onSubmit={(e) => handleInlineCardSubmit(col.key, e)}
                    className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-sm space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Enter task title... (Enter)"
                      value={newCardInput[col.key] || ''}
                      onChange={(e) =>
                        setNewCardInput((prev) => ({ ...prev, [col.key]: e.target.value }))
                      }
                      className="w-full text-xs bg-transparent border-none text-neutral-900 dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAddingInColumn(null)}
                        className="px-2 py-1 text-[11px] rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!(newCardInput[col.key] || '').trim()}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 disabled:opacity-30"
                      >
                        Add Card
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingInColumn(col.key)}
                    className="w-full py-2 px-3 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-white/50 dark:hover:bg-neutral-800/50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
