import Stage from '../Stage';
import { PHOTO_FILTERS } from '../../lib/filters';

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
  filter,
  setFilter,
  onBack,
  onDownload,
  error,
}) {
  return (
    <div className="step step--adjust">
      <div className="step-head">
        <h1>Fine-tune it</h1>
        <p>Drag the photo — and your name — directly on the preview.</p>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="adjust-layout">
        <div className="adjust-layout__stage">
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

        <div className="adjust-layout__controls">
          <div className="control-group">
            <span className="control-group__label">Filter</span>
            <div className="filter-row">
              {PHOTO_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-swatch filter-swatch--${f.id} ${filter === f.id ? 'is-selected' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-group__label">Position</span>
            <div className="sliders">
              <label className="slider">
                <span>Zoom</span>
                <input type="range" min="50" max="300" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
              </label>
              <label className="slider">
                <span>Rotate</span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="step-actions step-actions--stacked">
            <button className="btn btn--primary btn--block" onClick={onDownload}>
              Generate &amp; download
            </button>
            <button className="btn btn--secondary btn--block" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
