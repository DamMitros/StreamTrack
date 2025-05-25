import React from 'react';

export const FilterGroup = ({ label, items, selectedItems, onItemChange, loading, itemType }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}: </label>
      
      <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-600/50 max-h-48 overflow-y-auto p-3 space-y-2 shadow-sm">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-600/50 transition-colors duration-200 cursor-pointer group">
            <input
              type="checkbox"
              value={item.id.toString()}
              checked={selectedItems.includes(item.id.toString())}
              onChange={() => onItemChange(item.id.toString())}
              disabled={loading}
              className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
            />
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {itemType === 'platform' && item.logo_path && (
                <img src={`https://image.tmdb.org/t/p/w92${item.logo_path}`} alt="" className="w-5 h-5 rounded flex-shrink-0 shadow-sm" />
              )}
              
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200 truncate">{item.name}</span>
            </div>
          </label>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">Brak dostępnych opcji</div>
        )}
      </div>
      
      {selectedItems.length > 0 && (
        <div className="text-xs text-sky-600 dark:text-sky-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Wybrano: {selectedItems.length}
        </div>
      )}
    </div>
  );
};