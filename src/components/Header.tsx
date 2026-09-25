import React from 'react';
import { Search, Plus, BookOpen, X, Calendar, Sparkles } from 'lucide-react';
import { NavSection } from '../types';

interface HeaderProps {
  currentSection: NavSection;
  onOpenNewTaskModal: () => void;
  onOpenNewJournalModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userName: string;
  onOpenEhsaanStudio?: () => void;
  theme?: 'original';
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenNewTaskModal,
  onOpenNewJournalModal,
  searchQuery,
  onSearchChange,
  userName,
  onOpenEhsaanStudio,
  theme = 'original',
}) => {
  const isOlive = false;
  const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
    today: {
      title: `Good day, ${userName}`,
      subtitle: 'Here is your daily focus, time agenda, and progress meters.',
    },
    habits: {
      title: 'Daily Habit Tracking',
      subtitle: 'Build sustainable daily rituals, track streaks, and view consistency analytics.',
    },
    tasks: {
      title: 'Task Management',
      subtitle: 'Organize high-leverage outcomes, subtasks, and priority queues.',
    },
    notes: {
      title: 'Notes & Workspace',
      subtitle: 'Capture ideas, project documentation, code snippets, and quick reflections.',
    },
    calendar: {
      title: 'Calendar & Agenda',
      subtitle: 'Chronological timeline and workload density across dates.',
    },
    journal: {
      title: 'Daily Reflections & Journal',
      subtitle: 'Capture intentional thoughts, daily reflections, and mindfulness logs.',
    },
    progress: {
      title: 'Progress Meters & Metrics',
      subtitle: 'Track custom personal dimensions over 7-day, 30-day, and quarterly trends.',
    },
    insights: {
      title: 'Personal Analytics & Insights',
      subtitle: 'Data-backed pattern detection and personalized progress feedback.',
    },
    settings: {
      title: 'System Preferences',
      subtitle: 'Data safety, JSON export & import, and progress meter configuration.',
    },
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2 mb-6">
      {/* Title & Brand Header */}
      <div className="w-full md:w-auto">
        <div className="flex items-center justify-between md:justify-start gap-2.5 mb-2 flex-wrap">
          {/* Mobile & Tablet App Brand Pill */}
          <button onClick={onOpenEhsaanStudio} className="lg:hidden flex items-center gap-1.5 bg-[#823b28] text-[#f6e9d7] px-3 py-1 rounded-full shadow-xs hover:opacity-90 transition-opacity cursor-pointer">
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 512 512">
              <rect width="512" height="512" rx="128" fill="#823b28"/>
              <rect x="76" y="76" width="360" height="360" rx="150" fill="#df734c"/>
              <g transform="translate(256, 256) rotate(35) scale(1.15)">
                <path d="M 0,20 C -35,-5 -60,15 -50,45 C -40,75 -10,50 0,20 Z" fill="#22c55e" stroke="#000000" strokeWidth="16" strokeLinejoin="round" />
                <path d="M 0,20 C 35,-5 60,15 50,45 C 40,75 10,50 0,20 Z" fill="#22c55e" stroke="#000000" strokeWidth="16" strokeLinejoin="round" />
                <path d="M 0,-40 C -35,-65 -60,-45 -50,-15 C -40,15 -10,-10 0,-40 Z" fill="#22c55e" stroke="#000000" strokeWidth="16" strokeLinejoin="round" />
                <path d="M 0,-40 C 35,-65 60,-45 50,-15 C 40,15 10,-10 0,-40 Z" fill="#22c55e" stroke="#000000" strokeWidth="16" strokeLinejoin="round" />
                <path d="M 0,-90 C -18,-115 -18,-150 0,-155 C 18,-150 18,-115 0,-90 Z" fill="#22c55e" stroke="#000000" strokeWidth="16" strokeLinejoin="round" />
                <path d="M 0,105 L 0,-95" fill="none" stroke="#000000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,35 L -25,20" fill="none" stroke="#000000" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,35 L 25,20" fill="none" stroke="#000000" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,-25 L -25,-40" fill="none" stroke="#000000" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,-25 L 25,-40" fill="none" stroke="#000000" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,105 L 0,-95" fill="none" stroke="#a3e635" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,35 L -25,20" fill="none" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,35 L 25,20" fill="none" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,-25 L -25,-40" fill="none" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,-25 L 25,-40" fill="none" stroke="#a3e635" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
            <span className="font-extrabold text-xs font-sans tracking-tight">EHSAAN FLOW</span>
          </button>

          {/* Aesthetic Larger Day & Date Pill */}
          <div className="flex items-center gap-1.5 bg-[#f6e9d7] text-[#823b28] px-3.5 py-1 rounded-xl border border-[#823b28]/20 shadow-2xs">
            <Calendar size={14} className="text-[#df734c]" />
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wide">
              {todayFormatted}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#281b18] tracking-tight font-sans">
          {sectionTitles[currentSection].title}
        </h1>
        <p className="text-xs sm:text-sm text-[#823b28]/80 mt-0.5 font-medium line-clamp-1 sm:line-clamp-none">
          {sectionTitles[currentSection].subtitle}
        </p>
      </div>

      {/* Action Controls Wrapped in Semi-Transparent Card Container */}
      {currentSection !== 'settings' && (
        <div className="bg-[#fbf6ef]/80 backdrop-blur-xs border border-[#281b18]/15 rounded-3xl p-2 sm:p-2.5 shadow-sm flex items-center gap-2 sm:gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[150px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#823b28]/60" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  onSearchChange(searchQuery);
                }
              }}
              placeholder="Search tasks, notes, #tags..."
              className="w-full bg-[#f6e9d7] border border-[#281b18]/15 text-[#281b18] placeholder-[#823b28]/50 text-xs font-semibold rounded-2xl pl-9 pr-8 py-2.5 outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] transition-all shadow-2xs h-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#823b28]/60 hover:text-[#823b28] p-1 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Quick Studio Trigger */}
          <button
            onClick={onOpenEhsaanStudio}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#823b28] px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all border border-[#281b18]/15 cursor-pointer active:scale-95 whitespace-nowrap h-10"
            title="Open Ehsaan Studio"
          >
            <Sparkles size={15} />
            <span>Studio</span>
          </button>

          {/* Quick Task Modal Trigger */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-4 py-2.5 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer border border-[#a14c35]/40 active:scale-95 whitespace-nowrap h-10"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>+ New Task</span>
          </button>

          {/* Quick Journal Modal Trigger */}
          <button
            onClick={onOpenNewJournalModal}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border border-[#281b18]/15 cursor-pointer active:scale-95 whitespace-nowrap h-10"
            title="Record Daily Reflection"
          >
            <BookOpen size={15} className="text-[#823b28]" />
            <span>Journal</span>
          </button>
        </div>
      )}
    </header>
  );
};
