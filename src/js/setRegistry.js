// ==========================================
// Asset Sets & Sequence Registry Manager
// Handles storing, recalling, and tracking asset sets,
// sequence auto-incrementing, and cross-set priority overlap prevention.
// ==========================================

import { showToast, escapeHtml, state, getCanvases, hasActiveWork, openUnsavedModal } from './state.js';
import { captureCanvasThumbnail, createModalController } from './domUtils.js';

export const SETS_REGISTRY_STORAGE_KEY = 'cs2_asset_sets_registry';

export const DEFAULT_MANHOLE_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><circle cx='50' cy='50' r='42' fill='%2322252a' stroke='%23474d57' stroke-width='3'/><circle cx='50' cy='50' r='24' fill='%2317191d'/><text x='50' y='54' fill='%239ca3af' font-size='10' font-family='sans-serif' text-anchor='middle' font-weight='bold'>SEWER</text></svg>";
export const DEFAULT_ARROW_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><path d='M50 15 L74 42 L58 42 L58 85 L42 85 L42 42 L26 42 Z' fill='%23ffffff'/></svg>";
export const DEFAULT_STRAIGHT_ARROW_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><path d='M50 12 L72 38 L58 38 L58 88 L42 88 L42 38 L28 38 Z' fill='%23ffffff'/></svg>";
export const DEFAULT_HOUSE_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><polygon points='50,15 85,45 15,45' fill='%23ef4444'/><rect x='25' y='45' width='50' height='45' fill='%23cbd5e1'/><rect x='40' y='60' width='20' height='30' fill='%23475569'/></svg>";

export const DEFAULT_SETS = [
  {
    id: 'set_city_utilities',
    setName: 'City Utilities',
    category: 'Utilities',
    author: 'CS2 Creator',
    version: '1.0.0',
    basePriority: 52000,
    stepInterval: 10,
    rangeSpan: 1000,
    rangeStart: 52000,
    rangeEnd: 52990,
    lastIndex: 1,
    nextPriority: 52020,
    assets: [
      { name: 'CityUtility_Manhole_01', priority: 52010, index: 1, date: Date.now(), thumbnail: DEFAULT_MANHOLE_SVG }
    ],
    notesTemplate: 'Part {index} of the {setName} collection. UI priority increments by +{step}.'
  },
  {
    id: 'set_road_markings',
    setName: 'Road Markings',
    category: 'RoadMarkings',
    author: 'CS2 Creator',
    version: '1.0.0',
    basePriority: 50000,
    stepInterval: 10,
    rangeSpan: 1000,
    rangeStart: 50000,
    rangeEnd: 50990,
    lastIndex: 2,
    nextPriority: 50030,
    assets: [
      { name: 'RoadMarking_TurnArrow_01', priority: 50010, index: 1, date: Date.now() - 86400000, thumbnail: DEFAULT_ARROW_SVG },
      { name: 'RoadMarking_Straight_02', priority: 50020, index: 2, date: Date.now() - 43200000, thumbnail: DEFAULT_STRAIGHT_ARROW_SVG }
    ],
    notesTemplate: 'Part {index} of the {setName} set. UI priority increments by +{step} for subsequent parts.'
  },
  {
    id: 'set_modular_houses',
    setName: 'Modular Row Houses',
    category: 'Decals',
    author: 'CS2 Creator',
    version: '1.0.4',
    basePriority: 51000,
    stepInterval: 10,
    rangeSpan: 1000,
    rangeStart: 51000,
    rangeEnd: 51990,
    lastIndex: 1,
    nextPriority: 51020,
    assets: [
      { name: 'ModularHouse_Corner_01', priority: 51010, index: 1, date: Date.now() - 7200000, thumbnail: DEFAULT_HOUSE_SVG }
    ],
    notesTemplate: 'Part {index} of the {setName} modular set. UI priority increments by +{step} for parts 2-4.'
  }
];

/**
 * Retrieve the saved sets registry from localStorage
 */
export function getSetsRegistry() {
  try {
    const raw = localStorage.getItem(SETS_REGISTRY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETS_REGISTRY_STORAGE_KEY, JSON.stringify(DEFAULT_SETS));
      return JSON.parse(JSON.stringify(DEFAULT_SETS));
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(DEFAULT_SETS));
  } catch (err) {
    console.warn('Error reading sets registry, using defaults:', err);
    return JSON.parse(JSON.stringify(DEFAULT_SETS));
  }
}

/**
 * Save the sets registry to localStorage
 */
export function saveSetsRegistry(registry) {
  try {
    localStorage.setItem(SETS_REGISTRY_STORAGE_KEY, JSON.stringify(registry));
  } catch (err) {
    console.error('Failed to save sets registry:', err);
    showToast('Failed to save set registry to storage');
  }
}

/**
 * Find a set profile by ID or Set Name
 */
export function getSetProfile(idOrName) {
  if (!idOrName) return null;
  const registry = getSetsRegistry();
  const search = String(idOrName).trim().toLowerCase();
  return registry.find(s => s.id === idOrName || s.setName.toLowerCase() === search) || null;
}

/**
 * Check if a priority number falls inside another set's allocated range.
 * Recognizes CS2 category subfolder tab isolation (different sub-categories render in separate UI tabs).
 */
export function checkPriorityOverlap(priority, currentSetId, currentCategory = '') {
  const prioNum = parseInt(priority, 10);
  if (isNaN(prioNum)) return null;

  const registry = getSetsRegistry();
  const activeCat = String(currentCategory || document.getElementById('assetCategory')?.value || '').trim().toLowerCase();

  for (const set of registry) {
    if (currentSetId && set.id === currentSetId) continue;
    const start = set.rangeStart !== undefined ? set.rangeStart : set.basePriority;
    const end = set.rangeEnd !== undefined ? set.rangeEnd : (start + (set.rangeSpan || 1000) - 1);

    if (prioNum >= start && prioNum <= end) {
      const setCat = String(set.category || '').trim().toLowerCase();
      const isSameCategory = !setCat || !activeCat || setCat === activeCat;

      return {
        conflictingSet: set,
        rangeStart: start,
        rangeEnd: end,
        priority: prioNum,
        isSameCategory,
        setCategory: set.category || 'General'
      };
    }
  }
  return null;
}

/**
 * Find the next clean, non-overlapping base priority range
 */
export function suggestNextAvailableRange(span = 1000) {
  const registry = getSetsRegistry();
  let maxAllocated = 50000;

  registry.forEach(set => {
    const end = set.rangeEnd !== undefined ? set.rangeEnd : (set.basePriority + (set.rangeSpan || 1000) - 1);
    if (end > maxAllocated) {
      maxAllocated = end;
    }
  });

  // Round up to next clean 1,000 boundary
  const nextBase = Math.ceil((maxAllocated + 1) / 1000) * 1000;
  return Math.min(99990000, nextBase);
}

/**
 * Recall a set profile and apply all parameters to the current workspace
 */
export function recallSetProfile(setId) {
  const set = getSetProfile(setId);
  if (!set) return;

  // 1. Enable metadata toggle and show fields
  const metaToggle = document.getElementById('includeAssetMetadata');
  if (metaToggle) {
    metaToggle.checked = true;
    if (window.toggleAssetMetadataFields) window.toggleAssetMetadataFields(true);
  }

  // 2. Apply Set Name, Category, Author, Version
  const setNameInp = document.getElementById('metaSetName');
  if (setNameInp) setNameInp.value = set.setName;

  if (set.category) {
    const catInp = document.getElementById('assetCategory');
    if (catInp) catInp.value = set.category;
  }

  const seriesInp = document.getElementById('assetSeries');
  if (seriesInp) {
    seriesInp.value = set.setName;
    if (window.onAssetSeriesInput) window.onAssetSeriesInput();
  }

  const authorInp = document.getElementById('metaAuthor');
  if (authorInp) authorInp.value = set.author || '';

  const versionInp = document.getElementById('metaVersion');
  if (versionInp) versionInp.value = set.version || '1.0.0';

  // 3. Apply Base Priority & Step Interval
  const baseInp = document.getElementById('uiPriorityBase');
  if (baseInp) baseInp.value = set.basePriority;

  const stepSelect = document.getElementById('uiPriorityStep');
  if (stepSelect) stepSelect.value = set.stepInterval || 10;

  // 4. Calculate next sequential index & priority
  const nextIdx = (set.lastIndex || 0) + 1;
  const nextPrio = set.nextPriority || (set.basePriority + (nextIdx * (set.stepInterval || 10)));

  if (window.applyUiPriorityPreset) {
    window.applyUiPriorityPreset(nextPrio);
  } else {
    const pInp = document.getElementById('uiPriorityInput');
    if (pInp) pInp.value = nextPrio;
  }

  // 5. Update Notes
  const noteTemplate = set.notesTemplate || 'Part {index} of the {setName} set. UI priority increments by +{step} for subsequent parts.';
  const noteText = noteTemplate
    .replace(/\{index\}/g, String(nextIdx))
    .replace(/\{setName\}/g, set.setName)
    .replace(/\{step\}/g, String(set.stepInterval || 10));

  const notesEl = document.getElementById('metaNotes');
  if (notesEl) notesEl.value = noteText;

  // 6. Update selector UI & overlap checker
  updateSetRegistryUI(set.id);
  if (window.updateConfigJson) window.updateConfigJson();

  showToast(`Recalled set "${set.setName}" (${set.category || 'RoadMarkings'} • Part #${nextIdx} • Priority: ${nextPrio.toLocaleString()})`);
}
window.recallSetProfile = recallSetProfile;

/**
 * Save the current workspace inputs as a new or updated set profile
 */
/**
 * Helper to capture a clean 96x96 PNG thumbnail from current canvas
 */
export function captureCurrentCanvasThumbnail() {
  const { canvasBase } = getCanvases();
  return captureCanvasThumbnail(canvasBase, 96) || '';
}

/**
 * Save the current workspace inputs as a new or updated set profile
 */
export function saveCurrentWorkspaceAsSet() {
  const setName = document.getElementById('metaSetName')?.value?.trim() ||
                  document.getElementById('assetSeries')?.value?.trim() ||
                  'Custom Set';

  const category = document.getElementById('assetCategory')?.value?.trim() || 'RoadMarkings';
  const author = document.getElementById('metaAuthor')?.value?.trim() || 'Creator';
  const version = document.getElementById('metaVersion')?.value?.trim() || '1.0.0';
  const basePriority = parseInt(document.getElementById('uiPriorityBase')?.value, 10) || 50000;
  const stepInterval = parseInt(document.getElementById('uiPriorityStep')?.value, 10) || 10;
  const currentPriority = parseInt(document.getElementById('uiPriorityInput')?.value, 10) || (basePriority + stepInterval);
  const currentAssetName = document.getElementById('assetName')?.value?.trim() || 'Asset';
  const thumbData = captureCurrentCanvasThumbnail() || getAssetThumbnailFallback(currentAssetName, category);

  const registry = getSetsRegistry();
  const existingIndex = registry.findIndex(s => s.setName.toLowerCase() === setName.toLowerCase());

  const rangeSpan = 1000;
  const rangeStart = basePriority;
  const rangeEnd = basePriority + rangeSpan - 1;

  // Check for conflicts with OTHER sets
  const existingId = existingIndex >= 0 ? registry[existingIndex].id : null;
  const overlap = checkPriorityOverlap(currentPriority, existingId, category);
  if (overlap && overlap.isSameCategory) {
    showToast(`Warning: Priority ${currentPriority.toLocaleString()} overlaps with "${overlap.conflictingSet.setName}" in category ${category}`);
  }

  let profile;
  if (existingIndex >= 0) {
    profile = {
      ...registry[existingIndex],
      category,
      author,
      version,
      basePriority,
      stepInterval,
      rangeStart,
      rangeEnd,
      rangeSpan
    };

    // Log current asset if not already logged
    profile.assets = profile.assets || [];
    const existingAssetIdx = profile.assets.findIndex(a => a.name.toLowerCase() === currentAssetName.toLowerCase());
    if (existingAssetIdx >= 0) {
      profile.assets[existingAssetIdx].priority = currentPriority;
      if (thumbData) profile.assets[existingAssetIdx].thumbnail = thumbData;
      profile.assets[existingAssetIdx].date = Date.now();
    } else {
      profile.assets.push({
        name: currentAssetName,
        priority: currentPriority,
        index: profile.assets.length + 1,
        date: Date.now(),
        thumbnail: thumbData
      });
    }

    profile.lastIndex = Math.max(profile.lastIndex || 0, profile.assets.length);
    profile.nextPriority = Math.max(profile.nextPriority || 0, currentPriority + stepInterval);
    registry[existingIndex] = profile;
    showToast(`Updated set profile "${setName}" in registry`);
  } else {
    const slug = 'set_' + setName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    profile = {
      id: slug,
      setName,
      category,
      author,
      version,
      basePriority,
      stepInterval,
      rangeSpan,
      rangeStart,
      rangeEnd,
      lastIndex: 1,
      nextPriority: currentPriority + stepInterval,
      assets: [
        { name: currentAssetName, priority: currentPriority, index: 1, date: Date.now(), thumbnail: thumbData }
      ],
      notesTemplate: 'Part {index} of the {setName} set. UI priority increments by +{step} for subsequent parts.'
    };
    registry.push(profile);
    showToast(`Created new set profile "${setName}" (Range: ${rangeStart.toLocaleString()} – ${rangeEnd.toLocaleString()})`);
  }

  saveSetsRegistry(registry);
  updateSetRegistryUI(profile.id);
  renderSetThumbnailsStrip();
  renderSetsTable();
}
window.saveCurrentWorkspaceAsSet = saveCurrentWorkspaceAsSet;

/**
 * Register an exported asset into its active set profile and advance next priority
 */
export function registerAssetExportToSet(assetName, priority, setName) {
  const effectiveSetName = setName || document.getElementById('metaSetName')?.value?.trim() || document.getElementById('assetSeries')?.value?.trim();
  if (!effectiveSetName) return;

  const registry = getSetsRegistry();
  const set = registry.find(s => s.setName.toLowerCase() === effectiveSetName.toLowerCase());
  if (!set) return;

  const category = set.category || document.getElementById('assetCategory')?.value?.trim() || 'Utilities';
  const thumbData = captureCurrentCanvasThumbnail() || getAssetThumbnailFallback(assetName, category);

  set.assets = set.assets || [];
  const existing = set.assets.find(a => a.name.toLowerCase() === assetName.toLowerCase());
  if (existing) {
    existing.priority = priority;
    existing.date = Date.now();
    if (thumbData) existing.thumbnail = thumbData;
  } else {
    set.assets.push({
      name: assetName,
      priority: priority,
      index: set.assets.length + 1,
      date: Date.now(),
      thumbnail: thumbData
    });
  }

  set.lastIndex = set.assets.length;
  set.nextPriority = priority + (set.stepInterval || 10);
  saveSetsRegistry(registry);
  updateSetRegistryUI(set.id);
  renderSetThumbnailsStrip();
}
window.registerAssetExportToSet = registerAssetExportToSet;

/**
 * Apply the next safe, non-overlapping range to the active workspace
 */
export function applySuggestedSafeRange() {
  const nextBase = suggestNextAvailableRange(1000);
  const baseInp = document.getElementById('uiPriorityBase');
  if (baseInp) baseInp.value = nextBase;

  const stepSelect = document.getElementById('uiPriorityStep');
  const step = parseInt(stepSelect ? stepSelect.value : '10', 10) || 10;
  const newPriority = nextBase + step;

  if (window.applyUiPriorityPreset) {
    window.applyUiPriorityPreset(newPriority);
  }

  if (window.updateUiPrioritySequenceUI) {
    window.updateUiPrioritySequenceUI();
  }

  checkLiveOverlapAndAlert();
  showToast(`Jumped to clean non-overlapping range starting at ${nextBase.toLocaleString()}`);
}
window.applySuggestedSafeRange = applySuggestedSafeRange;

/**
 * Check active priority for collision and update the UI alert banner
 */
export function checkLiveOverlapAndAlert() {
  const prioInp = document.getElementById('uiPriorityInput');
  const prio = parseInt(prioInp ? prioInp.value : '41', 10);
  const currentSetName = document.getElementById('metaSetName')?.value?.trim();
  const currentCategory = document.getElementById('assetCategory')?.value?.trim() || 'RoadMarkings';
  const currentSet = getSetProfile(currentSetName);
  const currentSetId = currentSet ? currentSet.id : null;

  const banner = document.getElementById('setOverlapAlertBanner');
  const bannerText = document.getElementById('setOverlapAlertText');
  const btnJump = document.getElementById('btnJumpSafeRange');
  if (!banner || !bannerText) return;

  const conflict = checkPriorityOverlap(prio, currentSetId, currentCategory);
  if (conflict) {
    if (conflict.isSameCategory) {
      banner.style.display = 'flex';
      banner.className = 'set-overlap-banner warning';
      bannerText.innerHTML = `⚠️ <strong>Priority Collision!</strong> ${prio.toLocaleString()} overlaps with <strong>"${escapeHtml(conflict.conflictingSet.setName)}"</strong> in the same <code>${escapeHtml(currentCategory)}</code> category tab.`;
      if (btnJump) btnJump.style.display = 'inline-block';
    } else {
      banner.style.display = 'flex';
      banner.className = 'set-overlap-banner safe';
      bannerText.innerHTML = `ℹ️ <strong>Separate In-Game Tabs:</strong> ${prio.toLocaleString()} matches range of <strong>"${escapeHtml(conflict.conflictingSet.setName)}"</strong>, but lives in a different category tab (<code>${escapeHtml(conflict.setCategory)}</code> vs <code>${escapeHtml(currentCategory)}</code>). Safe in-game!`;
      if (btnJump) btnJump.style.display = 'none';
    }
  } else {
    // Check if within current set's declared base
    const base = parseInt(document.getElementById('uiPriorityBase')?.value || '50000', 10);
    banner.style.display = 'flex';
    banner.className = 'set-overlap-banner safe';
    bannerText.innerHTML = `✓ <strong>Safe Range:</strong> ${prio.toLocaleString()} has no collision in the <code>${escapeHtml(currentCategory)}</code> category (Band: ${base.toLocaleString()} – ${(base + 990).toLocaleString()}).`;
    if (btnJump) btnJump.style.display = 'none';
  }
}
window.checkLiveOverlapAndAlert = checkLiveOverlapAndAlert;

/**
 * Update the set profile selector dropdown in Section 2
 */
export function updateSetRegistryUI(selectedSetId) {
  const registry = getSetsRegistry();
  const currentSet = selectedSetId
    ? (registry.find(s => s.id === selectedSetId || s.setName.toLowerCase() === String(selectedSetId).toLowerCase()) || getCurrentActiveSet())
    : getCurrentActiveSet();
  const activeId = currentSet ? currentSet.id : '';

  // 1. Update Primary Pack Active Selector in Section 3
  const packSelector = document.getElementById('packActiveSelector');
  if (packSelector) {
    let packHtml = '';
    if (registry.length === 0) {
      packHtml += `<option value="" selected disabled>-- No Packs Created Yet --</option>`;
    } else {
      registry.forEach(set => {
        const isSelected = activeId && (set.id === activeId || set.setName.toLowerCase() === activeId.toLowerCase());
        const assetCount = set.assets ? set.assets.length : (set.lastIndex || 0);
        packHtml += `<option value="${escapeHtml(set.id)}" ${isSelected ? 'selected' : ''}>
          📁 ${escapeHtml(set.setName)} (${assetCount} ${assetCount === 1 ? 'item' : 'items'})
        </option>`;
      });
    }
    packHtml += `<option value="__new__">＋ Create Brand New Pack...</option>`;
    packSelector.innerHTML = packHtml;
  }

  // 2. Compatibility with legacy setProfileSelector
  const selector = document.getElementById('setProfileSelector');
  if (selector) {
    let html = `<option value="">-- Recall Saved Set Profile (${registry.length}) --</option>`;
    registry.forEach(set => {
      const isSelected = activeId && (set.id === activeId || set.setName.toLowerCase() === activeId.toLowerCase());
      const assetCount = set.assets ? set.assets.length : (set.lastIndex || 0);
      const rangeText = `${(set.rangeStart || set.basePriority).toLocaleString()} – ${(set.rangeEnd || (set.basePriority + 990)).toLocaleString()}`;
      html += `<option value="${escapeHtml(set.id)}" ${isSelected ? 'selected' : ''}>
        ${escapeHtml(set.setName)} (${rangeText} • Next: ${(set.nextPriority || (set.basePriority + 10)).toLocaleString()} • ${assetCount} items)
      </option>`;
    });
    selector.innerHTML = html;
  }

  // 3. Update count label and category tag
  const countBadge = document.getElementById('packManageCountLabel');
  const catTag = document.getElementById('packCategoryTag');
  if (currentSet) {
    if (countBadge) countBadge.textContent = String(currentSet.assets ? currentSet.assets.length : 0);
    if (catTag) catTag.textContent = currentSet.category || 'RoadMarkings';
  } else {
    if (countBadge) countBadge.textContent = '0';
    if (catTag) catTag.textContent = 'None';
  }

  checkLiveOverlapAndAlert();
  updateActiveDecalPackStatus();
}
window.updateSetRegistryUI = updateSetRegistryUI;

export function switchActivePackFromSelect(val) {
  if (!val) return;
  if (val === '__new__') {
    if (typeof window.initiateCreateNewSetFlow === 'function') {
      window.initiateCreateNewSetFlow();
    }
    return;
  }
  recallSetProfile(val);
  updateActiveDecalPackStatus();
}
window.switchActivePackFromSelect = switchActivePackFromSelect;

/**
 * Render the full sets overview table inside the Set Registry Modal
 */
export function renderSetsTable() {
  const container = document.getElementById('setsRegistryTableBody');
  if (!container) return;

  const registry = getSetsRegistry();
  if (registry.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 20px;">No asset sets registered yet. Click "Save Current Workspace as Set" above!</td></tr>`;
    return;
  }

  // Sort sets by base priority ascending
  const sorted = [...registry].sort((a, b) => a.basePriority - b.basePriority);

  let html = '';
  sorted.forEach((set, i) => {
    const nextSet = sorted[i + 1];
    const end = set.rangeEnd !== undefined ? set.rangeEnd : (set.basePriority + (set.rangeSpan || 1000) - 1);
    const hasCollision = nextSet && nextSet.basePriority <= end;
    const assetCount = set.assets ? set.assets.length : (set.lastIndex || 0);

    html += `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); ${hasCollision ? 'background: rgba(239, 68, 68, 0.08);' : ''}">
        <td style="padding: 8px 10px; font-weight: 700; color: #f1f5f9;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>📁</span>
            <span>${escapeHtml(set.setName)}</span>
            <span class="channel-pill pill-purple" style="font-size: 8px; padding: 1px 5px;">${escapeHtml(set.category || 'RoadMarkings')}</span>
          </div>
          <div style="font-size: 10px; color: var(--text-dim); font-weight: normal;">Author: ${escapeHtml(set.author || 'N/A')} • V${escapeHtml(set.version || '1.0.0')}</div>
        </td>
        <td style="padding: 8px 10px; font-family: monospace; color: var(--accent-cyan);">
          ${(set.rangeStart || set.basePriority).toLocaleString()} – ${end.toLocaleString()}
        </td>
        <td style="padding: 8px 10px; font-family: monospace; color: var(--text-muted); text-align: center;">
          +${set.stepInterval || 10}
        </td>
        <td style="padding: 8px 10px; text-align: center;">
          <button type="button" class="channel-pill pill-blue" style="font-size: 9px; padding: 2px 7px; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.15);" onclick="openManageSetItemsModal('${escapeHtml(set.id)}')" title="View/edit individual decals in this pack">
            ${assetCount} ${assetCount === 1 ? 'decal' : 'decals'} ↗
          </button>
        </td>
        <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: var(--accent-emerald); text-align: right;">
          ${(set.nextPriority || (set.basePriority + (assetCount + 1) * (set.stepInterval || 10))).toLocaleString()}
        </td>
        <td style="padding: 8px 10px; text-align: center;">
          ${hasCollision
            ? `<span style="font-size: 10px; color: #f87171; font-weight: 700;">⚠️ Collides with ${escapeHtml(nextSet.setName)}</span>`
            : `<span style="font-size: 10px; color: var(--accent-emerald);">✓ Non-overlapping</span>`
          }
        </td>
        <td style="padding: 8px 10px; text-align: right;">
          <div style="display: flex; gap: 4px; justify-content: flex-end;">
            <button type="button" class="preset-btn" style="padding: 2px 7px; font-size: 10px; color: var(--accent-cyan);" onclick="openManageSetItemsModal('${escapeHtml(set.id)}')" title="Manage decals list">📋 Items</button>
            <button type="button" class="preset-btn" style="padding: 2px 7px; font-size: 10px; color: var(--primary);" onclick="recallSetProfile('${escapeHtml(set.id)}'); closeSetRegistryModal();" title="Set this pack active in workspace">Recall</button>
            <button type="button" class="preset-btn" style="padding: 2px 6px; font-size: 10px; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" onclick="deleteSetProfileFromUI('${escapeHtml(set.id)}')" title="Delete this pack profile completely">✕ Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}
window.renderSetsTable = renderSetsTable;

/**
 * Delete a set profile
 */
export function deleteSetProfileFromUI(setId) {
  const set = getSetProfile(setId);
  if (!set) return;

  let registry = getSetsRegistry();
  registry = registry.filter(s => s.id !== setId);
  saveSetsRegistry(registry);

  // Clear pack association from any workspace slots that belonged to the deleted pack
  if (state.setSlots) {
    ['decal', 'surface', 'netlane'].forEach(mode => {
      const slot = state.setSlots[mode];
      if (!slot) return;
      const stillInAnyPack = slot.assetName && registry.some(s =>
        (s.assets || []).some(a => a.name.toLowerCase() === slot.assetName.toLowerCase())
      );
      if (!stillInAnyPack) {
        slot.seriesName = '';
        slot.assetSeries = '';
      }
    });
  }

  const seriesInp = document.getElementById('assetSeries');
  const metaInp = document.getElementById('metaSetName');
  const currentSeries = (seriesInp?.value || metaInp?.value || '').trim().toLowerCase();
  const wasActive = (set.setName.toLowerCase() === currentSeries || registry.length === 0);

  if (wasActive) {
    // Check if the currently loaded asset belongs to any remaining pack
    const currentAssetName = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').toLowerCase();
    const memberPack = currentAssetName
      ? registry.find(s => (s.assets || []).some(a => a.name.toLowerCase() === currentAssetName))
      : null;

    if (memberPack) {
      if (typeof window.setAssetSeriesName === 'function') {
        window.setAssetSeriesName(memberPack.setName);
      } else {
        if (seriesInp) seriesInp.value = memberPack.setName;
        if (metaInp) metaInp.value = memberPack.setName;
      }
      updateSetRegistryUI(memberPack.id);
    } else {
      // Do not assign the asset to another pack unless specifically added to one
      if (typeof window.setAssetSeriesName === 'function') {
        window.setAssetSeriesName('');
      } else {
        if (seriesInp) seriesInp.value = '';
        if (metaInp) metaInp.value = '';
        const actBadge = document.getElementById('activeSeriesBadge');
        if (actBadge) actBadge.textContent = 'None';
        const topBadge = document.getElementById('topMenuSeriesBadge');
        if (topBadge) topBadge.textContent = 'None';
      }
      updateSetRegistryUI('');
    }
  } else {
    const active = getCurrentActiveSet();
    updateSetRegistryUI(active ? active.id : '');
  }

  renderSetsTable();
  renderSetThumbnailsStrip();
  updateActiveDecalPackStatus();
  if (typeof window.updateSetSlotsUI === 'function') {
    window.updateSetSlotsUI();
  }
  showToast(`Deleted pack profile "${set.setName}"`);
}
window.deleteSetProfileFromUI = deleteSetProfileFromUI;

/**
 * Modal handlers
 */
const setRegistryModalCtrl = createModalController('setRegistryModal', {
  onOpen: () => {
    renderSetsTable();
    const nextSafe = suggestNextAvailableRange(1000);
    const suggEl = document.getElementById('modalNextSafeRangeLabel');
    if (suggEl) suggEl.textContent = `${nextSafe.toLocaleString()} – ${(nextSafe + 990).toLocaleString()}`;
  }
});

export const openSetRegistryModal = setRegistryModalCtrl.open;
export const closeSetRegistryModal = setRegistryModalCtrl.close;
export const closeSetRegistryModalOnBackdrop = setRegistryModalCtrl.closeOnBackdrop;
window.openSetRegistryModal = openSetRegistryModal;
window.closeSetRegistryModal = closeSetRegistryModal;
window.closeSetRegistryModalOnBackdrop = closeSetRegistryModalOnBackdrop;

// ==========================================
// Set Assets Thumbnail View & In-Set Creator
// ==========================================

export function getAssetThumbnailFallback(name = '', category = '') {
  const lName = String(name).toLowerCase();
  if (lName.includes('manhole') || lName.includes('utility') || lName.includes('sewer') || lName.includes('drain')) {
    return DEFAULT_MANHOLE_SVG;
  }
  if (lName.includes('arrow') || lName.includes('straight') || lName.includes('marking')) {
    return lName.includes('straight') ? DEFAULT_STRAIGHT_ARROW_SVG : DEFAULT_ARROW_SVG;
  }
  if (lName.includes('house') || lName.includes('modular') || lName.includes('building')) {
    return DEFAULT_HOUSE_SVG;
  }
  if (lName.includes('crack') || lName.includes('damage') || lName.includes('fissure')) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><path d='M25 20 L40 45 L60 55 L75 80' stroke='%23ffffff' stroke-width='6' fill='none'/></svg>";
  }
  return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><rect x='20' y='20' width='60' height='60' rx='8' fill='%231e293b' stroke='%230284c7' stroke-width='2'/><text x='50' y='55' fill='%2338bdf8' font-size='11' font-family='sans-serif' text-anchor='middle' font-weight='bold'>DECAL</text></svg>";
}
window.getAssetThumbnailFallback = getAssetThumbnailFallback;

/**
 * Get the active set profile for the current workspace series/set inputs or registry.
 * PURE GETTER: Never writes to localStorage or mutates registry.
 */
export function getCurrentActiveSet() {
  const currentSetName = document.getElementById('metaSetName')?.value?.trim() ||
                         document.getElementById('assetSeries')?.value?.trim() ||
                         '';
  const registry = getSetsRegistry();
  if (!registry || registry.length === 0) return null;

  let set = null;
  if (currentSetName) {
    set = registry.find(s => s.setName.toLowerCase() === currentSetName.toLowerCase() || s.id === currentSetName);
  }

  // Fallback to the first available set in registry
  if (!set) {
    set = registry[0] || null;
  }
  return set;
}
window.getCurrentActiveSet = getCurrentActiveSet;

/**
 * Render the horizontal miniature thumbnail strip for the active set
 */
export function renderSetThumbnailsStrip() {
  const container = document.getElementById('setThumbnailsScroll');
  if (!container) return;

  const set = getCurrentActiveSet();
  const titleEl = document.getElementById('setAssetsActiveTitle');
  const countEl = document.getElementById('setAssetsCountBadge');
  const rangeEl = document.getElementById('setAssetsRangeFootnote');

  if (!set) {
    if (titleEl) titleEl.textContent = 'No Active Pack';
    if (countEl) countEl.textContent = '0 assets';
    if (rangeEl) rangeEl.textContent = 'Create a new pack to bundle & sequence assets';
    container.innerHTML = `
      <div class="set-thumb-card-add" onclick="initiateCreateNewSetFlow()" title="Create a new pack collection">
        <span class="set-thumb-add-icon">＋</span>
        <span class="set-thumb-add-label">Create New<br>Pack</span>
      </div>
    `;
    updateActiveDecalPackStatus();
    return;
  }

  const currentAssetName = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').toLowerCase();

  // Update header titles & footnotes
  if (titleEl) titleEl.textContent = set.setName;

  const count = set.assets ? set.assets.length : 0;
  if (countEl) countEl.textContent = `${count} ${count === 1 ? 'asset' : 'assets'}`;

  if (rangeEl) {
    const start = set.rangeStart !== undefined ? set.rangeStart : set.basePriority;
    const end = set.rangeEnd !== undefined ? set.rangeEnd : (start + 990);
    const next = set.nextPriority || (start + (count + 1) * (set.stepInterval || 10));
    rangeEl.textContent = `Band: ${start.toLocaleString()} – ${end.toLocaleString()} • Step: +${set.stepInterval || 10} • Next: ${next.toLocaleString()}`;
  }

  let html = '';
  const assets = set.assets || [];

  assets.forEach((asset, idx) => {
    const isCurrentActive = asset.name.toLowerCase() === currentAssetName;
    const thumbSrc = asset.thumbnail || getAssetThumbnailFallback(asset.name, set.category);
    const indexNum = asset.index || (idx + 1);

    html += `
      <div class="set-thumb-card ${isCurrentActive ? 'active' : ''}" onclick="loadAssetFromSet('${escapeHtml(set.id)}', '${escapeHtml(asset.name)}')" title="${escapeHtml(asset.name)} (Priority: ${asset.priority.toLocaleString()} • Item #${indexNum})">
        <div class="set-thumb-preview-box checkerboard">
          <img class="set-thumb-img" src="${thumbSrc}" alt="${escapeHtml(asset.name)}" onerror="this.src='${escapeHtml(getAssetThumbnailFallback(asset.name, set.category))}'">
          <span class="set-thumb-index-tag">#${indexNum}</span>
          ${isCurrentActive ? '<span class="set-thumb-active-tag">ACTIVE</span>' : ''}
          <button type="button" class="set-thumb-del-btn" onclick="deleteAssetFromSet('${escapeHtml(set.id)}', '${escapeHtml(asset.name)}', event)" title="Remove '${escapeHtml(asset.name)}' from pack">🗑️</button>
        </div>
        <div class="set-thumb-meta">
          <span class="set-thumb-name">${escapeHtml(asset.name)}</span>
          <span class="set-thumb-prio">${asset.priority.toLocaleString()}</span>
        </div>
      </div>
    `;
  });

  // Append "+ Add Next in Set" card at the end of the scroll list
  html += `
    <div class="set-thumb-card-add" onclick="openCreateSetAssetModal()" title="Create new asset in ${escapeHtml(set.setName)} with preserved settings">
      <span class="set-thumb-add-icon">＋</span>
      <span class="set-thumb-add-label">New Asset<br>in Pack</span>
    </div>
  `;

  container.innerHTML = html;
  updateActiveDecalPackStatus();
}
window.renderSetThumbnailsStrip = renderSetThumbnailsStrip;

// ==========================================
// Create New Asset within Set Modal Handlers
// ==========================================

let modalPendingFile = null;
let modalLoadedImage = null;

export function openCreateSetAssetModal() {
  const modal = document.getElementById('createSetAssetModal');
  if (!modal) return;

  const set = getCurrentActiveSet();
  modalPendingFile = null;
  modalLoadedImage = null;

  // Set modal title
  const titleEl = document.getElementById('createModalTitle');
  if (titleEl) titleEl.textContent = `New Asset in Set: ${set.setName}`;

  // Next index & priority
  const count = set.assets ? set.assets.length : 0;
  const nextIndex = (set.lastIndex || count || 0) + 1;
  const nextPrio = set.nextPriority || (set.basePriority + nextIndex * (set.stepInterval || 10));

  const prioBadge = document.getElementById('createModalNextPriorityBadge');
  if (prioBadge) prioBadge.textContent = `Next Priority: ${nextPrio.toLocaleString()} (Item #${nextIndex})`;

  const idxBadge = document.getElementById('newAssetNameDetectedIndex');
  if (idxBadge) idxBadge.textContent = `Item #${nextIndex}`;

  // Preserved Settings Summary Grid
  const chipsGrid = document.getElementById('preservedChipsGrid');
  if (chipsGrid) {
    const w = document.getElementById('dimWidth')?.value || '1.8';
    const h = document.getElementById('dimHeight')?.value || '1.8';
    const d = document.getElementById('dimDepth')?.value || '0.5';
    const cat = document.getElementById('assetCategory')?.value || set.category || 'Utilities';
    const bump = document.getElementById('bumpIntensity')?.value || '3.5';
    const metal = document.getElementById('metallic')?.value || '180';
    const smooth = document.getElementById('smoothness')?.value || '80';

    chipsGrid.innerHTML = `
      <span class="preserved-chip">📐 <strong>Dimensions:</strong> ${w}m × ${h}m × ${d}m</span>
      <span class="preserved-chip">📁 <strong>Category:</strong> ${escapeHtml(cat)}</span>
      <span class="preserved-chip">🏷️ <strong>Series:</strong> ${escapeHtml(set.setName)}</span>
      <span class="preserved-chip">✨ <strong>Bump:</strong> ${bump}×</span>
      <span class="preserved-chip">🛡️ <strong>PBR:</strong> Met ${metal} / Sm ${smooth}</span>
    `;
  }

  // Suggest Next Asset Name
  const currName = document.getElementById('assetName')?.value?.trim() || '';
  let suggested = '';

  const match = currName.match(/^(.*?)[_-](\d+)$/);
  if (match) {
    const prefix = match[1];
    const numDigits = match[2].length;
    const nextNum = parseInt(match[2], 10) + 1;
    suggested = `${prefix}_${String(nextNum).padStart(numDigits, '0')}`;
  } else if (currName) {
    suggested = `${currName}_0${nextIndex}`;
  } else {
    const slug = set.setName.replace(/[^a-zA-Z0-9]/g, '');
    suggested = `${slug}_0${nextIndex}`;
  }

  const nameInput = document.getElementById('newAssetInputName');
  if (nameInput) {
    nameInput.value = suggested;
    setTimeout(() => { nameInput.focus(); nameInput.select(); }, 100);
  }

  // Reset Dropzone view
  const emptyView = document.getElementById('dropzoneEmptyView');
  const selView = document.getElementById('dropzoneSelectedView');
  const confirmBtn = document.getElementById('btnConfirmCreateSetAsset');

  if (emptyView) emptyView.style.display = 'flex';
  if (selView) selView.style.display = 'none';
  if (confirmBtn) confirmBtn.disabled = true;

  modal.style.display = 'flex';
}
window.openCreateSetAssetModal = openCreateSetAssetModal;

export function closeCreateSetAssetModal() {
  const modal = document.getElementById('createSetAssetModal');
  if (modal) modal.style.display = 'none';
  modalPendingFile = null;
  modalLoadedImage = null;
}
window.closeCreateSetAssetModal = closeCreateSetAssetModal;

export function closeCreateSetAssetModalOnBackdrop(e) {
  if (e.target && e.target.id === 'createSetAssetModal') {
    closeCreateSetAssetModal();
  }
}
window.closeCreateSetAssetModalOnBackdrop = closeCreateSetAssetModalOnBackdrop;

export function applySuggestedNewNameSuffix(suffix) {
  const nameInput = document.getElementById('newAssetInputName');
  if (!nameInput) return;
  let val = nameInput.value.trim();
  if (suffix.startsWith('_0')) {
    val = val.replace(/_\d+$/, '') + suffix;
  } else {
    val = val.replace(suffix, '') + suffix;
  }
  nameInput.value = val;
}
window.applySuggestedNewNameSuffix = applySuggestedNewNameSuffix;

export function handleModalNewAssetFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processModalSelectedFile(files[0]);
  }
}
window.handleModalNewAssetFileSelect = handleModalNewAssetFileSelect;

export function handleModalNewAssetDragOver(e) {
  e.preventDefault();
  const dropzone = document.getElementById('newAssetDropzone');
  if (dropzone) dropzone.classList.add('drag-active');
}
window.handleModalNewAssetDragOver = handleModalNewAssetDragOver;

export function handleModalNewAssetDragLeave(e) {
  e.preventDefault();
  const dropzone = document.getElementById('newAssetDropzone');
  if (dropzone) dropzone.classList.remove('drag-active');
}
window.handleModalNewAssetDragLeave = handleModalNewAssetDragLeave;

export function handleModalNewAssetDrop(e) {
  e.preventDefault();
  const dropzone = document.getElementById('newAssetDropzone');
  if (dropzone) dropzone.classList.remove('drag-active');

  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    processModalSelectedFile(e.dataTransfer.files[0]);
  }
}
window.handleModalNewAssetDrop = handleModalNewAssetDrop;

function processModalSelectedFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a PNG or JPG graphic');
    return;
  }

  modalPendingFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      modalLoadedImage = img;
      const previewImg = document.getElementById('modalSelectedImgPreview');
      if (previewImg) previewImg.src = event.target.result;

      const fn = document.getElementById('modalSelectedFileName');
      if (fn) fn.textContent = file.name;

      const dims = document.getElementById('modalSelectedFileDims');
      if (dims) dims.textContent = `${img.width} × ${img.height} px`;

      const emptyView = document.getElementById('dropzoneEmptyView');
      const selView = document.getElementById('dropzoneSelectedView');
      if (emptyView) emptyView.style.display = 'none';
      if (selView) selView.style.display = 'flex';

      const confirmBtn = document.getElementById('btnConfirmCreateSetAsset');
      if (confirmBtn) confirmBtn.disabled = false;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

export async function confirmCreateSetAsset() {
  const nameInput = document.getElementById('newAssetInputName');
  const newName = nameInput ? nameInput.value.trim() : '';

  if (!newName) {
    showToast('Please specify an asset name');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!modalLoadedImage) {
    showToast('Please select or drop a graphic for the new asset');
    return;
  }

  const set = getCurrentActiveSet();
  const count = set.assets ? set.assets.length : 0;
  const nextIndex = (set.lastIndex || count || 0) + 1;
  const nextPriority = set.nextPriority || (set.basePriority + nextIndex * (set.stepInterval || 10));

  // 1. Preserve existing settings, update Name & Priority
  const assetNameInput = document.getElementById('assetName');
  if (assetNameInput) assetNameInput.value = newName;
  state.currentLoadedAssetName = newName;

  const prioInput = document.getElementById('uiPriorityInput');
  if (prioInput) prioInput.value = nextPriority;
  const prioSlider = document.getElementById('uiPrioritySlider');
  if (prioSlider) {
    if (nextPriority > parseInt(prioSlider.max, 10)) {
      prioSlider.max = Math.max(100000, nextPriority);
    }
    prioSlider.value = nextPriority;
  }
  const prioBadge = document.getElementById('uiPriorityVal');
  if (prioBadge) prioBadge.textContent = nextPriority.toLocaleString();

  // 2. Set new image & flag unsaved changes
  state.currentImage = modalLoadedImage;
  state.isCustomImageLoaded = true;
  state.hasUnsavedChanges = true;

  if (state.mode === 'decal' && state.autoSyncAspectOnImport !== false && typeof window.syncDecalDimensionsToImage === 'function') {
    const rawW = modalLoadedImage.naturalWidth || 1;
    const rawH = modalLoadedImage.naturalHeight || 1;
    window.syncDecalDimensionsToImage(rawW, rawH, rawW / rawH, false);
  }
  if (typeof window.updateSourceImageBadge === 'function') {
    const rawW = modalLoadedImage.naturalWidth || 1;
    const rawH = modalLoadedImage.naturalHeight || 1;
    window.updateSourceImageBadge(rawW, rawH, rawW / rawH);
  }

  // 3. Render all maps with preserved parameters
  if (window.renderAllMaps) window.renderAllMaps();
  if (window.updateDecalAspectUI) window.updateDecalAspectUI();
  if (window.updateConfigJson) window.updateConfigJson();

  // 4. Generate compact thumbnail from canvasBase
  let thumbData = '';
  const { canvasBase } = getCanvases();
  if (canvasBase && canvasBase.width > 0) {
    try {
      const tc = document.createElement('canvas');
      tc.width = 96;
      tc.height = 96;
      const tctx = tc.getContext('2d');
      tctx.drawImage(canvasBase, 0, 0, 96, 96);
      thumbData = tc.toDataURL('image/png');
    } catch (_) {
      thumbData = modalLoadedImage.src;
    }
  } else {
    thumbData = modalLoadedImage.src;
  }

  // 5. Register in active set
  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === set.id || s.setName.toLowerCase() === set.setName.toLowerCase());
  const activeSet = setIdx >= 0 ? registry[setIdx] : set;

  activeSet.assets = activeSet.assets || [];
  const existingAssetIdx = activeSet.assets.findIndex(a => a.name.toLowerCase() === newName.toLowerCase());
  if (existingAssetIdx >= 0) {
    activeSet.assets[existingAssetIdx].priority = nextPriority;
    activeSet.assets[existingAssetIdx].thumbnail = thumbData;
    activeSet.assets[existingAssetIdx].date = Date.now();
  } else {
    activeSet.assets.push({
      name: newName,
      priority: nextPriority,
      index: nextIndex,
      date: Date.now(),
      thumbnail: thumbData
    });
  }

  activeSet.lastIndex = Math.max(activeSet.lastIndex || 0, nextIndex);
  activeSet.nextPriority = nextPriority + (activeSet.stepInterval || 10);
  if (setIdx >= 0) registry[setIdx] = activeSet;
  else registry.push(activeSet);
  saveSetsRegistry(registry);

  // 6. Save serialized project to browser IndexedDB
  if (typeof window.serializeCurrentProject === 'function' && typeof window.saveAssetToIndexedDB === 'function') {
    try {
      const proj = window.serializeCurrentProject();
      await window.saveAssetToIndexedDB(proj);
    } catch (e) {
      console.warn('Could not cache project in IndexedDB:', e);
    }
  }

  // 7. Refresh UI
  updateSetRegistryUI(activeSet.id);
  renderSetThumbnailsStrip();
  closeCreateSetAssetModal();
  showToast(`Created "${newName}" in ${activeSet.setName} (Priority: ${nextPriority.toLocaleString()})`);
}
window.confirmCreateSetAsset = confirmCreateSetAsset;

export function loadAssetFromSet(setId, assetName) {
  if (!assetName) return;
  const current = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').toLowerCase();
  if (assetName.toLowerCase() === current) return;

  const performLoad = async () => {
    // 1. Try finding in IndexedDB memory cache
    if (typeof window.getSavedLibraryFromMemory === 'function' && typeof window.deserializeAndLoadProject === 'function') {
      const library = window.getSavedLibraryFromMemory();
      const match = library.find(item => item.assetName.toLowerCase() === assetName.toLowerCase());
      if (match) {
        window.deserializeAndLoadProject(match);
        state.currentLoadedAssetName = match.assetName;
        renderSetThumbnailsStrip();
        showToast(`Loaded "${match.assetName}" from set`);
        return;
      }
    }

    // 2. If it's a known starter preset
    if (assetName.toLowerCase().includes('manhole')) {
      if (window.loadSample) window.loadSample('manhole', true);
      document.getElementById('assetName').value = assetName;
      state.currentLoadedAssetName = assetName;
      renderSetThumbnailsStrip();
      return;
    } else if (assetName.toLowerCase().includes('arrow')) {
      if (window.loadSample) window.loadSample('arrow', true);
      document.getElementById('assetName').value = assetName;
      state.currentLoadedAssetName = assetName;
      renderSetThumbnailsStrip();
      return;
    }

    // 3. Fallback: Recall set and apply priority and asset name
    const set = getSetProfile(setId);
    if (set) {
      const asset = set.assets?.find(a => a.name.toLowerCase() === assetName.toLowerCase());
      if (asset) {
        document.getElementById('assetName').value = asset.name;
        state.currentLoadedAssetName = asset.name;
        document.getElementById('uiPriorityInput').value = asset.priority;
        if (document.getElementById('uiPriorityVal')) document.getElementById('uiPriorityVal').textContent = asset.priority.toLocaleString();
        if (asset.thumbnail) {
          const img = new Image();
          img.onload = () => {
            state.currentImage = img;
            state.isCustomImageLoaded = true;
            if (window.renderAllMaps) window.renderAllMaps();
            renderSetThumbnailsStrip();
          };
          img.src = asset.thumbnail;
        } else {
          renderSetThumbnailsStrip();
        }
        showToast(`Switched to "${asset.name}"`);
      }
    }
  };

  if (state.hasUnsavedChanges) {
    state.pendingGuardAction = performLoad;
    if (window.openUnsavedModal) window.openUnsavedModal(`Loading "${assetName}" will switch your current active workspace.`);
  } else {
    performLoad();
  }
}
window.loadAssetFromSet = loadAssetFromSet;

let lastRemovedAssetCache = null;

/**
 * Restore the last removed asset to its pack
 */
export function undoLastRemovedAsset() {
  if (!lastRemovedAssetCache) {
    showToast('Nothing to undo');
    return;
  }
  const { setId, asset } = lastRemovedAssetCache;
  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === setId || s.setName.toLowerCase() === setId.toLowerCase());
  if (setIdx >= 0) {
    registry[setIdx].assets = registry[setIdx].assets || [];
    registry[setIdx].assets.push(asset);
    // Sort by priority/index
    registry[setIdx].assets.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    registry[setIdx].assets.forEach((a, i) => { a.index = i + 1; });
    registry[setIdx].lastIndex = registry[setIdx].assets.length;
    saveSetsRegistry(registry);
    updateSetRegistryUI(registry[setIdx].id);
    renderSetThumbnailsStrip();
    renderSetsTable();
    renderManageSetItemsTable();
    updateActiveDecalPackStatus();
    showToast(`Restored "${asset.name}" to pack "${registry[setIdx].setName}"`);
  }
  lastRemovedAssetCache = null;
}
window.undoLastRemovedAsset = undoLastRemovedAsset;

/**
 * Primary asset removal function with clean re-indexing and sequential priority re-alignment.
 * Does not use native window.confirm so it runs instantly and never gets blocked in iframes.
 */
export function removeAssetFromSet(setId, assetName, askConfirm = false, resequence = true) {
  const set = getSetProfile(setId) || getCurrentActiveSet();
  if (!set) {
    showToast('Pack not found');
    return;
  }

  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === set.id || s.setName.toLowerCase() === set.setName.toLowerCase());
  if (setIdx < 0) {
    showToast(`Pack "${set.setName}" not found in registry`);
    return;
  }

  const targetSet = registry[setIdx];
  const prevCount = targetSet.assets ? targetSet.assets.length : 0;
  const assetToRemove = (targetSet.assets || []).find(a => a.name.toLowerCase() === assetName.toLowerCase());

  targetSet.assets = (targetSet.assets || []).filter(a => a.name.toLowerCase() !== assetName.toLowerCase());

  if (targetSet.assets.length === prevCount) {
    showToast(`Asset "${assetName}" not found in ${targetSet.setName}`);
    return;
  }

  // Cache for instant undo
  if (assetToRemove) {
    lastRemovedAssetCache = { setId: targetSet.id, asset: assetToRemove };
  }

  const step = targetSet.stepInterval || 10;
  targetSet.assets.forEach((item, idx) => {
    item.index = idx + 1;
    if (resequence) {
      item.priority = targetSet.basePriority + (idx + 1) * step;
    }
  });

  targetSet.lastIndex = targetSet.assets.length;
  targetSet.nextPriority = targetSet.basePriority + (targetSet.assets.length + 1) * step;

  saveSetsRegistry(registry);

  // If removed asset is loaded in any workspace slot, clear its pack assignment unless it exists in another pack
  if (state.setSlots) {
    ['decal', 'surface', 'netlane'].forEach(mode => {
      const slot = state.setSlots[mode];
      if (slot && slot.assetName && slot.assetName.toLowerCase() === assetName.toLowerCase()) {
        const otherPack = registry.find(s =>
          (s.assets || []).some(a => a.name.toLowerCase() === assetName.toLowerCase())
        );
        slot.seriesName = otherPack ? otherPack.setName : '';
        slot.assetSeries = otherPack ? otherPack.setName : '';
      }
    });
  }

  const currentAssetName = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').trim();
  if (currentAssetName.toLowerCase() === assetName.toLowerCase()) {
    const otherPack = registry.find(s =>
      (s.assets || []).some(a => a.name.toLowerCase() === assetName.toLowerCase())
    );
    if (typeof window.setAssetSeriesName === 'function') {
      window.setAssetSeriesName(otherPack ? otherPack.setName : '');
    }
  }

  updateSetRegistryUI(targetSet.id);
  renderSetThumbnailsStrip();
  updateActiveDecalPackStatus();
  renderSetsTable();
  renderManageSetItemsTable(currentManagingSetId || targetSet.id);
  showToast(`Removed "${escapeHtml(assetName)}" from ${escapeHtml(targetSet.setName)} (${targetSet.assets.length} items left) <button type="button" onclick="undoLastRemovedAsset()" style="margin-left: 8px; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); color: #fff; border-radius: 4px; padding: 2px 7px; font-size: 11px; cursor: pointer; font-weight: 700;">Undo ↺</button>`);
}
window.removeAssetFromSet = removeAssetFromSet;

/**
 * Remove an asset from a set (event wrapper for thumbnail button)
 */
export function deleteAssetFromSet(setId, assetName, event) {
  if (event) event.stopPropagation();
  removeAssetFromSet(setId, assetName, false, true);
}
window.deleteAssetFromSet = deleteAssetFromSet;

/**
 * Direct one-click removal of the currently loaded canvas decal from the active pack
 */
export function removeCurrentDecalFromActiveSet() {
  const currName = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').trim();
  const set = getCurrentActiveSet();
  if (!currName || !set) {
    showToast('No active asset loaded to remove');
    return;
  }
  removeAssetFromSet(set.id, currName, false, true);
}
window.removeCurrentDecalFromActiveSet = removeCurrentDecalFromActiveSet;

/**
 * One-click: add or update the current workspace decal into the active pack
 */
export function addCurrentWorkspaceToSet() {
  const set = getCurrentActiveSet();
  if (!set) return;

  const currentAssetName = document.getElementById('assetName')?.value?.trim() || 'CustomDecal';
  const category = document.getElementById('assetCategory')?.value?.trim() || set.category || 'RoadMarkings';

  const count = set.assets ? set.assets.length : 0;
  const existingIdx = set.assets ? set.assets.findIndex(a => a.name.toLowerCase() === currentAssetName.toLowerCase()) : -1;

  let itemPriority;
  let itemIndex;

  if (existingIdx >= 0) {
    itemPriority = set.assets[existingIdx].priority;
    itemIndex = set.assets[existingIdx].index;
  } else {
    itemIndex = count + 1;
    itemPriority = set.nextPriority || (set.basePriority + itemIndex * (set.stepInterval || 10));
    const prioInput = document.getElementById('uiPriorityInput');
    if (prioInput) prioInput.value = itemPriority;
    const prioBadge = document.getElementById('uiPriorityVal');
    if (prioBadge) prioBadge.textContent = itemPriority.toLocaleString();
  }

  const thumbData = captureCurrentCanvasThumbnail() || getAssetThumbnailFallback(currentAssetName, category);

  set.assets = set.assets || [];
  if (existingIdx >= 0) {
    set.assets[existingIdx].priority = itemPriority;
    set.assets[existingIdx].thumbnail = thumbData;
    set.assets[existingIdx].date = Date.now();
  } else {
    set.assets.push({
      name: currentAssetName,
      priority: itemPriority,
      index: itemIndex,
      date: Date.now(),
      thumbnail: thumbData
    });
  }

  set.lastIndex = set.assets.length;
  set.nextPriority = set.basePriority + (set.assets.length + 1) * (set.stepInterval || 10);

  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === set.id || s.setName.toLowerCase() === set.setName.toLowerCase());
  if (setIdx >= 0) {
    registry[setIdx] = set;
  } else {
    registry.push(set);
  }
  saveSetsRegistry(registry);

  // Explicitly assign the pack name to the workspace & current slot now that it is added to the pack
  if (typeof window.setAssetSeriesName === 'function') {
    window.setAssetSeriesName(set.setName);
  }
  if (state.setSlots && state.setSlots[state.appMode]) {
    state.setSlots[state.appMode].seriesName = set.setName;
    state.setSlots[state.appMode].assetSeries = set.setName;
  }

  // Cache in IndexedDB if serialize helper exists
  if (typeof window.serializeCurrentProject === 'function' && typeof window.saveAssetToIndexedDB === 'function') {
    try {
      const proj = window.serializeCurrentProject();
      window.saveAssetToIndexedDB(proj);
    } catch (_) {}
  }

  updateSetRegistryUI(set.id);
  renderSetThumbnailsStrip();
  updateActiveDecalPackStatus();
  showToast(existingIdx >= 0
    ? `Updated "${currentAssetName}" in pack "${set.setName}"`
    : `Added "${currentAssetName}" to pack "${set.setName}" (Priority: ${itemPriority.toLocaleString()} • Item #${itemIndex})`
  );
}
window.addCurrentWorkspaceToSet = addCurrentWorkspaceToSet;

/**
 * Cleanly recalculates and auto-aligns all priorities in the active pack
 */
export function resequenceCurrentSetActiveSet() {
  const set = getCurrentActiveSet();
  if (!set || !set.assets || set.assets.length === 0) {
    showToast('No decals in this pack to re-sequence');
    return;
  }

  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === set.id || s.setName.toLowerCase() === set.setName.toLowerCase());
  if (setIdx < 0) return;

  const step = registry[setIdx].stepInterval || 10;
  registry[setIdx].assets.forEach((item, idx) => {
    item.index = idx + 1;
    item.priority = registry[setIdx].basePriority + (idx + 1) * step;
  });
  registry[setIdx].lastIndex = registry[setIdx].assets.length;
  registry[setIdx].nextPriority = registry[setIdx].basePriority + (registry[setIdx].assets.length + 1) * step;

  saveSetsRegistry(registry);
  updateSetRegistryUI(set.id);
  renderSetThumbnailsStrip();
  renderManageSetItemsTable();
  updateActiveDecalPackStatus();
  showToast(`Auto-aligned ${registry[setIdx].assets.length} decals with +${step} spacing (Next: ${registry[setIdx].nextPriority.toLocaleString()})`);
}
window.resequenceCurrentSetActiveSet = resequenceCurrentSetActiveSet;

/**
 * Reorder asset in sequence (up or down)
 */
export function moveSetAsset(setId, assetName, direction) {
  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === setId || s.setName.toLowerCase() === setId.toLowerCase());
  if (setIdx < 0) return;

  const set = registry[setIdx];
  const assets = set.assets || [];
  const idx = assets.findIndex(a => a.name.toLowerCase() === assetName.toLowerCase());
  if (idx < 0) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= assets.length) return;

  const temp = assets[idx];
  assets[idx] = assets[targetIdx];
  assets[targetIdx] = temp;

  const step = set.stepInterval || 10;
  assets.forEach((item, i) => {
    item.index = i + 1;
    item.priority = set.basePriority + (i + 1) * step;
  });
  set.nextPriority = set.basePriority + (assets.length + 1) * step;

  saveSetsRegistry(registry);
  updateSetRegistryUI(set.id);
  renderSetThumbnailsStrip();
  renderManageSetItemsTable();
  updateActiveDecalPackStatus();
}
window.moveSetAsset = moveSetAsset;

/**
 * Update the dynamic Active Decal status bar in Section 3
 */
export function updateActiveDecalPackStatus() {
  const bar = document.getElementById('activeDecalPackBar');
  const titleEl = document.getElementById('activeDecalCurrentName');
  const descEl = document.getElementById('activeDecalPackStatusDesc');
  const actionsEl = document.getElementById('activeDecalPackActions');
  const iconEl = document.getElementById('activeDecalPackStatusIcon');
  const registry = getSetsRegistry();
  const currentAssetName = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').trim();

  // Check if current asset is actually a member of ANY registered pack
  const actualMemberSet = currentAssetName
    ? registry.find(s => (s.assets || []).some(a => a.name.toLowerCase() === currentAssetName.toLowerCase()))
    : null;

  // Sync active slot & series badges strictly to actual pack membership
  if (state.setSlots && state.setSlots[state.appMode]) {
    state.setSlots[state.appMode].seriesName = actualMemberSet ? actualMemberSet.setName : '';
    state.setSlots[state.appMode].assetSeries = actualMemberSet ? actualMemberSet.setName : '';
  }

  const activeBadge = document.getElementById('activeSeriesBadge');
  const topBadge = document.getElementById('topMenuSeriesBadge');
  const seriesInp = document.getElementById('assetSeries');
  const metaInp = document.getElementById('metaSetName');
  if (actualMemberSet) {
    if (activeBadge) activeBadge.textContent = actualMemberSet.setName;
    if (topBadge) topBadge.textContent = actualMemberSet.setName;
    if (seriesInp && document.activeElement !== seriesInp) seriesInp.value = actualMemberSet.setName;
    if (metaInp) metaInp.value = actualMemberSet.setName;
  } else {
    // Only clear if the input still points to a deleted pack or if the asset isn't in the pack shown
    const inpVal = (seriesInp?.value || '').trim();
    const matchesExistingPack = inpVal && registry.some(s => s.setName.toLowerCase() === inpVal.toLowerCase());
    if (!inpVal || !matchesExistingPack || document.activeElement !== seriesInp) {
      if (seriesInp && document.activeElement !== seriesInp) seriesInp.value = '';
      if (metaInp) metaInp.value = '';
      if (activeBadge) activeBadge.textContent = 'None';
      if (topBadge) topBadge.textContent = 'None';
    }
  }

  if (typeof window.updateSetSlotsUI === 'function') {
    window.updateSetSlotsUI();
  }

  if (!bar || !titleEl || !descEl || !actionsEl) return;
  titleEl.textContent = currentAssetName || 'Untitled Decal';

  const set = actualMemberSet || getCurrentActiveSet();
  if (!set) {
    bar.className = 'active-decal-pack-bar not-in-pack';
    if (iconEl) iconEl.textContent = '📌';
    descEl.innerHTML = `Standalone asset • <em>Not part of any pack</em>`;
    actionsEl.innerHTML = `
      <button type="button" class="btn-primary" style="font-size: 10.5px; padding: 4px 10px; font-weight: 700; background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);" onclick="initiateCreateNewSetFlow()" title="Create a new pack collection">
        ＋ Create New Pack
      </button>
    `;
    return;
  }

  const member = (set.assets || []).find(a => a.name.toLowerCase() === currentAssetName.toLowerCase());

  if (member) {
    bar.className = 'active-decal-pack-bar in-pack';
    if (iconEl) iconEl.textContent = '✓';
    descEl.innerHTML = `<strong>Item #${member.index || 1}</strong> in pack "${escapeHtml(set.setName)}" • In-Game Priority: <strong>${member.priority.toLocaleString()}</strong>`;
    actionsEl.innerHTML = `
      <button type="button" class="btn-secondary" style="font-size: 10px; padding: 3px 8px;" onclick="addCurrentWorkspaceToSet()" title="Update canvas changes for this decal">
        💾 Update in Pack
      </button>
      <button type="button" class="btn-remove-set-asset" onclick="removeCurrentDecalFromActiveSet()" title="Remove this decal from the active pack">
        🗑️ Remove from Pack
      </button>
    `;
  } else {
    bar.className = 'active-decal-pack-bar not-in-pack';
    if (iconEl) iconEl.textContent = '📌';
    const nextPrio = set.nextPriority || (set.basePriority + ((set.assets?.length || 0) + 1) * (set.stepInterval || 10));
    descEl.innerHTML = `Standalone asset (not in a pack) • Selected pack: "${escapeHtml(set.setName)}" (Next Priority: <strong>${nextPrio.toLocaleString()}</strong>)`;
    actionsEl.innerHTML = `
      <button type="button" class="btn-primary" style="font-size: 10.5px; padding: 4px 10px; font-weight: 700; background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);" onclick="addCurrentWorkspaceToSet()" title="Add this decal into ${escapeHtml(set.setName)}">
        ＋ Add Current Decal to Pack
      </button>
    `;
  }
}
window.updateActiveDecalPackStatus = updateActiveDecalPackStatus;

// ==========================================
// Manage Pack Items Modal Logic
// ==========================================

let currentManagingSetId = null;

const manageSetItemsModalCtrl = createModalController('manageSetItemsModal', {
  onOpen: (_modal, setId) => {
    currentManagingSetId = setId || null;
    renderManageSetItemsTable(currentManagingSetId);
  },
  onClose: () => {
    currentManagingSetId = null;
  }
});

export const openManageSetItemsModal = manageSetItemsModalCtrl.open;
export const closeManageSetItemsModal = manageSetItemsModalCtrl.close;
export const closeManageSetItemsModalOnBackdrop = manageSetItemsModalCtrl.closeOnBackdrop;
window.openManageSetItemsModal = openManageSetItemsModal;
window.closeManageSetItemsModal = closeManageSetItemsModal;
window.closeManageSetItemsModalOnBackdrop = closeManageSetItemsModalOnBackdrop;

export function renderManageSetItemsTable(targetSetId) {
  const tbody = document.getElementById('manageSetItemsTableBody');
  if (!tbody) return;

  const idToUse = targetSetId || currentManagingSetId;
  const registry = getSetsRegistry();
  let set = null;
  if (idToUse) {
    set = registry.find(s => s.id === idToUse || s.setName.toLowerCase() === String(idToUse).toLowerCase());
  }
  if (!set) {
    set = getCurrentActiveSet();
  }
  if (!set) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">No pack selected.</td></tr>`;
    return;
  }

  const titleEl = document.getElementById('manageModalPackTitle');
  if (titleEl) titleEl.textContent = set.setName;

  const countBadge = document.getElementById('manageModalItemsCountBadge');
  const count = set.assets ? set.assets.length : 0;
  if (countBadge) countBadge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;

  const rangeFootnote = document.getElementById('manageModalRangeFootnote');
  if (rangeFootnote) {
    const start = set.rangeStart !== undefined ? set.rangeStart : set.basePriority;
    const end = set.rangeEnd !== undefined ? set.rangeEnd : (start + 990);
    rangeFootnote.textContent = `Band: ${start.toLocaleString()} – ${end.toLocaleString()} • Step: +${set.stepInterval || 10} • In-game order determined by Priority`;
  }

  const assets = set.assets || [];
  if (assets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">No decals in this pack yet. Click "+ New Decal" or "Add from Library" above!</td></tr>`;
    return;
  }

  const currentActiveName = (state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || '').toLowerCase();

  let html = '';
  assets.forEach((asset, idx) => {
    const isCurrent = asset.name.toLowerCase() === currentActiveName;
    const thumbSrc = asset.thumbnail || getAssetThumbnailFallback(asset.name, set.category);
    const isFirst = idx === 0;
    const isLast = idx === assets.length - 1;

    html += `
      <tr class="${isCurrent ? 'current-active-row' : ''}">
        <td style="text-align: center; font-family: monospace; font-weight: 700; color: var(--text-dim);">
          #${asset.index || (idx + 1)}
        </td>
        <td style="text-align: center;">
          <div style="width: 38px; height: 38px; border-radius: 4px; overflow: hidden; background: #090e16; border: 1px solid rgba(255,255,255,0.1); display: inline-block;">
            <img src="${thumbSrc}" alt="${escapeHtml(asset.name)}" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="color: ${isCurrent ? 'var(--accent-cyan)' : '#f1f5f9'}; font-size: 12px;">${escapeHtml(asset.name)}</strong>
            ${isCurrent ? '<span class="channel-pill pill-cyan" style="font-size: 8px; padding: 1px 4px;">ACTIVE</span>' : ''}
          </div>
          <div style="font-size: 10px; color: var(--text-dim);">
            Added ${new Date(asset.date || Date.now()).toLocaleDateString()}
          </div>
        </td>
        <td style="text-align: right; font-family: monospace; font-weight: 700; color: var(--accent-emerald);">
          ${asset.priority.toLocaleString()}
        </td>
        <td style="text-align: center;">
          <div style="display: inline-flex; gap: 2px;">
            <button type="button" class="preset-btn" style="padding: 2px 6px; font-size: 10px;" onclick="moveSetAsset('${escapeHtml(set.id)}', '${escapeHtml(asset.name)}', -1)" ${isFirst ? 'disabled style="opacity: 0.3;"' : ''} title="Move up in sequence">▲</button>
            <button type="button" class="preset-btn" style="padding: 2px 6px; font-size: 10px;" onclick="moveSetAsset('${escapeHtml(set.id)}', '${escapeHtml(asset.name)}', 1)" ${isLast ? 'disabled style="opacity: 0.3;"' : ''} title="Move down in sequence">▼</button>
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button type="button" class="preset-btn" style="padding: 3px 8px; font-size: 10.5px; color: var(--primary);" onclick="loadAssetFromSet('${escapeHtml(set.id)}', '${escapeHtml(asset.name)}'); closeManageSetItemsModal();">Load</button>
            <button type="button" class="btn-remove-set-asset" onclick="removeAssetFromSet('${escapeHtml(set.id)}', '${escapeHtml(asset.name)}', false, true)" title="Remove this decal from the pack">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Remove</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}
window.renderManageSetItemsTable = renderManageSetItemsTable;

// ==========================================
// Add from Library Modal Logic
// ==========================================

let librarySelectedAssets = new Set();

export function openAddFromLibraryModal() {
  const modal = document.getElementById('addFromLibraryToSetModal');
  if (!modal) return;

  const set = (currentManagingSetId ? getSetProfile(currentManagingSetId) : null) || getCurrentActiveSet();
  const titleEl = document.getElementById('addLibraryModalPackName');
  if (titleEl) titleEl.textContent = set ? set.setName : 'Pack';

  librarySelectedAssets = new Set();
  renderAddFromLibraryList();
  modal.style.display = 'flex';
}
window.openAddFromLibraryModal = openAddFromLibraryModal;

export function closeAddFromLibraryModal() {
  const modal = document.getElementById('addFromLibraryToSetModal');
  if (modal) modal.style.display = 'none';
  librarySelectedAssets = new Set();
}
window.closeAddFromLibraryModal = closeAddFromLibraryModal;

export function closeAddFromLibraryModalOnBackdrop(e) {
  if (e.target && e.target.id === 'addFromLibraryToSetModal') {
    closeAddFromLibraryModal();
  }
}
window.closeAddFromLibraryModalOnBackdrop = closeAddFromLibraryModalOnBackdrop;

export function renderAddFromLibraryList() {
  const grid = document.getElementById('addLibraryPickGrid');
  if (!grid) return;

  const set = (currentManagingSetId ? getSetProfile(currentManagingSetId) : null) || getCurrentActiveSet();
  const existingNames = new Set((set?.assets || []).map(a => a.name.toLowerCase()));

  const library = typeof window.getSavedLibraryFromMemory === 'function' ? window.getSavedLibraryFromMemory() : [];
  if (library.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 30px;">No saved decals found in browser library. Create and save decals first!</div>`;
    return;
  }

  let html = '';
  library.forEach(item => {
    const isAlreadyInSet = existingNames.has(item.assetName.toLowerCase());
    const isSelected = librarySelectedAssets.has(item.assetName);
    const thumb = item.baseImageData || getAssetThumbnailFallback(item.assetName, item.assetCategory);

    html += `
      <div class="library-pick-card ${isSelected ? 'selected' : ''} ${isAlreadyInSet ? 'already-in-set' : ''}" onclick="${isAlreadyInSet ? '' : `toggleLibraryPickSelection('${escapeHtml(item.assetName)}')`}" title="${escapeHtml(item.assetName)} ${isAlreadyInSet ? '(Already in this pack)' : ''}">
        <div style="width: 100%; height: 60px; border-radius: 4px; overflow: hidden; background: #090e16; display: flex; align-items: center; justify-content: center; position: relative;">
          <img src="${thumb}" alt="${escapeHtml(item.assetName)}" style="width: 100%; height: 100%; object-fit: contain;">
          ${isAlreadyInSet ? '<span style="position: absolute; font-size: 8px; font-weight: 700; background: rgba(0,0,0,0.8); color: #94a3b8; padding: 2px 4px; border-radius: 3px;">IN PACK</span>' : ''}
          ${isSelected ? '<span style="position: absolute; top: 2px; right: 2px; font-size: 10px; background: var(--accent-emerald); color: #000; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800;">✓</span>' : ''}
        </div>
        <div style="font-size: 10.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(item.assetName)}
        </div>
        <div style="font-size: 9px; color: var(--text-dim);">
          ${escapeHtml(item.assetCategory || 'Decals')}
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;

  const countBadge = document.getElementById('addLibrarySelectionCountBadge');
  if (countBadge) countBadge.textContent = `${librarySelectedAssets.size} selected`;

  const btnConfirm = document.getElementById('btnConfirmAddFromLibrary');
  if (btnConfirm) btnConfirm.disabled = librarySelectedAssets.size === 0;
}
window.renderAddFromLibraryList = renderAddFromLibraryList;

export function toggleLibraryPickSelection(assetName) {
  if (librarySelectedAssets.has(assetName)) {
    librarySelectedAssets.delete(assetName);
  } else {
    librarySelectedAssets.add(assetName);
  }
  renderAddFromLibraryList();
}
window.toggleLibraryPickSelection = toggleLibraryPickSelection;

export function confirmAddFromLibraryToSet() {
  if (librarySelectedAssets.size === 0) return;

  const set = (currentManagingSetId ? getSetProfile(currentManagingSetId) : null) || getCurrentActiveSet();
  if (!set) return;

  const library = typeof window.getSavedLibraryFromMemory === 'function' ? window.getSavedLibraryFromMemory() : [];
  const selectedItems = library.filter(it => librarySelectedAssets.has(it.assetName));

  const registry = getSetsRegistry();
  const setIdx = registry.findIndex(s => s.id === set.id || s.setName.toLowerCase() === set.setName.toLowerCase());
  const activeSet = setIdx >= 0 ? registry[setIdx] : set;

  activeSet.assets = activeSet.assets || [];
  const step = activeSet.stepInterval || 10;

  selectedItems.forEach(item => {
    const existing = activeSet.assets.find(a => a.name.toLowerCase() === item.assetName.toLowerCase());
    if (!existing) {
      const nextIdx = activeSet.assets.length + 1;
      const nextPrio = activeSet.basePriority + nextIdx * step;
      activeSet.assets.push({
        name: item.assetName,
        priority: nextPrio,
        index: nextIdx,
        date: Date.now(),
        thumbnail: item.baseImageData || getAssetThumbnailFallback(item.assetName, activeSet.category)
      });
    }
  });

  activeSet.lastIndex = activeSet.assets.length;
  activeSet.nextPriority = activeSet.basePriority + (activeSet.assets.length + 1) * step;

  if (setIdx >= 0) registry[setIdx] = activeSet;
  else registry.push(activeSet);

  saveSetsRegistry(registry);
  updateSetRegistryUI(activeSet.id);
  renderSetThumbnailsStrip();
  renderManageSetItemsTable(activeSet.id);
  renderSetsTable();
  updateActiveDecalPackStatus();
  closeAddFromLibraryModal();
  showToast(`Added ${selectedItems.length} decals to ${activeSet.setName}`);
}
window.confirmAddFromLibraryToSet = confirmAddFromLibraryToSet;

// ==========================================
// Create New Set Wizard Flow & State
// ==========================================

let wizardCurrentStep = 1;
let wizardSelectedFile = null;
let wizardLoadedImage = null;

/**
 * Initiates the Create New Set workflow.
 * Checks for unsaved changes; if confirmed, wipes the current workspace/set and brings up the Wizard.
 */
export function initiateCreateNewSetFlow() {
  if (hasActiveWork()) {
    state.pendingGuardAction = () => {
      startCreateNewSetWizard();
    };
    openUnsavedModal('Starting a new set will clear the current set workspace and launch the Set Creation Wizard.');
    return;
  }
  startCreateNewSetWizard();
}
window.initiateCreateNewSetFlow = initiateCreateNewSetFlow;

/**
 * Resets the current set workspace to a clean slate and opens the Wizard.
 */
export function startCreateNewSetWizard() {
  // Close Pack & Series overview modal if open
  if (typeof window.closePackPriorityModal === 'function') {
    window.closePackPriorityModal();
  }

  // 1. Clear current workspace state
  state.currentImage = null;
  state.isCustomImageLoaded = false;
  state.hasUnsavedChanges = false;
  state.customNormalImg = null;
  state.customNormalFileName = '';
  state.customMaskImg = null;
  state.customMaskFileName = '';

  const { canvasBase, ctxBase, canvasNormal, ctxNormal, canvasMask, ctxMask } = getCanvases();
  const size = state.currentResolution || 1024;
  if (canvasBase && ctxBase) ctxBase.clearRect(0, 0, size, size);
  if (canvasNormal && ctxNormal) ctxNormal.clearRect(0, 0, size, size);
  if (canvasMask && ctxMask) ctxMask.clearRect(0, 0, size, size);

  // 2. Suggest clean, non-overlapping priority range
  const nextSafeBase = suggestNextAvailableRange(1000);

  // 3. Reset Wizard inputs
  const nameInp = document.getElementById('wizardSetName');
  if (nameInp) nameInp.value = 'UK Road Markings';

  const modeSel = document.getElementById('wizardModeSelect');
  if (modeSel) modeSel.value = 'decal';

  const catInp = document.getElementById('wizardCategory');
  if (catInp) catInp.value = 'RoadMarkings';

  const catSel = document.getElementById('wizardCategorySelect');
  if (catSel) catSel.value = 'RoadMarkings';

  const basePrioInp = document.getElementById('wizardBasePriority');
  if (basePrioInp) basePrioInp.value = nextSafeBase;

  const stepSel = document.getElementById('wizardStepInterval');
  if (stepSel) stepSel.value = '10';

  const authInp = document.getElementById('wizardAuthor');
  if (authInp) authInp.value = document.getElementById('metaAuthor')?.value?.trim() || 'CS2 Creator';

  const verInp = document.getElementById('wizardVersion');
  if (verInp) verInp.value = '1.0.0';

  // Dimension defaults
  const wInp = document.getElementById('wizardDimW'); if (wInp) wInp.value = '2.0';
  const hInp = document.getElementById('wizardDimH'); if (hInp) hInp.value = '2.0';
  const dInp = document.getElementById('wizardDimD'); if (dInp) dInp.value = '0.5';
  updateWizardDimSummary();

  // First asset defaults
  const firstAssetInp = document.getElementById('wizardFirstAssetName');
  if (firstAssetInp) firstAssetInp.value = 'UK_RoadMarking_01';

  // Reset file/dropzone states
  wizardSelectedFile = null;
  wizardLoadedImage = null;
  const emptyView = document.getElementById('wizardDropEmptyView');
  const selView = document.getElementById('wizardDropSelectedView');
  if (emptyView) emptyView.style.display = 'flex';
  if (selView) selView.style.display = 'none';

  // Check collision status
  onWizardBasePriorityChange();

  // Open modal at Step 1
  setWizardStep(1);
  const modal = document.getElementById('createNewSetWizardModal');
  if (modal) modal.style.display = 'flex';
}
window.startCreateNewSetWizard = startCreateNewSetWizard;

export function closeCreateNewSetWizard() {
  const modal = document.getElementById('createNewSetWizardModal');
  if (modal) modal.style.display = 'none';
  wizardSelectedFile = null;
  wizardLoadedImage = null;
}
window.closeCreateNewSetWizard = closeCreateNewSetWizard;

export function closeCreateNewSetWizardOnBackdrop(e) {
  if (e.target && e.target.id === 'createNewSetWizardModal') {
    closeCreateNewSetWizard();
  }
}
window.closeCreateNewSetWizardOnBackdrop = closeCreateNewSetWizardOnBackdrop;

export function setWizardStep(step) {
  wizardCurrentStep = Math.max(1, Math.min(3, step));

  // 1. Update Tabs Indicator
  [1, 2, 3].forEach(num => {
    const tab = document.getElementById(`wizardTab${num}`);
    const panel = document.getElementById(`wizardStepPanel${num}`);
    if (tab) {
      tab.classList.toggle('active', num === wizardCurrentStep);
      tab.classList.toggle('completed', num < wizardCurrentStep);
    }
    if (panel) {
      panel.style.display = num === wizardCurrentStep ? 'block' : 'none';
    }
  });

  // 2. Navigation buttons
  const btnBack = document.getElementById('btnWizardBack');
  const btnNext = document.getElementById('btnWizardNext');
  const btnFinish = document.getElementById('btnWizardFinish');

  if (btnBack) btnBack.style.display = wizardCurrentStep > 1 ? 'block' : 'none';
  if (btnNext) {
    btnNext.style.display = wizardCurrentStep < 3 ? 'block' : 'none';
    if (wizardCurrentStep === 1) btnNext.textContent = 'Next: Shared Defaults →';
    else if (wizardCurrentStep === 2) btnNext.textContent = 'Next: First Asset →';
  }
  if (btnFinish) btnFinish.style.display = wizardCurrentStep === 3 ? 'flex' : 'none';

  updateWizardSummaryCard();
}
window.setWizardStep = setWizardStep;

export function wizardGoNext() {
  if (wizardCurrentStep === 1) {
    const name = document.getElementById('wizardSetName')?.value?.trim();
    if (!name) {
      showToast('Please enter a name for the new set');
      document.getElementById('wizardSetName')?.focus();
      return;
    }
    setWizardStep(2);
  } else if (wizardCurrentStep === 2) {
    setWizardStep(3);
  }
}
window.wizardGoNext = wizardGoNext;

export function wizardGoBack() {
  if (wizardCurrentStep > 1) {
    setWizardStep(wizardCurrentStep - 1);
  }
}
window.wizardGoBack = wizardGoBack;

export function applyWizardThemePreset(presetKey) {
  const nameInp = document.getElementById('wizardSetName');
  const catInp = document.getElementById('wizardCategory');
  const catSel = document.getElementById('wizardCategorySelect');
  const modeSel = document.getElementById('wizardModeSelect');
  const bumpSel = document.getElementById('wizardBump');
  const metalSel = document.getElementById('wizardMetal');
  const smoothSel = document.getElementById('wizardSmooth');
  const badgeTheme = document.getElementById('wizardBadgeTheme');

  if (presetKey === 'utilities') {
    if (nameInp) nameInp.value = 'City Utility Hatches';
    if (catInp) catInp.value = 'Utilities';
    if (catSel) catSel.value = 'Utilities';
    if (modeSel) modeSel.value = 'decal';
    applyWizardDimPreset(1.8, 1.8, 0.5);
    if (bumpSel) bumpSel.value = '3.5';
    if (metalSel) metalSel.value = '180';
    if (smoothSel) smoothSel.value = '80';
    if (badgeTheme) badgeTheme.value = 'cyan';
  } else if (presetKey === 'road_arrows') {
    if (nameInp) nameInp.value = 'UK Road Markings';
    if (catInp) catInp.value = 'RoadMarkings';
    if (catSel) catSel.value = 'RoadMarkings';
    if (modeSel) modeSel.value = 'decal';
    applyWizardDimPreset(3.0, 6.0, 0.5);
    if (bumpSel) bumpSel.value = '2.2';
    if (metalSel) metalSel.value = '0';
    if (smoothSel) smoothSel.value = '25';
    if (badgeTheme) badgeTheme.value = 'purple';
  } else if (presetKey === 'airport') {
    if (nameInp) nameInp.value = 'Airport Runway Decals';
    if (catInp) catInp.value = 'RoadMarkings';
    if (catSel) catSel.value = 'RoadMarkings';
    if (modeSel) modeSel.value = 'decal';
    applyWizardDimPreset(4.0, 8.0, 0.5);
    if (bumpSel) bumpSel.value = '2.2';
    if (metalSel) metalSel.value = '0';
    if (smoothSel) smoothSel.value = '25';
    if (badgeTheme) badgeTheme.value = 'gold';
  } else if (presetKey === 'asphalt_wear') {
    if (nameInp) nameInp.value = 'Asphalt Wear & Cracks';
    if (catInp) catInp.value = 'Cracks';
    if (catSel) catSel.value = 'Cracks';
    if (modeSel) modeSel.value = 'decal';
    applyWizardDimPreset(4.0, 4.0, 0.8);
    if (bumpSel) bumpSel.value = '4.5';
    if (metalSel) metalSel.value = '0';
    if (smoothSel) smoothSel.value = '10';
    if (badgeTheme) badgeTheme.value = 'red';
  } else if (presetKey === 'surfaces') {
    if (nameInp) nameInp.value = 'Plaza Cobblestones';
    if (catInp) catInp.value = 'Pavement';
    if (catSel) catSel.value = 'Pavement';
    if (modeSel) modeSel.value = 'surface';
    if (bumpSel) bumpSel.value = '3.5';
    if (metalSel) metalSel.value = '0';
    if (smoothSel) smoothSel.value = '25';
    if (badgeTheme) badgeTheme.value = 'emerald';
  }

  onWizardSetNameInput();
  onWizardBasePriorityChange();
}
window.applyWizardThemePreset = applyWizardThemePreset;

export function onWizardSetNameInput() {
  const name = document.getElementById('wizardSetName')?.value?.trim() || 'NewSet';
  const cleanPrefix = name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const firstAssetInp = document.getElementById('wizardFirstAssetName');
  if (firstAssetInp) {
    firstAssetInp.value = `${cleanPrefix || 'Asset'}_01`;
  }
  updateWizardSummaryCard();
}
window.onWizardSetNameInput = onWizardSetNameInput;

export function onWizardModeChange(mode) {
  const decalSection = document.getElementById('wizardDecalDimsSection');
  if (decalSection) {
    decalSection.style.display = mode === 'decal' ? 'block' : 'none';
  }
  updateWizardSummaryCard();
}
window.onWizardModeChange = onWizardModeChange;

export function onWizardBasePriorityChange() {
  const baseInp = document.getElementById('wizardBasePriority');
  const basePrio = parseInt(baseInp ? baseInp.value : '53000', 10) || 53000;
  const step = parseInt(document.getElementById('wizardStepInterval')?.value || '10', 10) || 10;
  const span = 1000;
  const rangeEnd = basePrio + span - 10;

  const rangeBadge = document.getElementById('wizardRangeBadge');
  if (rangeBadge) {
    rangeBadge.textContent = `${basePrio.toLocaleString()} – ${rangeEnd.toLocaleString()}`;
  }

  const firstAssetPrioPill = document.getElementById('wizardAssetPriorityPill');
  if (firstAssetPrioPill) {
    firstAssetPrioPill.textContent = `Priority: ${(basePrio + step).toLocaleString()}`;
  }

  const category = document.getElementById('wizardCategory')?.value?.trim() || '';
  const overlap = checkPriorityOverlap(basePrio, null, category);

  const statusText = document.getElementById('wizardSafeStatusText');
  if (statusText) {
    if (overlap) {
      statusText.innerHTML = `<span style="color: #f87171;">⚠️ Conflicts with "${escapeHtml(overlap.conflictingSet.setName)}" (${overlap.rangeStart.toLocaleString()}–${overlap.rangeEnd.toLocaleString()}). Click "Auto Safe ⚡" to resolve.</span>`;
    } else {
      statusText.innerHTML = `<span style="color: var(--accent-emerald);">✓ Zero collision with existing sets. Guaranteed safe in Cities: Skylines II menus.</span>`;
    }
  }

  updateWizardSummaryCard();
}
window.onWizardBasePriorityChange = onWizardBasePriorityChange;

export function applyWizardAutoSafeRange() {
  const safeBase = suggestNextAvailableRange(1000);
  const baseInp = document.getElementById('wizardBasePriority');
  if (baseInp) {
    baseInp.value = safeBase;
    onWizardBasePriorityChange();
    showToast(`Allocated safe priority band ${safeBase.toLocaleString()} – ${(safeBase + 990).toLocaleString()}`);
  }
}
window.applyWizardAutoSafeRange = applyWizardAutoSafeRange;

export function updateWizardDimSummary() {
  const w = parseFloat(document.getElementById('wizardDimW')?.value || '2.0') || 2.0;
  const h = parseFloat(document.getElementById('wizardDimH')?.value || '2.0') || 2.0;
  const d = parseFloat(document.getElementById('wizardDimD')?.value || '0.5') || 0.5;

  const badge = document.getElementById('wizardDimSummaryBadge');
  if (badge) badge.textContent = `${w.toFixed(1)}m × ${h.toFixed(1)}m × ${d.toFixed(1)}m`;
  updateWizardSummaryCard();
}
window.updateWizardDimSummary = updateWizardDimSummary;

export function applyWizardDimPreset(w, h, d) {
  const wInp = document.getElementById('wizardDimW');
  const hInp = document.getElementById('wizardDimH');
  const dInp = document.getElementById('wizardDimD');
  if (wInp) wInp.value = w;
  if (hInp) hInp.value = h;
  if (dInp) dInp.value = d;
  updateWizardDimSummary();
}
window.applyWizardDimPreset = applyWizardDimPreset;

export function applyWizardFirstAssetSuffix(suffix) {
  const inp = document.getElementById('wizardFirstAssetName');
  if (!inp) return;
  let val = inp.value.trim();
  if (suffix.startsWith('_0')) {
    val = val.replace(/_\d+$/, '') + suffix;
  } else {
    val = val.replace(suffix, '') + suffix;
  }
  inp.value = val;
  updateWizardSummaryCard();
}
window.applyWizardFirstAssetSuffix = applyWizardFirstAssetSuffix;

export function handleWizardGraphicFileSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    processWizardGraphicFile(e.target.files[0]);
  }
}
window.handleWizardGraphicFileSelect = handleWizardGraphicFileSelect;

export function handleWizardGraphicDragOver(e) {
  e.preventDefault();
  const dz = document.getElementById('wizardGraphicDropzone');
  if (dz) dz.classList.add('drag-active');
}
window.handleWizardGraphicDragOver = handleWizardGraphicDragOver;

export function handleWizardGraphicDragLeave(e) {
  e.preventDefault();
  const dz = document.getElementById('wizardGraphicDropzone');
  if (dz) dz.classList.remove('drag-active');
}
window.handleWizardGraphicDragLeave = handleWizardGraphicDragLeave;

export function handleWizardGraphicDrop(e) {
  e.preventDefault();
  const dz = document.getElementById('wizardGraphicDropzone');
  if (dz) dz.classList.remove('drag-active');
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    processWizardGraphicFile(e.dataTransfer.files[0]);
  }
}
window.handleWizardGraphicDrop = handleWizardGraphicDrop;

export function processWizardGraphicFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a PNG or JPG graphic');
    return;
  }

  wizardSelectedFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      wizardLoadedImage = img;
      const previewImg = document.getElementById('wizardSelectedImgPreview');
      if (previewImg) previewImg.src = event.target.result;
      const fn = document.getElementById('wizardSelectedFileName');
      if (fn) fn.textContent = file.name;
      const dims = document.getElementById('wizardSelectedFileDims');
      if (dims) dims.textContent = `${img.width} × ${img.height} px`;

      const emptyView = document.getElementById('wizardDropEmptyView');
      const selView = document.getElementById('wizardDropSelectedView');
      if (emptyView) emptyView.style.display = 'none';
      if (selView) selView.style.display = 'flex';
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

export function useWizardStarterGraphic() {
  const category = (document.getElementById('wizardCategory')?.value || '').toLowerCase();
  const mode = document.getElementById('wizardModeSelect')?.value || 'decal';
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 1024, 1024);

  if (category.includes('utility') || category.includes('manhole')) {
    // Utility cover graphic
    ctx.fillStyle = '#22252a';
    ctx.beginPath();
    ctx.arc(512, 512, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#474d57';
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = '#17191d';
    ctx.beginPath();
    ctx.arc(512, 512, 280, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CS2 UTILITY', 512, 512);
  } else if (category.includes('crack') || category.includes('damage')) {
    // Crack fracture graphic
    ctx.strokeStyle = '#1a1d24';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(180, 512);
    ctx.lineTo(380, 480);
    ctx.lineTo(520, 560);
    ctx.lineTo(700, 440);
    ctx.lineTo(840, 520);
    ctx.stroke();
  } else if (mode === 'surface') {
    // Cobblestone / tile procedural
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 10;
    for (let x = 0; x < 1024; x += 128) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 128) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }
  } else {
    // Road Arrow / Marking graphic
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(512, 140);
    ctx.lineTo(760, 440);
    ctx.lineTo(600, 440);
    ctx.lineTo(600, 880);
    ctx.lineTo(424, 880);
    ctx.lineTo(424, 440);
    ctx.lineTo(264, 440);
    ctx.closePath();
    ctx.fill();
  }

  const dataUrl = c.toDataURL('image/png');
  const img = new Image();
  img.onload = () => {
    wizardLoadedImage = img;
    const previewImg = document.getElementById('wizardSelectedImgPreview');
    if (previewImg) previewImg.src = dataUrl;
    const fn = document.getElementById('wizardSelectedFileName');
    if (fn) fn.textContent = 'Template_Starter.png';
    const dims = document.getElementById('wizardSelectedFileDims');
    if (dims) dims.textContent = '1024 × 1024 px';

    const emptyView = document.getElementById('wizardDropEmptyView');
    const selView = document.getElementById('wizardDropSelectedView');
    if (emptyView) emptyView.style.display = 'none';
    if (selView) selView.style.display = 'flex';
    showToast('Loaded category template graphic');
  };
  img.src = dataUrl;
}
window.useWizardStarterGraphic = useWizardStarterGraphic;

export function updateWizardSummaryCard() {
  const setName = document.getElementById('wizardSetName')?.value?.trim() || 'New Set';
  const basePrio = parseInt(document.getElementById('wizardBasePriority')?.value || '53000', 10) || 53000;
  const step = parseInt(document.getElementById('wizardStepInterval')?.value || '10', 10) || 10;
  const mode = document.getElementById('wizardModeSelect')?.value || 'decal';
  const category = document.getElementById('wizardCategory')?.value?.trim() || 'RoadMarkings';
  const firstAssetName = document.getElementById('wizardFirstAssetName')?.value?.trim() || 'Asset_01';
  const w = parseFloat(document.getElementById('wizardDimW')?.value || '2.0') || 2.0;
  const h = parseFloat(document.getElementById('wizardDimH')?.value || '2.0') || 2.0;

  const titleEl = document.getElementById('wizardSummarySetTitle');
  if (titleEl) titleEl.textContent = `📁 ${setName}`;

  const bandEl = document.getElementById('wizardSummaryBand');
  if (bandEl) bandEl.textContent = `${basePrio.toLocaleString()} – ${(basePrio + 990).toLocaleString()} (+${step} step)`;

  const catEl = document.getElementById('wizardSummaryCategory');
  if (catEl) catEl.textContent = `Mode: ${mode.toUpperCase()} • Category: ${category}`;

  const dimsEl = document.getElementById('wizardSummaryDims');
  if (dimsEl) dimsEl.textContent = mode === 'decal' ? `Size: ${w.toFixed(1)} × ${h.toFixed(1)}m` : `Type: ${mode}`;

  const prioEl = document.getElementById('wizardSummaryPrio');
  if (prioEl) prioEl.textContent = `Asset #1: "${firstAssetName}" (Priority: ${(basePrio + step).toLocaleString()})`;
}

/**
 * Creates the new set from wizard inputs, saves it to registry, applies all defaults, and launches the workspace!
 */
export async function confirmCreateNewSet() {
  const setName = document.getElementById('wizardSetName')?.value?.trim();
  if (!setName) {
    showToast('Please specify a Set Name');
    setWizardStep(1);
    return;
  }

  const basePrio = parseInt(document.getElementById('wizardBasePriority')?.value || '53000', 10) || 53000;
  const step = parseInt(document.getElementById('wizardStepInterval')?.value || '10', 10) || 10;
  const mode = document.getElementById('wizardModeSelect')?.value || 'decal';
  const category = document.getElementById('wizardCategory')?.value?.trim() || 'RoadMarkings';
  const author = document.getElementById('wizardAuthor')?.value?.trim() || 'CS2 Creator';
  const version = document.getElementById('wizardVersion')?.value?.trim() || '1.0.0';
  const firstAssetName = document.getElementById('wizardFirstAssetName')?.value?.trim() || `${setName.replace(/[^a-zA-Z0-9]/g, '_')}_01`;
  const firstAssetPriority = basePrio + step;

  // 1. If no image chosen yet, generate a clean starter template
  if (!wizardLoadedImage) {
    useWizardStarterGraphic();
    await new Promise(r => setTimeout(r, 80));
  }

  // 2. Switch Mode if different
  if (typeof window.setMode === 'function') {
    window.setMode(mode, true);
  }

  // 3. Set Category and Series Name in workspace
  if (typeof window.setAssetSeriesName === 'function') {
    window.setAssetSeriesName(setName);
  } else {
    const sInp = document.getElementById('assetSeries');
    if (sInp) sInp.value = setName;
  }

  if (typeof window.setAssetCategory === 'function') {
    window.setAssetCategory(category);
  } else {
    const cInp = document.getElementById('assetCategory');
    if (cInp) cInp.value = category;
  }

  const nameInp = document.getElementById('assetName');
  if (nameInp) nameInp.value = firstAssetName;
  state.currentLoadedAssetName = firstAssetName;

  // 4. Set Priority Sequence
  const prioInp = document.getElementById('uiPriorityInput');
  if (prioInp) prioInp.value = firstAssetPriority;
  const prioSlider = document.getElementById('uiPrioritySlider');
  if (prioSlider) {
    if (firstAssetPriority > parseInt(prioSlider.max, 10)) {
      prioSlider.max = Math.max(100000, firstAssetPriority);
    }
    prioSlider.value = firstAssetPriority;
  }
  const prioVal = document.getElementById('uiPriorityVal');
  if (prioVal) prioVal.textContent = firstAssetPriority.toLocaleString();

  const baseEl = document.getElementById('uiPriorityBase');
  if (baseEl) baseEl.value = basePrio;
  const stepEl = document.getElementById('uiPriorityStep');
  if (stepEl) stepEl.value = step;

  // 5. Apply Dimensions Defaults
  if (mode === 'decal') {
    const w = parseFloat(document.getElementById('wizardDimW')?.value || '2.0') || 2.0;
    const h = parseFloat(document.getElementById('wizardDimH')?.value || '2.0') || 2.0;
    const d = parseFloat(document.getElementById('wizardDimD')?.value || '0.5') || 0.5;
    const dimW = document.getElementById('dimWidth'); if (dimW) dimW.value = w;
    const dimH = document.getElementById('dimHeight'); if (dimH) dimH.value = h;
    const dimD = document.getElementById('dimDepth'); if (dimD) dimD.value = d;
  }

  // 6. Apply Layer Masks
  const lRoads = document.getElementById('wizardLayerRoads')?.checked !== false;
  const lTerrain = document.getElementById('wizardLayerTerrain')?.checked !== false;
  const lBuildings = document.getElementById('wizardLayerBuildings')?.checked === true;
  const lVehicles = document.getElementById('wizardLayerVehicles')?.checked === true;
  const lProps = document.getElementById('wizardLayerProps')?.checked === true;

  if (document.getElementById('layerRoads')) document.getElementById('layerRoads').checked = lRoads;
  if (document.getElementById('layerTerrain')) document.getElementById('layerTerrain').checked = lTerrain;
  if (document.getElementById('layerBuildings')) document.getElementById('layerBuildings').checked = lBuildings;
  if (document.getElementById('layerVehicles')) document.getElementById('layerVehicles').checked = lVehicles;
  if (document.getElementById('layerProps')) document.getElementById('layerProps').checked = lProps;

  // 7. Apply PBR Sliders
  const bump = parseFloat(document.getElementById('wizardBump')?.value || '2.2') || 2.2;
  const metal = parseInt(document.getElementById('wizardMetal')?.value || '0', 10) || 0;
  const smooth = parseInt(document.getElementById('wizardSmooth')?.value || '25', 10) || 25;

  const bumpInp = document.getElementById('bumpIntensity');
  if (bumpInp) {
    bumpInp.value = bump;
    const bVal = document.getElementById('bumpVal');
    if (bVal) bVal.textContent = `${bump.toFixed(1)}×`;
  }

  const metalInp = document.getElementById('metallic');
  if (metalInp) {
    metalInp.value = metal;
    const mVal = document.getElementById('metalVal');
    if (mVal) mVal.textContent = `${metal} (${Math.round((metal / 255) * 100)}%)`;
  }

  const smoothInp = document.getElementById('smoothness');
  if (smoothInp) {
    smoothInp.value = smooth;
    const sVal = document.getElementById('smoothVal');
    if (sVal) sVal.textContent = `${smooth} (${Math.round((smooth / 255) * 100)}%)`;
  }

  // 8. Series Icon Badge
  const enableSeriesBadge = document.getElementById('wizardEnableSeriesBadge')?.checked !== false;
  if (enableSeriesBadge) {
    state.badge2Enabled = true;
    const chk = document.getElementById('enableBadge2');
    if (chk) chk.checked = true;

    const sInp = document.getElementById('seriesTextInput');
    if (sInp) sInp.value = setName.toUpperCase();
    state.badge2Text = setName.toUpperCase();

    const theme = document.getElementById('wizardBadgeTheme')?.value || 'purple';
    state.badge2ColorTheme = theme;
    if (typeof window.setSeriesColorTheme === 'function') {
      window.setSeriesColorTheme(theme);
    }
  }

  // 9. Set the image & render all maps
  if (wizardLoadedImage) {
    state.currentImage = wizardLoadedImage;
    state.isCustomImageLoaded = true;
    state.hasUnsavedChanges = false;
  }

  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
  if (typeof window.updateDecalAspectUI === 'function') window.updateDecalAspectUI();
  if (typeof window.updateConfigJson === 'function') window.updateConfigJson();

  // 10. Generate thumbnail for Asset #1
  let thumbData = '';
  const { canvasBase } = getCanvases();
  if (canvasBase && canvasBase.width > 0) {
    try {
      const tc = document.createElement('canvas');
      tc.width = 96;
      tc.height = 96;
      tc.getContext('2d').drawImage(canvasBase, 0, 0, 96, 96);
      thumbData = tc.toDataURL('image/png');
    } catch (_) {
      thumbData = wizardLoadedImage ? wizardLoadedImage.src : DEFAULT_ARROW_SVG;
    }
  } else {
    thumbData = wizardLoadedImage ? wizardLoadedImage.src : DEFAULT_ARROW_SVG;
  }

  // 11. Create & register the new set in Registry
  const setId = 'set_' + setName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
  const newSetProfile = {
    id: setId,
    setName: setName,
    category: category,
    mode: mode,
    author: author,
    version: version,
    basePriority: basePrio,
    stepInterval: step,
    rangeSpan: 1000,
    rangeStart: basePrio,
    rangeEnd: basePrio + 990,
    lastIndex: 1,
    nextPriority: basePrio + (2 * step),
    assets: [
      {
        name: firstAssetName,
        priority: firstAssetPriority,
        index: 1,
        date: Date.now(),
        thumbnail: thumbData
      }
    ],
    notesTemplate: `Part {index} of the ${setName} collection. UI priority increments by +${step}.`
  };

  const registry = getSetsRegistry();
  const existingIdx = registry.findIndex(s => s.id === setId || s.setName.toLowerCase() === setName.toLowerCase());
  if (existingIdx >= 0) {
    registry[existingIdx] = newSetProfile;
  } else {
    registry.push(newSetProfile);
  }
  saveSetsRegistry(registry);

  // 12. Update UI & Ribbon
  updateSetRegistryUI(setId);
  renderSetThumbnailsStrip();
  if (typeof window.renderSeriesChips === 'function') window.renderSeriesChips();
  if (typeof window.updateRibbonSeriesDropdown === 'function') window.updateRibbonSeriesDropdown();

  closeCreateNewSetWizard();
  showToast(`Created new set "${setName}" in safe band ${basePrio.toLocaleString()}–${(basePrio + 990).toLocaleString()}!`);
}
window.confirmCreateNewSet = confirmCreateNewSet;

// ==========================================
// Storage Backup & Restore (Full Portability)
// Delegated to comprehensive backupManager.js
// ==========================================

export {
  exportAllSetsAndStorageBackup,
  handleBackupFileSelect,
  importStorageBackupFromFile,
  openBackupAllDataModal,
  closeBackupAllDataModal
} from './backupManager.js';
