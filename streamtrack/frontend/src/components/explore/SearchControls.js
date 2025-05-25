import React from 'react';

export const SearchControls = ({
  searchTerm, onSearchTermChange, onSubmit, onApplyFilters,
  loading, placeholder, showApplyFiltersButton }) => {
  return (
    <form onSubmit={onSubmit} className="max-w-7xl mx-auto">
      <div className="flex gap-4">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400 group-focus-within:text-sky-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-sky-300/50 focus:border-sky-500 transition-all duration-300 shadow-lg hover:shadow-xl group-focus-within:shadow-sky-500/20"
            disabled={loading}
          />
          {searchTerm && (
            <button type="button" onClick={() => onSearchTermChange('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex gap-3 flex-shrink-0">
          <button type="submit" disabled={loading} className="px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-300/50 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 disabled:shadow-none flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:hover:scale-100 whitespace-nowrap">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Szukam...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Szukaj
              </>
            )}
          </button>
          
          {showApplyFiltersButton && (
            <button type="button" onClick={onApplyFilters} disabled={loading} className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300/50 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 disabled:shadow-none flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:hover:scale-100 whitespace-nowrap">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Ładowanie...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Zastosuj filtry
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};