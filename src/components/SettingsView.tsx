import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  User,
  ShieldCheck,
  Check,
  Code2,
  Github,
  Heart,
  ExternalLink,
  Trash2,
  Folder,
  Clock,
  Database,
  RefreshCw,
  Sparkles,
  Smartphone,
  GitCommit,
  AlertTriangle,
  Mail,
  RotateCcw,
  Palette
} from 'lucide-react';
import { AppData } from '../types';
import { BackupSnapshot } from '../services/backupStorage';
import { SupportModal } from './SupportModal';
import { ChangelogSection } from './ChangelogSection';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  appData: AppData;
  currentTheme?: 'original';
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onClearAllData: () => void;
  onUpdatePreferences: (userName: string, avatarEmoji: string, autoBackupConfig?: AppData['autoBackupConfig'], defaultHomeScreen?: string, theme?: 'original') => void;
}

type SettingsTab = 'profile' | 'auto-backup' | 'data-safety' | 'changelog';

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  currentTheme = 'original',
  onExportData,
  onImportData,
  onClearAllData,
  onUpdatePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [userName, setUserName] = useState(appData.userPreferences?.userName || 'Ehsaan');
  const [avatarEmoji, setAvatarEmoji] = useState(appData.userPreferences?.avatarEmoji || '🌿');
  const [defaultHomeScreen, setDefaultHomeScreen] = useState(appData.userPreferences?.defaultHomeScreen || 'today');
  const [isSaved, setIsSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Auto-Backup State Variables
  const [isBackupEnabled, setIsBackupEnabled] = useState<boolean>(appData.autoBackupConfig?.enabled || false);
  const [backupInterval, setBackupInterval] = useState<number>(appData.autoBackupConfig?.intervalHours || 24);
  const [retentionLimit, setRetentionLimit] = useState<number>(appData.autoBackupConfig?.retentionCount || 6);
  const [hasBackupFolder, setHasBackupFolder] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>(appData.autoBackupConfig?.folderName || '');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string | null }>({ type: null, message: null });
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);

  // Reload snapshots list from IndexedDB
  const loadSnapshotsList = async () => {
    try {
      const { getBackupSnapshots } = await import('../services/backupStorage');
      const data = await getBackupSnapshots();
      // Reverse so newest snapshots show first
      setSnapshots([...data].reverse());
    } catch (err) {
      console.warn('Failed to load snapshots list:', err);
    }
  };

  // Check Directory Handle on Mount & Load Snapshots
  useEffect(() => {
    const init = async () => {
      const { loadDirectoryHandle } = await import('../services/backupStorage');
      try {
        const handle = await loadDirectoryHandle();
        if (handle) {
          setHasBackupFolder(true);
          setFolderName(handle.name);
        }
      } catch (err) {
        console.warn('Failed to verify directory handle:', err);
      }
      await loadSnapshotsList();
    };
    init();
  }, []);

  const handleSelectFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Automatic local folder backups are supported on Chrome, Edge, and other Chromium-based browsers. In Firefox, Safari, or mobile browsers, please use our export options or Safe Local Snapshots.');
        return;
      }
      const { saveDirectoryHandle, verifyPermission } = await import('../services/backupStorage');
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      const allowed = await verifyPermission(handle, true);
      if (allowed) {
        await saveDirectoryHandle(handle);
        setHasBackupFolder(true);
        setFolderName(handle.name);
        setBackupStatus({ type: 'success', message: `Connected folder: "${handle.name}" successfully!` });
        
        onUpdatePreferences(userName, avatarEmoji, {
          enabled: isBackupEnabled,
          intervalHours: backupInterval,
          retentionCount: retentionLimit,
          folderName: handle.name,
          lastBackupTime: appData.autoBackupConfig?.lastBackupTime,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Folder selection failed:', err);
        setBackupStatus({ type: 'error', message: `Local directory backup is blocked by your browser's security policies in cross-origin preview frames. Please configure the "Safe Local Snapshots" option instead, which works flawlessly on all browsers.` });
      }
    }
  };

  const handleSaveBackupSettings = (enabled: boolean, interval: number, limit: number) => {
    onUpdatePreferences(userName, avatarEmoji, {
      enabled,
      intervalHours: interval,
      retentionCount: limit,
      folderName: folderName,
      lastBackupTime: appData.autoBackupConfig?.lastBackupTime,
    });
    setBackupStatus({ type: 'success', message: 'Backup preferences updated successfully!' });
    setTimeout(() => setBackupStatus({ type: null, message: null }), 3000);
  };

  const handleCreateSnapshot = async () => {
    setBackupStatus({ type: 'loading', message: 'Capturing new workspace snapshot...' });
    try {
      const { saveBackupSnapshot } = await import('../services/backupStorage');
      const newSnap = await saveBackupSnapshot(appData, retentionLimit);
      setBackupStatus({ type: 'success', message: `Safe Snapshot "${newSnap.fileName}" captured and stored!` });
      await loadSnapshotsList();

      onUpdatePreferences(userName, avatarEmoji, {
        enabled: isBackupEnabled,
        intervalHours: backupInterval,
        retentionCount: retentionLimit,
        folderName: folderName,
        lastBackupTime: new Date().toISOString(),
      });
      setTimeout(() => setBackupStatus({ type: null, message: null }), 4000);
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `Snapshot failed: ${err.message}` });
    }
  };

  const handleRunManualBackup = async () => {
    setBackupStatus({ type: 'loading', message: 'Executing backup...' });
    try {
      let currentFolderName = folderName;
      if (!hasBackupFolder) {
        if (!('showDirectoryPicker' in window)) {
          alert('Automatic local folder backups are supported on Chrome, Edge, and other Chromium-based browsers.');
          setBackupStatus({ type: null, message: null });
          return;
        }
        const { saveDirectoryHandle, verifyPermission } = await import('../services/backupStorage');
        const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        const allowed = await verifyPermission(handle, true);
        if (allowed) {
          await saveDirectoryHandle(handle);
          setHasBackupFolder(true);
          setFolderName(handle.name);
          currentFolderName = handle.name;
        } else {
          throw new Error('Permission denied to the selected folder.');
        }
      }

      const { executeAutoBackup } = await import('../services/backupStorage');
      const fileName = await executeAutoBackup(appData, retentionLimit);
      setBackupStatus({ type: 'success', message: `Backup saved to directory: ${fileName}` });
      
      onUpdatePreferences(userName, avatarEmoji, {
        enabled: isBackupEnabled,
        intervalHours: backupInterval,
        retentionCount: retentionLimit,
        folderName: currentFolderName,
        lastBackupTime: new Date().toISOString(),
      });
      setTimeout(() => setBackupStatus({ type: null, message: null }), 4000);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Manual directory backup failed:', err);
        setBackupStatus({ type: 'error', message: `Backup failed: ${err.message || 'Local directory access is blocked in this preview iframe. Try saving a "Safe Local Snapshot" instead.'}` });
      } else {
        setBackupStatus({ type: null, message: null });
      }
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this snapshot backup from history?')) {
      try {
        const { deleteBackupSnapshot } = await import('../services/backupStorage');
        await deleteBackupSnapshot(id);
        await loadSnapshotsList();
      } catch (err: any) {
        alert(`Failed to delete snapshot: ${err.message}`);
      }
    }
  };

  const handleRestoreSnapshot = async (snapshot: BackupSnapshot) => {
    if (confirm(`WARNING: Restoring will overwrite all current tasks, habits, and journals with this snapshot from ${new Date(snapshot.timestamp).toLocaleString()}. This action is irreversible. Continue?`)) {
      try {
        onImportData(JSON.stringify(snapshot.data));
        alert('Workspace restored to backup snapshot successfully!');
      } catch (err: any) {
        alert(`Failed to restore backup: ${err.message}`);
      }
    }
  };

  const handleQuickRestoreLatest = async () => {
    if (confirm('Are you sure you want to restore the latest backup? This will update your workspace tasks, habits, and journals to the most recent backup file or snapshot.')) {
      setBackupStatus({ type: 'loading', message: 'Restoring latest backup file...' });
      try {
        const { restoreLatestBackup } = await import('../services/backupStorage');
        const restoredData = await restoreLatestBackup();
        onImportData(JSON.stringify(restoredData));
        setBackupStatus({ type: 'success', message: 'Workspace restored to latest backup successfully!' });
      } catch (err: any) {
        setBackupStatus({ type: 'error', message: err.message || 'Failed to restore latest backup.' });
      }
    }
  };

  const handleDownloadSnapshot = (snapshot: BackupSnapshot) => {
    const jsonStr = JSON.stringify(snapshot.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = snapshot.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences(userName.trim(), avatarEmoji, appData.autoBackupConfig, defaultHomeScreen);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onImportData(content);
        setImportError(null);
        alert('Data successfully imported and restored!');
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest bg-[#edd8c2] px-3 py-1 rounded-full border border-[#d4aa86]/55">
            System Preferences
          </span>
          <h2 className="text-2xl font-black text-[#281b18] mt-2 font-sans tracking-tight">
            Settings & Workspace Dashboard
          </h2>
          <p className="text-xs text-[#823b28] mt-1 font-medium leading-relaxed max-w-xl">
            Configure your personal profile details, set up automated backup cycles with custom retention limits, and manage manual data operations.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#823b28] bg-[#edd8c2]/30 px-3.5 py-2 rounded-2xl border border-[#281b18]/10 self-start md:self-auto">
          <Database size={13} />
          <span>Local Storage Secure</span>
        </div>
      </div>

      {/* Modern Organized Tabs Controls */}
      <div className="flex border-b border-[#281b18]/10 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#823b28] text-[#fbf6ef] shadow-xs'
              : 'text-[#823b28] hover:bg-[#edd8c2]/40'
          }`}
        >
          <User size={15} />
          <span>👤 Personal Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('auto-backup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'auto-backup'
              ? 'bg-[#823b28] text-[#fbf6ef] shadow-xs'
              : 'text-[#823b28] hover:bg-[#edd8c2]/40'
          }`}
        >
          <RefreshCw size={15} />
          <span>🔄 Automatic Backups</span>
          {snapshots.length > 0 && (
            <span className="bg-[#df734c] text-white text-[9px] px-1.5 py-0.5 rounded-full">
              {snapshots.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('data-safety')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'data-safety'
              ? 'bg-[#823b28] text-[#fbf6ef] shadow-xs'
              : 'text-[#823b28] hover:bg-[#edd8c2]/40'
          }`}
        >
          <ShieldCheck size={15} />
          <span>🛡️ Manual Data Safety</span>
        </button>
        <button
          onClick={() => setActiveTab('changelog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'changelog'
              ? 'bg-[#823b28] text-[#fbf6ef] shadow-xs'
              : 'text-[#823b28] hover:bg-[#edd8c2]/40'
          }`}
        >
          <GitCommit size={15} />
          <span>📜 Version Changelog</span>
        </button>
      </div>

      {/* Tab Area Output */}
      <div className="grid grid-cols-1 gap-6">
        {/* TAB 1: Profile preferences */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-[#281b18]/5 pb-3">
                <User className="text-[#823b28]" size={18} />
                <h3 className="text-md font-extrabold text-[#281b18] font-sans">
                  Configure Personalization
                </h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#281b18] outline-none focus:border-[#823b28] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
                    Select Avatar Emoji
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {['🌿', '⚡', '😊', '🎯', '📚', '🏃', '🎨', '🧩', '🌻', '☕'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all border ${
                          avatarEmoji === emoji
                            ? 'bg-[#823b28] text-white border-transparent shadow-xs scale-105'
                            : 'bg-[#f6e9d7]/60 hover:bg-[#f6e9d7] border-[#281b18]/10 text-[#281b18]'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
                    Default Home Screen Section
                  </label>
                  <select
                    value={defaultHomeScreen}
                    onChange={(e) => setDefaultHomeScreen(e.target.value)}
                    className="w-full bg-[#f6e9d7] border border-[#281b18]/15 rounded-xl px-3 py-2.5 text-xs text-[#281b18] outline-none font-bold cursor-pointer"
                  >
                    <option value="today">📅 Today (Daily Command Center)</option>
                    <option value="habits">🔁 Habits Tracker (Rituals & Analytics)</option>
                    <option value="tasks">✅ Tasks (Outcome Manager)</option>
                    <option value="calendar">📆 Calendar (Time-Blocking Agenda)</option>
                    <option value="journal">📝 Journal (Reflections Log)</option>
                    <option value="progress">📈 Progress (Meters & Tracking)</option>
                    <option value="insights">💡 Insights (Pattern Observations)</option>
                    <option value="settings">⚙️ Settings (System Preferences)</option>
                  </select>
                  <p className="text-[10px] text-[#823b28]/70 mt-1 font-mono">
                    Ehsaan Flow will launch into this chosen section whenever the application reloads.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-[#823b28] hover:bg-[#6f2f1f] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    {isSaved ? <Check size={14} /> : null}
                    <span>{isSaved ? 'Preferences Saved!' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>



            {/* Compact PWA Promotion */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#823b28]/10 text-[#823b28] flex items-center justify-center text-xl shrink-0">
                  📱
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#281b18]">Install as Offline Desktop & Mobile App</h4>
                  <p className="text-[11px] text-[#823b28] font-medium leading-relaxed mt-0.5 max-w-md">
                    Access Ehsaan Flow instantly right from your home screen with zero latency, even when you have no network connection.
                  </p>
                </div>
              </div>
              <PWAInstallButton />
            </div>
          </div>
        )}

        {/* TAB 2: Automatic Backup & Rotation History */}
        {activeTab === 'auto-backup' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Core Settings Panel */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#281b18]/5 pb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="text-[#823b28]" size={18} />
                  <h3 className="text-md font-extrabold text-[#281b18] font-sans">
                    Automated Local Backup Configuration
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleQuickRestoreLatest}
                  className="px-3.5 py-2 rounded-xl bg-[#823b28] hover:bg-[#df734c] text-[#fbf6ef] text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 self-start sm:self-auto"
                  title="Restore latest backup file from directory or local snapshot"
                >
                  <RotateCcw size={14} />
                  <span>Restore Latest Backup</span>
                </button>
              </div>

              <p className="text-xs text-[#823b28] leading-relaxed mb-6 font-medium max-w-3xl">
                Choose your desired backup intervals and set a **file retention limit**. To maintain absolute data safety inside sandbox preview environments, backups are automatically written into browser IndexedDB as secure, lightweight snapshots. If directory writing is supported on your browser, they can also optionally be saved to your local folder.
              </p>

              {backupStatus.message && (
                <div className={`p-3 rounded-2xl text-xs font-bold mb-5 leading-relaxed ${
                  backupStatus.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
                  backupStatus.type === 'error' ? 'bg-amber-50 border border-amber-200 text-amber-900' :
                  'bg-[#edd8c2]/60 border border-[#281b18]/15 text-[#281b18] animate-pulse'
                }`}>
                  {backupStatus.type === 'success' ? '✓ ' : 'ℹ '}
                  {backupStatus.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. STATUS SWITCH */}
                <div>
                  <label className="text-[10px] font-bold font-mono text-[#823b28] uppercase block mb-1.5">
                    Background Auto-Backup Status
                  </label>
                  <select
                    value={isBackupEnabled ? 'true' : 'false'}
                    onChange={(e) => {
                      const val = e.target.value === 'true';
                      setIsBackupEnabled(val);
                      handleSaveBackupSettings(val, backupInterval, retentionLimit);
                    }}
                    className="w-full bg-[#f6e9d7] border border-[#281b18]/15 rounded-xl px-3 py-2.5 text-xs text-[#281b18] outline-none font-bold cursor-pointer"
                  >
                    <option value="false">🔴 Disabled</option>
                    <option value="true">🟢 Enabled (Captures in Background)</option>
                  </select>
                </div>

                {/* 2. INTERVAL DURATION */}
                <div>
                  <label className="text-[10px] font-bold font-mono text-[#823b28] uppercase block mb-1.5">
                    Backup Interval Duration
                  </label>
                  <select
                    value={backupInterval}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBackupInterval(val);
                      handleSaveBackupSettings(isBackupEnabled, val, retentionLimit);
                    }}
                    className="w-full bg-[#f6e9d7] border border-[#281b18]/15 rounded-xl px-3 py-2.5 text-xs text-[#281b18] outline-none font-bold cursor-pointer"
                  >
                    <option value="1">Every 1 Hour</option>
                    <option value="6">Every 6 Hours</option>
                    <option value="12">Every 12 Hours</option>
                    <option value="24">Every 24 Hours (Daily)</option>
                    <option value="168">Every 7 Days (Weekly)</option>
                  </select>
                </div>

                {/* 3. RETENTION LIMIT */}
                <div>
                  <label className="text-[10px] font-bold font-mono text-[#823b28] uppercase block mb-1.5">
                    Snapshots Rotation Limit
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={retentionLimit}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setRetentionLimit(val);
                        handleSaveBackupSettings(isBackupEnabled, backupInterval, val);
                      }}
                      className="w-20 bg-[#f6e9d7] border border-[#281b18]/15 rounded-xl px-3 py-2.5 text-xs text-[#281b18] outline-none font-bold"
                    />
                    <span className="text-[11px] text-[#823b28] font-bold leading-none">
                      latest files to retain
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Folder Config Section */}
              <div className="mt-6 pt-5 border-t border-[#281b18]/5 space-y-4">
                <h4 className="text-xs font-black text-[#281b18] uppercase tracking-wider font-mono">
                  Advanced: Direct Local Directory Backup
                </h4>
                <div className="p-4 bg-[#f6e9d7]/40 rounded-2xl border border-[#281b18]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold font-mono text-[#823b28] uppercase block">
                      Target Folder Status
                    </span>
                    <p className="text-xs font-bold text-[#281b18] truncate max-w-md">
                      {hasBackupFolder ? `📁 Folder Synced: "${folderName}"` : 'No Folder Configured'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={handleSelectFolder}
                      className="px-3.5 py-2 rounded-xl bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] text-xs font-bold border border-[#281b18]/15 transition-all cursor-pointer"
                    >
                      {hasBackupFolder ? 'Change Folder' : 'Choose Local Folder'}
                    </button>
                    {hasBackupFolder && (
                      <button
                        onClick={handleRunManualBackup}
                        className="px-3.5 py-2 rounded-xl bg-[#823b28]/10 hover:bg-[#823b28]/20 text-[#823b28] text-xs font-bold border border-[#823b28]/15 transition-all cursor-pointer"
                      >
                        Test Folder Write
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <div className="mt-6 pt-4 border-t border-[#281b18]/10 flex flex-wrap gap-2 justify-between items-center">
                <span className="text-[11px] text-[#823b28] font-bold font-mono">
                  {appData.autoBackupConfig?.lastBackupTime
                    ? `Last Cycle Ran: ${new Date(appData.autoBackupConfig.lastBackupTime).toLocaleString()}`
                    : 'No automatic cycle run recorded'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunManualBackup}
                    disabled={backupStatus.type === 'loading'}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs transition-colors bg-black hover:bg-neutral-800 text-white disabled:opacity-50"
                    title="Save backup snapshot to your chosen directory"
                  >
                    <Folder size={13} />
                    <span>BACKUP NOW</span>
                  </button>

                  <button
                    onClick={handleCreateSnapshot}
                    disabled={backupStatus.type === 'loading'}
                    className="px-4 py-2.5 rounded-2xl bg-[#823b28] hover:bg-[#6f2f1f] text-white text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <RefreshCw size={13} className={backupStatus.type === 'loading' ? 'animate-spin' : ''} />
                    <span>Capture Safe Snapshot Now</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Snapshots Ledger List */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-[#281b18]/5 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="text-[#823b28]" size={18} />
                  <h3 className="text-md font-extrabold text-[#281b18] font-sans">
                    Snapshots Backup Ledger
                  </h3>
                </div>
                <span className="text-[10px] font-bold font-mono bg-[#823b28]/10 text-[#823b28] px-2.5 py-1 rounded-full">
                  Rotating List: Retaining Latest {retentionLimit} snapshots
                </span>
              </div>

              {/* Alert Note about cookies deletion */}
              <div className="mb-4 p-4.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs font-medium text-amber-900 leading-relaxed shadow-2xs">
                <AlertTriangle className="text-amber-700 shrink-0 mt-0.5 animate-bounce-slow" size={16} />
                <div>
                  <span className="font-extrabold text-amber-950 block mb-0.5">⚠️ Site Data Warning (!)</span>
                  Snapshot backups are stored locally in site storage. <strong className="font-bold underline text-amber-950">These snapshots will not work if your browser cookies or site data are deleted.</strong> Please make sure you download a local backup file (by clicking <strong className="font-bold">📥 Download</strong> on any snapshot or using the Export database action) to ensure your data is safe on your local drive!
                </div>
              </div>

              {snapshots.length === 0 ? (
                <div className="p-8 text-center bg-[#f6e9d7]/30 rounded-2xl border border-dashed border-[#281b18]/15 text-xs text-[#823b28] font-medium">
                  🌿 No backup snapshots exist yet. Toggle auto-backups or click "Capture Safe Snapshot Now" to save your first snapshot.
                </div>
              ) : (
                <div className="overflow-hidden border border-[#281b18]/10 rounded-2xl bg-[#fbf6ef]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#edd8c2]/55 border-b border-[#281b18]/10 text-[10px] font-bold font-mono text-[#823b28] uppercase">
                          <th className="p-3">Captured Timestamp</th>
                          <th className="p-3">Filename</th>
                          <th className="p-3">File Size</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#281b18]/5 text-xs font-medium text-[#281b18]">
                        {snapshots.map((snap, idx) => (
                          <tr key={snap.id} className="hover:bg-[#edd8c2]/20 transition-colors">
                            <td className="p-3 whitespace-nowrap font-bold">
                              {new Date(snap.timestamp).toLocaleString()}
                              {idx === 0 && (
                                <span className="ml-2 bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black">
                                  LATEST
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-[11px] truncate max-w-[180px] sm:max-w-xs">
                              {snap.fileName}
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              {formatSize(snap.sizeBytes)}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="inline-flex gap-1">
                                <button
                                  onClick={() => handleDownloadSnapshot(snap)}
                                  className="px-2 py-1 bg-amber-50 text-[#823b28] border border-[#823b28]/15 hover:bg-amber-100 rounded-lg font-bold text-[10px] cursor-pointer"
                                  title="Download JSON file"
                                >
                                  📥 Download
                                </button>
                                <button
                                  onClick={() => handleRestoreSnapshot(snap)}
                                  className="px-2 py-1 bg-[#823b28] text-white hover:bg-[#6f2f1f] rounded-lg font-bold text-[10px] cursor-pointer"
                                  title="Restore entire database state"
                                >
                                  🔄 Restore
                                </button>
                                <button
                                  onClick={() => handleDeleteSnapshot(snap.id)}
                                  className="p-1 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                                  title="Delete snapshot"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Manual safety operations (Exports, Imports, Hard Wipes) */}
        {activeTab === 'data-safety' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Export & Imports Panel */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-[#281b18]/5 pb-3">
                <ShieldCheck className="text-[#823b28]" size={18} />
                <h3 className="text-md font-extrabold text-[#281b18] font-sans">
                  Manual Backup Files (JSON)
                </h3>
              </div>

              <p className="text-xs text-[#823b28] leading-relaxed mb-5 font-medium">
                Save your workspace manually at any time. You can export a single JSON file that holds all your current settings, tasks, habits, and progress meters, and upload it on any other device or browser to safely resume your flow.
              </p>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold mb-4">
                  ⚠️ {importError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onExportData}
                  className="flex-1 bg-[#823b28] text-[#f6e9d7] hover:bg-[#6f2f1f] px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-transform"
                >
                  <Download size={15} />
                  <span>Download Manual JSON Export</span>
                </button>

                <label className="flex-1 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 border border-[#281b18]/15 transition-all">
                  <Upload size={15} />
                  <span>Upload & Restore JSON Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reset Workspace Panel */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="text-[#823b28]" size={18} />
                <h3 className="text-md font-extrabold text-[#281b18] font-sans">
                  Delete All Data & Reset Workspace
                </h3>
              </div>

              <p className="text-xs text-[#823b28] leading-relaxed mb-4 font-medium">
                Need a completely clean slate? You can clear all tasks, habits, journals, and progress meters at once to start fresh with a clean, empty workspace whenever you are ready.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-amber-200/60 pt-4 gap-3">
                <div className="text-[11px] text-[#823b28] font-bold font-mono">
                  1-Click Workspace Reset
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete all data at once? This will clear all tasks, habits, and journals to give you a fresh empty start.')) {
                        onClearAllData();
                        alert('All data removed! Workspace is clean and ready.');
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#823b28] hover:bg-[#df734c] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Trash2 size={14} />
                    <span>Delete All Data At Once</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Version Changelog */}
        {activeTab === 'changelog' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ChangelogSection onOpenSupport={() => setShowSupportModal(true)} />
          </div>
        )}
      </div>

      {/* Developer and Community Credits Section at the bottom */}
      <div className="bg-[#281b18] text-[#f6e9d7] rounded-3xl p-6 shadow-md border border-[#422119] relative overflow-hidden mt-2">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#df734c]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2 font-mono text-[9px] text-[#df734c] uppercase font-bold tracking-widest">
              <Code2 size={13} style={{ color: '#f8e1d8' }} />
              <span style={{ color: '#fffcfb' }}>Ehsaan Flow Project Architecture</span>
            </div>
            <h4 className="text-md font-black font-sans text-[#fbf6ef] tracking-tight">
              Crafted by Ehsaanullah
            </h4>
            <p className="text-[11px] leading-relaxed mt-1 font-medium" style={{ color: '#f2bda5' }}>
              An elegant, personal workflow tool designed to cultivate mindful task progress, reflective journals, and custom metrics. Zero surveillance, 100% private.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <a
              href="mailto:worsmon@proton.me"
              className="flex items-center gap-2 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs group"
              title="Send email to worsmon@proton.me"
            >
              <Mail size={14} className="text-[#823b28] group-hover:scale-110 transition-transform" />
              <span>Contact Developer</span>
            </a>
            <a
              href="https://github.com/ehsaanullah0/ehsaanflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white border border-[#1e3a8a] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs group"
            >
              <Github size={14} className="text-white group-hover:scale-110 transition-transform" />
              <span>View Source</span>
              <ExternalLink size={11} className="opacity-80" />
            </a>
            <button
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-2 bg-[#df734c] hover:bg-[#c95f39] text-[#fbf6ef] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer group"
            >
              <Heart size={14} fill="currentColor" className="text-white group-hover:scale-110 transition-transform" />
              <span>Support App</span>
            </button>
          </div>
        </div>
      </div>

      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  );
};
