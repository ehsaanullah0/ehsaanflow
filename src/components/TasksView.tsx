import React, { useState, useMemo } from 'react';
import {
  Plus,
  Check,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  ListTodo,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  CheckCheck,
  ListTree,
  X,
  Star,
  Tag as TagIcon,
  Columns,
  Layers,
  Flag,
} from 'lucide-react';
import { AppData, Priority, Subtask, Task } from '../types';
import { addDays, formatDisplayDate } from '../utils/dateUtils';
import { getTaskCardClasses, getTaskColorOption, PRIORITY_CONFIG } from '../utils/colorUtils';

interface TasksViewProps {
  data: AppData;
  todayStr: string;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onTogglePin: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (newTasks: Task[]) => void;
  onClearCompletedTasks: () => void;
  onMarkAllCompleted: (taskIds: string[]) => void;
  onBatchReschedule: (taskIds: string[], newDate: string) => void;
  onBatchPriority: (taskIds: string[], priority: Priority) => void;
  onBatchDelete: (taskIds: string[]) => void;
  onSwitchToKanban?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  data,
  todayStr,
  onToggleTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onEditSubtask,
  onOpenAddTask,
  onEditTask,
  onSelectTask,
  onTogglePin,
  onDeleteTask,
  onReorderTasks,
  onClearCompletedTasks,
  onMarkAllCompleted,
  onBatchReschedule,
  onBatchPriority,
  onBatchDelete,
  onSwitchToKanban,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'dueDate' | 'priority' | 'title'>('order');
  const [expandedSubtasksTaskId, setExpandedSubtasksTaskId] = useState<string | null>(null);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');

  // Batch Selection State (TickTick feature)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const categoryMap = useMemo(() => new Map(data.categories.map((c) => [c.id, c])), [data.categories]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    data.tasks.forEach((t) => {
      t.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [data.tasks]);

  // Priority styling
  const priorityBadgeStyle: Record<Priority, string> = {
    urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    high: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
  };

  const priorityWeight: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Counts for tabs
  const countToday = data.tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;
  const countOverdue = data.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const countUpcoming = data.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).length;
  const countCompleted = data.tasks.filter((t) => t.completed).length;

  // Filter logic
  const filteredTasks = useMemo(() => {
    let result = data.tasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchNotes = task.notes?.toLowerCase().includes(q);
        const matchSubtasks = task.subtasks?.some((s) => s.title.toLowerCase().includes(q));
        const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchNotes && !matchSubtasks && !matchTags) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all') {
        if (!task.tags || !task.tags.includes(selectedTag)) return false;
      }

      // Tab filter
      if (filterTab === 'today') {
        return task.dueDate === todayStr;
      }
      if (filterTab === 'upcoming') {
        return !task.completed && task.dueDate > todayStr;
      }
      if (filterTab === 'overdue') {
        return !task.completed && task.dueDate < todayStr;
      }
      if (filterTab === 'completed') {
        return task.completed;
      }

      return true; // 'all'
    });

    // Sorting (pinned items always anchor to top unless user explicitly changes sorting)
    result.sort((a, b) => {
      // If pinned priority sorting
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return a.order - b.order;
    });

    return result;
  }, [data.tasks, searchQuery, selectedCategory, selectedPriority, selectedTag, filterTab, sortBy, todayStr]);

  // Batch Selection helpers
  const handleToggleSelectTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map((t) => t.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedTaskIds(new Set());
  };

  // Task reordering
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredTasks.length) return;

    const newFiltered = [...filteredTasks];
    const temp = newFiltered[index];
    newFiltered[index] = newFiltered[targetIndex];
    newFiltered[targetIndex] = temp;

    const taskIdsOrder = newFiltered.map((t) => t.id);
    const updatedAllTasks = [...data.tasks].sort((a, b) => {
      const idxA = taskIdsOrder.indexOf(a.id);
      const idxB = taskIdsOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.order - b.order;
    });

    onReorderTasks(updatedAllTasks);
  };

  const toggleExpandSubtasks = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubtasksTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleAddSubtaskSubmit = (taskId: string, e: React.FormEvent) => {
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
    <div className="space-y-6 max-w-4xl mx-auto pb-24 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              All Tasks
            </h2>
            {onSwitchToKanban && (
              <button
                type="button"
                onClick={onSwitchToKanban}
                className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors"
                title="Switch to Kanban Board View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Kanban View</span>
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize, prioritize, batch manage, and inspect your to-dos with sub-tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {countCompleted > 0 && filterTab === 'completed' && (
            <button
              onClick={onClearCompletedTasks}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              Clear Completed
            </button>
          )}

          {filteredTasks.some((t) => !t.completed) && (
            <button
              onClick={() => onMarkAllCompleted(filteredTasks.filter((t) => !t.completed).map((t) => t.id))}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Done</span>
            </button>
          )}

          <button
            onClick={onOpenAddTask}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 overflow-x-auto text-xs font-medium">
        {[
          { id: 'all', label: 'All Tasks', count: data.tasks.length },
          { id: 'today', label: 'Today', count: countToday },
          { id: 'upcoming', label: 'Upcoming', count: countUpcoming },
          { id: 'overdue', label: 'Overdue', count: countOverdue, alert: countOverdue > 0 },
          { id: 'completed', label: 'Completed', count: countCompleted },
        ].map((tab) => {
          const isSelected = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  tab.alert
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    : isSelected
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'bg-neutral-200/60 dark:bg-neutral-700 text-neutral-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tag Filter Pills Bar if tags exist */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1 shrink-0">
            <TagIcon className="w-3 h-3" />
            <span>Tags:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
              selectedTag === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, notes, subtasks, or #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
        </div>

        {/* Category selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
        >
          <option value="all">All Categories</option>
          {data.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Priority selector */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          >
            <option value="order">Custom Order</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Select All / Batch Toggle Bar */}
      {filteredTasks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-2 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent'
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
            >
              {selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0 && (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              )}
            </div>
            <span>
              {selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </span>
          </button>

          <span>
            Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
          <ListTodo className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No tasks found
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Add your first task to get started.'}
          </p>
          <button
            onClick={onOpenAddTask}
            className="mt-4 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => {
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
            const category = task.category ? categoryMap.get(task.category) : undefined;
            const subtasks = task.subtasks || [];
            const completedSubtasks = subtasks.filter((s) => s.completed).length;
            const isSubtasksExpanded = expandedSubtasksTaskId === task.id;
            const isSelected = selectedTaskIds.has(task.id);
            const colorOpt = getTaskColorOption(task, categoryMap);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all group hover:border-neutral-300 dark:hover:border-neutral-700 ${
                  isSelected
                    ? 'bg-neutral-50 dark:bg-neutral-850 border-neutral-900 dark:border-white shadow-xs'
                    : getTaskCardClasses(task, categoryMap)
                }`}
              >
                {/* Main Task Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Batch Selection Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelectTask(task.id, e)}
                      className={`mt-1 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent'
                          : 'border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 opacity-60 group-hover:opacity-100'
                      }`}
                      title="Select for batch actions"
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    {/* Task Completion Checkbox */}
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

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title, Pin Star & Badges */}
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

                        {/* Star / Pin ⭐ */}
                        {task.pinned && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            priorityBadgeStyle[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category Badge */}
                        {category && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {category.name}
                          </span>
                        )}

                        {/* Tags */}
                        {task.tags &&
                          task.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                            >
                              #{t}
                            </span>
                          ))}
                      </div>

                      {/* Notes snippet */}
                      {task.notes && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {task.notes}
                        </p>
                      )}

                      {/* Date & Time info */}
                      <div className="flex items-center gap-3 text-xs text-neutral-400 pt-0.5 flex-wrap">
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {formatDisplayDate(task.dueDate, 'relative')}
                        </span>

                        {task.dueTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}

                        {/* Subtasks summary indicator */}
                        {subtasks.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleExpandSubtasks(task.id, e)}
                            className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                          >
                            <ListTree className="w-3 h-3 text-neutral-400" />
                            <span>
                              {completedSubtasks}/{subtasks.length} subtasks
                            </span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                isSubtasksExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle Pin Star */}
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

                    {/* Add Subtask Quick Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSubtasksTaskId(task.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1"
                      title="Add sub-task to this task"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Subtask</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Subtasks Panel */}
                {isSubtasksExpanded && (
                  <div
                    className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                        <ListTree className="w-3.5 h-3.5" />
                        <span>Sub-tasks Checklist</span>
                      </span>
                      {subtasks.length > 0 && (
                        <span className="text-[11px] text-neutral-400">
                          {Math.round((completedSubtasks / subtasks.length) * 100)}% complete
                        </span>
                      )}
                    </div>

                    {/* Subtasks Progress Bar */}
                    {subtasks.length > 0 && (
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                          style={{
                            width: `${(completedSubtasks / subtasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    )}

                    {/* Subtask Items */}
                    <div className="space-y-1.5 pt-1">
                      {subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50/90 dark:bg-neutral-850/60 border border-neutral-100 dark:border-neutral-800/80 text-xs group"
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
                                className={`truncate cursor-pointer ${
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
                              title="Edit subtask"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSubtask(task.id, sub.id)}
                              className="p-1 text-neutral-400 hover:text-rose-500"
                              title="Delete subtask"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Subtask Input Form */}
                    <form
                      onSubmit={(e) => handleAddSubtaskSubmit(task.id, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Add sub-task item... (Press Enter)"
                        value={newSubtaskInputs[task.id] || ''}
                        onChange={(e) =>
                          setNewSubtaskInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
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

      {/* Floating Batch Actions Bar (TickTick Power Feature) */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl shadow-2xl border border-neutral-700/80 px-4 py-3 flex items-center gap-3 sm:gap-4 max-w-[95vw] sm:max-w-2xl animate-in slide-in-from-bottom duration-200 flex-wrap">
          <div className="flex items-center gap-2 pr-2 border-r border-neutral-700">
            <span className="text-xs font-bold">
              {selectedTaskIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-neutral-400 hover:text-white p-0.5"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Reschedule */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 text-[11px] hidden sm:inline">Due:</span>
            <button
              type="button"
              onClick={() => onBatchReschedule(Array.from(selectedTaskIds), todayStr)}
              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onBatchReschedule(Array.from(selectedTaskIds), addDays(todayStr, 1))}
              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
            >
              Tomorrow
            </button>
          </div>

          {/* Quick Priority */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 text-[11px] hidden sm:inline">Priority:</span>
            <button
              type="button"
              onClick={() => onBatchPriority(Array.from(selectedTaskIds), 'urgent')}
              className="px-2 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-medium"
            >
              Urgent
            </button>
            <button
              type="button"
              onClick={() => onBatchPriority(Array.from(selectedTaskIds), 'medium')}
              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
            >
              Med
            </button>
          </div>

          {/* Mark Complete */}
          <button
            type="button"
            onClick={() => {
              onMarkAllCompleted(Array.from(selectedTaskIds));
              handleClearSelection();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Done</span>
          </button>

          {/* Batch Delete */}
          <button
            type="button"
            onClick={() => {
              onBatchDelete(Array.from(selectedTaskIds));
              handleClearSelection();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-700 transition-colors"
            title="Delete selected tasks"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
