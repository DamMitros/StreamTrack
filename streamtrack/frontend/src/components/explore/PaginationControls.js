import React from 'react';

export const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      {currentPage > 1 && <button onClick={() => onPageChange(currentPage - 1)} disabled={loading} style={{ margin: '0 5px', padding: '5px 10px' }}>Poprzednia</button>}
      <span>Strona {currentPage} z {totalPages > 500 ? '500+' : totalPages}</span>
      {currentPage < (totalPages > 500 ? 500 : totalPages) && <button onClick={() => onPageChange(currentPage + 1)} disabled={loading} style={{ margin: '0 5px', padding: '5px 10px' }}>Następna</button>}
    </div>
  );
};