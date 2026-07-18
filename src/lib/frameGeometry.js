/**
 * frameGeometry.js
 * ------------------------------------------------------------------
 * A frame PNG has two functional zones baked into its pixels:
 *
 *   1. The PHOTO HOLE — a fully transparent (alpha === 0) region.
 *      Its true shape is an octagon (corners are cut at 45deg), NOT
 *      a rectangle. A naive bounding-box clip lets the photo bleed
 *      into the decorative corner cuts. We fix that by building a
 *      pixel-exact mask from the frame's own alpha channel and
 *      clipping the photo to it with `destination-in` compositing,
 *      instead of a `ctx.rect()` clip.
 *
 *   2. The NAMEPLATE BOX — a solid opaque white plate near the
 *      bottom of the frame, meant to hold the printed name/program.
 *      It isn't transparent, so we detect it by scanning for the
 *      largest solid-white opaque region in the lower portion of
 *      the canvas.
 *
 * Both are detected once per frame image (not hardcoded per frame),
 * so any new frame PNG dropped into /public/program works the same
 * way without code changes.
 * ------------------------------------------------------------------
 */

const NAMEPLATE_SCAN_START_RATIO = 0.75; // only look for the plate in the bottom 25% of the canvas

export function buildFrameGeometry(img, size = 1254) {
  const src = document.createElement('canvas');
  src.width = size;
  src.height = size;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(img, 0, 0, size, size);

  const { data } = sctx.getImageData(0, 0, size, size);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = size;
  maskCanvas.height = size;
  const maskCtx = maskCanvas.getContext('2d');
  const maskData = maskCtx.createImageData(size, size);

  let holeMinX = size, holeMaxX = 0, holeMinY = size, holeMaxY = 0, holeFound = false;
  let plateMinX = size, plateMaxX = 0, plateMinY = size, plateMaxY = 0, plateFound = false;

  const nameplateYStart = Math.floor(size * NAMEPLATE_SCAN_START_RATIO);

  for (let y = 0; y < size; y++) {
    const row = y * size;
    const scanningPlate = y >= nameplateYStart;
    for (let x = 0; x < size; x++) {
      const idx = (row + x) * 4;
      const a = data[idx + 3];

      if (a < 10) {
        holeFound = true;
        maskData.data[idx] = 255;
        maskData.data[idx + 1] = 255;
        maskData.data[idx + 2] = 255;
        maskData.data[idx + 3] = 255;
        if (x < holeMinX) holeMinX = x;
        if (x > holeMaxX) holeMaxX = x;
        if (y < holeMinY) holeMinY = y;
        if (y > holeMaxY) holeMaxY = y;
        continue;
      }

      if (scanningPlate && a > 250) {
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r > 248 && g > 248 && b > 248) {
          plateFound = true;
          if (x < plateMinX) plateMinX = x;
          if (x > plateMaxX) plateMaxX = x;
          if (y < plateMinY) plateMinY = y;
          if (y > plateMaxY) plateMaxY = y;
        }
      }
    }
  }
  maskCtx.putImageData(maskData, 0, 0);

  const hole = holeFound
    ? { x: holeMinX, y: holeMinY, w: holeMaxX - holeMinX, h: holeMaxY - holeMinY }
    : { x: 0, y: 0, w: size, h: size };

  const nameplate = plateFound
    ? { x: plateMinX, y: plateMinY, w: plateMaxX - plateMinX, h: plateMaxY - plateMinY }
    : null;

  return { maskCanvas, hole, nameplate, size };
}

/** Draws the photo transformed, then clips it to the exact octagon hole (not its bounding box). */
export function drawPhotoIntoHole(ctx, geometry, photoImg, photoState) {
  const { size, maskCanvas } = geometry;
  ctx.clearRect(0, 0, size, size);
  if (!photoImg) return;

  ctx.save();
  ctx.translate(photoState.x, photoState.y);
  ctx.rotate((photoState.rotation * Math.PI) / 180);
  const s = photoState.baseScale * photoState.scale;
  ctx.drawImage(
    photoImg,
    (-photoImg.width * s) / 2,
    (-photoImg.height * s) / 2,
    photoImg.width * s,
    photoImg.height * s
  );
  ctx.restore();

  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
