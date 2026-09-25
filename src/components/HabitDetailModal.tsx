import React, { useState } from 'react';
import { Habit } from '../types';
import { 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Flag, 
  Flame, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Award,
  TrendingUp,
  Activity,
  Compass,
} from 'lucide-react';
import { 
  getHabitMetrics, 
  formatDateStr, 
  getMonthCalendar, 
  parseDateStr, 
  WEEKDAY_MON_FIRST, 
  MONTH_NAMES,
  getStreakSegments
} from '../utils/habitUtils';
import { DeepAnalyticsModal } from './DeepAnalyticsModal';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface HabitDetailModalProps {
  habit: Habit;
  todayStr: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenExpandedCalendar: (habit: Habit) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  todayStr,
  isOpen,
  onClose,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onOpenExpandedCalendar,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [isDeepAnalyticsOpen, setIsDeepAnalyticsOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const metrics = getHabitMetrics(habit, todayStr);
  const monthData = getMonthCalendar(selectedYear, selectedMonth, habit.completedDates || [], todayStr);
  const prevDateObj = new Date(selectedYear, selectedMonth - 1, 1);
  const prevMonthData = getMonthCalendar(prevDateObj.getFullYear(), prevDateObj.getMonth(), habit.completedDates || [], todayStr);
  const twoMonthsList = [prevMonthData, monthData];

  // Month Switcher Helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Circular progress SVG values
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.consistencyPercentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-[#281b18]/60 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Light-Themed Immersive Full-Screen Dashboard Workspace */}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#281b18] tracking-tight uppercase">
                  {habit.name}
                </h2>
                {habit.emoji && <span className="text-xl sm:text-2xl">{habit.emoji}</span>}
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#823b28]/80 uppercase truncate max-w-[250px] sm:max-w-md">
                {habit.description || 'INDIVIDUAL PERFORMANCE INSIGHTS & ANALYTICS'}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeepAnalyticsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              title="Open Deeper Analytics for this Habit"
            >
              <Compass size={14} className="text-[#df734c]" />
              <span>GO MORE DEEP</span>
            </button>

            <button
              onClick={() => onEditHabit(habit)}
              className="w-10 h-10 rounded-full bg-[#edd8c2] hover:bg-[#823b28] hover:text-[#f6e9d7] text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Edit Habit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => {
                onDeleteHabit(habit.id);
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-[#edd8c2] hover:bg-red-600 hover:text-white text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Delete Habit"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Deep Analytics Modal Overlay */}
        <DeepAnalyticsModal
          isOpen={isDeepAnalyticsOpen}
          onClose={() => setIsDeepAnalyticsOpen(false)}
          mode="individual"
          habit={habit}
          todayStr={todayStr}
        />

        {/* Dual-Column Responsive Dashboard Body */}
        <div className="flex-1 overflow-hidden mt-4">
          <div className="w-full h-full lg:grid lg:grid-cols-12 lg:gap-6 flex flex-col overflow-y-auto lg:overflow-hidden pb-4">
            
            {/* Left Analytical Column (Metrics, Ring, Streak Bento) */}
            <div className="lg:col-span-4 lg:h-full lg:overflow-y-auto space-y-4 lg:pr-2 flex flex-col shrink-0">
              
              {/* Circular Consistency Progress Indicator */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider mb-3">
                  Habit Consistency Score
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
                      {metrics.consistencyPercentage}%
                    </span>
                    <span className="text-[10px] font-bold text-[#823b28] uppercase tracking-wider mt-1 font-sans">
                      Target Consistency
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats & Streak Bento Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                
                {/* Started on */}
                <div className="flex items-center gap-3 bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#edd8c2] text-[#823b28] flex items-center justify-center shrink-0 shadow-2xs">
                    <Flag size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                      Started on
                    </span>
                    <span className="text-sm font-black text-[#281b18]">
                      {metrics.startedMonthYear}
                    </span>
                  </div>
                </div>

                {/* Best Streak */}
                <div className="flex items-center gap-3 bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#df734c]/20 text-[#df734c] flex items-center justify-center shrink-0 shadow-2xs">
                    <Flame size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                      Best Streak
                    </span>
                    <span className="text-sm font-black text-[#281b18] flex items-center gap-1">
                      {metrics.bestStreak} {metrics.bestStreak === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Current Streak */}
                <div className="flex items-center gap-3 bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#823b28] text-[#f6e9d7] flex items-center justify-center shrink-0 shadow-2xs">
                    <Zap size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-[#823b28] uppercase font-mono tracking-wider">
                      Current Streak
                    </span>
                    <span className="text-sm font-black text-[#281b18]">
                      {metrics.currentStreak} {metrics.currentStreak === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Total Completions Summary Card */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs flex flex-col justify-center">
                <span className="text-[10px] font-mono font-black text-[#823b28] uppercase tracking-wider mb-2 block">
                  Overall Progress Summary
                </span>
                <div className="flex items-center justify-between bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#823b28]" />
                    <span className="text-xs font-bold text-[#281b18]">Total Recorded Check-ins</span>
                  </div>
                  <span className="font-mono text-sm font-black text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-lg">
                    {habit.completedDates?.length || 0}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Hand Primary Interactive Graph & Calendar Timeline Workspace */}
            <div className="lg:col-span-8 lg:h-full lg:overflow-y-auto space-y-4 lg:pr-2 flex flex-col">
              
              {/* Weekly Progress Linear Graph Section */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-[#edd8c2] text-[#823b28] shadow-2xs">
                      <Activity size={18} />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider block leading-none">
                        LINEAR HABIT TRAJECTORY
                      </span>
                      <h3 className="font-extrabold text-base text-[#281b18] tracking-tight mt-1">
                        Monthly Linear Progress Curve (by Weeks)
                      </h3>
                    </div>
                  </div>

                  {/* Active Month Label */}
                  <div className="font-mono text-xs font-bold text-[#823b28] bg-[#edd8c2] px-3.5 py-1.5 rounded-xl border border-[#281b18]/10 shadow-2xs uppercase">
                    {monthData.monthName} {monthData.year}
                  </div>
                </div>

                {/* SVG Linear Graph Wrapper */}
                {(() => {
                  const weekStats = monthData.weeks.map((week, idx) => {
                    const activeDays = week.filter((d): d is NonNullable<typeof d> => d !== null);
                    const completedCount = activeDays.filter((d) => d.isCompleted).length;
                    const denominator = activeDays.length || 7;
                    const pct = Math.round((completedCount / denominator) * 100);
                    const firstDay = activeDays[0];
                    const lastDay = activeDays[activeDays.length - 1];
                    const subLabel = firstDay && lastDay ? `${firstDay.dayNum}-${lastDay.dayNum}` : '';
                    return {
                      label: `Week ${idx + 1}`,
                      completedCount,
                      totalDays: denominator,
                      pct,
                      subLabel
                    };
                  });

                  const svgWidth = 600;
                  const svgHeight = 200;
                  const paddingX = 40;
                  const paddingTop = 25;
                  const paddingBottom = 40;
                  const usableWidth = svgWidth - paddingX * 2;
                  const usableHeight = svgHeight - paddingTop - paddingBottom;

                  const points = weekStats.map((w, idx) => {
                    const x = paddingX + (idx / (weekStats.length - 1)) * usableWidth;
                    const y = paddingTop + usableHeight - (w.pct / 100) * usableHeight;
                    return {
                      x,
                      y,
                      pct: w.pct,
                      completedCount: w.completedCount,
                      totalDays: w.totalDays,
                      label: w.label,
                      subLabel: w.subLabel
                    };
                  });

                  const pathD = points.reduce((acc, pt, i) => {
                    if (i === 0) return `M ${pt.x} ${pt.y}`;
                    const prev = points[i - 1];
                    const cpX1 = prev.x + (pt.x - prev.x) / 2;
                    const cpY1 = prev.y;
                    const cpX2 = prev.x + (pt.x - prev.x) / 2;
                    const cpY2 = pt.y;
                    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
                  }, '');

                  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + usableHeight} L ${points[0].x} ${paddingTop + usableHeight} Z`;

                  return (
                    <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-4 shadow-inner overflow-hidden">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
                        <defs>
                          <linearGradient id="habitLinearGradExpanded" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#823b28" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#823b28" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>

                        {/* Grid Horizontal Guide Lines with Labels */}
                        {[0, 0.5, 1].map((ratio) => {
                          const y = paddingTop + usableHeight - ratio * usableHeight;
                          return (
                            <g key={ratio}>
                              <line
                                x1={paddingX}
                                y1={y}
                                x2={svgWidth - paddingX}
                                y2={y}
                                stroke="#281b18"
                                strokeOpacity="0.1"
                                strokeDasharray="3 3"
                              />
                              <text
                                x={paddingX - 10}
                                y={y + 3}
                                textAnchor="end"
                                fill="#823b28"
                                opacity="0.65"
                                fontSize="9"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {ratio * 100}%
                              </text>
                            </g>
                          );
                        })}

                        {/* Shaded Area underneath curve */}
                        <path d={areaD} fill="url(#habitLinearGradExpanded)" />

                        {/* Line Path Curve */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#823b28"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data Points, Badges, & X-Axis Week Labels */}
                        {points.map((pt, i) => (
                          <g key={i}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="7"
                              fill="#823b28"
                              stroke="#f6e9d7"
                              strokeWidth="3"
                              className="shadow-2xs"
                            />
                            
                            {/* Percentage Badge */}
                            <g transform={`translate(${pt.x}, ${pt.y - 20})`}>
                              <rect
                                x="-22"
                                y="-8"
                                width="44"
                                height="16"
                                rx="8"
                                fill="#823b28"
                              />
                              <text
                                x="0"
                                y="3"
                                textAnchor="middle"
                                fill="#fbf6ef"
                                fontSize="9"
                                fontWeight="black"
                                fontFamily="monospace"
                              >
                                {pt.pct}%
                              </text>
                            </g>

                            {/* X-Axis Week Date Label */}
                            <text
                              x={pt.x}
                              y={svgHeight - 20}
                              textAnchor="middle"
                              fill="#281b18"
                              fontSize="10"
                              fontWeight="black"
                              fontFamily="monospace"
                            >
                              {pt.label.toUpperCase()}
                            </text>

                            {/* Days Completed Sub-label */}
                            <text
                              x={pt.x}
                              y={svgHeight - 8}
                              textAnchor="middle"
                              fill="#823b28"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {pt.completedCount}/{pt.totalDays} DAYS ({pt.subLabel})
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  );
                })()}
              </div>

              {/* Monthly Progress Calendar Section (2 Months Side-by-Side) with Expand Button */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-[#edd8c2] text-[#823b28]">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider block">
                        MONTHLY INTERACTIVE LOGGER
                      </span>
                      <h3 className="font-extrabold text-base text-[#281b18] tracking-tight">
                        Two-Month Progress Grid
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Month Navigation */}
                    <div className="flex items-center bg-[#edd8c2] rounded-xl p-0.5 border border-[#281b18]/10">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                        title="Previous 2 Months"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="font-mono text-xs font-bold text-[#823b28] px-3 text-center truncate max-w-[200px]">
                        {prevMonthData.monthName.toUpperCase()} – {monthData.monthName.toUpperCase()} {monthData.year}
                      </span>
                      <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                        title="Next 2 Months"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>

                    {/* Expand to Full Yearly Calendar Button */}
                    <button
                      onClick={() => onOpenExpandedCalendar(habit)}
                      className="w-10 h-10 rounded-xl bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                      title="Open Full Yearly Calendar Matrix"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 2 Months Side by Side Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  {twoMonthsList.map((m) => (
                    <div key={`${m.year}-${m.month}`} className="bg-[#f6e9d7]/70 border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#281b18]/10">
                        <span className="font-mono text-xs font-black text-[#823b28] uppercase tracking-wider">
                          {m.monthName} {m.year}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[#823b28]/70">
                          {m.weeks.flat().filter(s => s?.isCompleted).length} COMPLETIONS
                        </span>
                      </div>

                      {/* Day Headers (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
                      <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
                        {WEEKDAY_MON_FIRST.map((d) => (
                          <span key={d} className="font-mono text-[9px] font-black text-[#823b28]/80 uppercase">
                            {d.slice(0, 3)}
                          </span>
                        ))}
                      </div>

                      {/* Weeks Rows */}
                      <div className="space-y-1.5">
                        {m.weeks.map((week, wIdx) => (
                          <div key={wIdx} className="grid grid-cols-7 gap-1.5">
                            {week.map((seg, sIdx) => {
                              if (!seg) {
                                return <div key={sIdx} className="aspect-square rounded-lg bg-transparent opacity-0 pointer-events-none" />;
                              }

                              let capsuleClass = 'rounded-lg';
                              if (seg.isCompleted) {
                                if (seg.connectionType === 'start') {
                                  capsuleClass = 'rounded-l-lg rounded-r-none mr-[-1px] z-10';
                                } else if (seg.connectionType === 'middle') {
                                  capsuleClass = 'rounded-none mx-[-1px] z-10';
                                } else if (seg.connectionType === 'end') {
                                  capsuleClass = 'rounded-r-lg rounded-l-none ml-[-1px] z-10';
                                } else {
                                  capsuleClass = 'rounded-lg';
                                }
                              }

                              return (
                                <button
                                  key={seg.date}
                                  onClick={() => onToggleDate(habit.id, seg.date)}
                                  title={`${seg.date}: ${seg.isCompleted ? 'Completed' : 'Pending'} - Tap to Toggle`}
                                  className={`aspect-square flex items-center justify-center text-xs font-black font-mono transition-all cursor-pointer border ${capsuleClass} ${
                                    seg.isCompleted
                                      ? 'bg-[#823b28] border-transparent text-[#f6e9d7] shadow-2xs hover:scale-105'
                                      : 'bg-[#f6e9d7] border-[#281b18]/10 hover:border-[#df734c]/30 text-[#281b18] hover:bg-[#edd8c2]'
                                  }`}
                                >
                                  {seg.dayNum}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid Color Indicator/Help Prompt */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#823b28] pt-2 border-t border-[#281b18]/10">
                  <span>* Tap any date inside the two-month grid to manually log/toggle habit check-ins</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#823b28] rounded-sm inline-block" />
                    <span>Completed</span>
                    <span className="w-3 h-3 bg-[#f6e9d7] border border-[#281b18]/10 rounded-sm inline-block ml-2" />
                    <span>Pending</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
