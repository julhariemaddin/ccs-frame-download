const BASE = import.meta.env.BASE_URL;

export default function FrameStep({ frames, selectedFrameId, onSelectFrame, onBack, onNext, categoryLabel }) {
  return (
    <div className="wizard-step">
      <h2 className="wizard-step__title">Pick a frame</h2>
      <p className="wizard-step__hint">Frames in {categoryLabel || 'this category'}.</p>

      {frames.length === 0 ? (
        <p className="hint">No frames in this category yet.</p>
      ) : (
        <div className="gallery gallery--lg">
          {frames.map((f) => (
            <button
              key={f.id}
              className={`gallery__item ${selectedFrameId === f.id ? 'is-selected' : ''}`}
              onClick={() => onSelectFrame(f)}
              type="button"
            >
              <img src={f.isCustom ? f.file : `${BASE}${f.folder}/${f.file}`} alt={f.label} />
              <span className="gallery__label mono">{f.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="wizard-step__actions">
        <button className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button className="btn btn--primary" disabled={!selectedFrameId} onClick={onNext}>
          Next: your details
        </button>
      </div>
    </div>
  );
}
