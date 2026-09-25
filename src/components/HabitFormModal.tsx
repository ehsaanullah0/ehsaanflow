import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { X, Flame, Check } from 'lucide-react';
import { formatDateStr } from '../utils/habitUtils';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => void;
  initialHabit?: Habit | null;
}

const EMOJI_OPTIONS = ['🔥', '🏃', '📚', '🎯', '🌙', '⚡', '🧘', '💧', '✍️', '🍎', '💤', '🌿', '🏋️', '🎨', '🧠', '🚴'];
const CATEGORY_OPTIONS = ['Focus', 'Health', 'Study', 'Productivity', 'Mindfulness', 'Personal', 'Routine'];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Focus');
  const [startDate, setStartDate] = useState(formatDateStr(new Date()));
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState<number>(7);
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setEmoji(initialHabit.emoji || '');
      setDescription(initialHabit.description || '');
      setCategory(initialHabit.category || 'Focus');
      setStartDate(initialHabit.startDate || formatDateStr(new Date()));
      setTargetDaysPerWeek(initialHabit.targetDaysPerWeek || 7);
      setExcludeFromAnalytics(initialHabit.excludeFromAnalytics || false);
      setIsHidden(initialHabit.isHidden || false);
    } else {
      setName('');
      setEmoji('');
      setDescription('');
      setCategory('Focus');
      setStartDate(formatDateStr(new Date()));
      setTargetDaysPerWeek(7);
      setExcludeFromAnalytics(false);
      setIsHidden(false);
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialHabit?.id,
      name: name.trim(),
      emoji,
      description: description.trim(),
      category,
      startDate,
      targetDaysPerWeek,
      frequency: targetDaysPerWeek === 7 ? 'daily' : 'custom',
      completedDates: initialHabit?.completedDates || [],
      order: initialHabit?.order ?? 0,
      isArchived: initialHabit?.isArchived ?? false,
      excludeFromAnalytics,
      isHidden,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#f6e9d7] border border-[#281b18]/20 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#281b18]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#281b18]/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#823b28] text-[#f6e9d7] flex items-center justify-center shadow-xs">
              <Flame size={18} />
            </div>
            <h2 className="text-xl font-black text-[#281b18] tracking-tight">
              {initialHabit ? 'Edit Habit' : 'New Habit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          {/* Name & Custom Emoji Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#823b28] uppercase tracking-wider mb-1.5">
              Habit Icon & Name *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🔥"
                maxLength={4}
                title="Type or paste any custom emoji"
                className="w-13 h-11 bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl text-xl text-center font-normal outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] shadow-2xs shrink-0"
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pure Potential, Exercise, Reading..."
                className="flex-1 bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#281b18] placeholder-[#823b28]/50 outline-none focus:border-[#823b28] shadow-2xs"
              />
            </div>
            <span className="text-[10px] text-[#823b28]/70 mt-1 block font-mono">
              Tip: Click the left icon box to type or paste any custom emoji or symbol.
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#823b28] uppercase tracking-wider mb-1.5">
              Description / Motivation
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Having screen time of less than 2 hours"
              className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl px-4 py-2.5 text-xs text-[#281b18] placeholder-[#823b28]/50 outline-none focus:border-[#823b28] shadow-2xs resize-none"
            />
          </div>

          {/* Category & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#823b28] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl px-3 py-2.5 text-xs font-bold text-[#281b18] outline-none focus:border-[#823b28] shadow-2xs cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#823b28] uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl px-3 py-2 text-xs font-bold text-[#281b18] outline-none focus:border-[#823b28] shadow-2xs cursor-pointer"
              />
            </div>
          </div>

          {/* Target Frequency */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#823b28] uppercase tracking-wider mb-1.5">
              Target Frequency ({targetDaysPerWeek} days / week)
            </label>
            <div className="flex items-center gap-1.5">
              {[7, 6, 5, 4, 3, 2, 1].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setTargetDaysPerWeek(num)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    targetDaysPerWeek === num
                      ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                      : 'bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#281b18] border border-[#281b18]/10'
                  }`}
                >
                  {num}d
                </button>
              ))}
            </div>
          </div>

          {/* Visibility & Analytics Settings */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeFromAnalytics}
                onChange={(e) => setExcludeFromAnalytics(e.target.checked)}
                className="accent-[#823b28] w-4 h-4"
              />
              <span className="text-xs font-bold text-[#281b18]">Exclude from overall analytics</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="accent-[#823b28] w-4 h-4"
              />
              <span className="text-xs font-bold text-[#281b18]">Hide from all habits list</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#281b18]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-[#edd8c2] hover:bg-[#d4aa86] text-[#281b18] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#823b28] hover:bg-[#6a2f20] text-[#f6e9d7] text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>{initialHabit ? 'Save Changes' : 'Create Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
