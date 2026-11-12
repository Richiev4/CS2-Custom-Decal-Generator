/**
 * Shared DOM, modal, canvas, and drag-and-drop utilities.
 * Centralizes repetitive element lookups, modal lifecycle controllers,
 * canvas data URL / thumbnail generation, and file dropzone bindings.
 */

/**
 * Safely retrieves a DOM element by ID.
 * @param {string} id
 * @returns {HTMLElement | null}
 */
export function getEl(id) {
  return document.getElementById(id);
}

/**
 * Safely sets textContent on a DOM element by ID.
 * @param {string} id
 * @param {string | number} text
 */
export function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(text ?? '');
}

/**
 * Safely sets value on an input/select/textarea element by ID.
 * @param {string} id
 * @param {string | number} value
 */
export function setElValue(id, value) {
  const el = document.getElementById(id);
  if (el && 'value' in el) el.value = String(value ?? '');
}

/**
 * Safely sets checked state on a checkbox/radio input by ID.
 * @param {string} id
 * @param {boolean} checked
 */
export function setElChecked(id, checked) {
  const el = document.getElementById(id);
  if (el && 'checked' in el) el.checked = Boolean(checked);
}

/**
 * Safely sets style.display on a DOM element by ID.
 * @param {string} id
 * @param {string} display
 */
export function setElDisplay(id, display) {
  const el = document.getElementById(id);
  if (el) el.style.display = display;
}

/**
 * Toggles the 'active' class on an element (by ID or reference) or across an iterable of elements.
 * @param {string | HTMLElement | Iterable<HTMLElement | string> | null} target
 * @param {boolean | ((el: HTMLElement) => boolean)} isActiveOrFn
 */
export function syncActiveClass(target, isActiveOrFn) {
  if (!target) return;
  const resolveActive = (el) =>
    typeof isActiveOrFn === 'function' ? Boolean(isActiveOrFn(el)) : Boolean(isActiveOrFn);

  if (typeof target === 'string') {
    const el = document.getElementById(target);
    if (el && el.classList) el.classList.toggle('active', resolveActive(el));
    return;
  }

  if (target instanceof Element) {
    if (target.classList) target.classList.toggle('active', resolveActive(target));
    return;
  }

  if (typeof target[Symbol.iterator] === 'function') {
    for (const item of target) {
      const el = typeof item === 'string' ? document.getElementById(item) : item;
      if (el && el.classList) {
        el.classList.toggle('active', resolveActive(el));
      }
    }
  }
}

/**
 * Creates standardized open, close, and backdrop-click handlers for a modal element.
 * Supports both class-based (`active` class) and inline `style.display` modals.
 *
 * @param {string} modalId - DOM ID of the modal container
 * @param {Object} [options]
 * @param {boolean} [options.useActiveClass=false] - Toggle `.active` instead of `style.display`
 * @param {string} [options.openDisplay='flex'] - Display mode when opened via inline style
 * @param {Function} [options.onOpen] - Optional hook invoked when opening
 * @param {Function} [options.onClose] - Optional hook invoked when closing
 */
export function createModalController(modalId, options = {}) {
  const {
    useActiveClass = false,
    openDisplay = 'flex',
    onOpen = null,
    onClose = null
  } = options;

  function open(...args) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (typeof onOpen === 'function') {
      onOpen(modal, ...args);
    }
    if (useActiveClass) {
      modal.classList.add('active');
    } else {
      modal.style.display = openDisplay;
    }
  }

  function close(...args) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (useActiveClass) {
      modal.classList.remove('active');
    } else {
      modal.style.display = 'none';
    }
    if (typeof onClose === 'function') {
      onClose(modal, ...args);
    }
  }

  function closeOnBackdrop(event) {
    const modal = document.getElementById(modalId);
    if (event && event.target === modal) {
      close(event);
    }
  }

  return { open, close, closeOnBackdrop };
}

/**
 * Converts an HTMLImageElement or HTMLCanvasElement to a PNG data URL.
 * @param {HTMLImageElement | HTMLCanvasElement | null} img
 * @returns {string | null}
 */
export function imageToDataUrl(img) {
  if (!img) return null;
  try {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return null;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return c.toDataURL('image/png');
  } catch (e) {
    console.warn('Could not serialize image to dataURL:', e);
    return null;
  }
}

/**
 * Captures a square thumbnail PNG data URL from a source canvas or image.
 * @param {HTMLCanvasElement | HTMLImageElement | null} source
 * @param {number} [size=96]
 * @returns {string | null}
 */
export function captureCanvasThumbnail(source, size = 96) {
  if (!source) return null;
  try {
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;
    if (!srcW || !srcH) return null;
    const thumb = document.createElement('canvas');
    thumb.width = size;
    thumb.height = size;
    const ctx = thumb.getContext('2d');
    ctx.drawImage(source, 0, 0, size, size);
    return thumb.toDataURL('image/png');
  } catch (e) {
    console.warn('Could not capture canvas thumbnail:', e);
    return null;
  }
}

/**
 * Binds standard dragenter/dragover/dragleave/drop listeners to a dropzone element.
 * @param {HTMLElement | string | null} target - Element or element ID
 * @param {(files: FileList, event: DragEvent) => void} onFilesDropped
 * @param {string} [dragOverClass='dragover']
 */
export function bindDragAndDropZone(target, onFilesDropped, dragOverClass = 'dragover') {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el || typeof onFilesDropped !== 'function') return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    el.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    el.addEventListener(eventName, () => el.classList.add(dragOverClass), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    el.addEventListener(eventName, () => el.classList.remove(dragOverClass), false);
  });

  el.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFilesDropped(files, e);
    }
  }, false);
}
