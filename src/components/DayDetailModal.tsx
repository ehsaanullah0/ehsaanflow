import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  Calendar,
  Clock,
  Trash2,
  ListTodo,
  ListTree,
  ChevronDown,
} from 'lucide-react';
import { AppData, Task } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { getTaskCardClasses } from '../utils/colorUtils';

interface DayDetailModalProps {
  dateStr: string | null;
  data: AppData;
  todayStr: string;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddTaskForDate: (dateStr: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dateStr,
  data,
  todayStr,
  onClose,
  onToggleTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onAddTaskForDate,
  onDeleteTask,
}) => {
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  if (!dateStr) return null;

  const isToday = dateStr === todayStr;
  const tasksOnDate = data.tasks.filter((t) => t.dueDate === dateStr);
  const completedTasksCount = tasksOnDate.filter((t) => t.completed).length;
  const categoryMap = new Map(data.categories.map((c) => [c.id, c]));

  const handleInlineAddSubtask = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = (newSubtaskInputs[taskId] || '').trim();
    if (!title) return;
    onAddSubtask(taskId, title);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {formatDisplayDate(dateStr, 'full')}
                </h3>
                {isToday && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {tasksOnDate.length === 0
                  ? 'No tasks scheduled'
                  : `${completedTasksCount} of ${tasksOnDate.length} completed`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-neutral-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                Scheduled Tasks ({tasksOnDate.length})
              </h4>
            </div>

            <button
              onClick={() => {
                onClose();
                onAddTaskForDate(dateStr);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>

          {tasksOnDate.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                No tasks scheduled for this day yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasksOnDate.map((task) => {
                const category = task.category ? categoryMap.get(task.category) : undefined;
                const subtasks = task.subtasks || [];
                const completedSubs = subtasks.filter((s) => s.completed).length;
                const isExpanded = expandedSubtaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all ${getTaskCardClasses(
                      task,
                      categoryMap
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            task.completed
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                              : 'border border-neutral-300 dark:border-neutral-600'
                          }`}
                        >
                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-semibold ${
                                task.completed
                                  ? 'text-neutral-400 line-through'
                                  : 'text-neutral-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>

                            {category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium">
                                {category.name}
                              </span>
                            )}

                            {task.dueTime && (
                              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {task.dueTime}
                              </span>
                            )}
                          </div>

                          {task.notes && (
                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-neutral-400 hover:text-rose-500 p-1 rounded"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtasks Collapsible */}
                    <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setExpandedSubtaskId(isExpanded ? null : task.id)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <ListTree className="w-3.5 h-3.5" />
                        <span>
                          {subtasks.length === 0
                            ? '+ Add subtask'
                            : `${completedSubs}/${subtasks.length} subtasks`}
                        </span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Expanded Subtasks Panel */}
                    {isExpanded && (
                      <div className="mt-2 pl-3 border-l-2 border-neutral-200 dark:border-neutral-700 space-y-1.5">
                        {subtasks.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-2 text-xs p-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                          >
                            <div
                              onClick={() => onToggleSubtask(task.id, sub.id)}
                              className="flex items-center gap-2 flex-1 cursor-pointer"
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
                                className={`truncate ${
                                  sub.completed ? 'text-neutral-400 line-through' : ''
                                }`}
                              >
                                {sub.title}
                              </span>
                            </div>
                            <button
                              onClick={() => onDeleteSubtask(task.id, sub.id)}
                              className="text-neutral-400 hover:text-rose-500 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Inline add subtask */}
                        <form
                          onSubmit={(e) => handleInlineAddSubtask(task.id, e)}
                          className="flex items-center gap-1.5 pt-1"
                        >
                          <input
                            type="text"
                            placeholder="Add subtask..."
                            value={newSubtaskInputs[task.id] || ''}
                            onChange={(e) =>
                              setNewSubtaskInputs((prev) => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                          />
                          <button
                            type="submit"
                            disabled={!(newSubtaskInputs[task.id] || '').trim()}
                            className="px-2.5 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[11px] font-semibold rounded-lg disabled:opacity-30"
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
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
