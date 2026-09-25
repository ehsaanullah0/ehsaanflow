import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  Github,
} from 'lucide-react';
import { NavSection } from '../types';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  pendingTasksCount: number;
  onOpenSupport?: () => void;
  onOpenEhsaanStudio?: () => void;
  theme?: 'original';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isExpanded,
  onToggleExpand,
  pendingTasksCount,
  onOpenSupport,
  onOpenEhsaanStudio,
  theme = 'original',
}) => {
  const isOlive = false;

  const navItems = [
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
      id: 'notes' as NavSection,
      label: 'Notes',
      icon: StickyNote,
    },
    {
      id: 'calendar' as NavSection,
      label: 'Calendar',
      icon: CalendarIcon,
    },
    {
      id: 'journal' as NavSection,
      label: 'Journal',
      icon: BookOpen,
    },
    {
      id: 'progress' as NavSection,
      label: 'Progress Meters',
      icon: Activity,
    },
    {
      id: 'insights' as NavSection,
      label: 'Insights',
      icon: Sparkles,
    },
    {
      id: 'settings' as NavSection,
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside
      className={`hidden lg:flex relative flex-col justify-between transition-all duration-300 ease-in-out rounded-3xl p-3 sm:p-4 my-3 ml-3 shadow-[0_8px_30px_rgba(40,27,24,0.10)] border select-none shrink-0 h-[calc(100vh-1.5rem)] overflow-hidden ${
        isOlive
          ? 'bg-[#d8dfc6] text-[#242c1a] border-[#c2cca9]'
          : 'bg-[#823b28] text-[#f6e9d7] border-[#a14c35]/40'
      } ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      {/* Organic Background Shape for Olive Theme */}
      {isOlive && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none opacity-25">
          <svg className="absolute -bottom-12 -left-12 w-72 h-72 text-[#485832]" fill="currentColor" viewBox="0 0 200 200">
            <path d="M44.7,-59.4C56.6,-48.8,64.2,-33.4,67.8,-17.2C71.3,-1,70.8,16,63.9,30.1C57,44.2,43.6,55.4,28.3,61.9C13,68.4,-4.3,70.2,-21.2,66.1C-38.1,62,-54.7,52,-64.1,37.3C-73.5,22.6,-75.7,3.1,-71.4,-14.2C-67.1,-31.6,-56.3,-46.8,-42.6,-57C-28.9,-67.2,-12.3,-72.4,2.9,-75.9C18.1,-79.4,32.8,-70,44.7,-59.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      )}

      {/* Top Header & Brand */}
      <div className="relative z-10">
        <div className={`flex items-center pb-5 mb-2 border-b ${
          isOlive ? 'border-[#c2cca9]' : 'border-[#a14c35]/40'
        } ${isExpanded ? 'justify-between px-2 pt-2' : 'flex-col gap-2 pt-1'}`}>
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <button onClick={onOpenEhsaanStudio} className="w-9 h-9 shadow-xs overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 512 512">
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
              </button>
              <div className="flex flex-col">
                <span className={`font-extrabold tracking-tight text-base font-sans leading-none ${
                  isOlive ? 'text-[#242c1a]' : 'text-[#f6e9d7]'
                }`}>
                  EHSAAN
                </span>
                <span className={`font-mono text-[10px] tracking-widest uppercase leading-tight mt-1 ${
                  isOlive ? 'text-[#485832] font-black' : 'text-[#eb9d7d]'
                }`}>
                  FLOW STUDIO
                </span>
              </div>
            </div>
          ) : (
            <button onClick={onOpenEhsaanStudio} className="w-10 h-10 shadow-xs overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 512 512">
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
            </button>
          )}

          <button
            id="toggle-sidebar-collapse-btn"
            onClick={onToggleExpand}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
              isOlive 
                ? 'text-[#485832] hover:bg-[#c2cca9]' 
                : 'text-[#eb9d7d] hover:bg-[#a14c35]/50 hover:text-[#f6e9d7]'
            }`}
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`group relative flex items-center rounded-2xl font-medium transition-all duration-200 cursor-pointer w-full ${
                  isActive
                    ? isOlive
                      ? 'bg-[#485832] text-[#f4f1e8] shadow-md border border-[#394726]'
                      : 'bg-[#281b18] text-[#f6e9d7] shadow-md border border-[#422119]'
                    : isOlive
                      ? 'text-[#394726] hover:bg-[#c2cca9] hover:text-[#1c2314]'
                      : 'text-[#eb9d7d] hover:bg-[#a14c35]/40 hover:text-[#f6e9d7]'
                } ${
                  isExpanded
                    ? 'px-3.5 py-3 gap-3 justify-start text-sm'
                    : 'w-12 h-12 mx-auto justify-center p-0'
                }`}
                title={!isExpanded ? `${item.label}${item.badge ? ` (${item.badge} pending)` : ''}` : undefined}
              >
                {/* Icon wrapper with positioned badge when collapsed */}
                <div className={`relative flex items-center justify-center ${
                  isActive ? (isOlive ? 'text-[#f4f1e8]' : 'text-[#df734c]') : ''
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />

                  {/* Collapsed Badge Pill */}
                  {!isExpanded && item.badge !== undefined && (
                    <span
                      className={`absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center text-white shadow-xs border-2 ${
                        isOlive ? 'bg-[#485832] border-[#d8dfc6]' : 'bg-[#df734c] border-[#823b28]'
                      } animate-in zoom-in-50 duration-150`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Expanded Label */}
                {isExpanded && (
                  <span className="truncate flex-1 text-left tracking-wide font-sans text-sm font-semibold">
                    {item.label}
                  </span>
                )}

                {/* Expanded Badge Pill */}
                {isExpanded && item.badge !== undefined && (
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? isOlive
                          ? 'bg-[#f4f1e8] text-[#485832]'
                          : 'bg-[#df734c] text-[#f6e9d7]'
                        : isOlive
                          ? 'bg-[#485832]/20 text-[#394726]'
                          : 'bg-[#281b18]/60 text-[#eb9d7d]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Area */}
      {isExpanded ? (
        <div className="relative z-10 flex flex-col gap-2 mt-auto">
          {/* Quick Support & Contact Pills */}
          <div className="flex items-center gap-1.5 pt-2">
            <a
              href="mailto:worsmon@proton.me"
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                isOlive
                  ? 'bg-[#e8e4d8] hover:bg-[#ded9c9] text-[#242c1a] border-[#c2cca9]'
                  : 'bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] border-[#281b18]/10'
              }`}
              title="Contact Developer (worsmon@proton.me)"
            >
              <Mail size={13} className={isOlive ? 'text-[#485832]' : 'text-[#823b28]'} />
              <span>Contact</span>
            </a>
            {onOpenSupport && (
              <button
                type="button"
                onClick={onOpenSupport}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                  isOlive
                    ? 'bg-[#485832] hover:bg-[#394726] text-[#f4f1e8]'
                    : 'bg-[#df734c] hover:bg-[#c95f39] text-[#fbf6ef]'
                }`}
                title="Support Project"
              >
                <Heart size={13} fill="currentColor" />
                <span>Support</span>
              </button>
            )}
          </div>

          {/* Full Width GitHub Button */}
          <button
            onClick={onOpenEhsaanStudio}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs group border cursor-pointer ${
              isOlive
                ? 'bg-[#485832] hover:bg-[#394726] text-[#f4f1e8] border-[#394726]'
                : 'bg-[#1e40af] hover:bg-[#1e3a8a] text-white border-[#1e3a8a]'
            }`}
            title="Ehsaan Studio"
          >
            <Sparkles size={14} className="group-hover:scale-110 transition-transform" />
            <span>Ehsaan Studio</span>
          </button>
        </div>
      ) : (
        <div className="relative z-10 mt-auto flex flex-col items-center gap-2 py-2">
          <button
            onClick={onOpenEhsaanStudio}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
              isOlive ? 'bg-[#485832] text-[#f4f1e8]' : 'bg-[#1e40af] text-white'
            }`}
            title="Ehsaan Studio"
          >
            <Sparkles size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
