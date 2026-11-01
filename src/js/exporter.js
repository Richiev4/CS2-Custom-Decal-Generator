// ==========================================
// Exporter, Packaging, JSON & Library Module
// ==========================================
import JSZip from 'jszip';
import { state, getCanvases, showToast, escapeHtml } from './state.js';
import { clearCustomNormal, updateCustomNormalUI } from './normalMap.js';
import { renderIconMap, loadGoogleFont, populateFontDropdowns, setCreatorBadgeMode, setSeriesBadgeMode, setCreatorColorTheme, setCreatorGradDirection, setCreatorColorMode, setSeriesColorTheme, setSeriesGradDirection, setSeriesColorMode, onBadge1TextChange, onSeriesTextChange, clearDesignerLogo } from './badges.js';
import { setSurfaceTiling } from './preview.js';
import {
  initIndexedDBStorage,
  getSavedLibraryFromMemory,
  saveAssetToIndexedDB,
  deleteAssetFromIndexedDB,
  STARTER_ASSETS,
  LEGACY_STORAGE_KEY
} from './db.js';

export const STORAGE_KEY = LEGACY_STORAGE_KEY;
export { initIndexedDBStorage };

export function setAssetCategory(cat) {
  if (!cat) return;
  const input = document.getElementById('assetCategory');
  if (input) input.value = cat;
  const hidden = document.getElementById('surfaceCategory');
  if (hidden) hidden.value = cat;
  const badge = document.getElementById('categorySubfolderBadge');
  if (badge) badge.textContent = cat;
  const picker = document.getElementById('categoryQuickPicker');
  if (picker) {
    for (let i = 0; i < picker.options.length; i++) {
      if (picker.options[i].value === cat) {
        picker.selectedIndex = i;
        break;
      }
    }
  }
}

export function getAssetCategory() {
  const input = document.getElementById('assetCategory');
  if (input && input.value.trim()) return input.value.trim();
  const hidden = document.getElementById('surfaceCategory');
  if (hidden && hidden.value.trim()) return hidden.value.trim();
  return state.appMode === 'decal' ? 'RoadMarkings' : (state.appMode === 'surface' ? 'Pavement' : 'Lines');
}

export function applyCategoryQuickPick() {
  const picker = document.getElementById('categoryQuickPicker');
  if (picker) {
    setAssetCategory(picker.value);
    updateConfigJson();
  }
}

export function onNormalOpacityChange() {
  const val = parseFloat(document.getElementById('normalOpacitySlider').value);
  const valBadge = document.getElementById('normalOpacityVal');
  if (valBadge) valBadge.textContent = val.toFixed(2);
  updateConfigJson();
}

export function onBaseOpacityChange() {
  const input = document.getElementById('baseOpacitySlider');
  if (!input) return;
  const val = parseFloat(input.value);
  const valBadge = document.getElementById('baseOpacityVal');
  if (valBadge) valBadge.textContent = val.toFixed(2);
  updateConfigJson();
}
window.onBaseOpacityChange = onBaseOpacityChange;

export function onMetallicOpacityChange() {
  const input = document.getElementById('metallicOpacitySlider');
  if (!input) return;
  const val = parseFloat(input.value);
  const valBadge = document.getElementById('metallicOpacityVal');
  if (valBadge) valBadge.textContent = val.toFixed(2);
  updateConfigJson();
}
window.onMetallicOpacityChange = onMetallicOpacityChange;

export function onUiPriorityChange() {
  const input = document.getElementById('uiPrioritySlider');
  if (!input) return;
  const val = parseInt(input.value, 10);
  const valBadge = document.getElementById('uiPriorityVal');
  if (valBadge) valBadge.textContent = val;
  updateConfigJson();
}
window.onUiPriorityChange = onUiPriorityChange;

export function onLayerMaskChange() {
  updateConfigJson();
}

export function onDrawOrderChange() {
  const val = parseInt(document.getElementById('drawOrderSlider').value, 10);
  document.getElementById('drawOrderVal').textContent = val;
  updateConfigJson();
}

export function onGlobalMaterialChange() {
  const met = parseFloat(document.getElementById('globalMetallicSlider').value);
  const sm = parseFloat(document.getElementById('globalSmoothnessSlider').value);
  document.getElementById('globalMetallicVal').textContent = met.toFixed(2);
  document.getElementById('globalSmoothnessVal').textContent = sm.toFixed(2);
  updateConfigJson();
}

export function onUvScaleChange() {
  const val = parseFloat(document.getElementById('uvScaleSlider').value);
  document.getElementById('uvScaleVal').textContent = val.toFixed(1);
  updateConfigJson();
}

export function setUvScale(val) {
  document.getElementById('uvScaleSlider').value = val;
  document.getElementById('uvScaleVal').textContent = val.toFixed(1);
  updateConfigJson();
  const roundedTile = Math.min(16, Math.max(1, Math.round(val)));
  setSurfaceTiling(roundedTile);
}

export function onNetlaneParamChange() {
  const w = parseFloat(document.getElementById('netlaneWidthSlider').value);
  const l = parseFloat(document.getElementById('netlaneLengthSlider').value);
  document.getElementById('netlaneWidthVal').textContent = `${w.toFixed(1)} m`;
  document.getElementById('netlaneLengthVal').textContent = `${l.toFixed(1)} m`;
  updateConfigJson();
  if (state.activeTab === '3d' && window.renderSimulation) {
    window.renderSimulation();
  }
}

export function updateDecalScaleIndicator(width, height, depth) {
  const footprintEl = document.getElementById('decalFootprintSummary');
  if (!footprintEl) return;

  const area = (width * height).toFixed(2);
  footprintEl.textContent = `${width.toFixed(1)}m × ${height.toFixed(1)}m (${area} m²)`;

  const aspectBadge = document.getElementById('decalScaleAspectBadge');
  if (aspectBadge) {
    const ratio = height > 0 ? (width / height).toFixed(2) : '1.00';
    aspectBadge.textContent = `${ratio} : 1`;
  }

  const cellPctEl = document.getElementById('decalCellPct');
  if (cellPctEl) {
    const wPct = Math.round((width / 8.0) * 100);
    const hPct = Math.round((height / 8.0) * 100);
    const areaPct = Math.round(((width * height) / 64.0) * 100);
    cellPctEl.textContent = `${wPct}% W × ${hPct}% H (${areaPct}% area)`;
  }

  const laneRefEl = document.getElementById('decalLaneRef');
  if (laneRefEl) {
    const laneRatio = (width / 3.2).toFixed(1);
    if (width <= 1.0) {
      laneRefEl.textContent = `~${laneRatio}× lane (compact sub-lane detail)`;
    } else if (width <= 3.2) {
      laneRefEl.textContent = `~${laneRatio}× lane (fits inside 1 traffic lane)`;
    } else {
      const lanes = Math.round(width / 3.2);
      laneRefEl.textContent = `~${laneRatio}× lane (spans ~${lanes} lanes)`;
    }
  }

  const comparisonEl = document.getElementById('decalComparisonDesc');
  if (comparisonEl) {
    const maxDim = Math.max(width, height);
    if (maxDim <= 1.0) {
      comparisonEl.textContent = '🕳️ Compact detail (manhole cover, sewer drain, pothole/crack)';
    } else if (maxDim <= 2.5) {
      comparisonEl.textContent = '🚗 Standard prop/marking (pedestrian symbol, stop text, utility plate)';
    } else if (maxDim <= 5.0) {
      comparisonEl.textContent = '🚙 Vehicle / lane scale (directional road arrow, passenger car footprint, crosswalk)';
    } else if (maxDim <= 8.5) {
      comparisonEl.textContent = '🏢 Large surface/marking (entire 8m CS2 zoning cell, junction box)';
    } else {
      comparisonEl.textContent = '🗺️ Multi-cell mega decal (spans across multiple 8m zoning blocks)';
    }
  }

  const miniBoxEl = document.getElementById('decalMiniBox');
  if (miniBoxEl) {
    const boxW = Math.min(100, Math.max(6, (width / 8.0) * 100));
    const boxH = Math.min(100, Math.max(6, (height / 8.0) * 100));
    miniBoxEl.style.width = `${boxW}%`;
    miniBoxEl.style.height = `${boxH}%`;
    if (width > 8.0 || height > 8.0) {
      miniBoxEl.style.borderColor = '#f59e0b';
      miniBoxEl.style.background = 'rgba(245, 158, 11, 0.4)';
    } else {
      miniBoxEl.style.borderColor = 'var(--primary)';
      miniBoxEl.style.background = 'rgba(0, 168, 255, 0.35)';
    }
  }
}

export function getSourceImageAspectRatio() {
  if (!state.currentImage) return 1.0;
  const rawW = state.currentImage.naturalWidth || state.currentImage.width || 1024;
  const rawH = state.currentImage.naturalHeight || state.currentImage.height || 1024;
  if (!rawW || !rawH) return 1.0;
  // If texture has been rotated 90 or 270 degrees, visual width & height swap
  if (state.textureRotation === 90 || state.textureRotation === 270) {
    return rawH / rawW;
  }
  return rawW / rawH;
}
window.getSourceImageAspectRatio = getSourceImageAspectRatio;

export function toggleDecalAspectLock(forceState) {
  const wInput = document.getElementById('dimWidth');
  const hInput = document.getElementById('dimHeight');
  const w = parseFloat(wInput ? wInput.value : '2.0') || 2.0;
  const h = parseFloat(hInput ? hInput.value : '2.0') || 2.0;

  const targetState = typeof forceState === 'boolean' ? forceState : !state.decalAspectLocked;
  state.decalAspectLocked = targetState;

  if (targetState) {
    state.decalLockedRatio = h > 0 ? (w / h) : 1.0;
    showToast(`Aspect ratio locked (${state.decalLockedRatio.toFixed(2)} : 1)`);
  } else {
    showToast('Aspect ratio unlocked');
  }

  updateDecalAspectUI();
}
window.toggleDecalAspectLock = toggleDecalAspectLock;

export function setDecalAspectLock(locked, ratio) {
  state.decalAspectLocked = !!locked;
  if (ratio && !isNaN(ratio) && ratio > 0) {
    state.decalLockedRatio = ratio;
  } else {
    const w = parseFloat(document.getElementById('dimWidth')?.value || '2.0') || 2.0;
    const h = parseFloat(document.getElementById('dimHeight')?.value || '2.0') || 2.0;
    state.decalLockedRatio = h > 0 ? (w / h) : 1.0;
  }
  updateDecalAspectUI();
}
window.setDecalAspectLock = setDecalAspectLock;

export function resetDecalAspectRatio(targetMode) {
  const wInput = document.getElementById('dimWidth');
  const hInput = document.getElementById('dimHeight');
  if (!wInput || !hInput) return;

  const currentW = parseFloat(wInput.value) || 2.0;
  const currentH = parseFloat(hInput.value) || 2.0;
  const currentRatio = currentH > 0 ? (currentW / currentH) : 1.0;
  const imgRatio = getSourceImageAspectRatio();

  let targetRatio = 1.0;

  if (targetMode === 'square') {
    targetRatio = 1.0;
  } else if (targetMode === 'image') {
    targetRatio = imgRatio;
  } else {
    // Smart reset: if current ratio doesn't match the image's native ratio, match image!
    // If it already matches the image ratio (or if no non-square image), reset to 1:1 square.
    if (Math.abs(currentRatio - imgRatio) > 0.02) {
      targetRatio = imgRatio;
    } else if (Math.abs(currentRatio - 1.0) > 0.02) {
      targetRatio = 1.0;
    } else {
      targetRatio = imgRatio !== 1.0 ? imgRatio : 1.0;
    }
  }

  // Calculate new height preserving current width
  let newH = parseFloat((currentW / targetRatio).toFixed(1));
  newH = Math.min(100.0, Math.max(0.1, newH));

  hInput.value = newH.toFixed(1);
  const hSlider = document.getElementById('dimHeightSlider');
  const maxLabel = document.getElementById('dimHeightMaxLabel');
  if (hSlider) {
    const maxVal = Math.max(10.0, Math.ceil(newH));
    hSlider.max = maxVal;
    hSlider.value = newH;
    if (maxLabel) maxLabel.textContent = `${maxVal}m`;
  }

  // If locked, update the locked ratio to match the newly reset ratio
  if (state.decalAspectLocked) {
    state.decalLockedRatio = targetRatio;
  }

  updateConfigJson();
  updateDecalAspectUI();

  if (Math.abs(targetRatio - 1.0) < 0.01) {
    showToast(`Aspect ratio reset to 1:1 square (${currentW.toFixed(1)}m × ${newH.toFixed(1)}m)`);
  } else {
    showToast(`Aspect ratio reset to source image (${targetRatio.toFixed(2)}:1 → ${currentW.toFixed(1)}m × ${newH.toFixed(1)}m)`);
  }
}
window.resetDecalAspectRatio = resetDecalAspectRatio;

export function updateDecalAspectUI() {
  const btnLock = document.getElementById('btnToggleAspectLock');
  const iconSpan = document.getElementById('aspectLockIcon');
  const textSpan = document.getElementById('aspectLockText');
  const chipSpan = document.getElementById('aspectLockRatioBadge');
  const aspectRow = document.getElementById('decalAspectRow');
  const slidersGroup = document.getElementById('dimSlidersGroup');
  const resetBtnLabel = document.getElementById('btnResetAspectLabel');
  const resetBtn = document.getElementById('btnResetAspect');

  const wInput = document.getElementById('dimWidth');
  const hInput = document.getElementById('dimHeight');
  const w = parseFloat(wInput ? wInput.value : '2.0') || 2.0;
  const h = parseFloat(hInput ? hInput.value : '2.0') || 2.0;
  const currentRatio = h > 0 ? (w / h) : 1.0;
  const imgRatio = getSourceImageAspectRatio();

  const isLocked = !!state.decalAspectLocked;
  const displayRatio = isLocked ? state.decalLockedRatio : currentRatio;

  if (chipSpan) {
    chipSpan.textContent = `${displayRatio.toFixed(2)} : 1`;
  }

  if (btnLock) {
    btnLock.classList.toggle('active-locked', isLocked);
    btnLock.setAttribute('aria-pressed', isLocked ? 'true' : 'false');
    btnLock.title = isLocked
      ? `Aspect ratio is locked at ${displayRatio.toFixed(2)}:1 (Click to unlock)`
      : `Aspect ratio is unlocked (Click to lock at ${currentRatio.toFixed(2)}:1)`;
  }

  if (textSpan) {
    textSpan.textContent = isLocked ? 'Ratio Locked' : 'Lock Ratio';
  }

  if (iconSpan) {
    if (isLocked) {
      iconSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    } else {
      iconSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
    }
  }

  if (aspectRow) {
    aspectRow.classList.toggle('locked', isLocked);
  }

  if (slidersGroup) {
    slidersGroup.classList.toggle('aspect-locked', isLocked);
  }

  if (resetBtnLabel && resetBtn) {
    if (state.currentImage && Math.abs(imgRatio - 1.0) > 0.02) {
      resetBtnLabel.textContent = `Reset to Image (${imgRatio.toFixed(2)}:1)`;
      resetBtn.title = `Reset decal proportions to match loaded image (${imgRatio.toFixed(2)}:1)`;
    } else {
      resetBtnLabel.textContent = 'Reset Aspect Ratio';
      resetBtn.title = 'Reset decal proportions to 1:1 square';
    }
  }
}
window.updateDecalAspectUI = updateDecalAspectUI;

export function onDecalDimSliderChange(dim, val) {
  const numVal = parseFloat(val);
  if (dim === 'width') {
    const input = document.getElementById('dimWidth');
    if (input) input.value = numVal.toFixed(1);

    if (state.decalAspectLocked && state.decalLockedRatio > 0) {
      const newH = Math.max(0.1, Math.min(100.0, parseFloat((numVal / state.decalLockedRatio).toFixed(1))));
      const hInput = document.getElementById('dimHeight');
      if (hInput) hInput.value = newH.toFixed(1);

      const hSlider = document.getElementById('dimHeightSlider');
      const maxLabel = document.getElementById('dimHeightMaxLabel');
      if (hSlider) {
        const maxVal = Math.max(10.0, Math.ceil(newH));
        hSlider.max = maxVal;
        hSlider.value = newH;
        if (maxLabel) maxLabel.textContent = `${maxVal}m`;
      }
    }
  } else if (dim === 'height') {
    const input = document.getElementById('dimHeight');
    if (input) input.value = numVal.toFixed(1);

    if (state.decalAspectLocked && state.decalLockedRatio > 0) {
      const newW = Math.max(0.1, Math.min(100.0, parseFloat((numVal * state.decalLockedRatio).toFixed(1))));
      const wInput = document.getElementById('dimWidth');
      if (wInput) wInput.value = newW.toFixed(1);

      const wSlider = document.getElementById('dimWidthSlider');
      const maxLabel = document.getElementById('dimWidthMaxLabel');
      if (wSlider) {
        const maxVal = Math.max(10.0, Math.ceil(newW));
        wSlider.max = maxVal;
        wSlider.value = newW;
        if (maxLabel) maxLabel.textContent = `${maxVal}m`;
      }
    }
  } else if (dim === 'depth') {
    const input = document.getElementById('dimDepth');
    if (input) input.value = numVal.toFixed(1);
  }
  updateConfigJson();
  updateDecalAspectUI();
}
window.onDecalDimSliderChange = onDecalDimSliderChange;

export function onDecalDimInputChange(dim, val) {
  let numVal = parseFloat(val);
  if (isNaN(numVal)) return;

  if (dim === 'width') {
    numVal = Math.min(100.0, Math.max(0.1, numVal));
    const slider = document.getElementById('dimWidthSlider');
    const maxLabel = document.getElementById('dimWidthMaxLabel');
    if (slider) {
      const maxVal = Math.max(10.0, Math.ceil(numVal));
      slider.max = maxVal;
      slider.value = numVal;
      if (maxLabel) maxLabel.textContent = `${maxVal}m`;
    }

    if (state.decalAspectLocked && state.decalLockedRatio > 0) {
      const newH = Math.max(0.1, Math.min(100.0, parseFloat((numVal / state.decalLockedRatio).toFixed(1))));
      const hInput = document.getElementById('dimHeight');
      if (hInput) hInput.value = newH.toFixed(1);

      const hSlider = document.getElementById('dimHeightSlider');
      const hMaxLabel = document.getElementById('dimHeightMaxLabel');
      if (hSlider) {
        const maxVal = Math.max(10.0, Math.ceil(newH));
        hSlider.max = maxVal;
        hSlider.value = newH;
        if (hMaxLabel) hMaxLabel.textContent = `${maxVal}m`;
      }
    }
  } else if (dim === 'height') {
    numVal = Math.min(100.0, Math.max(0.1, numVal));
    const slider = document.getElementById('dimHeightSlider');
    const maxLabel = document.getElementById('dimHeightMaxLabel');
    if (slider) {
      const maxVal = Math.max(10.0, Math.ceil(numVal));
      slider.max = maxVal;
      slider.value = numVal;
      if (maxLabel) maxLabel.textContent = `${maxVal}m`;
    }

    if (state.decalAspectLocked && state.decalLockedRatio > 0) {
      const newW = Math.max(0.1, Math.min(100.0, parseFloat((numVal * state.decalLockedRatio).toFixed(1))));
      const wInput = document.getElementById('dimWidth');
      if (wInput) wInput.value = newW.toFixed(1);

      const wSlider = document.getElementById('dimWidthSlider');
      const wMaxLabel = document.getElementById('dimWidthMaxLabel');
      if (wSlider) {
        const maxVal = Math.max(10.0, Math.ceil(newW));
        wSlider.max = maxVal;
        wSlider.value = newW;
        if (wMaxLabel) wMaxLabel.textContent = `${maxVal}m`;
      }
    }
  } else if (dim === 'depth') {
    numVal = Math.min(20.0, Math.max(0.1, numVal));
    const slider = document.getElementById('dimDepthSlider');
    const maxLabel = document.getElementById('dimDepthMaxLabel');
    if (slider) {
      const maxVal = Math.max(10.0, Math.ceil(numVal));
      slider.max = maxVal;
      slider.value = numVal;
      if (maxLabel) maxLabel.textContent = `${maxVal}m`;
    }
  }
  updateConfigJson();
  updateDecalAspectUI();
}
window.onDecalDimInputChange = onDecalDimInputChange;

let isScaleCardFloating = false;
let isScaleCardMinimized = false;
let scaleDragInitialized = false;

export function toggleFloatingScaleCard(forceState) {
  const card = document.getElementById('decalScaleCard');
  const notice = document.getElementById('decalScaleFloatingNotice');
  const btn = document.getElementById('toggleFloatScaleBtn');
  if (!card) return;

  isScaleCardFloating = typeof forceState === 'boolean' ? forceState : !isScaleCardFloating;

  if (isScaleCardFloating) {
    card.classList.add('floating-scale-card');
    if (notice) notice.style.display = 'flex';
    if (btn) {
      btn.textContent = '📌 Dock';
      btn.title = 'Dock back into Asset Settings sidebar';
    }
    // Set default position if not already placed
    if (!card.style.top && !card.style.left) {
      card.style.right = '24px';
      card.style.bottom = '24px';
      card.style.top = 'auto';
      card.style.left = 'auto';
    }
    initFloatingScaleDrag();
    showToast('In-game scale reference is now floating');
  } else {
    card.classList.remove('floating-scale-card');
    card.style.top = '';
    card.style.left = '';
    card.style.right = '';
    card.style.bottom = '';
    if (notice) notice.style.display = 'none';
    if (btn) {
      btn.textContent = '↗ Float';
      btn.title = 'Float reference over workspace';
    }
    showToast('In-game scale reference docked back to sidebar');
  }
}
window.toggleFloatingScaleCard = toggleFloatingScaleCard;

export function toggleMinimizeScaleCard() {
  const card = document.getElementById('decalScaleCard');
  const btn = document.getElementById('btnMinimizeScaleCard');
  if (!card) return;
  isScaleCardMinimized = !isScaleCardMinimized;
  card.classList.toggle('minimized', isScaleCardMinimized);
  if (btn) {
    btn.textContent = isScaleCardMinimized ? '+' : '_';
    btn.title = isScaleCardMinimized ? 'Expand' : 'Minimize';
  }
}
window.toggleMinimizeScaleCard = toggleMinimizeScaleCard;

function initFloatingScaleDrag() {
  if (scaleDragInitialized) return;
  scaleDragInitialized = true;

  const card = document.getElementById('decalScaleCard');
  const header = document.getElementById('decalScaleCardHeader');
  if (!card || !header) return;

  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  header.addEventListener('pointerdown', (e) => {
    if (!isScaleCardFloating) return;
    if (e.target && e.target.closest('button')) return; // ignore clicks on buttons

    isDragging = true;
    const rect = card.getBoundingClientRect();
    card.style.left = `${rect.left}px`;
    card.style.top = `${rect.top}px`;
    card.style.right = 'auto';
    card.style.bottom = 'auto';

    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  header.addEventListener('pointermove', (e) => {
    if (!isDragging || !isScaleCardFloating) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newLeft = Math.max(10, Math.min(window.innerWidth - card.offsetWidth - 10, initialLeft + dx));
    const newTop = Math.max(10, Math.min(window.innerHeight - card.offsetHeight - 10, initialTop + dy));

    card.style.left = `${newLeft}px`;
    card.style.top = `${newTop}px`;
  });

  const stopDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try { header.releasePointerCapture(e.pointerId); } catch (err) {}
    }
  };

  header.addEventListener('pointerup', stopDrag);
  header.addEventListener('pointercancel', stopDrag);
}

export function applyDecalDimPreset(w, h, d = 1.0) {
  const wInput = document.getElementById('dimWidth');
  const hInput = document.getElementById('dimHeight');
  const dInput = document.getElementById('dimDepth');
  const wSlider = document.getElementById('dimWidthSlider');
  const hSlider = document.getElementById('dimHeightSlider');
  const dSlider = document.getElementById('dimDepthSlider');

  if (wInput) wInput.value = w;
  if (hInput) hInput.value = h;
  if (dInput) dInput.value = d;
  if (wSlider) wSlider.value = w;
  if (hSlider) hSlider.value = h;
  if (dSlider) dSlider.value = d;

  if (state.decalAspectLocked) {
    state.decalLockedRatio = h > 0 ? (w / h) : 1.0;
  }

  updateConfigJson();
  updateDecalAspectUI();
  showToast(`Decal size set to ${w}m × ${h}m`);
}
window.applyDecalDimPreset = applyDecalDimPreset;

export function updateConfigJson() {
  let defaultName = 'CustomDecal';
  if (state.appMode === 'surface') defaultName = 'CustomSurface';
  if (state.appMode === 'netlane') defaultName = 'CustomNetLane';
  const name = document.getElementById('assetName').value.trim() || defaultName;

  const catInput = document.getElementById('assetCategory');
  const defaultCategory = state.appMode === 'decal' ? 'RoadMarkings' : (state.appMode === 'surface' ? 'Pavement' : 'Lines');
  const category = (catInput && catInput.value.trim()) ? catInput.value.trim() : defaultCategory;
  const catBadge = document.getElementById('categorySubfolderBadge');
  if (catBadge) catBadge.textContent = category;

  document.getElementById('nameCardBase').textContent = '_BaseColorMap.png';
  document.getElementById('nameCardNormal').textContent = '_NormalMap.png';
  document.getElementById('nameCardMask').textContent = '_MaskMap.png';
  const nameCardIcon = document.getElementById('nameCardIcon');
  if (nameCardIcon) nameCardIcon.textContent = 'icon.png';

  let maskSum = 0;
  const tBox = document.getElementById('layerTerrain');
  const rBox = document.getElementById('layerRoads');
  const bBox = document.getElementById('layerBuildings');
  const vBox = document.getElementById('layerVehicles');
  const cBox = document.getElementById('layerCreatures');
  const pBox = document.getElementById('layerProps');
  if (tBox && tBox.checked) maskSum += 1;
  if (rBox && rBox.checked) maskSum += 2;
  if (bBox && bBox.checked) maskSum += 4;
  if (vBox && vBox.checked) maskSum += 8;
  if (cBox && cBox.checked) maskSum += 16;
  if (pBox && pBox.checked) maskSum += 32;
  const layerMaskBadge = document.getElementById('layerMaskVal');
  if (layerMaskBadge) layerMaskBadge.textContent = `Mask: ${maskSum}`;

  const defaultDraw = state.appMode === 'surface' ? -50 : (state.appMode === 'netlane' ? 60 : 50);
  const drawOrder = parseInt(document.getElementById('drawOrderSlider').value, 10) || defaultDraw;
  const globalMetallic = parseFloat(document.getElementById('globalMetallicSlider').value) || 0.0;
  const globalSmoothness = parseFloat(document.getElementById('globalSmoothnessSlider').value) || 0.0;
  const schemaFormat = document.getElementById('jsonSchemaFormat')?.value || 'extended';
  const uiPriority = parseInt(document.getElementById('uiPrioritySlider')?.value, 10) ?? 41;
  const normalOpacity = parseFloat(document.getElementById('normalOpacitySlider')?.value) ?? 1.0;
  const baseOpacity = parseFloat(document.getElementById('baseOpacitySlider')?.value) ?? 1.0;
  const metallicOpacity = parseFloat(document.getElementById('metallicOpacitySlider')?.value) ?? 0.0;

  let jsonString = '';
  const pathTextEl = document.getElementById('targetPathText');

  if (state.appMode === 'decal') {
    const width = parseFloat(document.getElementById('dimWidth').value) || 2.0;
    const height = parseFloat(document.getElementById('dimHeight').value) || 2.0;
    const depth = parseFloat(document.getElementById('dimDepth').value) || 1.0;

    const wSlider = document.getElementById('dimWidthSlider');
    const hSlider = document.getElementById('dimHeightSlider');
    const dSlider = document.getElementById('dimDepthSlider');
    if (wSlider && document.activeElement !== wSlider) {
      const maxVal = Math.max(10.0, Math.ceil(width));
      wSlider.max = maxVal;
      wSlider.value = width;
      const lbl = document.getElementById('dimWidthMaxLabel');
      if (lbl) lbl.textContent = `${maxVal}m`;
    }
    if (hSlider && document.activeElement !== hSlider) {
      const maxVal = Math.max(10.0, Math.ceil(height));
      hSlider.max = maxVal;
      hSlider.value = height;
      const lbl = document.getElementById('dimHeightMaxLabel');
      if (lbl) lbl.textContent = `${maxVal}m`;
    }
    if (dSlider && document.activeElement !== dSlider) {
      const maxVal = Math.max(10.0, Math.ceil(depth));
      dSlider.max = maxVal;
      dSlider.value = depth;
      const lbl = document.getElementById('dimDepthMaxLabel');
      if (lbl) lbl.textContent = `${maxVal}m`;
    }

    updateDecalScaleIndicator(width, height, depth);

    if (schemaFormat === 'extended') {
      jsonString = JSON.stringify({
        UiPriority: isNaN(uiPriority) ? 41 : uiPriority,
        Float: {
          _DrawOrder: drawOrder,
          _Metallic: Number(globalMetallic.toFixed(2)),
          _Smoothness: Number(globalSmoothness.toFixed(2)),
          colossal_DecalLayerMask: maskSum,
          _NormalOpacity: Number(normalOpacity.toFixed(2)),
          _BaseOpacity: Number(baseOpacity.toFixed(2)),
          _MetallicOpacity: Number(metallicOpacity.toFixed(2)),
          colossal_UVScale: 1.0
        },
        Vector: {
          colossal_MeshSize: {
            x: Number(width.toFixed(2)),
            y: Number(depth.toFixed(2)),
            z: Number(height.toFixed(2)),
            w: 0
          },
          colossal_TextureArea: {
            x: 0,
            y: 0,
            z: 1,
            w: 1
          }
        }
      }, null, 2);
    } else {
      jsonString = JSON.stringify({
        width: Number(width.toFixed(2)),
        height: Number(height.toFixed(2)),
        depth: Number(depth.toFixed(2)),
        _colossal_DecalLayerMask: maskSum,
        "_Draw Order": drawOrder,
        _Metallic: Number(globalMetallic.toFixed(2)),
        _Smoothness: Number(globalSmoothness.toFixed(2))
      }, null, 2);
    }

    pathTextEl.textContent = `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\CustomDecals\\${category}\\${name}\\`;
  } else if (state.appMode === 'surface') {
    const uvScale = parseFloat(document.getElementById('uvScaleSlider').value) || 1.0;

    if (schemaFormat === 'extended') {
      jsonString = JSON.stringify({
        UiPriority: isNaN(uiPriority) ? 41 : uiPriority,
        Float: {
          _DrawOrder: drawOrder,
          _Metallic: Number(globalMetallic.toFixed(2)),
          _Smoothness: Number(globalSmoothness.toFixed(2)),
          colossal_UVScale: Number(uvScale.toFixed(2)),
          _NormalOpacity: Number(normalOpacity.toFixed(2)),
          _BaseOpacity: Number(baseOpacity.toFixed(2)),
          _MetallicOpacity: Number(metallicOpacity.toFixed(2))
        },
        Vector: {
          colossal_TextureArea: {
            x: 0,
            y: 0,
            z: 1,
            w: 1
          }
        }
      }, null, 2);
    } else {
      jsonString = JSON.stringify({
        uvScale: Number(uvScale.toFixed(2)),
        "_Draw Order": drawOrder,
        _Metallic: Number(globalMetallic.toFixed(2)),
        _Smoothness: Number(globalSmoothness.toFixed(2))
      }, null, 2);
    }

    pathTextEl.textContent = `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\CustomSurfaces\\${category}\\${name}\\`;
  } else {
    const laneWidth = parseFloat(document.getElementById('netlaneWidthSlider').value) || 1.0;
    const texLength = parseFloat(document.getElementById('netlaneLengthSlider').value) || 2.0;

    if (schemaFormat === 'extended') {
      jsonString = JSON.stringify({
        UiPriority: isNaN(uiPriority) ? 41 : uiPriority,
        Float: {
          _DrawOrder: drawOrder,
          _Metallic: Number(globalMetallic.toFixed(2)),
          _Smoothness: Number(globalSmoothness.toFixed(2)),
          _NormalOpacity: Number(normalOpacity.toFixed(2)),
          _BaseOpacity: Number(baseOpacity.toFixed(2)),
          _MetallicOpacity: Number(metallicOpacity.toFixed(2))
        },
        Vector: {
          colossal_MeshSize: {
            x: Number(laneWidth.toFixed(2)),
            y: 0.2,
            z: Number(texLength.toFixed(2)),
            w: 0
          },
          colossal_TextureArea: {
            x: 0,
            y: 0,
            z: 1,
            w: 1
          }
        }
      }, null, 2);
    } else {
      jsonString = JSON.stringify({
        width: Number(laneWidth.toFixed(2)),
        length: Number(texLength.toFixed(2)),
        "_Draw Order": drawOrder,
        _Metallic: Number(globalMetallic.toFixed(2)),
        _Smoothness: Number(globalSmoothness.toFixed(2))
      }, null, 2);
    }

    pathTextEl.textContent = `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\CustomNetlanes\\${category}\\${name}\\`;
  }

  document.getElementById('jsonCodeText').textContent = jsonString;
}

export function copyConfigJson() {
  const text = document.getElementById('jsonCodeText').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const file = state.appMode === 'decal' ? 'decal.json' : (state.appMode === 'netlane' ? 'netlane.json' : 'surface.json');
    showToast(`${file} copied!`);
  });
}

export function copyDecalPath() {
  const text = document.getElementById('targetPathText').textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Directory path copied to clipboard!');
  });
}

export function downloadConfigJson() {
  const defaultName = state.appMode === 'decal' ? 'CustomDecal' : (state.appMode === 'surface' ? 'CustomSurface' : 'CustomNetLane');
  const assetName = document.getElementById('assetName').value.trim() || defaultName;
  const jsonText = document.getElementById('jsonCodeText').textContent;
  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = state.appMode === 'decal' ? 'decal.json' : (state.appMode === 'netlane' ? 'netlane.json' : 'surface.json');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${a.download}`);
}

export function downloadSingleMap(type) {
  const { canvasBase, canvasNormal, canvasMask, canvasIcon } = getCanvases();
  let canvas = canvasBase;
  let filename = '_BaseColorMap.png';

  if (type === 'normal') {
    canvas = canvasNormal;
    filename = '_NormalMap.png';
  } else if (type === 'mask') {
    canvas = canvasMask;
    filename = '_MaskMap.png';
  } else if (type === 'icon') {
    canvas = canvasIcon;
    filename = 'icon.png';
  }

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }, 'image/png');
}

export function downloadAllMaps() {
  downloadSingleMap('base');
  setTimeout(() => downloadSingleMap('normal'), 250);
  setTimeout(() => downloadSingleMap('mask'), 500);
  setTimeout(() => downloadSingleMap('icon'), 750);
  setTimeout(() => downloadConfigJson(), 1000);
}

export async function exportZipPackage() {
  if (typeof JSZip === 'undefined') {
    showToast('JSZip library is still loading, please wait...');
    return;
  }

  const { canvasBase, canvasNormal, canvasMask, canvasIcon } = getCanvases();
  const defaultName = state.appMode === 'decal' ? 'CustomDecal' : (state.appMode === 'surface' ? 'CustomSurface' : 'CustomNetLane');
  const assetName = document.getElementById('assetName').value.trim() || defaultName;
  const category = getAssetCategory();
  const jsonString = document.getElementById('jsonCodeText').textContent;
  const isIconEnabled = true;

  const zip = new JSZip();
  const folder = zip.folder(assetName);

  if (state.appMode === 'decal') {
    folder.file('decal.json', jsonString);

    const normalOpacity = parseFloat(document.getElementById('normalOpacitySlider')?.value || '1.0');
    const baseOpacity = parseFloat(document.getElementById('baseOpacitySlider')?.value || '1.0');
    const metallicOpacity = parseFloat(document.getElementById('metallicOpacitySlider')?.value || '0.0');
    const officialSettings = {
      SurfacePostProcessor: {
        materialTemplate: "DefaultDecal"
      },
      floatProperties: {
        _NormalOpacity: Number(normalOpacity.toFixed(2)),
        _BaseOpacity: Number(baseOpacity.toFixed(2)),
        _MetallicOpacity: Number(metallicOpacity.toFixed(2))
      }
    };
    folder.file('settings.json', JSON.stringify(officialSettings, null, 2));
  } else if (state.appMode === 'surface') {
    folder.file('surface.json', jsonString);
  } else {
    folder.file('netlane.json', jsonString);
  }

  const getCanvasBlob = (canvas) => new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

  try {
    const promises = [
      getCanvasBlob(canvasBase),
      getCanvasBlob(canvasNormal),
      getCanvasBlob(canvasMask)
    ];
    if (isIconEnabled) {
      promises.push(getCanvasBlob(canvasIcon));
    }

    const blobs = await Promise.all(promises);
    const baseBlob = blobs[0];
    const normalBlob = blobs[1];
    const maskBlob = blobs[2];
    const iconBlob = isIconEnabled ? blobs[3] : null;

    // Exact CS2 / ExtraAssetsImporter base folder file names (matching user screenshot)
    folder.file('_BaseColorMap.png', baseBlob);
    folder.file('_NormalMap.png', normalBlob);
    folder.file('_MaskMap.png', maskBlob);

    if (iconBlob) {
      folder.file('icon.png', iconBlob);
    }

    const destPath = state.appMode === 'decal' 
      ? `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\CustomDecals\\${category}\\${assetName}\\`
      : (state.appMode === 'surface'
        ? `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\CustomSurfaces\\${category}\\${assetName}\\`
        : `%AppData%\\..\\LocalLow\\Colossal Order\\Cities Skylines II\\ModsData\\ExtraAssetsImporter\\CustomNetlanes\\${category}\\${assetName}\\`);

    const assetTypeTitle = state.appMode === 'decal' ? 'Decal' : (state.appMode === 'netlane' ? 'Net Lane' : 'Surface');
    const configFilename = state.appMode === 'decal' ? 'decal.json' : (state.appMode === 'netlane' ? 'netlane.json' : 'surface.json');

    const readme = `Cities: Skylines 2 Custom ${assetTypeTitle} Asset: ${assetName}
Generated for ExtraAssetsImporter & Native CS2 Asset Pipelines

DESTINATION DIRECTORY:
${destPath}

INCLUDED FILES:
- _BaseColorMap.png (RGB: Albedo, Alpha: Opacity cutout)
- _NormalMap.png (OpenGL Tangent +X, +Y normal bump)
- _MaskMap.png (R: Metallic, G: 0, B: 0, Alpha: Smoothness/Glossiness)
${iconBlob ? `- icon.png (CS2 UI Menu Thumbnail)` : ''}
- ${configFilename} (Asset configuration metadata)
${state.appMode === 'decal' ? '- settings.json (Official Colossal Order SurfacePostProcessor with DefaultDecal template)' : ''}

INSTRUCTIONS:
1. Extract the folder "${assetName}" directly into the directory path shown above.
2. Launch Cities: Skylines 2.
3. Access your Custom ${assetTypeTitle} in-game using the ExtraAssetsImporter tool menu or Editor.
`;
    folder.file('README.txt', readme);

    showToast('Generating zip package...');
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assetName}_${state.appMode === 'decal' ? 'Decal' : (state.appMode === 'netlane' ? 'NetLane' : 'Surface')}Package.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    state.lastExportedName = assetName;
    state.lastExportedTransform = { rot: state.textureRotation, flipH: state.flipH, flipV: state.flipV };
    state.originalNameBeforeTransform = assetName;
    state.isReminderDismissed = false;
    if (window.checkRotationNameReminder) window.checkRotationNameReminder();
    showToast(`Exported ${assetName}_${state.appMode === 'decal' ? 'Decal' : (state.appMode === 'netlane' ? 'NetLane' : 'Surface')}Package.zip!`);
  } catch (err) {
    console.error(err);
    showToast('Error generating zip package');
  }
}

// Project Serialization
export function serializeCurrentProject() {
  const { canvasBase } = getCanvases();
  let baseDataUrl = '';
  let thumbDataUrl = '';
  if (canvasBase && canvasBase.width > 0) {
    baseDataUrl = canvasBase.toDataURL('image/png');
    try {
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 96;
      thumbCanvas.height = 96;
      const tCtx = thumbCanvas.getContext('2d');
      tCtx.drawImage(canvasBase, 0, 0, 96, 96);
      thumbDataUrl = thumbCanvas.toDataURL('image/png');
    } catch (_) {}
  }

  let customNormalData = null;
  if (state.customNormalImg) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = state.customNormalImg.naturalWidth || state.customNormalImg.width;
    tempCanvas.height = state.customNormalImg.naturalHeight || state.customNormalImg.height;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(state.customNormalImg, 0, 0);
    customNormalData = tempCanvas.toDataURL('image/png');
  }

  let designerLogoData = null;
  if (state.designerLogoImg) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = state.designerLogoImg.naturalWidth || state.designerLogoImg.width;
    tempCanvas.height = state.designerLogoImg.naturalHeight || state.designerLogoImg.height;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(state.designerLogoImg, 0, 0);
    designerLogoData = tempCanvas.toDataURL('image/png');
  }

  let seriesLogoData = null;
  if (state.badge2Img) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = state.badge2Img.naturalWidth || state.badge2Img.width;
    tempCanvas.height = state.badge2Img.naturalHeight || state.badge2Img.height;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(state.badge2Img, 0, 0);
    seriesLogoData = tempCanvas.toDataURL('image/png');
  }

  return {
    version: '1.0',
    type: 'cs2-asset-project',
    appMode: state.appMode,
    assetName: document.getElementById('assetName').value.trim() || 'CustomAsset',
    seriesName: getAssetSeriesName(),
    assetCategory: getAssetCategory(),
    surfaceCategory: getAssetCategory(),
    targetResolution: state.currentResolution,
    fitStrategy: document.getElementById('fitStrategy').value,
    dimensions: {
      width: parseFloat(document.getElementById('dimWidth').value) || 2.0,
      height: parseFloat(document.getElementById('dimHeight').value) || 2.0,
      depth: parseFloat(document.getElementById('dimDepth').value) || 1.0,
      aspectLocked: !!state.decalAspectLocked,
      lockedRatio: state.decalLockedRatio || 1.0
    },
    netlane: {
      width: parseFloat(document.getElementById('netlaneWidthSlider').value) || 1.0,
      length: parseFloat(document.getElementById('netlaneLengthSlider').value) || 2.0
    },
    uvScale: parseFloat(document.getElementById('uvScaleSlider').value) || 1.0,
    surfaceTiling: state.surfaceTiling || 4,
    layerMask: {
      terrain: document.getElementById('layerTerrain').checked,
      roads: document.getElementById('layerRoads').checked,
      buildings: document.getElementById('layerBuildings').checked,
      vehicles: document.getElementById('layerVehicles').checked
    },
    drawOrder: parseInt(document.getElementById('drawOrderSlider').value, 10) || (state.appMode === 'decal' ? 50 : -50),
    jsonSchemaFormat: document.getElementById('jsonSchemaFormat')?.value || 'extended',
    uiPriority: parseInt(document.getElementById('uiPrioritySlider')?.value, 10) || 41,
    baseOpacity: parseFloat(document.getElementById('baseOpacitySlider')?.value) || 1.0,
    metallicOpacity: parseFloat(document.getElementById('metallicOpacitySlider')?.value) || 0.0,
    globalFallbacks: {
      metallic: parseFloat(document.getElementById('globalMetallicSlider').value) || 0.0,
      smoothness: parseFloat(document.getElementById('globalSmoothnessSlider').value) || 0.0
    },
    normal: {
      isCustom: !!state.customNormalImg,
      customNormalFileName: state.customNormalFileName || '',
      customNormalData: customNormalData,
      bumpIntensity: parseFloat(document.getElementById('bumpIntensity').value) || 2.5,
      normalBlur: parseInt(document.getElementById('normalBlur').value, 10) || 0,
      invertBump: document.getElementById('invertBump').checked,
      flipNormalY: document.getElementById('flipNormalY') ? document.getElementById('flipNormalY').checked : false
    },
    mask: {
      metallic: parseInt(document.getElementById('metallic').value, 10) || 0,
      smoothness: parseInt(document.getElementById('smoothness').value, 10) || 40,
      maskWithDecalAlpha: document.getElementById('maskWithDecalAlpha').checked
    },
    icon: {
      enableIconGen: true,
      iconBgStyle: document.getElementById('iconBgStyle')?.value || 'cs2-dark',
      badge1: {
        enabled: state.badge1Enabled,
        type: state.badge1Type,
        preset: state.presetLogoType,
        text: document.getElementById('badge1TextInput')?.value || 'CREATOR',
        colorMode: state.badge1ColorMode,
        colorTheme: state.badge1ColorTheme,
        customBg1: state.badge1CustomBg1,
        customBg2: state.badge1CustomBg2,
        customStroke: state.badge1CustomStroke,
        customText: state.badge1CustomText,
        solidBg: state.badge1SolidBg,
        solidStroke: state.badge1SolidStroke,
        solidText: state.badge1SolidText,
        gradDir: state.badge1GradDir,
        letterSpacing: state.badge1LetterSpacing,
        font: document.getElementById('badge1FontFamily')?.value || 'Montserrat',
        bold: state.badge1Bold,
        italic: state.badge1Italic,
        ptSize: state.badge1PtSize,
        position: document.getElementById('logoPosition')?.value || 'bottom-right',
        frame: document.getElementById('badge1Frame')?.value || 'circle',
        scale: parseInt(document.getElementById('badgeScale')?.value || '26', 10),
        opacity: parseInt(document.getElementById('badgeOpacity')?.value || '95', 10),
        edgePadding: state.badge1EdgePadding,
        innerPadding: state.badge1InnerPadding,
        fileName: state.badge1FileName || '',
        imageData: designerLogoData
      },
      badge2: {
        enabled: state.badge2Enabled,
        type: state.badge2Type,
        preset: state.badge2Preset,
        text: document.getElementById('seriesTextInput')?.value || 'GRAFFITI',
        colorMode: state.badge2ColorMode,
        colorTheme: state.badge2ColorTheme || 'purple',
        customBg1: state.badge2CustomBg1,
        customBg2: state.badge2CustomBg2,
        customStroke: state.badge2CustomStroke,
        customText: state.badge2CustomText,
        solidBg: state.badge2SolidBg,
        solidStroke: state.badge2SolidStroke,
        solidText: state.badge2SolidText,
        gradDir: state.badge2GradDir,
        letterSpacing: state.badge2LetterSpacing,
        font: document.getElementById('seriesFontFamily')?.value || 'Bebas Neue',
        bold: state.badge2Bold,
        italic: state.badge2Italic,
        ptSize: state.badge2PtSize,
        position: document.getElementById('seriesPosition')?.value || 'top-left',
        frame: document.getElementById('badge2Frame')?.value || 'pill',
        scale: parseInt(document.getElementById('seriesScale')?.value || '24', 10),
        opacity: parseInt(document.getElementById('seriesOpacity')?.value || '95', 10),
        edgePadding: state.badge2EdgePadding,
        innerPadding: state.badge2InnerPadding,
        fileName: state.badge2FileName || '',
        imageData: seriesLogoData
      },
      customGoogleFonts: state.customGoogleFonts || [],
      logoPosition: document.getElementById('logoPosition')?.value || 'bottom-right',
      badgeScale: parseInt(document.getElementById('badgeScale')?.value || '26', 10),
      badgeOpacity: parseInt(document.getElementById('badgeOpacity')?.value || '95', 10),
      presetLogoType: state.presetLogoType,
      designerLogoData: designerLogoData
    },
    baseImageData: baseDataUrl,
    thumbImageData: thumbDataUrl,
    timestamp: Date.now()
  };
}

export function deserializeAndLoadProject(proj) {
  if (!proj || proj.type !== 'cs2-asset-project') {
    showToast('Invalid or unsupported project file');
    return;
  }

  if (window.setMode) window.setMode(proj.appMode || 'decal');

  if (proj.assetName) document.getElementById('assetName').value = proj.assetName;
  if (proj.assetCategory || proj.surfaceCategory) {
    setAssetCategory(proj.assetCategory || proj.surfaceCategory);
  }
  if (proj.targetResolution) {
    document.getElementById('targetRes').value = proj.targetResolution;
    state.currentResolution = proj.targetResolution;
    document.getElementById('resBadge1').textContent = `${state.currentResolution}×${state.currentResolution}`;
    document.getElementById('resBadge2').textContent = `${state.currentResolution}×${state.currentResolution}`;
    document.getElementById('resBadge3').textContent = `${state.currentResolution}×${state.currentResolution}`;
  }
  if (proj.fitStrategy) document.getElementById('fitStrategy').value = proj.fitStrategy;

  if (proj.dimensions) {
    if (proj.dimensions.width !== undefined) {
      document.getElementById('dimWidth').value = proj.dimensions.width;
      if (document.getElementById('dimWidthSlider')) document.getElementById('dimWidthSlider').value = proj.dimensions.width;
    }
    if (proj.dimensions.height !== undefined) {
      document.getElementById('dimHeight').value = proj.dimensions.height;
      if (document.getElementById('dimHeightSlider')) document.getElementById('dimHeightSlider').value = proj.dimensions.height;
    }
    if (proj.dimensions.depth !== undefined) {
      document.getElementById('dimDepth').value = proj.dimensions.depth;
      if (document.getElementById('dimDepthSlider')) document.getElementById('dimDepthSlider').value = proj.dimensions.depth;
    }
    if (proj.dimensions.aspectLocked !== undefined) {
      setDecalAspectLock(proj.dimensions.aspectLocked, proj.dimensions.lockedRatio);
    } else {
      updateDecalAspectUI();
    }
  }
  if (proj.uvScale !== undefined) {
    document.getElementById('uvScaleSlider').value = proj.uvScale;
    document.getElementById('uvScaleVal').textContent = Number(proj.uvScale).toFixed(1);
  }
  if (proj.surfaceTiling !== undefined) {
    setSurfaceTiling(proj.surfaceTiling);
  }
  if (proj.netlane) {
    if (proj.netlane.width !== undefined) {
      document.getElementById('netlaneWidthSlider').value = proj.netlane.width;
      document.getElementById('netlaneWidthVal').textContent = `${Number(proj.netlane.width).toFixed(1)} m`;
    }
    if (proj.netlane.length !== undefined) {
      document.getElementById('netlaneLengthSlider').value = proj.netlane.length;
      document.getElementById('netlaneLengthVal').textContent = `${Number(proj.netlane.length).toFixed(1)} m`;
    }
  }

  if (proj.layerMask) {
    if (proj.layerMask.terrain !== undefined) document.getElementById('layerTerrain').checked = proj.layerMask.terrain;
    if (proj.layerMask.roads !== undefined) document.getElementById('layerRoads').checked = proj.layerMask.roads;
    if (proj.layerMask.buildings !== undefined) document.getElementById('layerBuildings').checked = proj.layerMask.buildings;
    if (proj.layerMask.vehicles !== undefined) document.getElementById('layerVehicles').checked = proj.layerMask.vehicles;
  }

  if (proj.drawOrder !== undefined) {
    document.getElementById('drawOrderSlider').value = proj.drawOrder;
    document.getElementById('drawOrderVal').textContent = proj.drawOrder;
  }

  if (proj.jsonSchemaFormat && document.getElementById('jsonSchemaFormat')) {
    document.getElementById('jsonSchemaFormat').value = proj.jsonSchemaFormat;
  }
  if (proj.uiPriority !== undefined && document.getElementById('uiPrioritySlider')) {
    document.getElementById('uiPrioritySlider').value = proj.uiPriority;
    const badge = document.getElementById('uiPriorityVal');
    if (badge) badge.textContent = proj.uiPriority;
  }
  if (proj.baseOpacity !== undefined && document.getElementById('baseOpacitySlider')) {
    document.getElementById('baseOpacitySlider').value = proj.baseOpacity;
    const badge = document.getElementById('baseOpacityVal');
    if (badge) badge.textContent = Number(proj.baseOpacity).toFixed(2);
  }
  if (proj.metallicOpacity !== undefined && document.getElementById('metallicOpacitySlider')) {
    document.getElementById('metallicOpacitySlider').value = proj.metallicOpacity;
    const badge = document.getElementById('metallicOpacityVal');
    if (badge) badge.textContent = Number(proj.metallicOpacity).toFixed(2);
  }

  if (proj.globalFallbacks) {
    if (proj.globalFallbacks.metallic !== undefined) {
      document.getElementById('globalMetallicSlider').value = proj.globalFallbacks.metallic;
      document.getElementById('globalMetallicVal').textContent = Number(proj.globalFallbacks.metallic).toFixed(2);
    }
    if (proj.globalFallbacks.smoothness !== undefined) {
      document.getElementById('globalSmoothnessSlider').value = proj.globalFallbacks.smoothness;
      document.getElementById('globalSmoothnessVal').textContent = Number(proj.globalFallbacks.smoothness).toFixed(2);
    }
  }

  if (proj.normal) {
    if (proj.normal.bumpIntensity !== undefined) {
      document.getElementById('bumpIntensity').value = proj.normal.bumpIntensity;
      document.getElementById('bumpVal').textContent = `${Number(proj.normal.bumpIntensity).toFixed(1)}×`;
    }
    if (proj.normal.normalBlur !== undefined) {
      document.getElementById('normalBlur').value = proj.normal.normalBlur;
      document.getElementById('blurVal').textContent = `${proj.normal.normalBlur} px`;
    }
    if (proj.normal.invertBump !== undefined) {
      document.getElementById('invertBump').checked = proj.normal.invertBump;
    }
    if (proj.normal.flipNormalY !== undefined && document.getElementById('flipNormalY')) {
      document.getElementById('flipNormalY').checked = proj.normal.flipNormalY;
    }
    if (proj.normal.customNormalData) {
      const nImg = new Image();
      nImg.onload = () => {
        state.customNormalImg = nImg;
        state.customNormalFileName = proj.normal.customNormalFileName || 'Custom_NormalMap.png';
        updateCustomNormalUI();
        if (window.renderAllMaps) window.renderAllMaps();
      };
      nImg.src = proj.normal.customNormalData;
    } else {
      clearCustomNormal(false);
    }
  } else {
    clearCustomNormal(false);
  }

  if (proj.mask) {
    if (proj.mask.metallic !== undefined) {
      document.getElementById('metallic').value = proj.mask.metallic;
      const pct = Math.round((proj.mask.metallic / 255) * 100);
      document.getElementById('metalVal').textContent = `${proj.mask.metallic} (${pct}%)`;
    }
    if (proj.mask.smoothness !== undefined) {
      document.getElementById('smoothness').value = proj.mask.smoothness;
      const pct = Math.round((proj.mask.smoothness / 255) * 100);
      document.getElementById('smoothVal').textContent = `${proj.mask.smoothness} (${pct}%)`;
    }
    if (proj.mask.maskWithDecalAlpha !== undefined) {
      document.getElementById('maskWithDecalAlpha').checked = proj.mask.maskWithDecalAlpha;
    }
  }

  if (proj.icon) {
    if (proj.icon.enableIconGen !== undefined && document.getElementById('enableIconGen')) {
      document.getElementById('enableIconGen').checked = proj.icon.enableIconGen;
    }
    if (proj.icon.iconBgStyle && document.getElementById('iconBgStyle')) {
      document.getElementById('iconBgStyle').value = proj.icon.iconBgStyle;
    }

    if (proj.icon.customGoogleFonts && Array.isArray(proj.icon.customGoogleFonts)) {
      proj.icon.customGoogleFonts.forEach(font => {
        if (!state.customGoogleFonts.includes(font)) state.customGoogleFonts.push(font);
        loadGoogleFont(font);
      });
    }
    populateFontDropdowns();

    const b1 = proj.icon.badge1 || {
      enabled: true,
      preset: proj.icon.presetLogoType || null,
      position: proj.icon.logoPosition || 'bottom-right',
      frame: 'circle',
      scale: proj.icon.badgeScale !== undefined ? proj.icon.badgeScale : 26,
      opacity: proj.icon.badgeOpacity !== undefined ? proj.icon.badgeOpacity : 95,
      fileName: '',
      imageData: proj.icon.designerLogoData || null
    };

    state.badge1Enabled = b1.enabled !== false;
    if (document.getElementById('enableBadge1')) document.getElementById('enableBadge1').checked = state.badge1Enabled;
    state.badge1Type = b1.type || (b1.imageData ? 'image' : 'preset');
    state.badge1Text = b1.text || 'CREATOR';
    state.badge1Font = b1.font || 'Montserrat';
    state.badge1Bold = b1.bold !== false;
    state.badge1Italic = b1.italic === true;
    state.badge1PtSize = b1.ptSize || 13;

    state.badge1ColorMode = b1.colorMode || 'theme';
    state.badge1ColorTheme = b1.colorTheme || 'cyan';
    state.badge1CustomBg1 = b1.customBg1 || '#091524';
    state.badge1CustomBg2 = b1.customBg2 || '#0e243d';
    state.badge1CustomStroke = b1.customStroke || '#00a8ff';
    state.badge1CustomText = b1.customText || '#ffffff';
    state.badge1SolidBg = b1.solidBg || '#091524';
    state.badge1SolidStroke = b1.solidStroke || '#00a8ff';
    state.badge1SolidText = b1.solidText || '#ffffff';
    state.badge1GradDir = b1.gradDir || 'diagonal';
    state.badge1LetterSpacing = b1.letterSpacing === true;

    setCreatorColorTheme(state.badge1ColorTheme);
    setCreatorGradDirection(state.badge1GradDir);
    setCreatorColorMode(state.badge1ColorMode);

    if (document.getElementById('badge1TextInput')) document.getElementById('badge1TextInput').value = state.badge1Text;
    onBadge1TextChange(false);
    if (document.getElementById('badge1FontFamily')) document.getElementById('badge1FontFamily').value = state.badge1Font;
    document.getElementById('btnBadge1Bold')?.classList.toggle('active', state.badge1Bold);
    document.getElementById('btnBadge1Italic')?.classList.toggle('active', state.badge1Italic);
    if (document.getElementById('badge1PtSize')) {
      document.getElementById('badge1PtSize').value = state.badge1PtSize;
      if (document.getElementById('badge1PtSizeVal')) document.getElementById('badge1PtSizeVal').textContent = `${state.badge1PtSize} pt`;
    }

    if (b1.position && document.getElementById('logoPosition')) document.getElementById('logoPosition').value = b1.position;
    if (b1.frame && document.getElementById('badge1Frame')) document.getElementById('badge1Frame').value = b1.frame;
    if (b1.scale !== undefined && document.getElementById('badgeScale')) {
      document.getElementById('badgeScale').value = b1.scale;
      document.getElementById('badgeScaleVal').textContent = `${b1.scale}%`;
    }
    if (b1.opacity !== undefined && document.getElementById('badgeOpacity')) {
      document.getElementById('badgeOpacity').value = b1.opacity;
      document.getElementById('badgeOpacityVal').textContent = `${b1.opacity}%`;
    }
    if (b1.edgePadding !== undefined) {
      state.badge1EdgePadding = b1.edgePadding;
      if (document.getElementById('badge1Padding')) document.getElementById('badge1Padding').value = b1.edgePadding;
      if (document.getElementById('badge1PaddingVal')) document.getElementById('badge1PaddingVal').textContent = `${b1.edgePadding} px`;
    }
    if (b1.innerPadding !== undefined) {
      state.badge1InnerPadding = b1.innerPadding;
      if (document.getElementById('badge1InnerPadding')) document.getElementById('badge1InnerPadding').value = b1.innerPadding;
      if (document.getElementById('badge1InnerPaddingVal')) document.getElementById('badge1InnerPaddingVal').textContent = `${b1.innerPadding} px`;
    }

    state.presetLogoType = b1.preset || null;
    state.badge1FileName = b1.fileName || '';
    setCreatorBadgeMode(state.badge1Type);

    if (b1.imageData) {
      const lImg = new Image();
      lImg.onload = () => {
        state.designerLogoImg = lImg;
        const btn = document.getElementById('logoUploadBtnText');
        if (btn) btn.textContent = state.badge1FileName ? state.badge1FileName.substring(0, 16) + '...' : 'Custom Logo Loaded';
        const btnClear = document.getElementById('btnClearLogo');
        if (btnClear) btnClear.style.display = 'block';
        renderIconMap();
      };
      lImg.src = b1.imageData;
    } else if (state.presetLogoType) {
      state.designerLogoImg = null;
      const btn = document.getElementById('logoUploadBtnText');
      if (btn) btn.textContent = 'Upload Creator Logo...';
      const btnClear = document.getElementById('btnClearLogo');
      if (btnClear) btnClear.style.display = 'block';
    } else {
      clearDesignerLogo();
    }

    if (proj.icon.badge2) {
      const b2 = proj.icon.badge2;
      state.badge2Enabled = b2.enabled !== false;
      if (document.getElementById('enableBadge2')) document.getElementById('enableBadge2').checked = state.badge2Enabled;
      state.badge2Type = b2.type || 'preset';
      state.badge2Preset = b2.preset || 'graffiti';
      state.badge2Text = b2.text || 'GRAFFITI';
      state.badge2ColorTheme = b2.colorTheme || 'purple';
      state.badge2LetterSpacing = b2.letterSpacing === true;
      state.badge2Font = b2.font || 'Bebas Neue';
      state.badge2Bold = b2.bold !== false;
      state.badge2Italic = b2.italic === true;
      state.badge2PtSize = b2.ptSize || 13;
      state.badge2FileName = b2.fileName || '';

      state.badge2ColorMode = b2.colorMode || 'theme';
      state.badge2CustomBg1 = b2.customBg1 || '#151326';
      state.badge2CustomBg2 = b2.customBg2 || '#251336';
      state.badge2CustomStroke = b2.customStroke || '#c084fc';
      state.badge2CustomText = b2.customText || '#ffffff';
      state.badge2SolidBg = b2.solidBg || '#151326';
      state.badge2SolidStroke = b2.solidStroke || '#c084fc';
      state.badge2SolidText = b2.solidText || '#ffffff';
      state.badge2GradDir = b2.gradDir || 'diagonal';

      setSeriesColorTheme(state.badge2ColorTheme);
      setSeriesGradDirection(state.badge2GradDir);
      setSeriesColorMode(state.badge2ColorMode);

      if (document.getElementById('seriesTextInput')) document.getElementById('seriesTextInput').value = state.badge2Text;
      onSeriesTextChange(false);
      if (document.getElementById('seriesFontFamily')) document.getElementById('seriesFontFamily').value = state.badge2Font;
      document.getElementById('btnSeriesBold')?.classList.toggle('active', state.badge2Bold);
      document.getElementById('btnSeriesItalic')?.classList.toggle('active', state.badge2Italic);

      if (document.getElementById('seriesPtSize')) {
        document.getElementById('seriesPtSize').value = state.badge2PtSize;
        if (document.getElementById('seriesPtSizeVal')) document.getElementById('seriesPtSizeVal').textContent = `${state.badge2PtSize} pt`;
      }

      if (b2.position && document.getElementById('seriesPosition')) document.getElementById('seriesPosition').value = b2.position;
      if (b2.frame && document.getElementById('badge2Frame')) document.getElementById('badge2Frame').value = b2.frame;
      if (b2.scale !== undefined && document.getElementById('seriesScale')) {
        document.getElementById('seriesScale').value = b2.scale;
        document.getElementById('seriesScaleVal').textContent = `${b2.scale}%`;
      }
      if (b2.opacity !== undefined && document.getElementById('seriesOpacity')) {
        document.getElementById('seriesOpacity').value = b2.opacity;
        document.getElementById('seriesOpacityVal').textContent = `${b2.opacity}%`;
      }
      if (b2.edgePadding !== undefined) {
        state.badge2EdgePadding = b2.edgePadding;
        if (document.getElementById('seriesPadding')) document.getElementById('seriesPadding').value = b2.edgePadding;
        if (document.getElementById('seriesPaddingVal')) document.getElementById('seriesPaddingVal').textContent = `${b2.edgePadding} px`;
      }
      if (b2.innerPadding !== undefined) {
        state.badge2InnerPadding = b2.innerPadding;
        if (document.getElementById('seriesInnerPadding')) document.getElementById('seriesInnerPadding').value = b2.innerPadding;
        if (document.getElementById('seriesInnerPaddingVal')) document.getElementById('seriesInnerPaddingVal').textContent = `${b2.innerPadding} px`;
      }

      setSeriesBadgeMode(state.badge2Type);

      if (b2.imageData) {
        const sImg = new Image();
        sImg.onload = () => {
          state.badge2Img = sImg;
          const btn = document.getElementById('seriesLogoUploadBtnText');
          if (btn) btn.textContent = state.badge2FileName ? state.badge2FileName.substring(0, 16) + '...' : 'Series Logo Loaded';
          const btnClear = document.getElementById('btnClearSeriesLogo');
          if (btnClear) btnClear.style.display = 'block';
          renderIconMap();
        };
        sImg.src = b2.imageData;
      } else {
        state.badge2Img = null;
        const btn = document.getElementById('seriesLogoUploadBtnText');
        if (btn) btn.textContent = 'Upload Series Logo...';
        const btnClear = document.getElementById('btnClearSeriesLogo');
        if (btnClear) btnClear.style.display = 'none';
      }
    }

    const dot1 = document.getElementById('dotBadge1');
    if (dot1) dot1.className = state.badge1Enabled ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
    const dot2 = document.getElementById('dotBadge2');
    if (dot2) dot2.className = state.badge2Enabled ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
    renderIconMap();
  }

  if (proj.baseImageData) {
    const img = new Image();
    img.onload = () => {
      state.currentImage = img;
      state.isCustomImageLoaded = true;
      state.hasUnsavedChanges = false;
      updateConfigJson();
      if (window.renderAllMaps) window.renderAllMaps();
      showToast(`Loaded ${proj.assetName} successfully!`);
    };
    img.src = proj.baseImageData;
  } else {
    state.isCustomImageLoaded = true;
    state.hasUnsavedChanges = false;
    updateConfigJson();
    if (window.renderAllMaps) window.renderAllMaps();
    showToast(`Loaded ${proj.assetName}`);
  }
}

export function saveProjectToFile() {
  const proj = serializeCurrentProject();
  const jsonStr = JSON.stringify(proj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${proj.assetName}.cs2asset`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  state.hasUnsavedChanges = false;
  showToast(`Saved ${proj.assetName}.cs2asset`);
}

export function handleProjectFileLoad(e) {
  if (!e.target.files.length) return;
  const file = e.target.files[0];
  e.target.value = '';

  if (state.isCustomImageLoaded && state.hasUnsavedChanges) {
    state.pendingGuardAction = () => {
      loadProjectFromFileObject(file);
    };
    if (window.openUnsavedModal) window.openUnsavedModal();
    return;
  }
  loadProjectFromFileObject(file);
}

export function loadProjectFromFileObject(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const proj = JSON.parse(event.target.result);
      deserializeAndLoadProject(proj);
    } catch (err) {
      console.error(err);
      showToast('Failed to parse project file');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// Community Asset Importer (.zip or extracted folder / files)
// ==========================================

export function toggleImportDropdown(forceState) {
  const menu = document.getElementById('importDropdownMenu');
  if (!menu) return;
  if (typeof forceState === 'boolean') {
    menu.style.display = forceState ? 'block' : 'none';
  } else {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

export async function handleCommunityZipImport(e) {
  const file = e?.target?.files?.[0];
  if (!file) return;
  setTimeout(() => {
    try { if (e?.target) e.target.value = ''; } catch (_) {}
  }, 100);

  if (state.isCustomImageLoaded && state.hasUnsavedChanges) {
    state.pendingGuardAction = () => importCommunityAssetFromZip(file);
    if (window.openUnsavedModal) window.openUnsavedModal();
    return;
  }
  await importCommunityAssetFromZip(file);
}

export async function handleCommunityFolderImport(e) {
  const fileList = e?.target?.files;
  if (!fileList || fileList.length === 0) return;
  const files = Array.from(fileList);
  setTimeout(() => {
    try { if (e?.target) e.target.value = ''; } catch (_) {}
  }, 100);

  if (state.isCustomImageLoaded && state.hasUnsavedChanges) {
    state.pendingGuardAction = () => importCommunityAssetFromFiles(files);
    if (window.openUnsavedModal) window.openUnsavedModal();
    return;
  }
  await importCommunityAssetFromFiles(files);
}

export async function handleCommunityFilesImport(e) {
  const fileList = e?.target?.files;
  if (!fileList || fileList.length === 0) return;
  const files = Array.from(fileList);
  setTimeout(() => {
    try { if (e?.target) e.target.value = ''; } catch (_) {}
  }, 100);

  if (state.isCustomImageLoaded && state.hasUnsavedChanges) {
    state.pendingGuardAction = () => importCommunityAssetFromFiles(files);
    if (window.openUnsavedModal) window.openUnsavedModal();
    return;
  }
  await importCommunityAssetFromFiles(files);
}

export async function importCommunityAssetFromZip(zipFile) {
  const JSZipLib = JSZip || window.JSZip;
  if (!JSZipLib) {
    showToast('ZIP parsing library is not loaded');
    return;
  }

  showToast(`Reading ZIP archive "${zipFile.name}"...`);
  try {
    const zip = await JSZipLib.loadAsync(zipFile);
    const filesData = [];
    const fileEntries = [];

    zip.forEach((relativePath, entry) => {
      const cleanPath = relativePath.replace(/\\/g, '/');
      const parts = cleanPath.split('/');
      const fileName = parts.pop() || '';
      if (!entry.dir && !cleanPath.startsWith('__MACOSX/') && !fileName.startsWith('.') && fileName.length > 0) {
        fileEntries.push({ path: cleanPath, fileName, entry });
      }
    });

    for (const { path, fileName, entry } of fileEntries) {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      let mime = 'application/octet-stream';
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      } else if (ext === 'json') {
        mime = 'application/json';
      } else if (ext === 'txt') {
        mime = 'text/plain';
      }

      filesData.push({
        name: fileName,
        path: path,
        getText: () => entry.async('string'),
        getBlob: async () => {
          const ab = await entry.async('arraybuffer');
          return new Blob([ab], { type: mime });
        }
      });
    }

    if (filesData.length === 0) {
      showToast('No valid files found inside the ZIP archive');
      return;
    }

    await parseAndApplyCommunityAsset(filesData);
  } catch (err) {
    console.error('Error importing ZIP archive:', err);
    showToast('Failed to unpack ZIP archive: ' + (err.message || 'Unknown error'));
  }
}

export async function importCommunityAssetFromFiles(fileList) {
  const filesArray = Array.from(fileList);
  if (filesArray.length === 0) {
    showToast('No files selected');
    return;
  }

  showToast(`Reading ${filesArray.length} asset files...`);
  try {
    const filesData = filesArray.map(file => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      getText: () => file.text(),
      getBlob: () => Promise.resolve(file)
    }));

    await parseAndApplyCommunityAsset(filesData);
  } catch (err) {
    console.error('Error importing community asset files:', err);
    showToast('Failed to read files: ' + (err.message || 'Unknown error'));
  }
}

export async function parseAndApplyCommunityAsset(filesData) {
  if (!filesData || filesData.length === 0) {
    showToast('No valid files found in package');
    return;
  }

  try {
    // 1. Locate configuration JSON file
    let configJson = null;
    let jsonFileName = '';
    let candidateJsonEntry = null;

    const preferredJsonNames = ['decal.json', 'surface.json', 'netlane.json'];
    for (const name of preferredJsonNames) {
      const found = filesData.find(f => f.name.toLowerCase() === name);
      if (found) {
        candidateJsonEntry = found;
        jsonFileName = name;
        break;
      }
    }

    if (!candidateJsonEntry) {
      candidateJsonEntry = filesData.find(f => f.name.toLowerCase().endsWith('.json') && !f.name.toLowerCase().endsWith('settings.json'));
      if (!candidateJsonEntry) {
        candidateJsonEntry = filesData.find(f => f.name.toLowerCase().endsWith('.json'));
      }
      if (candidateJsonEntry) jsonFileName = candidateJsonEntry.name;
    }

    if (candidateJsonEntry) {
      try {
        const text = await candidateJsonEntry.getText();
        configJson = JSON.parse(text);
      } catch (e) {
        console.warn('Could not parse configuration JSON:', e);
      }
    }

    const settingsEntry = filesData.find(f => f.name.toLowerCase() === 'settings.json');
    let settingsJson = null;
    if (settingsEntry) {
      try {
        settingsJson = JSON.parse(await settingsEntry.getText());
      } catch (e) {
        console.warn('Could not parse settings.json:', e);
      }
    }

    // 2. Identify Texture Maps
    let baseColorEntry = null;
    let normalMapEntry = null;
    let maskMapEntry = null;
    let iconMapEntry = null;

    for (const f of filesData) {
      const lName = f.name.toLowerCase();
      if (!lName.endsWith('.png') && !lName.endsWith('.jpg') && !lName.endsWith('.jpeg') && !lName.endsWith('.webp')) continue;

      if (lName.includes('basecolor') || lName.includes('albedo') || lName.includes('diffuse')) {
        baseColorEntry = f;
      } else if (lName.includes('normal')) {
        normalMapEntry = f;
      } else if (lName.includes('mask')) {
        maskMapEntry = f;
      } else if (lName.includes('icon') || lName.includes('thumb')) {
        iconMapEntry = f;
      }
    }

    // Fallback for BaseColor
    if (!baseColorEntry) {
      baseColorEntry = filesData.find(f => {
        const lName = f.name.toLowerCase();
        return (lName.endsWith('.png') || lName.endsWith('.jpg') || lName.endsWith('.jpeg') || lName.endsWith('.webp')) &&
               !lName.includes('normal') && !lName.includes('mask') && !lName.includes('icon') && !lName.includes('thumb');
      });
    }

    if (!baseColorEntry) {
      showToast('Error: No BaseColor or texture image found in package');
      return;
    }

    // 3. Determine Mode & Asset Name
    let detectedMode = 'decal';
    let detectedName = '';
    let detectedCategory = '';

    const baseNameNoExt = baseColorEntry.name.replace(/\.[^/.]+$/, '');
    const cleanedFromName = baseNameNoExt
      .replace(/_BaseColor(Map)?/i, '')
      .replace(/_Base/i, '')
      .replace(/_Normal(Map)?/i, '')
      .replace(/_Mask(Map)?/i, '');

    if (cleanedFromName && cleanedFromName.toLowerCase() !== 'basecolor' && cleanedFromName.toLowerCase() !== 'basecolormap') {
      detectedName = cleanedFromName;
    } else if (jsonFileName && !preferredJsonNames.includes(jsonFileName.toLowerCase())) {
      detectedName = jsonFileName.replace(/\.json$/i, '');
    } else {
      const parts = (baseColorEntry.path || '').split(/[/\\\\]/).filter(Boolean);
      if (parts.length > 1) {
        detectedName = parts[parts.length - 2];
      } else {
        detectedName = 'CommunityAsset';
      }
    }

    // Detect category from folder path if present
    const fullPath = (baseColorEntry.path || '').replace(/\\/g, '/');
    const pathParts = fullPath.split('/').filter(Boolean);
    if (pathParts.length >= 3) {
      const possibleCat = pathParts[pathParts.length - 2];
      if (possibleCat && possibleCat !== detectedName && !possibleCat.startsWith('Custom')) {
        detectedCategory = possibleCat;
      }
    }

    // Detect Mode: surface, netlane, or decal
    if (
      jsonFileName.toLowerCase() === 'surface.json' ||
      fullPath.includes('CustomSurfaces') ||
      (configJson && (configJson.colossal_UVScale !== undefined || configJson.uvScale !== undefined || (configJson.Float && configJson.Float.colossal_UVScale !== undefined)))
    ) {
      detectedMode = 'surface';
    } else if (
      jsonFileName.toLowerCase() === 'netlane.json' ||
      fullPath.includes('CustomNetlanes') ||
      (configJson && (configJson.length !== undefined || (configJson.Vector && configJson.Vector.colossal_MeshSize && configJson.Vector.colossal_MeshSize.y === 0.2)))
    ) {
      detectedMode = 'netlane';
    } else {
      detectedMode = 'decal';
    }

    // Set Asset Name in UI first to prevent setMode from resetting to demo presets!
    const nameInput = document.getElementById('assetName');
    if (nameInput && detectedName) {
      nameInput.value = detectedName;
      state.currentLoadedAssetName = detectedName;
    }

    // Switch App Mode
    if (window.setMode) window.setMode(detectedMode);

    // Re-affirm custom name if mode switch altered it
    if (nameInput && detectedName) {
      nameInput.value = detectedName;
    }

    // Set Category if detected
    if (detectedCategory) {
      setAssetCategory(detectedCategory);
    }

    // 4. Apply Properties from JSON
    if (configJson || settingsJson) {
      const floatProps = configJson?.Float || configJson?.floatProperties || settingsJson?.floatProperties || configJson || {};
      const vecProps = configJson?.Vector || configJson || {};

      const drawOrder = floatProps._DrawOrder ?? floatProps['_Draw Order'] ?? floatProps.drawOrder;
      if (drawOrder !== undefined && document.getElementById('drawOrderSlider')) {
        document.getElementById('drawOrderSlider').value = drawOrder;
        const dVal = document.getElementById('drawOrderVal');
        if (dVal) dVal.textContent = drawOrder;
      }

      if (floatProps._Metallic !== undefined && document.getElementById('globalMetallicSlider')) {
        document.getElementById('globalMetallicSlider').value = floatProps._Metallic;
        const mVal = document.getElementById('globalMetallicVal');
        if (mVal) mVal.textContent = Number(floatProps._Metallic).toFixed(2);
      }
      if (floatProps._Smoothness !== undefined && document.getElementById('globalSmoothnessSlider')) {
        document.getElementById('globalSmoothnessSlider').value = floatProps._Smoothness;
        const sVal = document.getElementById('globalSmoothnessVal');
        if (sVal) sVal.textContent = Number(floatProps._Smoothness).toFixed(2);
      }

      const normOp = floatProps._NormalOpacity ?? settingsJson?.floatProperties?._NormalOpacity;
      if (normOp !== undefined && document.getElementById('normalOpacitySlider')) {
        document.getElementById('normalOpacitySlider').value = normOp;
        const nVal = document.getElementById('normalOpacityVal');
        if (nVal) nVal.textContent = Number(normOp).toFixed(2);
      }
      const baseOp = floatProps._BaseOpacity ?? settingsJson?.floatProperties?._BaseOpacity;
      if (baseOp !== undefined && document.getElementById('baseOpacitySlider')) {
        document.getElementById('baseOpacitySlider').value = baseOp;
        const bVal = document.getElementById('baseOpacityVal');
        if (bVal) bVal.textContent = Number(baseOp).toFixed(2);
      }
      const metOp = floatProps._MetallicOpacity ?? settingsJson?.floatProperties?._MetallicOpacity;
      if (metOp !== undefined && document.getElementById('metallicOpacitySlider')) {
        document.getElementById('metallicOpacitySlider').value = metOp;
        const mVal = document.getElementById('metallicOpacityVal');
        if (mVal) mVal.textContent = Number(metOp).toFixed(2);
      }

      if (configJson?.UiPriority !== undefined && document.getElementById('uiPrioritySlider')) {
        document.getElementById('uiPrioritySlider').value = configJson.UiPriority;
        const uVal = document.getElementById('uiPriorityVal');
        if (uVal) uVal.textContent = configJson.UiPriority;
      }

      const maskVal = floatProps.colossal_DecalLayerMask ?? floatProps._colossal_DecalLayerMask;
      if (maskVal !== undefined) {
        const num = parseInt(maskVal, 10);
        if (document.getElementById('layerTerrain')) document.getElementById('layerTerrain').checked = (num & 1) !== 0;
        if (document.getElementById('layerRoads')) document.getElementById('layerRoads').checked = (num & 2) !== 0;
        if (document.getElementById('layerBuildings')) document.getElementById('layerBuildings').checked = (num & 4) !== 0;
        if (document.getElementById('layerVehicles')) document.getElementById('layerVehicles').checked = (num & 8) !== 0;
        if (document.getElementById('layerCreatures')) document.getElementById('layerCreatures').checked = (num & 16) !== 0;
        if (document.getElementById('layerProps')) document.getElementById('layerProps').checked = (num & 32) !== 0;
      }

      if (detectedMode === 'decal') {
        let w = 2.0, h = 2.0, d = 1.0;
        if (vecProps.colossal_MeshSize) {
          w = vecProps.colossal_MeshSize.x ?? 2.0;
          d = vecProps.colossal_MeshSize.y ?? 1.0;
          h = vecProps.colossal_MeshSize.z ?? 2.0;
        } else {
          if (configJson?.width !== undefined) w = configJson.width;
          if (configJson?.height !== undefined) h = configJson.height;
          if (configJson?.depth !== undefined) d = configJson.depth;
        }
        if (document.getElementById('dimWidth')) document.getElementById('dimWidth').value = w;
        if (document.getElementById('dimHeight')) document.getElementById('dimHeight').value = h;
        if (document.getElementById('dimDepth')) document.getElementById('dimDepth').value = d;
        if (document.getElementById('dimWidthSlider')) {
          document.getElementById('dimWidthSlider').max = Math.max(10, Math.ceil(w));
          document.getElementById('dimWidthSlider').value = w;
        }
        if (document.getElementById('dimHeightSlider')) {
          document.getElementById('dimHeightSlider').max = Math.max(10, Math.ceil(h));
          document.getElementById('dimHeightSlider').value = h;
        }
        if (document.getElementById('dimDepthSlider')) {
          document.getElementById('dimDepthSlider').max = Math.max(10, Math.ceil(d));
          document.getElementById('dimDepthSlider').value = d;
        }
        updateDecalScaleIndicator(w, h, d);
      } else if (detectedMode === 'surface') {
        const uv = floatProps.colossal_UVScale ?? configJson?.uvScale ?? 1.0;
        if (document.getElementById('uvScaleSlider')) {
          document.getElementById('uvScaleSlider').value = uv;
          document.getElementById('uvScaleVal').textContent = Number(uv).toFixed(1);
        }
      } else if (detectedMode === 'netlane') {
        let lw = 1.0, ll = 2.0;
        if (vecProps.colossal_MeshSize) {
          lw = vecProps.colossal_MeshSize.x ?? 1.0;
          ll = vecProps.colossal_MeshSize.z ?? 2.0;
        } else {
          if (configJson?.width !== undefined) lw = configJson.width;
          if (configJson?.length !== undefined) ll = configJson.length;
        }
        if (document.getElementById('netlaneWidthSlider')) {
          document.getElementById('netlaneWidthSlider').value = lw;
          document.getElementById('netlaneWidthVal').textContent = `${Number(lw).toFixed(1)} m`;
        }
        if (document.getElementById('netlaneLengthSlider')) {
          document.getElementById('netlaneLengthSlider').value = ll;
          document.getElementById('netlaneLengthVal').textContent = `${Number(ll).toFixed(1)} m`;
        }
      }
    }

    // 5. Load Base Color Map via FileReader DataURL (robust against sandbox blob issues)
    const baseBlob = await baseColorEntry.getBlob();
    await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (re) => {
        const baseImg = new Image();
        baseImg.onload = () => {
          state.currentImage = baseImg;
          state.isCustomImageLoaded = true;
          state.hasUnsavedChanges = false;
          resolve();
        };
        baseImg.onerror = () => reject(new Error('Failed to decode BaseColor image texture'));
        baseImg.src = re.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read BaseColor blob data'));
      reader.readAsDataURL(baseBlob);
    });

    // 6. Load Normal Map if provided in package
    if (normalMapEntry) {
      try {
        const normBlob = await normalMapEntry.getBlob();
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (re) => {
            const normImg = new Image();
            normImg.onload = () => {
              state.customNormalImg = normImg;
              state.customNormalFileName = normalMapEntry.name;
              updateCustomNormalUI();
              resolve();
            };
            normImg.onerror = () => {
              clearCustomNormal(false);
              resolve();
            };
            normImg.src = re.target.result;
          };
          reader.onerror = () => {
            clearCustomNormal(false);
            resolve();
          };
          reader.readAsDataURL(normBlob);
        });
      } catch (e) {
        console.warn('Could not load custom normal map:', e);
        clearCustomNormal(false);
      }
    } else {
      clearCustomNormal(false);
    }

    // 7. Update UI, Config JSON preview, and render all maps
    updateConfigJson();
    if (window.renderAllMaps) window.renderAllMaps();

    const fileCount = 1 + (normalMapEntry ? 1 : 0) + (maskMapEntry ? 1 : 0) + (iconMapEntry ? 1 : 0) + (configJson ? 1 : 0);
    showToast(`Successfully imported "${detectedName}" (${fileCount} asset components loaded)`);
  } catch (err) {
    console.error('Error applying community asset:', err);
    showToast('Failed to apply asset: ' + (err.message || 'Unknown error'));
  }
}

// Browser Library & Series Ribbon (IndexedDB Powered)
export async function seedStarterLibraryIfEmpty() {
  await initIndexedDBStorage();
}

export function getSavedLibrary() {
  return getSavedLibraryFromMemory();
}

export function getAssetSeriesName() {
  const el = document.getElementById('assetSeries');
  return (el && el.value.trim()) || 'Road Markings';
}

export function setAssetSeriesName(series) {
  const clean = (series || 'Road Markings').trim();
  const el = document.getElementById('assetSeries');
  if (el) el.value = clean;
  const badge = document.getElementById('activeSeriesBadge');
  if (badge) badge.textContent = clean;
  state.currentLoadedAssetSeries = clean;
  updateRibbonSeriesDropdown();
  renderSeriesChips();
}

export function onAssetSeriesInput() {
  const val = getAssetSeriesName();
  const badge = document.getElementById('activeSeriesBadge');
  if (badge) badge.textContent = val;
  state.currentLoadedAssetSeries = val;
  state.hasUnsavedChanges = true;
  updateRibbonSeriesDropdown();
  renderSeriesChips();
}

export function applySeriesQuickPick(val) {
  if (val === '__new__') {
    const newName = prompt('Enter a new series name (e.g. UK Road Signs, Speed Bumps, Industrial):');
    if (newName && newName.trim()) {
      setAssetSeriesName(newName.trim());
      state.activeRibbonSeries = newName.trim();
      updateRibbonSeriesDropdown();
      renderSeriesRibbon();
    }
    return;
  }
  if (val) {
    setAssetSeriesName(val);
    state.activeRibbonSeries = val;
    updateRibbonSeriesDropdown();
    renderSeriesRibbon();
  }
}

export function syncWithSeriesBadge() {
  const seriesName = getAssetSeriesName();
  const badgeInput = document.getElementById('seriesTextInput');
  if (badgeInput) {
    badgeInput.value = seriesName.toUpperCase();
    onSeriesTextChange();
    showToast(`Series badge text updated to "${badgeInput.value}"`);
  }
}

export function getAllLibrarySeries() {
  const list = getSavedLibrary();
  const set = new Set();
  list.forEach(item => {
    const s = (item.seriesName || (item.icon && item.icon.badge2 && item.icon.badge2.text) || item.assetCategory || 'Road Markings').trim();
    if (s) set.add(s);
  });
  const cur = getAssetSeriesName();
  if (cur) set.add(cur);
  if (set.size === 0) {
    set.add('Road Markings');
    set.add('City Utilities');
  }
  return Array.from(set).sort();
}

export function renderSeriesChips() {
  const container = document.getElementById('seriesChipRow');
  if (!container) return;
  const seriesList = getAllLibrarySeries();
  const cur = getAssetSeriesName();
  container.innerHTML = seriesList.map(s => {
    const isActive = s.toLowerCase() === cur.toLowerCase();
    return `<button type="button" class="series-chip ${isActive ? 'active' : ''}" onclick="setAssetSeriesName('${escapeHtml(s)}'); state.activeRibbonSeries='${escapeHtml(s)}'; updateRibbonSeriesDropdown(); renderSeriesRibbon();">${escapeHtml(s)}</button>`;
  }).join('');
}

export function updateRibbonSeriesDropdown() {
  const seriesList = getAllLibrarySeries();
  const library = getSavedLibrary();
  const curSeries = getAssetSeriesName();

  const ribbonSelect = document.getElementById('ribbonSeriesSelect');
  if (ribbonSelect) {
    const currentVal = state.activeRibbonSeries;
    const totalCount = library.length;
    let html = `<option value="all">All Series (${totalCount})</option>`;
    seriesList.forEach(s => {
      const count = library.filter(it => (it.seriesName || it.icon?.badge2?.text || it.assetCategory || 'Road Markings').trim().toLowerCase() === s.toLowerCase()).length;
      html += `<option value="${escapeHtml(s)}">${escapeHtml(s)} (${count})</option>`;
    });
    ribbonSelect.innerHTML = html;
    if (currentVal && (currentVal === 'all' || seriesList.includes(currentVal))) {
      ribbonSelect.value = currentVal;
    } else if (seriesList.includes(curSeries)) {
      ribbonSelect.value = curSeries;
      state.activeRibbonSeries = curSeries;
    } else {
      ribbonSelect.value = 'all';
      state.activeRibbonSeries = 'all';
    }
  }

  const secPicker = document.getElementById('seriesQuickPicker');
  if (secPicker) {
    let pickerHtml = '';
    seriesList.forEach(s => {
      pickerHtml += `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`;
    });
    pickerHtml += `<option value="__new__">+ New Series...</option>`;
    secPicker.innerHTML = pickerHtml;
    if (seriesList.includes(curSeries)) {
      secPicker.value = curSeries;
    }
  }

  const libFilter = document.getElementById('librarySeriesFilter');
  if (libFilter) {
    const curLibVal = state.libraryFilterSeries;
    let libHtml = `<option value="all">All Series (${library.length})</option>`;
    seriesList.forEach(s => {
      const count = library.filter(it => (it.seriesName || it.icon?.badge2?.text || it.assetCategory || 'Road Markings').trim().toLowerCase() === s.toLowerCase()).length;
      libHtml += `<option value="${escapeHtml(s)}">${escapeHtml(s)} (${count})</option>`;
    });
    libFilter.innerHTML = libHtml;
    if (curLibVal) libFilter.value = curLibVal;
  }

  const saveBtnText = document.getElementById('saveToSeriesBtnText');
  if (saveBtnText) {
    const targetSeries = (state.activeRibbonSeries && state.activeRibbonSeries !== 'all') ? state.activeRibbonSeries : curSeries;
    saveBtnText.textContent = `+ Add to "${targetSeries}"`;
  }
}

export function onRibbonSeriesSelectChange(val) {
  state.activeRibbonSeries = val;
  updateRibbonSeriesDropdown();
  renderSeriesRibbon();
}

export function switchBottomView(view) {
  localStorage.setItem('cs2_bottom_view_preference', view);
  const tabRibbon = document.getElementById('tabBtnRibbon');
  const tabGuide = document.getElementById('tabBtnGuide');
  const viewRibbon = document.getElementById('bottomRibbonView');
  const viewGuide = document.getElementById('bottomGuideView');
  const headerControls = document.getElementById('ribbonHeaderControls');
  const btnSave = document.getElementById('btnSaveToActiveSeries');

  if (view === 'ribbon') {
    if (tabRibbon) {
      tabRibbon.classList.add('active');
      tabRibbon.setAttribute('aria-selected', 'true');
    }
    if (tabGuide) {
      tabGuide.classList.remove('active');
      tabGuide.setAttribute('aria-selected', 'false');
    }
    if (viewRibbon) viewRibbon.style.display = 'block';
    if (viewGuide) viewGuide.style.display = 'none';
    if (headerControls) headerControls.style.display = 'flex';
    if (btnSave) btnSave.style.display = 'inline-flex';
    renderSeriesRibbon();
  } else {
    if (tabRibbon) {
      tabRibbon.classList.remove('active');
      tabRibbon.setAttribute('aria-selected', 'false');
    }
    if (tabGuide) {
      tabGuide.classList.add('active');
      tabGuide.setAttribute('aria-selected', 'true');
    }
    if (viewRibbon) viewRibbon.style.display = 'none';
    if (viewGuide) viewGuide.style.display = 'block';
    if (headerControls) headerControls.style.display = 'none';
    if (btnSave) btnSave.style.display = 'none';
  }
}

export function toggleBottomCollapse() {
  const footer = document.getElementById('appFooter');
  if (footer) {
    footer.classList.toggle('collapsed');
  }
}

export function scrollRibbon(direction) {
  const track = document.getElementById('ribbonCardsTrack');
  if (!track) return;
  const amount = 300;
  if (direction === 'left') {
    track.scrollBy({ left: -amount, behavior: 'smooth' });
  } else {
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }
}

export function renderSeriesRibbon() {
  const track = document.getElementById('ribbonCardsTrack');
  if (!track) return;
  const list = getSavedLibrary();

  const filtered = list.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
    if (state.activeRibbonSeries === 'all') return true;
    const s = (item.seriesName || item.icon?.badge2?.text || item.assetCategory || 'Road Markings').trim().toLowerCase();
    return s === state.activeRibbonSeries.trim().toLowerCase();
  });

  const countBadge = document.getElementById('ribbonSeriesCountBadge');
  if (countBadge) countBadge.textContent = filtered.length;
  const totalBadge = document.getElementById('ribbonLibraryTotalBadge');
  if (totalBadge) totalBadge.textContent = list.length;

  if (!filtered.length) {
    const curName = document.getElementById('assetName')?.value || 'Current Asset';
    const targetSeries = (state.activeRibbonSeries && state.activeRibbonSeries !== 'all') ? state.activeRibbonSeries : getAssetSeriesName();
    track.innerHTML = `
      <div class="ribbon-empty-state">
        <span style="font-size: 20px;">🎞️</span>
        <div>
          <div style="font-weight: 700; color: #f1f5f9; margin-bottom: 2px;">
            No saved assets in series <span style="color: var(--accent-cyan); font-weight: 800;">"${escapeHtml(targetSeries)}"</span> yet
          </div>
          <div style="font-size: 11px; color: var(--text-dim);">
            Assign your current asset to "${escapeHtml(targetSeries)}" and click "+ Add Current to Series" to build out this collection.
          </div>
        </div>
        <button type="button" class="btn-primary" style="padding: 6px 14px; font-size: 11px; white-space: nowrap;" onclick="saveCurrentToActiveSeries()">
          + Save "${escapeHtml(curName)}" to Series
        </button>
        ${state.activeRibbonSeries !== 'all' ? `<button type="button" class="btn-secondary" style="padding: 6px 10px; font-size: 11px; white-space: nowrap;" onclick="onRibbonSeriesSelectChange('all')">View All Series (${list.length})</button>` : ''}
      </div>
    `;
    return;
  }

  track.innerHTML = filtered.map(({ item, originalIndex }) => {
    const isDecal = item.appMode === 'decal';
    const isNetlane = item.appMode === 'netlane';
    let badgePill = 'pill-blue';
    let badgeLabel = 'DECAL';
    if (isNetlane) {
      badgePill = 'pill-orange';
      badgeLabel = 'NET LANE';
    } else if (!isDecal) {
      badgePill = 'pill-green';
      badgeLabel = 'SURFACE';
    }
    let detailText = '';
    if (isNetlane) {
      detailText = `${item.netlane?.width || 1.0}m width`;
    } else if (isDecal) {
      detailText = `${item.dimensions?.width || 2.0}×${item.dimensions?.height || 2.0}m`;
    } else {
      detailText = `UV: ${item.uvScale || 1.0}×`;
    }

    const thumbSrc = item.thumbImageData || item.baseImageData || '';
    const itemSeries = (item.seriesName || item.icon?.badge2?.text || item.assetCategory || 'Road Markings').trim();
    const isActive = (item.assetName === state.currentLoadedAssetName);

    return `
      <div class="ribbon-card ${isActive ? 'active-workspace' : ''}" onclick="loadFromBrowser(${originalIndex})" title="Click to load ${escapeHtml(item.assetName)}">
        ${isActive ? '<span class="ribbon-card-active-pill">● ACTIVE IN WORKSPACE</span>' : ''}
        <div class="ribbon-card-thumb-wrap">
          ${thumbSrc ? `<img src="${thumbSrc}" class="ribbon-card-thumb" alt="${escapeHtml(item.assetName)}">` : '<span style="font-size: 18px;">🖼️</span>'}
        </div>
        <div class="ribbon-card-details">
          <div class="ribbon-card-name" title="${escapeHtml(item.assetName)}">${escapeHtml(item.assetName)}</div>
          <div class="ribbon-card-meta">
            <span class="channel-pill ${badgePill}" style="font-size: 8.5px; padding: 0 4px;">${badgeLabel}</span>
            <span class="ribbon-card-series-pill" title="Series: ${escapeHtml(itemSeries)}">🎨 ${escapeHtml(itemSeries)}</span>
            <span>• ${detailText}</span>
          </div>
          <div class="ribbon-card-actions" onclick="event.stopPropagation()">
            <button type="button" class="ribbon-card-btn" onclick="loadFromBrowser(${originalIndex})" title="Load into workspace">Load</button>
            <button type="button" class="ribbon-card-btn btn-dup" onclick="duplicateRibbonAsset(${originalIndex})" title="Duplicate asset into new variant">+ Variant</button>
            <button type="button" class="ribbon-card-btn" onclick="promptReassignSeries(${originalIndex})" title="Move to another series">Move Series</button>
            <button type="button" class="ribbon-card-btn" style="color: #f87171;" onclick="deleteFromBrowser(${originalIndex})" title="Delete asset">✕</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export async function saveCurrentToActiveSeries() {
  const targetSeries = (state.activeRibbonSeries && state.activeRibbonSeries !== 'all') ? state.activeRibbonSeries : getAssetSeriesName();
  setAssetSeriesName(targetSeries);
  await saveCurrentToBrowser();
}

export async function promptReassignSeries(index) {
  const list = getSavedLibrary();
  if (!list[index]) return;
  const oldSeries = list[index].seriesName || list[index].icon?.badge2?.text || list[index].assetCategory || 'Road Markings';
  const newSeries = prompt(`Move "${list[index].assetName}" to a different series name:`, oldSeries);
  if (newSeries && newSeries.trim() && newSeries.trim() !== oldSeries) {
    list[index].seriesName = newSeries.trim();
    await saveAssetToIndexedDB(list[index]);
    updateRibbonSeriesDropdown();
    renderSeriesRibbon();
    renderSavedAssetsList();
    renderSeriesChips();
    showToast(`Moved "${list[index].assetName}" to series "${newSeries.trim()}"`);
  }
}

export async function duplicateRibbonAsset(index) {
  const list = getSavedLibrary();
  if (!list[index]) return;
  const clone = JSON.parse(JSON.stringify(list[index]));
  const baseName = clone.assetName.replace(/(_Var\d*|_0\d+)$/, '');
  const newName = `${baseName}_Var${Math.floor(Math.random() * 90 + 10)}`;
  clone.assetName = newName;
  clone.timestamp = Date.now();
  await saveAssetToIndexedDB(clone);
  state.currentLoadedAssetName = newName;
  state.currentLoadedAssetSeries = clone.seriesName || getAssetSeriesName();
  updateLibraryBadge();
  updateRibbonSeriesDropdown();
  renderSeriesRibbon();
  renderSavedAssetsList();
  renderSeriesChips();
  deserializeAndLoadProject(clone);
  showToast(`Created variant "${newName}" in series "${clone.seriesName}"!`);
}

export async function saveCurrentToBrowser() {
  const proj = serializeCurrentProject();
  try {
    await saveAssetToIndexedDB(proj);
    state.hasUnsavedChanges = false;
    state.currentLoadedAssetName = proj.assetName;
    state.currentLoadedAssetSeries = proj.seriesName;
    updateLibraryBadge();
    updateRibbonSeriesDropdown();
    renderSeriesRibbon();
    renderSavedAssetsList();
    renderSeriesChips();
    showToast(`Saved "${proj.assetName}" to Series "${proj.seriesName}" (IndexedDB)`);
  } catch (e) {
    console.error('IndexedDB save error:', e);
    showToast('Failed to save asset: ' + (e?.message || 'Storage error'));
  }
}

export function updateLibraryBadge() {
  const list = getSavedLibrary();
  const badge = document.getElementById('savedCountBadge');
  if (badge) badge.textContent = list.length;
  const totalBadge = document.getElementById('ribbonLibraryTotalBadge');
  if (totalBadge) totalBadge.textContent = list.length;
}

export function openSavedLibraryModal() {
  updateRibbonSeriesDropdown();
  renderSavedAssetsList();
  document.getElementById('libraryModal').style.display = 'flex';
}

export function closeLibraryModal() {
  document.getElementById('libraryModal').style.display = 'none';
}

export function closeLibraryModalOnBackdrop(e) {
  if (e.target.id === 'libraryModal') {
    closeLibraryModal();
  }
}

export function filterLibraryBySeries(series) {
  state.libraryFilterSeries = series;
  renderSavedAssetsList();
}

export function filterLibraryBySearch(query) {
  state.librarySearchQuery = (query || '').toLowerCase().trim();
  renderSavedAssetsList();
}

export function openRibbonFromLibrary() {
  closeLibraryModal();
  switchBottomView('ribbon');
  if (state.libraryFilterSeries && state.libraryFilterSeries !== 'all') {
    state.activeRibbonSeries = state.libraryFilterSeries;
    updateRibbonSeriesDropdown();
    renderSeriesRibbon();
  }
}

export function loadFromBrowser(index, force = false) {
  const list = getSavedLibrary();
  if (!list[index]) return;

  if (!force && state.isCustomImageLoaded && state.hasUnsavedChanges) {
    state.pendingGuardAction = () => {
      loadFromBrowser(index, true);
    };
    closeLibraryModal();
    if (window.openUnsavedModal) window.openUnsavedModal();
    return;
  }

  const item = list[index];
  state.currentLoadedAssetName = item.assetName;
  state.currentLoadedAssetSeries = item.seriesName || item.icon?.badge2?.text || item.assetCategory || 'Road Markings';
  deserializeAndLoadProject(item);
  closeLibraryModal();
  renderSeriesRibbon();
}

export async function deleteFromBrowser(index) {
  const list = getSavedLibrary();
  if (list[index]) {
    const target = list[index];
    await deleteAssetFromIndexedDB(target.assetName);
    updateLibraryBadge();
    updateRibbonSeriesDropdown();
    renderSeriesRibbon();
    renderSavedAssetsList();
    renderSeriesChips();
    showToast(`Removed "${target.assetName}"`);
  }
}

export function renderSavedAssetsList() {
  const list = getSavedLibrary();
  const container = document.getElementById('savedAssetsList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 13px;">
        No saved assets found in browser storage.<br>Click "Save Current Asset" to store your decals and surfaces here.
      </div>
    `;
    return;
  }

  const filtered = list.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
    const matchesSeries = (state.libraryFilterSeries === 'all') || ((item.seriesName || item.icon?.badge2?.text || item.assetCategory || 'Road Markings').trim().toLowerCase() === state.libraryFilterSeries.trim().toLowerCase());
    const matchesSearch = !state.librarySearchQuery ||
      (item.assetName && item.assetName.toLowerCase().includes(state.librarySearchQuery)) ||
      (item.appMode && item.appMode.toLowerCase().includes(state.librarySearchQuery)) ||
      (item.seriesName && item.seriesName.toLowerCase().includes(state.librarySearchQuery)) ||
      (item.assetCategory && item.assetCategory.toLowerCase().includes(state.librarySearchQuery));
    return matchesSeries && matchesSearch;
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 12px;">
        No assets match current series filter or search query.<br>
        <button class="btn-secondary" style="margin-top: 8px; font-size: 11px; padding: 4px 10px;" onclick="filterLibraryBySeries('all'); document.getElementById('librarySeriesFilter').value='all'; document.getElementById('librarySearchInput').value=''; filterLibraryBySearch('');">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(({ item, originalIndex }) => {
    const isDecal = item.appMode === 'decal';
    const isNetlane = item.appMode === 'netlane';
    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '';
    const thumbSrc = item.thumbImageData || item.baseImageData || '';
    let badgePill = 'pill-blue';
    let badgeLabel = 'DECAL';
    if (isNetlane) {
      badgePill = 'pill-orange';
      badgeLabel = 'NET LANE';
    } else if (!isDecal) {
      badgePill = 'pill-green';
      badgeLabel = 'SURFACE';
    }
    let detailText = '';
    if (isNetlane) {
      detailText = `Width: ${item.netlane?.width || 1.0}m • ${item.assetCategory || item.surfaceCategory || 'Lines'}`;
    } else if (isDecal) {
      detailText = `${item.dimensions?.width || 2.0}×${item.dimensions?.height || 2.0}m`;
    } else {
      detailText = `UV: ${item.uvScale || 1.0} • ${item.assetCategory || item.surfaceCategory || 'Pavement'}`;
    }
    const itemSeries = (item.seriesName || item.icon?.badge2?.text || item.assetCategory || 'Road Markings').trim();

    return `
      <div class="saved-asset-item">
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
          ${thumbSrc ? `<img src="${thumbSrc}" style="width: 42px; height: 42px; border-radius: 4px; object-fit: contain; background: #080d14; border: 1px solid var(--border-color); flex-shrink: 0;">` : ''}
          <div style="min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(item.assetName)}</span>
              <span class="channel-pill ${badgePill}" style="font-size: 9px;">${badgeLabel}</span>
              <span class="ribbon-card-series-pill" style="max-width: 130px;" title="Series: ${escapeHtml(itemSeries)}">🎨 ${escapeHtml(itemSeries)}</span>
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              ${detailText} • ${dateStr}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 5px; align-items: center;">
          <button class="btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="loadFromBrowser(${originalIndex})">Load</button>
          <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="promptReassignSeries(${originalIndex})" title="Change series">Series</button>
          <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px; color: #f87171;" onclick="deleteFromBrowser(${originalIndex})">✕</button>
        </div>
      </div>
    `;
  }).join('');
}
