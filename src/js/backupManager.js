// ==========================================
// Backup & Restore Manager (Full Local Storage Portability)
// Backs up 100% of local data: IndexedDB assets, sets registry,
// priority bands, custom textures, icon badge defaults, and preferences.
// ==========================================

import { showToast, escapeHtml, state } from './state.js';
import {
  getSetsRegistry,
  saveSetsRegistry,
  updateSetRegistryUI,
  renderSetsTable,
  renderSetThumbnailsStrip
} from './setRegistry.js';
import {
  getAllAssetsFromIndexedDB,
  importAssetsToIndexedDB,
  clearAllAssetsInIndexedDB,
  resetLibraryToStarters,
  getDBStats
} from './db.js';

let pendingBackupData = null;
let pendingBackupFileName = '';
let pendingBackupFileSize = 0;

/**
 * Format bytes into human-readable string (KB, MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Collect all data from localStorage and IndexedDB into a single comprehensive payload
 */
export async function collectAllLocalData() {
  const sets = getSetsRegistry() || [];
  const indexedDbAssets = await getAllAssetsFromIndexedDB();

  // Collect badge defaults
  let badgeDefaults = null;
  try {
    const raw = localStorage.getItem('cs2_icon_badge_defaults');
    if (raw) badgeDefaults = JSON.parse(raw);
  } catch (_) {}

  // Collect sidebar sections state
  let sidebarSectionsState = null;
  try {
    const raw = localStorage.getItem('cs2_sidebar_sections_state_v2') || localStorage.getItem('cs2_sidebar_sections_state');
    if (raw) sidebarSectionsState = JSON.parse(raw);
  } catch (_) {}

  // Collect general preferences
  const askWhereToSave = localStorage.getItem('cs2_ask_where_to_save') !== 'false';
  const hideWelcomeSplash = localStorage.getItem('cs2_hide_welcome_splash') === 'true';

  // Gather any other cs2-prefixed keys in localStorage
  const otherSettings = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cs2_') &&
          key !== 'cs2_asset_sets_registry' &&
          key !== 'cs2_icon_badge_defaults' &&
          key !== 'cs2_sidebar_sections_state_v2' &&
          key !== 'cs2_sidebar_sections_state' &&
          key !== 'cs2_ask_where_to_save' &&
          key !== 'cs2_hide_welcome_splash') {
        try {
          otherSettings[key] = JSON.parse(localStorage.getItem(key));
        } catch (_) {
          otherSettings[key] = localStorage.getItem(key);
        }
      }
    }
  } catch (_) {}

  // Current workspace snapshot (if serializer available)
  let workspaceSnapshot = null;
  if (typeof window.serializeCurrentProject === 'function') {
    try {
      workspaceSnapshot = window.serializeCurrentProject();
    } catch (_) {}
  }

  const payload = {
    format: 'cs2-asset-studio-full-backup',
    version: '2.0',
    exportTimestamp: Date.now(),
    exportDate: new Date().toISOString(),
    generator: 'Cities: Skylines 2 Custom Asset Generator',
    summary: {
      setsCount: sets.length,
      assetsCount: indexedDbAssets.length,
      hasBadgeDefaults: !!badgeDefaults,
      hasWorkspaceSnapshot: !!workspaceSnapshot
    },
    setsRegistry: sets,
    indexedDbAssets: indexedDbAssets,
    // Alias for v1.0 compatibility
    libraryAssets: indexedDbAssets,
    settings: {
      badgeDefaults,
      sidebarSectionsState,
      askWhereToSave,
      hideWelcomeSplash,
      otherSettings
    },
    workspaceSnapshot
  };

  return payload;
}

/**
 * Export complete backup of all sets, IndexedDB assets, and settings to a JSON file
 */
export async function exportAllSetsAndStorageBackup() {
  try {
    showToast('Gathering local data & IndexedDB textures...');
    const payload = await collectAllLocalData();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const sizeFormatted = formatBytes(blob.size);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `cs2_asset_studio_backup_${dateStr}_${timeStr}.json`;

    if (typeof window.saveFileWithPicker === 'function') {
      const res = await window.saveFileWithPicker(blob, filename, {
        types: [
          {
            description: 'Cities: Skylines 2 Studio Full Backup (*.json)',
            accept: { 'application/json': ['.json', '.cs2backup'] }
          }
        ]
      });
      if (res && res.cancelled) {
        showToast('Backup export cancelled');
        return;
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    showToast(`Backup exported successfully! (${payload.summary.setsCount} sets, ${payload.summary.assetsCount} assets • ${sizeFormatted})`);
    refreshBackupModalStats();
  } catch (err) {
    console.error('Backup export failed:', err);
    showToast('Failed to export backup: ' + (err.message || 'Unknown error'));
  }
}
window.exportAllSetsAndStorageBackup = exportAllSetsAndStorageBackup;

/**
 * Copy entire backup JSON to system clipboard
 */
export async function copyBackupJsonToClipboard() {
  try {
    const payload = await collectAllLocalData();
    const jsonStr = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    showToast(`Copied complete backup JSON to clipboard (${formatBytes(jsonStr.length)})!`);
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    showToast('Could not copy to clipboard (check browser permissions)');
  }
}
window.copyBackupJsonToClipboard = copyBackupJsonToClipboard;

/**
 * Handle file input selection from Set Registry modal or Quick bar
 */
export function handleBackupFileSelect(event) {
  const files = event?.target?.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  setTimeout(() => {
    try { if (event?.target) event.target.value = ''; } catch (_) {}
  }, 100);

  // Directly inspect and open in the full modal
  openBackupAllDataModal();
  inspectBackupFile(file);
}
window.handleBackupFileSelect = handleBackupFileSelect;

/**
 * Handle file input selection inside the Backup All Data Modal
 */
export function handleBackupModalFileSelect(event) {
  const files = event?.target?.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  setTimeout(() => {
    try { if (event?.target) event.target.value = ''; } catch (_) {}
  }, 100);

  inspectBackupFile(file);
}
window.handleBackupModalFileSelect = handleBackupModalFileSelect;

/**
 * Drag & Drop handlers for the modal dropzone
 */
export function handleBackupDropzoneDragOver(e) {
  e.preventDefault();
  const dz = document.getElementById('backupModalDropzone');
  if (dz) dz.classList.add('drag-active');
}
window.handleBackupDropzoneDragOver = handleBackupDropzoneDragOver;

export function handleBackupDropzoneDragLeave(e) {
  e.preventDefault();
  const dz = document.getElementById('backupModalDropzone');
  if (dz) dz.classList.remove('drag-active');
}
window.handleBackupDropzoneDragLeave = handleBackupDropzoneDragLeave;

export function handleBackupDropzoneDrop(e) {
  e.preventDefault();
  const dz = document.getElementById('backupModalDropzone');
  if (dz) dz.classList.remove('drag-active');

  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    inspectBackupFile(e.dataTransfer.files[0]);
  }
}
window.handleBackupDropzoneDrop = handleBackupDropzoneDrop;

/**
 * Inspect backup file and display details before user clicks Restore
 */
export async function inspectBackupFile(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate payload
    let sets = [];
    if (Array.isArray(data.setsRegistry)) {
      sets = data.setsRegistry;
    } else if (Array.isArray(data)) {
      sets = data;
    }

    let assets = [];
    if (Array.isArray(data.indexedDbAssets)) {
      assets = data.indexedDbAssets;
    } else if (Array.isArray(data.libraryAssets)) {
      assets = data.libraryAssets;
    }

    if (!sets.length && !assets.length) {
      showToast('Invalid backup file: Contains neither sets nor asset projects');
      return;
    }

    pendingBackupData = data;
    pendingBackupFileName = file.name;
    pendingBackupFileSize = file.size;

    // Update Dropzone inspection view
    const emptyView = document.getElementById('backupDropEmptyView');
    const inspectCard = document.getElementById('backupFileInspectCard');
    const btnConfirm = document.getElementById('btnConfirmRestoreBackup');

    if (emptyView) emptyView.style.display = 'none';
    if (inspectCard) inspectCard.style.display = 'flex';
    if (btnConfirm) btnConfirm.disabled = false;

    // Populate inspection UI
    const nameEl = document.getElementById('inspectFileName');
    if (nameEl) nameEl.textContent = file.name;

    const sizeEl = document.getElementById('inspectFileSize');
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);

    const dateEl = document.getElementById('inspectExportDate');
    if (dateEl) {
      const d = data.exportDate ? new Date(data.exportDate) : (data.exportTimestamp ? new Date(data.exportTimestamp) : null);
      dateEl.textContent = d ? d.toLocaleString() : 'Timestamp not specified';
    }

    const setsCountEl = document.getElementById('inspectSetsCount');
    if (setsCountEl) setsCountEl.textContent = `${sets.length} ${sets.length === 1 ? 'Set' : 'Sets'}`;

    const assetsCountEl = document.getElementById('inspectAssetsCount');
    if (assetsCountEl) assetsCountEl.textContent = `${assets.length} ${assets.length === 1 ? 'Asset Project' : 'Asset Projects'}`;

    const settingsCountEl = document.getElementById('inspectSettingsNote');
    if (settingsCountEl) {
      const hasBadges = !!(data.settings?.badgeDefaults || data.badgeDefaults);
      const hasPrefs = !!(data.settings?.sidebarSectionsState || data.sidebarSectionsState);
      const notes = [];
      if (hasBadges) notes.push('Icon Badges');
      if (hasPrefs) notes.push('Tool Layout');
      if (data.workspaceSnapshot) notes.push('Workspace Draft');
      settingsCountEl.textContent = notes.length ? notes.join(', ') : 'Standard presets';
    }

    showToast(`Loaded backup file "${file.name}" for inspection`);
  } catch (err) {
    console.error('Failed to parse backup file:', err);
    showToast('Failed to parse backup file: Invalid JSON structure');
  }
}
window.inspectBackupFile = inspectBackupFile;

/**
 * Cancel pending restore and return dropzone to empty state
 */
export function cancelPendingRestore() {
  pendingBackupData = null;
  pendingBackupFileName = '';
  pendingBackupFileSize = 0;

  const emptyView = document.getElementById('backupDropEmptyView');
  const inspectCard = document.getElementById('backupFileInspectCard');
  const btnConfirm = document.getElementById('btnConfirmRestoreBackup');

  if (emptyView) emptyView.style.display = 'flex';
  if (inspectCard) inspectCard.style.display = 'none';
  if (btnConfirm) btnConfirm.disabled = true;
}
window.cancelPendingRestore = cancelPendingRestore;

/**
 * Confirm and execute restore from pending inspected data
 */
export async function confirmRestoreBackup() {
  if (!pendingBackupData) {
    showToast('Please select a backup file first');
    return;
  }

  const data = pendingBackupData;
  const isReplaceMode = document.querySelector('input[name="restoreModeStrategy"]:checked')?.value === 'replace';

  try {
    let sets = [];
    if (Array.isArray(data.setsRegistry)) {
      sets = data.setsRegistry;
    } else if (Array.isArray(data)) {
      sets = data;
    }

    let assets = [];
    if (Array.isArray(data.indexedDbAssets)) {
      assets = data.indexedDbAssets;
    } else if (Array.isArray(data.libraryAssets)) {
      assets = data.libraryAssets;
    }

    let restoredSetsCount = 0;
    let restoredAssetsCount = 0;

    // 1. Restore Sets
    if (isReplaceMode) {
      if (sets && sets.length > 0) {
        saveSetsRegistry(sets);
        restoredSetsCount = sets.length;
      }
    } else {
      // Merge mode
      const currentRegistry = getSetsRegistry() || [];
      const merged = [...currentRegistry];

      sets.forEach(backupSet => {
        const existingIdx = merged.findIndex(s => s.id === backupSet.id || s.setName.toLowerCase() === backupSet.setName.toLowerCase());
        if (existingIdx >= 0) {
          // Merge assets within set
          const existingSet = merged[existingIdx];
          const existingAssets = existingSet.assets || [];
          const backupAssets = backupSet.assets || [];

          backupAssets.forEach(ba => {
            const aIdx = existingAssets.findIndex(a => a.name.toLowerCase() === ba.name.toLowerCase());
            if (aIdx >= 0) {
              existingAssets[aIdx] = { ...existingAssets[aIdx], ...ba };
            } else {
              existingAssets.push(ba);
            }
          });

          merged[existingIdx] = {
            ...backupSet,
            ...existingSet,
            assets: existingAssets,
            lastIndex: Math.max(existingSet.lastIndex || 0, backupSet.lastIndex || 0, existingAssets.length),
            nextPriority: Math.max(existingSet.nextPriority || 0, backupSet.nextPriority || 0)
          };
        } else {
          merged.push(backupSet);
        }
      });

      saveSetsRegistry(merged);
      restoredSetsCount = sets.length;
    }

    // 2. Restore IndexedDB assets
    if (assets && assets.length > 0) {
      restoredAssetsCount = await importAssetsToIndexedDB(assets, isReplaceMode);
    }

    // 3. Restore Settings
    const badgeDefaults = data.settings?.badgeDefaults || data.badgeDefaults;
    if (badgeDefaults) {
      try {
        localStorage.setItem('cs2_icon_badge_defaults', JSON.stringify(badgeDefaults));
        if (typeof window.applySavedBadgeDefaultsToState === 'function') {
          window.applySavedBadgeDefaultsToState();
        }
      } catch (_) {}
    }

    const sidebarSections = data.settings?.sidebarSectionsState || data.sidebarSectionsState;
    if (sidebarSections) {
      try {
        localStorage.setItem('cs2_sidebar_sections_state_v2', JSON.stringify(sidebarSections));
        if (typeof window.restoreSidebarSectionsState === 'function') {
          window.restoreSidebarSectionsState();
        }
      } catch (_) {}
    }

    if (data.settings?.askWhereToSave !== undefined) {
      state.askWhereToSave = !!data.settings.askWhereToSave;
      localStorage.setItem('cs2_ask_where_to_save', state.askWhereToSave ? 'true' : 'false');
    }

    // 4. Restore Workspace Snapshot if in replace mode
    if (isReplaceMode && data.workspaceSnapshot && typeof window.deserializeAndLoadProject === 'function') {
      try {
        window.deserializeAndLoadProject(data.workspaceSnapshot);
      } catch (_) {}
    }

    // 5. Update UI
    const finalSets = getSetsRegistry();
    const activeSet = finalSets[0];
    updateSetRegistryUI(activeSet?.id || '');
    renderSetsTable();
    renderSetThumbnailsStrip();

    if (typeof window.renderSeriesChips === 'function') window.renderSeriesChips();
    if (typeof window.updateRibbonSeriesDropdown === 'function') window.updateRibbonSeriesDropdown();

    cancelPendingRestore();
    refreshBackupModalStats();

    showToast(`✓ Restored successfully: ${restoredSetsCount} sets and ${restoredAssetsCount} assets ready!`);
  } catch (err) {
    console.error('Failed to restore backup:', err);
    showToast('Failed to restore backup: ' + (err.message || 'Unknown error'));
  }
}
window.confirmRestoreBackup = confirmRestoreBackup;

/**
 * Direct file restore helper (for backwards compatibility and direct file input)
 */
export async function importStorageBackupFromFile(file, replaceAll = false) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    pendingBackupData = data;
    pendingBackupFileName = file.name;
    pendingBackupFileSize = file.size;

    let sets = [];
    if (Array.isArray(data.setsRegistry)) sets = data.setsRegistry;
    else if (Array.isArray(data)) sets = data;

    let assets = [];
    if (Array.isArray(data.indexedDbAssets)) assets = data.indexedDbAssets;
    else if (Array.isArray(data.libraryAssets)) assets = data.libraryAssets;

    if (!sets.length && !assets.length) {
      showToast('No valid sets or assets found in backup file');
      return;
    }

    if (sets.length > 0) {
      if (replaceAll) {
        saveSetsRegistry(sets);
      } else {
        const current = getSetsRegistry() || [];
        const merged = [...current];
        sets.forEach(bs => {
          const idx = merged.findIndex(s => s.id === bs.id || s.setName.toLowerCase() === bs.setName.toLowerCase());
          if (idx >= 0) merged[idx] = { ...merged[idx], ...bs };
          else merged.push(bs);
        });
        saveSetsRegistry(merged);
      }
    }

    if (assets.length > 0) {
      await importAssetsToIndexedDB(assets, replaceAll);
    }

    const badgeDefaults = data.settings?.badgeDefaults || data.badgeDefaults;
    if (badgeDefaults) {
      try { localStorage.setItem('cs2_icon_badge_defaults', JSON.stringify(badgeDefaults)); } catch (_) {}
    }

    const finalSets = getSetsRegistry();
    updateSetRegistryUI(finalSets[0]?.id || '');
    renderSetsTable();
    renderSetThumbnailsStrip();
    if (typeof window.renderSeriesChips === 'function') window.renderSeriesChips();
    if (typeof window.updateRibbonSeriesDropdown === 'function') window.updateRibbonSeriesDropdown();

    showToast(`Restored ${sets.length} sets and ${assets.length} assets from backup!`);
  } catch (err) {
    console.error('Import failed:', err);
    showToast('Failed to import backup: ' + (err.message || 'Invalid JSON'));
  }
}
window.importStorageBackupFromFile = importStorageBackupFromFile;

/**
 * Open the Backup & Restore All Data Modal
 */
export async function openBackupAllDataModal() {
  const modal = document.getElementById('backupAllDataModal');
  if (!modal) return;

  cancelPendingRestore();
  modal.style.display = 'flex';
  await refreshBackupModalStats();
}
window.openBackupAllDataModal = openBackupAllDataModal;

/**
 * Close the Backup & Restore All Data Modal
 */
export function closeBackupAllDataModal() {
  const modal = document.getElementById('backupAllDataModal');
  if (modal) modal.style.display = 'none';
  cancelPendingRestore();
}
window.closeBackupAllDataModal = closeBackupAllDataModal;

export function closeBackupAllDataModalOnBackdrop(e) {
  if (e.target && e.target.id === 'backupAllDataModal') {
    closeBackupAllDataModal();
  }
}
window.closeBackupAllDataModalOnBackdrop = closeBackupAllDataModalOnBackdrop;

/**
 * Refresh live numbers and storage statistics in the modal
 */
export async function refreshBackupModalStats() {
  const sets = getSetsRegistry() || [];
  let totalAssetsInSets = 0;
  sets.forEach(s => {
    totalAssetsInSets += (s.assets ? s.assets.length : 0);
  });

  const stats = await getDBStats();

  const setsCountEl = document.getElementById('backupStatSetsCount');
  if (setsCountEl) setsCountEl.textContent = `${sets.length} Sets`;

  const setsSubEl = document.getElementById('backupStatSetsSub');
  if (setsSubEl) setsSubEl.textContent = `${totalAssetsInSets} assets organized`;

  const assetsCountEl = document.getElementById('backupStatAssetsCount');
  if (assetsCountEl) assetsCountEl.textContent = `${stats.count} Assets`;

  const assetsSubEl = document.getElementById('backupStatAssetsSub');
  if (assetsSubEl) assetsSubEl.textContent = `IndexedDB textures`;

  const sizeEl = document.getElementById('backupStatTotalSize');
  if (sizeEl) sizeEl.textContent = formatBytes(stats.byteSize);

  const statusEl = document.getElementById('backupStatHealthStatus');
  if (statusEl) {
    statusEl.textContent = stats.count > 0 ? '✓ Storage Active' : 'Starter Library';
    statusEl.style.color = stats.count > 0 ? 'var(--accent-emerald)' : 'var(--accent-cyan)';
  }
}
window.refreshBackupModalStats = refreshBackupModalStats;

/**
 * Reset all local storage to factory defaults with confirmation prompt
 */
export async function resetAllLocalDataWithConfirmation() {
  const answer = confirm('Are you sure you want to reset ALL local data?\n\nThis will clear all registered sets, remove custom assets from IndexedDB, and reset preferences to default.\n\nTip: You can export a backup first before resetting!');
  if (!answer) return;

  const doubleCheck = confirm('FINAL WARNING: This will permanently delete your local sets and custom textures unless you have a backup file saved. Continue?');
  if (!doubleCheck) return;

  try {
    await clearAllAssetsInIndexedDB();
    await resetLibraryToStarters();

    // Clear Sets registry and preferences
    localStorage.removeItem('cs2_asset_sets_registry');
    localStorage.removeItem('cs2_icon_badge_defaults');
    localStorage.removeItem('cs2_sidebar_sections_state_v2');
    localStorage.removeItem('cs2_sidebar_sections_state');

    // Re-initialize starter sets
    const defaultSets = getSetsRegistry();
    updateSetRegistryUI(defaultSets[0]?.id || '');
    renderSetsTable();
    renderSetThumbnailsStrip();

    if (typeof window.renderSeriesChips === 'function') window.renderSeriesChips();
    if (typeof window.updateRibbonSeriesDropdown === 'function') window.updateRibbonSeriesDropdown();

    refreshBackupModalStats();
    showToast('Local storage reset to default factory state.');
  } catch (e) {
    console.error('Reset failed:', e);
    showToast('Reset error: ' + e.message);
  }
}
window.resetAllLocalDataWithConfirmation = resetAllLocalDataWithConfirmation;
