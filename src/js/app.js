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
  openAndScrollToSection,
  scrollToNormalMapArea,
  expandAllSections,
  collapseAllSections,
  restoreSidebarSectionsState,
  openUnsavedModal,
  closeUnsavedModal,
  closeUnsavedModalOnBackdrop,
  confirmGuardSaveAndContinue,
  confirmGuardContinueWithoutSaving,
  cancelGuardAction,
  toggleAlwaysAskWhereToSave,
  setHideSamplePresets,
  toggleHideSamplePresets,
  createDefaultSlot,
  getSlot,
  isSlotLoaded,
  getLoadedSlotsCount,
  getLoadedSlots,
  formatFileTypeLabel
} from './state.js';
import { createModalController, bindDragAndDropZone } from './domUtils.js';

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
  openDonateModal,
  closeDonateModal,
  closeDonateModalOnBackdrop,
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
  switchBadgeSubtab,
  syncAllBadgeCheckboxes,
  copyBadgeStyle,
  runBadgeStyleCopyAction,
  toggleBadge1Enable,
  setCreatorBadgeMode,
  onBadge1TextChange,
  clearCreatorText,
  setBadge1TextPreset,
  onBadge1FontChange,
  toggleBadge1Bold,
  toggleBadge1Italic,
  toggleBadge1LetterSpacing,
  onBadge1PtSizeChange,
  toggleBadge1TextGrad,
  onBadge1TextGradInput,
  setBadge1TextGradDir,
  applyBadge1TextGradPresetByName,
  updateCreatorGradPreview,
  setCreatorColorMode,
  setCreatorColorTheme,
  setCreatorGradDirection,
  onCreatorCustomColorInput,
  onCreatorSolidColorInput,
  applyCreatorGradPreset,
  applyCreatorGradPresetByName,
  handleDesignerLogoSelect,
  clearDesignerLogo,
  applyPresetLogo,
  onCreatorPositionChange,
  onCreatorCoordChange,
  snapCreatorCoord,
  onBadge1PaddingChange,
  onBadge1InnerPaddingChange,
  toggleBadge2Enable,
  onSeriesFontChange,
  toggleSeriesBold,
  toggleSeriesItalic,
  toggleSeriesLetterSpacing,
  onSeriesPtSizeChange,
  toggleBadge2TextGrad,
  onBadge2TextGradInput,
  setBadge2TextGradDir,
  applyBadge2TextGradPresetByName,
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
  applySeriesGradPresetByName,
  handleSeriesLogoSelect,
  clearSeriesLogo,
  onSeriesPositionChange,
  onSeriesCoordChange,
  snapSeriesCoord,
  clearExtra1Logo,
  clearExtra2Logo,
  onBadge2PaddingChange,
  onBadge2InnerPaddingChange,
  onIconBadgeScaleChange,
  onIconBadgeOpacityChange,
  saveIconBadgeDefaults,
  loadIconBadgeDefaults,
  resetIconBadgeDefaults,
  clearIconBadgeDefaults,
  toggleAutoApplyDefaults,
  updateBadgeDefaultsUI,
  initBadgeDefaults,
  initBadgeCanvasInteractions,
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
  toggleFloatingViewportControls,
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
  onAssetCategoryInput,
  applyCategoryQuickPick,
  updateCategoryQuickPickerForMode,
  onNormalOpacityChange,
  onBaseOpacityChange,
  onMetallicOpacityChange,
  getLayerMaskValue,
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
  getJsonSchemaMode,
  setJsonSchemaMode,
  setNetlaneJsonPreviewTab,
  updateConfigJson,
  copyConfigJson,
  copyDecalPath,
  downloadConfigJson,
  downloadSingleMap,
  downloadAllMaps,
  buildExportReadmeText,
  exportZipPackage,
  exportCompleteSetZip,
  areAllSlotsEmpty,
  isCurrentSlotEmpty,
  openEmptySlotsModal,
  closeEmptySlotsModal,
  closeEmptySlotsModalOnBackdrop,
  openPrepareExportModal,
  closePrepareExportModal,
  closePrepareExportModalOnBackdrop,
  updatePrepareExportProgress,
  triggerUploadFromEmptyModal,
  loadSampleFromEmptyModal,
  switchToSlotFromEmptyModal,
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
  updateSourceImageBadge,
  floatJsonPreview,
  dockJsonPreview,
  toggleJsonFloat,
  toggleMinimizeJsonFloat,
  resetJsonFloatingPosition
} from './exporter.js';

import { getSavedLibraryFromMemory, saveAssetToIndexedDB } from './db.js';

import { loadSample, createSampleSlot } from './samples.js';

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
  undoLastRemovedAsset,
  removeAssetFromSet,
  removeCurrentDecalFromActiveSet,
  addCurrentWorkspaceToSet,
  resequenceCurrentSetActiveSet,
  moveSetAsset,
  openManageSetItemsModal,
  closeManageSetItemsModal,
  closeManageSetItemsModalOnBackdrop,
  renderManageSetItemsTable,
  getSetsRegistry,
  openAddFromLibraryModal,
  closeAddFromLibraryModal,
  closeAddFromLibraryModalOnBackdrop,
  renderAddFromLibraryList,
  toggleLibraryPickSelection,
  confirmAddFromLibraryToSet,
  switchActivePackFromSelect,
  updateActiveDecalPackStatus,
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
  confirmCreateNewSet
} from './setRegistry.js';

import {
  openBackupAllDataModal,
  closeBackupAllDataModal,
  closeBackupAllDataModalOnBackdrop,
  exportAllSetsAndStorageBackup,
  copyBackupJsonToClipboard,
  handleBackupFileSelect,
  handleBackupModalFileSelect,
  handleBackupDropzoneDragOver,
  handleBackupDropzoneDragLeave,
  handleBackupDropzoneDrop,
  inspectBackupFile,
  confirmRestoreBackup,
  cancelPendingRestore,
  refreshBackupModalStats,
  resetAllLocalDataWithConfirmation
} from './backupManager.js';

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

import {
  openAssetChecklistModal,
  closeAssetChecklistModal,
  closeAssetChecklistModalOnBackdrop,
  refreshAssetChecklistModal,
  jumpToChecklistTarget,
  switchChecklistSlot,
  setChecklistJsonSchema,
  toggleChecklistMetadata,
  onChecklistMetadataInput,
  addCustomMetadataEntry,
  updateCustomMetadataEntry,
  removeCustomMetadataEntry
} from './assetChecklist.js';

// ==========================================
// 3-in-1 Set Slots State Preservation
// ==========================================

export function saveCurrentSlotState(mode = state.appMode) {
  if (!state.setSlots || !state.setSlots[mode]) return;
  const slot = state.setSlots[mode];

  // Save current image & transform state
  slot.image = state.currentImage;
  slot.isCustomImageLoaded = !!state.isCustomImageLoaded;
  slot.hasUnsavedChanges = !!state.hasUnsavedChanges;
  slot.textureRotation = state.textureRotation || 0;
  slot.flipH = !!state.flipH;
  slot.flipV = !!state.flipV;
  slot.fileName = state.sourceFileName || slot.fileName || '';
  slot.sourceFileType = state.sourceFileType || slot.sourceFileType || '';
  slot.sourceKind = state.sourceKind || slot.sourceKind || (state.currentImage ? 'custom' : 'none');
  slot.customNormalImg = state.customNormalImg;
  slot.customNormalFileName = state.customNormalFileName || '';
  slot.customNormalFileType = state.customNormalFileType || '';
  slot.customMaskImg = state.customMaskImg;
  slot.customMaskFileName = state.customMaskFileName || '';
  slot.customMaskFileType = state.customMaskFileType || '';
  slot.targetResolution = state.currentResolution || 1024;

  const assetNameEl = document.getElementById('assetName');
  if (assetNameEl) {
    slot.assetName = assetNameEl.value.trim();
    slot.hasCustomName = Boolean(slot.assetName);
  }

  const catEl = document.getElementById('assetCategory');
  if (catEl) {
    slot.category = catEl.value.trim();
  }

  const seriesEl = document.getElementById('assetSeries') || document.getElementById('metaSetName');
  if (seriesEl) {
    const val = seriesEl.value.trim();
    slot.seriesName = val;
    slot.assetSeries = val;
    state.setName = val;
  }

  const fitEl = document.getElementById('fitStrategy');
  if (fitEl) slot.fitStrategy = fitEl.value;

  const bumpEl = document.getElementById('bumpIntensity');
  if (bumpEl) slot.bumpIntensity = parseFloat(bumpEl.value) || slot.bumpIntensity;

  const blurEl = document.getElementById('normalBlur');
  if (blurEl) slot.normalBlur = parseInt(blurEl.value, 10) || 0;

  const invertEl = document.getElementById('invertBump');
  if (invertEl) slot.invertBump = invertEl.checked;

  const flipYEl = document.getElementById('flipNormalY');
  if (flipYEl) slot.flipNormalY = flipYEl.checked;

  const metalEl = document.getElementById('metallic');
  if (metalEl) slot.metallic = parseInt(metalEl.value, 10) || 0;

  const smoothEl = document.getElementById('smoothness');
  if (smoothEl) slot.smoothness = parseInt(smoothEl.value, 10) || 0;

  const maskAlphaEl = document.getElementById('maskWithDecalAlpha');
  if (maskAlphaEl) slot.maskWithDecalAlpha = maskAlphaEl.checked;

  const prioEl = document.getElementById('uiPriorityInput');
  if (prioEl && prioEl.value) slot.uiPriority = parseInt(prioEl.value, 10) || slot.uiPriority;

  const prioBaseEl = document.getElementById('uiPriorityBase');
  if (prioBaseEl && prioBaseEl.value) slot.uiPriorityBase = parseInt(prioBaseEl.value, 10) || slot.uiPriorityBase;

  const prioStepEl = document.getElementById('uiPriorityStep');
  if (prioStepEl && prioStepEl.value) slot.uiPriorityStep = parseInt(prioStepEl.value, 10) || slot.uiPriorityStep;

  const drawOrderEl = document.getElementById('drawOrderSlider');
  if (drawOrderEl) slot.drawOrder = parseInt(drawOrderEl.value, 10) || slot.drawOrder;

  if (mode === 'decal') {
    slot.dimensions = {
      width: parseFloat(document.getElementById('dimWidth')?.value || '2.0') || 2.0,
      height: parseFloat(document.getElementById('dimHeight')?.value || '2.0') || 2.0,
      depth: parseFloat(document.getElementById('dimDepth')?.value || '0.5') || 0.5,
      aspectLocked: !!state.decalAspectLocked,
      lockedRatio: state.decalLockedRatio || 1.0
    };
    slot.layerMask = {
      terrain: document.getElementById('layerTerrain')?.checked !== false,
      roads: document.getElementById('layerRoads')?.checked !== false,
      buildings: !!document.getElementById('layerBuildings')?.checked,
      vehicles: !!document.getElementById('layerVehicles')?.checked
    };
    slot.normalOpacity = parseFloat(document.getElementById('normalOpacitySlider')?.value || '1.0');
    slot.baseOpacity = parseFloat(document.getElementById('baseOpacitySlider')?.value || '1.0');
    slot.metallicOpacity = parseFloat(document.getElementById('metallicOpacitySlider')?.value || '0.0');
  } else if (mode === 'surface') {
    slot.uvScale = parseFloat(document.getElementById('uvScaleSlider')?.value || '1.0');
    slot.surfaceTiling = state.surfaceTiling || 4;
  } else if (mode === 'netlane') {
    slot.netlane = {
      width: parseFloat(document.getElementById('netlaneWidthSlider')?.value || '1.0'),
      length: parseFloat(document.getElementById('netlaneLengthSlider')?.value || '2.0')
    };
  }

  // Capture clean 64x64 thumbnail from canvasBase if image exists
  const { canvasBase } = getCanvases();
  if (canvasBase && canvasBase.width > 0 && state.currentImage) {
    try {
      const tc = document.createElement('canvas');
      tc.width = 64;
      tc.height = 64;
      const tctx = tc.getContext('2d');
      tctx.drawImage(canvasBase, 0, 0, 64, 64);
      slot.thumbnail = tc.toDataURL('image/png');
    } catch (_) {}
  } else if (!state.currentImage) {
    slot.thumbnail = '';
  }
}

export function restoreSlotState(mode) {
  if (!state.setSlots || !state.setSlots[mode]) return;
  const slot = state.setSlots[mode];

  state.currentImage = slot.image;
  state.isCustomImageLoaded = !!slot.isCustomImageLoaded;
  state.hasUnsavedChanges = !!slot.hasUnsavedChanges;
  state.textureRotation = slot.textureRotation || 0;
  state.flipH = !!slot.flipH;
  state.flipV = !!slot.flipV;
  state.sourceFileName = slot.fileName || '';
  state.sourceFileType = slot.sourceFileType || '';
  state.sourceKind = slot.sourceKind || (slot.image ? 'custom' : 'none');
  state.customNormalImg = slot.customNormalImg || null;
  state.customNormalFileName = slot.customNormalFileName || '';
  state.customNormalFileType = slot.customNormalFileType || '';
  state.customMaskImg = slot.customMaskImg || null;
  state.customMaskFileName = slot.customMaskFileName || '';
  state.customMaskFileType = slot.customMaskFileType || '';

  const assetNameEl = document.getElementById('assetName');
  if (assetNameEl) assetNameEl.value = slot.assetName || '';
  state.currentLoadedAssetName = slot.assetName || '';

  if (slot.category !== undefined && typeof setAssetCategory === 'function') {
    setAssetCategory(slot.category);
  }

  // Sync pack/series name from actual pack membership for the restored slot
  const registry = typeof getSetsRegistry === 'function' ? getSetsRegistry() : [];
  const memberSet = slot.assetName
    ? registry.find(s => (s.assets || []).some(a => a.name.toLowerCase() === slot.assetName.toLowerCase()))
    : null;
  const effectiveSeries = memberSet ? memberSet.setName : '';
  slot.seriesName = effectiveSeries;
  slot.assetSeries = effectiveSeries;
  if (typeof setAssetSeriesName === 'function') {
    setAssetSeriesName(effectiveSeries);
  }

  const fitEl = document.getElementById('fitStrategy');
  if (fitEl && slot.fitStrategy) fitEl.value = slot.fitStrategy;

  const bumpEl = document.getElementById('bumpIntensity');
  if (bumpEl && slot.bumpIntensity !== undefined) {
    bumpEl.value = slot.bumpIntensity;
    const bv = document.getElementById('bumpVal');
    if (bv) bv.textContent = `${Number(slot.bumpIntensity).toFixed(1)}×`;
  }

  const blurEl = document.getElementById('normalBlur');
  if (blurEl && slot.normalBlur !== undefined) {
    blurEl.value = slot.normalBlur;
    const blv = document.getElementById('blurVal');
    if (blv) blv.textContent = `${slot.normalBlur} px`;
  }

  const invertEl = document.getElementById('invertBump');
  if (invertEl && slot.invertBump !== undefined) invertEl.checked = !!slot.invertBump;

  const flipYEl = document.getElementById('flipNormalY');
  if (flipYEl && slot.flipNormalY !== undefined) flipYEl.checked = !!slot.flipNormalY;

  const metalEl = document.getElementById('metallic');
  if (metalEl && slot.metallic !== undefined) {
    metalEl.value = slot.metallic;
    const mv = document.getElementById('metalVal');
    if (mv) mv.textContent = `${slot.metallic} (${Math.round((slot.metallic / 255) * 100)}%)`;
  }

  const smoothEl = document.getElementById('smoothness');
  if (smoothEl && slot.smoothness !== undefined) {
    smoothEl.value = slot.smoothness;
    const sv = document.getElementById('smoothVal');
    if (sv) sv.textContent = `${slot.smoothness} (${Math.round((slot.smoothness / 255) * 100)}%)`;
  }

  const maskAlphaEl = document.getElementById('maskWithDecalAlpha');
  if (maskAlphaEl && slot.maskWithDecalAlpha !== undefined) maskAlphaEl.checked = !!slot.maskWithDecalAlpha;

  const prioEl = document.getElementById('uiPriorityInput');
  if (prioEl && slot.uiPriority !== undefined) {
    prioEl.value = slot.uiPriority;
    const pSlider = document.getElementById('uiPrioritySlider');
    if (pSlider) pSlider.value = Math.min(parseInt(pSlider.max, 10), slot.uiPriority);
    const pVal = document.getElementById('uiPriorityVal');
    if (pVal) pVal.textContent = slot.uiPriority.toLocaleString();
  }

  const drawOrderEl = document.getElementById('drawOrderSlider');
  if (drawOrderEl && slot.drawOrder !== undefined) {
    drawOrderEl.value = slot.drawOrder;
    const dov = document.getElementById('drawOrderVal');
    if (dov) dov.textContent = slot.drawOrder;
  }

  if (mode === 'decal' && slot.dimensions) {
    if (document.getElementById('dimWidth')) document.getElementById('dimWidth').value = slot.dimensions.width;
    if (document.getElementById('dimHeight')) document.getElementById('dimHeight').value = slot.dimensions.height;
    if (document.getElementById('dimDepth')) document.getElementById('dimDepth').value = slot.dimensions.depth;
    state.decalAspectLocked = !!slot.dimensions.aspectLocked;
    state.decalLockedRatio = slot.dimensions.lockedRatio || 1.0;

    if (slot.layerMask) {
      if (document.getElementById('layerTerrain')) document.getElementById('layerTerrain').checked = !!slot.layerMask.terrain;
      if (document.getElementById('layerRoads')) document.getElementById('layerRoads').checked = !!slot.layerMask.roads;
      if (document.getElementById('layerBuildings')) document.getElementById('layerBuildings').checked = !!slot.layerMask.buildings;
      if (document.getElementById('layerVehicles')) document.getElementById('layerVehicles').checked = !!slot.layerMask.vehicles;
    }
  } else if (mode === 'surface') {
    if (slot.uvScale !== undefined && document.getElementById('uvScaleSlider')) {
      document.getElementById('uvScaleSlider').value = slot.uvScale;
      const uvv = document.getElementById('uvScaleVal');
      if (uvv) uvv.textContent = Number(slot.uvScale).toFixed(1);
    }
    if (slot.surfaceTiling !== undefined) {
      state.surfaceTiling = slot.surfaceTiling;
      if (typeof setSurfaceTiling === 'function') setSurfaceTiling(slot.surfaceTiling);
    }
  } else if (mode === 'netlane' && slot.netlane) {
    if (document.getElementById('netlaneWidthSlider')) {
      document.getElementById('netlaneWidthSlider').value = slot.netlane.width;
      const nwv = document.getElementById('netlaneWidthVal');
      if (nwv) nwv.textContent = `${Number(slot.netlane.width).toFixed(1)} m`;
    }
    if (document.getElementById('netlaneLengthSlider')) {
      document.getElementById('netlaneLengthSlider').value = slot.netlane.length;
      const nlv = document.getElementById('netlaneLengthVal');
      if (nlv) nlv.textContent = `${Number(slot.netlane.length).toFixed(1)} m`;
    }
  }

  // Restore rotation UI
  [0, 90, 180, 270].forEach(d => {
    const btn = document.getElementById(`rotBtn${d}`);
    if (btn) btn.classList.toggle('active', d === (slot.textureRotation || 0));
  });
  const rotValEl = document.getElementById('rotationVal');
  if (rotValEl) rotValEl.textContent = (slot.textureRotation || 0) === 0 ? '0° (Default)' : `${slot.textureRotation}°`;

  const btnFlipH = document.getElementById('btnFlipH');
  if (btnFlipH) {
    btnFlipH.style.borderColor = slot.flipH ? 'var(--primary)' : 'var(--border-color)';
    btnFlipH.style.color = slot.flipH ? 'var(--primary)' : 'var(--text-muted)';
    btnFlipH.style.background = slot.flipH ? 'rgba(0, 168, 255, 0.15)' : 'var(--bg-card)';
  }

  const btnFlipV = document.getElementById('btnFlipV');
  if (btnFlipV) {
    btnFlipV.style.borderColor = slot.flipV ? 'var(--primary)' : 'var(--border-color)';
    btnFlipV.style.color = slot.flipV ? 'var(--primary)' : 'var(--text-muted)';
    btnFlipV.style.background = slot.flipV ? 'rgba(0, 168, 255, 0.15)' : 'var(--bg-card)';
  }

  // Source image status badge
  if (slot.image) {
    const rawW = slot.image.naturalWidth || slot.image.width || 1024;
    const rawH = slot.image.naturalHeight || slot.image.height || 1024;
    if (typeof updateSourceImageBadge === 'function') {
      updateSourceImageBadge(rawW, rawH, rawW / rawH);
    }
  } else {
    const badge = document.getElementById('sourceImageStatusBadge');
    if (badge) badge.textContent = 'No Graphic Loaded (Drop PNG/JPG)';
  }

  updateCustomNormalUI();
  updateCustomMaskUI();
}

export function updateSetSlotsUI() {
  if (!state.setSlots) return;

  const count = getLoadedSlotsCount();

  // 1. Header Set Bundle Count Badge
  const headerCountBadge = document.getElementById('headerSetCountBadge') || document.getElementById('setBundleCountBadge');
  if (headerCountBadge) {
    headerCountBadge.textContent = `${count}/3 Items`;
    headerCountBadge.className = count === 3 ? 'set-bundle-count complete' : (count > 0 ? 'set-bundle-count partial' : 'set-bundle-count empty');
  }

  // 2. Header Mode Switcher Slots (Thumbnails, Subtitles & Badges)
  ['decal', 'surface', 'netlane'].forEach(mode => {
    const slot = state.setSlots[mode];
    const isLoaded = isSlotLoaded(mode);
    const capMode = mode.charAt(0).toUpperCase() + mode.slice(1);

    const thumbEl = document.getElementById(`headerThumb${capMode}`);
    const iconEl = document.getElementById(`headerIcon${capMode}`);
    if (thumbEl) {
      if (slot && slot.thumbnail) {
        thumbEl.src = slot.thumbnail;
        thumbEl.style.display = 'block';
        if (iconEl) iconEl.style.display = 'none';
      } else {
        thumbEl.src = '';
        thumbEl.style.display = 'none';
        if (iconEl) iconEl.style.display = 'block';
      }
    }

    const hasCustomName = Boolean(slot && slot.hasCustomName && slot.assetName);
    const subEl = document.getElementById(`headerSub${capMode}`);
    if (subEl) {
      if (isLoaded || hasCustomName) {
        subEl.textContent = slot.assetName || 'Unnamed';
      } else {
        subEl.textContent = 'Empty slot';
      }
    }

    const badgeEl = document.getElementById(`headerBadge${capMode}`);
    if (badgeEl) {
      badgeEl.textContent = isLoaded ? '✓ Loaded' : 'Empty';
      badgeEl.className = isLoaded ? 'mode-slot-badge loaded' : 'mode-slot-badge empty';
    }

    const packBadgeEl = document.getElementById(`headerPackBadge${capMode}`);
    if (packBadgeEl) {
      if ((isLoaded || hasCustomName) && slot && slot.assetName) {
        const registry = typeof getSetsRegistry === 'function' ? getSetsRegistry() : [];
        // An asset is only part of a pack if it is explicitly listed in that pack's assets array
        const matchedSet = registry.find(s =>
          (s.assets || []).some(a => a.name.toLowerCase() === slot.assetName.toLowerCase())
        );
        if (matchedSet && matchedSet.setName) {
          slot.seriesName = matchedSet.setName;
          slot.assetSeries = matchedSet.setName;
          packBadgeEl.textContent = `📁 ${matchedSet.setName}`;
          packBadgeEl.title = `In Pack / Series: ${matchedSet.setName}`;
          packBadgeEl.style.display = 'inline-flex';
        } else {
          slot.seriesName = '';
          slot.assetSeries = '';
          packBadgeEl.textContent = '';
          packBadgeEl.style.display = 'none';
        }
      } else {
        if (slot) {
          slot.seriesName = '';
          slot.assetSeries = '';
        }
        packBadgeEl.textContent = '';
        packBadgeEl.style.display = 'none';
      }
    }

    // Section 2 Source Image Quick-Slot Pills
    const qTab = document.getElementById(`quickSlot${capMode}`);
    if (qTab) {
      qTab.classList.toggle('active', state.appMode === mode);
      qTab.classList.toggle('is-loaded', isLoaded);
    }

    const qDot = document.getElementById(`quickDot${capMode}`);
    if (qDot) {
      qDot.className = isLoaded ? 'quick-slot-dot loaded' : 'quick-slot-dot';
    }

    const qName = document.getElementById(`slotName${capMode}`);
    if (qName) {
      qName.textContent = (isLoaded || hasCustomName) ? (slot.assetName || 'Unnamed') : 'Empty';
    }

    // Section 6 Export Card Items
    const expRow = document.getElementById(`setItemRow${capMode}`);
    if (expRow) {
      expRow.classList.toggle('is-loaded', isLoaded);
      expRow.classList.toggle('is-active', state.appMode === mode);
    }

    const expThumb = document.getElementById(`setExport${capMode}Thumb`);
    const expIcon = document.getElementById(`setExport${capMode}Icon`);
    if (expThumb) {
      if (slot && slot.thumbnail) {
        expThumb.src = slot.thumbnail;
        expThumb.style.display = 'block';
        if (expIcon) expIcon.style.display = 'none';
      } else {
        expThumb.src = '';
        expThumb.style.display = 'none';
        if (expIcon) expIcon.style.display = 'block';
      }
    }

    const expName = document.getElementById(`setExport${capMode}Name`);
    if (expName) {
      expName.textContent = isLoaded ? slot.assetName : '(Not Loaded)';
    }

    const expStatus = document.getElementById(`setExport${capMode}Status`);
    if (expStatus) {
      expStatus.textContent = isLoaded ? 'Ready' : 'Empty';
      expStatus.className = isLoaded ? 'set-item-status-tag loaded' : 'set-item-status-tag empty';
    }
  });

  // Source slot tag and name in Section 2
  const srcSlotTag = document.getElementById('sourceSlotModeTag');
  if (srcSlotTag) {
    srcSlotTag.textContent = `${state.appMode.toUpperCase()} SLOT`;
    srcSlotTag.className = `set-slot-tag tag-${state.appMode}`;
  }
  const srcSlotName = document.getElementById('sourceSlotAssetName');
  if (srcSlotName) {
    const curSlot = state.setSlots[state.appMode];
    srcSlotName.textContent = curSlot?.assetName || 'Unnamed';
  }

  const dropZoneTargetSlotLabel = document.getElementById('dropZoneTargetSlotLabel');
  if (dropZoneTargetSlotLabel) {
    dropZoneTargetSlotLabel.textContent = state.appMode.toUpperCase();
  }
  const dropZoneTargetSlotSub = document.getElementById('dropZoneTargetSlotSub');
  if (dropZoneTargetSlotSub) {
    if (state.appMode === 'surface') {
      dropZoneTargetSlotSub.textContent = 'Uploads will replace Surface texture only';
    } else if (state.appMode === 'netlane') {
      dropZoneTargetSlotSub.textContent = 'Uploads will replace Net Lane texture only';
    } else {
      dropZoneTargetSlotSub.textContent = 'Uploads will replace Decal graphic only';
    }
  }

  // Section 6 Export Count Badge & Subtext
  const expCountBadge = document.getElementById('setExportOverallCount') || document.getElementById('setExportCountBadge');
  if (expCountBadge) {
    expCountBadge.textContent = `${count} / 3 Items Loaded`;
    expCountBadge.className = count === 3 ? 'set-export-status complete' : (count > 0 ? 'set-export-status partial' : 'set-export-status empty');
  }

  const btnFullSet = document.getElementById('btnExportFullSet');
  if (btnFullSet) {
    if (count === 0) {
      btnFullSet.disabled = true;
      btnFullSet.title = 'Load at least one item into your set to export';
    } else {
      btnFullSet.disabled = false;
      btnFullSet.title = `Export complete set (${count} item${count > 1 ? 's' : ''}) in one unified .zip`;
    }
  }
}
window.updateSetSlotsUI = updateSetSlotsUI;

export function clearCurrentSlot() {
  const mode = state.appMode;
  if (!state.setSlots || !state.setSlots[mode]) return;
  const slot = state.setSlots[mode];

  slot.image = null;
  slot.imageSrc = '';
  slot.fileName = '';
  slot.sourceFileType = '';
  slot.sourceKind = 'none';
  slot.thumbnail = '';
  slot.isCustomImageLoaded = false;
  slot.hasUnsavedChanges = false;
  state.currentImage = null;
  state.sourceFileName = '';
  state.sourceFileType = '';
  state.sourceKind = 'none';
  state.isCustomImageLoaded = false;
  state.hasUnsavedChanges = false;

  // Clear identity fields back to blank since no graphic is loaded in this slot
  const nameInput = document.getElementById('assetName');
  if (nameInput) nameInput.value = '';
  slot.assetName = '';
  slot.hasCustomName = false;
  slot.category = '';
  state.currentLoadedAssetName = '';
  if (typeof setAssetCategory === 'function') {
    setAssetCategory('');
  }

  updateEmptyPreviewIndicator();
  updateConfigJson();
  renderAllMaps();
  updateSetSlotsUI();
  showToast(`Cleared ${mode.toUpperCase()} graphic from set`);
}
window.clearCurrentSlot = clearCurrentSlot;

// ==========================================
// Mode Switching: Decal Mode vs Surface Mode vs NetLane Mode
// ==========================================
export function setMode(mode, force = false, silent = false) {
  if (state.appMode === mode && !force) return;

  // 1. Save current active workspace into its slot first!
  saveCurrentSlotState(state.appMode);

  // 2. Switch mode
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

  const tabDecal = document.getElementById('presetTabDecal');
  const tabSurface = document.getElementById('presetTabSurface');
  const tabNetlane = document.getElementById('presetTabNetlane');
  if (tabDecal) tabDecal.className = mode === 'decal' ? 'preset-tab-pill active' : 'preset-tab-pill';
  if (tabSurface) tabSurface.className = mode === 'surface' ? 'preset-tab-pill active' : 'preset-tab-pill';
  if (tabNetlane) tabNetlane.className = mode === 'netlane' ? 'preset-tab-pill active' : 'preset-tab-pill';

  if (mode === 'decal') {
    if (guidanceBanner) guidanceBanner.className = 'guidance-banner';
    if (guidanceIcon) guidanceIcon.textContent = '💡';
    if (guidanceText) guidanceText.textContent = 'Decal graphic: transparent background, projected onto 3D surfaces.';

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

    if (dropTitleText) dropTitleText.textContent = 'Drop Source Graphic for Decal (PNG or JPG)';
    if (dropHintText) dropHintText.textContent = 'All ratios supported: 2:3 / 3:4 Posters, 16:9 Billboards, or 1:1 Road Marks';
    if (folderTitleText) folderTitleText.textContent = 'Cities: Skylines 2 Custom Decal Destination Folder';

    if (presetButtonsGroup) {
      presetButtonsGroup.innerHTML = `
        <div class="menu-preset-grid">
          <button type="button" class="menu-preset-btn" onclick="loadSample('manhole'); toggleMainProjectMenu(false);" title="Load circular utility manhole decal">
            <span class="menu-preset-icon">🕳️</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Manhole Cover</div>
              <div class="menu-preset-desc">1:1 Cast Iron Utility</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('arrow'); toggleMainProjectMenu(false);" title="Load directional road turn arrow decal">
            <span class="menu-preset-icon">↗️</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Turn Arrow</div>
              <div class="menu-preset-desc">Road Pavement Decal</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('poster'); toggleMainProjectMenu(false);" title="Load 2:3 vertical poster billboard decal">
            <span class="menu-preset-icon">🖼️</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Poster (2:3)</div>
              <div class="menu-preset-desc">Wall Advertisement</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('crack'); toggleMainProjectMenu(false);" title="Load asphalt crack surface wear decal">
            <span class="menu-preset-icon">⚡</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Asphalt Crack</div>
              <div class="menu-preset-desc">Road Wear &amp; Damage</div>
            </div>
          </button>
        </div>
      `;
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
        <div class="menu-preset-grid">
          <button type="button" class="menu-preset-btn" onclick="loadSample('cobblestone'); toggleMainProjectMenu(false);" title="Load seamless cobblestone pavement surface">
            <span class="menu-preset-icon">🪨</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Cobblestones</div>
              <div class="menu-preset-desc">Tiling Old-Town Stone</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('bricks'); toggleMainProjectMenu(false);" title="Load seamless red brick surface">
            <span class="menu-preset-icon">🧱</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Red Bricks</div>
              <div class="menu-preset-desc">Tiling Masonry Brick</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('tiles'); toggleMainProjectMenu(false);" title="Load seamless granite tile surface">
            <span class="menu-preset-icon">⬛</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Granite Tiles</div>
              <div class="menu-preset-desc">Tiling Polished Plaza</div>
            </div>
          </button>
        </div>
      `;
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
        <div class="menu-preset-grid">
          <button type="button" class="menu-preset-btn" onclick="loadSample('centerline'); toggleMainProjectMenu(false);" title="Load road dashed lane stripe net lane">
            <span class="menu-preset-icon">➖</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Dashed Line</div>
              <div class="menu-preset-desc">Extruded Centerline</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('yellowlines'); toggleMainProjectMenu(false);" title="Load road double yellow barrier net lane">
            <span class="menu-preset-icon">⏸️</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Double Yellow</div>
              <div class="menu-preset-desc">No-Passing Lines</div>
            </div>
          </button>
          <button type="button" class="menu-preset-btn" onclick="loadSample('curb'); toggleMainProjectMenu(false);" title="Load roadside granite curb edge net lane">
            <span class="menu-preset-icon">🛣️</span>
            <div class="menu-preset-text">
              <div class="menu-preset-name">Granite Curb</div>
              <div class="menu-preset-desc">Roadside Raised Edge</div>
            </div>
          </button>
        </div>
      `;
    }
  }

  // 3. Restore target mode slot state
  restoreSlotState(mode);

  // 4. Update UI & re-render maps
  updateConfigJson();
  updateSimulationText();
  checkRotationNameReminder();
  updateDecalAspectUI();
  renderAllMaps();
  applySamplePresetsVisibilityUI();
  updateSetSlotsUI();

  if (!silent) {
    const slot = state.setSlots[mode];
    const loaded = isSlotLoaded(mode);
    showToast(`Switched to ${mode.toUpperCase()} slot: ${loaded ? slot.assetName : 'Empty (ready for graphic)'}`);
  }
}

// ==========================================
// Sample Presets Visibility Controls (Hide / Unhide)
// ==========================================
export function applySamplePresetsVisibilityUI() {
  const isHidden = !!state.hideSamplePresets;

  // 1. Project & Tools menu preset section & collapsed indicator
  const container = document.getElementById('samplePresetsContainer');
  const collapsedBar = document.getElementById('samplePresetsCollapsedBar');
  if (container) container.style.display = isHidden ? 'none' : 'block';
  if (collapsedBar) collapsedBar.style.display = isHidden ? 'flex' : 'none';

  // 2. Project & Tools menu visibility toggle button & badge
  const menuBadge = document.getElementById('menuTogglePresetsBadge');
  if (menuBadge) {
    menuBadge.textContent = isHidden ? 'Hidden' : 'Visible';
    menuBadge.className = isHidden ? 'pref-badge pref-badge-hidden' : 'pref-badge pref-badge-active';
  }

  // 3. Sidebar Toolbar button
  const sidebarBtn = document.getElementById('sidebarPresetsToggleBtn');
  const sidebarLabel = document.getElementById('sidebarPresetsToggleLabel');
  if (sidebarBtn) {
    sidebarBtn.classList.toggle('presets-hidden', isHidden);
    sidebarBtn.title = isHidden ? 'Sample presets are hidden. Click to unhide.' : 'Sample presets are visible. Click to hide.';
  }
  if (sidebarLabel) {
    sidebarLabel.textContent = isHidden ? '⚡ Presets: Off' : '⚡ Presets: On';
  }

  // 4. Empty workspace preview card
  const emptyPresetCard = document.getElementById('emptyLoadSampleActionCard');
  const emptyQuickStarters = document.getElementById('emptyQuickStarters');
  const emptyUnhideContainer = document.getElementById('emptyUnhidePresetsContainer');
  const emptyActionsWrapper = document.getElementById('emptyCardActionsWrapper');

  if (emptyPresetCard) emptyPresetCard.style.display = isHidden ? 'none' : 'flex';
  if (emptyQuickStarters) emptyQuickStarters.style.display = isHidden ? 'none' : 'flex';
  if (emptyUnhideContainer) emptyUnhideContainer.style.display = isHidden ? 'block' : 'none';
  if (emptyActionsWrapper) emptyActionsWrapper.classList.toggle('single-action', isHidden);

  // 5. Welcome Splash modal
  const splashSampleBtn = document.getElementById('splashLoadSampleBtn');
  if (splashSampleBtn) splashSampleBtn.style.display = isHidden ? 'none' : 'inline-block';
}

// ==========================================
// Empty Preview State Indicator Logic
// ==========================================
export function updateEmptyPreviewIndicator() {
  const overlay = document.getElementById('emptyPreviewOverlay');
  const pill = document.getElementById('previewEmptyPill');
  const container = document.getElementById('previewCanvasContainer');

  if (overlay) {
    overlay.style.display = 'none';
  }
  if (pill) {
    pill.style.display = 'none';
  }
  if (container) {
    container.classList.remove('is-empty-state');
  }
  applySamplePresetsVisibilityUI();
}

export function toggleEmptyOverlayMinimize(_forceRestore) {
  const overlay = document.getElementById('emptyPreviewOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// ==========================================
// Primary Map Rendering Logic & Canvas Clearing
// ==========================================
export function clearCanvases() {
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
    canvasIcon.width = 256;
    canvasIcon.height = 256;
    ctxIcon.clearRect(0, 0, 256, 256);
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
}
window.clearCanvases = clearCanvases;

export function renderAllMaps() {
  updateEmptyPreviewIndicator();
  if (!state.currentImage) {
    clearCanvases();

    // Reset map card badges & footers to empty status
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

    // Still render icon map if any badge overlay or custom icon backdrop is enabled
    if (
      state.badge1Enabled ||
      state.badge2Enabled ||
      state.badge3Enabled ||
      state.badge4Enabled ||
      state.customIconBgImg
    ) {
      renderIconMap();
    }

    if (['single', 'base', 'normal', 'mask', 'icon'].includes(state.activeTab)) {
      updateSingleView();
    } else if (state.activeTab === 'tiled') {
      renderTiledView();
    } else if (state.activeTab === 'scale') {
      renderScaleView();
    }
    return;
  }

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

  refreshAssetChecklistModal();
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
      const detectedFileType = formatFileTypeLabel(file, file.type, 'Image Upload');
      state.currentImage = img;
      state.sourceFileName = file.name;
      state.sourceFileType = detectedFileType;
      state.sourceKind = 'upload';
      state.isCustomImageLoaded = true;
      state.hasUnsavedChanges = true;

      // Update current mode slot in the 3-in-1 Set!
      if (state.setSlots && state.setSlots[state.appMode]) {
        const slot = state.setSlots[state.appMode];
        slot.image = img;
        slot.imageSrc = event.target.result;
        slot.fileName = file.name;
        slot.sourceFileType = detectedFileType;
        slot.sourceKind = 'upload';
        slot.isCustomImageLoaded = true;
        slot.hasUnsavedChanges = true;
        slot.seriesName = '';
        slot.assetSeries = '';
        if (cleanName) {
          slot.assetName = cleanName;
          state.currentLoadedAssetName = cleanName;
        }
        if (typeof setAssetSeriesName === 'function') {
          setAssetSeriesName('');
        }

        try {
          const tc = document.createElement('canvas');
          tc.width = 64;
          tc.height = 64;
          const tctx = tc.getContext('2d');
          tctx.drawImage(img, 0, 0, 64, 64);
          slot.thumbnail = tc.toDataURL('image/png');
        } catch (_) {}
      }

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
      updateSetSlotsUI();
      
      const format = getAspectFormatName(nativeRatio);
      showToast(`Loaded ${file.name} into ${state.appMode.toUpperCase()} slot (${rawW}×${rawH} • ${format})`);
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
  const newName = (document.getElementById('assetName')?.value || '').trim();
  state.currentLoadedAssetName = newName;

  // Keep active mode slot name in sync so the top bar updates immediately
  const mode = state.appMode || 'decal';
  if (state.setSlots && state.setSlots[mode]) {
    state.setSlots[mode].assetName = newName;
    state.setSlots[mode].hasCustomName = Boolean(newName);
  }

  updateConfigJson();
  checkRotationNameReminder();
  updateUiPrioritySequenceUI();
  updateSetSlotsUI();
  if (typeof updateActiveDecalPackStatus === 'function') {
    updateActiveDecalPackStatus();
  }
  if (typeof renderSetThumbnailsStrip === 'function') {
    renderSetThumbnailsStrip();
  }
  scheduleSessionAutosave();
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
  state.sourceFileName = '';
  state.sourceFileType = '';
  state.sourceKind = 'none';
  state.isCustomImageLoaded = false;
  state.hasUnsavedChanges = false;
  state.pendingGuardAction = null;
  state.customNormalImg = null;
  state.customNormalFileName = '';
  state.customNormalFileType = '';
  state.customMaskImg = null;
  state.customMaskFileName = '';
  state.customMaskFileType = '';
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

  // Reset 3-in-1 Set Slots
  state.setSlots = {
    decal: createDefaultSlot('decal'),
    surface: createDefaultSlot('surface'),
    netlane: createDefaultSlot('netlane')
  };

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

  if (typeof setAssetCategory === 'function') {
    setAssetCategory('');
  }
  if (typeof updateCategoryQuickPickerForMode === 'function') {
    updateCategoryQuickPickerForMode(state.appMode);
  }

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

  // 6. Reset overlay text inputs to defaults & disable all overlays
  const defaultBadgeTexts = {
    badge1TextInput: 'CREATOR',
    seriesTextInput: 'GRAFFITI',
    extra1TextInput: 'EXTRA 1',
    extra2TextInput: 'EXTRA 2'
  };
  Object.entries(defaultBadgeTexts).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
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
  clearCanvases();

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
  updateEmptyPreviewIndicator();
  updateSetSlotsUI();
  showToast('Workspace wiped to a completely clear slate');
}

// ==========================================
// Selective Clear Workspace Modal Controllers
// ==========================================

const clearWorkspaceModalCtrl = createModalController('clearWorkspaceModal');

export function openClearModal() {
  if (typeof saveCurrentSlotState === 'function') {
    try { saveCurrentSlotState(); } catch (_) {}
  }

  updateClearModalStatus();

  const defaultChecked = ['chkClearSourceGraphic', 'chkClearNormalMap', 'chkClearMaskMap', 'chkClearBadges', 'chkClearMetadata', 'chkClearTransforms'];
  defaultChecked.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });
  const chkAllSlots = document.getElementById('chkClearAllSlots');
  if (chkAllSlots) chkAllSlots.checked = false;

  onClearOptionChange();
  clearWorkspaceModalCtrl.open();
}

export function closeClearModal() {
  clearWorkspaceModalCtrl.close();
}

export function closeClearModalOnBackdrop(e) {
  clearWorkspaceModalCtrl.closeOnBackdrop(e);
}

export function updateClearModalStatus() {
  const mode = state.appMode || 'decal';
  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

  // Label for active slot
  const activeLabel = document.getElementById('clearLabelActiveSlot');
  if (activeLabel) {
    activeLabel.textContent = `Active Slot Graphic (${modeLabel})`;
  }

  // Status for Active Slot Graphic
  const statusSource = document.getElementById('clearStatusSourceGraphic');
  if (statusSource) {
    const slot = state.setSlots ? state.setSlots[mode] : null;
    const hasImage = Boolean(state.currentImage || (slot && (slot.image || slot.isCustomImageLoaded)));
    if (hasImage) {
      const fileName = slot?.fileName || 'Image Loaded';
      statusSource.textContent = `✓ ${fileName.length > 18 ? fileName.slice(0, 16) + '...' : fileName}`;
      statusSource.className = 'clear-badge-pill active';
    } else {
      statusSource.textContent = 'None loaded';
      statusSource.className = 'clear-badge-pill empty';
    }
  }

  // Status for All 3-in-1 Slots
  const statusAllSlots = document.getElementById('clearStatusAllSlots');
  if (statusAllSlots) {
    let count = 0;
    ['decal', 'surface', 'netlane'].forEach(m => {
      const s = state.setSlots ? state.setSlots[m] : null;
      if (s && (s.image || s.isCustomImageLoaded || (s.thumbnail && s.thumbnail.length > 50))) {
        count++;
      }
    });
    if (count > 0) {
      statusAllSlots.textContent = `${count} of 3 loaded`;
      statusAllSlots.className = 'clear-badge-pill active';
    } else {
      statusAllSlots.textContent = 'All empty';
      statusAllSlots.className = 'clear-badge-pill empty';
    }
  }

  // Status for Normal Map
  const statusNormal = document.getElementById('clearStatusNormalMap');
  if (statusNormal) {
    const slot = state.setSlots ? state.setSlots[mode] : null;
    const bumpVal = document.getElementById('bumpIntensity')?.value;
    const isCustom = Boolean(state.customNormalImg || slot?.customNormalImg);
    const isCustomParams = (bumpVal && bumpVal !== '1.0' && bumpVal !== '1') || (document.getElementById('blurRadius')?.value !== '0');
    if (isCustom) {
      statusNormal.textContent = 'Custom upload active';
      statusNormal.className = 'clear-badge-pill active';
    } else if (isCustomParams) {
      statusNormal.textContent = `Modified (${bumpVal || '1.0'}×)`;
      statusNormal.className = 'clear-badge-pill active';
    } else {
      statusNormal.textContent = 'Default (1.0×)';
      statusNormal.className = 'clear-badge-pill empty';
    }
  }

  // Status for Mask Map
  const statusMask = document.getElementById('clearStatusMaskMap');
  if (statusMask) {
    const slot = state.setSlots ? state.setSlots[mode] : null;
    const metalVal = document.getElementById('metallic')?.value || '0';
    const smoothVal = document.getElementById('smoothness')?.value || '0';
    const isCustom = Boolean(state.customMaskImg || slot?.customMaskImg);
    const isCustomParams = metalVal !== '0' || smoothVal !== '0';
    if (isCustom) {
      statusMask.textContent = 'Custom upload active';
      statusMask.className = 'clear-badge-pill active';
    } else if (isCustomParams) {
      statusMask.textContent = `Met: ${metalVal}, Sm: ${smoothVal}`;
      statusMask.className = 'clear-badge-pill active';
    } else {
      statusMask.textContent = 'Default (0 / 0)';
      statusMask.className = 'clear-badge-pill empty';
    }
  }

  // Status for Badges
  const statusBadges = document.getElementById('clearStatusBadges');
  if (statusBadges) {
    let badgeCount = 0;
    if (state.badge1Enabled || state.designerLogoImg) badgeCount++;
    if (state.badge2Enabled || state.badge2Img) badgeCount++;
    if (state.badge3Enabled || state.badge3Img) badgeCount++;
    if (state.badge4Enabled || state.badge4Img) badgeCount++;
    if (badgeCount > 0) {
      statusBadges.textContent = `${badgeCount} badge${badgeCount > 1 ? 's' : ''} active`;
      statusBadges.className = 'clear-badge-pill active';
    } else {
      statusBadges.textContent = 'None active';
      statusBadges.className = 'clear-badge-pill empty';
    }
  }

  // Status for Metadata
  const statusMetadata = document.getElementById('clearStatusMetadata');
  if (statusMetadata) {
    const nameVal = document.getElementById('assetName')?.value?.trim();
    const seriesVal = document.getElementById('assetSeries')?.value?.trim();
    if (nameVal || seriesVal) {
      statusMetadata.textContent = nameVal || seriesVal || 'Custom Name';
      statusMetadata.className = 'clear-badge-pill active';
    } else {
      statusMetadata.textContent = 'Default';
      statusMetadata.className = 'clear-badge-pill empty';
    }
  }

  // Status for Transforms
  const statusTransforms = document.getElementById('clearStatusTransforms');
  if (statusTransforms) {
    const rot = state.textureRotation || 0;
    const fh = Boolean(state.flipH);
    const fv = Boolean(state.flipV);
    if (rot !== 0 || fh || fv) {
      const parts = [];
      if (rot !== 0) parts.push(`${rot}°`);
      if (fh) parts.push('Flip H');
      if (fv) parts.push('Flip V');
      statusTransforms.textContent = parts.join(', ');
      statusTransforms.className = 'clear-badge-pill active';
    } else {
      statusTransforms.textContent = 'Default (0°)';
      statusTransforms.className = 'clear-badge-pill empty';
    }
  }
}

export function onClearOptionChange() {
  const ids = [
    { chk: 'chkClearSourceGraphic', row: 'rowClearSourceGraphic' },
    { chk: 'chkClearAllSlots', row: 'rowClearAllSlots' },
    { chk: 'chkClearNormalMap', row: 'rowClearNormalMap' },
    { chk: 'chkClearMaskMap', row: 'rowClearMaskMap' },
    { chk: 'chkClearBadges', row: 'rowClearBadges' },
    { chk: 'chkClearMetadata', row: 'rowClearMetadata' },
    { chk: 'chkClearTransforms', row: 'rowClearTransforms' }
  ];

  let selectedCount = 0;
  ids.forEach(({ chk, row }) => {
    const chkEl = document.getElementById(chk);
    const rowEl = document.getElementById(row);
    if (chkEl && rowEl) {
      if (chkEl.checked) {
        rowEl.classList.add('selected');
        selectedCount++;
      } else {
        rowEl.classList.remove('selected');
      }
    }
  });

  const btnExecute = document.getElementById('btnClearSelectedExecute');
  if (btnExecute) {
    btnExecute.textContent = selectedCount === 0 ? 'Clear Selected (0)' : `Clear Selected (${selectedCount})`;
    btnExecute.disabled = selectedCount === 0;
    btnExecute.style.opacity = selectedCount === 0 ? '0.5' : '1';
    btnExecute.style.cursor = selectedCount === 0 ? 'not-allowed' : 'pointer';
  }
}

export function onClearAllSlotsToggle() {
  const chkAll = document.getElementById('chkClearAllSlots');
  const chkActive = document.getElementById('chkClearSourceGraphic');
  if (chkAll && chkAll.checked && chkActive) {
    chkActive.checked = true;
  }
  onClearOptionChange();
}

export function setClearModalPreset(preset) {
  const mapping = {
    all: ['chkClearSourceGraphic', 'chkClearAllSlots', 'chkClearNormalMap', 'chkClearMaskMap', 'chkClearBadges', 'chkClearMetadata', 'chkClearTransforms'],
    textures: ['chkClearSourceGraphic', 'chkClearAllSlots', 'chkClearNormalMap', 'chkClearMaskMap'],
    badges: ['chkClearBadges'],
    none: []
  };

  const toCheck = new Set(mapping[preset] || []);
  const allIds = ['chkClearSourceGraphic', 'chkClearAllSlots', 'chkClearNormalMap', 'chkClearMaskMap', 'chkClearBadges', 'chkClearMetadata', 'chkClearTransforms'];
  allIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = toCheck.has(id);
  });

  onClearOptionChange();
}

export function executeClearAllEverything() {
  closeClearModal();
  clearAllWorkspace(true);
}

export function executeClearSelected() {
  const chkSource = document.getElementById('chkClearSourceGraphic')?.checked;
  const chkAllSlots = document.getElementById('chkClearAllSlots')?.checked;
  const chkNormal = document.getElementById('chkClearNormalMap')?.checked;
  const chkMask = document.getElementById('chkClearMaskMap')?.checked;
  const chkBadges = document.getElementById('chkClearBadges')?.checked;
  const chkMetadata = document.getElementById('chkClearMetadata')?.checked;
  const chkTransforms = document.getElementById('chkClearTransforms')?.checked;

  const clearedSummary = [];
  const mode = state.appMode || 'decal';

  // If literally all options are checked, do a pristine full wipe
  if ((chkSource || chkAllSlots) && chkNormal && chkMask && chkBadges && chkMetadata && chkTransforms) {
    closeClearModal();
    clearAllWorkspace(true);
    return;
  }

  // 1. Clear All Slots OR Active Slot Graphic
  if (chkAllSlots) {
    ['decal', 'surface', 'netlane'].forEach(m => {
      if (state.setSlots && state.setSlots[m]) {
        const slot = state.setSlots[m];
        slot.image = null;
        slot.imageSrc = '';
        slot.fileName = '';
        slot.sourceFileType = '';
        slot.sourceKind = 'none';
        slot.thumbnail = '';
        slot.isCustomImageLoaded = false;
        slot.hasUnsavedChanges = false;
      }
    });
    state.currentImage = null;
    state.sourceFileName = '';
    state.sourceFileType = '';
    state.sourceKind = 'none';
    state.isCustomImageLoaded = false;
    state.hasUnsavedChanges = false;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    const dropTitle = document.getElementById('dropTitleText');
    if (dropTitle) dropTitle.textContent = 'Drop PNG or JPG decal texture';
    const dropHint = document.getElementById('dropHintText');
    if (dropHint) dropHint.textContent = 'Square 1:1 ratio • Transparent or solid';
    const sourceBadge = document.getElementById('sourceImageStatusBadge');
    if (sourceBadge) sourceBadge.textContent = 'No Image Loaded';

    clearedSummary.push('All Slot Graphics');
  } else if (chkSource) {
    if (state.setSlots && state.setSlots[mode]) {
      const slot = state.setSlots[mode];
      slot.image = null;
      slot.imageSrc = '';
      slot.fileName = '';
      slot.sourceFileType = '';
      slot.sourceKind = 'none';
      slot.thumbnail = '';
      slot.isCustomImageLoaded = false;
      slot.hasUnsavedChanges = false;
    }
    state.currentImage = null;
    state.sourceFileName = '';
    state.sourceFileType = '';
    state.sourceKind = 'none';
    state.isCustomImageLoaded = false;
    state.hasUnsavedChanges = false;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    const dropTitle = document.getElementById('dropTitleText');
    if (dropTitle) dropTitle.textContent = 'Drop PNG or JPG decal texture';
    const dropHint = document.getElementById('dropHintText');
    if (dropHint) dropHint.textContent = 'Square 1:1 ratio • Transparent or solid';
    const sourceBadge = document.getElementById('sourceImageStatusBadge');
    if (sourceBadge) sourceBadge.textContent = 'No Image Loaded';

    clearedSummary.push(`${mode.toUpperCase()} Graphic`);
  }

  // 2. Clear Normal Map
  if (chkNormal) {
    clearCustomNormal(false);
    const customNormalInput = document.getElementById('customNormalInput');
    if (customNormalInput) customNormalInput.value = '';

    const defaultBump = mode === 'surface' ? '2.5' : '3.5';
    const bumpSlider = document.getElementById('bumpIntensity');
    if (bumpSlider) {
      bumpSlider.value = defaultBump;
      const val = document.getElementById('bumpVal');
      if (val) val.textContent = `${defaultBump}×`;
    }
    const blurSlider = document.getElementById('blurRadius');
    if (blurSlider) {
      blurSlider.value = '0';
      const val = document.getElementById('blurVal');
      if (val) val.textContent = '0 px';
    }
    const invertBump = document.getElementById('invertBump');
    if (invertBump) invertBump.checked = false;
    const flipNormalY = document.getElementById('flipNormalY');
    if (flipNormalY) flipNormalY.checked = false;

    if (state.setSlots && state.setSlots[mode]) {
      state.setSlots[mode].customNormalImg = null;
      state.setSlots[mode].customNormalFileName = '';
      state.setSlots[mode].customNormalFileType = '';
      state.setSlots[mode].bumpIntensity = parseFloat(defaultBump);
      state.setSlots[mode].normalBlur = 0;
      state.setSlots[mode].invertBump = false;
      state.setSlots[mode].flipNormalY = false;
    }

    const cardNormalBadge = document.getElementById('cardNormalBadge');
    if (cardNormalBadge) {
      cardNormalBadge.textContent = 'None';
      cardNormalBadge.style.background = 'rgba(148, 163, 184, 0.15)';
      cardNormalBadge.style.color = 'var(--text-muted)';
    }
    const cardNormalFooter = document.getElementById('cardNormalFooter');
    if (cardNormalFooter) cardNormalFooter.textContent = 'No normal map generated';

    clearedSummary.push('Normal Map');
  }

  // 3. Clear Mask Map
  if (chkMask) {
    clearCustomMask(false);
    const customMaskInput = document.getElementById('customMaskInput');
    if (customMaskInput) customMaskInput.value = '';

    const defaultMetal = mode === 'surface' ? '0' : '180';
    const defaultSmooth = mode === 'surface' ? '30' : '80';

    const metalSlider = document.getElementById('metallic');
    if (metalSlider) {
      metalSlider.value = defaultMetal;
      const val = document.getElementById('metalVal');
      if (val) val.textContent = defaultMetal;
    }
    const smoothSlider = document.getElementById('smoothness');
    if (smoothSlider) {
      smoothSlider.value = defaultSmooth;
      const val = document.getElementById('smoothVal');
      if (val) val.textContent = defaultSmooth;
    }
    state.maskVariation = 0;

    if (state.setSlots && state.setSlots[mode]) {
      state.setSlots[mode].customMaskImg = null;
      state.setSlots[mode].customMaskFileName = '';
      state.setSlots[mode].customMaskFileType = '';
      state.setSlots[mode].metallic = parseInt(defaultMetal, 10);
      state.setSlots[mode].smoothness = parseInt(defaultSmooth, 10);
      state.setSlots[mode].maskVariation = 0;
    }

    clearedSummary.push('Mask Map');
  }

  // 4. Clear Badges & Overlays
  if (chkBadges) {
    const defaultBadgeTexts = {
      badge1TextInput: 'CREATOR',
      seriesTextInput: 'GRAFFITI',
      extra1TextInput: 'EXTRA 1',
      extra2TextInput: 'EXTRA 2'
    };
    Object.entries(defaultBadgeTexts).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
    ['designerLogoInput', 'seriesLogoInput', 'extra1LogoInput', 'extra2LogoInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    state.badge1Enabled = false;
    state.badge2Enabled = false;
    state.badge3Enabled = false;
    state.badge4Enabled = false;
    state.designerLogoImg = null;
    state.badge2Img = null;
    state.badge3Img = null;
    state.badge4Img = null;
    state.badge1FileName = '';
    state.badge2FileName = '';
    state.badge3FileName = '';
    state.badge4FileName = '';

    if (typeof clearDesignerLogo === 'function') clearDesignerLogo();
    if (typeof clearSeriesLogo === 'function') clearSeriesLogo();
    if (typeof clearExtra1Logo === 'function') clearExtra1Logo();
    if (typeof clearExtra2Logo === 'function') clearExtra2Logo();
    if (typeof clearIconBgImage === 'function') clearIconBgImage();
    if (typeof window.syncAllBadgeCheckboxes === 'function') {
      window.syncAllBadgeCheckboxes();
    }

    const cardIconBadge = document.getElementById('cardIconBadge');
    if (cardIconBadge) {
      cardIconBadge.textContent = 'None';
      cardIconBadge.style.background = 'rgba(148, 163, 184, 0.15)';
      cardIconBadge.style.color = 'var(--text-muted)';
    }
    const cardIconFooter = document.getElementById('cardIconFooter');
    if (cardIconFooter) cardIconFooter.textContent = 'No icon generated';

    clearedSummary.push('Badges & Overlays');
  }

  // 5. Clear Metadata & Dimensions
  if (chkMetadata) {
    const assetNameInput = document.getElementById('assetName');
    if (assetNameInput) assetNameInput.value = '';
    state.currentLoadedAssetName = '';

    if (typeof setAssetCategory === 'function') {
      setAssetCategory('');
    }

    const seriesInput = document.getElementById('assetSeries');
    if (seriesInput) seriesInput.value = '';

    const activeSeriesBadge = document.getElementById('activeSeriesBadge');
    if (activeSeriesBadge) activeSeriesBadge.textContent = 'None';

    const dimW = document.getElementById('dimWidth'); if (dimW) dimW.value = mode === 'decal' ? '1.8' : '2.0';
    const dimH = document.getElementById('dimHeight'); if (dimH) dimH.value = mode === 'decal' ? '1.8' : '2.0';
    const dimD = document.getElementById('dimDepth'); if (dimD) dimD.value = '0.5';

    if (state.setSlots && state.setSlots[mode]) {
      state.setSlots[mode].assetName = '';
      state.setSlots[mode].hasCustomName = false;
      state.setSlots[mode].category = '';
      state.setSlots[mode].seriesName = '';
      state.setSlots[mode].dimensions = {
        width: mode === 'decal' ? 1.8 : 2.0,
        height: mode === 'decal' ? 1.8 : 2.0,
        depth: 0.5,
        aspectLocked: false,
        lockedRatio: 1.0
      };
    }

    clearedSummary.push('Asset Metadata');
  }

  // 6. Clear Transforms
  if (chkTransforms) {
    setTextureRotation(0);
    if (state.flipH) toggleFlipHorizontal();
    if (state.flipV) toggleFlipVertical();
    state.originalNameBeforeTransform = '';
    state.isReminderDismissed = false;
    dismissRotationReminder();
    const rotFlag = document.getElementById('rotationNameFlag');
    if (rotFlag) rotFlag.style.display = 'none';

    if (state.setSlots && state.setSlots[mode]) {
      state.setSlots[mode].textureRotation = 0;
      state.setSlots[mode].flipH = false;
      state.setSlots[mode].flipV = false;
    }

    clearedSummary.push('Transforms');
  }

  // Post-clear view & map synchronizations
  if (!state.currentImage && (chkSource || chkAllSlots)) {
    clearCanvases();
  } else {
    renderAllMaps();
  }

  updateConfigJson();
  updateEmptyPreviewIndicator();
  updateSetSlotsUI();
  closeClearModal();

  if (clearedSummary.length > 0) {
    showToast(`✓ Cleared: ${clearedSummary.join(', ')}`);
  } else {
    showToast('No items were selected to clear');
  }
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
  setHideSamplePresets,
  toggleHideSamplePresets,
  applySamplePresetsVisibilityUI,
  updateEmptyPreviewIndicator,
  toggleEmptyOverlayMinimize,
  handleFileSelect,
  processUploadedFile,
  clearAllWorkspace,
  openClearModal,
  closeClearModal,
  closeClearModalOnBackdrop,
  updateClearModalStatus,
  onClearOptionChange,
  onClearAllSlotsToggle,
  setClearModalPreset,
  executeClearSelected,
  executeClearAllEverything,
  onResolutionChange,
  onAssetNameInput,
  onNormalOpacityChange,
  onBaseOpacityChange,
  onMetallicOpacityChange,
  getLayerMaskValue,
  onLayerMaskChange,
  onDrawOrderChange,
  onGlobalMaterialChange,
  onUvScaleChange,
  setUvScale,
  onNetlaneParamChange,
  getJsonSchemaMode,
  setJsonSchemaMode,
  setNetlaneJsonPreviewTab,
  updateConfigJson,
  copyConfigJson,
  copyDecalPath,
  downloadConfigJson,
  downloadSingleMap,
  downloadAllMaps,
  buildExportReadmeText,
  exportZipPackage,
  exportCompleteSetZip,
  serializeCurrentProject,
  deserializeAndLoadProject,
  saveProjectToFile,
  saveFileWithPicker,
  exportAssetDirectToFolder,
  openSaveModal,
  closeSaveModal,
  closeSaveModalOnBackdrop,
  openEmptySlotsModal,
  closeEmptySlotsModal,
  closeEmptySlotsModalOnBackdrop,
  openPrepareExportModal,
  closePrepareExportModal,
  closePrepareExportModalOnBackdrop,
  updatePrepareExportProgress,
  triggerUploadFromEmptyModal,
  loadSampleFromEmptyModal,
  switchToSlotFromEmptyModal,
  areAllSlotsEmpty,
  isCurrentSlotEmpty,
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
  openDonateModal,
  closeDonateModal,
  closeDonateModalOnBackdrop,
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
  switchBadgeSubtab,
  syncAllBadgeCheckboxes,
  copyBadgeStyle,
  runBadgeStyleCopyAction,
  toggleBadge1Enable,
  setCreatorBadgeMode,
  onBadge1TextChange,
  clearCreatorText,
  setBadge1TextPreset,
  onBadge1FontChange,
  toggleBadge1Bold,
  toggleBadge1Italic,
  toggleBadge1LetterSpacing,
  onBadge1PtSizeChange,
  toggleBadge1TextGrad,
  onBadge1TextGradInput,
  setBadge1TextGradDir,
  applyBadge1TextGradPresetByName,
  setCreatorColorMode,
  setCreatorColorTheme,
  setCreatorGradDirection,
  onCreatorCustomColorInput,
  onCreatorSolidColorInput,
  applyCreatorGradPreset,
  applyCreatorGradPresetByName,
  handleDesignerLogoSelect,
  clearDesignerLogo,
  applyPresetLogo,
  onCreatorPositionChange,
  onCreatorCoordChange,
  snapCreatorCoord,
  onBadge1PaddingChange,
  onBadge1InnerPaddingChange,
  toggleBadge2Enable,
  onSeriesFontChange,
  toggleSeriesBold,
  toggleSeriesItalic,
  toggleSeriesLetterSpacing,
  onSeriesPtSizeChange,
  toggleBadge2TextGrad,
  onBadge2TextGradInput,
  setBadge2TextGradDir,
  applyBadge2TextGradPresetByName,
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
  applySeriesGradPresetByName,
  handleSeriesLogoSelect,
  clearSeriesLogo,
  onSeriesPositionChange,
  onSeriesCoordChange,
  snapSeriesCoord,
  onBadge2PaddingChange,
  onBadge2InnerPaddingChange,
  onIconBadgeScaleChange,
  onIconBadgeOpacityChange,
  saveIconBadgeDefaults,
  loadIconBadgeDefaults,
  resetIconBadgeDefaults,
  clearIconBadgeDefaults,
  toggleAutoApplyDefaults,
  initBadgeCanvasInteractions,
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
  toggleFloatingViewportControls,
  scrollTabsNav,
  checkTabScrollButtons,
  setAssetCategory,
  onAssetCategoryInput,
  applyCategoryQuickPick,
  updateCategoryQuickPickerForMode,
  getAssetSeriesName,
  setAssetSeriesName,
  onAssetSeriesInput,
  applySeriesQuickPick,
  syncWithSeriesBadge,
  updateRibbonSeriesDropdown,
  renderSeriesChips,
  getAllLibrarySeries,
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
  openAndScrollToSection,
  scrollToNormalMapArea,
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
  floatJsonPreview,
  dockJsonPreview,
  toggleJsonFloat,
  toggleMinimizeJsonFloat,
  resetJsonFloatingPosition,
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
  undoLastRemovedAsset,
  removeAssetFromSet,
  removeCurrentDecalFromActiveSet,
  addCurrentWorkspaceToSet,
  resequenceCurrentSetActiveSet,
  moveSetAsset,
  openManageSetItemsModal,
  closeManageSetItemsModal,
  closeManageSetItemsModalOnBackdrop,
  renderManageSetItemsTable,
  openAddFromLibraryModal,
  closeAddFromLibraryModal,
  closeAddFromLibraryModalOnBackdrop,
  renderAddFromLibraryList,
  toggleLibraryPickSelection,
  confirmAddFromLibraryToSet,
  switchActivePackFromSelect,
  updateActiveDecalPackStatus,
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
  openBackupAllDataModal,
  closeBackupAllDataModal,
  closeBackupAllDataModalOnBackdrop,
  exportAllSetsAndStorageBackup,
  copyBackupJsonToClipboard,
  handleBackupFileSelect,
  handleBackupModalFileSelect,
  handleBackupDropzoneDragOver,
  handleBackupDropzoneDragLeave,
  handleBackupDropzoneDrop,
  inspectBackupFile,
  confirmRestoreBackup,
  cancelPendingRestore,
  refreshBackupModalStats,
  resetAllLocalDataWithConfirmation,
  openWelcomeSplash,
  closeWelcomeSplash,
  closeWelcomeSplashOnBackdrop,
  toggleNeverShowSplashAgain,
  continueSessionFromSplash,
  startWizardFromSplash,
  startBlankFromSplash,
  saveCurrentSessionSnapshot,
  updateSplashScreenSessionInfo,
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
  confirmNewStandaloneAsset,
  openAssetChecklistModal,
  closeAssetChecklistModal,
  closeAssetChecklistModalOnBackdrop,
  refreshAssetChecklistModal,
  jumpToChecklistTarget,
  switchChecklistSlot,
  setChecklistJsonSchema,
  toggleChecklistMetadata,
  onChecklistMetadataInput,
  addCustomMetadataEntry,
  updateCustomMetadataEntry,
  removeCustomMetadataEntry
});

// ==========================================
// Session Snapshot & Quick Launch Handlers
// ==========================================
let sessionAutosaveTimer = null;

export function formatRelativeSessionTime(timestamp) {
  if (!timestamp) return 'Ready to resume';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Saved just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Saved ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Saved ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Saved ${diffDays}d ago`;
}

export function getStoredSessionData() {
  try {
    const raw = localStorage.getItem('cs2_autosave_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.project || parsed.meta)) {
        return parsed;
      }
    }
  } catch (_) {}

  try {
    const rawMeta = localStorage.getItem('cs2_autosave_session_meta');
    if (rawMeta) {
      const meta = JSON.parse(rawMeta);
      return { meta, project: null };
    }
  } catch (_) {}

  return null;
}

export function saveCurrentSessionSnapshot(force = false) {
  try {
    if (typeof serializeCurrentProject !== 'function') return;
    const proj = serializeCurrentProject();
    if (!proj) return;

    const assetName = proj.assetName || state.currentLoadedAssetName || 'CustomAsset';
    const appMode = proj.appMode || state.appMode || 'decal';
    const sessionObj = {
      format: 'cs2-active-session',
      timestamp: Date.now(),
      meta: {
        assetName: assetName,
        appMode: appMode,
        category: proj.assetCategory || 'RoadMarkings',
        dimensions: proj.dimensions || {},
        hasCustomImage: !!state.isCustomImageLoaded,
        timestamp: Date.now()
      },
      project: proj
    };

    try {
      localStorage.setItem('cs2_autosave_session', JSON.stringify(sessionObj));
      localStorage.setItem('cs2_autosave_session_meta', JSON.stringify(sessionObj.meta));
    } catch (e) {
      // If project payload exceeds quota (e.g. large base64 image), save meta and store in IndexedDB
      try {
        localStorage.setItem('cs2_autosave_session_meta', JSON.stringify(sessionObj.meta));
        if (typeof saveAssetToIndexedDB === 'function') {
          saveAssetToIndexedDB({ ...proj, assetName: '__cs2_last_session__' });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.warn('Session auto-save warning:', err);
  }
}

export function scheduleSessionAutosave() {
  if (sessionAutosaveTimer) clearTimeout(sessionAutosaveTimer);
  sessionAutosaveTimer = setTimeout(() => {
    saveCurrentSessionSnapshot();
  }, 1000);
}

export function updateSplashScreenSessionInfo() {
  const infoTextEl = document.getElementById('splashSessionInfoText');
  const badgeEl = document.getElementById('splashSessionStatusBadge');
  if (!infoTextEl) return;

  const stored = getStoredSessionData();
  if (stored && stored.meta) {
    const meta = stored.meta;
    const timeStr = formatRelativeSessionTime(meta.timestamp);
    const modeLabel = (meta.appMode || 'decal').toUpperCase();
    infoTextEl.textContent = `Resume "${meta.assetName}" (${modeLabel}) • ${timeStr}`;
    if (badgeEl) {
      badgeEl.textContent = 'Draft Saved';
      badgeEl.className = 'splash-card-badge badge-cyan';
    }
    return;
  }

  // Fallback: Check library assets or current active draft
  const lib = typeof getSavedLibraryFromMemory === 'function' ? getSavedLibraryFromMemory() : [];
  if (lib && lib.length > 0) {
    const latest = lib[lib.length - 1];
    infoTextEl.textContent = `Library: "${latest.assetName}" (${(latest.appMode || 'decal').toUpperCase()})`;
    if (badgeEl) {
      badgeEl.textContent = 'From Library';
      badgeEl.className = 'splash-card-badge badge-cyan';
    }
    return;
  }

  const currentName = state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || 'CustomDecal';
  const modeLabel = (state.appMode || 'decal').toUpperCase();
  infoTextEl.textContent = `Current: "${currentName}" (${modeLabel})`;
  if (badgeEl) {
    badgeEl.textContent = 'Active Draft';
    badgeEl.className = 'splash-card-badge badge-cyan';
  }
}

export async function continueSessionFromSplash() {
  closeWelcomeSplash();

  const stored = getStoredSessionData();
  if (stored && stored.project) {
    try {
      deserializeAndLoadProject(stored.project);
      showToast(`✓ Resumed session: ${stored.project.assetName || 'Custom Asset'}`);
      return;
    } catch (err) {
      console.warn('Could not deserialize session project:', err);
    }
  }

  // Check if saved in IndexedDB
  if (typeof getSavedLibraryFromMemory === 'function') {
    const lib = getSavedLibraryFromMemory();
    const sessionMatch = lib.find(a => a.assetName === '__cs2_last_session__');
    if (sessionMatch) {
      try {
        deserializeAndLoadProject(sessionMatch);
        showToast(`✓ Resumed session: ${sessionMatch.assetName || 'Custom Asset'}`);
        return;
      } catch (_) {}
    }
    if (lib.length > 0) {
      const latest = lib[lib.length - 1];
      try {
        deserializeAndLoadProject(latest);
        showToast(`✓ Resumed library asset: ${latest.assetName}`);
        return;
      } catch (_) {}
    }
  }

  // If no saved session, workspace is already open
  const name = state.currentLoadedAssetName || document.getElementById('assetName')?.value?.trim() || 'Workspace';
  showToast(`✓ Continuing active session: ${name}`);
}

export function startWizardFromSplash() {
  closeWelcomeSplash();
  openNewStandaloneAssetWizard();
  showToast('⚡ Started New Asset Setup Wizard');
}

export function startBlankFromSplash() {
  closeWelcomeSplash();
  clearAllWorkspace(true);
  showToast('✨ Started blank workspace. Drop your texture to begin!');
}

// ==========================================
// Quick Guide Splash Screen Logic
// ==========================================
const welcomeSplashModalCtrl = createModalController('welcomeSplashModal');

export function openWelcomeSplash() {
  updateSplashScreenSessionInfo();
  welcomeSplashModalCtrl.open();
  const chk = document.getElementById('splashNeverShowCheckbox');
  if (chk) {
    chk.checked = localStorage.getItem('cs2_hide_welcome_splash') === 'true';
  }
}

export function closeWelcomeSplash() {
  welcomeSplashModalCtrl.close();
}

export function closeWelcomeSplashOnBackdrop(e) {
  welcomeSplashModalCtrl.closeOnBackdrop(e);
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
  const hidePresets = localStorage.getItem('cs2_hide_sample_presets') === 'true';
  state.hideSamplePresets = hidePresets;

  if (!hidePresets) {
    try {
      // Bootstrap ONLY decal slot with starter item; Surface and Net Lane start completely blank/empty until loaded
      const decalSlotData = createSampleSlot('manhole');
      Object.assign(state.setSlots.decal, decalSlotData);
    } catch (e) {
      console.warn('Could not populate initial sample slots:', e);
    }
  }

  initBadgeDefaults();
  setMode('decal', true, true);
  if (!hidePresets && state.setSlots.decal.image) {
    state.currentImage = state.setSlots.decal.image;
    renderAllMaps();
  } else if (!hidePresets) {
    loadSample('manhole');
  } else {
    state.currentImage = null;
    state.isCustomImageLoaded = false;
    updateEmptyPreviewIndicator();
  }
  updateSetSlotsUI();
  applySamplePresetsVisibilityUI();
  updateDecalAspectUI();
  updateUiPrioritySequenceUI();
  initBadgeCanvasInteractions();
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

  const handleWorkspaceDrop = (files) => {
    if (!files || files.length === 0) return;
    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      importCommunityAssetFromZip(files[0]);
    } else if (files.length > 1) {
      importCommunityAssetFromFiles(files);
    } else {
      processUploadedFile(files[0]);
    }
  };

  bindDragAndDropZone('dropZone', handleWorkspaceDrop);
  bindDragAndDropZone(document.querySelector('.preview-area'), handleWorkspaceDrop);

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

  // Prevent Enter / Return from unexpectedly submitting forms, triggering close buttons, or dismissing windows
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || (target.tagName === 'TEXTAREA' && !e.shiftKey))) {
        // Special case: Google Font inputs load the font without closing the window/box
        if (target.classList && target.classList.contains('google-font-text-input')) {
          e.preventDefault();
          if (target.id === 'creatorGoogleFontInput') addCustomGoogleFontFromInput('creator', false);
          else if (target.id === 'seriesGoogleFontInput') addCustomGoogleFontFromInput('series', false);
          else if (target.id === 'extra1GoogleFontInput') addCustomGoogleFontFromInput('extra1', false);
          else if (target.id === 'extra2GoogleFontInput') addCustomGoogleFontFromInput('extra2', false);
          return;
        }

        // Prevent Enter in text or number inputs from triggering modal close buttons or form submits
        e.preventDefault();

        // Trigger change event to ensure any live updates commit cleanly
        target.dispatchEvent(new Event('change', { bubbles: true }));
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
      closeClearModal();
      toggleImportDropdown(false);
      hideFieldHelp(true);
      closeWelcomeSplash();
      closeHelpModal();
      closeEmptySlotsModal();
      closePrepareExportModal();
      closeSetRegistryModal();
      closeCreateSetAssetModal();
      closeCreateNewSetWizard();
      closeNewStandaloneAssetWizard();
      closeAssetChecklistModal();
      if (typeof window.closePackPriorityModal === 'function') window.closePackPriorityModal();
      if (typeof window.closeBackupAllDataModal === 'function') window.closeBackupAllDataModal();
      if (typeof window.closeManageSetItemsModal === 'function') window.closeManageSetItemsModal();
      if (typeof window.closeAddFromLibraryModal === 'function') window.closeAddFromLibraryModal();
      if (typeof window.closeDonateModal === 'function') window.closeDonateModal();
      cancelGuardAction();
    }
  });

  // Automatically snapshot session state on tab switch or page leave
  window.addEventListener('beforeunload', () => {
    saveCurrentSessionSnapshot(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveCurrentSessionSnapshot(true);
    }
  });
});