// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <h3>TASTE_LOG</h3>
            <p>Discover amazing food experiences and share your culinary journey with fellow food lovers.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">📺</a>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Explore</h4>
          <div className="footer-links">
            <Link to="/restaurants">Restaurants</Link>
            <Link to="/create-review">Write Review</Link>
            <Link to="/complaints">Support</Link>
            <Link to="/register">Join Community</Link>
          </div>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <div className="footer-links">
            <a href="#about">About Us</a>
            <a href="#careers">Careers</a>
            <a href="#press">Press</a>
            <a href="#blog">Blog</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <div className="footer-links">
            <a href="#help">Help Center</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>

        <div className="footer-section newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe to get the latest restaurant reviews and food trends.</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 TasteLog. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
