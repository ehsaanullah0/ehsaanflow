// Service to handle File System Access API directory handle storage and local IndexedDB backups snapshot rotation
// Designed to work in all browsers and secure sandboxed iframes.

const DB_NAME = 'EhsaanFlowBackupDB';
const STORE_NAME = 'handles';
const SNAPSHOTS_STORE = 'snapshots';
const HANDLE_KEY = 'backup_dir_handle';

export interface AutoBackupConfig {
  enabled: boolean;
  intervalHours: number; // 1, 6, 12, 24, 168
  retentionCount: number; // e.g. 6
  lastBackupTime?: string;
  folderName?: string;
}

export interface BackupSnapshot {
  id: string; // timestamp as ID
  timestamp: string; // ISO string
  fileName: string;
  data: any; // complete appState JSON
  sizeBytes: number;
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Upgraded DB version to 2 to support snapshots store
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
        db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// === File System Directory Handle Backup (Chromium only, restricted in sandbox/iframes) ===

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, HANDLE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to load directory handle from IndexedDB:', err);
    return null;
  }
}

export async function clearDirectoryHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(HANDLE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function verifyPermission(fileHandle: FileSystemDirectoryHandle, readWrite: boolean): Promise<boolean> {
  const options: any = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  const handleAny = fileHandle as any;
  if ((await handleAny.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await handleAny.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

// Executes backup inside directory and manages file retention limit
export async function executeAutoBackup(appData: any, retentionCount: number): Promise<string> {
  const handle = await loadDirectoryHandle();
  if (!handle) {
    throw new Error('No backup directory has been configured.');
  }

  const hasPermission = await verifyPermission(handle, true);
  if (!hasPermission) {
    throw new Error('Permission denied to access backup folder.');
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}`;
  const fileName = `ehsaan_flow_backup_${timestamp}.json`;

  const fileHandle = await handle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(appData, null, 2));
  await writable.close();

  const backupFiles: { name: string }[] = [];
  for await (const entry of (handle as any).values()) {
    if (entry.kind === 'file' && entry.name.startsWith('ehsaan_flow_backup_') && entry.name.endsWith('.json')) {
      backupFiles.push({ name: entry.name });
    }
  }

  backupFiles.sort((a, b) => a.name.localeCompare(b.name));

  if (backupFiles.length > retentionCount) {
    const excessCount = backupFiles.length - retentionCount;
    const toDelete = backupFiles.slice(0, excessCount);
    for (const file of toDelete) {
      try {
        await handle.removeEntry(file.name);
        console.log(`Auto-backup deleted older file from folder: ${file.name}`);
      } catch (err) {
        console.warn(`Failed to delete older backup file: ${file.name}`, err);
      }
    }
  }

  return fileName;
}

// === Sandbox-Safe Internal IndexedDB Backups Snapshots rotation ===

export async function saveBackupSnapshot(appData: any, retentionCount: number): Promise<BackupSnapshot> {
  const db = await openDB();
  
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  const jsonStr = JSON.stringify(appData);
  const sizeBytes = new Blob([jsonStr]).size;
  
  const snapshot: BackupSnapshot = {
    id: Date.now().toString(),
    timestamp: now.toISOString(),
    fileName: `ehsaan_flow_snapshot_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}.json`,
    data: appData,
    sizeBytes
  };

  // 1. Save new snapshot
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
    const store = tx.objectStore(SNAPSHOTS_STORE);
    const request = store.put(snapshot);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  // 2. Fetch all and enforce retentionCount limit
  const snapshots = await getBackupSnapshots();
  
  // They are sorted by timestamp oldest first inside getBackupSnapshots.
  if (snapshots.length > retentionCount) {
    const excess = snapshots.length - retentionCount;
    const toDelete = snapshots.slice(0, excess);
    for (const snap of toDelete) {
      await deleteBackupSnapshot(snap.id);
    }
  }

  return snapshot;
}

export async function getBackupSnapshots(): Promise<BackupSnapshot[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SNAPSHOTS_STORE, 'readonly');
    const store = tx.objectStore(SNAPSHOTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = (request.result || []) as BackupSnapshot[];
      // Sort oldest first
      results.sort((a, b) => a.id.localeCompare(b.id));
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBackupSnapshot(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
    const store = tx.objectStore(SNAPSHOTS_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Restores the newest backup file from the local directory or the newest IndexedDB snapshot
export async function restoreLatestBackup(): Promise<any> {
  // First attempt to read from selected Directory Handle if available
  try {
    const handle = await loadDirectoryHandle();
    if (handle) {
      const hasPermission = await verifyPermission(handle, false);
      if (hasPermission) {
        const backupFiles: { name: string; handle: any }[] = [];
        for await (const entry of (handle as any).values()) {
          if (entry.kind === 'file' && entry.name.startsWith('ehsaan_flow_backup_') && entry.name.endsWith('.json')) {
            backupFiles.push({ name: entry.name, handle: entry });
          }
        }
        if (backupFiles.length > 0) {
          backupFiles.sort((a, b) => b.name.localeCompare(a.name)); // newest first
          const latestEntry = backupFiles[0];
          const file = await latestEntry.handle.getFile();
          const text = await file.text();
          return JSON.parse(text);
        }
      }
    }
  } catch (err) {
    console.warn('Directory backup restore attempt skipped/fallback to snapshots:', err);
  }

  // Fallback: restore latest snapshot from IndexedDB
  const snapshots = await getBackupSnapshots();
  if (snapshots.length > 0) {
    // snapshots sorted oldest first, so last element is newest
    const latest = snapshots[snapshots.length - 1];
    return latest.data;
  }

  throw new Error('No backup files in folder or local snapshots were found to restore.');
}
