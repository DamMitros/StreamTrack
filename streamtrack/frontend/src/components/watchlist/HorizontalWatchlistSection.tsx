'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { WatchlistItem } from '@/services/watchlistService';

interface ExtendedWatchlistItem extends WatchlistItem {
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
}

interface HorizontalWatchlistSectionProps {
  title: string;
  items: ExtendedWatchlistItem[];
  onRemove: (movieId: string, title: string) => void;
  confirmingDeleteId: string | null;
  isLoading: boolean;
}

const HorizontalWatchlistSection: React.FC<HorizontalWatchlistSectionProps> = ({
  title, items, onRemove, confirmingDeleteId, isLoading}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          {title}
          <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({items.length} {items.length === 1 ? 'element' : 'elementów'})
          </span>
        </h2>
        
        {items.length > 4 && (
          <div className="flex gap-2">
            <button onClick={scrollLeft} className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-lg">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={scrollRight} className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-lg">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item) => (
          <div key={item._id || item.id} className="group relative flex-shrink-0 w-64 h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: item.poster_path 
                  ? `url(https://image.tmdb.org/t/p/w500${item.poster_path})`
                  : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative h-full flex flex-col justify-end p-6 text-white">
              <Link href={`/explore/${item.movie_id}?mediaType=${item.media_type}`} className="flex-grow flex flex-col justify-end group-hover:scale-105 transition-transform duration-300">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold line-clamp-2 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.media_type === 'movie' ? 'bg-blue-500/80 text-white' : 'bg-green-500/80 text-white'}`}>{item.media_type === 'movie' ? '🎬 Film' : '📺 Serial'}</span>
                    
                    {item.vote_average && (
                      <div className="flex items-center gap-1 bg-yellow-500/80 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-medium text-white">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {item.added_at && (
                    <p className="text-xs text-gray-300 opacity-80">Dodano: {new Date(item.added_at).toLocaleDateString('pl-PL')}</p>
                  )}
                </div>
              </Link>
              
              <button disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(item.movie_id, item.title);
                }} className={`mt-4 w-full px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${confirmingDeleteId === item.movie_id ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg' : 'bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-600 hover:to-pink-600 text-white shadow-lg backdrop-blur-sm'}`}>
                {confirmingDeleteId === item.movie_id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Potwierdź
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Usuń
                  </span>
                )}
              </button>
            </div>

            <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
          </div>
        ))}
        
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
};

export default HorizontalWatchlistSection;