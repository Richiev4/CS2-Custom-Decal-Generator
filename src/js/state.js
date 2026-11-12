// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// Shared Application State & Core UI Helpers
// ==========================================

import { getEl, setElText, setElValue, setElDisplay, syncActiveClass, createModalController } from './domUtils.js';

export const ALWAYS_ASK_SAVE_KEY = 'cs2_always_ask_where_to_save';
export const HIDE_SAMPLE_PRESETS_KEY = 'cs2_hide_sample_presets';
export const COLLAPSED_SECTIONS_KEY = 'cs2_collapsed_sidebar_sections';

export function createDefaultSlot(mode = 'decal') {
  const isNetlane = mode === 'netlane';
  const isSurface = mode === 'surface';
  return {
    mode,
    loaded: false,
    isCustomImageLoaded: false,
    image: null,
    imageDataUrl: null,
    thumbnail: null,
    fileName: '',
    assetName: isSurface
      ? 'AsphaltPaving_01'
      : isNetlane
      ? 'RoadLine_Dashed_01'
      : 'RoadMarking_TurnArrow_01',
    assetSeries: '',
    seriesName: '',
    category: 'RoadMarkings',
    uiPriority: 41,
    drawOrder: 0,
    normalOpacity: 1.0,
    baseOpacity: 1.0,
    metallicOpacity: 1.0,
    uvScaleX: 1,
    uvScaleY: 1,
    dimWidth: isSurface ? 4.0 : isNetlane ? 0.3 : 1.0,
    dimHeight: isSurface ? 4.0 : isNetlane ? 3.0 : 1.0,
    dimDepth: 0.5,
    bumpIntensity: 1.0,
    blurRadius: 0,
    normalSeamless: true,
    invertX: false,
    invertY: false,
    normalEdgeFade: 0,
    metallic: 0,
    smoothness: 0,
    autoSmoothness: false,
    autoMetallic: false,
    invertSmoothness: false,
    maskThreshold: 0,
    customNormalImg: null,
    customNormalDataUrl: null,
    customNormalFileName: '',
    customMaskImg: null,
    customMaskDataUrl: null,
    customMaskFileName: '',
    textureRotation: 0,
    flipH: false,
    flipV: false
  };
}

export const state = {
  appMode: 'decal',
  currentImage: null,
  isCustomImageLoaded: false,
  hasUnsavedChanges: false,
  currentResolution: 1024,
  textureRotation: 0,
  flipH: false,
  flipV: false,
  lastExportedTransformSig: '0_false_false',
  lastExportedAssetName: '',
  rotationReminderDismissed: false,

  customNormalImg: null,
  customNormalFileName: '',
  customMaskImg: null,
  customMaskFileName: '',

  designerLogoImg: null,
  badge1FileName: '',
  badge2Img: null,
  badge2FileName: '',
  badge3Img: null,
  badge3FileName: '',
  badge4Img: null,
  badge4FileName: '',
  customIconBgImg: null,
  customIconBgFileName: '',

  badge1Enabled: false,
  badge2Enabled: false,
  badge3Enabled: false,
  badge4Enabled: false,

  activeTab: 'grid',
  activeSingleMap: 'base',
  lightPos: { x: -0.4, y: -0.4, z: 0.82 },
  surfaceTiling: 4,
  previewScaleMode: 'fit',

  decalAspectLocked: false,
  decalLockedRatio: 1.0,
  autoSyncAspect: true,

  askWhereToSave: (() => {
    try {
      const saved = localStorage.getItem(ALWAYS_ASK_SAVE_KEY);
      return saved === null ? true : saved === 'true';
    } catch (_) {
      return true;
    }
  })(),

  hideSamplePresets: (() => {
    try {
      return localStorage.getItem(HIDE_SAMPLE_PRESETS_KEY) === 'true';
    } catch (_) {
      return false;
    }
  })(),

  setSlots: {
    decal: createDefaultSlot('decal'),
    surface: createDefaultSlot('surface'),
    netlane: createDefaultSlot('netlane')
  }
};

export function getSlot(mode = state.appMode) {
  if (!state.setSlots) {
    state.setSlots = {
      decal: createDefaultSlot('decal'),
      surface: createDefaultSlot('surface'),
      netlane: createDefaultSlot('netlane')
    };
  }
  if (!state.setSlots[mode]) {
    state.setSlots[mode] = createDefaultSlot(mode);
  }
  return state.setSlots[mode];
}

export function isSlotLoaded(mode) {
  const slot = getSlot(mode);
  if (!slot) return false;
  if (mode === state.appMode && (state.currentImage || state.isCustomImageLoaded)) {
    return true;
  }
  return Boolean(
    slot.loaded ||
      slot.isCustomImageLoaded ||
      slot.image ||
      (slot.imageDataUrl && slot.imageDataUrl.length > 50) ||
      (slot.thumbnail && slot.thumbnail.length > 50)
  );
}

export function getLoadedSlots() {
  return ['decal', 'surface', 'netlane'].filter((m) => isSlotLoaded(m));
}

export function getLoadedSlotsCount() {
  return getLoadedSlots().length;
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let toastTimer = null;
export function showToast(msg) {
  const toast = getEl('toast');
  const toastMsg = getEl('toastMsg');
  if (toastMsg) {
    toastMsg.textContent = msg;
  } else if (toast) {
    toast.textContent = msg;
  }
  if (!toast) return;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

export function getCanvases() {
  const canvasBase = getEl('canvasBase');
  const canvasNormal = getEl('canvasNormal');
  const canvasMask = getEl('canvasMask');
  const canvasIcon = getEl('canvasIcon');
  const canvasSingle = getEl('canvasSingle');
  const canvasSim = getEl('canvasSim');
  const canvasTiled = getEl('canvasTiled');
  const canvasSimGrid = getEl('canvasSimGrid');

  return {
    canvasBase,
    ctxBase: canvasBase ? canvasBase.getContext('2d', { willReadFrequently: true }) : null,
    canvasNormal,
    ctxNormal: canvasNormal ? canvasNormal.getContext('2d', { willReadFrequently: true }) : null,
    canvasMask,
    ctxMask: canvasMask ? canvasMask.getContext('2d', { willReadFrequently: true }) : null,
    canvasIcon,
    ctxIcon: canvasIcon ? canvasIcon.getContext('2d', { willReadFrequently: true }) : null,
    canvasSingle,
    ctxSingle: canvasSingle ? canvasSingle.getContext('2d') : null,
    canvasSim,
    ctxSim: canvasSim ? canvasSim.getContext('2d') : null,
    canvasTiled,
    ctxTiled: canvasTiled ? canvasTiled.getContext('2d') : null,
    canvasSimGrid,
    ctxSimGrid: canvasSimGrid ? canvasSimGrid.getContext('2d') : null
  };
}

export function drawImageSquare(ctx, img, size, strategy) {
  if (!ctx || !img) return;
  const fitStrategy = strategy || getEl('aspectHandling')?.value || 'contain';
  const rot = ((Number(state.textureRotation) || 0) % 360 + 360) % 360;
  const isRotated90 = rot === 90 || rot === 270;

  const rawW = img.naturalWidth || img.width || size;
  const rawH = img.naturalHeight || img.height || size;
  const effW = isRotated90 ? rawH : rawW;
  const effH = isRotated90 ? rawW : rawH;

  let drawW = size;
  let drawH = size;

  if (fitStrategy === 'contain') {
    const scale = Math.min(size / effW, size / effH);
    drawW = effW * scale;
    drawH = effH * scale;
  } else if (fitStrategy === 'cover') {
    const scale = Math.max(size / effW, size / effH);
    drawW = effW * scale;
    drawH = effH * scale;
  }

  const targetW = isRotated90 ? drawH : drawW;
  const targetH = isRotated90 ? drawW : drawH;

  ctx.save();
  ctx.translate(size / 2, size / 2);
  if (rot !== 0) {
    ctx.rotate((rot * Math.PI) / 180);
  }
  const scaleX = state.flipH ? -1 : 1;
  const scaleY = state.flipV ? -1 : 1;
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }
  ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();
}

export function hasActiveWork() {
  if (state.isCustomImageLoaded || state.hasUnsavedChanges) return true;
  if (state.customNormalImg || state.customMaskImg) return true;
  return false;
}

// ==========================================
// Texture Orientation & Variant Naming Helpers
// ==========================================

export function isTransformActive() {
  return (Number(state.textureRotation) || 0) !== 0 || Boolean(state.flipH) || Boolean(state.flipV);
}

export function getTransformSummary() {
  const parts = [];
  const rot = Number(state.textureRotation) || 0;
  if (rot !== 0) parts.push(`${rot}°`);
  if (state.flipH) parts.push('FlipH');
  if (state.flipV) parts.push('FlipV');
  return parts.length > 0 ? parts.join(' + ') : '0° Original';
}

export function getTransformSuffix() {
  const parts = [];
  const rot = Number(state.textureRotation) || 0;
  if (rot !== 0) parts.push(`Rot${rot}`);
  if (state.flipH) parts.push('FlipH');
  if (state.flipV) parts.push('FlipV');
  return parts.length > 0 ? `_${parts.join('_')}` : '';
}

export function hasTransformChangedSinceLastExport() {
  const currentSig = `${state.textureRotation || 0}_${Boolean(state.flipH)}_${Boolean(state.flipV)}`;
  return isTransformActive() && currentSig !== state.lastExportedTransformSig;
}

export function syncTransformToolbarUI() {
  const rot = Number(state.textureRotation) || 0;
  [0, 90, 180, 270].forEach((deg) => {
    syncActiveClass(`btnRot${deg}`, rot === deg);
  });
  syncActiveClass('btnFlipH', Boolean(state.flipH));
  syncActiveClass('btnFlipV', Boolean(state.flipV));

  const badge = getEl('rotationStatusBadge');
  if (badge) {
    badge.textContent = getTransformSummary();
    badge.style.display = isTransformActive() ? 'inline-block' : 'none';
  }
  checkRotationNameReminder();
}

export function checkRotationNameReminder() {
  const banner = getEl('rotationNameReminder');
  if (!banner) return;
  if (!isTransformActive() || state.rotationReminderDismissed) {
    banner.style.display = 'none';
    return;
  }
  const summaryEl = getEl('rotationSummaryText');
  if (summaryEl) summaryEl.textContent = getTransformSummary();

  const currentName = (getEl('assetName')?.value || 'CustomDecal').trim();
  const baseName = currentName.replace(/(_Rot(90|180|270)|_FlipH|_FlipV)+$/i, '');
  const suggested = `${baseName}${getTransformSuffix()}`;
  const previewEl = getEl('smartSuggestedNamePreview');
  if (previewEl) previewEl.textContent = suggested;

  banner.style.display = 'block';
}

export function dismissRotationReminder() {
  state.rotationReminderDismissed = true;
  setElDisplay('rotationNameReminder', 'none');
}

export function focusAndHighlightAssetName() {
  const input = getEl('assetName');
  if (!input) return;
  input.focus();
  input.select();
}

export function applySuggestedNameSuffix(suffix) {
  const input = getEl('assetName');
  if (!input) return;
  const cleanSuffix = String(suffix || '').startsWith('_') ? suffix : `_${suffix}`;
  const base = (input.value || 'CustomDecal')
    .trim()
    .replace(/(_Rot(90|180|270)|_FlipH|_FlipV|_Left|_Right|_Up|_Down|_Flipped|_Mirrored)+$/i, '');
  input.value = `${base}${cleanSuffix}`;
  if (typeof window.onAssetNameInput === 'function') {
    window.onAssetNameInput();
  } else if (typeof window.updateConfigJson === 'function') {
    window.updateConfigJson();
  }
  showToast(`Asset renamed to "${input.value}"`);
}

export function applySmartTransformedName() {
  const suffix = getTransformSuffix();
  if (!suffix) {
    showToast('No active rotation or flip transform to append');
    return;
  }
  applySuggestedNameSuffix(suffix);
  dismissRotationReminder();
}

export function autoRenameVariant() {
  applySmartTransformedName();
}

export function setTextureRotation(deg) {
  const prevRot = Number(state.textureRotation) || 0;
  const nextRot = ((Number(deg) || 0) % 360 + 360) % 360;
  state.textureRotation = nextRot;
  state.rotationReminderDismissed = false;

  const wasOdd = prevRot === 90 || prevRot === 270;
  const isOdd = nextRot === 90 || nextRot === 270;
  if (wasOdd !== isOdd && state.appMode === 'decal') {
    const wEl = getEl('dimWidth');
    const hEl = getEl('dimHeight');
    if (wEl && hEl) {
      const oldW = wEl.value;
      wEl.value = hEl.value;
      hEl.value = oldW;
      const wSlider = getEl('dimWidthSlider');
      const hSlider = getEl('dimHeightSlider');
      if (wSlider) wSlider.value = wEl.value;
      if (hSlider) hSlider.value = hEl.value;
    }
  }

  syncTransformToolbarUI();
  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
  if (typeof window.updateConfigJson === 'function') window.updateConfigJson();
}

export function toggleFlipHorizontal() {
  state.flipH = !state.flipH;
  state.rotationReminderDismissed = false;
  syncTransformToolbarUI();
  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
}

export function toggleFlipVertical() {
  state.flipV = !state.flipV;
  state.rotationReminderDismissed = false;
  syncTransformToolbarUI();
  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
}

// ==========================================
// Collapsible Sidebar Sections Management
// ==========================================

function saveCollapsedSectionsState() {
  try {
    const sections = document.querySelectorAll('.collapsible-section[id]');
    const map = {};
    sections.forEach((sec) => {
      map[sec.id] = sec.classList.contains('collapsed');
    });
    localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(map));
  } catch (_) {}
}

export function toggleSection(secId, forceExpand = null) {
  const sec = getEl(secId);
  if (!sec) return;
  const shouldCollapse =
    forceExpand === true
      ? false
      : forceExpand === false
      ? true
      : !sec.classList.contains('collapsed');

  sec.classList.toggle('collapsed', shouldCollapse);
  const header = sec.querySelector('.collapsible-header');
  if (header) {
    header.setAttribute('aria-expanded', shouldCollapse ? 'false' : 'true');
  }
  saveCollapsedSectionsState();
}

export function openAndScrollToSection(secId) {
  const sec = getEl(secId);
  if (!sec) return;
  toggleSection(secId, true);
  setTimeout(() => {
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

export function scrollToNormalMapArea() {
  openAndScrollToSection('secToolsNormal');
}

export function expandAllSections() {
  document.querySelectorAll('.collapsible-section[id]').forEach((sec) => {
    sec.classList.remove('collapsed');
    const header = sec.querySelector('.collapsible-header');
    if (header) header.setAttribute('aria-expanded', 'true');
  });
  saveCollapsedSectionsState();
}

export function collapseAllSections() {
  document.querySelectorAll('.collapsible-section[id]').forEach((sec) => {
    sec.classList.add('collapsed');
    const header = sec.querySelector('.collapsible-header');
    if (header) header.setAttribute('aria-expanded', 'false');
  });
  saveCollapsedSectionsState();
}

export function restoreSidebarSectionsState() {
  try {
    const raw = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;
    Object.entries(saved).forEach(([secId, isCollapsed]) => {
      const sec = getEl(secId);
      if (sec) {
        sec.classList.toggle('collapsed', Boolean(isCollapsed));
        const header = sec.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      }
    });
  } catch (_) {}
}

// ==========================================
// Unsaved Changes Guard Modal Controllers
// ==========================================

let pendingGuardCallback = null;
const unsavedModalCtrl = createModalController('unsavedChangesModal');

export function openUnsavedModal(reasonText, onProceedCallback) {
  if (typeof reasonText === 'function') {
    pendingGuardCallback = reasonText;
  } else {
    pendingGuardCallback = typeof onProceedCallback === 'function' ? onProceedCallback : null;
    if (reasonText) {
      setElText('unsavedModalReasonText', reasonText);
    }
  }
  unsavedModalCtrl.open();
}

export function closeUnsavedModal() {
  unsavedModalCtrl.close();
}

export function closeUnsavedModalOnBackdrop(e) {
  unsavedModalCtrl.closeOnBackdrop(e);
}

export async function confirmGuardSaveAndContinue() {
  const cb = pendingGuardCallback;
  pendingGuardCallback = null;
  closeUnsavedModal();
  if (typeof window.saveCurrentToBrowser === 'function') {
    await window.saveCurrentToBrowser();
  }
  state.hasUnsavedChanges = false;
  if (cb) cb();
}

export function confirmGuardContinueWithoutSaving() {
  const cb = pendingGuardCallback;
  pendingGuardCallback = null;
  state.hasUnsavedChanges = false;
  closeUnsavedModal();
  if (cb) cb();
}

export function cancelGuardAction() {
  pendingGuardCallback = null;
  closeUnsavedModal();
}

// ==========================================
// User Preferences (Save Prompt & Sample Presets)
// ==========================================

export function toggleAlwaysAskWhereToSave(checked) {
  state.askWhereToSave = Boolean(checked);
  try {
    localStorage.setItem(ALWAYS_ASK_SAVE_KEY, String(state.askWhereToSave));
  } catch (_) {}
  const chk1 = getEl('alwaysAskSaveLocation');
  const chk2 = getEl('modalAskSaveCheckbox');
  if (chk1) chk1.checked = state.askWhereToSave;
  if (chk2) chk2.checked = state.askWhereToSave;
}

export function setHideSamplePresets(hide) {
  state.hideSamplePresets = Boolean(hide);
  try {
    localStorage.setItem(HIDE_SAMPLE_PRESETS_KEY, String(state.hideSamplePresets));
  } catch (_) {}

  setElDisplay('samplePresetsContainer', state.hideSamplePresets ? 'none' : 'block');
  setElDisplay('samplePresetsCollapsedBar', state.hideSamplePresets ? 'flex' : 'none');

  const badge = getEl('menuTogglePresetsBadge');
  if (badge) {
    badge.textContent = state.hideSamplePresets ? 'Hidden' : 'Visible';
    badge.className = state.hideSamplePresets
      ? 'pref-badge pref-badge-muted'
      : 'pref-badge pref-badge-active';
  }
}

export function toggleHideSamplePresets(forceState) {
  const next = typeof forceState === 'boolean' ? forceState : !state.hideSamplePresets;
  setHideSamplePresets(next);
}
