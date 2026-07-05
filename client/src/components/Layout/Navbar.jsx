import { Link, useLocation } from 'react-router-dom';
import useRoomStore from '../../store/roomStore';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { username } = useRoomStore();
  const isRoom = location.pathname.startsWith('/room/') && !location.pathname.includes('create');
  const isHome = location.pathname === '/';

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-logo" id="logo-link">
          {/* <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13.325 3.05L8.667 20.432a1 1 0 01-1.94-.485L11.385 2.565a1 1 0 011.94.485z" fill="url(#ng1)"/>
              <path d="M7.612 14.776l-3.36-3.36a1 1 0 010-1.415l3.36-3.36a1 1 0 111.414 1.415L6.368 10.71a.5.5 0 000 .707l2.658 2.658a1 1 0 01-1.414 1.414z" fill="url(#ng2)"/>
              <path d="M16.388 14.776l3.36-3.36a1 1 0 000-1.415l-3.36-3.36a1 1 0 10-1.414 1.415l2.658 2.654a.5.5 0 010 .707l-2.658 2.658a1 1 0 001.414 1.414z" fill="url(#ng3)"/>
              <defs>
                <linearGradient id="ng1" x1="10" y1="2" x2="10" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4edea3"/>
                  <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
                <linearGradient id="ng2" x1="4" y1="6" x2="10" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4edea3"/>
                  <stop offset="1" stopColor="#2dd4bf"/>
                </linearGradient>
                <linearGradient id="ng3" x1="14" y1="6" x2="20" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6"/>
                  <stop offset="1" stopColor="#60a5fa"/>
                </linearGradient>
              </defs>
            </svg>
          </div> */}
          <span className="logo-text">
            Code<span className="logo-accent">Collab</span>
          </span>
        </Link>

        {/* Nav Links (non-room pages) */}
        {!isRoom && (
          <div className="navbar-links">
            <Link
              to="/"
              className={`nav-link ${isHome ? 'active' : ''}`}
              id="nav-rooms"
            >
              Rooms
            </Link>
            <span className="nav-link" id="nav-community">Community</span>
          </div>
        )}

        {/* Spacer */}
        <div className="navbar-spacer" />

        {/* Right side */}
        {!isRoom && (
          <>
            {/* Search */}
            <div className="navbar-search" id="navbar-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search rooms..."
                className="navbar-search-input"
                id="navbar-search-input"
              />
            </div>

            {/* Icon buttons */}
            <button className="btn-icon" id="navbar-notifications" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            {/* <button className="btn-icon" id="navbar-settings" title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button> */}
          </>
        )}

        {/* User Avatar */}
        <div className="navbar-avatar" id="navbar-avatar" title={username || 'User'}>
          {initials}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
