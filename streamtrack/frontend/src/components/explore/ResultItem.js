import React from 'react';
import Link from 'next/link'; 

export const ResultItem = ({ item, viewMode = 'grid' }) => {
  const title = item.title || item.name;
  const year = item.release_date || item.first_air_date;
  const formattedYear = year ? new Date(year).getFullYear() : '';
  const mediaTypeLabel = item.media_type === 'movie' ? 'Film' : 'Serial';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  if (viewMode === 'grid') {
    return (
      <Link href={`/explore/${item.id}?mediaType=${item.media_type}`} className="group block">
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-105 group-hover:border-sky-300/50 dark:group-hover:border-sky-400/50">
          <div className="relative aspect-[2/3] overflow-hidden">
            {item.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-500 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  <p className="text-xs">Brak plakatu</p>
                </div>
              </div>
            )}
            

            {rating && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {rating}
              </div>
            )}

            <div className="absolute top-2 left-2 bg-gradient-to-r from-sky-500/90 to-purple-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
              {mediaTypeLabel}
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
              {title}
              {formattedYear && (
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                  ({formattedYear})
                </span>
              )}
            </h4>
            
            {item.overview && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">{item.overview.substring(0, 120)}...</p>
            )}

            <div className="mt-3">
              {item.providersLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ładowanie platform...</span>
                </div>
              ) : item.availableOnPlatforms && item.availableOnPlatforms.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {item.availableOnPlatforms.slice(0, 6).map(p =>
                    p.logo_path ? (
                      <img 
                        key={p.provider_id} 
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} 
                        alt={p.provider_name} 
                        title={p.provider_name}
                        className="w-6 h-6 rounded-md shadow-sm hover:scale-110 transition-transform duration-200" 
                      />
                    ) : null
                  )}
                  {item.availableOnPlatforms.length > 6 && (
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">+{item.availableOnPlatforms.length - 6}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/explore/${item.id}?mediaType=${item.media_type}`} className="group block">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 group-hover:border-sky-300/50 dark:group-hover:border-sky-400/50">
        <div className="flex gap-4 p-4">
          <div className="flex-shrink-0">
            {item.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                alt={title}
                className="w-20 h-30 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-20 h-30 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
            )}
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-grow min-w-0">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200 truncate">
                  {title}
                  {formattedYear && (
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      ({formattedYear})
                    </span>
                  )}
                </h4>
                
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-700 dark:text-sky-300">{mediaTypeLabel}</span>
                  
                  {rating && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {rating}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {item.overview && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">{item.overview.substring(0, 200)}...</p>
            )}

            <div className="mt-3">
              {item.providersLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ładowanie platform...</span>
                </div>
              ) : item.availableOnPlatforms && item.availableOnPlatforms.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Dostępne na:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.availableOnPlatforms.slice(0, 8).map(p =>
                      p.logo_path ? (
                        <img 
                          key={p.provider_id} 
                          src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} 
                          alt={p.provider_name} 
                          title={p.provider_name}
                          className="w-8 h-8 rounded-lg shadow-sm hover:scale-110 transition-transform duration-200" 
                        />
                      ) : null
                    )}
                    {item.availableOnPlatforms.length > 8 && (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">+{item.availableOnPlatforms.length - 8}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};