A complete vibe codded web-based texture packing and asset creation suite for Cities: Skylines II. Generate custom Decals, Surfaces, and Net Lanes with PBR channel packing (BaseColor, OpenGL Normal, Mask Map), 3D preview, and instant ExtraAssetsImporter export.

# Cities: Skylines II Custom Asset Generator

A browser-based modding suite and PBR texture-packing pipeline designed specifically for **Cities: Skylines II** and the **ExtraAssetsImporter** framework. 

Create, configure, and package custom **Decals**, **Surfaces**, and **Net Lanes** with real-time 3D PBR preview, automated normal and mask map generation, in-game icon styling, and one-click export into ready-to-load game packages.

Created with Google AI Studio

---

## 🚀 Key Features

### 🎨 3-in-1 Multi-Asset Workflow
* **Decals**: Single placable ground, curb, or wall decals with adjustable dimensions and geometry JSON.
* **Surfaces**: Tiling area surfaces for custom asphalt, cobblestone, grass, tiles, and pavement with custom UV tiling scale.
* **Net Lanes**: Repeating network lane segments for road markings, highway lines, borders, curbs, and paths.
* **3-in-1 Bundles**: Manage Decal, Surface, and Net Lane variations together in a single coordinated set.

### 🧪 PBR Texture Pipeline
* **Base Color Map (`_BaseColorMap.png`)**: Automatic power-of-two resampling, transparency trimming, padding, rotation, and flipping.
* **OpenGL Normal Map (`_NormalMap.png`)**:
  * Real-time height-to-normal calculation with Sobel filtering.
  * Native CS2 OpenGL coordinate space (`+X, +Y`).
  * Invert Green / Y channel toggle, blur/smoothing, and intensity controls.
  * Custom normal map upload support.
* **Mask Map (`_MaskMap.png`)**:
  * Full CS2 channel packing:
    * **Red (R)**: Metallic
    * **Green (G)**: Smoothness / Roughness (with invert toggle)
    * **Blue (B)**: Ambient Occlusion
    * **Alpha (A)**: Detail / Opacity
  * Individual sliders and per-channel source texture overrides.

### 👁️ Real-Time 3D & Scale Preview
* Interactive WebGL 3D preview with dynamic lighting and camera controls.
* PBR shader previewing roughness, metallicity, and normal map relief in real time.
* Realistic scale references (pedestrians, cars, road widths) to verify in-game proportions before exporting.

### 🏷️ In-Game UI Icon & Badge Generator
* Generates standard game UI icons (`icon.png`) automatically from your source image.
* Customizable category badges, borders, backgrounds, and drop shadows to match vanilla game menus.

### 📦 Pack Collections & In-Game Menu Order
* Assign custom pack names, series groupings, and category tabs.
* Precise UI Priority ordering to control exactly where your assets appear in the in-game menus.

### 💾 Export & Import Options
* **Direct Game Folder Export**: Writes files directly to your `ExtraAssetsImporter` directory via the File System Access API.
* **Organized `.zip` Packages**: Generates folder-structured archives ready to drop into your mod folder.
* **Loose Map Downloads**: Quick individual downloads for BaseColor, Normal, Mask, and config JSON files.
* **Community Importer**: Import and modify existing community ZIP archives, folders, or loose texture sets.
* **Local Storage & Backup**: Save/load `.cs2asset` project files and perform full workspace backups via IndexedDB.

---

## 🛠️ Mod Compatibility
* Built for use with **Cities: Skylines II** and the **ExtraAssetsImporter** mod by *Algernon / Treeputer*.
* Follows the official Unity PBR texture conventions and CS2 decal geometry specifications.
