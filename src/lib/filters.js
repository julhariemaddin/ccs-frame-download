/**
 * filters.js
 * ------------------------------------------------------------------
 * Quick photo looks the student can preview and bake into their
 * frame — no photo editor required. Each preset is a CSS filter
 * string applied to the canvas context (`ctx.filter = ...`) before
 * the photo is drawn, so it works identically in the live preview
 * (Stage.jsx) and the final export (App.jsx renderOutput).
 * ------------------------------------------------------------------
 */
export const PHOTO_FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.08)' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.32) saturate(1.3) contrast(1.05) brightness(1.02)' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.5) contrast(1.14) brightness(1.03)' },
  { id: 'cool', label: 'Cool', css: 'saturate(1.12) hue-rotate(-6deg) contrast(1.06) brightness(1.02)' },
];

export function getFilterCss(id) {
  return PHOTO_FILTERS.find((f) => f.id === id)?.css || 'none';
}
