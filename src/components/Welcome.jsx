import Footer from './Footer';

const BASE = import.meta.env.BASE_URL;

export default function Welcome({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__card">
        <div className="welcome__logos">
          <img src={`${BASE}jrmsu-logo.png`} alt="JRMSU seal" />
          <img src={`${BASE}ccs-logo.png`} alt="College of Computing Studies logo" />
        </div>
        <p className="welcome__eyebrow">
  JRMSU · College of Computing Studies
</p>

<h1 className="welcome__title">
  Frame Lab
</h1>

<p className="welcome__lede">
  Designed and developed by CCS students, Frame Lab lets you personalize your
  official CCS profile frame in minutes. Add your name and program, upload your
  photo, and download a high-quality PNG no third-party apps, no complicated
  steps, just a tool built by CCS, for the CCS community.
</p>

<ul className="welcome__points">
  <li>Official College of Computing Studies frame designs</li>
  <li>Fully customizable with your name, program, and photo</li>
  <li>Instant high-quality PNG download, ready to share</li>
</ul>

<button className="btn btn--primary btn--lg" onClick={onStart}>
  Create My Frame
</button>
      </div>

      <Footer />
    </div>
  );
}
