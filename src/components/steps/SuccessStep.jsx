import { useState } from 'react';

export default function SuccessStep({ outputDataUrl, fileName, onDownloadAgain, onCreateAnother }) {
  const [shareState, setShareState] = useState('idle'); // idle | sharing | unsupported
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  async function handleShare() {
    if (!outputDataUrl) return;
    setShareState('sharing');
    try {
      const res = await fetch(outputDataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName || 'frame.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My JRMSU CCS Frame',
          text: 'Made with the JRMSU CCS Frame Lab',
        });
        setShareState('idle');
      } else {
        setShareState('unsupported');
      }
    } catch {
      // user cancelled the share sheet, or the browser blocked it
      setShareState('idle');
    }
  }

  return (
    <div className="step step--success">
      <div className="success-layout">
        <div className="success-layout__preview">
          {outputDataUrl && <img src={outputDataUrl} alt="Your generated frame" />}
        </div>

        <div className="success-layout__panel">
          <h1>Your frame is ready</h1>
          <p>
            Saved as <span className="mono">{fileName}</span> — check your downloads folder.
          </p>

          <div className="step-actions step-actions--stacked">
            {canShare && (
              <button className="btn btn--primary btn--block" onClick={handleShare} disabled={shareState === 'sharing'}>
                Share your frame
              </button>
            )}
            <button className="btn btn--secondary btn--block" onClick={onDownloadAgain}>
              Download again
            </button>
            <button className="btn btn--ghost btn--block" onClick={onCreateAnother}>
              Create another
            </button>
          </div>

          {shareState === 'unsupported' && (
            <p className="success-layout__note">
              Sharing isn't supported on this browser — use "Download again" instead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
