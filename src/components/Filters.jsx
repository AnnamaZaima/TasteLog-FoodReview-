import React, { useEffect, useState } from "react";

/* Defaults (can be overridden via props) */
const DEFAULT_CUISINES = [
  "Bangladeshi","Indian","Chinese","Thai","Italian",
  "Continental","Fast Food","Desserts","Seafood",
  "BBQ","Mexican","Japanese","Korean","Arabic"
];

const DEFAULT_AREAS = [
  "Dhanmondi","Gulshan","Banani","Uttara","Mirpur","Wari","Old Dhaka",
  "Motijheel","Elephant Road","New Market","Bashundhara","Baridhara",
  "Lalmatia","Mohammadpur","Tejgaon","Panthapath","Bailey Road","Shyamoli"
];

const DEFAULT_DINING = [
  "Fine Dining","Casual Dining","Street Food",
  "Fast Food","Cafe","Buffet","Events & Catering"
];

const DEFAULT_RATINGS = [5, 4, 3, 2, 1];

/* ---------- helpers ---------- */
const toArray = (v) =>
  Array.isArray(v) ? v : v === undefined || v === null || v === "" ? [] : [v];

const normalize = (v = {}) => ({
  cuisine: toArray(v.cuisine),
  area: toArray(v.area),
  diningStyle: toArray(v.diningStyle),
  // ensure ratings are numbers
  rating: toArray(v.rating).map((n) => Number(n)).filter(Boolean),
});

const Filters = ({
  onUpdateFilters,
  initialValues = {},
  showHeader = true,
  showClearAll = true,
  onClear,
  cuisines = DEFAULT_CUISINES,
  areas = DEFAULT_AREAS,
  dining = DEFAULT_DINING,
  ratings = DEFAULT_RATINGS,
}) => {
  const [local, setLocal] = useState(() => normalize(initialValues));

  useEffect(() => {
    setLocal((prev) => ({ ...prev, ...normalize(initialValues) }));
  }, [initialValues]);

  /** Toggle pill values */
  const toggleValue = (name, value) => {
    const current = toArray(local[name]);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const next = { ...local, [name]: updated };
    setLocal(next);
    onUpdateFilters?.(next);
  };

  /** Clear all filters */
  const clearFilters = () => {
    const cleared = { cuisine: [], area: [], diningStyle: [], rating: [] };
    setLocal(cleared);
    onClear?.();
    onUpdateFilters?.(cleared);
  };

  /** Helper to render pill buttons */
  const renderPills = (options, name, isRating = false) => {
    const selectedList = toArray(local[name]); // <-- guard
    return (
      <div className="pill-options">
        {options.map((opt) => {
          const key = isRating ? String(opt) : opt;
          const selected = selectedList.includes(opt);
          return (
            <button
              key={key}
              type="button"
              className={`pill ${selected ? "selected" : ""}`}
              aria-pressed={selected}
              onClick={() => toggleValue(name, opt)}
              title={isRating ? `${opt} star${opt > 1 ? "s" : ""}` : opt}
            >
              {isRating ? "⭐".repeat(Number(opt)) : opt}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="filters-panel">
      {showHeader && (
        <div className="filters-header">
          <h4>Filters</h4>
          {showClearAll && (
            <button type="button" className="clear-btn" onClick={clearFilters}>
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Cuisines */}
      <div className="filter">
        <label>Cuisines</label>
        {renderPills(cuisines, "cuisine")}
      </div>

      {/* Areas */}
      <div className="filter">
        <label>Areas</label>
        {renderPills(areas, "area")}
      </div>

      {/* Dining Style */}
      <div className="filter">
        <label>Dining Style</label>
        {renderPills(dining, "diningStyle")}
      </div>

      {/* Ratings */}
      <div className="filter">
        <label>Ratings</label>
        {renderPills(ratings, "rating", true)}
      </div>
    </div>
  );
};

export default Filters;
