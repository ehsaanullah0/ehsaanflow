import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  CalendarDays,
  BarChart3,
  Settings as SettingsIcon,
  ListTodo,
  Columns,
  BookOpen,
  Plus,
  Sun,
  Moon,
  Laptop,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, UserSettings } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  todayTasksCount: number;
  allPendingCount: number;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  todayTasksCount,
  allPendingCount,
  settings,
  onUpdateSettings,
}) => {
  const isCollapsed = !!settings.sidebarCollapsed;

  const toggleSidebarCollapse = () => {
    onUpdateSettings({ sidebarCollapsed: !isCollapsed });
  };

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    description: string;
  }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: CheckCircle2,
      badge: todayTasksCount > 0 ? todayTasksCount : undefined,
      description: 'Daily focus & overdue items',
    },
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: ListTodo,
      badge: allPendingCount > 0 ? allPendingCount : undefined,
      description: 'Search, filter & batch edit',
    },
    {
      id: 'weekly',
      label: 'Weekly',
      icon: CalendarDays,
      description: 'Weekly planner & balance',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
      description: 'Monthly matrix & agenda',
    },
    {
      id: 'kanban',
      label: 'Kanban',
      icon: Columns,
      description: 'Visual workflow boards',
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: BookOpen,
      description: 'Daily reflection, mood & years',
    },
    {
      id: 'stats',
      label: 'Insights',
      icon: BarChart3,
      description: 'Pie charts & productivity',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      description: 'Preferences, backup & export',
    },
  ];

  const cycleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const nextIndex = (modes.indexOf(settings.theme) + 1) % modes.length;
    onUpdateSettings({ theme: modes[nextIndex] });
  };

  return (
    <>
      {/* Desktop Collapsible Sidebar (Hidden on Mobile & Tablet to maximize workspace) */}
      <aside
        id="app-desktop-sidebar"
        className={`hidden lg:flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200/80 dark:border-neutral-800 shrink-0 h-screen sticky top-0 select-none z-30 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold shadow-xs shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold tracking-tight text-neutral-950 dark:text-white leading-tight truncate">
                  EHSAAN FLOW
                </h1>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium truncate">
                  Tasks & Daily Journal
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold shadow-xs">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          )}

          <button
            id="sidebar-collapse-toggle-btn"
            onClick={toggleSidebarCollapse}
            className={`p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              isCollapsed ? 'mt-2 mx-auto block' : ''
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse to icon-only'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Add Action Button */}
        <div className="px-3 pt-3 pb-1">
          {!isCollapsed ? (
            <button
              id="sidebar-quick-add-btn"
              onClick={onOpenQuickAdd}
              className="w-full py-2.5 px-3.5 bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-white rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Task</span>
            </button>
          ) : (
            <button
              id="sidebar-quick-add-icon-btn"
              onClick={onOpenQuickAdd}
              className="w-12 h-12 mx-auto bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-white rounded-xl flex items-center justify-center shadow-xs active:scale-[0.96] transition-all"
              title="Add New Task"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? `${item.label} (${item.description})` : undefined}
                className={`w-full flex items-center rounded-xl transition-all relative group ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5 text-sm'
                } ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-bold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                  <div className="relative shrink-0">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-neutral-950 dark:text-white stroke-[2.3]'
                          : 'text-neutral-500 dark:text-neutral-400 stroke-[1.8]'
                      }`}
                    />
                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-[9px] font-bold flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="fixed left-20 ml-2 px-2.5 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Theme toggle */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col gap-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <button
                id="sidebar-theme-toggle"
                onClick={cycleTheme}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                title={`Current theme: ${settings.theme}. Click to toggle.`}
              >
                {settings.theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : settings.theme === 'light' ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Laptop className="w-3.5 h-3.5" />
                )}
                <span className="capitalize">{settings.theme}</span>
              </button>
              <span className="text-[11px] text-neutral-400 font-mono font-medium">100% Local</span>
            </div>
          ) : (
            <button
              id="sidebar-theme-toggle-icon"
              onClick={cycleTheme}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
              title={`Current theme: ${settings.theme}. Click to change.`}
            >
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : settings.theme === 'light' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Laptop className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile & Tablet Top Header (Hidden on Large Desktops) */}
      <header
        id="app-mobile-header"
        className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-3.5 py-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-neutral-950 dark:text-white truncate block">
              EHSAAN FLOW
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="mobile-theme-toggle"
            onClick={cycleTheme}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : settings.theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </button>
          <button
            id="mobile-settings-btn"
            onClick={() => setActiveTab('settings')}
            className={`p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            id="mobile-quick-add-btn"
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold rounded-xl shadow-xs min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Task</span>
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Responsive Bottom Navigation Bar */}
      <nav
        id="app-mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-800 px-1 py-1 flex justify-around items-center overflow-x-auto no-scrollbar shadow-lg"
      >
        {[
          { id: 'today' as ActiveTab, label: 'Today', icon: CheckCircle2, badge: todayTasksCount },
          { id: 'tasks' as ActiveTab, label: 'Tasks', icon: ListTodo, badge: allPendingCount },
          { id: 'weekly' as ActiveTab, label: 'Weekly', icon: CalendarDays },
          { id: 'calendar' as ActiveTab, label: 'Calendar', icon: CalendarIcon },
          { id: 'kanban' as ActiveTab, label: 'Kanban', icon: Columns },
          { id: 'journal' as ActiveTab, label: 'Journal', icon: BookOpen },
          { id: 'stats' as ActiveTab, label: 'Stats', icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] min-w-[48px] relative ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-bold scale-[1.03]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.4] text-neutral-950 dark:text-white' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-[8px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
