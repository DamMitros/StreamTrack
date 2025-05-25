import React from 'react';

export const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;
  const maxDisplayPages = totalPages > 500 ? 500 : totalPages;

  return (
    <div className="flex items-center justify-center space-x-1">
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)} disabled={loading} className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Poprzednia
        </button>
      )}

      <div className="px-6 py-2 bg-gradient-to-r from-sky-500/10 to-purple-500/10 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-sky-200/50 dark:border-sky-600/50 rounded-lg font-medium">
        Strona {currentPage} z {totalPages > 500 ? '500+' : totalPages}
      </div>

      {currentPage < maxDisplayPages && (
        <button onClick={() => onPageChange(currentPage + 1)} disabled={loading} className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md">
          Następna
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};