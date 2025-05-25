import React from 'react';
import { ResultItem } from './ResultItem';

export const ResultsDisplay = ({ results, viewMode = 'grid' }) => {
  if (results.length === 0) return null;

  return (
    <div>      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((item) => (
            <ResultItem key={`${item.media_type}-${item.id}`} item={item} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item) => (
            <ResultItem key={`${item.media_type}-${item.id}`} item={item} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};
