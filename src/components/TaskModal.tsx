import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Tag, Repeat, Hash, CalendarRange } from 'lucide-react';
import { Task, Priority, SubTask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  editingTask?: Task | null;
}

const POPULAR_TAGS = ['DeepFocus', 'Work', 'Health', 'Learning', 'Personal', 'Finance', 'Urgent'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  editingTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Personal');
  const [isRecurring, setIsRecurring] = useState<'none' | 'daily' | 'weekly' | 'duration'>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(editingTask.dueTime || '');
      setStartDate(editingTask.startDate || editingTask.dueDate || new Date().toISOString().split('T')[0]);
      setEndDate(editingTask.endDate || editingTask.dueDate || new Date().toISOString().split('T')[0]);
      setPriority(editingTask.priority);
      setCategory(editingTask.category || 'Personal');
      setIsRecurring(editingTask.isRecurring || 'none');
      setTags(editingTask.tags || []);
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setStartDate(today);
      const future = new Date();
      future.setDate(future.getDate() + 3);
      setEndDate(future.toISOString().split('T')[0]);
      setDueTime('');
      setPriority('medium');
      setCategory('Personal');
      setIsRecurring('none');
      setTags([]);
      setSubtasks([]);
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (rawTag: string) => {
    const cleanTag = rawTag.trim().replace(/^#/, '');
    if (!cleanTag || tags.includes(cleanTag)) return;
    setTags([...tags, cleanTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub-temp-${Date.now()}`, title: subtaskInput.trim(), completed: false },
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Calculate days for duration preview
  const calculateDurationDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length < 3) return dStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      id: editingTask ? editingTask.id : undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: isRecurring === 'duration' ? startDate : dueDate,
      dueTime: dueTime || undefined,
      startDate: isRecurring === 'duration' ? startDate : undefined,
      endDate: isRecurring === 'duration' ? endDate : undefined,
      priority,
      category: category.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      isRecurring,
      completed: editingTask ? editingTask.completed : false,
      subtasks: subtasks.map((s, idx) => ({
        id: s.id.startsWith('sub-temp-') ? `sub-${Date.now()}-${idx}` : s.id,
        title: s.title,
        completed: s.completed,
        parentTaskId: editingTask ? editingTask.id : 'temp',
      })),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#281b18]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fbf6ef] border border-[#281b18]/20 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl hover:bg-[#edd8c2] text-[#823b28] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="font-mono text-[10px] font-bold text-[#df734c] uppercase tracking-wider bg-[#edd8c2] px-3 py-1 rounded-full border border-[#d4aa86]">
            {editingTask ? 'EDIT TASK' : 'CREATE NEW TASK'}
          </span>
          <h2 className="text-2xl font-extrabold text-[#281b18] mt-2 font-sans tracking-tight">
            {editingTask ? 'Modify Task Details' : 'What is your intended outcome?'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Chromatic Design System"
              className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant details, links, or context..."
              className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] transition-all resize-none"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28] cursor-pointer"
              >
                <option value="high">🔥 High Priority</option>
                <option value="medium">⚡ Medium Priority</option>
                <option value="low">🌿 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
                <Tag size={13} />
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Design, Health, Learning..."
                className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28]"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-3.5">
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <Hash size={13} />
              Tags & Search Keywords
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add tag (e.g. DeepWork, Urgent) and press Enter"
                className="flex-1 bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-1.5 text-xs text-[#281b18] outline-none focus:border-[#823b28]"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Add Tag
              </button>
            </div>

            {/* Active Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-[#edd8c2] text-[#823b28] px-2.5 py-1 rounded-lg border border-[#d4aa86]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-700 cursor-pointer ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-[#823b28]/70">Suggestions:</span>
              {POPULAR_TAGS.filter((pt) => !tags.includes(pt)).slice(0, 5).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => handleAddTag(pt)}
                  className="text-[10px] font-mono bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md border border-[#281b18]/10 cursor-pointer transition-colors"
                >
                  +{pt}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring & Schedule Options */}
          <div className="bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-3.5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#823b28] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Repeat size={13} />
                Recurring & Timeline Mode
              </label>

              <select
                value={isRecurring}
                onChange={(e) => setIsRecurring(e.target.value as 'none' | 'daily' | 'weekly' | 'duration')}
                className="bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-1.5 text-xs text-[#281b18] font-bold outline-none focus:border-[#823b28] cursor-pointer"
              >
                <option value="none">One-time Task</option>
                <option value="duration">Duration (Date Range)</option>
                <option value="daily">Every Day (Recurring)</option>
                <option value="weekly">Every Week (Recurring)</option>
              </select>
            </div>

            {/* Date Fields Based on Mode */}
            {isRecurring === 'duration' ? (
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                      <CalendarRange size={12} />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-2 text-xs text-[#281b18] font-medium outline-none focus:border-[#823b28]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                      <CalendarRange size={12} />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-2 text-xs text-[#281b18] font-medium outline-none focus:border-[#823b28]"
                    />
                  </div>
                </div>

                {/* Duration Highlight Banner */}
                <div className="bg-[#edd8c2] border border-[#d4aa86] rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#823b28]">
                    🗓️ Range: {formatDisplayDate(startDate)} → {formatDisplayDate(endDate)}
                  </span>
                  <span className="font-extrabold bg-[#823b28] text-white px-2 py-0.5 rounded-md">
                    {calculateDurationDays()} Days Duration
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                    <Calendar size={12} />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-2 text-xs text-[#281b18] font-medium outline-none focus:border-[#823b28]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                    <Clock size={12} />
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-2 text-xs text-[#281b18] font-medium outline-none focus:border-[#823b28]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtasks Builder */}
          <div className="border-t border-[#281b18]/10 pt-4 mt-2">
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-2 font-mono">
              Subtasks ({subtasks.length})
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask step..."
                className="flex-1 bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-3.5 py-2 text-xs text-[#281b18] outline-none focus:border-[#823b28]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 bg-[#f6e9d7] border border-[#281b18]/10 rounded-xl px-3 py-1.5 text-xs"
                  >
                    <span className="text-[#281b18] font-medium">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#281b18]/10 pt-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[#823b28] hover:bg-[#edd8c2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-6 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer border border-[#a14c35]/40"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
