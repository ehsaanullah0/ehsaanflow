import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square
} from 'lucide-react';
import { Task, JournalEntry, ProgressMeter } from '../types';
import { isTaskCompletedOnDate } from '../utils/habitUtils';

interface CalendarViewProps {
  tasks: Task[];
  journalEntries: JournalEntry[];
  progressMeters: ProgressMeter[];
  onToggleTaskComplete: (taskId: string, dateStr?: string) => void;
  onToggleSubtaskComplete?: (taskId: string, subtaskId: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenJournalModal: (entry?: JournalEntry | null, date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  journalEntries,
  progressMeters,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onOpenNewTaskModal,
  onOpenJournalModal,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpandSubtasks = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper for formatting month header
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate calendar days for month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: ({ dateStr: string; dayNum: number; isCurrentMonth: boolean })[] = [];

  // Previous month trailing padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    daysGrid.push({
      dateStr: d.toISOString().split('T')[0],
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    daysGrid.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading padding to fill 35 or 42 grid cells
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    daysGrid.push({
      dateStr: d.toISOString().split('T')[0],
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  // Helper to check if task falls on date
  const isTaskOnDate = (task: Task, dateStr: string) => {
    if (task.dueDate === dateStr) return true;
    if (task.isRecurring === 'daily') {
      const taskStart = task.startDate || task.dueDate || task.createdAt.split('T')[0];
      const startMonth = taskStart.substring(0, 7);
      const dateMonth = dateStr.substring(0, 7);
      return dateStr >= taskStart && dateMonth === startMonth;
    }
    if (task.startDate && task.endDate) {
      return dateStr >= task.startDate && dateStr <= task.endDate;
    }
    if (task.startDate && task.dueDate) {
      return dateStr >= task.startDate && dateStr <= task.dueDate;
    }
    return false;
  };

  // Tasks for selected date
  const selectedDateTasks = tasks.filter((t) => isTaskOnDate(t, selectedDateStr));
  const selectedDateJournal = journalEntries.find((j) => j.date === selectedDateStr);

  // Group tasks by date for Agenda View
  const datesMap: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.isRecurring === 'daily') {
      const taskStart = task.startDate || task.dueDate || task.createdAt.split('T')[0];
      const startMonth = taskStart.substring(0, 7);
      daysGrid.forEach((day) => {
        const dayMonth = day.dateStr.substring(0, 7);
        if (day.dateStr >= taskStart && dayMonth === startMonth) {
          if (!datesMap[day.dateStr]) datesMap[day.dateStr] = [];
          if (!datesMap[day.dateStr].some((x) => x.id === task.id)) {
            datesMap[day.dateStr].push(task);
          }
        }
      });
      return;
    }

    const startStr = task.startDate || task.dueDate;
    const endStr = task.endDate || task.dueDate;

    if (startStr && endStr) {
      // Parse YYYY-MM-DD properly without timezone shift
      const [sY, sM, sD] = startStr.split('-').map(Number);
      const [eY, eM, eD] = endStr.split('-').map(Number);

      if (sY && sM && sD && eY && eM && eD) {
        const cur = new Date(sY, sM - 1, sD);
        const end = new Date(eY, eM - 1, eD);

        while (cur <= end) {
          const y = cur.getFullYear();
          const m = String(cur.getMonth() + 1).padStart(2, '0');
          const d = String(cur.getDate()).padStart(2, '0');
          const dStr = `${y}-${m}-${d}`;

          if (!datesMap[dStr]) datesMap[dStr] = [];
          if (!datesMap[dStr].some((x) => x.id === task.id)) {
            datesMap[dStr].push(task);
          }
          cur.setDate(cur.getDate() + 1);
        }
      }
    } else if (task.dueDate) {
      if (!datesMap[task.dueDate]) datesMap[task.dueDate] = [];
      if (!datesMap[task.dueDate].some((x) => x.id === task.id)) {
        datesMap[task.dueDate].push(task);
      }
    }
  });
  const sortedAgendaDates = Object.keys(datesMap).sort();

  return (
    <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-300">
      {/* Top Calendar Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-3.5 sm:p-4 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="flex items-center bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-[#edd8c2] text-[#823b28] cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-[#edd8c2] text-[#823b28] cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#281b18] font-sans tracking-tight">
            {monthName}
          </h2>

          <button
            onClick={handleToday}
            className="text-xs font-mono font-bold text-[#823b28] bg-[#edd8c2] hover:bg-[#e3c4a7] px-2.5 sm:px-3 py-1.5 rounded-2xl transition-all cursor-pointer border border-[#823b28]/15 ml-auto sm:ml-0"
          >
            Today
          </button>
        </div>

        {/* View Mode Switcher & Add Task Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <div className="flex items-center bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                  : 'text-[#823b28]/70 hover:text-[#823b28]'
              }`}
            >
              <CalendarIcon size={13} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                  : 'text-[#823b28]/70 hover:text-[#823b28]'
              }`}
            >
              <List size={13} />
              <span>Agenda</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Month Grid (2 cols) */}
          <div className="lg:col-span-2 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center font-mono text-[10px] sm:text-[11px] font-bold text-[#823b28] uppercase border-b border-[#281b18]/10 pb-2.5 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
              {daysGrid.map((cell, idx) => {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                const dayTasks = tasks
                  .filter((t) => isTaskOnDate(t, cell.dateStr))
                  .sort((a, b) => {
                    const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
                    const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
                    return weightB - weightA;
                  });
                const isSelected = selectedDateStr === cell.dateStr;
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                const hasJournal = journalEntries.some((j) => j.date === cell.dateStr);
                const isOverloaded = dayTasks.length >= 4;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[58px] sm:min-h-[84px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28] shadow-md z-10'
                        : isToday
                        ? 'bg-[#edd8c2] border-[#823b28] text-[#281b18] font-bold'
                        : cell.isCurrentMonth
                        ? 'bg-[#f6e9d7]/80 hover:bg-[#edd8c2] border-[#281b18]/10 text-[#281b18]'
                        : 'bg-[#f6e9d7]/30 border-transparent text-[#823b28]/40'
                    }`}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono text-[11px] sm:text-xs font-extrabold ${
                          isSelected ? 'text-[#f6e9d7]' : 'text-[#281b18]'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Icons for Journal or Overloaded warning */}
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {hasJournal && (
                          <span className={isSelected ? 'text-[#eb9d7d]' : 'text-[#823b28]'} title="Journal logged">
                            <BookOpen size={9} />
                          </span>
                        )}
                        {isOverloaded && (
                          <span className="text-[#df734c]" title="Overloaded Day (4+ tasks)">
                            <AlertCircle size={9} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Indicators */}
                    {dayTasks.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-2 w-full">
                        <div className="hidden sm:flex flex-col gap-0.5 max-h-12 overflow-hidden">
                          {dayTasks.slice(0, 2).map((t) => (
                            <div
                              key={t.id}
                              className={`truncate text-[9px] font-extrabold uppercase tracking-wider text-left leading-tight ${
                                isSelected
                                  ? 'text-[#f6e9d7]'
                                  : 'text-[#823b28]'
                              }`}
                              title={`${t.title}`}
                            >
                              {t.title}
                            </div>
                          ))}
                        </div>

                        {/* Dot indicator on mobile / compact */}
                        <div className="flex items-center justify-center gap-0.5 sm:hidden">
                          {dayTasks.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-[#fbf6ef]/80' : 'bg-[#823b28]/50'
                              }`}
                            />
                          ))}
                          {dayTasks.length > 2 && (
                            <span className="text-[8px] font-mono font-bold leading-none text-[#823b28]/50">+</span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Column */}
          <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                SELECTED DATE AGENDA
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#281b18] font-sans">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
            </div>

            {/* Tasks for Selected Date */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#823b28]">
                  Tasks ({selectedDateTasks.length})
                </span>
                <button
                  onClick={onOpenNewTaskModal}
                  className="text-xs font-bold text-[#823b28] hover:underline cursor-pointer"
                >
                  + Add
                </button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-[#823b28]/70 italic py-4 text-center bg-[#f6e9d7]/60 rounded-2xl border border-dashed border-[#281b18]/15">
                  No tasks scheduled for this date.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                  {selectedDateTasks.map((t) => {
                    const isCompleted = isTaskCompletedOnDate(t, selectedDateStr);
                    return (
                      <div
                        key={t.id}
                        className="flex flex-col gap-1.5 p-3 bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => onToggleTaskComplete(t.id, selectedDateStr)}
                            className="flex items-center gap-2 text-left cursor-pointer flex-1 min-w-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={17} className="text-[#823b28] flex-shrink-0" />
                            ) : (
                              <Circle size={17} className="text-[#823b28]/60 flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm font-extrabold truncate ${
                                isCompleted ? 'line-through text-[#823b28]/50' : 'text-[#281b18]'
                              }`}
                            >
                              {t.title}
                            </span>
                          </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.subtasks && t.subtasks.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleExpandSubtasks(t.id); }}
                              className="p-1 hover:bg-[#edd8c2] rounded-md text-[#823b28] transition-colors cursor-pointer"
                              title="Toggle Subtasks"
                            >
                              {expandedTaskIds[t.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
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
                      </div>

                      {/* Expanded Subtasks checklist */}
                      {expandedTaskIds[t.id] && t.subtasks && t.subtasks.length > 0 && (
                        <div className="pl-6 pt-1.5 border-t border-[#281b18]/5 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-150">
                          {t.subtasks.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => onToggleSubtaskComplete && onToggleSubtaskComplete(t.id, st.id)}
                              className="flex items-center gap-2 text-left w-full cursor-pointer hover:opacity-90 group"
                            >
                              {st.completed ? (
                                <CheckSquare size={14} className="text-[#823b28] shrink-0" />
                              ) : (
                                <Square size={14} className="text-[#823b28]/60 group-hover:text-[#823b28] shrink-0" />
                              )}
                              <span className={`text-[11px] font-medium leading-none ${st.completed ? 'line-through text-[#823b28]/50' : 'text-[#281b18]/80'}`}>
                                {st.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}

              {/* Journal for Selected Date */}
              <div className="mt-3 pt-3 border-t border-[#281b18]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#823b28] flex items-center gap-1">
                    <BookOpen size={13} />
                    Journal Entry
                  </span>
                  <button
                    onClick={() => onOpenJournalModal(selectedDateJournal, selectedDateStr)}
                    className="text-xs font-bold text-[#823b28] bg-[#edd8c2] px-2.5 py-1 rounded-xl cursor-pointer hover:bg-[#e3c4a7]"
                  >
                    {selectedDateJournal ? 'Edit' : 'Write'}
                  </button>
                </div>

                {selectedDateJournal ? (
                  <div className="bg-[#f6e9d7] p-3 rounded-2xl border border-[#281b18]/10 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#281b18] mb-1">
                      <span className="truncate mr-2">{selectedDateJournal.title}</span>
                      <span>{selectedDateJournal.moodEmoji}</span>
                    </div>
                    <p className="text-[#823b28] line-clamp-2 leading-relaxed">
                      {selectedDateJournal.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#823b28]/70 italic py-2 text-center bg-[#f6e9d7]/40 rounded-xl">
                    No journal entry for this date yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-5 sm:gap-6">
          <div className="flex items-center justify-between border-b border-[#281b18]/10 pb-3 sm:pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
                TIMELINE VIEW
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#281b18]">
                Upcoming Agenda & Milestones
              </h3>
            </div>
          </div>

          {sortedAgendaDates.length === 0 ? (
            <p className="text-sm text-[#823b28] text-center py-10 sm:py-12">
              No tasks found in agenda. Create new tasks with due dates to visualize your upcoming timeline.
            </p>
          ) : (
            <div className="flex flex-col gap-5 sm:gap-6">
              {sortedAgendaDates.map((dateKey) => {
                const dayTasks = datesMap[dateKey];
                const formattedDate = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                const isToday = dateKey === new Date().toISOString().split('T')[0];

                return (
                  <div key={dateKey} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`font-mono text-xs font-extrabold px-3 py-1 rounded-full border ${
                          isToday
                            ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28]'
                            : 'bg-[#df734c]/15 text-[#823b28] border-[#df734c]/35 shadow-2xs'
                        }`}
                      >
                        {isToday ? 'TODAY — ' : ''}
                        {formattedDate}
                      </span>
                      <div className="flex-1 h-px bg-[#281b18]/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pl-1 sm:pl-2">
                      {dayTasks.map((t) => {
                        const isCompleted = isTaskCompletedOnDate(t, dateKey);
                        return (
                          <div
                            key={t.id}
                            className="flex flex-col gap-2 p-3 sm:p-3.5 bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl hover:border-[#823b28]/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-3 w-full">
                              <button
                                onClick={() => onToggleTaskComplete(t.id, dateKey)}
                                className="flex items-center gap-2.5 text-left cursor-pointer flex-1 min-w-0"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={17} className="text-[#823b28] flex-shrink-0" />
                                ) : (
                                  <Circle size={17} className="text-[#823b28]/60 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <h5
                                    className={`text-sm font-extrabold truncate ${
                                      isCompleted ? 'line-through text-[#823b28]/50' : 'text-[#281b18]'
                                    }`}
                                  >
                                    {t.title}
                                  </h5>
                                {t.category && (
                                  <span className="font-mono text-[9px] text-[#823b28]">
                                    {t.category}
                                  </span>
                                )}
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {t.subtasks && t.subtasks.length > 0 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleExpandSubtasks(t.id); }}
                                  className="p-1 hover:bg-[#edd8c2] rounded-md text-[#823b28] transition-colors cursor-pointer"
                                  title="Toggle Subtasks"
                                >
                                  {expandedTaskIds[t.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              )}
                              <span
                                className={`font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 border ${
                                  t.priority === 'high'
                                    ? 'bg-[#df734c]/10 text-[#df734c] border-[#df734c]/30'
                                    : t.priority === 'medium'
                                    ? 'bg-[#422119]/10 text-[#422119] border-[#422119]/30'
                                    : 'bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/30'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Subtasks checklist */}
                          {expandedTaskIds[t.id] && t.subtasks && t.subtasks.length > 0 && (
                            <div className="pl-6 pt-1.5 border-t border-[#281b18]/5 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-150 w-full">
                              {t.subtasks.map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => onToggleSubtaskComplete && onToggleSubtaskComplete(t.id, st.id)}
                                  className="flex items-center gap-2 text-left w-full cursor-pointer hover:opacity-90 group"
                                >
                                  {st.completed ? (
                                    <CheckSquare size={14} className="text-[#823b28] shrink-0" />
                                  ) : (
                                    <Square size={14} className="text-[#823b28]/60 group-hover:text-[#823b28] shrink-0" />
                                  )}
                                  <span className={`text-[11px] font-medium leading-none ${st.completed ? 'line-through text-[#823b28]/50' : 'text-[#281b18]/80'}`}>
                                    {st.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
