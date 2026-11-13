// ==========================================
// Source Graphic Interactive Cropper & Blank-Margin Auto-Trimmer
// Non-destructive cropping for Affinity Suite & graphic imports
// ==========================================

import {
  state,
  showToast,
  getSlot
} from './state.js';
import {
  getEl,
  setElText,
  setElValue,
  setElDisplay,
  createModalController
} from './domUtils.js';

const cropModalCtrl = createModalController('sourceCropModal', {
  onClose: () => {
    cropperUi.dragMode = null;
    cropperUi.panDrag = null;
    cropperUi.spaceHeld = false;
    cropperUi.shiftHeld = false;
    cropperUi.panMode = false;
  }
});

const cropperUi = {
  sourceImg: null,
  imgW: 0,
  imgH: 0,
  rect: { x: 0, y: 0, width: 0, height: 0 },
  aspectRatio: null, // null = free, or numeric w/h
  aspectLabel: 'free',
  trimMode: 'auto', // 'auto' | 'alpha' | 'edge'
  trimPadding: 2,
  fitScale: 1,
  scale: 1,
  displayW: 600,
  displayH: 400,
  canvasW: 600,
  canvasH: 400,
  dragMode: null, // 'move' | 'draw' | 'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w'
  dragStartPointer: { x: 0, y: 0 },
  lastPointerPos: { px: 0, py: 0 },
  dragStartRect: { x: 0, y: 0, width: 0, height: 0 },
  panMode: false,
  spaceHeld: false,
  shiftHeld: false,
  panDrag: null, // { startClientX, startClientY, startScrollLeft, startScrollTop }
  listenersBound: false
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Computes tight content bounds inside an image by scanning outer blank margins.
 * Supports transparent alpha margins (typical Affinity PNG export) and uniform solid edge colors.
 */
export function detectTrimBounds(img, options = {}) {
  if (!img) return null;
  const w = img.naturalWidth || img.width || 0;
  const h = img.naturalHeight || img.height || 0;
  if (!w || !h) return null;

  const {
    mode = 'auto', // 'auto' | 'alpha' | 'edge'
    alphaThreshold = 4,
    colorTolerance = 18,
    padding = 2
  } = options;

  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  let data;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch (err) {
    console.warn('Could not read pixel data for auto-trim:', err);
    return null;
  }

  // First pass: check alpha bounds
  let aMinX = w, aMinY = h, aMaxX = -1, aMaxY = -1;
  let hasAnyTransparent = false;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x++) {
      const a = data[rowOffset + x * 4 + 3];
      if (a <= alphaThreshold) {
        hasAnyTransparent = true;
      } else {
        if (x < aMinX) aMinX = x;
        if (x > aMaxX) aMaxX = x;
        if (y < aMinY) aMinY = y;
        if (y > aMaxY) aMaxY = y;
      }
    }
  }

  // Entirely transparent image
  if (aMaxX < aMinX || aMaxY < aMinY) {
    return {
      x: 0,
      y: 0,
      width: w,
      height: h,
      trimmed: false,
      reason: 'empty',
      method: 'alpha',
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      blankPct: 100
    };
  }

  const alphaSavedPixels =
    (aMinX > 0 || aMinY > 0 || aMaxX < w - 1 || aMaxY < h - 1);

  if (mode === 'alpha' || (mode === 'auto' && hasAnyTransparent && alphaSavedPixels)) {
    const pad = Math.max(0, Math.round(padding));
    const x = Math.max(0, aMinX - pad);
    const y = Math.max(0, aMinY - pad);
    const right = Math.min(w, aMaxX + 1 + pad);
    const bottom = Math.min(h, aMaxY + 1 + pad);
    const cw = Math.max(1, right - x);
    const ch = Math.max(1, bottom - y);
    const trimmed = x > 0 || y > 0 || cw < w || ch < h;
    const totalArea = w * h;
    const croppedArea = cw * ch;
    return {
      x,
      y,
      width: cw,
      height: ch,
      trimmed,
      method: 'alpha',
      margins: {
        left: x,
        top: y,
        right: w - (x + cw),
        bottom: h - (y + ch)
      },
      blankPct: totalArea > 0 ? Math.max(0, Math.round(((totalArea - croppedArea) / totalArea) * 100)) : 0
    };
  }

  // Second pass: uniform solid edge color detection (e.g. solid white/black canvas export)
  if (mode === 'edge' || mode === 'auto') {
    const cornerCoords = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1]
    ];
    const refR = data[0];
    const refG = data[1];
    const refB = data[2];
    const refA = data[3];

    let cornersMatch = true;
    for (const [cx, cy] of cornerCoords) {
      const idx = (cy * w + cx) * 4;
      const diff =
        Math.abs(data[idx] - refR) +
        Math.abs(data[idx + 1] - refG) +
        Math.abs(data[idx + 2] - refB) +
        Math.abs(data[idx + 3] - refA);
      if (diff > colorTolerance * 3) {
        cornersMatch = false;
        break;
      }
    }

    if (cornersMatch) {
      let eMinX = w, eMinY = h, eMaxX = -1, eMaxY = -1;
      for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        for (let x = 0; x < w; x++) {
          const i = rowOffset + x * 4;
          const diff =
            Math.abs(data[i] - refR) +
            Math.abs(data[i + 1] - refG) +
            Math.abs(data[i + 2] - refB) +
            Math.abs(data[i + 3] - refA);
          if (diff > colorTolerance * 3) {
            if (x < eMinX) eMinX = x;
            if (x > eMaxX) eMaxX = x;
            if (y < eMinY) eMinY = y;
            if (y > eMaxY) eMaxY = y;
          }
        }
      }

      if (eMaxX >= eMinX && eMaxY >= eMinY) {
        const pad = Math.max(0, Math.round(padding));
        const x = Math.max(0, eMinX - pad);
        const y = Math.max(0, eMinY - pad);
        const right = Math.min(w, eMaxX + 1 + pad);
        const bottom = Math.min(h, eMaxY + 1 + pad);
        const cw = Math.max(1, right - x);
        const ch = Math.max(1, bottom - y);
        const trimmed = x > 0 || y > 0 || cw < w || ch < h;
        const totalArea = w * h;
        const croppedArea = cw * ch;
        return {
          x,
          y,
          width: cw,
          height: ch,
          trimmed,
          method: 'edge',
          margins: {
            left: x,
            top: y,
            right: w - (x + cw),
            bottom: h - (y + ch)
          },
          blankPct: totalArea > 0 ? Math.max(0, Math.round(((totalArea - croppedArea) / totalArea) * 100)) : 0
        };
      }
    }
  }

  return {
    x: 0,
    y: 0,
    width: w,
    height: h,
    trimmed: false,
    method: 'none',
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    blankPct: 0
  };
}

/**
 * Renders a cropped Image element from an uncropped source image and crop rectangle.
 */
export function renderCroppedImage(sourceImg, rect) {
  return new Promise((resolve, reject) => {
    if (!sourceImg || !rect) {
      reject(new Error('Missing source image or crop rectangle'));
      return;
    }
    const srcW = sourceImg.naturalWidth || sourceImg.width || 1;
    const srcH = sourceImg.naturalHeight || sourceImg.height || 1;
    const x = clamp(Math.round(rect.x), 0, Math.max(0, srcW - 1));
    const y = clamp(Math.round(rect.y), 0, Math.max(0, srcH - 1));
    const cw = clamp(Math.round(rect.width), 1, srcW - x);
    const ch = clamp(Math.round(rect.height), 1, srcH - y);

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not initialize 2D context for crop'));
      return;
    }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(sourceImg, x, y, cw, ch, 0, 0, cw, ch);

    const dataUrl = canvas.toDataURL('image/png');
    const outImg = new Image();
    outImg.onload = () => resolve({ img: outImg, dataUrl, rect: { x, y, width: cw, height: ch } });
    outImg.onerror = () => reject(new Error('Failed to load cropped image output'));
    outImg.src = dataUrl;
  });
}

/**
 * Applies a newly active (cropped or reset) image across state, active slot, decal dimensions, and previews.
 */
function commitActiveSourceImage(img, dataUrl, cropRectOrNull, origImg) {
  const mode = state.appMode || 'decal';
  state.originalImage = origImg || state.originalImage || img;
  state.currentImage = img;
  state.cropRect = cropRectOrNull ? { ...cropRectOrNull } : null;
  state.isCustomImageLoaded = true;
  state.hasUnsavedChanges = true;

  const slot = getSlot(mode);
  if (slot) {
    slot.originalImage = state.originalImage;
    slot.image = img;
    slot.cropRect = state.cropRect ? { ...state.cropRect } : null;
    if (dataUrl) slot.imageSrc = dataUrl;
    slot.isCustomImageLoaded = true;
    slot.hasUnsavedChanges = true;

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

  if (typeof window.updateSourceImageBadge === 'function') {
    window.updateSourceImageBadge(rawW, rawH, nativeRatio);
  }

  if (mode === 'decal') {
    const autoSyncEl = getEl('autoSyncAspectOnImport');
    const shouldSync = !autoSyncEl || autoSyncEl.checked;
    if (shouldSync && typeof window.syncDecalDimensionsToImage === 'function') {
      window.syncDecalDimensionsToImage(rawW, rawH, nativeRatio);
    } else if (state.decalAspectLocked) {
      state.decalLockedRatio = nativeRatio;
    }
  }

  if (typeof window.renderAllMaps === 'function') window.renderAllMaps();
  if (typeof window.updateDecalAspectUI === 'function') window.updateDecalAspectUI();
  if (typeof window.updateSetSlotsUI === 'function') window.updateSetSlotsUI();
  if (typeof window.updateConfigJson === 'function') window.updateConfigJson();

  updateSourceCropUI();
}

/**
 * Updates the Section 1 Source Image Crop & Trim bar + blank-margin detector banner.
 */
export function updateSourceCropUI() {
  const bar = getEl('sourceCropBar');
  if (!bar) return;

  const hasImg = Boolean(state.currentImage);
  if (!hasImg) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';

  const curW = state.currentImage.naturalWidth || state.currentImage.width || 0;
  const curH = state.currentImage.naturalHeight || state.currentImage.height || 0;
  const orig = state.originalImage || state.currentImage;
  const origW = orig.naturalWidth || orig.width || curW;
  const origH = orig.naturalHeight || orig.height || curH;
  const isCropped = Boolean(
    state.cropRect &&
      (state.cropRect.width < origW || state.cropRect.height < origH || state.cropRect.x > 0 || state.cropRect.y > 0)
  );

  const badge = getEl('sourceCropStatusBadge');
  if (badge) {
    if (isCropped) {
      badge.textContent = `Cropped: ${curW}×${curH} px`;
      badge.className = 'source-crop-badge is-cropped';
    } else {
      badge.textContent = `Original: ${origW}×${origH} px`;
      badge.className = 'source-crop-badge';
    }
  }

  setElDisplay('btnResetSourceCrop', isCropped ? 'inline-flex' : 'none');

  // Detect if current image still has notable blank margins (>= 4% area or >= 8px on any side)
  const noticeEl = getEl('sourceBlankMarginNotice');
  if (noticeEl) {
    const analysis = detectTrimBounds(state.currentImage, { mode: 'auto', padding: 2 });
    const hasNotableBlank =
      analysis &&
      analysis.trimmed &&
      (analysis.blankPct >= 4 ||
        analysis.margins.left >= 8 ||
        analysis.margins.right >= 8 ||
        analysis.margins.top >= 8 ||
        analysis.margins.bottom >= 8);

    if (hasNotableBlank) {
      const m = analysis.margins;
      const modeText = analysis.method === 'edge' ? 'solid' : 'transparent';
      setElText(
        'sourceBlankMarginText',
        `~${analysis.blankPct}% blank ${modeText} margin detected (L:${m.left} R:${m.right} T:${m.top} B:${m.bottom} px)`
      );
      noticeEl.style.display = 'flex';
    } else {
      noticeEl.style.display = 'none';
    }
  }
}

/**
 * One-click auto-trim from Section 1 bar.
 */
export async function autoTrimSourceGraphic() {
  const baseImg = state.originalImage || state.currentImage;
  if (!baseImg) {
    showToast('Load a source graphic first before trimming');
    return;
  }

  const origW = baseImg.naturalWidth || baseImg.width;
  const origH = baseImg.naturalHeight || baseImg.height;
  const bounds = detectTrimBounds(baseImg, { mode: 'auto', padding: 2 });

  if (!bounds || !bounds.trimmed || (bounds.width === origW && bounds.height === origH)) {
    showToast('No extra blank margins detected around this graphic');
    return;
  }

  try {
    const result = await renderCroppedImage(baseImg, bounds);
    commitActiveSourceImage(result.img, result.dataUrl, result.rect, baseImg);
    showToast(`Auto-trimmed blank margins: ${origW}×${origH} → ${result.rect.width}×${result.rect.height} px`);
  } catch (err) {
    console.error('Auto-trim error:', err);
    showToast('Could not auto-trim this image');
  }
}

/**
 * Restores the uncropped original image for the active slot.
 */
export function resetSourceCrop() {
  const orig = state.originalImage;
  if (!orig) {
    showToast('Original uncropped image is already active');
    return;
  }

  let origDataUrl = '';
  try {
    const c = document.createElement('canvas');
    c.width = orig.naturalWidth || orig.width;
    c.height = orig.naturalHeight || orig.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(orig, 0, 0);
    origDataUrl = c.toDataURL('image/png');
  } catch (_) {}

  commitActiveSourceImage(orig, origDataUrl, null, orig);
  const w = orig.naturalWidth || orig.width;
  const h = orig.naturalHeight || orig.height;
  showToast(`Restored original uncropped graphic (${w}×${h} px)`);
}

// ==========================================
// Interactive Crop Modal Controller
// ==========================================

export function openSourceCropModal() {
  const baseImg = state.originalImage || state.currentImage;
  if (!baseImg) {
    showToast('Please load a source graphic first');
    return;
  }

  if (!state.originalImage) {
    state.originalImage = baseImg;
  }

  cropperUi.sourceImg = baseImg;
  cropperUi.imgW = baseImg.naturalWidth || baseImg.width || 1;
  cropperUi.imgH = baseImg.naturalHeight || baseImg.height || 1;

  if (state.cropRect && state.cropRect.width > 0 && state.cropRect.height > 0) {
    cropperUi.rect = {
      x: clamp(state.cropRect.x, 0, cropperUi.imgW - 1),
      y: clamp(state.cropRect.y, 0, cropperUi.imgH - 1),
      width: clamp(state.cropRect.width, 1, cropperUi.imgW),
      height: clamp(state.cropRect.height, 1, cropperUi.imgH)
    };
  } else {
    cropperUi.rect = {
      x: 0,
      y: 0,
      width: cropperUi.imgW,
      height: cropperUi.imgH
    };
  }

  cropperUi.aspectRatio = null;
  cropperUi.aspectLabel = 'free';
  cropperUi.panMode = false;
  cropperUi.spaceHeld = false;
  cropperUi.shiftHeld = false;
  cropperUi.panDrag = null;
  syncAspectButtonsUI();
  syncPanModeButtonUI();

  const trimModeSel = getEl('cropTrimModeSelect');
  if (trimModeSel) cropperUi.trimMode = trimModeSel.value || 'auto';
  const padInput = getEl('cropTrimPaddingInput');
  if (padInput) cropperUi.trimPadding = parseInt(padInput.value, 10) || 2;

  cropModalCtrl.open();

  requestAnimationFrame(() => {
    bindCropCanvasEvents();
    resetCropZoomToFit();
    syncCropInputsFromRect();
  });
}

export function closeSourceCropModal() {
  cropModalCtrl.close();
}

export function closeSourceCropModalOnBackdrop(e) {
  cropModalCtrl.closeOnBackdrop(e);
}

function computeFitScale() {
  const stage = getEl('cropperCanvasStage');
  const maxW = stage ? Math.max(240, stage.clientWidth - 28) : 640;
  const maxH = stage ? Math.max(220, stage.clientHeight - 28) : 376;
  return Math.min(maxW / Math.max(1, cropperUi.imgW), maxH / Math.max(1, cropperUi.imgH));
}

function syncZoomControlsUI() {
  const pct = Math.max(5, Math.round(cropperUi.scale * 100));
  const minPct = Math.max(5, Math.min(25, Math.floor(cropperUi.fitScale * 100)));
  const slider = getEl('cropZoomSlider');
  if (slider) {
    slider.min = String(minPct);
    slider.max = '800';
    slider.value = String(clamp(pct, minPct, 800));
  }
  setElText('cropZoomValueBadge', `${pct}%`);

  const fitBtn = getEl('cropZoomFitBtn');
  if (fitBtn) {
    fitBtn.classList.toggle('active', Math.abs(cropperUi.scale - cropperUi.fitScale) < 0.005);
  }
  const btn100 = getEl('cropZoom100Btn');
  if (btn100) {
    btn100.classList.toggle('active', pct === 100);
  }
}

function syncPanModeButtonUI() {
  const btn = getEl('cropPanModeBtn');
  if (btn) {
    btn.classList.toggle('active', Boolean(cropperUi.panMode || cropperUi.spaceHeld));
  }
}

export function toggleCropPanMode(forceState = null) {
  cropperUi.panMode = typeof forceState === 'boolean' ? forceState : !cropperUi.panMode;
  syncPanModeButtonUI();
  const canvas = getEl('cropperCanvas');
  if (canvas && !cropperUi.dragMode && !cropperUi.panDrag) {
    canvas.style.cursor = cropperUi.panMode ? 'grab' : 'crosshair';
  }
}

export function resetCropZoomToFit() {
  if (!cropperUi.sourceImg) return;
  cropperUi.fitScale = computeFitScale();
  cropperUi.scale = cropperUi.fitScale;
  sizeAndDrawCropCanvas();
  syncZoomControlsUI();
  const stage = getEl('cropperCanvasStage');
  if (stage) {
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
  }
}

export function setCropZoom(percent, anchorClientX = null, anchorClientY = null) {
  if (!cropperUi.sourceImg) return;
  const stage = getEl('cropperCanvasStage');
  const canvas = getEl('cropperCanvas');

  const minPct = Math.max(5, Math.min(25, Math.floor(cropperUi.fitScale * 100)));
  const targetPct = clamp(Math.round(Number(percent) || 100), minPct, 800);
  const nextScale = targetPct / 100;

  let fracX = 0.5;
  let fracY = 0.5;
  let anchorX = anchorClientX;
  let anchorY = anchorClientY;

  if (stage && canvas && canvas.getBoundingClientRect().width > 0) {
    const stageRect = stage.getBoundingClientRect();
    const beforeRect = canvas.getBoundingClientRect();
    if (anchorX === null || anchorY === null) {
      anchorX = stageRect.left + stageRect.width / 2;
      anchorY = stageRect.top + stageRect.height / 2;
    }
    fracX = clamp((anchorX - beforeRect.left) / beforeRect.width, 0, 1);
    fracY = clamp((anchorY - beforeRect.top) / beforeRect.height, 0, 1);
  }

  cropperUi.scale = nextScale;
  sizeAndDrawCropCanvas();
  syncZoomControlsUI();

  if (stage && canvas && anchorX !== null && anchorY !== null) {
    const afterRect = canvas.getBoundingClientRect();
    const desiredX = afterRect.left + fracX * afterRect.width;
    const desiredY = afterRect.top + fracY * afterRect.height;
    stage.scrollLeft += desiredX - anchorX;
    stage.scrollTop += desiredY - anchorY;
  }
}

export function stepCropZoom(deltaPct) {
  const curPct = Math.round(cropperUi.scale * 100);
  setCropZoom(curPct + Number(deltaPct || 0));
}

function sizeAndDrawCropCanvas() {
  const canvas = getEl('cropperCanvas');
  if (!canvas || !cropperUi.sourceImg) return;

  const scale = cropperUi.scale || 1;
  const displayW = Math.max(40, Math.round(cropperUi.imgW * scale));
  const displayH = Math.max(40, Math.round(cropperUi.imgH * scale));
  cropperUi.displayW = displayW;
  cropperUi.displayH = displayH;

  const maxBackingSide = 2560;
  const backingFactor = Math.min(1, maxBackingSide / Math.max(displayW, displayH));
  cropperUi.canvasW = Math.max(40, Math.round(displayW * backingFactor));
  cropperUi.canvasH = Math.max(40, Math.round(displayH * backingFactor));

  canvas.width = cropperUi.canvasW;
  canvas.height = cropperUi.canvasH;
  canvas.style.width = `${displayW}px`;
  canvas.style.height = `${displayH}px`;
  canvas.classList.toggle('is-pixelated', scale >= 1.5);

  drawCropperCanvas();
}

function drawCropperCanvas() {
  const canvas = getEl('cropperCanvas');
  if (!canvas || !cropperUi.sourceImg) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const sx = cw / Math.max(1, cropperUi.imgW);
  const sy = ch / Math.max(1, cropperUi.imgH);
  const uiScale = cw / Math.max(1, cropperUi.displayW || cw);
  const r = cropperUi.rect;

  ctx.clearRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = cropperUi.scale < 1.25;
  ctx.drawImage(cropperUi.sourceImg, 0, 0, cw, ch);

  const rx = r.x * sx;
  const ry = r.y * sy;
  const rw = r.width * sx;
  const rh = r.height * sy;

  // Darkened mask outside crop selection
  ctx.save();
  ctx.fillStyle = 'rgba(4, 8, 16, 0.72)';
  ctx.beginPath();
  ctx.rect(0, 0, cw, ch);
  ctx.rect(rx, ry, rw, rh);
  ctx.fill('evenodd');
  ctx.restore();

  // Rule-of-thirds guides inside selection
  if (rw > 24 * uiScale && rh > 24 * uiScale) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = Math.max(0.75, 1 * uiScale);
    ctx.setLineDash([3 * uiScale, 3 * uiScale]);
    ctx.beginPath();
    ctx.moveTo(rx + rw / 3, ry);
    ctx.lineTo(rx + rw / 3, ry + rh);
    ctx.moveTo(rx + (2 * rw) / 3, ry);
    ctx.lineTo(rx + (2 * rw) / 3, ry + rh);
    ctx.moveTo(rx, ry + rh / 3);
    ctx.lineTo(rx + rw, ry + rh / 3);
    ctx.moveTo(rx, ry + (2 * rh) / 3);
    ctx.lineTo(rx + rw, ry + (2 * rh) / 3);
    ctx.stroke();
    ctx.restore();
  }

  // Crisp cyan crop border
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = Math.max(1, 2 * uiScale);
  ctx.strokeRect(rx + 0.5 * uiScale, ry + 0.5 * uiScale, Math.max(1, rw - uiScale), Math.max(1, rh - uiScale));
  ctx.restore();

  // 8 Resize Handles (kept consistent 10x10 CSS px size regardless of zoom)
  const handlePts = getCropHandlePoints(rx, ry, rw, rh);
  const half = 5 * uiScale;
  const size = 10 * uiScale;
  ctx.save();
  for (const pt of Object.values(handlePts)) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = Math.max(1, 2 * uiScale);
    ctx.fillRect(pt.x - half, pt.y - half, size, size);
    ctx.strokeRect(pt.x - half, pt.y - half, size, size);
  }
  ctx.restore();
}

function getCropHandlePoints(rx, ry, rw, rh) {
  return {
    nw: { x: rx, y: ry },
    n: { x: rx + rw / 2, y: ry },
    ne: { x: rx + rw, y: ry },
    e: { x: rx + rw, y: ry + rh / 2 },
    se: { x: rx + rw, y: ry + rh },
    s: { x: rx + rw / 2, y: ry + rh },
    sw: { x: rx, y: ry + rh },
    w: { x: rx, y: ry + rh / 2 }
  };
}

function hitTestCropCanvas(px, py) {
  const s = cropperUi.scale;
  const r = cropperUi.rect;
  const rx = r.x * s;
  const ry = r.y * s;
  const rw = r.width * s;
  const rh = r.height * s;

  const pts = getCropHandlePoints(rx, ry, rw, rh);
  const hitRadius = 11;
  for (const [key, pt] of Object.entries(pts)) {
    if (Math.abs(px - pt.x) <= hitRadius && Math.abs(py - pt.y) <= hitRadius) {
      return key;
    }
  }
  if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) {
    return 'move';
  }
  return 'draw';
}

function cursorForHitMode(mode) {
  switch (mode) {
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'move':
      return 'move';
    default:
      return 'crosshair';
  }
}

function getCanvasPointerPos(canvas, e) {
  const bounds = canvas.getBoundingClientRect();
  const px = clamp(e.clientX - bounds.left, 0, bounds.width);
  const py = clamp(e.clientY - bounds.top, 0, bounds.height);
  return { px, py };
}

function bindCropCanvasEvents() {
  if (cropperUi.listenersBound) return;
  const canvas = getEl('cropperCanvas');
  const stage = getEl('cropperCanvasStage');
  if (!canvas || !stage) return;
  cropperUi.listenersBound = true;

  // Mouse wheel zoom centered on pointer
  stage.addEventListener(
    'wheel',
    (e) => {
      const modal = getEl('sourceCropModal');
      if (!modal || modal.style.display === 'none') return;
      e.preventDefault();
      const curPct = Math.round(cropperUi.scale * 100);
      const step = Math.max(10, Math.round(curPct * 0.15));
      const nextPct = e.deltaY < 0 ? curPct + step : curPct - step;
      setCropZoom(nextPct, e.clientX, e.clientY);
    },
    { passive: false }
  );

  // Spacebar temporary hand pan tool & live Shift-resize toggle while modal is open
  document.addEventListener('keydown', (e) => {
    const modal = getEl('sourceCropModal');
    if (!modal || modal.style.display === 'none') return;

    if (e.key === 'Shift' && !cropperUi.shiftHeld) {
      cropperUi.shiftHeld = true;
      if (cropperUi.dragMode) {
        applyCropDrag(cropperUi.lastPointerPos.px, cropperUi.lastPointerPos.py, true);
      }
    }

    if (e.code === 'Space') {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      if (!cropperUi.spaceHeld) {
        cropperUi.spaceHeld = true;
        syncPanModeButtonUI();
        if (!cropperUi.dragMode && !cropperUi.panDrag) {
          canvas.style.cursor = 'grab';
        }
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' && cropperUi.shiftHeld) {
      cropperUi.shiftHeld = false;
      if (cropperUi.dragMode) {
        applyCropDrag(cropperUi.lastPointerPos.px, cropperUi.lastPointerPos.py, false);
      }
    }

    if (e.code === 'Space' && cropperUi.spaceHeld) {
      cropperUi.spaceHeld = false;
      syncPanModeButtonUI();
      if (!cropperUi.panDrag && !cropperUi.panMode) {
        canvas.style.cursor = 'crosshair';
      }
    }
  });

  /**
   * Updates cropperUi.rect based on pointer position and Shift modifier state.
   * When Shift is held:
   *  - Corner handles resize symmetrically from the starting selection's center.
   *  - Edge handles move the opposite edge by the exact same distance.
   *  - Freehand draw expands symmetrically around the initial click point.
   */
  function applyCropDrag(px, py, shiftKey) {
    const s = cropperUi.scale || 1;
    const imgW = cropperUi.imgW;
    const imgH = cropperUi.imgH;
    const startR = cropperUi.dragStartRect;
    const dxImg = Math.round((px - cropperUi.dragStartPointer.x) / s);
    const dyImg = Math.round((py - cropperUi.dragStartPointer.y) / s);
    const ratio = cropperUi.aspectRatio;
    const mode = cropperUi.dragMode;

    if (mode === 'move') {
      const nx = clamp(startR.x + dxImg, 0, Math.max(0, imgW - startR.width));
      const ny = clamp(startR.y + dyImg, 0, Math.max(0, imgH - startR.height));
      cropperUi.rect = { x: nx, y: ny, width: startR.width, height: startR.height };
    } else if (mode === 'draw') {
      const sx = Math.round(cropperUi.dragStartPointer.x / s);
      const sy = Math.round(cropperUi.dragStartPointer.y / s);
      const cx = Math.round(px / s);
      const cy = Math.round(py / s);

      if (shiftKey) {
        // Draw symmetrically around the initial click point
        const maxHalfW = Math.max(1, Math.min(sx, imgW - sx));
        const maxHalfH = Math.max(1, Math.min(sy, imgH - sy));
        let halfW = clamp(Math.abs(cx - sx), Math.min(4, maxHalfW), maxHalfW);
        let halfH = clamp(Math.abs(cy - sy), Math.min(4, maxHalfH), maxHalfH);

        if (ratio) {
          const maxAllowedHalfW = Math.max(1, Math.min(maxHalfW, maxHalfH * ratio));
          const desiredHalfW = Math.max(Math.abs(cx - sx), Math.abs(cy - sy) * ratio);
          halfW = clamp(desiredHalfW, Math.min(4, maxAllowedHalfW), maxAllowedHalfW);
          halfH = halfW / ratio;
        }

        const x1 = clamp(Math.round(sx - halfW), 0, Math.max(0, imgW - 1));
        const y1 = clamp(Math.round(sy - halfH), 0, Math.max(0, imgH - 1));
        const w = clamp(Math.round(halfW * 2), 1, imgW - x1);
        const h = clamp(Math.round(halfH * 2), 1, imgH - y1);
        cropperUi.rect = { x: x1, y: y1, width: w, height: h };
      } else {
        let x1 = Math.min(sx, cx);
        let y1 = Math.min(sy, cy);
        let w = Math.max(8, Math.abs(cx - sx));
        let h = Math.max(8, Math.abs(cy - sy));

        if (ratio) {
          h = Math.max(8, Math.round(w / ratio));
          if (cy < sy) y1 = sy - h;
          if (cx < sx) x1 = sx - w;
        }

        x1 = clamp(x1, 0, imgW - 8);
        y1 = clamp(y1, 0, imgH - 8);
        w = clamp(w, 8, imgW - x1);
        h = clamp(h, 8, imgH - y1);
        if (ratio) {
          if (w / h > ratio) w = Math.max(8, Math.round(h * ratio));
          else h = Math.max(8, Math.round(w / ratio));
        }
        cropperUi.rect = { x: x1, y: y1, width: w, height: h };
      }
    } else if (shiftKey) {
      // Shift-drag resize:
      // - Corners resize evenly from the selection's center
      // - Edges move the opposite edge by the same delta (centered on that axis)
      const centerX = startR.x + startR.width / 2;
      const centerY = startR.y + startR.height / 2;
      const minSize = 12;

      // Clamp half-extents to the nearest image boundary from center so the center never drifts
      const maxHalfW = Math.max(0.5, Math.min(centerX, imgW - centerX));
      const maxHalfH = Math.max(0.5, Math.min(centerY, imgH - centerY));
      const minHalfW = Math.min(minSize / 2, maxHalfW);
      const minHalfH = Math.min(minSize / 2, maxHalfH);

      let halfW = startR.width / 2;
      let halfH = startR.height / 2;

      if (mode.includes('w')) halfW = clamp(startR.width / 2 - dxImg, minHalfW, maxHalfW);
      else if (mode.includes('e')) halfW = clamp(startR.width / 2 + dxImg, minHalfW, maxHalfW);

      if (mode.includes('n')) halfH = clamp(startR.height / 2 - dyImg, minHalfH, maxHalfH);
      else if (mode.includes('s')) halfH = clamp(startR.height / 2 + dyImg, minHalfH, maxHalfH);

      if (ratio) {
        // Keep aspect ratio while remaining symmetrically centered and inside image bounds
        const maxRatioHalfW = Math.max(0.5, Math.min(maxHalfW, maxHalfH * ratio));
        const minRatioHalfW = Math.min(Math.max(minSize / 2, (minSize / 2) * ratio), maxRatioHalfW);

        if (mode === 'n' || mode === 's') {
          halfW = clamp(halfH * ratio, minRatioHalfW, maxRatioHalfW);
        } else if (mode === 'e' || mode === 'w') {
          halfW = clamp(halfW, minRatioHalfW, maxRatioHalfW);
        } else {
          // Corner handle: follow whichever axis changed more relative to starting half-width
          const startHalfW = startR.width / 2;
          const targetHalfW =
            Math.abs(halfW - startHalfW) >= Math.abs(halfH * ratio - startHalfW)
              ? halfW
              : halfH * ratio;
          halfW = clamp(targetHalfW, minRatioHalfW, maxRatioHalfW);
        }
        halfH = halfW / ratio;
      }

      const left = clamp(Math.round(centerX - halfW), 0, Math.max(0, imgW - 1));
      const top = clamp(Math.round(centerY - halfH), 0, Math.max(0, imgH - 1));
      const nw = clamp(Math.round(halfW * 2), 1, imgW - left);
      const nh = clamp(Math.round(halfH * 2), 1, imgH - top);

      cropperUi.rect = { x: left, y: top, width: nw, height: nh };
    } else {
      // Standard asymmetric edge / corner resize
      let left = startR.x;
      let top = startR.y;
      let right = startR.x + startR.width;
      let bottom = startR.y + startR.height;
      const minSize = 12;

      if (mode.includes('w')) left = clamp(startR.x + dxImg, 0, right - minSize);
      if (mode.includes('e')) right = clamp(startR.x + startR.width + dxImg, left + minSize, imgW);
      if (mode.includes('n')) top = clamp(startR.y + dyImg, 0, bottom - minSize);
      if (mode.includes('s')) bottom = clamp(startR.y + startR.height + dyImg, top + minSize, imgH);

      let nw = right - left;
      let nh = bottom - top;

      if (ratio) {
        if (mode === 'n' || mode === 's') {
          nw = clamp(Math.round(nh * ratio), minSize, imgW - left);
          nh = Math.max(minSize, Math.round(nw / ratio));
        } else {
          nh = clamp(Math.round(nw / ratio), minSize, imgH - top);
          nw = Math.max(minSize, Math.round(nh * ratio));
        }
        if (mode.includes('w')) left = Math.max(0, right - nw);
        if (mode.includes('n')) top = Math.max(0, bottom - nh);
      }

      cropperUi.rect = {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.max(1, Math.round(nw)),
        height: Math.max(1, Math.round(nh))
      };
    }

    drawCropperCanvas();
    syncCropInputsFromRect();
  }

  canvas.addEventListener('pointerdown', (e) => {
    const isMiddlePan = e.button === 1;
    const isHandPan = e.button === 0 && (cropperUi.panMode || cropperUi.spaceHeld);

    if (isMiddlePan || isHandPan) {
      cropperUi.panDrag = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        startScrollLeft: stage.scrollLeft,
        startScrollTop: stage.scrollTop
      };
      canvas.style.cursor = 'grabbing';
      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      e.preventDefault();
      return;
    }

    if (e.button !== 0) return;
    const { px, py } = getCanvasPointerPos(canvas, e);
    const hit = hitTestCropCanvas(px, py);
    cropperUi.dragMode = hit;
    cropperUi.dragStartPointer = { x: px, y: py };
    cropperUi.lastPointerPos = { px, py };
    cropperUi.dragStartRect = { ...cropperUi.rect };
    cropperUi.shiftHeld = Boolean(e.shiftKey);
    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (cropperUi.panDrag) {
      const dx = e.clientX - cropperUi.panDrag.startClientX;
      const dy = e.clientY - cropperUi.panDrag.startClientY;
      stage.scrollLeft = cropperUi.panDrag.startScrollLeft - dx;
      stage.scrollTop = cropperUi.panDrag.startScrollTop - dy;
      return;
    }

    const { px, py } = getCanvasPointerPos(canvas, e);
    if (!cropperUi.dragMode) {
      if (cropperUi.panMode || cropperUi.spaceHeld) {
        canvas.style.cursor = 'grab';
      } else {
        const hoverHit = hitTestCropCanvas(px, py);
        canvas.style.cursor = cursorForHitMode(hoverHit);
      }
      return;
    }

    cropperUi.lastPointerPos = { px, py };
    cropperUi.shiftHeld = Boolean(e.shiftKey);
    applyCropDrag(px, py, cropperUi.shiftHeld);
  });

  const endDrag = () => {
    cropperUi.dragMode = null;
    cropperUi.shiftHeld = false;
    if (cropperUi.panDrag) {
      cropperUi.panDrag = null;
      canvas.style.cursor = cropperUi.panMode || cropperUi.spaceHeld ? 'grab' : 'crosshair';
    }
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

function syncCropInputsFromRect() {
  const r = cropperUi.rect;
  setElValue('cropInputX', r.x);
  setElValue('cropInputY', r.y);
  setElValue('cropInputW', r.width);
  setElValue('cropInputH', r.height);

  const ratio = r.height > 0 ? r.width / r.height : 1;
  setElText(
    'cropSelectionSummary',
    `${r.width} × ${r.height} px (Ratio ${ratio.toFixed(2)}:1) • Original ${cropperUi.imgW} × ${cropperUi.imgH} px`
  );
}

export function onCropNumericInputChange() {
  const imgW = cropperUi.imgW || 1;
  const imgH = cropperUi.imgH || 1;
  let x = clamp(parseInt(getEl('cropInputX')?.value || '0', 10) || 0, 0, Math.max(0, imgW - 1));
  let y = clamp(parseInt(getEl('cropInputY')?.value || '0', 10) || 0, 0, Math.max(0, imgH - 1));
  let w = clamp(parseInt(getEl('cropInputW')?.value || String(imgW), 10) || 1, 1, imgW - x);
  let h = clamp(parseInt(getEl('cropInputH')?.value || String(imgH), 10) || 1, 1, imgH - y);

  cropperUi.rect = { x, y, width: w, height: h };
  drawCropperCanvas();
  syncCropInputsFromRect();
}

function syncAspectButtonsUI() {
  const map = {
    free: 'cropAspectBtn_free',
    '1:1': 'cropAspectBtn_1_1',
    '2:3': 'cropAspectBtn_2_3',
    '3:4': 'cropAspectBtn_3_4',
    '4:3': 'cropAspectBtn_4_3',
    '16:9': 'cropAspectBtn_16_9'
  };
  Object.entries(map).forEach(([key, id]) => {
    const btn = getEl(id);
    if (btn) btn.classList.toggle('active', cropperUi.aspectLabel === key);
  });
}

export function setCropAspectPreset(preset) {
  cropperUi.aspectLabel = preset || 'free';
  const ratios = {
    free: null,
    '1:1': 1,
    '2:3': 2 / 3,
    '3:4': 3 / 4,
    '4:3': 4 / 3,
    '16:9': 16 / 9
  };
  cropperUi.aspectRatio = ratios[preset] ?? null;
  syncAspectButtonsUI();

  if (cropperUi.aspectRatio) {
    const r = cropperUi.rect;
    const cx = r.x + r.width / 2;
    const cy = r.y + r.height / 2;
    let nw = r.width;
    let nh = Math.round(nw / cropperUi.aspectRatio);
    if (nh > cropperUi.imgH) {
      nh = cropperUi.imgH;
      nw = Math.round(nh * cropperUi.aspectRatio);
    }
    if (nw > cropperUi.imgW) {
      nw = cropperUi.imgW;
      nh = Math.round(nw / cropperUi.aspectRatio);
    }
    nw = Math.max(8, nw);
    nh = Math.max(8, nh);
    const nx = clamp(Math.round(cx - nw / 2), 0, cropperUi.imgW - nw);
    const ny = clamp(Math.round(cy - nh / 2), 0, cropperUi.imgH - nh);
    cropperUi.rect = { x: nx, y: ny, width: nw, height: nh };
    drawCropperCanvas();
    syncCropInputsFromRect();
  }
}

export function runCropperAutoTrim() {
  if (!cropperUi.sourceImg) return;
  const trimMode = getEl('cropTrimModeSelect')?.value || 'auto';
  const pad = clamp(parseInt(getEl('cropTrimPaddingInput')?.value || '2', 10) || 0, 0, 64);

  const bounds = detectTrimBounds(cropperUi.sourceImg, {
    mode: trimMode,
    padding: pad
  });

  if (!bounds || !bounds.trimmed) {
    showToast('No extra blank edges detected with current trim mode');
    return;
  }

  cropperUi.aspectLabel = 'free';
  cropperUi.aspectRatio = null;
  syncAspectButtonsUI();

  cropperUi.rect = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };
  drawCropperCanvas();
  syncCropInputsFromRect();
  showToast(`Auto-trimmed selection to ${bounds.width}×${bounds.height} px (${bounds.blankPct}% blank removed)`);
}

export async function applySourceCropModal() {
  const baseImg = cropperUi.sourceImg;
  if (!baseImg) return;

  const r = cropperUi.rect;
  const isFull = r.x === 0 && r.y === 0 && r.width === cropperUi.imgW && r.height === cropperUi.imgH;

  if (isFull) {
    closeSourceCropModal();
    resetSourceCrop();
    return;
  }

  try {
    const result = await renderCroppedImage(baseImg, r);
    commitActiveSourceImage(result.img, result.dataUrl, result.rect, baseImg);
    closeSourceCropModal();
    showToast(`Cropped source graphic to ${result.rect.width}×${result.rect.height} px`);
  } catch (err) {
    console.error('Failed to apply crop:', err);
    showToast('Failed to crop image');
  }
}
