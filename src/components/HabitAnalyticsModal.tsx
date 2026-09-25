import React, { useState } from 'react';
import { Habit } from '../types';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  BarChart2, 
  Flame, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Sparkles,
  Compass,
  X
} from 'lucide-react';
import { 
  calculateOverallAnalytics, 
  formatDateStr, 
  MONTH_NAMES,
  WEEKDAY_MON_FIRST 
} from '../utils/habitUtils';
import { DeepAnalyticsModal } from './DeepAnalyticsModal';

interface HabitAnalyticsModalProps {
  habits: Habit[];
  todayStr: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectHabit?: (habit: Habit) => void;
}

export const HabitAnalyticsModal: React.FC<HabitAnalyticsModalProps> = ({
  habits,
  todayStr,
  isOpen,
  onClose,
  onSelectHabit,
}) => {
  const [heatmapMonthOffset, setHeatmapMonthOffset] = useState<number>(0);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(todayStr);
  const [isHeatmapExpanded, setIsHeatmapExpanded] = useState<boolean>(false);
  const [expandedMonthDate, setExpandedMonthDate] = useState<Date>(() => new Date());
  const [isDeepAnalyticsOpen, setIsDeepAnalyticsOpen] = useState<boolean>(false);

  const analytics = calculateOverallAnalytics(habits, todayStr);

  // Circular progress SVG values
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analytics.overallConsistency / 100) * circumference;

  // Generate 8-week Heatmap Matrix (Mon-Sun rows x 8 week columns)
  const currentMonday = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + heatmapMonthOffset * 28);
    return d;
  })();

  const heatmapWeeks: { label: string; days: { dateStr: string; dayNum: number; count: number; maxHabits: number }[] }[] = [];
  const maxHabitsCount = Math.max(1, habits.length);

  for (let w = 0; w < 8; w++) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - (7 - w) * 7);

    const monthStr = MONTH_NAMES[weekStart.getMonth()].slice(0, 3);
    const label = `${monthStr} ${weekStart.getDate()}`;

    const days: { dateStr: string; dayNum: number; count: number; maxHabits: number }[] = [];
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + dayIdx);
      const dateStr = formatDateStr(dayDate);

      const count = habits.filter((h) => !h.excludeFromAnalytics && (h.completedDates || []).includes(dateStr)).length;
      days.push({
        dateStr,
        dayNum: dayDate.getDate(),
        count,
        maxHabits: maxHabitsCount,
      });
    }
    heatmapWeeks.push({ label, days });
  }

  // Generate 12-Month Calendar Grid for Expanded Habit Heatmap
  const displayYear = expandedMonthDate.getFullYear();

  const annualMonthsData = React.useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(displayYear, m + 1, 0).getDate();
      const firstDayIndex = (new Date(displayYear, m, 1).getDay() + 6) % 7; // Monday-first

      const days: Array<{
        dayNumber: number;
        dateStr: string;
        count: number;
        maxHabits: number;
      } | null> = [];

      // Pads the grid
      for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const monthStr = String(m + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateStr = `${displayYear}-${monthStr}-${dayStr}`;
        const count = habits.filter((h) => !h.excludeFromAnalytics && (h.completedDates || []).includes(dateStr)).length;

        days.push({
          dayNumber: d,
          dateStr,
          count,
          maxHabits: maxHabitsCount,
        });
      }

      months.push({
        monthIndex: m,
        monthName: MONTH_NAMES[m],
        days,
      });
    }
    return months;
  }, [displayYear, habits, maxHabitsCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/40 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full h-full bg-[#f6e9d7] p-5 sm:p-6 shadow-2xl text-[#281b18] overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#281b18]/15 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-[#281b18] tracking-tight">
                Overall Habits Dashboard
              </h2>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#823b28]/80">
                AGGREGATED PERFORMANCE ANALYTICS & TRENDS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeepAnalyticsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              title="Open Deeper Analytics"
            >
              <Compass size={14} className="text-[#df734c]" />
              <span>GO MORE DEEP</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Deep Analytics Modal Overlay */}
        <DeepAnalyticsModal
          isOpen={isDeepAnalyticsOpen}
          onClose={() => setIsDeepAnalyticsOpen(false)}
          mode="overall"
          habits={habits}
          todayStr={todayStr}
        />

        {/* Full-Screen Multi-Column Dashboard Workspace */}
        <div className="flex-1 overflow-hidden mt-4">
          <div className="w-full h-full lg:grid lg:grid-cols-12 lg:gap-6 flex flex-col overflow-y-auto lg:overflow-hidden pb-4">
            
            {/* Left Hand Analytical Column (Metrics, Ring, Breakdown) */}
            <div className="lg:col-span-4 lg:h-full lg:overflow-y-auto space-y-4 lg:pr-2 flex flex-col shrink-0">
              
              {/* Circular Consistency Progress Indicator */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider mb-3">
                  Overall Consistency Ratio
                </span>
                
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#edd8c2"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#823b28"
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-extrabold text-2xl sm:text-3xl text-[#281b18] font-mono leading-none">
                      {analytics.overallConsistency}%
                    </span>
                    <span className="text-[10px] font-bold text-[#823b28] uppercase tracking-wider mt-1 font-sans">
                      Consistency Goal
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick KPI Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-3.5 text-center shadow-2xs">
                  <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                    Today
                  </span>
                  <p className="text-lg font-extrabold text-[#281b18] font-mono mt-0.5">
                    {analytics.completedTodayCount}/{analytics.totalHabits}
                  </p>
                </div>

                <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-3.5 text-center shadow-2xs">
                  <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                    Streaks
                  </span>
                  <p className="text-lg font-extrabold text-[#df734c] font-mono mt-0.5 flex items-center justify-center gap-1">
                    <Flame size={14} /> {analytics.activeStreaksCount}
                  </p>
                </div>

                <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-3.5 text-center shadow-2xs">
                  <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                    Check-ins
                  </span>
                  <p className="text-lg font-extrabold text-[#281b18] font-mono mt-0.5">
                    {analytics.totalCheckIns}
                  </p>
                </div>

                <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-3.5 text-center shadow-2xs">
                  <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                    Habits Count
                  </span>
                  <p className="text-lg font-extrabold text-[#281b18] font-mono mt-0.5">
                    {analytics.totalHabits}
                  </p>
                </div>
              </div>

              {/* Top Consistent Habits */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs flex flex-col">
                <span className="text-[10px] font-mono font-black text-[#823b28] uppercase tracking-wider mb-3">
                  Top Consistency Leaderboard
                </span>
                <div className="space-y-2">
                  {analytics.ranking.slice(0, 4).map((rankItem, index) => (
                    <div
                      key={rankItem.habitId}
                      className="flex items-center justify-between gap-2 bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl px-3.5 py-2 hover:border-[#df734c]/30 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-black text-[#df734c]">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-extrabold text-[#281b18] truncate uppercase">
                          {rankItem.name} {rankItem.emoji}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-black text-[#823b28]">
                        {rankItem.consistency}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-of-Week Distribution Breakdowns */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-[#823b28]">
                    <span className="w-1.5 h-3 bg-[#823b28] rounded-full" />
                    <span className="w-1.5 h-4 bg-[#df734c] rounded-full" />
                    <span className="w-1.5 h-2 bg-[#823b28] rounded-full" />
                  </div>
                  <h3 className="font-black text-xs text-[#281b18] uppercase tracking-wider">
                    Weekday Habit Distribution
                  </h3>
                </div>

                <div className="space-y-2 pt-1">
                  {analytics.weekdayBreakdown.map((wb) => (
                    <div key={wb.fullDayName} className="flex items-center gap-3">
                      <span className="w-6 font-mono text-[10px] font-black text-[#823b28]">
                        {wb.dayName}
                      </span>
                      <div className="flex-1 h-3.5 bg-[#edd8c2] rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-[#823b28] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, wb.completionPercentage)}%` }}
                        />
                      </div>
                      <span className="w-10 font-mono text-[10px] font-bold text-right text-[#281b18]">
                        {wb.completionsCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Hand Primary Interactive Heatmap Dashboard Area */}
            <div className="lg:col-span-8 lg:h-full lg:overflow-y-auto space-y-4 lg:pr-2 flex flex-col">
              
              {/* Interactive Contribution/Heatmap Main Workspace Panel */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm flex flex-col flex-1 min-h-[450px]">
                
                {/* Heatmap Layout Header Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#281b18]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-[#edd8c2] text-[#823b28] shadow-2xs">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider block leading-none">
                        Habit Contribution Timeline
                      </span>
                      <h3 className="font-extrabold text-base text-[#281b18] tracking-tight mt-1">
                        {isHeatmapExpanded
                          ? `Annual 12-Month Calendar Grid: ${displayYear}`
                          : 'Habit Matrix (8-Week Timeline view)'}
                      </h3>
                    </div>
                  </div>

                  {/* Range Toggles & View Selectors */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    {isHeatmapExpanded ? (
                      <div className="flex items-center bg-[#edd8c2] rounded-xl p-0.5 border border-[#281b18]/10">
                        <button
                          onClick={() => {
                            const prev = new Date(expandedMonthDate);
                            prev.setFullYear(prev.getFullYear() - 1);
                            setExpandedMonthDate(prev);
                          }}
                          className="p-1 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] cursor-pointer"
                          title="Previous Year"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="font-mono text-xs font-bold text-[#281b18] px-2.5 min-w-[70px] text-center">
                          {displayYear}
                        </span>
                        <button
                          onClick={() => {
                            const next = new Date(expandedMonthDate);
                            next.setFullYear(next.getFullYear() + 1);
                            setExpandedMonthDate(next);
                          }}
                          className="p-1 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] cursor-pointer"
                          title="Next Year"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center bg-[#edd8c2] rounded-xl p-0.5 border border-[#281b18]/10">
                        <button
                          onClick={() => setHeatmapMonthOffset(heatmapMonthOffset - 1)}
                          className="p-1.5 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                          title="Earlier Offset"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="font-mono text-xs font-bold text-[#281b18] px-2 text-center">
                          8-Week Offset
                        </span>
                        <button
                          onClick={() => setHeatmapMonthOffset(heatmapMonthOffset + 1)}
                          disabled={heatmapMonthOffset >= 0}
                          className="p-1.5 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] disabled:opacity-30 disabled:hover:bg-[#edd8c2] transition-colors cursor-pointer"
                          title="Later Offset"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsHeatmapExpanded(!isHeatmapExpanded)}
                      className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Maximize2 size={13} />
                      <span>{isHeatmapExpanded ? '8-Week Timeline' : 'Annual Grid'}</span>
                    </button>
                  </div>
                </div>

                {/* Main Dynamic Viewport Container */}
                <div className="flex-1 py-4">
                  {isHeatmapExpanded ? (
                    /* OPTIMIZED VIEW A: Expanded 12-Month Grid of Highly Legible Mini Heatmaps */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[62vh] overflow-y-auto pr-1.5 py-1 animate-in fade-in duration-200">
                      {annualMonthsData.map((month) => (
                        <div
                          key={month.monthIndex}
                          className="bg-[#fbf6ef] border border-[#281b18]/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#df734c]/30 transition-all"
                        >
                          <h4 className="font-mono text-xs sm:text-sm font-black text-[#823b28] uppercase tracking-wider text-center border-b border-[#281b18]/10 pb-1.5 mb-3">
                            {month.monthName}
                          </h4>
                          
                          <div className="grid grid-cols-7 gap-0.5 text-center font-mono text-[9px] sm:text-xs font-black text-[#823b28]/60 uppercase mb-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                              <div key={dIdx}>{day}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1.5">
                            {month.days.map((item, idx) => {
                              if (!item) {
                                return <div key={`empty-${idx}`} className="aspect-square bg-transparent opacity-0 pointer-events-none" />;
                              }

                              const isSelected = selectedHeatmapDate === item.dateStr;
                              const isToday = item.dateStr === todayStr;

                              let intensityBg = 'bg-[#f6e9d7]/40 border border-[#281b18]/5 text-[#281b18]/70';
                              if (item.count > 0) {
                                const ratio = item.count / item.maxHabits;
                                if (ratio >= 0.75) intensityBg = 'bg-[#823b28] text-[#f6e9d7] shadow-2xs font-extrabold';
                                else if (ratio >= 0.5) intensityBg = 'bg-[#df734c] text-white';
                                else if (ratio >= 0.25) intensityBg = 'bg-[#d4aa86] text-[#281b18]';
                                else intensityBg = 'bg-[#edd8c2] text-[#281b18]';
                              }

                              return (
                                <button
                                  key={item.dateStr}
                                  onClick={() => setSelectedHeatmapDate(item.dateStr)}
                                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black font-mono cursor-pointer transition-all border ${intensityBg} ${
                                    isSelected ? 'ring-2.5 ring-[#823b28] scale-115 z-10 shadow-md' : ''
                                  } ${isToday ? 'border-[#281b18] font-black ring-1 ring-[#281b18]' : 'border-transparent'}`}
                                  title={`${item.dateStr}: ${item.count} completed`}
                                >
                                  <span className="leading-none">{item.dayNumber}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* VIEW B: 8-Week Column Matrix */
                    <div className="overflow-x-auto pb-2 h-full flex items-center">
                      <div className="grid grid-cols-9 gap-2.5 min-w-[500px] w-full">
                        {/* Weekday labels */}
                        <div className="flex flex-col gap-2 pt-6">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((wd, i) => (
                            <div
                              key={i}
                              className="w-10 h-8 flex items-center justify-center bg-[#edd8c2] rounded-xl text-[10px] font-black text-[#823b28] uppercase font-mono"
                            >
                              {wd}
                            </div>
                          ))}
                        </div>

                        {/* 8 Week Columns */}
                        {heatmapWeeks.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-2">
                            <span className="text-[10px] font-mono font-bold text-center text-[#823b28] uppercase truncate h-4">
                              {week.label}
                            </span>
                            {week.days.map((day) => {
                              const isSelected = selectedHeatmapDate === day.dateStr;
                              let intensityBg = 'bg-[#f6e9d7]/70 border border-[#281b18]/5';
                              if (day.count > 0) {
                                const ratio = day.count / day.maxHabits;
                                if (ratio >= 0.75) {
                                  intensityBg = 'bg-[#823b28] text-white shadow-2xs';
                                } else if (ratio >= 0.5) {
                                  intensityBg = 'bg-[#df734c] text-white';
                                } else if (ratio >= 0.25) {
                                  intensityBg = 'bg-[#d4aa86] text-[#281b18]';
                                } else {
                                  intensityBg = 'bg-[#edd8c2] text-[#281b18]';
                                }
                              }

                              const isToday = day.dateStr === todayStr;

                              return (
                                <button
                                  key={day.dateStr}
                                  onClick={() => setSelectedHeatmapDate(day.dateStr)}
                                  className={`w-full h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${intensityBg} ${
                                    isSelected ? 'ring-2.5 ring-[#823b28] scale-110 z-10 shadow-sm' : ''
                                  } ${isToday ? 'border-[#df734c] font-black ring-1.5 ring-[#df734c]' : 'border-transparent'}`}
                                  title={`${day.dateStr}: ${day.count}/${day.maxHabits} completed`}
                                >
                                  <span className="font-mono text-[11px] font-black">{day.dayNum}</span>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Day Details Completion Logger Panel (Bottom half) */}
                {selectedHeatmapDate && (
                  <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-4.5 space-y-3 animate-in fade-in duration-150 shrink-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-mono font-black text-[#281b18] tracking-wider">
                        COMPLETED HABITS FOR: {new Date(selectedHeatmapDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }).toUpperCase()}
                      </h4>
                      <span className="font-mono text-[10px] font-bold text-[#823b28] bg-[#edd8c2] px-3 py-0.5 rounded-full">
                        {habits.filter((h) => !h.excludeFromAnalytics && (h.completedDates || []).includes(selectedHeatmapDate)).length} of {habits.length} Completed
                      </span>
                    </div>

                    {habits.filter((h) => !h.excludeFromAnalytics && (h.completedDates || []).includes(selectedHeatmapDate)).length === 0 ? (
                      <p className="text-xs text-[#823b28]/60 italic font-medium">
                        No habits recorded on this date. Use the main screen logger to stay consistent!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {habits.filter((h) => !h.excludeFromAnalytics && (h.completedDates || []).includes(selectedHeatmapDate)).map((h) => (
                          <span
                            key={h.id}
                            className="inline-flex items-center gap-2 bg-[#823b28] text-[#fbf6ef] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs border border-transparent hover:border-[#df734c]/30 cursor-pointer transition-all"
                            onClick={() => onSelectHabit && onSelectHabit(h)}
                          >
                            <span className="text-sm">{h.emoji}</span>
                            <span>{h.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Color Legend Footer */}
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#281b18]/10 text-[10px] font-mono text-[#823b28] mt-3 shrink-0">
                  <span>Less Completion</span>
                  <div className="w-3.5 h-3.5 rounded bg-[#f6e9d7] border border-[#281b18]/10" />
                  <div className="w-3.5 h-3.5 rounded bg-[#edd8c2]" />
                  <div className="w-3.5 h-3.5 rounded bg-[#d4aa86]" />
                  <div className="w-3.5 h-3.5 rounded bg-[#df734c]" />
                  <div className="w-3.5 h-3.5 rounded bg-[#823b28]" />
                  <span>More Completion</span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
