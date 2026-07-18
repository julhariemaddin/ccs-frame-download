import { useRef } from 'react';

export default function DetailsStep({
  name,
  setName,
  program,
  setProgram,
  programOptions,
  allowFreeTextProgram,
  onPhotoFile,
  hasPhoto,
  onBack,
  onNext,
}) {
  const fileInputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('is-over');
    if (e.dataTransfer.files[0]) onPhotoFile(e.dataTransfer.files[0]);
  }

  const canProceed = name.trim() && program.trim() && hasPhoto;

  return (
    <div className="wizard-step">
      <h2 className="wizard-step__title">Your details</h2>
      <p className="wizard-step__hint">This prints on the frame exactly as you type it.</p>

      <label className="field">
        <span className="field__label mono">name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name as it should print"
          autoFocus
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

      <span className="field__label mono">photo</span>
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
        <span className="mono">{hasPhoto ? '✓ photo added — tap to replace' : 'drop a photo, or tap to browse'}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && onPhotoFile(e.target.files[0])}
        />
      </div>

      <div className="wizard-step__actions">
        <button className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button className="btn btn--primary" disabled={!canProceed} onClick={onNext}>
          Next: adjust &amp; download
        </button>
      </div>
    </div>
  );
}
