import React from 'react';

export const FilterGroup = ({ label, items, selectedItems, onItemChange, loading, itemType }) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <label style={{ display: "block", marginBottom: "5px" }}>{label}: </label>
      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', minWidth: '200px' }}>
        {items.map((item) => (
          <div key={item.id}>
            <input
              type="checkbox"
              id={`${itemType}-${item.id}`}
              value={item.id.toString()}
              checked={selectedItems.includes(item.id.toString())}
              onChange={() => onItemChange(item.id.toString())}
              disabled={loading}
            />
            <label htmlFor={`${itemType}-${item.id}`} style={{ marginLeft: '5px', cursor: 'pointer' }}>
              {itemType === 'platform' && item.logo_path && (
                <img src={`https://image.tmdb.org/t/p/w92${item.logo_path}`} alt="" style={{ width: '20px', height: '20px', marginRight: '5px', verticalAlign: 'middle' }} />
              )}
              {item.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};