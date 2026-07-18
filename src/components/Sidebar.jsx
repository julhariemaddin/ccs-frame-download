import { useRef } from 'react';

export default function Sidebar({
  categories,
  category,
  setCategory,
  frames,
  selectedFrameId,
  onSelectFrame,
  programOptions,
  allowFreeTextProgram,
  name,
  setName,
  program,
  setProgram,
  onPhotoFile,
  hasPhoto,
  zoom,
  setZoom,
  rotation,
  setRotation,
  onDownload,
  onReset,
  canDownload,
  error,
}) {
  const fileInputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('is-over');
    if (e.dataTransfer.files[0]) onPhotoFile(e.dataTransfer.files[0]);
  }

  return (
    <aside className="panel">
      <div className="panel__scroll">
        {error && <div className="banner banner--error">{error}</div>}

        <SectionLabel>Category</SectionLabel>
        <div className="tabbar">
          {Object.entries(categories).map(([key, cfg]) => (
            <button
              key={key}
              className={`tab ${category === key ? 'is-active' : ''}`}
              onClick={() => setCategory(key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <SectionLabel>Frame</SectionLabel>
        {frames.length === 0 ? (
          <p className="hint">No frames in this category yet.</p>
        ) : (
          <div className="gallery">
            {frames.map((f) => (
              <button
                key={f.id}
                className={`gallery__item ${selectedFrameId === f.id ? 'is-selected' : ''}`}
                onClick={() => onSelectFrame(f)}
                type="button"
              >
                <img src={`${import.meta.env.BASE_URL}${f.folder}/${f.file}`} alt={f.label} />
                <span className="gallery__label mono">{f.label}</span>
              </button>
            ))}
          </div>
        )}

        <SectionLabel>Details</SectionLabel>
        <label className="field">
          <span className="field__label mono">name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name as it should print"
          />
        </label>
        <label className="field">
          <span className="field__label mono">program</span>
          {allowFreeTextProgram || programOptions.length === 0 ? (
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="Type your program / section"
            />
          ) : (
            <select value={program} onChange={(e) => setProgram(e.target.value)}>
              <option value="">Select your program</option>
              {programOptions.map((p) => (
                <option key={p.full} value={p.full}>
                  {p.code === p.full ? p.full : `${p.full} (${p.code})`}
                </option>
              ))}
            </select>
          )}
        </label>

        <SectionLabel>Photo</SectionLabel>
        <div
          className="dropzone"
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('is-over');
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove('is-over')}
          onDrop={handleDrop}
        >
          <span className="mono">{hasPhoto ? 'replace photo' : 'drop a photo, or tap to browse'}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && onPhotoFile(e.target.files[0])}
          />
        </div>

        {hasPhoto && (
          <div className="sliders">
            <label className="slider">
              <span className="mono">zoom</span>
              <input
                type="range"
                min="50"
                max="300"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
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
        )}

        <div className="panel__actions">
          <button className="btn btn--primary" disabled={!canDownload} onClick={onDownload}>
            Generate &amp; download
          </button>
          <button className="btn btn--ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="section-label">
      <span>{children}</span>
    </div>
  );
}
