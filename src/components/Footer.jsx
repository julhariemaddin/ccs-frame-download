export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <p className="site-footer__line">
        Made by{' '}
        <a href="https://julhariemaddin.is-a.dev" target="_blank" rel="noopener noreferrer">
          Julharie Maddin-Gov
        </a>
      </p>
      <p className="site-footer__line site-footer__line--muted">
        © {year} CCS Officers. All rights reserved.
      </p>
    </footer>
  );
}
