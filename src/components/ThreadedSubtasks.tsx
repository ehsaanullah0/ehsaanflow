import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Edit2,
  Flag,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  CornerDownRight,
  Sparkles,
  X,
  FileText,
  Tag as TagIcon,
  ListTree,
} from 'lucide-react';
import { Priority, Subtask } from '../types';
import { formatDisplayDate, getTodayKey } from '../utils/dateUtils';

interface ThreadedSubtasksProps {
  taskId: string;
  subtasks: Subtask[];
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string, priority?: Priority, dueDate?: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  todayStr?: string;
  initialCollapsed?: boolean;
  className?: string;
}

const PRIORITY_META: Record<Priority, { label: string; badge: string; dot: string; flagColor: string }> = {
  urgent: {
    label: 'Urgent',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    dot: 'bg-rose-500',
    flagColor: 'text-rose-500',
  },
  high: {
    label: 'High',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    dot: 'bg-amber-500',
    flagColor: 'text-amber-500',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    dot: 'bg-blue-500',
    flagColor: 'text-blue-500',
  },
  low: {
    label: 'Low',
    badge: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
    dot: 'bg-neutral-400',
    flagColor: 'text-neutral-400',
  },
};

export const ThreadedSubtasks: React.FC<ThreadedSubtasksProps> = ({
  taskId,
  subtasks = [],
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onEditSubtask,
  onUpdateSubtask,
  todayStr = getTodayKey(),
  initialCollapsed = false,
  className = '',
}) => {
  const [isThreadCollapsed, setIsThreadCollapsed] = useState(initialCollapsed);
  const [isAddingReply, setIsAddingReply] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDueDate, setNewDueDate] = useState<string>('');
  
  // Editing state for individual subtask
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Quick priority popover menu state
  const [activePriorityMenuSubId, setActivePriorityMenuSubId] = useState<string | null>(null);
  // Quick date picker state
  const [activeDatePickerSubId, setActiveDatePickerSubId] = useState<string | null>(null);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddSubtask(taskId, newTitle.trim(), newPriority, newDueDate || undefined);
    setNewTitle('');
    setNewDueDate('');
    setIsAddingReply(false);
  };

  const handleStartEdit = (sub: Subtask, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSubId(sub.id);
    setEditTitle(sub.title);
  };

  const handleSaveEdit = (subId: string) => {
    if (editTitle.trim()) {
      onEditSubtask(taskId, subId, editTitle.trim());
    }
    setEditingSubId(null);
  };

  const handleSetSubtaskPriority = (subId: string, priority: Priority) => {
    if (onUpdateSubtask) {
      onUpdateSubtask(taskId, subId, { priority });
    }
    setActivePriorityMenuSubId(null);
  };

  const handleSetSubtaskDueDate = (subId: string, dueDate: string) => {
    if (onUpdateSubtask) {
      onUpdateSubtask(taskId, subId, { dueDate: dueDate || undefined });
    }
    setActiveDatePickerSubId(null);
  };

  return (
    <div className={`space-y-2 text-xs select-text ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Reddit-style Thread Header & Collapse Bar */}
      <div className="flex items-center justify-between gap-2 px-1 py-1 text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          {/* Thread collapse trigger */}
          <button
            type="button"
            onClick={() => setIsThreadCollapsed(!isThreadCollapsed)}
            className="flex items-center gap-1.5 font-bold text-[11px] hover:text-neutral-900 dark:hover:text-white transition-colors group"
            title={isThreadCollapsed ? 'Expand subtask thread' : 'Collapse subtask thread'}
          >
            <span className="w-4 h-4 rounded bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-mono group-hover:bg-neutral-300 dark:group-hover:bg-neutral-700 transition-colors">
              {isThreadCollapsed ? '+' : '−'}
            </span>
            <span className="flex items-center gap-1">
              <ListTree className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200" />
              <span>Subtask Thread</span>
              <span className="font-mono text-[10px] text-neutral-400">
                ({completedCount}/{subtasks.length})
              </span>
            </span>
          </button>

          {/* Progress pill */}
          {subtasks.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{progressPercent}% completed</span>
            </span>
          )}
        </div>

        {/* Quick inline add trigger */}
        <div className="flex items-center gap-1.5">
          {!isAddingReply && (
            <button
              type="button"
              onClick={() => {
                setIsThreadCollapsed(false);
                setIsAddingReply(true);
              }}
              className="px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Subtask</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Line */}
      {subtasks.length > 0 && !isThreadCollapsed && (
        <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Collapsed view summary */}
      {isThreadCollapsed && subtasks.length > 0 && (
        <div
          onClick={() => setIsThreadCollapsed(false)}
          className="p-2.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-850/60 border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-between cursor-pointer hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-colors"
        >
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold">
              {subtasks.length} independent subtask{subtasks.length !== 1 ? 's' : ''} hidden
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
              {completedCount} of {subtasks.length} done
            </span>
          </div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 hover:underline">
            Click to expand thread →
          </span>
        </div>
      )}

      {/* Expanded Thread Tree (Reddit Comment Hierarchy) */}
      {!isThreadCollapsed && (
        <div className="relative pl-3.5 sm:pl-4 space-y-2.5 pt-1">
          {/* Main Continuous Left Threadline (Clickable to collapse like Reddit) */}
          <div
            onClick={() => setIsThreadCollapsed(true)}
            className="absolute left-1 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-400 dark:hover:bg-neutral-500 cursor-pointer rounded-full transition-colors group/thread"
            title="Click threadline to collapse all subtasks"
          />

          {/* Subtask Card Nodes */}
          {subtasks.map((sub, index) => {
            const isEditing = editingSubId === sub.id;
            const priority = sub.priority || 'medium';
            const meta = PRIORITY_META[priority];
            const isOverdue = sub.dueDate && !sub.completed && sub.dueDate < todayStr;

            return (
              <div key={sub.id} className="relative group/subcard">
                {/* Curved Connector Line Branch from Main Threadline to Subtask Card (Reddit elbow └──) */}
                <div className="absolute -left-2.5 sm:-left-3 top-4 w-2.5 sm:w-3 h-3 border-l-2 border-b-2 border-neutral-200 dark:border-neutral-800 rounded-bl-lg pointer-events-none group-hover/subcard:border-neutral-400 dark:group-hover/subcard:border-neutral-600 transition-colors" />

                {/* Elevated Independent Subtask Card */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    sub.completed
                      ? 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-850 opacity-80'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200/90 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
                  }`}
                >
                  {/* Card Top Meta Bar (Reddit Comment Header) */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-neutral-100 dark:border-neutral-800/60 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>

                      {/* Independent Priority Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${meta.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <span>{meta.label}</span>
                      </span>

                      {/* Independent Due Date / Time */}
                      {sub.dueDate && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-semibold'
                              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{formatDisplayDate(sub.dueDate, 'relative')}</span>
                        </span>
                      )}

                      {sub.dueTime && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{sub.dueTime}</span>
                        </span>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-1">
                      {sub.completed ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-neutral-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Subtask Content Row */}
                  <div className="flex items-start gap-2.5">
                    {/* Independent Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(taskId, sub.id)}
                      className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        sub.completed
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                          : 'border border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
                      }`}
                      title={sub.completed ? 'Mark subtask uncompleted' : 'Mark subtask completed'}
                    >
                      {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    {/* Subtask Title (Editable) */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveEdit(sub.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(sub.id);
                              if (e.key === 'Escape') setEditingSubId(null);
                            }}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-medium"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(sub.id)}
                            className="px-2 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-[10px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          onDoubleClick={(e) => handleStartEdit(sub, e)}
                          className={`text-xs font-semibold leading-snug cursor-pointer transition-colors ${
                            sub.completed
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300'
                          }`}
                        >
                          {sub.title}
                        </div>
                      )}

                      {/* Notes / Details if present */}
                      {sub.notes && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                          {sub.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reddit-style Action Bar (Comment Footer) */}
                  <div className="mt-2.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Priority Quick Picker Toggle */}
                      {onUpdateSubtask && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePriorityMenuSubId(
                                activePriorityMenuSubId === sub.id ? null : sub.id
                              );
                              setActiveDatePickerSubId(null);
                            }}
                            className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors py-0.5 px-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            title="Set subtask priority"
                          >
                            <Flag className={`w-3 h-3 ${meta.flagColor}`} />
                            <span className="capitalize">{priority}</span>
                          </button>

                          {/* Priority Dropdown */}
                          {activePriorityMenuSubId === sub.id && (
                            <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg p-1.5 flex flex-col gap-1 w-28 animate-in fade-in zoom-in-95 duration-150">
                              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => {
                                const pMeta = PRIORITY_META[p];
                                return (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => handleSetSubtaskPriority(sub.id, p)}
                                    className={`px-2 py-1 rounded-lg text-left text-[11px] font-semibold flex items-center justify-between transition-colors ${
                                      priority === p
                                        ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300'
                                    }`}
                                  >
                                    <span className="capitalize">{pMeta.label}</span>
                                    {priority === p && <Check className="w-3 h-3" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Due Date Quick Picker Toggle */}
                      {onUpdateSubtask && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDatePickerSubId(
                                activeDatePickerSubId === sub.id ? null : sub.id
                              );
                              setActivePriorityMenuSubId(null);
                            }}
                            className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors py-0.5 px-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            title="Set subtask due date"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{sub.dueDate ? sub.dueDate : 'Set Date'}</span>
                          </button>

                          {activeDatePickerSubId === sub.id && (
                            <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg p-2 flex flex-col gap-2 w-44 animate-in fade-in zoom-in-95 duration-150">
                              <input
                                type="date"
                                value={sub.dueDate || ''}
                                onChange={(e) => handleSetSubtaskDueDate(sub.id, e.target.value)}
                                className="w-full px-2 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                              />
                              <div className="flex justify-between items-center text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleSetSubtaskDueDate(sub.id, todayStr)}
                                  className="text-neutral-600 dark:text-neutral-300 font-semibold hover:underline"
                                >
                                  Today
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetSubtaskDueDate(sub.id, '')}
                                  className="text-rose-500 font-semibold hover:underline"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reply / Quick Add link below */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingReply(true);
                        }}
                        className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors py-0.5 px-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Link next subtask</span>
                      </button>
                    </div>

                    {/* Edit & Delete Action icons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(sub, e)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit subtask title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSubtask(taskId, sub.id)}
                        className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reddit-style Reply Box (+ Add Subtask) */}
          {isAddingReply ? (
            <div className="relative pt-1">
              <div className="absolute -left-2.5 sm:-left-3 top-5 w-2.5 sm:w-3 h-3 border-l-2 border-b-2 border-neutral-300 dark:border-neutral-700 rounded-bl-lg pointer-events-none" />
              <form
                onSubmit={handleCreateSubmit}
                className="p-3 rounded-xl bg-white dark:bg-neutral-900 border-2 border-neutral-950 dark:border-white shadow-md space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                    <span>New Linked Subtask</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingReply(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="What is this independent subtask item?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-medium"
                  autoFocus
                />

                <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                  {/* Priority selector */}
                  <div className="flex items-center gap-1">
                    {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                      const meta = PRIORITY_META[p];
                      const isSel = newPriority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewPriority(p)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            isSel
                              ? `${meta.badge} ring-1 ring-neutral-900 dark:ring-white`
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit & Cancel */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingReply(false)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim()}
                      className="px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold disabled:opacity-30 flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Post Subtask</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingReply(true)}
              className="w-full mt-1 py-2 px-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-850/40 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group"
            >
              <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>+ Add another independent subtask...</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
