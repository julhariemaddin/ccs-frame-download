export default function Welcome({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__card">
        <span className="welcome__mark" aria-hidden="true" />
        <p className="welcome__eyebrow">JRMSU · College of Computing Studies</p>
        <h1 className="welcome__title">Frame Lab</h1>
        <p className="welcome__lede">
          Pick a frame, add your name and program, drop in a photo, and walk away with a
          ready-to-print PNG — four short steps, no software to install.
        </p>

        <ul className="welcome__points">
          <li>Official CCS frame designs, updated every term</li>
          <li>Quick photo filters so your shot looks its best</li>
          <li>Share your finished frame straight from your phone</li>
        </ul>

        <button className="btn btn--primary btn--lg" onClick={onStart}>
          Get started
        </button>

        <p className="welcome__ack">
          Built by{' '}
          <a href="https://julhariemaddin.is-a.dev" target="_blank" rel="noopener noreferrer">
            Julharie Maddin-Gov
          </a>{' '}
          and the Frame Lab crew
        </p>
      </div>
    </div>
  );
}
