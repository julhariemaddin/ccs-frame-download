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
  photoPreviewUrl,
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
    <div className="step">
      <div className="step-head">
        <h1>Your details</h1>
        <p>This prints on the frame exactly as you type it.</p>
      </div>

      <div className="details-grid">
        <div className="details-grid__form">
          <label className="field">
            <span className="field__label">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field__label">Program</span>
            {allowFreeTextProgram || programOptions.length === 0 ? (
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. BS Computer Science"
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
        </div>

        <div className="details-grid__photo">
          <span className="field__label">Photo</span>
          <div
            className={`dropzone ${hasPhoto ? 'has-photo' : ''}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('is-over');
            }}
            onDragLeave={(e) => e.currentTarget.classList.remove('is-over')}
            onDrop={handleDrop}
          >
            {hasPhoto && photoPreviewUrl ? (
              <img className="dropzone__preview" src={photoPreviewUrl} alt="Your selected photo" />
            ) : (
              <>
                <span className="dropzone__icon" aria-hidden="true">+</span>
                <span>Drop a photo, or tap to browse</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && onPhotoFile(e.target.files[0])}
            />
          </div>
          {hasPhoto && <p className="dropzone__hint">Tap the photo to replace it.</p>}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn--secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn btn--primary" disabled={!canProceed} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
