import React from 'react';

export const SortDropdown = ({ options, selectedValue, onValueChange, loading }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Sortuj według:</label>
      
      <div className="relative">
        <select
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={loading}
          className="block w-full px-3 py-3 border border-gray-200/50 dark:border-gray-600/50 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-700">
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};