// ==========================================
// Badges, Watermarks & Typography Module
// ==========================================
import { state, getCanvases, showToast } from './state.js';

export const BADGE_DEFAULTS_STORAGE_KEY = 'cs2_icon_badge_defaults_v2';

export const SYSTEM_FONTS = [
  { name: 'Montserrat (Modern Geometric)', value: 'Montserrat' },
  { name: 'Inter (Clean Sans)', value: 'Inter' },
  { name: 'Bebas Neue (Condensed Display)', value: 'Bebas Neue' },
  { name: 'Oswald (Heavy Industrial)', value: 'Oswald' },
  { name: 'Teko (Tall Compact Bold)', value: 'Teko' },
  { name: 'Orbitron (Sci-Fi / Modernist)', value: 'Orbitron' },
  { name: 'Cinzel (Classical Serif)', value: 'Cinzel' },
  { name: 'Righteous (Retro Display)', value: 'Righteous' },
  { name: 'Press Start 2P (Pixel Arcade)', value: 'Press Start 2P' },
  { name: 'Permanent Marker (Graffiti / Grunge)', value: 'Permanent Marker' },
  { name: 'System Sans-Serif', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { name: 'System Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }
];

export const CURATED_GOOGLE_FONTS = [
  'Anton',
  'Poppins',
  'Rajdhani',
  'Rubik',
  'Space Grotesk',
  'Chakra Petch',
  'Black Ops One',
  'Russo One',
  'Audiowide',
  'Bungee',
  'Fugaz One',
  'Alfa Slab One',
  'Titan One',
  'Syne',
  'Silkscreen'
];

export const SERIES_COLOR_THEMES = {
  purple: {
    bgStart: '#151326',
    bgEnd: '#251336',
    stroke: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.4)',
    textColor: '#ffffff'
  },
  cyan: {
    bgStart: '#071a2e',
    bgEnd: '#0d324d',
    stroke: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    textColor: '#ffffff'
  },
  emerald: {
    bgStart: '#06241a',
    bgEnd: '#0d3d2c',
    stroke: '#34d399',
    glow: 'rgba(52, 211, 153, 0.4)',
    textColor: '#ffffff'
  },
  amber: {
    bgStart: '#241806',
    bgEnd: '#3d2a0d',
    stroke: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.4)',
    textColor: '#ffffff'
  },
  crimson: {
    bgStart: '#290913',
    bgEnd: '#451020',
    stroke: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    textColor: '#ffffff'
  },
  slate: {
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    stroke: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.4)',
    textColor: '#ffffff'
  },
  orange: {
    bgStart: '#261206',
    bgEnd: '#3d1d0a',
    stroke: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.4)',
    textColor: '#ffffff'
  },
  gold: {
    bgStart: '#2a2007',
    bgEnd: '#47360c',
    stroke: '#fde047',
    glow: 'rgba(253, 224, 71, 0.4)',
    textColor: '#ffffff'
  }
};

export function populateFontDropdowns() {
  const d1 = document.getElementById('badge1FontFamily');
  const d2 = document.getElementById('seriesFontFamily');
  const d3 = document.getElementById('extra1FontFamily');
  const d4 = document.getElementById('extra2FontFamily');
  if (!d1 && !d2 && !d3 && !d4) return;

  const buildOptions = (selectedVal) => {
    let out = '<optgroup label="Popular Display & Modding Fonts">';
    SYSTEM_FONTS.forEach(f => {
      out += `<option value="${f.value}" ${f.value === selectedVal ? 'selected' : ''}>${f.name}</option>`;
    });
    out += '</optgroup>';

    out += '<optgroup label="Curated Google Fonts">';
    CURATED_GOOGLE_FONTS.forEach(g => {
      out += `<option value="${g}" ${g === selectedVal ? 'selected' : ''}>${g}</option>`;
    });
    out += '</optgroup>';

    if (state.customGoogleFonts.length > 0) {
      out += '<optgroup label="Custom Added Google Fonts">';
      state.customGoogleFonts.forEach(c => {
        out += `<option value="${c}" ${c === selectedVal ? 'selected' : ''}>${c}</option>`;
      });
      out += '</optgroup>';
    }
    return out;
  };

  if (d1) d1.innerHTML = buildOptions(state.badge1Font);
  if (d2) d2.innerHTML = buildOptions(state.badge2Font);
  if (d3) d3.innerHTML = buildOptions(state.badge3Font);
  if (d4) d4.innerHTML = buildOptions(state.badge4Font);
}

export function loadGoogleFont(fontName, callback) {
  if (!fontName || fontName.startsWith('-apple-system') || fontName.startsWith('ui-monospace')) {
    if (callback) callback();
    return;
  }
  const isSystem = SYSTEM_FONTS.some(f => f.value === fontName);
  if (isSystem) {
    if (callback) callback();
    return;
  }

  const cleanName = fontName.trim();
  const fontId = 'gfont-' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName).replace(/%20/g, '+')}:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }

  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load(`14px "${cleanName}"`),
      document.fonts.load(`bold 14px "${cleanName}"`),
      document.fonts.load(`italic 14px "${cleanName}"`)
    ]).then(() => {
      if (callback) callback();
      renderIconMap();
    }).catch(err => {
      console.warn('Font load notice:', err);
      if (callback) callback();
      renderIconMap();
    });
  } else {
    setTimeout(() => {
      if (callback) callback();
      renderIconMap();
    }, 300);
  }
}

export function toggleGoogleFontInput(target) {
  const rowId = (target === 'creator') ? 'creatorGoogleFontRow' : (target === 'series' ? 'seriesGoogleFontRow' : (target === 'extra1' ? 'extra1GoogleFontRow' : 'extra2GoogleFontRow'));
  const row = document.getElementById(rowId);
  if (!row) return;
  const isVisible = (row.style.display === 'block');
  row.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    const inputId = (target === 'creator') ? 'creatorGoogleFontInput' : (target === 'series' ? 'seriesGoogleFontInput' : (target === 'extra1' ? 'extra1GoogleFontInput' : 'extra2GoogleFontInput'));
    const input = document.getElementById(inputId);
    if (input) input.focus();
  }
}

export function addCustomGoogleFontFromInput(target) {
  const inputId = (target === 'creator') ? 'creatorGoogleFontInput' : (target === 'series' ? 'seriesGoogleFontInput' : (target === 'extra1' ? 'extra1GoogleFontInput' : 'extra2GoogleFontInput'));
  const input = document.getElementById(inputId);
  if (!input) return;
  const fontName = input.value.trim();
  if (!fontName) {
    showToast('Please type a Google Font name');
    return;
  }

  if (!state.customGoogleFonts.includes(fontName) && !CURATED_GOOGLE_FONTS.includes(fontName)) {
    state.customGoogleFonts.push(fontName);
  }

  loadGoogleFont(fontName, () => {
    populateFontDropdowns();
    if (target === 'creator') {
      state.badge1Font = fontName;
      const sel = document.getElementById('badge1FontFamily');
      if (sel) sel.value = fontName;
    } else if (target === 'series') {
      state.badge2Font = fontName;
      const sel = document.getElementById('seriesFontFamily');
      if (sel) sel.value = fontName;
    } else if (target === 'extra1') {
      state.badge3Font = fontName;
      const sel = document.getElementById('extra1FontFamily');
      if (sel) sel.value = fontName;
    } else if (target === 'extra2') {
      state.badge4Font = fontName;
      const sel = document.getElementById('extra2FontFamily');
      if (sel) sel.value = fontName;
    }
    renderIconMap();
    showToast(`Loaded Google Font "${fontName}"!`);
  });

  input.value = '';
  const rowId = (target === 'creator') ? 'creatorGoogleFontRow' : (target === 'series' ? 'seriesGoogleFontRow' : (target === 'extra1' ? 'extra1GoogleFontRow' : 'extra2GoogleFontRow'));
  const row = document.getElementById(rowId);
  if (row) row.style.display = 'none';
}

export function switchBadgeSubtab(tab) {
  state.activeBadgeTab = tab;
  const subtabs = ['creator', 'series', 'extra1', 'extra2', 'defaults'];
  subtabs.forEach(t => {
    const btnKey = t.charAt(0).toUpperCase() + t.slice(1);
    const btn = document.getElementById(`badgeSubtab${btnKey}`) || document.getElementById(`tabBadge${btnKey}`);
    const panel = document.getElementById(`panelBadge${btnKey}`) || document.getElementById(`badge${btnKey}Panel`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) {
      if (t === tab) panel.classList.add('active');
      else panel.classList.remove('active');
      panel.style.display = (t === tab) ? 'block' : 'none';
    }
  });

  const sel = document.getElementById('badgeLayerSelect');
  if (sel && sel.value !== tab) sel.value = tab;

  const badge = document.getElementById('activeOverlayLayerBadge');
  if (badge) {
    if (tab === 'creator') badge.textContent = 'Overlay 1/4';
    else if (tab === 'series') badge.textContent = 'Overlay 2/4';
    else if (tab === 'extra1') badge.textContent = 'Overlay 3/4';
    else if (tab === 'extra2') badge.textContent = 'Overlay 4/4';
    else if (tab === 'defaults') badge.textContent = 'Defaults';
  }
  renderIconMap();
}
export const switchBadgeTab = switchBadgeSubtab;

export function runBadgeStyleCopyAction(actionStr) {
  if (!actionStr) return;
  const parts = actionStr.split(':');
  if (parts.length === 2) {
    copyBadgeStyle(parts[0], parts[1]);
  }
}

export const BADGE_GRADIENT_PRESETS = {
  neon: { c1: '#071a2e', c2: '#0d324d', stroke: '#38bdf8', text: '#ffffff' },
  violet: { c1: '#151326', c2: '#251336', stroke: '#c084fc', text: '#ffffff' },
  forest: { c1: '#06241a', c2: '#0d3d2c', stroke: '#34d399', text: '#ffffff' },
  sunset: { c1: '#241806', c2: '#3d2a0d', stroke: '#fbbf24', text: '#ffffff' },
  ruby: { c1: '#290913', c2: '#451020', stroke: '#f43f5e', text: '#ffffff' },
  stealth: { c1: '#0a0f18', c2: '#1e293b', stroke: '#94a3b8', text: '#ffffff' },
  cyber: { c1: '#2b0638', c2: '#09253d', stroke: '#ec4899', text: '#fdf2f8' },
  gold: { c1: '#2a2007', c2: '#47360c', stroke: '#fde047', text: '#ffffff' }
};

export function applyCreatorGradPresetByName(name) {
  const p = BADGE_GRADIENT_PRESETS[name];
  if (p) applyCreatorGradPreset(p.c1, p.c2, p.stroke, p.text);
}

export function applySeriesGradPresetByName(name) {
  const p = BADGE_GRADIENT_PRESETS[name];
  if (p) applySeriesGradPreset(p.c1, p.c2, p.stroke, p.text);
}

export function applyExtra1GradPresetByName(name) {
  const p = BADGE_GRADIENT_PRESETS[name];
  if (p) {
    state.badge3CustomBg1 = p.c1;
    state.badge3CustomBg2 = p.c2;
    state.badge3CustomStroke = p.stroke;
    state.badge3CustomText = p.text;
    const inp1 = document.getElementById('extra1Color1'); if (inp1) inp1.value = p.c1;
    const inp2 = document.getElementById('extra1Color2'); if (inp2) inp2.value = p.c2;
    const inps = document.getElementById('extra1StrokeColor'); if (inps) inps.value = p.stroke;
    const inpt = document.getElementById('extra1TextColor'); if (inpt) inpt.value = p.text;
    const c1Hex = document.getElementById('extra1Color1Hex'); if (c1Hex) c1Hex.textContent = p.c1;
    const c2Hex = document.getElementById('extra1Color2Hex'); if (c2Hex) c2Hex.textContent = p.c2;
    const sHex = document.getElementById('extra1StrokeHex'); if (sHex) sHex.textContent = p.stroke;
    const tHex = document.getElementById('extra1TextColorHex'); if (tHex) tHex.textContent = p.text;
    const prev = document.getElementById('extra1GradPreview');
    if (prev) prev.style.background = `linear-gradient(135deg, ${p.c1}, ${p.c2})`;
    renderIconMap();
  }
}

export function applyExtra2GradPresetByName(name) {
  const p = BADGE_GRADIENT_PRESETS[name];
  if (p) {
    state.badge4CustomBg1 = p.c1;
    state.badge4CustomBg2 = p.c2;
    state.badge4CustomStroke = p.stroke;
    state.badge4CustomText = p.text;
    const inp1 = document.getElementById('extra2Color1'); if (inp1) inp1.value = p.c1;
    const inp2 = document.getElementById('extra2Color2'); if (inp2) inp2.value = p.c2;
    const inps = document.getElementById('extra2StrokeColor'); if (inps) inps.value = p.stroke;
    const inpt = document.getElementById('extra2TextColor'); if (inpt) inpt.value = p.text;
    const c1Hex = document.getElementById('extra2Color1Hex'); if (c1Hex) c1Hex.textContent = p.c1;
    const c2Hex = document.getElementById('extra2Color2Hex'); if (c2Hex) c2Hex.textContent = p.c2;
    const sHex = document.getElementById('extra2StrokeHex'); if (sHex) sHex.textContent = p.stroke;
    const tHex = document.getElementById('extra2TextColorHex'); if (tHex) tHex.textContent = p.text;
    const prev = document.getElementById('extra2GradPreview');
    if (prev) prev.style.background = `linear-gradient(135deg, ${p.c1}, ${p.c2})`;
    renderIconMap();
  }
}

export function applyBadge1TextGradPresetByName(name) {
  if (name === 'cyan') applyBadge1TextGradPreset('#ffffff', '#38bdf8');
  else if (name === 'gold') applyBadge1TextGradPreset('#fff3bf', '#f59e0b');
  else if (name === 'silver') applyBadge1TextGradPreset('#ffffff', '#94a3b8');
}

export function applyBadge2TextGradPresetByName(name) {
  if (name === 'violet') applyBadge2TextGradPreset('#ffffff', '#c084fc');
  else if (name === 'gold') applyBadge2TextGradPreset('#fff3bf', '#f59e0b');
  else if (name === 'cyan') applyBadge2TextGradPreset('#ffffff', '#38bdf8');
}

export function applyBadge3TextGradPresetByName(name) {
  if (name === 'emerald') applyBadge3TextGradPreset('#ffffff', '#34d399');
  else if (name === 'gold') applyBadge3TextGradPreset('#fff3bf', '#f59e0b');
  else if (name === 'silver') applyBadge3TextGradPreset('#ffffff', '#94a3b8');
}

export function applyBadge4TextGradPresetByName(name) {
  if (name === 'amber') applyBadge4TextGradPreset('#ffffff', '#fbbf24');
  else if (name === 'gold') applyBadge4TextGradPreset('#fff3bf', '#f59e0b');
  else if (name === 'silver') applyBadge4TextGradPreset('#ffffff', '#94a3b8');
}

export function toggleBadge1Enable(checked) {
  state.badge1Enabled = checked;
  const dot = document.getElementById('dotBadge1');
  if (dot) dot.className = checked ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
  renderIconMap();
}

export function toggleBadge2Enable(checked) {
  state.badge2Enabled = checked;
  const dot = document.getElementById('dotBadge2');
  if (dot) dot.className = checked ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
  renderIconMap();
}

export function toggleBadge3Enable(checked) {
  state.badge3Enabled = checked;
  const dot = document.getElementById('dotBadge3');
  if (dot) dot.className = checked ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
  renderIconMap();
}

export function toggleBadge4Enable(checked) {
  state.badge4Enabled = checked;
  const dot = document.getElementById('dotBadge4');
  if (dot) dot.className = checked ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
  renderIconMap();
}

// Badge 1 Handlers
export function setCreatorBadgeMode(mode) {
  state.badge1Type = mode;
  document.getElementById('btnCreatorModePreset')?.classList.toggle('active', mode === 'preset');
  document.getElementById('btnCreatorModeText')?.classList.toggle('active', mode === 'text');
  document.getElementById('btnCreatorModeImage')?.classList.toggle('active', mode === 'image');
  const modeSel = document.getElementById('creatorModeSelect');
  if (modeSel && modeSel.value !== mode) modeSel.value = mode;

  const secPreset = document.getElementById('creatorPresetSection');
  const secText = document.getElementById('creatorTextSection');
  const secImg = document.getElementById('creatorImageSection');

  if (secPreset) secPreset.style.display = mode === 'preset' ? 'block' : 'none';
  if (secText) secText.style.display = mode === 'text' ? 'block' : 'none';
  if (secImg) secImg.style.display = mode === 'image' ? 'block' : 'none';

  document.getElementById('btnPresetCreatorCustom')?.classList.toggle('active', mode === 'text');

  if (mode === 'text') {
    const inp = document.getElementById('badge1TextInput');
    if (inp) {
      setTimeout(() => {
        inp.focus();
        inp.select();
      }, 40);
    }
  }

  onBadge1TextChange(false);
  renderIconMap();
}

export function onBadge1TextChange(doRender = true) {
  const input = document.getElementById('badge1TextInput');
  state.badge1Text = input ? input.value : '';
  const lenBadge = document.getElementById('badge1TextLengthBadge');
  if (lenBadge) {
    lenBadge.textContent = `${state.badge1Text.length} / 20`;
  }
  if (doRender) {
    renderIconMap();
  }
}

export function clearCreatorText() {
  const inp = document.getElementById('badge1TextInput');
  if (inp) {
    inp.value = '';
    state.badge1Text = '';
    onBadge1TextChange();
    inp.focus();
  }
}

export function setBadge1TextPreset(text) {
  const input = document.getElementById('badge1TextInput');
  if (input) {
    input.value = text;
    state.badge1Text = text;
  }
  setCreatorBadgeMode('text');
  onBadge1TextChange();
  showToast(`Set custom creator text: "${text}"`);
}

export function onBadge1FontChange() {
  const sel = document.getElementById('badge1FontFamily');
  state.badge1Font = sel ? sel.value : 'Montserrat';
  loadGoogleFont(state.badge1Font, () => {
    renderIconMap();
  });
}

export function toggleBadge1Bold() {
  state.badge1Bold = !state.badge1Bold;
  document.getElementById('btnBadge1Bold')?.classList.toggle('active', state.badge1Bold);
  renderIconMap();
}

export function toggleBadge1Italic() {
  state.badge1Italic = !state.badge1Italic;
  document.getElementById('btnBadge1Italic')?.classList.toggle('active', state.badge1Italic);
  renderIconMap();
}

export function toggleBadge1LetterSpacing() {
  state.badge1LetterSpacing = !state.badge1LetterSpacing;
  document.getElementById('btnBadge1LetterSpacing')?.classList.toggle('active', state.badge1LetterSpacing);
  renderIconMap();
}

export function onBadge1PtSizeChange() {
  const val = parseInt(document.getElementById('badge1PtSize').value, 10) || 13;
  state.badge1PtSize = val;
  const valEl = document.getElementById('badge1PtSizeVal');
  if (valEl) valEl.textContent = `${val} pt`;
  renderIconMap();
}

export function updateCreatorGradPreview() {
  const el = document.getElementById('creatorGradPreview');
  if (!el) return;
  const angle = state.badge1GradDir === 'horizontal' ? '90deg' : (state.badge1GradDir === 'vertical' ? '180deg' : '135deg');
  el.style.background = `linear-gradient(${angle}, ${state.badge1CustomBg1}, ${state.badge1CustomBg2})`;
}

export function setCreatorColorMode(mode) {
  state.badge1ColorMode = mode;
  document.getElementById('btnCreatorColorTheme')?.classList.toggle('active', mode === 'theme');
  document.getElementById('btnCreatorColorGradient')?.classList.toggle('active', mode === 'gradient');
  document.getElementById('btnCreatorColorSolid')?.classList.toggle('active', mode === 'solid');
  const sel = document.getElementById('creatorColorModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const pTheme = document.getElementById('creatorColorThemePanel');
  const pGrad = document.getElementById('creatorCustomGradPanel');
  const pSolid = document.getElementById('creatorCustomSolidPanel');

  if (pTheme) pTheme.style.display = mode === 'theme' ? 'block' : 'none';
  if (pGrad) pGrad.style.display = mode === 'gradient' ? 'block' : 'none';
  if (pSolid) pSolid.style.display = mode === 'solid' ? 'block' : 'none';

  const badge = document.getElementById('creatorColorModeBadge');
  if (badge) {
    badge.textContent = mode === 'theme' ? 'Themes' : (mode === 'gradient' ? 'Custom Gradient' : 'Solid Color');
  }

  if (mode === 'gradient') updateCreatorGradPreview();
  renderIconMap();
}

export function setCreatorColorTheme(themeName) {
  if (!SERIES_COLOR_THEMES[themeName]) return;
  state.badge1ColorTheme = themeName;
  document.querySelectorAll('#creatorColorThemes .theme-chip').forEach(btn => {
    btn.classList.toggle('active', btn.id === `themeBtn1_${themeName}`);
  });
  const sel = document.getElementById('creatorThemeSelect');
  if (sel && sel.value !== themeName) sel.value = themeName;
  renderIconMap();
}

export function setCreatorGradDirection(dir) {
  state.badge1GradDir = dir;
  document.getElementById('btnCreatorGradDir_diag')?.classList.toggle('active', dir === 'diagonal');
  document.getElementById('btnCreatorGradDir_horiz')?.classList.toggle('active', dir === 'horizontal');
  document.getElementById('btnCreatorGradDir_vert')?.classList.toggle('active', dir === 'vertical');
  const sel = document.getElementById('creatorGradDirSelect');
  if (sel && sel.value !== dir) sel.value = dir;
  updateCreatorGradPreview();
  renderIconMap();
}

export function onCreatorCustomColorInput() {
  const c1 = document.getElementById('creatorColor1')?.value || '#091524';
  const c2 = document.getElementById('creatorColor2')?.value || '#0e243d';
  const stroke = document.getElementById('creatorStrokeColor')?.value || '#00a8ff';
  const text = document.getElementById('creatorTextColor')?.value || '#ffffff';

  state.badge1CustomBg1 = c1;
  state.badge1CustomBg2 = c2;
  state.badge1CustomStroke = stroke;
  state.badge1CustomText = text;

  const c1Hex = document.getElementById('creatorColor1Hex');
  if (c1Hex) c1Hex.textContent = c1;
  const c2Hex = document.getElementById('creatorColor2Hex');
  if (c2Hex) c2Hex.textContent = c2;
  const sHex = document.getElementById('creatorStrokeHex');
  if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('creatorTextColorHex');
  if (tHex) tHex.textContent = text;

  updateCreatorGradPreview();
  renderIconMap();
}

export function onCreatorSolidColorInput() {
  const bg = document.getElementById('creatorSolidBg')?.value || '#091524';
  const stroke = document.getElementById('creatorSolidStroke')?.value || '#00a8ff';
  const text = document.getElementById('creatorSolidText')?.value || '#ffffff';

  state.badge1SolidBg = bg;
  state.badge1SolidStroke = stroke;
  state.badge1SolidText = text;

  const bgHex = document.getElementById('creatorSolidBgHex');
  if (bgHex) bgHex.textContent = bg;
  const sHex = document.getElementById('creatorSolidStrokeHex');
  if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('creatorSolidTextHex');
  if (tHex) tHex.textContent = text;

  renderIconMap();
}

export function applyCreatorGradPreset(c1, c2, stroke, text) {
  state.badge1CustomBg1 = c1;
  state.badge1CustomBg2 = c2;
  state.badge1CustomStroke = stroke;
  state.badge1CustomText = text;

  const inp1 = document.getElementById('creatorColor1'); if (inp1) inp1.value = c1;
  const inp2 = document.getElementById('creatorColor2'); if (inp2) inp2.value = c2;
  const inps = document.getElementById('creatorStrokeColor'); if (inps) inps.value = stroke;
  const inpt = document.getElementById('creatorTextColor'); if (inpt) inpt.value = text;

  const c1Hex = document.getElementById('creatorColor1Hex'); if (c1Hex) c1Hex.textContent = c1;
  const c2Hex = document.getElementById('creatorColor2Hex'); if (c2Hex) c2Hex.textContent = c2;
  const sHex = document.getElementById('creatorStrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('creatorTextColorHex'); if (tHex) tHex.textContent = text;

  setCreatorColorMode('gradient');
  updateCreatorGradPreview();
  renderIconMap();
  showToast('Applied custom gradient preset');
}

export function handleDesignerLogoSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    state.badge1FileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.designerLogoImg = img;
        state.presetLogoType = null;
        const btn = document.getElementById('logoUploadBtnText');
        if (btn) btn.textContent = file.name.substring(0, 16) + '...';
        const btnClear = document.getElementById('btnClearLogo');
        if (btnClear) btnClear.style.display = 'block';
        renderIconMap();
        showToast('Creator logo applied to icon');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export function clearDesignerLogo() {
  state.designerLogoImg = null;
  state.presetLogoType = null;
  state.badge1FileName = '';
  const btn = document.getElementById('logoUploadBtnText');
  if (btn) btn.textContent = 'Upload Creator Logo...';
  const btnClear = document.getElementById('btnClearLogo');
  if (btnClear) btnClear.style.display = 'none';
  const inp = document.getElementById('designerLogoInput');
  if (inp) inp.value = '';
  renderIconMap();
  showToast('Creator logo removed');
}

export function applyPresetLogo(type) {
  if (type === 'none') {
    clearDesignerLogo();
    return;
  }
  state.presetLogoType = type;
  state.designerLogoImg = null;
  state.badge1FileName = '';
  state.badge1Type = 'preset';
  setCreatorBadgeMode('preset');
  const sel = document.getElementById('creatorPresetSelect');
  if (sel && sel.value !== type) sel.value = type;
  const btn = document.getElementById('logoUploadBtnText');
  if (btn) btn.textContent = 'Upload Creator Logo...';
  const btnClear = document.getElementById('btnClearLogo');
  if (btnClear) btnClear.style.display = 'block';

  document.querySelectorAll('#creatorPresetSection .preset-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick')?.includes(`'${type}'`));
  });

  renderIconMap();
  showToast(`Applied ${type} creator seal`);
}

export function onBadge1PaddingChange() {
  const val = parseInt(document.getElementById('badge1Padding')?.value || '12', 10);
  state.badge1EdgePadding = val;
  const valEl = document.getElementById('badge1PaddingVal');
  if (valEl) valEl.textContent = `${val} px`;
  renderIconMap();
}

export function onBadge1InnerPaddingChange() {
  const val = parseInt(document.getElementById('badge1InnerPadding')?.value || '8', 10);
  state.badge1InnerPadding = val;
  const valEl = document.getElementById('badge1InnerPaddingVal');
  if (valEl) valEl.textContent = `${val} px`;
  renderIconMap();
}

export function toggleBadge1TextGrad(checked) {
  state.badge1TextGradEnabled = checked;
  const c = document.getElementById('badge1TextGradControls');
  if (c) c.style.display = checked ? 'block' : 'none';
  renderIconMap();
}

export function onBadge1TextGradInput() {
  const c1 = document.getElementById('badge1TextGrad1')?.value || '#ffffff';
  const c2 = document.getElementById('badge1TextGrad2')?.value || '#38bdf8';
  state.badge1TextGradColor1 = c1;
  state.badge1TextGradColor2 = c2;
  const hex1 = document.getElementById('badge1TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge1TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  renderIconMap();
}

export function setBadge1TextGradDir(dir) {
  state.badge1TextGradDir = dir;
  document.getElementById('btnBadge1TextDir_vert')?.classList.toggle('active', dir === 'vertical');
  document.getElementById('btnBadge1TextDir_horiz')?.classList.toggle('active', dir === 'horizontal');
  renderIconMap();
}

export function applyBadge1TextGradPreset(c1, c2) {
  state.badge1TextGradColor1 = c1;
  state.badge1TextGradColor2 = c2;
  const el1 = document.getElementById('badge1TextGrad1'); if (el1) el1.value = c1;
  const el2 = document.getElementById('badge1TextGrad2'); if (el2) el2.value = c2;
  const hex1 = document.getElementById('badge1TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge1TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  state.badge1TextGradEnabled = true;
  const chk = document.getElementById('badge1TextGradEnable'); if (chk) chk.checked = true;
  const c = document.getElementById('badge1TextGradControls'); if (c) c.style.display = 'block';
  renderIconMap();
}

// Badge 2 Handlers
export function onSeriesFontChange() {
  const sel = document.getElementById('seriesFontFamily');
  state.badge2Font = sel ? sel.value : 'Bebas Neue';
  loadGoogleFont(state.badge2Font, () => {
    renderIconMap();
  });
}

export function toggleSeriesBold() {
  state.badge2Bold = !state.badge2Bold;
  document.getElementById('btnSeriesBold')?.classList.toggle('active', state.badge2Bold);
  renderIconMap();
}

export function toggleSeriesItalic() {
  state.badge2Italic = !state.badge2Italic;
  document.getElementById('btnSeriesItalic')?.classList.toggle('active', state.badge2Italic);
  renderIconMap();
}

export function onSeriesPtSizeChange() {
  const val = parseInt(document.getElementById('seriesPtSize').value, 10) || 13;
  state.badge2PtSize = val;
  const valEl = document.getElementById('seriesPtSizeVal');
  if (valEl) valEl.textContent = `${val} pt`;
  renderIconMap();
}

export function setSeriesBadgeMode(mode) {
  state.badge2Type = mode;
  document.getElementById('btnSeriesModePreset')?.classList.toggle('active', mode === 'preset');
  document.getElementById('btnSeriesModeText')?.classList.toggle('active', mode === 'text');
  document.getElementById('btnSeriesModeImage')?.classList.toggle('active', mode === 'image');
  const sel = document.getElementById('seriesModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const secPreset = document.getElementById('seriesPresetSection');
  const secText = document.getElementById('seriesTextSection');
  const secImg = document.getElementById('seriesImageSection');

  if (secPreset) secPreset.style.display = mode === 'preset' ? 'block' : 'none';
  if (secText) secText.style.display = mode === 'text' ? 'block' : 'none';
  if (secImg) secImg.style.display = mode === 'image' ? 'block' : 'none';

  document.getElementById('btnPresetSeriesCustom')?.classList.toggle('active', mode === 'text');

  if (mode === 'text') {
    const inp = document.getElementById('seriesTextInput');
    if (inp) {
      setTimeout(() => {
        inp.focus();
        inp.select();
      }, 40);
    }
  }

  onSeriesTextChange(false);
  renderIconMap();
}

export function applySeriesPreset(presetName) {
  state.badge2Preset = presetName;
  state.badge2Type = 'preset';
  setSeriesBadgeMode('preset');
  const sel = document.getElementById('seriesPresetSelect');
  if (sel && sel.value !== presetName) sel.value = presetName;

  document.querySelectorAll('#seriesPresetSection .preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${presetName}'`));
  });

  renderIconMap();
  showToast(`Selected "${presetName.toUpperCase()}" series preset`);
}

export function setSeriesTextPreset(text) {
  const input = document.getElementById('seriesTextInput');
  if (input) {
    input.value = text;
    state.badge2Text = text;
  }
  setSeriesBadgeMode('text');
  onSeriesTextChange();
  showToast(`Set custom series text: "${text}"`);
}

export function onSeriesTextChange(doRender = true) {
  const input = document.getElementById('seriesTextInput');
  state.badge2Text = input ? input.value : '';
  const lenBadge = document.getElementById('seriesTextLengthBadge');
  if (lenBadge) {
    lenBadge.textContent = `${state.badge2Text.length} / 20`;
  }
  if (doRender) {
    renderIconMap();
  }
}

export function clearSeriesText() {
  const inp = document.getElementById('seriesTextInput');
  if (inp) {
    inp.value = '';
    state.badge2Text = '';
    onSeriesTextChange();
    inp.focus();
  }
}

export function setSeriesColorTheme(themeName) {
  if (!SERIES_COLOR_THEMES[themeName]) return;
  state.badge2ColorTheme = themeName;
  document.querySelectorAll('#seriesColorThemes .theme-chip').forEach(btn => {
    btn.classList.toggle('active', btn.id === `themeBtn_${themeName}`);
  });
  const sel = document.getElementById('seriesThemeSelect');
  if (sel && sel.value !== themeName) sel.value = themeName;
  const valBadge = document.getElementById('seriesColorThemeVal');
  if (valBadge) {
    valBadge.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
  }
  renderIconMap();
}

export function updateSeriesGradPreview() {
  const el = document.getElementById('seriesGradPreview');
  if (!el) return;
  const angle = state.badge2GradDir === 'horizontal' ? '90deg' : (state.badge2GradDir === 'vertical' ? '180deg' : '135deg');
  el.style.background = `linear-gradient(${angle}, ${state.badge2CustomBg1}, ${state.badge2CustomBg2})`;
}

export function setSeriesColorMode(mode) {
  state.badge2ColorMode = mode;
  document.getElementById('btnSeriesColorTheme')?.classList.toggle('active', mode === 'theme');
  document.getElementById('btnSeriesColorGradient')?.classList.toggle('active', mode === 'gradient');
  document.getElementById('btnSeriesColorSolid')?.classList.toggle('active', mode === 'solid');
  const sel = document.getElementById('seriesColorModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const pTheme = document.getElementById('seriesColorThemePanel');
  const pGrad = document.getElementById('seriesCustomGradPanel');
  const pSolid = document.getElementById('seriesCustomSolidPanel');

  if (pTheme) pTheme.style.display = mode === 'theme' ? 'block' : 'none';
  if (pGrad) pGrad.style.display = mode === 'gradient' ? 'block' : 'none';
  if (pSolid) pSolid.style.display = mode === 'solid' ? 'block' : 'none';

  const badge = document.getElementById('seriesColorModeBadge');
  if (badge) {
    badge.textContent = mode === 'theme' ? 'Themes' : (mode === 'gradient' ? 'Custom Gradient' : 'Solid Color');
  }

  if (mode === 'gradient') updateSeriesGradPreview();
  renderIconMap();
}

export function setSeriesGradDirection(dir) {
  state.badge2GradDir = dir;
  document.getElementById('btnSeriesGradDir_diag')?.classList.toggle('active', dir === 'diagonal');
  document.getElementById('btnSeriesGradDir_horiz')?.classList.toggle('active', dir === 'horizontal');
  document.getElementById('btnSeriesGradDir_vert')?.classList.toggle('active', dir === 'vertical');
  const sel = document.getElementById('seriesGradDirSelect');
  if (sel && sel.value !== dir) sel.value = dir;
  updateSeriesGradPreview();
  renderIconMap();
}

export function onSeriesCustomColorInput() {
  const c1 = document.getElementById('seriesColor1')?.value || '#151326';
  const c2 = document.getElementById('seriesColor2')?.value || '#251336';
  const stroke = document.getElementById('seriesStrokeColor')?.value || '#c084fc';
  const text = document.getElementById('seriesTextColor')?.value || '#ffffff';

  state.badge2CustomBg1 = c1;
  state.badge2CustomBg2 = c2;
  state.badge2CustomStroke = stroke;
  state.badge2CustomText = text;

  const c1Hex = document.getElementById('seriesColor1Hex'); if (c1Hex) c1Hex.textContent = c1;
  const c2Hex = document.getElementById('seriesColor2Hex'); if (c2Hex) c2Hex.textContent = c2;
  const sHex = document.getElementById('seriesStrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('seriesTextColorHex'); if (tHex) tHex.textContent = text;

  updateSeriesGradPreview();
  renderIconMap();
}

export function onSeriesSolidColorInput() {
  const bg = document.getElementById('seriesSolidBg')?.value || '#151326';
  const stroke = document.getElementById('seriesSolidStroke')?.value || '#c084fc';
  const text = document.getElementById('seriesSolidText')?.value || '#ffffff';

  state.badge2SolidBg = bg;
  state.badge2SolidStroke = stroke;
  state.badge2SolidText = text;

  const bgHex = document.getElementById('seriesSolidBgHex'); if (bgHex) bgHex.textContent = bg;
  const sHex = document.getElementById('seriesSolidStrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('seriesSolidTextHex'); if (tHex) tHex.textContent = text;

  renderIconMap();
}

export function applySeriesGradPreset(c1, c2, stroke, text) {
  state.badge2CustomBg1 = c1;
  state.badge2CustomBg2 = c2;
  state.badge2CustomStroke = stroke;
  state.badge2CustomText = text;

  const inp1 = document.getElementById('seriesColor1'); if (inp1) inp1.value = c1;
  const inp2 = document.getElementById('seriesColor2'); if (inp2) inp2.value = c2;
  const inps = document.getElementById('seriesStrokeColor'); if (inps) inps.value = stroke;
  const inpt = document.getElementById('seriesTextColor'); if (inpt) inpt.value = text;

  const c1Hex = document.getElementById('seriesColor1Hex'); if (c1Hex) c1Hex.textContent = c1;
  const c2Hex = document.getElementById('seriesColor2Hex'); if (c2Hex) c2Hex.textContent = c2;
  const sHex = document.getElementById('seriesStrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('seriesTextColorHex'); if (tHex) tHex.textContent = text;

  setSeriesColorMode('gradient');
  updateSeriesGradPreview();
  renderIconMap();
  showToast('Applied custom gradient preset');
}

export function handleSeriesLogoSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    state.badge2FileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.badge2Img = img;
        const btn = document.getElementById('seriesLogoUploadBtnText');
        if (btn) btn.textContent = file.name.substring(0, 16) + '...';
        const btnClear = document.getElementById('btnClearSeriesLogo');
        if (btnClear) btnClear.style.display = 'block';
        renderIconMap();
        showToast('Series badge image loaded');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export function clearSeriesLogo() {
  state.badge2Img = null;
  state.badge2FileName = '';
  const btn = document.getElementById('seriesLogoUploadBtnText');
  if (btn) btn.textContent = 'Upload Series Logo...';
  const btnClear = document.getElementById('btnClearSeriesLogo');
  if (btnClear) btnClear.style.display = 'none';
  const inp = document.getElementById('seriesLogoInput');
  if (inp) inp.value = '';
  renderIconMap();
  showToast('Series logo removed');
}

export function onBadge2PaddingChange() {
  const val = parseInt(document.getElementById('seriesPadding')?.value || '12', 10);
  state.badge2EdgePadding = val;
  const valEl = document.getElementById('seriesPaddingVal');
  if (valEl) valEl.textContent = `${val} px`;
  renderIconMap();
}

export function onBadge2InnerPaddingChange() {
  const val = parseInt(document.getElementById('seriesInnerPadding')?.value || '8', 10);
  state.badge2InnerPadding = val;
  const valEl = document.getElementById('seriesInnerPaddingVal');
  if (valEl) valEl.textContent = `${val} px`;
  renderIconMap();
}

export function onIconBadgeScaleChange() {
  const val = document.getElementById('badgeScale')?.value || '26';
  const valEl = document.getElementById('badgeScaleVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}

export function onIconBadgeOpacityChange() {
  const val = document.getElementById('badgeOpacity')?.value || '95';
  const valEl = document.getElementById('badgeOpacityVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}

export function onCreatorPositionChange() {
  const pos = document.getElementById('logoPosition')?.value;
  const c = document.getElementById('creatorCustomPosContainer');
  if (c) c.style.display = pos === 'custom' ? 'block' : 'none';
  renderIconMap();
}

export function onCreatorCoordChange() {
  state.badge1PosX = parseInt(document.getElementById('creatorPosX')?.value || '85', 10);
  state.badge1PosY = parseInt(document.getElementById('creatorPosY')?.value || '85', 10);
  const xVal = document.getElementById('creatorPosXVal'); if (xVal) xVal.textContent = `${state.badge1PosX}%`;
  const yVal = document.getElementById('creatorPosYVal'); if (yVal) yVal.textContent = `${state.badge1PosY}%`;
  renderIconMap();
}

export function snapCreatorCoord(x, y) {
  state.badge1PosX = x;
  state.badge1PosY = y;
  const sx = document.getElementById('creatorPosX'); if (sx) sx.value = x;
  const sy = document.getElementById('creatorPosY'); if (sy) sy.value = y;
  const xVal = document.getElementById('creatorPosXVal'); if (xVal) xVal.textContent = `${x}%`;
  const yVal = document.getElementById('creatorPosYVal'); if (yVal) yVal.textContent = `${y}%`;
  renderIconMap();
}

export function onSeriesPositionChange() {
  const pos = document.getElementById('seriesPosition')?.value;
  const c = document.getElementById('seriesCustomPosContainer');
  if (c) c.style.display = pos === 'custom' ? 'block' : 'none';
  renderIconMap();
}

export function onSeriesCoordChange() {
  state.badge2PosX = parseInt(document.getElementById('seriesPosX')?.value || '15', 10);
  state.badge2PosY = parseInt(document.getElementById('seriesPosY')?.value || '15', 10);
  const xVal = document.getElementById('seriesPosXVal'); if (xVal) xVal.textContent = `${state.badge2PosX}%`;
  const yVal = document.getElementById('seriesPosYVal'); if (yVal) yVal.textContent = `${state.badge2PosY}%`;
  renderIconMap();
}

export function snapSeriesCoord(x, y) {
  state.badge2PosX = x;
  state.badge2PosY = y;
  const sx = document.getElementById('seriesPosX'); if (sx) sx.value = x;
  const sy = document.getElementById('seriesPosY'); if (sy) sy.value = y;
  const xVal = document.getElementById('seriesPosXVal'); if (xVal) xVal.textContent = `${x}%`;
  const yVal = document.getElementById('seriesPosYVal'); if (yVal) yVal.textContent = `${y}%`;
  renderIconMap();
}
export function onSeriesBadgeScaleChange() {
  const val = document.getElementById('seriesScale')?.value || '24';
  const valEl = document.getElementById('seriesScaleVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}
export function onSeriesBadgeOpacityChange() {
  const val = document.getElementById('seriesOpacity')?.value || '95';
  const valEl = document.getElementById('seriesOpacityVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}
export function onSeriesPaddingChange() { onBadge2PaddingChange(); }
export function onSeriesInnerPaddingChange() { onBadge2InnerPaddingChange(); }

export function toggleBadge2TextGrad(checked) {
  state.badge2TextGradEnabled = checked;
  const c = document.getElementById('badge2TextGradControls');
  if (c) c.style.display = checked ? 'block' : 'none';
  renderIconMap();
}

export function onBadge2TextGradInput() {
  const c1 = document.getElementById('badge2TextGrad1')?.value || '#ffffff';
  const c2 = document.getElementById('badge2TextGrad2')?.value || '#c084fc';
  state.badge2TextGradColor1 = c1;
  state.badge2TextGradColor2 = c2;
  const hex1 = document.getElementById('badge2TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge2TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  renderIconMap();
}

export function setBadge2TextGradDir(dir) {
  state.badge2TextGradDir = dir;
  document.getElementById('btnBadge2TextDir_vert')?.classList.toggle('active', dir === 'vertical');
  document.getElementById('btnBadge2TextDir_horiz')?.classList.toggle('active', dir === 'horizontal');
  renderIconMap();
}

export function applyBadge2TextGradPreset(c1, c2) {
  state.badge2TextGradColor1 = c1;
  state.badge2TextGradColor2 = c2;
  const el1 = document.getElementById('badge2TextGrad1'); if (el1) el1.value = c1;
  const el2 = document.getElementById('badge2TextGrad2'); if (el2) el2.value = c2;
  const hex1 = document.getElementById('badge2TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge2TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  state.badge2TextGradEnabled = true;
  const chk = document.getElementById('badge2TextGradEnable'); if (chk) chk.checked = true;
  const c = document.getElementById('badge2TextGradControls'); if (c) c.style.display = 'block';
  renderIconMap();
}

// ==========================================
// Extra 1 Badge Handlers (Overlay 3)
// ==========================================
export function setExtra1BadgeMode(mode) {
  state.badge3Type = mode;
  document.getElementById('btnExtra1ModeText')?.classList.toggle('active', mode === 'text');
  document.getElementById('btnExtra1ModePreset')?.classList.toggle('active', mode === 'preset');
  document.getElementById('btnExtra1ModeImage')?.classList.toggle('active', mode === 'image');
  const sel = document.getElementById('extra1ModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const secText = document.getElementById('extra1TextSection');
  const secPreset = document.getElementById('extra1PresetSection');
  const secImg = document.getElementById('extra1ImageSection');

  if (secText) secText.style.display = mode === 'text' ? 'block' : 'none';
  if (secPreset) secPreset.style.display = mode === 'preset' ? 'block' : 'none';
  if (secImg) secImg.style.display = mode === 'image' ? 'block' : 'none';

  if (mode === 'text') {
    const inp = document.getElementById('extra1TextInput');
    if (inp) {
      setTimeout(() => { inp.focus(); inp.select(); }, 40);
    }
  }
  onExtra1TextChange(false);
  renderIconMap();
}

export function onExtra1TextChange(doRender = true) {
  const input = document.getElementById('extra1TextInput');
  state.badge3Text = input ? input.value : '';
  const lenBadge = document.getElementById('extra1TextLengthBadge');
  if (lenBadge) lenBadge.textContent = `${state.badge3Text.length} / 20`;
  if (doRender) renderIconMap();
}

export function clearExtra1Text() {
  const inp = document.getElementById('extra1TextInput');
  if (inp) {
    inp.value = '';
    state.badge3Text = '';
    onExtra1TextChange();
    inp.focus();
  }
}

export function setExtra1TextPreset(text) {
  const input = document.getElementById('extra1TextInput');
  if (input) {
    input.value = text;
    state.badge3Text = text;
  }
  setExtra1BadgeMode('text');
  onExtra1TextChange();
  showToast(`Set Extra 1 text: "${text}"`);
}

export function onExtra1FontChange() {
  const sel = document.getElementById('extra1FontFamily');
  state.badge3Font = sel ? sel.value : 'Montserrat';
  loadGoogleFont(state.badge3Font, () => renderIconMap());
}

export function toggleExtra1Bold() {
  state.badge3Bold = !state.badge3Bold;
  document.getElementById('btnExtra1Bold')?.classList.toggle('active', state.badge3Bold);
  renderIconMap();
}

export function toggleExtra1Italic() {
  state.badge3Italic = !state.badge3Italic;
  document.getElementById('btnExtra1Italic')?.classList.toggle('active', state.badge3Italic);
  renderIconMap();
}

export function toggleExtra1LetterSpacing() {
  state.badge3LetterSpacing = !state.badge3LetterSpacing;
  document.getElementById('btnExtra1LetterSpacing')?.classList.toggle('active', state.badge3LetterSpacing);
  renderIconMap();
}

export function onExtra1PtSizeChange() {
  const val = parseInt(document.getElementById('extra1PtSize')?.value || '13', 10);
  state.badge3PtSize = val;
  const valEl = document.getElementById('extra1PtSizeVal');
  if (valEl) valEl.textContent = `${val} pt`;
  renderIconMap();
}

export function setExtra1ColorMode(mode) {
  state.badge3ColorMode = mode;
  document.getElementById('btnExtra1ColorTheme')?.classList.toggle('active', mode === 'theme');
  document.getElementById('btnExtra1ColorGradient')?.classList.toggle('active', mode === 'gradient');
  document.getElementById('btnExtra1ColorSolid')?.classList.toggle('active', mode === 'solid');
  const sel = document.getElementById('extra1ColorModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const pTheme = document.getElementById('extra1ColorThemePanel');
  const pGrad = document.getElementById('extra1CustomGradPanel');
  const pSolid = document.getElementById('extra1CustomSolidPanel');

  if (pTheme) pTheme.style.display = mode === 'theme' ? 'block' : 'none';
  if (pGrad) pGrad.style.display = mode === 'gradient' ? 'block' : 'none';
  if (pSolid) pSolid.style.display = mode === 'solid' ? 'block' : 'none';

  const badge = document.getElementById('extra1ColorModeBadge');
  if (badge) badge.textContent = mode === 'theme' ? 'Themes' : (mode === 'gradient' ? 'Custom Gradient' : 'Solid Color');

  renderIconMap();
}

export function setExtra1ColorTheme(themeName) {
  if (!SERIES_COLOR_THEMES[themeName]) return;
  state.badge3ColorTheme = themeName;
  document.querySelectorAll('#extra1ColorThemes .theme-chip').forEach(btn => {
    btn.classList.toggle('active', btn.id === `themeBtnExtra1_${themeName}`);
  });
  const sel = document.getElementById('extra1ThemeSelect');
  if (sel && sel.value !== themeName) sel.value = themeName;
  renderIconMap();
}

export function onExtra1CustomColorInput() {
  const c1 = document.getElementById('extra1Color1')?.value || '#06241a';
  const c2 = document.getElementById('extra1Color2')?.value || '#0d3d2c';
  const stroke = document.getElementById('extra1StrokeColor')?.value || '#34d399';
  const text = document.getElementById('extra1TextColor')?.value || '#ffffff';

  state.badge3CustomBg1 = c1;
  state.badge3CustomBg2 = c2;
  state.badge3CustomStroke = stroke;
  state.badge3CustomText = text;

  const c1Hex = document.getElementById('extra1Color1Hex'); if (c1Hex) c1Hex.textContent = c1;
  const c2Hex = document.getElementById('extra1Color2Hex'); if (c2Hex) c2Hex.textContent = c2;
  const sHex = document.getElementById('extra1StrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('extra1TextColorHex'); if (tHex) tHex.textContent = text;

  const prev = document.getElementById('extra1GradPreview');
  if (prev) prev.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  renderIconMap();
}

export function onExtra1SolidColorInput() {
  const bg = document.getElementById('extra1SolidBg')?.value || '#06241a';
  const stroke = document.getElementById('extra1SolidStroke')?.value || '#34d399';
  const text = document.getElementById('extra1SolidText')?.value || '#ffffff';

  state.badge3SolidBg = bg;
  state.badge3SolidStroke = stroke;
  state.badge3SolidText = text;

  const bgHex = document.getElementById('extra1SolidBgHex'); if (bgHex) bgHex.textContent = bg;
  const sHex = document.getElementById('extra1SolidStrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('extra1SolidTextHex'); if (tHex) tHex.textContent = text;

  renderIconMap();
}

export function applyExtra1Preset(presetName) {
  state.badge3Preset = presetName;
  state.badge3Type = 'preset';
  setExtra1BadgeMode('preset');
  const sel = document.getElementById('extra1PresetSelect');
  if (sel && sel.value !== presetName) sel.value = presetName;
  renderIconMap();
  showToast(`Selected "${presetName.toUpperCase()}" for Extra 1`);
}

export function handleExtra1LogoSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    state.badge3FileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.badge3Img = img;
        const btn = document.getElementById('extra1LogoUploadBtnText');
        if (btn) btn.textContent = file.name.substring(0, 16) + '...';
        const btnClear = document.getElementById('btnClearExtra1Logo');
        if (btnClear) btnClear.style.display = 'block';
        renderIconMap();
        showToast('Extra 1 badge image loaded');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export function clearExtra1Logo() {
  state.badge3Img = null;
  state.badge3FileName = '';
  const btn = document.getElementById('extra1LogoUploadBtnText');
  if (btn) btn.textContent = 'Upload Graphic...';
  const btnClear = document.getElementById('btnClearExtra1Logo');
  if (btnClear) btnClear.style.display = 'none';
  const inp = document.getElementById('extra1LogoInput');
  if (inp) inp.value = '';
  renderIconMap();
  showToast('Extra 1 logo removed');
}

export function onExtra1PositionChange() {
  const pos = document.getElementById('extra1Position')?.value;
  const c = document.getElementById('extra1CustomPosContainer');
  if (c) c.style.display = pos === 'custom' ? 'block' : 'none';
  renderIconMap();
}

export function onExtra1CoordChange() {
  state.badge3PosX = parseInt(document.getElementById('extra1PosX')?.value || '20', 10);
  state.badge3PosY = parseInt(document.getElementById('extra1PosY')?.value || '80', 10);
  const xVal = document.getElementById('extra1PosXVal'); if (xVal) xVal.textContent = `${state.badge3PosX}%`;
  const yVal = document.getElementById('extra1PosYVal'); if (yVal) yVal.textContent = `${state.badge3PosY}%`;
  renderIconMap();
}

export function snapExtra1Coord(x, y) {
  state.badge3PosX = x;
  state.badge3PosY = y;
  const sx = document.getElementById('extra1PosX'); if (sx) sx.value = x;
  const sy = document.getElementById('extra1PosY'); if (sy) sy.value = y;
  const xVal = document.getElementById('extra1PosXVal'); if (xVal) xVal.textContent = `${x}%`;
  const yVal = document.getElementById('extra1PosYVal'); if (yVal) yVal.textContent = `${y}%`;
  renderIconMap();
}
export function onExtra1ScaleChange() {
  const val = document.getElementById('extra1Scale')?.value || '24';
  const valEl = document.getElementById('extra1ScaleVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}
export function onExtra1PaddingChange() {
  const val = parseInt(document.getElementById('extra1Padding')?.value || '12', 10);
  state.badge3EdgePadding = val;
  const valEl = document.getElementById('extra1PaddingVal');
  if (valEl) valEl.textContent = `${val} px`;
  renderIconMap();
}
export function onExtra1OpacityChange() {
  const val = document.getElementById('extra1Opacity')?.value || '95';
  const valEl = document.getElementById('extra1OpacityVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}

export function toggleBadge3TextGrad(checked) {
  state.badge3TextGradEnabled = checked;
  const c = document.getElementById('badge3TextGradControls');
  if (c) c.style.display = checked ? 'block' : 'none';
  renderIconMap();
}

export function onBadge3TextGradInput() {
  const c1 = document.getElementById('badge3TextGrad1')?.value || '#ffffff';
  const c2 = document.getElementById('badge3TextGrad2')?.value || '#34d399';
  state.badge3TextGradColor1 = c1;
  state.badge3TextGradColor2 = c2;
  const hex1 = document.getElementById('badge3TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge3TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  renderIconMap();
}

export function setBadge3TextGradDir(dir) {
  state.badge3TextGradDir = dir;
  document.getElementById('btnBadge3TextDir_vert')?.classList.toggle('active', dir === 'vertical');
  document.getElementById('btnBadge3TextDir_horiz')?.classList.toggle('active', dir === 'horizontal');
  const sel = document.getElementById('extra1TextGradDirSelect');
  if (sel && sel.value !== dir) sel.value = dir;
  renderIconMap();
}

export function applyBadge3TextGradPreset(c1, c2) {
  state.badge3TextGradColor1 = c1;
  state.badge3TextGradColor2 = c2;
  const el1 = document.getElementById('badge3TextGrad1'); if (el1) el1.value = c1;
  const el2 = document.getElementById('badge3TextGrad2'); if (el2) el2.value = c2;
  const hex1 = document.getElementById('badge3TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge3TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  state.badge3TextGradEnabled = true;
  const chk = document.getElementById('badge3TextGradEnable'); if (chk) chk.checked = true;
  const c = document.getElementById('badge3TextGradControls'); if (c) c.style.display = 'block';
  renderIconMap();
}

// ==========================================
// Extra 2 Badge Handlers (Overlay 4)
// ==========================================
export function setExtra2BadgeMode(mode) {
  state.badge4Type = mode;
  document.getElementById('btnExtra2ModeText')?.classList.toggle('active', mode === 'text');
  document.getElementById('btnExtra2ModePreset')?.classList.toggle('active', mode === 'preset');
  document.getElementById('btnExtra2ModeImage')?.classList.toggle('active', mode === 'image');
  const sel = document.getElementById('extra2ModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const secText = document.getElementById('extra2TextSection');
  const secPreset = document.getElementById('extra2PresetSection');
  const secImg = document.getElementById('extra2ImageSection');

  if (secText) secText.style.display = mode === 'text' ? 'block' : 'none';
  if (secPreset) secPreset.style.display = mode === 'preset' ? 'block' : 'none';
  if (secImg) secImg.style.display = mode === 'image' ? 'block' : 'none';

  if (mode === 'text') {
    const inp = document.getElementById('extra2TextInput');
    if (inp) {
      setTimeout(() => { inp.focus(); inp.select(); }, 40);
    }
  }
  onExtra2TextChange(false);
  renderIconMap();
}

export function onExtra2TextChange(doRender = true) {
  const input = document.getElementById('extra2TextInput');
  state.badge4Text = input ? input.value : '';
  const lenBadge = document.getElementById('extra2TextLengthBadge');
  if (lenBadge) lenBadge.textContent = `${state.badge4Text.length} / 20`;
  if (doRender) renderIconMap();
}

export function clearExtra2Text() {
  const inp = document.getElementById('extra2TextInput');
  if (inp) {
    inp.value = '';
    state.badge4Text = '';
    onExtra2TextChange();
    inp.focus();
  }
}

export function setExtra2TextPreset(text) {
  const input = document.getElementById('extra2TextInput');
  if (input) {
    input.value = text;
    state.badge4Text = text;
  }
  setExtra2BadgeMode('text');
  onExtra2TextChange();
  showToast(`Set Extra 2 text: "${text}"`);
}

export function onExtra2FontChange() {
  const sel = document.getElementById('extra2FontFamily');
  state.badge4Font = sel ? sel.value : 'Montserrat';
  loadGoogleFont(state.badge4Font, () => renderIconMap());
}

export function toggleExtra2Bold() {
  state.badge4Bold = !state.badge4Bold;
  document.getElementById('btnExtra2Bold')?.classList.toggle('active', state.badge4Bold);
  renderIconMap();
}

export function toggleExtra2Italic() {
  state.badge4Italic = !state.badge4Italic;
  document.getElementById('btnExtra2Italic')?.classList.toggle('active', state.badge4Italic);
  renderIconMap();
}

export function toggleExtra2LetterSpacing() {
  state.badge4LetterSpacing = !state.badge4LetterSpacing;
  document.getElementById('btnExtra2LetterSpacing')?.classList.toggle('active', state.badge4LetterSpacing);
  renderIconMap();
}

export function onExtra2PtSizeChange() {
  const val = parseInt(document.getElementById('extra2PtSize')?.value || '13', 10);
  state.badge4PtSize = val;
  const valEl = document.getElementById('extra2PtSizeVal');
  if (valEl) valEl.textContent = `${val} pt`;
  renderIconMap();
}

export function setExtra2ColorMode(mode) {
  state.badge4ColorMode = mode;
  document.getElementById('btnExtra2ColorTheme')?.classList.toggle('active', mode === 'theme');
  document.getElementById('btnExtra2ColorGradient')?.classList.toggle('active', mode === 'gradient');
  document.getElementById('btnExtra2ColorSolid')?.classList.toggle('active', mode === 'solid');
  const sel = document.getElementById('extra2ColorModeSelect');
  if (sel && sel.value !== mode) sel.value = mode;

  const pTheme = document.getElementById('extra2ColorThemePanel');
  const pGrad = document.getElementById('extra2CustomGradPanel');
  const pSolid = document.getElementById('extra2CustomSolidPanel');

  if (pTheme) pTheme.style.display = mode === 'theme' ? 'block' : 'none';
  if (pGrad) pGrad.style.display = mode === 'gradient' ? 'block' : 'none';
  if (pSolid) pSolid.style.display = mode === 'solid' ? 'block' : 'none';

  const badge = document.getElementById('extra2ColorModeBadge');
  if (badge) badge.textContent = mode === 'theme' ? 'Themes' : (mode === 'gradient' ? 'Custom Gradient' : 'Solid Color');

  renderIconMap();
}

export function setExtra2ColorTheme(themeName) {
  if (!SERIES_COLOR_THEMES[themeName]) return;
  state.badge4ColorTheme = themeName;
  document.querySelectorAll('#extra2ColorThemes .theme-chip').forEach(btn => {
    btn.classList.toggle('active', btn.id === `themeBtnExtra2_${themeName}`);
  });
  const sel = document.getElementById('extra2ThemeSelect');
  if (sel && sel.value !== themeName) sel.value = themeName;
  renderIconMap();
}

export function onExtra2CustomColorInput() {
  const c1 = document.getElementById('extra2Color1')?.value || '#241806';
  const c2 = document.getElementById('extra2Color2')?.value || '#3d2a0d';
  const stroke = document.getElementById('extra2StrokeColor')?.value || '#fbbf24';
  const text = document.getElementById('extra2TextColor')?.value || '#ffffff';

  state.badge4CustomBg1 = c1;
  state.badge4CustomBg2 = c2;
  state.badge4CustomStroke = stroke;
  state.badge4CustomText = text;

  const c1Hex = document.getElementById('extra2Color1Hex'); if (c1Hex) c1Hex.textContent = c1;
  const c2Hex = document.getElementById('extra2Color2Hex'); if (c2Hex) c2Hex.textContent = c2;
  const sHex = document.getElementById('extra2StrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('extra2TextColorHex'); if (tHex) tHex.textContent = text;

  const prev = document.getElementById('extra2GradPreview');
  if (prev) prev.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  renderIconMap();
}

export function onExtra2SolidColorInput() {
  const bg = document.getElementById('extra2SolidBg')?.value || '#241806';
  const stroke = document.getElementById('extra2SolidStroke')?.value || '#fbbf24';
  const text = document.getElementById('extra2SolidText')?.value || '#ffffff';

  state.badge4SolidBg = bg;
  state.badge4SolidStroke = stroke;
  state.badge4SolidText = text;

  const bgHex = document.getElementById('extra2SolidBgHex'); if (bgHex) bgHex.textContent = bg;
  const sHex = document.getElementById('extra2SolidStrokeHex'); if (sHex) sHex.textContent = stroke;
  const tHex = document.getElementById('extra2SolidTextHex'); if (tHex) tHex.textContent = text;

  renderIconMap();
}

export function applyExtra2Preset(presetName) {
  state.badge4Preset = presetName;
  state.badge4Type = 'preset';
  setExtra2BadgeMode('preset');
  const sel = document.getElementById('extra2PresetSelect');
  if (sel && sel.value !== presetName) sel.value = presetName;
  renderIconMap();
  showToast(`Selected "${presetName.toUpperCase()}" for Extra 2`);
}

export function handleExtra2LogoSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    state.badge4FileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.badge4Img = img;
        const btn = document.getElementById('extra2LogoUploadBtnText');
        if (btn) btn.textContent = file.name.substring(0, 16) + '...';
        const btnClear = document.getElementById('btnClearExtra2Logo');
        if (btnClear) btnClear.style.display = 'block';
        renderIconMap();
        showToast('Extra 2 badge image loaded');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

export function clearExtra2Logo() {
  state.badge4Img = null;
  state.badge4FileName = '';
  const btn = document.getElementById('extra2LogoUploadBtnText');
  if (btn) btn.textContent = 'Upload Graphic...';
  const btnClear = document.getElementById('btnClearExtra2Logo');
  if (btnClear) btnClear.style.display = 'none';
  const inp = document.getElementById('extra2LogoInput');
  if (inp) inp.value = '';
  renderIconMap();
  showToast('Extra 2 logo removed');
}

export function onExtra2PositionChange() {
  const pos = document.getElementById('extra2Position')?.value;
  const c = document.getElementById('extra2CustomPosContainer');
  if (c) c.style.display = pos === 'custom' ? 'block' : 'none';
  renderIconMap();
}

export function onExtra2CoordChange() {
  state.badge4PosX = parseInt(document.getElementById('extra2PosX')?.value || '80', 10);
  state.badge4PosY = parseInt(document.getElementById('extra2PosY')?.value || '20', 10);
  const xVal = document.getElementById('extra2PosXVal'); if (xVal) xVal.textContent = `${state.badge4PosX}%`;
  const yVal = document.getElementById('extra2PosYVal'); if (yVal) yVal.textContent = `${state.badge4PosY}%`;
  renderIconMap();
}

export function snapExtra2Coord(x, y) {
  state.badge4PosX = x;
  state.badge4PosY = y;
  const sx = document.getElementById('extra2PosX'); if (sx) sx.value = x;
  const sy = document.getElementById('extra2PosY'); if (sy) sy.value = y;
  const xVal = document.getElementById('extra2PosXVal'); if (xVal) xVal.textContent = `${x}%`;
  const yVal = document.getElementById('extra2PosYVal'); if (yVal) yVal.textContent = `${y}%`;
  renderIconMap();
}
export function onExtra2ScaleChange() {
  const val = document.getElementById('extra2Scale')?.value || '24';
  const valEl = document.getElementById('extra2ScaleVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}
export function onExtra2PaddingChange() {
  const val = parseInt(document.getElementById('extra2Padding')?.value || '12', 10);
  state.badge4EdgePadding = val;
  const valEl = document.getElementById('extra2PaddingVal');
  if (valEl) valEl.textContent = `${val} px`;
  renderIconMap();
}
export function onExtra2OpacityChange() {
  const val = document.getElementById('extra2Opacity')?.value || '95';
  const valEl = document.getElementById('extra2OpacityVal');
  if (valEl) valEl.textContent = `${val}%`;
  renderIconMap();
}

export function toggleBadge4TextGrad(checked) {
  state.badge4TextGradEnabled = checked;
  const c = document.getElementById('badge4TextGradControls');
  if (c) c.style.display = checked ? 'block' : 'none';
  renderIconMap();
}

export function onBadge4TextGradInput() {
  const c1 = document.getElementById('badge4TextGrad1')?.value || '#ffffff';
  const c2 = document.getElementById('badge4TextGrad2')?.value || '#fbbf24';
  state.badge4TextGradColor1 = c1;
  state.badge4TextGradColor2 = c2;
  const hex1 = document.getElementById('badge4TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge4TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  renderIconMap();
}

export function setBadge4TextGradDir(dir) {
  state.badge4TextGradDir = dir;
  document.getElementById('btnBadge4TextDir_vert')?.classList.toggle('active', dir === 'vertical');
  document.getElementById('btnBadge4TextDir_horiz')?.classList.toggle('active', dir === 'horizontal');
  const sel = document.getElementById('extra2TextGradDirSelect');
  if (sel && sel.value !== dir) sel.value = dir;
  renderIconMap();
}

export function applyBadge4TextGradPreset(c1, c2) {
  state.badge4TextGradColor1 = c1;
  state.badge4TextGradColor2 = c2;
  const el1 = document.getElementById('badge4TextGrad1'); if (el1) el1.value = c1;
  const el2 = document.getElementById('badge4TextGrad2'); if (el2) el2.value = c2;
  const hex1 = document.getElementById('badge4TextGrad1Hex'); if (hex1) hex1.textContent = c1;
  const hex2 = document.getElementById('badge4TextGrad2Hex'); if (hex2) hex2.textContent = c2;
  state.badge4TextGradEnabled = true;
  const chk = document.getElementById('badge4TextGradEnable'); if (chk) chk.checked = true;
  const c = document.getElementById('badge4TextGradControls'); if (c) c.style.display = 'block';
  renderIconMap();
}

// ==========================================
// Copy & Sync Style Across Any Badges
// ==========================================
export function copyBadgeStyle(source, target) {
  const getBadgeConfig = (role) => {
    if (role === 'creator') {
      return {
        font: state.badge1Font,
        bold: state.badge1Bold,
        italic: state.badge1Italic,
        ptSize: state.badge1PtSize,
        letterSpacing: state.badge1LetterSpacing,
        colorMode: state.badge1ColorMode,
        colorTheme: state.badge1ColorTheme,
        customBg1: state.badge1CustomBg1,
        customBg2: state.badge1CustomBg2,
        customStroke: state.badge1CustomStroke,
        customText: state.badge1CustomText,
        solidBg: state.badge1SolidBg,
        solidStroke: state.badge1SolidStroke,
        solidText: state.badge1SolidText,
        gradDir: state.badge1GradDir,
        textGradEnabled: state.badge1TextGradEnabled,
        textGradColor1: state.badge1TextGradColor1,
        textGradColor2: state.badge1TextGradColor2,
        textGradDir: state.badge1TextGradDir
      };
    }
    if (role === 'series') {
      return {
        font: state.badge2Font,
        bold: state.badge2Bold,
        italic: state.badge2Italic,
        ptSize: state.badge2PtSize,
        letterSpacing: state.badge2LetterSpacing,
        colorMode: state.badge2ColorMode,
        colorTheme: state.badge2ColorTheme,
        customBg1: state.badge2CustomBg1,
        customBg2: state.badge2CustomBg2,
        customStroke: state.badge2CustomStroke,
        customText: state.badge2CustomText,
        solidBg: state.badge2SolidBg,
        solidStroke: state.badge2SolidStroke,
        solidText: state.badge2SolidText,
        gradDir: state.badge2GradDir,
        textGradEnabled: state.badge2TextGradEnabled,
        textGradColor1: state.badge2TextGradColor1,
        textGradColor2: state.badge2TextGradColor2,
        textGradDir: state.badge2TextGradDir
      };
    }
    if (role === 'extra1') {
      return {
        font: state.badge3Font,
        bold: state.badge3Bold,
        italic: state.badge3Italic,
        ptSize: state.badge3PtSize,
        letterSpacing: state.badge3LetterSpacing,
        colorMode: state.badge3ColorMode,
        colorTheme: state.badge3ColorTheme,
        customBg1: state.badge3CustomBg1,
        customBg2: state.badge3CustomBg2,
        customStroke: state.badge3CustomStroke,
        customText: state.badge3CustomText,
        solidBg: state.badge3SolidBg,
        solidStroke: state.badge3SolidStroke,
        solidText: state.badge3SolidText,
        gradDir: state.badge3GradDir,
        textGradEnabled: state.badge3TextGradEnabled,
        textGradColor1: state.badge3TextGradColor1,
        textGradColor2: state.badge3TextGradColor2,
        textGradDir: state.badge3TextGradDir
      };
    }
    return {
      font: state.badge4Font,
      bold: state.badge4Bold,
      italic: state.badge4Italic,
      ptSize: state.badge4PtSize,
      letterSpacing: state.badge4LetterSpacing,
      colorMode: state.badge4ColorMode,
      colorTheme: state.badge4ColorTheme,
      customBg1: state.badge4CustomBg1,
      customBg2: state.badge4CustomBg2,
      customStroke: state.badge4CustomStroke,
      customText: state.badge4CustomText,
      solidBg: state.badge4SolidBg,
      solidStroke: state.badge4SolidStroke,
      solidText: state.badge4SolidText,
      gradDir: state.badge4GradDir,
      textGradEnabled: state.badge4TextGradEnabled,
      textGradColor1: state.badge4TextGradColor1,
      textGradColor2: state.badge4TextGradColor2,
      textGradDir: state.badge4TextGradDir
    };
  };

  const applyToRole = (cfg, role) => {
    if (role === 'creator') {
      state.badge1Font = cfg.font;
      state.badge1Bold = cfg.bold;
      state.badge1Italic = cfg.italic;
      state.badge1PtSize = cfg.ptSize;
      state.badge1LetterSpacing = cfg.letterSpacing;
      state.badge1ColorMode = cfg.colorMode;
      state.badge1ColorTheme = cfg.colorTheme;
      state.badge1CustomBg1 = cfg.customBg1;
      state.badge1CustomBg2 = cfg.customBg2;
      state.badge1CustomStroke = cfg.customStroke;
      state.badge1CustomText = cfg.customText;
      state.badge1SolidBg = cfg.solidBg;
      state.badge1SolidStroke = cfg.solidStroke;
      state.badge1SolidText = cfg.solidText;
      state.badge1GradDir = cfg.gradDir;
      state.badge1TextGradEnabled = cfg.textGradEnabled;
      state.badge1TextGradColor1 = cfg.textGradColor1;
      state.badge1TextGradColor2 = cfg.textGradColor2;
      state.badge1TextGradDir = cfg.textGradDir;
      if (document.getElementById('badge1FontFamily')) document.getElementById('badge1FontFamily').value = cfg.font;
      document.getElementById('btnBadge1Bold')?.classList.toggle('active', cfg.bold);
      document.getElementById('btnBadge1Italic')?.classList.toggle('active', cfg.italic);
      document.getElementById('btnBadge1LetterSpacing')?.classList.toggle('active', cfg.letterSpacing);
      if (document.getElementById('badge1PtSize')) document.getElementById('badge1PtSize').value = cfg.ptSize;
      if (document.getElementById('badge1PtSizeVal')) document.getElementById('badge1PtSizeVal').textContent = `${cfg.ptSize} pt`;
      if (document.getElementById('badge1TextGradEnable')) document.getElementById('badge1TextGradEnable').checked = cfg.textGradEnabled;
      if (document.getElementById('badge1TextGradControls')) document.getElementById('badge1TextGradControls').style.display = cfg.textGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge1TextGrad1')) document.getElementById('badge1TextGrad1').value = cfg.textGradColor1;
      if (document.getElementById('badge1TextGrad2')) document.getElementById('badge1TextGrad2').value = cfg.textGradColor2;
      if (document.getElementById('badge1TextGrad1Hex')) document.getElementById('badge1TextGrad1Hex').textContent = cfg.textGradColor1;
      if (document.getElementById('badge1TextGrad2Hex')) document.getElementById('badge1TextGrad2Hex').textContent = cfg.textGradColor2;
      setBadge1TextGradDir(cfg.textGradDir);
      setCreatorColorMode(cfg.colorMode);
      setCreatorColorTheme(cfg.colorTheme);
    } else if (role === 'series') {
      state.badge2Font = cfg.font;
      state.badge2Bold = cfg.bold;
      state.badge2Italic = cfg.italic;
      state.badge2PtSize = cfg.ptSize;
      state.badge2LetterSpacing = cfg.letterSpacing;
      state.badge2ColorMode = cfg.colorMode;
      state.badge2ColorTheme = cfg.colorTheme;
      state.badge2CustomBg1 = cfg.customBg1;
      state.badge2CustomBg2 = cfg.customBg2;
      state.badge2CustomStroke = cfg.customStroke;
      state.badge2CustomText = cfg.customText;
      state.badge2SolidBg = cfg.solidBg;
      state.badge2SolidStroke = cfg.solidStroke;
      state.badge2SolidText = cfg.solidText;
      state.badge2GradDir = cfg.gradDir;
      state.badge2TextGradEnabled = cfg.textGradEnabled;
      state.badge2TextGradColor1 = cfg.textGradColor1;
      state.badge2TextGradColor2 = cfg.textGradColor2;
      state.badge2TextGradDir = cfg.textGradDir;
      if (document.getElementById('seriesFontFamily')) document.getElementById('seriesFontFamily').value = cfg.font;
      document.getElementById('btnSeriesBold')?.classList.toggle('active', cfg.bold);
      document.getElementById('btnSeriesItalic')?.classList.toggle('active', cfg.italic);
      document.getElementById('btnSeriesLetterSpacing')?.classList.toggle('active', cfg.letterSpacing);
      if (document.getElementById('seriesPtSize')) document.getElementById('seriesPtSize').value = cfg.ptSize;
      if (document.getElementById('seriesPtSizeVal')) document.getElementById('seriesPtSizeVal').textContent = `${cfg.ptSize} pt`;
      if (document.getElementById('badge2TextGradEnable')) document.getElementById('badge2TextGradEnable').checked = cfg.textGradEnabled;
      if (document.getElementById('badge2TextGradControls')) document.getElementById('badge2TextGradControls').style.display = cfg.textGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge2TextGrad1')) document.getElementById('badge2TextGrad1').value = cfg.textGradColor1;
      if (document.getElementById('badge2TextGrad2')) document.getElementById('badge2TextGrad2').value = cfg.textGradColor2;
      if (document.getElementById('badge2TextGrad1Hex')) document.getElementById('badge2TextGrad1Hex').textContent = cfg.textGradColor1;
      if (document.getElementById('badge2TextGrad2Hex')) document.getElementById('badge2TextGrad2Hex').textContent = cfg.textGradColor2;
      setBadge2TextGradDir(cfg.textGradDir);
      setSeriesColorMode(cfg.colorMode);
      setSeriesColorTheme(cfg.colorTheme);
    } else if (role === 'extra1') {
      state.badge3Font = cfg.font;
      state.badge3Bold = cfg.bold;
      state.badge3Italic = cfg.italic;
      state.badge3PtSize = cfg.ptSize;
      state.badge3LetterSpacing = cfg.letterSpacing;
      state.badge3ColorMode = cfg.colorMode;
      state.badge3ColorTheme = cfg.colorTheme;
      state.badge3CustomBg1 = cfg.customBg1;
      state.badge3CustomBg2 = cfg.customBg2;
      state.badge3CustomStroke = cfg.customStroke;
      state.badge3CustomText = cfg.customText;
      state.badge3SolidBg = cfg.solidBg;
      state.badge3SolidStroke = cfg.solidStroke;
      state.badge3SolidText = cfg.solidText;
      state.badge3GradDir = cfg.gradDir;
      state.badge3TextGradEnabled = cfg.textGradEnabled;
      state.badge3TextGradColor1 = cfg.textGradColor1;
      state.badge3TextGradColor2 = cfg.textGradColor2;
      state.badge3TextGradDir = cfg.textGradDir;
      if (document.getElementById('extra1FontFamily')) document.getElementById('extra1FontFamily').value = cfg.font;
      document.getElementById('btnExtra1Bold')?.classList.toggle('active', cfg.bold);
      document.getElementById('btnExtra1Italic')?.classList.toggle('active', cfg.italic);
      document.getElementById('btnExtra1LetterSpacing')?.classList.toggle('active', cfg.letterSpacing);
      if (document.getElementById('extra1PtSize')) document.getElementById('extra1PtSize').value = cfg.ptSize;
      if (document.getElementById('extra1PtSizeVal')) document.getElementById('extra1PtSizeVal').textContent = `${cfg.ptSize} pt`;
      if (document.getElementById('badge3TextGradEnable')) document.getElementById('badge3TextGradEnable').checked = cfg.textGradEnabled;
      if (document.getElementById('badge3TextGradControls')) document.getElementById('badge3TextGradControls').style.display = cfg.textGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge3TextGrad1')) document.getElementById('badge3TextGrad1').value = cfg.textGradColor1;
      if (document.getElementById('badge3TextGrad2')) document.getElementById('badge3TextGrad2').value = cfg.textGradColor2;
      if (document.getElementById('badge3TextGrad1Hex')) document.getElementById('badge3TextGrad1Hex').textContent = cfg.textGradColor1;
      if (document.getElementById('badge3TextGrad2Hex')) document.getElementById('badge3TextGrad2Hex').textContent = cfg.textGradColor2;
      setBadge3TextGradDir(cfg.textGradDir);
      setExtra1ColorMode(cfg.colorMode);
      setExtra1ColorTheme(cfg.colorTheme);
    } else if (role === 'extra2') {
      state.badge4Font = cfg.font;
      state.badge4Bold = cfg.bold;
      state.badge4Italic = cfg.italic;
      state.badge4PtSize = cfg.ptSize;
      state.badge4LetterSpacing = cfg.letterSpacing;
      state.badge4ColorMode = cfg.colorMode;
      state.badge4ColorTheme = cfg.colorTheme;
      state.badge4CustomBg1 = cfg.customBg1;
      state.badge4CustomBg2 = cfg.customBg2;
      state.badge4CustomStroke = cfg.customStroke;
      state.badge4CustomText = cfg.customText;
      state.badge4SolidBg = cfg.solidBg;
      state.badge4SolidStroke = cfg.solidStroke;
      state.badge4SolidText = cfg.solidText;
      state.badge4GradDir = cfg.gradDir;
      state.badge4TextGradEnabled = cfg.textGradEnabled;
      state.badge4TextGradColor1 = cfg.textGradColor1;
      state.badge4TextGradColor2 = cfg.textGradColor2;
      state.badge4TextGradDir = cfg.textGradDir;
      if (document.getElementById('extra2FontFamily')) document.getElementById('extra2FontFamily').value = cfg.font;
      document.getElementById('btnExtra2Bold')?.classList.toggle('active', cfg.bold);
      document.getElementById('btnExtra2Italic')?.classList.toggle('active', cfg.italic);
      document.getElementById('btnExtra2LetterSpacing')?.classList.toggle('active', cfg.letterSpacing);
      if (document.getElementById('extra2PtSize')) document.getElementById('extra2PtSize').value = cfg.ptSize;
      if (document.getElementById('extra2PtSizeVal')) document.getElementById('extra2PtSizeVal').textContent = `${cfg.ptSize} pt`;
      if (document.getElementById('badge4TextGradEnable')) document.getElementById('badge4TextGradEnable').checked = cfg.textGradEnabled;
      if (document.getElementById('badge4TextGradControls')) document.getElementById('badge4TextGradControls').style.display = cfg.textGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge4TextGrad1')) document.getElementById('badge4TextGrad1').value = cfg.textGradColor1;
      if (document.getElementById('badge4TextGrad2')) document.getElementById('badge4TextGrad2').value = cfg.textGradColor2;
      if (document.getElementById('badge4TextGrad1Hex')) document.getElementById('badge4TextGrad1Hex').textContent = cfg.textGradColor1;
      if (document.getElementById('badge4TextGrad2Hex')) document.getElementById('badge4TextGrad2Hex').textContent = cfg.textGradColor2;
      setBadge4TextGradDir(cfg.textGradDir);
      setExtra2ColorMode(cfg.colorMode);
      setExtra2ColorTheme(cfg.colorTheme);
    }
  };

  const srcConfig = getBadgeConfig(source);
  if (target === 'all') {
    ['series', 'extra1', 'extra2'].forEach(r => applyToRole(srcConfig, r));
    showToast(`Copied ${source} style to all badges`);
  } else {
    applyToRole(srcConfig, target);
    showToast(`Copied ${source} style to ${target}`);
  }
  renderIconMap();
}

// Defaults
export function saveIconBadgeDefaults() {
  try {
    let b1Data = null;
    if (state.designerLogoImg) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = state.designerLogoImg.naturalWidth || state.designerLogoImg.width;
      tempCanvas.height = state.designerLogoImg.naturalHeight || state.designerLogoImg.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(state.designerLogoImg, 0, 0);
      b1Data = tempCanvas.toDataURL('image/png');
    }

    let b2Data = null;
    if (state.badge2Img) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = state.badge2Img.naturalWidth || state.badge2Img.width;
      tempCanvas.height = state.badge2Img.naturalHeight || state.badge2Img.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(state.badge2Img, 0, 0);
      b2Data = tempCanvas.toDataURL('image/png');
    }

    let b3Data = null;
    if (state.badge3Img) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = state.badge3Img.naturalWidth || state.badge3Img.width;
      tempCanvas.height = state.badge3Img.naturalHeight || state.badge3Img.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(state.badge3Img, 0, 0);
      b3Data = tempCanvas.toDataURL('image/png');
    }

    let b4Data = null;
    if (state.badge4Img) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = state.badge4Img.naturalWidth || state.badge4Img.width;
      tempCanvas.height = state.badge4Img.naturalHeight || state.badge4Img.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(state.badge4Img, 0, 0);
      b4Data = tempCanvas.toDataURL('image/png');
    }

    const defaults = {
      hasDefaults: true,
      savedAt: Date.now(),
      iconBgStyle: document.getElementById('iconBgStyle') ? document.getElementById('iconBgStyle').value : 'cs2-dark',
      customGoogleFonts: state.customGoogleFonts || [],
      badge1: {
        enabled: document.getElementById('enableBadge1') ? document.getElementById('enableBadge1').checked : true,
        type: state.badge1Type,
        preset: state.presetLogoType,
        text: document.getElementById('badge1TextInput') ? document.getElementById('badge1TextInput').value : 'CREATOR',
        colorMode: state.badge1ColorMode,
        colorTheme: state.badge1ColorTheme,
        customBg1: state.badge1CustomBg1,
        customBg2: state.badge1CustomBg2,
        customStroke: state.badge1CustomStroke,
        customText: state.badge1CustomText,
        solidBg: state.badge1SolidBg,
        solidStroke: state.badge1SolidStroke,
        solidText: state.badge1SolidText,
        gradDir: state.badge1GradDir,
        letterSpacing: state.badge1LetterSpacing,
        textGradEnabled: state.badge1TextGradEnabled,
        textGradColor1: state.badge1TextGradColor1,
        textGradColor2: state.badge1TextGradColor2,
        textGradDir: state.badge1TextGradDir,
        font: document.getElementById('badge1FontFamily') ? document.getElementById('badge1FontFamily').value : 'Montserrat',
        bold: state.badge1Bold,
        italic: state.badge1Italic,
        ptSize: state.badge1PtSize,
        position: document.getElementById('logoPosition') ? document.getElementById('logoPosition').value : 'custom',
        posX: state.badge1PosX ?? 85,
        posY: state.badge1PosY ?? 85,
        frame: document.getElementById('badge1Frame') ? document.getElementById('badge1Frame').value : 'circle',
        scale: parseInt(document.getElementById('badgeScale')?.value || '26', 10),
        opacity: parseInt(document.getElementById('badgeOpacity')?.value || '95', 10),
        edgePadding: state.badge1EdgePadding,
        innerPadding: state.badge1InnerPadding,
        fileName: state.badge1FileName || '',
        imageData: b1Data
      },
      badge2: {
        enabled: document.getElementById('enableBadge2') ? document.getElementById('enableBadge2').checked : true,
        type: state.badge2Type,
        preset: state.badge2Preset,
        text: document.getElementById('seriesTextInput') ? document.getElementById('seriesTextInput').value : 'GRAFFITI',
        colorMode: state.badge2ColorMode,
        colorTheme: state.badge2ColorTheme || 'purple',
        customBg1: state.badge2CustomBg1,
        customBg2: state.badge2CustomBg2,
        customStroke: state.badge2CustomStroke,
        customText: state.badge2CustomText,
        solidBg: state.badge2SolidBg,
        solidStroke: state.badge2SolidStroke,
        solidText: state.badge2SolidText,
        gradDir: state.badge2GradDir,
        letterSpacing: state.badge2LetterSpacing,
        textGradEnabled: state.badge2TextGradEnabled,
        textGradColor1: state.badge2TextGradColor1,
        textGradColor2: state.badge2TextGradColor2,
        textGradDir: state.badge2TextGradDir,
        font: document.getElementById('seriesFontFamily') ? document.getElementById('seriesFontFamily').value : 'Bebas Neue',
        bold: state.badge2Bold,
        italic: state.badge2Italic,
        ptSize: state.badge2PtSize,
        position: document.getElementById('seriesPosition') ? document.getElementById('seriesPosition').value : 'custom',
        posX: state.badge2PosX ?? 15,
        posY: state.badge2PosY ?? 15,
        frame: document.getElementById('badge2Frame') ? document.getElementById('badge2Frame').value : 'pill',
        scale: parseInt(document.getElementById('seriesScale')?.value || '24', 10),
        opacity: parseInt(document.getElementById('seriesOpacity')?.value || '95', 10),
        edgePadding: state.badge2EdgePadding,
        innerPadding: state.badge2InnerPadding,
        fileName: state.badge2FileName || '',
        imageData: b2Data
      },
      badge3: {
        enabled: document.getElementById('enableBadge3') ? document.getElementById('enableBadge3').checked : state.badge3Enabled,
        type: state.badge3Type,
        preset: state.badge3Preset,
        text: document.getElementById('extra1TextInput') ? document.getElementById('extra1TextInput').value : 'EXTRA 1',
        colorMode: state.badge3ColorMode,
        colorTheme: state.badge3ColorTheme || 'emerald',
        customBg1: state.badge3CustomBg1,
        customBg2: state.badge3CustomBg2,
        customStroke: state.badge3CustomStroke,
        customText: state.badge3CustomText,
        solidBg: state.badge3SolidBg,
        solidStroke: state.badge3SolidStroke,
        solidText: state.badge3SolidText,
        gradDir: state.badge3GradDir,
        letterSpacing: state.badge3LetterSpacing,
        textGradEnabled: state.badge3TextGradEnabled,
        textGradColor1: state.badge3TextGradColor1,
        textGradColor2: state.badge3TextGradColor2,
        textGradDir: state.badge3TextGradDir,
        font: document.getElementById('extra1FontFamily') ? document.getElementById('extra1FontFamily').value : 'Montserrat',
        bold: state.badge3Bold,
        italic: state.badge3Italic,
        ptSize: state.badge3PtSize,
        position: document.getElementById('extra1Position') ? document.getElementById('extra1Position').value : 'custom',
        posX: state.badge3PosX ?? 15,
        posY: state.badge3PosY ?? 85,
        frame: document.getElementById('badge3Frame') ? document.getElementById('badge3Frame').value : 'pill',
        scale: parseInt(document.getElementById('extra1Scale')?.value || '24', 10),
        opacity: parseInt(document.getElementById('extra1Opacity')?.value || '95', 10),
        edgePadding: state.badge3EdgePadding,
        innerPadding: state.badge3InnerPadding,
        fileName: state.badge3FileName || '',
        imageData: b3Data
      },
      badge4: {
        enabled: document.getElementById('enableBadge4') ? document.getElementById('enableBadge4').checked : state.badge4Enabled,
        type: state.badge4Type,
        preset: state.badge4Preset,
        text: document.getElementById('extra2TextInput') ? document.getElementById('extra2TextInput').value : 'EXTRA 2',
        colorMode: state.badge4ColorMode,
        colorTheme: state.badge4ColorTheme || 'amber',
        customBg1: state.badge4CustomBg1,
        customBg2: state.badge4CustomBg2,
        customStroke: state.badge4CustomStroke,
        customText: state.badge4CustomText,
        solidBg: state.badge4SolidBg,
        solidStroke: state.badge4SolidStroke,
        solidText: state.badge4SolidText,
        gradDir: state.badge4GradDir,
        letterSpacing: state.badge4LetterSpacing,
        textGradEnabled: state.badge4TextGradEnabled,
        textGradColor1: state.badge4TextGradColor1,
        textGradColor2: state.badge4TextGradColor2,
        textGradDir: state.badge4TextGradDir,
        font: document.getElementById('extra2FontFamily') ? document.getElementById('extra2FontFamily').value : 'Montserrat',
        bold: state.badge4Bold,
        italic: state.badge4Italic,
        ptSize: state.badge4PtSize,
        position: document.getElementById('extra2Position') ? document.getElementById('extra2Position').value : 'custom',
        posX: state.badge4PosX ?? 85,
        posY: state.badge4PosY ?? 15,
        frame: document.getElementById('badge4Frame') ? document.getElementById('badge4Frame').value : 'pill',
        scale: parseInt(document.getElementById('extra2Scale')?.value || '24', 10),
        opacity: parseInt(document.getElementById('extra2Opacity')?.value || '95', 10),
        edgePadding: state.badge4EdgePadding,
        innerPadding: state.badge4InnerPadding,
        fileName: state.badge4FileName || '',
        imageData: b4Data
      }
    };

    localStorage.setItem(BADGE_DEFAULTS_STORAGE_KEY, JSON.stringify(defaults));
    updateBadgeDefaultsUI();
    showToast('Default In-Game icon overlays saved! They will load automatically.');
  } catch (e) {
    console.error('Failed to save badge defaults', e);
    showToast('Could not save defaults (storage quota exceeded)');
  }
}

export function loadIconBadgeDefaults(silent = false) {
  try {
    const raw = localStorage.getItem(BADGE_DEFAULTS_STORAGE_KEY);
    if (!raw) {
      if (!silent) showToast('No default badges saved yet');
      return false;
    }

    const d = JSON.parse(raw);
    if (!d) return false;

    if (d.customGoogleFonts && Array.isArray(d.customGoogleFonts)) {
      d.customGoogleFonts.forEach(font => {
        if (!state.customGoogleFonts.includes(font)) state.customGoogleFonts.push(font);
        loadGoogleFont(font);
      });
    }
    populateFontDropdowns();

    if (d.iconBgStyle && document.getElementById('iconBgStyle')) {
      document.getElementById('iconBgStyle').value = d.iconBgStyle;
    }

    if (d.badge1) {
      const b1 = d.badge1;
      state.badge1Enabled = b1.enabled !== false;
      if (document.getElementById('enableBadge1')) document.getElementById('enableBadge1').checked = state.badge1Enabled;
      state.badge1Type = b1.type || (b1.imageData ? 'image' : 'preset');
      state.badge1Text = b1.text || 'CREATOR';
      state.badge1Font = b1.font || 'Montserrat';
      state.badge1Bold = b1.bold !== false;
      state.badge1Italic = b1.italic === true;
      state.badge1PtSize = b1.ptSize || 13;

      state.badge1ColorMode = b1.colorMode || 'theme';
      state.badge1ColorTheme = b1.colorTheme || 'cyan';
      state.badge1CustomBg1 = b1.customBg1 || '#091524';
      state.badge1CustomBg2 = b1.customBg2 || '#0e243d';
      state.badge1CustomStroke = b1.customStroke || '#00a8ff';
      state.badge1CustomText = b1.customText || '#ffffff';
      state.badge1SolidBg = b1.solidBg || '#091524';
      state.badge1SolidStroke = b1.solidStroke || '#00a8ff';
      state.badge1SolidText = b1.solidText || '#ffffff';
      state.badge1GradDir = b1.gradDir || 'diagonal';
      state.badge1LetterSpacing = b1.letterSpacing === true;

      setCreatorColorTheme(state.badge1ColorTheme);
      setCreatorGradDirection(state.badge1GradDir);
      setCreatorColorMode(state.badge1ColorMode);

      if (document.getElementById('badge1TextInput')) document.getElementById('badge1TextInput').value = state.badge1Text;
      onBadge1TextChange(false);
      if (document.getElementById('badge1FontFamily')) document.getElementById('badge1FontFamily').value = state.badge1Font;
      document.getElementById('btnBadge1Bold')?.classList.toggle('active', state.badge1Bold);
      document.getElementById('btnBadge1Italic')?.classList.toggle('active', state.badge1Italic);
      if (document.getElementById('badge1PtSize')) {
        document.getElementById('badge1PtSize').value = state.badge1PtSize;
        if (document.getElementById('badge1PtSizeVal')) document.getElementById('badge1PtSizeVal').textContent = `${state.badge1PtSize} pt`;
      }

      state.badge1TextGradEnabled = b1.textGradEnabled === true;
      state.badge1TextGradColor1 = b1.textGradColor1 || '#ffffff';
      state.badge1TextGradColor2 = b1.textGradColor2 || '#38bdf8';
      state.badge1TextGradDir = b1.textGradDir || 'vertical';
      if (document.getElementById('badge1TextGradEnable')) document.getElementById('badge1TextGradEnable').checked = state.badge1TextGradEnabled;
      if (document.getElementById('badge1TextGradControls')) document.getElementById('badge1TextGradControls').style.display = state.badge1TextGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge1TextGrad1')) document.getElementById('badge1TextGrad1').value = state.badge1TextGradColor1;
      if (document.getElementById('badge1TextGrad2')) document.getElementById('badge1TextGrad2').value = state.badge1TextGradColor2;
      if (document.getElementById('badge1TextGrad1Hex')) document.getElementById('badge1TextGrad1Hex').textContent = state.badge1TextGradColor1;
      if (document.getElementById('badge1TextGrad2Hex')) document.getElementById('badge1TextGrad2Hex').textContent = state.badge1TextGradColor2;
      setBadge1TextGradDir(state.badge1TextGradDir);

      if (b1.position && document.getElementById('logoPosition')) document.getElementById('logoPosition').value = b1.position;
      state.badge1PosX = b1.posX !== undefined ? b1.posX : 85;
      state.badge1PosY = b1.posY !== undefined ? b1.posY : 85;
      if (document.getElementById('creatorPosX')) document.getElementById('creatorPosX').value = state.badge1PosX;
      if (document.getElementById('creatorPosY')) document.getElementById('creatorPosY').value = state.badge1PosY;
      if (document.getElementById('creatorPosXVal')) document.getElementById('creatorPosXVal').textContent = `${state.badge1PosX}%`;
      if (document.getElementById('creatorPosYVal')) document.getElementById('creatorPosYVal').textContent = `${state.badge1PosY}%`;
      const cCreator = document.getElementById('creatorCustomPosContainer');
      if (cCreator) cCreator.style.display = (b1.position === 'custom' || !b1.position) ? 'block' : 'none';

      if (b1.frame && document.getElementById('badge1Frame')) document.getElementById('badge1Frame').value = b1.frame;
      if (b1.scale !== undefined && document.getElementById('badgeScale')) {
        document.getElementById('badgeScale').value = b1.scale;
        document.getElementById('badgeScaleVal').textContent = `${b1.scale}%`;
      }
      if (b1.opacity !== undefined && document.getElementById('badgeOpacity')) {
        document.getElementById('badgeOpacity').value = b1.opacity;
        document.getElementById('badgeOpacityVal').textContent = `${b1.opacity}%`;
      }
      if (b1.edgePadding !== undefined) {
        state.badge1EdgePadding = b1.edgePadding;
        if (document.getElementById('badge1Padding')) document.getElementById('badge1Padding').value = b1.edgePadding;
        if (document.getElementById('badge1PaddingVal')) document.getElementById('badge1PaddingVal').textContent = `${b1.edgePadding} px`;
      }
      if (b1.innerPadding !== undefined) {
        state.badge1InnerPadding = b1.innerPadding;
        if (document.getElementById('badge1InnerPadding')) document.getElementById('badge1InnerPadding').value = b1.innerPadding;
        if (document.getElementById('badge1InnerPaddingVal')) document.getElementById('badge1InnerPaddingVal').textContent = `${b1.innerPadding} px`;
      }

      state.presetLogoType = b1.preset || null;
      state.badge1FileName = b1.fileName || '';
      setCreatorBadgeMode(state.badge1Type);

      if (b1.imageData) {
        const img = new Image();
        img.onload = () => {
          state.designerLogoImg = img;
          const btn = document.getElementById('logoUploadBtnText');
          if (btn) btn.textContent = state.badge1FileName ? state.badge1FileName.substring(0, 16) + '...' : 'Default Logo Loaded';
          const btnClear = document.getElementById('btnClearLogo');
          if (btnClear) btnClear.style.display = 'block';
          renderIconMap();
        };
        img.src = b1.imageData;
      }
    }

    if (d.badge2) {
      const b2 = d.badge2;
      state.badge2Enabled = b2.enabled !== false;
      if (document.getElementById('enableBadge2')) document.getElementById('enableBadge2').checked = state.badge2Enabled;
      state.badge2Type = b2.type || 'preset';
      state.badge2Preset = b2.preset || 'graffiti';
      state.badge2Text = b2.text || 'GRAFFITI';
      state.badge2ColorTheme = b2.colorTheme || 'purple';
      state.badge2LetterSpacing = b2.letterSpacing === true;
      state.badge2Font = b2.font || 'Bebas Neue';
      state.badge2Bold = b2.bold !== false;
      state.badge2Italic = b2.italic === true;
      state.badge2PtSize = b2.ptSize || 13;

      state.badge2ColorMode = b2.colorMode || 'theme';
      state.badge2CustomBg1 = b2.customBg1 || '#151326';
      state.badge2CustomBg2 = b2.customBg2 || '#251336';
      state.badge2CustomStroke = b2.customStroke || '#c084fc';
      state.badge2CustomText = b2.customText || '#ffffff';
      state.badge2SolidBg = b2.solidBg || '#151326';
      state.badge2SolidStroke = b2.solidStroke || '#c084fc';
      state.badge2SolidText = b2.solidText || '#ffffff';
      state.badge2GradDir = b2.gradDir || 'diagonal';

      setSeriesColorTheme(state.badge2ColorTheme);
      setSeriesGradDirection(state.badge2GradDir);
      setSeriesColorMode(state.badge2ColorMode);

      if (document.getElementById('seriesTextInput')) document.getElementById('seriesTextInput').value = state.badge2Text;
      onSeriesTextChange(false);
      if (document.getElementById('seriesFontFamily')) document.getElementById('seriesFontFamily').value = state.badge2Font;
      document.getElementById('btnSeriesBold')?.classList.toggle('active', state.badge2Bold);
      document.getElementById('btnSeriesItalic')?.classList.toggle('active', state.badge2Italic);
      if (document.getElementById('seriesPtSize')) {
        document.getElementById('seriesPtSize').value = state.badge2PtSize;
        if (document.getElementById('seriesPtSizeVal')) document.getElementById('seriesPtSizeVal').textContent = `${state.badge2PtSize} pt`;
      }

      state.badge2TextGradEnabled = b2.textGradEnabled === true;
      state.badge2TextGradColor1 = b2.textGradColor1 || '#ffffff';
      state.badge2TextGradColor2 = b2.textGradColor2 || '#c084fc';
      state.badge2TextGradDir = b2.textGradDir || 'vertical';
      if (document.getElementById('badge2TextGradEnable')) document.getElementById('badge2TextGradEnable').checked = state.badge2TextGradEnabled;
      if (document.getElementById('badge2TextGradControls')) document.getElementById('badge2TextGradControls').style.display = state.badge2TextGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge2TextGrad1')) document.getElementById('badge2TextGrad1').value = state.badge2TextGradColor1;
      if (document.getElementById('badge2TextGrad2')) document.getElementById('badge2TextGrad2').value = state.badge2TextGradColor2;
      if (document.getElementById('badge2TextGrad1Hex')) document.getElementById('badge2TextGrad1Hex').textContent = state.badge2TextGradColor1;
      if (document.getElementById('badge2TextGrad2Hex')) document.getElementById('badge2TextGrad2Hex').textContent = state.badge2TextGradColor2;
      setBadge2TextGradDir(state.badge2TextGradDir);

      if (b2.position && document.getElementById('seriesPosition')) document.getElementById('seriesPosition').value = b2.position;
      state.badge2PosX = b2.posX !== undefined ? b2.posX : 15;
      state.badge2PosY = b2.posY !== undefined ? b2.posY : 15;
      if (document.getElementById('seriesPosX')) document.getElementById('seriesPosX').value = state.badge2PosX;
      if (document.getElementById('seriesPosY')) document.getElementById('seriesPosY').value = state.badge2PosY;
      if (document.getElementById('seriesPosXVal')) document.getElementById('seriesPosXVal').textContent = `${state.badge2PosX}%`;
      if (document.getElementById('seriesPosYVal')) document.getElementById('seriesPosYVal').textContent = `${state.badge2PosY}%`;
      const cSeries = document.getElementById('seriesCustomPosContainer');
      if (cSeries) cSeries.style.display = (b2.position === 'custom' || !b2.position) ? 'block' : 'none';
      if (b2.frame && document.getElementById('badge2Frame')) document.getElementById('badge2Frame').value = b2.frame;
      if (b2.scale !== undefined && document.getElementById('seriesScale')) {
        document.getElementById('seriesScale').value = b2.scale;
        document.getElementById('seriesScaleVal').textContent = `${b2.scale}%`;
      }
      if (b2.opacity !== undefined && document.getElementById('seriesOpacity')) {
        document.getElementById('seriesOpacity').value = b2.opacity;
        document.getElementById('seriesOpacityVal').textContent = `${b2.opacity}%`;
      }
      if (b2.edgePadding !== undefined) {
        state.badge2EdgePadding = b2.edgePadding;
        if (document.getElementById('seriesPadding')) document.getElementById('seriesPadding').value = b2.edgePadding;
        if (document.getElementById('seriesPaddingVal')) document.getElementById('seriesPaddingVal').textContent = `${b2.edgePadding} px`;
      }
      if (b2.innerPadding !== undefined) {
        state.badge2InnerPadding = b2.innerPadding;
        if (document.getElementById('seriesInnerPadding')) document.getElementById('seriesInnerPadding').value = b2.innerPadding;
        if (document.getElementById('seriesInnerPaddingVal')) document.getElementById('seriesInnerPaddingVal').textContent = `${b2.innerPadding} px`;
      }

      setSeriesBadgeMode(state.badge2Type);

      if (b2.imageData) {
        const sImg = new Image();
        sImg.onload = () => {
          state.badge2Img = sImg;
          state.badge2FileName = b2.fileName || '';
          const btn = document.getElementById('seriesLogoUploadBtnText');
          if (btn) btn.textContent = state.badge2FileName ? state.badge2FileName.substring(0, 16) + '...' : 'Default Series Logo Loaded';
          const btnClear = document.getElementById('btnClearSeriesLogo');
          if (btnClear) btnClear.style.display = 'block';
          renderIconMap();
        };
        sImg.src = b2.imageData;
      }
    }

    if (d.badge3) {
      const b3 = d.badge3;
      state.badge3Enabled = b3.enabled === true;
      if (document.getElementById('enableBadge3')) document.getElementById('enableBadge3').checked = state.badge3Enabled;
      state.badge3Type = b3.type || 'text';
      state.badge3Preset = b3.preset || 'props';
      state.badge3Text = b3.text || 'EXTRA 1';
      state.badge3ColorTheme = b3.colorTheme || 'emerald';
      state.badge3LetterSpacing = b3.letterSpacing === true;
      state.badge3Font = b3.font || 'Montserrat';
      state.badge3Bold = b3.bold !== false;
      state.badge3Italic = b3.italic === true;
      state.badge3PtSize = b3.ptSize || 13;

      state.badge3ColorMode = b3.colorMode || 'theme';
      state.badge3CustomBg1 = b3.customBg1 || '#06241a';
      state.badge3CustomBg2 = b3.customBg2 || '#0d3d2c';
      state.badge3CustomStroke = b3.customStroke || '#34d399';
      state.badge3CustomText = b3.customText || '#ffffff';
      state.badge3SolidBg = b3.solidBg || '#06241a';
      state.badge3SolidStroke = b3.solidStroke || '#34d399';
      state.badge3SolidText = b3.solidText || '#ffffff';
      state.badge3GradDir = b3.gradDir || 'diagonal';

      setExtra1ColorTheme(state.badge3ColorTheme);
      setExtra1ColorMode(state.badge3ColorMode);

      if (document.getElementById('extra1TextInput')) document.getElementById('extra1TextInput').value = state.badge3Text;
      onExtra1TextChange(false);
      if (document.getElementById('extra1FontFamily')) document.getElementById('extra1FontFamily').value = state.badge3Font;
      document.getElementById('btnExtra1Bold')?.classList.toggle('active', state.badge3Bold);
      document.getElementById('btnExtra1Italic')?.classList.toggle('active', state.badge3Italic);
      if (document.getElementById('extra1PtSize')) {
        document.getElementById('extra1PtSize').value = state.badge3PtSize;
        if (document.getElementById('extra1PtSizeVal')) document.getElementById('extra1PtSizeVal').textContent = `${state.badge3PtSize} pt`;
      }

      state.badge3TextGradEnabled = b3.textGradEnabled === true;
      state.badge3TextGradColor1 = b3.textGradColor1 || '#ffffff';
      state.badge3TextGradColor2 = b3.textGradColor2 || '#34d399';
      state.badge3TextGradDir = b3.textGradDir || 'vertical';
      if (document.getElementById('badge3TextGradEnable')) document.getElementById('badge3TextGradEnable').checked = state.badge3TextGradEnabled;
      if (document.getElementById('badge3TextGradControls')) document.getElementById('badge3TextGradControls').style.display = state.badge3TextGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge3TextGrad1')) document.getElementById('badge3TextGrad1').value = state.badge3TextGradColor1;
      if (document.getElementById('badge3TextGrad2')) document.getElementById('badge3TextGrad2').value = state.badge3TextGradColor2;
      if (document.getElementById('badge3TextGrad1Hex')) document.getElementById('badge3TextGrad1Hex').textContent = state.badge3TextGradColor1;
      if (document.getElementById('badge3TextGrad2Hex')) document.getElementById('badge3TextGrad2Hex').textContent = state.badge3TextGradColor2;
      setBadge3TextGradDir(state.badge3TextGradDir);

      if (b3.position && document.getElementById('extra1Position')) document.getElementById('extra1Position').value = b3.position;
      state.badge3PosX = b3.posX !== undefined ? b3.posX : 20;
      state.badge3PosY = b3.posY !== undefined ? b3.posY : 80;
      if (document.getElementById('extra1PosX')) document.getElementById('extra1PosX').value = state.badge3PosX;
      if (document.getElementById('extra1PosY')) document.getElementById('extra1PosY').value = state.badge3PosY;
      if (document.getElementById('extra1PosXVal')) document.getElementById('extra1PosXVal').textContent = `${state.badge3PosX}%`;
      if (document.getElementById('extra1PosYVal')) document.getElementById('extra1PosYVal').textContent = `${state.badge3PosY}%`;
      const c1 = document.getElementById('extra1CustomPosContainer');
      if (c1) c1.style.display = (b3.position === 'custom') ? 'block' : 'none';
      if (b3.frame && document.getElementById('badge3Frame')) document.getElementById('badge3Frame').value = b3.frame;
      if (b3.scale !== undefined && document.getElementById('extra1Scale')) {
        document.getElementById('extra1Scale').value = b3.scale;
        document.getElementById('extra1ScaleVal').textContent = `${b3.scale}%`;
      }
      if (b3.opacity !== undefined && document.getElementById('extra1Opacity')) {
        document.getElementById('extra1Opacity').value = b3.opacity;
        document.getElementById('extra1OpacityVal').textContent = `${b3.opacity}%`;
      }
      if (b3.edgePadding !== undefined) {
        state.badge3EdgePadding = b3.edgePadding;
        if (document.getElementById('extra1Padding')) document.getElementById('extra1Padding').value = b3.edgePadding;
        if (document.getElementById('extra1PaddingVal')) document.getElementById('extra1PaddingVal').textContent = `${b3.edgePadding} px`;
      }
      if (b3.innerPadding !== undefined) {
        state.badge3InnerPadding = b3.innerPadding;
      }
      setExtra1BadgeMode(state.badge3Type);

      if (b3.imageData) {
        const e1Img = new Image();
        e1Img.onload = () => {
          state.badge3Img = e1Img;
          state.badge3FileName = b3.fileName || '';
          const btn = document.getElementById('extra1LogoUploadBtnText');
          if (btn) btn.textContent = state.badge3FileName ? state.badge3FileName.substring(0, 16) + '...' : 'Default Extra 1 Loaded';
          const btnClear = document.getElementById('btnClearExtra1Logo');
          if (btnClear) btnClear.style.display = 'block';
          renderIconMap();
        };
        e1Img.src = b3.imageData;
      }
    }

    if (d.badge4) {
      const b4 = d.badge4;
      state.badge4Enabled = b4.enabled === true;
      if (document.getElementById('enableBadge4')) document.getElementById('enableBadge4').checked = state.badge4Enabled;
      state.badge4Type = b4.type || 'text';
      state.badge4Preset = b4.preset || 'hazard';
      state.badge4Text = b4.text || 'EXTRA 2';
      state.badge4ColorTheme = b4.colorTheme || 'amber';
      state.badge4LetterSpacing = b4.letterSpacing === true;
      state.badge4Font = b4.font || 'Montserrat';
      state.badge4Bold = b4.bold !== false;
      state.badge4Italic = b4.italic === true;
      state.badge4PtSize = b4.ptSize || 13;

      state.badge4ColorMode = b4.colorMode || 'theme';
      state.badge4CustomBg1 = b4.customBg1 || '#241806';
      state.badge4CustomBg2 = b4.customBg2 || '#3d2a0d';
      state.badge4CustomStroke = b4.customStroke || '#fbbf24';
      state.badge4CustomText = b4.customText || '#ffffff';
      state.badge4SolidBg = b4.solidBg || '#241806';
      state.badge4SolidStroke = b4.solidStroke || '#fbbf24';
      state.badge4SolidText = b4.solidText || '#ffffff';
      state.badge4GradDir = b4.gradDir || 'diagonal';

      setExtra2ColorTheme(state.badge4ColorTheme);
      setExtra2ColorMode(state.badge4ColorMode);

      if (document.getElementById('extra2TextInput')) document.getElementById('extra2TextInput').value = state.badge4Text;
      onExtra2TextChange(false);
      if (document.getElementById('extra2FontFamily')) document.getElementById('extra2FontFamily').value = state.badge4Font;
      document.getElementById('btnExtra2Bold')?.classList.toggle('active', state.badge4Bold);
      document.getElementById('btnExtra2Italic')?.classList.toggle('active', state.badge4Italic);
      if (document.getElementById('extra2PtSize')) {
        document.getElementById('extra2PtSize').value = state.badge4PtSize;
        if (document.getElementById('extra2PtSizeVal')) document.getElementById('extra2PtSizeVal').textContent = `${state.badge4PtSize} pt`;
      }

      state.badge4TextGradEnabled = b4.textGradEnabled === true;
      state.badge4TextGradColor1 = b4.textGradColor1 || '#ffffff';
      state.badge4TextGradColor2 = b4.textGradColor2 || '#fbbf24';
      state.badge4TextGradDir = b4.textGradDir || 'vertical';
      if (document.getElementById('badge4TextGradEnable')) document.getElementById('badge4TextGradEnable').checked = state.badge4TextGradEnabled;
      if (document.getElementById('badge4TextGradControls')) document.getElementById('badge4TextGradControls').style.display = state.badge4TextGradEnabled ? 'block' : 'none';
      if (document.getElementById('badge4TextGrad1')) document.getElementById('badge4TextGrad1').value = state.badge4TextGradColor1;
      if (document.getElementById('badge4TextGrad2')) document.getElementById('badge4TextGrad2').value = state.badge4TextGradColor2;
      if (document.getElementById('badge4TextGrad1Hex')) document.getElementById('badge4TextGrad1Hex').textContent = state.badge4TextGradColor1;
      if (document.getElementById('badge4TextGrad2Hex')) document.getElementById('badge4TextGrad2Hex').textContent = state.badge4TextGradColor2;
      setBadge4TextGradDir(state.badge4TextGradDir);

      if (b4.position && document.getElementById('extra2Position')) document.getElementById('extra2Position').value = b4.position;
      state.badge4PosX = b4.posX !== undefined ? b4.posX : 80;
      state.badge4PosY = b4.posY !== undefined ? b4.posY : 20;
      if (document.getElementById('extra2PosX')) document.getElementById('extra2PosX').value = state.badge4PosX;
      if (document.getElementById('extra2PosY')) document.getElementById('extra2PosY').value = state.badge4PosY;
      if (document.getElementById('extra2PosXVal')) document.getElementById('extra2PosXVal').textContent = `${state.badge4PosX}%`;
      if (document.getElementById('extra2PosYVal')) document.getElementById('extra2PosYVal').textContent = `${state.badge4PosY}%`;
      const c2 = document.getElementById('extra2CustomPosContainer');
      if (c2) c2.style.display = (b4.position === 'custom') ? 'block' : 'none';
      if (b4.frame && document.getElementById('badge4Frame')) document.getElementById('badge4Frame').value = b4.frame;
      if (b4.scale !== undefined && document.getElementById('extra2Scale')) {
        document.getElementById('extra2Scale').value = b4.scale;
        document.getElementById('extra2ScaleVal').textContent = `${b4.scale}%`;
      }
      if (b4.opacity !== undefined && document.getElementById('extra2Opacity')) {
        document.getElementById('extra2Opacity').value = b4.opacity;
        document.getElementById('extra2OpacityVal').textContent = `${b4.opacity}%`;
      }
      if (b4.edgePadding !== undefined) {
        state.badge4EdgePadding = b4.edgePadding;
        if (document.getElementById('extra2Padding')) document.getElementById('extra2Padding').value = b4.edgePadding;
        if (document.getElementById('extra2PaddingVal')) document.getElementById('extra2PaddingVal').textContent = `${b4.edgePadding} px`;
      }
      if (b4.innerPadding !== undefined) {
        state.badge4InnerPadding = b4.innerPadding;
      }
      setExtra2BadgeMode(state.badge4Type);

      if (b4.imageData) {
        const e2Img = new Image();
        e2Img.onload = () => {
          state.badge4Img = e2Img;
          state.badge4FileName = b4.fileName || '';
          const btn = document.getElementById('extra2LogoUploadBtnText');
          if (btn) btn.textContent = state.badge4FileName ? state.badge4FileName.substring(0, 16) + '...' : 'Default Extra 2 Loaded';
          const btnClear = document.getElementById('btnClearExtra2Logo');
          if (btnClear) btnClear.style.display = 'block';
          renderIconMap();
        };
        e2Img.src = b4.imageData;
      }
    }

    const dot1 = document.getElementById('dotBadge1');
    if (dot1) dot1.className = state.badge1Enabled ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
    const dot2 = document.getElementById('dotBadge2');
    if (dot2) dot2.className = state.badge2Enabled ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
    const dot3 = document.getElementById('dotBadge3');
    if (dot3) dot3.className = state.badge3Enabled ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';
    const dot4 = document.getElementById('dotBadge4');
    if (dot4) dot4.className = state.badge4Enabled ? 'badge-tab-indicator active-dot' : 'badge-tab-indicator';

    updateBadgeDefaultsUI();
    renderIconMap();
    if (!silent) showToast('Restored default Creator, Series & Extra badge setup!');
    return true;
  } catch (e) {
    console.error('Failed to load badge defaults', e);
    return false;
  }
}

export function resetIconBadgeDefaults() {
  localStorage.removeItem(BADGE_DEFAULTS_STORAGE_KEY);
  updateBadgeDefaultsUI();
  showToast('Saved defaults cleared. System presets will be used on next reload.');
}

export function updateBadgeDefaultsUI() {
  const defaults = localStorage.getItem(BADGE_DEFAULTS_STORAGE_KEY);
  const infoEl = document.getElementById('badgeDefaultsInfo');
  const btnReset = document.getElementById('btnResetBadgeDefaults');
  const cardBadge = document.getElementById('badgeDefaultsCardBadge');

  if (defaults) {
    try {
      const d = JSON.parse(defaults);
      const dateStr = d.savedAt ? new Date(d.savedAt).toLocaleDateString() : 'Previously';
      if (infoEl) infoEl.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 600;">✓ Active:</span> Creator &amp; Series badges saved on ${dateStr}. These badges automatically load when opening the app.`;
      if (btnReset) btnReset.style.display = 'inline-flex';
      if (cardBadge) {
        cardBadge.textContent = 'Active Defaults';
        cardBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        cardBadge.style.color = 'var(--accent-emerald)';
      }
    } catch (e) {}
  } else {
    if (infoEl) infoEl.innerHTML = 'No persistent defaults saved yet. Click <em>"Save Current as Default"</em> above to make your current branding badges stick permanently across app reloads.';
    if (btnReset) btnReset.style.display = 'none';
    if (cardBadge) {
      cardBadge.textContent = 'None Saved';
      cardBadge.style.background = 'rgba(148, 163, 184, 0.15)';
      cardBadge.style.color = 'var(--text-muted)';
    }
  }
}

export function initBadgeDefaults() {
  populateFontDropdowns();
  updateBadgeDefaultsUI();
  loadIconBadgeDefaults(true);
}

// Icon Canvas Composition & Overlay Hit Testing
export let lastBadgeHitBoxes = [];

export function renderIconMap(cleanOnly = false) {
  const { canvasBase, canvasIcon, ctxIcon } = getCanvases();
  if (!canvasIcon || !ctxIcon) return;

  const enableGen = document.getElementById('enableIconGen')?.checked ?? true;
  const cardBadge = document.getElementById('cardIconBadge');
  const cardFooter = document.getElementById('cardIconFooter');

  if (!enableGen) {
    if (cardBadge) {
      cardBadge.textContent = 'Skipped';
      cardBadge.style.background = 'rgba(148, 163, 184, 0.15)';
      cardBadge.style.color = 'var(--text-muted)';
    }
    if (cardFooter) cardFooter.textContent = 'Icon Generation Disabled';
    ctxIcon.clearRect(0, 0, canvasIcon.width, canvasIcon.height);
    return;
  }

  if (cardBadge) {
    cardBadge.textContent = 'Ready';
    cardBadge.style.background = 'rgba(16, 185, 129, 0.2)';
    cardBadge.style.color = 'var(--accent-emerald)';
  }
  if (cardFooter) {
    cardFooter.textContent = 'CS2 UI Thumbnail (Base + Dual Watermarks)';
  }

  const size = 512;
  canvasIcon.width = size;
  canvasIcon.height = size;
  ctxIcon.clearRect(0, 0, size, size);

  const bgStyle = document.getElementById('iconBgStyle')?.value || 'cs2-dark';

  if (bgStyle === 'cs2-dark') {
    const grad = ctxIcon.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.7);
    grad.addColorStop(0, '#1a2638');
    grad.addColorStop(0.7, '#0d1522');
    grad.addColorStop(1, '#080d16');
    ctxIcon.fillStyle = grad;
    ctxIcon.fillRect(0, 0, size, size);

    ctxIcon.fillStyle = '#212f42';
    ctxIcon.beginPath();
    ctxIcon.moveTo(size / 2, size * 0.58);
    ctxIcon.lineTo(size * 0.88, size * 0.76);
    ctxIcon.lineTo(size / 2, size * 0.94);
    ctxIcon.lineTo(size * 0.12, size * 0.76);
    ctxIcon.closePath();
    ctxIcon.fill();

    ctxIcon.strokeStyle = '#38bdf8';
    ctxIcon.lineWidth = 1.5;
    ctxIcon.stroke();
  } else if (bgStyle === 'asphalt') {
    ctxIcon.fillStyle = '#14181f';
    ctxIcon.fillRect(0, 0, size, size);
    for (let i = 0; i < 600; i++) {
      const rx = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * size;
      const ry = (Math.cos(i * 78.233) * 43758.5453 % 1 + 1) % 1 * size;
      const alpha = 0.05 + ((i % 10) / 100);
      ctxIcon.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 1.5})`;
      ctxIcon.fillRect(rx, ry, (i % 3) + 1, (i % 3) + 1);
    }
    ctxIcon.strokeStyle = '#232f3e';
    ctxIcon.lineWidth = 3;
    ctxIcon.strokeRect(1, 1, size - 2, size - 2);
  } else if (bgStyle === 'blueprint') {
    ctxIcon.fillStyle = '#0a1d33';
    ctxIcon.fillRect(0, 0, size, size);
    ctxIcon.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctxIcon.lineWidth = 1;
    for (let p = 0; p <= size; p += 32) {
      ctxIcon.beginPath();
      ctxIcon.moveTo(p, 0);
      ctxIcon.lineTo(p, size);
      ctxIcon.stroke();
      ctxIcon.beginPath();
      ctxIcon.moveTo(0, p);
      ctxIcon.lineTo(size, p);
      ctxIcon.stroke();
    }
  }

  if (canvasBase && canvasBase.width > 0) {
    if (state.appMode === 'decal') {
      const pad = 36;
      const targetW = size - pad * 2;
      const targetH = size - pad * 2;

      ctxIcon.save();
      ctxIcon.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctxIcon.shadowBlur = 12;
      ctxIcon.shadowOffsetY = 6;
      ctxIcon.drawImage(canvasBase, pad, pad, targetW, targetH);
      ctxIcon.restore();
    } else {
      const swatchSize = size - 36;
      const ox = 18;
      const oy = 18;
      ctxIcon.save();
      ctxIcon.beginPath();
      ctxIcon.roundRect(ox, oy, swatchSize, swatchSize, 8);
      ctxIcon.clip();

      ctxIcon.drawImage(canvasBase, ox, oy, swatchSize, swatchSize);
      ctxIcon.restore();

      ctxIcon.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctxIcon.lineWidth = 2;
      ctxIcon.strokeRect(ox, oy, swatchSize, swatchSize);
    }
  }

  const b1ScalePct = parseInt(document.getElementById('badgeScale')?.value || '26', 10) / 100.0;
  const b1Opacity = parseInt(document.getElementById('badgeOpacity')?.value || '95', 10) / 100.0;
  const b1Pos = document.getElementById('logoPosition')?.value || 'bottom-right';
  const b1Frame = document.getElementById('badge1Frame')?.value || 'circle';

  const b2ScalePct = parseInt(document.getElementById('seriesScale')?.value || '24', 10) / 100.0;
  const b2Opacity = parseInt(document.getElementById('seriesOpacity')?.value || '95', 10) / 100.0;
  const b2Pos = document.getElementById('seriesPosition')?.value || 'top-center';
  const b2Frame = document.getElementById('badge2Frame')?.value || 'pill';

  const b3ScalePct = parseInt(document.getElementById('extra1Scale')?.value || '24', 10) / 100.0;
  const b3Opacity = parseInt(document.getElementById('extra1Opacity')?.value || '95', 10) / 100.0;
  const b3Pos = document.getElementById('extra1Position')?.value || 'bottom-left';
  const b3Frame = document.getElementById('badge3Frame')?.value || 'pill';

  const b4ScalePct = parseInt(document.getElementById('extra2Scale')?.value || '24', 10) / 100.0;
  const b4Opacity = parseInt(document.getElementById('extra2Opacity')?.value || '95', 10) / 100.0;
  const b4Pos = document.getElementById('extra2Position')?.value || 'top-right';
  const b4Frame = document.getElementById('badge4Frame')?.value || 'pill';

  const b1EdgePad = state.badge1EdgePadding;
  const b1InnerPad = state.badge1InnerPadding;
  const b2EdgePad = state.badge2EdgePadding;
  const b2InnerPad = state.badge2InnerPadding;
  const b3EdgePad = state.badge3EdgePadding;
  const b3InnerPad = state.badge3InnerPadding;
  const b4EdgePad = state.badge4EdgePadding;
  const b4InnerPad = state.badge4InnerPadding;

  const slotOffsets = {
    'top-left': 0,
    'top-right': 0,
    'top-center': 0,
    'bottom-left': 0,
    'bottom-right': 0,
    'bottom-center': 0,
    'center': 0
  };

  function computeBadgeDim(scalePct, pos, frame, type, innerPad, edgePad, img) {
    let w = Math.round(size * scalePct);
    let h = w;
    if (pos === 'top-center' || pos === 'bottom-center') {
      if (type === 'image' && img && img.naturalWidth > 0) {
        const aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
        w = Math.min(size - (edgePad * 2), Math.round(size * scalePct * (aspect > 1.3 ? 2.2 : 1.15)));
        h = Math.round(w / aspect);
      } else {
        w = Math.min(size - (edgePad * 2), Math.max(100, Math.round(size * scalePct * 2.1) + (innerPad - 8) * 2));
        h = Math.round(Math.max(18, w * 0.28 + (innerPad - 8)));
      }
    } else if (type === 'text' || frame === 'pill' || frame === 'rounded' || frame === 'raw') {
      w = Math.round(w * 1.55) + (innerPad - 8) * 2;
      h = Math.round(h * 0.72) + (innerPad - 8);
    }
    return { w, h };
  }

  function placeBadge(pos, w, h, edgePad) {
    let x = edgePad;
    let y = edgePad;
    const offset = slotOffsets[pos] || 0;

    switch (pos) {
      case 'top-left':
        x = edgePad;
        y = edgePad + offset;
        break;
      case 'top-right':
        x = size - w - edgePad;
        y = edgePad + offset;
        break;
      case 'top-center':
        x = (size - w) / 2;
        y = edgePad + offset;
        break;
      case 'bottom-left':
        x = edgePad;
        y = size - edgePad - h - offset;
        break;
      case 'bottom-right':
        x = size - w - edgePad;
        y = size - edgePad - h - offset;
        break;
      case 'bottom-center':
        x = (size - w) / 2;
        y = size - edgePad - h - offset;
        break;
      case 'center':
        x = (size - w) / 2;
        y = (size - h) / 2 + offset;
        break;
    }
    slotOffsets[pos] = offset + h + 6;
    return { x: Math.round(x), y: Math.round(y) };
  }

  // Reset hit-boxes for current render pass
  lastBadgeHitBoxes = [];

  if (state.badge2Enabled) {
    const d2 = computeBadgeDim(b2ScalePct, b2Pos, b2Frame, state.badge2Type, b2InnerPad, b2EdgePad, state.badge2Img);
    const coords2 = (b2Pos === 'custom')
      ? {
          x: Math.max(0, Math.min(size - d2.w, Math.round((size - d2.w) * ((state.badge2PosX ?? 15) / 100)))),
          y: Math.max(0, Math.min(size - d2.h, Math.round((size - d2.h) * ((state.badge2PosY ?? 15) / 100))))
        }
      : placeBadge(b2Pos, d2.w, d2.h, b2EdgePad);
    renderSeriesWatermark(ctxIcon, coords2.x, coords2.y, d2.w, d2.h, b2Opacity, b2Frame);
    lastBadgeHitBoxes.push({
      id: 'series',
      name: 'Overlay 2: Series / Pack Badge',
      shortName: 'Overlay 2 (Series)',
      x: coords2.x,
      y: coords2.y,
      w: d2.w,
      h: d2.h
    });
  }

  if (state.badge3Enabled) {
    const d3 = computeBadgeDim(b3ScalePct, b3Pos, b3Frame, state.badge3Type, b3InnerPad, b3EdgePad, state.badge3Img);
    const coords3 = (b3Pos === 'custom')
      ? {
          x: Math.max(0, Math.min(size - d3.w, Math.round((size - d3.w) * ((state.badge3PosX ?? 15) / 100)))),
          y: Math.max(0, Math.min(size - d3.h, Math.round((size - d3.h) * ((state.badge3PosY ?? 85) / 100))))
        }
      : placeBadge(b3Pos, d3.w, d3.h, b3EdgePad);
    renderExtraWatermark(ctxIcon, coords3.x, coords3.y, d3.w, d3.h, b3Opacity, b3Frame, 3);
    lastBadgeHitBoxes.push({
      id: 'extra1',
      name: 'Overlay 3: Extra 1 Watermark Badge',
      shortName: 'Overlay 3 (Extra 1)',
      x: coords3.x,
      y: coords3.y,
      w: d3.w,
      h: d3.h
    });
  }

  if (state.badge4Enabled) {
    const d4 = computeBadgeDim(b4ScalePct, b4Pos, b4Frame, state.badge4Type, b4InnerPad, b4EdgePad, state.badge4Img);
    const coords4 = (b4Pos === 'custom')
      ? {
          x: Math.max(0, Math.min(size - d4.w, Math.round((size - d4.w) * ((state.badge4PosX ?? 85) / 100)))),
          y: Math.max(0, Math.min(size - d4.h, Math.round((size - d4.h) * ((state.badge4PosY ?? 15) / 100))))
        }
      : placeBadge(b4Pos, d4.w, d4.h, b4EdgePad);
    renderExtraWatermark(ctxIcon, coords4.x, coords4.y, d4.w, d4.h, b4Opacity, b4Frame, 4);
    lastBadgeHitBoxes.push({
      id: 'extra2',
      name: 'Overlay 4: Extra 2 Custom Overlay',
      shortName: 'Overlay 4 (Extra 2)',
      x: coords4.x,
      y: coords4.y,
      w: d4.w,
      h: d4.h
    });
  }

  if (state.badge1Enabled) {
    const d1 = computeBadgeDim(b1ScalePct, b1Pos, b1Frame, state.badge1Type, b1InnerPad, b1EdgePad, state.designerLogoImg);
    const coords1 = (b1Pos === 'custom')
      ? {
          x: Math.max(0, Math.min(size - d1.w, Math.round((size - d1.w) * ((state.badge1PosX ?? 85) / 100)))),
          y: Math.max(0, Math.min(size - d1.h, Math.round((size - d1.h) * ((state.badge1PosY ?? 85) / 100))))
        }
      : placeBadge(b1Pos, d1.w, d1.h, b1EdgePad);
    renderCreatorWatermark(ctxIcon, coords1.x, coords1.y, d1.w, d1.h, b1Opacity, b1Frame);
    lastBadgeHitBoxes.push({
      id: 'creator',
      name: 'Overlay 1: Creator Logo / Brand Watermark',
      shortName: 'Overlay 1 (Creator)',
      x: coords1.x,
      y: coords1.y,
      w: d1.w,
      h: d1.h
    });
  }

  // Draw interactive visual selection box around the currently active overlay layer
  if (!cleanOnly && state.activeBadgeTab && state.activeBadgeTab !== 'defaults') {
    const activeBox = lastBadgeHitBoxes.find(b => b.id === state.activeBadgeTab);
    if (activeBox) {
      drawOverlaySelection(ctxIcon, activeBox);
    }
  }

  initBadgeCanvasInteractions();

  if (state.activeTab === 'icon' && window.updateSingleView) {
    window.updateSingleView();
  }
}

export function drawOverlaySelection(ctx, box) {
  ctx.save();
  const { x, y, w, h } = box;
  const pad = 4;
  const rx = x - pad;
  const ry = y - pad;
  const rw = w + pad * 2;
  const rh = h + pad * 2;

  // Outer glow & animated dashed bounding box
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rx, ry, rw, rh, 6);
  } else {
    ctx.rect(rx, ry, rw, rh);
  }
  ctx.stroke();

  // Corner control handles
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  const handleSize = 6;
  const corners = [
    [rx, ry],
    [rx + rw, ry],
    [rx, ry + rh],
    [rx + rw, ry + rh]
  ];
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.rect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  });

  // Selected Overlay tag with live position coordinates
  const currentPos = (box.id === 'creator' ? `${state.badge1PosX ?? 85}%, ${state.badge1PosY ?? 85}%`
    : box.id === 'series' ? `${state.badge2PosX ?? 15}%, ${state.badge2PosY ?? 15}%`
    : box.id === 'extra1' ? `${state.badge3PosX ?? 20}%, ${state.badge3PosY ?? 80}%`
    : `${state.badge4PosX ?? 80}%, ${state.badge4PosY ?? 20}%`);

  const label = `${box.shortName || 'Selected Overlay'} (${currentPos})`;
  ctx.font = 'bold 11px Montserrat, sans-serif';
  const textWidth = ctx.measureText(label).width;
  const tagW = textWidth + 14;
  const tagH = 18;
  const tagY = ry >= tagH + 4 ? ry - tagH - 4 : ry + rh + 4;
  const tagX = Math.max(4, Math.min(512 - tagW - 4, rx));

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(tagX, tagY, tagW, tagH, 4);
  } else {
    ctx.rect(tagX, tagY, tagW, tagH);
  }
  ctx.fill();

  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, tagX + tagW / 2, tagY + tagH / 2);

  // Center move crosshair indicator
  const midX = rx + rw / 2;
  const midY = ry + rh / 2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(midX - 5, midY);
  ctx.lineTo(midX + 5, midY);
  ctx.moveTo(midX, midY - 5);
  ctx.lineTo(midX, midY + 5);
  ctx.stroke();

  ctx.restore();
}

export function getBadgeAtPoint(x, y) {
  const boxes = [...lastBadgeHitBoxes].reverse();
  const pad = 6;
  for (const box of boxes) {
    if (x >= box.x - pad && x <= box.x + box.w + pad && y >= box.y - pad && y <= box.y + box.h + pad) {
      return box;
    }
  }
  return null;
}

export function updateBadgeLivePosition(badgeId, posX_pct, posY_pct) {
  const clampX = Math.max(0, Math.min(100, Math.round(posX_pct)));
  const clampY = Math.max(0, Math.min(100, Math.round(posY_pct)));

  if (badgeId === 'creator') {
    const posSel = document.getElementById('logoPosition');
    if (posSel && posSel.value !== 'custom') posSel.value = 'custom';
    const c = document.getElementById('creatorCustomPosContainer');
    if (c) c.style.display = 'block';
    state.badge1PosX = clampX;
    state.badge1PosY = clampY;
    const sx = document.getElementById('creatorPosX'); if (sx) sx.value = clampX;
    const sy = document.getElementById('creatorPosY'); if (sy) sy.value = clampY;
    const xVal = document.getElementById('creatorPosXVal'); if (xVal) xVal.textContent = `${clampX}%`;
    const yVal = document.getElementById('creatorPosYVal'); if (yVal) yVal.textContent = `${clampY}%`;
  } else if (badgeId === 'series') {
    const posSel = document.getElementById('seriesPosition');
    if (posSel && posSel.value !== 'custom') posSel.value = 'custom';
    const c = document.getElementById('seriesCustomPosContainer');
    if (c) c.style.display = 'block';
    state.badge2PosX = clampX;
    state.badge2PosY = clampY;
    const sx = document.getElementById('seriesPosX'); if (sx) sx.value = clampX;
    const sy = document.getElementById('seriesPosY'); if (sy) sy.value = clampY;
    const xVal = document.getElementById('seriesPosXVal'); if (xVal) xVal.textContent = `${clampX}%`;
    const yVal = document.getElementById('seriesPosYVal'); if (yVal) yVal.textContent = `${clampY}%`;
  } else if (badgeId === 'extra1') {
    const posSel = document.getElementById('extra1Position');
    if (posSel && posSel.value !== 'custom') posSel.value = 'custom';
    const c = document.getElementById('extra1CustomPosContainer');
    if (c) c.style.display = 'block';
    state.badge3PosX = clampX;
    state.badge3PosY = clampY;
    const sx = document.getElementById('extra1PosX'); if (sx) sx.value = clampX;
    const sy = document.getElementById('extra1PosY'); if (sy) sy.value = clampY;
    const xVal = document.getElementById('extra1PosXVal'); if (xVal) xVal.textContent = `${clampX}%`;
    const yVal = document.getElementById('extra1PosYVal'); if (yVal) yVal.textContent = `${clampY}%`;
  } else if (badgeId === 'extra2') {
    const posSel = document.getElementById('extra2Position');
    if (posSel && posSel.value !== 'custom') posSel.value = 'custom';
    const c = document.getElementById('extra2CustomPosContainer');
    if (c) c.style.display = 'block';
    state.badge4PosX = clampX;
    state.badge4PosY = clampY;
    const sx = document.getElementById('extra2PosX'); if (sx) sx.value = clampX;
    const sy = document.getElementById('extra2PosY'); if (sy) sy.value = clampY;
    const xVal = document.getElementById('extra2PosXVal'); if (xVal) xVal.textContent = `${clampX}%`;
    const yVal = document.getElementById('extra2PosYVal'); if (yVal) yVal.textContent = `${clampY}%`;
  }

  renderIconMap();
}

export function selectBadgeOverlay(id, name) {
  switchBadgeSubtab(id);

  const sec = document.getElementById('secToolsIcon');
  if (sec && sec.classList.contains('collapsed')) {
    if (window.toggleSection) {
      window.toggleSection('secToolsIcon');
    } else {
      sec.classList.remove('collapsed');
    }
  }

  const target = document.getElementById('badgeLayerSelect') || sec;
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const dropdown = document.getElementById('badgeLayerSelect');
  if (dropdown) {
    dropdown.style.transition = 'box-shadow 0.2s ease, border-color 0.2s ease';
    dropdown.style.borderColor = '#38bdf8';
    dropdown.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.6)';
    setTimeout(() => {
      dropdown.style.borderColor = '';
      dropdown.style.boxShadow = '';
    }, 900);
  }

  showToast(`Selected ${name || id}`);
}

let badgeDragState = null;

export function initBadgeCanvasInteractions() {
  const { canvasIcon, canvasSingle } = getCanvases();

  const attachCanvasDragEvents = (canvas, isSingle = false) => {
    if (!canvas || canvas.__badgeDragAttached) return;
    canvas.__badgeDragAttached = true;

    // Prevent default touch scrolling when dragging badges on mobile/tablets
    canvas.style.touchAction = 'none';

    // Hook export methods so clean icon without selection box is exported
    if (!isSingle) {
      const origToBlob = canvas.toBlob.bind(canvas);
      const origToDataURL = canvas.toDataURL.bind(canvas);
      canvas.toBlob = function(cb, type, quality) {
        renderIconMap(true);
        origToBlob((blob) => {
          renderIconMap(false);
          cb(blob);
        }, type, quality);
      };
      canvas.toDataURL = function(...args) {
        renderIconMap(true);
        const res = origToDataURL(...args);
        renderIconMap(false);
        return res;
      };
    }

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = (canvas.width || 512) / (rect.width || 1);
      const scaleY = (canvas.height || 512) / (rect.height || 1);
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (isSingle && state.activeSingleMap !== 'icon') return;
      const { x, y } = getCoords(e);
      const hit = getBadgeAtPoint(x, y);
      if (!hit) return;

      if (state.activeBadgeTab !== hit.id) {
        selectBadgeOverlay(hit.id, hit.name);
      }

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}

      badgeDragState = {
        pointerId: e.pointerId,
        canvas: canvas,
        badgeId: hit.id,
        badgeName: hit.name,
        badgeW: hit.w,
        badgeH: hit.h,
        offsetX: x - hit.x,
        offsetY: y - hit.y,
        hasMoved: false
      };

      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    });

    canvas.addEventListener('pointermove', (e) => {
      if (isSingle && state.activeSingleMap !== 'icon') {
        canvas.style.cursor = 'default';
        return;
      }

      const { x, y } = getCoords(e);

      if (badgeDragState && badgeDragState.canvas === canvas) {
        badgeDragState.hasMoved = true;
        canvas.style.cursor = 'grabbing';

        const targetX = x - badgeDragState.offsetX;
        const targetY = y - badgeDragState.offsetY;

        const maxSpanX = 512 - badgeDragState.badgeW;
        const maxSpanY = 512 - badgeDragState.badgeH;

        const clampedX = Math.max(0, Math.min(maxSpanX, targetX));
        const clampedY = Math.max(0, Math.min(maxSpanY, targetY));

        const pctX = maxSpanX > 0 ? (clampedX / maxSpanX) * 100 : 0;
        const pctY = maxSpanY > 0 ? (clampedY / maxSpanY) * 100 : 0;

        updateBadgeLivePosition(badgeDragState.badgeId, pctX, pctY);
        e.preventDefault();
        return;
      }

      const hit = getBadgeAtPoint(x, y);
      if (hit) {
        canvas.style.cursor = 'grab';
        canvas.title = `Drag to reposition ${hit.name} (live)`;
      } else {
        canvas.style.cursor = 'default';
        canvas.title = isSingle ? 'In-Game Icon Thumbnail' : 'In-game CS2 Icon';
      }
    });

    const finishDrag = (e) => {
      if (badgeDragState && badgeDragState.canvas === canvas) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}

        if (badgeDragState.hasMoved) {
          showToast(`${badgeDragState.badgeName} repositioned`);
        }
        badgeDragState = null;
        canvas.style.cursor = 'grab';
      }
    };

    canvas.addEventListener('pointerup', finishDrag);
    canvas.addEventListener('pointercancel', finishDrag);

    canvas.addEventListener('mouseleave', () => {
      if (!badgeDragState) {
        canvas.style.cursor = 'default';
      }
    });
  };

  attachCanvasDragEvents(canvasIcon, false);
  attachCanvasDragEvents(canvasSingle, true);
}

export function computeBadgePlacement(pos, w, h, size, edgePad, isConflict, isSecond, otherW, otherH, otherEdgePad) {
  let x = edgePad;
  let y = edgePad;

  switch (pos) {
    case 'top-left':
      x = edgePad;
      y = isConflict && isSecond ? edgePad + otherH + 6 : edgePad;
      break;
    case 'top-right':
      x = size - w - edgePad;
      y = isConflict && isSecond ? edgePad + otherH + 6 : edgePad;
      break;
    case 'top-center':
      x = (size - w) / 2;
      y = isConflict && isSecond ? edgePad + otherH + 6 : edgePad;
      break;
    case 'bottom-left':
      x = edgePad;
      y = isConflict && isSecond ? size - edgePad - h - otherH - 6 : size - h - edgePad;
      break;
    case 'bottom-right':
      x = size - w - edgePad;
      y = isConflict && isSecond ? size - edgePad - h - otherH - 6 : size - h - edgePad;
      break;
    case 'bottom-center':
      x = (size - w) / 2;
      y = isConflict && isSecond ? size - edgePad - h - otherH - 6 : size - h - edgePad;
      break;
    case 'center':
      x = (size - w) / 2;
      y = isConflict && isSecond ? (size - h) / 2 + otherH * 0.6 : (size - h) / 2;
      break;
  }
  return { x: Math.round(x), y: Math.round(y) };
}

export function renderCreatorWatermark(ctx, bx, by, bw, bh, opacity, frameStyle) {
  ctx.save();
  ctx.globalAlpha = opacity;

  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const r = bw * 0.48;

  if (state.badge1Type === 'text') {
    drawCustomTextRibbon(ctx, bx, by, bw, bh, state.badge1Text || 'CREATOR', state.badge1Font, state.badge1Bold, state.badge1Italic, state.badge1PtSize, frameStyle, 'creator');
    ctx.restore();
    return;
  }

  if (frameStyle === 'circle') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (frameStyle === 'rounded' || frameStyle === 'pill') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, frameStyle === 'pill' ? bh / 2 : bw * 0.22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  if (state.badge1Type === 'image' && state.designerLogoImg) {
    ctx.save();
    if (frameStyle === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
    } else if (frameStyle === 'rounded' || frameStyle === 'pill') {
      ctx.beginPath();
      ctx.roundRect(bx + 2, by + 2, bw - 4, bh - 4, frameStyle === 'pill' ? bh / 2 - 2 : bw * 0.2);
      ctx.clip();
    }
    ctx.drawImage(state.designerLogoImg, bx, by, bw, bh);
    ctx.restore();
  } else {
    const pt = state.presetLogoType || 'star';
    const primary = '#38bdf8';
    if (pt === 'star') drawStar(ctx, cx, cy, 5, r * 0.75, r * 0.35, primary);
    else if (pt === 'crown') drawCrown(ctx, cx, cy, r * 0.8, '#fbbf24');
    else if (pt === 'shield') drawShield(ctx, cx, cy, r * 0.8, primary);
    else drawStar(ctx, cx, cy, 5, r * 0.75, r * 0.35, primary);
  }

  ctx.restore();
}

export function renderSeriesWatermark(ctx, bx, by, bw, bh, opacity, frameStyle) {
  ctx.save();
  ctx.globalAlpha = opacity;

  if (state.badge2Type === 'text') {
    drawCustomTextRibbon(ctx, bx, by, bw, bh, state.badge2Text || 'SERIES', state.badge2Font, state.badge2Bold, state.badge2Italic, state.badge2PtSize, frameStyle, 'series');
    ctx.restore();
    return;
  }

  if (state.badge2Type === 'image' && state.badge2Img) {
    ctx.save();
    if (frameStyle === 'circle') {
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by + bh / 2, Math.min(bw, bh) / 2, 0, Math.PI * 2);
      ctx.clip();
    } else if (frameStyle === 'rounded' || frameStyle === 'pill') {
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, frameStyle === 'pill' ? bh / 2 : 6);
      ctx.clip();
    }
    ctx.drawImage(state.badge2Img, bx, by, bw, bh);
    ctx.restore();
    ctx.restore();
    return;
  }

  const p = state.badge2Preset || 'graffiti';
  if (p === 'graffiti') drawGraffitiBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'poster') drawPosterBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'transit') drawTransitBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'props') drawPropsBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'hazard') drawHazardBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'nature') drawNatureBadge(ctx, bx, by, bw, bh, frameStyle);
  else drawGraffitiBadge(ctx, bx, by, bw, bh, frameStyle);

  ctx.restore();
}

export function renderExtraWatermark(ctx, bx, by, bw, bh, opacity, frameStyle, badgeNum) {
  const isB3 = (badgeNum === 3);
  const type = isB3 ? state.badge3Type : state.badge4Type;
  const text = isB3 ? (state.badge3Text || 'EXTRA 1') : (state.badge4Text || 'EXTRA 2');
  const font = isB3 ? state.badge3Font : state.badge4Font;
  const bold = isB3 ? state.badge3Bold : state.badge4Bold;
  const italic = isB3 ? state.badge3Italic : state.badge4Italic;
  const ptSize = isB3 ? state.badge3PtSize : state.badge4PtSize;
  const role = isB3 ? 'extra1' : 'extra2';
  const img = isB3 ? state.badge3Img : state.badge4Img;
  const preset = isB3 ? state.badge3Preset : state.badge4Preset;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (type === 'text') {
    drawCustomTextRibbon(ctx, bx, by, bw, bh, text, font, bold, italic, ptSize, frameStyle, role);
    ctx.restore();
    return;
  }

  if (type === 'image' && img) {
    ctx.save();
    if (frameStyle === 'circle') {
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by + bh / 2, Math.min(bw, bh) / 2, 0, Math.PI * 2);
      ctx.clip();
    } else if (frameStyle === 'rounded' || frameStyle === 'pill') {
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, frameStyle === 'pill' ? bh / 2 : 6);
      ctx.clip();
    }
    ctx.drawImage(img, bx, by, bw, bh);
    ctx.restore();
    ctx.restore();
    return;
  }

  const p = preset || (isB3 ? 'props' : 'hazard');
  if (p === 'props') drawPropsBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'hazard') drawHazardBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'graffiti') drawGraffitiBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'poster') drawPosterBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'transit') drawTransitBadge(ctx, bx, by, bw, bh, frameStyle);
  else if (p === 'nature') drawNatureBadge(ctx, bx, by, bw, bh, frameStyle);
  else drawPropsBadge(ctx, bx, by, bw, bh, frameStyle);

  ctx.restore();
}

export function getRibbonColorStyle(badgeRole) {
  let mode, solidBg, solidStroke, solidText, cBg1, cBg2, cStroke, cText, cDir, themeKey;
  if (badgeRole === 'creator') {
    mode = state.badge1ColorMode;
    solidBg = state.badge1SolidBg;
    solidStroke = state.badge1SolidStroke;
    solidText = state.badge1SolidText;
    cBg1 = state.badge1CustomBg1;
    cBg2 = state.badge1CustomBg2;
    cStroke = state.badge1CustomStroke;
    cText = state.badge1CustomText;
    cDir = state.badge1GradDir;
    themeKey = state.badge1ColorTheme || 'cyan';
  } else if (badgeRole === 'series') {
    mode = state.badge2ColorMode;
    solidBg = state.badge2SolidBg;
    solidStroke = state.badge2SolidStroke;
    solidText = state.badge2SolidText;
    cBg1 = state.badge2CustomBg1;
    cBg2 = state.badge2CustomBg2;
    cStroke = state.badge2CustomStroke;
    cText = state.badge2CustomText;
    cDir = state.badge2GradDir;
    themeKey = state.badge2ColorTheme || 'purple';
  } else if (badgeRole === 'extra1') {
    mode = state.badge3ColorMode;
    solidBg = state.badge3SolidBg;
    solidStroke = state.badge3SolidStroke;
    solidText = state.badge3SolidText;
    cBg1 = state.badge3CustomBg1;
    cBg2 = state.badge3CustomBg2;
    cStroke = state.badge3CustomStroke;
    cText = state.badge3CustomText;
    cDir = state.badge3GradDir;
    themeKey = state.badge3ColorTheme || 'emerald';
  } else {
    mode = state.badge4ColorMode;
    solidBg = state.badge4SolidBg;
    solidStroke = state.badge4SolidStroke;
    solidText = state.badge4SolidText;
    cBg1 = state.badge4CustomBg1;
    cBg2 = state.badge4CustomBg2;
    cStroke = state.badge4CustomStroke;
    cText = state.badge4CustomText;
    cDir = state.badge4GradDir;
    themeKey = state.badge4ColorTheme || 'amber';
  }

  if (mode === 'solid') {
    return {
      type: 'solid',
      bg: solidBg,
      stroke: solidStroke,
      textColor: solidText
    };
  } else if (mode === 'gradient') {
    return {
      type: 'gradient',
      bgStart: cBg1,
      bgEnd: cBg2,
      stroke: cStroke,
      textColor: cText,
      direction: cDir
    };
  } else {
    const theme = SERIES_COLOR_THEMES[themeKey] || (badgeRole === 'creator' ? SERIES_COLOR_THEMES.cyan : SERIES_COLOR_THEMES.purple);
    return {
      type: 'gradient',
      bgStart: theme.bgStart,
      bgEnd: theme.bgEnd,
      stroke: theme.stroke,
      textColor: theme.textColor || '#ffffff',
      direction: 'diagonal'
    };
  }
}

export function drawCustomTextRibbon(ctx, bx, by, bw, bh, text, fontFamily, isBold, isItalic, ptSize, frameStyle, badgeRole) {
  if (!text) return;
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? Math.min(bw, bh) / 2 : (frameStyle === 'rounded' ? 6 : 0));
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const styleInfo = getRibbonColorStyle(badgeRole);

  if (frameStyle !== 'raw') {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    if (styleInfo.type === 'solid') {
      ctx.fillStyle = styleInfo.bg;
    } else {
      let bgGrad;
      if (styleInfo.direction === 'horizontal') {
        bgGrad = ctx.createLinearGradient(bx, cy, bx + bw, cy);
      } else if (styleInfo.direction === 'vertical') {
        bgGrad = ctx.createLinearGradient(cx, by, cx, by + bh);
      } else {
        bgGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      }
      bgGrad.addColorStop(0, styleInfo.bgStart);
      bgGrad.addColorStop(1, styleInfo.bgEnd);
      ctx.fillStyle = bgGrad;
    }

    ctx.beginPath();
    if (frameStyle === 'circle') {
      ctx.arc(cx, cy, Math.min(bw, bh) / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(bx, by, bw, bh, radius);
    }
    ctx.fill();

    ctx.strokeStyle = styleInfo.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 1;

  const weight = isBold ? '700' : '400';
  const style = isItalic ? 'italic' : 'normal';
  let targetPx = Math.round((ptSize || 13) * 1.333);
  const fontStack = `"${fontFamily || 'Montserrat'}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.font = `${style} ${weight} ${targetPx}px ${fontStack}`;

  const useLetterSpacing = badgeRole === 'creator' ? state.badge1LetterSpacing : (badgeRole === 'series' ? state.badge2LetterSpacing : (badgeRole === 'extra1' ? state.badge3LetterSpacing : state.badge4LetterSpacing));
  if (useLetterSpacing && 'letterSpacing' in ctx) {
    ctx.letterSpacing = '1.5px';
  }

  const innerPad = badgeRole === 'creator' ? (state.badge1InnerPadding ?? 8) : (badgeRole === 'series' ? (state.badge2InnerPadding ?? 8) : (badgeRole === 'extra1' ? (state.badge3InnerPadding ?? 8) : (state.badge4InnerPadding ?? 8)));
  const horizontalPad = (frameStyle === 'pill' ? Math.max(innerPad * 1.6, bh * 0.5) : innerPad * 2);
  const maxTextWidth = Math.max(10, bw - horizontalPad);
  let textMetrics = ctx.measureText(text);
  if (textMetrics.width > maxTextWidth && textMetrics.width > 0) {
    const scale = Math.max(0.45, maxTextWidth / textMetrics.width);
    targetPx = Math.max(7, Math.round(targetPx * scale));
    ctx.font = `${style} ${weight} ${targetPx}px ${fontStack}`;
  }

  const textGradEnabled = badgeRole === 'creator'
    ? state.badge1TextGradEnabled
    : (badgeRole === 'series'
      ? state.badge2TextGradEnabled
      : (badgeRole === 'extra1'
        ? state.badge3TextGradEnabled
        : state.badge4TextGradEnabled));

  if (textGradEnabled) {
    const c1 = badgeRole === 'creator'
      ? state.badge1TextGradColor1
      : (badgeRole === 'series'
        ? state.badge2TextGradColor1
        : (badgeRole === 'extra1'
          ? state.badge3TextGradColor1
          : state.badge4TextGradColor1));
    const c2 = badgeRole === 'creator'
      ? state.badge1TextGradColor2
      : (badgeRole === 'series'
        ? state.badge2TextGradColor2
        : (badgeRole === 'extra1'
          ? state.badge3TextGradColor2
          : state.badge4TextGradColor2));
    const dir = badgeRole === 'creator'
      ? state.badge1TextGradDir
      : (badgeRole === 'series'
        ? state.badge2TextGradDir
        : (badgeRole === 'extra1'
          ? state.badge3TextGradDir
          : state.badge4TextGradDir));

    let textGrad;
    if (dir === 'horizontal') {
      const halfW = (textMetrics?.width || bw * 0.4) / 2;
      textGrad = ctx.createLinearGradient(cx - halfW, cy, cx + halfW, cy);
    } else {
      const halfH = targetPx * 0.55;
      textGrad = ctx.createLinearGradient(cx, cy - halfH, cx, cy + halfH);
    }
    textGrad.addColorStop(0, c1 || '#ffffff');
    textGrad.addColorStop(1, c2 || '#38bdf8');
    ctx.fillStyle = textGrad;
  } else {
    ctx.fillStyle = styleInfo.textColor || '#ffffff';
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '0px';
  }
  ctx.restore();
}

export function drawCrown(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy + r * 0.35);
  ctx.lineTo(cx - r * 0.65, cy - r * 0.25);
  ctx.lineTo(cx - r * 0.25, cy - r * 0.05);
  ctx.lineTo(cx, cy - r * 0.45);
  ctx.lineTo(cx + r * 0.25, cy - r * 0.05);
  ctx.lineTo(cx + r * 0.65, cy - r * 0.25);
  ctx.lineTo(cx + r * 0.5, cy + r * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawShield(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.55);
  ctx.lineTo(cx + r * 0.45, cy - r * 0.35);
  ctx.lineTo(cx + r * 0.4, cy + r * 0.15);
  ctx.quadraticCurveTo(cx + r * 0.3, cy + r * 0.5, cx, cy + r * 0.65);
  ctx.quadraticCurveTo(cx - r * 0.3, cy + r * 0.5, cx - r * 0.4, cy + r * 0.15);
  ctx.lineTo(cx - r * 0.45, cy - r * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawGraffitiBadge(ctx, bx, by, bw, bh, frameStyle) {
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? bw / 2 : 6);
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#7e22ce');
  grad.addColorStop(1, '#581c87');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();

  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  ctx.fillStyle = '#fdf4ff';
  ctx.font = `800 ${Math.max(9, Math.round(bh * 0.44))}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GRAFFITI', cx, cy);
}

export function drawPosterBadge(ctx, bx, by, bw, bh, frameStyle) {
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? bw / 2 : 6);
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#c2410c');
  grad.addColorStop(1, '#9a3412');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();

  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  ctx.fillStyle = '#fff7ed';
  ctx.font = `800 ${Math.max(9, Math.round(bh * 0.44))}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POSTER', cx, cy);
}

export function drawTransitBadge(ctx, bx, by, bw, bh, frameStyle) {
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? bw / 2 : 6);
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(1, '#0369a1');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  ctx.fillStyle = '#f0f9ff';
  ctx.font = `800 ${Math.max(9, Math.round(bh * 0.44))}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TRANSIT', cx, cy);
}

export function drawPropsBadge(ctx, bx, by, bw, bh, frameStyle) {
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? bw / 2 : 6);
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#047857');
  grad.addColorStop(1, '#065f46');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  ctx.fillStyle = '#ecfdf5';
  ctx.font = `800 ${Math.max(9, Math.round(bh * 0.44))}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PROPS', cx, cy);
}

export function drawHazardBadge(ctx, bx, by, bw, bh, frameStyle) {
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? bw / 2 : 6);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.clip();

  ctx.fillStyle = '#eab308';
  ctx.fillRect(bx, by, bw, bh);

  ctx.fillStyle = '#1e1b18';
  for (let sx = -bh * 2; sx < bw + bh * 2; sx += 14) {
    ctx.beginPath();
    ctx.moveTo(bx + sx, by);
    ctx.lineTo(bx + sx + 7, by);
    ctx.lineTo(bx + sx - 5, by + bh);
    ctx.lineTo(bx + sx - 12, by + bh);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.restore();
}

export function drawNatureBadge(ctx, bx, by, bw, bh, frameStyle) {
  const radius = frameStyle === 'pill' ? bh / 2 : (frameStyle === 'circle' ? bw / 2 : 6);
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#15803d');
  grad.addColorStop(1, '#166534');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();

  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  ctx.fillStyle = '#f0fdf4';
  ctx.font = `800 ${Math.max(9, Math.round(bh * 0.44))}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NATURE', cx, cy);
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    switchBadgeSubtab,
    switchBadgeTab,
    toggleBadge1Enable,
    toggleBadge2Enable,
    toggleBadge3Enable,
    toggleBadge4Enable,
    toggleBadge1TextGrad,
    onBadge1TextGradInput,
    setBadge1TextGradDir,
    applyBadge1TextGradPreset,
    toggleBadge2TextGrad,
    onBadge2TextGradInput,
    setBadge2TextGradDir,
    applyBadge2TextGradPreset,
    toggleBadge3TextGrad,
    onBadge3TextGradInput,
    setBadge3TextGradDir,
    applyBadge3TextGradPreset,
    toggleBadge4TextGrad,
    onBadge4TextGradInput,
    setBadge4TextGradDir,
    applyBadge4TextGradPreset,
    onCreatorPositionChange,
    onCreatorCoordChange,
    snapCreatorCoord,
    onSeriesPositionChange,
    onSeriesCoordChange,
    snapSeriesCoord,
    onSeriesBadgeScaleChange,
    onSeriesBadgeOpacityChange,
    onSeriesPaddingChange,
    onSeriesInnerPaddingChange,
    setExtra1BadgeMode,
    onExtra1TextChange,
    clearExtra1Text,
    setExtra1TextPreset,
    onExtra1FontChange,
    toggleExtra1Bold,
    toggleExtra1Italic,
    toggleExtra1LetterSpacing,
    onExtra1PtSizeChange,
    setExtra1ColorMode,
    setExtra1ColorTheme,
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
    setExtra2BadgeMode,
    onExtra2TextChange,
    clearExtra2Text,
    setExtra2TextPreset,
    onExtra2FontChange,
    toggleExtra2Bold,
    toggleExtra2Italic,
    toggleExtra2LetterSpacing,
    onExtra2PtSizeChange,
    setExtra2ColorMode,
    setExtra2ColorTheme,
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
    onExtra2OpacityChange,
    copyBadgeStyle,
    runBadgeStyleCopyAction,
    applyCreatorGradPresetByName,
    applySeriesGradPresetByName,
    applyExtra1GradPresetByName,
    applyExtra2GradPresetByName,
    applyBadge1TextGradPresetByName,
    applyBadge2TextGradPresetByName,
    applyBadge3TextGradPresetByName,
    applyBadge4TextGradPresetByName,
    selectBadgeOverlay,
    getBadgeAtPoint,
    initBadgeCanvasInteractions,
    updateBadgeLivePosition
  });
}
