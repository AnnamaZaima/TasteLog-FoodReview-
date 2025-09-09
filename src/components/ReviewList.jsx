// src/components/ReviewList.jsx
import React from "react";
import ReviewCard from "./ReviewCard";

// helper: supports array or single value filter fields
const inFilter = (value, selected) => {
  if (!selected || (Array.isArray(selected) && selected.length === 0)) return true;
  return Array.isArray(selected) ? selected.includes(value) : value === selected;
};

// helper: rating filter (arrays mean "at least max selected")
const ratingPass = (rating, selected) => {
  if (!selected || (Array.isArray(selected) && selected.length === 0)) return true;
  const r = Number(rating) || 0;
  if (Array.isArray(selected)) return r >= Math.max(...selected.map(Number));
  return r >= Number(selected);
};

export default function ReviewList({
  reviews = [],
  filters = {},
  viewMode = "grid",      // "grid" | "list"
  onUpdated,
}) {
  // client-side fallback filtering (server also filters)
  const filtered = reviews.filter((rev) =>
    inFilter(rev.cuisine, filters.cuisine) &&
    inFilter(rev.area, filters.area) &&
    inFilter(rev.diningStyle, filters.diningStyle) &&
    ratingPass(rev.rating, filters.rating)
  );

  if (filtered.length === 0) return <p>No reviews available.</p>;

  // LIST mode: compact rows
  if (viewMode === "list") {
    return (
      <div className="review-list list">
        <h2>Reviews</h2>
        {filtered.map((r) => (
          <div key={r._id || r.id} className="review-row">
            <div className="row-main">
              <h3 className="row-title">{r.title || r.restaurantName || "Untitled"}</h3>
              <p className="muted">
                {[r.cuisine, r.area, r.diningStyle].filter(Boolean).join(" • ")}
              </p>
            </div>
            <div className="row-side">
              <span className="rating-chip">⭐ {r.rating ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // GRID mode: small boxed cards
  return (
    <div className="review-card-container compact">
      {filtered.map((review) => (
        <ReviewCard
          key={review._id || review.id}
          review={review}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
}
