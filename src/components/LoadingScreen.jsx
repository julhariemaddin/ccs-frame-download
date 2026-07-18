export default function LoadingScreen() {
  return (
    <div className="loading">
      <div className="loading__mark" />
      <p className="mono loading__text">Loading the CCS Frame Lab…</p>
      <div className="loading__bar">
        <div className="loading__bar-fill" />
      </div>
    </div>
  );
}
