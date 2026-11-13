// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// Asset Readiness Checklist & Live JSON Inspector Modal
// ==========================================

import {
  state,
  escapeHtml,
  getSlot,
  isSlotLoaded,
  openAndScrollToSection,
  formatFileTypeLabel,
  getTransformSummary,
  isTransformActive
} from './state.js';
import { getEl, createModalController, setElValue, setElChecked } from './domUtils.js';
import {
  getAssetCategory,
  getLayerMaskValue,
  getJsonSchemaMode,
  setJsonSchemaMode,
  getJsonFileNameForMode,
  buildConfigDataForMode,
  toggleAssetMetadataFields,
  updateConfigJson,
  copyConfigJson,
  downloadConfigJson,
  getAspectFormatName
} from './exporter.js';
import { getAssetSeriesName, setAssetSeriesName } from './libraryManager.js';
import { checkPriorityOverlap } from './setRegistry.js';

const checklistModalCtrl = createModalController('assetChecklistModal');

const CHECKLIST_SLOT_ORDER = ['decal', 'surface', 'netlane'];

function isChecklistOpen() {
  const modal = getEl('assetChecklistModal');
  return Boolean(modal && modal.style.display === 'flex');
}

function getSourceInfoForChecklist() {
  const mode = state.appMode || 'decal';
  const slot = getSlot(mode);
  const img = state.currentImage || slot?.image || null;
  const loaded = Boolean(img || isSlotLoaded(mode));

  const fileName = state.sourceFileName || slot?.fileName || '';
  const kind = state.sourceKind || slot?.sourceKind || (loaded ? 'custom' : 'none');

  let fileType = state.sourceFileType || slot?.sourceFileType || '';
  if (!fileType && fileName) {
    fileType = formatFileTypeLabel(fileName, '', 'Image');
  } else if (!fileType && img?.src) {
    if (img.src.startsWith('data:image/')) {
      const mime = img.src.slice(5, img.src.indexOf(';'));
      fileType = formatFileTypeLabel(fileName, mime, 'Embedded Image');
    } else {
      fileType = 'Canvas / Preset Image';
    }
  }

  let kindLabel = 'Not Loaded';
  if (loaded) {
    if (kind === 'upload') kindLabel = 'Uploaded Graphic';
    else if (kind === 'preset') kindLabel = 'Built-in Preset';
    else if (kind === 'imported') kindLabel = 'Imported Package';
    else kindLabel = 'Graphic Loaded';
  }

  const w = img ? (img.naturalWidth || img.width || 0) : 0;
  const h = img ? (img.naturalHeight || img.height || 0) : 0;
  const ratioText = w > 0 && h > 0 ? getAspectFormatName(w / h) : 'N/A';

  return {
    loaded,
    fileName: fileName || (kind === 'preset' ? `${mode}_preset.png` : loaded ? 'Unnamed Graphic' : 'None'),
    fileType: fileType || (loaded ? 'PNG (Canvas Image)' : 'None'),
    kindLabel,
    dimensions: w > 0 && h > 0 ? `${w} × ${h} px` : 'No image dimensions',
    ratioText
  };
}

function getNormalInfoForChecklist() {
  const isCustom = Boolean(state.customNormalImg);
  const fileName = state.customNormalFileName || '';
  let fileType = state.customNormalFileType || '';
  if (isCustom && !fileType) {
    fileType = formatFileTypeLabel(fileName, '', 'PNG / Image');
  }

  const bump = Number(getEl('bumpIntensity')?.value ?? 2.5).toFixed(1);
  const blur = Number(getEl('normalBlur')?.value ?? 0);
  const invertBump = Boolean(getEl('invertBump')?.checked);
  const flipY = Boolean(getEl('flipNormalY')?.checked);

  return {
    isCustom,
    modeLabel: isCustom ? 'Graphic Loaded (Custom)' : 'Auto-Generated (OpenGL +X, +Y)',
    fileName: isCustom ? (fileName || 'custom_normal.png') : 'Generated from Base Color',
    fileType: isCustom ? fileType : 'Procedural OpenGL Tangent Map',
    bump,
    blur,
    invertBump,
    flipY
  };
}

function getMaskInfoForChecklist() {
  const isCustom = Boolean(state.customMaskImg);
  const fileName = state.customMaskFileName || '';
  let fileType = state.customMaskFileType || '';
  if (isCustom && !fileType) {
    fileType = formatFileTypeLabel(fileName, '', 'PNG / Image');
  }

  const metal = Number(getEl('metallic')?.value ?? 0);
  const smooth = Number(getEl('smoothness')?.value ?? 40);
  const variation = Number(getEl('maskVariation')?.value ?? 0);
  const modAlpha = Boolean(getEl('maskWithDecalAlpha')?.checked);

  return {
    isCustom,
    modeLabel: isCustom ? 'Graphic Loaded (Custom)' : 'Auto-Generated (R:Metal | A:Smooth)',
    fileName: isCustom ? (fileName || 'custom_mask.png') : 'Channel-Packed Procedural Mask',
    fileType: isCustom ? fileType : 'RGBA Packed PNG',
    metalPct: `${metal} (${Math.round((metal / 255) * 100)}%)`,
    smoothPct: `${smooth} (${Math.round((smooth / 255) * 100)}%)`,
    variation: `${variation}%`,
    modAlpha
  };
}

function getLayerLabelsList(maskVal) {
  const defs = [
    { bit: 1, name: 'Terrain' },
    { bit: 2, name: 'Roads' },
    { bit: 4, name: 'Buildings' },
    { bit: 8, name: 'Vehicles' },
    { bit: 16, name: 'Creatures' },
    { bit: 32, name: 'Props' }
  ];
  const active = defs.filter((d) => (maskVal & d.bit) !== 0).map((d) => d.name);
  return active.length > 0 ? active.join(', ') : 'None (0)';
}

function getBadgesSummaryForChecklist() {
  const styleSel = getEl('iconBgStyle');
  const styleText = styleSel?.options?.[styleSel.selectedIndex]?.text || styleSel?.value || 'CS2 Dark';

  const items = [
    {
      num: '#1',
      label: 'Creator',
      enabled: Boolean(state.badge1Enabled),
      detail: state.designerLogoImg
        ? state.badge1FileName || 'Custom Logo'
        : (getEl('badge1TextInput')?.value || 'CREATOR').trim()
    },
    {
      num: '#2',
      label: 'Series',
      enabled: Boolean(state.badge2Enabled),
      detail: state.badge2Img
        ? state.badge2FileName || 'Custom Logo'
        : (getEl('seriesTextInput')?.value || 'SERIES').trim()
    },
    {
      num: '#3',
      label: 'Extra 1',
      enabled: Boolean(state.badge3Enabled),
      detail: state.badge3Img
        ? state.badge3FileName || 'Custom Logo'
        : (getEl('extra1TextInput')?.value || 'EXTRA 1').trim()
    },
    {
      num: '#4',
      label: 'Extra 2',
      enabled: Boolean(state.badge4Enabled),
      detail: state.badge4Img
        ? state.badge4FileName || 'Custom Logo'
        : (getEl('extra2TextInput')?.value || 'EXTRA 2').trim()
    }
  ];

  const activeCount = items.filter((b) => b.enabled).length;
  return { styleText, items, activeCount };
}

function renderStatusPill(text, tone = 'neutral') {
  return `<span class="checklist-pill checklist-pill-${tone}">${escapeHtml(text)}</span>`;
}

function renderJumpButton(targetType, targetId, focusId = '', label = 'Adjust →') {
  const safeType = escapeHtml(targetType);
  const safeId = escapeHtml(targetId);
  const safeFocus = escapeHtml(focusId || '');
  return `<button type="button" class="checklist-jump-btn" onclick="jumpToChecklistTarget('${safeType}', '${safeId}', '${safeFocus}')" title="Jump directly to this section to adjust settings">${escapeHtml(label)}</button>`;
}

function renderChecklistPane() {
  const container = getEl('assetChecklistContent');
  if (!container) return;

  const mode = state.appMode || 'decal';
  const modeLabel = mode === 'surface' ? 'Surface' : mode === 'netlane' ? 'Net Lane' : 'Decal';
  const source = getSourceInfoForChecklist();
  const normal = getNormalInfoForChecklist();
  const mask = getMaskInfoForChecklist();
  const badges = getBadgesSummaryForChecklist();

  const assetName = (getEl('assetName')?.value || '').trim() || 'Unnamed_Asset';
  const cat = getAssetCategory();
  const displayCat = cat || 'None (Root Folder)';
  const jsonFileName = getJsonFileNameForMode(mode);
  const folderPrefix =
    mode === 'surface' ? 'CustomSurfaces' : mode === 'netlane' ? 'CustomNetLanes' : 'CustomDecals';
  const exportRelPath = cat ? `${folderPrefix}/${cat}/${assetName}/` : `${folderPrefix}/${assetName}/`;

  const res = Number(getEl('targetRes')?.value || state.currentResolution || 1024);
  const fitSel = getEl('fitStrategy');
  const fitLabel = fitSel?.options?.[fitSel.selectedIndex]?.text?.split('—')[0]?.trim() || fitSel?.value || 'Contain';
  const transformActive = isTransformActive();
  const transformText = getTransformSummary();

  const dimW = Number(getEl('dimWidth')?.value || 2.0).toFixed(2);
  const dimH = Number(getEl('dimHeight')?.value || 2.0).toFixed(2);
  const dimD = Number(getEl('dimDepth')?.value || 1.0).toFixed(2);
  const aspectLocked = Boolean(state.decalAspectLocked);
  const uvScale = Number(getEl('uvScaleSlider')?.value || 1.0).toFixed(1);
  const netW = Number(getEl('netlaneWidthSlider')?.value || 1.0).toFixed(1);
  const netL = Number(getEl('netlaneLengthSlider')?.value || 2.0).toFixed(1);

  const layerMask = getLayerMaskValue();
  const layerNames = getLayerLabelsList(layerMask);
  const drawOrder = Number(getEl('drawOrderSlider')?.value ?? 50);
  const normOp = Number(getEl('normalOpacitySlider')?.value ?? 1.0).toFixed(2);
  const baseOp = Number(getEl('baseOpacitySlider')?.value ?? 1.0).toFixed(2);
  const metOp = Number(getEl('metallicOpacitySlider')?.value ?? 0.0).toFixed(2);

  const seriesName = getAssetSeriesName() || 'Standalone (No Pack)';
  const uiPriority = Number(getEl('uiPriorityInput')?.value ?? 41);
  const overlap = checkPriorityOverlap(uiPriority, null, cat);
  const overlapTone = overlap ? (overlap.isSameCategory ? 'warn' : 'info') : 'ok';
  const overlapText = overlap
    ? overlap.isSameCategory
      ? `Overlap with "${overlap.conflictingSet?.setName}" (${overlap.rangeStart}–${overlap.rangeEnd})`
      : `Diff category (${overlap.setCategory})`
    : 'Safe Range (No Conflict)';

  const slotButtonsHtml = CHECKLIST_SLOT_ORDER.map((m) => {
    const slotLoaded = isSlotLoaded(m);
    const isActive = mode === m;
    const label = m === 'netlane' ? 'Net Lane' : m.charAt(0).toUpperCase() + m.slice(1);
    return `<button type="button" class="checklist-slot-chip ${isActive ? 'active' : ''} ${slotLoaded ? 'loaded' : 'empty'}" onclick="switchChecklistSlot('${m}')" title="Switch active workspace to ${label} slot">
      <span class="checklist-slot-dot"></span>
      <span>${label}</span>
      <span class="checklist-slot-tag">${slotLoaded ? 'Loaded' : 'Empty'}</span>
    </button>`;
  }).join('');

  let geometryRowsHtml = '';
  if (mode === 'decal') {
    geometryRowsHtml = `
      <div class="checklist-kv"><span>Decal Box Size</span><strong>${dimW}m × ${dimH}m × ${dimD}m depth ${aspectLocked ? '(Aspect Locked 🔒)' : '(Unlocked)'}</strong></div>
      <div class="checklist-kv"><span>Render Layers</span><strong>Mask ${layerMask} (${escapeHtml(layerNames)})</strong></div>
      <div class="checklist-kv"><span>Shader Opacities</span><strong>Normal ${normOp} • Base ${baseOp} • Metallic ${metOp}</strong></div>
    `;
  } else if (mode === 'surface') {
    geometryRowsHtml = `
      <div class="checklist-kv"><span>UV Tiling Scale</span><strong>${uvScale}×</strong></div>
      <div class="checklist-kv"><span>Preview Tiling</span><strong>${state.surfaceTiling || 4}×${state.surfaceTiling || 4} Grid</strong></div>
    `;
  } else {
    geometryRowsHtml = `
      <div class="checklist-kv"><span>Spline Dimensions</span><strong>Width ${netW}m × Length ${netL}m</strong></div>
      <div class="checklist-kv"><span>Shader Opacities</span><strong>Normal ${normOp} • Base ${baseOp} • Metallic ${metOp}</strong></div>
    `;
  }

  container.innerHTML = `
    <div class="checklist-slot-bar">
      <div class="checklist-slot-bar-label">3-in-1 Workspace Slots:</div>
      <div class="checklist-slot-chips">${slotButtonsHtml}</div>
    </div>

    <div class="checklist-cards">
      <!-- 1. Source Graphic -->
      <div class="checklist-card ${source.loaded ? 'is-ready' : 'is-missing'}">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">1</span>
            <div>
              <div class="checklist-card-title">Source Graphic</div>
              <div class="checklist-card-sub">${escapeHtml(modeLabel)} Slot Input</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${source.loaded ? renderStatusPill(`Graphic Loaded • ${source.fileType}`, 'ok') : renderStatusPill('Empty / Not Loaded', 'warn')}
            ${renderJumpButton('sidebar', 'secToolsSource', 'dropZone', 'Jump to Source →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv"><span>Load State</span><strong>${escapeHtml(source.kindLabel)}</strong></div>
          <div class="checklist-kv"><span>File Type</span><strong>${escapeHtml(source.fileType)}</strong></div>
          <div class="checklist-kv"><span>Filename</span><strong class="mono">${escapeHtml(source.fileName)}</strong></div>
          <div class="checklist-kv"><span>Native Size &amp; Ratio</span><strong>${escapeHtml(source.dimensions)} (${escapeHtml(source.ratioText)})</strong></div>
        </div>
      </div>

      <!-- 2. Asset Identity & Export Path -->
      <div class="checklist-card ${assetName !== 'Unnamed_Asset' ? 'is-ready' : 'is-warn'}">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">2</span>
            <div>
              <div class="checklist-card-title">Asset Name, Category &amp; Output Path</div>
              <div class="checklist-card-sub">ExtraAssetsImporter Folder Structure</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${transformActive ? renderStatusPill('Rotated / Flipped — Check Name', 'info') : renderStatusPill(modeLabel.toUpperCase(), 'cyan')}
            ${renderJumpButton('sidebar', 'secToolsAsset', 'assetName', 'Edit Identity →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv"><span>Asset Name</span><strong class="mono">${escapeHtml(assetName)}</strong></div>
          <div class="checklist-kv"><span>Category Subfolder</span><strong>${escapeHtml(displayCat)}</strong></div>
          <div class="checklist-kv checklist-kv-full"><span>Export Directory</span><strong class="mono">${escapeHtml(exportRelPath)}${escapeHtml(jsonFileName)}</strong></div>
        </div>
      </div>

      <!-- 3. Resolution, Fit & Geometry / Shader Settings -->
      <div class="checklist-card">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">3</span>
            <div>
              <div class="checklist-card-title">Resolution, Geometry &amp; Shader Controls</div>
              <div class="checklist-card-sub">Texture Baking &amp; In-Game Material Flags</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${renderStatusPill(`${res}×${res} px`, 'cyan')}
            ${renderJumpButton('sidebar', 'secToolsAsset', 'targetRes', 'Adjust Settings →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv"><span>Target Resolution</span><strong>${res} × ${res} px</strong></div>
          <div class="checklist-kv"><span>Fit Strategy</span><strong>${escapeHtml(fitLabel)}</strong></div>
          <div class="checklist-kv"><span>Orientation Transform</span><strong>${escapeHtml(transformText)}</strong></div>
          <div class="checklist-kv"><span>Draw Order (_DrawOrder)</span><strong>${drawOrder}</strong></div>
          ${geometryRowsHtml}
        </div>
      </div>

      <!-- 4. Normal Map -->
      <div class="checklist-card">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">4</span>
            <div>
              <div class="checklist-card-title">Normal Map (_NormalMap.png)</div>
              <div class="checklist-card-sub">Auto-Generated Relief vs Custom Graphic</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${normal.isCustom ? renderStatusPill(`Graphic Loaded (${normal.fileType})`, 'purple') : renderStatusPill('Auto-Generated', 'cyan')}
            ${renderJumpButton('sidebar', 'secToolsNormal', 'bumpIntensity', 'Adjust Normal →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv"><span>Normal Source</span><strong>${escapeHtml(normal.modeLabel)}</strong></div>
          <div class="checklist-kv"><span>Source File / Type</span><strong class="mono">${escapeHtml(normal.fileName)} (${escapeHtml(normal.fileType)})</strong></div>
          <div class="checklist-kv"><span>Bump / Blur</span><strong>${normal.bump}× Depth • ${normal.blur} px Edge Blur</strong></div>
          <div class="checklist-kv"><span>Channel Flags</span><strong>Invert Height: ${normal.invertBump ? 'Yes' : 'No'} • Flip Y: ${normal.flipY ? 'Yes' : 'No'}</strong></div>
        </div>
      </div>

      <!-- 5. Mask Map -->
      <div class="checklist-card">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">5</span>
            <div>
              <div class="checklist-card-title">Mask Map (_MaskMap.png)</div>
              <div class="checklist-card-sub">PBR Channel Packing (R: Metallic, A: Smoothness)</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${mask.isCustom ? renderStatusPill(`Graphic Loaded (${mask.fileType})`, 'purple') : renderStatusPill('Auto-Generated', 'cyan')}
            ${renderJumpButton('sidebar', 'secToolsMask', 'metallic', 'Adjust Mask →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv"><span>Mask Source</span><strong>${escapeHtml(mask.modeLabel)}</strong></div>
          <div class="checklist-kv"><span>Source File / Type</span><strong class="mono">${escapeHtml(mask.fileName)} (${escapeHtml(mask.fileType)})</strong></div>
          <div class="checklist-kv"><span>Metallic / Smoothness</span><strong>Metal: ${escapeHtml(mask.metalPct)} • Smooth: ${escapeHtml(mask.smoothPct)}</strong></div>
          <div class="checklist-kv"><span>Detail &amp; Alpha</span><strong>Variation: ${escapeHtml(mask.variation)} • Alpha Mod: ${mask.modAlpha ? 'On' : 'Off'}</strong></div>
        </div>
      </div>

      <!-- 6. In-Game Icon & Badges -->
      <div class="checklist-card">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">6</span>
            <div>
              <div class="checklist-card-title">In-Game Icon &amp; Badges (icon.png)</div>
              <div class="checklist-card-sub">256×256 Toolbar Thumbnail &amp; Overlays</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${renderStatusPill(`${badges.activeCount} / 4 Badges Active`, badges.activeCount > 0 ? 'ok' : 'neutral')}
            ${renderJumpButton('sidebar', 'secToolsIcon', 'iconBgStyle', 'Adjust Icon →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv checklist-kv-full"><span>Backdrop Style</span><strong>${escapeHtml(badges.styleText)}</strong></div>
          ${badges.items
            .map(
              (b) =>
                `<div class="checklist-kv"><span>${b.num} ${b.label}</span><strong>${
                  b.enabled ? `On (${escapeHtml(b.detail)})` : 'Off'
                }</strong></div>`
            )
            .join('')}
        </div>
      </div>

      <!-- 7. Pack / Series & UI Priority -->
      <div class="checklist-card">
        <div class="checklist-card-header">
          <div class="checklist-card-title-wrap">
            <span class="checklist-step-num">7</span>
            <div>
              <div class="checklist-card-title">Pack / Series &amp; UI Priority</div>
              <div class="checklist-card-sub">Collection Grouping &amp; In-Game Menu Ordering</div>
            </div>
          </div>
          <div class="checklist-card-actions">
            ${renderStatusPill(`UiPriority: ${uiPriority}`, overlapTone)}
            ${renderJumpButton('packModal', 'series', '', 'Pack →')}
            ${renderJumpButton('packModal', 'priority', '', 'Priority →')}
          </div>
        </div>
        <div class="checklist-kv-grid">
          <div class="checklist-kv"><span>Pack / Series</span><strong>${escapeHtml(seriesName)}</strong></div>
          <div class="checklist-kv"><span>Menu Priority</span><strong class="mono">${uiPriority}</strong></div>
          <div class="checklist-kv checklist-kv-full"><span>Range Collision Check</span><strong>${escapeHtml(overlapText)}</strong></div>
        </div>
      </div>
    </div>
  `;
}

function updateChecklistJsonCodeOnly() {
  const mode = state.appMode || 'decal';
  const jsonFileName = getJsonFileNameForMode(mode);
  const schemaMode = getJsonSchemaMode();
  const data = buildConfigDataForMode(mode);
  const formatted = JSON.stringify(data, null, 2);

  const preEl = getEl('checklistJsonPre');
  if (preEl) preEl.textContent = formatted;

  const fileEl = getEl('checklistJsonFilename');
  if (fileEl) fileEl.textContent = jsonFileName;

  const schemaBadge = getEl('checklistJsonSchemaBadge');
  if (schemaBadge) {
    schemaBadge.textContent = schemaMode === 'enhanced' ? 'ENHANCED' : 'STANDARD';
    schemaBadge.className = `checklist-pill ${schemaMode === 'enhanced' ? 'checklist-pill-purple' : 'checklist-pill-cyan'}`;
  }
}

function renderJsonPane() {
  const pane = getEl('checklistJsonPane');
  if (!pane) return;

  const mode = state.appMode || 'decal';
  const jsonFileName = getJsonFileNameForMode(mode);
  const schemaMode = getJsonSchemaMode();
  const includeMeta = Boolean(getEl('includeAssetMetadata')?.checked);
  const authorVal = getEl('metaAuthor')?.value ?? 'Creator';
  const versionVal = getEl('metaVersion')?.value ?? '1.0.0';
  const seriesVal = getAssetSeriesName() || '';
  const notesVal = getEl('metaNotes')?.value ?? '';
  const availChecked = getEl('metaAvailableInEditor')?.checked !== false;
  const dualPrioChecked = getEl('metaDualPriority')?.checked !== false;

  if (!Array.isArray(state.customMetadataEntries)) {
    state.customMetadataEntries = [];
  }

  const customRowsHtml = state.customMetadataEntries.length
    ? state.customMetadataEntries
        .map(
          (entry, idx) => `
      <div class="checklist-custom-meta-row">
        <input type="text" placeholder="key (e.g. license)" value="${escapeHtml(entry.key || '')}" oninput="updateCustomMetadataEntry(${idx}, 'key', this.value)" spellcheck="false" />
        <input type="text" placeholder="value (e.g. CC-BY-4.0)" value="${escapeHtml(entry.value || '')}" oninput="updateCustomMetadataEntry(${idx}, 'value', this.value)" spellcheck="false" />
        <button type="button" class="checklist-meta-remove-btn" onclick="removeCustomMetadataEntry(${idx})" title="Remove custom field">✕</button>
      </div>`
        )
        .join('')
    : `<div class="checklist-custom-meta-empty">No custom metadata fields added yet.</div>`;

  const data = buildConfigDataForMode(mode);
  const formattedJson = JSON.stringify(data, null, 2);

  pane.innerHTML = `
    <div class="checklist-json-topbar">
      <div class="checklist-json-title-group">
        <span class="checklist-json-file" id="checklistJsonFilename">${escapeHtml(jsonFileName)}</span>
        <span id="checklistJsonSchemaBadge" class="checklist-pill ${schemaMode === 'enhanced' ? 'checklist-pill-purple' : 'checklist-pill-cyan'}">${schemaMode === 'enhanced' ? 'ENHANCED' : 'STANDARD'}</span>
      </div>
      <div class="checklist-json-btn-group">
        <button type="button" class="btn-secondary checklist-mini-btn" onclick="copyConfigJson()" title="Copy JSON to clipboard">Copy</button>
        <button type="button" class="btn-secondary checklist-mini-btn" onclick="downloadConfigJson()" title="Download ${escapeHtml(jsonFileName)}">Download</button>
      </div>
    </div>

    <!-- Standard vs Enhanced Toggle -->
    <div class="checklist-schema-bar">
      <div class="checklist-schema-label">JSON Format</div>
      <div class="checklist-segmented" role="group" aria-label="JSON Schema Format">
        <button type="button" class="checklist-seg-btn ${schemaMode === 'standard' ? 'active' : ''}" onclick="setChecklistJsonSchema('standard')">Standard</button>
        <button type="button" class="checklist-seg-btn ${schemaMode === 'enhanced' ? 'active' : ''}" onclick="setChecklistJsonSchema('enhanced')">Enhanced</button>
      </div>
      <div class="checklist-schema-hint">
        ${
          schemaMode === 'enhanced'
            ? 'Includes <code>m_UIPriority</code>, <code>_Metallic</code>, <code>_Smoothness</code>, full <code>Vector4</code>, and <code>Bool.m_availableInEditor</code>.'
            : 'Lean ExtraAssetsImporter schema with essential mode parameters.'
        }
      </div>
    </div>

    <!-- User-Generated Metadata Builder -->
    <div class="checklist-meta-card">
      <div class="checklist-meta-header">
        <label class="checkbox-row" style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-main);">
          <input type="checkbox" id="checklistIncludeMetaToggle" ${includeMeta ? 'checked' : ''} onchange="toggleChecklistMetadata(this.checked)">
          <span>Include User-Generated Metadata (<code>asset_metadata</code>)</span>
        </label>
        <span class="checklist-pill ${includeMeta ? 'checklist-pill-ok' : 'checklist-pill-neutral'}">${includeMeta ? 'Included' : 'Off'}</span>
      </div>

      <div class="checklist-meta-body" style="display: ${includeMeta ? 'flex' : 'none'};">
        <div class="checklist-meta-grid">
          <div class="checklist-meta-field">
            <label for="checklistMetaAuthor">Author / Creator</label>
            <input type="text" id="checklistMetaAuthor" value="${escapeHtml(authorVal)}" placeholder="Creator name..." oninput="onChecklistMetadataInput('metaAuthor', this.value)" spellcheck="false" />
          </div>
          <div class="checklist-meta-field">
            <label for="checklistMetaVersion">Version</label>
            <input type="text" id="checklistMetaVersion" value="${escapeHtml(versionVal)}" placeholder="1.0.0" oninput="onChecklistMetadataInput('metaVersion', this.value)" spellcheck="false" />
          </div>
          <div class="checklist-meta-field checklist-meta-field-full">
            <label for="checklistMetaSeries">Pack / Set Name</label>
            <input type="text" id="checklistMetaSeries" value="${escapeHtml(seriesVal)}" placeholder="Standalone or pack name..." oninput="onChecklistMetadataInput('assetSeries', this.value)" spellcheck="false" />
          </div>
          <div class="checklist-meta-field checklist-meta-field-full">
            <label for="checklistMetaNotes">Notes / Description</label>
            <textarea id="checklistMetaNotes" rows="2" placeholder="Optional creator notes or usage instructions..." oninput="onChecklistMetadataInput('metaNotes', this.value)">${escapeHtml(notesVal)}</textarea>
          </div>
        </div>

        <div class="checklist-meta-flags">
          <label class="checkbox-row" style="margin: 0; font-size: 10.5px;">
            <input type="checkbox" ${availChecked ? 'checked' : ''} onchange="onChecklistMetadataInput('metaAvailableInEditor', this.checked)">
            <span><code>m_availableInEditor: true</code></span>
          </label>
          ${
            schemaMode === 'enhanced'
              ? `<label class="checkbox-row" style="margin: 0; font-size: 10.5px;">
                  <input type="checkbox" ${dualPrioChecked ? 'checked' : ''} onchange="onChecklistMetadataInput('metaDualPriority', this.checked)">
                  <span>Dual Priority (<code>m_UIPriority</code>)</span>
                </label>`
              : ''
          }
        </div>

        <div class="checklist-custom-meta-section">
          <div class="checklist-custom-meta-head">
            <span>Custom Metadata Fields</span>
            <button type="button" class="checklist-add-meta-btn" onclick="addCustomMetadataEntry()">＋ Add Field</button>
          </div>
          <div class="checklist-custom-meta-list">
            ${customRowsHtml}
          </div>
        </div>
      </div>
    </div>

    <!-- Live Formatted JSON -->
    <div class="checklist-json-output-wrap">
      <pre class="checklist-json-pre" id="checklistJsonPre">${escapeHtml(formattedJson)}</pre>
    </div>
  `;
}

let suppressJsonPaneRerender = false;

export function refreshAssetChecklistModal() {
  if (!isChecklistOpen()) return;
  renderChecklistPane();
  if (suppressJsonPaneRerender) {
    updateChecklistJsonCodeOnly();
  } else {
    renderJsonPane();
  }
}

export function openAssetChecklistModal() {
  checklistModalCtrl.open();
  renderChecklistPane();
  renderJsonPane();
}

export function closeAssetChecklistModal() {
  checklistModalCtrl.close();
}

export function closeAssetChecklistModalOnBackdrop(e) {
  checklistModalCtrl.closeOnBackdrop(e);
}

export function jumpToChecklistTarget(targetType, targetId, focusId = '') {
  closeAssetChecklistModal();
  if (targetType === 'packModal') {
    if (typeof window.openPackOrderModal === 'function') {
      window.openPackOrderModal(targetId || 'series');
    }
    return;
  }
  openAndScrollToSection(targetId, focusId || null);
}

export function switchChecklistSlot(mode) {
  if (typeof window.setMode === 'function') {
    window.setMode(mode);
  }
  refreshAssetChecklistModal();
}

export function setChecklistJsonSchema(mode) {
  setJsonSchemaMode(mode);
  if (isChecklistOpen()) {
    renderJsonPane();
  }
}

export function toggleChecklistMetadata(checked) {
  toggleAssetMetadataFields(Boolean(checked));
  if (isChecklistOpen()) {
    renderJsonPane();
  }
}

export function onChecklistMetadataInput(field, val) {
  if (field === 'metaAvailableInEditor' || field === 'metaDualPriority') {
    setElChecked(field, Boolean(val));
    suppressJsonPaneRerender = true;
    try {
      updateConfigJson();
    } finally {
      suppressJsonPaneRerender = false;
    }
    updateChecklistJsonCodeOnly();
    return;
  }

  suppressJsonPaneRerender = true;
  try {
    if (field === 'assetSeries') {
      setAssetSeriesName(String(val ?? ''));
      renderChecklistPane();
    } else {
      setElValue(field, String(val ?? ''));
      updateConfigJson();
    }
  } finally {
    suppressJsonPaneRerender = false;
  }
  updateChecklistJsonCodeOnly();
}

export function addCustomMetadataEntry() {
  if (!Array.isArray(state.customMetadataEntries)) {
    state.customMetadataEntries = [];
  }
  state.customMetadataEntries.push({ key: '', value: '' });
  suppressJsonPaneRerender = true;
  try {
    updateConfigJson();
  } finally {
    suppressJsonPaneRerender = false;
  }
  if (isChecklistOpen()) {
    renderJsonPane();
    const rows = document.querySelectorAll('.checklist-custom-meta-row input');
    if (rows.length >= 2) {
      rows[rows.length - 2].focus();
    }
  }
}

export function updateCustomMetadataEntry(index, field, val) {
  if (!Array.isArray(state.customMetadataEntries) || !state.customMetadataEntries[index]) return;
  state.customMetadataEntries[index][field] = String(val ?? '');
  suppressJsonPaneRerender = true;
  try {
    updateConfigJson();
  } finally {
    suppressJsonPaneRerender = false;
  }
  updateChecklistJsonCodeOnly();
}

export function removeCustomMetadataEntry(index) {
  if (!Array.isArray(state.customMetadataEntries)) return;
  state.customMetadataEntries.splice(index, 1);
  suppressJsonPaneRerender = true;
  try {
    updateConfigJson();
  } finally {
    suppressJsonPaneRerender = false;
  }
  if (isChecklistOpen()) {
    renderJsonPane();
  }
}
