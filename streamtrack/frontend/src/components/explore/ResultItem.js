import React from 'react';
import Link from 'next/link'; 

export const ResultItem = ({ item }) => {
  return (
    <li style={{ marginBottom: "15px", border: "1px solid #eee", padding: "10px" }}>
      <Link href={`/explore/${item.id}?mediaType=${item.media_type}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
        {item.poster_path && (
          <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title || item.name}
               style={{ maxWidth: '100px', minWidth: '100px', height: '150px', objectFit: 'cover', marginRight: '15px' }} />
        )}
        <div style={{ flexGrow: 1 }}>
          <h4>{item.title || item.name} <span style={{ fontSize: '0.8em', color: '#777' }}>({item.media_type === 'movie' ? 'Film' : 'Serial'})</span></h4>
          <p style={{ fontSize: '0.9em', color: '#555', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.overview?.substring(0, 150)}...
          </p>
          <div style={{ marginTop: '5px' }}>
            {item.providersLoading && <small>Ładowanie platform...</small>}
            {!item.providersLoading && item.availableOnPlatforms && item.availableOnPlatforms.length > 0 && (
              item.availableOnPlatforms.slice(0, 5).map(p =>
                p.logo_path ? <img key={p.provider_id} src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name} title={p.provider_name} style={{ width: '24px', height: '24px', marginRight: '5px', borderRadius: '4px' }} /> : null
              )
            )}
            {!item.providersLoading && (!item.availableOnPlatforms || item.availableOnPlatforms.length === 0) && <small>Brak info o platformach.</small>}
          </div>
        </div>
      </Link>
    </li>
  );
};