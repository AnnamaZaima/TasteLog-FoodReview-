import React from 'react';
import '../styles/FilterForm.css';  // Import FilterForm styles

const FilterForm = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <form className="filter-form">
      <select name="cuisine" value={filters.cuisine} onChange={handleChange}>
        <option value="">Select Cuisine</option>
        <option value="Italian">Italian</option>
        <option value="Indian">Indian</option>
        <option value="Mexican">Mexican</option>
        <option value="Chinese">Chinese</option>
        <option value="American">American</option>
      </select>

      <select name="rating" value={filters.rating} onChange={handleChange}>
        <option value="">Select Rating</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>

      <select name="area" value={filters.area} onChange={handleChange}>
        <option value="">Select Area</option>
        <option value="Downtown">Downtown</option>
        <option value="Mirpur">Mirpur</option>
        <option value="Gulshan">Gulshan</option>
        <option value="Banani">Banani</option>
      </select>

      <select name="diningStyle" value={filters.diningStyle} onChange={handleChange}>
        <option value="">Select Dining Style</option>
        <option value="Casual">Casual</option>
        <option value="Fine Dining">Fine Dining</option>
        <option value="Fast Food">Fast Food</option>
      </select>
    </form>
  );
};

export default FilterForm;
