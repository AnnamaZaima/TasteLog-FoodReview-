// client/src/pages/Homepage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Homepage.css";

import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import ReviewList from "../components/ReviewList";
import { getAllReviews } from "../services/foodReviewService";

/* Filters must be arrays to work with the pills + server */
const defaultFilters = {
  cuisine: [],
  rating: [],
  area: [],
  diningStyle: [],
  q: "",
  sort: "rating_desc",
};

export default function Homepage() {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  /* ---------- Fetch reviews (debounced) ---------- */
  const pending = useRef();

  const loadReviews = useCallback(async () => {
    try {
      const data = await getAllReviews(filters);
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching reviews", e);
    }
  }, [filters]);

  useEffect(() => {
    clearTimeout(pending.current);
    // debounce a bit so rapid filter typing/clicking doesn't spam the API
    pending.current = setTimeout(loadReviews, 300);
    return () => clearTimeout(pending.current);
  }, [loadReviews]);

  /* ---------- Filter handlers ---------- */
  const handleUpdateFilters = (next) => setFilters(next);
  const handleSearch = (q) => setFilters((prev) => ({ ...prev, q }));
  const handleSortChange = (e) =>
    setFilters((prev) => ({ ...prev, sort: e.target.value }));

  /* ---------- Client-side sort fallback ---------- */
  const sortedReviews = useMemo(() => {
    const items = [...reviews];
    switch (filters.sort) {
      case "rating_desc":
        return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "rating_asc":
        return items.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case "recent":
      default:
        return items.sort(
          (a, b) =>
            new Date(b.createdAt || b.date || 0) -
            new Date(a.createdAt || a.date || 0)
        );
    }
  }, [reviews, filters.sort]);

  /* ---------- UI ---------- */
  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Discover Amazing <span className="gradient-text">Food Experiences</span>
            </h1>
            <p className="hero-description">
              Read authentic reviews from food lovers and find your next favorite restaurant
            </p>

            <div className="hero-actions">
              <Link to="/restaurants" className="btn btn-primary">
                <span>🍽️</span>
                Explore Reviews
              </Link>
              <Link to="/create-review" className="btn btn-secondary">
                <span>✍️</span>
                Write a Review
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{reviews.length}</div>
                <div className="stat-label">Reviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Restaurants</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Cities</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-cards">
              <div className="floating-card card-1">
                <div className="card-emoji">🍕</div>
                <div className="card-rating">★★★★★</div>
              </div>
              <div className="floating-card card-2">
                <div className="card-emoji">🍜</div>
                <div className="card-rating">★★★★☆</div>
              </div>
              <div className="floating-card card-3">
                <div className="card-emoji">🍔</div>
                <div className="card-rating">★★★★★</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-search">
          <SearchBar
            defaultValue={filters.q}
            onSearch={handleSearch}
            placeholder="Search restaurants, cuisines, or dishes..."
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <h2>Popular Cuisines</h2>
          <div className="categories-grid">
            <Link to="/restaurants?cuisine=Italian" className="category-card">
              <div className="category-emoji">🍝</div>
              <h3>Italian</h3>
              <p>Pasta, Pizza & More</p>
            </Link>
            <Link to="/restaurants?cuisine=Asian" className="category-card">
              <div className="category-emoji">🍜</div>
              <h3>Asian</h3>
              <p>Sushi, Ramen & Dim Sum</p>
            </Link>
            <Link to="/restaurants?cuisine=American" className="category-card">
              <div className="category-emoji">🍔</div>
              <h3>American</h3>
              <p>Burgers, BBQ & Comfort</p>
            </Link>
            <Link to="/restaurants?cuisine=Mexican" className="category-card">
              <div className="category-emoji">🌮</div>
              <h3>Mexican</h3>
              <p>Tacos, Burritos & More</p>
            </Link>
            <Link to="/restaurants?cuisine=Indian" className="category-card">
              <div className="category-emoji">🍛</div>
              <h3>Indian</h3>
              <p>Curry, Biryani & Spices</p>
            </Link>
            <Link to="/restaurants?cuisine=French" className="category-card">
              <div className="category-emoji">🥐</div>
              <h3>French</h3>
              <p>Fine Dining & Pastries</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Filter Results</h3>
            <button 
              className="clear-filters"
              onClick={() => setFilters(defaultFilters)}
            >
              Clear All
            </button>
          </div>
          <Filters
            onUpdateFilters={handleUpdateFilters}
            initialValues={filters}
          />
        </aside>

        {/* Content */}
        <section className="content">
          <div className="content-header">
            <div className="results-info">
              <h2>Latest Reviews</h2>
              <span className="results-count">
                Showing {sortedReviews.length} restaurants
              </span>
            </div>
            
            <div className="sort-controls">
              <select value={filters.sort} onChange={handleSortChange}>
                <option value="rating_desc">Highest Rated</option>
                <option value="recent">Most Recent</option>
                <option value="rating_asc">Rating: Low to High</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <span>⊞</span>
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  title="List view"
                >
                  <span>☰</span>
                </button>
              </div>
            </div>
          </div>

          {/* Use ReviewList (cards include like/report/comments) */}
          <ReviewList
            reviews={sortedReviews}
            filters={filters}
            viewMode={viewMode}
            onUpdated={loadReviews}
          />
        </section>
      </div>
    </div>
  );
}
