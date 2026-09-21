import React from 'react';
import { CheckCircle2, ArrowRight, ListTodo, Plus } from 'lucide-react';

interface FirstLaunchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onStartWithStarter: () => void;
  onStartBlankTask: () => void;
}

export const FirstLaunchModal: React.FC<FirstLaunchModalProps> = ({
  isOpen,
  onDismiss,
  onStartWithStarter,
  onStartBlankTask,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Welcome Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome to DailyFlow
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
            A modern, minimal, and responsive to-do productivity web app. Fast task prioritization,
            subtask checklists, calendar scheduling, and 100% client-side local storage.
          </p>
        </div>

        {/* Action Choices */}
        <div className="space-y-2.5">
          <button
            onClick={onStartWithStarter}
            className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                Explore with sample starter tasks
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Work, study, finance, and wellness tasks with sample subtasks
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={onStartBlankTask}
            className="w-full p-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-left transition-all flex items-center justify-between shadow-xs"
          >
            <div>
              <span className="text-xs font-semibold block">
                Create your first task
              </span>
              <span className="text-[11px] opacity-80">
                Start clean with your own to-do item
              </span>
            </div>
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onDismiss}
            className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-left transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold block">
                Skip to clean dashboard
              </span>
              <span className="text-[11px] text-neutral-400">
                Jump right into the app
              </span>
            </div>
            <ListTodo className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
