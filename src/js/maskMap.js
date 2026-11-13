// ==========================================
// Mask Map Channel Packing (R=Metallic, G=0, B=0, A=Smoothness)
// ==========================================
import { state, drawImageSquare, showToast, formatFileTypeLabel } from './state.js';

export function handleCustomMaskSelect(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid mask map image');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.customMaskImg = img;
        state.customMaskFileName = file.name;
        state.customMaskFileType = formatFileTypeLabel(file);
        state.isCustomImageLoaded = true;
        state.hasUnsavedChanges = true;
        updateCustomMaskUI();
        if (window.renderAllMaps) window.renderAllMaps();
        if (window.refreshAssetChecklistModal) window.refreshAssetChecklistModal();
        showToast(`Inserted custom mask map: ${file.name}`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export function clearCustomMask(triggerRender = true) {
  state.customMaskImg = null;
  state.customMaskFileName = '';
  state.customMaskFileType = '';
  const input = document.getElementById('customMaskInput');
  if (input) input.value = '';
  updateCustomMaskUI();
  if (triggerRender) {
    if (window.renderAllMaps) window.renderAllMaps();
    if (window.refreshAssetChecklistModal) window.refreshAssetChecklistModal();
    showToast('Reverted to procedural mask map');
  }
}

export function updateCustomMaskUI() {
  const badge = document.getElementById('maskSourceBadge');
  const btnText = document.getElementById('customMaskBtnText');
  const btnClear = document.getElementById('btnClearCustomMask');
  const hint = document.getElementById('customMaskHint');
  const groupVariation = document.getElementById('groupMaskVariation');

  if (state.customMaskImg) {
    if (badge) {
      badge.textContent = 'Custom Mask';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = 'var(--accent-emerald)';
    }
    if (btnText) {
      const nameStr = state.customMaskFileName || 'Custom Mask';
      btnText.textContent = nameStr.length > 20 ? nameStr.substring(0, 18) + '...' : nameStr;
    }
    if (btnClear) btnClear.style.display = 'block';
    if (hint) {
      hint.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 600;">Custom mask active.</span> Using loaded image channels (R:Metal, A:Smooth).`;
    }
    if (groupVariation) groupVariation.style.opacity = '0.5';
  } else {
    if (badge) {
      badge.textContent = 'Auto (Procedural)';
      badge.style.background = 'rgba(56, 189, 248, 0.15)';
      badge.style.color = 'var(--primary)';
    }
    if (btnText) btnText.textContent = 'Insert Custom _MaskMap...';
    if (btnClear) btnClear.style.display = 'none';
    if (hint) hint.textContent = 'Auto-packing channels with sliders. Or insert an external custom _MaskMap.png.';
    if (groupVariation) groupVariation.style.opacity = '1.0';
  }
}

export function onMetalChange() {
  const val = parseInt(document.getElementById('metallic').value, 10);
  const pct = Math.round((val / 255) * 100);
  document.getElementById('metalVal').textContent = `${val} (${pct}%)`;
  if (window.renderAllMaps) window.renderAllMaps();
}

export function onSmoothChange() {
  const val = parseInt(document.getElementById('smoothness').value, 10);
  const pct = Math.round((val / 255) * 100);
  document.getElementById('smoothVal').textContent = `${val} (${pct}%)`;
  if (window.renderAllMaps) window.renderAllMaps();
}

export function onMaskVariationChange() {
  const slider = document.getElementById('maskVariation');
  if (!slider) return;
  const val = parseInt(slider.value, 10) || 0;
  state.maskVariation = val;
  const valBadge = document.getElementById('maskVariationVal');
  if (valBadge) {
    valBadge.textContent = val === 0 ? '0% (Flat)' : `${val}% (Textured)`;
  }
  if (window.renderAllMaps) window.renderAllMaps();
}

export function generateMaskMap(canvasMask, ctxMask, basePixels, size) {
  canvasMask.width = size;
  canvasMask.height = size;
  const fitStrategy = document.getElementById('fitStrategy')?.value || 'crop';
  const maskWithAlpha = document.getElementById('maskWithDecalAlpha')?.checked ?? true;

  if (state.customMaskImg) {
    // Render custom uploaded mask image
    drawImageSquare(ctxMask, state.customMaskImg, size, fitStrategy);
    if (state.appMode !== 'surface' && maskWithAlpha) {
      // Modulate with base alpha if requested for decals
      const maskImgData = ctxMask.getImageData(0, 0, size, size);
      const d = maskImgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const aNorm = basePixels[i + 3] / 255.0;
        d[i] = Math.round(d[i] * aNorm);
        d[i + 3] = Math.round(d[i + 3] * aNorm);
      }
      ctxMask.putImageData(maskImgData, 0, 0);
    }
    return;
  }

  // Procedural mask generation
  const maskImageData = ctxMask.createImageData(size, size);
  const maskPixels = maskImageData.data;

  const metallicVal = parseInt(document.getElementById('metallic')?.value ?? 0, 10);
  const smoothnessVal = parseInt(document.getElementById('smoothness')?.value ?? 40, 10);
  const variationPct = state.maskVariation || 0;

  for (let i = 0; i < maskPixels.length; i += 4) {
    const alphaNorm = basePixels[i + 3] / 255.0;

    let computedSmooth = smoothnessVal;
    if (variationPct > 0) {
      // Compute relative luminance of source pixel (0 to 1)
      const r = basePixels[i];
      const g = basePixels[i + 1];
      const b = basePixels[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      // Center around 0.5 (-1.0 to +1.0)
      const diff = (lum - 0.5) * 2.0;
      // Scale variation: brighter surface grains slightly smoother, darker crevices rougher/matte
      const factor = 1.0 + diff * (variationPct / 100.0) * 0.75;
      computedSmooth = Math.max(0, Math.min(255, Math.round(smoothnessVal * factor)));
    }

    if (state.appMode === 'surface') {
      maskPixels[i] = metallicVal;
      maskPixels[i + 1] = 0;
      maskPixels[i + 2] = 0;
      maskPixels[i + 3] = computedSmooth;
    } else {
      if (maskWithAlpha) {
        maskPixels[i] = Math.round(metallicVal * alphaNorm);
        maskPixels[i + 1] = 0;
        maskPixels[i + 2] = 0;
        maskPixels[i + 3] = Math.round(computedSmooth * alphaNorm);
      } else {
        maskPixels[i] = metallicVal;
        maskPixels[i + 1] = 0;
        maskPixels[i + 2] = 0;
        maskPixels[i + 3] = computedSmooth;
      }
    }
  }
  ctxMask.putImageData(maskImageData, 0, 0);
}
