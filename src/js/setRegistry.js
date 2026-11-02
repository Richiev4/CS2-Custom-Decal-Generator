// ==========================================
// Asset Sets & Sequence Registry Manager
// Handles storing, recalling, and tracking asset sets,
// sequence auto-incrementing, and cross-set priority overlap prevention.
// ==========================================

import { showToast, escapeHtml } from './state.js';

export const SETS_REGISTRY_STORAGE_KEY = 'cs2_asset_sets_registry';

export const DEFAULT_SETS = [
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
      { name: 'RoadMarking_TurnArrow_01', priority: 50010, index: 1, date: Date.now() - 86400000 },
      { name: 'RoadMarking_Straight_02', priority: 50020, index: 2, date: Date.now() - 43200000 }
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
      { name: 'ModularHouse_Corner_01', priority: 51010, index: 1, date: Date.now() - 7200000 }
    ],
    notesTemplate: 'Part {index} of the {setName} modular set. UI priority increments by +{step} for parts 2-4.'
  },
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
      { name: 'CityUtility_Manhole_01', priority: 52010, index: 1, date: Date.now() }
    ],
    notesTemplate: 'Part {index} of the {setName} collection. UI priority increments by +{step}.'
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
      return DEFAULT_SETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SETS;
  } catch (err) {
    console.warn('Error reading sets registry, using defaults:', err);
    return DEFAULT_SETS;
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
    const existingAssetIdx = profile.assets.findIndex(a => a.name === currentAssetName);
    if (existingAssetIdx >= 0) {
      profile.assets[existingAssetIdx].priority = currentPriority;
    } else {
      profile.assets.push({
        name: currentAssetName,
        priority: currentPriority,
        index: profile.assets.length + 1,
        date: Date.now()
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
        { name: currentAssetName, priority: currentPriority, index: 1, date: Date.now() }
      ],
      notesTemplate: 'Part {index} of the {setName} set. UI priority increments by +{step} for subsequent parts.'
    };
    registry.push(profile);
    showToast(`Created new set profile "${setName}" (Range: ${rangeStart.toLocaleString()} – ${rangeEnd.toLocaleString()})`);
  }

  saveSetsRegistry(registry);
  updateSetRegistryUI(profile.id);
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

  set.assets = set.assets || [];
  const existing = set.assets.find(a => a.name === assetName);
  if (existing) {
    existing.priority = priority;
    existing.date = Date.now();
  } else {
    set.assets.push({
      name: assetName,
      priority: priority,
      index: set.assets.length + 1,
      date: Date.now()
    });
  }

  set.lastIndex = set.assets.length;
  set.nextPriority = priority + (set.stepInterval || 10);
  saveSetsRegistry(registry);
  updateSetRegistryUI(set.id);
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
  const selector = document.getElementById('setProfileSelector');
  if (!selector) return;

  const registry = getSetsRegistry();
  let html = `<option value="">-- Recall Saved Set Profile (${registry.length}) --</option>`;

  registry.forEach(set => {
    const isSelected = selectedSetId && (set.id === selectedSetId || set.setName.toLowerCase() === selectedSetId.toLowerCase());
    const assetCount = set.assets ? set.assets.length : (set.lastIndex || 0);
    const rangeText = `${(set.rangeStart || set.basePriority).toLocaleString()} – ${(set.rangeEnd || (set.basePriority + 990)).toLocaleString()}`;
    html += `<option value="${escapeHtml(set.id)}" ${isSelected ? 'selected' : ''}>
      ${escapeHtml(set.setName)} (${rangeText} • Next: ${(set.nextPriority || (set.basePriority + 10)).toLocaleString()} • ${assetCount} items)
    </option>`;
  });

  selector.innerHTML = html;
  checkLiveOverlapAndAlert();
}
window.updateSetRegistryUI = updateSetRegistryUI;

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
          <span class="channel-pill pill-blue" style="font-size: 9px; padding: 1px 6px;">${assetCount} assets</span>
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
            <button type="button" class="preset-btn" style="padding: 2px 7px; font-size: 10px; color: var(--primary);" onclick="recallSetProfile('${escapeHtml(set.id)}'); closeSetRegistryModal();">Recall</button>
            <button type="button" class="preset-btn" style="padding: 2px 6px; font-size: 10px; color: #f87171;" onclick="deleteSetProfileFromUI('${escapeHtml(set.id)}')">✕</button>
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
  if (!confirm(`Delete set profile "${set.setName}" from registry?`)) return;

  let registry = getSetsRegistry();
  registry = registry.filter(s => s.id !== setId);
  saveSetsRegistry(registry);
  updateSetRegistryUI('');
  renderSetsTable();
  showToast(`Deleted set profile "${set.setName}"`);
}
window.deleteSetProfileFromUI = deleteSetProfileFromUI;

/**
 * Modal handlers
 */
export function openSetRegistryModal() {
  const modal = document.getElementById('setRegistryModal');
  if (modal) {
    modal.style.display = 'flex';
    renderSetsTable();
    const nextSafe = suggestNextAvailableRange(1000);
    const suggEl = document.getElementById('modalNextSafeRangeLabel');
    if (suggEl) suggEl.textContent = `${nextSafe.toLocaleString()} – ${(nextSafe + 990).toLocaleString()}`;
  }
}
window.openSetRegistryModal = openSetRegistryModal;

export function closeSetRegistryModal() {
  const modal = document.getElementById('setRegistryModal');
  if (modal) modal.style.display = 'none';
}
window.closeSetRegistryModal = closeSetRegistryModal;

export function closeSetRegistryModalOnBackdrop(e) {
  if (e.target && e.target.id === 'setRegistryModal') {
    closeSetRegistryModal();
  }
}
window.closeSetRegistryModalOnBackdrop = closeSetRegistryModalOnBackdrop;
