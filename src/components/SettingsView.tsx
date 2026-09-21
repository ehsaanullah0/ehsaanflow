import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Laptop,
  Check,
  Plus,
  AlertTriangle,
  FolderPlus,
  Calendar,
  Layers,
  Database,
  RefreshCw,
  ListTodo,
} from 'lucide-react';
import { AppData, Category, UserSettings } from '../types';
import {
  clearAllAppData,
  exportAppDataAsJson,
  mergeAppData,
  saveAppData,
  validateImportJson,
  ValidationResult,
} from '../utils/storage';
import { COLOR_OPTIONS } from '../utils/colorUtils';

interface SettingsViewProps {
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
  onResetToStarter: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  data,
  onUpdateData,
  onResetToStarter,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import flow state
  const [importValidation, setImportValidation] = useState<ValidationResult | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Clear data confirmation modal state
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  // Category creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');
  const [showAddCat, setShowAddCat] = useState(false);

  // Handle Export
  const handleExport = () => {
    exportAppDataAsJson(data);
  };

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateImportJson(content);
      setImportValidation(res);
      setImportModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute Merge or Replace
  const executeImport = (mode: 'merge' | 'replace') => {
    if (!importValidation || !importValidation.data) return;

    if (mode === 'replace') {
      onUpdateData(() => importValidation.data!);
    } else {
      onUpdateData((prev) => mergeAppData(prev, importValidation.data!));
    }

    setImportModalOpen(false);
    setImportValidation(null);
  };

  // Execute Clear All Data
  const handleExecuteClear = () => {
    if (confirmDeleteText !== 'DELETE') return;
    clearAllAppData();
    onResetToStarter();
    setClearModalOpen(false);
    setConfirmDeleteText('');
  };

  // Category addition
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor,
    };

    onUpdateData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));

    setNewCatName('');
    setShowAddCat(false);
  };

  // Category deletion
  const handleDeleteCategory = (catId: string) => {
    onUpdateData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId),
      tasks: prev.tasks.map((t) => (t.category === catId ? { ...t, category: undefined } : t)),
    }));
  };

  const completedCount = data.tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Settings & Data
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure appearance, manage categories, and safely backup or restore your to-dos.
        </p>
      </div>

      {/* Appearance Section */}
      <section className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Appearance & Theme
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Choose light, dark, or automatic system appearance.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = data.settings.theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  onUpdateData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, theme: item.id as UserSettings['theme'] },
                  }))
                }
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white bg-neutral-100/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold ring-1 ring-neutral-900 dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Calendar week start */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
              Week Starts On
            </span>
            <span className="text-[11px] text-neutral-400">
              Affects Calendar and Weekly navigation
            </span>
          </div>

          <div className="flex rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() =>
                onUpdateData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, weekStartsOn: 1 },
                }))
              }
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                data.settings.weekStartsOn === 1
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Monday
            </button>
            <button
              onClick={() =>
                onUpdateData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, weekStartsOn: 0 },
                }))
              }
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                data.settings.weekStartsOn === 0
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Sunday
            </button>
          </div>
        </div>
      </section>

      {/* Category Management */}
      <section className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Task Categories
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Organize your tasks by areas like Work, Personal, Health, or Study.
            </p>
          </div>

          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddCat ? 'Cancel' : 'New Category'}</span>
          </button>
        </div>

        {/* Add category form */}
        {showAddCat && (
          <form
            onSubmit={handleAddCategory}
            className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name (e.g., Side Project, Finance)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-medium">Color:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.keys(COLOR_OPTIONS).map((cKey) => {
                  const cScheme = COLOR_OPTIONS[cKey];
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setNewCatColor(cKey)}
                      className={`w-5 h-5 rounded-full ${cScheme.dotBg} transition-transform ${
                        newCatColor === cKey ? 'ring-2 ring-offset-1 ring-neutral-900 dark:ring-white scale-110' : ''
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {/* Categories list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.categories.map((cat) => {
            const cScheme = COLOR_OPTIONS[cat.color] || COLOR_OPTIONS.emerald;
            const taskCount = data.tasks.filter((t) => t.category === cat.id).length;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2.5 h-2.5 rounded-full ${cScheme.dotBg} shrink-0`} />
                  <div className="truncate">
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate block">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {taskCount} task{taskCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {data.categories.length > 1 && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-neutral-400 hover:text-rose-500 p-1 rounded transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Data & Backup Section */}
      <section className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Data & Backup
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your to-do list is stored completely client-side in your browser. Export JSON backups anytime.
          </p>
        </div>

        {/* Local Storage Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div>
            <span className="text-base font-bold text-neutral-900 dark:text-white block">
              {data.tasks.length}
            </span>
            <span className="text-[11px] text-neutral-400">Total Tasks</span>
          </div>
          <div>
            <span className="text-base font-bold text-neutral-900 dark:text-white block">
              {completedCount}
            </span>
            <span className="text-[11px] text-neutral-400">Completed Tasks</span>
          </div>
          <div>
            <span className="text-base font-bold text-neutral-900 dark:text-white block">
              {data.categories.length}
            </span>
            <span className="text-[11px] text-neutral-400">Categories</span>
          </div>
        </div>

        {/* Actions: Export & Import */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Backup (JSON)</span>
          </button>
        </div>

        {/* Clear All Data */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 block">
              Clear All Data
            </span>
            <span className="text-[11px] text-neutral-400">
              Permanently wipe tasks and categories from this browser.
            </span>
          </div>

          <button
            onClick={() => setClearModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            Clear Data
          </button>
        </div>
      </section>

      {/* Import Confirmation Modal */}
      {importModalOpen && importValidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Import Backup File
            </h3>

            {importValidation.valid && importValidation.summary ? (
              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                <p>The backup file is valid and contains:</p>
                <ul className="list-disc list-inside space-y-1 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                  <li><strong>{importValidation.summary.tasksCount}</strong> tasks</li>
                  <li><strong>{importValidation.summary.completedCount}</strong> completed tasks</li>
                  <li><strong>{importValidation.summary.categoriesCount}</strong> categories</li>
                </ul>

                <p className="font-medium text-neutral-900 dark:text-white pt-1">
                  How would you like to apply this backup?
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => executeImport('merge')}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs text-left flex items-center justify-between"
                  >
                    <span>Merge with existing tasks</span>
                    <span className="text-[10px] opacity-70">Preserves existing items</span>
                  </button>

                  <button
                    onClick={() => executeImport('replace')}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-semibold text-xs text-left flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <span>Replace all existing tasks</span>
                    <span className="text-[10px] opacity-70">Completely overwrites</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                <p className="font-semibold mb-1">Invalid Backup File</p>
                <p>{importValidation.error || 'The selected file could not be verified.'}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Delete All Tasks and Data?
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              This will permanently delete all tasks, categories, and settings stored in this browser.
              This action cannot be undone.
            </p>

            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                Type <strong className="text-rose-600">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setClearModalOpen(false);
                  setConfirmDeleteText('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                disabled={confirmDeleteText !== 'DELETE'}
                onClick={handleExecuteClear}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 transition-colors"
              >
                Permanently Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
