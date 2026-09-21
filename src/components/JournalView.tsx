import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  Smile,
  Zap,
  Tag as TagIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Flame,
  Clock,
  Trash2,
  Edit3,
  Check,
  TrendingUp,
  Filter,
  History,
  Plus,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { EnergyLevel, JournalEntry, MoodLevel } from '../types';
import {
  formatDisplayDate,
  getTodayKey,
  addDays,
  getMonthCalendarGrid,
  parseDateKey,
  formatDateKey,
} from '../utils/dateUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { JournalDetailModal } from './JournalDetailModal';
import { JournalComparativeTimeline } from './JournalComparativeTimeline';

interface JournalViewProps {
  journalEntries: JournalEntry[];
  onSaveJournalEntry: (entry: JournalEntry) => void;
  onDeleteJournalEntry: (entryId: string) => void;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

// Minimal monochrome mood options with grayscale emojis
const MOOD_OPTIONS: { level: MoodLevel; score: number; label: string; emoji: string }[] = [
  { level: 'bad', score: 1, label: 'Exhausted / Low', emoji: '😞' },
  { level: 'low', score: 2, label: 'Meh / Sluggish', emoji: '😐' },
  { level: 'neutral', score: 3, label: 'Balanced / Steady', emoji: '🙂' },
  { level: 'good', score: 4, label: 'Good / Happy', emoji: '😊' },
  { level: 'great', score: 5, label: 'Super / Inspired', emoji: '🤩' },
];

const ENERGY_OPTIONS: { level: EnergyLevel; label: string; desc: string }[] = [
  { level: 1, label: 'Drained', desc: '1/5 - Minimal energy' },
  { level: 2, label: 'Low', desc: '2/5 - Sluggish pace' },
  { level: 3, label: 'Steady', desc: '3/5 - Sustainable focus' },
  { level: 4, label: 'Charged', desc: '4/5 - High productivity' },
  { level: 5, label: 'Peak Power', desc: '5/5 - Unstoppable drive' },
];

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const JournalView: React.FC<JournalViewProps> = ({
  journalEntries,
  onSaveJournalEntry,
  onDeleteJournalEntry,
  selectedDateStr,
  onSelectDate,
}) => {
  const today = getTodayKey();
  const activeDate = selectedDateStr || today;

  // Active day's entry
  const currentEntry = useMemo(() => {
    return journalEntries.find((e) => e.date === activeDate);
  }, [journalEntries, activeDate]);

  // Form states for active date editor
  const [title, setTitle] = useState(currentEntry?.title || '');
  const [content, setContent] = useState(currentEntry?.content || '');
  const [mood, setMood] = useState<MoodLevel>(currentEntry?.mood || 'neutral');
  const [energy, setEnergy] = useState<EnergyLevel>(currentEntry?.energy || 3);
  const [tags, setTags] = useState<string[]>(currentEntry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<'editor' | 'calendar' | 'timeline' | 'trends'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  // Month-at-a-glance calendar state
  const [calYear, setCalYear] = useState(() => {
    const d = parseDateKey(activeDate);
    return d.getFullYear();
  });
  const [calMonth, setCalMonth] = useState(() => {
    const d = parseDateKey(activeDate);
    return d.getMonth(); // 0-indexed
  });

  // Modal State for viewing expanded details
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmingEditorDelete, setIsConfirmingEditorDelete] = useState(false);

  // Map of journal entries by date key for O(1) lookups
  const entryMap = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    journalEntries.forEach((e) => {
      map.set(e.date, e);
    });
    return map;
  }, [journalEntries]);

  // Sync draft when active date or currentEntry changes
  React.useEffect(() => {
    setIsConfirmingEditorDelete(false);
    if (currentEntry) {
      setTitle(currentEntry.title || '');
      setContent(currentEntry.content || '');
      setMood(currentEntry.mood || 'neutral');
      setEnergy(currentEntry.energy || 3);
      setTags(currentEntry.tags || []);
    } else {
      setTitle('');
      setContent('');
      setMood('neutral');
      setEnergy(3);
      setTags([]);
    }
  }, [currentEntry, activeDate]);

  const handleDeleteCurrentEntry = () => {
    if (currentEntry) {
      onDeleteJournalEntry(currentEntry.id);
    } else {
      onDeleteJournalEntry(activeDate);
    }
    setTitle('');
    setContent('');
    setMood('neutral');
    setEnergy(3);
    setTags([]);
    setIsConfirmingEditorDelete(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entry: JournalEntry = {
      id: currentEntry?.id || `entry-${activeDate}`,
      date: activeDate,
      title: title.trim(),
      content: content.trim(),
      mood,
      energy,
      tags,
      createdAt: currentEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveJournalEntry(entry);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean || tags.includes(clean)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags((prev) => prev.filter((item) => item !== t));
  };

  // Open expanded view modal for a given entry
  const handleOpenDetail = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setIsDetailModalOpen(true);
  };

  // Open editor specifically for a date
  const handleEditEntry = (targetDate: string) => {
    onSelectDate(targetDate);
    setActiveTab('editor');
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
  };

  // Calculate calendar month grid (weeks)
  const calendarWeeks = useMemo(() => {
    return getMonthCalendarGrid(calYear, calMonth, 1); // 1 = Monday start
  }, [calYear, calMonth]);

  // Entries within the viewed calendar month
  const monthEntries = useMemo(() => {
    const prefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    return journalEntries
      .filter((e) => e.date.startsWith(prefix) && (e.content || e.title || e.mood))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journalEntries, calYear, calMonth]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const loggedCount = monthEntries.length;
    const rate = Math.round((loggedCount / daysInMonth) * 100);
    const avgEnergy = loggedCount > 0
      ? (monthEntries.reduce((acc, curr) => acc + (curr.energy || 3), 0) / loggedCount).toFixed(1)
      : '0.0';

    return {
      daysInMonth,
      loggedCount,
      rate,
      avgEnergy,
    };
  }, [monthEntries, calYear, calMonth]);

  // On this day in previous years memory lookup
  const memoryEntries = useMemo(() => {
    const [year, month, day] = activeDate.split('-');
    return journalEntries.filter((e) => {
      const [eYear, eMonth, eDay] = e.date.split('-');
      return eMonth === month && eDay === day && eYear !== year && (e.content || e.title);
    });
  }, [journalEntries, activeDate]);

  // Available years from entries
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(new Date().getFullYear().toString());
    journalEntries.forEach((e) => {
      years.add(e.date.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [journalEntries]);

  // Filtered timeline entries
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

  // Trend data over time for chart
  const trendChartData = useMemo(() => {
    const moodMap: Record<MoodLevel, number> = {
      bad: 1,
      low: 2,
      neutral: 3,
      good: 4,
      great: 5,
    };
    return [...journalEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map((entry) => ({
        date: entry.date.slice(5),
        fullDate: entry.date,
        mood: moodMap[entry.mood] || 3,
        energy: entry.energy,
      }));
  }, [journalEntries]);

  // Streak calculations
  const streakCount = useMemo(() => {
    let count = 0;
    let checkDate = today;
    const dateSet = new Set(journalEntries.filter((e) => e.content || e.mood).map((e) => e.date));

    while (dateSet.has(checkDate)) {
      count++;
      checkDate = addDays(checkDate, -1);
    }
    return count;
  }, [journalEntries, today]);

  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
              Daily Reflections & Life Log
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Minimal daily logging, monthly overview, and personal reflection archive
            </p>
          </div>
        </div>

        {/* Quick stats & Tab switchers */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold">
            <Flame className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <span>{streakCount} Day Streak</span>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex-wrap sm:flex-nowrap gap-0.5">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Write / Today
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Timeline ({journalEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'trends'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Trends
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: DAILY EDITOR */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Journal Entry Editor (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
              {/* Date Navigation Strip */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectDate(addDays(activeDate, -1))}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      value={activeDate}
                      onChange={(e) => onSelectDate(e.target.value)}
                      className="text-sm font-bold bg-transparent border-none text-neutral-950 dark:text-white focus:outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => onSelectDate(addDays(activeDate, 1))}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {activeDate !== today && (
                    <button
                      onClick={() => onSelectDate(today)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                    >
                      Jump to Today
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentEntry && (
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(currentEntry)}
                      title="View Expanded Details"
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  )}

                  {isSavedNotice && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Mood & Energy Pickers (Minimal & Monochrome) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/70">
                {/* Mood Selector - Monochrome Emojis */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5" />
                      <span>Day Mood</span>
                    </label>
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      {MOOD_OPTIONS.find((m) => m.level === mood)?.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    {MOOD_OPTIONS.map((opt) => {
                      const isSelected = mood === opt.level;
                      return (
                        <button
                          key={opt.level}
                          type="button"
                          onClick={() => setMood(opt.level)}
                          className={`flex-1 py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs scale-105 ring-2 ring-neutral-950 dark:ring-white font-bold'
                              : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750'
                          }`}
                          title={opt.label}
                        >
                          <span
                            className={`text-base select-none grayscale contrast-125 transition-transform ${
                              isSelected ? 'brightness-125' : 'opacity-85'
                            }`}
                          >
                            {opt.emoji}
                          </span>
                          <span className="text-[10px] font-mono">{opt.score}/5</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Energy Level Selector - Monochrome Minimal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                      <span>Energy Level</span>
                    </label>
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      {ENERGY_OPTIONS.find((e) => e.level === energy)?.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    {ENERGY_OPTIONS.map((opt) => {
                      const isSelected = energy === opt.level;
                      return (
                        <button
                          key={opt.level}
                          type="button"
                          onClick={() => setEnergy(opt.level)}
                          className={`flex-1 py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs scale-105 ring-2 ring-neutral-950 dark:ring-white font-bold'
                              : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750'
                          }`}
                          title={opt.desc}
                        >
                          <Zap className={`w-3.5 h-3.5 ${isSelected ? 'fill-current' : 'opacity-40'}`} />
                          <span className="text-[10px] font-mono">{opt.level}/5</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Journal Title */}
              <div>
                <input
                  type="text"
                  placeholder="Day headline or summary (e.g., Deep focus on architecture & design)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-base font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white placeholder:font-normal placeholder:text-neutral-400"
                />
              </div>

              {/* Journal Content */}
              <div>
                <textarea
                  rows={9}
                  placeholder="How was today? What went well? What challenged you? Any key memories or lessons learned?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 text-sm font-normal rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white leading-relaxed resize-none placeholder:text-neutral-400"
                />
              </div>

              {/* Tags & Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-bold border border-neutral-200 dark:border-neutral-700"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-neutral-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <form onSubmit={handleAddTag} className="inline-flex items-center">
                    <input
                      type="text"
                      placeholder="+ Add tag (Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none w-32"
                    />
                  </form>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  {currentEntry || title.trim() || content.trim() ? (
                    isConfirmingEditorDelete ? (
                      <div className="flex items-center gap-2 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={handleDeleteCurrentEntry}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm Delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsConfirmingEditorDelete(false)}
                          className="px-2.5 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingEditorDelete(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Entry</span>
                      </button>
                    )
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Reflection</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Memories & Daily Prompts */}
          <div className="space-y-5">
            {/* On This Day Across Years Memory Widget */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <History className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>On This Day In Past Years</span>
              </div>

              {memoryEntries.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                  <p className="text-xs text-neutral-400">
                    No past year entries found for this specific date yet. Keep logging daily to build your yearly memories.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memoryEntries.map((mem) => {
                    const moodMeta = MOOD_OPTIONS.find((m) => m.level === mem.mood);
                    return (
                      <div
                        key={mem.id}
                        onClick={() => handleOpenDetail(mem)}
                        className="group p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 hover:border-neutral-900 dark:hover:border-white transition-all cursor-pointer space-y-1.5 relative"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-950 dark:text-white">
                            {mem.date.split('-')[0]} ({formatDisplayDate(mem.date, 'monthDay')})
                          </span>
                          <div className="flex items-center gap-1.5">
                            {moodMeta && (
                              <span className="text-sm grayscale contrast-125 select-none" title={moodMeta.label}>
                                {moodMeta.emoji}
                              </span>
                            )}
                            {/* Explicit Edit button on card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEntry(mem.date);
                              }}
                              title="Edit this reflection"
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            {/* Explicit Delete button on card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteJournalEntry(mem.id);
                              }}
                              title="Delete this reflection"
                              className="p-1 rounded-md text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {mem.title && (
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                            {mem.title}
                          </p>
                        )}
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {mem.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Inspiration & Prompts */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                <Sparkles className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Daily Reflection Prompts</span>
              </div>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>What gave you the most clarity or energy today?</li>
                <li>What is one small victory or progress made?</li>
                <li>What will you do intentionally tomorrow?</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTH AT A GLANCE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Header with Month Navigation & Overview Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            {/* Month Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-950 dark:text-white capitalize">
                  {monthName}
                </h2>
                <span className="text-xs text-neutral-500 font-medium">
                  Month-at-a-glance Journal Overview
                </span>
              </div>

              <button
                type="button"
                onClick={handleJumpToCurrentMonth}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors ml-1"
              >
                Current Month
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                <span className="text-neutral-500">Days Logged:</span>
                <span className="font-bold text-neutral-950 dark:text-white font-mono">
                  {monthStats.loggedCount} / {monthStats.daysInMonth} ({monthStats.rate}%)
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                <span className="text-neutral-500">Avg Energy:</span>
                <span className="font-bold text-neutral-950 dark:text-white font-mono">
                  {monthStats.avgEnergy} / 5
                </span>
              </div>
            </div>
          </div>

          {/* Full Month Calendar Grid */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-100 dark:border-neutral-800">
              {WEEKDAY_NAMES.map((name) => (
                <div key={name} className="py-1">
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar Weeks & Days Matrix */}
            <div className="space-y-2">
              {calendarWeeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 gap-2">
                  {week.map((day) => {
                    const entry = entryMap.get(day.dateStr);
                    const hasEntry = !!(entry && (entry.content || entry.title || entry.mood));
                    const moodMeta = entry ? MOOD_OPTIONS.find((m) => m.level === entry.mood) : null;
                    const isSelected = day.dateStr === activeDate;

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => {
                          if (hasEntry && entry) {
                            handleOpenDetail(entry);
                          } else {
                            handleEditEntry(day.dateStr);
                          }
                        }}
                        className={`group min-h-[96px] sm:min-h-[110px] p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative ${
                          !day.isCurrentMonth
                            ? 'bg-neutral-50/40 dark:bg-neutral-900/30 border-neutral-200/40 dark:border-neutral-800/40 opacity-40 hover:opacity-80'
                            : hasEntry
                            ? isSelected
                              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-950 dark:border-white shadow-xs'
                              : 'bg-white dark:bg-neutral-850 border-neutral-200/90 dark:border-neutral-700/80 hover:border-neutral-400 dark:hover:border-neutral-500 shadow-2xs'
                            : 'bg-neutral-50/60 dark:bg-neutral-850/40 border-dashed border-neutral-200/70 dark:border-neutral-800/80 hover:border-solid hover:border-neutral-400 dark:hover:border-neutral-600'
                        }`}
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                              day.isToday
                                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                                : day.isCurrentMonth
                                ? 'text-neutral-900 dark:text-neutral-100'
                                : 'text-neutral-400 dark:text-neutral-600'
                            }`}
                          >
                            {day.dayNumber}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Monochrome Mood Indicator on Day */}
                            {hasEntry && moodMeta && (
                              <span
                                className="text-xs grayscale contrast-125 select-none"
                                title={`Mood: ${moodMeta.label}`}
                              >
                                {moodMeta.emoji}
                              </span>
                            )}

                            {/* Explicit Edit (Pencil) Button on Day Card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEntry(day.dateStr);
                              }}
                              title={hasEntry ? 'Edit reflection' : 'Write reflection for this day'}
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Day Content Preview */}
                        {hasEntry && entry ? (
                          <div className="mt-1 flex-1 flex flex-col justify-between">
                            {entry.title ? (
                              <p className="text-[11px] font-bold text-neutral-950 dark:text-white line-clamp-1 leading-tight">
                                {entry.title}
                              </p>
                            ) : (
                              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-tight">
                                {entry.content}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                              <span>⚡ {entry.energy}/5</span>
                              {entry.tags && entry.tags.length > 0 && (
                                <span>#{entry.tags[0]}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-auto text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 inline-flex items-center gap-0.5">
                              <Plus className="w-2.5 h-2.5" /> Log
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Month's Saved Entries List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Entries in {monthName} ({monthEntries.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  onSelectDate(today);
                  setActiveTab('editor');
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 transition-colors"
              >
                + Write Today's Entry
              </button>
            </div>

            {monthEntries.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-400">
                  No entries logged in {monthName} yet. Tap on any day above to start writing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {monthEntries.map((entry) => {
                  const moodMeta = MOOD_OPTIONS.find((m) => m.level === entry.mood);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => handleOpenDetail(entry)}
                      className="group p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/80 hover:border-neutral-900 dark:hover:border-white transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-neutral-950 dark:text-white">
                            {formatDisplayDate(entry.date, 'short')}
                          </span>

                          <div className="flex items-center gap-2">
                            {moodMeta && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                                <span className="grayscale contrast-125 select-none">{moodMeta.emoji}</span>
                                <span className="text-[10px]">{moodMeta.score}/5</span>
                              </span>
                            )}

                            {/* Explicit Edit Pencil Icon on Card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEntry(entry.date);
                              }}
                              title="Edit Reflection"
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors opacity-80 group-hover:opacity-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Explicit Delete Icon on Card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteJournalEntry(entry.id);
                              }}
                              title="Delete Reflection"
                              className="p-1 rounded-md text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-80 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {entry.title && (
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 mb-1">
                            {entry.title}
                          </h4>
                        )}

                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {entry.content || 'No text reflection logged.'}
                        </p>
                      </div>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-neutral-200/50 dark:border-neutral-800 text-[10px] text-neutral-500">
                          {entry.tags.map((t) => (
                            <span key={t} className="bg-neutral-200/60 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
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
        </div>
      )}

      {/* VIEW 3: TIMELINE & ARCHIVE (WITH COMPARATIVE REVIEW) */}
      {activeTab === 'timeline' && (
        <JournalComparativeTimeline
          journalEntries={journalEntries}
          activeDate={activeDate}
          onSelectDate={onSelectDate}
          onOpenDetail={handleOpenDetail}
          onEditEntry={handleEditEntry}
          onDeleteEntry={onDeleteJournalEntry}
          availableYears={availableYears}
        />
      )}

      {/* VIEW 4: TRENDS & ANALYTICS */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <span>Mood & Energy Progression (Recent 30 Days)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Track how your mental state and stamina correlate over time
                </p>
              </div>
            </div>

            {trendChartData.length < 2 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Log at least 2 daily entries to visualize your mood & energy progression graph.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderRadius: '12px',
                        border: '1px solid #333',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      name="Mood Level (1-5)"
                      stroke="#525252"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energy Level (1-5)"
                      stroke="#a3a3a3"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded Details Modal (Tapping any journal entry opens this minimal view) */}
      <JournalDetailModal
        entry={viewingEntry}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingEntry(null);
        }}
        onEdit={(entryToEdit) => {
          setIsDetailModalOpen(false);
          setViewingEntry(null);
          handleEditEntry(entryToEdit.date);
        }}
        onDelete={(entryId) => {
          onDeleteJournalEntry(entryId);
          setIsDetailModalOpen(false);
          setViewingEntry(null);
        }}
      />
    </div>
  );
};
