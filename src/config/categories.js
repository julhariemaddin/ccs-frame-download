// Drop new frame PNGs in /public/<folder>/ and list them here.
// Hole + nameplate geometry is auto-detected per file — no coordinates to maintain.
// Categories/frames added through the /admin dashboard are layered on
// top of this at runtime — see src/lib/mergedCategories.js.
export const CATEGORIES = {
  program: {
    label: 'Program',
    folder: 'program',
    listFile: 'program/list.txt',
    frames: [
      { id: 'frame-1', file: 'frame-1.png', label: 'Plum & Brass' },
      { id: 'frame-2', file: 'frame-2.png', label: 'Ink & Azure' },
    ],
  },
  events: {
    label: 'Events',
    folder: 'events',
    listFile: 'events/list.txt',
    frames: [],
  },
};
