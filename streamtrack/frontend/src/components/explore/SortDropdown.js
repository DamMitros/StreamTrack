import React from 'react';

export const SortDropdown = ({ options, selectedValue, onValueChange, loading }) => {
  return (
    <div>
      <label htmlFor="sort-by-filter" style={{ display: "block", marginBottom: "5px" }}>Sortuj według: </label>
      <select
        id="sort-by-filter"
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={loading}
      >
        {options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </select>
    </div>
  );
};