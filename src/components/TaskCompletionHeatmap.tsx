import React, { useState, useMemo } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Calendar as CalendarIcon,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Task } from '../types';
import { isTaskCompletedOnDate } from '../utils/habitUtils';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface TaskCompletionHeatmapProps {
  tasks: Task[];
  className?: string;
}

export const TaskCompletionHeatmap: React.FC<TaskCompletionHeatmapProps> = ({
  tasks,
  className = '',
}) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(() => new Date());
  const [hoveredCell, setHoveredCell] = useState<{
    dateKey: string;
    formattedDate: string;
    weekday: string;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    ratio: number;
    level: number;
  } | null>(null);

  // Helper to calculate completion stats for any given date string (YYYY-MM-DD)
  const getDateTaskStats = (dateKey: string) => {
    const dayTasks = tasks.filter((t) => {
      if (t.dueDate === dateKey) return true;
      if (t.isRecurring === 'daily') {
        const start = t.startDate || t.dueDate || t.createdAt.split('T')[0];
        const startMonth = start.substring(0, 7);
        const dateMonth = dateKey.substring(0, 7);
        return dateKey >= start && dateMonth === startMonth;
      }
      if (t.isRecurring === 'duration' && t.startDate && t.endDate) {
        return dateKey >= t.startDate && dateKey <= t.endDate;
      }
      if (t.startDate && t.dueDate) {
        return dateKey >= t.startDate && dateKey <= t.dueDate;
      }
      return false;
    });
    const completedTasks = dayTasks.filter((t) => isTaskCompletedOnDate(t, dateKey));
    const pendingTasks = dayTasks.filter((t) => !isTaskCompletedOnDate(t, dateKey));
    const totalTasks = dayTasks.length;
    const ratio = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Intensity Level
    // 0 = No tasks
    // 1 = 1% - 39%
    // 2 = 40% - 74%
    // 3 = 75% - 99%
    // 4 = 100% completion (or 5 for perfect 100% highlight)
    let level = 0;
    if (totalTasks > 0) {
      if (ratio === 100) level = 4;
      else if (ratio >= 70) level = 3;
      else if (ratio >= 40) level = 2;
      else if (ratio > 0) level = 1;
      else level = 0; // 0% but has tasks
    }

    return {
      dateKey,
      totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      ratio,
      level,
      hasTasks: totalTasks > 0,
      isPerfect: totalTasks > 0 && ratio === 100,
    };
  };

  // Color mapping matching the warm editorial palette
  const getCellColorClass = (
    level: number,
    hasTasks: boolean,
    isPerfect: boolean,
    isSelected: boolean
  ): string => {
    const ring = isSelected ? 'ring-2 ring-[#823b28] scale-105 z-10' : '';

    if (!hasTasks) {
      return `bg-[#edd8c2] hover:bg-[#e4cbaf] border border-[#281b18]/10 text-[#823b28]/50 ${ring}`;
    }

    if (isPerfect) {
      return `bg-[#823b28] text-[#f6e9d7] shadow-xs ${ring}`; // Perfect 100%
    }

    switch (level) {
      case 3:
        return `bg-[#df734c] text-white ${ring}`; // 70-99%
      case 2:
        return `bg-[#eb9d7d] text-[#281b18] ${ring}`; // 40-69%
      case 1:
        return `bg-[#f5c3af] text-[#281b18] ${ring}`; // 1-39%
      case 0:
      default:
        // Has tasks but 0% completed
        return `bg-[#f0dfcc] border border-[#df734c]/40 text-[#823b28] ${ring}`;
    }
  };

  // --- Recent 2-Months Dual Grid Calculation ---
  const twoMonthsData = useMemo(() => {
    const m2Date = activeMonthDate;
    const m1Date = new Date(m2Date.getFullYear(), m2Date.getMonth() - 1, 1);

    const calculateSingleMonth = (dateObj: Date) => {
      const year = dateObj.getFullYear();
      const monthIndex = dateObj.getMonth();
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const firstDayIndex = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

      const days: Array<{
        dayNumber: number;
        dateKey: string;
        weekday: string;
        stats: ReturnType<typeof getDateTaskStats>;
        isToday: boolean;
      } | null> = [];

      for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateKey = `${year}-${monthStr}-${dayStr}`;
        const stats = getDateTaskStats(dateKey);
        const isToday = dateKey === todayStr;
        const weekday = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
        });

        days.push({
          dayNumber: d,
          dateKey,
          weekday,
          stats,
          isToday,
        });
      }

      const activeDays = days.filter(
        (d): d is NonNullable<typeof d> => d !== null && d.stats.hasTasks
      );
      const totalTasks = activeDays.reduce((acc, d) => acc + d.stats.totalTasks, 0);
      const totalCompleted = activeDays.reduce((acc, d) => acc + d.stats.completedTasks, 0);
      const avgRatio =
        totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
      const perfectDaysCount = activeDays.filter((d) => d.stats.isPerfect).length;

      return {
        year,
        monthIndex,
        monthName,
        days,
        activeDaysCount: activeDays.length,
        totalTasks,
        totalCompleted,
        avgRatio,
        perfectDaysCount,
      };
    };

    return [calculateSingleMonth(m1Date), calculateSingleMonth(m2Date)];
  }, [activeMonthDate, tasks, todayStr]);

  // --- Annual 12-Month Calendar Grid Calculation ---
  const displayYear = activeMonthDate.getFullYear();

  const annualTasksMonthsData = useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(displayYear, m + 1, 0).getDate();
      const firstDayIndex = (new Date(displayYear, m, 1).getDay() + 6) % 7; // Monday-first index

      const days: Array<{
        dayNumber: number;
        dateKey: string;
        weekday: string;
        stats: ReturnType<typeof getDateTaskStats>;
        isToday: boolean;
      } | null> = [];

      for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const monthStr = String(m + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateKey = `${displayYear}-${monthStr}-${dayStr}`;
        const stats = getDateTaskStats(dateKey);
        const isToday = dateKey === todayStr;
        const weekday = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
        });

        days.push({
          dayNumber: d,
          dateKey,
          weekday,
          stats,
          isToday,
        });
      }

      months.push({
        monthIndex: m,
        monthName: new Date(displayYear, m, 1).toLocaleDateString('en-US', { month: 'long' }),
        days,
      });
    }
    return months;
  }, [displayYear, tasks, todayStr]);

  // Year summary stats
  const allYearDaysWithTasks = useMemo(() => {
    return annualTasksMonthsData
      .flatMap((m) => m.days)
      .filter((d): d is NonNullable<typeof d> => d !== null && d.stats.hasTasks);
  }, [annualTasksMonthsData]);

  const yearPerfectDays = useMemo(() => {
    return allYearDaysWithTasks.filter((d) => d.stats.isPerfect).length;
  }, [allYearDaysWithTasks]);

  return (
    <div className={`bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col gap-5 ${className}`}>
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#281b18]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#edd8c2] text-[#823b28] border border-[#d4aa86] shadow-inner">
            <Layers size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#d4aa86]">
                EXECUTION HEATMAP
              </span>
              <AnalyticInfoButton
                explanation={ANALYTIC_EXPLANATIONS.heatmapActivityIndex}
                variant="badge"
                buttonText="Heatmap Formula"
              />
              <span className="font-mono text-[10px] font-semibold text-[#df734c]">
                Task Completion Ratio Matrix
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#281b18] font-sans tracking-tight mt-0.5">
              {isExpanded
                ? `Annual 12-Month Execution Grid (${displayYear})`
                : `Recent 2-Month Execution Window (${twoMonthsData[0].monthName.split(' ')[0]} & ${twoMonthsData[1].monthName.split(' ')[0]})`}
            </h3>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isExpanded ? (
            <div className="flex items-center bg-[#edd8c2] rounded-2xl p-0.5 border border-[#281b18]/10">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(activeMonthDate);
                  prev.setFullYear(prev.getFullYear() - 1);
                  setActiveMonthDate(prev);
                }}
                className="p-1.5 rounded-xl hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs font-bold text-[#281b18] px-3 min-w-[80px] text-center">
                {displayYear}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(activeMonthDate);
                  next.setFullYear(next.getFullYear() + 1);
                  setActiveMonthDate(next);
                }}
                className="p-1.5 rounded-xl hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center bg-[#edd8c2] rounded-2xl p-0.5 border border-[#281b18]/10">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(activeMonthDate);
                  prev.setMonth(prev.getMonth() - 1);
                  setActiveMonthDate(prev);
                }}
                className="p-1.5 rounded-xl hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                title="Previous Month Window"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs font-bold text-[#281b18] px-2 min-w-[100px] text-center">
                {twoMonthsData[0].monthName.split(' ')[0].slice(0, 3)} - {twoMonthsData[1].monthName.split(' ')[0].slice(0, 3)} {twoMonthsData[1].year}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(activeMonthDate);
                  next.setMonth(next.getMonth() + 1);
                  setActiveMonthDate(next);
                }}
                className="p-1.5 rounded-xl hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                title="Next Month Window"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            id="toggle-task-heatmap-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-4 py-2 rounded-2xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
          >
            {isExpanded ? (
              <>
                <Minimize2 size={14} />
                <span>2-Month View</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span>Annual 12-Month</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: RECENT 2-MONTHS SIDE BY SIDE GRID (Default) */}
      {!isExpanded ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {twoMonthsData.map((month) => (
              <div
                key={`${month.year}-${month.monthIndex}`}
                className="bg-[#edd8c2]/35 border border-[#281b18]/15 rounded-3xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-[#281b18]/10 pb-2.5">
                  <h4 className="font-extrabold text-sm sm:text-base text-[#281b18] tracking-tight font-sans uppercase">
                    {month.monthName}
                  </h4>
                  <span className="font-mono text-[10px] text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full font-extrabold border border-[#281b18]/10">
                    {month.totalCompleted}/{month.totalTasks} Resolved ({month.avgRatio}%)
                  </span>
                </div>

                {/* Weekday Headers M T W T F S S */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold text-[#823b28] uppercase">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Month Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
                  {month.days.map((item, idx) => {
                    if (!item) {
                      return (
                        <div
                          key={`empty-${idx}`}
                          className="aspect-square opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const isSelected = selectedDate === item.dateKey;
                    const colorClass = getCellColorClass(
                      item.stats.level,
                      item.stats.hasTasks,
                      item.stats.isPerfect,
                      isSelected
                    );

                    return (
                      <div
                        key={item.dateKey}
                        onClick={() => setSelectedDate(item.dateKey)}
                        onMouseEnter={() =>
                          setHoveredCell({
                            dateKey: item.dateKey,
                            formattedDate: new Date(item.dateKey + 'T00:00:00').toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            ),
                            weekday: item.weekday,
                            totalTasks: item.stats.totalTasks,
                            completedTasks: item.stats.completedTasks,
                            pendingTasks: item.stats.pendingTasks,
                            ratio: item.stats.ratio,
                            level: item.stats.level,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-between p-1 sm:p-1.5 cursor-pointer transition-all hover:scale-105 relative ${colorClass} ${
                          item.isToday ? 'ring-2 ring-[#281b18] font-bold' : ''
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="font-mono text-[10px] sm:text-xs font-black">
                            {item.dayNumber}
                          </span>
                          {item.stats.isPerfect ? (
                            <span className="text-[9px] text-[#edd8c2]">★</span>
                          ) : item.isToday ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#df734c] animate-pulse" />
                          ) : null}
                        </div>

                        <div className="text-center font-mono text-[9px] sm:text-[10px] font-extrabold truncate w-full">
                          {item.stats.hasTasks ? (
                            <span>{item.stats.ratio}%</span>
                          ) : (
                            <span className="opacity-25 font-normal">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer stats for month */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#823b28] pt-2 border-t border-[#281b18]/10">
                  <span>Active: <strong>{month.activeDaysCount} days</strong></span>
                  <span>100% Clear: <strong>{month.perfectDaysCount} days</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Dual-Month Summary Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#281b18]/10 text-xs font-mono">
            <div className="bg-[#f6e9d7] p-2.5 rounded-xl border border-[#281b18]/10 text-center">
              <span className="text-[10px] text-[#823b28] uppercase font-bold block">
                Tracked Period
              </span>
              <span className="text-sm font-black text-[#281b18]">
                2 Months (60 Days)
              </span>
            </div>
            <div className="bg-[#f6e9d7] p-2.5 rounded-xl border border-[#281b18]/10 text-center">
              <span className="text-[10px] text-[#823b28] uppercase font-bold block">
                Combined Ratio
              </span>
              <span className="text-sm font-black text-[#df734c]">
                {Math.round(
                  ((twoMonthsData[0].totalCompleted + twoMonthsData[1].totalCompleted) /
                    Math.max(1, twoMonthsData[0].totalTasks + twoMonthsData[1].totalTasks)) *
                    100
                )}%
              </span>
            </div>
            <div className="bg-[#f6e9d7] p-2.5 rounded-xl border border-[#281b18]/10 text-center">
              <span className="text-[10px] text-[#823b28] uppercase font-bold block">
                Total Perfect Days
              </span>
              <span className="text-sm font-black text-[#823b28]">
                {twoMonthsData[0].perfectDaysCount + twoMonthsData[1].perfectDaysCount} Days
              </span>
            </div>
            <div className="bg-[#f6e9d7] p-2.5 rounded-xl border border-[#281b18]/10 text-center">
              <span className="text-[10px] text-[#823b28] uppercase font-bold block">
                Resolved Outcomes
              </span>
              <span className="text-sm font-black text-[#281b18]">
                {twoMonthsData[0].totalCompleted + twoMonthsData[1].totalCompleted} /{' '}
                {twoMonthsData[0].totalTasks + twoMonthsData[1].totalTasks}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: 12-MONTH CALENDAR GRID */
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {annualTasksMonthsData.map((month) => (
              <div key={month.monthIndex} className="bg-[#edd8c2]/35 border border-[#281b18]/10 rounded-2xl p-3 flex flex-col">
                <h4 className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider text-center border-b border-[#281b18]/10 pb-1 mb-2">
                  {month.monthName}
                </h4>
                
                <div className="grid grid-cols-7 gap-0.5 text-center font-mono text-[7px] font-bold text-[#823b28]/60 uppercase mb-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                    <div key={dIdx}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {month.days.map((item, idx) => {
                    if (!item) {
                      return <div key={`empty-${idx}`} className="aspect-square bg-transparent opacity-0 pointer-events-none" />;
                    }

                    const isSelected = selectedDate === item.dateKey;
                    const colorClass = getCellColorClass(
                      item.stats.level,
                      item.stats.hasTasks,
                      item.stats.isPerfect,
                      isSelected
                    );

                    return (
                      <button
                        key={item.dateKey}
                        onClick={() => setSelectedDate(item.dateKey)}
                        onMouseEnter={() =>
                          setHoveredCell({
                            dateKey: item.dateKey,
                            formattedDate: new Date(item.dateKey + 'T00:00:00').toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            ),
                            weekday: item.weekday,
                            totalTasks: item.stats.totalTasks,
                            completedTasks: item.stats.completedTasks,
                            pendingTasks: item.stats.pendingTasks,
                            ratio: item.stats.ratio,
                            level: item.stats.level,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`aspect-square rounded-md flex items-center justify-center text-[8px] cursor-pointer transition-all border ${colorClass} ${
                          item.isToday ? 'border-[#281b18] font-bold' : 'border-transparent'
                        }`}
                        title={`${item.dateKey}: ${
                          item.stats.hasTasks
                            ? `${item.stats.completedTasks}/${item.stats.totalTasks} completed`
                            : 'No tasks'
                        }`}
                      >
                        <span className="font-mono leading-none">{item.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#281b18]/10 text-xs font-mono text-[#823b28]">
            <span>
              Yearly Tracked Days: <strong>{allYearDaysWithTasks.length} Days</strong>
            </span>
            <span>
              100% Completed Days: <strong>{yearPerfectDays} Days</strong>
            </span>
          </div>
        </div>
      )}

      {/* Clicked Day Tasks Details Box */}
      {selectedDate && (
        <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-4.5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-mono font-black text-[#281b18] uppercase tracking-wider">
              Tasks Scheduled on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h4>
            <span className="font-mono text-[9px] font-bold text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full">
              {tasks.filter((t) => t.dueDate === selectedDate).length} Tasks
            </span>
          </div>

          {tasks.filter((t) => t.dueDate === selectedDate).length === 0 ? (
            <p className="text-xs text-[#823b28]/60 italic font-medium">
              No tasks scheduled for this date.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {tasks.filter((t) => t.dueDate === selectedDate).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 p-2.5 bg-[#fbf6ef] border border-[#281b18]/10 rounded-xl"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {t.completed ? (
                      <CheckCircle2 size={14} className="text-[#823b28] shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#281b18]/30 shrink-0" />
                    )}
                    <span className={`text-xs font-bold truncate ${t.completed ? 'line-through text-[#281b18]/50' : 'text-[#281b18]'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    t.priority === 'high'
                      ? 'bg-[#df734c]/10 text-[#df734c] border-[#df734c]/30'
                      : t.priority === 'medium'
                      ? 'bg-[#422119]/10 text-[#422119] border-[#422119]/30'
                      : 'bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/30'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Hover Details Box */}
      {hoveredCell && (
        <div className="bg-[#f6e9d7] border border-[#823b28]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-[#281b18]">
              {hoveredCell.weekday}, {hoveredCell.formattedDate}
            </span>
            {hoveredCell.totalTasks > 0 && hoveredCell.ratio === 100 && (
              <span className="text-[10px] font-mono font-bold bg-[#823b28] text-[#f6e9d7] px-2 py-0.5 rounded-full">
                ★ 100% All Clear
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {hoveredCell.totalTasks > 0 ? (
              <>
                <span className="text-[#823b28]">
                  Completed: <strong>{hoveredCell.completedTasks} / {hoveredCell.totalTasks}</strong>
                </span>
                <span className="font-black text-[#df734c]">
                  Ratio: {hoveredCell.ratio}%
                </span>
              </>
            ) : (
              <span className="text-[#823b28]/60 italic">No scheduled tasks on this day</span>
            )}
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono text-[#823b28]">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px]">Completion Intensity:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-md bg-[#edd8c2] border border-[#281b18]/10" />
            <span className="text-[10px]">No Tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-md bg-[#f5c3af]" />
            <span className="text-[10px]">1-39%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-md bg-[#eb9d7d]" />
            <span className="text-[10px]">40-69%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-md bg-[#df734c]" />
            <span className="text-[10px]">70-99%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-md bg-[#823b28]" />
            <span className="text-[10px] font-bold">100% (All Clear)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
