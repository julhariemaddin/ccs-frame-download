export default function SuccessStep({ outputDataUrl, fileName, onDownloadAgain, onCreateAnother }) {
  return (
    <div className="success-step">
      <div className="success-step__thumb">
        {outputDataUrl && <img src={outputDataUrl} alt="Your generated frame" />}
      </div>
      <h2 className="wizard-step__title">Downloaded</h2>
      <p className="wizard-step__hint">
        Saved as <span className="mono">{fileName}</span>. Check your downloads folder.
      </p>
      <div className="wizard-step__actions wizard-step__actions--center">
        <button className="btn btn--primary" onClick={onCreateAnother}>
          Create another
        </button>
      </div>
    </div>
  );
}
