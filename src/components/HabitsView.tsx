import React, { useState } from 'react';
import { Habit } from '../types';
import { HabitCard } from './HabitCard';
import { 
  Flame, 
  BarChart2, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Menu, 
  ListOrdered, 
  LayoutGrid, 
  List, 
  Search, 
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { formatDateStr } from '../utils/habitUtils';

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onOpenNewHabitModal: () => void;
  onOpenAnalyticsModal: (habit?: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onReorderHabits: (reorderedHabits: Habit[]) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleHabitDate,
  onOpenNewHabitModal,
  onOpenAnalyticsModal,
  onEditHabit,
  onDeleteHabit,
  onReorderHabits,
}) => {
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = formatDateStr(new Date());

  // Count habits completed today
  const activeHabits = habits.filter((h) => !h.isArchived);
  const completedTodayCount = activeHabits.filter((h) => (h.completedDates || []).includes(todayStr)).length;
  const totalHabitsCount = activeHabits.length;

  // Categories list
  const categories = Array.from(new Set(activeHabits.map((h) => h.category).filter(Boolean))) as string[];

  // Filtered habits
  const filteredHabits = activeHabits.filter((h) => {
    const matchesCat = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Only exclude hidden habits if we are in 'all' view
    const isHiddenFromView = selectedCategory === 'all' && h.isHidden;
    
    return matchesCat && matchesSearch && !isHiddenFromView;
  });

  // Reordering helpers
  const handleMoveHabit = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= habits.length) return;

    const newHabits = [...habits];
    const temp = newHabits[index];
    newHabits[index] = newHabits[targetIndex];
    newHabits[targetIndex] = temp;

    // update order property
    const updated = newHabits.map((h, idx) => ({ ...h, order: idx }));
    onReorderHabits(updated);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#281b18] tracking-tight font-sans">
            Habits
          </h1>
          <p className="text-sm font-extrabold text-[#823b28] font-mono mt-0.5">
            {completedTodayCount}/{totalHabitsCount} Completed Today
          </p>
        </div>

        {/* Top Right Action Buttons (Matching Inspiration Top Right) */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Collapse/Expand Cards Button (Left Top-Right Button) */}
          <button
            onClick={() => setIsCompactMode(!isCompactMode)}
            title={isCompactMode ? 'Expand cards to show week strip' : 'Collapse cards to show names only'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#281b18]/15 transition-all text-xs font-bold cursor-pointer ${
              isCompactMode
                ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                : 'bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#281b18]'
            }`}
          >
            {isCompactMode ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            <span className="hidden sm:inline font-mono">{isCompactMode ? 'Expand' : 'Collapse'}</span>
          </button>

          {/* Reorder Habits Button (Right Top-Right Button) */}
          <button
            onClick={() => setIsReorderMode(!isReorderMode)}
            title={isReorderMode ? 'Done reordering' : 'Reorder habits'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#281b18]/15 transition-all text-xs font-bold cursor-pointer ${
              isReorderMode
                ? 'bg-[#df734c] text-white shadow-xs'
                : 'bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#281b18]'
            }`}
          >
            <Menu size={16} />
            <span className="hidden sm:inline font-mono">{isReorderMode ? 'Done' : 'Reorder'}</span>
          </button>

          {/* Grid / List Layout Switcher for Desktop & Tablet */}
          <div className="hidden sm:flex items-center bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewLayout === 'list'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-2xs'
                  : 'text-[#823b28]/70 hover:text-[#823b28]'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-2xs'
                  : 'text-[#823b28]/70 hover:text-[#823b28]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Overall Analytics Button (Header version for desktop) */}
          <button
            onClick={() => onOpenAnalyticsModal()}
            className="flex items-center gap-1.5 bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#281b18] border border-[#281b18]/15 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Overall Analytics"
          >
            <BarChart2 size={16} className="text-[#823b28]" />
            <span className="hidden md:inline font-mono">Analytics</span>
          </button>

          {/* New Habit Button */}
          <button
            onClick={onOpenNewHabitModal}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6a2f20] text-[#f6e9d7] px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-3 sm:p-4 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#823b28] text-[#f6e9d7] shadow-2xs'
                : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18]'
            }`}
          >
            All ({activeHabits.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#df734c] text-white shadow-2xs'
                  : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#823b28]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[180px] sm:w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#823b28]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search habits..."
            className="w-full bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-[#281b18] placeholder-[#823b28]/50 outline-none focus:border-[#823b28]"
          />
        </div>
      </div>

      {/* Reordering Banner Notification (if active) */}
      {isReorderMode && (
        <div className="flex items-center justify-between gap-3 bg-[#df734c]/15 border border-[#df734c]/30 rounded-2xl p-3 text-xs text-[#281b18] font-bold">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-[#df734c]" />
            <span>Reorder Mode Active: Use the arrows on each habit card to change their display order.</span>
          </div>
          <button
            onClick={() => setIsReorderMode(false)}
            className="px-3 py-1 bg-[#df734c] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#c95f39]"
          >
            Done
          </button>
        </div>
      )}

      {/* Habits List / Grid */}
      {filteredHabits.length === 0 ? (
        <div className="bg-[#fbf6ef] border border-dashed border-[#281b18]/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#edd8c2] flex items-center justify-center text-[#823b28] mb-3">
            <Flame size={28} />
          </div>
          <h3 className="text-base font-extrabold text-[#281b18]">
            No habits found
          </h3>
          <p className="text-xs text-[#823b28] max-w-md mt-1">
            {searchQuery
              ? `No habits matched "${searchQuery}".`
              : 'Create your first habit to build momentum and track consistency.'}
          </p>
          <button
            onClick={onOpenNewHabitModal}
            className="mt-4 bg-[#823b28] text-[#f6e9d7] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm cursor-pointer hover:bg-[#6a2f20]"
          >
            Create Habit
          </button>
        </div>
      ) : (
        <div
          className={
            viewLayout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full items-start'
              : 'flex flex-col gap-4 w-full'
          }
        >
          {filteredHabits.map((habit, index) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              todayStr={todayStr}
              isCompactMode={isCompactMode}
              isReorderMode={isReorderMode}
              onToggleDate={onToggleHabitDate}
              onOpenAnalytics={onOpenAnalyticsModal}
              onEditHabit={onEditHabit}
              onDeleteHabit={onDeleteHabit}
              onMoveUp={() => handleMoveHabit(index, 'up')}
              onMoveDown={() => handleMoveHabit(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < filteredHabits.length - 1}
            />
          ))}
        </div>
      )}

      {/* Floating Action Buttons on Mobile / Tablet (Matching Screenshot 1) */}
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 flex items-center gap-2.5">
        {/* Floating Overall Analytics Button (left of Add button) */}
        <button
          onClick={() => onOpenAnalyticsModal()}
          title="Overall Analytics"
          className="w-12 h-12 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] shadow-lg border border-[#281b18]/15 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        >
          <BarChart2 size={20} className="text-[#823b28]" />
        </button>

        {/* Floating Add Habit Button */}
        <button
          onClick={onOpenNewHabitModal}
          title="Add Habit"
          className="w-14 h-14 rounded-2xl bg-[#edd8c2] hover:bg-[#823b28] hover:text-[#f6e9d7] text-[#281b18] shadow-xl border border-[#281b18]/20 flex items-center justify-center transition-all active:scale-90 cursor-pointer font-bold"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
