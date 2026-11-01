// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// Main Orchestration & Entry Point
// ==========================================

import {
  state,
  getCanvases,
  showToast,
  drawImageSquare,
  isTransformActive,
  getTransformSummary,
  hasTransformChangedSinceLastExport,
  checkRotationNameReminder,
  dismissRotationReminder,
  focusAndHighlightAssetName,
  autoRenameVariant,
  setTextureRotation,
  toggleFlipHorizontal,
  toggleFlipVertical,
  toggleSection,
  expandAllSections,
  collapseAllSections,
  restoreSidebarSectionsState,
  openUnsavedModal,
  closeUnsavedModal,
  closeUnsavedModalOnBackdrop,
  confirmGuardSaveAndContinue,
  confirmGuardContinueWithoutSaving,
  cancelGuardAction
} from './state.js';

import {
  FIELD_HELP,
  showFieldHelp,
  toggleFieldHelp,
  scheduleHideFieldHelp,
  clearPopoverHideTimer,
  hideFieldHelp,
  openPopoverTopicInGuide,
  openHelpModal,
  closeHelpModal,
  closeHelpModalOnBackdrop,
  setHelpCategory,
  filterHelpTopics
} from './fieldHelp.js';

import {
  handleCustomNormalSelect,
  clearCustomNormal,
  updateCustomNormalUI,
  onBumpChange,
  onBlurChange,
  generateNormalMap
} from './normalMap.js';

import {
  handleCustomMaskSelect,
  clearCustomMask,
  updateCustomMaskUI,
  onMetalChange,
  onSmoothChange,
  onMaskVariationChange,
  generateMaskMap
} from './maskMap.js';

import {
  populateFontDropdowns,
  loadGoogleFont,
  toggleGoogleFontInput,
  addCustomGoogleFontFromInput,
  switchBadgeTab,
  setCreatorBadgeMode,
  onBadge1TextChange,
  clearCreatorText,
  setBadge1TextPreset,
  onBadge1FontChange,
  toggleBadge1Bold,
  toggleBadge1Italic,
  toggleBadge1LetterSpacing,
  onBadge1PtSizeChange,
  updateCreatorGradPreview,
  setCreatorColorMode,
  setCreatorColorTheme,
  setCreatorGradDirection,
  onCreatorCustomColorInput,
  onCreatorSolidColorInput,
  applyCreatorGradPreset,
  handleDesignerLogoSelect,
  clearDesignerLogo,
  applyPresetLogo,
  onBadge1PaddingChange,
  onBadge1InnerPaddingChange,
  onSeriesFontChange,
  toggleSeriesBold,
  toggleSeriesItalic,
  onSeriesPtSizeChange,
  setSeriesBadgeMode,
  applySeriesPreset,
  setSeriesTextPreset,
  onSeriesTextChange,
  clearSeriesText,
  setSeriesColorTheme,
  updateSeriesGradPreview,
  setSeriesColorMode,
  setSeriesGradDirection,
  onSeriesCustomColorInput,
  onSeriesSolidColorInput,
  applySeriesGradPreset,
  handleSeriesLogoSelect,
  clearSeriesLogo,
  onBadge2PaddingChange,
  onBadge2InnerPaddingChange,
  onIconBadgeScaleChange,
  onIconBadgeOpacityChange,
  saveIconBadgeDefaults,
  loadIconBadgeDefaults,
  resetIconBadgeDefaults,
  updateBadgeDefaultsUI,
  initBadgeDefaults,
  renderIconMap
} from './badges.js';

import {
  switchTab,
  switchPreviewTab,
  selectSingleMap,
  updateSingleView,
  updateSimulationText,
  renderSimulation,
  renderTiledView,
  onTiledSliderInput,
  setSurfaceTiling,
  stepTiling,
  onSeamToggleChange,
  onTiledSeamChange,
  initSimulationInteraction
} from './preview.js';

import {
  setAssetCategory,
  getAssetCategory,
  applyCategoryQuickPick,
  onNormalOpacityChange,
  onLayerMaskChange,
  onDrawOrderChange,
  onGlobalMaterialChange,
  onUvScaleChange,
  setUvScale,
  onNetlaneParamChange,
  updateConfigJson,
  copyConfigJson,
  copyDecalPath,
  downloadConfigJson,
  downloadSingleMap,
  downloadAllMaps,
  exportZipPackage,
  serializeCurrentProject,
  deserializeAndLoadProject,
  saveProjectToFile,
  handleProjectFileLoad,
  seedStarterLibraryIfEmpty,
  initIndexedDBStorage,
  getSavedLibrary,
  getAssetSeriesName,
  setAssetSeriesName,
  onAssetSeriesInput,
  applySeriesQuickPick,
  syncWithSeriesBadge,
  getAllLibrarySeries,
  renderSeriesChips,
  updateRibbonSeriesDropdown,
  onRibbonSeriesSelectChange,
  switchBottomView,
  toggleBottomCollapse,
  scrollRibbon,
  renderSeriesRibbon,
  saveCurrentToActiveSeries,
  promptReassignSeries,
  duplicateRibbonAsset,
  saveCurrentToBrowser,
  updateLibraryBadge,
  openSavedLibraryModal,
  closeLibraryModal,
  closeLibraryModalOnBackdrop,
  filterLibraryBySeries,
  filterLibraryBySearch,
  openRibbonFromLibrary,
  loadFromBrowser,
  deleteFromBrowser,
  renderSavedAssetsList,
  toggleImportDropdown,
  handleCommunityZipImport,
  handleCommunityFolderImport,
  handleCommunityFilesImport,
  importCommunityAssetFromZip,
  importCommunityAssetFromFiles,
  getSourceImageAspectRatio,
  toggleDecalAspectLock,
  setDecalAspectLock,
  resetDecalAspectRatio,
  updateDecalAspectUI
} from './exporter.js';

import { loadSample } from './samples.js';

// ==========================================
// Mode Switching: Decal Mode vs Surface Mode vs NetLane Mode
// ==========================================
export function setMode(mode) {
  state.appMode = mode;
  const btnDecal = document.getElementById('btnModeDecal');
  const btnSurface = document.getElementById('btnModeSurface');
  const btnNetlane = document.getElementById('btnModeNetlane');
  const guidanceBanner = document.getElementById('guidanceBanner');
  const guidanceText = document.getElementById('guidanceText');
  const guidanceIcon = document.getElementById('guidanceIcon');
  const sec1Title = document.getElementById('sec1Title');
  const modeBadge = document.getElementById('modeBadge');
  const sectionDecalGeometry = document.getElementById('sectionDecalGeometry');
  const sectionSurfaceUv = document.getElementById('sectionSurfaceUv');
  const sectionNetlaneParams = document.getElementById('sectionNetlaneParams');
  const sectionDecalLayers = document.getElementById('sectionDecalLayers');
  const jsonLabel = document.getElementById('jsonLabel');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const btnExportZip = document.getElementById('btnExportZip');
  const exportZipLabel = document.getElementById('exportZipLabel');
  const maskAlphaLabel = document.getElementById('maskAlphaLabel');
  const presetButtonsGroup = document.getElementById('presetButtonsGroup');
  const dropTitleText = document.getElementById('dropTitleText');
  const dropHintText = document.getElementById('dropHintText');
  const folderTitleText = document.getElementById('folderTitleText');
  const drawSlider = document.getElementById('drawOrderSlider');

  if (btnDecal) btnDecal.className = mode === 'decal' ? 'mode-btn active-decal' : 'mode-btn';
  if (btnSurface) btnSurface.className = mode === 'surface' ? 'mode-btn active-surface' : 'mode-btn';
  if (btnNetlane) btnNetlane.className = mode === 'netlane' ? 'mode-btn active-netlane' : 'mode-btn';

  if (mode === 'decal') {
    if (guidanceBanner) guidanceBanner.className = 'guidance-banner';
    if (guidanceIcon) guidanceIcon.textContent = '💡';
    if (guidanceText) guidanceText.textContent = 'Images should have transparent backgrounds and do not need to tile.';

    if (sec1Title) sec1Title.textContent = '1. Decal Settings & Geometry';
    if (modeBadge) {
      modeBadge.textContent = 'DECAL';
      modeBadge.style.color = 'var(--primary)';
    }

    if (sectionDecalGeometry) sectionDecalGeometry.style.display = 'block';
    if (sectionSurfaceUv) sectionSurfaceUv.style.display = 'none';
    if (sectionNetlaneParams) sectionNetlaneParams.style.display = 'none';
    if (sectionDecalLayers) sectionDecalLayers.style.display = 'block';
    const secNormOp = document.getElementById('sectionDecalNormalOpacity');
    if (secNormOp) secNormOp.style.display = 'block';

    const categoryPicker = document.getElementById('categoryQuickPicker');
    if (categoryPicker) {
      categoryPicker.innerHTML = `
        <option value="RoadMarkings" selected>RoadMarkings</option>
        <option value="Utilities">Utilities</option>
        <option value="Manholes">Manholes</option>
        <option value="Graffiti">Graffiti</option>
        <option value="Signage">Signage</option>
        <option value="Cracks">Cracks</option>
      `;
    }
    setAssetCategory('RoadMarkings');

    if (drawSlider) {
      const curr = parseInt(drawSlider.value, 10);
      if (curr < 0 || curr === 60) drawSlider.value = 50;
      document.getElementById('drawOrderVal').textContent = drawSlider.value;
      document.getElementById('drawOrderHint').textContent = 'Decal sorting range: 0 to 200 (Default: 50). Higher renders on top.';
    }

    if (jsonLabel) jsonLabel.textContent = 'Generated decal.json';
    if (btnDownloadJson) btnDownloadJson.textContent = 'Download decal.json';
    if (btnExportZip) btnExportZip.className = 'btn-primary';
    if (exportZipLabel) exportZipLabel.textContent = 'Export Decal Package (.zip)';
    if (maskAlphaLabel) maskAlphaLabel.textContent = 'Modulate Mask with Decal Alpha (Recommended for decals)';

    if (dropTitleText) dropTitleText.textContent = 'Drop Source Graphic (PNG or JPG)';
    if (dropHintText) dropHintText.textContent = 'Isolated road mark, manhole, crack, or sign';
    if (folderTitleText) folderTitleText.textContent = 'Cities: Skylines 2 Custom Decal Destination Folder';

    if (presetButtonsGroup) {
      presetButtonsGroup.innerHTML = `
        <button class="preset-btn" onclick="loadSample('manhole')">Manhole Cover</button>
        <button class="preset-btn" onclick="loadSample('arrow')">Turn Arrow</button>
        <button class="preset-btn" onclick="loadSample('crack')">Asphalt Crack</button>
      `;
    }

    const assetNameInput = document.getElementById('assetName');
    if (assetNameInput && (assetNameInput.value.startsWith('CustomSurface_') || assetNameInput.value.startsWith('CustomNetLane_') || assetNameInput.value.startsWith('NetLane_'))) {
      assetNameInput.value = 'CustomRoadMarking_TurnArrow_01';
      loadSample('arrow');
    }

  } else if (mode === 'surface') {
    if (guidanceBanner) guidanceBanner.className = 'guidance-banner guidance-surface';
    if (guidanceIcon) guidanceIcon.textContent = '🌐';
    if (guidanceText) guidanceText.textContent = 'Surfaces must be square, seamless tiling textures (no transparency).';

    if (sec1Title) sec1Title.textContent = '1. Surface Settings & UV Tiling';
    if (modeBadge) {
      modeBadge.textContent = 'SURFACE';
      modeBadge.style.color = 'var(--accent-emerald)';
    }

    if (sectionDecalGeometry) sectionDecalGeometry.style.display = 'none';
    if (sectionSurfaceUv) sectionSurfaceUv.style.display = 'block';
    if (sectionNetlaneParams) sectionNetlaneParams.style.display = 'none';
    if (sectionDecalLayers) sectionDecalLayers.style.display = 'none';
    const secNormOp = document.getElementById('sectionDecalNormalOpacity');
    if (secNormOp) secNormOp.style.display = 'none';

    const categoryPicker = document.getElementById('categoryQuickPicker');
    if (categoryPicker) {
      categoryPicker.innerHTML = `
        <option value="Pavement" selected>Pavement</option>
        <option value="Tiles">Tiles</option>
        <option value="Asphalt">Asphalt</option>
        <option value="Grass">Grass</option>
        <option value="Dirt">Dirt</option>
      `;
    }
    setAssetCategory('Pavement');

    if (drawSlider) {
      const curr = parseInt(drawSlider.value, 10);
      if (curr > 0) drawSlider.value = -50;
      document.getElementById('drawOrderVal').textContent = drawSlider.value;
      document.getElementById('drawOrderHint').textContent = 'Surface draw order range: -170 to 0 (Default: -50). Prevents bridge bleeding.';
    }

    if (jsonLabel) jsonLabel.textContent = 'Generated surface.json';
    if (btnDownloadJson) btnDownloadJson.textContent = 'Download surface.json';
    if (btnExportZip) btnExportZip.className = 'btn-primary surface-btn';
    if (exportZipLabel) exportZipLabel.textContent = 'Export Surface Package (.zip)';
    if (maskAlphaLabel) maskAlphaLabel.textContent = 'Modulate Mask with Texture Alpha (Usually disabled for surfaces)';

    if (dropTitleText) dropTitleText.textContent = 'Drop Seamless Tiling Surface Texture (PNG or JPG)';
    if (dropHintText) dropHintText.textContent = 'Full tileable pavement, asphalt, gravel, or terrain';
    if (folderTitleText) folderTitleText.textContent = 'Cities: Skylines 2 Custom Surface Destination Folder';

    if (presetButtonsGroup) {
      presetButtonsGroup.innerHTML = `
        <button class="preset-btn" onclick="loadSample('cobblestone')">Cobblestones</button>
        <button class="preset-btn" onclick="loadSample('bricks')">Red Bricks</button>
        <button class="preset-btn" onclick="loadSample('tiles')">Granite Tiles</button>
      `;
    }

    const assetNameInput = document.getElementById('assetName');
    if (assetNameInput && (assetNameInput.value.startsWith('CustomRoadMarking_') || assetNameInput.value.startsWith('CityUtility_') || assetNameInput.value.startsWith('CustomNetLane_'))) {
      assetNameInput.value = 'CustomSurface_Pavement_01';
      loadSample('cobblestone');
    }

  } else {
    // Net Lane Mode
    if (guidanceBanner) guidanceBanner.className = 'guidance-banner guidance-netlane';
    if (guidanceIcon) guidanceIcon.textContent = '🛣️';
    if (guidanceText) guidanceText.textContent = 'Net Lanes are extruded along curved road splines (lines, curbs, and paths).';

    if (sec1Title) sec1Title.textContent = '1. Net Lane Settings & Spline Parameters';
    if (modeBadge) {
      modeBadge.textContent = 'NET LANE';
      modeBadge.style.color = 'var(--accent-orange)';
    }

    if (sectionDecalGeometry) sectionDecalGeometry.style.display = 'none';
    if (sectionSurfaceUv) sectionSurfaceUv.style.display = 'none';
    if (sectionNetlaneParams) sectionNetlaneParams.style.display = 'block';
    if (sectionDecalLayers) sectionDecalLayers.style.display = 'none';
    const secNormOp = document.getElementById('sectionDecalNormalOpacity');
    if (secNormOp) secNormOp.style.display = 'none';

    const categoryPicker = document.getElementById('categoryQuickPicker');
    if (categoryPicker) {
      categoryPicker.innerHTML = `
        <option value="Lines" selected>Lines</option>
        <option value="Curbs">Curbs</option>
        <option value="Markings">Markings</option>
        <option value="Tracks">Tracks</option>
        <option value="Paths">Paths</option>
      `;
    }
    setAssetCategory('Lines');

    if (drawSlider) {
      const curr = parseInt(drawSlider.value, 10);
      if (curr < 0 || curr === -50 || curr === 50) {
        drawSlider.value = 60;
      }
      document.getElementById('drawOrderVal').textContent = drawSlider.value;
      document.getElementById('drawOrderHint').textContent = 'Net Lane sorting range: 0 to 200 (Default: 60). Higher renders on top.';
    }

    if (jsonLabel) jsonLabel.textContent = 'Generated netlane.json';
    if (btnDownloadJson) btnDownloadJson.textContent = 'Download netlane.json';
    if (btnExportZip) btnExportZip.className = 'btn-primary netlane-btn';
    if (exportZipLabel) exportZipLabel.textContent = 'Export Net Lane Package (.zip)';
    if (maskAlphaLabel) maskAlphaLabel.textContent = 'Modulate Mask with Base Alpha (Recommended for lines/stripes)';

    if (dropTitleText) dropTitleText.textContent = 'Drop Net Lane Texture (Line/Curb/Marking)';
    if (dropHintText) dropHintText.textContent = 'Wrapping road line or curb strip';
    if (folderTitleText) folderTitleText.textContent = 'Cities: Skylines 2 Custom Net Lane Destination Folder';

    if (presetButtonsGroup) {
      presetButtonsGroup.innerHTML = `
        <button class="preset-btn" onclick="loadSample('centerline')">Dashed Line</button>
        <button class="preset-btn" onclick="loadSample('yellowlines')">Double Yellow</button>
        <button class="preset-btn" onclick="loadSample('curb')">Granite Curb</button>
      `;
    }

    const assetNameInput = document.getElementById('assetName');
    if (assetNameInput && (assetNameInput.value.startsWith('CustomRoadMarking_') || assetNameInput.value.startsWith('CityUtility_') || assetNameInput.value.startsWith('CustomSurface_'))) {
      assetNameInput.value = 'CustomNetLane_DashedLine_01';
      loadSample('centerline');
    }
  }

  updateConfigJson();
  updateSimulationText();
  checkRotationNameReminder();
  updateDecalAspectUI();
  renderAllMaps();
}

// ==========================================
// Primary Map Rendering Logic
// ==========================================
export function renderAllMaps() {
  if (!state.currentImage) return;

  const { canvasBase, canvasNormal, canvasMask, ctxBase, ctxNormal, ctxMask } = getCanvases();
  if (!canvasBase || !ctxBase || !canvasNormal || !ctxNormal || !canvasMask || !ctxMask) return;

  const size = state.currentResolution;
  const fitStrategy = document.getElementById('fitStrategy').value;

  // 1. BASE COLOR MAP
  canvasBase.width = size;
  canvasBase.height = size;
  drawImageSquare(ctxBase, state.currentImage, size, fitStrategy);
  const baseImageData = ctxBase.getImageData(0, 0, size, size);
  const basePixels = baseImageData.data;

  // 2. NORMAL MAP
  canvasNormal.width = size;
  canvasNormal.height = size;
  generateNormalMap(canvasNormal, ctxNormal, basePixels, size, fitStrategy);

  // 3. MASK MAP
  canvasMask.width = size;
  canvasMask.height = size;
  generateMaskMap(canvasMask, ctxMask, basePixels, size);

  // 4. ICON MAP
  renderIconMap();

  // 5. IN-GAME LIT SIMULATION (Updates live in both 3D tab and grid card as sliders adjust)
  renderSimulation();
  updateGridSimulationCanvas();

  // 6. UPDATE SINGLE & TILED VIEWS
  if (['single', 'base', 'normal', 'mask', 'icon'].includes(state.activeTab)) {
    updateSingleView();
  } else if (state.activeTab === 'tiled') {
    renderTiledView();
  }
}

export function updateGridSimulationCanvas() {
  const canvasSim = document.getElementById('canvasSim');
  const canvasSimGrid = document.getElementById('canvasSimGrid');
  if (canvasSim && canvasSimGrid) {
    const ctx = canvasSimGrid.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasSimGrid.width, canvasSimGrid.height);
      ctx.drawImage(canvasSim, 0, 0, canvasSimGrid.width, canvasSimGrid.height);
    }
  }
}

export function initGridSimulationInteraction() {
  const canvasSimGrid = document.getElementById('canvasSimGrid');
  if (!canvasSimGrid) return;

  function updateLightFromEvent(e) {
    const rect = canvasSimGrid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let lx = (x / rect.width) * 2.0 - 1.0;
    let ly = (y / rect.height) * 2.0 - 1.0;
    const distSq = lx * lx + ly * ly;
    let lz = Math.sqrt(Math.max(0.1, 1.0 - distSq * 0.7));

    const len = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1.0;
    state.lightPos = { x: lx / len, y: ly / len, z: lz / len };

    renderSimulation();
    updateGridSimulationCanvas();
  }

  canvasSimGrid.addEventListener('mousemove', updateLightFromEvent);
}

// ==========================================
// File Upload & Drag & Drop Handling
// ==========================================
export function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    processUploadedFile(e.target.files[0]);
  }
}

export function processUploadedFile(file, force = false) {
  if (file.name.toLowerCase().endsWith('.zip')) {
    importCommunityAssetFromZip(file);
    return;
  }

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid PNG or JPG image, or a .zip asset');
    return;
  }

  if (!force && state.isCustomImageLoaded && state.hasUnsavedChanges) {
    state.pendingGuardAction = () => {
      processUploadedFile(file, true);
    };
    openUnsavedModal();
    return;
  }

  const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (cleanName) {
    const input = document.getElementById('assetName');
    if (input) input.value = cleanName;
    updateConfigJson();
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      state.currentImage = img;
      state.isCustomImageLoaded = true;
      state.hasUnsavedChanges = true;
      renderAllMaps();
      updateDecalAspectUI();
      showToast('Image loaded successfully');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

export function onResolutionChange() {
  state.currentResolution = parseInt(document.getElementById('targetRes').value, 10);
  const r1 = document.getElementById('resBadge1'); if (r1) r1.textContent = `${state.currentResolution}×${state.currentResolution}`;
  const r2 = document.getElementById('resBadge2'); if (r2) r2.textContent = `${state.currentResolution}×${state.currentResolution}`;
  const r3 = document.getElementById('resBadge3'); if (r3) r3.textContent = `${state.currentResolution}×${state.currentResolution}`;
  renderAllMaps();
}

export function onAssetNameInput() {
  updateConfigJson();
  checkRotationNameReminder();
  state.currentLoadedAssetName = document.getElementById('assetName').value.trim();
  renderSeriesRibbon();
}

// ==========================================
// Mount Functions to window for inline HTML onclick attributes
// ==========================================
Object.assign(window, {
  state,
  setMode,
  renderAllMaps,
  loadSample,
  handleFileSelect,
  processUploadedFile,
  onResolutionChange,
  onAssetNameInput,
  onNormalOpacityChange,
  onLayerMaskChange,
  onDrawOrderChange,
  onGlobalMaterialChange,
  onUvScaleChange,
  setUvScale,
  onNetlaneParamChange,
  updateConfigJson,
  copyConfigJson,
  copyDecalPath,
  downloadConfigJson,
  downloadSingleMap,
  downloadAllMaps,
  exportZipPackage,
  serializeCurrentProject,
  deserializeAndLoadProject,
  saveProjectToFile,
  handleProjectFileLoad,
  showFieldHelp,
  toggleFieldHelp,
  scheduleHideFieldHelp,
  clearPopoverHideTimer,
  hideFieldHelp,
  openPopoverTopicInGuide,
  openHelpModal,
  closeHelpModal,
  closeHelpModalOnBackdrop,
  setHelpCategory,
  filterHelpTopics,
  handleCustomNormalSelect,
  clearCustomNormal,
  updateCustomNormalUI,
  onBumpChange,
  onBlurChange,
  handleCustomMaskSelect,
  clearCustomMask,
  updateCustomMaskUI,
  onMaskVariationChange,
  onMetalChange,
  onSmoothChange,
  switchBadgeTab,
  setCreatorBadgeMode,
  onBadge1TextChange,
  clearCreatorText,
  setBadge1TextPreset,
  onBadge1FontChange,
  toggleBadge1Bold,
  toggleBadge1Italic,
  toggleBadge1LetterSpacing,
  onBadge1PtSizeChange,
  setCreatorColorMode,
  setCreatorColorTheme,
  setCreatorGradDirection,
  onCreatorCustomColorInput,
  onCreatorSolidColorInput,
  applyCreatorGradPreset,
  handleDesignerLogoSelect,
  clearDesignerLogo,
  applyPresetLogo,
  onBadge1PaddingChange,
  onBadge1InnerPaddingChange,
  onSeriesFontChange,
  toggleSeriesBold,
  toggleSeriesItalic,
  onSeriesPtSizeChange,
  setSeriesBadgeMode,
  applySeriesPreset,
  setSeriesTextPreset,
  onSeriesTextChange,
  clearSeriesText,
  setSeriesColorTheme,
  setSeriesColorMode,
  setSeriesGradDirection,
  onSeriesCustomColorInput,
  onSeriesSolidColorInput,
  applySeriesGradPreset,
  handleSeriesLogoSelect,
  clearSeriesLogo,
  onBadge2PaddingChange,
  onBadge2InnerPaddingChange,
  onIconBadgeScaleChange,
  onIconBadgeOpacityChange,
  saveIconBadgeDefaults,
  loadIconBadgeDefaults,
  resetIconBadgeDefaults,
  renderIconMap,
  toggleGoogleFontInput,
  addCustomGoogleFontFromInput,
  switchTab,
  switchPreviewTab,
  downloadTexture: downloadSingleMap,
  selectSingleMap,
  updateSingleView,
  renderSimulation,
  renderTiledView,
  onTiledSliderInput,
  setSurfaceTiling,
  stepTiling,
  onSeamToggleChange,
  onTiledSeamChange,
  setAssetCategory,
  applyCategoryQuickPick,
  getAssetSeriesName,
  setAssetSeriesName,
  onAssetSeriesInput,
  applySeriesQuickPick,
  syncWithSeriesBadge,
  onRibbonSeriesSelectChange,
  switchBottomView,
  toggleBottomCollapse,
  scrollRibbon,
  renderSeriesRibbon,
  saveCurrentToActiveSeries,
  promptReassignSeries,
  duplicateRibbonAsset,
  saveCurrentToBrowser,
  openSavedLibraryModal,
  closeLibraryModal,
  closeLibraryModalOnBackdrop,
  filterLibraryBySeries,
  filterLibraryBySearch,
  openRibbonFromLibrary,
  loadFromBrowser,
  deleteFromBrowser,
  renderSavedAssetsList,
  autoRenameVariant,
  dismissRotationReminder,
  focusAndHighlightAssetName,
  setTextureRotation,
  toggleFlipHorizontal,
  toggleFlipVertical,
  toggleSection,
  expandAllSections,
  collapseAllSections,
  openUnsavedModal,
  closeUnsavedModal,
  closeUnsavedModalOnBackdrop,
  confirmGuardSaveAndContinue,
  confirmGuardContinueWithoutSaving,
  cancelGuardAction,
  toggleImportDropdown,
  handleCommunityZipImport,
  handleCommunityFolderImport,
  handleCommunityFilesImport,
  importCommunityAssetFromZip,
  importCommunityAssetFromFiles,
  initIndexedDBStorage,
  getSourceImageAspectRatio,
  toggleDecalAspectLock,
  setDecalAspectLock,
  resetDecalAspectRatio,
  updateDecalAspectUI,
  updateGridSimulationCanvas,
  initGridSimulationInteraction
});

// ==========================================
// Initialization on Launch
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  await seedStarterLibraryIfEmpty();
  setMode('decal');
  loadSample('manhole');
  updateDecalAspectUI();
  updateLibraryBadge();
  initBadgeDefaults();
  restoreSidebarSectionsState();
  updateRibbonSeriesDropdown();
  renderSeriesChips();
  renderSeriesRibbon();
  initSimulationInteraction();
  initGridSimulationInteraction();

  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (!files || files.length === 0) return;

      if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
        importCommunityAssetFromZip(files[0]);
      } else if (files.length > 1) {
        importCommunityAssetFromFiles(files);
      } else {
        processUploadedFile(files[0]);
      }
    });
  }

  document.addEventListener('click', (e) => {
    const importMenu = document.getElementById('importDropdownMenu');
    if (importMenu && importMenu.style.display === 'block') {
      if (!e.target.closest('#btnImportAsset') && !importMenu.contains(e.target)) {
        importMenu.style.display = 'none';
      }
    }

    const popover = document.getElementById('fieldHelpPopover');
    if (popover && popover.classList.contains('visible')) {
      if (!popover.contains(e.target) && !e.target.closest('.help-q-btn')) {
        hideFieldHelp(true);
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleImportDropdown(false);
      hideFieldHelp(true);
      closeHelpModal();
      closeLibraryModal();
      cancelGuardAction();
    }
  });

  const prefView = localStorage.getItem('cs2_bottom_view_preference') || 'ribbon';
  switchBottomView(prefView);
});