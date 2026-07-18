const BASE = import.meta.env.BASE_URL;

export default function FrameStep({ frames, selectedFrameId, onSelectFrame, onBack, onNext, categoryLabel }) {
  return (
    <div className="step">
      <div className="step-head">
        <h1>Pick a frame</h1>
        <p>Frames available in {categoryLabel || 'this category'}.</p>
      </div>

      {frames.length === 0 ? (
        <p className="hint">No frames in this category yet.</p>
      ) : (
        <div className="frame-grid">
          {frames.map((f) => (
            <button
              key={f.id}
              className={`frame-card ${selectedFrameId === f.id ? 'is-selected' : ''}`}
              onClick={() => onSelectFrame(f)}
              type="button"
            >
              <img src={f.isCustom ? f.file : `${BASE}${f.folder}/${f.file}`} alt={f.label} />
              <span className="frame-card__label">{f.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="step-actions">
        <button className="btn btn--secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn btn--primary" disabled={!selectedFrameId} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
