export default function Welcome({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__card">
        <p className="mono welcome__eyebrow">jrmsu · frame lab</p>
        <h1 className="welcome__title">Frame Generator</h1>
        <p className="welcome__lede">
          Pick a frame, add your name and program, drop in a photo, and walk away with a
          ready-to-print PNG. Four short steps, no software to install.
        </p>

        <div className="welcome__ack">
          <span className="mono welcome__ack-label">made by</span>
          <a href="https://julhariemaddin.is-a.dev" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'gray' , fontWeight: 'bold'}}>
            Julharie Maddin-Gov
          </a>
          <p>and the Frame Lab crew</p>
        </div>

        <button className="btn btn--primary btn--lg" onClick={onStart}>
          Begin
        </button>
      </div>
    </div>
  );
}
