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
    badge: 'Pack Tag',
    badgeClass: 'pill-purple',
    desc: 'Assigns this asset to a themed collection or series tag.',
    details: 'Allows you to group related decals, surfaces, and net lanes into packs (e.g. <code>UK Roads</code>, <code>Speed Bumps</code>, <code>Manhole Series</code>, <code>Graffiti Pack 01</code>).<br><br>💡 <strong>Icon Badge Sync:</strong> You can quickly sync this series name with your Overlay 2 series watermark badge on your in-game icon.',
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
    title: 'Aspect Ratio Strategy & Poster Mode',
    badge: 'Image Fit',
    badgeClass: 'pill-purple',
    desc: 'Controls how rectangular graphics and posters are handled on square GPU textures.',
    details: '<ul><li><strong>Fit &amp; Pad Transparent Borders (Contain):</strong> Centers the entire original graphic without cropping, padding edges with transparent alpha. Perfect for posters, framed artwork, and signs on 1:1 square decals.</li><li><strong>Fill Texture (Full UV) (Stretch):</strong> Fills 100% of the square texture without transparent padding. Proportions are accurately restored in Cities: Skylines 2 by setting matching Decal Dimensions (e.g. 1.2m × 1.8m for a 2:3 poster). Offers the sharpest visual resolution!</li><li><strong>Square Crop &amp; Center (Cover):</strong> Zooms and cleanly crops outer edges to fill the square without stretching (ideal for seamless square tiles, but will crop poster borders).</li><li><strong>Auto-Sync on Import:</strong> Automatically detects graphic aspect ratio, updates decal Width &amp; Height, and locks proportions.</li></ul>',
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
    details: 'Defines the width, height, and projection depth in meters on the terrain/road/building in CS2.<br>• <strong>📐 In-Game Scale Preview:</strong> Switch to the <strong>In-Game Scale</strong> tab to preview your decal projected inside real-world environments: an asphalt road lane next to a 4.5m passenger car and 1.8m citizen, on a building wall next to a standard 2.1m doorway, or on the official Cities: Skylines II 8m × 8m zoning grid!<br>• <strong>Poster &amp; Billboard Presets:</strong> 1-click sizes for 2:3 Movie / Kiosk posters (1.2×1.8m), 3:4 Wall posters (1.2×1.6m), DIN A-Series (1.0×1.41m), Banner ads (1.0×2.0m), and 16:9 Billboards (4×2.25m).<br>• <strong>🔒 Lock Ratio:</strong> Locks proportional scaling between Width and Height so editing either automatically scales the other.<br>• <strong>⚡ Match Graphic Ratio:</strong> Instantly matches the natural proportions of your loaded source graphic.<br>• Increase depth if your decal clips on curbs or uneven sloping hillsides; decrease depth (0.1–0.2m) for flush wall posters.',
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
    details: '• <strong>Background Styles:</strong> CS2 Slate Vignette, 3D Hex Pedestal, Asphalt, Blueprint Grid, Custom (Image / Dual Gradient / Solid Color), or None.<br>• <strong>Custom Backdrops:</strong> Upload your own PNG/JPG backdrop image, select procedural asphalt/concrete presets, or craft custom linear/radial color gradients.<br>• <strong>Overlay Switcher:</strong> Switch cleanly between <strong>Creator</strong>, <strong>Series</strong>, <strong>Extra 1</strong>, and <strong>Extra 2</strong> layers via dropdown.<br>• <strong>Style Sync:</strong> Quickly copy font, colors, and gradients across any badge layer with 1 click.',
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
  creatorCustomText: {
    title: 'Creator Monogram / Author Text',
    badge: 'Creator Overlay',
    badgeClass: 'pill-purple',
    desc: 'Custom author tag, brand text, or monogram embedded into the icon.',
    details: 'Type custom creator identifiers (e.g. <code>CREATOR</code>, <code>STUDIO 99</code>, <code>MODS</code>) with customizable font, styling, dual-color gradients, and placement.',
    wikiTopic: 'install'
  },
  creatorBadge: {
    title: 'Custom Creator Branding & Watermarks',
    badge: '4-Layer Overlay System',
    badgeClass: 'pill-purple',
    desc: 'Supercharges the generated _Icon.png thumbnail with up to 4 personalized watermark overlays.',
    details: '• <strong>Overlay 1 (Creator):</strong> Brand mods with personal seals, monograms, or uploaded PNG logos.<br>• <strong>Overlay 2 (Series):</strong> Tag assets by collection or category (e.g. Graffiti, Transit, Posters).<br>• <strong>Overlays 3 &amp; 4 (Extra 1 &amp; 2):</strong> Add versioning (V1.0), resolution (4K), warnings, or custom seals.<br>• <strong>Style Sync &amp; Defaults:</strong> Copy styles between overlays with 1 click, or save as defaults to load automatically every session!',
    wikiTopic: 'install'
  },
  maskModulation: {
    title: 'Alpha Cutout Modulation',
    badge: 'Decal Clipping',
    badgeClass: 'pill-yellow',
    desc: 'Restricts Metallic and Smoothness properties exclusively to visible decal pixels.',
    details: 'Multiplies the Mask Map Alpha by the Base Color cutout opacity. Prevents empty transparent pixels outside your road marking from showing metallic gloss or specular reflections on the pavement.',
    wikiTopic: 'pbr'
  },
  maskVariation: {
    title: 'Surface Detail / Roughness Variation',
    badge: 'Micro-Roughness',
    badgeClass: 'pill-yellow',
    desc: 'Derives organic procedural variation from luminance crevices in your texture.',
    details: '• <strong>0% (Flat):</strong> Uses a uniform smoothness value across all pixels.<br>• <strong>&gt; 0%:</strong> Samples image luminance to perturb smoothness, making dark crevices and gravel pits rougher and highlights glossier for realistic weathering.',
    wikiTopic: 'pbr'
  },
  baseOpacity: {
    title: 'Base Color Opacity (_BaseOpacity)',
    badge: 'Albedo Cutout',
    badgeClass: 'pill-blue',
    desc: 'Controls transparency blending strength of the albedo base texture.',
    details: 'Float property (0.0 to 1.0) saved in <code>settings.json</code> and configuration files:<br>• <strong>1.0:</strong> Crisp, solid opaque color paint.<br>• <strong>&lt; 1.0:</strong> Fades color transparency to create worn, faded, or semi-translucent weathering on roads and surfaces.',
    wikiTopic: 'wiki'
  },
  metallicOpacity: {
    title: 'Metallic Opacity (_MetallicOpacity)',
    badge: 'Metal Shader',
    badgeClass: 'pill-cyan',
    desc: 'Global metallic reflection multiplier stored in the shader properties.',
    details: 'Modulates metallic sheen intensity (0.0 to 1.0). For standard road paint, asphalt, and markings, the default is <code>0.0</code>. Raise toward <code>1.0</code> for metallic plates, brass studs, or reflective foil.',
    wikiTopic: 'pbr'
  },
  uiPriority: {
    title: 'UI Menu Priority (UiPriority / m_Priority)',
    badge: 'Menu Sorting',
    badgeClass: 'pill-purple',
    desc: 'Determines the exact display order of the asset within in-game toolbar menus.',
    details: 'Verified against the official <strong>Cities: Skylines II Paradox Wiki</strong>:<br>• <strong>Valid Range:</strong> <code>0</code> to <code>99,999,999</code> (Default: <code>41</code>).<br>• <strong>Positioning:</strong> <code>0</code> places the asset first in its category. Higher numbers place assets further down.<br>• <strong>Why High Numbers?</strong> Setting a high base number (e.g. <code>10,000</code> or <code>50,000</code>) cleanly segregates custom modded assets from vanilla base game items and official DLCs.<br>• <strong>Asset Sequences (Stepped Decades):</strong> If assets share the same priority, CS2 sorts them unpredictably by loading order. Use the <em>Stepped Decade System</em> (e.g. Base <code>50,000</code> + Step <code>10</code>) to assign <code>50010</code>, <code>50020</code>, <code>50030</code>. This guarantees exact in-game order while leaving space between assets for future variants or flips!',
    wikiTopic: 'wiki'
  },
  assetMetadata: {
    title: 'Asset Set Metadata & Editor Flags',
    badge: 'Set Tracking',
    badgeClass: 'pill-purple',
    desc: 'Stores set collections, author branding, version numbers, and Editor flags in your configuration JSON.',
    details: '• <strong>asset_metadata:</strong> Adds a clean object containing <code>set_name</code> (e.g. "Road Markings"), <code>author</code>, <code>version</code>, and <code>notes</code>. Unity JSON deserializers safely ignore unknown properties, keeping this completely safe in-game.<br>• <strong>m_availableInEditor:</strong> The native Cities: Skylines II prefab flag allowing your asset to appear in the official Map/Asset Editor.<br>• <strong>Dual Priority:</strong> Outputs both <code>UiPriority</code> and <code>m_UIPriority</code> for 100% compatibility across legacy and future loaders.<br>• <strong>Recalling &amp; Tracking:</strong> Stored set profiles can be recalled with 1 click to auto-increment part numbering and priority sequences!',
    wikiTopic: 'wiki'
  },
  setRegistry: {
    title: 'Asset Set Registry & Overlap Protection',
    badge: 'Range Allocator',
    badgeClass: 'pill-green',
    desc: 'Tracks priority ranges across multiple sets to prevent overlapping menu positions.',
    details: '• <strong>1,000-Step Priority Bands:</strong> Each set reserves a clean range (e.g. 50,000–50,990 for Set A, 51,000–51,990 for Set B).<br>• <strong>Real-Time Collision Detection:</strong> Immediately alerts you if a priority number falls inside another set\'s allocated space.<br>• <strong>⚡ Next Safe Band:</strong> 1-click jump to the next unallocated 1,000-block boundary.<br>• <strong>Overview Modal:</strong> View all registered sets, total assets, and priority spans in one central table.',
    wikiTopic: 'wiki'
  },
  jsonSchemaFormat: {
    title: 'JSON Configuration Format',
    badge: 'Mod Config',
    badgeClass: 'pill-blue',
    desc: 'Selects the schema format for generated geometry and shader configuration JSON.',
    details: '• <strong>Extended (Float/Vector):</strong> Complete CS2 configuration containing <code>_colossal_DecalLayerMask</code>, <code>_NormalOpacity</code>, <code>_BaseOpacity</code>, <code>_MetallicOpacity</code>, <code>UiPriority</code>, and oriented 3D bounding coordinates.<br>• <strong>Simple (Flat):</strong> Compact schema specifying fundamental width, height, and depth dimensions.',
    wikiTopic: 'wiki'
  },
  exportPackage: {
    title: 'Export Asset Package (.zip)',
    badge: 'Packaging',
    badgeClass: 'pill-green',
    desc: 'Packages textures, metadata, and JSON configs into an ExtraAssetsImporter bundle.',
    details: 'Generates a ready-to-extract ZIP folder containing:<br>• <code>_BaseColorMap.png</code> (RGBA albedo)<br>• <code>_NormalMap.png</code> (OpenGL tangent vectors)<br>• <code>_MaskMap.png</code> (R:Metal, A:Smooth)<br>• <code>icon.png</code> (256×256 UI thumbnail with watermarks)<br>• <code>decal.json</code> / <code>surface.json</code> / <code>netlane.json</code> &amp; official <code>settings.json</code>.<br><br>💡 <strong>Direct Folder Install:</strong> You can also choose <em>Export Directly to CS2 Folder</em> in the Save Destination dialog to write files straight into your game directory without unzipping!',
    wikiTopic: 'install'
  },
  directExport: {
    title: 'Export Directly to CS2 Folder',
    badge: 'Direct Install',
    badgeClass: 'pill-purple',
    desc: 'Writes game-ready textures and JSON directly into your Cities: Skylines II mod folder.',
    details: 'Uses the browser\'s secure native File System Access API to stream <code>_BaseColorMap.png</code>, <code>_NormalMap.png</code>, <code>_MaskMap.png</code>, <code>icon.png</code>, and configuration JSON directly into your <code>ModsData\\ExtraAssetsImporter</code> folder. Eliminates manual downloading and unzipping.',
    wikiTopic: 'install'
  },
  scalePreview: {
    title: 'In-Game Scale & Environment Preview',
    badge: 'Scale Verification',
    badgeClass: 'pill-cyan',
    desc: 'Interactive 3D preview of decals and markings against real-world references.',
    details: 'Inspect your decal in three real-world environments:<br>• <strong>Asphalt Road:</strong> Compare size against a 4.5m passenger sedan and 1.8m citizen pedestrian.<br>• <strong>Building Wall:</strong> Test vertical wall posters and signage next to a standard 2.1m exterior doorway.<br>• <strong>CS2 Zoning Grid:</strong> Gauge size against the official Cities: Skylines II 8m × 8m zoning cell grid.',
    wikiTopic: 'wiki'
  },
  assetWizard: {
    title: '3-Step Asset Setup Wizard',
    badge: 'Guided Setup',
    badgeClass: 'pill-green',
    desc: 'Step-by-step walkthrough for configuring decals, surfaces, and net lanes.',
    details: 'Guides you through:<br>• <strong>Step 1 (Type & Mode):</strong> Choose Decal, Terrain Surface, or Net Lane, plus naming and series tag.<br>• <strong>Step 2 (Dimensions & Ratio):</strong> Set physical width, height, and depth in meters with real-world presets.<br>• <strong>Step 3 (Graphics & PBR):</strong> Load source artwork, auto-generate OpenGL normal maps, and tune metallic/smoothness.',
    wikiTopic: 'modes'
  },
  backupManager: {
    title: 'Workspace Backup & Restore',
    badge: 'Data Safety',
    badgeClass: 'pill-purple',
    desc: 'Backup and restore all asset sets, priority allocations, default badges, and drafts.',
    details: 'Exports a single portable JSON snapshot of your entire workspace:<br>• All registered asset sets and allocated priority bands.<br>• Saved default icon watermarks, logos, and typography.<br>• Local asset library drafts.<br>Easily transfer configurations between browsers or recover from accidental clearing.',
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
