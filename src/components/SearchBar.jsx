// src/components/SearchBar.jsx
import React, { useEffect, useRef, useState } from "react";

export default function SearchBar({
  defaultValue = "",
  onSearch,
  placeholder = "Search...",
  delay = 300, // debounce delay ms
}) {
  const [q, setQ] = useState(defaultValue);
  const timerRef = useRef(null);

  // Reset input if defaultValue changes externally
  useEffect(() => {
    setQ(defaultValue);
  }, [defaultValue]);

  // Debounced search as the user types
  useEffect(() => {
    if (!onSearch) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const term = q.trim();
      onSearch(term);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [q, onSearch, delay]);

  const submit = (e) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current); // cancel pending
    onSearch?.(q.trim());
  };

  return (
    <form className="searchbar" onSubmit={submit} style={{ display: "flex", gap: 8 }}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}
      />
      <button type="submit" className="btn">
        Search
      </button>
    </form>
  );
}
