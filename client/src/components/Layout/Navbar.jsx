import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isRoom = location.pathname.startsWith('/room/') && !location.pathname.includes('create');

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" id="logo-link">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13.325 3.05L8.667 20.432a1 1 0 01-1.94-.485L11.385 2.565a1 1 0 011.94.485z" fill="url(#g1)"/>
              <path d="M7.612 14.776l-3.36-3.36a1 1 0 010-1.415l3.36-3.36a1 1 0 111.414 1.415L6.368 10.71a.5.5 0 000 .707l2.658 2.658a1 1 0 01-1.414 1.414z" fill="url(#g2)"/>
              <path d="M16.388 14.776l3.36-3.36a1 1 0 000-1.415l-3.36-3.36a1 1 0 10-1.414 1.415l2.658 2.654a.5.5 0 010 .707l-2.658 2.658a1 1 0 001.414 1.414z" fill="url(#g3)"/>
              <defs>
                <linearGradient id="g1" x1="10" y1="2" x2="10" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B5CF6"/>
                  <stop offset="1" stopColor="#06B6D4"/>
                </linearGradient>
                <linearGradient id="g2" x1="4" y1="6" x2="10" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B5CF6"/>
                  <stop offset="1" stopColor="#6C3FE2"/>
                </linearGradient>
                <linearGradient id="g3" x1="14" y1="6" x2="20" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06B6D4"/>
                  <stop offset="1" stopColor="#22D3EE"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">
            Code<span className="logo-accent">Sync</span>
          </span>
        </Link>

        {!isRoom && (
          <div className="navbar-actions">
            <Link to="/room/create" className="btn btn-primary btn-sm" id="create-room-btn">
              + Create Room
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
