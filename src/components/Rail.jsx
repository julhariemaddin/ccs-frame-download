import StepProgress from './StepProgress';

const BASE = import.meta.env.BASE_URL;

export default function Rail({ step, showSteps, academicYear }) {
  return (
    <aside className="rail">
      <div className="rail__brand">
        <img className="rail__logo" src={`${BASE}jrmsu-logo.png`} alt="JRMSU seal" />
        <p className="rail__wordmark">JRMSU-CCS</p>
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
