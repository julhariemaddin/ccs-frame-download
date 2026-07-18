import StepProgress from './StepProgress';

export default function Rail({ step, showSteps, academicYear }) {
  return (
    <aside className="rail">
      <div className="rail__brand">
        <span className="rail__mark" aria-hidden="true" />
        <div className="rail__brand-text">
          <p className="rail__uni">JRMSU</p>
          <p className="rail__dept">College of Computing Studies</p>
        </div>
      </div>

      <div className="rail__product">
        <span className="rail__product-name">Frame Lab</span>
        <span className="mono rail__ay">{academicYear}</span>
      </div>

      {showSteps && (
        <nav className="rail__nav" aria-label="Progress">
          <StepProgress step={step} />
        </nav>
      )}

      <div className="rail__spacer" />

      <div className="rail__footer">
        <p className="rail__footer-line">
          Built by{' '}
          <a href="https://julhariemaddin.is-a.dev" target="_blank" rel="noopener noreferrer">
            Julharie Maddin-Gov
          </a>
        </p>
        <p className="rail__footer-line rail__footer-line--muted">and the Frame Lab crew</p>
      </div>
    </aside>
  );
}
