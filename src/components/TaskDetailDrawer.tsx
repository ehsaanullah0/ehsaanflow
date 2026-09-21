import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Star,
  Calendar,
  Clock,
  Flag,
  Tag as TagIcon,
  Trash2,
  Copy,
  Folder,
  Plus,
  Ban,
  CheckCircle2,
  ListTree,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Category, Priority, Subtask, Task } from '../types';
import { addDays, formatDisplayDate, getTodayKey } from '../utils/dateUtils';
import { COLOR_OPTIONS } from '../utils/colorUtils';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  todayStr: string;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  categories,
  todayStr,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onDuplicateTask,
}) => {
  if (!isOpen || !task) return null;

  // Local draft state
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [dueDate, setDueDate] = useState(task.dueDate || todayStr);
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [priority, setPriority] = useState<Priority>(task.priority || 'medium');
  const [category, setCategory] = useState(task.category || '');
  const [pinned, setPinned] = useState(!!task.pinned);
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(task.status || (task.completed ? 'done' : 'todo'));
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Sync draft state when task changes
  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes || '');
    setDueDate(task.dueDate || todayStr);
    setDueTime(task.dueTime || '');
    setPriority(task.priority || 'medium');
    setCategory(task.category || '');
    setPinned(!!task.pinned);
    setStatus(task.status || (task.completed ? 'done' : 'todo'));
    setTags(task.tags || []);
    setSubtasks(task.subtasks || []);
  }, [task, todayStr]);

  // Auto-save changes immediately or on blur/action
  const commitUpdate = (overrides: Partial<Task> = {}) => {
    const updated: Task = {
      ...task,
      title: title.trim() || task.title,
      notes: notes.trim() || undefined,
      dueDate,
      dueTime: dueTime.trim() || undefined,
      priority,
      category: category || undefined,
      pinned,
      status,
      tags,
      subtasks,
      ...overrides,
    };
    onUpdateTask(updated);
  };

  const handleToggleCompleted = () => {
    const nextCompleted = !task.completed;
    const nextStatus = nextCompleted ? 'done' : 'todo';
    setStatus(nextStatus);
    commitUpdate({
      completed: nextCompleted,
      completedAt: nextCompleted ? todayStr : undefined,
      status: nextStatus,
    });
  };

  const handleTogglePin = () => {
    const nextPinned = !pinned;
    setPinned(nextPinned);
    commitUpdate({ pinned: nextPinned });
  };

  const handleSetQuickDate = (dateVal: string) => {
    setDueDate(dateVal);
    commitUpdate({ dueDate: dateVal });
  };

  const handleSetPriority = (p: Priority) => {
    setPriority(p);
    commitUpdate({ priority: p });
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean || tags.includes(clean)) {
      setTagInput('');
      return;
    }
    const nextTags = [...tags, clean];
    setTags(nextTags);
    setTagInput('');
    commitUpdate({ tags: nextTags });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    commitUpdate({ tags: nextTags });
  };

  const handleToggleSubtask = (subId: string) => {
    const nextSubs = subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(nextSubs);
    commitUpdate({ subtasks: nextSubs });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const nextSubs = [...subtasks, newSub];
    setSubtasks(nextSubs);
    setNewSubtaskTitle('');
    commitUpdate({ subtasks: nextSubs });
  };

  const handleDeleteSubtask = (subId: string) => {
    const nextSubs = subtasks.filter((s) => s.id !== subId);
    setSubtasks(nextSubs);
    commitUpdate({ subtasks: nextSubs });
  };

  const handleToggleWontDo = () => {
    const nextWontDo = !task.wontDo;
    commitUpdate({ wontDo: nextWontDo });
  };

  const priorityMeta: Record<Priority, { label: string; flagColor: string; bg: string }> = {
    urgent: { label: 'Urgent', flagColor: 'text-rose-500 fill-rose-500', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
    high: { label: 'High', flagColor: 'text-amber-500 fill-amber-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
    medium: { label: 'Medium', flagColor: 'text-blue-500 fill-blue-500', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
    low: { label: 'Low', flagColor: 'text-neutral-400', bg: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300' },
  };

  const tomorrow = addDays(todayStr, 1);
  const nextWeek = addDays(todayStr, 7);

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Checkbox */}
            <button
              type="button"
              onClick={handleToggleCompleted}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
              }`}
              title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
            >
              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Task Details
            </span>

            {task.wontDo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                Won't Do
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pin ⭐ */}
            <button
              type="button"
              onClick={handleTogglePin}
              className={`p-2 rounded-xl transition-colors ${
                pinned
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title={pinned ? 'Unpin from top' : 'Pin to top (Starred)'}
            >
              <Star className={`w-4 h-4 ${pinned ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => onDuplicateTask(task)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Duplicate task"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Title input (inline auto-saving) */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => commitUpdate({ title })}
              placeholder="Task name..."
              className={`w-full text-lg sm:text-xl font-bold bg-transparent border-none text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 ${
                task.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
              }`}
            />
          </div>

          {/* Quick Date Presets (TickTick style) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due Date & Scheduling</span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSetQuickDate(todayStr)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  dueDate === todayStr
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => handleSetQuickDate(tomorrow)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  dueDate === tomorrow
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Tomorrow
              </button>

              <button
                type="button"
                onClick={() => handleSetQuickDate(nextWeek)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  dueDate === nextWeek
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Next Week
              </button>

              {/* Custom Date Input */}
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  commitUpdate({ dueDate: e.target.value });
                }}
                className="px-2.5 py-1 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />

              {/* Time Input */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => {
                    setDueTime(e.target.value);
                    commitUpdate({ dueTime: e.target.value });
                  }}
                  className="px-2 py-1 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Priority Flag Selector (TickTick flag icons) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              <span>Priority Level</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => {
                const meta = priorityMeta[p];
                const isSelected = priority === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSetPriority(p)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? `${meta.bg} border-current shadow-xs ring-1 ring-current`
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${meta.flagColor}`} />
                    <span className="capitalize">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Workflow Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1.5">
                <Folder className="w-3.5 h-3.5" />
                <span>Category List</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  commitUpdate({ category: e.target.value });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Workflow Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as 'todo' | 'in_progress' | 'done';
                  setStatus(val);
                  const isDone = val === 'done';
                  commitUpdate({
                    status: val,
                    completed: isDone,
                    completedAt: isDone ? todayStr : undefined,
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none font-medium capitalize"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          {/* Tags Manager (TickTick power feature) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Tags</span>
            </label>

            {/* Existing Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Tag Add Input */}
              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  placeholder="+ Add tag... (Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500 w-32"
                />
              </form>
            </div>
          </div>

          {/* Subtasks (Task within Task) Manager */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <ListTree className="w-3.5 h-3.5" />
                <span>
                  Sub-tasks ({completedSubtasksCount}/{subtasks.length})
                </span>
              </label>

              {subtasks.length > 0 && (
                <span className="text-[11px] font-mono text-neutral-400">
                  {Math.round((completedSubtasksCount / subtasks.length) * 100)}% done
                </span>
              )}
            </div>

            {/* Subtask items */}
            <div className="space-y-1.5">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        sub.completed
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                          : 'border border-neutral-300 dark:border-neutral-600'
                      }`}
                    >
                      {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                    <span
                      className={`truncate ${
                        sub.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold disabled:opacity-30"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Description & Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
              Notes & Description
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => commitUpdate({ notes })}
              placeholder="Add rich context, bullet points, references, or links..."
              className="w-full p-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white resize-none"
            />
          </div>
        </div>

        {/* Bottom Bar: Won't Do & Close */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900">
          <button
            type="button"
            onClick={handleToggleWontDo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{task.wontDo ? "Restore from Won't Do" : "Won't Do"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
