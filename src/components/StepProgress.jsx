const STEPS = [
  { key: 'category', n: '01', label: 'Category' },
  { key: 'frame', n: '02', label: 'Frame' },
  { key: 'details', n: '03', label: 'Details' },
  { key: 'adjust', n: '04', label: 'Adjust & download' },
];

export default function StepProgress({ step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === step);
  return (
    <ol className="step-progress">
      {STEPS.map((s, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming';
        return (
          <li key={s.key} className={`step-progress__item is-${state}`}>
            <span className="mono step-progress__n">{s.n}</span>
            <span className="step-progress__label">{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
