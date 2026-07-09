import { useState } from 'react';
import { useAuth } from '../context/useAuth.js';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError('Anmeldung fehlgeschlagen. Bitte prüfe E-Mail und Passwort.');
    }
    // Bei Erfolg übernimmt onAuthStateChange — die App rendert automatisch um.
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card__logo">
          <div className="sidebar__logo-title">Cortex</div>
          <div className="sidebar__logo-subtitle">Executive Operations</div>
        </div>

        <div className="form-field">
          <label className="form-label">E-Mail</label>
          <input
            className="form-input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Passwort</label>
          <input
            className="form-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="login-card__error">{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
