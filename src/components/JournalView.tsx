import React, { useState } from 'react';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Tag,
  Edit3,
  Trash2,
  Smile,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalViewProps {
  journalEntries: JournalEntry[];
  onOpenJournalModal: (entry?: JournalEntry | null, date?: string) => void;
  onDeleteJournal: (id: string) => void;
}

// Helper to format date object safely to YYYY-MM-DD
const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const JournalView: React.FC<JournalViewProps> = ({
  journalEntries,
  onOpenJournalModal,
  onDeleteJournal,
}) => {
  const todayStr = formatDateKey(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false);
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(new Date());

  // Month navigation helpers for the calendar view
  const calYear = calendarMonthDate.getFullYear();
  const calMonth = calendarMonthDate.getMonth();
  const monthName = calendarMonthDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCalendarMonthDate(new Date(calYear, calMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonthDate(new Date(calYear, calMonth + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCalendarMonthDate(today);
    setSelectedDate(formatDateKey(today));
  };

  // Generate calendar days for month grid
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const daysGrid: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing padding
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(calYear, calMonth - 1, prevMonthDays - i);
    daysGrid.push({
      dateStr: formatDateKey(d),
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(calYear, calMonth, d);
    daysGrid.push({
      dateStr: formatDateKey(dateObj),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading padding to fill standard 35 or 42 grid cells
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(calYear, calMonth + 1, i);
    daysGrid.push({
      dateStr: formatDateKey(d),
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  // Collect all tags
  const allTags = Array.from(
    new Set(journalEntries.flatMap((j) => j.tags || []))
  );

  // Filter entries
  const filteredEntries = journalEntries.filter((j) => {
    const matchesSearch =
      !searchQuery ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTag === 'all' || (j.tags && j.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  // Selected date entry
  const selectedDateEntry = journalEntries.find((j) => j.date === selectedDate);

  // Date strip helper (past 7 days + today + future 2 days)
  const dateStrip: string[] = [];
  for (let i = -7; i <= 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dateStrip.push(formatDateKey(d));
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Controls & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#823b28]/60" size={16} />
          <input
            type="text"
            id="journal-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections & journal entries..."
            className="w-full bg-[#f6e9d7] border border-[#281b18]/15 text-[#281b18] text-xs font-medium rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-[#823b28]"
          />
        </div>

        {/* Tag Filters, Calendar Mode Toggle & New Entry Trigger */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {allTags.length > 0 && (
            <select
              id="journal-tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-[#f6e9d7] border border-[#281b18]/15 text-[#281b18] text-xs font-semibold rounded-2xl px-3 py-2 outline-none focus:border-[#823b28] cursor-pointer"
            >
              <option value="all">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          )}

          {/* Calendar Strip / Full Month Switcher Button */}
          <button
            id="toggle-journal-calendar-mode"
            onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              isCalendarExpanded
                ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28] shadow-sm'
                : 'bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#823b28] border-[#281b18]/15'
            }`}
            title={isCalendarExpanded ? 'Collapse to Date Strip' : 'Expand to Full Calendar View'}
          >
            {isCalendarExpanded ? (
              <>
                <Minimize2 size={14} />
                <span>Date Strip View</span>
              </>
            ) : (
              <>
                <CalendarDays size={14} />
                <span>Full Calendar View</span>
              </>
            )}
          </button>

          <button
            id="write-reflection-btn"
            onClick={() => onOpenJournalModal(null, selectedDate)}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Write Reflection</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Section: Compact Strip OR Full Calendar View */}
      {!isCalendarExpanded ? (
        /* Compact Date Strip Ribbon */
        <div className="bg-[#edd8c2]/50 border border-[#281b18]/10 rounded-3xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 flex-1">
            <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase px-2 shrink-0 flex items-center gap-1">
              <CalendarIcon size={12} />
              SELECT DATE:
            </span>
            {dateStrip.map((dateStr) => {
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const entry = journalEntries.find((j) => j.date === dateStr);
              const formatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
              });

              return (
                <button
                  key={dateStr}
                  id={`date-strip-btn-${dateStr}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl transition-all cursor-pointer min-w-[68px] border shrink-0 ${
                    isSelected
                      ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28] shadow-sm font-bold'
                      : isToday
                      ? 'bg-[#f6e9d7] text-[#281b18] border-[#823b28] font-bold'
                      : 'bg-[#fbf6ef] hover:bg-[#f6e9d7] text-[#281b18] border-[#281b18]/10'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase opacity-80">{formatted.split(' ')[0]}</span>
                  <span className="text-xs font-mono font-extrabold">{formatted.split(' ')[1]}</span>
                  {entry ? (
                    <span className="text-[11px] leading-none mt-0.5">
                      {entry.moodEmoji || '📝'}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Expand Button */}
          <button
            onClick={() => setIsCalendarExpanded(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#823b28] bg-[#fbf6ef] hover:bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl transition-all shrink-0 cursor-pointer"
          >
            <CalendarDays size={14} />
            <span className="whitespace-nowrap">Expand Month</span>
            <ChevronDown size={14} />
          </button>
        </div>
      ) : (
        /* Fully Expanded Calendar View (Same Architecture as Task Calendar) */
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Calendar Header with Navigation & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#281b18]/10 pb-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-1">
                <button
                  id="journal-prev-month-btn"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl hover:bg-[#edd8c2] text-[#823b28] cursor-pointer transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  id="journal-next-month-btn"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl hover:bg-[#edd8c2] text-[#823b28] cursor-pointer transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <h2 className="text-lg md:text-xl font-extrabold text-[#281b18] font-sans tracking-tight">
                {monthName}
              </h2>

              <button
                id="journal-today-btn"
                onClick={handleGoToToday}
                className="text-xs font-mono font-bold text-[#823b28] bg-[#edd8c2] hover:bg-[#e3c4a7] px-3 py-1.5 rounded-2xl transition-all cursor-pointer border border-[#823b28]/15"
              >
                Today
              </button>
            </div>

            {/* Collapse / Info Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="font-mono text-[11px] text-[#823b28]/80 hidden md:inline">
                Click any day to view or write reflection
              </span>
              <button
                onClick={() => setIsCalendarExpanded(false)}
                className="flex items-center gap-1 text-xs font-bold text-[#823b28] bg-[#edd8c2] hover:bg-[#e3c4a7] px-3 py-1.5 rounded-2xl transition-all border border-[#281b18]/10 cursor-pointer"
              >
                <Minimize2 size={13} />
                <span>Collapse Strip</span>
                <ChevronUp size={13} />
              </button>
            </div>
          </div>

          {/* Weekday Header Labels */}
          <div className="grid grid-cols-7 text-center font-mono text-[11px] font-bold text-[#823b28] uppercase border-b border-[#281b18]/10 pb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid of Month Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysGrid.map((cell, idx) => {
              const isSelected = selectedDate === cell.dateStr;
              const isToday = cell.dateStr === todayStr;
              const entry = journalEntries.find((j) => j.date === cell.dateStr);

              return (
                <button
                  key={idx}
                  id={`journal-calendar-day-${cell.dateStr}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[76px] sm:min-h-[88px] p-2 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28] shadow-md z-10'
                      : isToday
                      ? 'bg-[#edd8c2] border-[#823b28] text-[#281b18] font-bold'
                      : cell.isCurrentMonth
                      ? 'bg-[#f6e9d7]/80 hover:bg-[#edd8c2] border-[#281b18]/10 text-[#281b18]'
                      : 'bg-[#f6e9d7]/30 border-transparent text-[#823b28]/40'
                  }`}
                >
                  {/* Top: Day Number & Mood/Book Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-mono text-xs font-extrabold ${
                        isSelected ? 'text-[#f6e9d7]' : 'text-[#281b18]'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {entry && (
                      <span
                        className={`text-sm ${
                          isSelected ? 'text-[#f6e9d7]' : 'text-[#823b28]'
                        }`}
                        title={entry.title}
                      >
                        {entry.moodEmoji || '📝'}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Journal Entry Title snippet or prompt */}
                  {entry ? (
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p
                        className={`text-[10px] font-bold truncate leading-tight ${
                          isSelected ? 'text-[#f6e9d7]' : 'text-[#281b18]'
                        }`}
                      >
                        {entry.title}
                      </p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          <span
                            className={`text-[8px] font-mono font-medium px-1 rounded truncate ${
                              isSelected
                                ? 'bg-[#281b18]/50 text-[#eb9d7d]'
                                : 'bg-[#edd8c2] text-[#823b28]'
                            }`}
                          >
                            #{entry.tags[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="opacity-0 hover:opacity-100 transition-opacity text-[9px] font-mono text-[#823b28]/60 text-center py-1">
                      + write
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Journal Layout: Active Date Featured Entry + All Entries Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Selected Date Entry Panel */}
        <div className="lg:col-span-2 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between border-b border-[#281b18]/10 pb-4 mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                  REFLECTIONS FOR
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#281b18] font-sans">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h2>
              </div>

              {selectedDateEntry && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl bg-[#edd8c2] p-2 rounded-2xl">{selectedDateEntry.moodEmoji || '😊'}</span>
                  <button
                    id="edit-journal-btn"
                    onClick={() => onOpenJournalModal(selectedDateEntry, selectedDate)}
                    className="p-2 rounded-2xl bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#823b28] transition-colors cursor-pointer"
                    title="Edit Entry"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    id="delete-journal-btn"
                    onClick={() => onDeleteJournal(selectedDateEntry.id)}
                    className="p-2 rounded-2xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {selectedDateEntry ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-[#281b18] font-sans">
                  {selectedDateEntry.title}
                </h3>
                <p className="text-sm text-[#281b18] leading-relaxed whitespace-pre-line font-normal">
                  {selectedDateEntry.content}
                </p>

                {selectedDateEntry.tags && selectedDateEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedDateEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs bg-[#edd8c2] text-[#823b28] px-3 py-1 rounded-full border border-[#d4aa86]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#edd8c2] flex items-center justify-center text-[#823b28] mb-3">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-base font-bold text-[#281b18]">No reflection recorded for this date</h4>
                <p className="text-xs text-[#823b28]/80 max-w-sm mt-1">
                  Journaling grounds your focus. Record today's wins, thoughts, or mindfulness notes.
                </p>
                <button
                  id="write-entry-empty-btn"
                  onClick={() => onOpenJournalModal(null, selectedDate)}
                  className="mt-4 bg-[#823b28] text-[#f6e9d7] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:bg-[#6f2f1f] cursor-pointer"
                >
                  Write Entry for This Date
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#281b18]/10 text-right flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#823b28]/70">
              {selectedDateEntry ? `Last updated on ${selectedDate}` : 'Ready for your reflection'}
            </span>
            <span className="font-mono text-[10px] text-[#823b28]/70 uppercase">
              EHSAAN FLOW ATELIER JOURNAL
            </span>
          </div>
        </div>

        {/* Previous Entries Timeline Stream */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
              HISTORICAL TIMELINE
            </span>
            <h3 className="text-lg font-extrabold text-[#281b18]">
              All Reflections ({filteredEntries.length})
            </h3>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-xs text-[#823b28]/70 italic py-6 text-center">
              No matching journal entries.
            </p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredEntries.map((entry) => {
                const isSelected = selectedDate === entry.date;

                return (
                  <div
                    key={entry.id}
                    id={`journal-timeline-item-${entry.id}`}
                    onClick={() => {
                      setSelectedDate(entry.date);
                      // Also sync month if viewing expanded calendar
                      const [y, m] = entry.date.split('-').map(Number);
                      if (y && m) {
                        setCalendarMonthDate(new Date(y, m - 1, 1));
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28] shadow-sm'
                        : 'bg-[#f6e9d7] hover:bg-[#edd8c2] text-[#281b18] border-[#281b18]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono text-[10px] font-bold uppercase ${
                          isSelected ? 'text-[#eb9d7d]' : 'text-[#823b28]'
                        }`}
                      >
                        {entry.date}
                      </span>
                      <span>{entry.moodEmoji || '😊'}</span>
                    </div>
                    <h5 className="text-xs font-extrabold truncate">{entry.title}</h5>
                    <p
                      className={`text-[11px] line-clamp-2 mt-1 leading-relaxed ${
                        isSelected ? 'text-[#eb9d7d]' : 'text-[#823b28]'
                      }`}
                    >
                      {entry.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

