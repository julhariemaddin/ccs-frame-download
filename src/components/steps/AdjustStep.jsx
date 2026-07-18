import Stage from '../Stage';

export default function AdjustStep({
  frameImg,
  geometry,
  photoImg,
  photoState,
  setPhotoState,
  textState,
  setTextState,
  name,
  program,
  layout,
  zoom,
  setZoom,
  rotation,
  setRotation,
  onBack,
  onDownload,
  error,
}) {
  return (
    <div className="adjust-step">
      <div className="adjust-step__stage">
        <Stage
          frameImg={frameImg}
          geometry={geometry}
          photoImg={photoImg}
          photoState={photoState}
          setPhotoState={setPhotoState}
          textState={textState}
          setTextState={setTextState}
          name={name}
          program={program}
          layout={layout}
        />
      </div>

      <div className="adjust-step__controls">
        <h2 className="wizard-step__title">Fine-tune it</h2>
        <p className="wizard-step__hint">Drag the photo (and your name) directly on the preview.</p>

        {error && <div className="banner banner--error">{error}</div>}

        <div className="sliders">
          <label className="slider">
            <span className="mono">zoom</span>
            <input type="range" min="50" max="300" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          </label>
          <label className="slider">
            <span className="mono">rotate</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="wizard-step__actions">
          <button className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
          <button className="btn btn--primary" onClick={onDownload}>
            Generate &amp; download
          </button>
        </div>
      </div>
    </div>
  );
}
