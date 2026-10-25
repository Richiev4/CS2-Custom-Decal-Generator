// ==========================================
// Mask Map Channel Packing (R=Metallic, G=0, B=0, A=Smoothness)
// ==========================================
import { state } from './state.js';

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

export function generateMaskMap(canvasMask, ctxMask, basePixels, size) {
  canvasMask.width = size;
  canvasMask.height = size;
  const maskImageData = ctxMask.createImageData(size, size);
  const maskPixels = maskImageData.data;

  const metallicVal = parseInt(document.getElementById('metallic').value, 10);
  const smoothnessVal = parseInt(document.getElementById('smoothness').value, 10);
  const maskWithAlpha = document.getElementById('maskWithDecalAlpha').checked;

  for (let i = 0; i < maskPixels.length; i += 4) {
    const alphaNorm = basePixels[i + 3] / 255.0;

    if (state.appMode === 'surface') {
      maskPixels[i] = metallicVal;
      maskPixels[i + 1] = 0;
      maskPixels[i + 2] = 0;
      maskPixels[i + 3] = smoothnessVal;
    } else {
      if (maskWithAlpha) {
        maskPixels[i] = Math.round(metallicVal * alphaNorm);
        maskPixels[i + 1] = 0;
        maskPixels[i + 2] = 0;
        maskPixels[i + 3] = Math.round(smoothnessVal * alphaNorm);
      } else {
        maskPixels[i] = metallicVal;
        maskPixels[i + 1] = 0;
        maskPixels[i + 2] = 0;
        maskPixels[i + 3] = smoothnessVal;
      }
    }
  }
  ctxMask.putImageData(maskImageData, 0, 0);
}
