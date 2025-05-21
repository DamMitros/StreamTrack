import React from 'react';

export const SearchControls = ({
  searchTerm,
  onSearchTermChange,
  onSubmit,
  onApplyFilters,
  loading,
  placeholder,
  showApplyFiltersButton
}) => {
  return (
    <form onSubmit={onSubmit} style={{ marginBottom: "20px", display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding: "8px", minWidth: "300px", flexGrow: 1 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Szukam..." : "Szukaj"}
      </button>
      {showApplyFiltersButton && (
         <button type="button" onClick={onApplyFilters} disabled={loading}>
            Zastosuj filtry / Odśwież
        </button>
      )}
    </form>
  );
};