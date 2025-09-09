// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint
} from '../services/adminService';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const toast = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, usersData, reviewsData, complaintsData] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAllReviews(),
        getAllComplaints()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setReviews(reviewsData);
      setComplaints(complaintsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleReviewStatusUpdate = async (reviewId, status) => {
    try {
      await updateReviewStatus(reviewId, status);
      setReviews(reviews.map(r => 
        r._id === reviewId ? { ...r, status } : r
      ));
      toast.success('Review status updated successfully');
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleComplaintStatusUpdate = async (complaintId, status) => {
    try {
      await updateComplaintStatus(complaintId, status);
      setComplaints(complaints.map(c => 
        c._id === complaintId ? { ...c, status } : c
      ));
      toast.success('Complaint status updated successfully');
    } catch (error) {
      toast.error('Failed to update complaint status');
    }
  };

  const handleComplaintDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteComplaint(complaintId);
      setComplaints(complaints.filter(c => c._id !== complaintId));
      toast.success('Complaint deleted successfully');
    } catch (error) {
      toast.error('Failed to delete complaint');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <p>Welcome back, {user?.fullName || user?.username}!</p>
      </div>

      <div className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👥</span>
          Users ({users.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <span className="tab-icon">⭐</span>
          Reviews ({reviews.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          <span className="tab-icon">⚠️</span>
          Complaints ({complaints.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} />
        )}
        
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            onRoleUpdate={handleUserRoleUpdate}
            onStatusToggle={handleUserStatusToggle}
            onDelete={handleUserDelete}
          />
        )}
        
        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={reviews}
            onStatusUpdate={handleReviewStatusUpdate}
            onDelete={handleReviewDelete}
          />
        )}
        
        {activeTab === 'complaints' && (
          <ComplaintsTab
            complaints={complaints}
            onStatusUpdate={handleComplaintStatusUpdate}
            onDelete={handleComplaintDelete}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats }) {
  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats?.totalUsers || 0}</p>
            <span className="stat-detail">
              {stats?.activeUsers || 0} active
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Total Reviews</h3>
            <p className="stat-number">{stats?.totalReviews || 0}</p>
            <span className="stat-detail">
              {stats?.pendingReviews || 0} pending
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Restaurants</h3>
            <p className="stat-number">{stats?.totalRestaurants || 0}</p>
            <span className="stat-detail">
              Reviewed locations
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Complaints</h3>
            <p className="stat-number">{stats?.totalComplaints || 0}</p>
            <span className="stat-detail">
              {stats?.pendingComplaints || 0} pending
            </span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-time">
                {new Date(activity.createdAt).toLocaleDateString()}
              </span>
              <span className="activity-text">{activity.description}</span>
            </div>
          )) || <p>No recent activity</p>}
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ users, onRoleUpdate, onStatusToggle, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && user.isActive;
    if (filter === 'inactive') return matchesSearch && !user.isActive;
    return matchesSearch && user.role === filter;
  });

  return (
    <div className="users-tab">
      <div className="tab-controls">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="user">Regular Users</option>
          <option value="admin">Admins</option>
          <option value="superadmin">Super Admins</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <strong>{user.fullName || user.username}</strong>
                    <span>@{user.username}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => onRoleUpdate(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.reviewCount || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onStatusToggle(user._id, user.isActive)}
                      className={`action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? '🚫' : '✅'}
                    </button>
                    <button
                      onClick={() => onDelete(user._id)}
                      className="action-btn delete"
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ reviews, onStatusUpdate, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.restaurant.toLowerCase().includes(search.toLowerCase()) ||
                         review.reviewText.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && review.status === filter;
  });

  return (
    <div className="reviews-tab">
      <div className="tab-controls">
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="reviews-grid">
        {filteredReviews.map(review => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <h4>{review.restaurant}</h4>
              <div className="review-rating">
                {'⭐'.repeat(review.rating)}
              </div>
            </div>
            
            <p className="review-text">{review.reviewText}</p>
            
            <div className="review-meta">
              <span>By: {review.author?.username || 'Anonymous'}</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="review-status">
              <select
                value={review.status || 'approved'}
                onChange={(e) => onStatusUpdate(review._id, e.target.value)}
                className="status-select"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <button
                onClick={() => onDelete(review._id)}
                className="action-btn delete"
                title="Delete Review"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Complaints Tab Component
function ComplaintsTab({ complaints, onStatusUpdate, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(search.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && complaint.status === filter;
  });

  return (
    <div className="complaints-tab">
      <div className="tab-controls">
        <input
          type="text"
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Complaints</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="complaints-list">
        {filteredComplaints.map(complaint => (
          <div key={complaint._id} className="complaint-card">
            <div className="complaint-header">
              <h4>{complaint.title}</h4>
              <span className={`priority-badge ${complaint.priority}`}>
                {complaint.priority}
              </span>
            </div>
            
            <p className="complaint-description">{complaint.description}</p>
            
            <div className="complaint-meta">
              <span>By: {complaint.author?.username || 'Anonymous'}</span>
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              <span>Type: {complaint.type}</span>
            </div>
            
            <div className="complaint-actions">
              <select
                value={complaint.status}
                onChange={(e) => onStatusUpdate(complaint._id, e.target.value)}
                className="status-select"
              >
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
              
              <button
                onClick={() => onDelete(complaint._id)}
                className="action-btn delete"
                title="Delete Complaint"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
