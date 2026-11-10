// ==========================================
// Preview Area, 3D Simulation & Tiled Views
// ==========================================
import { state, getCanvases } from './state.js';
import { renderScaleView, initScaleViewInteractions, updateScaleHUD } from './scalePreview.js';
import { getAspectFormatName } from './exporter.js';

export function switchTab(tab) {
  state.activeTab = tab;

  const tabButtonMap = {
    grid: 'tabGrid',
    '3d': 'tab3d',
    scale: 'tabScale',
    tiled: 'tabTiled',
    base: 'tabBase',
    normal: 'tabNormal',
    mask: 'tabMask',
    icon: 'tabIcon',
    single: 'tabBase'
  };

  const activeBtnId = tabButtonMap[tab] || `tabBtn_${tab}`;
  document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
    const isActive = (btn.id === activeBtnId);
    btn.classList.toggle('active', isActive);
    if (isActive && typeof btn.scrollIntoView === 'function') {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  });

  const vGrid = document.getElementById('viewGrid');
  const vSingle = document.getElementById('viewSingle');
  const v3d = document.getElementById('view3D') || document.getElementById('view3d');
  const vTiled = document.getElementById('viewTiled');
  const vScale = document.getElementById('viewScale');

  const isSingleMode = ['base', 'normal', 'mask', 'icon', 'single'].includes(tab);

  if (vGrid) vGrid.style.display = tab === 'grid' ? 'grid' : 'none';
  if (vSingle) vSingle.style.display = isSingleMode ? 'flex' : 'none';
  if (v3d) v3d.style.display = tab === '3d' ? 'flex' : 'none';
  if (vTiled) vTiled.style.display = tab === 'tiled' ? 'flex' : 'none';
  if (vScale) vScale.style.display = tab === 'scale' ? 'flex' : 'none';

  if (isSingleMode) {
    state.activeSingleMap = tab === 'single' ? 'base' : tab;
    updateSingleView();
  } else if (tab === '3d') {
    renderSimulation();
  } else if (tab === 'tiled') {
    renderTiledView();
  } else if (tab === 'scale') {
    initScaleViewInteractions();
    renderScaleView();
  }

  if (window.updateEmptyPreviewIndicator) {
    window.updateEmptyPreviewIndicator();
  }
}

export const switchPreviewTab = switchTab;

export function selectSingleMap(mapType) {
  state.activeSingleMap = mapType;
  updateSingleView();
}

export function updateSingleView() {
  const { canvasBase, canvasNormal, canvasMask, canvasIcon, canvasSingle, ctxSingle } = getCanvases();
  if (!canvasSingle || !ctxSingle) return;

  if (!state.currentImage) {
    ctxSingle.clearRect(0, 0, canvasSingle.width, canvasSingle.height);
    const aspectBar = document.getElementById('singleAspectOverlayBar');
    if (aspectBar) aspectBar.style.display = 'none';
    const iconBar = document.getElementById('iconOverlayToggleBar');
    if (iconBar) iconBar.style.display = 'none';
    return;
  }

  ['base', 'normal', 'mask', 'icon'].forEach(m => {
    const btn = document.getElementById(`singleSelect_${m}`);
    if (btn) {
      if (m === state.activeSingleMap) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  let srcCanvas = canvasBase;
  let title = 'Base Color Map';
  let desc = 'RGB: Diffuse Color • Alpha: Opacity Cutout';

  if (state.activeSingleMap === 'normal') {
    srcCanvas = canvasNormal;
    title = 'Normal Map';
    desc = 'OpenGL Tangent Space (+X Right, +Y Up, +Z Forward)';
  } else if (state.activeSingleMap === 'mask') {
    srcCanvas = canvasMask;
    title = 'Mask Map';
    desc = 'Red: Metallic • Green: 0 • Blue: 0 • Alpha: Smoothness';
  } else if (state.activeSingleMap === 'icon') {
    srcCanvas = canvasIcon;
    title = 'In-Game Icon Thumbnail';
    desc = 'CS2 UI Thumbnail (Base + Dual Watermarks)';
  }

  const titleEl = document.getElementById('singleMapTitle');
  const descEl = document.getElementById('singleMapDesc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  const singleNameEl = document.getElementById('singleName');
  if (singleNameEl) {
    let fileName = '_BaseColorMap.png';
    if (state.activeSingleMap === 'normal') fileName = '_NormalMap.png';
    else if (state.activeSingleMap === 'mask') fileName = '_MaskMap.png';
    else if (state.activeSingleMap === 'icon') fileName = 'icon.png';
    singleNameEl.textContent = fileName;
  }

  if (srcCanvas && srcCanvas.width > 0) {
    canvasSingle.width = srcCanvas.width;
    canvasSingle.height = srcCanvas.height;
    ctxSingle.clearRect(0, 0, canvasSingle.width, canvasSingle.height);
    ctxSingle.drawImage(srcCanvas, 0, 0);
  }

  // Overlays: Icon Badges vs Decal Aspect Ratio Footprint
  const iconBar = document.getElementById('iconOverlayToggleBar');
  const aspectBar = document.getElementById('singleAspectOverlayBar');

  if (state.activeSingleMap === 'icon') {
    if (iconBar) {
      iconBar.style.display = 'flex';
      if (typeof window.syncAllBadgeCheckboxes === 'function') {
        window.syncAllBadgeCheckboxes();
      }
    }
    if (aspectBar) aspectBar.style.display = 'none';

    if (window.initBadgeCanvasInteractions) {
      window.initBadgeCanvasInteractions();
    }
  } else {
    if (iconBar) iconBar.style.display = 'none';
    canvasSingle.style.cursor = 'default';

    if (state.appMode === 'decal') {
      if (aspectBar) aspectBar.style.display = 'flex';

      const { width: decalW, height: decalH } = getDecalDimensions();
      const ratio = decalH > 0 ? (decalW / decalH) : 1.0;
      const format = getAspectFormatName(ratio);
      const area = (decalW * decalH).toFixed(2);

      const sizeEl = document.getElementById('singleAspectDecalSize');
      if (sizeEl) sizeEl.textContent = `${decalW.toFixed(1)}m × ${decalH.toFixed(1)}m (${area} m²)`;

      const chipEl = document.getElementById('singleAspectFormatChip');
      if (chipEl) chipEl.textContent = `${ratio.toFixed(2)} : 1 (${format.split(' ')[0]})`;

      const chk = document.getElementById('toggleSingleAspectFrame');
      if (chk) chk.checked = (state.showSingleAspectFrame !== false);

      if (state.showSingleAspectFrame !== false && canvasSingle.width > 0) {
        drawSingleAspectFrame(ctxSingle, canvasSingle.width, canvasSingle.height, decalW, decalH, ratio);
      }
    } else {
      if (aspectBar) aspectBar.style.display = 'none';
    }
  }
}

function getDecalDimensions() {
  const wInput = document.getElementById('dimWidth');
  const hInput = document.getElementById('dimHeight');
  const dInput = document.getElementById('dimDepth');
  const width = wInput ? (parseFloat(wInput.value) || 2.0) : 2.0;
  const height = hInput ? (parseFloat(hInput.value) || 2.0) : 2.0;
  const depth = dInput ? (parseFloat(dInput.value) || 1.0) : 1.0;
  return { width, height, depth };
}

function drawSingleAspectFrame(ctx, width, height, decalW, decalH, ratio) {
  ctx.save();

  const isSquare = Math.abs(decalW - decalH) < 0.02;
  const fitStrategy = document.getElementById('fitStrategy')?.value || 'contain';

  let frameW = width;
  let frameH = height;
  let frameX = 0;
  let frameY = 0;

  if (!isSquare && fitStrategy === 'contain') {
    if (ratio <= 1.0) {
      frameH = height * 0.90;
      frameW = frameH * ratio;
    } else {
      frameW = width * 0.90;
      frameH = frameW / ratio;
    }
    frameX = (width - frameW) / 2;
    frameY = (height - frameH) / 2;

    // Darker tint outside 3D mesh footprint
    ctx.fillStyle = 'rgba(5, 10, 20, 0.42)';
    ctx.fillRect(0, 0, width, frameY);
    ctx.fillRect(0, frameY + frameH, width, height - (frameY + frameH));
    ctx.fillRect(0, frameY, frameX, frameH);
    ctx.fillRect(frameX + frameW, frameY, width - (frameX + frameW), frameH);
  } else {
    const margin = 24;
    frameX = margin;
    frameY = margin;
    frameW = width - (margin * 2);
    frameH = height - (margin * 2);
  }

  // 1. Mesh Bounding Box (dashed cyan)
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2.0;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(frameX, frameY, frameW, frameH);
  ctx.setLineDash([]);

  // 2. Corner Brackets
  const bracketSize = Math.min(32, Math.min(frameW, frameH) * 0.15);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#38bdf8';

  // Top-left
  ctx.beginPath();
  ctx.moveTo(frameX, frameY + bracketSize); ctx.lineTo(frameX, frameY); ctx.lineTo(frameX + bracketSize, frameY);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(frameX + frameW - bracketSize, frameY); ctx.lineTo(frameX + frameW, frameY); ctx.lineTo(frameX + frameW, frameY + bracketSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(frameX, frameY + frameH - bracketSize); ctx.lineTo(frameX, frameY + frameH); ctx.lineTo(frameX + bracketSize, frameY + frameH);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(frameX + frameW - bracketSize, frameY + frameH); ctx.lineTo(frameX + frameW, frameY + frameH); ctx.lineTo(frameX + frameW, frameY + frameH - bracketSize);
  ctx.stroke();

  // 3. Center Crosshair
  const cx = frameX + frameW / 2;
  const cy = frameY + frameH / 2;
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
  ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
  ctx.stroke();

  // 4. Width Tag at Top
  const wText = `↔ Width: ${decalW.toFixed(2)}m`;
  ctx.font = 'bold 12px Inter, monospace';
  const wMetrics = ctx.measureText(wText);
  const wTagW = wMetrics.width + 16;
  const wTagH = 22;
  const wTagX = cx - (wTagW / 2);
  const wTagY = Math.max(8, frameY - wTagH - 5);

  ctx.fillStyle = 'rgba(9, 14, 23, 0.94)';
  ctx.beginPath();
  ctx.roundRect(wTagX, wTagY, wTagW, wTagH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#00e5ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wText, cx, wTagY + (wTagH / 2));

  // 5. Height Tag at Left
  const hText = `↕ Height: ${decalH.toFixed(2)}m`;
  ctx.font = 'bold 12px Inter, monospace';
  const hMetrics = ctx.measureText(hText);
  const hTagW = hMetrics.width + 16;
  const hTagH = 22;
  const hTagX = Math.max(8, frameX - hTagW - 6);
  const hTagY = cy - (hTagH / 2);

  ctx.fillStyle = 'rgba(9, 14, 23, 0.94)';
  ctx.beginPath();
  ctx.roundRect(hTagX, hTagY, hTagW, hTagH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#00e5ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hText, hTagX + (hTagW / 2), cy);

  // 6. Aspect Ratio & Footprint Summary Tag at Bottom
  const formatName = getAspectFormatName(ratio);
  const sumText = isSquare 
    ? `📐 3D Mesh Footprint: ${decalW.toFixed(1)}m × ${decalH.toFixed(1)}m (1:1 Square • ${(decalW * decalH).toFixed(2)} m²)`
    : `📐 3D Mesh Footprint: ${decalW.toFixed(1)}m × ${decalH.toFixed(1)}m • ${formatName} (${ratio.toFixed(2)}:1 • ${(decalW * decalH).toFixed(2)} m²)`;

  ctx.font = 'bold 11px Inter, sans-serif';
  const sumMetrics = ctx.measureText(sumText);
  const sumTagW = sumMetrics.width + 18;
  const sumTagH = 24;
  const sumTagX = cx - (sumTagW / 2);
  const sumTagY = Math.min(height - sumTagH - 10, frameY + frameH + 8);

  ctx.fillStyle = 'rgba(9, 14, 23, 0.94)';
  ctx.beginPath();
  ctx.roundRect(sumTagX, sumTagY, sumTagW, sumTagH, 4);
  ctx.fill();
  ctx.strokeStyle = isSquare ? 'rgba(56, 189, 248, 0.5)' : 'rgba(0, 229, 255, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = isSquare ? '#38bdf8' : '#00e5ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sumText, cx, sumTagY + (sumTagH / 2));

  ctx.restore();
}

export function updateSimulationText() {
  const simDesc = document.getElementById('simDescText');
  if (!simDesc) return;
  if (state.appMode === 'decal') {
    simDesc.textContent = 'Simulating Decal projected on wet asphalt pavement with real-time Blinn-Phong lighting computed from Normal & Mask maps.';
  } else if (state.appMode === 'surface') {
    simDesc.textContent = 'Simulating single Terrain Surface tile with real-time Blinn-Phong lighting from Normal & Mask maps (switch to "Tiled Pattern" tab for 1×–16× repeats).';
  } else {
    simDesc.textContent = 'Simulating single Net Lane segment with real-time Blinn-Phong lighting.';
  }
}

export function setSimAspectMode(mode) {
  state.simAspectMode = mode;
  const btnMesh = document.getElementById('btnSimAspectMesh');
  const btnSquare = document.getElementById('btnSimAspectSquare');
  if (btnMesh) btnMesh.classList.toggle('active', mode === 'mesh');
  if (btnSquare) btnSquare.classList.toggle('active', mode === 'square');
  if (state.activeTab === '3d') {
    renderSimulation();
  }
}

export function toggleSimDimensions(show) {
  state.showSimDimensions = typeof show === 'boolean' ? show : !state.showSimDimensions;
  const chk = document.getElementById('toggleSimDimensions');
  if (chk) chk.checked = state.showSimDimensions;
  if (state.activeTab === '3d') {
    renderSimulation();
  }
}

export function toggleSingleAspectFrame(show) {
  state.showSingleAspectFrame = typeof show === 'boolean' ? show : !state.showSingleAspectFrame;
  const chk = document.getElementById('toggleSingleAspectFrame');
  if (chk) chk.checked = state.showSingleAspectFrame;
  if (['base', 'normal', 'mask', 'single'].includes(state.activeTab)) {
    updateSingleView();
  }
}

export function toggleGlobalAspectOverlay() {
  const current = (state.showSimDimensions !== false || state.showSingleAspectFrame !== false);
  const next = !current;
  state.showSimDimensions = next;
  state.showSingleAspectFrame = next;

  const chkSim = document.getElementById('toggleSimDimensions');
  if (chkSim) chkSim.checked = next;
  const chkSingle = document.getElementById('toggleSingleAspectFrame');
  if (chkSingle) chkSingle.checked = next;

  const btn = document.getElementById('btnToggleAspectBadge');
  if (btn) btn.classList.toggle('active', next);

  if (state.activeTab === '3d') {
    renderSimulation();
  } else if (['base', 'normal', 'mask', 'single'].includes(state.activeTab)) {
    updateSingleView();
  }
}

export function renderSimulation() {
  const { canvasBase, canvasNormal, canvasMask, canvasSim, ctxBase, ctxNormal, ctxMask, ctxSim } = getCanvases();
  if (!canvasSim || !ctxSim || !canvasBase || !canvasNormal || !canvasMask) return;

  if (!state.currentImage) {
    ctxSim.clearRect(0, 0, canvasSim.width, canvasSim.height);
    const canvasSimGrid = document.getElementById('canvasSimGrid');
    if (canvasSimGrid) {
      const ctxGrid = canvasSimGrid.getContext('2d');
      if (ctxGrid) ctxGrid.clearRect(0, 0, canvasSimGrid.width, canvasSimGrid.height);
    }
    return;
  }

  const { width: decalW, height: decalH } = getDecalDimensions();
  const ratio = decalH > 0 ? (decalW / decalH) : 1.0;
  const isDecal = (state.appMode === 'decal');
  const isMeshMode = isDecal && (state.simAspectMode !== 'square');

  let targetW = 512;
  let targetH = 512;

  if (isMeshMode) {
    if (ratio >= 1.0) {
      targetW = 512;
      targetH = Math.max(128, Math.min(512, Math.round(512 / ratio)));
    } else {
      targetH = 512;
      targetW = Math.max(128, Math.min(512, Math.round(512 * ratio)));
    }
  }

  if (canvasSim.width !== targetW || canvasSim.height !== targetH) {
    canvasSim.width = targetW;
    canvasSim.height = targetH;
  }

  const simContainer = document.getElementById('simContainer');
  if (simContainer) {
    simContainer.style.aspectRatio = `${targetW} / ${targetH}`;
  }

  // Sync aspect control buttons & badges
  const btnMesh = document.getElementById('btnSimAspectMesh');
  const btnSquare = document.getElementById('btnSimAspectSquare');
  if (btnMesh) btnMesh.classList.toggle('active', isMeshMode);
  if (btnSquare) btnSquare.classList.toggle('active', !isMeshMode);

  const simDimBadge = document.getElementById('simAspectDimensionsBadge');
  if (simDimBadge) simDimBadge.textContent = `${decalW.toFixed(1)}×${decalH.toFixed(1)}m`;

  const simRatioBadge = document.getElementById('simRatioBadge');
  if (simRatioBadge) {
    const format = getAspectFormatName(ratio);
    simRatioBadge.textContent = `${ratio.toFixed(2)} : 1 ${format.split(' ')[0]}`;
  }

  const chkSimDim = document.getElementById('toggleSimDimensions');
  if (chkSimDim) chkSimDim.checked = (state.showSimDimensions !== false);

  const w = canvasSim.width;
  const h = canvasSim.height;
  const simData = ctxSim.createImageData(w, h);
  const d = simData.data;

  const baseData = ctxBase.getImageData(0, 0, canvasBase.width, canvasBase.height).data;
  const normalData = ctxNormal.getImageData(0, 0, canvasNormal.width, canvasNormal.height).data;
  const maskData = ctxMask.getImageData(0, 0, canvasMask.width, canvasMask.height).data;

  const bW = canvasBase.width;
  const bH = canvasBase.height;

  const lx = state.lightPos.x;
  const ly = state.lightPos.y;
  const lz = state.lightPos.z;

  const vx = 0;
  const vy = 0;
  const vz = 1.0;

  let hx = lx + vx;
  let hy = ly + vy;
  let hz = lz + vz;
  const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1.0;
  hx /= hLen;
  hy /= hLen;
  hz /= hLen;

  function asphaltNoise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 16 - 8;
  }

  for (let y = 0; y < h; y++) {
    const texY = Math.min(bH - 1, Math.floor((y / h) * bH));

    for (let x = 0; x < w; x++) {
      const sIdx = (y * w + x) * 4;
      const texX = Math.min(bW - 1, Math.floor((x / w) * bW));
      const tIdx = (texY * bW + texX) * 4;

      const dR = baseData[tIdx];
      const dG = baseData[tIdx + 1];
      const dB = baseData[tIdx + 2];
      const dA = state.appMode === 'surface' ? 1.0 : (baseData[tIdx + 3] / 255.0);

      let nx = (normalData[tIdx] / 255.0) * 2.0 - 1.0;
      let ny = (normalData[tIdx + 1] / 255.0) * 2.0 - 1.0;
      let nz = (normalData[tIdx + 2] / 255.0) * 2.0 - 1.0;

      const grain = asphaltNoise(x, y);
      const roadR = Math.max(0, Math.min(255, 38 + grain));
      const roadG = Math.max(0, Math.min(255, 42 + grain));
      const roadB = Math.max(0, Math.min(255, 48 + grain));

      if (dA < 0.05 && state.appMode === 'decal') {
        nx = (asphaltNoise(x + 1, y) - asphaltNoise(x - 1, y)) * 0.04;
        ny = (asphaltNoise(x, y + 1) - asphaltNoise(x, y - 1)) * 0.04;
        nz = 1.0;
      }

      const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
      nx /= nLen;
      ny /= nLen;
      nz /= nLen;

      const metal = (maskData[tIdx] / 255.0) * dA;
      const smooth = (maskData[tIdx + 3] / 255.0) * dA;

      const NdotL = Math.max(0.15, nx * lx + ny * ly + nz * lz);
      const NdotH = Math.max(0.0, nx * hx + ny * hy + nz * hz);
      const shininessExp = Math.max(2.0, smooth * 64.0);
      const specFactor = Math.pow(NdotH, shininessExp) * (smooth * 1.5 + metal * 0.5);

      const albedoR = (dR * dA + roadR * (1.0 - dA));
      const albedoG = (dG * dA + roadG * (1.0 - dA));
      const albedoB = (dB * dA + roadB * (1.0 - dA));

      const lightColR = 255;
      const lightColG = 250;
      const lightColB = 240;

      const litR = Math.min(255, (albedoR * (0.3 + 0.7 * NdotL)) + (specFactor * lightColR));
      const litG = Math.min(255, (albedoG * (0.3 + 0.7 * NdotL)) + (specFactor * lightColG));
      const litB = Math.min(255, (albedoB * (0.3 + 0.7 * NdotL)) + (specFactor * lightColB));

      d[sIdx] = litR;
      d[sIdx + 1] = litG;
      d[sIdx + 2] = litB;
      d[sIdx + 3] = 255;
    }
  }
  ctxSim.putImageData(simData, 0, 0);

  // Overlay dimension lines & aspect ratio callouts on 3D lit surface
  if (isDecal && state.showSimDimensions !== false) {
    drawSimDimensionOverlay(ctxSim, w, h, decalW, decalH, ratio, !isMeshMode);
  }
}

function drawSimDimensionOverlay(ctx, w, h, decalW, decalH, ratio, isSquareMode) {
  ctx.save();

  const isNonSquare = Math.abs(decalW - decalH) > 0.05;
  const format = getAspectFormatName(ratio);

  if (isSquareMode && isNonSquare) {
    // In Square UV mode, show dashed box of how the 3D decal mesh projects
    let meshW = w;
    let meshH = h;
    if (ratio <= 1.0) {
      meshH = h;
      meshW = Math.max(30, Math.round(h * ratio));
    } else {
      meshW = w;
      meshH = Math.max(30, Math.round(w / ratio));
    }
    const meshX = (w - meshW) / 2;
    const meshY = (h - meshH) / 2;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(meshX, meshY, meshW, meshH);
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9.5px Inter, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`📐 3D Mesh (${decalW.toFixed(1)}m × ${decalH.toFixed(1)}m)`, meshX + meshW - 6, meshY + 6);
  }

  // 1. Top Width Dimension Line (↔ W.Wm)
  const topY = 16;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(10, topY);
  ctx.lineTo(w - 10, topY);
  ctx.stroke();

  // End ticks
  ctx.beginPath();
  ctx.moveTo(10, topY - 4); ctx.lineTo(10, topY + 4);
  ctx.moveTo(w - 10, topY - 4); ctx.lineTo(w - 10, topY + 4);
  ctx.stroke();

  drawArrowHeadSim(ctx, 10, topY, 'left');
  drawArrowHeadSim(ctx, w - 10, topY, 'right');

  // Width badge
  const wText = `↔ ${decalW.toFixed(2)}m Width`;
  ctx.font = 'bold 10px Inter, monospace';
  const wM = ctx.measureText(wText);
  const wBadgeW = wM.width + 12;
  const wBadgeH = 18;
  const wBadgeX = (w - wBadgeW) / 2;
  const wBadgeY = topY - (wBadgeH / 2);

  ctx.fillStyle = 'rgba(9, 14, 23, 0.92)';
  ctx.beginPath();
  ctx.roundRect(wBadgeX, wBadgeY, wBadgeW, wBadgeH, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wText, w / 2, topY);

  // 2. Left Height Dimension Line (↕ H.Hm)
  const leftX = 16;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(leftX, 28);
  ctx.lineTo(leftX, h - 28);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leftX - 4, 28); ctx.lineTo(leftX + 4, 28);
  ctx.moveTo(leftX - 4, h - 28); ctx.lineTo(leftX + 4, h - 28);
  ctx.stroke();

  drawArrowHeadSim(ctx, leftX, 28, 'up');
  drawArrowHeadSim(ctx, leftX, h - 28, 'down');

  // Height badge
  const hText = `↕ ${decalH.toFixed(2)}m`;
  ctx.font = 'bold 10px Inter, monospace';
  const hM = ctx.measureText(hText);
  const hBadgeW = hM.width + 10;
  const hBadgeH = 18;
  const hBadgeX = leftX - (hBadgeW / 2);

  ctx.fillStyle = 'rgba(9, 14, 23, 0.92)';
  ctx.beginPath();
  ctx.roundRect(hBadgeX, (h - hBadgeH) / 2, hBadgeW, hBadgeH, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hText, leftX, h / 2);

  // 3. Bottom-Left Aspect Ratio & Area Badge
  const badgeText = isNonSquare
    ? `📐 ${decalW.toFixed(1)}m × ${decalH.toFixed(1)}m • ${format} (${ratio.toFixed(2)}:1)`
    : `📐 ${decalW.toFixed(1)}m × ${decalH.toFixed(1)}m • 1:1 Square (${(decalW * decalH).toFixed(2)} m²)`;

  ctx.font = 'bold 9.5px Inter, sans-serif';
  const tagM = ctx.measureText(badgeText);
  const tagW = tagM.width + 14;
  const tagH = 20;
  const tagX = 10;
  const tagY = h - tagH - 10;

  ctx.fillStyle = 'rgba(9, 14, 23, 0.94)';
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 3);
  ctx.fill();
  ctx.strokeStyle = isNonSquare ? 'rgba(0, 229, 255, 0.65)' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = isNonSquare ? '#00e5ff' : '#38bdf8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, tagX + 7, tagY + (tagH / 2));

  ctx.restore();
}

function drawArrowHeadSim(ctx, x, y, dir) {
  const size = 4;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  if (dir === 'left') {
    ctx.moveTo(x + size, y - size); ctx.lineTo(x, y); ctx.lineTo(x + size, y + size);
  } else if (dir === 'right') {
    ctx.moveTo(x - size, y - size); ctx.lineTo(x, y); ctx.lineTo(x - size, y + size);
  } else if (dir === 'up') {
    ctx.moveTo(x - size, y + size); ctx.lineTo(x, y); ctx.lineTo(x + size, y + size);
  } else if (dir === 'down') {
    ctx.moveTo(x - size, y - size); ctx.lineTo(x, y); ctx.lineTo(x + size, y - size);
  }
  ctx.closePath();
  ctx.fill();
}

export function renderTiledView() {
  const { canvasBase, canvasNormal, canvasMask, canvasSim, canvasTiled, ctxTiled } = getCanvases();
  if (!canvasTiled || !ctxTiled) return;

  const size = 512;
  canvasTiled.width = size;
  canvasTiled.height = size;
  ctxTiled.clearRect(0, 0, size, size);

  if (!state.currentImage) return;

  const mapSource = document.getElementById('tiledMapSource') ? document.getElementById('tiledMapSource').value : 'base';
  let srcCanvas = canvasBase;
  let mapLabel = 'BaseColor';
  if (mapSource === 'normal') {
    srcCanvas = canvasNormal;
    mapLabel = 'Normal Map';
  } else if (mapSource === 'mask') {
    srcCanvas = canvasMask;
    mapLabel = 'Mask Map';
  } else if (mapSource === 'lit') {
    renderSimulation();
    srcCanvas = canvasSim;
    mapLabel = '3D Lit Surface';
  }

  if (!srcCanvas || srcCanvas.width === 0) return;

  const tiles = state.surfaceTiling || 4;
  const tileW = size / tiles;
  const tileH = size / tiles;

  const slider = document.getElementById('tiledSlider');
  if (slider && parseInt(slider.value, 10) !== tiles) {
    slider.value = tiles;
  }
  const totalCount = tiles * tiles;
  const sliderVal = document.getElementById('tiledSliderVal');
  if (sliderVal) {
    sliderVal.textContent = `${tiles}×`;
  }
  const gridText = document.getElementById('tiledGridCountText');
  if (gridText) {
    gridText.textContent = `${tiles}×${tiles} = ${totalCount}`;
  }
  const tabBadge = document.getElementById('tabTileBadge');
  if (tabBadge) {
    tabBadge.textContent = `${tiles}× Slider`;
  }

  const showSeams = document.getElementById('toggleTiledSeamLines')?.checked ?? true;

  for (let r = 0; r < tiles; r++) {
    for (let c = 0; c < tiles; c++) {
      ctxTiled.drawImage(srcCanvas, c * tileW, r * tileH, tileW, tileH);
    }
  }

  if (showSeams && tiles > 1) {
    ctxTiled.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctxTiled.lineWidth = 1;
    ctxTiled.setLineDash([4, 4]);

    for (let i = 1; i < tiles; i++) {
      ctxTiled.beginPath();
      ctxTiled.moveTo(i * tileW, 0);
      ctxTiled.lineTo(i * tileW, size);
      ctxTiled.stroke();

      ctxTiled.beginPath();
      ctxTiled.moveTo(0, i * tileH);
      ctxTiled.lineTo(size, i * tileH);
      ctxTiled.stroke();
    }
    ctxTiled.setLineDash([]);
  }

  const statusEl = document.getElementById('tiledStatusText');
  if (statusEl) {
    statusEl.innerHTML = `Repeating <strong>${tiles}×${tiles}</strong> (${totalCount} tiles) using <strong>${mapLabel}</strong>. Check for visible seam lines along tile edges.`;
  }
}

export function onTiledSliderInput(val) {
  const tileCount = parseInt(val, 10) || 1;
  setSurfaceTiling(tileCount);
}

export function setSurfaceTiling(tileCount) {
  state.surfaceTiling = tileCount;

  const slider = document.getElementById('tiledSlider');
  if (slider && parseInt(slider.value, 10) !== tileCount) {
    slider.value = tileCount;
  }

  const totalCount = tileCount * tileCount;
  const sliderVal = document.getElementById('tiledSliderVal');
  if (sliderVal) {
    sliderVal.textContent = `${tileCount}×`;
  }
  const gridText = document.getElementById('tiledGridCountText');
  if (gridText) {
    gridText.textContent = `${tileCount}×${tileCount} = ${totalCount}`;
  }

  const tabBadge = document.getElementById('tabTileBadge');
  if (tabBadge) {
    tabBadge.textContent = `${tileCount}× Slider`;
  }

  document.querySelectorAll('#tiledGroup .tiling-pill').forEach(btn => {
    const t = parseInt(btn.getAttribute('data-tile'), 10);
    if (t === tileCount) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (state.activeTab === 'tiled') {
    renderTiledView();
  }
}

export function stepTiling(delta) {
  const current = state.surfaceTiling || 4;
  const next = Math.max(1, Math.min(16, current + delta));
  setSurfaceTiling(next);
}

export function onSeamToggleChange() {
  if (state.activeTab === 'tiled') renderTiledView();
}

export function onTiledSeamChange() {
  if (state.activeTab === 'tiled') renderTiledView();
}

export function setPreviewScaleMode(mode) {
  state.previewScaleMode = mode;
  const container = document.getElementById('previewCanvasContainer');
  const btnFit = document.getElementById('btnScaleFit');
  const btnActual = document.getElementById('btnScaleActual');
  const btnTabFit = document.getElementById('btnTabScaleFit');
  const btnTabActual = document.getElementById('btnTabScaleActual');

  if (btnFit) btnFit.classList.toggle('active', mode === 'fit');
  if (btnActual) btnActual.classList.toggle('active', mode === 'actual');
  if (btnTabFit) btnTabFit.classList.toggle('active', mode === 'fit');
  if (btnTabActual) btnTabActual.classList.toggle('active', mode === 'actual');

  if (container) {
    if (mode === 'actual') {
      container.classList.add('scale-mode-actual');
    } else {
      container.classList.remove('scale-mode-actual');
    }
  }
}

export function initSimulationInteraction() {
  const { canvasSim } = getCanvases();
  if (!canvasSim) return;

  function updateLightFromEvent(e) {
    const rect = canvasSim.getBoundingClientRect();
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

    if (state.activeTab === '3d') {
      renderSimulation();
    }
  }

  canvasSim.addEventListener('mousemove', updateLightFromEvent);
  canvasSim.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateLightFromEvent(e);
  }, { passive: false });
  canvasSim.addEventListener('touchstart', (e) => {
    updateLightFromEvent(e);
  }, { passive: true });
}

export function scrollTabsNav(delta) {
  const tabsScrollArea = document.getElementById('tabsScrollArea') || document.querySelector('.tabs-scroll-area');
  if (!tabsScrollArea) return;
  tabsScrollArea.scrollBy({ left: delta, behavior: 'smooth' });
  setTimeout(checkTabScrollButtons, 220);
}

export function checkTabScrollButtons() {
  const tabsScrollArea = document.getElementById('tabsScrollArea') || document.querySelector('.tabs-scroll-area');
  const btnLeft = document.getElementById('tabScrollLeft');
  const btnRight = document.getElementById('tabScrollRight');
  if (!tabsScrollArea || !btnLeft || !btnRight) return;

  const hasOverflow = tabsScrollArea.scrollWidth > tabsScrollArea.clientWidth + 4;
  if (!hasOverflow) {
    btnLeft.style.display = 'none';
    btnRight.style.display = 'none';
  } else {
    btnLeft.style.display = tabsScrollArea.scrollLeft > 6 ? 'flex' : 'none';
    btnRight.style.display = (tabsScrollArea.scrollLeft < tabsScrollArea.scrollWidth - tabsScrollArea.clientWidth - 6) ? 'flex' : 'none';
  }
}

export function initTabsScroll() {
  const tabsScrollArea = document.getElementById('tabsScrollArea') || document.querySelector('.tabs-scroll-area');
  if (!tabsScrollArea) return;

  tabsScrollArea.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0 && tabsScrollArea.scrollWidth > tabsScrollArea.clientWidth) {
      e.preventDefault();
      tabsScrollArea.scrollLeft += e.deltaY;
      checkTabScrollButtons();
    }
  }, { passive: false });

  tabsScrollArea.addEventListener('scroll', checkTabScrollButtons, { passive: true });
  window.addEventListener('resize', checkTabScrollButtons);
  checkTabScrollButtons();
}

export function toggleFloatingViewportControls(forceVisible) {
  const pill = document.getElementById('floatingViewportControls');
  const toggleBtn = document.getElementById('btnToggleFloatingScale');
  if (!pill) return;

  const isCurrentlyHidden = pill.classList.contains('is-hidden') || pill.style.display === 'none';
  const shouldShow = (typeof forceVisible === 'boolean') ? forceVisible : isCurrentlyHidden;

  if (shouldShow) {
    pill.classList.remove('is-hidden');
    pill.style.display = 'flex';
    try {
      localStorage.setItem('cs2_floating_scale_bar_hidden', 'false');
    } catch (_) {}
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('title', 'Hide Floating Size & Zoom Bar');
    }
  } else {
    pill.classList.add('is-hidden');
    pill.style.display = 'none';
    try {
      localStorage.setItem('cs2_floating_scale_bar_hidden', 'true');
    } catch (_) {}
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('title', 'Show Floating Size & Zoom Bar');
    }
  }
}

export function initDraggableFloatingControls() {
  const pill = document.getElementById('floatingViewportControls');
  const handle = document.getElementById('floatingDragHandle') || pill;
  if (!pill || !handle) return;

  // Restore user visibility preference (defaults to hidden per user preference)
  try {
    const savedHidden = localStorage.getItem('cs2_floating_scale_bar_hidden');
    const shouldHide = savedHidden === null ? true : (savedHidden === 'true');
    toggleFloatingViewportControls(!shouldHide);
  } catch (_) {
    toggleFloatingViewportControls(false);
  }

  const container = pill.closest('.preview-area') || pill.parentElement;
  if (!container) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button')) return;

    isDragging = true;
    pill.classList.add('is-dragging');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const containerRect = container.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();

    initialLeft = pillRect.left - containerRect.left;
    initialTop = pillRect.top - containerRect.top;

    pill.style.right = 'auto';
    pill.style.bottom = 'auto';
    pill.style.left = `${initialLeft}px`;
    pill.style.top = `${initialTop}px`;

    document.addEventListener('mousemove', onPointerMove, { passive: false });
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    const containerRect = container.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();

    const minLeft = 8;
    const maxLeft = containerRect.width - pillRect.width - 8;
    const minTop = 44; // Below view tabs
    const maxTop = containerRect.height - pillRect.height - 8;

    const newLeft = Math.min(Math.max(initialLeft + deltaX, minLeft), Math.max(minLeft, maxLeft));
    const newTop = Math.min(Math.max(initialTop + deltaY, minTop), Math.max(minTop, maxTop));

    pill.style.left = `${newLeft}px`;
    pill.style.top = `${newTop}px`;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    pill.classList.remove('is-dragging');

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
  }

  // Double-click handle to reset to top-right default
  handle.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    pill.style.left = 'auto';
    pill.style.right = '18px';
    pill.style.top = '50px';
  });

  handle.addEventListener('mousedown', onPointerDown);
  handle.addEventListener('touchstart', onPointerDown, { passive: false });

  window.addEventListener('resize', () => {
    if (!pill.style.left || pill.style.left === 'auto') return;
    const containerRect = container.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    if (parseFloat(pill.style.left) + pillRect.width > containerRect.width - 8) {
      pill.style.left = `${Math.max(8, containerRect.width - pillRect.width - 8)}px`;
    }
    if (parseFloat(pill.style.top) + pillRect.height > containerRect.height - 8) {
      pill.style.top = `${Math.max(44, containerRect.height - pillRect.height - 8)}px`;
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTabsScroll();
      initDraggableFloatingControls();
    });
  } else {
    initTabsScroll();
    initDraggableFloatingControls();
  }
}

if (typeof window !== 'undefined') {
  window.setPreviewScaleMode = setPreviewScaleMode;
  window.toggleFloatingViewportControls = toggleFloatingViewportControls;
  window.initTabsScroll = initTabsScroll;
  window.initDraggableFloatingControls = initDraggableFloatingControls;
  window.scrollTabsNav = scrollTabsNav;
  window.checkTabScrollButtons = checkTabScrollButtons;
  window.renderSimulation = renderSimulation;
  window.updateSingleView = updateSingleView;
  window.setSimAspectMode = setSimAspectMode;
  window.toggleSimDimensions = toggleSimDimensions;
  window.toggleSingleAspectFrame = toggleSingleAspectFrame;
  window.toggleGlobalAspectOverlay = toggleGlobalAspectOverlay;
}
