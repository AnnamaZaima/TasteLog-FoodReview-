// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { updateProfile, changePassword } from '../services/authService';
import '../styles/Profile.css';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    fullName: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const { user, updateUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await updateProfile(profileData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-text">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="profile-info">
          <h1>{user?.fullName || user?.username}</h1>
          <p>@{user?.username}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-badge role-badge">{user?.role || 'user'}</span>
              <span className="stat-label">Role</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-nav">
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            Profile Settings
          </button>
          <button
            className={`nav-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span className="tab-icon">🔒</span>
            Change Password
          </button>
          <button
            className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="tab-icon">📊</span>
            Account Activity
          </button>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <p>Update your account's profile information and email address.</p>

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    placeholder="Choose a username"
                    autoComplete="username"
                    pattern="[a-zA-Z0-9_]+"
                    title="Username can only contain letters, numbers, and underscores"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="profile-button"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="profile-section">
              <h2>Change Password</h2>
              <p>Ensure your account is using a long, random password to stay secure.</p>

              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-input">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(!showPasswords)}
                      aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                    >
                      {showPasswords ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    minLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="profile-button"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="profile-section">
              <h2>Account Activity</h2>
              <p>Overview of your account activity and statistics.</p>

              <div className="activity-grid">
                <div className="activity-card">
                  <h3>Account Details</h3>
                  <div className="activity-details">
                    <div className="detail-row">
                      <span>Member since:</span>
                      <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Last login:</span>
                      <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Account status:</span>
                      <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                        {user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="activity-card">
                  <h3>Review Statistics</h3>
                  <div className="activity-details">
                    <div className="detail-row">
                      <span>Average rating:</span>
                      <span>{user?.averageRating ? user.averageRating.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="activity-card">
                  <h3>Account Security</h3>
                  <div className="activity-details">
                    <div className="detail-row">
                      <span>Two-factor auth:</span>
                      <span className="status-badge inactive">Disabled</span>
                    </div>
                    <div className="detail-row">
                      <span>Password strength:</span>
                      <span>●●●●●</span>
                    </div>
                    <div className="detail-row">
                      <span>Login sessions:</span>
                      <span>1 active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="security-notice">
                <h4>🔒 Security Tips</h4>
                <ul>
                  <li>Use a strong, unique password for your account</li>
                  <li>Log out when using shared or public computers</li>
                  <li>Keep your email address up to date for security notifications</li>
                  <li>Review your account activity regularly</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
