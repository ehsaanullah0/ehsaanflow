import React, { useState } from 'react';
import { Plus, Filter, Search, CheckSquare, List, Grid, Calendar, Clock, Hash, X } from 'lucide-react';
import { Task, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface TasksViewProps {
  tasks: Task[];
  searchQuery: string;
  onToggleTaskComplete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  searchQuery,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onAddSubtask,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low'>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract unique categories
  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  ) as string[];

  // Extract unique tags
  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.tags || []).filter(Boolean))
  ) as string[];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Clean search term
    const term = searchQuery.trim().toLowerCase().replace(/^#/, '');

    // Search query filter: matches name, description, category, tags, or subtasks
    const matchesSearch =
      !term ||
      t.title.toLowerCase().includes(term) ||
      (t.description && t.description.toLowerCase().includes(term)) ||
      (t.category && t.category.toLowerCase().includes(term)) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(term))) ||
      (t.subtasks && t.subtasks.some((st) => st.title.toLowerCase().includes(term)));

    // Status / Priority filter
    let matchesFilter = true;
    if (filterTab === 'pending') matchesFilter = !t.completed;
    if (filterTab === 'completed') matchesFilter = t.completed;
    if (filterTab === 'high') matchesFilter = t.priority === 'high';
    if (filterTab === 'medium') matchesFilter = t.priority === 'medium';
    if (filterTab === 'low') matchesFilter = t.priority === 'low';

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;

    // Tag filter
    const matchesTag =
      selectedTag === 'all' || (t.tags && t.tags.includes(selectedTag));

    return matchesSearch && matchesFilter && matchesCategory && matchesTag;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Search status indicator if search query active */}
      {searchQuery.trim() && (
        <div className="bg-[#edd8c2] border border-[#d4aa86] rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#823b28]">
            <Search size={14} className="text-[#df734c]" />
            <span>
              Searching for <strong className="text-[#281b18]">"{searchQuery}"</strong> across titles, notes, and tags
            </span>
          </div>
          <span className="font-bold bg-[#823b28] text-white px-2.5 py-0.5 rounded-lg">
            {filteredTasks.length} result{filteredTasks.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-3.5 sm:p-4 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1.5 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'pending'
                ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18]'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18]'
            }`}
          >
            All ({tasks.length})
          </button>

          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'completed'
                ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18]'
            }`}
          >
            Completed ({completedCount})
          </button>

          <div className="w-px h-5 bg-[#281b18]/15 mx-1 hidden sm:block shrink-0" />

          <button
            onClick={() => setFilterTab('high')}
            className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'high'
                ? 'bg-[#df734c] text-white shadow-sm'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#cb5d37]'
            }`}
          >
            High Priority
          </button>

          <button
            onClick={() => setFilterTab('medium')}
            className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'medium'
                ? 'bg-[#422119] text-[#fbf6ef] shadow-sm'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#422119]'
            }`}
          >
            Medium
          </button>

          <button
            onClick={() => setFilterTab('low')}
            className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'low'
                ? 'bg-[#1e40af] text-white shadow-sm'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#1e40af]'
            }`}
          >
            Low
          </button>
        </div>

        {/* View Layout Toggle & Category Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap sm:flex-nowrap">
          {/* Category Selector */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#f6e9d7] border border-[#281b18]/15 text-[#281b18] text-xs font-semibold rounded-2xl px-3 py-2 outline-none focus:border-[#823b28] cursor-pointer min-h-[38px]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* List/Grid View Mode Toggle */}
          <div className="flex items-center bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-1 gap-1 min-h-[38px]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'grid' ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs' : 'text-[#823b28]/70 hover:text-[#823b28]'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <Grid size={15} />
              <span className="hidden xs:inline sm:inline text-[11px]">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'list' ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs' : 'text-[#823b28]/70 hover:text-[#823b28]'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List size={15} />
              <span className="hidden xs:inline sm:inline text-[11px]">List</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap min-h-[38px]"
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tag Filter Chips (if tags exist) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mt-2">
          <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Hash size={12} /> Tags:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-[#823b28] text-white'
                : 'bg-[#f6e9d7] text-[#823b28] hover:bg-[#edd8c2]'
            }`}
          >
            All Tags
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(selectedTag === t ? 'all' : t)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                selectedTag === t
                  ? 'bg-[#df734c] text-white shadow-xs'
                  : 'bg-[#f6e9d7] text-[#823b28] hover:bg-[#edd8c2] border border-[#281b18]/10'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Tasks Content Grid / List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-[#fbf6ef] border border-dashed border-[#281b18]/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#edd8c2] flex items-center justify-center text-[#823b28] mb-3">
            <CheckSquare size={28} />
          </div>
          <h3 className="text-base font-extrabold text-[#281b18] font-sans">
            No matching tasks found
          </h3>
          <p className="text-xs text-[#823b28] max-w-md mt-1">
            {searchQuery
              ? `No tasks matched "${searchQuery}". Check spelling or search by task name, description, or #tags.`
              : 'Try adjusting your filters or create a new task to stay organized.'}
          </p>
          <button
            onClick={onOpenNewTaskModal}
            className="mt-4 bg-[#823b28] text-[#f6e9d7] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm cursor-pointer hover:bg-[#6f2f1f]"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 w-full [column-fill:balance]'
              : 'flex flex-col gap-4 w-full'
          }
        >
          {filteredTasks.map((task) => (
            <div key={task.id} className={viewMode === 'grid' ? 'break-inside-avoid mb-4 sm:mb-5' : ''}>
              <TaskCard
                task={task}
                searchQuery={searchQuery}
                onToggleTaskComplete={onToggleTaskComplete}
                onToggleSubtaskComplete={onToggleSubtaskComplete}
                onAddSubtask={onAddSubtask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
