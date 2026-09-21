/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { ActiveTab, AppData, JournalEntry, Priority, Subtask, Task, UserSettings } from './types';
import {
  createBlankData,
  getStarterData,
  loadAppData,
  saveAppData,
} from './utils/storage';
import { getTodayKey } from './utils/dateUtils';
import { Navigation } from './components/Navigation';
import { TodayDashboard } from './components/TodayDashboard';
import { TasksView } from './components/TasksView';
import { KanbanBoardView } from './components/KanbanBoardView';
import { CalendarView } from './components/CalendarView';
import { WeeklyView } from './components/WeeklyView';
import { OverallStatsView } from './components/OverallStatsView';
import { JournalView } from './components/JournalView';
import { SettingsView } from './components/SettingsView';
import { QuickAddModal } from './components/QuickAddModal';
import { DayDetailModal } from './components/DayDetailModal';
import { FirstLaunchModal } from './components/FirstLaunchModal';

export default function App() {
  // Load persistent to-do data from browser storage
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [todayStr, setTodayStr] = useState<string>(getTodayKey());
  const [selectedJournalDate, setSelectedJournalDate] = useState<string>(getTodayKey());

  // Modal & Edit states
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDefaultDate, setQuickAddDefaultDate] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Detail Modal (Day)
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string | null>(null);

  // Sync today's date periodically or when tab refocuses
  useEffect(() => {
    const checkDate = () => {
      const current = getTodayKey();
      if (current !== todayStr) {
        setTodayStr(current);
      }
    };
    window.addEventListener('focus', checkDate);
    const interval = setInterval(checkDate, 60000);
    return () => {
      window.removeEventListener('focus', checkDate);
      clearInterval(interval);
    };
  }, [todayStr]);

  // Save to localStorage on changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Sync dark/light theme to document element
  useEffect(() => {
    const applyTheme = () => {
      const theme = data.settings.theme;
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (data.settings.theme === 'system') {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [data.settings.theme]);

  // Pending counts
  const todayTasksPendingCount = useMemo(() => {
    return data.tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;
  }, [data.tasks, todayStr]);

  const allPendingTasksCount = useMemo(() => {
    return data.tasks.filter((t) => !t.completed).length;
  }, [data.tasks]);

  // --- Task Operation Handlers ---
  const handleToggleTask = (taskId: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            status: newCompleted ? ('done' as const) : ('todo' as const),
            completedAt: newCompleted ? todayStr : undefined,
          };
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleTogglePin = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, pinned: !t.pinned } : t)),
    }));
  };

  const handleUpdateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          const isDone = status === 'done';
          return {
            ...t,
            status,
            completed: isDone,
            completedAt: isDone ? t.completedAt || todayStr : undefined,
          };
        }
        return t;
      }),
    }));
  };

  const handleUpdateTaskDetail = (taskId: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  };

  const handleBatchReschedule = (taskIds: string[], newDate: string) => {
    const idSet = new Set(taskIds);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (idSet.has(t.id) ? { ...t, dueDate: newDate } : t)),
    }));
  };

  const handleBatchPriority = (taskIds: string[], priority: Priority) => {
    const idSet = new Set(taskIds);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (idSet.has(t.id) ? { ...t, priority } : t)),
    }));
  };

  const handleBatchDelete = (taskIds: string[]) => {
    const idSet = new Set(taskIds);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !idSet.has(t.id)),
    }));
  };

  // Journal Entry Handlers
  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setData((prev) => {
      const existing = prev.journalEntries || [];
      const filtered = existing.filter((e) => e.id !== entry.id && e.date !== entry.date);
      return {
        ...prev,
        journalEntries: [entry, ...filtered],
      };
    });
  };

  const handleDeleteJournalEntry = (entryIdOrDate: string) => {
    setData((prev) => ({
      ...prev,
      journalEntries: (prev.journalEntries || []).filter(
        (e) => e.id !== entryIdOrDate && e.date !== entryIdOrDate
      ),
    }));
  };

  // Sub-task handlers
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = (task.subtasks || []).map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          return { ...task, subtasks };
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      completed: false,
      createdAt: todayStr,
    };
    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = [...(task.subtasks || []), newSub];
          return { ...task, subtasks };
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = (task.subtasks || []).filter((sub) => sub.id !== subtaskId);
          return { ...task, subtasks };
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleEditSubtask = (taskId: string, subtaskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = (task.subtasks || []).map((sub) =>
            sub.id === subtaskId ? { ...sub, title: newTitle.trim() } : sub
          );
          return { ...task, subtasks };
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    setData((prev) => {
      if (editingTask) {
        // Edit existing
        const updatedTasks = prev.tasks.map((t) =>
          t.id === editingTask.id ? { ...t, ...taskData } : t
        );
        return { ...prev, tasks: updatedTasks };
      } else {
        // Create new
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: taskData.title || 'Untitled Task',
          notes: taskData.notes,
          dueDate: taskData.dueDate || todayStr,
          dueTime: taskData.dueTime,
          completed: taskData.completed || false,
          priority: taskData.priority || 'medium',
          category: taskData.category,
          tags: taskData.tags || [],
          subtasks: taskData.subtasks || [],
          pinned: taskData.pinned || false,
          status: taskData.status || 'todo',
          order: prev.tasks.length,
          createdAt: todayStr,
        };
        return {
          ...prev,
          tasks: [newTask, ...prev.tasks],
        };
      }
    });

    setEditingTask(null);
    setQuickAddOpen(false);
  };

  const handleQuickCreateTask = (
    title: string,
    priority: Priority,
    categoryId?: string,
    dueDate?: string,
    dueTime?: string,
    tags?: string[]
  ) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      dueDate: dueDate || todayStr,
      dueTime,
      completed: false,
      priority,
      category: categoryId,
      tags: tags || [],
      status: 'todo',
      order: data.tasks.length,
      createdAt: todayStr,
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleRescheduleTask = (taskId: string, newDate: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, dueDate: newDate } : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleReorderTasks = (newTasks: Task[]) => {
    setData((prev) => ({
      ...prev,
      tasks: newTasks,
    }));
  };

  const handleClearCompletedTasks = () => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !t.completed),
    }));
  };

  const handleMarkAllCompleted = (taskIds: string[]) => {
    const idSet = new Set(taskIds);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        idSet.has(t.id)
          ? {
              ...t,
              completed: true,
              status: 'done' as const,
              completedAt: todayStr,
            }
          : t
      ),
    }));
  };

  // --- Modal Openers ---
  const handleOpenQuickAdd = (defaultDate?: string) => {
    setQuickAddDefaultDate(defaultDate);
    setEditingTask(null);
    setQuickAddOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setQuickAddDefaultDate(task.dueDate);
    setQuickAddOpen(true);
  };

  const handleAddTaskForDate = (dateStr: string) => {
    handleOpenQuickAdd(dateStr);
  };

  // First launch action handlers
  const handleFirstLaunchStartStarter = () => {
    const starter = getStarterData();
    starter.settings.hasSeenWelcome = true;
    setData(starter);
  };

  const handleFirstLaunchStartBlankTask = () => {
    const blank = createBlankData();
    blank.settings.hasSeenWelcome = true;
    setData(blank);
    handleOpenQuickAdd(todayStr);
  };

  const handleDismissFirstLaunch = () => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, hasSeenWelcome: true },
    }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Navigation Sidebar & Mobile Headers */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd(todayStr)}
        todayTasksCount={todayTasksPendingCount}
        allPendingCount={allPendingTasksCount}
        settings={data.settings}
        onUpdateSettings={(newSettings) =>
          setData((prev) => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings },
          }))
        }
      />

      {/* Main Content Area - Full width on mobile/tablet with bottom offset for bottom navigation bar */}
      <main className="flex-1 min-w-0 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
        {activeTab === 'today' && (
          <TodayDashboard
            data={data}
            todayStr={todayStr}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onEditSubtask={handleEditSubtask}
            onOpenQuickAdd={handleOpenQuickAdd}
            onEditTask={handleEditTask}
            onSelectTask={handleEditTask}
            onTogglePin={handleTogglePin}
            onDeleteTask={handleDeleteTask}
            onRescheduleTask={handleRescheduleTask}
            onQuickCreateTask={handleQuickCreateTask}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            data={data}
            todayStr={todayStr}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onEditSubtask={handleEditSubtask}
            onOpenAddTask={() => handleOpenQuickAdd(todayStr)}
            onEditTask={handleEditTask}
            onSelectTask={handleEditTask}
            onTogglePin={handleTogglePin}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={handleReorderTasks}
            onClearCompletedTasks={handleClearCompletedTasks}
            onMarkAllCompleted={handleMarkAllCompleted}
            onBatchReschedule={handleBatchReschedule}
            onBatchPriority={handleBatchPriority}
            onBatchDelete={handleBatchDelete}
            onSwitchToKanban={() => setActiveTab('kanban')}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoardView
            data={data}
            todayStr={todayStr}
            onToggleTask={handleToggleTask}
            onSelectTask={handleEditTask}
            onQuickCreateTask={handleQuickCreateTask}
            onMoveTaskStatus={handleUpdateTaskStatus}
            onMoveTaskPriority={(taskId, newPriority) => {
              setData((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t)),
              }));
            }}
            onMoveTaskCategory={(taskId, newCategory) => {
              setData((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, category: newCategory } : t)),
              }));
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            data={data}
            todayStr={todayStr}
            onSelectDate={(dateStr) => setSelectedDateForDetail(dateStr)}
            onAddTaskForDate={handleAddTaskForDate}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyView
            data={data}
            todayStr={todayStr}
            onToggleTask={handleToggleTask}
            onSelectDate={(dateStr) => setSelectedDateForDetail(dateStr)}
            onAddTaskForDate={handleAddTaskForDate}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onMoveTaskDate={(taskId, newDate) => handleRescheduleTask(taskId, newDate)}
          />
        )}

        {activeTab === 'journal' && (
          <JournalView
            journalEntries={data.journalEntries || []}
            selectedDateStr={selectedJournalDate}
            onSelectDate={setSelectedJournalDate}
            onSaveJournalEntry={handleSaveJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
          />
        )}

        {activeTab === 'stats' && (
          <OverallStatsView
            data={data}
            todayStr={todayStr}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            data={data}
            onUpdateData={setData}
            onResetToStarter={() => setData(getStarterData())}
          />
        )}
      </main>

      {/* Quick Add / Edit Task Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => {
          setQuickAddOpen(false);
          setEditingTask(null);
          setQuickAddDefaultDate(undefined);
        }}
        categories={data.categories}
        editingTask={editingTask}
        defaultDate={quickAddDefaultDate}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        onDuplicateTask={(taskToDuplicate) => {
          const duplicatedTask: Task = {
            ...taskToDuplicate,
            id: `task-${Date.now()}`,
            title: `${taskToDuplicate.title} (Copy)`,
            order: data.tasks.length,
            createdAt: todayStr,
          };
          setData((prev) => ({
            ...prev,
            tasks: [duplicatedTask, ...prev.tasks],
          }));
        }}
      />

      {/* Day Details Modal (from Calendar or Weekly) */}
      <DayDetailModal
        dateStr={selectedDateForDetail}
        data={data}
        todayStr={todayStr}
        onClose={() => setSelectedDateForDetail(null)}
        onToggleTask={handleToggleTask}
        onToggleSubtask={handleToggleSubtask}
        onAddSubtask={handleAddSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onAddTaskForDate={handleAddTaskForDate}
        onDeleteTask={handleDeleteTask}
      />

      {/* First Launch Onboarding Modal */}
      <FirstLaunchModal
        isOpen={!data.settings.hasSeenWelcome}
        onDismiss={handleDismissFirstLaunch}
        onStartWithStarter={handleFirstLaunchStartStarter}
        onStartBlankTask={handleFirstLaunchStartBlankTask}
      />
    </div>
  );
}
