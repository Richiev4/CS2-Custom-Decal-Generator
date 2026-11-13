// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// Browser Library, Series Ribbon & Community Asset Importer
// ==========================================

import JSZip from 'jszip';
import { state, showToast, escapeHtml, getCanvases, hasActiveWork, openUnsavedModal, formatFileTypeLabel } from './state.js';
import {
  initIndexedDBStorage as initIDB,
  getSavedLibraryFromMemory,
  saveAssetToIndexedDB,
  deleteAssetFromIndexedDB,
  importAssetsToIndexedDB
} from './db.js';
import { getEl, setElText, setElValue, setElDisplay, createModalController, captureCanvasThumbnail } from './domUtils.js';

export const LIBRARY_STORAGE_KEY = 'cs2_saved_assets_library';
const libraryModalCtrl = createModalController('savedLibraryModal');

let activeLibraryFilterSeries = 'ALL';
let activeLibrarySearchQuery = '';

export function getSavedLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  const mem = getSavedLibraryFromMemory();
  return Array.isArray(mem) ? mem : [];
}

export async function persistLibraryList(list) {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
  try {
    await importAssetsToIndexedDB(list, true);
  } catch (_) {}
  updateLibraryBadge();
  renderSeriesChips();
  updateRibbonSeriesDropdown();
  renderSeriesRibbon();
}

export async function initIndexedDBStorage() {
  try {
    const idbItems = await initIDB();
    if (Array.isArray(idbItems) && idbItems.length > 0) {
      const localItems = getSavedLibrary();
      if (idbItems.length >= localItems.length) {
        try {
          localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(idbItems));
        } catch (_) {}
      }
    }
  } catch (_) {}
  updateLibraryBadge();
  renderSeriesChips();
  updateRibbonSeriesDropdown();
  renderSeriesRibbon();
}

export function seedStarterLibraryIfEmpty() {
  const existing = getSavedLibrary();
  if (existing.length > 0) return;

  const starterItems = [
    {
      id: 'starter-road-arrow-01',
      name: 'RoadMarking_TurnArrow_01',
      series: 'Road Markings',
      mode: 'decal',
      category: 'RoadMarkings',
      uiPriority: 50010,
      updatedAt: Date.now() - 3600000,
      project: {
        appMode: 'decal',
        assetName: 'RoadMarking_TurnArrow_01',
        assetSeries: 'Road Markings',
        category: 'RoadMarkings',
        uiPriority: 50010,
        dimWidth: 1.5,
        dimHeight: 4.0,
        dimDepth: 0.5
      }
    },
    {
      id: 'starter-manhole-01',
      name: 'Utility_ManholeCover_01',
      series: 'Street Details',
      mode: 'decal',
      category: 'Ground',
      uiPriority: 50020,
      updatedAt: Date.now() - 1800000,
      project: {
        appMode: 'decal',
        assetName: 'Utility_ManholeCover_01',
        assetSeries: 'Street Details',
        category: 'Ground',
        uiPriority: 50020,
        dimWidth: 1.0,
        dimHeight: 1.0,
        dimDepth: 0.5
      }
    }
  ];

  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(starterItems));
  } catch (_) {}
  updateLibraryBadge();
  renderSeriesChips();
  updateRibbonSeriesDropdown();
  renderSeriesRibbon();
}

// ==========================================
// Asset Series / Pack Naming & Ribbon Controls
// ==========================================

export function getAssetSeriesName() {
  return (getEl('assetSeries')?.value || '').trim();
}

export function setAssetSeriesName(seriesName) {
  const clean = (seriesName || '').trim();
  const badgeText = clean || 'None';
  setElValue('assetSeries', clean);
  setElValue('metaSetName', clean);
  setElText('activeSeriesBadge', badgeText);
  setElText('topMenuSeriesBadge', badgeText);
  renderSeriesChips();
  updateRibbonSeriesDropdown();
  renderSeriesRibbon();
  if (typeof window.updateConfigJson === 'function') window.updateConfigJson();
}

export function onAssetSeriesInput() {
  const clean = getAssetSeriesName();
  const badgeText = clean || 'None';
  setElValue('metaSetName', clean);
  setElText('activeSeriesBadge', badgeText);
  setElText('topMenuSeriesBadge', badgeText);
  if (typeof window.updateConfigJson === 'function') window.updateConfigJson();
}

export function applySeriesQuickPick(val) {
  if (!val) return;
  setAssetSeriesName(val);
}

export function syncWithSeriesBadge() {
  const series = (getAssetSeriesName() || 'CUSTOM').toUpperCase().slice(0, 20);
  setElValue('seriesTextInput', series);
  if (typeof window.setSeriesBadgeMode === 'function') window.setSeriesBadgeMode('text');
  if (typeof window.toggleBadge2Enable === 'function') window.toggleBadge2Enable(true);
  showToast(`Synced pack name "${series}" to Series Badge`);
}

export function getAllLibrarySeries() {
  const items = getSavedLibrary();
  const set = new Set(['Road Markings', 'Street Details', 'Wall Posters', 'Asphalt Wear']);
  items.forEach((item) => {
    if (item.series) set.add(item.series);
  });
  const current = getAssetSeriesName();
  if (current) set.add(current);
  return Array.from(set);
}

export function renderSeriesChips() {
  const container = getEl('seriesChipRow');
  if (!container) return;
  const active = getAssetSeriesName();
  const all = getAllLibrarySeries();
  container.innerHTML = all
    .map((s) => {
      const isAct = s === active;
      return `<button type="button" class="preset-btn ${isAct ? 'active' : ''}" style="font-size:10px;padding:2px 7px;" onclick="setAssetSeriesName('${escapeHtml(s)}')">${escapeHtml(s)}</button>`;
    })
    .join('');
}

export function updateRibbonSeriesDropdown() {
  const sel = getEl('ribbonSeriesSelect');
  if (!sel) return;
  const all = getAllLibrarySeries();
  const current = getAssetSeriesName();
  sel.innerHTML = all
    .map((s) => `<option value="${escapeHtml(s)}" ${s === current ? 'selected' : ''}>${escapeHtml(s)}</option>`)
    .join('');
}

export function onRibbonSeriesSelectChange(val) {
  if (!val) return;
  setAssetSeriesName(val);
}

export function switchBottomView(view) {
  const isRibbon = view === 'ribbon';
  setElDisplay('bottomRibbonContent', isRibbon ? 'block' : 'none');
  setElDisplay('bottomJsonContent', isRibbon ? 'none' : 'block');
}

export function toggleBottomCollapse() {
  const panel = getEl('bottomCollapsibleBody');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

export function scrollRibbon(delta) {
  const scroller = getEl('seriesRibbonTrack') || getEl('setThumbnailsScroll');
  if (scroller) scroller.scrollBy({ left: Number(delta) || 200, behavior: 'smooth' });
}

export function renderSeriesRibbon() {
  const track = getEl('seriesRibbonTrack');
  if (!track) return;
  const activeSeries = getAssetSeriesName();
  const items = getSavedLibrary().filter((a) => (a.series || 'Road Markings') === activeSeries);
  if (items.length === 0) {
    track.innerHTML = `<div style="font-size:11px;color:var(--text-dim);padding:8px;">No saved assets in "${escapeHtml(activeSeries)}" yet.</div>`;
    return;
  }
  track.innerHTML = items
    .map(
      (item) => `
      <div class="set-thumb-card" onclick="loadFromBrowser('${escapeHtml(item.id)}')" title="Load ${escapeHtml(item.name)}">
        <div class="set-thumb-label">${escapeHtml(item.name)}</div>
      </div>`
    )
    .join('');
}

// ==========================================
// Save, Load, Duplicate & Delete Library Items
// ==========================================

export async function saveCurrentToBrowser() {
  if (typeof window.serializeCurrentProject !== 'function') return null;
  const project = window.serializeCurrentProject();
  const { canvasBase } = getCanvases();
  const thumb = captureCanvasThumbnail(canvasBase, 96);
  const name = (getEl('assetName')?.value || 'CustomDecal').trim();
  const series = getAssetSeriesName();

  const list = getSavedLibrary();
  const existingIdx = list.findIndex((i) => i.name === name && i.series === series);
  const entry = {
    id: existingIdx >= 0 ? list[existingIdx].id : `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    series,
    mode: state.appMode || 'decal',
    category: project.category || 'RoadMarkings',
    uiPriority: Number(project.uiPriority) || 41,
    thumbnail: thumb,
    updatedAt: Date.now(),
    project
  };

  if (existingIdx >= 0) {
    list[existingIdx] = entry;
  } else {
    list.unshift(entry);
  }

  await persistLibraryList(list);
  state.hasUnsavedChanges = false;
  showToast(`Saved "${name}" to browser library (${series})`);
  return entry;
}

export async function saveCurrentToActiveSeries() {
  return saveCurrentToBrowser();
}

export async function promptReassignSeries(assetId, newSeries) {
  const list = getSavedLibrary();
  const item = list.find((a) => a.id === assetId);
  if (!item) return;
  const targetSeries = (newSeries || getAssetSeriesName() || 'Road Markings').trim();
  item.series = targetSeries;
  if (item.project) item.project.assetSeries = targetSeries;
  await persistLibraryList(list);
  renderSavedAssetsList();
  showToast(`Moved "${item.name}" to "${targetSeries}"`);
}

export async function duplicateRibbonAsset(assetId) {
  const list = getSavedLibrary();
  const orig = list.find((a) => a.id === assetId);
  if (!orig) return;
  const copyName = `${orig.name}_Copy`;
  const copy = {
    ...orig,
    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: copyName,
    updatedAt: Date.now(),
    project: orig.project ? { ...orig.project, assetName: copyName } : null
  };
  list.unshift(copy);
  await persistLibraryList(list);
  renderSavedAssetsList();
  showToast(`Duplicated as "${copyName}"`);
}

export function updateLibraryBadge() {
  const count = getSavedLibrary().length;
  setElText('libraryCountBadge', String(count));
}

export function openSavedLibraryModal() {
  renderSavedAssetsList();
  libraryModalCtrl.open();
}

export function closeLibraryModal() {
  libraryModalCtrl.close();
}

export function closeLibraryModalOnBackdrop(e) {
  libraryModalCtrl.closeOnBackdrop(e);
}

export function filterLibraryBySeries(series) {
  activeLibraryFilterSeries = series || 'ALL';
  renderSavedAssetsList();
}

export function filterLibraryBySearch(q) {
  activeLibrarySearchQuery = String(q || '').trim().toLowerCase();
  renderSavedAssetsList();
}

export function openRibbonFromLibrary(seriesName) {
  if (seriesName && seriesName !== 'ALL') {
    setAssetSeriesName(seriesName);
  }
  closeLibraryModal();
  if (typeof window.openAndScrollToSection === 'function') {
    window.openAndScrollToSection('secToolsSeries');
  }
}

export function loadFromBrowser(assetId) {
  const list = getSavedLibrary();
  const item = list.find((a) => a.id === assetId);
  if (!item) {
    showToast('Saved asset not found');
    return;
  }

  const doLoad = () => {
    if (item.project && typeof window.deserializeAndLoadProject === 'function') {
      window.deserializeAndLoadProject(item.project);
    }
    closeLibraryModal();
    showToast(`Loaded "${item.name}" from browser library`);
  };

  if (hasActiveWork()) {
    openUnsavedModal(`Load "${item.name}" from Browser Library?`, doLoad);
  } else {
    doLoad();
  }
}

export async function deleteFromBrowser(assetId) {
  const list = getSavedLibrary();
  const item = list.find((a) => a.id === assetId || a.assetName === assetId);
  const next = list.filter((a) => a.id !== assetId && a.assetName !== assetId);
  await deleteAssetFromIndexedDB(item?.assetName || assetId);
  await persistLibraryList(next);
  renderSavedAssetsList();
  if (item) showToast(`Removed "${item.name || item.assetName}" from library`);
}

export function renderSavedAssetsList() {
  const container = getEl('savedAssetsListContainer') || getEl('savedLibraryList');
  if (!container) return;

  const all = getSavedLibrary();
  const filtered = all.filter((item) => {
    if (activeLibraryFilterSeries !== 'ALL' && item.series !== activeLibraryFilterSeries) return false;
    if (activeLibrarySearchQuery) {
      const hay = `${item.name} ${item.series || ''} ${item.category || ''}`.toLowerCase();
      if (!hay.includes(activeLibrarySearchQuery)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:18px;text-align:center;color:var(--text-dim);font-size:12px;">No matching saved assets in Browser Library.</div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (item) => `
      <div class="saved-asset-row" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid var(--border-color);border-radius:6px;margin-bottom:6px;background:rgba(15,23,42,0.6);">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
          ${
            item.thumbnail
              ? `<img src="${item.thumbnail}" alt="" style="width:38px;height:38px;object-fit:contain;border-radius:4px;background:#090d16;border:1px solid rgba(255,255,255,0.1);" />`
              : `<div style="width:38px;height:38px;border-radius:4px;background:#090d16;display:flex;align-items:center;justify-content:center;font-size:16px;">🖼️</div>`
          }
          <div style="min-width:0;">
            <div style="font-size:12px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(item.name)}</div>
            <div style="font-size:10px;color:var(--text-dim);">Pack: ${escapeHtml(item.series || 'Road Markings')} • Priority: ${escapeHtml(item.uiPriority ?? 41)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button type="button" class="btn-secondary" style="font-size:11px;padding:4px 10px;color:var(--accent-cyan);" onclick="loadFromBrowser('${escapeHtml(item.id)}')">Load</button>
          <button type="button" class="btn-secondary" style="font-size:11px;padding:4px 8px;color:#f87171;" onclick="deleteFromBrowser('${escapeHtml(item.id)}')">✕</button>
        </div>
      </div>`
    )
    .join('');
}

// ==========================================
// Community Asset Package Importer (.ZIP / Folder / Loose Files)
// ==========================================

export function toggleImportDropdown(event) {
  if (event && event.stopPropagation) event.stopPropagation();
  const menu = getEl('importDropdownMenu');
  if (!menu) return;
  const open = menu.style.display !== 'block';
  menu.style.display = open ? 'block' : 'none';
}

function loadBlobAsImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

async function applyImportedMapCollection(entryMap, sourceName = 'ImportedAsset') {
  let baseBlob = null;
  let normalBlob = null;
  let maskBlob = null;
  let configJsonObj = null;
  let inferredAssetName = sourceName.replace(/\.(zip|json|png|jpg|jpeg)$/i, '');

  let basePath = '';
  let normalPath = '';
  let maskPath = '';

  for (const [path, getBlobOrText] of Object.entries(entryMap)) {
    const lower = path.toLowerCase();
    if (lower.endsWith('decal.json') || lower.endsWith('surface.json') || lower.endsWith('netlane.json')) {
      try {
        const txt = await getBlobOrText('text');
        configJsonObj = JSON.parse(txt);
      } catch (_) {}
      const parts = path.split('/');
      if (parts.length >= 2) {
        inferredAssetName = parts[parts.length - 2] || inferredAssetName;
      }
    } else if (lower.includes('_basecolormap') || (!lower.includes('_normalmap') && !lower.includes('_maskmap') && !lower.endsWith('icon.png') && /\.(png|jpg|jpeg|webp)$/i.test(lower))) {
      baseBlob = await getBlobOrText('blob');
      basePath = path;
    } else if (lower.includes('_normalmap')) {
      normalBlob = await getBlobOrText('blob');
      normalPath = path;
    } else if (lower.includes('_maskmap')) {
      maskBlob = await getBlobOrText('blob');
      maskPath = path;
    }
  }

  if (inferredAssetName) {
    setElValue('assetName', inferredAssetName);
  }

  if (configJsonObj) {
    const flt = configJsonObj.Float || {};
    const v4 = configJsonObj.Vector4 || {};
    const uiPrio = flt.UiPriority ?? flt.m_UIPriority;
    if (uiPrio !== undefined && typeof window.applyUiPriorityPreset === 'function') {
      window.applyUiPriorityPreset(Number(uiPrio));
    }
    const meshSize = v4._MeshSize || v4.colossal_MeshSize;
    if (meshSize && typeof meshSize.x === 'number') {
      setElValue('dimWidth', meshSize.x);
      setElValue('dimWidthSlider', meshSize.x);
      setElValue('dimDepth', meshSize.y ?? 0.5);
      setElValue('dimDepthSlider', meshSize.y ?? 0.5);
      setElValue('dimHeight', meshSize.z ?? 1.0);
      setElValue('dimHeightSlider', meshSize.z ?? 1.0);
    }
  }

  if (baseBlob) {
    const baseImg = await loadBlobAsImage(baseBlob);
    state.currentImage = baseImg;
    state.isCustomImageLoaded = true;
    const baseFileName = basePath ? basePath.split('/').pop() : '_BaseColorMap.png';
    state.sourceFileName = baseFileName;
    state.sourceFileType = formatFileTypeLabel(baseFileName, baseBlob.type || 'image/png', 'PNG (Imported)');
    state.sourceKind = 'imported';
  }
  if (normalBlob) {
    const normImg = await loadBlobAsImage(normalBlob);
    state.customNormalImg = normImg;
    const normFileName = normalPath ? normalPath.split('/').pop() : '_NormalMap.png';
    state.customNormalFileName = normFileName;
    state.customNormalFileType = formatFileTypeLabel(normFileName, normalBlob.type || 'image/png', 'PNG (Imported)');
  }
  if (maskBlob) {
    const maskImg = await loadBlobAsImage(maskBlob);
    state.customMaskImg = maskImg;
    const maskFileName = maskPath ? maskPath.split('/').pop() : '_MaskMap.png';
    state.customMaskFileName = maskFileName;
    state.customMaskFileType = formatFileTypeLabel(maskFileName, maskBlob.type || 'image/png', 'PNG (Imported)');
  }

  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
  if (typeof window.updateConfigJson === 'function') window.updateConfigJson();
  showToast(`Imported community asset "${inferredAssetName}"`);
}

export async function importCommunityAssetFromZip(file) {
  if (!file) return;
  try {
    const zip = await JSZip.loadAsync(file);
    const entryMap = {};
    zip.forEach((relPath, zipEntry) => {
      if (zipEntry.dir) return;
      entryMap[relPath] = (type) => zipEntry.async(type === 'text' ? 'string' : 'blob');
    });
    await applyImportedMapCollection(entryMap, file.name);
  } catch (err) {
    showToast(`Failed to import ZIP: ${err?.message || 'Invalid archive'}`);
  }
}

export async function importCommunityAssetFromFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const files = Array.from(fileList);
  const zipFile = files.find((f) => f.name.toLowerCase().endsWith('.zip'));
  if (zipFile) {
    await importCommunityAssetFromZip(zipFile);
    return;
  }
  const entryMap = {};
  files.forEach((f) => {
    const key = f.webkitRelativePath || f.name;
    entryMap[key] = (type) => (type === 'text' ? f.text() : Promise.resolve(f));
  });
  await applyImportedMapCollection(entryMap, files[0].name);
}

export function handleCommunityZipImport(event) {
  const file = event?.target?.files?.[0];
  if (file) importCommunityAssetFromZip(file);
  if (event?.target) event.target.value = '';
}

export function handleCommunityFolderImport(event) {
  const files = event?.target?.files;
  if (files && files.length > 0) importCommunityAssetFromFiles(files);
  if (event?.target) event.target.value = '';
}

export function handleCommunityFilesImport(event) {
  const files = event?.target?.files;
  if (files && files.length > 0) importCommunityAssetFromFiles(files);
  if (event?.target) event.target.value = '';
}
