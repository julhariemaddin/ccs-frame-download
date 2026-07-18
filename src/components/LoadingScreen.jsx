export default function LoadingScreen() {
  return (
    <div className="loading">
      <div className="loading__mark">
        <span className="loading__bracket">{'{'}</span>
        <span className="loading__dot" />
        <span className="loading__bracket">{'}'}</span>
      </div>
      <p className="mono loading__text">compiling your frame generator</p>
      <div className="loading__bar">
        <div className="loading__bar-fill" />
      </div>
    </div>
  );
}
