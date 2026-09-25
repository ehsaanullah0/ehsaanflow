import React, { useState, useEffect } from 'react';
import { NavSection, AppData, Task, JournalEntry, ProgressMeter, Habit, Note } from './types';
import { loadAppData, saveAppData, resetToSeedData, exportDataAsJSON, importDataFromJSON } from './services/storage';
import { formatDateStr } from './utils/habitUtils';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { HabitsView } from './components/HabitsView';
import { TasksView } from './components/TasksView';
import { NotesView } from './components/NotesView';
import { CalendarView } from './components/CalendarView';
import { JournalView } from './components/JournalView';
import { ProgressView } from './components/ProgressView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { JournalModal } from './components/JournalModal';
import { NoteModal } from './components/NoteModal';
import { SupportModal } from './components/SupportModal';
import { HabitFormModal } from './components/HabitFormModal';
import { HabitDetailModal } from './components/HabitDetailModal';
import { HabitCalendarModal } from './components/HabitCalendarModal';
import { HabitAnalyticsModal } from './components/HabitAnalyticsModal';
import { EhsaanStudioModal } from './components/EhsaanStudioModal';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'original');
    document.body.setAttribute('data-theme', 'original');
    localStorage.setItem('ehsaan_flow_theme', 'original');
  }, []);

  const [currentSection, setCurrentSection] = useState<NavSection>(() => {
    const data = loadAppData();
    return (data.userPreferences?.defaultHomeScreen as NavSection) || 'today';
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('ehsaan_flow_sidebar_expanded');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.innerWidth >= 1024;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Onboarding prompt state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('ehsaan_flow_onboarded_v1');
  });

  // Sample data notice modal state
  const [showSampleNoticeModal, setShowSampleNoticeModal] = useState<boolean>(() => {
    const noticeDismissed = localStorage.getItem('ehsaan_flow_sample_notice_dismissed_v1');
    const onboarded = localStorage.getItem('ehsaan_flow_onboarded_v1');
    return !noticeDismissed && onboarded === 'true' && ((loadAppData().tasks || []).length > 0 || (loadAppData().habits || []).length > 0);
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [journalInitialDate, setJournalInitialDate] = useState<string | undefined>(undefined);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isEhsaanStudioOpen, setIsEhsaanStudioOpen] = useState<boolean>(false);

  // Habit Modals State
  const [isHabitFormOpen, setIsHabitFormOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeDetailHabit, setActiveDetailHabit] = useState<Habit | null>(null);
  const [activeCalendarHabit, setActiveCalendarHabit] = useState<Habit | null>(null);
  const [isOverallAnalyticsOpen, setIsOverallAnalyticsOpen] = useState<boolean>(false);

  // Onboarding handler
  const handleOnboardingChoice = (choice: 'clean' | 'sample') => {
    if (choice === 'clean') {
      const empty: AppData = {
        userPreferences: {
          userName: 'Ehsaan',
          avatarEmoji: '🌿',
        },
        tasks: [],
        journalEntries: [],
        progressMeters: [],
        habits: [],
      };
      setAppData(empty);
    }
    localStorage.setItem('ehsaan_flow_onboarded_v1', 'true');
    setIsOnboardingOpen(false);
  };

  // Auto-save whenever appData changes
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Scheduled Auto Backup check
  useEffect(() => {
    if (!appData.autoBackupConfig?.enabled) return;

    const interval = setInterval(async () => {
      const config = appData.autoBackupConfig;
      if (!config || !config.enabled) return;

      const lastBackupStr = config.lastBackupTime;
      const intervalMs = config.intervalHours * 60 * 60 * 1000;
      const now = new Date();

      let shouldBackup = false;
      if (!lastBackupStr) {
        shouldBackup = true;
      } else {
        const lastBackupDate = new Date(lastBackupStr);
        if (now.getTime() - lastBackupDate.getTime() >= intervalMs) {
          shouldBackup = true;
        }
      }

      if (shouldBackup) {
        try {
          const { executeAutoBackup, saveBackupSnapshot } = await import('./services/backupStorage');
          
          // 1. Always execute Sandbox-Safe IndexedDB Snapshot Backup
          await saveBackupSnapshot(appData, config.retentionCount);
          console.log('Automated Sandbox-Safe IndexedDB snapshot saved successfully.');

          // 2. Optionally attempt Directory Folder Backup (if configured and supported in iframe context)
          if (config.folderName) {
            try {
              await executeAutoBackup(appData, config.retentionCount);
              console.log('Automated Folder backup succeeded.');
            } catch (folderErr: any) {
              console.warn('Auto-backup to local directory was blocked/failed in sandboxed iframe context:', folderErr.message);
            }
          }

          setAppData(prev => ({
            ...prev,
            autoBackupConfig: {
              ...prev.autoBackupConfig!,
              lastBackupTime: new Date().toISOString()
            }
          }));
        } catch (err) {
          console.error('Scheduled automated backup process failed:', err);
        }
      }
    }, 60000); // Check once per minute

    return () => clearInterval(interval);
  }, [appData.autoBackupConfig, appData]);

  // Responsive sidebar collapse on small viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      } else {
        const saved = localStorage.getItem('ehsaan_flow_sidebar_expanded');
        if (saved !== null) {
          setIsSidebarExpanded(saved === 'true');
        } else {
          setIsSidebarExpanded(true);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('ehsaan_flow_sidebar_expanded', String(next));
      return next;
    });
  };

  // Pending tasks count for sidebar badge (including everyday recurring tasks)
  const todayStr = formatDateStr(new Date());
  const pendingTasksCount = appData.tasks.filter((t) => {
    if (t.completed) return false;
    if (t.isRecurring === 'daily') {
      const taskStart = t.startDate || t.dueDate || t.createdAt.split('T')[0];
      const startMonth = taskStart.substring(0, 7);
      const todayMonth = todayStr.substring(0, 7);
      return todayStr >= taskStart && todayMonth === startMonth;
    }
    return t.dueDate === todayStr;
  }).length;

  // Task Handlers
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    setAppData((prev) => {
      let updatedTasks: Task[];
      if (taskData.id) {
        // Edit existing
        updatedTasks = prev.tasks.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                ...taskData,
                subtasks: taskData.subtasks,
              }
            : t
        );
      } else {
        // Create new
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          subtasks: taskData.subtasks.map((st, idx) => ({
            ...st,
            id: `sub-${Date.now()}-${idx}`,
            parentTaskId: `task-${Date.now()}`,
          })),
        };
        updatedTasks = [newTask, ...prev.tasks];
      }
      return { ...prev, tasks: updatedTasks };
    });
    setEditingTask(null);
  };

  const handleToggleTaskComplete = (taskId: string, dateStr?: string) => {
    setAppData((prev) => {
      const todayStr = formatDateStr(new Date());
      const targetDate = dateStr || todayStr;

      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          if (t.isRecurring === 'daily') {
            const currentDates = t.completedDates || [];
            const isAlreadyDoneOnTarget = currentDates.includes(targetDate);
            const nextDates = isAlreadyDoneOnTarget
              ? currentDates.filter((d) => d !== targetDate)
              : [...currentDates, targetDate];

            const isDoneToday = nextDates.includes(todayStr);

            return {
              ...t,
              completedDates: nextDates,
              completed: isDoneToday,
              completedAt: isDoneToday ? new Date().toISOString() : t.completedAt,
            };
          } else {
            const nextCompleted = !t.completed;
            return {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
              // also mark subtasks completed if parent completed
              subtasks: t.subtasks.map((st) => ({
                ...st,
                completed: nextCompleted,
              })),
            };
          }
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleToggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    setAppData((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          return {
            ...t,
            subtasks: updatedSubtasks,
            completed: allDone,
            completedAt: allDone ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setAppData((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          const newSub = {
            id: `sub-${Date.now()}`,
            title,
            completed: false,
            parentTaskId: taskId,
          };
          return {
            ...t,
            subtasks: [...t.subtasks, newSub],
            completed: false, // reset if new subtask added
          };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleEditTaskTrigger = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Journal Handlers
  const handleOpenJournalModal = (entry?: JournalEntry | null, date?: string) => {
    setEditingJournal(entry || null);
    setJournalInitialDate(date || todayStr);
    setIsJournalModalOpen(true);
  };

  const handleSaveJournal = (
    entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    setAppData((prev) => {
      let updatedJournal: JournalEntry[];
      const nowIso = new Date().toISOString();

      if (entryData.id) {
        updatedJournal = prev.journalEntries.map((j) =>
          j.id === entryData.id
            ? {
                ...j,
                ...entryData,
                updatedAt: nowIso,
              }
            : j
        );
      } else {
        // Check if entry for date already exists
        const existingIdx = prev.journalEntries.findIndex((j) => j.date === entryData.date);
        if (existingIdx >= 0) {
          updatedJournal = [...prev.journalEntries];
          updatedJournal[existingIdx] = {
            ...updatedJournal[existingIdx],
            ...entryData,
            updatedAt: nowIso,
          };
        } else {
          const newEntry: JournalEntry = {
            ...entryData,
            id: `journal-${Date.now()}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          updatedJournal = [newEntry, ...prev.journalEntries];
        }
      }
      return { ...prev, journalEntries: updatedJournal };
    });
    setEditingJournal(null);
  };

  const handleDeleteJournal = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((j) => j.id !== id),
    }));
  };

  // Note Handlers
  const handleOpenNewNoteModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleEditNoteTrigger = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    setAppData((prev) => {
      let updatedNotes: Note[];
      const nowIso = new Date().toISOString();
      const prevNotes = prev.notes || [];

      if (noteData.id) {
        updatedNotes = prevNotes.map((n) =>
          n.id === noteData.id
            ? {
                ...n,
                ...noteData,
                updatedAt: nowIso,
              }
            : n
        );
      } else {
        const newNote: Note = {
          ...noteData,
          id: `note-${Date.now()}`,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        updatedNotes = [newNote, ...prevNotes];
      }
      return { ...prev, notes: updatedNotes };
    });
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((n) => n.id !== id),
    }));
  };

  const handleTogglePinNote = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      notes: (prev.notes || []).map((n) =>
        n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
      ),
    }));
  };

  // Habit Handlers
  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => {
    setAppData((prev) => {
      let updatedHabits: Habit[];
      if (habitData.id) {
        // Edit existing
        updatedHabits = prev.habits.map((h) =>
          h.id === habitData.id
            ? {
                ...h,
                ...habitData,
              }
            : h
        );
      } else {
        // Create new habit
        const newHabit: Habit = {
          ...habitData,
          id: `habit-${Date.now()}`,
          createdAt: todayStr,
          order: prev.habits.length,
          completedDates: habitData.completedDates || [],
        };
        updatedHabits = [...prev.habits, newHabit];
      }
      return { ...prev, habits: updatedHabits };
    });
    setEditingHabit(null);
  };

  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setAppData((prev) => {
      const updatedHabits = prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const exists = (h.completedDates || []).includes(dateStr);
        const newCompletedDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...(h.completedDates || []), dateStr];
        return {
          ...h,
          completedDates: newCompletedDates,
        };
      });

      // Also update activeDetailHabit and activeCalendarHabit if currently open
      if (activeDetailHabit && activeDetailHabit.id === habitId) {
        const found = updatedHabits.find((h) => h.id === habitId);
        if (found) setActiveDetailHabit(found);
      }
      if (activeCalendarHabit && activeCalendarHabit.id === habitId) {
        const found = updatedHabits.find((h) => h.id === habitId);
        if (found) setActiveCalendarHabit(found);
      }

      return { ...prev, habits: updatedHabits };
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    setAppData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
    if (activeDetailHabit?.id === habitId) setActiveDetailHabit(null);
    if (activeCalendarHabit?.id === habitId) setActiveCalendarHabit(null);
  };

  const handleReorderHabits = (reorderedHabits: Habit[]) => {
    setAppData((prev) => ({
      ...prev,
      habits: reorderedHabits,
    }));
  };

  const handleOpenNewHabitModal = () => {
    setEditingHabit(null);
    setIsHabitFormOpen(true);
  };

  const handleEditHabitTrigger = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitFormOpen(true);
  };

  const handleOpenAnalyticsModal = (habit?: Habit) => {
    if (habit) {
      setActiveDetailHabit(habit);
    } else {
      setIsOverallAnalyticsOpen(true);
    }
  };

  const handleOpenExpandedCalendar = (habit: Habit) => {
    setActiveCalendarHabit(habit);
  };

  // Progress Meter Handlers
  const handleAddMeter = (meterData: Omit<ProgressMeter, 'id' | 'createdAt' | 'entries'>) => {
    setAppData((prev) => {
      const newMeter: ProgressMeter = {
        ...meterData,
        id: `meter-${Date.now()}`,
        createdAt: todayStr,
        entries: {},
      };
      return { ...prev, progressMeters: [...prev.progressMeters, newMeter] };
    });
  };

  const handleDeleteMeter = (meterId: string) => {
    setAppData((prev) => ({
      ...prev,
      progressMeters: prev.progressMeters.filter((m) => m.id !== meterId),
    }));
  };

  const handleUpdateMeterValue = (meterId: string, date: string, value: number) => {
    setAppData((prev) => {
      const updatedMeters = prev.progressMeters.map((m) => {
        if (m.id === meterId) {
          return {
            ...m,
            entries: {
              ...m.entries,
              [date]: value,
            },
          };
        }
        return m;
      });
      return { ...prev, progressMeters: updatedMeters };
    });
  };

  // Data & Settings Handlers
  const handleExportData = () => {
    exportDataAsJSON(appData);
  };

  const handleImportData = (jsonStr: string) => {
    const imported = importDataFromJSON(jsonStr);
    setAppData(imported);
  };

  const handleResetData = () => {
    const seed = resetToSeedData();
    setAppData(seed);
  };

  const handleClearAllData = () => {
    const empty: AppData = {
      userPreferences: {
        userName: appData.userPreferences?.userName || 'Ehsaan',
        avatarEmoji: appData.userPreferences?.avatarEmoji || '🌿',
      },
      tasks: [],
      journalEntries: [],
      progressMeters: [],
      habits: [],
    };
    setAppData(empty);
  };

  const handleUpdatePreferences = (
    userName: string,
    avatarEmoji: string,
    autoBackupConfig?: AppData['autoBackupConfig'],
    defaultHomeScreen?: string,
    theme?: 'original'
  ) => {
    setAppData((prev) => ({
      ...prev,
      userPreferences: { userName, avatarEmoji, defaultHomeScreen, theme: 'original' },
      autoBackupConfig: autoBackupConfig !== undefined ? autoBackupConfig : prev.autoBackupConfig,
    }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0 && currentSection === 'today') {
      setCurrentSection('tasks');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-bg,#f6e9d7)] text-[var(--text-main,#281b18)] font-sans antialiased selection:bg-[#df734c] selection:text-white">
      {/* Sidebar Navigation (Fixed on viewport) */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        isExpanded={isSidebarExpanded}
        onToggleExpand={handleToggleSidebar}
        pendingTasksCount={pendingTasksCount}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        theme="original"
      />

      {/* Main Screen Canvas (Independent Scrollable Container) */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 pb-28 sm:pb-32 lg:pb-8 max-w-7xl mx-auto w-full">
        {/* Header Bar (Hidden in Habits view per user request) */}
        {currentSection !== 'habits' && (
          <Header
            currentSection={currentSection}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onOpenNewJournalModal={() => handleOpenJournalModal(null, todayStr)}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            userName={appData.userPreferences?.userName || 'Ehsaan'}
            onOpenEhsaanStudio={() => setIsEhsaanStudioOpen(true)}
            theme="original"
          />
        )}

        {/* Section Route Views */}
        {currentSection === 'today' && (
          <TodayView
            tasks={appData.tasks}
            habits={appData.habits}
            journalEntries={appData.journalEntries}
            progressMeters={appData.progressMeters}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleSubtaskComplete={handleToggleSubtaskComplete}
            onAddSubtask={handleAddSubtask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTaskTrigger}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onOpenJournalModal={handleOpenJournalModal}
            onUpdateMeterValue={handleUpdateMeterValue}
            onToggleHabitDate={handleToggleHabitDate}
            onNavigateSection={setCurrentSection}
            theme="original"
          />
        )}

        {currentSection === 'habits' && (
          <HabitsView
            habits={appData.habits || []}
            onToggleHabitDate={handleToggleHabitDate}
            onOpenNewHabitModal={handleOpenNewHabitModal}
            onOpenAnalyticsModal={handleOpenAnalyticsModal}
            onEditHabit={handleEditHabitTrigger}
            onDeleteHabit={handleDeleteHabit}
            onReorderHabits={handleReorderHabits}
          />
        )}

        {currentSection === 'tasks' && (
          <TasksView
            tasks={appData.tasks}
            searchQuery={searchQuery}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleSubtaskComplete={handleToggleSubtaskComplete}
            onAddSubtask={handleAddSubtask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTaskTrigger}
            onOpenNewTaskModal={handleOpenNewTaskModal}
          />
        )}

        {currentSection === 'notes' && (
          <NotesView
            notes={appData.notes || []}
            onOpenNewNoteModal={handleOpenNewNoteModal}
            onEditNote={handleEditNoteTrigger}
            onDeleteNote={handleDeleteNote}
            onTogglePinNote={handleTogglePinNote}
          />
        )}

        {currentSection === 'calendar' && (
          <CalendarView
            tasks={appData.tasks}
            journalEntries={appData.journalEntries}
            progressMeters={appData.progressMeters}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleSubtaskComplete={handleToggleSubtaskComplete}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onOpenJournalModal={handleOpenJournalModal}
          />
        )}

        {currentSection === 'journal' && (
          <JournalView
            journalEntries={appData.journalEntries}
            onOpenJournalModal={handleOpenJournalModal}
            onDeleteJournal={handleDeleteJournal}
          />
        )}

        {currentSection === 'progress' && (
          <ProgressView
            progressMeters={appData.progressMeters}
            onAddMeter={handleAddMeter}
            onDeleteMeter={handleDeleteMeter}
            onUpdateMeterValue={handleUpdateMeterValue}
          />
        )}

        {currentSection === 'insights' && (
          <InsightsView
            tasks={appData.tasks}
            journalEntries={appData.journalEntries}
            progressMeters={appData.progressMeters}
          />
        )}

        {currentSection === 'settings' && (
          <SettingsView
            appData={appData}
            currentTheme="original"
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
            onUpdatePreferences={handleUpdatePreferences}
          />
        )}
      </main>

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        editingTask={editingTask}
      />

      {/* Journal Creation / Editing Modal */}
      <JournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSaveJournal={handleSaveJournal}
        editingEntry={editingJournal}
        initialDate={journalInitialDate}
      />

      {/* Note Creation / Editing Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSaveNote={handleSaveNote}
        editingNote={editingNote}
      />

      {/* Habit Creation / Editing Modal */}
      <HabitFormModal
        isOpen={isHabitFormOpen}
        onClose={() => {
          setIsHabitFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      {/* Habit Detail & Individual Analytics Modal */}
      {activeDetailHabit && (
        <HabitDetailModal
          habit={activeDetailHabit}
          todayStr={todayStr}
          isOpen={!!activeDetailHabit}
          onClose={() => setActiveDetailHabit(null)}
          onToggleDate={handleToggleHabitDate}
          onEditHabit={handleEditHabitTrigger}
          onDeleteHabit={handleDeleteHabit}
          onOpenExpandedCalendar={handleOpenExpandedCalendar}
        />
      )}

      {/* Expanded Monthly & Yearly Habit Calendar Modal */}
      {activeCalendarHabit && (
        <HabitCalendarModal
          habit={activeCalendarHabit}
          todayStr={todayStr}
          isOpen={!!activeCalendarHabit}
          onClose={() => setActiveCalendarHabit(null)}
          onToggleDate={handleToggleHabitDate}
        />
      )}

      {/* Overall Habit Analytics Modal */}
      <HabitAnalyticsModal
        habits={appData.habits || []}
        todayStr={todayStr}
        isOpen={isOverallAnalyticsOpen}
        onClose={() => setIsOverallAnalyticsOpen(false)}
        onSelectHabit={(h) => {
          setIsOverallAnalyticsOpen(false);
          setActiveDetailHabit(h);
        }}
      />

      {/* Mobile and Tablet Bottom Navigation Bar */}
      <BottomNav
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Global Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <EhsaanStudioModal
        isOpen={isEhsaanStudioOpen}
        onClose={() => setIsEhsaanStudioOpen(false)}
      />

      {/* Onboarding Welcome Prompt Modal Overlay */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281b18]/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-3xl bg-[#fbf6ef] border border-[#281b18]/15 p-6 sm:p-8 shadow-2xl text-[#281b18] text-center max-h-[95vh] overflow-y-auto">
            <div className="w-16 h-16 mx-auto mb-3 shadow-md rounded-2xl overflow-hidden shrink-0">
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
            </div>
            <h2 className="text-3xl font-black text-[#281b18] tracking-tight font-sans mt-3">
              Welcome to Ehsaan Flow
            </h2>
            <p className="text-xs sm:text-sm text-[#823b28]/90 font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
              A premium, mindful workspace architected for tasks, habits, daily reflections, and self-progress analytics.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Option 1: Start Fresh */}
              <button
                onClick={() => handleOnboardingChoice('clean')}
                className="group flex flex-col p-5 bg-[#fbf6ef] hover:bg-[#edd8c2]/40 border border-[#281b18]/15 rounded-2xl transition-all shadow-2xs hover:shadow-sm cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#823b28]/40"
              >
                <div className="w-10 h-10 rounded-xl bg-[#823b28]/10 text-[#823b28] flex items-center justify-center text-lg font-bold mb-3.5 group-hover:scale-105 transition-transform">
                  ✨
                </div>
                <h3 className="font-extrabold text-sm text-[#281b18] font-sans">
                  Clean Start
                </h3>
                <p className="text-[11px] text-[#823b28] mt-1 leading-relaxed font-medium">
                  Initialize a pristine, private space. Start fresh with no pre-loaded habits, tasks, or entries. Perfect for immediate customization.
                </p>
                <span className="text-[10px] font-bold font-mono text-[#823b28] uppercase mt-auto pt-4 flex items-center gap-1 group-hover:text-[#df734c] transition-colors">
                  Choose Clean Slate →
                </span>
              </button>

              {/* Option 2: Explore Sample Data */}
              <button
                onClick={() => handleOnboardingChoice('sample')}
                className="group flex flex-col p-5 bg-[#edd8c2]/50 hover:bg-[#edd8c2]/80 border border-[#823b28]/20 rounded-2xl transition-all shadow-2xs hover:shadow-sm cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#823b28]/40"
              >
                <div className="w-10 h-10 rounded-xl bg-[#df734c]/15 text-[#df734c] flex items-center justify-center text-lg font-bold mb-3.5 group-hover:scale-105 transition-transform">
                  📊
                </div>
                <h3 className="font-extrabold text-sm text-[#281b18] font-sans">
                  Explore Workspace
                </h3>
                <p className="text-[11px] text-[#823b28] mt-1 leading-relaxed font-medium">
                  Pre-populate your flow with engaging sample habits, high-leverage tasks, reflections, and metrics to see the rich charts in action.
                </p>
                <span className="text-[10px] font-bold font-mono text-[#823b28] uppercase mt-auto pt-4 flex items-center gap-1 group-hover:text-[#823b28] transition-colors">
                  Explore Sample Data →
                </span>
              </button>
            </div>

            <p className="text-[10px] text-[#823b28]/60 font-medium mt-6">
              Your preferences and data are stored entirely locally on your device for absolute privacy.
            </p>
          </div>
        </div>
      )}

      {/* Sample Data Notice Popup Modal */}
      {showSampleNoticeModal && !isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281b18]/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl bg-[#fbf6ef] border border-[#281b18]/15 p-6 shadow-2xl text-[#281b18] text-center max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 mx-auto mb-3 shadow-md rounded-2xl overflow-hidden shrink-0">
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
            </div>
            <h3 className="text-xl font-black text-[#281b18] tracking-tight font-sans">
              Sample Data Loaded (1-Year History)
            </h3>
            <p className="text-xs text-[#823b28] font-medium mt-2 leading-relaxed max-w-md mx-auto">
              Your workspace is pre-populated with <strong>1 year of sample tasks, habits, reflections, and progress heatmaps</strong> so you can experience all full-screen calendar matrices, progress curves, and insights right away!
            </p>

            <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 my-4 text-left font-mono text-[11px] text-[#281b18]">
              <span className="font-bold text-[#823b28] block mb-1">💡 Flexible Data Control:</span>
              You can clear or delete all sample data with a single click at any time in <strong>Settings &gt; Data Safety</strong> or right here!
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-5">
              <button
                onClick={() => {
                  localStorage.setItem('ehsaan_flow_sample_notice_dismissed_v1', 'true');
                  setShowSampleNoticeModal(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#823b28] hover:bg-[#df734c] text-[#fbf6ef] text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs"
              >
                Explore Sample Data
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('ehsaan_flow_sample_notice_dismissed_v1', 'true');
                  setShowSampleNoticeModal(false);
                  setCurrentSection('settings');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#edd8c2] hover:bg-[#d4aa86] text-[#823b28] text-xs font-bold font-mono transition-all cursor-pointer border border-[#281b18]/10"
              >
                Go to Settings
              </button>
              <button
                onClick={() => {
                  handleClearAllData();
                  localStorage.setItem('ehsaan_flow_sample_notice_dismissed_v1', 'true');
                  setShowSampleNoticeModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold font-mono transition-all cursor-pointer border border-red-200"
              >
                Delete Sample Data Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
