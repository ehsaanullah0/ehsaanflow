import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Flame,
  CheckSquare,
  StickyNote,
  Calendar as CalendarIcon,
  BookOpen,
  Activity,
  Sparkles,
  Settings as SettingsIcon,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  X,
  Mail,
} from 'lucide-react';
import { NavSection } from '../types';

interface BottomNavProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentSection,
  onSelectSection,
  pendingTasksCount,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const lastScrollY = useRef<number>(0);
  const scrollTimeout = useRef<number | null>(null);

  // ... (rest of component)

  // Auto-hide bottom nav when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = (e?: Event) => {
      let currentScrollY = window.scrollY || document.documentElement.scrollTop;
      if (e && e.target && typeof (e.target as HTMLElement).scrollTop === 'number') {
        currentScrollY = (e.target as HTMLElement).scrollTop;
      }

      const scrollDiff = currentScrollY - lastScrollY.current;

      if (currentScrollY < 30) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (scrollDiff > 8 && currentScrollY > 40) {
        setIsVisible(false);
        setIsMoreOpen(false);
      } else if (scrollDiff < -6) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, [currentSection]);

  // Primary navigation items (shown directly in bottom bar)
  const primaryNavItems = [
    {
      id: 'today' as NavSection,
      label: 'Today',
      icon: Sun,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'habits' as NavSection,
      label: 'Habits',
      icon: Flame,
    },
    {
      id: 'tasks' as NavSection,
      label: 'Tasks',
      icon: CheckSquare,
    },
    {
      id: 'calendar' as NavSection,
      label: 'Calendar',
      icon: CalendarIcon,
    },
  ];

  // Secondary items in 'More' expandable menu
  const moreNavItems = [
    {
      id: 'notes' as NavSection,
      label: 'Notes & Ideas',
      desc: 'Capture ideas & docs',
      icon: StickyNote,
    },
    {
      id: 'journal' as NavSection,
      label: 'Journal & Reflections',
      desc: 'Capture daily reflections',
      icon: BookOpen,
    },
    {
      id: 'progress' as NavSection,
      label: 'Progress Meters',
      desc: 'Track personal metrics',
      icon: Activity,
    },
    {
      id: 'insights' as NavSection,
      label: 'Insights & AI Analytics',
      desc: 'View personal trends',
      icon: Sparkles,
    },
    {
      id: 'settings' as NavSection,
      label: 'Preferences & Storage',
      desc: 'JSON backups & settings',
      icon: SettingsIcon,
    },
  ];

  const isMoreActive = moreNavItems.some((item) => item.id === currentSection);

  return (
    <>
      {/* Expandable 'More' Overlay Menu */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setIsMoreOpen(false)} 
          />
          <div className="relative z-10 bg-[#f6e9d7] border-t border-[#281b18]/20 rounded-t-3xl p-5 shadow-2xl space-y-3 max-w-lg mx-auto w-full text-[#281b18]">
            <div className="flex items-center justify-between border-b border-[#281b18]/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#823b28] text-[#f6e9d7] flex items-center justify-center font-bold">
                  <MoreHorizontal size={18} />
                </div>
                <h3 className="font-extrabold text-base text-[#281b18]">
                  More Tools & Views
                </h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectSection(item.id);
                      setIsMoreOpen(false);
                      setIsVisible(true);
                    }}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all cursor-pointer text-left w-full ${
                      isActive
                        ? 'bg-[#823b28] text-[#f6e9d7] shadow-sm'
                        : 'bg-[#fbf6ef] hover:bg-[#edd8c2] text-[#281b18] border border-[#281b18]/10'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#df734c] text-white' : 'bg-[#edd8c2] text-[#823b28]'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm tracking-tight truncate">
                        {item.label}
                      </span>
                      <span
                        className={`text-[11px] truncate ${
                          isActive ? 'text-[#f6e9d7]/80' : 'text-[#823b28]/70'
                        }`}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#281b18]/10">
              <a
                href="mailto:worsmon@proton.me"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#edd8c2] hover:bg-[#e3c4a7] border border-[#281b18]/15 rounded-2xl text-xs font-bold text-[#281b18] transition-all"
                title="Send email to worsmon@proton.me"
              >
                <Mail size={15} className="text-[#823b28]" />
                <span>Contact Developer (worsmon@proton.me)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mini Restore Button */}
      <button
        id="bottom-nav-restore-btn"
        onClick={() => setIsVisible(true)}
        aria-label="Show navigation bar"
        className={`lg:hidden fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#823b28] text-[#f6e9d7] shadow-xl border border-[#a14c35] transition-all duration-300 cursor-pointer active:scale-95 ${
          !isVisible
            ? 'opacity-95 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
        }`}
        title="Show navigation bar"
      >
        <ChevronUp size={16} strokeWidth={2.5} className="text-[#df734c]" />
        <span className="text-[11px] font-bold font-sans">Menu</span>
      </button>

      {/* Main Bottom Navigation Bar */}
      <nav
        id="mobile-tablet-bottom-nav"
        aria-label="Mobile Navigation Bar"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#823b28]/95 backdrop-blur-md text-[#f6e9d7] border-t border-[#a14c35]/50 px-2 py-1.5 shadow-[0_-8px_30px_rgba(40,27,24,0.22)] transition-all duration-300 ease-in-out ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto gap-1">
          <div className="flex items-center justify-around flex-1 min-w-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  id={`bottom-nav-${item.id}`}
                  onClick={() => {
                    onSelectSection(item.id);
                    setIsMoreOpen(false);
                    setIsVisible(true);
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer min-w-[48px] min-h-[44px] relative select-none active:scale-95 ${
                    isActive
                      ? 'text-[#f6e9d7]'
                      : 'text-[#eb9d7d]/80 hover:text-[#f6e9d7]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-[#281b18] rounded-2xl -z-10 shadow-sm border border-[#422119]" />
                  )}

                  <div className="relative flex items-center justify-center">
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? 'text-[#df734c]' : ''}
                    />

                    {item.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center bg-[#df734c] text-white shadow-xs border border-[#823b28]">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] tracking-tight font-medium mt-0.5 whitespace-nowrap leading-none ${
                      isActive ? 'font-bold text-[#f6e9d7]' : 'text-[#eb9d7d]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* 'More' Button */}
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer min-w-[48px] min-h-[44px] relative select-none active:scale-95 ${
                isMoreActive || isMoreOpen
                  ? 'text-[#f6e9d7]'
                  : 'text-[#eb9d7d]/80 hover:text-[#f6e9d7]'
              }`}
            >
              {(isMoreActive || isMoreOpen) && (
                <span className="absolute inset-0 bg-[#281b18] rounded-2xl -z-10 shadow-sm border border-[#422119]" />
              )}

              <MoreHorizontal
                size={19}
                strokeWidth={isMoreActive || isMoreOpen ? 2.5 : 1.8}
                className={isMoreActive || isMoreOpen ? 'text-[#df734c]' : ''}
              />

              <span
                className={`text-[10px] tracking-tight font-medium mt-0.5 whitespace-nowrap leading-none ${
                  isMoreActive || isMoreOpen ? 'font-bold text-[#f6e9d7]' : 'text-[#eb9d7d]'
                }`}
              >
                More
              </span>
            </button>
          </div>

          <div className="pl-1 border-l border-[#a14c35]/50 flex items-center shrink-0">
            <button
              id="bottom-nav-hide-arrow-btn"
              onClick={() => {
                setIsVisible(false);
                setIsMoreOpen(false);
              }}
              aria-label="Hide navigation bar"
              className="flex flex-col items-center justify-center p-1.5 rounded-2xl hover:bg-[#a14c35]/40 text-[#eb9d7d] hover:text-[#f6e9d7] active:scale-90 transition-all cursor-pointer min-w-[34px] min-h-[44px]"
              title="Hide Navigation Bar"
            >
              <ChevronDown size={18} strokeWidth={2.4} className="text-[#df734c]" />
              <span className="text-[8px] font-mono font-bold text-[#eb9d7d]/80 uppercase tracking-tighter mt-0.5 leading-none">
                Hide
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
