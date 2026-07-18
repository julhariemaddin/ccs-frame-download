import { useState } from 'react';
import { login } from '../lib/adminStore';

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (login(username, password)) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect username or password.');
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <p className="mono admin-login__eyebrow">jrmsu · ccs</p>
        <h1 className="admin-login__title">Admin sign in</h1>
        <p className="admin-login__subtitle">CCS Officer access only.</p>

        {error && <div className="banner banner--error">{error}</div>}

        <label className="field">
          <span className="field__label mono">username</span>
          <input
            type="text"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="field">
          <span className="field__label mono">password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="btn btn--primary admin-login__submit">
          Sign in
        </button>
        <a className="admin-login__back mono" href="#/">
          ← back to generator
        </a>
      </form>
    </div>
  );
}
