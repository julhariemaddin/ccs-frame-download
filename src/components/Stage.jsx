import { useEffect, useRef } from 'react';
import { drawPhotoIntoHole } from '../lib/frameGeometry';
import { DEFAULT_LAYOUT, FONT_STACKS } from '../lib/adminStore';

const SIZE = 1254;

export default function Stage({
  frameImg,
  geometry,
  photoImg,
  photoState,
  setPhotoState,
  textState,
  setTextState,
  name,
  program,
  layout = DEFAULT_LAYOUT,
}) {
  const stageRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const frameCanvasRef = useRef(null);
  const textCanvasRef = useRef(null);
  const draggingRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // frame layer
  useEffect(() => {
    const ctx = frameCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    if (frameImg) ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
  }, [frameImg]);

  // photo layer, clipped to the exact hole shape
  useEffect(() => {
    const ctx = photoCanvasRef.current.getContext('2d');
    if (!geometry) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      return;
    }
    drawPhotoIntoHole(ctx, geometry, photoImg, photoState);
  }, [geometry, photoImg, photoState]);

  // text layer — position, color, and font all come from the frame's layout
  // (set by the admin dashboard, defaulted otherwise), plus the draggable anchor.
  useEffect(() => {
    const ctx = textCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    if (!name && !program) return;
    const nameFont = FONT_STACKS[layout.nameFont] || FONT_STACKS.display;
    const programFont = FONT_STACKS[layout.programFont] || FONT_STACKS.mono;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (name) {
      ctx.font = `${nameFont.weight} ${layout.nameSize}px ${nameFont.stack}`;
      ctx.fillStyle = layout.nameColor;
      ctx.fillText(name, textState.x + layout.nameOffsetX, textState.y + layout.nameOffsetY);
    }
    if (program) {
      ctx.font = `${programFont.weight} ${layout.programSize}px ${programFont.stack}`;
      ctx.fillStyle = layout.programColor;
      ctx.fillText(
        program,
        textState.x + layout.programOffsetX,
        textState.y + layout.programOffsetY
      );
    }
    ctx.restore();
  }, [name, program, textState, layout]);

  // reposition text anchor whenever geometry (or the frame's default layout) changes
  useEffect(() => {
    if (!geometry) return;
    if (geometry.nameplate) {
      setTextState({
        x: geometry.nameplate.x + geometry.nameplate.w / 2,
        y: geometry.nameplate.y + geometry.nameplate.h / 2 - 10,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, setTextState]);

  function getCanvasCoords(e) {
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scale = SIZE / rect.width;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  }

  function pointInText(pt) {
    if (!name) return false;
    return (
      Math.abs(pt.x - (textState.x + layout.nameOffsetX)) < 300 &&
      Math.abs(pt.y - (textState.y + layout.nameOffsetY)) < 44
    );
  }

  function startDrag(e) {
    if (!photoImg) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    if (pointInText(pt)) {
      draggingRef.current = 'text';
      dragOffsetRef.current = { x: pt.x - textState.x, y: pt.y - textState.y };
    } else {
      draggingRef.current = 'photo';
      dragOffsetRef.current = { x: pt.x - photoState.x, y: pt.y - photoState.y };
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
    if (draggingRef.current === 'text') {
      setTextState({
        x: pt.x - dragOffsetRef.current.x,
        y: pt.y - dragOffsetRef.current.y,
      });
    } else {
      setPhotoState((s) => ({
        ...s,
        x: pt.x - dragOffsetRef.current.x,
        y: pt.y - dragOffsetRef.current.y,
      }));
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
    <div className="stage">
      <div
        className="stage__inner"
        ref={stageRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <canvas ref={photoCanvasRef} width={SIZE} height={SIZE} className="stage__layer" />
        <canvas ref={frameCanvasRef} width={SIZE} height={SIZE} className="stage__layer stage__layer--frame" />
        <canvas ref={textCanvasRef} width={SIZE} height={SIZE} className="stage__layer stage__layer--frame" />
        {!(frameImg && photoImg) && (
          <div className="stage__empty">
            <span className="mono">// waiting for input</span>
            <p>Pick a frame and upload a photo to render the preview.</p>
          </div>
        )}
      </div>
      {photoImg && (
        <p className="stage__hint mono">
          drag the photo to reposition it{name ? '. Drag your name to move it too.' : '.'}
        </p>
      )}
    </div>
  );
}
