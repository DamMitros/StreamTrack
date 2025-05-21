import React from 'react';
import { ResultItem } from './ResultItem';

export const ResultsDisplay = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div>
      <h3>Wyniki:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((item) => (
          <ResultItem key={`${item.media_type}-${item.id}`} item={item} />
        ))}
      </ul>
    </div>
  );
};
