// client/src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { getFoodReviewById, toggleLike } from '../services/foodReviewService';
import Comments from '../components/Comments';
import '../styles/PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFoodReviewById(id);
      if (data) {
        setPost(data);
        // API stores both a numeric 'likes' count and an array 'likedBy'.
        // Use whichever is available; check membership against likedBy.
        const likesCount = typeof data.likes === 'number' ? data.likes : (Array.isArray(data.likedBy) ? data.likedBy.length : 0);
        setLikeCount(likesCount);
        setIsLiked(Array.isArray(data.likedBy) ? data.likedBy.includes(user?._id) : false);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Please login to like posts', 'warning');
      return;
    }

    try {
      const res = await toggleLike(id);
      // Backend returns { liked, likesCount, disliked, dislikesCount }
      if (res) {
        if (typeof res.liked === 'boolean') setIsLiked(res.liked);
        if (typeof res.likesCount === 'number') setLikeCount(res.likesCount);
        showToast(res.liked ? 'Post liked!' : 'Like removed', 'success');
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      showToast('Failed to update like', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <div className="error-state">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Go Back
            </button>
            <Link to="/" className="btn-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container">
        <div className="error-state">
          <h2>Post not found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Go Back
            </button>
            <Link to="/" className="btn-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="separator">›</span>
        <Link to="/restaurants">Restaurants</Link>
        <span className="separator">›</span>
        <span className="current">{post.restaurantName}</span>
      </nav>

      <div className="post-detail-grid">
        <main className="post-main-content">
          <header className="post-header">
            <div className="post-meta">
              <div className="author-info">
                <div className="author-avatar">
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt={post.user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {post.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="author-details">
                  <h3 className="author-name">{post.user?.name || 'Anonymous'}</h3>
                  <p className="post-date">{formatDate(post.createdAt || post.date)}</p>
                </div>
              </div>
              
              <div className="post-actions">
                <button 
                  className={`like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                >
                  <span className="like-icon">❤️</span>
                  <span className="like-count">{likeCount}</span>
                </button>
                
                <button className="share-btn" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard!', 'success');
                }}>
                  <span className="share-icon">🔗</span>
                  Share
                </button>
                
                <button className="complain-btn" onClick={() => {
                  const complaintData = {
                    restaurantName: post.restaurantName,
                    title: `Complaint about ${post.restaurantName}`,
                    description: `Please describe your complaint about this review...`,
                    postId: post._id
                  };
                  localStorage.setItem('complaintDraft', JSON.stringify(complaintData));
                  navigate('/create-complaint');
                }}>
                  <span className="complain-icon">⚠️</span>
                  Complain
                </button>
              </div>
            </div>
          </header>

          <div className="restaurant-card">
            <div className="restaurant-header">
              <h1 className="restaurant-name">{post.restaurantName}</h1>
              <div className="rating-display">
                <div className="stars">
                  {renderStars(post.rating)}
                </div>
                <span className="rating-number">{post.rating}/5</span>
              </div>
            </div>
            
            <div className="restaurant-details">
              <div className="detail-item">
                <span className="label">Cuisine:</span>
                <span className="value">{post.cuisine}</span>
              </div>
              <div className="detail-item">
                <span className="label">Area:</span>
                <span className="value">{post.area}</span>
              </div>
              <div className="detail-item">
                <span className="label">Dining Style:</span>
                <span className="value">{post.diningStyle}</span>
              </div>
              {post.priceRange && (
                <div className="detail-item">
                  <span className="label">Price Range:</span>
                  <span className="value">{post.priceRange}</span>
                </div>
              )}
            </div>
          </div>

          <div className="review-content">
            <h2>Review</h2>
            <div className="review-text">
              {post.review || post.description || 'No review content available.'}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="tags-section">
                <h3>Tags</h3>
                <div className="tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="comments-section">
            <h2>Comments & Discussion</h2>
            <div className="comments-container">
              <Comments 
                reviewId={post._id} 
                onCountChange={() => {}}
              />
            </div>
          </div>
        </main>

        <aside className="post-sidebar">
          {(post.imageUrl || (post.images && post.images.length > 0)) && (
            <div className="sidebar-card">
              <h3>Photos</h3>
              <div className="image-gallery-sidebar">
                {(post.images || [post.imageUrl]).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${post.restaurantName} - ${index + 1}`}
                    className="sidebar-image"
                    onClick={() => {
                      const modal = document.createElement('div');
                      modal.className = 'image-modal';
                      modal.innerHTML = `
                        <div class="modal-backdrop" onclick="this.parentElement.remove()">
                          <img src="${image}" alt="${post.restaurantName}" />
                        </div>
                      `;
                      document.body.appendChild(modal);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <h3>Restaurant Info</h3>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-label">Rating</span>
                <span className="stat-value">{post.rating}/5</span>
              </div>
              <div className="stat">
                <span className="stat-label">Likes</span>
                <span className="stat-value">{likeCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Comments</span>
                <span className="stat-value">{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-card">
            <h3>More Reviews</h3>
            <p>Discover more reviews from this area</p>
            <Link to={`/restaurants?area=${encodeURIComponent(post.area)}`} className="btn-outline">
              View {post.area} Reviews
            </Link>
          </div>
          
          <div className="sidebar-card">
            <h3>Similar Cuisine</h3>
            <p>Explore more {post.cuisine} restaurants</p>
            <Link to={`/restaurants?cuisine=${encodeURIComponent(post.cuisine)}`} className="btn-outline">
              View {post.cuisine} Reviews
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostDetail;
