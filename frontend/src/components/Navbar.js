import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getToken, getUser, removeToken } from '../utils/auth';
import API from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  const handleLogout = () => {
    sessionStorage.removeItem('welcomeToastShown');
    removeToken();
    navigate('/login');
  };

  const isStoreOwner = user?.role === 'STORE_OWNER';
  const isServiceProvider = user?.role === 'SERVICE_PROVIDER';
  const isAdmin = user?.role === 'ADMIN';
  const [notifCounts, setNotifCounts] = React.useState({ enquiries: 0, bookings: 0 });

  React.useEffect(() => {
    if (!token) return;
    const fetchCounts = async () => {
      try {
        const res = await API.get('/notifications/counts');
        setNotifCounts(res.data);
      } catch (err) { console.error('Notif error', err); }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [token]);

  // Mark notifications as seen and clear the local count
  const handleMarkSeen = React.useCallback(async () => {
    try {
      await API.post('/notifications/seen');
      setNotifCounts({ enquiries: 0, bookings: 0 });
    } catch (err) { console.error('Mark seen error', err); }
  }, []);

  const totalNotifs = notifCounts.enquiries + notifCounts.bookings;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🐾</span>
            <span className="logo-text">PawConnect</span>
          </Link>

          <ul className="nav-menu">
            {/* All users see the public links, unless on their dedicated dashboard */}
            {!(isServiceProvider && location.pathname.startsWith('/service-dashboard')) &&
             !(isStoreOwner && location.pathname.startsWith('/store-dashboard')) &&
             !(isAdmin && location.pathname.startsWith('/admin')) && (
               <>
                <li className="nav-item">
                  <NavLink to="/" className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}>Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/pets" className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}>Browse Pets</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/services" className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}>Services</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/stores" className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}>Stores</NavLink>
                </li>
               </>
             )}

            {/* Extra links for Roles */}
            {isStoreOwner && (
              <li className="nav-item">
                <NavLink
                  to="/store-dashboard"
                  onClick={handleMarkSeen}
                  className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
                  style={{ color: 'var(--accent)', fontWeight: '700', position: 'relative' }}
                >
                  🏪 Dashboard
                  {notifCounts.enquiries > 0 && <span className="nav-badge">{notifCounts.enquiries}</span>}
                </NavLink>
              </li>
            )}

            {isServiceProvider && (
              <li className="nav-item">
                <NavLink
                  to="/service-dashboard"
                  onClick={handleMarkSeen}
                  className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
                  style={{ color: 'var(--accent)', fontWeight: '700', position: 'relative' }}
                >
                  🏥 Service Center
                  {notifCounts.bookings > 0 && <span className="nav-badge">{notifCounts.bookings}</span>}
                </NavLink>
              </li>
            )}

            {/* Extra link for Admin */}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`} style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                  🛡️ Admin Panel
                </NavLink>
              </li>
            )}
            {/* Link for normal users: My Profile */}
            {!isStoreOwner && !isServiceProvider && !isAdmin && token && (
              <li className="nav-item">
                <NavLink
                  to="/profile"
                  onClick={handleMarkSeen}
                  className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
                  style={{ position: 'relative' }}
                >
                  👤 My Profile
                  {totalNotifs > 0 && <span className="nav-badge">{totalNotifs}</span>}
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        <div className="nav-auth">
          {token && user ? (
            <>
              <div className="nav-user-info">
                <span>👤</span>
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary nav-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-links">Login</Link>
              <Link to="/register" className="btn btn-primary nav-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
