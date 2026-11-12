// ==========================================
// Cities: Skylines 2 Custom Asset Generator
// Icon Backdrop & 4-Layer Badge Overlays Engine
// ==========================================

import { state, showToast, getCanvases, drawImageSquare } from './state.js';
import { getEl, setElText, setElValue, setElChecked, setElDisplay, syncActiveClass } from './domUtils.js';

export const BADGE_DEFAULTS_KEY = 'cs2_icon_badge_defaults';
export const CUSTOM_GOOGLE_FONTS_KEY = 'cs2_custom_google_fonts';

export const DEFAULT_FONT_OPTIONS = [
  { label: 'Inter / Sans-Serif (Default)', value: "'Inter', system-ui, -apple-system, sans-serif" },
  { label: 'Montserrat / Geometric Bold', value: "'Montserrat', 'Inter', sans-serif" },
  { label: 'Oswald / Condensed Industrial', value: "'Oswald', Impact, sans-serif" },
  { label: 'Bebas Neue / Tall Highway', value: "'Bebas Neue', Impact, sans-serif" },
  { label: 'Orbitron / Sci-Fi Tech', value: "'Orbitron', sans-serif" },
  { label: 'Rajdhani / Tactical Modern', value: "'Rajdhani', sans-serif" },
  { label: 'JetBrains Mono / Technical Code', value: "'JetBrains Mono', monospace" },
  { label: 'Playfair Display / Classic Serif', value: "'Playfair Display', Georgia, serif" }
];

export const BADGE_COLOR_THEMES = {
  cyan: { bg1: '#0a192f', bg2: '#0f2942', stroke: '#38bdf8', text: '#ffffff' },
  purple: { bg1: '#151326', bg2: '#251336', stroke: '#c084fc', text: '#ffffff' },
  emerald: { bg1: '#06241a', bg2: '#0d3d2c', stroke: '#34d399', text: '#ffffff' },
  amber: { bg1: '#241806', bg2: '#3d2a0d', stroke: '#fbbf24', text: '#ffffff' },
  crimson: { bg1: '#280a10', bg2: '#42101a', stroke: '#f87171', text: '#ffffff' },
  slate: { bg1: '#0f172a', bg2: '#1e293b', stroke: '#94a3b8', text: '#f8fafc' },
  orange: { bg1: '#2a1205', bg2: '#431d08', stroke: '#fb923c', text: '#ffffff' },
  gold: { bg1: '#1c1917', bg2: '#292524', stroke: '#facc15', text: '#fef08a' }
};

export const GRADIENT_PRESETS = {
  ocean: { c1: '#0a192f', c2: '#0f2942', stroke: '#38bdf8', text: '#ffffff' },
  neon: { c1: '#082032', c2: '#0e3746', stroke: '#00e5ff', text: '#ffffff' },
  violet: { c1: '#151326', c2: '#251336', stroke: '#c084fc', text: '#ffffff' },
  cyber: { c1: '#1e0b28', c2: '#0d1b3e', stroke: '#f472b6', text: '#ffffff' },
  sunset: { c1: '#241806', c2: '#3d2a0d', stroke: '#fbbf24', text: '#ffffff' },
  forest: { c1: '#06241a', c2: '#0d3d2c', stroke: '#34d399', text: '#ffffff' },
  ruby: { c1: '#280a10', c2: '#42101a', stroke: '#f87171', text: '#ffffff' },
  stealth: { c1: '#0f172a', c2: '#1e293b', stroke: '#94a3b8', text: '#f8fafc' },
  gold: { c1: '#221a07', c2: '#3b2d0c', stroke: '#facc15', text: '#fef08a' }
};

export const TEXT_GRAD_PRESETS = {
  sky: { c1: '#ffffff', c2: '#38bdf8' },
  cyan: { c1: '#ffffff', c2: '#00e5ff' },
  violet: { c1: '#ffffff', c2: '#c084fc' },
  emerald: { c1: '#ffffff', c2: '#34d399' },
  amber: { c1: '#ffffff', c2: '#fbbf24' },
  gold: { c1: '#fef08a', c2: '#f59e0b' },
  fire: { c1: '#fde047', c2: '#ef4444' },
  chrome: { c1: '#ffffff', c2: '#94a3b8' },
  silver: { c1: '#ffffff', c2: '#cbd5e1' },
  neon: { c1: '#f472b6', c2: '#38bdf8' }
};

export const SERIES_PRESET_MAP = {
  graffiti: { text: 'GRAFFITI', theme: 'purple' },
  poster: { text: 'POSTERS', theme: 'cyan' },
  transit: { text: 'TRANSIT', theme: 'emerald' },
  props: { text: 'PROPS', theme: 'slate' },
  hazard: { text: 'HAZARD', theme: 'amber' },
  nature: { text: 'NATURE', theme: 'emerald' }
};

// Metadata mapping for the 4 badge layers
export const BADGE_CONFIG = {
  1: {
    index: 1,
    key: 'creator',
    enableCheckboxId: 'enableBadge1',
    gridCheckboxId: 'toggleGridOverlay1',
    mainCheckboxId: 'toggleMainOverlay1',
    wizardCheckboxId: 'wizEnableBadge1',
    modeSelectId: 'creatorModeSelect',
    textSectionId: 'creatorTextSection',
    imageSectionId: 'creatorImageSection',
    presetSectionId: 'creatorPresetSection',
    textInputId: 'badge1TextInput',
    textLengthBadgeId: 'badge1TextLengthBadge',
    fontSelectId: 'badge1FontFamily',
    boldBtnId: 'btnBadge1Bold',
    italicBtnId: 'btnBadge1Italic',
    spacingBtnId: 'btnBadge1LetterSpacing',
    ptSizeId: 'badge1PtSize',
    ptSizeValId: 'badge1PtSizeVal',
    textGradEnableId: 'badge1TextGradEnable',
    textGradControlsId: 'badge1TextGradControls',
    textGrad1Id: 'badge1TextGrad1',
    textGrad1HexId: 'badge1TextGrad1Hex',
    textGrad2Id: 'badge1TextGrad2',
    textGrad2HexId: 'badge1TextGrad2Hex',
    textGradDirId: 'creatorTextGradDirSelect',
    colorModeSelectId: 'creatorColorModeSelect',
    colorModeBadgeId: 'creatorColorModeBadge',
    themePanelId: 'creatorColorThemePanel',
    gradPanelId: 'creatorCustomGradPanel',
    solidPanelId: 'creatorCustomSolidPanel',
    themeSelectId: 'creatorThemeSelect',
    gradPreviewId: 'creatorGradPreview',
    gradDirSelectId: 'creatorGradDirSelect',
    color1Id: 'creatorColor1',
    color1HexId: 'creatorColor1Hex',
    color2Id: 'creatorColor2',
    color2HexId: 'creatorColor2Hex',
    strokeColorId: 'creatorStrokeColor',
    strokeHexId: 'creatorStrokeHex',
    textColorId: 'creatorTextColor',
    textColorHexId: 'creatorTextColorHex',
    solidBgId: 'creatorSolidBg',
    solidBgHexId: 'creatorSolidBgHex',
    solidStrokeId: 'creatorSolidStroke',
    solidStrokeHexId: 'creatorSolidStrokeHex',
    solidTextId: 'creatorSolidText',
    solidTextHexId: 'creatorSolidTextHex',
    positionSelectId: 'logoPosition',
    customPosContainerId: 'creatorCustomPosContainer',
    posXId: 'creatorPosX',
    posXValId: 'creatorPosXVal',
    posYId: 'creatorPosY',
    posYValId: 'creatorPosYVal',
    frameSelectId: 'badge1Frame',
    scaleId: 'badgeScale',
    scaleValId: 'badgeScaleVal',
    paddingId: 'badge1Padding',
    paddingValId: 'badge1PaddingVal',
    innerPaddingId: 'badge1InnerPadding',
    innerPaddingValId: 'badge1InnerPaddingVal',
    opacityId: 'badgeOpacity',
    opacityValId: 'badgeOpacityVal',
    imgStateKey: 'designerLogoImg',
    fileNameStateKey: 'badge1FileName',
    uploadBtnTextId: 'logoUploadBtnText',
    clearLogoBtnId: 'btnClearLogo'
  },
  2: {
    index: 2,
    key: 'series',
    enableCheckboxId: 'enableBadge2',
    gridCheckboxId: 'toggleGridOverlay2',
    mainCheckboxId: 'toggleMainOverlay2',
    wizardCheckboxId: 'wizEnableBadge2',
    modeSelectId: 'seriesModeSelect',
    textSectionId: 'seriesTextSection',
    imageSectionId: 'seriesImageSection',
    presetSectionId: 'seriesPresetSection',
    textInputId: 'seriesTextInput',
    textLengthBadgeId: 'seriesTextLengthBadge',
    fontSelectId: 'seriesFontFamily',
    boldBtnId: 'btnSeriesBold',
    italicBtnId: 'btnSeriesItalic',
    spacingBtnId: 'btnSeriesLetterSpacing',
    ptSizeId: 'seriesPtSize',
    ptSizeValId: 'seriesPtSizeVal',
    textGradEnableId: 'badge2TextGradEnable',
    textGradControlsId: 'badge2TextGradControls',
    textGrad1Id: 'badge2TextGrad1',
    textGrad1HexId: 'badge2TextGrad1Hex',
    textGrad2Id: 'badge2TextGrad2',
    textGrad2HexId: 'badge2TextGrad2Hex',
    textGradDirId: 'seriesTextGradDirSelect',
    colorModeSelectId: 'seriesColorModeSelect',
    colorModeBadgeId: 'seriesColorModeBadge',
    themePanelId: 'seriesColorThemePanel',
    gradPanelId: 'seriesCustomGradPanel',
    solidPanelId: 'seriesCustomSolidPanel',
    themeSelectId: 'seriesThemeSelect',
    gradPreviewId: 'seriesGradPreview',
    gradDirSelectId: 'seriesGradDirSelect',
    color1Id: 'seriesColor1',
    color1HexId: 'seriesColor1Hex',
    color2Id: 'seriesColor2',
    color2HexId: 'seriesColor2Hex',
    strokeColorId: 'seriesStrokeColor',
    strokeHexId: 'seriesStrokeHex',
    textColorId: 'seriesTextColor',
    textColorHexId: 'seriesTextColorHex',
    solidBgId: 'seriesSolidBg',
    solidBgHexId: 'seriesSolidBgHex',
    solidStrokeId: 'seriesSolidStroke',
    solidStrokeHexId: 'seriesSolidStrokeHex',
    solidTextId: 'seriesSolidText',
    solidTextHexId: 'seriesSolidTextHex',
    positionSelectId: 'seriesPosition',
    customPosContainerId: 'seriesCustomPosContainer',
    posXId: 'seriesPosX',
    posXValId: 'seriesPosXVal',
    posYId: 'seriesPosY',
    posYValId: 'seriesPosYVal',
    frameSelectId: 'badge2Frame',
    scaleId: 'seriesScale',
    scaleValId: 'seriesScaleVal',
    paddingId: 'seriesPadding',
    paddingValId: 'seriesPaddingVal',
    innerPaddingId: 'seriesInnerPadding',
    innerPaddingValId: 'seriesInnerPaddingVal',
    opacityId: 'seriesOpacity',
    opacityValId: 'seriesOpacityVal',
    imgStateKey: 'badge2Img',
    fileNameStateKey: 'badge2FileName',
    uploadBtnTextId: 'seriesLogoUploadBtnText',
    clearLogoBtnId: 'btnClearSeriesLogo'
  },
  3: {
    index: 3,
    key: 'extra1',
    enableCheckboxId: 'enableBadge3',
    gridCheckboxId: 'toggleGridOverlay3',
    mainCheckboxId: 'toggleMainOverlay3',
    wizardCheckboxId: null,
    modeSelectId: 'extra1ModeSelect',
    textSectionId: 'extra1TextSection',
    imageSectionId: 'extra1ImageSection',
    presetSectionId: 'extra1PresetSection',
    textInputId: 'extra1TextInput',
    textLengthBadgeId: 'extra1TextLengthBadge',
    fontSelectId: 'extra1FontFamily',
    boldBtnId: 'btnExtra1Bold',
    italicBtnId: 'btnExtra1Italic',
    spacingBtnId: 'btnExtra1LetterSpacing',
    ptSizeId: 'extra1PtSize',
    ptSizeValId: 'extra1PtSizeVal',
    textGradEnableId: 'badge3TextGradEnable',
    textGradControlsId: 'badge3TextGradControls',
    textGrad1Id: 'badge3TextGrad1',
    textGrad1HexId: 'badge3TextGrad1Hex',
    textGrad2Id: 'badge3TextGrad2',
    textGrad2HexId: 'badge3TextGrad2Hex',
    textGradDirId: 'extra1TextGradDirSelect',
    colorModeSelectId: 'extra1ColorModeSelect',
    colorModeBadgeId: 'extra1ColorModeBadge',
    themePanelId: 'extra1ColorThemePanel',
    gradPanelId: 'extra1CustomGradPanel',
    solidPanelId: 'extra1CustomSolidPanel',
    themeSelectId: 'extra1ThemeSelect',
    gradPreviewId: 'extra1GradPreview',
    gradDirSelectId: null,
    color1Id: 'extra1Color1',
    color1HexId: 'extra1Color1Hex',
    color2Id: 'extra1Color2',
    color2HexId: 'extra1Color2Hex',
    strokeColorId: 'extra1StrokeColor',
    strokeHexId: 'extra1StrokeHex',
    textColorId: 'extra1TextColor',
    textColorHexId: 'extra1TextColorHex',
    solidBgId: 'extra1SolidBg',
    solidBgHexId: 'extra1SolidBgHex',
    solidStrokeId: 'extra1SolidStroke',
    solidStrokeHexId: 'extra1SolidStrokeHex',
    solidTextId: 'extra1SolidText',
    solidTextHexId: 'extra1SolidTextHex',
    positionSelectId: 'extra1Position',
    customPosContainerId: 'extra1CustomPosContainer',
    posXId: 'extra1PosX',
    posXValId: 'extra1PosXVal',
    posYId: 'extra1PosY',
    posYValId: 'extra1PosYVal',
    frameSelectId: 'badge3Frame',
    scaleId: 'extra1Scale',
    scaleValId: 'extra1ScaleVal',
    paddingId: 'extra1Padding',
    paddingValId: 'extra1PaddingVal',
    innerPaddingId: null,
    innerPaddingValId: null,
    opacityId: 'extra1Opacity',
    opacityValId: 'extra1OpacityVal',
    imgStateKey: 'badge3Img',
    fileNameStateKey: 'badge3FileName',
    uploadBtnTextId: 'extra1LogoUploadBtnText',
    clearLogoBtnId: 'btnClearExtra1Logo'
  },
  4: {
    index: 4,
    key: 'extra2',
    enableCheckboxId: 'enableBadge4',
    gridCheckboxId: 'toggleGridOverlay4',
    mainCheckboxId: 'toggleMainOverlay4',
    wizardCheckboxId: null,
    modeSelectId: 'extra2ModeSelect',
    textSectionId: 'extra2TextSection',
    imageSectionId: 'extra2ImageSection',
    presetSectionId: 'extra2PresetSection',
    textInputId: 'extra2TextInput',
    textLengthBadgeId: 'extra2TextLengthBadge',
    fontSelectId: 'extra2FontFamily',
    boldBtnId: 'btnExtra2Bold',
    italicBtnId: 'btnExtra2Italic',
    spacingBtnId: 'btnExtra2LetterSpacing',
    ptSizeId: 'extra2PtSize',
    ptSizeValId: 'extra2PtSizeVal',
    textGradEnableId: 'badge4TextGradEnable',
    textGradControlsId: 'badge4TextGradControls',
    textGrad1Id: 'badge4TextGrad1',
    textGrad1HexId: 'badge4TextGrad1Hex',
    textGrad2Id: 'badge4TextGrad2',
    textGrad2HexId: 'badge4TextGrad2Hex',
    textGradDirId: 'extra2TextGradDirSelect',
    colorModeSelectId: 'extra2ColorModeSelect',
    colorModeBadgeId: 'extra2ColorModeBadge',
    themePanelId: 'extra2ColorThemePanel',
    gradPanelId: 'extra2CustomGradPanel',
    solidPanelId: 'extra2CustomSolidPanel',
    themeSelectId: 'extra2ThemeSelect',
    gradPreviewId: 'extra2GradPreview',
    gradDirSelectId: null,
    color1Id: 'extra2Color1',
    color1HexId: 'extra2Color1Hex',
    color2Id: 'extra2Color2',
    color2HexId: 'extra2Color2Hex',
    strokeColorId: 'extra2StrokeColor',
    strokeHexId: 'extra2StrokeHex',
    textColorId: 'extra2TextColor',
    textColorHexId: 'extra2TextColorHex',
    solidBgId: 'extra2SolidBg',
    solidBgHexId: 'extra2SolidBgHex',
    solidStrokeId: 'extra2SolidStroke',
    solidStrokeHexId: 'extra2SolidStrokeHex',
    solidTextId: 'extra2SolidText',
    solidTextHexId: 'extra2SolidTextHex',
    positionSelectId: 'extra2Position',
    customPosContainerId: 'extra2CustomPosContainer',
    posXId: 'extra2PosX',
    posXValId: 'extra2PosXVal',
    posYId: 'extra2PosY',
    posYValId: 'extra2PosYVal',
    frameSelectId: 'badge4Frame',
    scaleId: 'extra2Scale',
    scaleValId: 'extra2ScaleVal',
    paddingId: 'extra2Padding',
    paddingValId: 'extra2PaddingVal',
    innerPaddingId: null,
    innerPaddingValId: null,
    opacityId: 'extra2Opacity',
    opacityValId: 'extra2OpacityVal',
    imgStateKey: 'badge4Img',
    fileNameStateKey: 'badge4FileName',
    uploadBtnTextId: 'extra2LogoUploadBtnText',
    clearLogoBtnId: 'btnClearExtra2Logo'
  }
};

function getCfgByKeyOrIndex(target) {
  if (typeof target === 'number') return BADGE_CONFIG[target] || BADGE_CONFIG[1];
  const str = String(target || '').toLowerCase();
  if (str === 'series' || str === '2') return BADGE_CONFIG[2];
  if (str === 'extra1' || str === '3') return BADGE_CONFIG[3];
  if (str === 'extra2' || str === '4') return BADGE_CONFIG[4];
  return BADGE_CONFIG[1];
}

// ==========================================
// Google Fonts Management
// ==========================================

function getStoredGoogleFonts() {
  try {
    const raw = localStorage.getItem(CUSTOM_GOOGLE_FONTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function loadGoogleFont(fontName) {
  const clean = String(fontName || '').trim();
  if (!clean) return;
  const id = `gfont-${clean.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }
}

export function populateFontDropdowns() {
  const customFonts = getStoredGoogleFonts();
  customFonts.forEach((f) => loadGoogleFont(f));

  const allOptions = [
    ...DEFAULT_FONT_OPTIONS,
    ...customFonts.map((f) => ({ label: `${f} (Google Font)`, value: `'${f}', sans-serif` }))
  ];

  [1, 2, 3, 4].forEach((idx) => {
    const sel = getEl(BADGE_CONFIG[idx].fontSelectId);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = allOptions
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join('');
    if (prev && Array.from(sel.options).some((o) => o.value === prev)) {
      sel.value = prev;
    }
  });
}

export function toggleGoogleFontInput(target) {
  const cfg = getCfgByKeyOrIndex(target);
  const row = getEl(`${cfg.key}GoogleFontRow`);
  if (!row) return;
  const isShown = row.classList.toggle('active');
  row.style.display = isShown ? 'block' : 'none';
}

export function addCustomGoogleFontFromInput(target, silent = false) {
  const cfg = getCfgByKeyOrIndex(target);
  const input = getEl(`${cfg.key}GoogleFontInput`);
  const fontName = input?.value?.trim();
  if (!fontName) return;

  loadGoogleFont(fontName);
  const list = getStoredGoogleFonts();
  if (!list.includes(fontName)) {
    list.push(fontName);
    try {
      localStorage.setItem(CUSTOM_GOOGLE_FONTS_KEY, JSON.stringify(list));
    } catch (_) {}
  }
  populateFontDropdowns();
  const sel = getEl(cfg.fontSelectId);
  if (sel) sel.value = `'${fontName}', sans-serif`;
  if (input) input.value = '';
  renderIconMap();
  if (!silent) showToast(`Loaded Google Font "${fontName}"`);
}

// ==========================================
// Badge Tabs & Subtabs Navigation
// ==========================================

export function switchBadgeTab(tab) {
  const isBackdrop = tab === 'backdrop';
  syncActiveClass('tabBadgeBackdrop', isBackdrop);
  syncActiveClass('tabBadgeOverlays', !isBackdrop);
  setElDisplay('panelBadgeBackdrop', isBackdrop ? 'block' : 'none');
  setElDisplay('panelBadgeOverlays', isBackdrop ? 'none' : 'block');
}

export function switchBadgeSubtab(sub) {
  const map = {
    creator: { btn: 'subtabCreator', panel: 'panelBadgeCreator', badgeLabel: 'Overlay 1/4' },
    series: { btn: 'subtabSeries', panel: 'panelBadgeSeries', badgeLabel: 'Overlay 2/4' },
    extra1: { btn: 'subtabExtra1', panel: 'panelBadgeExtra1', badgeLabel: 'Overlay 3/4' },
    extra2: { btn: 'subtabExtra2', panel: 'panelBadgeExtra2', badgeLabel: 'Overlay 4/4' },
    defaults: { btn: 'subtabDefaults', panel: 'panelBadgeDefaults', badgeLabel: 'Defaults' }
  };
  Object.entries(map).forEach(([k, info]) => {
    const active = k === sub;
    syncActiveClass(info.btn, active);
    const panel = getEl(info.panel);
    if (panel) {
      panel.classList.toggle('active', active);
      panel.style.display = active ? 'block' : 'none';
    }
    if (active && info.badgeLabel) {
      setElText('activeOverlayLayerBadge', info.badgeLabel);
    }
  });
  setElValue('badgeLayerSelect', sub);
}

export function syncAllBadgeCheckboxes() {
  [1, 2, 3, 4].forEach((idx) => {
    const cfg = BADGE_CONFIG[idx];
    const enabled = Boolean(state[`badge${idx}Enabled`]);
    setElChecked(cfg.enableCheckboxId, enabled);
    setElChecked(cfg.gridCheckboxId, enabled);
    setElChecked(cfg.mainCheckboxId, enabled);
    if (cfg.wizardCheckboxId) setElChecked(cfg.wizardCheckboxId, enabled);
  });
}

// ==========================================
// Parameterized Badge Layer Controllers
// ==========================================

function toggleBadgeLayerEnable(idx, checked) {
  const cfg = BADGE_CONFIG[idx];
  const val = typeof checked === 'boolean' ? checked : Boolean(getEl(cfg.enableCheckboxId)?.checked);
  state[`badge${idx}Enabled`] = val;
  syncAllBadgeCheckboxes();
  renderIconMap();
}

function setBadgeLayerMode(idx, mode) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.modeSelectId, mode);
  if (cfg.textSectionId) setElDisplay(cfg.textSectionId, mode === 'text' ? 'block' : 'none');
  if (cfg.imageSectionId) setElDisplay(cfg.imageSectionId, mode === 'image' ? 'block' : 'none');
  if (cfg.presetSectionId) setElDisplay(cfg.presetSectionId, mode === 'preset' ? 'block' : 'none');
  renderIconMap();
}

function onBadgeLayerTextChange(idx) {
  const cfg = BADGE_CONFIG[idx];
  const text = getEl(cfg.textInputId)?.value || '';
  setElText(cfg.textLengthBadgeId, `${text.length} / ${idx === 1 ? 18 : 20}`);
  if (text.trim().length > 0 && !state[`badge${idx}Enabled`]) {
    state[`badge${idx}Enabled`] = true;
    syncAllBadgeCheckboxes();
  }
  renderIconMap();
}

function clearBadgeLayerText(idx) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.textInputId, '');
  onBadgeLayerTextChange(idx);
}

function setBadgeLayerTextPreset(idx, val) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.textInputId, val);
  onBadgeLayerTextChange(idx);
}

function toggleBadgeLayerTypoBtn(idx, btnKey) {
  const cfg = BADGE_CONFIG[idx];
  const btn = getEl(cfg[btnKey]);
  if (btn) btn.classList.toggle('active');
  renderIconMap();
}

function onBadgeLayerPtSizeChange(idx) {
  const cfg = BADGE_CONFIG[idx];
  const val = getEl(cfg.ptSizeId)?.value || '13';
  setElText(cfg.ptSizeValId, `${val} pt`);
  renderIconMap();
}

function toggleBadgeLayerTextGrad(idx, checked) {
  const cfg = BADGE_CONFIG[idx];
  const enabled = typeof checked === 'boolean' ? checked : Boolean(getEl(cfg.textGradEnableId)?.checked);
  setElChecked(cfg.textGradEnableId, enabled);
  setElDisplay(cfg.textGradControlsId, enabled ? 'block' : 'none');
  renderIconMap();
}

function onBadgeLayerTextGradInput(idx) {
  const cfg = BADGE_CONFIG[idx];
  setElText(cfg.textGrad1HexId, getEl(cfg.textGrad1Id)?.value || '#ffffff');
  setElText(cfg.textGrad2HexId, getEl(cfg.textGrad2Id)?.value || '#38bdf8');
  renderIconMap();
}

function setBadgeLayerTextGradDir(idx, dir) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.textGradDirId, dir);
  renderIconMap();
}

function applyBadgeLayerTextGradPreset(idx, presetName) {
  const cfg = BADGE_CONFIG[idx];
  const p = TEXT_GRAD_PRESETS[presetName];
  if (!p) return;
  setElValue(cfg.textGrad1Id, p.c1);
  setElValue(cfg.textGrad2Id, p.c2);
  onBadgeLayerTextGradInput(idx);
}

function updateBadgeLayerGradPreview(idx) {
  const cfg = BADGE_CONFIG[idx];
  const bar = getEl(cfg.gradPreviewId);
  if (!bar) return;
  const c1 = getEl(cfg.color1Id)?.value || '#0a192f';
  const c2 = getEl(cfg.color2Id)?.value || '#0f2942';
  const dir = getEl(cfg.gradDirSelectId)?.value || 'diagonal';
  const angle = dir === 'horizontal' ? '90deg' : dir === 'vertical' ? '180deg' : '135deg';
  bar.style.background = `linear-gradient(${angle}, ${c1}, ${c2})`;
}

function setBadgeLayerColorMode(idx, mode) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.colorModeSelectId, mode);
  setElDisplay(cfg.themePanelId, mode === 'theme' ? 'block' : 'none');
  setElDisplay(cfg.gradPanelId, mode === 'gradient' ? 'block' : 'none');
  setElDisplay(cfg.solidPanelId, mode === 'solid' ? 'block' : 'none');
  const label = mode === 'gradient' ? 'Gradient' : mode === 'solid' ? 'Solid' : 'Themes';
  setElText(cfg.colorModeBadgeId, label);
  renderIconMap();
}

function setBadgeLayerColorTheme(idx, theme) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.themeSelectId, theme);
  renderIconMap();
}

function setBadgeLayerGradDirection(idx, dir) {
  const cfg = BADGE_CONFIG[idx];
  if (cfg.gradDirSelectId) setElValue(cfg.gradDirSelectId, dir);
  updateBadgeLayerGradPreview(idx);
  renderIconMap();
}

function onBadgeLayerCustomColorInput(idx) {
  const cfg = BADGE_CONFIG[idx];
  setElText(cfg.color1HexId, getEl(cfg.color1Id)?.value || '');
  setElText(cfg.color2HexId, getEl(cfg.color2Id)?.value || '');
  setElText(cfg.strokeHexId, getEl(cfg.strokeColorId)?.value || '');
  setElText(cfg.textColorHexId, getEl(cfg.textColorId)?.value || '');
  updateBadgeLayerGradPreview(idx);
  renderIconMap();
}

function onBadgeLayerSolidColorInput(idx) {
  const cfg = BADGE_CONFIG[idx];
  setElText(cfg.solidBgHexId, getEl(cfg.solidBgId)?.value || '');
  setElText(cfg.solidStrokeHexId, getEl(cfg.solidStrokeId)?.value || '');
  setElText(cfg.solidTextHexId, getEl(cfg.solidTextId)?.value || '');
  renderIconMap();
}

function applyBadgeLayerGradPreset(idx, c1, c2, stroke, text) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.color1Id, c1);
  setElValue(cfg.color2Id, c2);
  if (stroke) setElValue(cfg.strokeColorId, stroke);
  if (text) setElValue(cfg.textColorId, text);
  onBadgeLayerCustomColorInput(idx);
}

function applyBadgeLayerGradPresetByName(idx, name) {
  const p = GRADIENT_PRESETS[name];
  if (!p) return;
  applyBadgeLayerGradPreset(idx, p.c1, p.c2, p.stroke, p.text);
}

function handleBadgeLayerLogoSelect(idx, event) {
  const cfg = BADGE_CONFIG[idx];
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state[cfg.imgStateKey] = img;
      state[cfg.fileNameStateKey] = file.name;
      state[`badge${idx}Enabled`] = true;
      syncAllBadgeCheckboxes();
      setElText(cfg.uploadBtnTextId, file.name);
      setElDisplay(cfg.clearLogoBtnId, 'inline-block');
      renderIconMap();
      showToast(`Loaded badge image: ${file.name}`);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearBadgeLayerLogo(idx) {
  const cfg = BADGE_CONFIG[idx];
  state[cfg.imgStateKey] = null;
  state[cfg.fileNameStateKey] = '';
  setElText(cfg.uploadBtnTextId, 'Upload Graphic...');
  setElDisplay(cfg.clearLogoBtnId, 'none');
  renderIconMap();
}

function onBadgeLayerPositionChange(idx) {
  const cfg = BADGE_CONFIG[idx];
  const pos = getEl(cfg.positionSelectId)?.value || 'custom';
  setElDisplay(cfg.customPosContainerId, pos === 'custom' ? 'block' : 'none');
  renderIconMap();
}

function onBadgeLayerCoordChange(idx) {
  const cfg = BADGE_CONFIG[idx];
  setElText(cfg.posXValId, `${getEl(cfg.posXId)?.value || 50}%`);
  setElText(cfg.posYValId, `${getEl(cfg.posYId)?.value || 50}%`);
  renderIconMap();
}

function snapBadgeLayerCoord(idx, x, y) {
  const cfg = BADGE_CONFIG[idx];
  setElValue(cfg.posXId, x);
  setElValue(cfg.posYId, y);
  onBadgeLayerCoordChange(idx);
}

function onBadgeLayerSliderChange(idx, propId, valId, suffix) {
  const cfg = BADGE_CONFIG[idx];
  const val = getEl(cfg[propId])?.value || '0';
  setElText(cfg[valId], `${val}${suffix}`);
  renderIconMap();
}

// ==========================================
// Copy Style Across Badge Layers
// ==========================================

export function copyBadgeStyle(fromKey, toKey) {
  const src = getCfgByKeyOrIndex(fromKey);
  const dst = getCfgByKeyOrIndex(toKey);
  if (!src || !dst || src.index === dst.index) return;

  const colorMode = getEl(src.colorModeSelectId)?.value || 'theme';
  setBadgeLayerColorMode(dst.index, colorMode);
  setElValue(dst.themeSelectId, getEl(src.themeSelectId)?.value || 'cyan');

  setElValue(dst.color1Id, getEl(src.color1Id)?.value || '#0a192f');
  setElValue(dst.color2Id, getEl(src.color2Id)?.value || '#0f2942');
  setElValue(dst.strokeColorId, getEl(src.strokeColorId)?.value || '#38bdf8');
  setElValue(dst.textColorId, getEl(src.textColorId)?.value || '#ffffff');
  onBadgeLayerCustomColorInput(dst.index);

  setElValue(dst.solidBgId, getEl(src.solidBgId)?.value || '#0a192f');
  setElValue(dst.solidStrokeId, getEl(src.solidStrokeId)?.value || '#38bdf8');
  setElValue(dst.solidTextId, getEl(src.solidTextId)?.value || '#ffffff');
  onBadgeLayerSolidColorInput(dst.index);

  setElValue(dst.fontSelectId, getEl(src.fontSelectId)?.value || DEFAULT_FONT_OPTIONS[0].value);
  setElValue(dst.ptSizeId, getEl(src.ptSizeId)?.value || '13');
  onBadgeLayerPtSizeChange(dst.index);
  setElValue(dst.frameSelectId, getEl(src.frameSelectId)?.value || 'pill');

  renderIconMap();
  showToast(`Copied style from ${src.key.toUpperCase()} to ${dst.key.toUpperCase()}`);
}

export function runBadgeStyleCopyAction(fromKeyOrSpec, selectEl) {
  // Handle single "source:target" string passed from #badgeStyleSyncSelect
  if (!selectEl && typeof fromKeyOrSpec === 'string' && fromKeyOrSpec.includes(':')) {
    const [srcKey, dstKey] = fromKeyOrSpec.split(':');
    if (dstKey === 'all') {
      ['creator', 'series', 'extra1', 'extra2'].forEach((k) => {
        if (k !== srcKey) copyBadgeStyle(srcKey, k);
      });
    } else if (srcKey && dstKey) {
      copyBadgeStyle(srcKey, dstKey);
    }
    return;
  }

  const fromKey = fromKeyOrSpec;
  const val = selectEl?.value;
  if (!val) return;
  if (val === 'all') {
    ['creator', 'series', 'extra1', 'extra2'].forEach((k) => {
      if (k !== fromKey) copyBadgeStyle(fromKey, k);
    });
  } else if (val.startsWith('to:')) {
    copyBadgeStyle(fromKey, val.slice(3));
  } else if (val.startsWith('from:')) {
    copyBadgeStyle(val.slice(5), fromKey);
  }
  selectEl.value = '';
}

// ==========================================
// Named Exports for Badge 1 (Creator)
// ==========================================
export const toggleBadge1Enable = (c) => toggleBadgeLayerEnable(1, c);
export const setCreatorBadgeMode = (m) => setBadgeLayerMode(1, m);
export const onBadge1TextChange = () => onBadgeLayerTextChange(1);
export const clearCreatorText = () => clearBadgeLayerText(1);
export const setBadge1TextPreset = (v) => setBadgeLayerTextPreset(1, v);
export const onBadge1FontChange = () => renderIconMap();
export const toggleBadge1Bold = () => toggleBadgeLayerTypoBtn(1, 'boldBtnId');
export const toggleBadge1Italic = () => toggleBadgeLayerTypoBtn(1, 'italicBtnId');
export const toggleBadge1LetterSpacing = () => toggleBadgeLayerTypoBtn(1, 'spacingBtnId');
export const onBadge1PtSizeChange = () => onBadgeLayerPtSizeChange(1);
export const toggleBadge1TextGrad = (c) => toggleBadgeLayerTextGrad(1, c);
export const onBadge1TextGradInput = () => onBadgeLayerTextGradInput(1);
export const setBadge1TextGradDir = (d) => setBadgeLayerTextGradDir(1, d);
export const applyBadge1TextGradPresetByName = (n) => applyBadgeLayerTextGradPreset(1, n);
export const updateCreatorGradPreview = () => updateBadgeLayerGradPreview(1);
export const setCreatorColorMode = (m) => setBadgeLayerColorMode(1, m);
export const setCreatorColorTheme = (t) => setBadgeLayerColorTheme(1, t);
export const setCreatorGradDirection = (d) => setBadgeLayerGradDirection(1, d);
export const onCreatorCustomColorInput = () => onBadgeLayerCustomColorInput(1);
export const onCreatorSolidColorInput = () => onBadgeLayerSolidColorInput(1);
export const applyCreatorGradPreset = (c1, c2, s, t) => applyBadgeLayerGradPreset(1, c1, c2, s, t);
export const applyCreatorGradPresetByName = (n) => applyBadgeLayerGradPresetByName(1, n);
export const handleDesignerLogoSelect = (e) => handleBadgeLayerLogoSelect(1, e);
export const clearDesignerLogo = () => clearBadgeLayerLogo(1);
export const onCreatorPositionChange = () => onBadgeLayerPositionChange(1);
export const onCreatorCoordChange = () => onBadgeLayerCoordChange(1);
export const snapCreatorCoord = (x, y) => snapBadgeLayerCoord(1, x, y);
export const onBadge1PaddingChange = () => onBadgeLayerSliderChange(1, 'paddingId', 'paddingValId', ' px');
export const onBadge1InnerPaddingChange = () => onBadgeLayerSliderChange(1, 'innerPaddingId', 'innerPaddingValId', ' px');
export const onIconBadgeScaleChange = () => onBadgeLayerSliderChange(1, 'scaleId', 'scaleValId', '%');
export const onIconBadgeOpacityChange = () => onBadgeLayerSliderChange(1, 'opacityId', 'opacityValId', '%');

export function applyPresetLogo(preset) {
  if (!preset) return;
  const labels = {
    star: '★ CS2 MOD',
    shield: '🛡️ VERIFIED',
    crown: '👑 VIP CREATOR',
    bolt: '⚡ TURBO ASSET',
    cube: '🧊 3D DECAL',
    sparkle: '✨ HD PACK'
  };
  setCreatorBadgeMode('text');
  setBadge1TextPreset(labels[preset] || preset.toUpperCase());
}

// ==========================================
// Named Exports for Badge 2 (Series)
// ==========================================
export const toggleBadge2Enable = (c) => toggleBadgeLayerEnable(2, c);
export const setSeriesBadgeMode = (m) => setBadgeLayerMode(2, m);
export const onSeriesTextChange = () => onBadgeLayerTextChange(2);
export const clearSeriesText = () => clearBadgeLayerText(2);
export const setSeriesTextPreset = (v) => setBadgeLayerTextPreset(2, v);
export const onSeriesFontChange = () => renderIconMap();
export const toggleSeriesBold = () => toggleBadgeLayerTypoBtn(2, 'boldBtnId');
export const toggleSeriesItalic = () => toggleBadgeLayerTypoBtn(2, 'italicBtnId');
export const toggleSeriesLetterSpacing = () => toggleBadgeLayerTypoBtn(2, 'spacingBtnId');
export const onSeriesPtSizeChange = () => onBadgeLayerPtSizeChange(2);
export const toggleBadge2TextGrad = (c) => toggleBadgeLayerTextGrad(2, c);
export const onBadge2TextGradInput = () => onBadgeLayerTextGradInput(2);
export const setBadge2TextGradDir = (d) => setBadgeLayerTextGradDir(2, d);
export const applyBadge2TextGradPresetByName = (n) => applyBadgeLayerTextGradPreset(2, n);
export const updateSeriesGradPreview = () => updateBadgeLayerGradPreview(2);
export const setSeriesColorMode = (m) => setBadgeLayerColorMode(2, m);
export const setSeriesColorTheme = (t) => setBadgeLayerColorTheme(2, t);
export const setSeriesGradDirection = (d) => setBadgeLayerGradDirection(2, d);
export const onSeriesCustomColorInput = () => onBadgeLayerCustomColorInput(2);
export const onSeriesSolidColorInput = () => onBadgeLayerSolidColorInput(2);
export const applySeriesGradPreset = (c1, c2, s, t) => applyBadgeLayerGradPreset(2, c1, c2, s, t);
export const applySeriesGradPresetByName = (n) => applyBadgeLayerGradPresetByName(2, n);
export const handleSeriesLogoSelect = (e) => handleBadgeLayerLogoSelect(2, e);
export const clearSeriesLogo = () => clearBadgeLayerLogo(2);
export const onSeriesPositionChange = () => onBadgeLayerPositionChange(2);
export const onSeriesCoordChange = () => onBadgeLayerCoordChange(2);
export const snapSeriesCoord = (x, y) => snapBadgeLayerCoord(2, x, y);
export const onBadge2PaddingChange = () => onBadgeLayerSliderChange(2, 'paddingId', 'paddingValId', ' px');
export const onSeriesPaddingChange = onBadge2PaddingChange;
export const onBadge2InnerPaddingChange = () => onBadgeLayerSliderChange(2, 'innerPaddingId', 'innerPaddingValId', ' px');
export const onSeriesInnerPaddingChange = onBadge2InnerPaddingChange;
export const onSeriesScaleChange = () => onBadgeLayerSliderChange(2, 'scaleId', 'scaleValId', '%');
export const onSeriesBadgeScaleChange = onSeriesScaleChange;
export const onSeriesOpacityChange = () => onBadgeLayerSliderChange(2, 'opacityId', 'opacityValId', '%');
export const onSeriesBadgeOpacityChange = onSeriesOpacityChange;
export const onSeriesFrameChange = () => renderIconMap();

export function applySeriesPreset(preset) {
  const p = SERIES_PRESET_MAP[preset];
  if (p) {
    setElValue('seriesTextInput', p.text);
    setElValue('seriesThemeSelect', p.theme);
  }
  renderIconMap();
}

// ==========================================
// Named Exports for Badge 3 (Extra 1) & Badge 4 (Extra 2)
// ==========================================
export const toggleBadge3Enable = (c) => toggleBadgeLayerEnable(3, c);
export const setExtra1BadgeMode = (m) => setBadgeLayerMode(3, m);
export const onExtra1TextChange = () => onBadgeLayerTextChange(3);
export const clearExtra1Text = () => clearBadgeLayerText(3);
export const setExtra1TextPreset = (v) => setBadgeLayerTextPreset(3, v);
export const onExtra1FontChange = () => renderIconMap();
export const toggleExtra1Bold = () => toggleBadgeLayerTypoBtn(3, 'boldBtnId');
export const toggleExtra1Italic = () => toggleBadgeLayerTypoBtn(3, 'italicBtnId');
export const toggleExtra1LetterSpacing = () => toggleBadgeLayerTypoBtn(3, 'spacingBtnId');
export const onExtra1PtSizeChange = () => onBadgeLayerPtSizeChange(3);
export const toggleBadge3TextGrad = (c) => toggleBadgeLayerTextGrad(3, c);
export const onBadge3TextGradInput = () => onBadgeLayerTextGradInput(3);
export const setBadge3TextGradDir = (d) => setBadgeLayerTextGradDir(3, d);
export const applyBadge3TextGradPresetByName = (n) => applyBadgeLayerTextGradPreset(3, n);
export const setExtra1ColorMode = (m) => setBadgeLayerColorMode(3, m);
export const setExtra1ColorTheme = (t) => setBadgeLayerColorTheme(3, t);
export const applyExtra1GradPresetByName = (n) => applyBadgeLayerGradPresetByName(3, n);
export const onExtra1CustomColorInput = () => onBadgeLayerCustomColorInput(3);
export const onExtra1SolidColorInput = () => onBadgeLayerSolidColorInput(3);
export const applyExtra1Preset = (preset) => {
  const p = SERIES_PRESET_MAP[preset];
  if (p) {
    setElValue('extra1TextInput', p.text);
    setElValue('extra1ThemeSelect', p.theme);
  }
  renderIconMap();
};
export const handleExtra1LogoSelect = (e) => handleBadgeLayerLogoSelect(3, e);
export const clearExtra1Logo = () => clearBadgeLayerLogo(3);
export const onExtra1PositionChange = () => onBadgeLayerPositionChange(3);
export const onExtra1CoordChange = () => onBadgeLayerCoordChange(3);
export const snapExtra1Coord = (x, y) => snapBadgeLayerCoord(3, x, y);
export const onExtra1ScaleChange = () => onBadgeLayerSliderChange(3, 'scaleId', 'scaleValId', '%');
export const onExtra1PaddingChange = () => onBadgeLayerSliderChange(3, 'paddingId', 'paddingValId', ' px');
export const onExtra1OpacityChange = () => onBadgeLayerSliderChange(3, 'opacityId', 'opacityValId', '%');

export const toggleBadge4Enable = (c) => toggleBadgeLayerEnable(4, c);
export const setExtra2BadgeMode = (m) => setBadgeLayerMode(4, m);
export const onExtra2TextChange = () => onBadgeLayerTextChange(4);
export const clearExtra2Text = () => clearBadgeLayerText(4);
export const setExtra2TextPreset = (v) => setBadgeLayerTextPreset(4, v);
export const onExtra2FontChange = () => renderIconMap();
export const toggleExtra2Bold = () => toggleBadgeLayerTypoBtn(4, 'boldBtnId');
export const toggleExtra2Italic = () => toggleBadgeLayerTypoBtn(4, 'italicBtnId');
export const toggleExtra2LetterSpacing = () => toggleBadgeLayerTypoBtn(4, 'spacingBtnId');
export const onExtra2PtSizeChange = () => onBadgeLayerPtSizeChange(4);
export const toggleBadge4TextGrad = (c) => toggleBadgeLayerTextGrad(4, c);
export const onBadge4TextGradInput = () => onBadgeLayerTextGradInput(4);
export const setBadge4TextGradDir = (d) => setBadgeLayerTextGradDir(4, d);
export const applyBadge4TextGradPresetByName = (n) => applyBadgeLayerTextGradPreset(4, n);
export const setExtra2ColorMode = (m) => setBadgeLayerColorMode(4, m);
export const setExtra2ColorTheme = (t) => setBadgeLayerColorTheme(4, t);
export const applyExtra2GradPresetByName = (n) => applyBadgeLayerGradPresetByName(4, n);
export const onExtra2CustomColorInput = () => onBadgeLayerCustomColorInput(4);
export const onExtra2SolidColorInput = () => onBadgeLayerSolidColorInput(4);
export const applyExtra2Preset = (preset) => {
  const p = SERIES_PRESET_MAP[preset];
  if (p) {
    setElValue('extra2TextInput', p.text);
    setElValue('extra2ThemeSelect', p.theme);
  }
  renderIconMap();
};
export const handleExtra2LogoSelect = (e) => handleBadgeLayerLogoSelect(4, e);
export const clearExtra2Logo = () => clearBadgeLayerLogo(4);
export const onExtra2PositionChange = () => onBadgeLayerPositionChange(4);
export const onExtra2CoordChange = () => onBadgeLayerCoordChange(4);
export const snapExtra2Coord = (x, y) => snapBadgeLayerCoord(4, x, y);
export const onExtra2ScaleChange = () => onBadgeLayerSliderChange(4, 'scaleId', 'scaleValId', '%');
export const onExtra2PaddingChange = () => onBadgeLayerSliderChange(4, 'paddingId', 'paddingValId', ' px');
export const onExtra2OpacityChange = () => onBadgeLayerSliderChange(4, 'opacityId', 'opacityValId', '%');

// Attach all Badge 1–4 and navigation handlers to window for HTML inline listeners
if (typeof window !== 'undefined') {
  Object.assign(window, {
    switchBadgeTab,
    switchBadgeSubtab,
    syncAllBadgeCheckboxes,
    copyBadgeStyle,
    runBadgeStyleCopyAction,
    toggleBadge1Enable,
    setCreatorBadgeMode,
    onBadge1TextChange,
    clearCreatorText,
    setBadge1TextPreset,
    onBadge1FontChange,
    toggleBadge1Bold,
    toggleBadge1Italic,
    toggleBadge1LetterSpacing,
    onBadge1PtSizeChange,
    toggleBadge1TextGrad,
    onBadge1TextGradInput,
    setBadge1TextGradDir,
    applyBadge1TextGradPresetByName,
    updateCreatorGradPreview,
    setCreatorColorMode,
    setCreatorColorTheme,
    setCreatorGradDirection,
    onCreatorCustomColorInput,
    onCreatorSolidColorInput,
    applyCreatorGradPreset,
    applyCreatorGradPresetByName,
    handleDesignerLogoSelect,
    clearDesignerLogo,
    applyPresetLogo,
    onCreatorPositionChange,
    onCreatorCoordChange,
    snapCreatorCoord,
    onBadge1PaddingChange,
    onBadge1InnerPaddingChange,
    onIconBadgeScaleChange,
    onIconBadgeOpacityChange,
    toggleBadge2Enable,
    setSeriesBadgeMode,
    onSeriesTextChange,
    clearSeriesText,
    setSeriesTextPreset,
    onSeriesFontChange,
    toggleSeriesBold,
    toggleSeriesItalic,
    toggleSeriesLetterSpacing,
    onSeriesPtSizeChange,
    toggleBadge2TextGrad,
    onBadge2TextGradInput,
    setBadge2TextGradDir,
    applyBadge2TextGradPresetByName,
    updateSeriesGradPreview,
    setSeriesColorMode,
    setSeriesColorTheme,
    setSeriesGradDirection,
    onSeriesCustomColorInput,
    onSeriesSolidColorInput,
    applySeriesGradPreset,
    applySeriesGradPresetByName,
    applySeriesPreset,
    handleSeriesLogoSelect,
    clearSeriesLogo,
    onSeriesPositionChange,
    onSeriesCoordChange,
    snapSeriesCoord,
    onBadge2PaddingChange,
    onSeriesPaddingChange,
    onBadge2InnerPaddingChange,
    onSeriesInnerPaddingChange,
    onSeriesScaleChange,
    onSeriesBadgeScaleChange,
    onSeriesOpacityChange,
    onSeriesBadgeOpacityChange,
    onSeriesFrameChange,
    toggleBadge3Enable,
    setExtra1BadgeMode,
    onExtra1TextChange,
    clearExtra1Text,
    setExtra1TextPreset,
    onExtra1FontChange,
    toggleExtra1Bold,
    toggleExtra1Italic,
    toggleExtra1LetterSpacing,
    onExtra1PtSizeChange,
    toggleBadge3TextGrad,
    onBadge3TextGradInput,
    setBadge3TextGradDir,
    applyBadge3TextGradPresetByName,
    setExtra1ColorMode,
    setExtra1ColorTheme,
    applyExtra1GradPresetByName,
    onExtra1CustomColorInput,
    onExtra1SolidColorInput,
    applyExtra1Preset,
    handleExtra1LogoSelect,
    clearExtra1Logo,
    onExtra1PositionChange,
    onExtra1CoordChange,
    snapExtra1Coord,
    onExtra1ScaleChange,
    onExtra1PaddingChange,
    onExtra1OpacityChange,
    toggleBadge4Enable,
    setExtra2BadgeMode,
    onExtra2TextChange,
    clearExtra2Text,
    setExtra2TextPreset,
    onExtra2FontChange,
    toggleExtra2Bold,
    toggleExtra2Italic,
    toggleExtra2LetterSpacing,
    onExtra2PtSizeChange,
    toggleBadge4TextGrad,
    onBadge4TextGradInput,
    setBadge4TextGradDir,
    applyBadge4TextGradPresetByName,
    setExtra2ColorMode,
    setExtra2ColorTheme,
    applyExtra2GradPresetByName,
    onExtra2CustomColorInput,
    onExtra2SolidColorInput,
    applyExtra2Preset,
    handleExtra2LogoSelect,
    clearExtra2Logo,
    onExtra2PositionChange,
    onExtra2CoordChange,
    snapExtra2Coord,
    onExtra2ScaleChange,
    onExtra2PaddingChange,
    onExtra2OpacityChange
  });
}

// ==========================================
// Icon Background Studio Controls
// ==========================================

export function onIconBgStyleChange() {
  const style = getEl('iconBgStyle')?.value || 'transparent';
  setElDisplay('customIconBgSection', style === 'custom' ? 'block' : 'none');
  renderIconMap();
}

export function setCustomIconBgType(type) {
  setElValue('customIconBgTypeSelect', type);
  setElDisplay('customBgPanelImage', type === 'image' ? 'block' : 'none');
  setElDisplay('customBgPanelGradient', type === 'gradient' ? 'block' : 'none');
  setElDisplay('customBgPanelSolid', type === 'solid' ? 'block' : 'none');
  renderIconMap();
}

export function handleIconBgImageSelect(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.customIconBgImg = img;
      state.customIconBgFileName = file.name;
      setElText('iconBgUploadBtnText', file.name);
      setElDisplay('btnClearIconBgImg', 'inline-block');
      setElDisplay('iconBgImageAdjustments', 'block');
      renderIconMap();
      showToast(`Loaded icon backdrop: ${file.name}`);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function clearIconBgImage() {
  state.customIconBgImg = null;
  state.customIconBgFileName = '';
  setElText('iconBgUploadBtnText', 'Upload Background Image...');
  setElDisplay('btnClearIconBgImg', 'none');
  renderIconMap();
}

export function applyProceduralBackdrop(preset) {
  if (!preset) return;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const palettes = {
    asphalt: ['#1e293b', '#0f172a', '#334155'],
    concrete: ['#475569', '#334155', '#64748b'],
    blueprint: ['#0c2d48', '#07192b', '#00e5ff'],
    carbon: ['#18181b', '#09090b', '#27272a'],
    grass: ['#14532d', '#052e16', '#22c55e'],
    brick: ['#451a03', '#270e02', '#b45309'],
    wood: ['#3f2305', '#261402', '#78350f'],
    plaza: ['#334155', '#1e293b', '#94a3b8']
  };
  const pal = palettes[preset] || palettes.asphalt;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, pal[0]);
  grad.addColorStop(1, pal[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = pal[2];
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 1;
  const step = 32;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const img = new Image();
  img.onload = () => {
    state.customIconBgImg = img;
    state.customIconBgFileName = `Preset_${preset}`;
    setElDisplay('iconBgImageAdjustments', 'block');
    setElDisplay('btnClearIconBgImg', 'inline-block');
    renderIconMap();
  };
  img.src = c.toDataURL('image/png');
}

export const onIconBgFitChange = () => renderIconMap();
export const onIconBgBlurChange = () => {
  setElText('iconBgBlurVal', `${getEl('iconBgBlur')?.value || 0} px`);
  renderIconMap();
};
export const onIconBgBrightnessChange = () => {
  setElText('iconBgBrightVal', `${getEl('iconBgBrightness')?.value || 100}%`);
  renderIconMap();
};
export const onIconBgVignetteChange = () => {
  setElText('iconBgVignetteVal', `${getEl('iconBgVignette')?.value || 0}%`);
  renderIconMap();
};
export const onIconBgGradDirChange = () => renderIconMap();
export const onIconBgGradColorsChange = () => {
  const c1 = getEl('iconBgGradColor1')?.value || '#0c1626';
  const c2 = getEl('iconBgGradColor2')?.value || '#1e3a5f';
  setElText('iconBgGradColor1Hex', c1);
  setElText('iconBgGradColor2Hex', c2);
  const bar = getEl('iconBgGradPreviewBar');
  if (bar) bar.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  renderIconMap();
};
export function applyIconBgGradPreset(c1, c2, dir) {
  setElValue('iconBgGradColor1', c1);
  setElValue('iconBgGradColor2', c2);
  if (dir) setElValue('iconBgGradDirection', dir);
  onIconBgGradColorsChange();
}
export const onIconBgGradGridChange = () => renderIconMap();
export const onIconBgSolidColorChange = () => {
  setElText('iconBgSolidColorHex', getEl('iconBgSolidColor')?.value || '#141e30');
  renderIconMap();
};
export function applyIconBgSolidSwatch(hex) {
  setElValue('iconBgSolidColor', hex);
  onIconBgSolidColorChange();
}

// ==========================================
// Default Badges Persistence
// ==========================================

export function saveIconBadgeDefaults() {
  try {
    const payload = {
      badge1Enabled: state.badge1Enabled,
      badge2Enabled: state.badge2Enabled,
      badge3Enabled: state.badge3Enabled,
      badge4Enabled: state.badge4Enabled,
      badge1Text: getEl('badge1TextInput')?.value || '',
      seriesText: getEl('seriesTextInput')?.value || '',
      extra1Text: getEl('extra1TextInput')?.value || '',
      extra2Text: getEl('extra2TextInput')?.value || '',
      creatorTheme: getEl('creatorThemeSelect')?.value || 'cyan',
      seriesTheme: getEl('seriesThemeSelect')?.value || 'purple',
      iconBgStyle: getEl('iconBgStyle')?.value || 'transparent'
    };
    localStorage.setItem(BADGE_DEFAULTS_KEY, JSON.stringify(payload));
    updateBadgeDefaultsUI();
    showToast('Saved current badge settings as default');
  } catch (_) {}
}

export function loadIconBadgeDefaults(silent = false) {
  try {
    const raw = localStorage.getItem(BADGE_DEFAULTS_KEY);
    if (!raw) {
      if (!silent) showToast('No saved badge defaults found');
      return false;
    }
    const d = JSON.parse(raw);
    state.badge1Enabled = Boolean(d.badge1Enabled);
    state.badge2Enabled = Boolean(d.badge2Enabled);
    state.badge3Enabled = Boolean(d.badge3Enabled);
    state.badge4Enabled = Boolean(d.badge4Enabled);
    if (d.badge1Text !== undefined) setElValue('badge1TextInput', d.badge1Text);
    if (d.seriesText !== undefined) setElValue('seriesTextInput', d.seriesText);
    if (d.extra1Text !== undefined) setElValue('extra1TextInput', d.extra1Text);
    if (d.extra2Text !== undefined) setElValue('extra2TextInput', d.extra2Text);
    if (d.creatorTheme) setElValue('creatorThemeSelect', d.creatorTheme);
    if (d.seriesTheme) setElValue('seriesThemeSelect', d.seriesTheme);
    if (d.iconBgStyle) setElValue('iconBgStyle', d.iconBgStyle);
    syncAllBadgeCheckboxes();
    renderIconMap();
    if (!silent) showToast('Applied default badge configuration');
    return true;
  } catch (_) {
    return false;
  }
}

export function resetIconBadgeDefaults() {
  try {
    localStorage.removeItem(BADGE_DEFAULTS_KEY);
  } catch (_) {}
  updateBadgeDefaultsUI();
  showToast('Cleared stored badge defaults');
}
export const clearIconBadgeDefaults = resetIconBadgeDefaults;

export function toggleAutoApplyDefaults(checked) {
  try {
    localStorage.setItem('cs2_auto_apply_badge_defaults', String(Boolean(checked)));
  } catch (_) {}
}

export function updateBadgeDefaultsUI() {
  const hasSaved = Boolean(localStorage.getItem(BADGE_DEFAULTS_KEY));
  const badge = getEl('badgeDefaultsStatusBadge');
  if (badge) {
    badge.textContent = hasSaved ? '✓ Stored' : 'Not Stored';
  }
}

export function initBadgeDefaults() {
  populateFontDropdowns();
  updateBadgeDefaultsUI();
  if (getEl('autoApplyBadgeDefaults')?.checked !== false) {
    loadIconBadgeDefaults(true);
  }
}

export function applySavedBadgeDefaultsToState() {
  loadIconBadgeDefaults(true);
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    clearIconBadgeDefaults,
    toggleAutoApplyDefaults,
    initBadgeCanvasInteractions
  });
}

// ==========================================
// Interactive Drag-to-Position on Icon Canvas
// ==========================================

// Stores rendered bounding boxes in 256x256 icon coordinate space for hit-testing
const badgeHitBoxes = {};
let activeDragState = null;
let windowDragListenersBound = false;

export function initBadgeCanvasInteractions() {
  const { canvasIcon, canvasSingle } = getCanvases();

  const ICON_SIZE = 256;

  // Convert pointer event into 256x256 icon space & 0-100% coordinate space
  const getPointerCoords = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    const width = rect.width || 1;
    const height = rect.height || 1;
    const normX = Math.max(0, Math.min(1, (clientX - rect.left) / width));
    const normY = Math.max(0, Math.min(1, (clientY - rect.top) / height));
    return {
      px: normX * ICON_SIZE,
      py: normY * ICON_SIZE,
      xPct: Math.round(normX * 100),
      yPct: Math.round(normY * 100)
    };
  };

  // Hit-test rendered badge overlays from top layer (4) to bottom layer (1)
  const hitTestBadge = (px, py) => {
    const hitPad = 6;
    for (let i = 4; i >= 1; i--) {
      if (!state[`badge${i}Enabled`]) continue;
      const box = badgeHitBoxes[i];
      if (!box) continue;
      if (
        px >= box.x - hitPad &&
        px <= box.x + box.w + hitPad &&
        py >= box.y - hitPad &&
        py <= box.y + box.h + hitPad
      ) {
        return i;
      }
    }
    return null;
  };

  // Determine whether a given canvas is currently acting as an interactive icon preview
  const isIconInteractiveCanvas = (canvas) => {
    if (!canvas) return false;
    if (canvas.id === 'canvasIcon') return true;
    if (canvas.id === 'canvasSingle') {
      return state.activeTab === 'icon' || state.activeSingleMap === 'icon';
    }
    return false;
  };

  const applyDragPosition = (idx, canvas, e, offsetXPct = 0, offsetYPct = 0) => {
    const { xPct, yPct } = getPointerCoords(canvas, e);
    const clampedX = Math.max(0, Math.min(100, Math.round(xPct + offsetXPct)));
    const clampedY = Math.max(0, Math.min(100, Math.round(yPct + offsetYPct)));
    const cfg = BADGE_CONFIG[idx];
    setElValue(cfg.positionSelectId, 'custom');
    setElDisplay(cfg.customPosContainerId, 'block');
    snapBadgeLayerCoord(idx, clampedX, clampedY);
  };

  const bindCanvas = (canvas) => {
    if (!canvas || canvas.dataset.dragBound === 'true') return;
    canvas.dataset.dragBound = 'true';

    const onPointerDown = (e) => {
      if (!isIconInteractiveCanvas(canvas)) return;
      if (e.button !== undefined && e.button !== 0) return;

      const { px, py, xPct, yPct } = getPointerCoords(canvas, e);
      let targetIdx = hitTestBadge(px, py);
      let offsetXPct = 0;
      let offsetYPct = 0;

      if (targetIdx) {
        const box = badgeHitBoxes[targetIdx];
        if (box) {
          offsetXPct = (box.cx / ICON_SIZE) * 100 - xPct;
          offsetYPct = (box.cy / ICON_SIZE) * 100 - yPct;
        }
      } else {
        // Fallback: if user clicked empty space, prefer active subtab layer if enabled, else topmost enabled layer
        const activeLayerKey = getEl('badgeLayerSelect')?.value;
        const activeCfg = activeLayerKey ? getCfgByKeyOrIndex(activeLayerKey) : null;
        if (activeCfg && state[`badge${activeCfg.index}Enabled`]) {
          targetIdx = activeCfg.index;
        } else {
          for (let i = 4; i >= 1; i--) {
            if (state[`badge${i}Enabled`]) {
              targetIdx = i;
              break;
            }
          }
        }
      }

      if (!targetIdx) return;

      e.preventDefault();
      e.stopPropagation();

      activeDragState = {
        idx: targetIdx,
        canvas,
        offsetXPct,
        offsetYPct
      };

      const cfg = BADGE_CONFIG[targetIdx];
      switchBadgeSubtab(cfg.key);
      canvas.style.cursor = 'grabbing';
      applyDragPosition(targetIdx, canvas, e, offsetXPct, offsetYPct);
    };

    const onPointerHover = (e) => {
      if (!isIconInteractiveCanvas(canvas)) return;
      if (activeDragState) {
        canvas.style.cursor = 'grabbing';
        return;
      }
      const { px, py } = getPointerCoords(canvas, e);
      const hitIdx = hitTestBadge(px, py);
      canvas.style.cursor = hitIdx ? 'grab' : 'default';
    };

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerHover);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  };

  bindCanvas(canvasIcon);
  bindCanvas(canvasSingle);

  if (!windowDragListenersBound && typeof window !== 'undefined') {
    windowDragListenersBound = true;

    const onWindowMove = (e) => {
      if (!activeDragState) return;
      if (e.cancelable) e.preventDefault();
      const { idx, canvas, offsetXPct, offsetYPct } = activeDragState;
      applyDragPosition(idx, canvas, e, offsetXPct, offsetYPct);
    };

    const onWindowUp = () => {
      if (!activeDragState) return;
      const { canvas } = activeDragState;
      activeDragState = null;
      if (canvas) canvas.style.cursor = 'grab';
    };

    window.addEventListener('mousemove', onWindowMove, { passive: false });
    window.addEventListener('mouseup', onWindowUp);
    window.addEventListener('touchmove', onWindowMove, { passive: false });
    window.addEventListener('touchend', onWindowUp);
  }
}

// ==========================================
// Icon & 4-Badge Layer Canvas Renderer
// ==========================================

function drawSingleBadgeOverlay(ctx, size, idx) {
  delete badgeHitBoxes[idx];
  if (!state[`badge${idx}Enabled`]) return;
  const cfg = BADGE_CONFIG[idx];

  const mode = getEl(cfg.modeSelectId)?.value || (idx === 2 ? 'preset' : 'text');
  const scalePct = Number(getEl(cfg.scaleId)?.value || 25) / 100;
  const opacity = Number(getEl(cfg.opacityId)?.value || 95) / 100;
  const edgePad = Number(getEl(cfg.paddingId)?.value || 12);
  const innerPad = Number(getEl(cfg.innerPaddingId)?.value || 8);
  const frameStyle = getEl(cfg.frameSelectId)?.value || 'pill';

  const posMode = getEl(cfg.positionSelectId)?.value || 'custom';
  let cx = size * (Number(getEl(cfg.posXId)?.value || 50) / 100);
  let cy = size * (Number(getEl(cfg.posYId)?.value || 50) / 100);

  if (posMode !== 'custom') {
    const minCoord = edgePad + 24;
    const maxCoord = size - edgePad - 24;
    if (posMode.includes('left')) cx = minCoord + 20;
    else if (posMode.includes('right')) cx = maxCoord - 20;
    else cx = size / 2;

    if (posMode.includes('top')) cy = minCoord;
    else if (posMode.includes('bottom')) cy = maxCoord;
    else cy = size / 2;
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  // Image mode
  const logoImg = state[cfg.imgStateKey];
  if (mode === 'image' && logoImg) {
    const boxSize = Math.max(20, size * scalePct);
    const rx = cx - boxSize / 2;
    const ry = cy - boxSize / 2;
    ctx.drawImage(logoImg, rx, ry, boxSize, boxSize);
    badgeHitBoxes[idx] = { x: rx, y: ry, w: boxSize, h: boxSize, cx, cy };
    ctx.restore();
    return;
  }

  // Text / Preset mode
  let text = (getEl(cfg.textInputId)?.value || '').trim();
  if (mode === 'preset' && !text) {
    text = idx === 2 ? 'GRAFFITI' : `BADGE ${idx}`;
  }
  if (!text) {
    ctx.restore();
    return;
  }

  const ptSize = Math.max(8, Math.round(Number(getEl(cfg.ptSizeId)?.value || 14) * (scalePct / 0.25)));
  const fontFam = getEl(cfg.fontSelectId)?.value || DEFAULT_FONT_OPTIONS[0].value;
  const isBold = getEl(cfg.boldBtnId)?.classList.contains('active') !== false;
  const isItalic = getEl(cfg.italicBtnId)?.classList.contains('active') === true;
  ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? '700 ' : '500 '}${ptSize}px ${fontFam}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const pillW = Math.min(size - 8, metrics.width + innerPad * 2.6 + 12);
  const pillH = Math.max(20, ptSize + innerPad * 1.5);
  const rx = cx - pillW / 2;
  const ry = cy - pillH / 2;

  badgeHitBoxes[idx] = { x: rx, y: ry, w: pillW, h: pillH, cx, cy };

  // Resolve colors
  const colorMode = getEl(cfg.colorModeSelectId)?.value || 'theme';
  const themeKey = getEl(cfg.themeSelectId)?.value || 'cyan';
  const themeObj = BADGE_COLOR_THEMES[themeKey] || BADGE_COLOR_THEMES.cyan;

  let fillStyle = themeObj.bg1;
  let strokeColor = themeObj.stroke;
  let textColor = themeObj.text;

  if (colorMode === 'gradient') {
    const c1 = getEl(cfg.color1Id)?.value || themeObj.bg1;
    const c2 = getEl(cfg.color2Id)?.value || themeObj.bg2;
    strokeColor = getEl(cfg.strokeColorId)?.value || themeObj.stroke;
    textColor = getEl(cfg.textColorId)?.value || '#ffffff';
    const g = ctx.createLinearGradient(rx, ry, rx + pillW, ry + pillH);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    fillStyle = g;
  } else if (colorMode === 'solid') {
    fillStyle = getEl(cfg.solidBgId)?.value || themeObj.bg1;
    strokeColor = getEl(cfg.solidStrokeId)?.value || themeObj.stroke;
    textColor = getEl(cfg.solidTextId)?.value || '#ffffff';
  } else {
    const g = ctx.createLinearGradient(rx, ry, rx + pillW, ry + pillH);
    g.addColorStop(0, themeObj.bg1);
    g.addColorStop(1, themeObj.bg2);
    fillStyle = g;
  }

  if (frameStyle !== 'raw') {
    const radius = frameStyle === 'pill' ? pillH / 2 : frameStyle === 'circle' ? Math.max(pillW, pillH) / 2 : 6;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(rx, ry, pillW, pillH, radius);
    } else {
      ctx.rect(rx, ry, pillW, pillH);
    }
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }

  if (getEl(cfg.textGradEnableId)?.checked) {
    const tc1 = getEl(cfg.textGrad1Id)?.value || '#ffffff';
    const tc2 = getEl(cfg.textGrad2Id)?.value || strokeColor;
    const tg = ctx.createLinearGradient(rx, ry, rx, ry + pillH);
    tg.addColorStop(0, tc1);
    tg.addColorStop(1, tc2);
    ctx.fillStyle = tg;
  } else {
    ctx.fillStyle = textColor;
  }

  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

export function renderIconMap() {
  const { canvasIcon, ctxIcon } = getCanvases();
  if (!canvasIcon || !ctxIcon) return;

  const size = 256;
  if (canvasIcon.width !== size) canvasIcon.width = size;
  if (canvasIcon.height !== size) canvasIcon.height = size;
  ctxIcon.clearRect(0, 0, size, size);

  // 1. Render icon background
  const bgStyle = getEl('iconBgStyle')?.value || 'transparent';
  if (bgStyle === 'dark' || bgStyle === 'cs2-dark') {
    const g = ctxIcon.createRadialGradient(size / 2, size / 2, 16, size / 2, size / 2, size * 0.72);
    g.addColorStop(0, '#1e293b');
    g.addColorStop(1, '#090d16');
    ctxIcon.fillStyle = g;
    ctxIcon.fillRect(0, 0, size, size);
  } else if (bgStyle === 'blue' || bgStyle === 'blueprint') {
    const g = ctxIcon.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, '#0c2d48');
    g.addColorStop(1, '#051329');
    ctxIcon.fillStyle = g;
    ctxIcon.fillRect(0, 0, size, size);
  } else if (bgStyle === 'light') {
    ctxIcon.fillStyle = '#cbd5e1';
    ctxIcon.fillRect(0, 0, size, size);
  } else if (bgStyle === 'asphalt' || bgStyle === 'cs2-pedestal') {
    const g = ctxIcon.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#1e293b');
    g.addColorStop(1, '#0f172a');
    ctxIcon.fillStyle = g;
    ctxIcon.fillRect(0, 0, size, size);
  } else if (bgStyle === 'custom') {
    const customType = getEl('customIconBgTypeSelect')?.value || getEl('customIconBgType')?.value || 'image';
    if (customType === 'image' && state.customIconBgImg) {
      drawImageSquare(
        ctxIcon,
        state.customIconBgImg,
        size,
        getEl('iconBgFit')?.value || getEl('iconBgFitSelect')?.value || 'cover'
      );
    } else if (customType === 'gradient') {
      const c1 = getEl('iconBgGradColor1')?.value || getEl('iconBgGrad1Input')?.value || '#0c1626';
      const c2 = getEl('iconBgGradColor2')?.value || getEl('iconBgGrad2Input')?.value || '#1e3a5f';
      const g = ctxIcon.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctxIcon.fillStyle = g;
      ctxIcon.fillRect(0, 0, size, size);
    } else if (customType === 'solid' || customType === 'color') {
      ctxIcon.fillStyle = getEl('iconBgSolidColor')?.value || getEl('iconBgColorInput')?.value || '#141e30';
      ctxIcon.fillRect(0, 0, size, size);
    }
  }

  // 2. Render main asset graphic
  if (state.currentImage) {
    const fitMode = getEl('fitStrategy')?.value || getEl('aspectHandling')?.value || 'contain';
    drawImageSquare(ctxIcon, state.currentImage, size, fitMode);
  }

  // 3. Render 4 badge layers in order
  [1, 2, 3, 4].forEach((idx) => drawSingleBadgeOverlay(ctxIcon, size, idx));

  // Ensure drag interactions are initialized on icon canvases
  initBadgeCanvasInteractions();

  // Synchronize single view canvas whenever the icon tab is active
  if (
    (state.activeTab === 'icon' || (state.activeTab === 'single' && state.activeSingleMap === 'icon')) &&
    typeof window.updateSingleView === 'function'
  ) {
    window.updateSingleView();
  }
}
