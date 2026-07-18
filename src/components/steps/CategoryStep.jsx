export default function CategoryStep({ categories, category, setCategory, onNext, error }) {
  const entries = Object.entries(categories);

  return (
    <div className="step">
      <div className="step-head">
        <h1>What's this frame for?</h1>
        <p>Choose a category to see the frames inside it.</p>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {entries.length === 0 ? (
        <p className="hint">No categories yet — ask a CCS officer to add one.</p>
      ) : (
        <div className="tile-grid">
          {entries.map(([key, cfg]) => (
            <button
              key={key}
              className={`tile ${category === key ? 'is-selected' : ''}`}
              onClick={() => setCategory(key)}
              type="button"
            >
              <span className="tile__label">{cfg.label}</span>
              <span className="tile__count">
                {cfg.frames.length} frame{cfg.frames.length === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="step-actions">
        <button className="btn btn--primary" disabled={!category} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
