import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Plus,
  Repeat,
  CalendarRange,
  Hash,
  Eye,
  ChevronRight,
  ChevronLeft,
  ListTree
} from 'lucide-react';
import { Task, Priority, SubTask } from '../types';
import { formatDateStr, isTaskCompletedOnDate } from '../utils/habitUtils';
import { HighlightText } from './HighlightText';

export interface CardViewOptions {
  priority: boolean;
  category: boolean;
  recurrence: boolean;
  description: boolean;
  dateTime: boolean;
  tags: boolean;
  subtasks: boolean;
}

const DEFAULT_VIEW_OPTIONS: CardViewOptions = {
  priority: true,
  category: true,
  recurrence: true,
  description: true,
  dateTime: true,
  tags: true,
  subtasks: true,
};

const STORAGE_KEY = 'ehsaanflow_card_view_options';
const SYNC_ALL_STORAGE_KEY = 'ehsaanflow_card_view_sync_all';

const getInitialSyncAll = (): boolean => {
  try {
    const saved = localStorage.getItem(SYNC_ALL_STORAGE_KEY);
    return saved !== 'false'; // Default is true
  } catch (e) {
    return true;
  }
};

const getInitialViewOptions = (): CardViewOptions => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_VIEW_OPTIONS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse card view options:', e);
  }
  return DEFAULT_VIEW_OPTIONS;
};

const getInitialCardViewOptions = (taskId: string): CardViewOptions => {
  try {
    const isSynced = getInitialSyncAll();
    if (isSynced) {
      return getInitialViewOptions();
    } else {
      const savedSpecific = localStorage.getItem(`ehsaanflow_card_view_options_task_${taskId}`);
      if (savedSpecific) {
        return { ...DEFAULT_VIEW_OPTIONS, ...JSON.parse(savedSpecific) };
      }
    }
  } catch (e) {
    console.error('Failed to parse card specific options:', e);
  }
  return getInitialViewOptions();
};

interface TaskCardProps {
  task: Task;
  searchQuery?: string;
  dateContext?: string;
  onToggleTaskComplete: (taskId: string, dateStr?: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  searchQuery,
  dateContext,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onAddSubtask,
  onDeleteTask,
  onEditTask,
}) => {
  const activeDate = dateContext || task.dueDate || formatDateStr(new Date());
  const isCompleted = isTaskCompletedOnDate(task, activeDate);

  const [isExpanded, setIsExpanded] = useState<boolean>(task.subtasks.length > 0 && !isCompleted);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');
  const [isAddingSubtask, setIsAddingSubtask] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showViewSubmenu, setShowViewSubmenu] = useState<boolean>(false);
  const [syncAll, setSyncAll] = useState<boolean>(getInitialSyncAll);
  const [viewOptions, setViewOptions] = useState<CardViewOptions>(() => getInitialCardViewOptions(task.id));

  useEffect(() => {
    const handleSettingsChanged = () => {
      setSyncAll(getInitialSyncAll());
      setViewOptions(getInitialCardViewOptions(task.id));
    };
    window.addEventListener('card-view-options-changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('card-view-options-changed', handleSettingsChanged);
    };
  }, [task.id]);

  const toggleViewOption = (key: keyof CardViewOptions) => {
    const updated = { ...viewOptions, [key]: !viewOptions[key] };
    setViewOptions(updated);
    try {
      if (syncAll) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('card-view-options-changed'));
      } else {
        localStorage.setItem(`ehsaanflow_card_view_options_task_${task.id}`, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to save card view options:', e);
    }
  };

  const handleToggleSyncAll = () => {
    const nextSyncAll = !syncAll;
    setSyncAll(nextSyncAll);
    try {
      localStorage.setItem(SYNC_ALL_STORAGE_KEY, String(nextSyncAll));
      
      if (nextSyncAll) {
        // overwrite global settings with current card viewOptions
        localStorage.setItem(STORAGE_KEY, JSON.stringify(viewOptions));
      } else {
        // copy current state as specific card setting
        localStorage.setItem(`ehsaanflow_card_view_options_task_${task.id}`, JSON.stringify(viewOptions));
      }
      
      window.dispatchEvent(new Event('card-view-options-changed'));
    } catch (e) {
      console.error('Failed to save syncAll settings:', e);
    }
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;
  const progressPercent = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const priorityBadges: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
    high: {
      label: 'HIGH PRIORITY',
      bg: 'bg-[#df734c]',
      text: 'text-[#f6e9d7]',
      border: 'border-[#cb5d37]',
    },
    medium: {
      label: 'MEDIUM',
      bg: 'bg-[#422119]',
      text: 'text-[#fbf6ef]',
      border: 'border-[#281b18]',
    },
    low: {
      label: 'LOW',
      bg: 'bg-[#1e40af]',
      text: 'text-white',
      border: 'border-[#1e3a8a]',
    },
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const formatShortDate = (dStr?: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length < 3) return dStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isDurationTask = task.isRecurring === 'duration' && task.startDate && task.endDate;

  return (
    <div
      className={`group relative rounded-3xl p-5 transition-all duration-200 border ${
        task.completed
          ? 'bg-[#edd8c2]/30 border-[#281b18]/10 opacity-75'
          : 'bg-[#fbf6ef] border-[#281b18]/15 hover:border-[#823b28]/40 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-h-[22px]">
          {/* Priority Badge */}
          {viewOptions.priority && (
            <span
              className={`font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                priorityBadges[task.priority].bg
              } ${priorityBadges[task.priority].text} ${priorityBadges[task.priority].border}`}
            >
              {priorityBadges[task.priority].label}
            </span>
          )}

          {/* Category Badge if exists */}
          {viewOptions.category && task.category && (
            <span className="font-mono text-[10px] text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#823b28]/15">
              <HighlightText text={task.category} highlight={searchQuery} />
            </span>
          )}

          {/* Recurring / Duration Indicator */}
          {viewOptions.recurrence && task.isRecurring && task.isRecurring !== 'none' && (
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#d4aa86]">
              {task.isRecurring === 'duration' ? (
                <>
                  <CalendarRange size={11} className="text-[#df734c]" />
                  <span>Duration ({formatShortDate(task.startDate)} → {formatShortDate(task.endDate)})</span>
                </>
              ) : (
                <>
                  <Repeat size={10} className="text-[#df734c]" />
                  <span className="capitalize">{task.isRecurring}</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Menu Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMenu(!showMenu);
              if (showMenu) setShowViewSubmenu(false);
            }}
            className="p-1.5 rounded-xl hover:bg-[#edd8c2] text-[#823b28]/70 hover:text-[#823b28] transition-colors cursor-pointer"
            title="Options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div 
              className={`absolute right-0 top-8 z-30 bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl shadow-xl py-1 transition-all ${
                showViewSubmenu ? 'w-56' : 'w-40'
              }`}
              onMouseLeave={() => {
                setShowMenu(false);
                setShowViewSubmenu(false);
              }}
            >
              {showViewSubmenu ? (
                <div>
                  <div className="px-3 py-1.5 border-b border-[#281b18]/10 flex items-center justify-between">
                    <button 
                      onClick={() => setShowViewSubmenu(false)}
                      className="text-[11px] font-bold text-[#823b28] hover:text-[#df734c] flex items-center gap-0.5 cursor-pointer"
                    >
                      <ChevronLeft size={13} />
                      <span>Back</span>
                    </button>
                    <span className="font-mono text-[9px] uppercase font-bold text-[#281b18]/70 tracking-wider">
                      Card Elements
                    </span>
                  </div>

                  {/* Sync All Cards Toggle Switch */}
                  <div className="px-3 py-1.5 border-b border-[#281b18]/10 bg-[#edd8c2]/30 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#823b28] uppercase tracking-wide">Sync All Cards</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncAll}
                        onChange={handleToggleSyncAll}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-[#edd8c2] rounded-full peer peer-checked:after:translate-x-3 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#df734c] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1e40af]/20 peer-checked:after:bg-[#1e40af] border border-[#281b18]/15"></div>
                    </label>
                  </div>

                  <div className="p-1.5 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
                    {[
                      { key: 'priority', label: 'Priority Badge' },
                      { key: 'category', label: 'Category / Folder' },
                      { key: 'recurrence', label: 'Duration & Repeat' },
                      { key: 'description', label: 'Notes / Description' },
                      { key: 'dateTime', label: 'Due Date & Time' },
                      { key: 'tags', label: 'Tags' },
                      { key: 'subtasks', label: 'Subtasks Section' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between px-2.5 py-1.5 hover:bg-[#edd8c2]/60 rounded-xl text-xs font-medium text-[#281b18] cursor-pointer transition-colors"
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={viewOptions[item.key as keyof CardViewOptions]}
                          onChange={() => toggleViewOption(item.key as keyof CardViewOptions)}
                          className="w-3.5 h-3.5 rounded accent-[#df734c] cursor-pointer shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditTask(task);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#281b18] hover:bg-[#edd8c2] flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={14} className="text-[#823b28]" />
                    <span>Edit Task</span>
                  </button>

                  <button
                    onClick={() => setShowViewSubmenu(true)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#281b18] hover:bg-[#edd8c2] flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-[#df734c]" />
                      <span>View</span>
                    </div>
                    <ChevronRight size={13} className="text-[#823b28]/60" />
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteTask(task.id);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100/50 flex items-center gap-2 cursor-pointer border-t border-[#281b18]/10"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Task Body Row */}
      <div className="flex items-start gap-3.5 mt-1">
        {/* Completion Checkbox */}
        <button
          onClick={() => onToggleTaskComplete(task.id, activeDate)}
          className="mt-1 text-[#823b28] hover:text-[#df734c] transition-colors cursor-pointer flex-shrink-0"
          title={isCompleted ? 'Mark pending' : 'Mark completed'}
        >
          {isCompleted ? (
            <CheckCircle2 size={22} className="text-[#823b28] fill-[#edd8c2]" />
          ) : (
            <Circle size={22} strokeWidth={1.8} className="text-[#823b28]/60 hover:text-[#823b28]" />
          )}
        </button>

        {/* Task Title & Notes */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg sm:text-[17.5px] font-extrabold font-sans tracking-tight leading-snug transition-all ${
              isCompleted ? 'line-through text-[#823b28]/50' : 'text-[#281b18]'
            }`}
          >
            <HighlightText text={task.title} highlight={searchQuery} />
          </h3>

          {viewOptions.description && task.description && (
            <p className="text-xs text-[#823b28]/80 font-medium leading-relaxed mt-1 line-clamp-2">
              <HighlightText text={task.description} highlight={searchQuery} />
            </p>
          )}

          {/* Date, Time & Tags Metadata Row */}
          {(viewOptions.dateTime || viewOptions.tags) && (
            <div className="flex items-center gap-2 mt-2.5 text-xs text-[#823b28]/80 font-mono flex-wrap">
              {viewOptions.dateTime && (isDurationTask ? (
                <div className="flex items-center gap-1.5 bg-[#edd8c2]/60 px-2.5 py-1 rounded-xl text-[#823b28] font-bold">
                  <CalendarRange size={13} className="text-[#df734c]" />
                  <span>{formatShortDate(task.startDate)} – {formatShortDate(task.endDate)}</span>
                </div>
              ) : task.dueDate ? (
                <div className="flex items-center gap-1.5 bg-[#edd8c2]/60 px-2.5 py-1 rounded-xl font-bold">
                  <Calendar size={13} className="text-[#823b28]" />
                  <span>{formatShortDate(task.dueDate)}</span>
                </div>
              ) : null)}

              {viewOptions.dateTime && task.dueTime && (
                <div className="flex items-center gap-1.5 bg-[#edd8c2]/60 px-2.5 py-1 rounded-xl font-bold">
                  <Clock size={13} className="text-[#823b28]" />
                  <span>{task.dueTime}</span>
                </div>
              )}

              {viewOptions.tags && task.tags && task.tags.length > 0 && task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] font-bold bg-[#edd8c2]/80 text-[#823b28] px-2.5 py-1 rounded-xl border border-[#281b18]/10"
                >
                  <Hash size={11} className="text-[#df734c]" />
                  <HighlightText text={tag} highlight={searchQuery} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subtasks Section */}
      {viewOptions.subtasks && totalSubtasksCount > 0 && (
        <div className="mt-3.5 bg-[#f4e8d9]/80 border border-[#281b18]/12 rounded-2xl p-3.5 shadow-2xs">
          {/* Subtask Header & Progress Bar */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 font-mono text-[11px] font-extrabold text-[#823b28] uppercase tracking-wider hover:text-[#df734c] transition-colors cursor-pointer"
            >
              <ListTree size={14} className="text-[#df734c] shrink-0" />
              <span>
                Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
              </span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <div className="flex items-center gap-2 min-w-[100px] sm:min-w-[120px]">
              <div className="flex-1 h-2 bg-[#edd8c2] rounded-full overflow-hidden p-0.5 border border-[#281b18]/10">
                <div
                  className="h-full bg-gradient-to-r from-[#df734c] to-[#823b28] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-[10px] font-black text-[#823b28] bg-[#edd8c2] px-1.5 py-0.5 rounded-md border border-[#281b18]/10 shadow-2xs">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Subtask List */}
          {isExpanded && (
            <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-[#281b18]/10">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`flex items-center justify-between gap-2 py-1.5 px-3 rounded-xl bg-[#f8db97] hover:bg-[#edd8c2]/80 border border-[#281b18]/10 transition-all shadow-2xs`}
                >
                  <button
                    onClick={() => onToggleSubtaskComplete(task.id, subtask.id)}
                    className="flex items-center gap-2.5 text-left cursor-pointer flex-1 min-w-0"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 size={16} className="text-[#823b28] fill-[#edd8c2] shrink-0" />
                    ) : (
                      <Circle size={16} className="text-[#823b28]/50 hover:text-[#823b28] shrink-0" />
                    )}
                    <span
                      className={`truncate text-xs ${
                        subtask.completed ? 'line-through text-[#823b28]/50' : 'text-[#281b18] font-bold text-[12.5px]'
                      }`}
                    >
                      <HighlightText text={subtask.title || 'Subtask step'} highlight={searchQuery} />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Subtask Trigger inside subtask card */}
          {isExpanded && (
            <div className="mt-2.5 pt-2 border-t border-[#281b18]/10">
              {isAddingSubtask ? (
                <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Enter subtask step title..."
                    autoFocus
                    className="flex-1 bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-1.5 text-xs text-[#281b18] outline-none focus:border-[#823b28] font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-[#823b28] text-[#f6e9d7] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#6f2f1f] shadow-2xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSubtask(false)}
                    className="text-[#823b28] px-2 py-1.5 text-xs font-semibold hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setIsExpanded(true);
                    setIsAddingSubtask(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#823b28] hover:text-[#df734c] transition-colors cursor-pointer py-0.5"
                >
                  <Plus size={14} className="text-[#df734c]" />
                  <span>Add Subtask Step</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
