// ==========================================
// Preview Area, 3D Simulation & Tiled Views
// ==========================================
import { state, getCanvases } from './state.js';

export function switchTab(tab) {
  state.activeTab = tab;

  const tabButtonMap = {
    grid: 'tabGrid',
    '3d': 'tab3d',
    tiled: 'tabTiled',
    base: 'tabBase',
    normal: 'tabNormal',
    mask: 'tabMask',
    icon: 'tabIcon',
    single: 'tabBase'
  };

  const activeBtnId = tabButtonMap[tab] || `tabBtn_${tab}`;
  document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === activeBtnId);
  });

  const vGrid = document.getElementById('viewGrid');
  const vSingle = document.getElementById('viewSingle');
  const v3d = document.getElementById('view3D') || document.getElementById('view3d');
  const vTiled = document.getElementById('viewTiled');

  const isSingleMode = ['base', 'normal', 'mask', 'icon', 'single'].includes(tab);

  if (vGrid) vGrid.style.display = tab === 'grid' ? 'grid' : 'none';
  if (vSingle) vSingle.style.display = isSingleMode ? 'block' : 'none';
  if (v3d) v3d.style.display = tab === '3d' ? 'block' : 'none';
  if (vTiled) vTiled.style.display = tab === 'tiled' ? 'block' : 'none';

  if (isSingleMode) {
    state.activeSingleMap = tab === 'single' ? 'base' : tab;
    updateSingleView();
  } else if (tab === '3d') {
    renderSimulation();
  } else if (tab === 'tiled') {
    renderTiledView();
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

  const overlayBar = document.getElementById('iconOverlayToggleBar');
  if (overlayBar) {
    if (state.activeSingleMap === 'icon') {
      overlayBar.style.display = 'flex';
      if (typeof window.syncAllBadgeCheckboxes === 'function') {
        window.syncAllBadgeCheckboxes();
      }
    } else {
      overlayBar.style.display = 'none';
    }
  }

  if (state.activeSingleMap === 'icon') {
    if (window.initBadgeCanvasInteractions) {
      window.initBadgeCanvasInteractions();
    }
  } else {
    canvasSingle.style.cursor = 'default';
  }
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

export function renderSimulation() {
  const { canvasBase, canvasNormal, canvasMask, canvasSim, ctxBase, ctxNormal, ctxMask, ctxSim } = getCanvases();
  if (!canvasSim || !ctxSim || !canvasBase || !canvasNormal || !canvasMask) return;

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
}

export function renderTiledView() {
  const { canvasBase, canvasNormal, canvasMask, canvasSim, canvasTiled, ctxTiled } = getCanvases();
  if (!canvasTiled || !ctxTiled) return;

  const size = 512;
  canvasTiled.width = size;
  canvasTiled.height = size;
  ctxTiled.clearRect(0, 0, size, size);

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

export function initSimulationInteraction() {
  const { canvasSim } = getCanvases();
  if (!canvasSim) return;

  function updateLightFromEvent(e) {
    const rect = canvasSim.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

  canvasSim.addEventListener('mousemove', (e) => {
    updateLightFromEvent(e);
  });
}
