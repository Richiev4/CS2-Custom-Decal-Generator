// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// EAI JSON Config Builder, Decal Aspect Controls & ZIP/Folder Exporter
// ==========================================

import JSZip from 'jszip';
import {
  state,
  showToast,
  getCanvases,
  getSlot,
  isSlotLoaded,
  getLoadedSlots,
  isTransformActive
} from './state.js';
import {
  getEl,
  setElText,
  setElValue,
  setElChecked,
  setElDisplay,
  syncActiveClass,
  createModalController,
  imageToDataUrl
} from './domUtils.js';

export * from './libraryManager.js';
import { getAssetSeriesName, setAssetSeriesName, saveCurrentToBrowser } from './libraryManager.js';

const saveModalCtrl = createModalController('saveAssetModal');
const emptySlotsModalCtrl = createModalController('emptySlotsModal');
const prepareExportModalCtrl = createModalController('prepareExportModal');

// ==========================================
// Asset Category & EAI Path Generation
// ==========================================

export const CATEGORY_OPTIONS_BY_MODE = {
  decal: [
    'None',
    'RoadMarkings',
    'Ground',
    'Wall',
    'Alphabet',
    'Numbers',
    'Graffiti',
    'Posters',
    'Trash',
    'Stains',
    'Leaf',
    'TireMarks',
    'Misc'
  ],
  surface: [
    'None',
    'Pavement',
    'Asphalt',
    'Concrete',
    'Tiles',
    'Brick',
    'Cobblestone',
    'Grass',
    'Ground',
    'Gravel',
    'Sand',
    'Wood',
    'Misc'
  ],
  netlane: [
    'None',
    'RoadMarkings',
    'BikeLane',
    'BusLane',
    'Crosswalk',
    'Curb',
    'Pavement',
    'Fence',
    'Wall',
    'Misc'
  ]
};

/**
 * Returns the sanitized subfolder name, or '' when set to 'None' / left empty.
 */
export function getAssetCategory() {
  const rawEl = getEl('assetCategory') || getEl('categoryCustom');
  const raw = rawEl ? rawEl.value.trim() : 'RoadMarkings';
  if (!raw || raw.toLowerCase() === 'none') {
    return '';
  }
  return raw;
}

export function setAssetCategory(cat) {
  const trimmed = (cat ?? '').trim();
  const isNone = !trimmed || trimmed.toLowerCase() === 'none';
  const displayVal = isNone ? 'None' : trimmed;

  setElValue('assetCategory', displayVal);
  setElValue('categoryCustom', displayVal);
  setElValue('surfaceCategory', displayVal);
  setElText('categorySubfolderBadge', displayVal);
  setElText('packCategoryTag', displayVal);

  const sel = getEl('categoryQuickPicker');
  if (sel) {
    const match = Array.from(sel.options).find(
      (opt) => opt.value.toLowerCase() === displayVal.toLowerCase()
    );
    if (match) sel.value = match.value;
  }

  updateConfigJson();
}

export function applyCategoryQuickPick(val) {
  const picked = val !== undefined ? val : getEl('categoryQuickPicker')?.value;
  if (!picked) return;
  setAssetCategory(picked);
}

export function updateCategoryQuickPickerForMode(mode = state.appMode) {
  const sel = getEl('categoryQuickPicker');
  if (!sel) return;
  const list = CATEGORY_OPTIONS_BY_MODE[mode] || CATEGORY_OPTIONS_BY_MODE.decal;
  const current = getAssetCategory() || 'None';
  sel.innerHTML =
    `<option value="">-- Quick Pick Category --</option>` +
    list
      .map((c) => {
        const label = c === 'None' ? 'None (No Subfolder)' : c;
        const selected = c.toLowerCase() === current.toLowerCase() ? 'selected' : '';
        return `<option value="${c}" ${selected}>${label}</option>`;
      })
      .join('');
}

// ==========================================
// Material Opacity, Layer Mask, UV & NetLane Sliders
// ==========================================

export function onNormalOpacityChange() {
  const val = Number(getEl('normalOpacitySlider')?.value ?? getEl('normalOpacity')?.value ?? 1);
  setElText('normalOpacityVal', val.toFixed(2));
  updateConfigJson();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function onBaseOpacityChange() {
  const val = Number(getEl('baseOpacitySlider')?.value ?? getEl('baseOpacity')?.value ?? 1);
  setElText('baseOpacityVal', val.toFixed(2));
  updateConfigJson();
  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
}

export function onMetallicOpacityChange() {
  const val = Number(getEl('metallicOpacitySlider')?.value ?? getEl('metallicOpacity')?.value ?? 0);
  setElText('metallicOpacityVal', val.toFixed(2));
  updateConfigJson();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function getLayerMaskValue() {
  let mask = 0;
  if (getEl('layerTerrain')?.checked) mask |= 1;
  if (getEl('layerRoads')?.checked) mask |= 2;
  if (getEl('layerBuildings')?.checked) mask |= 4;
  if (getEl('layerVehicles')?.checked) mask |= 8;
  if (getEl('layerCreatures')?.checked) mask |= 16;
  if (getEl('layerProps')?.checked) mask |= 32;
  return mask;
}

export function onLayerMaskChange() {
  const mask = getLayerMaskValue();
  setElText('layerMaskVal', `Mask: ${mask}`);
  setElText('affectLayersVal', mask === 0 ? 'None (0)' : `Mask ${mask}`);
  updateConfigJson();
}

export function onDrawOrderChange() {
  const val = getEl('drawOrderSlider')?.value ?? getEl('drawOrder')?.value ?? '50';
  setElText('drawOrderVal', String(val));
  updateConfigJson();
}

export function onGlobalMaterialChange() {
  const metal = Number(getEl('globalMetallicSlider')?.value ?? getEl('globalMetallic')?.value ?? 0);
  const smooth = Number(getEl('globalSmoothnessSlider')?.value ?? getEl('globalSmoothness')?.value ?? 0);
  setElText('globalMetallicVal', metal.toFixed(2));
  setElText('globalSmoothnessVal', smooth.toFixed(2));
  setElText('metallicVal', metal.toFixed(2));
  setElText('smoothnessVal', smooth.toFixed(2));
  updateConfigJson();
}

export function onUvScaleChange() {
  const uv = Number(getEl('uvScaleSlider')?.value ?? getEl('uvScaleX')?.value ?? 1);
  setElText('uvScaleVal', uv.toFixed(1));
  setElText('uvScaleXVal', `${uv}×`);
  setElText('uvScaleYVal', `${uv}×`);
  updateConfigJson();
}

export function setUvScale(x, y) {
  const val = Number(x ?? y ?? 1);
  setElValue('uvScaleSlider', val);
  setElValue('uvScaleX', val);
  setElValue('uvScaleY', y !== undefined ? y : val);
  onUvScaleChange();
}

export function onNetlaneParamChange() {
  const netW = Number(getEl('netlaneWidthSlider')?.value ?? getEl('netWidth')?.value ?? 1.0);
  const netL = Number(getEl('netlaneLengthSlider')?.value ?? getEl('netLength')?.value ?? 2.0);
  setElText('netlaneWidthVal', `${netW.toFixed(1)} m`);
  setElText('netlaneLengthVal', `${netL.toFixed(1)} m`);
  setElText('netWidthVal', `${netW.toFixed(2)}m`);
  setElText('netLengthVal', `${netL.toFixed(1)}m`);
  updateConfigJson();
}

// ==========================================
// UI Priority & Modding Metadata Controls
// ==========================================

export function updateUiPrioritySequenceUI() {
  const base = Number(getEl('uiPriorityBase')?.value || 50000);
  const step = Number(getEl('uiPriorityStep')?.value || 10);
  const name = (getEl('assetName')?.value || 'Asset_01').trim();
  const match = name.match(/(\d+)$/);
  const idx = match ? Math.max(1, parseInt(match[1], 10)) : 1;
  const calc = base + idx * step;
  setElText('uiSeqFormulaText', `Base ${base} + (${idx} × ${step}) = ${calc}`);
}

export function applyUiPriorityPreset(val) {
  const clean = Math.max(0, Math.min(99999999, Math.round(Number(val) || 0)));
  setElValue('uiPriorityInput', clean);
  setElValue('uiPrioritySlider', Math.min(100000, clean));
  setElText('uiPriorityVal', String(clean));
  setElText('topMenuPriorityBadge', String(clean));
  updateUiPrioritySequenceUI();
  updateConfigJson();
}

export function onUiPriorityChange() {
  const val = Number(getEl('uiPrioritySlider')?.value || 41);
  applyUiPriorityPreset(val);
}

export function onUiPriorityInputChange(val) {
  applyUiPriorityPreset(val);
}

export function stepUiPriority(delta) {
  const cur = Number(getEl('uiPriorityInput')?.value || 41);
  applyUiPriorityPreset(cur + Number(delta || 0));
}

export function autoCalculateUiPriorityFromName() {
  const base = Number(getEl('uiPriorityBase')?.value || 50000);
  const step = Number(getEl('uiPriorityStep')?.value || 10);
  const name = (getEl('assetName')?.value || 'Asset_01').trim();
  const match = name.match(/(\d+)$/);
  const idx = match ? Math.max(1, parseInt(match[1], 10)) : 1;
  const calc = base + idx * step;
  applyUiPriorityPreset(calc);
  showToast(`Auto-sequenced UiPriority to ${calc} (#${idx})`);
}

export function toggleAssetMetadataFields(checked) {
  const enabled = typeof checked === 'boolean' ? checked : Boolean(getEl('includeAssetMetadata')?.checked);
  setElChecked('includeAssetMetadata', enabled);
  setElDisplay('metadataFieldsWrap', enabled ? 'flex' : 'none');
  setElText('metadataStatusBadge', enabled ? 'Enabled' : 'Optional');
  updateConfigJson();
}

export function autoFillSequenceNotes() {
  const name = (getEl('assetName')?.value || 'CustomDecal').trim();
  const series = getAssetSeriesName();
  const prio = getEl('uiPriorityInput')?.value || '41';
  const note = `Asset "${name}" in pack "${series}" (UiPriority: ${prio}).`;
  setElValue('metaNotes', note);
  updateConfigJson();
}

export function syncMetaSetNameFromSeries() {
  setElValue('metaSetName', getAssetSeriesName());
  updateConfigJson();
}

// ==========================================
// Physical Decal Dimensions & Aspect Ratio Lock
// ==========================================

export function getSourceImageAspectRatio() {
  const img = state.currentImage;
  if (!img) return 1.0;
  const rot = ((Number(state.textureRotation) || 0) % 360 + 360) % 360;
  const isOdd = rot === 90 || rot === 270;
  const rawW = img.naturalWidth || img.width || 1;
  const rawH = img.naturalHeight || img.height || 1;
  const w = isOdd ? rawH : rawW;
  const h = isOdd ? rawW : rawH;
  return h > 0 ? w / h : 1.0;
}

export function getAspectFormatName(ratio = 1.0) {
  const r = Number(ratio) || 1.0;
  if (Math.abs(r - 1.0) < 0.04) return '1:1 Square';
  if (Math.abs(r - 2 / 3) < 0.05) return '2:3 Vertical Poster';
  if (Math.abs(r - 3 / 2) < 0.05) return '3:2 Landscape';
  if (Math.abs(r - 3 / 4) < 0.05) return '3:4 Vertical';
  if (Math.abs(r - 4 / 3) < 0.05) return '4:3 Standard';
  if (Math.abs(r - 16 / 9) < 0.06) return '16:9 Widescreen';
  if (Math.abs(r - 9 / 16) < 0.05) return '9:16 Tall Banner';
  return `${r.toFixed(2)}:1 Custom`;
}

export function updateSourceImageBadge(rawW, rawH, nativeRatio) {
  const img = state.currentImage;
  const srcW = rawW || img?.naturalWidth || img?.width || 0;
  const srcH = rawH || img?.naturalHeight || img?.height || 0;
  const w = Number(getEl('dimWidth')?.value || 2.0);
  const h = Number(getEl('dimHeight')?.value || 2.0);
  const ratio = nativeRatio || (srcH > 0 ? srcW / srcH : (h > 0 ? w / h : 1.0));
  const fmt = getAspectFormatName(ratio);
  if (srcW > 0 && srcH > 0) {
    setElText('sourceImageStatusBadge', `${srcW}×${srcH} (${fmt})`);
  } else {
    setElText('sourceImageStatusBadge', `${w.toFixed(1)}×${h.toFixed(1)}m (${fmt})`);
  }
  setElText('decalRatioBadge', fmt);
  setElText('floatingAspectBadgeText', `📐 ${w.toFixed(1)}×${h.toFixed(1)}m (${fmt.split(' ')[0]})`);
  setElText('tabScaleBadge', `${w.toFixed(1)}m`);
  setElText('decalFootprintSummary', `${w.toFixed(1)}m × ${h.toFixed(1)}m (${(w * h).toFixed(1)} m²)`);
  setElText('aspectLockRatioBadge', `${(h > 0 ? w / h : 1).toFixed(2)} : 1`);
  setElText('decalScaleAspectBadge', `${(h > 0 ? w / h : 1).toFixed(2)} : 1`);
}

export function updateDecalAspectUI() {
  const locked = Boolean(state.decalAspectLocked);
  syncActiveClass('btnLockDecalAspect', locked);
  syncActiveClass('btnToggleAspectLock', locked);
  setElText('decalAspectLockIcon', locked ? '🔒' : '🔓');
  setElText('decalAspectLockLabel', locked ? 'Locked' : 'Unlocked');
  setElText('aspectLockText', locked ? 'Locked Ratio' : 'Lock Ratio');
  updateSourceImageBadge();
}

export function setDecalAspectLock(locked, customRatio = null) {
  state.decalAspectLocked = Boolean(locked);
  if (customRatio && customRatio > 0) {
    state.decalLockedRatio = Number(customRatio);
  } else {
    const w = Number(getEl('dimWidth')?.value || 1.0);
    const h = Number(getEl('dimHeight')?.value || 1.0);
    state.decalLockedRatio = h > 0 ? w / h : 1.0;
  }
  updateDecalAspectUI();
}

export function toggleDecalAspectLock() {
  setDecalAspectLock(!state.decalAspectLocked);
}

export function resetDecalAspectRatio(mode = 'square') {
  if (mode === 'graphic' && state.currentImage) {
    syncDecalDimensionsToImage(state.currentImage, false);
    return;
  }
  const w = Number(getEl('dimWidth')?.value || 2.0);
  setDecalAspectLock(false, 1.0);
  applyDecalDimPreset(w, w, Number(getEl('dimDepth')?.value || 1.0));
}

function normalizeDimAxis(axis) {
  const lower = String(axis || '').toLowerCase();
  if (lower === 'width') return 'Width';
  if (lower === 'height') return 'Height';
  if (lower === 'depth') return 'Depth';
  return axis;
}

export function onDecalDimSliderChange(axis, explicitVal) {
  const normAxis = normalizeDimAxis(axis);
  const sliderVal = Number(explicitVal !== undefined ? explicitVal : (getEl(`dim${normAxis}Slider`)?.value || 1.0));
  setElValue(`dim${normAxis}`, sliderVal);
  onDecalDimInputChange(normAxis, true);
}

export function onDecalDimInputChange(axis, fromSlider = false) {
  const normAxis = normalizeDimAxis(axis);
  let w = Math.max(0.05, Number(getEl('dimWidth')?.value || 1.0));
  let h = Math.max(0.05, Number(getEl('dimHeight')?.value || 1.0));
  const d = Math.max(0.05, Number(getEl('dimDepth')?.value || 0.5));

  if (state.decalAspectLocked && state.decalLockedRatio > 0) {
    if (normAxis === 'Width') {
      h = Math.max(0.05, Number((w / state.decalLockedRatio).toFixed(2)));
      setElValue('dimHeight', h);
      setElValue('dimHeightSlider', Math.min(10, h));
    } else if (normAxis === 'Height') {
      w = Math.max(0.05, Number((h * state.decalLockedRatio).toFixed(2)));
      setElValue('dimWidth', w);
      setElValue('dimWidthSlider', Math.min(10, w));
    }
  }

  if (fromSlider !== true) {
    setElValue('dimWidthSlider', Math.min(10, w));
    setElValue('dimHeightSlider', Math.min(10, h));
    setElValue('dimDepthSlider', Math.min(10, d));
  } else {
    setElValue(`dim${normAxis}Slider`, Math.min(10, normAxis === 'Width' ? w : normAxis === 'Height' ? h : d));
  }

  updateSourceImageBadge();
  updateConfigJson();
  if (typeof window.renderScaleView === 'function') window.renderScaleView();
  if (typeof window.renderScalePreview === 'function') window.renderScalePreview();
  if (typeof window.renderSimulation === 'function') window.renderSimulation();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function applyDecalDimPreset(w, h, d = 0.5) {
  setElValue('dimWidth', w);
  setElValue('dimWidthSlider', Math.min(10, w));
  setElValue('dimHeight', h);
  setElValue('dimHeightSlider', Math.min(10, h));
  setElValue('dimDepth', d);
  setElValue('dimDepthSlider', Math.min(10, d));
  if (state.decalAspectLocked && h > 0) {
    state.decalLockedRatio = w / h;
  }
  updateSourceImageBadge();
  updateConfigJson();
  if (typeof window.renderScaleView === 'function') window.renderScaleView();
  if (typeof window.renderScalePreview === 'function') window.renderScalePreview();
  if (typeof window.renderSimulation === 'function') window.renderSimulation();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function applyPosterPreset(labelOrW, wOrH, hOrD = 0.2) {
  let w = 1.2;
  let h = 1.8;
  let d = 0.5;
  if (typeof labelOrW === 'string') {
    w = Number(wOrH) || 1.2;
    h = Number(hOrD) || 1.8;
  } else {
    w = Number(labelOrW) || 1.2;
    h = Number(wOrH) || 1.8;
    d = Number(hOrD) || 0.2;
  }
  setDecalAspectLock(true, h > 0 ? w / h : 1.0);
  applyDecalDimPreset(w, h, d);
  if (typeof labelOrW === 'string') {
    showToast(`Applied ${labelOrW} dimensions (${w}m × ${h}m)`);
  }
}

export function syncDecalDimensionsToImage(imgOrW = state.currentImage, silentOrH = false, ratioArg = null) {
  let ratio = 1.0;
  let silent = false;
  if (typeof imgOrW === 'number' && typeof silentOrH === 'number') {
    ratio = ratioArg || (silentOrH > 0 ? imgOrW / silentOrH : 1.0);
    silent = true;
  } else {
    if (!imgOrW) return;
    ratio = getSourceImageAspectRatio();
    silent = Boolean(silentOrH);
  }
  const baseSize = Math.max(0.5, Number(getEl('dimHeight')?.value || 2.0));
  let newW = baseSize;
  let newH = baseSize;
  if (ratio >= 1.0) {
    newW = Number((baseSize * ratio).toFixed(2));
    newH = Number(baseSize.toFixed(2));
  } else {
    newW = Number(baseSize.toFixed(2));
    newH = Number((baseSize / ratio).toFixed(2));
  }
  setDecalAspectLock(true, ratio);
  applyDecalDimPreset(newW, newH, Number(getEl('dimDepth')?.value || 0.5));
  if (!silent) showToast(`Synced decal mesh to graphic ratio (${newW}m × ${newH}m)`);
}

export function applySyncGraphicRatio() {
  syncDecalDimensionsToImage(state.currentImage, false);
}

export function toggleAutoSyncAspect(checked) {
  state.autoSyncAspect = typeof checked === 'boolean' ? checked : Boolean(getEl('autoSyncAspectOnImport')?.checked ?? getEl('autoSyncGraphicAspect')?.checked);
  if (state.autoSyncAspect && state.currentImage) {
    syncDecalDimensionsToImage(state.currentImage, true);
  }
}

export function toggleMinimizeScaleCard() {
  const card = getEl('decalDimensionsCard');
  if (card) card.classList.toggle('minimized');
}

export function toggleFloatingScaleCard(forceFloat = null) {
  const card = getEl('decalDimensionsCard');
  if (!card) return;
  const shouldFloat = typeof forceFloat === 'boolean' ? forceFloat : !card.classList.contains('is-floating');
  card.classList.toggle('is-floating', shouldFloat);
}

// ==========================================
// JSON Config Generation & Floating JSON Card
// ==========================================

let activeNetlaneJsonTab = 'decal';

export function getJsonSchemaMode() {
  const raw = (getEl('jsonSchemaFormat')?.value || state.jsonSchemaMode || 'standard').toLowerCase();
  return raw === 'enhanced' || raw === 'extended' ? 'enhanced' : 'standard';
}

export function setJsonSchemaMode(mode = 'standard') {
  const normalized = String(mode).toLowerCase() === 'enhanced' || String(mode).toLowerCase() === 'extended' ? 'enhanced' : 'standard';
  state.jsonSchemaMode = normalized;
  const sel = getEl('jsonSchemaFormat');
  if (sel) sel.value = normalized;
  updateConfigJson();
}

export function setNetlaneJsonPreviewTab(tab = 'decal') {
  activeNetlaneJsonTab = tab || 'decal';
  ['decal', 'surface', 'netlane'].forEach((t) => {
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    const btn = getEl(`tabNetlane${cap}`);
    if (btn) {
      const isActive = t === activeNetlaneJsonTab;
      btn.style.borderColor = isActive ? 'var(--primary)' : 'var(--border-color)';
      btn.style.background = isActive ? 'rgba(0, 168, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)';
      btn.style.color = isActive ? 'var(--primary)' : 'var(--text-dim)';
      btn.style.fontWeight = isActive ? '600' : '400';
    }
  });
  updateConfigJson();
}

export function buildConfigDataForMode(mode = state.appMode) {
  const schemaMode = getJsonSchemaMode();
  state.jsonSchemaMode = schemaMode;

  const uiPriority = Number(getEl('uiPriorityInput')?.value ?? 41);
  const drawOrder = Number(getEl('drawOrderSlider')?.value ?? getEl('drawOrder')?.value ?? 50);
  const normalOpacity = Number(getEl('normalOpacitySlider')?.value ?? getEl('normalOpacity')?.value ?? 1.0);
  const baseOpacity = Number(getEl('baseOpacitySlider')?.value ?? getEl('baseOpacity')?.value ?? 1.0);
  const metallicOpacity = Number(getEl('metallicOpacitySlider')?.value ?? getEl('metallicOpacity')?.value ?? 0.0);

  const affectMask = getLayerMaskValue();

  const w = Number(getEl('dimWidth')?.value ?? 2.0);
  const h = Number(getEl('dimHeight')?.value ?? 2.0);
  const d = Number(getEl('dimDepth')?.value ?? 1.0);

  const uvScale = Number(getEl('uvScaleSlider')?.value ?? getEl('uvScaleX')?.value ?? 1.0);
  const netW = Number(getEl('netlaneWidthSlider')?.value ?? getEl('netWidth')?.value ?? 1.0);
  const netL = Number(getEl('netlaneLengthSlider')?.value ?? getEl('netLength')?.value ?? 2.0);

  const globalMetallic = Number(getEl('globalMetallicSlider')?.value ?? getEl('globalMetallic')?.value ?? 0.0);
  const globalSmoothness = Number(getEl('globalSmoothnessSlider')?.value ?? getEl('globalSmoothness')?.value ?? 0.0);

  const effectiveMode = mode === 'netlane' && activeNetlaneJsonTab !== 'netlane' ? activeNetlaneJsonTab : mode;

  const flt = {
    UiPriority: uiPriority,
    _DrawOrder: drawOrder
  };

  if (schemaMode === 'enhanced' && getEl('metaDualPriority')?.checked !== false) {
    flt.m_UIPriority = uiPriority;
  }

  if (effectiveMode === 'decal') {
    flt._NormalOpacity = normalOpacity;
    flt._BaseColorOpacity = baseOpacity;
    flt._MetallicOpacity = metallicOpacity;
    flt.colossal_DecalLayerMask = affectMask || 7;
  } else if (effectiveMode === 'surface') {
    flt.uvScale = uvScale;
    if (schemaMode === 'enhanced') {
      flt._NormalOpacity = normalOpacity;
      flt._BaseColorOpacity = baseOpacity;
      flt._MetallicOpacity = metallicOpacity;
    }
  } else {
    flt._NormalOpacity = normalOpacity;
    flt._BaseColorOpacity = baseOpacity;
    flt._MetallicOpacity = metallicOpacity;
  }

  if (schemaMode === 'enhanced') {
    flt._Metallic = globalMetallic;
    flt._Smoothness = globalSmoothness;
  }

  const v4 = {};
  if (effectiveMode === 'decal') {
    v4._MeshSize = { x: w, y: d, z: h, w: 0.0 };
    if (schemaMode === 'enhanced') {
      v4._TextureArea = { x: 0.0, y: 0.0, z: uvScale, w: uvScale };
    }
  } else if (effectiveMode === 'surface') {
    v4._TextureArea = { x: 0.0, y: 0.0, z: uvScale, w: uvScale };
    if (schemaMode === 'enhanced') {
      v4._MeshSize = { x: w, y: d, z: h, w: 0.0 };
    }
  } else {
    v4._MeshSize = { x: netW, y: 0.5, z: netL, w: 0.0 };
    if (schemaMode === 'enhanced') {
      v4._TextureArea = { x: 0.0, y: 0.0, z: 1.0, w: 1.0 };
    }
  }

  const jsonObj = {
    Float: flt,
    Vector4: v4
  };

  const includeMetadata = Boolean(getEl('includeAssetMetadata')?.checked);
  if (schemaMode === 'enhanced' && getEl('metaAvailableInEditor')?.checked !== false) {
    jsonObj.Bool = { m_availableInEditor: true };
  }

  if (includeMetadata) {
    if (!jsonObj.Bool && getEl('metaAvailableInEditor')?.checked !== false) {
      jsonObj.Bool = { m_availableInEditor: true };
    }
    const metaObj = {
      set_name: getAssetSeriesName() || 'Standalone',
      author: (getEl('metaAuthor')?.value || 'Creator').trim(),
      version: (getEl('metaVersion')?.value || '1.0.0').trim(),
      category: getAssetCategory() || 'None',
      mode,
      schema: schemaMode,
      notes: (getEl('metaNotes')?.value || '').trim()
    };

    if (Array.isArray(state.customMetadataEntries)) {
      state.customMetadataEntries.forEach((entry) => {
        const k = String(entry?.key || '').trim();
        if (!k) return;
        metaObj[k] = String(entry?.value ?? '');
      });
    }

    jsonObj.asset_metadata = metaObj;
  }

  return jsonObj;
}

export function getJsonFileNameForMode(mode = state.appMode) {
  if (mode === 'surface') return 'surface.json';
  if (mode === 'netlane') {
    if (activeNetlaneJsonTab === 'decal') return 'decal.json';
    if (activeNetlaneJsonTab === 'surface') return 'surface.json';
    return 'netlane.json';
  }
  return 'decal.json';
}

export function updateConfigJson() {
  const mode = state.appMode || 'decal';
  const assetName = (getEl('assetName')?.value || 'CustomDecal').trim() || 'CustomDecal';
  const cat = getAssetCategory();
  const displayCat = cat || 'None';
  const jsonFileName = getJsonFileNameForMode(mode);

  setElText('categorySubfolderBadge', displayCat);
  setElText('packCategoryTag', displayCat);

  const folderPrefix =
    mode === 'surface' ? 'CustomSurfaces' : mode === 'netlane' ? 'CustomNetLanes' : 'CustomDecals';
  const relPath = cat
    ? `${folderPrefix}/${cat}/${assetName}/${jsonFileName}`
    : `${folderPrefix}/${assetName}/${jsonFileName}`;
  setElText('decalPathPreview', relPath);
  setElText('jsonFilenameLabel', jsonFileName);

  const jsonData = buildConfigDataForMode(mode);
  const formatted = JSON.stringify(jsonData, null, 2);
  const codeTextEl = getEl('jsonCodeText');
  if (codeTextEl) {
    codeTextEl.textContent = formatted;
  } else {
    const codeEl = getEl('jsonPreview');
    if (codeEl) codeEl.textContent = formatted;
  }

  if (typeof window.refreshAssetChecklistModal === 'function') {
    window.refreshAssetChecklistModal();
  }
  return jsonData;
}

export function copyConfigJson() {
  const txt =
    getEl('jsonCodeText')?.textContent ||
    JSON.stringify(updateConfigJson(), null, 2);
  navigator.clipboard?.writeText(txt);
  showToast('Copied JSON configuration to clipboard');
}

export function copyDecalPath() {
  const path = getEl('decalPathPreview')?.textContent || '';
  if (path) {
    navigator.clipboard?.writeText(path);
    showToast(`Copied folder path: ${path}`);
  }
}

export function downloadConfigJson(overrideMode = null) {
  const targetMode = typeof overrideMode === 'string' ? overrideMode : state.appMode;
  const txt = JSON.stringify(buildConfigDataForMode(targetMode), null, 2);
  const fileName = typeof overrideMode === 'string'
    ? (overrideMode === 'surface' ? 'surface.json' : overrideMode === 'netlane' ? 'netlane.json' : 'decal.json')
    : getJsonFileNameForMode(state.appMode);
  const blob = new Blob([txt], { type: 'application/json' });
  triggerBrowserDownload(blob, fileName);
}

export function floatJsonPreview() {
  const card = getEl('jsonFloatingCard') || getEl('jsonPreviewContainer');
  if (card) card.classList.add('is-floating');
}

export function dockJsonPreview() {
  const card = getEl('jsonFloatingCard') || getEl('jsonPreviewContainer');
  if (card) card.classList.remove('is-floating', 'is-minimized');
}

export function toggleJsonFloat() {
  const card = getEl('jsonFloatingCard') || getEl('jsonPreviewContainer');
  if (!card) return;
  if (card.classList.contains('is-floating')) dockJsonPreview();
  else floatJsonPreview();
}

export function toggleMinimizeJsonFloat() {
  const card = getEl('jsonFloatingCard') || getEl('jsonPreviewContainer');
  if (card) card.classList.toggle('is-minimized');
}

export function resetJsonFloatingPosition() {
  const card = getEl('jsonFloatingCard') || getEl('jsonPreviewContainer');
  if (!card) return;
  card.style.left = '';
  card.style.top = '';
}

// ==========================================
// Texture Maps, ZIP Package & Folder Export
// ==========================================

function triggerBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    if (!canvas) {
      resolve(new Blob([], { type: 'image/png' }));
      return;
    }
    canvas.toBlob((b) => resolve(b || new Blob([], { type: 'image/png' })), 'image/png');
  });
}

export async function saveFileWithPicker(blob, suggestedName) {
  triggerBrowserDownload(blob, suggestedName);
  return true;
}

export async function downloadSingleMap(type) {
  const { canvasBase, canvasNormal, canvasMask, canvasIcon } = getCanvases();
  const mapInfo = {
    base: { canvas: canvasBase, name: '_BaseColorMap.png' },
    normal: { canvas: canvasNormal, name: '_NormalMap.png' },
    mask: { canvas: canvasMask, name: '_MaskMap.png' },
    icon: { canvas: canvasIcon, name: 'icon.png' }
  }[type];

  if (!mapInfo || !mapInfo.canvas) return;
  const blob = await canvasToBlob(mapInfo.canvas);
  triggerBrowserDownload(blob, mapInfo.name);
  showToast(`Downloaded ${mapInfo.name}`);
}

export async function downloadAllMaps() {
  await downloadSingleMap('base');
  await downloadSingleMap('normal');
  await downloadSingleMap('mask');
  await downloadSingleMap('icon');
  downloadConfigJson();
}

/**
 * Builds the comprehensive README.txt content detailing the exported asset parameters,
 * included PBR texture maps, and exact Cities: Skylines II folder placement instructions.
 */
export function buildExportReadmeText({
  mode = state.appMode || 'decal',
  assetName = (getEl('assetName')?.value || 'CustomDecal').trim() || 'CustomDecal',
  category = getAssetCategory(),
  folderPrefix = 'CustomDecals',
  jsonFileName = 'decal.json'
} = {}) {
  const seriesName = getAssetSeriesName() || 'None';
  const displayCategory = category || 'None (Root Mode Folder)';
  const resolution = Number(state.currentResolution) || 1024;
  const uiPriority = Number(getEl('uiPriorityInput')?.value ?? 41);
  const drawOrder = Number(getEl('drawOrder')?.value ?? 0);
  const author = (getEl('metaAuthor')?.value || 'Creator').trim();
  const version = (getEl('metaVersion')?.value || '1.0.0').trim();
  const notes = (getEl('metaNotes')?.value || '').trim();

  const winSubPath = category
    ? `${folderPrefix}\\${category}\\${assetName}`
    : `${folderPrefix}\\${assetName}`;
  const zipSubPath = category
    ? `${folderPrefix}/${category}/${assetName}`
    : `${folderPrefix}/${assetName}`;

  const eaiBaseWinPath =
    '%LocalAppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter';
  const fullWinTargetDir = `${eaiBaseWinPath}\\${winSubPath}\\`;
  const fullExplicitWinPath = `C:\\Users\\<YourUsername>\\AppData\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\${winSubPath}\\`;

  let geometrySummary = '';
  if (mode === 'surface') {
    const uvX = Number(getEl('uvScaleX')?.value || 1);
    const uvY = Number(getEl('uvScaleY')?.value || 1);
    geometrySummary = `UV Tiling Scale   : ${uvX}x by ${uvY}x`;
  } else if (mode === 'netlane') {
    const netW = Number(getEl('netWidth')?.value || 0.3).toFixed(2);
    const netL = Number(getEl('netLength')?.value || 3.0).toFixed(1);
    const netR = getEl('netRepeat')?.value || 1;
    geometrySummary = `Spline Dimensions : Width ${netW}m | Length ${netL}m | Repeat ${netR}x`;
  } else {
    const w = Number(getEl('dimWidth')?.value || 1.0).toFixed(2);
    const h = Number(getEl('dimHeight')?.value || 1.0).toFixed(2);
    const d = Number(getEl('dimDepth')?.value || 0.5).toFixed(2);
    geometrySummary = `Decal Box Size    : ${w}m (Width) x ${h}m (Length) x ${d}m (Projection Depth)`;
  }

  const modeLabel =
    mode === 'surface' ? 'Surface (Terrain / Ground Paint)' : mode === 'netlane' ? 'Net Lane (Spline Marking)' : 'Decal (Projected 3D Decal)';

  return [
    '================================================================================',
    ` CITIES: SKYLINES II - CUSTOM ASSET PACKAGE (${assetName})`,
    ' Generated by Cities: Skylines 2 Custom Asset Generator (ExtraAssetsImporter)',
    '================================================================================',
    '',
    '1. ASSET DETAILS & CONFIGURATION',
    '--------------------------------------------------------------------------------',
    `Asset Name        : ${assetName}`,
    `Asset Mode        : ${modeLabel}`,
    `Category Folder   : ${displayCategory}`,
    `Pack / Series     : ${seriesName}`,
    `Author / Version  : ${author} (v${version})`,
    `Texture Resolution: ${resolution} x ${resolution} px`,
    geometrySummary,
    `In-Game Priority  : ${uiPriority} (UiPriority / m_UIPriority)`,
    `Render Draw Order : ${drawOrder}`,
    notes ? `Notes             : ${notes}` : null,
    `Exported On       : ${new Date().toISOString()}`,
    '',
    '2. WHERE TO PLACE THESE FILES (INSTALLATION GUIDE)',
    '--------------------------------------------------------------------------------',
    'This package is pre-structured for the Cities: Skylines II "ExtraAssetsImporter"',
    '(EAI) mod. To install:',
    '',
    'OPTION A - Direct Extraction (Recommended):',
    '  1. Press Win + R on your keyboard, paste the following path, and press Enter:',
    `     ${eaiBaseWinPath}`,
    '  2. Extract the "' + folderPrefix + '" folder from this .zip archive directly into',
    '     that ExtraAssetsImporter directory.',
    '',
    'OPTION B - Manual Folder Placement:',
    '  Place the "' + assetName + '" asset folder at this exact path on your computer:',
    `  ${fullWinTargetDir}`,
    '',
    '  (Full expanded Windows path reference):',
    `  ${fullExplicitWinPath}`,
    '',
    '3. INCLUDED FILES IN THIS PACKAGE',
    '--------------------------------------------------------------------------------',
    `  * ${zipSubPath}/${jsonFileName}`,
    '      Shader parameters, physical bounding dimensions, draw order, and UI priority.',
    `  * ${zipSubPath}/_BaseColorMap.png`,
    '      RGBA Albedo / Base Color texture map.',
    `  * ${zipSubPath}/_NormalMap.png`,
    '      OpenGL (+X, +Y) tangent-space normal map for 3D surface relief.',
    `  * ${zipSubPath}/_MaskMap.png`,
    '      Channel-packed PBR Mask Map (Red = Metallic, Alpha = Smoothness/Gloss).',
    `  * ${zipSubPath}/icon.png`,
    '      256 x 256 px in-game toolbar UI thumbnail.',
    '  * README.txt',
    '      This installation and asset specification guide.',
    '',
    '4. IN-GAME REQUIREMENTS & TROUBLESHOOTING',
    '--------------------------------------------------------------------------------',
    '  * Ensure "ExtraAssetsImporter" (EAI) is subscribed and enabled in Paradox Mods.',
    '  * Do NOT rename _BaseColorMap.png, _NormalMap.png, _MaskMap.png, or icon.png;',
    '    ExtraAssetsImporter requires these exact filenames inside the asset folder.',
    `  * Look for "${assetName}" in-game under the "${folderPrefix}"${category ? ` -> "${category}"` : ''} category tab.`,
    '================================================================================',
    ''
  ]
    .filter((line) => line !== null)
    .join('\r\n');
}

export async function exportZipPackage() {
  const { canvasBase, canvasNormal, canvasMask, canvasIcon } = getCanvases();
  const mode = state.appMode || 'decal';
  const assetName = (getEl('assetName')?.value || 'CustomDecal').trim() || 'CustomDecal';
  const cat = getAssetCategory();
  const folderPrefix =
    mode === 'surface' ? 'CustomSurfaces' : mode === 'netlane' ? 'CustomNetLanes' : 'CustomDecals';
  const dirPath = cat ? `${folderPrefix}/${cat}/${assetName}` : `${folderPrefix}/${assetName}`;
  const jsonFileName = getJsonFileNameForMode(mode);

  const zip = new JSZip();
  const folder = zip.folder(dirPath);

  const [baseBlob, normBlob, maskBlob, iconBlob] = await Promise.all([
    canvasToBlob(canvasBase),
    canvasToBlob(canvasNormal),
    canvasToBlob(canvasMask),
    canvasToBlob(canvasIcon)
  ]);

  const configJsonText = JSON.stringify(updateConfigJson(), null, 2);
  const readmeText = buildExportReadmeText({
    mode,
    assetName,
    category: cat,
    folderPrefix,
    jsonFileName
  });

  // Include README.txt once at the ZIP root for immediate visibility
  zip.file('README.txt', readmeText);

  folder.file('_BaseColorMap.png', baseBlob);
  folder.file('_NormalMap.png', normBlob);
  folder.file('_MaskMap.png', maskBlob);
  folder.file('icon.png', iconBlob);
  folder.file(jsonFileName, configJsonText);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBrowserDownload(zipBlob, `${assetName}_CS2_${mode}.zip`);

  state.lastExportedTransformSig = `${state.textureRotation || 0}_${Boolean(state.flipH)}_${Boolean(state.flipV)}`;
  state.lastExportedAssetName = assetName;
  state.hasUnsavedChanges = false;
  showToast(`Exported ${assetName}_CS2_${mode}.zip`);
}

export async function exportCompleteSetZip() {
  const loadedModes = getLoadedSlots();
  if (loadedModes.length === 0) {
    openEmptySlotsModal();
    return;
  }
  await exportZipPackage();
}

export async function exportAssetDirectToFolder() {
  await exportZipPackage();
}

// ==========================================
// Empty Slots & Prepare Export Modals
// ==========================================

export function areAllSlotsEmpty() {
  return getLoadedSlots().length === 0;
}

export function isCurrentSlotEmpty() {
  return !isSlotLoaded(state.appMode);
}

export function openEmptySlotsModal() {
  // Synchronize status indicators for all 3-in-1 slots before displaying the alert modal
  ['decal', 'surface', 'netlane'].forEach((mode) => {
    const slot = getSlot(mode);
    const loaded = isSlotLoaded(mode);
    setElText(
      `emptyModalSlotName_${mode}`,
      loaded ? slot?.assetName || 'Loaded' : '(No graphic loaded)'
    );
    const badge = getEl(`emptyModalSlotBadge_${mode}`);
    if (badge) {
      badge.textContent = loaded ? '✓ Loaded' : 'Empty';
      badge.className = loaded ? 'empty-modal-slot-badge loaded' : 'empty-modal-slot-badge empty';
    }
  });
  emptySlotsModalCtrl.open();
}

export function closeEmptySlotsModal() {
  emptySlotsModalCtrl.close();
}

export function closeEmptySlotsModalOnBackdrop(e) {
  emptySlotsModalCtrl.closeOnBackdrop(e);
}

export function openPrepareExportModal() {
  prepareExportModalCtrl.open();
}

export function closePrepareExportModal() {
  prepareExportModalCtrl.close();
}

export function closePrepareExportModalOnBackdrop(e) {
  prepareExportModalCtrl.closeOnBackdrop(e);
}

export function updatePrepareExportProgress(stepText, pct = 100) {
  setElText('prepareExportStepText', stepText);
  const bar = getEl('prepareExportProgressBar');
  if (bar) bar.style.width = `${pct}%`;
}

export function triggerUploadFromEmptyModal() {
  closeEmptySlotsModal();
  getEl('fileInput')?.click();
}

export function loadSampleFromEmptyModal(sampleType = 'arrow') {
  closeEmptySlotsModal();
  if (typeof window.loadSample === 'function') window.loadSample(sampleType);
}

export function switchToSlotFromEmptyModal(mode) {
  closeEmptySlotsModal();
  if (typeof window.setMode === 'function') window.setMode(mode);
}

// ==========================================
// Project File (.cs2asset) Save & Load
// ==========================================

export function serializeCurrentProject() {
  return {
    version: '2.0',
    savedAt: new Date().toISOString(),
    appMode: state.appMode || 'decal',
    assetName: (getEl('assetName')?.value || 'CustomDecal').trim(),
    assetSeries: getAssetSeriesName(),
    category: getAssetCategory(),
    resolution: Number(state.currentResolution) || 1024,
    aspectHandling: getEl('aspectHandling')?.value || 'contain',
    textureRotation: Number(state.textureRotation) || 0,
    flipH: Boolean(state.flipH),
    flipV: Boolean(state.flipV),
    uiPriority: Number(getEl('uiPriorityInput')?.value ?? 41),
    drawOrder: Number(getEl('drawOrder')?.value ?? 0),
    normalOpacity: Number(getEl('normalOpacity')?.value ?? 1.0),
    baseOpacity: Number(getEl('baseOpacity')?.value ?? 1.0),
    metallicOpacity: Number(getEl('metallicOpacity')?.value ?? 1.0),
    dimWidth: Number(getEl('dimWidth')?.value ?? 1.0),
    dimHeight: Number(getEl('dimHeight')?.value ?? 1.0),
    dimDepth: Number(getEl('dimDepth')?.value ?? 0.5),
    bumpIntensity: Number(getEl('bumpIntensity')?.value ?? 1.0),
    blurRadius: Number(getEl('blurRadius')?.value ?? 0),
    metallic: Number(getEl('metallic')?.value ?? 0),
    smoothness: Number(getEl('smoothness')?.value ?? 0),
    sourceImageDataUrl: state.currentImage ? imageToDataUrl(state.currentImage) : null
  };
}

export function deserializeAndLoadProject(proj) {
  if (!proj || typeof proj !== 'object') return;
  if (proj.appMode && typeof window.setMode === 'function') {
    window.setMode(proj.appMode);
  }
  if (proj.assetName) setElValue('assetName', proj.assetName);
  if (proj.assetSeries) setAssetSeriesName(proj.assetSeries);
  if (proj.category !== undefined) setAssetCategory(proj.category);
  if (proj.uiPriority !== undefined) applyUiPriorityPreset(proj.uiPriority);
  if (proj.dimWidth !== undefined) {
    applyDecalDimPreset(
      Number(proj.dimWidth) || 1.0,
      Number(proj.dimHeight) || 1.0,
      Number(proj.dimDepth) || 0.5
    );
  }
  if (proj.bumpIntensity !== undefined) setElValue('bumpIntensity', proj.bumpIntensity);
  if (proj.blurRadius !== undefined) setElValue('blurRadius', proj.blurRadius);
  if (proj.metallic !== undefined) setElValue('metallic', proj.metallic);
  if (proj.smoothness !== undefined) setElValue('smoothness', proj.smoothness);

  if (proj.sourceImageDataUrl) {
    const img = new Image();
    img.onload = () => {
      state.currentImage = img;
      state.isCustomImageLoaded = true;
      if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
      updateConfigJson();
    };
    img.src = proj.sourceImageDataUrl;
  } else {
    if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
    updateConfigJson();
  }
}

export function saveProjectToFile() {
  const proj = serializeCurrentProject();
  const name = (proj.assetName || 'CustomDecal').replace(/[^a-zA-Z0-9_-]/g, '_');
  const blob = new Blob([JSON.stringify(proj, null, 2)], { type: 'application/json' });
  triggerBrowserDownload(blob, `${name}.cs2asset`);
  state.hasUnsavedChanges = false;
  showToast(`Saved project file "${name}.cs2asset"`);
}

export function handleProjectFileLoad(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      deserializeAndLoadProject(parsed);
      showToast(`Loaded project "${file.name}"`);
    } catch (_) {
      showToast('Invalid .cs2asset project file');
    }
  };
  reader.readAsText(file);
  if (event?.target) event.target.value = '';
}

export function openSaveModal() {
  // Synchronize active asset name, target game path, and user save-prompt preference
  const mode = state.appMode || 'decal';
  const assetName = (getEl('assetName')?.value || 'CustomDecal').trim() || 'CustomDecal';
  const cat = getAssetCategory();
  const folderPrefix =
    mode === 'surface' ? 'CustomSurfaces' : mode === 'netlane' ? 'CustomNetLanes' : 'CustomDecals';
  const relSubPath = cat ? `${folderPrefix}\\${cat}\\${assetName}` : `${folderPrefix}\\${assetName}`;

  setElText('saveModalAssetName', assetName);
  setElText(
    'saveModalTargetPath',
    `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\${relSubPath}`
  );
  setElChecked('chkAlwaysAskWhereToSave', Boolean(state.askWhereToSave));

  saveModalCtrl.open();
}

export function closeSaveModal() {
  saveModalCtrl.close();
}

export function closeSaveModalOnBackdrop(e) {
  saveModalCtrl.closeOnBackdrop(e);
}

export function saveProjectWithPrompt() {
  closeSaveModal();
  saveProjectToFile();
}

export function exportZipWithPrompt() {
  closeSaveModal();
  exportZipPackage();
}

export function exportDirectToFolderWithPrompt() {
  closeSaveModal();
  exportAssetDirectToFolder();
}

export async function saveToLibraryWithNotice() {
  closeSaveModal();
  await saveCurrentToBrowser();
}
