import { useEffect, useRef, useState } from 'react';
import { buildFrameGeometry } from '../lib/frameGeometry';
import { FONT_STACKS } from '../lib/adminStore';

const SIZE = 1254;
const BASE = import.meta.env.BASE_URL;

/**
 * A live, draggable canvas preview so the admin can place the name/program
 * text boxes by dragging them directly on the frame artwork, instead of
 * typing X/Y numbers blind. Dragging updates layout.nameOffsetX/Y and
 * layout.programOffsetX/Y (offsets from the frame's auto-detected
 * nameplate center, the same anchor the main generator uses).
 */
export default function FramePreviewEditor({ frame, layout, onChange }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const draggingRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [frameImg, setFrameImg] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [error, setError] = useState('');

  // load the frame image + detect its nameplate anchor whenever the frame changes
  useEffect(() => {
    setError('');
    setFrameImg(null);
    setGeometry(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setFrameImg(img);
      setGeometry(buildFrameGeometry(img, SIZE));
    };
    img.onerror = () => setError('Could not load this frame image for preview.');
    img.src = frame.isCustom ? frame.file : `${BASE}${frame.categoryKey}/${frame.file}`;
  }, [frame]);

  const anchor = geometry?.nameplate
    ? { x: geometry.nameplate.x + geometry.nameplate.w / 2, y: geometry.nameplate.y + geometry.nameplate.h / 2 - 10 }
    : { x: SIZE / 2, y: SIZE - 170 };

  // redraw the canvas whenever anything relevant changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    // checkerboard so an empty hole is visibly "transparent"
    ctx.fillStyle = '#e8dec7';
    ctx.fillRect(0, 0, SIZE, SIZE);

    if (frameImg) ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);

    const nameX = anchor.x + layout.nameOffsetX;
    const nameY = anchor.y + layout.nameOffsetY;
    const programX = anchor.x + layout.programOffsetX;
    const programY = anchor.y + layout.programOffsetY;

    const nameFont = FONT_STACKS[layout.nameFont] || FONT_STACKS.display;
    const programFont = FONT_STACKS[layout.programFont] || FONT_STACKS.mono;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // program box (draw first so name sits "above" visually if overlapping)
    drawDraggableBox(ctx, programX, programY, 'PROGRAM / SECTION', programFont, layout.programSize, layout.programColor);
    drawDraggableBox(ctx, nameX, nameY, 'FULL NAME', nameFont, layout.nameSize, layout.nameColor);

    ctx.restore();
  }, [frameImg, layout, anchor.x, anchor.y]);

  function drawDraggableBox(ctx, x, y, placeholder, font, size, color) {
    ctx.font = `${font.weight} ${size}px ${font.stack}`;
    ctx.fillStyle = color;
    ctx.fillText(placeholder, x, y);
    // dashed hit-box outline so the admin can see the draggable area
    const w = ctx.measureText(placeholder).width;
    ctx.save();
    ctx.strokeStyle = 'rgba(201, 154, 69, 0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(x - w / 2 - 14, y - size / 2 - 10, w + 28, size + 20);
    ctx.restore();
  }

  function getCanvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scale = SIZE / rect.width;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  }

  function hitTest(pt, offsetX, offsetY, placeholder, font, size) {
    const ctx = canvasRef.current.getContext('2d');
    ctx.font = `${font.weight} ${size}px ${font.stack}`;
    const w = ctx.measureText(placeholder).width;
    const x = anchor.x + offsetX;
    const y = anchor.y + offsetY;
    return (
      pt.x > x - w / 2 - 14 &&
      pt.x < x + w / 2 + 14 &&
      pt.y > y - size / 2 - 10 &&
      pt.y < y + size / 2 + 10
    );
  }

  function startDrag(e) {
    if (!frameImg) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    const nameFont = FONT_STACKS[layout.nameFont] || FONT_STACKS.display;
    const programFont = FONT_STACKS[layout.programFont] || FONT_STACKS.mono;

    // name is drawn on top, so test it first
    if (hitTest(pt, layout.nameOffsetX, layout.nameOffsetY, 'FULL NAME', nameFont, layout.nameSize)) {
      draggingRef.current = 'name';
      dragStartRef.current = { x: pt.x, y: pt.y, offsetX: layout.nameOffsetX, offsetY: layout.nameOffsetY };
    } else if (
      hitTest(pt, layout.programOffsetX, layout.programOffsetY, 'PROGRAM / SECTION', programFont, layout.programSize)
    ) {
      draggingRef.current = 'program';
      dragStartRef.current = { x: pt.x, y: pt.y, offsetX: layout.programOffsetX, offsetY: layout.programOffsetY };
    } else {
      return;
    }
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
  }

  function onDrag(e) {
    if (!draggingRef.current) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    const dx = pt.x - dragStartRef.current.x;
    const dy = pt.y - dragStartRef.current.y;
    if (draggingRef.current === 'name') {
      onChange({ nameOffsetX: Math.round(dragStartRef.current.offsetX + dx), nameOffsetY: Math.round(dragStartRef.current.offsetY + dy) });
    } else {
      onChange({ programOffsetX: Math.round(dragStartRef.current.offsetX + dx), programOffsetY: Math.round(dragStartRef.current.offsetY + dy) });
    }
  }

  function endDrag() {
    draggingRef.current = null;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchend', endDrag);
  }

  return (
    <div className="admin-preview">
      {error && <div className="banner banner--error">{error}</div>}
      <div
        className="admin-preview__canvas-wrap"
        ref={wrapRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <canvas ref={canvasRef} width={SIZE} height={SIZE} />
      </div>
      <p className="admin-preview__hint mono">
        Drag the dashed boxes to place the name and program. Placeholders are shown here, but the
        real text appears the same way for users.
      </p>
    </div>
  );
}
