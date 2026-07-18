import Footer from './Footer';

const BASE = import.meta.env.BASE_URL;

export default function Welcome({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__card">
        <div className="welcome__logos">
          <img src={`${BASE}branding/jrmsu-logo.png`} alt="JRMSU seal" />
          <img src={`${BASE}branding/ccs-logo.png`} alt="College of Computer Studies logo" />
        </div>
        <p className="welcome__eyebrow">JRMSU · College of Computer Studies</p>
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
      </div>

      <Footer />
    </div>
  );
}
