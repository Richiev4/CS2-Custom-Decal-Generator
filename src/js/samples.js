// ==========================================
// Procedural Sample Presets for Decals, Surfaces & Net Lanes
// ==========================================
import { state, showToast, hasActiveWork, openUnsavedModal } from './state.js';
import { clearCustomNormal } from './normalMap.js';
import { setTextureRotation, toggleFlipHorizontal, toggleFlipVertical } from './state.js';
import { setAssetCategory, setAssetSeriesName, getAssetSeriesName, updateConfigJson, onUvScaleChange, onNetlaneParamChange, renderSeriesRibbon } from './exporter.js';
import { onBumpChange } from './normalMap.js';
import { onMetalChange, onSmoothChange } from './maskMap.js';

export function getPresetMode(type) {
  if (['cobblestone', 'bricks', 'tiles'].includes(type)) return 'surface';
  if (['centerline', 'yellowlines', 'curb'].includes(type)) return 'netlane';
  return 'decal';
}

export function loadSample(type, force = false) {
  const targetMode = getPresetMode(type);
  if (state.appMode !== targetMode && window.setMode) {
    window.setMode(targetMode, true);
  }

  clearCustomNormal(false);
  if (document.getElementById('flipNormalY')) document.getElementById('flipNormalY').checked = false;
  setTextureRotation(0);
  if (state.flipH) toggleFlipHorizontal();
  if (state.flipV) toggleFlipVertical();
  state.originalNameBeforeTransform = '';
  state.isReminderDismissed = false;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 1024);

  if (type === 'manhole') {
    document.getElementById('assetName').value = 'CityUtility_Manhole_01';
    setAssetCategory('Utilities');
    setAssetSeriesName('');
    document.getElementById('dimWidth').value = '1.8';
    document.getElementById('dimHeight').value = '1.8';
    document.getElementById('dimDepth').value = '0.5';
    document.getElementById('bumpIntensity').value = '3.5';
    document.getElementById('metallic').value = '180';
    document.getElementById('smoothness').value = '80';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = true;
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    const cx = 512, cy = 512, r = 440;
    ctx.fillStyle = '#22252a';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#40454d';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (r - 25), cy + Math.sin(a) * (r - 25), 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#17191d';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#383d46';
    ctx.lineWidth = 14;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 65, 0, Math.PI * 2);
    ctx.clip();

    for (let i = -600; i < 1600; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 1024, 1024);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i + 1024, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();
    }

    ctx.fillStyle = '#23272e';
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#474d57';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = '#d1d5db';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CS2 SEWER', cx, cy - 20);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('COLOSSAL WATER', cx, cy + 25);
    ctx.restore();

  } else if (type === 'arrow') {
    document.getElementById('assetName').value = 'RoadMarking_TurnArrow_01';
    setAssetCategory('RoadMarkings');
    setAssetSeriesName('');
    document.getElementById('dimWidth').value = '3.0';
    document.getElementById('dimHeight').value = '6.0';
    document.getElementById('dimDepth').value = '0.5';
    document.getElementById('bumpIntensity').value = '2.2';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '25';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = true;
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(512, 120);
    ctx.lineTo(760, 420);
    ctx.lineTo(600, 420);
    ctx.lineTo(600, 880);
    ctx.lineTo(424, 880);
    ctx.lineTo(424, 420);
    ctx.lineTo(264, 420);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(230, 230, 230, 0.4)';
    for (let i = 0; i < 400; i++) {
      const rx = 350 + Math.random() * 324;
      const ry = 200 + Math.random() * 650;
      ctx.fillRect(rx, ry, Math.random() * 6 + 2, Math.random() * 6 + 2);
    }

  } else if (type === 'poster') {
    document.getElementById('assetName').value = 'CityPoster_MetroTransit_01';
    setAssetCategory('Posters');
    setAssetSeriesName('');
    document.getElementById('dimWidth').value = '1.2';
    document.getElementById('dimHeight').value = '1.8';
    document.getElementById('dimDepth').value = '0.2';
    document.getElementById('bumpIntensity').value = '1.8';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '35';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = true;

    state.decalAspectLocked = true;
    state.decalLockedRatio = 1.2 / 1.8;

    const fitSelect = document.getElementById('fitStrategy');
    if (fitSelect) fitSelect.value = 'contain';

    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    // Draw high-detail 2:3 vertical retro-modern transit poster (640x960 inside 1024x1024)
    const pw = 640;
    const ph = 960;
    const px = Math.round((1024 - pw) / 2);
    const py = Math.round((1024 - ph) / 2);

    // Outer vintage cream paper margin
    ctx.fillStyle = '#f5f0e8';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 6);
    ctx.fill();

    // Dark vintage border line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner poster artwork area
    const m = 22;
    const ax = px + m;
    const ay = py + m;
    const aw = pw - m * 2;
    const ah = ph - m * 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ax, ay, aw, ah);
    ctx.clip();

    // Gradient background: deep midnight navy to cobalt glow
    const bgGrad = ctx.createLinearGradient(ax, ay, ax, ay + ah);
    bgGrad.addColorStop(0, '#0a1128');
    bgGrad.addColorStop(0.5, '#001f54');
    bgGrad.addColorStop(0.85, '#034078');
    bgGrad.addColorStop(1, '#1282a2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(ax, ay, aw, ah);

    // Stylized sun/geometric circle
    const sunGrad = ctx.createRadialGradient(ax + aw / 2, ay + ah * 0.42, 10, ax + aw / 2, ay + ah * 0.42, 180);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#f59e0b');
    sunGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(ax + aw / 2, ay + ah * 0.42, 180, 0, Math.PI * 2);
    ctx.fill();

    // Stylized mountain / city silhouette
    ctx.fillStyle = '#061325';
    ctx.beginPath();
    ctx.moveTo(ax, ay + ah * 0.65);
    ctx.lineTo(ax + aw * 0.25, ay + ah * 0.48);
    ctx.lineTo(ax + aw * 0.5, ay + ah * 0.58);
    ctx.lineTo(ax + aw * 0.75, ay + ah * 0.45);
    ctx.lineTo(ax + aw, ay + ah * 0.62);
    ctx.lineTo(ax + aw, ay + ah);
    ctx.lineTo(ax, ay + ah);
    ctx.closePath();
    ctx.fill();

    // Modern glowing transit lines
    const lineColors = ['#00e5ff', '#10b981', '#f59e0b'];
    lineColors.forEach((col, idx) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const yOffset = ay + ah * (0.68 + idx * 0.05);
      ctx.moveTo(ax + 20, yOffset + 30);
      ctx.bezierCurveTo(
        ax + aw * 0.3, yOffset - 30,
        ax + aw * 0.7, yOffset + 40,
        ax + aw - 20, yOffset - 10
      );
      ctx.stroke();

      // Station dots
      [0.25, 0.5, 0.75].forEach(t => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const dotX = ax + 20 + (aw - 40) * t;
        const dotY = yOffset + (idx === 1 ? 5 : (idx === 0 ? -10 : 15));
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0a1128';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
    });

    // Top Typography Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('METRO TRANSIT', ax + aw / 2, ay + 65);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 16px "Montserrat", sans-serif';
    ctx.fillText('CITY OF TOMORROW • RAPID RAILWAY', ax + aw / 2, ay + 95);

    // Decorative divider line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax + aw * 0.2, ay + 115);
    ctx.lineTo(ax + aw * 0.8, ay + 115);
    ctx.stroke();

    // Bottom Typography Block
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Montserrat", sans-serif';
    ctx.fillText('CONNECTING EVERY DISTRICT', ax + aw / 2, ay + ah - 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px monospace';
    ctx.fillText('CITIES: SKYLINES II • LINE 01 TO 08', ax + aw / 2, ay + ah - 32);

    ctx.restore();

  } else if (type === 'crack') {
    document.getElementById('assetName').value = 'RoadDamage_AsphaltFissure_01';
    setAssetCategory('Cracks');
    setAssetSeriesName('');
    document.getElementById('dimWidth').value = '4.0';
    document.getElementById('dimHeight').value = '4.0';
    document.getElementById('dimDepth').value = '0.8';
    document.getElementById('bumpIntensity').value = '4.0';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '10';
    document.getElementById('invertBump').checked = true;
    document.getElementById('maskWithDecalAlpha').checked = true;
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.strokeStyle = '#080a0e';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(220, 180);
    ctx.lineTo(340, 310);
    ctx.lineTo(410, 450);
    ctx.lineTo(540, 520);
    ctx.lineTo(620, 680);
    ctx.lineTo(780, 810);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(410, 450);
    ctx.lineTo(310, 580);
    ctx.lineTo(240, 690);
    ctx.moveTo(540, 520);
    ctx.lineTo(680, 480);
    ctx.lineTo(790, 420);
    ctx.moveTo(340, 310);
    ctx.lineTo(230, 330);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1a1f26';
    ctx.beginPath();
    ctx.moveTo(620, 680);
    ctx.lineTo(580, 810);
    ctx.moveTo(310, 580);
    ctx.lineTo(380, 710);
    ctx.stroke();

  } else if (type === 'cobblestone') {
    document.getElementById('assetName').value = 'Pavement_OldCobblestone_01';
    setAssetCategory('Tiles');
    document.getElementById('uvScaleSlider').value = '1.0';
    document.getElementById('bumpIntensity').value = '3.2';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '35';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = false;
    onUvScaleChange();
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#2e333d';
    ctx.fillRect(0, 0, 1024, 1024);

    const cols = 8;
    const rows = 8;
    const stoneW = 1024 / cols;
    const stoneH = 1024 / rows;

    for (let r = 0; r < rows; r++) {
      const rowOffset = (r % 2) * (stoneW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * stoneW + rowOffset;
        const y = r * stoneH;
        const grayVal = 110 + ((r * 17 + c * 31) % 55);
        ctx.fillStyle = `rgb(${grayVal}, ${grayVal + 4}, ${grayVal + 8})`;
        const pad = 6;
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, stoneW - pad * 2, stoneH - pad * 2, 8);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

  } else if (type === 'bricks') {
    document.getElementById('assetName').value = 'Pavement_RedBricks_01';
    setAssetCategory('Pavement');
    document.getElementById('uvScaleSlider').value = '1.2';
    document.getElementById('bumpIntensity').value = '2.8';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '20';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = false;
    onUvScaleChange();
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#3a3430';
    ctx.fillRect(0, 0, 1024, 1024);

    const bCols = 8;
    const bRows = 16;
    const bw = 1024 / bCols;
    const bh = 1024 / bRows;

    for (let r = 0; r < bRows; r++) {
      const shift = (r % 2) * (bw * 0.5);
      for (let c = -1; c <= bCols; c++) {
        const x = c * bw + shift;
        const y = r * bh;
        const seed = (r * 23 + c * 37) % 35;
        const red = 160 + seed;
        const green = 70 + (seed * 0.6);
        const blue = 55 + (seed * 0.4);

        ctx.fillStyle = `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
        ctx.fillRect(x + 4, y + 4, bw - 8, bh - 8);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(x + 4, y + bh - 6, bw - 8, 2);
      }
    }

  } else if (type === 'tiles') {
    document.getElementById('assetName').value = 'Plaza_GraniteTiles_01';
    setAssetCategory('Pavement');
    document.getElementById('uvScaleSlider').value = '1.0';
    document.getElementById('bumpIntensity').value = '2.0';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '55';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = false;
    onUvScaleChange();
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#1f242b';
    ctx.fillRect(0, 0, 1024, 1024);

    const tSize = 1024 / 4;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const x = c * tSize;
        const y = r * tSize;
        const shade = 180 + ((r + c) % 2) * 20;
        ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 4})`;
        ctx.fillRect(x + 3, y + 3, tSize - 6, tSize - 6);

        for (let f = 0; f < 100; f++) {
          ctx.fillStyle = (f % 2 === 0) ? 'rgba(40,40,40,0.1)' : 'rgba(255,255,255,0.15)';
          ctx.fillRect(x + 5 + Math.random() * (tSize - 10), y + 5 + Math.random() * (tSize - 10), 3, 3);
        }
      }
    }

  } else if (type === 'centerline') {
    document.getElementById('assetName').value = 'NetLane_WhiteDashed_01';
    setAssetCategory('Lines');
    document.getElementById('netlaneWidthSlider').value = '0.4';
    document.getElementById('netlaneLengthSlider').value = '3.0';
    document.getElementById('bumpIntensity').value = '2.0';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '25';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = true;
    onNetlaneParamChange();
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(412, 128, 200, 768);

    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(412 + Math.random() * 200, 128 + Math.random() * 768, 3, 3);
    }

  } else if (type === 'yellowlines') {
    document.getElementById('assetName').value = 'NetLane_DoubleYellow_01';
    setAssetCategory('Lines');
    document.getElementById('netlaneWidthSlider').value = '0.6';
    document.getElementById('netlaneLengthSlider').value = '2.0';
    document.getElementById('bumpIntensity').value = '2.2';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '25';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = true;
    onNetlaneParamChange();
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(360, 0, 110, 1024);
    ctx.fillRect(554, 0, 110, 1024);

    ctx.fillStyle = 'rgba(255, 230, 150, 0.3)';
    for (let i = 0; i < 250; i++) {
      const rx = (Math.random() < 0.5 ? 360 : 554) + Math.random() * 110;
      ctx.fillRect(rx, Math.random() * 1024, 3, 3);
    }

  } else if (type === 'curb') {
    document.getElementById('assetName').value = 'NetLane_GraniteCurb_01';
    setAssetCategory('Curbs');
    document.getElementById('netlaneWidthSlider').value = '0.5';
    document.getElementById('netlaneLengthSlider').value = '1.5';
    document.getElementById('bumpIntensity').value = '3.5';
    document.getElementById('metallic').value = '0';
    document.getElementById('smoothness').value = '20';
    document.getElementById('invertBump').checked = false;
    document.getElementById('maskWithDecalAlpha').checked = false;
    onNetlaneParamChange();
    onBumpChange();
    onMetalChange();
    onSmoothChange();
    updateConfigJson();

    ctx.fillStyle = '#8c939e';
    ctx.fillRect(0, 0, 560, 1024);

    ctx.fillStyle = '#d5dae2';
    ctx.fillRect(560, 0, 48, 1024);

    ctx.fillStyle = '#4c525c';
    ctx.fillRect(608, 0, 416, 1024);

    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 4, 4);
    }
  }

  const img = new Image();
  img.onload = () => {
    state.currentImage = img;
    state.isCustomImageLoaded = false;
    state.hasUnsavedChanges = false;
    state.sourceFileName = `${type}_preset.png`;
    state.sourceFileType = 'PNG (Generated Preset)';
    state.sourceKind = 'preset';
    state.currentLoadedAssetName = document.getElementById('assetName').value;
    state.currentLoadedAssetSeries = getAssetSeriesName();
    if (state.decalAspectLocked) {
      const w = parseFloat(document.getElementById('dimWidth')?.value || '2.0') || 2.0;
      const h = parseFloat(document.getElementById('dimHeight')?.value || '2.0') || 2.0;
      state.decalLockedRatio = h > 0 ? (w / h) : 1.0;
    }

    // Save to active slot in Set
    if (state.setSlots && state.setSlots[state.appMode]) {
      const slot = state.setSlots[state.appMode];
      slot.image = img;
      slot.isCustomImageLoaded = false;
      slot.hasUnsavedChanges = false;
      slot.fileName = state.sourceFileName;
      slot.sourceFileType = state.sourceFileType;
      slot.sourceKind = 'preset';
      slot.assetName = state.currentLoadedAssetName;
      slot.category = document.getElementById('assetCategory')?.value || slot.category;
      slot.seriesName = state.currentLoadedAssetSeries;
      try {
        const tc = document.createElement('canvas');
        tc.width = 64;
        tc.height = 64;
        const tctx = tc.getContext('2d');
        tctx.drawImage(img, 0, 0, 64, 64);
        slot.thumbnail = tc.toDataURL('image/png');
      } catch (_) {}
    }

    if (window.updateDecalAspectUI) window.updateDecalAspectUI();
    if (window.renderAllMaps) window.renderAllMaps();
    if (window.updateSetSlotsUI) window.updateSetSlotsUI();
    renderSeriesRibbon();
    showToast(`Loaded ${type} preset into ${state.appMode.toUpperCase()} slot`);
  };
  img.src = canvas.toDataURL('image/png');
}

export function createSampleSlot(type) {
  const mode = getPresetMode(type);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 1024);

  let assetName = 'CustomAsset_01';
  let category = 'Utilities';
  let seriesName = '';
  let bump = 2.5;
  let metal = 0;
  let smooth = 40;
  let dims = { width: 1.8, height: 1.8, depth: 0.5, aspectLocked: false, lockedRatio: 1.0 };
  let uvScale = 1.0;
  let netlane = { width: 1.0, length: 2.0 };
  let fitStrategy = mode === 'surface' ? 'stretch' : 'fill';

  if (type === 'manhole') {
    assetName = 'CityUtility_Manhole_01';
    category = 'Utilities';
    bump = 3.5;
    metal = 180;
    smooth = 80;
    dims = { width: 1.8, height: 1.8, depth: 0.5, aspectLocked: false, lockedRatio: 1.0 };
    const cx = 512, cy = 512, r = 440;
    ctx.fillStyle = '#22252a';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40454d';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (r - 25), cy + Math.sin(a) * (r - 25), 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#17191d';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#383d46';
    ctx.lineWidth = 14;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 65, 0, Math.PI * 2);
    ctx.clip();
    for (let i = -600; i < 1600; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 1024, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + 1024, 0); ctx.lineTo(i, 1024); ctx.stroke();
    }
    ctx.fillStyle = '#23272e';
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#474d57';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CS2 SEWER', cx, cy - 20);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('COLOSSAL WATER', cx, cy + 25);
    ctx.restore();
  } else if (type === 'cobblestone') {
    assetName = 'CustomSurface_Pavement_01';
    category = 'Tiles';
    bump = 3.2;
    metal = 0;
    smooth = 35;
    fitStrategy = 'stretch';
    ctx.fillStyle = '#2e333d';
    ctx.fillRect(0, 0, 1024, 1024);
    const cols = 8;
    const rows = 8;
    const stoneW = 1024 / cols;
    const stoneH = 1024 / rows;
    for (let r = 0; r < rows; r++) {
      const rowOffset = (r % 2) * (stoneW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * stoneW + rowOffset;
        const y = r * stoneH;
        const grayVal = 110 + ((r * 17 + c * 31) % 55);
        ctx.fillStyle = `rgb(${grayVal}, ${grayVal + 4}, ${grayVal + 8})`;
        const pad = 6;
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, stoneW - pad * 2, stoneH - pad * 2, 8);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  } else if (type === 'centerline') {
    assetName = 'CustomNetLane_DashedLine_01';
    category = 'Lines';
    bump = 2.0;
    metal = 0;
    smooth = 25;
    netlane = { width: 0.4, length: 3.0 };
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(412, 128, 200, 768);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(412 + Math.random() * 200, 128 + Math.random() * 768, 3, 3);
    }
  }

  const dataUrl = canvas.toDataURL('image/png');
  const img = new Image();
  img.src = dataUrl;

  const tc = document.createElement('canvas');
  tc.width = 64;
  tc.height = 64;
  const tctx = tc.getContext('2d');
  tctx.drawImage(canvas, 0, 0, 64, 64);
  const thumbnail = tc.toDataURL('image/png');

  return {
    mode,
    image: img,
    imageSrc: dataUrl,
    thumbnail,
    fileName: `${type}_preset.png`,
    sourceFileType: 'PNG (Generated Preset)',
    sourceKind: 'preset',
    assetName,
    category,
    seriesName,
    bumpIntensity: bump,
    metallic: metal,
    smoothness: smooth,
    dimensions: dims,
    uvScale,
    netlane,
    fitStrategy,
    isCustomImageLoaded: false,
    hasUnsavedChanges: false
  };
}
