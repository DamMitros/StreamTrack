'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WatchlistItem, getWatchlist, removeFromWatchlist } from '@/services/watchlistService';
import { getMediaDetails } from '@/services/tmdbService';
import { useKeycloak } from '@react-keycloak/web';
import SimpleAlert from '@/components/common/SimpleAlert';
import HorizontalWatchlistSection from '@/components/watchlist/HorizontalWatchlistSection';

interface ExtendedWatchlistItem extends WatchlistItem {
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
} 

const WatchlistPage = () => {
  const { keycloak, initialized } = useKeycloak();
  const [watchlist, setWatchlist] = useState<ExtendedWatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [showSimpleAlert, setShowSimpleAlert] = useState(false);
  const [confirmingDeleteMovieId, setConfirmingDeleteMovieId] = useState<string | null>(null);

  const displayAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowSimpleAlert(true);
  };

  const fetchWatchlist = useCallback(async () => {
    if (!initialized || !keycloak.authenticated) {
      setIsLoading(false);
      setError("Musisz być zalogowany, aby zobaczyć swoją listę.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const items = await getWatchlist();
      const sortedItems = items.sort((a, b) => new Date(b.added_at || 0).getTime() - new Date(a.added_at || 0).getTime());
      const extendedItems: ExtendedWatchlistItem[] = await Promise.all(
        sortedItems.map(async (item) => {
          try {
            const mediaDetails = await getMediaDetails(item.movie_id, item.media_type as 'movie' | 'tv');
            return {
              ...item,
              poster_path: mediaDetails.poster_path,
              backdrop_path: mediaDetails.backdrop_path,
              vote_average: mediaDetails.vote_average
            };
          } catch (err) {
            console.error(`Failed to fetch details for ${item.title}:`, err);
            return item;
          }
        })
      );
      
      setWatchlist(extendedItems);
    } catch (err: any) {
      console.error("Failed to fetch watchlist:", err);
      setError(err.message || 'Nie udało się załadować listy do obejrzenia.');
      displayAlert(err.message || 'Nie udało się załadować listy do obejrzenia.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [keycloak, initialized]);

  useEffect(() => {
    if (initialized) {
      fetchWatchlist();
    }
  }, [fetchWatchlist, initialized]);

  const requestDeleteConfirmation = (movieId: string, title: string) => {
    setConfirmingDeleteMovieId(movieId);
    displayAlert(`Czy na pewno chcesz usunąć "${title}"? Kliknij ponownie "Usuń z Listy" aby potwierdzić.`, 'info');
  };

  const executeDelete = async (movieId: string, title: string) => {
    if (!keycloak.authenticated) {
      displayAlert('Musisz być zalogowany, aby usunąć element.', 'error');
      setConfirmingDeleteMovieId(null); 
      return;
    }

    setIsLoading(true); 
    try {
      await removeFromWatchlist(movieId);
      setWatchlist(prev => prev.filter(item => item.movie_id !== movieId));
      displayAlert(`"${title}" usunięto z listy.`, 'success');
    } catch (err: any) {
      console.error("Failed to remove item:", err);
      displayAlert(err.message || 'Nie udało się usunąć elementu.', 'error');
    } finally {
      setIsLoading(false);
      setConfirmingDeleteMovieId(null); 
    }
  };

  if (!initialized) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Inicjalizacja Keycloak...</p>
        </div>
      </div>
    );
  }

  if (!keycloak.authenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Wymagane logowanie</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Musisz być zalogowany, aby zobaczyć swoją listę do obejrzenia.</p>
          <Link href="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Przejdź do logowania
          </Link>
        </div>
      </div>
    );
  }
  
  if (isLoading && watchlist.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Ładowanie listy do obejrzenia...</p>
        </div>
      </div>
    );
  }

  if (error && !showSimpleAlert) { 
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950"></div>
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Wystąpił błąd</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {showSimpleAlert && alertMessage && (
          <SimpleAlert
            message={alertMessage}
            type={alertType}
            onClose={() => setShowSimpleAlert(false)}
          />
        )}
        
        <div className="text-center mb-5">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-purple-300 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">Moja Lista</span>
            <br />
            <span className="text-gray-800 dark:text-gray-100">do Obejrzenia</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Zarządzaj swoimi ulubionymi filmami i serialami w jednym miejscu</p>
        </div>
        
        {watchlist.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Lista jest pusta</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Twoja lista do obejrzenia jest pusta. Rozpocznij swoją przygodę z filmami i serialami!</p>
            <Link href="/explore" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Eksploruj treści
            </Link>
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="space-y-8">
            <HorizontalWatchlistSection
              title="📋 Wszystkie"
              items={watchlist}
              onRemove={(movieId, title) => {
                if (confirmingDeleteMovieId === movieId) {
                  executeDelete(movieId, title);
                } else {
                  requestDeleteConfirmation(movieId, title);
                }
              }}
              confirmingDeleteId={confirmingDeleteMovieId}
              isLoading={isLoading}
            />

            <HorizontalWatchlistSection
              title="🎬 Filmy"
              items={watchlist.filter(item => item.media_type === 'movie')}
              onRemove={(movieId, title) => {
                if (confirmingDeleteMovieId === movieId) {
                  executeDelete(movieId, title);
                } else {
                  requestDeleteConfirmation(movieId, title);
                }
              }}
              confirmingDeleteId={confirmingDeleteMovieId}
              isLoading={isLoading}
            />

            <HorizontalWatchlistSection
              title="📺 Seriale"
              items={watchlist.filter(item => item.media_type === 'tv')}
              onRemove={(movieId, title) => {
                if (confirmingDeleteMovieId === movieId) {
                  executeDelete(movieId, title);
                } else {
                  requestDeleteConfirmation(movieId, title);
                }
              }}
              confirmingDeleteId={confirmingDeleteMovieId}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
