// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// Main Orchestration & Entry Point
// ==========================================

import {
  state,
  hasActiveWork,
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
  cancelGuardAction,
  toggleAlwaysAskWhereToSave
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
  clearExtra1Logo,
  clearExtra2Logo,
  onBadge2PaddingChange,
  onBadge2InnerPaddingChange,
  onIconBadgeScaleChange,
  onIconBadgeOpacityChange,
  saveIconBadgeDefaults,
  loadIconBadgeDefaults,
  resetIconBadgeDefaults,
  updateBadgeDefaultsUI,
  initBadgeDefaults,
  renderIconMap,
  onIconBgStyleChange,
  setCustomIconBgType,
  handleIconBgImageSelect,
  clearIconBgImage,
  applyProceduralBackdrop,
  onIconBgFitChange,
  onIconBgBlurChange,
  onIconBgBrightnessChange,
  onIconBgVignetteChange,
  onIconBgGradDirChange,
  onIconBgGradColorsChange,
  applyIconBgGradPreset,
  onIconBgGradGridChange,
  onIconBgSolidColorChange,
  applyIconBgSolidSwatch
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
  setPreviewScaleMode,
  scrollTabsNav,
  checkTabScrollButtons,
  initSimulationInteraction
} from './preview.js';

import {
  renderScaleView,
  initScaleViewInteractions,
  updateScaleHUD,
  setScaleScene,
  setScaleZoom,
  toggleScaleRef,
  resetScaleDecalPosition,
  applyScaleQuickPreset
} from './scalePreview.js';

import {
  setAssetCategory,
  getAssetCategory,
  applyCategoryQuickPick,
  updateCategoryQuickPickerForMode,
  onNormalOpacityChange,
  onLayerMaskChange,
  onDrawOrderChange,
  onGlobalMaterialChange,
  onUvScaleChange,
  setUvScale,
  onNetlaneParamChange,
  onUiPriorityChange,
  onUiPriorityInputChange,
  applyUiPriorityPreset,
  stepUiPriority,
  updateUiPrioritySequenceUI,
  autoCalculateUiPriorityFromName,
  toggleAssetMetadataFields,
  autoFillSequenceNotes,
  syncMetaSetNameFromSeries,
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
  saveFileWithPicker,
  exportAssetDirectToFolder,
  openSaveModal,
  closeSaveModal,
  closeSaveModalOnBackdrop,
  saveProjectWithPrompt,
  exportZipWithPrompt,
  exportDirectToFolderWithPrompt,
  saveToLibraryWithNotice,
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
  updateDecalAspectUI,
  applyPosterPreset,
  applySyncGraphicRatio,
  toggleAutoSyncAspect,
  syncDecalDimensionsToImage,
  getAspectFormatName,
  updateSourceImageBadge
} from './exporter.js';

import { getSavedLibraryFromMemory, saveAssetToIndexedDB } from './db.js';

import { loadSample } from './samples.js';

import {
  recallSetProfile,
  saveCurrentWorkspaceAsSet,
  applySuggestedSafeRange,
  checkLiveOverlapAndAlert,
  updateSetRegistryUI,
  renderSetsTable,
  deleteSetProfileFromUI,
  openSetRegistryModal,
  closeSetRegistryModal,
  closeSetRegistryModalOnBackdrop,
  renderSetThumbnailsStrip,
  openCreateSetAssetModal,
  closeCreateSetAssetModal,
  closeCreateSetAssetModalOnBackdrop,
  handleModalNewAssetFileSelect,
  handleModalNewAssetDragOver,
  handleModalNewAssetDragLeave,
  handleModalNewAssetDrop,
  applySuggestedNewNameSuffix,
  confirmCreateSetAsset,
  loadAssetFromSet,
  deleteAssetFromSet,
  initiateCreateNewSetFlow,
  startCreateNewSetWizard,
  closeCreateNewSetWizard,
  closeCreateNewSetWizardOnBackdrop,
  setWizardStep,
  wizardGoNext,
  wizardGoBack,
  applyWizardThemePreset,
  onWizardSetNameInput,
  onWizardModeChange,
  onWizardBasePriorityChange,
  applyWizardAutoSafeRange,
  updateWizardDimSummary,
  applyWizardDimPreset,
  applyWizardFirstAssetSuffix,
  handleWizardGraphicFileSelect,
  handleWizardGraphicDragOver,
  handleWizardGraphicDragLeave,
  handleWizardGraphicDrop,
  useWizardStarterGraphic,
  confirmCreateNewSet,
  exportAllSetsAndStorageBackup,
  handleBackupFileSelect,
  importStorageBackupFromFile
} from './setRegistry.js';

import {
  openNewStandaloneAssetWizard,
  closeNewStandaloneAssetWizard,
  closeNewStandaloneAssetWizardOnBackdrop,
  setStandWizardStep,
  standWizardGoNext,
  standWizardGoBack,
  selectStandWizardMode,
  applyStandWizardNamePreset,
  applyStandWizardSuffix,
  onStandWizardSetOptionChange,
  onStandWizardExistingSetSelected,
  onStandWizardPriorityInput,
  setStandWizardPriority,
  updateStandWizardDimSummary,
  setStandWizardDims,
  setStandWizardUv,
  applyStandWizardMaterial,
  handleStandWizardGraphicFileSelect,
  handleStandWizardGraphicDragOver,
  handleStandWizardGraphicDragLeave,
  handleStandWizardGraphicDrop,
  useStandWizardStarterGraphic,
  setStandWizardNormalMode,
  handleStandWizardNormalFileSelect,
  handleStandWizardNormalDragOver,
  handleStandWizardNormalDragLeave,
  handleStandWizardNormalDrop,
  clearStandWizardCustomNormal,
  updateStandWizardSummary,
  confirmNewStandaloneAsset
} from './assetWizard.js';

// ==========================================
// Mode Switching: Decal Mode vs Surface Mode vs NetLane Mode
// ==========================================
export function setMode(mode, force = false) {
  if (!force && state.appMode !== mode && hasActiveWork()) {
    state.pendingGuardAction = () => {
      setMode(mode, true);
    };
    openUnsavedModal(`Switching to ${mode.toUpperCase()} mode will reset workspace settings.`);
    return;
  }
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

    if (sec1Title) sec1Title.textContent = '2. Decal Settings & Geometry';
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

    updateCategoryQuickPickerForMode('decal');

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
    if (dropHintText) dropHintText.textContent = 'All ratios supported: 2:3 / 3:4 Posters, 16:9 Billboards, or 1:1 Road Marks';
    if (folderTitleText) folderTitleText.textContent = 'Cities: Skylines 2 Custom Decal Destination Folder';

    if (presetButtonsGroup) {
      presetButtonsGroup.innerHTML = `
        <button class="preset-btn" onclick="loadSample('manhole')">Manhole Cover</button>
        <button class="preset-btn" onclick="loadSample('arrow')">Turn Arrow</button>
        <button class="preset-btn" onclick="loadSample('poster')">Poster (2:3)</button>
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

    if (sec1Title) sec1Title.textContent = '2. Surface Settings & UV Tiling';
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

    updateCategoryQuickPickerForMode('surface');

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

    if (sec1Title) sec1Title.textContent = '2. Net Lane Settings & Spline Parameters';
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

    updateCategoryQuickPickerForMode('netlane');

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

  // 6. UPDATE SINGLE, TILED & SCALE VIEWS
  if (['single', 'base', 'normal', 'mask', 'icon'].includes(state.activeTab)) {
    updateSingleView();
  } else if (state.activeTab === 'tiled') {
    renderTiledView();
  } else if (state.activeTab === 'scale') {
    renderScaleView();
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
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

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
  canvasSimGrid.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateLightFromEvent(e);
  }, { passive: false });
  canvasSimGrid.addEventListener('touchstart', (e) => {
    updateLightFromEvent(e);
  }, { passive: true });
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

  if (!force && hasActiveWork()) {
    state.pendingGuardAction = () => {
      processUploadedFile(file, true);
    };
    openUnsavedModal('Loading a different graphic will clear what you are currently doing.');
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

      const rawW = img.naturalWidth || img.width || 1024;
      const rawH = img.naturalHeight || img.height || 1024;
      const nativeRatio = rawW / rawH;

      // Update source image status badge with resolution and ratio name
      updateSourceImageBadge(rawW, rawH, nativeRatio);

      // If in Decal mode and autoSync is enabled: sync decal dimensions to graphic ratio
      if (state.appMode === 'decal') {
        const autoSyncEl = document.getElementById('autoSyncAspectOnImport');
        const shouldSync = !autoSyncEl || autoSyncEl.checked;
        if (shouldSync) {
          syncDecalDimensionsToImage(rawW, rawH, nativeRatio);
        } else if (state.decalAspectLocked) {
          state.decalLockedRatio = nativeRatio;
        }
      }

      renderAllMaps();
      updateDecalAspectUI();
      
      const format = getAspectFormatName(nativeRatio);
      showToast(`Loaded ${file.name} (${rawW}×${rawH} • ${format})`);
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
  updateUiPrioritySequenceUI();
  if (typeof renderSetThumbnailsStrip === 'function') {
    renderSetThumbnailsStrip();
  }
}

export function clearAllWorkspace(force = false) {
  if (!force && hasActiveWork()) {
    state.pendingGuardAction = () => {
      clearAllWorkspace(true);
    };
    openUnsavedModal('Clearing the workspace will completely wipe all loaded images, maps, overlays, and settings to start with a blank slate.');
    return;
  }

  // 1. Reset global state variables
  state.currentImage = null;
  state.isCustomImageLoaded = false;
  state.hasUnsavedChanges = false;
  state.pendingGuardAction = null;
  state.customNormalImg = null;
  state.customNormalFileName = '';
  state.customMaskImg = null;
  state.customMaskFileName = '';
  state.designerLogoImg = null;
  state.badge1FileName = '';
  state.badge2Img = null;
  state.badge2FileName = '';
  state.badge3Img = null;
  state.badge3FileName = '';
  state.badge4Img = null;
  state.badge4FileName = '';
  state.currentLoadedAssetName = '';
  state.currentLoadedAssetSeries = '';

  // 2. Clear all file inputs
  ['fileInput', 'customNormalInput', 'customMaskInput', 'designerLogoInput', 'seriesLogoInput', 'extra1LogoInput', 'extra2LogoInput', 'projectFileInput', 'communityZipInput', 'communityFolderInput', 'communityFilesInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // 3. Clear custom map inputs & badges
  clearCustomNormal(false);
  clearCustomMask(false);
  if (typeof clearDesignerLogo === 'function') clearDesignerLogo();
  if (typeof clearSeriesLogo === 'function') clearSeriesLogo();
  if (typeof clearExtra1Logo === 'function') clearExtra1Logo();
  if (typeof clearExtra2Logo === 'function') clearExtra2Logo();

  // 4. Reset transforms & reminders
  setTextureRotation(0);
  if (state.flipH) toggleFlipHorizontal();
  if (state.flipV) toggleFlipVertical();
  state.originalNameBeforeTransform = '';
  state.isReminderDismissed = false;
  dismissRotationReminder();
  const rotFlag = document.getElementById('rotationNameFlag');
  if (rotFlag) rotFlag.style.display = 'none';

  // 5. Reset text inputs & badges
  const assetNameInput = document.getElementById('assetName');
  if (assetNameInput) assetNameInput.value = '';

  const seriesInput = document.getElementById('assetSeries');
  if (seriesInput) seriesInput.value = '';

  const activeSeriesBadge = document.getElementById('activeSeriesBadge');
  if (activeSeriesBadge) activeSeriesBadge.textContent = 'None';

  const dropTitle = document.getElementById('dropTitleText');
  if (dropTitle) dropTitle.textContent = 'Drop PNG or JPG decal texture';

  const dropHint = document.getElementById('dropHintText');
  if (dropHint) dropHint.textContent = 'Square 1:1 ratio • Transparent or solid';

  const sourceBadge = document.getElementById('sourceImageStatusBadge');
  if (sourceBadge) sourceBadge.textContent = 'No Image Loaded';

  // 6. Reset overlay text inputs & disable all overlays
  ['badge1TextInput', 'seriesTextInput', 'extra1TextInput', 'extra2TextInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  state.badge1Enabled = false;
  state.badge2Enabled = false;
  state.badge3Enabled = false;
  state.badge4Enabled = false;
  if (typeof window.syncAllBadgeCheckboxes === 'function') {
    window.syncAllBadgeCheckboxes();
  }

  // 7. Reset sliders & parameters
  const bumpSlider = document.getElementById('bumpIntensity');
  if (bumpSlider) { bumpSlider.value = '1.0'; const val = document.getElementById('bumpVal'); if (val) val.textContent = '1.0×'; }

  const blurSlider = document.getElementById('blurRadius');
  if (blurSlider) { blurSlider.value = '0'; const val = document.getElementById('blurVal'); if (val) val.textContent = '0 px'; }

  const metalSlider = document.getElementById('metallic');
  if (metalSlider) { metalSlider.value = '0'; const val = document.getElementById('metalVal'); if (val) val.textContent = '0'; }

  const smoothSlider = document.getElementById('smoothness');
  if (smoothSlider) { smoothSlider.value = '0'; const val = document.getElementById('smoothVal'); if (val) val.textContent = '0'; }

  const dimW = document.getElementById('dimWidth'); if (dimW) dimW.value = '1.0';
  const dimH = document.getElementById('dimHeight'); if (dimH) dimH.value = '1.0';
  const dimD = document.getElementById('dimDepth'); if (dimD) dimD.value = '0.5';

  // 8. Wipe every single canvas to a clean slate
  const { canvasBase, ctxBase, canvasNormal, ctxNormal, canvasMask, ctxMask, canvasIcon, ctxIcon, canvasSingle, ctxSingle } = getCanvases();
  const size = state.currentResolution || 1024;

  if (canvasBase && ctxBase) {
    canvasBase.width = size;
    canvasBase.height = size;
    ctxBase.clearRect(0, 0, size, size);
  }
  if (canvasNormal && ctxNormal) {
    canvasNormal.width = size;
    canvasNormal.height = size;
    ctxNormal.clearRect(0, 0, size, size);
  }
  if (canvasMask && ctxMask) {
    canvasMask.width = size;
    canvasMask.height = size;
    ctxMask.clearRect(0, 0, size, size);
  }
  if (canvasIcon && ctxIcon) {
    canvasIcon.width = 512;
    canvasIcon.height = 512;
    ctxIcon.clearRect(0, 0, 512, 512);
  }

  const canvasSim = document.getElementById('canvasSim');
  if (canvasSim) {
    const ctxSim = canvasSim.getContext('2d');
    if (ctxSim) ctxSim.clearRect(0, 0, canvasSim.width, canvasSim.height);
  }

  const canvasSimGrid = document.getElementById('canvasSimGrid');
  if (canvasSimGrid) {
    const ctxSimGrid = canvasSimGrid.getContext('2d');
    if (ctxSimGrid) ctxSimGrid.clearRect(0, 0, canvasSimGrid.width, canvasSimGrid.height);
  }

  const canvasTiled = document.getElementById('canvasTiled');
  if (canvasTiled) {
    const ctxTiled = canvasTiled.getContext('2d');
    if (ctxTiled) ctxTiled.clearRect(0, 0, canvasTiled.width, canvasTiled.height);
  }

  if (canvasSingle && ctxSingle) {
    ctxSingle.clearRect(0, 0, canvasSingle.width, canvasSingle.height);
  }

  // 9. Update Card Footer / Badges to reflect clean state
  const cardNormalBadge = document.getElementById('cardNormalBadge');
  if (cardNormalBadge) {
    cardNormalBadge.textContent = 'None';
    cardNormalBadge.style.background = 'rgba(148, 163, 184, 0.15)';
    cardNormalBadge.style.color = 'var(--text-muted)';
  }
  const cardNormalFooter = document.getElementById('cardNormalFooter');
  if (cardNormalFooter) cardNormalFooter.textContent = 'No normal map generated';

  const cardIconBadge = document.getElementById('cardIconBadge');
  if (cardIconBadge) {
    cardIconBadge.textContent = 'None';
    cardIconBadge.style.background = 'rgba(148, 163, 184, 0.15)';
    cardIconBadge.style.color = 'var(--text-muted)';
  }
  const cardIconFooter = document.getElementById('cardIconFooter');
  if (cardIconFooter) cardIconFooter.textContent = 'No icon generated';

  updateConfigJson();
  showToast('Workspace wiped to a completely clear slate');
}

// ==========================================
// Mount Functions to window for inline HTML onclick attributes
// ==========================================
Object.assign(window, {
  state,
  hasActiveWork,
  setMode,
  renderAllMaps,
  loadSample,
  handleFileSelect,
  processUploadedFile,
  clearAllWorkspace,
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
  saveFileWithPicker,
  exportAssetDirectToFolder,
  openSaveModal,
  closeSaveModal,
  closeSaveModalOnBackdrop,
  saveProjectWithPrompt,
  exportZipWithPrompt,
  exportDirectToFolderWithPrompt,
  saveToLibraryWithNotice,
  toggleAlwaysAskWhereToSave,
  downloadConfigFile: downloadConfigJson,
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
  onIconBgStyleChange,
  setCustomIconBgType,
  handleIconBgImageSelect,
  clearIconBgImage,
  applyProceduralBackdrop,
  onIconBgFitChange,
  onIconBgBlurChange,
  onIconBgBrightnessChange,
  onIconBgVignetteChange,
  onIconBgGradDirChange,
  onIconBgGradColorsChange,
  applyIconBgGradPreset,
  onIconBgGradGridChange,
  onIconBgSolidColorChange,
  applyIconBgSolidSwatch,
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
  setPreviewScaleMode,
  scrollTabsNav,
  checkTabScrollButtons,
  setAssetCategory,
  applyCategoryQuickPick,
  updateCategoryQuickPickerForMode,
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
  applyPosterPreset,
  applySyncGraphicRatio,
  toggleAutoSyncAspect,
  syncDecalDimensionsToImage,
  getAspectFormatName,
  updateSourceImageBadge,
  onUiPriorityChange,
  onUiPriorityInputChange,
  applyUiPriorityPreset,
  stepUiPriority,
  updateUiPrioritySequenceUI,
  autoCalculateUiPriorityFromName,
  toggleAssetMetadataFields,
  autoFillSequenceNotes,
  syncMetaSetNameFromSeries,
  updateGridSimulationCanvas,
  initGridSimulationInteraction,
  serializeCurrentProject,
  deserializeAndLoadProject,
  getSavedLibraryFromMemory,
  saveAssetToIndexedDB,
  recallSetProfile,
  saveCurrentWorkspaceAsSet,
  applySuggestedSafeRange,
  checkLiveOverlapAndAlert,
  updateSetRegistryUI,
  renderSetsTable,
  deleteSetProfileFromUI,
  openSetRegistryModal,
  closeSetRegistryModal,
  closeSetRegistryModalOnBackdrop,
  renderSetThumbnailsStrip,
  openCreateSetAssetModal,
  closeCreateSetAssetModal,
  closeCreateSetAssetModalOnBackdrop,
  handleModalNewAssetFileSelect,
  handleModalNewAssetDragOver,
  handleModalNewAssetDragLeave,
  handleModalNewAssetDrop,
  applySuggestedNewNameSuffix,
  confirmCreateSetAsset,
  loadAssetFromSet,
  deleteAssetFromSet,
  initiateCreateNewSetFlow,
  startCreateNewSetWizard,
  closeCreateNewSetWizard,
  closeCreateNewSetWizardOnBackdrop,
  setWizardStep,
  wizardGoNext,
  wizardGoBack,
  applyWizardThemePreset,
  onWizardSetNameInput,
  onWizardModeChange,
  onWizardBasePriorityChange,
  applyWizardAutoSafeRange,
  updateWizardDimSummary,
  applyWizardDimPreset,
  applyWizardFirstAssetSuffix,
  handleWizardGraphicFileSelect,
  handleWizardGraphicDragOver,
  handleWizardGraphicDragLeave,
  handleWizardGraphicDrop,
  useWizardStarterGraphic,
  confirmCreateNewSet,
  exportAllSetsAndStorageBackup,
  handleBackupFileSelect,
  importStorageBackupFromFile,
  openWelcomeSplash,
  closeWelcomeSplash,
  closeWelcomeSplashOnBackdrop,
  toggleNeverShowSplashAgain,
  openNewStandaloneAssetWizard,
  closeNewStandaloneAssetWizard,
  closeNewStandaloneAssetWizardOnBackdrop,
  setStandWizardStep,
  standWizardGoNext,
  standWizardGoBack,
  selectStandWizardMode,
  applyStandWizardNamePreset,
  applyStandWizardSuffix,
  onStandWizardSetOptionChange,
  onStandWizardExistingSetSelected,
  onStandWizardPriorityInput,
  setStandWizardPriority,
  updateStandWizardDimSummary,
  setStandWizardDims,
  setStandWizardUv,
  applyStandWizardMaterial,
  handleStandWizardGraphicFileSelect,
  handleStandWizardGraphicDragOver,
  handleStandWizardGraphicDragLeave,
  handleStandWizardGraphicDrop,
  useStandWizardStarterGraphic,
  setStandWizardNormalMode,
  handleStandWizardNormalFileSelect,
  handleStandWizardNormalDragOver,
  handleStandWizardNormalDragLeave,
  handleStandWizardNormalDrop,
  clearStandWizardCustomNormal,
  updateStandWizardSummary,
  confirmNewStandaloneAsset
});

// ==========================================
// Quick Guide Splash Screen Logic
// ==========================================
export function openWelcomeSplash() {
  const modal = document.getElementById('welcomeSplashModal');
  if (modal) {
    modal.style.display = 'flex';
    const chk = document.getElementById('splashNeverShowCheckbox');
    if (chk) {
      chk.checked = localStorage.getItem('cs2_hide_welcome_splash') === 'true';
    }
  }
}

export function closeWelcomeSplash() {
  const modal = document.getElementById('welcomeSplashModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

export function closeWelcomeSplashOnBackdrop(e) {
  if (e.target && e.target.id === 'welcomeSplashModal') {
    closeWelcomeSplash();
  }
}

export function toggleNeverShowSplashAgain(checked) {
  if (checked) {
    localStorage.setItem('cs2_hide_welcome_splash', 'true');
  } else {
    localStorage.removeItem('cs2_hide_welcome_splash');
  }
}

// ==========================================
// Initialization on Launch
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  setMode('decal');
  loadSample('manhole');
  updateDecalAspectUI();
  updateUiPrioritySequenceUI();
  initBadgeDefaults();
  restoreSidebarSectionsState();
  updateRibbonSeriesDropdown();
  renderSeriesChips();
  initSimulationInteraction();
  initGridSimulationInteraction();
  initScaleViewInteractions();
  updateScaleHUD();
  updateSetRegistryUI();
  checkLiveOverlapAndAlert();
  renderSetThumbnailsStrip();

  const hideSplash = localStorage.getItem('cs2_hide_welcome_splash') === 'true';
  if (!hideSplash) {
    openWelcomeSplash();
  }

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
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      openSaveModal();
      return;
    }
    if (e.key === 'Escape') {
      closeSaveModal();
      toggleImportDropdown(false);
      hideFieldHelp(true);
      closeWelcomeSplash();
      closeHelpModal();
      closeSetRegistryModal();
      closeCreateSetAssetModal();
      closeCreateNewSetWizard();
      closeNewStandaloneAssetWizard();
      cancelGuardAction();
    }
  });
});