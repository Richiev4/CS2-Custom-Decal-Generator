// ==========================================
// Normal Map Generation & Custom Normal Module
// ==========================================
import { state, drawImageSquare, showToast } from './state.js';

export function handleCustomNormalSelect(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid normal map image');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.customNormalImg = img;
        state.customNormalFileName = file.name;
        state.isCustomImageLoaded = true;
        state.hasUnsavedChanges = true;
        const bumpSlider = document.getElementById('bumpIntensity');
        if (parseFloat(bumpSlider.value) === 2.5) {
          bumpSlider.value = 1.0;
          document.getElementById('bumpVal').textContent = '1.0×';
        }
        updateCustomNormalUI();
        if (window.renderAllMaps) window.renderAllMaps();
        showToast(`Inserted custom normal map: ${file.name}`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export function clearCustomNormal(triggerRender = true) {
  state.customNormalImg = null;
  state.customNormalFileName = '';
  const input = document.getElementById('customNormalInput');
  if (input) input.value = '';
  updateCustomNormalUI();
  if (triggerRender) {
    const bumpSlider = document.getElementById('bumpIntensity');
    if (parseFloat(bumpSlider.value) === 1.0) {
      bumpSlider.value = 2.5;
      document.getElementById('bumpVal').textContent = '2.5×';
    }
    if (window.renderAllMaps) window.renderAllMaps();
    showToast('Reverted to procedural normal map');
  }
}

export function updateCustomNormalUI() {
  const badge = document.getElementById('normalSourceBadge');
  const btnText = document.getElementById('customNormalBtnText');
  const btnClear = document.getElementById('btnClearCustomNormal');
  const hint = document.getElementById('customNormalHint');
  const cardBadge = document.getElementById('cardNormalBadge');
  const cardFooter = document.getElementById('cardNormalFooter');
  const blurGroup = document.getElementById('groupNormalBlur');
  const sliderLabel = document.getElementById('bumpSliderLabel');
  const sliderHint = document.getElementById('bumpSliderHint');

  if (state.customNormalImg) {
    if (badge) {
      badge.textContent = 'Custom Normal';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = 'var(--accent-emerald)';
    }
    if (btnText) {
      const nameStr = state.customNormalFileName || 'Custom Normal';
      btnText.textContent = nameStr.length > 20 ? nameStr.substring(0, 18) + '...' : nameStr;
    }
    if (btnClear) btnClear.style.display = 'block';
    if (hint) {
      hint.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 600;">Custom normal active.</span> Height slider modulates relief depth (1.0× = 1:1 original relief).`;
    }
    if (cardBadge) {
      cardBadge.textContent = 'Custom';
      cardBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      cardBadge.style.color = 'var(--accent-emerald)';
    }
    if (cardFooter) {
      cardFooter.textContent = 'Custom Tangent Normal (Height Modulated)';
    }
    if (blurGroup) blurGroup.style.opacity = '0.5';
    if (sliderLabel) sliderLabel.textContent = 'Custom Relief Height / Depth';
    if (sliderHint) sliderHint.textContent = 'Multiplies normal vectors: 1.0× = original relief, >1.0× = steeper, <1.0× = flatter.';
  } else {
    if (badge) {
      badge.textContent = 'Auto (From Color)';
      badge.style.background = 'rgba(56, 189, 248, 0.15)';
      badge.style.color = 'var(--primary)';
    }
    if (btnText) btnText.textContent = 'Insert Custom _NormalMap...';
    if (btnClear) btnClear.style.display = 'none';
    if (hint) hint.textContent = 'Auto-generating bump heights from base texture. Or insert a custom tangent normal map.';
    if (cardBadge) {
      cardBadge.textContent = 'Auto';
      cardBadge.style.background = 'rgba(56, 189, 248, 0.15)';
      cardBadge.style.color = 'var(--primary)';
    }
    if (cardFooter) {
      cardFooter.textContent = 'OpenGL Tangent Normal (+X, +Y)';
    }
    if (blurGroup) blurGroup.style.opacity = '1.0';
    if (sliderLabel) sliderLabel.textContent = 'Height / Bump Depth';
    if (sliderHint) sliderHint.textContent = 'Scales normal vector relief intensity and groove steepness.';
  }
}

export function onBumpChange() {
  const val = parseFloat(document.getElementById('bumpIntensity').value);
  document.getElementById('bumpVal').textContent = `${val.toFixed(1)}×`;
  if (window.renderAllMaps) window.renderAllMaps();
}

export function onBlurChange() {
  const val = parseInt(document.getElementById('normalBlur').value, 10);
  document.getElementById('blurVal').textContent = `${val} px`;
  if (window.renderAllMaps) window.renderAllMaps();
}

export function generateNormalMap(canvasNormal, ctxNormal, basePixels, size, fitStrategy) {
  const bumpIntensity = parseFloat(document.getElementById('bumpIntensity').value);
  const invertBump = document.getElementById('invertBump').checked ? -1.0 : 1.0;
  const flipNormalY = document.getElementById('flipNormalY') && document.getElementById('flipNormalY').checked ? -1.0 : 1.0;

  if (state.customNormalImg) {
    drawImageSquare(ctxNormal, state.customNormalImg, size, fitStrategy);
    const normalImageData = ctxNormal.getImageData(0, 0, size, size);
    const normalPixels = normalImageData.data;

    for (let i = 0; i < normalPixels.length; i += 4) {
      let nx = (normalPixels[i] / 255.0) * 2.0 - 1.0;
      let ny = (normalPixels[i + 1] / 255.0) * 2.0 - 1.0;
      let nz = (normalPixels[i + 2] / 255.0) * 2.0 - 1.0;

      nx = nx * bumpIntensity * invertBump;
      ny = ny * bumpIntensity * invertBump * flipNormalY;
      nz = Math.max(0.001, nz);

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
      nx /= len;
      ny /= len;
      nz /= len;

      normalPixels[i] = Math.round((nx * 0.5 + 0.5) * 255);
      normalPixels[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalPixels[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);

      if (state.appMode === 'surface') {
        normalPixels[i + 3] = 255;
      } else {
        if (normalPixels[i + 3] >= 250) {
          normalPixels[i + 3] = basePixels[i + 3];
        }
      }
    }
    ctxNormal.putImageData(normalImageData, 0, 0);
  } else {
    const normalImageData = ctxNormal.createImageData(size, size);
    const normalPixels = normalImageData.data;

    const heightMap = new Float32Array(size * size);
    for (let i = 0; i < basePixels.length; i += 4) {
      const r = basePixels[i];
      const g = basePixels[i + 1];
      const b = basePixels[i + 2];
      const a = basePixels[i + 3] / 255.0;

      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      heightMap[i / 4] = lum * (state.appMode === 'surface' ? 1.0 : a);
    }

    const blurLevel = parseInt(document.getElementById('normalBlur').value, 10);
    let workingHeight = heightMap;
    if (blurLevel > 0) {
      const blurred = new Float32Array(size * size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let sum = 0;
          let count = 0;
          for (let dy = -blurLevel; dy <= blurLevel; dy++) {
            for (let dx = -blurLevel; dx <= blurLevel; dx++) {
              let nx, ny;
              if (state.appMode === 'surface') {
                nx = (x + dx + size) % size;
                ny = (y + dy + size) % size;
              } else {
                nx = Math.min(Math.max(x + dx, 0), size - 1);
                ny = Math.min(Math.max(y + dy, 0), size - 1);
              }
              sum += heightMap[ny * size + nx];
              count++;
            }
          }
          blurred[y * size + x] = sum / count;
        }
      }
      workingHeight = blurred;
    }

    for (let y = 0; y < size; y++) {
      let y0, y1, y2;
      if (state.appMode === 'surface') {
        y0 = ((y - 1 + size) % size) * size;
        y1 = y * size;
        y2 = ((y + 1) % size) * size;
      } else {
        y0 = Math.max(0, y - 1) * size;
        y1 = y * size;
        y2 = Math.min(size - 1, y + 1) * size;
      }

      for (let x = 0; x < size; x++) {
        let x0, x1, x2;
        if (state.appMode === 'surface') {
          x0 = (x - 1 + size) % size;
          x1 = x;
          x2 = (x + 1) % size;
        } else {
          x0 = Math.max(0, x - 1);
          x1 = x;
          x2 = Math.min(size - 1, x + 1);
        }

        const tl = workingHeight[y0 + x0];
        const tc = workingHeight[y0 + x1];
        const tr = workingHeight[y0 + x2];

        const ml = workingHeight[y1 + x0];
        const mr = workingHeight[y1 + x2];

        const bl = workingHeight[y2 + x0];
        const bc = workingHeight[y2 + x1];
        const br = workingHeight[y2 + x2];

        const dX = ((tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl));
        const dY = ((tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br));

        let nx = -dX * bumpIntensity * invertBump;
        let ny = -dY * bumpIntensity * invertBump * flipNormalY;
        let nz = 1.0;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        nx /= len;
        ny /= len;
        nz /= len;

        const idx = (y * size + x) * 4;
        normalPixels[idx] = Math.round((nx * 0.5 + 0.5) * 255);
        normalPixels[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        normalPixels[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);

        normalPixels[idx + 3] = state.appMode === 'surface' ? 255 : basePixels[idx + 3];
      }
    }
    ctxNormal.putImageData(normalImageData, 0, 0);
  }
}
