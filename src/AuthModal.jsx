import { useState } from 'react';

export default function AuthModal({ onLogin, onClose, apiBase }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      onLogin(data.user, data.token);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-tabs">
          <button
            className={`modal-tab${mode === 'login' ? ' modal-tab-active' : ''}`}
            type="button"
            onClick={() => switchMode('login')}
          >
            Log in
          </button>
          <button
            className={`modal-tab${mode === 'register' ? ' modal-tab-active' : ''}`}
            type="button"
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Email
            <input
              className="modal-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </label>
          <label className="modal-label">
            Password
            {mode === 'register' && <span className="modal-hint"> (min 8 characters)</span>}
            <input
              className="modal-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          {error && (
            <p className="modal-error" role="alert">
              {error}
            </p>
          )}
          <button className="modal-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
