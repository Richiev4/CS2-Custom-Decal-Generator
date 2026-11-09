// ==========================================
// IndexedDB Persistence Layer for CS2 Asset Generator
// Replaces 5MB localStorage with multi-gigabyte browser IndexedDB storage
// ==========================================

const DB_NAME = 'cs2_asset_generator_db';
const DB_VERSION = 1;
const STORE_NAME = 'assets';
export const LEGACY_STORAGE_KEY = 'cs2_decal_surface_library';

// In-memory synchronous cache for instantaneous UI rendering and zero latency
let memoryLibrary = [];
let dbInstance = null;
let isInitializing = false;
let initPromise = null;

export const STARTER_ASSETS = [
  {
    version: '1.0',
    type: 'cs2-asset-project',
    appMode: 'decal',
    assetName: 'RoadMarking_TurnArrow_01',
    seriesName: 'Road Markings',
    assetCategory: 'RoadMarkings',
    surfaceCategory: 'RoadMarkings',
    targetResolution: '1024',
    fitStrategy: 'cover',
    dimensions: { width: 3.0, height: 6.0, depth: 0.5 },
    uvScale: 1.0,
    surfaceTiling: 4,
    layerMask: { terrain: true, roads: true, buildings: true, vehicles: false },
    drawOrder: 50,
    baseImageData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><path d='M50 15 L74 42 L58 42 L58 85 L42 85 L42 42 L26 42 Z' fill='%23ffffff'/></svg>",
    timestamp: Date.now() - 3600000
  },
  {
    version: '1.0',
    type: 'cs2-asset-project',
    appMode: 'netlane',
    assetName: 'NetLane_WhiteDashedLine_01',
    seriesName: 'Road Markings',
    assetCategory: 'Lines',
    surfaceCategory: 'Lines',
    targetResolution: '1024',
    fitStrategy: 'cover',
    netlane: { width: 0.3, length: 3.0 },
    uvScale: 1.0,
    surfaceTiling: 4,
    drawOrder: 60,
    baseImageData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><rect x='44' y='10' width='12' height='32' fill='%23ffffff'/><rect x='44' y='58' width='12' height='32' fill='%23ffffff'/></svg>",
    timestamp: Date.now() - 1800000
  },
  {
    version: '1.0',
    type: 'cs2-asset-project',
    appMode: 'decal',
    assetName: 'CityUtility_Manhole_01',
    seriesName: 'City Utilities',
    assetCategory: 'Utilities',
    surfaceCategory: 'Utilities',
    targetResolution: '1024',
    fitStrategy: 'cover',
    dimensions: { width: 1.8, height: 1.8, depth: 0.5 },
    uvScale: 1.0,
    surfaceTiling: 4,
    layerMask: { terrain: true, roads: true, buildings: true, vehicles: false },
    drawOrder: 50,
    baseImageData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><circle cx='50' cy='50' r='42' fill='%2322252a' stroke='%23474d57' stroke-width='3'/><circle cx='50' cy='50' r='24' fill='%2317191d'/><text x='50' y='54' fill='%239ca3af' font-size='10' font-family='sans-serif' text-anchor='middle' font-weight='bold'>SEWER</text></svg>",
    timestamp: Date.now()
  }
];

/**
 * Open or retrieve the IndexedDB database connection
 */
function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to in-memory/localStorage');
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'assetName' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('seriesName', 'seriesName', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Failed to open IndexedDB:', event.target.error);
      resolve(null); // graceful degradation
    };
  });
}

/**
 * Read all asset records from IndexedDB
 */
function readAllFromDB(db) {
  return new Promise((resolve) => {
    if (!db) {
      resolve([]);
      return;
    }
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };

      req.onerror = () => {
        resolve([]);
      };
    } catch (e) {
      console.warn('Error reading from IndexedDB:', e);
      resolve([]);
    }
  });
}

/**
 * Write a single asset record to IndexedDB
 */
function writeRecordToDB(db, asset) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(asset);

      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Delete a single asset record from IndexedDB by assetName
 */
function deleteRecordFromDB(db, assetName) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(assetName);

      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Initialize IndexedDB storage and populate memory cache
 * Handles automatic migration from legacy localStorage without data loss
 */
export async function initIndexedDBStorage() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = await openDB();

      if (db) {
        let items = await readAllFromDB(db);

        // Check if DB is empty and we have legacy localStorage to migrate
        if (items.length === 0) {
          let legacyItems = [];
          try {
            const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (raw) legacyItems = JSON.parse(raw);
          } catch (e) {}

          if (legacyItems && legacyItems.length > 0) {
            console.log(`Migrating ${legacyItems.length} assets from localStorage to IndexedDB...`);
            for (const item of legacyItems) {
              if (item && item.assetName) {
                await writeRecordToDB(db, item);
              }
            }
            items = await readAllFromDB(db);
            // Once migrated, clear legacy key to free up the 5MB browser quota
            try {
              localStorage.removeItem(LEGACY_STORAGE_KEY);
            } catch (e) {}
          } else {
            // Seed starter library
            for (const item of STARTER_ASSETS) {
              await writeRecordToDB(db, item);
            }
            items = await readAllFromDB(db);
          }
        }

        // Sort items by timestamp descending
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        memoryLibrary = items;
      } else {
        // Fallback if IndexedDB completely unavailable
        let fallback = [];
        try {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) fallback = JSON.parse(raw);
        } catch (e) {}
        if (!fallback.length) fallback = [...STARTER_ASSETS];
        memoryLibrary = fallback;
      }
    } catch (err) {
      console.error('IndexedDB initialization failed:', err);
      memoryLibrary = [...STARTER_ASSETS];
    }
    return memoryLibrary;
  })();

  return initPromise;
}

/**
 * Synchronous getter for in-memory cached library
 */
export function getSavedLibraryFromMemory() {
  return memoryLibrary;
}

/**
 * Save or update an asset project in IndexedDB and memory cache
 */
export async function saveAssetToIndexedDB(proj) {
  if (!proj || !proj.assetName) return;

  // Update in-memory cache
  const idx = memoryLibrary.findIndex(it => it.assetName === proj.assetName);
  if (idx >= 0) {
    memoryLibrary[idx] = proj;
  } else {
    memoryLibrary.unshift(proj);
  }

  // Persist to IndexedDB
  const db = await openDB();
  if (db) {
    await writeRecordToDB(db, proj);
  }
}

/**
 * Delete an asset project from IndexedDB and memory cache
 */
export async function deleteAssetFromIndexedDB(assetName) {
  if (!assetName) return;

  const idx = memoryLibrary.findIndex(it => it.assetName === assetName);
  if (idx >= 0) {
    memoryLibrary.splice(idx, 1);
  }

  const db = await openDB();
  if (db) {
    await deleteRecordFromDB(db, assetName);
  }
}

/**
 * Clear all assets and reset to starter presets
 */
export async function resetLibraryToStarters() {
  memoryLibrary = [...STARTER_ASSETS];
  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      for (const item of STARTER_ASSETS) {
        await writeRecordToDB(db, item);
      }
    } catch (e) {}
  }
}

/**
 * Read all assets directly from IndexedDB (guaranteed fresh, non-cached)
 */
export async function getAllAssetsFromIndexedDB() {
  const db = await openDB();
  if (!db) return memoryLibrary || [];
  try {
    const items = await readAllFromDB(db);
    if (items && items.length > 0) {
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      memoryLibrary = items;
      return items;
    }
  } catch (err) {
    console.warn('Error reading fresh assets from IndexedDB:', err);
  }
  return memoryLibrary || [];
}

/**
 * Completely wipe all records in IndexedDB
 */
export async function clearAllAssetsInIndexedDB() {
  memoryLibrary = [];
  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch (e) {
      console.warn('Error clearing IndexedDB:', e);
    }
  }
}

/**
 * Bulk import assets into IndexedDB
 * @param {Array} assets - Array of asset project objects
 * @param {boolean} replaceAll - If true, clears the database before importing
 */
export async function importAssetsToIndexedDB(assets, replaceAll = false) {
  if (!Array.isArray(assets) || assets.length === 0) return 0;
  const db = await openDB();
  if (!db) return 0;

  if (replaceAll) {
    await clearAllAssetsInIndexedDB();
  }

  let importedCount = 0;
  for (const item of assets) {
    if (item && item.assetName) {
      try {
        await writeRecordToDB(db, item);
        importedCount++;
      } catch (e) {
        console.warn('Failed to write asset to IndexedDB:', item.assetName, e);
      }
    }
  }

  // Refresh in-memory cache
  const refreshed = await readAllFromDB(db);
  refreshed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  memoryLibrary = refreshed;
  return importedCount;
}

/**
 * Calculate approximate byte size of assets in IndexedDB
 */
export async function estimateIndexedDBSize() {
  try {
    const assets = await getAllAssetsFromIndexedDB();
    const str = JSON.stringify(assets);
    return str.length; // Approximate bytes (UTF-8 / ASCII)
  } catch (_) {
    return 0;
  }
}

/**
 * Get quick count and stats of IndexedDB storage
 */
export async function getDBStats() {
  const assets = await getAllAssetsFromIndexedDB();
  const byteSize = await estimateIndexedDBSize();
  return {
    count: assets.length,
    byteSize,
    assets
  };
}
