// ==========================================
// Standalone New Asset Setup Wizard
// Guided 3-step setup for independent or set-assigned assets
// ==========================================

import { state, showToast, getCanvases, drawImageSquare } from './state.js';
import { getSetsRegistry, saveSetsRegistry, getSetProfile } from './setRegistry.js';
import { renderIconMap } from './badges.js';

let standWizardStep = 1;
let standWizardMode = 'decal';
let standWizardLoadedImage = null;
let standWizardNormalMode = 'auto'; // 'auto' | 'custom'
let standWizardLoadedNormal = null;
let standWizardNormalFileName = '';

/**
 * Open the standalone asset setup wizard
 */
export function openNewStandaloneAssetWizard() {
  const modal = document.getElementById('newAssetWizardModal');
  if (!modal) return;

  // Initialize defaults from current workspace state
  standWizardMode = state.appMode || 'decal';
  standWizardLoadedImage = null;

  // Sync mode choice
  selectStandWizardMode(standWizardMode);

  // Set initial name
  const nameInput = document.getElementById('standAssetName');
  if (nameInput) {
    const existingName = document.getElementById('assetName')?.value?.trim();
    nameInput.value = existingName || (standWizardMode === 'surface' ? 'CustomSurface_Pavement_01' : (standWizardMode === 'netlane' ? 'CustomNetLane_Line_01' : 'CustomRoadMarking_01'));
  }

  // Set category
  const catInput = document.getElementById('standCategory');
  if (catInput) {
    const existingCat = document.getElementById('category')?.value?.trim() || document.getElementById('assetCategory')?.value?.trim();
    catInput.value = existingCat || (standWizardMode === 'surface' ? 'Pavement' : (standWizardMode === 'netlane' ? 'RoadMarkings' : 'RoadMarkings'));
  }

  // Populate existing sets dropdown
  populateStandWizardExistingSets();

  // Reset Set Membership to standalone
  const setMembership = document.getElementById('standSetMembership');
  if (setMembership) {
    setMembership.value = 'standalone';
  }
  const existingSetRow = document.getElementById('standExistingSetRow');
  if (existingSetRow) {
    existingSetRow.style.display = 'none';
  }

  // Set initial priority
  const prioInput = document.getElementById('standPriority');
  if (prioInput) {
    const existingPrio = parseInt(document.getElementById('uiPriorityInput')?.value || document.getElementById('drawOrderSlider')?.value || '50', 10);
    prioInput.value = isNaN(existingPrio) ? (standWizardMode === 'surface' ? -50 : 50) : existingPrio;
  }
  onStandWizardPriorityInput();

  // Set dimensions from current inputs
  const dimW = document.getElementById('standDimW');
  const dimH = document.getElementById('standDimH');
  const dimD = document.getElementById('standDimD');
  if (dimW) dimW.value = document.getElementById('dimWidth')?.value || '2.0';
  if (dimH) dimH.value = document.getElementById('dimHeight')?.value || '2.0';
  if (dimD) dimD.value = document.getElementById('dimDepth')?.value || '0.5';

  const uvScale = document.getElementById('standUvScale');
  if (uvScale) {
    uvScale.value = document.getElementById('uvScale')?.value || '1.0';
    const badge = document.getElementById('standSurfaceUvBadge');
    if (badge) badge.textContent = parseFloat(uvScale.value).toFixed(2);
  }

  const netW = document.getElementById('standNetlaneWidth');
  const netL = document.getElementById('standNetlaneLength');
  if (netW) netW.value = document.getElementById('netlaneWidth')?.value || '0.2';
  if (netL) netL.value = document.getElementById('netlaneLength')?.value || '5.0';

  updateStandWizardDimSummary();

  // Reset graphic dropzone view
  const emptyView = document.getElementById('standDropEmptyView');
  const selView = document.getElementById('standDropSelectedView');
  if (emptyView) emptyView.style.display = 'flex';
  if (selView) selView.style.display = 'none';
  const fileInput = document.getElementById('standGraphicFileInput');
  if (fileInput) fileInput.value = '';

  // Reset normal map options to Auto-Generated
  standWizardNormalMode = 'auto';
  standWizardLoadedNormal = null;
  standWizardNormalFileName = '';
  setStandWizardNormalMode('auto');
  const normalEmptyView = document.getElementById('standNormalDropEmptyView');
  const normalSelView = document.getElementById('standNormalDropSelectedView');
  if (normalEmptyView) normalEmptyView.style.display = 'flex';
  if (normalSelView) normalSelView.style.display = 'none';
  const normalFileInput = document.getElementById('standNormalFileInput');
  if (normalFileInput) normalFileInput.value = '';
  const invertY = document.getElementById('standInvertNormalY');
  if (invertY) invertY.checked = false;

  // Go to step 1
  setStandWizardStep(1);

  // Show modal
  modal.style.display = 'flex';
  modal.classList.add('active');
}
window.openNewStandaloneAssetWizard = openNewStandaloneAssetWizard;

/**
 * Close wizard modal
 */
export function closeNewStandaloneAssetWizard() {
  const modal = document.getElementById('newAssetWizardModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}
window.closeNewStandaloneAssetWizard = closeNewStandaloneAssetWizard;

/**
 * Backdrop click handler
 */
export function closeNewStandaloneAssetWizardOnBackdrop(e) {
  if (e && e.target && e.target.id === 'newAssetWizardModal') {
    closeNewStandaloneAssetWizard();
  }
}
window.closeNewStandaloneAssetWizardOnBackdrop = closeNewStandaloneAssetWizardOnBackdrop;

/**
 * Set current step (1, 2, or 3)
 */
export function setStandWizardStep(step) {
  standWizardStep = step;

  // Tabs
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`standTab${i}`);
    const panel = document.getElementById(`standStepPanel${i}`);
    if (tab) {
      tab.classList.toggle('active', i === step);
      tab.classList.toggle('completed', i < step);
    }
    if (panel) {
      panel.style.display = (i === step) ? 'block' : 'none';
    }
  }

  // Buttons
  const btnBack = document.getElementById('btnStandWizardBack');
  const btnNext = document.getElementById('btnStandWizardNext');
  const btnFinish = document.getElementById('btnStandWizardFinish');

  if (btnBack) btnBack.style.display = (step > 1) ? 'inline-flex' : 'none';

  if (step === 3) {
    if (btnNext) btnNext.style.display = 'none';
    if (btnFinish) btnFinish.style.display = 'inline-flex';
  } else {
    if (btnNext) {
      btnNext.style.display = 'inline-flex';
      btnNext.textContent = step === 1 ? 'Next: Asset Identity →' : 'Next: Dimensions & Materials →';
    }
    if (btnFinish) btnFinish.style.display = 'none';
  }

  updateStandWizardSummary();
}
window.setStandWizardStep = setStandWizardStep;

export function standWizardGoNext() {
  if (standWizardStep === 1) {
    // Step 1: Graphic
    if (!standWizardLoadedImage) {
      useStandWizardStarterGraphic();
    }
    setStandWizardStep(2);
  } else if (standWizardStep === 2) {
    // Step 2: Identity
    const assetName = document.getElementById('standAssetName')?.value?.trim();
    if (!assetName) {
      showToast('Please enter an Asset Name before proceeding');
      return;
    }
    setStandWizardStep(3);
  }
}
window.standWizardGoNext = standWizardGoNext;

export function standWizardGoBack() {
  if (standWizardStep > 1) {
    setStandWizardStep(standWizardStep - 1);
  }
}
window.standWizardGoBack = standWizardGoBack;

/**
 * Switch mode inside wizard (decal, surface, netlane)
 */
export function selectStandWizardMode(mode) {
  standWizardMode = mode;

  // Buttons
  const btnDecal = document.getElementById('standModeDecal');
  const btnSurface = document.getElementById('standModeSurface');
  const btnNetlane = document.getElementById('standModeNetlane');
  if (btnDecal) btnDecal.classList.toggle('active', mode === 'decal');
  if (btnSurface) btnSurface.classList.toggle('active', mode === 'surface');
  if (btnNetlane) btnNetlane.classList.toggle('active', mode === 'netlane');

  // Summary Label
  const summaryLabel = document.getElementById('standModeSummaryLabel');
  if (summaryLabel) {
    if (mode === 'decal') summaryLabel.textContent = 'Decal (Projected Ground Marking)';
    else if (mode === 'surface') summaryLabel.textContent = 'Surface (Seamless Tiled Material)';
    else if (mode === 'netlane') summaryLabel.textContent = 'Net Lane (Road Curb / Spline Mesh)';
  }

  // Boxes
  const decalBox = document.getElementById('standDecalDimsBox');
  const surfaceBox = document.getElementById('standSurfaceDimsBox');
  const netlaneBox = document.getElementById('standNetlaneDimsBox');
  const projBox = document.getElementById('standProjectionLayersBox');

  if (decalBox) decalBox.style.display = (mode === 'decal') ? 'block' : 'none';
  if (surfaceBox) surfaceBox.style.display = (mode === 'surface') ? 'block' : 'none';
  if (netlaneBox) netlaneBox.style.display = (mode === 'netlane') ? 'block' : 'none';
  if (projBox) projBox.style.display = (mode === 'decal') ? 'block' : 'none';

  // Default priority suggestion if not set-assigned
  const setMembership = document.getElementById('standSetMembership')?.value;
  if (setMembership !== 'existing') {
    const prioInput = document.getElementById('standPriority');
    if (prioInput) {
      if (mode === 'surface') prioInput.value = -50;
      else if (mode === 'netlane') prioInput.value = 60;
      else prioInput.value = 50;
    }
  }

  onStandWizardPriorityInput();
  updateStandWizardSummary();
}
window.selectStandWizardMode = selectStandWizardMode;

/**
 * Quick name preset buttons
 */
export function applyStandWizardNamePreset(name, category, mode) {
  const nameInput = document.getElementById('standAssetName');
  if (nameInput) nameInput.value = name;

  const catInput = document.getElementById('standCategory');
  if (catInput) catInput.value = category;

  const catSelect = document.getElementById('standCategorySelect');
  if (catSelect) {
    for (let i = 0; i < catSelect.options.length; i++) {
      if (catSelect.options[i].value.toLowerCase() === category.toLowerCase()) {
        catSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (mode && mode !== standWizardMode) {
    selectStandWizardMode(mode);
  }

  updateStandWizardSummary();
}
window.applyStandWizardNamePreset = applyStandWizardNamePreset;

export function applyStandWizardSuffix(suffix) {
  const nameInput = document.getElementById('standAssetName');
  if (!nameInput) return;
  let val = nameInput.value.trim();
  val = val.replace(/(_01|_02|_03|_Clean|_Worn|_Variant)$/i, '');
  nameInput.value = val + suffix;
  updateStandWizardSummary();
}
window.applyStandWizardSuffix = applyStandWizardSuffix;

/**
 * Populate existing sets dropdown
 */
function populateStandWizardExistingSets() {
  const select = document.getElementById('standExistingSetSelect');
  if (!select) return;

  const sets = getSetsRegistry();
  select.innerHTML = '';

  if (sets.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No registered sets found';
    select.appendChild(opt);
    return;
  }

  sets.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.setName} (${s.assets?.length || 0} assets, Next: ${s.nextPriority || (s.basePriority + (s.stepInterval || 10))})`;
    select.appendChild(opt);
  });
}

/**
 * Handle Set Membership option change (standalone vs existing set)
 */
export function onStandWizardSetOptionChange() {
  const val = document.getElementById('standSetMembership')?.value || 'standalone';
  const row = document.getElementById('standExistingSetRow');

  if (val === 'existing') {
    if (row) row.style.display = 'block';
    onStandWizardExistingSetSelected();
  } else {
    if (row) row.style.display = 'none';
    const prioInput = document.getElementById('standPriority');
    if (prioInput) {
      prioInput.value = standWizardMode === 'surface' ? -50 : (standWizardMode === 'netlane' ? 60 : 50);
    }
    onStandWizardPriorityInput();
  }
  updateStandWizardSummary();
}
window.onStandWizardSetOptionChange = onStandWizardSetOptionChange;

/**
 * When user picks a specific existing set
 */
export function onStandWizardExistingSetSelected() {
  const setId = document.getElementById('standExistingSetSelect')?.value;
  if (!setId) return;

  const sets = getSetsRegistry();
  const found = sets.find(s => s.id === setId);
  if (!found) return;

  // Auto-fill category
  if (found.category) {
    const catInput = document.getElementById('standCategory');
    if (catInput) catInput.value = found.category;
  }

  // Auto-fill priority
  const nextPrio = found.nextPriority || (found.basePriority + (found.stepInterval || 10));
  const prioInput = document.getElementById('standPriority');
  if (prioInput) prioInput.value = nextPrio;

  const badge = document.getElementById('standExistingSetRangeBadge');
  if (badge) {
    badge.textContent = `Set Range: ${found.rangeStart?.toLocaleString() || found.basePriority} - Next: ${nextPrio.toLocaleString()}`;
  }

  onStandWizardPriorityInput();
  updateStandWizardSummary();
}
window.onStandWizardExistingSetSelected = onStandWizardExistingSetSelected;

/**
 * Check priority for collision against registered set bands
 */
export function onStandWizardPriorityInput() {
  const prio = parseInt(document.getElementById('standPriority')?.value || '0', 10);
  const statusText = document.getElementById('standPriorityStatusText');
  const setMembership = document.getElementById('standSetMembership')?.value;

  if (!statusText) return;

  const sets = getSetsRegistry();
  let collidedSet = null;

  for (const s of sets) {
    const start = s.rangeStart !== undefined ? s.rangeStart : s.basePriority;
    const end = s.rangeEnd !== undefined ? s.rangeEnd : (s.basePriority + 990);
    if (prio >= start && prio <= end) {
      collidedSet = s;
      break;
    }
  }

  if (setMembership === 'existing') {
    const currentSetId = document.getElementById('standExistingSetSelect')?.value;
    const currentSet = sets.find(s => s.id === currentSetId);

    if (currentSet && collidedSet && collidedSet.id === currentSet.id) {
      statusText.style.color = 'var(--accent-emerald)';
      statusText.innerHTML = `<span>✓</span> Assigned to set "${collidedSet.setName}". Priority: ${prio.toLocaleString()}.`;
    } else if (collidedSet) {
      statusText.style.color = '#f59e0b';
      statusText.innerHTML = `<span>⚠️</span> Warning: Falls inside another set "${collidedSet.setName}" (${collidedSet.rangeStart}–${collidedSet.rangeEnd}).`;
    } else {
      statusText.style.color = '#f59e0b';
      statusText.innerHTML = `<span>⚠️</span> Outside assigned set range (${currentSet?.rangeStart}–${currentSet?.rangeEnd}).`;
    }
  } else {
    // Standalone
    if (collidedSet) {
      statusText.style.color = '#f59e0b';
      statusText.innerHTML = `<span>⚠️</span> Note: Falls inside registered set "${collidedSet.setName}" (${collidedSet.rangeStart?.toLocaleString()}–${collidedSet.rangeEnd?.toLocaleString()}). Consider an unreserved value (e.g. 50, 60, or &lt; 50,000).`;
    } else {
      statusText.style.color = 'var(--accent-emerald)';
      statusText.innerHTML = `<span>✓</span> Safe standalone priority (${prio}). Zero collision with registered set ranges.`;
    }
  }
}
window.onStandWizardPriorityInput = onStandWizardPriorityInput;

export function setStandWizardPriority(val) {
  const prioInput = document.getElementById('standPriority');
  if (prioInput) {
    prioInput.value = val;
    onStandWizardPriorityInput();
    updateStandWizardSummary();
  }
}
window.setStandWizardPriority = setStandWizardPriority;

/**
 * Dimension and Material Helpers
 */
export function updateStandWizardDimSummary() {
  if (standWizardMode === 'decal') {
    const w = parseFloat(document.getElementById('standDimW')?.value || '2.0') || 2.0;
    const h = parseFloat(document.getElementById('standDimH')?.value || '2.0') || 2.0;
    const d = parseFloat(document.getElementById('standDimD')?.value || '0.5') || 0.5;
    const badge = document.getElementById('standDimBadge');
    if (badge) badge.textContent = `${w.toFixed(1)}m × ${h.toFixed(1)}m × ${d.toFixed(1)}m`;
  } else if (standWizardMode === 'netlane') {
    const w = parseFloat(document.getElementById('standNetlaneWidth')?.value || '0.2') || 0.2;
    const l = parseFloat(document.getElementById('standNetlaneLength')?.value || '5.0') || 5.0;
    const badge = document.getElementById('standNetlaneBadge');
    if (badge) badge.textContent = `${w.toFixed(2)}m width × ${l.toFixed(1)}m stretch`;
  }
  updateStandWizardSummary();
}
window.updateStandWizardDimSummary = updateStandWizardDimSummary;

export function setStandWizardDims(w, h, d) {
  const dimW = document.getElementById('standDimW');
  const dimH = document.getElementById('standDimH');
  const dimD = document.getElementById('standDimD');
  if (dimW) dimW.value = w;
  if (dimH) dimH.value = h;
  if (dimD) dimD.value = d;
  updateStandWizardDimSummary();
}
window.setStandWizardDims = setStandWizardDims;

export function setStandWizardUv(uv) {
  const uvScale = document.getElementById('standUvScale');
  if (uvScale) {
    uvScale.value = uv;
    const badge = document.getElementById('standSurfaceUvBadge');
    if (badge) badge.textContent = parseFloat(uv).toFixed(2);
  }
  updateStandWizardSummary();
}
window.setStandWizardUv = setStandWizardUv;

export function applyStandWizardMaterial(look) {
  const bump = document.getElementById('standBump');
  const metal = document.getElementById('standMetal');
  const smooth = document.getElementById('standSmooth');

  if (look === 'paint') {
    if (bump) bump.value = '2.2';
    if (metal) metal.value = '0';
    if (smooth) smooth.value = '25';
  } else if (look === 'iron') {
    if (bump) bump.value = '3.5';
    if (metal) metal.value = '180';
    if (smooth) smooth.value = '80';
  } else if (look === 'asphalt') {
    if (bump) bump.value = '4.5';
    if (metal) metal.value = '0';
    if (smooth) smooth.value = '10';
  } else if (look === 'wet') {
    if (bump) bump.value = '1.5';
    if (metal) metal.value = '0';
    if (smooth) smooth.value = '180';
  } else if (look === 'metal') {
    if (bump) bump.value = '1.0';
    if (metal) metal.value = '255';
    if (smooth) smooth.value = '220';
  }

  showToast(`Applied "${look}" material preset`);
  updateStandWizardSummary();
}
window.applyStandWizardMaterial = applyStandWizardMaterial;

/**
 * Graphic Dropzone & Selection Handling
 */
export function handleStandWizardGraphicFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) processStandWizardGraphicFile(file);
}
window.handleStandWizardGraphicFileSelect = handleStandWizardGraphicFileSelect;

export function handleStandWizardGraphicDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('standGraphicDropzone')?.classList.add('dragover');
}
window.handleStandWizardGraphicDragOver = handleStandWizardGraphicDragOver;

export function handleStandWizardGraphicDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('standGraphicDropzone')?.classList.remove('dragover');
}
window.handleStandWizardGraphicDragLeave = handleStandWizardGraphicDragLeave;

export function handleStandWizardGraphicDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('standGraphicDropzone')?.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (file) processStandWizardGraphicFile(file);
}
window.handleStandWizardGraphicDrop = handleStandWizardGraphicDrop;

function processStandWizardGraphicFile(file) {
  if (!file.type.match('image.*')) {
    showToast('Please select a valid image file (PNG, JPG, WebP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      standWizardLoadedImage = img;

      const previewImg = document.getElementById('standSelectedImgPreview');
      if (previewImg) previewImg.src = event.target.result;
      const fn = document.getElementById('standSelectedFileName');
      if (fn) fn.textContent = file.name;
      const dims = document.getElementById('standSelectedFileDims');
      if (dims) dims.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

      const emptyView = document.getElementById('standDropEmptyView');
      const selView = document.getElementById('standDropSelectedView');
      if (emptyView) emptyView.style.display = 'none';
      if (selView) selView.style.display = 'flex';

      // Auto-suggest asset name based on graphic file name
      const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      const nameInput = document.getElementById('standAssetName');
      if (cleanName && nameInput) {
        nameInput.value = cleanName;
        updateStandWizardSummary();
      }

      showToast(`Loaded ${file.name} (${img.naturalWidth}×${img.naturalHeight})`);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Switch normal map mode (auto procedural vs custom upload)
 */
export function setStandWizardNormalMode(mode) {
  standWizardNormalMode = mode;
  const btnAuto = document.getElementById('standNormBtnAuto');
  const btnCustom = document.getElementById('standNormBtnCustom');
  const autoInfo = document.getElementById('standNormAutoInfo');
  const customBox = document.getElementById('standNormCustomBox');
  const badge = document.getElementById('standNormStatusBadge');

  if (btnAuto) btnAuto.classList.toggle('active', mode === 'auto');
  if (btnCustom) btnCustom.classList.toggle('active', mode === 'custom');

  if (mode === 'custom') {
    if (autoInfo) autoInfo.style.display = 'none';
    if (customBox) customBox.style.display = 'block';
    if (badge) {
      if (standWizardLoadedNormal) {
        badge.textContent = `Custom (${standWizardLoadedNormal.naturalWidth}×${standWizardLoadedNormal.naturalHeight})`;
        badge.style.color = 'var(--accent-emerald)';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
      } else {
        badge.textContent = 'Custom (Awaiting File)';
        badge.style.color = '#38bdf8';
        badge.style.background = 'rgba(56, 189, 248, 0.15)';
      }
    }
  } else {
    if (autoInfo) autoInfo.style.display = 'flex';
    if (customBox) customBox.style.display = 'none';
    if (badge) {
      badge.textContent = 'Auto-Generated';
      badge.style.color = 'var(--accent-cyan)';
      badge.style.background = 'rgba(0, 229, 255, 0.12)';
    }
  }

  updateStandWizardSummary();
}
window.setStandWizardNormalMode = setStandWizardNormalMode;

export function handleStandWizardNormalFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) processStandWizardNormalFile(file);
}
window.handleStandWizardNormalFileSelect = handleStandWizardNormalFileSelect;

export function handleStandWizardNormalDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('standNormalDropzone')?.classList.add('dragover');
}
window.handleStandWizardNormalDragOver = handleStandWizardNormalDragOver;

export function handleStandWizardNormalDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('standNormalDropzone')?.classList.remove('dragover');
}
window.handleStandWizardNormalDragLeave = handleStandWizardNormalDragLeave;

export function handleStandWizardNormalDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('standNormalDropzone')?.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (file) processStandWizardNormalFile(file);
}
window.handleStandWizardNormalDrop = handleStandWizardNormalDrop;

function processStandWizardNormalFile(file) {
  if (!file.type.match('image.*')) {
    showToast('Please select a valid normal map image file (PNG, JPG, WebP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      standWizardLoadedNormal = img;
      standWizardNormalFileName = file.name;

      const previewImg = document.getElementById('standSelectedNormalImgPreview');
      if (previewImg) previewImg.src = event.target.result;
      const fn = document.getElementById('standSelectedNormalFileName');
      if (fn) fn.textContent = file.name;
      const dims = document.getElementById('standSelectedNormalFileDims');
      if (dims) dims.textContent = `${img.naturalWidth} × ${img.naturalHeight} px (Tangent Space)`;

      const emptyView = document.getElementById('standNormalDropEmptyView');
      const selView = document.getElementById('standNormalDropSelectedView');
      if (emptyView) emptyView.style.display = 'none';
      if (selView) selView.style.display = 'flex';

      const badge = document.getElementById('standNormStatusBadge');
      if (badge) {
        badge.textContent = `Custom (${img.naturalWidth}×${img.naturalHeight})`;
        badge.style.color = 'var(--accent-emerald)';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
      }

      updateStandWizardSummary();
      showToast(`Loaded Normal Map: ${file.name}`);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

export function clearStandWizardCustomNormal() {
  standWizardLoadedNormal = null;
  standWizardNormalFileName = '';

  const emptyView = document.getElementById('standNormalDropEmptyView');
  const selView = document.getElementById('standNormalDropSelectedView');
  if (emptyView) emptyView.style.display = 'flex';
  if (selView) selView.style.display = 'none';

  const fileInput = document.getElementById('standNormalFileInput');
  if (fileInput) fileInput.value = '';

  setStandWizardNormalMode('auto');
  showToast('Switched to Auto-Generated normal map');
}
window.clearStandWizardCustomNormal = clearStandWizardCustomNormal;

/**
 * Generate Procedural Starter Graphic based on Category & Mode
 */
export function useStandWizardStarterGraphic() {
  const category = (document.getElementById('standCategory')?.value || '').toLowerCase();
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 1024, 1024);

  if (category.includes('utility') || category.includes('manhole')) {
    // Utility cover
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
    // Crack
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
  } else if (standWizardMode === 'surface') {
    // Cobblestone / tile
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
  } else if (standWizardMode === 'netlane') {
    // Road Stripe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(362, 0, 300, 1024);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(362, 200, 300, 200);
    ctx.fillRect(362, 600, 300, 200);
  } else {
    // Turn Arrow
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
    standWizardLoadedImage = img;
    const previewImg = document.getElementById('standSelectedImgPreview');
    if (previewImg) previewImg.src = dataUrl;
    const fn = document.getElementById('standSelectedFileName');
    if (fn) fn.textContent = 'Template_Starter.png';
    const dims = document.getElementById('standSelectedFileDims');
    if (dims) dims.textContent = '1024 × 1024 px';

    const emptyView = document.getElementById('standDropEmptyView');
    const selView = document.getElementById('standDropSelectedView');
    if (emptyView) emptyView.style.display = 'none';
    if (selView) selView.style.display = 'flex';
    showToast('Loaded category template graphic');
  };
  img.src = dataUrl;
}
window.useStandWizardStarterGraphic = useStandWizardStarterGraphic;

/**
 * Update Summary Card in Step 3
 */
export function updateStandWizardSummary() {
  const name = document.getElementById('standAssetName')?.value?.trim() || 'Custom_Asset';
  const category = document.getElementById('standCategory')?.value?.trim() || 'RoadMarkings';
  const prio = document.getElementById('standPriority')?.value || '50';
  const membership = document.getElementById('standSetMembership')?.value || 'standalone';
  const bump = document.getElementById('standBump')?.value || '2.2';

  const titleEl = document.getElementById('standSummaryTitle');
  if (titleEl) titleEl.textContent = `⚡ ${name}`;

  const modeBadge = document.getElementById('standSummaryModeBadge');
  if (modeBadge) modeBadge.textContent = `${standWizardMode.toUpperCase()} MODE`;

  const catEl = document.getElementById('standSummaryCategoryText');
  if (catEl) catEl.textContent = category;

  const dimsEl = document.getElementById('standSummaryDimsText');
  if (dimsEl) {
    if (standWizardMode === 'decal') {
      const w = parseFloat(document.getElementById('standDimW')?.value || '2.0') || 2.0;
      const h = parseFloat(document.getElementById('standDimH')?.value || '2.0') || 2.0;
      const d = parseFloat(document.getElementById('standDimD')?.value || '0.5') || 0.5;
      dimsEl.textContent = `${w.toFixed(1)} × ${h.toFixed(1)} × ${d.toFixed(1)}m`;
    } else if (standWizardMode === 'surface') {
      const uv = document.getElementById('standUvScale')?.value || '1.0';
      dimsEl.textContent = `UV Scale: ${parseFloat(uv).toFixed(2)}`;
    } else {
      const w = document.getElementById('standNetlaneWidth')?.value || '0.2';
      const l = document.getElementById('standNetlaneLength')?.value || '5.0';
      dimsEl.textContent = `${w}m width × ${l}m stretch`;
    }
  }

  const prioEl = document.getElementById('standSummaryPrioText');
  if (prioEl) prioEl.textContent = `${parseInt(prio, 10).toLocaleString()}`;

  const matEl = document.getElementById('standSummaryMatText');
  if (matEl) matEl.textContent = `Bump: ${bump}×`;

  const normSummary = document.getElementById('standSummaryNormalText');
  if (normSummary) {
    if (standWizardNormalMode === 'custom' && standWizardLoadedNormal) {
      const inv = document.getElementById('standInvertNormalY')?.checked ? ' (DirectX -Y Inverted)' : ' (OpenGL +Y)';
      normSummary.textContent = `Custom: ${standWizardNormalFileName}${inv}`;
      normSummary.style.color = 'var(--accent-emerald)';
    } else if (standWizardNormalMode === 'custom') {
      normSummary.textContent = 'Custom Normal (Awaiting Upload)';
      normSummary.style.color = '#38bdf8';
    } else {
      normSummary.textContent = 'Auto-Generated (+X, +Y Relief)';
      normSummary.style.color = 'var(--accent-cyan)';
    }
  }

  const setEl = document.getElementById('standSummarySetText');
  if (setEl) {
    if (membership === 'existing') {
      const select = document.getElementById('standExistingSetSelect');
      const text = select?.options[select.selectedIndex]?.text || 'Existing Set';
      setEl.textContent = `Assigned to: ${text}`;
    } else {
      setEl.textContent = 'Standalone (Independent Asset)';
    }
  }
}
window.updateStandWizardSummary = updateStandWizardSummary;

/**
 * Finish: Create and load asset into the workspace
 */
export async function confirmNewStandaloneAsset() {
  const assetName = document.getElementById('standAssetName')?.value?.trim();
  if (!assetName) {
    showToast('Please enter an Asset Name');
    setStandWizardStep(2);
    return;
  }

  const category = document.getElementById('standCategory')?.value?.trim() || 'RoadMarkings';
  const priority = parseInt(document.getElementById('standPriority')?.value || '50', 10);
  const author = document.getElementById('standAuthor')?.value?.trim() || 'CS2 Creator';
  const membership = document.getElementById('standSetMembership')?.value || 'standalone';
  const setId = document.getElementById('standExistingSetSelect')?.value;

  // 1. If no image chosen yet, generate a starter template
  if (!standWizardLoadedImage) {
    useStandWizardStarterGraphic();
    await new Promise(r => setTimeout(r, 80));
  }

  // 2. Set mode if different
  if (typeof window.setMode === 'function') {
    window.setMode(standWizardMode, true);
  }

  // 3. Update application state
  state.currentLoadedAssetName = assetName;
  state.hasUnsavedChanges = true;

  // Sync inputs in Section 1
  const secName = document.getElementById('assetName');
  if (secName) secName.value = assetName;

  const secCat = document.getElementById('category') || document.getElementById('assetCategory');
  if (secCat) secCat.value = category;

  const prioIn = document.getElementById('uiPriorityInput');
  if (prioIn) prioIn.value = priority;
  const prioSlider = document.getElementById('uiPrioritySlider') || document.getElementById('drawOrderSlider');
  if (prioSlider) {
    if (priority > parseInt(prioSlider.max, 10)) {
      prioSlider.max = Math.max(100000, priority);
    }
    prioSlider.value = priority;
  }
  const prioVal = document.getElementById('uiPriorityVal') || document.getElementById('drawOrderVal');
  if (prioVal) prioVal.textContent = priority.toLocaleString();

  // Dimensions
  if (standWizardMode === 'decal') {
    const wVal = parseFloat(document.getElementById('standDimW')?.value || '2.0') || 2.0;
    const hVal = parseFloat(document.getElementById('standDimH')?.value || '2.0') || 2.0;
    const dVal = parseFloat(document.getElementById('standDimD')?.value || '0.5') || 0.5;

    const wIn = document.getElementById('dimWidth');
    const hIn = document.getElementById('dimHeight');
    const dIn = document.getElementById('dimDepth');
    if (wIn) wIn.value = wVal;
    if (hIn) hIn.value = hVal;
    if (dIn) dIn.value = dVal;

    // Layer masks
    const chkRoads = document.getElementById('layerRoads');
    const chkTerrain = document.getElementById('layerTerrain');
    const chkBuildings = document.getElementById('layerBuildings');
    const chkVehicles = document.getElementById('layerVehicles');
    const chkProps = document.getElementById('layerProps');
    if (chkRoads) chkRoads.checked = document.getElementById('standLayerRoads')?.checked ?? true;
    if (chkTerrain) chkTerrain.checked = document.getElementById('standLayerTerrain')?.checked ?? true;
    if (chkBuildings) chkBuildings.checked = document.getElementById('standLayerBuildings')?.checked ?? false;
    if (chkVehicles) chkVehicles.checked = document.getElementById('standLayerVehicles')?.checked ?? false;
    if (chkProps) chkProps.checked = document.getElementById('standLayerProps')?.checked ?? false;
  } else if (standWizardMode === 'surface') {
    const uvVal = parseFloat(document.getElementById('standUvScale')?.value || '1.0') || 1.0;
    const uvIn = document.getElementById('uvScale');
    if (uvIn) uvIn.value = uvVal;
  } else if (standWizardMode === 'netlane') {
    const netW = document.getElementById('netlaneWidth');
    const netL = document.getElementById('netlaneLength');
    if (netW) netW.value = parseFloat(document.getElementById('standNetlaneWidth')?.value || '0.2') || 0.2;
    if (netL) netL.value = parseFloat(document.getElementById('standNetlaneLength')?.value || '5.0') || 5.0;
  }

  // PBR parameters
  const bumpVal = parseFloat(document.getElementById('standBump')?.value || '2.2') || 2.2;
  const metalVal = parseInt(document.getElementById('standMetal')?.value || '0', 10) || 0;
  const smoothVal = parseInt(document.getElementById('standSmooth')?.value || '25', 10) || 25;

  const bumpIn = document.getElementById('bumpIntensity');
  const metalIn = document.getElementById('metallic');
  const smoothIn = document.getElementById('smoothness');
  if (bumpIn) {
    bumpIn.value = bumpVal;
    const bValEl = document.getElementById('bumpVal');
    if (bValEl) bValEl.textContent = `${bumpVal.toFixed(1)}×`;
  }
  if (metalIn) {
    metalIn.value = metalVal;
    const mValEl = document.getElementById('metalVal');
    if (mValEl) mValEl.textContent = metalVal;
  }
  if (smoothIn) {
    smoothIn.value = smoothVal;
    const sValEl = document.getElementById('smoothVal');
    if (sValEl) sValEl.textContent = smoothVal;
  }

  // Icon Badge
  const enableBadge = document.getElementById('standEnableBadge')?.checked ?? true;
  state.badge1Enabled = enableBadge;
  const chkBadge = document.getElementById('badge1Enabled');
  if (chkBadge) chkBadge.checked = enableBadge;

  // 4. Load Graphic into Canvas
  if (standWizardLoadedImage) {
    state.currentImage = standWizardLoadedImage;
    state.isCustomImageLoaded = true;

    const sourceBadge = document.getElementById('sourceImageStatusBadge');
    if (sourceBadge) {
      sourceBadge.textContent = `${standWizardLoadedImage.naturalWidth || 1024}×${standWizardLoadedImage.naturalHeight || 1024} (Custom)`;
    }
  }

  // 4b. Configure Normal Map: Custom vs Auto-Generated
  if (standWizardNormalMode === 'custom' && standWizardLoadedNormal) {
    state.customNormalImg = standWizardLoadedNormal;
    state.customNormalFileName = standWizardNormalFileName || 'custom_normal.png';

    const standFlipY = document.getElementById('standInvertNormalY');
    const mainFlipY = document.getElementById('flipNormalY');
    if (mainFlipY && standFlipY) {
      mainFlipY.checked = standFlipY.checked;
    }
    if (typeof window.updateCustomNormalUI === 'function') {
      window.updateCustomNormalUI();
    }
  } else {
    state.customNormalImg = null;
    state.customNormalFileName = '';
    const customNormalInput = document.getElementById('customNormalInput');
    if (customNormalInput) customNormalInput.value = '';
    if (typeof window.updateCustomNormalUI === 'function') {
      window.updateCustomNormalUI();
    }
  }

  // 5. Generate Normal, Mask, and Icon Maps
  try {
    if (typeof window.renderAllMaps === 'function') {
      window.renderAllMaps();
    }
    if (typeof window.updateConfigJson === 'function') {
      window.updateConfigJson();
    }
    if (typeof window.updateUiPrioritySequenceUI === 'function') {
      window.updateUiPrioritySequenceUI();
    }
  } catch (err) {
    console.warn('Map generation warning:', err);
  }

  // 6. If user chose to assign to an existing set, add it
  if (membership === 'existing' && setId) {
    try {
      const registry = getSetsRegistry();
      const targetSet = registry.find(s => s.id === setId);
      if (targetSet) {
        if (!Array.isArray(targetSet.assets)) targetSet.assets = [];
        const count = targetSet.assets.length;
        const nextIndex = (targetSet.lastIndex || count || 0) + 1;
        targetSet.lastIndex = nextIndex;
        targetSet.nextPriority = priority + (targetSet.stepInterval || 10);

        let thumb = '';
        if (standWizardLoadedImage) {
          const c = document.createElement('canvas');
          c.width = 64; c.height = 64;
          const ctx = c.getContext('2d');
          ctx.drawImage(standWizardLoadedImage, 0, 0, 64, 64);
          thumb = c.toDataURL('image/png');
        }

        targetSet.assets.push({
          name: assetName,
          priority: priority,
          index: nextIndex,
          date: Date.now(),
          thumbnail: thumb
        });

        saveSetsRegistry(registry);
        if (typeof window.renderSetThumbnailsStrip === 'function') {
          window.renderSetThumbnailsStrip();
        }
      }
    } catch (err) {
      console.warn('Set registration error:', err);
    }
  }

  // Close modal
  closeNewStandaloneAssetWizard();
  showToast(`⚡ Created "${assetName}" and loaded into workspace!`);
}
window.confirmNewStandaloneAsset = confirmNewStandaloneAsset;
