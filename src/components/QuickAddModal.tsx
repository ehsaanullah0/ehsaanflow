import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Star,
  Tag as TagIcon,
  Sparkles,
  Flag,
  Copy,
  Folder,
  Ban,
  Check,
  Palette,
} from 'lucide-react';
import { Category, Priority, Subtask, Task, TaskColor } from '../types';
import { addDays, getTodayKey } from '../utils/dateUtils';
import { parseNaturalLanguageTask } from '../utils/nlpParser';
import { TASK_COLOR_PALETTE, PRIORITY_CONFIG } from '../utils/colorUtils';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingTask: Task | null;
  defaultDate?: string;
  onSaveTask: (taskData: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onDuplicateTask?: (task: Task) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  editingTask,
  defaultDate,
  onSaveTask,
  onDeleteTask,
  onDuplicateTask,
}) => {
  const today = getTodayKey();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(defaultDate || today);
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskColor, setTaskColor] = useState<TaskColor | string>('default');
  const [taskPinned, setTaskPinned] = useState(false);
  const [taskStatus, setTaskStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [taskWontDo, setTaskWontDo] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Live NLP parsing for new task entry
  const nlpParsed = useMemo(() => {
    if (editingTask || !taskTitle.trim()) return null;
    return parseNaturalLanguageTask(taskTitle, today);
  }, [taskTitle, editingTask, today]);

  // Reset or populate on open
  useEffect(() => {
    if (editingTask) {
      setTaskTitle(editingTask.title);
      setTaskNotes(editingTask.notes || '');
      setTaskDueDate(editingTask.dueDate || today);
      setTaskDueTime(editingTask.dueTime || '');
      setTaskPriority(editingTask.priority || 'medium');
      setTaskCategory(editingTask.category || '');
      setTaskColor(editingTask.color || 'default');
      setTaskPinned(!!editingTask.pinned);
      setTaskStatus(editingTask.status || (editingTask.completed ? 'done' : 'todo'));
      setTaskCompleted(!!editingTask.completed);
      setTaskWontDo(!!editingTask.wontDo);
      setTags(editingTask.tags ? [...editingTask.tags] : []);
      setSubtasks(editingTask.subtasks ? [...editingTask.subtasks] : []);
    } else {
      setTaskTitle('');
      setTaskNotes('');
      setTaskDueDate(defaultDate || today);
      setTaskDueTime('');
      setTaskPriority('medium');
      setTaskCategory(categories[0]?.id || '');
      setTaskColor('default');
      setTaskPinned(false);
      setTaskStatus('todo');
      setTaskCompleted(false);
      setTaskWontDo(false);
      setTags([]);
      setSubtasks([]);
    }
    setNewSubtaskInput('');
    setTagInput('');
  }, [editingTask, defaultDate, isOpen, categories, today]);

  if (!isOpen) return null;

  const handleApplyNlp = () => {
    if (!nlpParsed) return;
    setTaskTitle(nlpParsed.cleanTitle);
    if (nlpParsed.dueDate) setTaskDueDate(nlpParsed.dueDate);
    if (nlpParsed.dueTime) setTaskDueTime(nlpParsed.dueTime);
    if (nlpParsed.priority) setTaskPriority(nlpParsed.priority);
    if (nlpParsed.tags.length > 0) {
      setTags((prev) => Array.from(new Set([...prev, ...nlpParsed.tags])));
    }
    if (nlpParsed.categoryName) {
      const match = categories.find((c) =>
        c.name.toLowerCase().includes(nlpParsed.categoryName!.toLowerCase())
      );
      if (match) setTaskCategory(match.id);
    }
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean || tags.includes(clean)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags((prev) => prev.filter((item) => item !== t));
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    const item: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskInput.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, item]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleComplete = () => {
    const nextCompleted = !taskCompleted;
    setTaskCompleted(nextCompleted);
    setTaskStatus(nextCompleted ? 'done' : 'todo');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let finalTitle = taskTitle.trim();
    let finalDueDate = taskDueDate || today;
    let finalDueTime = taskDueTime.trim() || undefined;
    let finalPriority = taskPriority;
    let finalTags = [...tags];
    let finalCat = taskCategory || undefined;

    if (!editingTask && nlpParsed) {
      finalTitle = nlpParsed.cleanTitle || taskTitle.trim();
      if (nlpParsed.dueDate) finalDueDate = nlpParsed.dueDate;
      if (nlpParsed.dueTime) finalDueTime = nlpParsed.dueTime;
      if (nlpParsed.priority) finalPriority = nlpParsed.priority;
      if (nlpParsed.tags.length > 0) {
        finalTags = Array.from(new Set([...finalTags, ...nlpParsed.tags]));
      }
      if (nlpParsed.categoryName && !finalCat) {
        const match = categories.find((c) =>
          c.name.toLowerCase().includes(nlpParsed.categoryName!.toLowerCase())
        );
        if (match) finalCat = match.id;
      }
    }

    onSaveTask({
      title: finalTitle,
      notes: taskNotes.trim() || undefined,
      dueDate: finalDueDate,
      dueTime: finalDueTime,
      priority: finalPriority,
      category: finalCat,
      color: taskColor !== 'default' ? taskColor : undefined,
      pinned: taskPinned,
      status: taskStatus,
      completed: taskCompleted || taskStatus === 'done',
      completedAt: (taskCompleted || taskStatus === 'done') ? (editingTask?.completedAt || today) : undefined,
      wontDo: taskWontDo,
      tags: finalTags.length > 0 ? finalTags : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });

    onClose();
  };

  const hasNlpTokens =
    nlpParsed &&
    (nlpParsed.dueDate ||
      nlpParsed.dueTime ||
      nlpParsed.priority ||
      nlpParsed.tags.length > 0 ||
      nlpParsed.categoryName);

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {editingTask ? (
              <button
                type="button"
                onClick={handleToggleComplete}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                  taskCompleted
                    ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                    : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-white'
                }`}
                title={taskCompleted ? 'Mark uncompleted' : 'Mark completed'}
              >
                {taskCompleted && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0">
                <ListTodo className="w-4 h-4 stroke-[2.2]" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white leading-tight truncate">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <p className="text-[11px] text-neutral-400 truncate">
                {editingTask ? 'Modify details, subtasks & assignment' : 'Smart date, priority & color configuration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Star / Pin Button */}
            <button
              type="button"
              onClick={() => setTaskPinned(!taskPinned)}
              className={`p-2 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                taskPinned
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title={taskPinned ? 'Pinned to top' : 'Pin to top'}
            >
              <Star className={`w-4 h-4 ${taskPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Duplicate Button (if editing) */}
            {editingTask && onDuplicateTask && (
              <button
                type="button"
                onClick={() => {
                  onDuplicateTask(editingTask);
                  onClose();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Duplicate task"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}

            {/* Delete Button (if editing) */}
            {editingTask && onDeleteTask && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(editingTask.id);
                  onClose();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Title Input with NLP */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Task Title <span className="text-rose-500">*</span>
              </label>
              {!editingTask && (
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  e.g. <code className="text-neutral-700 dark:text-neutral-300">tomorrow 3pm !urgent #work</code>
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              required
              autoFocus
            />

            {/* Smart NLP detection strip */}
            {hasNlpTokens && (
              <div className="mt-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/80 flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Auto Detected:</span>
                  </div>

                  {nlpParsed.dueDateLabel && (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold text-[11px] flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {nlpParsed.dueDateLabel}
                    </span>
                  )}

                  {nlpParsed.dueTime && (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {nlpParsed.dueTime}
                    </span>
                  )}

                  {nlpParsed.priority && (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold text-[11px] flex items-center gap-1 capitalize">
                      <Flag className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                      {nlpParsed.priority}
                    </span>
                  )}

                  {nlpParsed.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleApplyNlp}
                  className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white underline cursor-pointer"
                >
                  Apply & Clean
                </button>
              </div>
            )}
          </div>

          {/* Minimal Custom Task Color Assignment (Clean Swatch Circles) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Task Color Tone</span>
            </label>
            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              {Object.values(TASK_COLOR_PALETTE).map((colorOpt) => {
                const isSelected = (taskColor || 'default') === colorOpt.id;
                return (
                  <button
                    key={colorOpt.id}
                    type="button"
                    onClick={() => setTaskColor(colorOpt.id)}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center relative ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-neutral-950 dark:ring-white dark:ring-offset-neutral-900 scale-110 shadow-xs'
                        : 'border-neutral-300 dark:border-neutral-700 hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: colorOpt.hex }}
                    title={colorOpt.name}
                    aria-label={colorOpt.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-neutral-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due Date & Presets</span>
              </label>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setTaskDueDate(today)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  taskDueDate === today
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => setTaskDueDate(tomorrow)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  taskDueDate === tomorrow
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Tomorrow
              </button>

              <button
                type="button"
                onClick={() => setTaskDueDate(nextWeek)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  taskDueDate === nextWeek
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Next Week
              </button>

              {/* Custom Date Input */}
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none"
              />

              {/* Due Time Input */}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="time"
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Priority Flags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              <span>Priority Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => {
                const conf = PRIORITY_CONFIG[p];
                const isSelected = taskPriority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriority(p)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? `${conf.bgLight} dark:${conf.bgDark} border-current ring-1 ring-current text-neutral-950 dark:text-white shadow-xs`
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: conf.hex }}
                    />
                    <span className="capitalize">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1.5">
                <Folder className="w-3.5 h-3.5" />
                <span>Category List</span>
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
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
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Workflow Status</span>
              </label>
              <select
                value={taskStatus}
                onChange={(e) => {
                  const val = e.target.value as 'todo' | 'in_progress' | 'done';
                  setTaskStatus(val);
                  setTaskCompleted(val === 'done');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white capitalize"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          {/* Task Color Swatches (Clean, Minimal, No Text Labels) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Color Tone</span>
            </label>
            <div className="flex items-center gap-2.5 flex-wrap p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
              {Object.entries(TASK_COLOR_PALETTE).map(([key, opt]) => {
                const isSelected = taskColor === key || (!taskColor && key === 'default');
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTaskColor(key as TaskColor)}
                    title={opt.name}
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-900 scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: opt.hex,
                      border: key === 'default' ? '1.5px solid #d4d4d4' : 'none',
                    }}
                    aria-label={opt.name}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 stroke-[3] ${
                          key === 'default' || key === 'lemon' || key === 'lime' || key === 'cream'
                            ? 'text-neutral-950'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Tags</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-bold"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-neutral-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center">
                <input
                  type="text"
                  placeholder="+ Add tag... (Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none w-32"
                />
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <span>
                  Subtasks / Checklist ({completedSubtasksCount}/{subtasks.length})
                </span>
              </label>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(sub.id)}
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          sub.completed
                            ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                            : 'border border-neutral-300 dark:border-neutral-600'
                        }`}
                      >
                        {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <span
                        className={`truncate font-medium ${
                          sub.completed
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-950 dark:text-neutral-100'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-neutral-400 hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                disabled={!newSubtaskInput.trim()}
                className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold disabled:opacity-40"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Description & Rich Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              Notes & Description
            </label>
            <textarea
              rows={3}
              placeholder="Add links, context, references, or details..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white resize-none"
            />
          </div>

          {/* Won't Do option toggle */}
          {editingTask && (
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTaskWontDo(!taskWontDo)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  taskWontDo
                    ? 'bg-neutral-200 dark:bg-neutral-800 border-neutral-400 text-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{taskWontDo ? "Marked as Won't Do" : "Mark as Won't Do / Skip"}</span>
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors shadow-sm disabled:opacity-40"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
