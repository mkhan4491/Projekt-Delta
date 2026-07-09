import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function Sidebar() {
  const { session, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `sidebar__link${isActive ? ' sidebar__link--active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-title">Cortex</div>
        <div className="sidebar__logo-subtitle">Executive Operations</div>
      </div>
      <nav className="sidebar__nav">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/rechnungen" className={linkClass}>Rechnungen</NavLink>
        <NavLink to="/kunden" className={linkClass}>Kunden</NavLink>
        <NavLink to="/einstellungen" className={linkClass}>Einstellungen</NavLink>
      </nav>
      <div className="sidebar__footer">
        <div className="sidebar__user" title={session?.user?.email}>
          {session?.user?.email}
        </div>
        <button className="btn btn--secondary btn--sm sidebar__logout" onClick={logout}>
          Abmelden
        </button>
      </div>
    </aside>
  );
}
