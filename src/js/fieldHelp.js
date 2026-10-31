// ==========================================
// Interactive Field Help & Knowledge Base System
// ==========================================
import { state } from './state.js';

export const FIELD_HELP = {
  assetName: {
    title: 'Asset Name',
    badge: 'File Naming',
    badgeClass: 'pill-blue',
    desc: 'The unique name identifier for your asset files and ExtraAssetsImporter folder.',
    details: 'The folder is named with your Asset Name (e.g. <code>CustomRoadMarking_01</code>). Inside this folder, ExtraAssetsImporter expects textures to be named cleanly without the asset name prefix: <code>_BaseColorMap.png</code>, <code>_NormalMap.png</code>, <code>_MaskMap.png</code>, and <code>icon.png</code>.<br><br>💡 <strong>Variant Protection:</strong> If you rotate or flip your texture, an indicator badge and reminder card will appear here with <strong>⚡ Auto-Rename</strong> to prevent accidentally overwriting previous exports in CS2.',
    wikiTopic: 'install'
  },
  assetSeries: {
    title: 'Asset Series / Pack Collection',
    badge: 'Series Ribbon',
    badgeClass: 'pill-purple',
    desc: 'Assigns this asset to a themed collection or series visible in the bottom Ribbon.',
    details: 'Allows you to group related decals, surfaces, and net lanes into packs (e.g. <code>UK Roads</code>, <code>Speed Bumps</code>, <code>Manhole Series</code>, <code>Graffiti Pack 01</code>).<br><br>🎞️ <strong>Bottom Series Ribbon:</strong> All saved assets within a series appear in the bottom horizontal ribbon track for rapid 1-click loading, duplicating, and comparison.<br><br>💡 <strong>Switcher:</strong> You can switch anytime between the <strong>Series Ribbon</strong> and the <strong>Destination Folder Info</strong> at the bottom of the screen.',
    wikiTopic: 'install'
  },
  assetCategory: {
    title: 'Asset Category (Subfolder)',
    badge: 'Organization',
    badgeClass: 'pill-green',
    desc: 'The subfolder used to categorize and catalog your asset in-game.',
    details: 'Organizes assets in the ExtraAssetsImporter tool menu. Typical categories:<br>• <strong>Decals:</strong> <code>RoadMarkings</code>, <code>Utilities</code>, <code>Manholes</code>, <code>Graffiti</code>, <code>Signage</code>, <code>Cracks</code>.<br>• <strong>Surfaces:</strong> <code>Pavement</code>, <code>Tiles</code>, <code>Asphalt</code>, <code>Grass</code>, <code>Dirt</code>.<br>• <strong>Net Lanes:</strong> <code>Lines</code>, <code>Curbs</code>, <code>Markings</code>, <code>Tracks</code>, <code>Paths</code>.',
    wikiTopic: 'install'
  },
  targetResolution: {
    title: 'Target Resolution (Power-of-2)',
    badge: 'Texture Res',
    badgeClass: 'pill-blue',
    desc: 'Dimensions of the generated texture maps (512×512 up to 4096×4096).',
    details: 'Cities: Skylines 2 requires square power-of-2 textures for GPU mipmapping and mip-streaming.<br>• <strong>1024×1024:</strong> Ideal for crisp road decals and markings.<br>• <strong>2048×2048:</strong> Recommended for high-frequency terrain surfaces and large plaza tiles.<br>• <strong>4096×4096:</strong> Maximum 4K detail for ultra cinematic captures.',
    wikiTopic: 'resolution'
  },
  aspectRatioStrategy: {
    title: 'Aspect Ratio Strategy',
    badge: 'Image Fit',
    badgeClass: 'pill-purple',
    desc: 'Controls how non-square uploaded graphics are fit onto the 1:1 square canvas.',
    details: '<ul><li><strong>Square Crop &amp; Center (Cover):</strong> Zooms and cleanly crops outer edges to fill the square without stretching.</li><li><strong>Fit &amp; Pad Transparent Borders (Contain):</strong> Centers the entire original graphic without cropping, padding edges with transparency.</li></ul>',
    wikiTopic: 'resolution'
  },
  textureRotation: {
    title: 'Texture Rotation & Flips',
    badge: 'Orientation',
    badgeClass: 'pill-orange',
    desc: 'Applies hardware-accelerated matrix rotation or mirroring to the canvas pipeline.',
    details: 'Crucial for aligning directional road markings (turn arrows, chevrons) with the road spline traffic flow.<br>• Use <strong>⇄ Flip Horizontal</strong> to immediately mirror arrows for Left-Hand Traffic (LHT) vs Right-Hand Traffic (RHT) cities.<br>• Rotate 90° or 270° if a netlane graphic draws perpendicular to the street.<br>• <strong>Smart Rename Flag:</strong> An indicator flag will appear beside the Asset Name whenever a transform is active to remind you to name your variant.',
    wikiTopic: 'wiki'
  },
  decalDimensions: {
    title: 'Projected Decal Dimensions',
    badge: '3D Box (Meters)',
    badgeClass: 'pill-blue',
    desc: 'Physical 3D oriented bounding box in real-world meters.',
    details: 'Defines the width, height, and projection depth in meters on the terrain/road in CS2.<br>• <strong>Defaults:</strong> 2.0m width, 2.0m height, 1.0m projection depth.<br>• Increase depth if your decal clips on curbs or uneven sloping hillsides.',
    wikiTopic: 'wiki'
  },
  uvScale: {
    title: 'UV Scale (Tiling Density)',
    badge: 'Terrain UV',
    badgeClass: 'pill-green',
    desc: 'Controls how densely the seamless terrain surface repeats across landscape meters.',
    details: 'Dictates the in-game terrain uvScale:<br>• <strong>1.0:</strong> Standard 1:1 default terrain density.<br>• <strong>2.0, 4.0, 8.0:</strong> Compresses the texture coordinates so cobblestones, gravel, or bricks appear smaller, tighter, and sharper in-game.',
    wikiTopic: 'tiling-lit'
  },
  laneWidth: {
    title: 'Lane Width (Meters)',
    badge: 'Spline Width',
    badgeClass: 'pill-orange',
    desc: 'Cross-sectional width of the net lane extruded along curved roads and paths.',
    details: 'Paradox Wiki Note: CS2 netlanes are designed ≤ <strong>5.0m</strong> width.<br>• Road stripes &amp; dashed lines: <code>0.2m – 0.6m</code>.<br>• Curbs &amp; barriers: <code>0.4m – 1.0m</code>.',
    wikiTopic: 'wiki'
  },
  textureLength: {
    title: 'Texture Length (Meters)',
    badge: 'Spline Repeat',
    badgeClass: 'pill-orange',
    desc: 'Longitudinal repetition distance along the curved spline.',
    details: 'Sets how many meters the texture stretches along the road spline before repeating seamlessly. Default: <code>2.0m</code>.',
    wikiTopic: 'wiki'
  },
  renderTargetLayers: {
    title: 'Render Target Layers',
    badge: 'Layer Bitmask',
    badgeClass: 'pill-blue',
    desc: 'Specifies which 3D scene surfaces will receive the projected decal.',
    details: 'Colossal Order bitmask combination summed into <code>_colossal_DecalLayerMask</code>:<br>• <strong>1:</strong> Terrain (Natural ground)<br>• <strong>2:</strong> Roads (Pavement &amp; asphalt)<br>• <strong>4:</strong> Buildings (Zoned lots &amp; walls)<br>• <strong>8:</strong> Vehicles (Cars &amp; trucks)<br>• <strong>16:</strong> Creatures (Citizens &amp; animals)<br>• <strong>32:</strong> Props (Curbs &amp; barriers)<br><em>Default sum = 7 (Terrain + Roads + Buildings).</em>',
    wikiTopic: 'wiki'
  },
  normalOpacity: {
    title: 'Normal Map Opacity',
    badge: '_NormalOpacity',
    badgeClass: 'pill-blue',
    desc: 'Controls normal map blending strength (Paradox Wiki specification).',
    details: 'Float property (0.0 to 1.0) saved in <code>settings.json</code>:<br>• <strong>1.0:</strong> Full 3D surface relief (manhole rims, raised thermoplastic paint).<br>• <strong>0.0:</strong> Flat normal (allows the asphalt aggregate and roughness underneath to bleed through thin painted stripes).',
    wikiTopic: 'wiki'
  },
  drawOrder: {
    title: 'Render Draw Order Priority',
    badge: '_Draw Order',
    badgeClass: 'pill-purple',
    desc: 'Specifies layer sorting priority when multiple decals, surfaces, or networks overlap.',
    details: '<ul><li><strong>Decals &amp; Net Lanes:</strong> Range <code>0 to 200</code> (Defaults: 50 / 60). Higher values render on top of lower ones.</li><li><strong>Surfaces:</strong> Restricted to <code>-170 to 0</code> (Default: -50) to prevent ground polygons from bleeding over elevated highway viaducts.</li></ul>',
    wikiTopic: 'wiki'
  },
  globalFallbacks: {
    title: 'Global Material Fallbacks',
    badge: 'Shader Fallback',
    badgeClass: 'pill-cyan',
    desc: 'Fallback Metallic and Smoothness constants stored in JSON.',
    details: 'Saved as <code>_Metallic</code> and <code>_Smoothness</code> in your configuration JSON.<br><em>Note: These constants are bypassed and overridden when a custom physical <code>_MaskMap.png</code> texture is generated and bundled.</em>',
    wikiTopic: 'pbr'
  },
  sourceImage: {
    title: 'Source Image Input',
    badge: 'Base Input',
    badgeClass: 'pill-blue',
    desc: 'Base visual artwork used to generate BaseColor, Normal, and Mask maps.',
    details: 'Supports PNG, JPG, and WebP.<br>• <strong>Decals:</strong> Transparent backgrounds recommended.<br>• <strong>Surfaces:</strong> Must be seamless tiling textures (no transparent borders).<br>• <strong>Net Lanes:</strong> Textures tile vertically along spline curves.',
    wikiTopic: 'modes'
  },
  normalMapSource: {
    title: 'Normal Map Source',
    badge: 'OpenGL (+X, +Y)',
    badgeClass: 'pill-cyan',
    desc: 'Auto-generate from color luminance or insert a custom tangent normal map.',
    details: 'Our procedural generator calculates Sobel spatial gradients from grayscale luminosity to output an OpenGL tangent normal map (<code>_NormalMap.png</code>). If you already have a sculpted tangent normal map from Blender or Substance, click <em>Insert Custom _NormalMap...</em> to modulate relief depth directly.',
    wikiTopic: 'pbr'
  },
  bumpIntensity: {
    title: 'Height / Bump Depth',
    badge: 'Relief Scale',
    badgeClass: 'pill-blue',
    desc: 'Scales normal vector relief intensity and groove steepness.',
    details: 'Higher values create deeper shadows and pronounced 3D highlights.<br>• Flat road paint: <code>1.0× – 2.0×</code><br>• Manhole iron rims &amp; drains: <code>3.0× – 4.5×</code><br>• Rough cobblestones: <code>2.5× – 3.5×</code>',
    wikiTopic: 'pbr'
  },
  normalBlur: {
    title: 'Edge Pre-Blur / Smoothing',
    badge: 'Anti-Aliasing',
    badgeClass: 'pill-blue',
    desc: 'Applies subtle pixel softening before calculating normal gradients.',
    details: 'Eliminates harsh pixelated steps or noisy grain on low-resolution source images or sharp text, creating smooth beveled bevels instead of jagged edges.',
    wikiTopic: 'pbr'
  },
  normalInversions: {
    title: 'Inversion & Channel Flips',
    badge: 'Vector Math',
    badgeClass: 'pill-cyan',
    desc: 'Flips normal map depth or tangent vector orientation.',
    details: '• <strong>Invert Bump Direction:</strong> Turns raised studs into recessed pits or cracks.<br>• <strong>Flip Green Channel (-Y):</strong> Swaps DirectX vs OpenGL coordinates (CS2 Unity uses standard OpenGL +Y upwards).',
    wikiTopic: 'pbr'
  },
  metallicChannel: {
    title: 'Metallic (Red Channel)',
    badge: 'Mask R',
    badgeClass: 'pill-red',
    desc: 'Determines whether the surface reflects light like raw metal or dielectric insulator.',
    details: '• <strong>0 (0%):</strong> Dielectric (asphalt, concrete, chalk, painted thermoplastic road lines).<br>• <strong>150–255:</strong> Polished metal (cast iron sewer grates, stainless steel manhole plates, brass badges).',
    wikiTopic: 'pbr'
  },
  smoothnessChannel: {
    title: 'Smoothness / Glossiness (Alpha Channel)',
    badge: 'Mask Alpha',
    badgeClass: 'pill-yellow',
    desc: 'Controls specular highlight tightness and surface glossiness.',
    details: 'Paradox Wiki Note: CS2 shaders use Smoothness (inverse of Roughness) packed into the Alpha channel of the Mask map.<br>• <strong>20–40:</strong> Rough, dry asphalt and powdery dirt.<br>• <strong>60–80:</strong> Semi-gloss road enamel or damp stone.<br>• <strong>200–255:</strong> Wet puddles, mirror sheen, and glossy chrome.',
    wikiTopic: 'pbr'
  },
  modulateAlpha: {
    title: 'Alpha Cutout Modulation',
    badge: 'Decal Clipping',
    badgeClass: 'pill-yellow',
    desc: 'Restricts Metallic and Smoothness properties exclusively to visible decal pixels.',
    details: 'Multiplies the Mask Map Alpha by the Base Color cutout opacity. Prevents empty transparent pixels outside your road marking from showing metallic gloss or specular reflections on the pavement.',
    wikiTopic: 'pbr'
  },
  iconSettings: {
    title: 'In-Game Icon & 4-Layer Watermarks',
    badge: '_Icon.png (256×256)',
    badgeClass: 'pill-purple',
    desc: 'Generates the official 256×256 in-game UI thumbnail with up to 4 simultaneous watermark overlays.',
    details: '• <strong>Background Styles:</strong> CS2 Slate Vignette, 3D Hex Pedestal, Asphalt, Blueprint Grid, or Transparent.<br>• <strong>Overlay Switcher:</strong> Switch cleanly between <strong>Creator</strong>, <strong>Series</strong>, <strong>Extra 1</strong>, and <strong>Extra 2</strong> layers via dropdown.<br>• <strong>Style Sync:</strong> Quickly copy font, colors, and gradients across any badge layer with 1 click.',
    wikiTopic: 'install'
  },
  badgeEdgePadding: {
    title: 'Badge Padding (Edge Inset)',
    badge: 'Frame Offset',
    badgeClass: 'pill-blue',
    desc: 'Distance in pixels from the outer edge of the 256×256 icon frame.',
    details: 'Adjusts how far the badge is inset from icon boundaries (0 to 36 px) to prevent clipping against CS2 UI borders.',
    wikiTopic: 'install'
  },
  badgeInnerPadding: {
    title: 'Inner Ribbon Padding',
    badge: 'Ribbon Inset',
    badgeClass: 'pill-blue',
    desc: 'Internal padding between badge borders and text/graphic content.',
    details: 'Controls breathing room inside pill tags, squircles, and seals (2 to 24 px).',
    wikiTopic: 'install'
  },
  seriesCustomText: {
    title: 'Custom Badge Text Tag',
    badge: 'Typography',
    badgeClass: 'pill-purple',
    desc: 'Custom text monograms and tags with live Google Fonts and gradient styling.',
    details: '• Type custom pack names, versions, or monograms (e.g. <code>POSTERS</code>, <code>V1.0</code>, <code>4K</code>).<br>• Use quick suggestions dropdown for 1-click text tags.<br>• Supports dual-stop gradient fills, vertical/horizontal gradient text, and real-time Google Font loading.',
    wikiTopic: 'install'
  },
  creatorBadge: {
    title: 'Custom Creator Branding & Watermarks',
    badge: '4-Layer Overlay System',
    badgeClass: 'pill-purple',
    desc: 'Supercharges the generated _Icon.png thumbnail with up to 4 personalized watermark overlays.',
    details: '• <strong>Overlay 1 (Creator):</strong> Brand mods with personal seals, monograms, or uploaded PNG logos.<br>• <strong>Overlay 2 (Series):</strong> Tag assets by collection or category (e.g. Graffiti, Transit, Posters).<br>• <strong>Overlays 3 &amp; 4 (Extra 1 &amp; 2):</strong> Add versioning (V1.0), resolution (4K), warnings, or custom seals.<br>• <strong>Style Sync &amp; Defaults:</strong> Copy styles between overlays with 1 click, or save as defaults to load automatically every session!',
    wikiTopic: 'install'
  }
};

let activeHelpTopic = 'modes';
let activeHelpButton = null;
let isPopoverPinned = false;
let popoverHideTimer = null;

export function showFieldHelp(btnEl, fieldKey, event) {
  if (isPopoverPinned && activeHelpButton && activeHelpButton !== btnEl) {
    return;
  }
  clearPopoverHideTimer();
  const item = FIELD_HELP[fieldKey];
  if (!item) return;

  activeHelpTopic = item.wikiTopic || 'modes';
  activeHelpButton = btnEl;

  const popover = document.getElementById('fieldHelpPopover');
  const titleEl = document.getElementById('popoverTitle');
  const badgeEl = document.getElementById('popoverBadge');
  const bodyEl = document.getElementById('popoverBody');
  const pinHint = document.getElementById('popoverPinHint');

  if (!popover || !titleEl || !badgeEl || !bodyEl) return;

  titleEl.textContent = item.title;
  badgeEl.textContent = item.badge || 'INFO';
  badgeEl.className = `popover-badge channel-pill ${item.badgeClass || 'pill-blue'}`;
  bodyEl.innerHTML = `
    <p style="margin-bottom: 6px; font-weight: 500; color: #f1f5f9;">${item.desc}</p>
    <div style="font-size: 11px; line-height: 1.4; color: #94a3b8;">${item.details}</div>
  `;

  if (pinHint) {
    pinHint.textContent = isPopoverPinned ? 'Pinned (Click ? or Esc to close)' : 'Click ? to pin open';
  }

  const rect = btnEl.getBoundingClientRect();
  const popoverWidth = 330;
  const popoverHeight = 220;
  const padding = 12;

  let top = rect.bottom + 6;
  let left = rect.left - 10;

  if (left + popoverWidth > window.innerWidth - padding) {
    left = window.innerWidth - popoverWidth - padding;
  }
  if (left < padding) left = padding;

  if (top + popoverHeight > window.innerHeight - padding && rect.top > popoverHeight + padding) {
    top = rect.top - popoverHeight - 6;
  }

  popover.style.top = `${Math.max(padding, top)}px`;
  popover.style.left = `${Math.max(padding, left)}px`;

  popover.classList.add('visible');
}

export function toggleFieldHelp(btnEl, fieldKey, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (isPopoverPinned && activeHelpButton === btnEl) {
    hideFieldHelp(true);
    return;
  }

  isPopoverPinned = true;
  document.querySelectorAll('.help-q-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  showFieldHelp(btnEl, fieldKey, event);
}

export function scheduleHideFieldHelp() {
  if (isPopoverPinned) return;
  clearPopoverHideTimer();
  popoverHideTimer = setTimeout(() => {
    hideFieldHelp(false);
  }, 220);
}

export function clearPopoverHideTimer() {
  if (popoverHideTimer) {
    clearTimeout(popoverHideTimer);
    popoverHideTimer = null;
  }
}

export function hideFieldHelp(force = false) {
  if (!force && isPopoverPinned) return;
  clearPopoverHideTimer();
  isPopoverPinned = false;
  const popover = document.getElementById('fieldHelpPopover');
  if (popover) {
    popover.classList.remove('visible');
  }
  if (activeHelpButton) {
    activeHelpButton.classList.remove('active');
    activeHelpButton = null;
  }
  document.querySelectorAll('.help-q-btn').forEach(b => b.classList.remove('active'));
}

export function openPopoverTopicInGuide() {
  const topic = activeHelpTopic || 'modes';
  hideFieldHelp(true);
  openHelpModal(topic);
}

export function openHelpModal(category = 'all') {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.style.display = 'flex';
    setHelpCategory(category);
    const searchInput = document.getElementById('helpSearchInput');
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 50);
    }
    filterHelpTopics('');
  }
}

export function closeHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

export function closeHelpModalOnBackdrop(e) {
  if (e.target && e.target.id === 'helpModal') {
    closeHelpModal();
  }
}

export function setHelpCategory(cat) {
  state.currentHelpCategory = cat;
  document.querySelectorAll('#helpFilterPills .help-filter-btn').forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(`'${cat}'`)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  const query = document.getElementById('helpSearchInput')?.value || '';
  filterHelpTopics(query);
}

export function filterHelpTopics(query) {
  const q = query.trim().toLowerCase();
  const cards = document.querySelectorAll('#helpItemsList .help-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    const matchesCategory = (state.currentHelpCategory === 'all' || cat === state.currentHelpCategory);
    const text = card.textContent.toLowerCase();
    const matchesSearch = !q || text.includes(q);

    if (matchesCategory && matchesSearch) {
      card.style.display = 'block';
      visibleCount++;
      if (q) {
        card.setAttribute('open', '');
      }
    } else {
      card.style.display = 'none';
    }
  });

  const noRes = document.getElementById('helpNoResults');
  if (noRes) {
    noRes.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}
