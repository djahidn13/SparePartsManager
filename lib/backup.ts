// lib/backup.ts

// Ask the user to pick the backup folder (only once, stored in IndexedDB)
export async function requestBackupFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const dirHandle = await window.showDirectoryPicker();
    // Store permission
    localStorage.setItem("backupFolderGranted", "true");
    (window as any).backupFolderHandle = dirHandle;
    return dirHandle;
  } catch (err) {
    console.error("Folder selection cancelled:", err);
    return null;
  }
}

// Get the saved folder handle (if available)
async function getBackupFolder(): Promise<FileSystemDirectoryHandle | null> {
  if ((window as any).backupFolderHandle) {
    return (window as any).backupFolderHandle;
  }
  return null;
}

// Save backup file automatically
export async function saveBackupFile(data: any) {
  try {
    let folder = await getBackupFolder();
    if (!folder) {
      folder = await requestBackupFolder();
      if (!folder) return;
    }

    const today = new Date().toISOString().split("T")[0]; // e.g. 2025-08-16
    const fileName = `autoparts-backup-${today}.json`;

    const fileHandle = await folder.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();

    console.log("✅ Backup saved:", fileName);
  } catch (err) {
    console.error("❌ Failed to save backup:", err);
  }
}
