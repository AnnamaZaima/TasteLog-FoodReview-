// client/src/components/Navigation.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  // For now, we'll disable notifications to avoid context issues
  // TODO: Re-enable once context provider order is fixed
  const notifications = [];
  const unreadCount = 0;
  const markAsRead = () => {};
  const markAllAsRead = () => {};
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'review': return '⭐';
      default: return '🔔';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">🍽️</div>
          <span className="logo-text">TasteLog</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-only">
          <Link 
            to="/" 
            className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
          >
            <span className="link-icon">🏠</span>
            Home
          </Link>
          <Link 
            to="/restaurants" 
            className={`nav-link ${isActivePath('/restaurants') ? 'active' : ''}`}
          >
            <span className="link-icon">🍽️</span>
            Restaurants
          </Link>
          <Link 
            to="/create-review" 
            className={`nav-link ${isActivePath('/create-review') ? 'active' : ''}`}
          >
            <span className="link-icon">✍️</span>
            Write Review
          </Link>
          <Link 
            to="/complaints" 
            className={`nav-link ${isActivePath('/complaints') ? 'active' : ''}`}
          >
            <span className="link-icon">📝</span>
            Complain
          </Link>
        </div>

        {/* Right Section */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="notification-container" ref={notificationRef}>
                <button
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="View notifications"
                >
                  <span className="notification-icon">🔔</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read"
                          onClick={markAllAsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 6).map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            <div className="notification-avatar">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                              <p className="notification-title">{notification.title}</p>
                              <p className="notification-message">{notification.message}</p>
                              <span className="notification-time">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            {!notification.read && <div className="unread-dot"></div>}
                          </div>
                        ))
                      ) : (
                        <div className="no-notifications">
                          <span>🔔</span>
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 6 && (
                      <div className="notification-footer">
                        <button className="view-all-btn">View all notifications</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu-container" ref={userMenuRef}>
                <button
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="user-name desktop-only">{user?.name || user?.fullName || user?.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="avatar-placeholder-large">
                            {user?.name?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <p className="user-display-name">{user?.name || user?.fullName || user?.username || 'User'}</p>
                        <p className="user-email">{user?.email}</p>
                        <span className={`user-role ${user?.role || 'user'}`}>
                          {user?.role === 'admin' || user?.role === 'superadmin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="menu-divider"></div>
                    
                    <div className="menu-items">
                      <Link 
                        to="/profile" 
                        className="menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="menu-icon">👤</span>
                        Profile
                      </Link>
                      
                      <Link 
                        to="/create-review" 
                        className="menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="menu-icon">✍️</span>
                        Write Review
                      </Link>
                      
                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <Link 
                          to="/admin" 
                          className="menu-item admin-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="menu-icon">⚙️</span>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    
                    <div className="menu-divider"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="menu-item logout-item"
                    >
                      <span className="menu-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-register">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn mobile-only"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${showMobileMenu ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <Link 
              to="/" 
              className={`mobile-link ${isActivePath('/') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="link-icon">🏠</span>
              Home
            </Link>
            <Link 
              to="/restaurants" 
              className={`mobile-link ${isActivePath('/restaurants') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="link-icon">🍽️</span>
              Restaurants
            </Link>
            <Link 
              to="/create-review" 
              className={`mobile-link ${isActivePath('/create-review') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="link-icon">✍️</span>
              Write Review
            </Link>
            <Link 
              to="/complaints" 
              className={`mobile-link ${isActivePath('/complaints') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="link-icon">📝</span>
              Feedback
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
