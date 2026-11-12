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
  const val = Number(getEl('normalOpacity')?.value ?? 1);
  setElText('normalOpacityVal', val.toFixed(2));
  updateConfigJson();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function onBaseOpacityChange() {
  const val = Number(getEl('baseOpacity')?.value ?? 1);
  setElText('baseOpacityVal', val.toFixed(2));
  updateConfigJson();
  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
}

export function onMetallicOpacityChange() {
  const val = Number(getEl('metallicOpacity')?.value ?? 1);
  setElText('metallicOpacityVal', val.toFixed(2));
  updateConfigJson();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function onLayerMaskChange() {
  let mask = 0;
  if (getEl('maskRoads')?.checked) mask |= 1;
  if (getEl('maskBuildings')?.checked) mask |= 2;
  if (getEl('maskTerrain')?.checked) mask |= 4;
  if (getEl('maskProps')?.checked) mask |= 8;
  setElText('affectLayersVal', mask === 0 ? 'None (0)' : `Mask ${mask}`);
  updateConfigJson();
}

export function onDrawOrderChange() {
  setElText('drawOrderVal', getEl('drawOrder')?.value || '0');
  updateConfigJson();
}

export function onGlobalMaterialChange() {
  setElText('metallicVal', Number(getEl('globalMetallic')?.value || 0).toFixed(2));
  setElText('smoothnessVal', Number(getEl('globalSmoothness')?.value || 0).toFixed(2));
  setElText('emissionVal', Number(getEl('emissionIntensity')?.value || 0).toFixed(1));
  updateConfigJson();
}

export function onUvScaleChange() {
  const x = Number(getEl('uvScaleX')?.value || 1);
  const y = Number(getEl('uvScaleY')?.value || 1);
  setElText('uvScaleXVal', `${x}×`);
  setElText('uvScaleYVal', `${y}×`);
  updateConfigJson();
}

export function setUvScale(x, y) {
  setElValue('uvScaleX', x);
  setElValue('uvScaleY', y);
  onUvScaleChange();
}

export function onNetlaneParamChange() {
  setElText('netWidthVal', `${Number(getEl('netWidth')?.value || 0.3).toFixed(2)}m`);
  setElText('netLengthVal', `${Number(getEl('netLength')?.value || 3.0).toFixed(1)}m`);
  setElText('netRepeatVal', `${getEl('netRepeat')?.value || 1}×`);
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

export function updateSourceImageBadge() {
  const w = Number(getEl('dimWidth')?.value || 1.0);
  const h = Number(getEl('dimHeight')?.value || 1.0);
  const ratio = h > 0 ? w / h : 1.0;
  const fmt = getAspectFormatName(ratio);
  setElText('sourceImageStatusBadge', `${w.toFixed(2)}×${h.toFixed(2)}m (${fmt})`);
  setElText('decalRatioBadge', fmt);
  setElText('floatingAspectBadgeText', `📐 ${w.toFixed(1)}×${h.toFixed(1)}m (${fmt.split(' ')[0]})`);
  setElText('tabScaleBadge', `${w.toFixed(1)}m`);
}

export function updateDecalAspectUI() {
  const locked = Boolean(state.decalAspectLocked);
  syncActiveClass('btnLockDecalAspect', locked);
  setElText('decalAspectLockIcon', locked ? '🔒' : '🔓');
  setElText('decalAspectLockLabel', locked ? 'Locked' : 'Unlocked');
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

export function resetDecalAspectRatio() {
  setDecalAspectLock(false, 1.0);
  applyDecalDimPreset(1.0, 1.0, 0.5);
}

export function onDecalDimSliderChange(axis) {
  const sliderVal = Number(getEl(`dim${axis}Slider`)?.value || 1.0);
  setElValue(`dim${axis}`, sliderVal);
  onDecalDimInputChange(axis, true);
}

export function onDecalDimInputChange(axis, fromSlider = false) {
  let w = Math.max(0.05, Number(getEl('dimWidth')?.value || 1.0));
  let h = Math.max(0.05, Number(getEl('dimHeight')?.value || 1.0));
  const d = Math.max(0.05, Number(getEl('dimDepth')?.value || 0.5));

  if (state.decalAspectLocked && state.decalLockedRatio > 0) {
    if (axis === 'Width') {
      h = Math.max(0.05, Number((w / state.decalLockedRatio).toFixed(2)));
      setElValue('dimHeight', h);
      setElValue('dimHeightSlider', h);
    } else if (axis === 'Height') {
      w = Math.max(0.05, Number((h * state.decalLockedRatio).toFixed(2)));
      setElValue('dimWidth', w);
      setElValue('dimWidthSlider', w);
    }
  }

  if (!fromSlider) {
    setElValue('dimWidthSlider', w);
    setElValue('dimHeightSlider', h);
    setElValue('dimDepthSlider', d);
  }

  updateSourceImageBadge();
  updateConfigJson();
  if (typeof window.renderScalePreview === 'function') window.renderScalePreview();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function applyDecalDimPreset(w, h, d = 0.5) {
  setElValue('dimWidth', w);
  setElValue('dimWidthSlider', w);
  setElValue('dimHeight', h);
  setElValue('dimHeightSlider', h);
  setElValue('dimDepth', d);
  setElValue('dimDepthSlider', d);
  if (state.decalAspectLocked && h > 0) {
    state.decalLockedRatio = w / h;
  }
  updateSourceImageBadge();
  updateConfigJson();
  if (typeof window.renderScalePreview === 'function') window.renderScalePreview();
  if (typeof window.render3DSimulation === 'function') window.render3DSimulation();
}

export function applyPosterPreset(w, h, d = 0.2) {
  setDecalAspectLock(true, h > 0 ? w / h : 1.0);
  applyDecalDimPreset(w, h, d);
}

export function syncDecalDimensionsToImage(img = state.currentImage, silent = false) {
  if (!img) return;
  const ratio = getSourceImageAspectRatio();
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
  state.autoSyncAspect = typeof checked === 'boolean' ? checked : Boolean(getEl('autoSyncGraphicAspect')?.checked);
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

export function buildConfigDataForMode(mode = state.appMode) {
  const uiPriority = Number(getEl('uiPriorityInput')?.value ?? 41);
  const drawOrder = Number(getEl('drawOrder')?.value ?? 0);
  const normalOpacity = Number(getEl('normalOpacity')?.value ?? 1.0);
  const baseOpacity = Number(getEl('baseOpacity')?.value ?? 1.0);
  const metallicOpacity = Number(getEl('metallicOpacity')?.value ?? 1.0);

  let affectMask = 0;
  if (getEl('maskRoads')?.checked !== false) affectMask |= 1;
  if (getEl('maskBuildings')?.checked) affectMask |= 2;
  if (getEl('maskTerrain')?.checked !== false) affectMask |= 4;
  if (getEl('maskProps')?.checked) affectMask |= 8;

  const w = Number(getEl('dimWidth')?.value ?? 1.0);
  const h = Number(getEl('dimHeight')?.value ?? 1.0);
  const d = Number(getEl('dimDepth')?.value ?? 0.5);

  const uvX = Number(getEl('uvScaleX')?.value ?? 1);
  const uvY = Number(getEl('uvScaleY')?.value ?? 1);

  const flt = {
    UiPriority: uiPriority,
    _DrawOrder: drawOrder,
    _NormalOpacity: normalOpacity,
    _MetallicOpacity: metallicOpacity,
    _BaseColorOpacity: baseOpacity,
    colossal_DecalLayerMask: affectMask || 5
  };

  if (getEl('metaDualPriority')?.checked !== false) {
    flt.m_UIPriority = uiPriority;
  }

  const v4 = {
    _MeshSize: { x: w, y: d, z: h, w: 0.0 },
    _TextureArea: { x: 0.0, y: 0.0, z: uvX, w: uvY }
  };

  const jsonObj = {
    Float: flt,
    Vector4: v4
  };

  if (getEl('includeAssetMetadata')?.checked) {
    if (getEl('metaAvailableInEditor')?.checked !== false) {
      jsonObj.Bool = { m_availableInEditor: true };
    }
    jsonObj.asset_metadata = {
      set_name: getAssetSeriesName(),
      author: (getEl('metaAuthor')?.value || 'Creator').trim(),
      version: (getEl('metaVersion')?.value || '1.0.0').trim(),
      category: getAssetCategory() || 'None',
      mode,
      notes: (getEl('metaNotes')?.value || '').trim()
    };
  }

  return jsonObj;
}

export function getJsonFileNameForMode(mode = state.appMode) {
  if (mode === 'surface') return 'surface.json';
  if (mode === 'netlane') return 'netlane.json';
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
  const codeEl = getEl('jsonPreview');
  if (codeEl) codeEl.textContent = formatted;
  return jsonData;
}

export function copyConfigJson() {
  const txt = getEl('jsonPreview')?.textContent || JSON.stringify(updateConfigJson(), null, 2);
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

export function downloadConfigJson() {
  const txt = JSON.stringify(updateConfigJson(), null, 2);
  const blob = new Blob([txt], { type: 'application/json' });
  triggerBrowserDownload(blob, getJsonFileNameForMode(state.appMode));
}

export function floatJsonPreview() {
  const card = getEl('jsonPreviewContainer');
  if (card) card.classList.add('is-floating');
}

export function dockJsonPreview() {
  const card = getEl('jsonPreviewContainer');
  if (card) card.classList.remove('is-floating', 'is-minimized');
}

export function toggleJsonFloat() {
  const card = getEl('jsonPreviewContainer');
  if (!card) return;
  if (card.classList.contains('is-floating')) dockJsonPreview();
  else floatJsonPreview();
}

export function toggleMinimizeJsonFloat() {
  const card = getEl('jsonPreviewContainer');
  if (card) card.classList.toggle('is-minimized');
}

export function resetJsonFloatingPosition() {
  const card = getEl('jsonPreviewContainer');
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
