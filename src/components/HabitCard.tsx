import React, { useState } from 'react';
import { Habit } from '../types';
import { 
  Flame, 
  BarChart2, 
  Check, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  formatDateStr, 
  getHabitMetrics, 
  getStreakSegments, 
  getWeekDaysRange 
} from '../utils/habitUtils';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface HabitCardProps {
  habit: Habit;
  todayStr: string;
  isCompactMode: boolean; // if true, collapsed to show name only
  isReorderMode: boolean;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onOpenAnalytics: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  todayStr,
  isCompactMode,
  isReorderMode,
  onToggleDate,
  onOpenAnalytics,
  onEditHabit,
  onDeleteHabit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const metrics = getHabitMetrics(habit, todayStr);
  const isCompletedToday = metrics.isCompletedToday;

  // Calculate the 7-day strip based on weekOffset (0 = current week)
  const refDate = new Date();
  if (weekOffset !== 0) {
    refDate.setDate(refDate.getDate() + weekOffset * 7);
  }
  const weekDates = getWeekDaysRange(refDate, 7);
  const streakSegments = getStreakSegments(weekDates, habit.completedDates || [], todayStr);

  return (
    <div className="group relative bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2.5">
        {/* Left: Checkmark / Target Icon & Habit Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Today Check-in Circle */}
          <button
            onClick={() => onToggleDate(habit.id, todayStr)}
            title={isCompletedToday ? 'Completed today (tap to undo)' : 'Mark completed for today'}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 border ${
              isCompletedToday
                ? 'bg-[#823b28] border-[#823b28] text-[#f6e9d7] shadow-xs scale-105'
                : 'border-[#281b18]/40 bg-transparent hover:border-[#823b28] hover:bg-[#edd8c2]/50 text-transparent'
            }`}
          >
            {isCompletedToday ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full border border-[#281b18]/30" />
            )}
          </button>

          {/* Habit Title with Emoji at beginning & Description */}
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-extrabold text-sm sm:text-base text-[#281b18] tracking-tight uppercase truncate leading-snug">
              {habit.emoji && <span className="mr-1.5 select-none font-normal">{habit.emoji}</span>}
              <span>{habit.name}</span>
            </h3>
            {habit.description && !isCompactMode && (
              <p className="text-[11px] text-[#823b28]/80 truncate mt-0.5">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Flame Streak + Analytics Button + Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Reorder Buttons (if Reorder Mode Active) */}
          {isReorderMode ? (
            <div className="flex items-center gap-1 bg-[#edd8c2] p-1 rounded-2xl border border-[#281b18]/15">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="p-1 rounded-xl text-[#281b18] hover:bg-[#df734c] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#281b18] cursor-pointer"
                title="Move habit up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="p-1 rounded-xl text-[#281b18] hover:bg-[#df734c] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#281b18] cursor-pointer"
                title="Move habit down"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Flame Streak Badge */}
              <div className="flex items-center gap-1">
                <AnalyticInfoButton
                  explanation={{
                    ...ANALYTIC_EXPLANATIONS.habitCurrentStreak,
                    title: `${habit.name} Streak Logic`,
                    currentValue: `Current Streak: ${metrics.currentStreak} Days | Best Streak: ${metrics.bestStreak} Days`,
                  }}
                  variant="icon"
                  iconSize={13}
                />
                <div 
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f6e9d7] border border-[#281b18]/15 text-[#281b18] font-mono text-xs font-bold"
                  title={`Current streak: ${metrics.currentStreak} days | Best streak: ${metrics.bestStreak} days`}
                >
                  <Flame 
                    size={15} 
                    className={metrics.currentStreak > 0 ? 'text-[#df734c] fill-[#df734c]' : 'text-[#823b28]/60'} 
                  />
                  <span>{metrics.currentStreak}</span>
                </div>
              </div>

              {/* Individual Habit Analytics Button */}
              <button
                onClick={() => onOpenAnalytics(habit)}
                title="View Habit Analytics & Calendar"
                className="w-8 h-8 rounded-2xl bg-[#823b28] hover:bg-[#6a2f20] text-[#f6e9d7] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <BarChart2 size={16} />
              </button>

              {/* Context Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-7 h-7 rounded-full text-[#823b28]/70 hover:text-[#281b18] hover:bg-[#edd8c2] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <MoreVertical size={16} />
                </button>

                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)} 
                    />
                    <div className="absolute right-0 top-8 z-50 w-36 bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl shadow-xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEditHabit(habit);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#281b18] hover:bg-[#edd8c2] rounded-xl transition-colors cursor-pointer w-full text-left"
                      >
                        <Edit3 size={14} className="text-[#823b28]" />
                        <span>Edit Habit</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDeleteHabit(habit.id);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer w-full text-left"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Week Strip View (Hidden in Compact Mode) */}
      {!isCompactMode && (
        <div className="mt-4 pt-3 border-t border-[#281b18]/10">
          <div className="flex items-center justify-between gap-1">
            {streakSegments.map((segment) => {
              const { date, dayNum, dayName, isCompleted, isToday, connectionType } = segment;

              // Capsule rounded styling for connected streaks
              let capsuleClass = 'rounded-2xl';
              let bgClass = 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18] border border-[#281b18]/10';

              if (isCompleted) {
                bgClass = 'bg-[#823b28] text-[#f6e9d7] shadow-xs';
                if (connectionType === 'start') {
                  capsuleClass = 'rounded-l-2xl rounded-r-none mr-[-1px] z-10';
                } else if (connectionType === 'middle') {
                  capsuleClass = 'rounded-none mx-[-1px] z-10';
                } else if (connectionType === 'end') {
                  capsuleClass = 'rounded-r-2xl rounded-l-none ml-[-1px] z-10';
                } else {
                  capsuleClass = 'rounded-2xl';
                }
              }

              return (
                <button
                  key={date}
                  onClick={() => onToggleDate(habit.id, date)}
                  title={`${date}: ${isCompleted ? 'Completed' : 'Missed / Pending'} (tap to toggle)`}
                  className={`flex-1 py-2 sm:py-2.5 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer min-w-0 ${capsuleClass} ${bgClass}`}
                >
                  <span className="font-mono text-xs sm:text-sm font-extrabold leading-none">
                    {dayNum}
                  </span>
                  <span
                    className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 leading-none ${
                      isCompleted ? 'text-[#f6e9d7]/80' : 'text-[#823b28]/70'
                    }`}
                  >
                    {dayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
