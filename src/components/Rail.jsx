import StepProgress from './StepProgress';

const BASE = import.meta.env.BASE_URL;

export default function Rail({ step, showSteps, academicYear }) {
  return (
    <aside className="rail">
      <div className="rail__brand">
        <img className="rail__logo" src={`${BASE}branding/jrmsu-logo.png`} alt="JRMSU seal" />
        <img className="rail__logo" src={`${BASE}branding/ccs-logo.png`} alt="College of Computer Studies logo" />
        <div className="rail__brand-text">
          <p className="rail__uni">JRMSU</p>
          <p className="rail__dept">College of Computer Studies</p>
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
    </aside>
  );
}
