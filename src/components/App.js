// src/components/App.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/style.css";
import "../styles/Dashboard.css";

import SearchBar from "./SearchBar";
import Filters from "./Filters";
import ReviewList from "./ReviewList";
import Navigation from "./Navigation";
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

export default function App() {
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
    // debounce a bit so rapid filter typing/clicking doesn’t spam the API
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
    <div className="dashboard">
      {/* Top Navigation */}
      <Navigation />

      {/* Hero */}
      <section className="hero">
        <h1>
          Discover Amazing <span>Food Experiences</span>
        </h1>
        <p>Read authentic reviews from food lovers and find your next favorite restaurant</p>

        <div className="hero-actions">
          <Link to="/restaurants" className="btn">Explore Reviews</Link>
          <Link to="/create-review" className="btn btn-secondary">Write a Review</Link>
        </div>

        <div className="hero-stats">
          <div><strong>{reviews.length}</strong> Reviews</div>
          <div><strong>500+</strong> Restaurants</div>
          <div><strong>50+</strong> Cities</div>
        </div>

        <div className="hero-search">
          <SearchBar
            defaultValue={filters.q}
            onSearch={handleSearch}
            placeholder="Search restaurants, cuisines, or dishes..."
          />
        </div>
      </section>

      {/* Main */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <Filters
            onUpdateFilters={handleUpdateFilters}
            initialValues={filters}
          />
        </aside>

        {/* Content */}
        <section className="content">
          <div className="sort-bar">
            <span>Showing {sortedReviews.length} restaurants</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select value={filters.sort} onChange={handleSortChange}>
                <option value="rating_desc">Highest Rated</option>
                <option value="recent">Most Recent</option>
                <option value="rating_asc">Rating: Low to High</option>
              </select>

              <div className="view-toggle">
                <button
                  className={viewMode === "grid" ? "active" : ""}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  ▦
                </button>
                <button
                  className={viewMode === "list" ? "active" : ""}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  title="List view"
                >
                  ☰
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
