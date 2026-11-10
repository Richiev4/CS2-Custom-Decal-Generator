// ==========================================
// Global Application State & Shared Utilities
// ==========================================

export function createDefaultSlot(mode) {
  const defaultNames = {
    decal: 'CityUtility_Manhole_01',
    surface: 'CustomSurface_01',
    netlane: 'CustomNetLane_01'
  };
  const defaultCategories = {
    decal: 'Utilities',
    surface: 'Surfaces',
    netlane: 'RoadMarkings'
  };
  return {
    mode,
    image: null,
    imageSrc: '',
    fileName: '',
    isCustomImageLoaded: false,
    hasUnsavedChanges: false,
    assetName: defaultNames[mode] || `Custom${mode.charAt(0).toUpperCase() + mode.slice(1)}_01`,
    category: defaultCategories[mode] || 'RoadMarkings',
    seriesName: 'City Utilities',
    targetResolution: 1024,
    fitStrategy: mode === 'surface' ? 'stretch' : 'fill',
    textureRotation: 0,
    flipH: false,
    flipV: false,
    originalNameBeforeTransform: '',
    customNormalImg: null,
    customNormalFileName: '',
    customMaskImg: null,
    customMaskFileName: '',
    bumpIntensity: mode === 'surface' ? 2.5 : 3.5,
    normalBlur: 0,
    invertBump: false,
    flipNormalY: false,
    metallic: mode === 'surface' ? 0 : 180,
    smoothness: mode === 'surface' ? 30 : 80,
    maskWithDecalAlpha: mode !== 'surface',
    maskVariation: 0,
    dimensions: {
      width: mode === 'decal' ? 1.8 : 2.0,
      height: mode === 'decal' ? 1.8 : 2.0,
      depth: 0.5,
      aspectLocked: false,
      lockedRatio: 1.0
    },
    layerMask: {
      terrain: true,
      roads: true,
      buildings: false,
      vehicles: false
    },
    normalOpacity: 1.0,
    baseOpacity: 1.0,
    metallicOpacity: 0.0,
    uvScale: 1.0,
    surfaceTiling: 4,
    netlane: {
      width: 1.0,
      length: 2.0
    },
    drawOrder: mode === 'surface' ? -50 : (mode === 'netlane' ? 60 : 50),
    uiPriority: mode === 'decal' ? 52010 : (mode === 'surface' ? 52020 : 52030),
    uiPriorityBase: 52000,
    uiPriorityStep: 10,
    thumbnail: ''
  };
}

export const state = {
  appMode: 'decal', // 'decal' | 'surface' | 'netlane'
  netlaneJsonTab: 'decal', // 'decal' | 'surface' | 'netlane'
  currentImage: null,
  currentResolution: 1024,
  lightPos: { x: 0.35, y: -0.6, z: 0.7 },
  activeTab: 'grid',
  activeSingleMap: 'base',

  // 3-in-1 Set Slots: Decal + Surface + Net Lane loaded concurrently
  setName: 'City Utilities',
  setSlots: {
    decal: createDefaultSlot('decal'),
    surface: createDefaultSlot('surface'),
    netlane: createDefaultSlot('netlane')
  },

  // Transforms
  textureRotation: 0,
  flipH: false,
  flipV: false,
  originalNameBeforeTransform: '',
  isReminderDismissed: false,
  lastExportedName: '',
  lastExportedTransform: { rot: 0, flipH: false, flipV: false },

  // Custom Normal
  customNormalImg: null,
  customNormalFileName: '',

  // Custom Mask & Surface Texture Variation
  customMaskImg: null,
  customMaskFileName: '',
  maskVariation: 0,

  // Surface Tiling
  surfaceTiling: 4,

  // Decal Dimensions & Aspect Ratio Lock
  decalAspectLocked: false,
  decalLockedRatio: 1.0,
  autoSyncAspectOnImport: true,

  // In-Game Scale & Aspect Ratio Preview Settings
  scaleScene: 'road', // 'road' | 'wall' | 'grid'
  scaleZoom: 1.0,
  scaleShowCar: true,
  scaleShowPerson: true,
  scaleShowGrid: true,
  scaleShowRulers: true,
  scaleShowUvBox: false,
  scaleDecalPos: { x: 0, y: 0 },
  scaleDecalHovered: false,
  scaleGraphicFit: 'fill', // 'fill' (scale graphic 100% to decal mesh) | 'contain' (preserve graphic aspect)

  // 3D Lit & Texture Aspect Ratio Preview Settings
  simAspectMode: 'mesh', // 'mesh' (matches 3D decal dimensions) | 'square' (1:1 UV texture)
  showSimDimensions: true,
  showSingleAspectFrame: true,

  // Unsaved changes guard
  isCustomImageLoaded: false,
  hasUnsavedChanges: false,
  pendingGuardAction: null,
  askWhereToSave: (typeof localStorage !== 'undefined' ? localStorage.getItem('cs2_ask_where_to_save') !== 'false' : true),
  hideSamplePresets: (typeof localStorage !== 'undefined' ? localStorage.getItem('cs2_hide_sample_presets') === 'true' : false),

  // Library & Series state
  currentLoadedAssetName: 'CityUtility_Manhole_01',
  currentLoadedAssetSeries: 'City Utilities',
  activeRibbonSeries: 'all',
  libraryFilterSeries: 'all',
  librarySearchQuery: '',

  // Badges & Watermarks
  badge1Enabled: true,
  badge1Type: 'preset',
  designerLogoImg: null,
  presetLogoType: 'star',
  badge1FileName: '',
  badge1Text: 'CREATOR',
  badge1Font: 'Montserrat',
  badge1Bold: true,
  badge1Italic: false,
  badge1PtSize: 13,
  badge1ColorMode: 'theme',
  badge1ColorTheme: 'cyan',
  badge1CustomBg1: '#091524',
  badge1CustomBg2: '#0e243d',
  badge1CustomStroke: '#00a8ff',
  badge1CustomText: '#ffffff',
  badge1SolidBg: '#091524',
  badge1SolidStroke: '#00a8ff',
  badge1SolidText: '#ffffff',
  badge1GradDir: 'diagonal',
  badge1LetterSpacing: false,
  badge1TextGradEnabled: false,
  badge1TextGradColor1: '#ffffff',
  badge1TextGradColor2: '#38bdf8',
  badge1TextGradDir: 'vertical',
  badge1EdgePadding: 12,
  badge1InnerPadding: 8,
  badge1Position: 'custom',
  badge1PosX: 85,
  badge1PosY: 85,

  badge2Enabled: true,
  badge2Type: 'preset',
  badge2Preset: 'graffiti',
  badge2Text: 'GRAFFITI',
  badge2Font: 'Bebas Neue',
  badge2Bold: true,
  badge2Italic: false,
  badge2PtSize: 13,
  badge2Img: null,
  badge2FileName: '',
  badge2ColorMode: 'theme',
  badge2ColorTheme: 'purple',
  badge2CustomBg1: '#151326',
  badge2CustomBg2: '#251336',
  badge2CustomStroke: '#c084fc',
  badge2CustomText: '#ffffff',
  badge2SolidBg: '#151326',
  badge2SolidStroke: '#c084fc',
  badge2SolidText: '#ffffff',
  badge2GradDir: 'diagonal',
  badge2LetterSpacing: false,
  badge2TextGradEnabled: false,
  badge2TextGradColor1: '#ffffff',
  badge2TextGradColor2: '#c084fc',
  badge2TextGradDir: 'vertical',
  badge2EdgePadding: 12,
  badge2InnerPadding: 8,
  badge2Position: 'custom',
  badge2PosX: 15,
  badge2PosY: 15,

  // Extra 1 Badge (Overlay 3)
  badge3Enabled: false,
  badge3Type: 'text',
  badge3Preset: 'props',
  badge3Text: 'EXTRA 1',
  badge3Font: 'Montserrat',
  badge3Bold: true,
  badge3Italic: false,
  badge3PtSize: 13,
  badge3Img: null,
  badge3FileName: '',
  badge3ColorMode: 'theme',
  badge3ColorTheme: 'emerald',
  badge3CustomBg1: '#06241a',
  badge3CustomBg2: '#0d3d2c',
  badge3CustomStroke: '#34d399',
  badge3CustomText: '#ffffff',
  badge3SolidBg: '#06241a',
  badge3SolidStroke: '#34d399',
  badge3SolidText: '#ffffff',
  badge3GradDir: 'diagonal',
  badge3LetterSpacing: false,
  badge3TextGradEnabled: false,
  badge3TextGradColor1: '#ffffff',
  badge3TextGradColor2: '#34d399',
  badge3TextGradDir: 'vertical',
  badge3EdgePadding: 12,
  badge3InnerPadding: 8,
  badge3Position: 'custom',
  badge3PosX: 15,
  badge3PosY: 85,

  // Extra 2 Badge (Overlay 4)
  badge4Enabled: false,
  badge4Type: 'text',
  badge4Preset: 'hazard',
  badge4Text: 'EXTRA 2',
  badge4Font: 'Montserrat',
  badge4Bold: true,
  badge4Italic: false,
  badge4PtSize: 13,
  badge4Img: null,
  badge4FileName: '',
  badge4ColorMode: 'theme',
  badge4ColorTheme: 'amber',
  badge4CustomBg1: '#241806',
  badge4CustomBg2: '#3d2a0d',
  badge4CustomStroke: '#fbbf24',
  badge4CustomText: '#ffffff',
  badge4SolidBg: '#241806',
  badge4SolidStroke: '#fbbf24',
  badge4SolidText: '#ffffff',
  badge4GradDir: 'diagonal',
  badge4LetterSpacing: false,
  badge4TextGradEnabled: false,
  badge4TextGradColor1: '#ffffff',
  badge4TextGradColor2: '#fbbf24',
  badge4TextGradDir: 'vertical',
  badge4EdgePadding: 12,
  badge4InnerPadding: 8,
  badge4Position: 'custom',
  badge4PosX: 85,
  badge4PosY: 15,

  customGoogleFonts: [],
  activeBadgeTab: 'creator',
  currentHelpCategory: 'all',

  // Custom Icon Background
  customIconBgType: 'image', // 'image' | 'gradient' | 'color'
  iconBgImg: null,
  iconBgFileName: '',
  iconBgFit: 'cover', // 'cover' | 'contain' | 'stretch'
  iconBgBlur: 0,
  iconBgBrightness: 100,
  iconBgVignette: true,
  iconBgGradType: 'radial', // 'radial' | 'diagonal' | 'vertical' | 'horizontal'
  iconBgGrad1: '#1a2638',
  iconBgGrad2: '#080d16',
  iconBgGradGrid: false,
  iconBgColor: '#141e2e'
};

// Canvas references
export function getCanvases() {
  const canvasBase = document.getElementById('canvasBase');
  const canvasNormal = document.getElementById('canvasNormal');
  const canvasMask = document.getElementById('canvasMask');
  const canvasIcon = document.getElementById('canvasIcon');
  const canvasSim = document.getElementById('canvasSim');
  const canvasSingle = document.getElementById('canvasSingle');
  const canvasTiled = document.getElementById('canvasTiled');
  const canvasScale = document.getElementById('canvasScale');

  return {
    canvasBase,
    canvasNormal,
    canvasMask,
    canvasIcon,
    canvasSim,
    canvasSingle,
    canvasTiled,
    canvasScale,
    ctxBase: canvasBase?.getContext('2d', { willReadFrequently: true }),
    ctxNormal: canvasNormal?.getContext('2d', { willReadFrequently: true }),
    ctxMask: canvasMask?.getContext('2d', { willReadFrequently: true }),
    ctxIcon: canvasIcon?.getContext('2d'),
    ctxSim: canvasSim?.getContext('2d', { willReadFrequently: true }),
    ctxSingle: canvasSingle?.getContext('2d'),
    ctxTiled: canvasTiled?.getContext('2d'),
    ctxScale: canvasScale?.getContext('2d')
  };
}

export function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function drawImageSquare(ctx, img, size, strategy) {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);

  if (state.textureRotation !== 0) {
    ctx.rotate((state.textureRotation * Math.PI) / 180);
  }

  const scaleX = state.flipH ? -1 : 1;
  const scaleY = state.flipV ? -1 : 1;
  if (state.flipH || state.flipV) {
    ctx.scale(scaleX, scaleY);
  }

  const imgW = img.width;
  const imgH = img.height;
  let nw, nh;

  if (strategy === 'stretch' || strategy === 'fill') {
    // Fill full power-of-2 canvas; in-game 3D decal dimensions (width & height) restore true aspect ratio
    nw = size;
    nh = size;
  } else if (strategy === 'contain') {
    // Fit within canvas and pad borders with transparent alpha
    const scale = Math.min(size / imgW, size / imgH);
    nw = imgW * scale;
    nh = imgH * scale;
  } else {
    // Cover: crop outer edges to fill 1:1 square
    const scale = Math.max(size / imgW, size / imgH);
    nw = imgW * scale;
    nh = imgH * scale;
  }

  ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
  ctx.restore();
}

export function isTransformActive() {
  return state.textureRotation !== 0 || state.flipH || state.flipV;
}

export function getTransformSummary() {
  const parts = [];
  if (state.flipH) parts.push('Flip H');
  if (state.flipV) parts.push('Flip V');
  if (state.textureRotation !== 0) parts.push(`${state.textureRotation}°`);
  return parts.length > 0 ? parts.join(' + ') : 'Default';
}

export function hasTransformChangedSinceLastExport() {
  if (!state.lastExportedName) return false;
  return state.lastExportedTransform.rot !== state.textureRotation ||
         state.lastExportedTransform.flipH !== state.flipH ||
         state.lastExportedTransform.flipV !== state.flipV;
}

export function checkRotationNameReminder() {
  const active = isTransformActive();
  const flagEl = document.getElementById('rotationNameFlag');
  const flagTextEl = document.getElementById('rotationNameFlagText');
  const reminderEl = document.getElementById('rotationNameReminder');
  const descEl = document.getElementById('reminderDescText');
  const inputEl = document.getElementById('assetName');
  const hintBanner = document.getElementById('rotationHintBanner');
  const hintText = document.getElementById('rotationHintText');

  if (!active) {
    if (flagEl) flagEl.style.display = 'none';
    if (reminderEl) reminderEl.style.display = 'none';
    if (inputEl) inputEl.classList.remove('input-transformed-warning');
    if (hintBanner) hintBanner.style.display = 'none';
    state.isReminderDismissed = false;
    state.originalNameBeforeTransform = '';
    return;
  }

  const currName = inputEl ? inputEl.value.trim() : '';
  if (!state.originalNameBeforeTransform && currName) {
    state.originalNameBeforeTransform = currName;
  }

  const summary = getTransformSummary();

  if (flagEl) {
    flagEl.style.display = 'inline-flex';
    if (flagTextEl) {
      flagTextEl.textContent = `${summary} Active`;
    }
  }

  const isStillOriginalName = !currName || (state.originalNameBeforeTransform && currName === state.originalNameBeforeTransform);

  if (inputEl) {
    if (isStillOriginalName) {
      inputEl.classList.add('input-transformed-warning');
    } else {
      inputEl.classList.remove('input-transformed-warning');
    }
  }

  if (reminderEl) {
    if (!state.isReminderDismissed && isStillOriginalName) {
      reminderEl.style.display = 'block';
      if (descEl) {
        descEl.innerHTML = `You've applied <strong>${summary}</strong>. Remember to give this variant a unique <strong>Asset Name</strong> so it doesn't overwrite your other exports in CS2.`;
      }
    } else if (!isStillOriginalName) {
      reminderEl.style.display = 'none';
    }
  }

  if (hintBanner) {
    hintBanner.style.display = 'flex';
    if (hintText) {
      hintText.innerHTML = `<span><strong>${summary}</strong> active: remember to update <strong>Asset Name</strong> above before exporting.</span>`;
    }
  }
}

export function dismissRotationReminder() {
  state.isReminderDismissed = true;
  const reminderEl = document.getElementById('rotationNameReminder');
  if (reminderEl) reminderEl.style.display = 'none';
  const inputEl = document.getElementById('assetName');
  if (inputEl) inputEl.classList.remove('input-transformed-warning');
}

export function focusAndHighlightAssetName() {
  const input = document.getElementById('assetName');
  if (input) {
    input.focus();
    input.select();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function autoRenameVariant() {
  const input = document.getElementById('assetName');
  if (!input) return;
  let val = input.value.trim();
  if (!val) {
    val = state.appMode === 'decal' ? 'CustomDecal' : (state.appMode === 'surface' ? 'CustomSurface' : 'CustomNetLane');
  }

  if (state.flipH) {
    if (/Left/i.test(val)) {
      val = val.replace(/Left/g, 'Right').replace(/left/g, 'right');
    } else if (/Right/i.test(val)) {
      val = val.replace(/Right/g, 'Left').replace(/right/g, 'left');
    } else if (/RHT/i.test(val)) {
      val = val.replace(/RHT/g, 'LHT').replace(/rht/g, 'lht');
    } else if (/LHT/i.test(val)) {
      val = val.replace(/LHT/g, 'RHT').replace(/lht/g, 'rht');
    } else if (!val.includes('_Left') && !val.includes('_Flipped')) {
      val = val + '_Left';
    }
  } else if (state.flipV) {
    if (/Top/i.test(val)) {
      val = val.replace(/Top/g, 'Bottom').replace(/top/g, 'bottom');
    } else if (/Bottom/i.test(val)) {
      val = val.replace(/Bottom/g, 'Top').replace(/bottom/g, 'top');
    } else if (!val.includes('_VFlip')) {
      val = val + '_VFlip';
    }
  } else if (state.textureRotation !== 0) {
    val = val.replace(/_\d+deg/g, '').replace(/_Rotated/g, '');
    val = val + `_${state.textureRotation}deg`;
  }

  input.value = val;
  dismissRotationReminder();
  if (window.updateConfigJson) window.updateConfigJson();
  showToast(`Auto-renamed to "${val}"`);
}

export function setTextureRotation(deg) {
  state.textureRotation = deg;
  const label = deg === 0 ? '0° (Default)' : `${deg}°`;
  const valEl = document.getElementById('rotationVal');
  if (valEl) valEl.textContent = label;
  [0, 90, 180, 270].forEach(d => {
    const btn = document.getElementById(`rotBtn${d}`);
    if (btn) {
      if (d === deg) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  if (window.renderAllMaps) window.renderAllMaps();
  if (window.updateDecalAspectUI) window.updateDecalAspectUI();
  checkRotationNameReminder();
  showToast(`Texture rotation: ${deg}°`);
}

export function toggleFlipHorizontal() {
  state.flipH = !state.flipH;
  const btn = document.getElementById('btnFlipH');
  if (btn) {
    if (state.flipH) {
      btn.style.borderColor = 'var(--primary)';
      btn.style.color = 'var(--primary)';
      btn.style.background = 'rgba(0, 168, 255, 0.15)';
    } else {
      btn.style.borderColor = 'var(--border-color)';
      btn.style.color = 'var(--text-muted)';
      btn.style.background = 'var(--bg-card)';
    }
  }
  if (window.renderAllMaps) window.renderAllMaps();
  checkRotationNameReminder();
  showToast(state.flipH ? 'Flipped Horizontally' : 'Horizontal Flip Cleared');
}

export function toggleFlipVertical() {
  state.flipV = !state.flipV;
  const btn = document.getElementById('btnFlipV');
  if (btn) {
    if (state.flipV) {
      btn.style.borderColor = 'var(--primary)';
      btn.style.color = 'var(--primary)';
      btn.style.background = 'rgba(0, 168, 255, 0.15)';
    } else {
      btn.style.borderColor = 'var(--border-color)';
      btn.style.color = 'var(--text-muted)';
      btn.style.background = 'var(--bg-card)';
    }
  }
  if (window.renderAllMaps) window.renderAllMaps();
  checkRotationNameReminder();
  showToast(state.flipV ? 'Flipped Vertically' : 'Vertical Flip Cleared');
}

// Collapsible Left-Hand Tool Sections Handlers
const SIDEBAR_SECTIONS_STORAGE_KEY = 'cs2_sidebar_sections_state_v2';

export function toggleSection(sectionId) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;
  const isCollapsed = sec.classList.toggle('collapsed');
  const header = sec.querySelector('.collapsible-header');
  if (header) {
    header.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
  }
  try {
    const s = JSON.parse(localStorage.getItem(SIDEBAR_SECTIONS_STORAGE_KEY) || '{}');
    s[sectionId] = isCollapsed ? 'collapsed' : 'open';
    localStorage.setItem(SIDEBAR_SECTIONS_STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
}

export function openAndScrollToSection(sectionId, targetChildId = null) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;

  // 1. Expand section if it is currently collapsed
  if (sec.classList.contains('collapsed')) {
    sec.classList.remove('collapsed');
    const header = sec.querySelector('.collapsible-header');
    if (header) {
      header.setAttribute('aria-expanded', 'true');
    }
    try {
      const s = JSON.parse(localStorage.getItem(SIDEBAR_SECTIONS_STORAGE_KEY) || '{}');
      s[sectionId] = 'open';
      localStorage.setItem(SIDEBAR_SECTIONS_STORAGE_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  // 2. Wait for layout reflow and smoothly scroll target into view
  requestAnimationFrame(() => {
    setTimeout(() => {
      const target = targetChildId ? (document.getElementById(targetChildId) || sec) : sec;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 3. Highlight custom upload target box
      if (targetChildId) {
        const highlightEl = document.getElementById(targetChildId);
        if (highlightEl) {
          highlightEl.classList.remove('section-target-highlight');
          void highlightEl.offsetWidth; // trigger reflow
          highlightEl.classList.add('section-target-highlight');
          setTimeout(() => {
            highlightEl.classList.remove('section-target-highlight');
          }, 2600);
        }
      }

      // 4. Optionally focus the custom normal button
      const customBtn = document.getElementById('btnInsertCustomNormal');
      if (customBtn && typeof customBtn.focus === 'function') {
        customBtn.focus({ preventScroll: true });
      }
    }, 45);
  });
}

export function scrollToNormalMapArea() {
  openAndScrollToSection('secToolsNormal', 'groupCustomNormalMap');
  showToast('Opened Normal Map section');
}


export function expandAllSections() {
  document.querySelectorAll('.collapsible-section').forEach(sec => {
    sec.classList.remove('collapsed');
    const header = sec.querySelector('.collapsible-header');
    if (header) header.setAttribute('aria-expanded', 'true');
  });
  try {
    const s = {};
    document.querySelectorAll('.collapsible-section').forEach(sec => {
      s[sec.id] = 'open';
    });
    localStorage.setItem(SIDEBAR_SECTIONS_STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
  showToast('All tool sections expanded');
}

export function collapseAllSections() {
  document.querySelectorAll('.collapsible-section').forEach(sec => {
    sec.classList.add('collapsed');
    const header = sec.querySelector('.collapsible-header');
    if (header) header.setAttribute('aria-expanded', 'false');
  });
  try {
    const s = {};
    document.querySelectorAll('.collapsible-section').forEach(sec => {
      s[sec.id] = 'collapsed';
    });
    localStorage.setItem(SIDEBAR_SECTIONS_STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
  showToast('All tool sections collapsed');
}

export function restoreSidebarSectionsState() {
  try {
    // Clean up legacy key if present so it doesn't interfere
    localStorage.removeItem('cs2_sidebar_sections_state');

    const saved = localStorage.getItem(SIDEBAR_SECTIONS_STORAGE_KEY);
    if (!saved) {
      // Default: ensure Section 1 (Source Image Input) is open so user can immediately drop/pick images
      document.querySelectorAll('.collapsible-section').forEach(sec => {
        const isOpen = sec.id === 'secToolsSource';
        sec.classList.toggle('collapsed', !isOpen);
        const header = sec.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      return;
    }
    const s = JSON.parse(saved);
    document.querySelectorAll('.collapsible-section').forEach(sec => {
      const isCollapsed = s[sec.id] !== 'open';
      if (isCollapsed) {
        sec.classList.add('collapsed');
      } else {
        sec.classList.remove('collapsed');
      }
      const header = sec.querySelector('.collapsible-header');
      if (header) header.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    });
  } catch (e) {}
}

// Unsaved Modal
export function hasActiveWork() {
  return Boolean(
    (state.isCustomImageLoaded && state.hasUnsavedChanges) ||
    state.customNormalImg ||
    state.customMaskImg
  );
}

export function openUnsavedModal(customMessage) {
  const assetName = document.getElementById('assetName') ? document.getElementById('assetName').value.trim() : 'Custom Asset';
  const nameEl = document.getElementById('unsavedAssetName');
  if (nameEl) nameEl.textContent = assetName || 'Custom Asset';
  const modal = document.getElementById('unsavedGuardModal');
  if (modal) {
    const pEl = modal.querySelector('.modal-body p');
    if (pEl) {
      const msg = customMessage || 'Loading a different graphic or preset will clear what you are currently doing.';
      pEl.innerHTML = `${msg} You currently have active work (<strong id="unsavedAssetName" style="color: var(--primary);">${assetName || 'Custom Asset'}</strong>). <strong>Do you want to continue?</strong>`;
    }
    modal.style.display = 'flex';
  }
}

export function closeUnsavedModal() {
  const modal = document.getElementById('unsavedGuardModal');
  if (modal) modal.style.display = 'none';
}

export function closeUnsavedModalOnBackdrop(e) {
  if (e.target && e.target.id === 'unsavedGuardModal') {
    cancelGuardAction();
  }
}

export function confirmGuardSaveAndContinue() {
  if (window.saveProjectToFile) window.saveProjectToFile();
  closeUnsavedModal();
  if (typeof state.pendingGuardAction === 'function') {
    const act = state.pendingGuardAction;
    state.pendingGuardAction = null;
    act();
  }
}

export function confirmGuardContinueWithoutSaving() {
  closeUnsavedModal();
  if (typeof state.pendingGuardAction === 'function') {
    const act = state.pendingGuardAction;
    state.pendingGuardAction = null;
    act();
  }
}

export function cancelGuardAction() {
  closeUnsavedModal();
  state.pendingGuardAction = null;
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';
  const projectInput = document.getElementById('projectFileInput');
  if (projectInput) projectInput.value = '';
  const zipInput = document.getElementById('zipInput');
  if (zipInput) zipInput.value = '';
  const folderInput = document.getElementById('folderInput');
  if (folderInput) folderInput.value = '';
  const filesInput = document.getElementById('filesInput');
  if (filesInput) filesInput.value = '';
  showToast('Action cancelled — current asset kept');
}

export function toggleAlwaysAskWhereToSave(enabled) {
  state.askWhereToSave = !!enabled;
  try {
    localStorage.setItem('cs2_ask_where_to_save', state.askWhereToSave ? 'true' : 'false');
  } catch (_) {}
  showToast(state.askWhereToSave 
    ? 'Save prompt: Native "Save As" file dialog active' 
    : 'Save prompt: Direct browser downloads active');
}

export function setHideSamplePresets(hide, triggerToast = true) {
  state.hideSamplePresets = !!hide;
  try {
    localStorage.setItem('cs2_hide_sample_presets', state.hideSamplePresets ? 'true' : 'false');
  } catch (_) {}
  if (typeof window.applySamplePresetsVisibilityUI === 'function') {
    window.applySamplePresetsVisibilityUI();
  }
  if (triggerToast) {
    showToast(state.hideSamplePresets 
      ? 'Sample presets hidden (unhide anytime via menu or sidebar)' 
      : 'Sample presets restored and visible');
  }
}

export function toggleHideSamplePresets(forceState) {
  const next = typeof forceState === 'boolean' ? forceState : !state.hideSamplePresets;
  setHideSamplePresets(next, true);
  return next;
}

// ==========================================
// 3-in-1 Set Slots Helpers
// ==========================================
export function getSlot(mode) {
  if (!state.setSlots) return null;
  return state.setSlots[mode] || null;
}

export function isSlotLoaded(mode) {
  const slot = getSlot(mode);
  if (!slot) return false;
  return Boolean(slot.image || slot.isCustomImageLoaded || (slot.thumbnail && slot.thumbnail.length > 50));
}

export function getLoadedSlotsCount() {
  let count = 0;
  if (isSlotLoaded('decal')) count++;
  if (isSlotLoaded('surface')) count++;
  if (isSlotLoaded('netlane')) count++;
  return count;
}

export function getLoadedSlots() {
  const loaded = [];
  ['decal', 'surface', 'netlane'].forEach(mode => {
    if (isSlotLoaded(mode)) {
      loaded.push(state.setSlots[mode]);
    }
  });
  return loaded;
}

