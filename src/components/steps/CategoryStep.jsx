export default function CategoryStep({ categories, category, setCategory, onNext, error }) {
  const entries = Object.entries(categories);

  return (
    <div className="wizard-step">
      <h2 className="wizard-step__title">What's this frame for?</h2>
      <p className="wizard-step__hint">Choose a category to see the frames inside it.</p>

      {error && <div className="banner banner--error">{error}</div>}

      {entries.length === 0 ? (
        <p className="hint">No categories yet. Ask an admin to add one.</p>
      ) : (
        <div className="category-grid">
          {entries.map(([key, cfg]) => (
            <button
              key={key}
              className={`category-card ${category === key ? 'is-selected' : ''}`}
              onClick={() => setCategory(key)}
              type="button"
            >
              <span className="category-card__label">{cfg.label}</span>
              <span className="mono category-card__count">
                {cfg.frames.length} frame{cfg.frames.length === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="wizard-step__actions">
        <button className="btn btn--primary" disabled={!category} onClick={onNext}>
          Next: choose a frame
        </button>
      </div>
    </div>
  );
}
