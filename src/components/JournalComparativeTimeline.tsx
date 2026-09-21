import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  BookOpen,
  Edit3,
  Trash2,
  Zap,
  ArrowRight,
  GitCompare,
  CalendarDays,
  Clock,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { EnergyLevel, JournalEntry, MoodLevel } from '../types';
import {
  formatDisplayDate,
  parseDateKey,
  formatDateKey,
  getTodayKey,
  addDays,
  getWeekDates,
  differenceInCalendarDays,
} from '../utils/dateUtils';

interface JournalComparativeTimelineProps {
  journalEntries: JournalEntry[];
  activeDate: string;
  onSelectDate: (dateStr: string) => void;
  onOpenDetail: (entry: JournalEntry) => void;
  onEditEntry: (dateStr: string) => void;
  onDeleteEntry: (entryId: string) => void;
  availableYears: string[];
}

const MOOD_OPTIONS: { level: MoodLevel; score: number; label: string; emoji: string }[] = [
  { level: 'bad', score: 1, label: 'Exhausted / Low', emoji: '😞' },
  { level: 'low', score: 2, label: 'Meh / Sluggish', emoji: '😐' },
  { level: 'neutral', score: 3, label: 'Balanced / Steady', emoji: '🙂' },
  { level: 'good', score: 4, label: 'Good / Happy', emoji: '😊' },
  { level: 'great', score: 5, label: 'Super / Inspired', emoji: '🤩' },
];

const WEEKDAY_NAMES = [
  { dayIndex: 1, name: 'Monday', short: 'Mon', num: 'Day 1' },
  { dayIndex: 2, name: 'Tuesday', short: 'Tue', num: 'Day 2' },
  { dayIndex: 3, name: 'Wednesday', short: 'Wed', num: 'Day 3' },
  { dayIndex: 4, name: 'Thursday', short: 'Thu', num: 'Day 4' },
  { dayIndex: 5, name: 'Friday', short: 'Fri', num: 'Day 5' },
  { dayIndex: 6, name: 'Saturday', short: 'Sat', num: 'Day 6' },
  { dayIndex: 0, name: 'Sunday', short: 'Sun', num: 'Day 7' },
];

export const JournalComparativeTimeline: React.FC<JournalComparativeTimelineProps> = ({
  journalEntries,
  activeDate,
  onSelectDate,
  onOpenDetail,
  onEditEntry,
  onDeleteEntry,
  availableYears,
}) => {
  const today = getTodayKey();

  // Mode: standard chronological vs weekday comparison vs month date comparison
  const [timelineMode, setTimelineMode] = useState<'chronological' | 'week_compare' | 'month_compare'>('chronological');
  
  // Chronological filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  // Week comparison states: selected weekday (0=Sun, 1=Mon... default to active day's weekday or Sun/Day 7)
  const [selectedWeekdayIndex, setSelectedWeekdayIndex] = useState<number>(() => {
    const d = parseDateKey(activeDate);
    return d.getDay();
  });
  const [weekComparisonSubmode, setWeekComparisonSubmode] = useState<'same_weekday' | 'week_paired'>('same_weekday');
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week vs last week

  // Month date comparison states: selected day of month (1..31, default to active day's date number)
  const [selectedDayOfMonth, setSelectedDayOfMonth] = useState<number>(() => {
    const d = parseDateKey(activeDate);
    return d.getDate();
  });
  const [monthComparisonSubmode, setMonthComparisonSubmode] = useState<'same_day_of_month' | 'month_paired'>('same_day_of_month');
  
  // Month vs Month comparison states (e.g. Month 1 vs Month 2)
  const currentYearMonth = today.slice(0, 7);
  const prevYearMonth = addDays(today, -30).slice(0, 7);
  const [compareMonthA, setCompareMonthA] = useState<string>(currentYearMonth);
  const [compareMonthB, setCompareMonthB] = useState<string>(prevYearMonth);

  // Map for fast lookup by date
  const entryMap = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    journalEntries.forEach((e) => map.set(e.date, e));
    return map;
  }, [journalEntries]);

  // Standard filtered chronological list
  const filteredTimeline = useMemo(() => {
    return journalEntries
      .filter((entry) => {
        if (selectedYearFilter !== 'all') {
          if (!entry.date.startsWith(selectedYearFilter)) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = entry.title?.toLowerCase().includes(q);
          const matchesContent = entry.content?.toLowerCase().includes(q);
          const matchesTag = entry.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesContent && !matchesTag) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journalEntries, selectedYearFilter, searchQuery]);

  // --- WEEKDAY COMPARISON DATA ---
  // 1. All entries matching selected weekday (e.g., all Day 7 / Sundays)
  const sameWeekdayEntries = useMemo(() => {
    return journalEntries
      .filter((entry) => {
        const d = parseDateKey(entry.date);
        return d.getDay() === selectedWeekdayIndex && (entry.content || entry.title || entry.mood);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journalEntries, selectedWeekdayIndex]);

  // 2. Week-over-Week Paired Matrix (This Week vs Previous Week)
  const pairedWeekDays = useMemo(() => {
    const referenceDate = addDays(today, weekOffset * 7);
    const thisWeekDays = getWeekDates(referenceDate, 1); // Mon-Sun
    const prevWeekDays = getWeekDates(addDays(referenceDate, -7), 1); // Mon-Sun of previous week

    return thisWeekDays.map((thisDay, index) => {
      const prevDay = prevWeekDays[index];
      const thisEntry = entryMap.get(thisDay.dateStr);
      const prevEntry = entryMap.get(prevDay.dateStr);
      return {
        weekdayName: thisDay.dayName,
        weekdayShort: thisDay.dayShort,
        weekdayNumber: index + 1, // 1 to 7
        thisDay,
        prevDay,
        thisEntry,
        prevEntry,
      };
    });
  }, [today, weekOffset, entryMap]);

  // --- MONTH DATE COMPARISON DATA ---
  // 1. All entries matching selected day of the month (e.g. 10th of every month)
  const sameDayOfMonthEntries = useMemo(() => {
    return journalEntries
      .filter((entry) => {
        const d = parseDateKey(entry.date);
        return d.getDate() === selectedDayOfMonth && (entry.content || entry.title || entry.mood);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journalEntries, selectedDayOfMonth]);

  // Available unique Year-Month strings in dataset
  const availableYearMonths = useMemo(() => {
    const ymSet = new Set<string>();
    ymSet.add(today.slice(0, 7));
    journalEntries.forEach((e) => {
      ymSet.add(e.date.slice(0, 7));
    });
    return Array.from(ymSet).sort().reverse();
  }, [journalEntries, today]);

  // 2. Month-over-Month Paired Days (Month A vs Month B side-by-side)
  const pairedMonthDays = useMemo(() => {
    const [yA, mA] = compareMonthA.split('-').map(Number);
    const [yB, mB] = compareMonthB.split('-').map(Number);

    const daysInMonthA = new Date(yA, mA, 0).getDate();
    const daysInMonthB = new Date(yB, mB, 0).getDate();
    const maxDays = Math.max(daysInMonthA, daysInMonthB);

    const paired = [];
    for (let dayNum = 1; dayNum <= maxDays; dayNum++) {
      const dateA = `${compareMonthA}-${String(dayNum).padStart(2, '0')}`;
      const dateB = `${compareMonthB}-${String(dayNum).padStart(2, '0')}`;
      const entryA = dayNum <= daysInMonthA ? entryMap.get(dateA) : null;
      const entryB = dayNum <= daysInMonthB ? entryMap.get(dateB) : null;

      if (entryA || entryB) {
        paired.push({
          dayNum,
          dateA,
          dateB,
          isValidA: dayNum <= daysInMonthA,
          isValidB: dayNum <= daysInMonthB,
          entryA,
          entryB,
        });
      }
    }
    return paired;
  }, [compareMonthA, compareMonthB, entryMap]);

  // Format month names for UI
  const formatYearMonth = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  const selectedWeekdayObj = WEEKDAY_NAMES.find((w) => w.dayIndex === selectedWeekdayIndex) || WEEKDAY_NAMES[0];

  return (
    <div className="space-y-6">
      {/* Top Comparative View Selector */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Timeline & Comparative Review</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Browse your archive or compare recurring days across weeks and months
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 gap-1 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setTimelineMode('chronological')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timelineMode === 'chronological'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              All Entries
            </button>
            <button
              type="button"
              onClick={() => setTimelineMode('week_compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timelineMode === 'week_compare'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Week Comparison</span>
            </button>
            <button
              type="button"
              onClick={() => setTimelineMode('month_compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timelineMode === 'month_compare'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month Comparison</span>
            </button>
          </div>
        </div>

        {/* CONTROLS PER MODE */}

        {/* 1. CHRONOLOGICAL CONTROLS */}
        {timelineMode === 'chronological' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search reflections, tags, memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none placeholder:text-neutral-400"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setSelectedYearFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedYearFilter === 'all'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                All Years
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYearFilter(yr)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedYearFilter === yr
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. WEEK COMPARISON CONTROLS */}
        {timelineMode === 'week_compare' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setWeekComparisonSubmode('same_weekday')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    weekComparisonSubmode === 'same_weekday'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Compare Same Day of Week (e.g. 7th Day / Sunday)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekComparisonSubmode('week_paired')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    weekComparisonSubmode === 'week_paired'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  This Week vs Previous Week (7 Days)
                </button>
              </div>

              {weekComparisonSubmode === 'week_paired' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((o) => o - 1)}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Earlier Week"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-neutral-950 dark:text-white">
                    {weekOffset === 0
                      ? 'This Week vs Last Week'
                      : `${Math.abs(weekOffset)} week(s) ${weekOffset < 0 ? 'earlier' : 'later'}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((o) => o + 1)}
                    disabled={weekOffset >= 0}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                    title="Later Week"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Weekday Selector Pills */}
            {weekComparisonSubmode === 'same_weekday' && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Select Day of Week to Compare Across Weeks:
                </span>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {WEEKDAY_NAMES.map((w) => {
                    const isSelected = selectedWeekdayIndex === w.dayIndex;
                    const count = journalEntries.filter((e) => parseDateKey(e.date).getDay() === w.dayIndex).length;
                    return (
                      <button
                        key={w.dayIndex}
                        type="button"
                        onClick={() => setSelectedWeekdayIndex(w.dayIndex)}
                        className={`py-2 px-1 rounded-xl text-center flex flex-col items-center transition-all ${
                          isSelected
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs scale-102 ring-2 ring-neutral-950 dark:ring-white'
                            : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-xs font-bold">{w.short}</span>
                        <span className="text-[10px] opacity-75">{w.num}</span>
                        <span className="text-[9px] font-mono mt-0.5 opacity-60">
                          {count} log{count === 1 ? '' : 's'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MONTH COMPARISON CONTROLS */}
        {timelineMode === 'month_compare' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setMonthComparisonSubmode('same_day_of_month')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    monthComparisonSubmode === 'same_day_of_month'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Compare Same Date across Months (e.g. 10th of Oct vs 10th of Sept)
                </button>
                <button
                  type="button"
                  onClick={() => setMonthComparisonSubmode('month_paired')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    monthComparisonSubmode === 'month_paired'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Month vs Month Side-by-Side
                </button>
              </div>
            </div>

            {/* Same day of month picker (1st to 31st) */}
            {monthComparisonSubmode === 'same_day_of_month' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Select Date of Month to Compare: ({selectedDayOfMonth}th of every month)
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 5, 10, 15, 20, 25, 30].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedDayOfMonth(preset)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                          selectedDayOfMonth === preset
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                        }`}
                      >
                        {preset}th
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horizontal scrollable or wrapped days 1..31 */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dNum) => {
                    const isSelected = selectedDayOfMonth === dNum;
                    const matchesCount = journalEntries.filter((e) => parseDateKey(e.date).getDate() === dNum).length;
                    return (
                      <button
                        key={dNum}
                        type="button"
                        onClick={() => setSelectedDayOfMonth(dNum)}
                        className={`min-w-[34px] h-9 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs ring-2 ring-neutral-950 dark:ring-white scale-105'
                            : matchesCount > 0
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
                            : 'bg-neutral-50 dark:bg-neutral-850/50 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 hover:border-solid'
                        }`}
                      >
                        <span className="text-xs font-bold leading-none">{dNum}</span>
                        {matchesCount > 0 && (
                          <span className="text-[8px] opacity-70 leading-none mt-0.5">•{matchesCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Month vs Month Dropdown Selectors */}
            {monthComparisonSubmode === 'month_paired' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/80">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Primary Month (A):
                  </label>
                  <select
                    value={compareMonthA}
                    onChange={(e) => setCompareMonthA(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white"
                  >
                    {availableYearMonths.map((ym) => (
                      <option key={ym} value={ym}>
                        {formatYearMonth(ym)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 text-neutral-400 font-bold text-xs">vs</div>

                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Comparison Month (B):
                  </label>
                  <select
                    value={compareMonthB}
                    onChange={(e) => setCompareMonthB(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white"
                  >
                    {availableYearMonths.map((ym) => (
                      <option key={ym} value={ym}>
                        {formatYearMonth(ym)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENT DISPLAYS */}

      {/* 1. STANDARD CHRONOLOGICAL LIST */}
      {timelineMode === 'chronological' && (
        <>
          {filteredTimeline.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <BookOpen className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white">No journal entries found</p>
              <p className="text-xs text-neutral-500 mt-1">Try changing your search query or year filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTimeline.map((entry) => {
                const moodMeta = MOOD_OPTIONS.find((m) => m.level === entry.mood);

                return (
                  <div
                    key={entry.id}
                    onClick={() => onOpenDetail(entry)}
                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-white transition-all shadow-xs cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Top Date & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-950 dark:text-white">
                            {formatDisplayDate(entry.date)}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {entry.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {moodMeta && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                              <span className="grayscale contrast-125 select-none">{moodMeta.emoji}</span>
                              <span className="text-[10px] font-mono">{moodMeta.score}/5</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-[10px] font-mono">{entry.energy}/5</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(entry.date);
                            }}
                            title="Edit this reflection"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(entry.id);
                            }}
                            title="Delete reflection"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {entry.title && (
                        <h3 className="text-sm font-bold text-neutral-950 dark:text-white mb-1 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                          {entry.title}
                        </h3>
                      )}

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {entry.content || 'No text reflection provided.'}
                      </p>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        {entry.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 2. WEEK COMPARISON - SUBMODE A: SAME WEEKDAY ACROSS WEEKS */}
      {timelineMode === 'week_compare' && weekComparisonSubmode === 'same_weekday' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>
                Comparing {selectedWeekdayObj.name}s ({selectedWeekdayObj.num}) Across Weeks ({sameWeekdayEntries.length} logged)
              </span>
            </h3>
          </div>

          {sameWeekdayEntries.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-400">
                No entries logged on {selectedWeekdayObj.name} ({selectedWeekdayObj.num}) yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sameWeekdayEntries.map((entry, idx) => {
                const moodMeta = MOOD_OPTIONS.find((m) => m.level === entry.mood);
                const daysDiff = differenceInCalendarDays(entry.date, today);
                const weeksAgo = Math.round(daysDiff / 7);

                return (
                  <div
                    key={entry.id}
                    onClick={() => onOpenDetail(entry)}
                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-white transition-all shadow-xs cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Comparative Header */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-950 dark:text-white">
                            {formatDisplayDate(entry.date, 'short')}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {weeksAgo === 0 ? 'This Week' : `${weeksAgo}w ago`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {moodMeta && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                              <span className="grayscale contrast-125 select-none">{moodMeta.emoji}</span>
                              <span className="text-[10px] font-mono">{moodMeta.score}/5</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-[10px] font-mono">{entry.energy}/5</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(entry.date);
                            }}
                            title="Edit this reflection"
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(entry.id);
                            }}
                            title="Delete reflection"
                            className="p-1 rounded-md text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {entry.title && (
                        <h4 className="text-xs font-bold text-neutral-950 dark:text-white mb-1">
                          {entry.title}
                        </h4>
                      )}

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {entry.content || 'No reflection logged.'}
                      </p>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500">
                        {entry.tags.map((t) => (
                          <span key={t} className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. WEEK COMPARISON - SUBMODE B: THIS WEEK VS PREVIOUS WEEK PAIRED MATRIX */}
      {timelineMode === 'week_compare' && weekComparisonSubmode === 'week_paired' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="grid grid-cols-12 gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <div className="col-span-3 sm:col-span-2">Day of Week</div>
              <div className="col-span-4 sm:col-span-5">This Week</div>
              <div className="col-span-1 hidden sm:block text-center">vs</div>
              <div className="col-span-5 sm:col-span-4">Previous Week</div>
            </div>

            <div className="space-y-3">
              {pairedWeekDays.map((pair) => {
                const thisMood = pair.thisEntry ? MOOD_OPTIONS.find((m) => m.level === pair.thisEntry?.mood) : null;
                const prevMood = pair.prevEntry ? MOOD_OPTIONS.find((m) => m.level === pair.prevEntry?.mood) : null;

                return (
                  <div
                    key={pair.weekdayNumber}
                    className="grid grid-cols-12 gap-3 p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 items-center"
                  >
                    {/* Weekday Label */}
                    <div className="col-span-3 sm:col-span-2">
                      <span className="text-xs font-bold text-neutral-950 dark:text-white block">
                        {pair.weekdayName}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Day {pair.weekdayNumber} of 7
                      </span>
                    </div>

                    {/* This Week Day Card */}
                    <div
                      onClick={() => {
                        if (pair.thisEntry) onOpenDetail(pair.thisEntry);
                        else onEditEntry(pair.thisDay.dateStr);
                      }}
                      className={`col-span-4 sm:col-span-5 p-3 rounded-xl border transition-all cursor-pointer ${
                        pair.thisEntry
                          ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-white shadow-2xs'
                          : 'border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {formatDisplayDate(pair.thisDay.dateStr, 'monthDay')}
                        </span>
                        {thisMood && (
                          <span className="text-xs grayscale contrast-125 select-none" title={thisMood.label}>
                            {thisMood.emoji}
                          </span>
                        )}
                      </div>

                      {pair.thisEntry ? (
                        <div>
                          {pair.thisEntry.title && (
                            <p className="text-xs font-bold text-neutral-950 dark:text-white line-clamp-1">
                              {pair.thisEntry.title}
                            </p>
                          )}
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {pair.thisEntry.content}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] italic text-neutral-400">+ Add reflection</span>
                      )}
                    </div>

                    <div className="col-span-1 hidden sm:flex justify-center text-neutral-400">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    {/* Previous Week Day Card */}
                    <div
                      onClick={() => {
                        if (pair.prevEntry) onOpenDetail(pair.prevEntry);
                        else onEditEntry(pair.prevDay.dateStr);
                      }}
                      className={`col-span-5 sm:col-span-4 p-3 rounded-xl border transition-all cursor-pointer ${
                        pair.prevEntry
                          ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-white shadow-2xs'
                          : 'border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {formatDisplayDate(pair.prevDay.dateStr, 'monthDay')}
                        </span>
                        {prevMood && (
                          <span className="text-xs grayscale contrast-125 select-none" title={prevMood.label}>
                            {prevMood.emoji}
                          </span>
                        )}
                      </div>

                      {pair.prevEntry ? (
                        <div>
                          {pair.prevEntry.title && (
                            <p className="text-xs font-bold text-neutral-950 dark:text-white line-clamp-1">
                              {pair.prevEntry.title}
                            </p>
                          )}
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {pair.prevEntry.content}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] italic text-neutral-400">No entry logged</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MONTH COMPARISON - SUBMODE A: SAME DAY OF MONTH (e.g. 10th of Oct vs 10th of Sept) */}
      {timelineMode === 'month_compare' && monthComparisonSubmode === 'same_day_of_month' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>
                Comparing the {selectedDayOfMonth}th Date Across Months ({sameDayOfMonthEntries.length} logged)
              </span>
            </h3>
          </div>

          {sameDayOfMonthEntries.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-400">
                No entries logged on the {selectedDayOfMonth}th date across any months yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sameDayOfMonthEntries.map((entry, idx) => {
                const moodMeta = MOOD_OPTIONS.find((m) => m.level === entry.mood);
                const [entryYear, entryMonth] = entry.date.split('-');
                const monthLabel = new Date(Number(entryYear), Number(entryMonth) - 1, 1).toLocaleDateString(
                  undefined,
                  { month: 'long', year: 'numeric' }
                );

                return (
                  <div
                    key={entry.id}
                    onClick={() => onOpenDetail(entry)}
                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-white transition-all shadow-xs cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Month Date Badge Header */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                        <div>
                          <span className="text-xs font-bold text-neutral-950 dark:text-white block">
                            {selectedDayOfMonth}th of {monthLabel}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {formatDisplayDate(entry.date, 'weekday')} • {entry.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {moodMeta && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                              <span className="grayscale contrast-125 select-none">{moodMeta.emoji}</span>
                              <span className="text-[10px] font-mono">{moodMeta.score}/5</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-[10px] font-mono">{entry.energy}/5</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(entry.date);
                            }}
                            title="Edit this reflection"
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(entry.id);
                            }}
                            title="Delete reflection"
                            className="p-1 rounded-md text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {entry.title && (
                        <h4 className="text-xs font-bold text-neutral-950 dark:text-white mb-1">
                          {entry.title}
                        </h4>
                      )}

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {entry.content || 'No text reflection provided.'}
                      </p>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500">
                        {entry.tags.map((t) => (
                          <span key={t} className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. MONTH COMPARISON - SUBMODE B: MONTH A VS MONTH B SIDE-BY-SIDE */}
      {timelineMode === 'month_compare' && monthComparisonSubmode === 'month_paired' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="grid grid-cols-12 gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <div className="col-span-2">Date</div>
              <div className="col-span-5">{formatYearMonth(compareMonthA)}</div>
              <div className="col-span-5">{formatYearMonth(compareMonthB)}</div>
            </div>

            {pairedMonthDays.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No entries logged in either {formatYearMonth(compareMonthA)} or {formatYearMonth(compareMonthB)}.
              </div>
            ) : (
              <div className="space-y-3">
                {pairedMonthDays.map((item) => {
                  const moodA = item.entryA ? MOOD_OPTIONS.find((m) => m.level === item.entryA?.mood) : null;
                  const moodB = item.entryB ? MOOD_OPTIONS.find((m) => m.level === item.entryB?.mood) : null;

                  return (
                    <div
                      key={item.dayNum}
                      className="grid grid-cols-12 gap-3 p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 items-center"
                    >
                      {/* Day number */}
                      <div className="col-span-2">
                        <span className="text-xs font-bold text-neutral-950 dark:text-white block font-mono">
                          {item.dayNum}th
                        </span>
                      </div>

                      {/* Month A entry */}
                      <div
                        onClick={() => {
                          if (item.entryA) onOpenDetail(item.entryA);
                          else if (item.isValidA) onEditEntry(item.dateA);
                        }}
                        className={`col-span-5 p-3 rounded-xl border transition-all cursor-pointer ${
                          item.entryA
                            ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-white shadow-2xs'
                            : 'border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.entryA ? (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                {formatDisplayDate(item.dateA, 'monthDay')}
                              </span>
                              {moodA && (
                                <span className="text-xs grayscale contrast-125 select-none">{moodA.emoji}</span>
                              )}
                            </div>
                            {item.entryA.title && (
                              <p className="text-xs font-bold text-neutral-950 dark:text-white line-clamp-1">
                                {item.entryA.title}
                              </p>
                            )}
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {item.entryA.content}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-neutral-400">No entry</span>
                        )}
                      </div>

                      {/* Month B entry */}
                      <div
                        onClick={() => {
                          if (item.entryB) onOpenDetail(item.entryB);
                          else if (item.isValidB) onEditEntry(item.dateB);
                        }}
                        className={`col-span-5 p-3 rounded-xl border transition-all cursor-pointer ${
                          item.entryB
                            ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-white shadow-2xs'
                            : 'border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.entryB ? (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                {formatDisplayDate(item.dateB, 'monthDay')}
                              </span>
                              {moodB && (
                                <span className="text-xs grayscale contrast-125 select-none">{moodB.emoji}</span>
                              )}
                            </div>
                            {item.entryB.title && (
                              <p className="text-xs font-bold text-neutral-950 dark:text-white line-clamp-1">
                                {item.entryB.title}
                              </p>
                            )}
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {item.entryB.content}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-neutral-400">No entry</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
