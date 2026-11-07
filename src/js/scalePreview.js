// ==========================================
// In-Game Scale & Environment Simulation View
// Cities: Skylines II Metric & Reference Scale
// ==========================================

import { state, getCanvases, showToast } from './state.js';
import { getAspectFormatName } from './exporter.js';

// Default scale state if not initialized
if (typeof state.scaleScene === 'undefined') state.scaleScene = 'road';
if (typeof state.scaleZoom === 'undefined') state.scaleZoom = 1.0;
if (typeof state.scaleShowCar === 'undefined') state.scaleShowCar = true;
if (typeof state.scaleShowPerson === 'undefined') state.scaleShowPerson = true;
if (typeof state.scaleShowGrid === 'undefined') state.scaleShowGrid = true;
if (typeof state.scaleShowRulers === 'undefined') state.scaleShowRulers = true;
if (typeof state.scaleDecalPos === 'undefined') state.scaleDecalPos = { x: 0, y: 0 };
if (typeof state.scaleDecalHovered === 'undefined') state.scaleDecalHovered = false;

// 1 meter = 44 pixels at 1.0x baseline zoom
const BASE_PX_PER_METER = 44;

export function getDecalDimensions() {
  const wInput = document.getElementById('dimWidth');
  const hInput = document.getElementById('dimHeight');
  const dInput = document.getElementById('dimDepth');
  const width = wInput ? (parseFloat(wInput.value) || 2.0) : 2.0;
  const height = hInput ? (parseFloat(hInput.value) || 2.0) : 2.0;
  const depth = dInput ? (parseFloat(dInput.value) || 1.0) : 1.0;
  return { width, height, depth };
}

export function setScaleScene(scene) {
  state.scaleScene = scene;
  document.querySelectorAll('.scale-scene-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-scene') === scene);
  });
  state.scaleDecalPos = { x: 0, y: 0 };
  renderScaleView();
  updateScaleHUD();
}

export function setScaleZoom(zoom) {
  state.scaleZoom = parseFloat(zoom) || 1.0;
  document.querySelectorAll('.scale-zoom-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-zoom')) === state.scaleZoom);
  });
  const zoomLabel = document.getElementById('scaleZoomVal');
  if (zoomLabel) zoomLabel.textContent = `${state.scaleZoom.toFixed(1)}×`;
  renderScaleView();
}

export function toggleScaleRef(refType, forceState) {
  if (refType === 'car') {
    state.scaleShowCar = typeof forceState === 'boolean' ? forceState : !state.scaleShowCar;
    const btn = document.getElementById('scaleToggleCar');
    if (btn) btn.classList.toggle('active', state.scaleShowCar);
  } else if (refType === 'person') {
    state.scaleShowPerson = typeof forceState === 'boolean' ? forceState : !state.scaleShowPerson;
    const btn = document.getElementById('scaleTogglePerson');
    if (btn) btn.classList.toggle('active', state.scaleShowPerson);
  } else if (refType === 'grid') {
    state.scaleShowGrid = typeof forceState === 'boolean' ? forceState : !state.scaleShowGrid;
    const btn = document.getElementById('scaleToggleGrid');
    if (btn) btn.classList.toggle('active', state.scaleShowGrid);
  } else if (refType === 'rulers') {
    state.scaleShowRulers = typeof forceState === 'boolean' ? forceState : !state.scaleShowRulers;
    const btn = document.getElementById('scaleToggleRulers');
    if (btn) btn.classList.toggle('active', state.scaleShowRulers);
  } else if (refType === 'uvbox') {
    state.scaleShowUvBox = typeof forceState === 'boolean' ? forceState : !state.scaleShowUvBox;
    const btn = document.getElementById('scaleToggleUvBox');
    if (btn) btn.classList.toggle('active', state.scaleShowUvBox);
  }
  renderScaleView();
}

export function setScaleGraphicFit(mode) {
  state.scaleGraphicFit = mode;
  const btnFill = document.getElementById('btnScaleGraphicFill');
  const btnContain = document.getElementById('btnScaleGraphicContain');
  if (btnFill) btnFill.classList.toggle('active', mode === 'fill');
  if (btnContain) btnContain.classList.toggle('active', mode === 'contain');
  renderScaleView();
  showToast(mode === 'fill' 
    ? 'Graphic scaled 100% to fill decal mesh (CS2 3D mesh projection)' 
    : 'Graphic fitted preserving aspect ratio inside decal mesh');
}

export function resetScaleDecalPosition() {
  state.scaleDecalPos = { x: 0, y: 0 };
  renderScaleView();
  showToast('Decal position reset to center');
}

export function applyScaleQuickPreset(w, h, d = 1.0) {
  if (window.applyDecalDimPreset) {
    window.applyDecalDimPreset(w, h, d);
  }
  // Auto zoom out if size is huge (>= 6m)
  if (Math.max(w, h) >= 7.0 && state.scaleZoom > 0.6) {
    setScaleZoom(0.5);
  } else if (Math.max(w, h) <= 1.2 && state.scaleZoom < 1.4) {
    setScaleZoom(1.5);
  } else {
    renderScaleView();
  }
  updateScaleHUD();
}

// Main Canvas Render
export function renderScaleView() {
  const canvas = document.getElementById('canvasScale');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : 780;
  const height = rect.height > 0 ? rect.height : 520;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const { width: decalW, height: decalH } = getDecalDimensions();
  const pxPerMeter = BASE_PX_PER_METER * state.scaleZoom;
  const centerX = width / 2;
  const centerY = height / 2;

  // Clear background
  ctx.clearRect(0, 0, width, height);

  // Render environment
  if (state.scaleScene === 'road') {
    drawRoadEnvironment(ctx, width, height, centerX, centerY, pxPerMeter);
  } else if (state.scaleScene === 'wall') {
    drawWallEnvironment(ctx, width, height, centerX, centerY, pxPerMeter);
  } else {
    drawGridEnvironment(ctx, width, height, centerX, centerY, pxPerMeter);
  }

  // Calculate decal screen bounding box
  const decalPxW = decalW * pxPerMeter;
  const decalPxH = decalH * pxPerMeter;
  const decalScreenX = centerX + (state.scaleDecalPos.x * pxPerMeter) - (decalPxW / 2);
  const decalScreenY = centerY + (state.scaleDecalPos.y * pxPerMeter) - (decalPxH / 2);

  // Store for hit testing & dragging
  state._scaleDecalBounds = {
    x: decalScreenX,
    y: decalScreenY,
    w: decalPxW,
    h: decalPxH,
    centerX: decalScreenX + decalPxW / 2,
    centerY: decalScreenY + decalPxH / 2
  };

  // Render Decal Graphic
  drawDecalOnScaleCanvas(ctx, decalScreenX, decalScreenY, decalPxW, decalPxH, decalW, decalH);

  // Render Dimension Rulers & Guides
  if (state.scaleShowRulers) {
    drawDecalRulers(ctx, decalScreenX, decalScreenY, decalPxW, decalPxH, decalW, decalH);
  }

  ctx.restore();
  updateScaleHUD();
}

// -------------------------------------------------------------
// Environment 1: Road & Traffic Lane (Top-Down Street Simulation)
// -------------------------------------------------------------
function drawRoadEnvironment(ctx, width, height, cx, cy, ppm) {
  // 1. Asphalt Ground
  ctx.fillStyle = '#1c232f';
  ctx.fillRect(0, 0, width, height);

  // Asphalt procedural grain & texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 70; i++) {
    const rx = (Math.sin(i * 12.9898) * 0.5 + 0.5) * width;
    const ry = (Math.cos(i * 78.233) * 0.5 + 0.5) * height;
    ctx.fillRect(rx, ry, (i % 3) + 1, (i % 3) + 1);
  }

  // CS2 Standard Lane width: 3.2 meters
  const laneW = 3.2 * ppm;
  // Center Road Line at cx - (laneW / 2)
  const laneCenter = cx;
  const laneLeftEdge = laneCenter - laneW / 2;
  const laneRightEdge = laneCenter + laneW / 2;
  const adjacentLaneRight = laneRightEdge + laneW;

  // Sidewalk Curb on left side (e.g., at laneLeftEdge - 0.5*laneW)
  const sidewalkEdge = laneLeftEdge - (1.2 * ppm);
  if (sidewalkEdge > 0) {
    // Concrete Sidewalk
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, sidewalkEdge, height);

    // Concrete paving slabs (1m x 1m grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const slabSize = 1.0 * ppm;
    for (let y = 0; y < height; y += slabSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(sidewalkEdge, y);
      ctx.stroke();
    }

    // Concrete curb border (0.2m granite curb)
    const curbW = 0.25 * ppm;
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(sidewalkEdge - curbW, 0, curbW, height);
    ctx.fillStyle = '#718096';
    ctx.fillRect(sidewalkEdge - curbW, 0, 2, height);

    // Sidewalk Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '9px monospace';
    ctx.save();
    ctx.translate(sidewalkEdge - 14, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('SIDEWALK (2.0m)', 0, 0);
    ctx.restore();
  }

  // Road Lane Highlights & Subtle Shading
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.fillRect(laneLeftEdge, 0, laneW, height);

  // Lane White Dashed Dividers (CS2 standard lane dashes: 3m dash, 3m gap)
  const dashLength = 3.0 * ppm;
  const dashGap = 3.0 * ppm;

  // Center double yellow line or dashed white
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = Math.max(1.5, 0.12 * ppm);
  ctx.setLineDash([dashLength, dashGap]);

  // Centerline / Lane Edge lines
  ctx.beginPath();
  ctx.moveTo(laneLeftEdge, 0);
  ctx.lineTo(laneLeftEdge, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(laneRightEdge, 0);
  ctx.lineTo(laneRightEdge, height);
  ctx.stroke();

  // Second lane outer edge
  if (adjacentLaneRight < width) {
    ctx.strokeStyle = '#eab308'; // Yellow road line
    ctx.setLineDash([]);
    ctx.lineWidth = Math.max(2, 0.15 * ppm);
    ctx.beginPath();
    ctx.moveTo(adjacentLaneRight, 0);
    ctx.lineTo(adjacentLaneRight, height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Lane Width Callout (3.2m CS2 Road Lane)
  const markerY = Math.max(30, cy - (4.5 * ppm));
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(laneLeftEdge, markerY);
  ctx.lineTo(laneRightEdge, markerY);
  ctx.stroke();

  // Arrow ticks
  ctx.beginPath();
  ctx.moveTo(laneLeftEdge, markerY - 4); ctx.lineTo(laneLeftEdge, markerY + 4);
  ctx.moveTo(laneRightEdge, markerY - 4); ctx.lineTo(laneRightEdge, markerY + 4);
  ctx.stroke();

  // Lane Badge Text
  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  const laneTxt = 'CS2 TRAFFIC LANE: 3.2m';
  const tMetrics = ctx.measureText(laneTxt);
  ctx.fillRect(cx - (tMetrics.width / 2) - 6, markerY - 9, tMetrics.width + 12, 18);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.strokeRect(cx - (tMetrics.width / 2) - 6, markerY - 9, tMetrics.width + 12, 18);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(laneTxt, cx, markerY);

  // CS2 8m x 8m Zoning Cell Grid Overlay
  if (state.scaleShowGrid) {
    drawCs2ZoningCellGrid(ctx, width, height, cx, cy, ppm);
  }

  // Reference Vehicle: Passenger Car (4.5m x 1.8m)
  if (state.scaleShowCar) {
    const carX = laneRightEdge + (laneW / 2);
    const carY = cy + (0.5 * ppm);
    drawCarTopDown(ctx, carX, carY, ppm);
  }

  // Reference Pedestrian (0.5m x 0.3m footprint, 1.8m height label)
  if (state.scaleShowPerson && sidewalkEdge > 0) {
    const personX = sidewalkEdge - (0.6 * ppm);
    const personY = cy - (1.5 * ppm);
    drawPersonTopDown(ctx, personX, personY, ppm);
  }
}

// -------------------------------------------------------------
// Environment 2: Building Wall & Sidewalk (Vertical Elevation)
// -------------------------------------------------------------
function drawWallEnvironment(ctx, width, height, cx, cy, ppm) {
  const sidewalkHeight = 70;
  const groundY = height - sidewalkHeight;

  // 1. Building Wall Background (Modern architectural brick / panel cladding)
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#1f2937');
  grad.addColorStop(1, '#111827');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, groundY);

  // Architectural panels / brick seams (1m wide, 0.5m high)
  const panelW = 1.2 * ppm;
  const panelH = 0.6 * ppm;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  for (let y = groundY; y >= 0; y -= panelH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  let row = 0;
  for (let y = groundY; y >= 0; y -= panelH) {
    const offsetX = (row % 2 === 0) ? 0 : (panelW / 2);
    for (let x = offsetX; x < width; x += panelW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - panelH);
      ctx.stroke();
    }
    row++;
  }

  // 2. Sidewalk Ground Plane
  ctx.fillStyle = '#374151';
  ctx.fillRect(0, groundY, width, sidewalkHeight);

  // Ground edge / base trim
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(0, groundY, width, 4);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, groundY + 4, width, 6);

  // Sidewalk concrete flags
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  for (let x = 0; x < width; x += 1.0 * ppm) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x - 20, height);
    ctx.stroke();
  }

  // 3. Architectural Standard Doorway (0.9m width x 2.1m height)
  const doorW = 0.9 * ppm;
  const doorH = 2.1 * ppm;
  const doorX = cx - (3.4 * ppm);
  const doorY = groundY - doorH;

  if (doorX > 20) {
    // Door Frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(doorX - 3, doorY - 3, doorW + 6, doorH + 3);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(doorX, doorY, doorW, doorH);

    // Door glass / panel
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(doorX + 4, doorY + 4, doorW - 8, doorH * 0.45);
    ctx.strokeRect(doorX + 4, doorY + (doorH * 0.5), doorW - 8, doorH * 0.45);

    // Handle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(doorX + doorW - 8, doorY + (doorH * 0.52), 3, 10);

    // Door Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DOOR (2.1m × 0.9m)', doorX + doorW / 2, doorY - 8);
  }

  // 4. Reference Standing Person (1.8m Adult Human)
  if (state.scaleShowPerson) {
    const personX = cx + (3.2 * ppm);
    drawStandingPerson(ctx, personX, groundY, ppm);
  }

  // 5. Street Lamp / Post (4.5m tall)
  const lampX = Math.min(width - 40, cx + (5.5 * ppm));
  if (lampX < width - 20) {
    const lampH = 4.2 * ppm;
    const lampBaseY = groundY;
    const lampTopY = groundY - lampH;

    // Pole
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = Math.max(2, 0.08 * ppm);
    ctx.beginPath();
    ctx.moveTo(lampX, lampBaseY);
    ctx.lineTo(lampX, lampTopY);
    ctx.arc(lampX - 12, lampTopY, 12, 0, Math.PI, true);
    ctx.stroke();

    // Luminaire lamp head
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lampX - 24, lampTopY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Subtle glow cone
    const glow = ctx.createRadialGradient(lampX - 24, lampTopY, 2, lampX - 24, lampTopY, 40);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lampX - 24, lampTopY, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LAMP (4.2m)', lampX - 12, lampTopY - 10);
  }

  // Height Ruler along left border
  drawVerticalHeightRuler(ctx, 30, groundY, 4.0, ppm);
}

// -------------------------------------------------------------
// Environment 3: Metric & CS2 Zoning Grid (Precision Blueprint)
// -------------------------------------------------------------
function drawGridEnvironment(ctx, width, height, cx, cy, ppm) {
  // Dark Blueprint Background
  ctx.fillStyle = '#0a1019';
  ctx.fillRect(0, 0, width, height);

  // 0.5m Minor Grid Lines
  const minorStep = 0.5 * ppm;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;

  for (let x = cx % minorStep; x < width; x += minorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = cy % minorStep; y < height; y += minorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 1.0m Major Grid Lines
  const majorStep = 1.0 * ppm;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  for (let x = cx % majorStep; x < width; x += majorStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = cy % majorStep; y < height; y += majorStep) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 8m CS2 Zoning Cell
  drawCs2ZoningCellGrid(ctx, width, height, cx, cy, ppm);

  // Origin Axes
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
  ctx.moveTo(0, cy); ctx.lineTo(width, cy);
  ctx.stroke();

  // Metric ticks and labels on axes
  ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let m = -8; m <= 8; m += 1) {
    if (m === 0) continue;
    const tx = cx + (m * ppm);
    const ty = cy + (m * ppm);
    if (tx > 15 && tx < width - 15) {
      ctx.fillRect(tx - 0.5, cy - 3, 1, 6);
      ctx.fillText(`${m}m`, tx, cy + 5);
    }
    if (ty > 15 && ty < height - 15) {
      ctx.fillRect(cx - 3, ty - 0.5, 6, 1);
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${-m}m`, cx - 6, ty);
      ctx.restore();
    }
  }

  // Ghost car outline
  if (state.scaleShowCar) {
    drawCarTopDown(ctx, cx + (3.0 * ppm), cy + (1.0 * ppm), ppm, true);
  }

  // Ghost person outline
  if (state.scaleShowPerson) {
    drawPersonTopDown(ctx, cx - (3.0 * ppm), cy, ppm, true);
  }
}

// -------------------------------------------------------------
// CS2 Official 8m x 8m Zoning Cell Grid Box
// -------------------------------------------------------------
function drawCs2ZoningCellGrid(ctx, width, height, cx, cy, ppm) {
  const cell8m = 8.0 * ppm;
  const cellX = cx - (cell8m / 2);
  const cellY = cy - (cell8m / 2);

  // 8m cell fill tint
  ctx.fillStyle = 'rgba(0, 229, 255, 0.035)';
  ctx.fillRect(cellX, cellY, cell8m, cell8m);

  // 8m boundary line (CS2 zoning cyan)
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(cellX, cellY, cell8m, cell8m);
  ctx.setLineDash([]);

  // Corner brackets
  const bracketLen = Math.min(18, 0.6 * ppm);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#00e5ff';

  // Top-left
  ctx.beginPath();
  ctx.moveTo(cellX, cellY + bracketLen); ctx.lineTo(cellX, cellY); ctx.lineTo(cellX + bracketLen, cellY);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(cellX + cell8m - bracketLen, cellY); ctx.lineTo(cellX + cell8m, cellY); ctx.lineTo(cellX + cell8m, cellY + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cellX, cellY + cell8m - bracketLen); ctx.lineTo(cellX, cellY + cell8m); ctx.lineTo(cellX + bracketLen, cellY + cell8m);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(cellX + cell8m - bracketLen, cellY + cell8m); ctx.lineTo(cellX + cell8m, cellY + cell8m); ctx.lineTo(cellX + cell8m, cellY + cell8m - bracketLen);
  ctx.stroke();

  // Badge in corner: 1 CS2 Zoning Cell (8m × 8m)
  ctx.fillStyle = 'rgba(9, 14, 23, 0.9)';
  ctx.fillRect(cellX + 4, cellY + 4, 134, 18);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cellX + 4, cellY + 4, 134, 18);

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 9px Inter, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('CS2 CELL (8m × 8m • 64m²)', cellX + 8, cellY + 13);
}

// -------------------------------------------------------------
// Reference Object: Top-Down Passenger Car (4.5m x 1.8m)
// -------------------------------------------------------------
function drawCarTopDown(ctx, x, y, ppm, isGhost = false) {
  const carLen = 4.5 * ppm;
  const carWid = 1.8 * ppm;
  const left = x - (carWid / 2);
  const top = y - (carLen / 2);

  ctx.save();

  if (isGhost) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(left, top, carWid, carLen);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillRect(left, top, carWid, carLen);
  } else {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(left + 3, top + 4, carWid, carLen, 6);
    ctx.fill();

    // Tires (4 corners)
    ctx.fillStyle = '#0f172a';
    const tireW = 0.28 * ppm;
    const tireL = 0.65 * ppm;
    ctx.fillRect(left - 2, top + (0.7 * ppm), tireW, tireL);
    ctx.fillRect(left + carWid - tireW + 2, top + (0.7 * ppm), tireW, tireL);
    ctx.fillRect(left - 2, top + carLen - (1.35 * ppm), tireW, tireL);
    ctx.fillRect(left + carWid - tireW + 2, top + carLen - (1.35 * ppm), tireW, tireL);

    // Car Body
    const carGrad = ctx.createLinearGradient(left, top, left + carWid, top);
    carGrad.addColorStop(0, '#2563eb');
    carGrad.addColorStop(0.5, '#3b82f6');
    carGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = carGrad;
    ctx.beginPath();
    ctx.roundRect(left, top, carWid, carLen, 7);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Windshield (Front Glass)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(left + 3, top + (0.9 * ppm), carWid - 6, 0.65 * ppm, 3);
    ctx.fill();

    // Roof Panel
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(left + 4, top + (1.6 * ppm), carWid - 8, 1.5 * ppm);

    // Rear Glass
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(left + 3, top + (3.15 * ppm), carWid - 6, 0.55 * ppm, 3);
    ctx.fill();

    // Headlights (amber/white)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(left + 2, top, 0.3 * ppm, 3);
    ctx.fillRect(left + carWid - (0.3 * ppm) - 2, top, 0.3 * ppm, 3);

    // Taillights (red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(left + 2, top + carLen - 3, 0.35 * ppm, 3);
    ctx.fillRect(left + carWid - (0.35 * ppm) - 2, top + carLen - 3, 0.35 * ppm, 3);
  }

  // Car Label
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('CAR (4.5m × 1.8m)', x, top + carLen + 5);

  ctx.restore();
}

// -------------------------------------------------------------
// Reference Object: Top-Down Citizen Pedestrian (0.5m x 0.3m)
// -------------------------------------------------------------
function drawPersonTopDown(ctx, x, y, ppm, isGhost = false) {
  const rad = Math.max(4, 0.22 * ppm);
  const shoulderW = Math.max(8, 0.5 * ppm);
  const depth = Math.max(5, 0.3 * ppm);

  ctx.save();

  if (isGhost) {
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(x - shoulderW / 2, y - depth / 2, shoulderW, depth);
    ctx.setLineDash([]);
  } else {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 2, shoulderW / 2, depth / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoulders / Torso
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(x, y, shoulderW / 2, depth / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = '#34d399';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('CITIZEN (1.8m)', x, y - depth - 3);

  ctx.restore();
}

// -------------------------------------------------------------
// Reference Object: Standing Person Silhouette (Elevation View, 1.8m)
// -------------------------------------------------------------
function drawStandingPerson(ctx, x, groundY, ppm) {
  const h = 1.8 * ppm;
  const topY = groundY - h;

  ctx.save();

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, groundY, 0.35 * ppm, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Citizen Silhouette
  ctx.fillStyle = '#10b981';

  // Head
  const headR = 0.12 * ppm;
  ctx.beginPath();
  ctx.arc(x, topY + headR, headR, 0, Math.PI * 2);
  ctx.fill();

  // Neck & Torso
  const neckY = topY + (headR * 2);
  const torsoH = 0.65 * ppm;
  const shoulderW = 0.42 * ppm;
  ctx.beginPath();
  ctx.roundRect(x - shoulderW / 2, neckY, shoulderW, torsoH, 4);
  ctx.fill();

  // Legs
  const legW = 0.14 * ppm;
  const legH = 0.85 * ppm;
  const legY = neckY + torsoH;
  // Left leg
  ctx.fillRect(x - (shoulderW / 2) + 1, legY, legW, legH);
  // Right leg
  ctx.fillRect(x + (shoulderW / 2) - legW - 1, legY, legW, legH);

  // Height Callout Line beside person
  const rulerX = x + (shoulderW / 2) + 10;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rulerX, topY);
  ctx.lineTo(rulerX, groundY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rulerX - 3, topY); ctx.lineTo(rulerX + 3, topY);
  ctx.moveTo(rulerX - 3, groundY); ctx.lineTo(rulerX + 3, groundY);
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('1.8m Citizen', rulerX + 5, topY + (h / 2));

  ctx.restore();
}

// -------------------------------------------------------------
// Vertical Height Metric Ruler (Wall Elevation)
// -------------------------------------------------------------
function drawVerticalHeightRuler(ctx, x, groundY, maxMeters, ppm) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - (maxMeters * ppm));
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let m = 0; m <= maxMeters; m += 0.5) {
    const y = groundY - (m * ppm);
    const tickLen = (m % 1 === 0) ? 6 : 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + tickLen, y);
    ctx.stroke();

    if (m % 1 === 0 && m > 0) {
      ctx.fillText(`${m}m`, x - 3, y);
    }
  }
  ctx.restore();
}

// -------------------------------------------------------------
// Auto-detect non-transparent / non-letterbox content bounds
// -------------------------------------------------------------
let _boundsCache = {
  src: null,
  w: 0,
  h: 0,
  bounds: null
};

export function getImageContentBounds(source) {
  if (!source) return { x: 0, y: 0, w: 1024, h: 1024, aspect: 1.0 };

  const natW = source.naturalWidth || source.videoWidth || source.width || 1024;
  const natH = source.naturalHeight || source.videoHeight || source.height || 1024;

  if (natW <= 0 || natH <= 0) return { x: 0, y: 0, w: 1024, h: 1024, aspect: 1.0 };

  if (_boundsCache.src === source && _boundsCache.w === natW && _boundsCache.h === natH && _boundsCache.bounds) {
    return _boundsCache.bounds;
  }

  // Create an offscreen canvas for fast pixel sampling (max 256px wide)
  const sampleW = 256;
  const sampleH = Math.max(1, Math.round(256 * (natH / natW)));

  const offscreen = document.createElement('canvas');
  offscreen.width = sampleW;
  offscreen.height = sampleH;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    const fallback = { x: 0, y: 0, w: natW, h: natH, aspect: natW / natH };
    _boundsCache = { src: source, w: natW, h: natH, bounds: fallback };
    return fallback;
  }

  ctx.drawImage(source, 0, 0, sampleW, sampleH);

  try {
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    let minX = sampleW, maxX = -1, minY = sampleH, maxY = -1;
    let hasAlphaTransparency = false;

    // Check if image contains transparent alpha pixels
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 240) {
        hasAlphaTransparency = true;
        break;
      }
    }

    // If fully opaque, check 4 corners for dark letterbox padding
    let isDarkLetterbox = false;
    let bgR = 0, bgG = 0, bgB = 0;

    if (!hasAlphaTransparency) {
      const c1 = 0;
      const c2 = (sampleW - 1) * 4;
      const c3 = ((sampleH - 1) * sampleW) * 4;
      const c4 = ((sampleH - 1) * sampleW + sampleW - 1) * 4;

      bgR = data[c1];
      bgG = data[c1 + 1];
      bgB = data[c1 + 2];

      const isC1Dark = bgR < 25 && bgG < 25 && bgB < 25;
      const isC2Dark = data[c2] < 25 && data[c2 + 1] < 25 && data[c2 + 2] < 25;
      const isC3Dark = data[c3] < 25 && data[c3 + 1] < 25 && data[c3 + 2] < 25;
      const isC4Dark = data[c4] < 25 && data[c4 + 1] < 25 && data[c4 + 2] < 25;

      if (isC1Dark && isC2Dark && isC3Dark && isC4Dark) {
        isDarkLetterbox = true;
      }
    }

    const step = 2;
    for (let y = 0; y < sampleH; y += step) {
      for (let x = 0; x < sampleW; x += step) {
        const idx = (y * sampleW + x) * 4;
        const a = data[idx + 3];
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        let isContent = false;
        if (hasAlphaTransparency) {
          isContent = a > 20;
        } else if (isDarkLetterbox) {
          // Pixel is content if noticeably brighter or different from the dark letterbox corners
          const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          isContent = diff > 25 || r > 28 || g > 28 || b > 28;
        } else {
          isContent = true;
        }

        if (isContent) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    let result;
    if (maxX <= minX || maxY <= minY || (minX <= 2 && maxX >= sampleW - 3 && minY <= 2 && maxY >= sampleH - 3)) {
      result = { x: 0, y: 0, w: natW, h: natH, aspect: natW / natH };
    } else {
      const scaleX = natW / sampleW;
      const scaleY = natH / sampleH;
      const realX = Math.round(minX * scaleX);
      const realY = Math.round(minY * scaleY);
      const realW = Math.round((maxX - minX + 1) * scaleX);
      const realH = Math.round((maxY - minY + 1) * scaleY);
      result = {
        x: realX,
        y: realY,
        w: Math.max(1, realW),
        h: Math.max(1, realH),
        aspect: realW / realH
      };
    }

    _boundsCache = { src: source, w: natW, h: natH, bounds: result };
    return result;
  } catch (e) {
    const fallback = { x: 0, y: 0, w: natW, h: natH, aspect: natW / natH };
    _boundsCache = { src: source, w: natW, h: natH, bounds: fallback };
    return fallback;
  }
}

export function getActiveGraphicAspect() {
  const { canvasBase } = getCanvases();
  const src = state.currentImage || (canvasBase && canvasBase.width > 0 ? canvasBase : null);
  if (!src) return 1.0;
  const isBaseCanvas = !state.currentImage && src === canvasBase;
  const bounds = getImageContentBounds(src);
  if (!bounds || bounds.w <= 0 || bounds.h <= 0) return 1.0;
  const isRotated90 = !isBaseCanvas && (Math.abs(state.textureRotation % 180) === 90);
  const contentW = isRotated90 ? bounds.h : bounds.w;
  const contentH = isRotated90 ? bounds.w : bounds.h;
  return contentH > 0 ? (contentW / contentH) : 1.0;
}

export function matchDecalToGraphicRatio() {
  const ratio = getActiveGraphicAspect();
  const { width, height } = getDecalDimensions();

  let newW, newH;
  if (ratio >= 1.0) {
    const baseW = Math.max(1.0, width);
    newW = parseFloat(baseW.toFixed(2));
    newH = parseFloat((baseW / ratio).toFixed(2));
  } else {
    const baseH = Math.max(1.0, height);
    newH = parseFloat(baseH.toFixed(2));
    newW = parseFloat((baseH * ratio).toFixed(2));
  }

  applyScaleQuickPreset(newW, newH, 1.0);
  const ratioStr = ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`;
  showToast(`Decal resized to ${newW}m × ${newH}m to match graphic ratio (${ratioStr})`);
}

// -------------------------------------------------------------
// Draw Decal onto Canvas at Metric Scale
// -------------------------------------------------------------
function drawDecalOnScaleCanvas(ctx, screenX, screenY, w, h, metricW, metricH) {
  const { canvasBase } = getCanvases();
  const graphicFit = state.scaleGraphicFit || 'fill';

  ctx.save();

  // 1:1 UV Texture Square vs 3D Mesh Frame Comparison (when enabled)
  if (state.scaleShowUvBox && Math.abs(metricW - metricH) > 0.05) {
    const uvBoxSize = Math.max(w, h);
    const uvX = screenX + (w - uvBoxSize) / 2;
    const uvY = screenY + (h - uvBoxSize) / 2;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(uvX, uvY, uvBoxSize, uvBoxSize);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
    ctx.fillRect(uvX, uvY, uvBoxSize, uvBoxSize);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px Inter, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('1:1 Square UV Texture (1024²)', uvX + uvBoxSize - 6, uvY + 6);
  }

  // Subtle drop shadow / projection relief
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(screenX + 2, screenY + 3, w, h, 2);
  ctx.fill();

  // Sync toolbar button states
  const btnFill = document.getElementById('btnScaleGraphicFill');
  const btnContain = document.getElementById('btnScaleGraphicContain');
  if (btnFill) btnFill.classList.toggle('active', graphicFit === 'fill');
  if (btnContain) btnContain.classList.toggle('active', graphicFit === 'contain');

  // Draw the custom decal texture with exact metric scaling
  ctx.save();
  ctx.beginPath();
  ctx.rect(screenX, screenY, w, h);
  ctx.clip();
  ctx.translate(screenX + w / 2, screenY + h / 2);

  // Determine source image and content bounds
  const src = state.currentImage || (canvasBase && canvasBase.width > 0 ? canvasBase : null);
  const isBaseCanvas = !state.currentImage && src === canvasBase;
  const srcBounds = src ? getImageContentBounds(src) : null;

  if (src && srcBounds && srcBounds.w > 0 && srcBounds.h > 0) {
    // Only apply rotation if src is state.currentImage (canvasBase already has rotation baked in)
    if (!isBaseCanvas) {
      if (state.textureRotation !== 0) {
        ctx.rotate((state.textureRotation * Math.PI) / 180);
      }
      const scaleX = state.flipH ? -1 : 1;
      const scaleY = state.flipV ? -1 : 1;
      if (state.flipH || state.flipV) {
        ctx.scale(scaleX, scaleY);
      }
    }

    // Check if texture rotation effectively swaps width and height
    const isRotated90 = !isBaseCanvas && (Math.abs(state.textureRotation % 180) === 90);
    const contentW = isRotated90 ? srcBounds.h : srcBounds.w;
    const contentH = isRotated90 ? srcBounds.w : srcBounds.h;

    if (graphicFit === 'fill') {
      // 1. FILL DECAL (STRICTLY MAINTAINS GRAPHIC ASPECT RATIO):
      // Uniformly scales the graphic so it completely covers BOTH width and height of the decal mesh
      // without distortion or stretching. Overflow is cleanly clipped by the decal boundary.
      const scale = Math.max(w / contentW, h / contentH);
      const drawW = srcBounds.w * scale;
      const drawH = srcBounds.h * scale;
      ctx.drawImage(src, srcBounds.x, srcBounds.y, srcBounds.w, srcBounds.h, -drawW / 2, -drawH / 2, drawW, drawH);
    } else if (graphicFit === 'contain') {
      // 2. CONTAIN:
      // Preserves original graphic aspect ratio centered within the decal mesh bounds without clipping
      const scale = Math.min(w / contentW, h / contentH);
      const drawW = srcBounds.w * scale;
      const drawH = srcBounds.h * scale;
      ctx.drawImage(src, srcBounds.x, srcBounds.y, srcBounds.w, srcBounds.h, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // 3. STRETCH:
      // Raw quad stretch to decal w × h
      ctx.drawImage(src, srcBounds.x, srcBounds.y, srcBounds.w, srcBounds.h, -w / 2, -h / 2, w, h);
    }
  } else {
    // Fallback if no texture loaded yet: clean styled placeholder
    ctx.fillStyle = 'rgba(0, 168, 255, 0.25)';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#00a8ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${metricW.toFixed(1)}m × ${metricH.toFixed(1)}m`, 0, 0);
  }

  ctx.restore();

  // Active hover / drag boundary outline
  const isHovered = state.scaleDecalHovered;
  ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(0, 229, 255, 0.65)';
  ctx.lineWidth = isHovered ? 2 : 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(screenX, screenY, w, h);
  ctx.setLineDash([]);

  // Corner Grab Handles (indicating drag-to-position)
  const handleSize = 5;
  ctx.fillStyle = isHovered ? '#38bdf8' : '#00e5ff';
  ctx.fillRect(screenX - handleSize / 2, screenY - handleSize / 2, handleSize, handleSize);
  ctx.fillRect(screenX + w - handleSize / 2, screenY - handleSize / 2, handleSize, handleSize);
  ctx.fillRect(screenX - handleSize / 2, screenY + h - handleSize / 2, handleSize, handleSize);
  ctx.fillRect(screenX + w - handleSize / 2, screenY + h - handleSize / 2, handleSize, handleSize);

  ctx.restore();
}

// -------------------------------------------------------------
// Draw Precision Metric Rulers on Decal
// -------------------------------------------------------------
function drawDecalRulers(ctx, x, y, w, h, metricW, metricH) {
  ctx.save();

  const rulerColor = '#38bdf8';
  const offset = 14;

  // 1. Top Width Ruler (← W.Wm →)
  const topY = y - offset;
  ctx.strokeStyle = rulerColor;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x + w, topY);
  ctx.stroke();

  // End ticks
  ctx.beginPath();
  ctx.moveTo(x, topY - 5); ctx.lineTo(x, topY + 5);
  ctx.moveTo(x + w, topY - 5); ctx.lineTo(x + w, topY + 5);
  ctx.stroke();

  // Arrowheads
  drawArrowHead(ctx, x, topY, 'left');
  drawArrowHead(ctx, x + w, topY, 'right');

  // Width Label Badge
  const wText = `W: ${metricW.toFixed(2)}m`;
  ctx.font = 'bold 10px Inter, monospace';
  const wMetrics = ctx.measureText(wText);
  const badgeW = wMetrics.width + 10;
  const badgeH = 16;
  const badgeX = x + (w / 2) - (badgeW / 2);
  const badgeY = topY - (badgeH / 2);

  ctx.fillStyle = 'rgba(10, 16, 26, 0.95)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wText, x + (w / 2), topY);

  // 2. Left Height Ruler (↕ H.Hm)
  const leftX = x - offset;
  ctx.strokeStyle = rulerColor;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(leftX, y);
  ctx.lineTo(leftX, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leftX - 5, y); ctx.lineTo(leftX + 5, y);
  ctx.moveTo(leftX - 5, y + h); ctx.lineTo(leftX + 5, y + h);
  ctx.stroke();

  drawArrowHead(ctx, leftX, y, 'up');
  drawArrowHead(ctx, leftX, y + h, 'down');

  // Height Label Badge
  const hText = `H: ${metricH.toFixed(2)}m`;
  const hMetrics = ctx.measureText(hText);
  const hBadgeW = hMetrics.width + 10;
  const hBadgeH = 16;
  const hBadgeX = leftX - (hBadgeW / 2);
  const hBadgeY = y + (h / 2) - (hBadgeH / 2);

  ctx.fillStyle = 'rgba(10, 16, 26, 0.95)';
  ctx.beginPath();
  ctx.roundRect(hBadgeX, hBadgeY, hBadgeW, hBadgeH, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hText, leftX, y + (h / 2));

  // 3. Aspect Ratio & Size Pill Badge (centered below decal)
  const ratio = metricH > 0 ? (metricW / metricH) : 1.0;
  const format = getAspectFormatName(ratio);
  const isNonSquare = Math.abs(metricW - metricH) > 0.05;
  const ratioTag = isNonSquare 
    ? `📐 ${metricW.toFixed(1)}m × ${metricH.toFixed(1)}m • ${format} (${ratio.toFixed(2)}:1)` 
    : `📐 ${metricW.toFixed(1)}m × ${metricH.toFixed(1)}m • 1:1 Square`;

  ctx.font = 'bold 9.5px Inter, sans-serif';
  const tagM = ctx.measureText(ratioTag);
  const tagW = tagM.width + 14;
  const tagH = 18;
  const tagX = x + (w / 2) - (tagW / 2);
  const tagY = y + h + offset - 2;

  ctx.fillStyle = 'rgba(9, 14, 23, 0.95)';
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 3);
  ctx.fill();
  ctx.strokeStyle = isNonSquare ? 'rgba(0, 229, 255, 0.55)' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = isNonSquare ? '#00e5ff' : '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ratioTag, x + (w / 2), tagY + (tagH / 2));

  ctx.restore();
}

function drawArrowHead(ctx, x, y, dir) {
  const size = 4;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  if (dir === 'left') {
    ctx.moveTo(x, y); ctx.lineTo(x + size + 2, y - size); ctx.lineTo(x + size + 2, y + size);
  } else if (dir === 'right') {
    ctx.moveTo(x, y); ctx.lineTo(x - size - 2, y - size); ctx.lineTo(x - size - 2, y + size);
  } else if (dir === 'up') {
    ctx.moveTo(x, y); ctx.lineTo(x - size, y + size + 2); ctx.lineTo(x + size, y + size + 2);
  } else if (dir === 'down') {
    ctx.moveTo(x, y); ctx.lineTo(x - size, y - size - 2); ctx.lineTo(x + size, y - size - 2);
  }
  ctx.closePath();
  ctx.fill();
}

// -------------------------------------------------------------
// Update HUD Analytics Readouts & Sidebar Badges
// -------------------------------------------------------------
export function updateScaleHUD() {
  const { width, height, depth } = getDecalDimensions();
  const area = (width * height).toFixed(2);
  const ratio = height > 0 ? (width / height) : 1.0;

  // Header tab badge
  const tabBadge = document.getElementById('tabScaleBadge');
  if (tabBadge) {
    if (Math.abs(width - height) < 0.05) {
      tabBadge.textContent = `${width.toFixed(1)}m`;
    } else {
      tabBadge.textContent = `${width.toFixed(1)}×${height.toFixed(1)}m`;
    }
  }

  // HUD Readouts inside Scale View
  const hudDim = document.getElementById('scaleHudDimensions');
  if (hudDim) hudDim.textContent = `${width.toFixed(1)}m × ${height.toFixed(1)}m (${area} m²)`;

  const hudCell = document.getElementById('scaleHudCellPct');
  if (hudCell) {
    const wPct = Math.round((width / 8.0) * 100);
    const hPct = Math.round((height / 8.0) * 100);
    const aPct = (((width * height) / 64.0) * 100).toFixed(1);
    hudCell.textContent = `${wPct}% W × ${hPct}% H (${aPct}% cell area)`;
  }

  const hudLane = document.getElementById('scaleHudLaneRef');
  if (hudLane) {
    const laneRatio = (width / 3.2).toFixed(1);
    if (width <= 1.0) {
      hudLane.textContent = `~${laneRatio}× lane (compact sub-marking)`;
    } else if (width <= 3.2) {
      const clearance = ((3.2 - width) / 2).toFixed(1);
      hudLane.textContent = `~${laneRatio}× lane (fits inside 1 lane • ${clearance}m clearance each side)`;
    } else {
      const lanes = (width / 3.2).toFixed(1);
      hudLane.textContent = `~${laneRatio}× lane (spans across ~${lanes} traffic lanes)`;
    }
  }

  const hudPerson = document.getElementById('scaleHudPersonRef');
  if (hudPerson) {
    const hRatio = (height / 1.8).toFixed(1);
    hudPerson.textContent = `~${hRatio}× human height (1.8m citizen)`;
  }

  const hudPos = document.getElementById('scaleHudDecalPos');
  if (hudPos) {
    const x = state.scaleDecalPos.x.toFixed(1);
    const y = state.scaleDecalPos.y.toFixed(1);
    if (parseFloat(x) === 0 && parseFloat(y) === 0) {
      hudPos.textContent = 'Center (0.0m, 0.0m)';
    } else {
      hudPos.textContent = `X: ${x >= 0 ? '+' : ''}${x}m, Y: ${y >= 0 ? '+' : ''}${y}m`;
    }
  }

  const descEl = document.getElementById('scaleArchetypeDesc');
  if (descEl) {
    const maxDim = Math.max(width, height);
    if (Math.abs(ratio - (2 / 3)) < 0.06 || Math.abs(ratio - (3 / 4)) < 0.06) {
      descEl.textContent = '🖼️ Standard Vertical Poster / Advert (Kiosk, bus shelter ad, or building wall print)';
    } else if (Math.abs(ratio - (16 / 9)) < 0.1 || Math.abs(ratio - 2.0) < 0.1) {
      descEl.textContent = '📺 Widescreen Billboard / Transit Sign (Roadside, rooftop, or bridge sign)';
    } else if (maxDim <= 0.9) {
      descEl.textContent = '🕳️ Small urban detail (Standard 0.8m manhole cover, drain grate, small asphalt patch)';
    } else if (maxDim <= 1.8) {
      descEl.textContent = '🚶 Pedestrian / Street marking (Sidewalk icon, bike lane symbol, stop line word)';
    } else if (maxDim <= 3.2) {
      descEl.textContent = '🚗 Standard vehicle / single-lane decal (Fits comfortably inside 1 CS2 traffic lane)';
    } else if (maxDim <= 5.0) {
      descEl.textContent = '🚙 Road directional marking / Vehicle footprint (Standard turn arrow or car space)';
    } else if (maxDim <= 8.5) {
      descEl.textContent = '🏢 Large surface marking (Spans full 8m Cities: Skylines II zoning lot)';
    } else {
      descEl.textContent = '🗺️ Multi-cell mega decal (Covers multiple 8m zoning blocks)';
    }
  }

  // Update Match Graphic preset button label with active graphic's ratio
  const matchRatioText = document.getElementById('scaleMatchGraphicRatioText');
  if (matchRatioText) {
    const gRatio = getActiveGraphicAspect();
    const gFormat = getAspectFormatName(gRatio);
    matchRatioText.textContent = `${gFormat} (${gRatio.toFixed(2)}:1)`;
  }
}

// -------------------------------------------------------------
// Interactive Canvas Pointer & Drag Handlers
// -------------------------------------------------------------
let isInteractionsInited = false;

export function initScaleViewInteractions() {
  if (isInteractionsInited) return;
  const canvas = document.getElementById('canvasScale');
  if (!canvas) return;
  isInteractionsInited = true;

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialDecalX = 0;
  let initialDecalY = 0;

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function isOverDecal(pt) {
    const bounds = state._scaleDecalBounds;
    if (!bounds) return false;
    const hitPadding = 12;
    return (
      pt.x >= bounds.x - hitPadding &&
      pt.x <= bounds.x + bounds.w + hitPadding &&
      pt.y >= bounds.y - hitPadding &&
      pt.y <= bounds.y + bounds.h + hitPadding
    );
  }

  canvas.addEventListener('pointerdown', (e) => {
    const pt = getCanvasCoords(e);
    if (isOverDecal(pt)) {
      isDragging = true;
      state.scaleIsDragging = true;
      dragStartX = pt.x;
      dragStartY = pt.y;
      initialDecalX = state.scaleDecalPos.x;
      initialDecalY = state.scaleDecalPos.y;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const pt = getCanvasCoords(e);
    const ppm = BASE_PX_PER_METER * state.scaleZoom;

    if (isDragging) {
      const dxPx = pt.x - dragStartX;
      const dyPx = pt.y - dragStartY;
      state.scaleDecalPos.x = parseFloat((initialDecalX + (dxPx / ppm)).toFixed(2));
      state.scaleDecalPos.y = parseFloat((initialDecalY + (dyPx / ppm)).toFixed(2));
      renderScaleView();
    } else {
      const hovered = isOverDecal(pt);
      if (state.scaleDecalHovered !== hovered) {
        state.scaleDecalHovered = hovered;
        canvas.style.cursor = hovered ? 'grab' : 'default';
        renderScaleView();
      }
    }
  });

  function stopDrag(e) {
    if (isDragging) {
      isDragging = false;
      state.scaleIsDragging = false;
      canvas.style.cursor = state.scaleDecalHovered ? 'grab' : 'default';
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      updateScaleHUD();
    }
  }

  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);

  // Double click to recenter
  canvas.addEventListener('dblclick', (e) => {
    resetScaleDecalPosition();
  });

  // Wheel to zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const currentZoom = state.scaleZoom || 1.0;
    const newZoom = Math.max(0.4, Math.min(2.5, parseFloat((currentZoom + delta).toFixed(1))));
    setScaleZoom(newZoom);
  }, { passive: false });
}

// Window bindings for inline HTML handlers
if (typeof window !== 'undefined') {
  window.setScaleScene = setScaleScene;
  window.setScaleZoom = setScaleZoom;
  window.toggleScaleRef = toggleScaleRef;
  window.resetScaleDecalPosition = resetScaleDecalPosition;
  window.applyScaleQuickPreset = applyScaleQuickPreset;
  window.renderScaleView = renderScaleView;
  window.initScaleViewInteractions = initScaleViewInteractions;
  window.updateScaleHUD = updateScaleHUD;
  window.setScaleGraphicFit = setScaleGraphicFit;
  window.matchDecalToGraphicRatio = matchDecalToGraphicRatio;
  window.getActiveGraphicAspect = getActiveGraphicAspect;
  window.getImageContentBounds = getImageContentBounds;
}
