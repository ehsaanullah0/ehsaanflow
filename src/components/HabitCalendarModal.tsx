import React, { useState } from 'react';
import { Habit } from '../types';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Calendar as CalendarIcon 
} from 'lucide-react';
import { 
  getMonthCalendar, 
  MONTH_NAMES, 
  WEEKDAY_MON_FIRST,
  formatDateStr
} from '../utils/habitUtils';

interface HabitCalendarModalProps {
  habit: Habit;
  todayStr: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
}

export const HabitCalendarModal: React.FC<HabitCalendarModalProps> = ({
  habit,
  todayStr,
  isOpen,
  onClose,
  onToggleDate,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);

  if (!isOpen) return null;

  // For monthly view: display latest 2 months side by side in a 2-column grid
  const currentDate = new Date();
  const monthsToDisplay = [1, 0].map((offset) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - offset - selectedMonthOffset, 1);
    return getMonthCalendar(d.getFullYear(), d.getMonth(), habit.completedDates || [], todayStr);
  });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-0 bg-[#281b18]/60 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Light-Themed Immersive Full-Screen Calendar Workspace */}
      <div className="bg-[#fbf6ef] text-[#281b18] w-full h-full p-5 sm:p-6 relative flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#281b18]/10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#281b18] tracking-tight uppercase">
                  Extended Calendar
                </h2>
                {habit.emoji && <span className="text-xl sm:text-2xl">{habit.emoji}</span>}
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#823b28]/80 uppercase truncate max-w-[200px] sm:max-w-md">
                {habit.name} &bull; COMPREHENSIVE TIMELINE ARCHIVE
              </span>
            </div>
          </div>

          {/* Central Mode Switcher for Desktop */}
          <div className="hidden md:flex items-center bg-[#edd8c2] border border-[#281b18]/15 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                  : 'text-[#823b28] hover:text-[#281b18]'
              }`}
            >
              Monthly Archive
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer ${
                viewMode === 'yearly'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                  : 'text-[#823b28] hover:text-[#281b18]'
              }`}
            >
              Yearly Matrix
            </button>
          </div>

          {/* Close Action */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation & Controls Row (Mobile & Switcher Adjustments) */}
        <div className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-[#281b18]/5">
          {/* Mobile switcher view */}
          <div className="flex md:hidden items-center bg-[#edd8c2] border border-[#281b18]/15 rounded-2xl p-1 gap-1 w-full">
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex-1 px-4 py-2 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer text-center ${
                viewMode === 'monthly'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                  : 'text-[#823b28]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`flex-1 px-4 py-2 rounded-xl text-xs font-extrabold font-mono transition-all cursor-pointer text-center ${
                viewMode === 'yearly'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                  : 'text-[#823b28]'
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="flex items-center justify-between w-full">
            {/* Context Title Info */}
            <div className="text-xs font-mono text-[#823b28]/80 font-black uppercase">
              {viewMode === 'monthly' ? (
                <span>Currently Viewing: 2-Month Side-By-Side Window</span>
              ) : (
                <span>Currently Viewing: Annual Calendar Grid</span>
              )}
            </div>

            {/* Pagination controls */}
            {viewMode === 'yearly' && (
              <div className="flex items-center gap-2 bg-[#edd8c2] border border-[#281b18]/15 rounded-2xl px-3 py-1.5 shadow-2xs">
                <button
                  onClick={() => setCurrentYear(currentYear - 1)}
                  className="p-1 rounded-lg text-[#823b28] hover:bg-[#fbf6ef] cursor-pointer transition-colors"
                  title="Previous Year"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-mono text-sm font-black text-[#281b18] px-2">
                  {currentYear}
                </span>
                <button
                  onClick={() => setCurrentYear(currentYear + 1)}
                  className="p-1 rounded-lg text-[#823b28] hover:bg-[#fbf6ef] cursor-pointer transition-colors"
                  title="Next Year"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedMonthOffset(selectedMonthOffset + 2)}
                  className="px-3 py-1.5 rounded-xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <ChevronLeft size={14} /> Earlier
                </button>
                {selectedMonthOffset > 0 && (
                  <button
                    onClick={() => setSelectedMonthOffset(Math.max(0, selectedMonthOffset - 2))}
                    className="px-3 py-1.5 rounded-xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    Recent <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Immersive Body */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 pb-8">
          {viewMode === 'monthly' ? (
            /* Premium Balanced 2-Month Side by Side Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {monthsToDisplay.map((monthData) => {
                const totalCheckIns = (habit.completedDates || []).filter((d) =>
                  d.startsWith(`${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}`)
                ).length;

                return (
                  <div
                    key={`${monthData.year}-${monthData.month}`}
                    className="bg-[#edd8c2]/35 border border-[#281b18]/15 rounded-3xl p-5 shadow-2xs flex flex-col justify-between min-h-[300px]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#281b18]/10 pb-2.5 mb-3">
                      <h3 className="font-extrabold text-base text-[#281b18] tracking-tight uppercase font-sans">
                        {monthData.monthName} {monthData.year}
                      </h3>
                      <span className="font-mono text-[10px] text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full font-extrabold border border-[#281b18]/10">
                        {totalCheckIns} Check-ins
                      </span>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] font-black text-[#823b28]/70 uppercase mb-2 border-b border-[#281b18]/10 pb-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>

                    {/* Month Days 7-Column Grid */}
                    <div className="grid grid-cols-7 gap-1.5 flex-1">
                      {monthData.weeks
                        .flatMap((w) => w)
                        .map((seg, sIdx) => {
                          if (!seg) {
                            return (
                              <div
                                key={`empty-${sIdx}`}
                                className="aspect-square opacity-0 pointer-events-none"
                              />
                            );
                          }

                          const isToday = seg.date === todayStr;

                          return (
                            <button
                              key={seg.date}
                              onClick={() => onToggleDate(habit.id, seg.date)}
                              title={`${seg.date}: ${
                                seg.isCompleted ? 'Completed' : 'Pending'
                              } - Tap to Toggle`}
                              className={`aspect-square rounded-xl flex items-center justify-center font-mono text-xs sm:text-sm font-black transition-all cursor-pointer border ${
                                seg.isCompleted
                                  ? 'bg-[#823b28] border-transparent text-[#f6e9d7] shadow-2xs hover:scale-105 z-10'
                                  : 'bg-[#f6e9d7] border-[#281b18]/10 text-[#281b18] hover:bg-[#edd8c2] hover:border-[#df734c]/40'
                              } ${isToday ? 'ring-2 ring-[#281b18]' : ''}`}
                            >
                              {seg.dayNum}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Yearly Mini-Calendar 12-Month Grid: Matches Insights 12-Month panel styling */
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {MONTH_NAMES.map((mName, mIdx) => {
                  const mData = getMonthCalendar(
                    currentYear,
                    mIdx,
                    habit.completedDates || [],
                    todayStr
                  );
                  const totalCompletedInMonth = (habit.completedDates || []).filter((d) =>
                    d.startsWith(`${currentYear}-${String(mIdx + 1).padStart(2, '0')}`)
                  ).length;

                  return (
                    <div
                      key={mName}
                      className="bg-[#edd8c2]/35 border border-[#281b18]/15 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5 flex flex-col justify-between hover:border-[#281b18]/30 transition-all"
                    >
                      {/* Month Header */}
                      <div className="flex items-center justify-between border-b border-[#281b18]/10 pb-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-[#281b18] tracking-wider uppercase">
                          {mName}
                        </span>
                        {totalCompletedInMonth > 0 ? (
                          <span className="text-[9px] font-mono font-bold text-[#823b28] bg-[#edd8c2] px-2 py-0.5 rounded-full border border-[#281b18]/10">
                            {totalCompletedInMonth} check-ins
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-[#823b28]/40">0 check-ins</span>
                        )}
                      </div>

                      {/* Weekday Labels Header */}
                      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-black text-[#823b28]/70 uppercase border-b border-[#281b18]/10 pb-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                          <div key={dIdx}>{day}</div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {mData.weeks
                          .flatMap((w) => w)
                          .map((seg, sIdx) => {
                            if (!seg) {
                              return (
                                <div
                                  key={`empty-${sIdx}`}
                                  className="aspect-square opacity-0 pointer-events-none"
                                />
                              );
                            }

                            const isToday = seg.date === todayStr;

                            return (
                              <button
                                key={seg.date}
                                onClick={() => onToggleDate(habit.id, seg.date)}
                                title={`${seg.date}: ${
                                  seg.isCompleted ? 'Completed' : 'Missed'
                                } - Tap to Toggle`}
                                className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center font-mono text-[10px] sm:text-xs font-black transition-all cursor-pointer border ${
                                  seg.isCompleted
                                    ? 'bg-[#823b28] border-transparent text-[#f6e9d7] shadow-2xs hover:scale-105 z-10'
                                    : 'bg-[#f6e9d7] border-[#281b18]/10 text-[#281b18] hover:bg-[#edd8c2] hover:border-[#df734c]/40'
                                } ${isToday ? 'ring-1.5 ring-[#281b18]' : ''}`}
                              >
                                {seg.dayNum}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info prompt bar */}
        <div className="mt-auto shrink-0 border-t border-[#281b18]/10 pt-3 flex items-center justify-between text-[10px] font-mono text-[#823b28] uppercase">
          <span>* Tap any date inside the monthly matrix or yearly grid to manually log/toggle progress</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#823b28] rounded-sm inline-block" />
            <span>Completed</span>
            <span className="w-2.5 h-2.5 bg-[#f6e9d7] border border-[#281b18]/10 rounded-sm inline-block ml-2" />
            <span>Pending</span>
          </div>
        </div>

      </div>
    </div>
  );
};
