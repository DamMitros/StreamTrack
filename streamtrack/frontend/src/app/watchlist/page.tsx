'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WatchlistItem, getWatchlist, removeFromWatchlist } from '@/services/watchlistService';
import { useKeycloak } from '@react-keycloak/web';
import SimpleAlert from '@/components/common/SimpleAlert'; 

const WatchlistPage = () => {
  const { keycloak, initialized } = useKeycloak();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
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
      setWatchlist(items.sort((a, b) => new Date(b.added_at || 0).getTime() - new Date(a.added_at || 0).getTime()));
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
    return <div className="container mx-auto p-4 text-center text-gray-300">Inicjalizacja Keycloak...</div>;
  }

  if (!keycloak.authenticated) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-red-400">Musisz być zalogowany, aby zobaczyć swoją listę do obejrzenia.</p>
        <Link href="/login" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">Przejdź do logowania</Link>
      </div>
    );
  }
  
  if (isLoading && watchlist.length === 0) {
    return <div className="container mx-auto p-4 text-center text-gray-300">Ładowanie listy do obejrzenia...</div>;
  }

  if (error && !showSimpleAlert) { 
    return <div className="container mx-auto p-4 text-center text-red-400">Błąd: {error}</div>;
  }


  return (
    <div className="container mx-auto p-4">
      {showSimpleAlert && alertMessage && (
        <SimpleAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowSimpleAlert(false)}
        />
      )}
      <h1 className="text-3xl font-bold mb-6 text-white">Moja Lista do Obejrzenia</h1>
      
      {watchlist.length === 0 && !isLoading && (
        <p className="text-gray-400 text-lg">Twoja lista do obejrzenia jest pusta. Dodaj filmy lub seriale z <Link href="/explore" className="text-purple-400 hover:text-purple-300">Eksploruj</Link>!</p>
      )}

      <ul className="space-y-4">
        {watchlist.map((item) => (
          <li key={item._id || item.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <Link href={`/explore/${item.movie_id}?mediaType=${item.media_type}`} passHref className="flex-grow mb-3 sm:mb-0">
              <div className="hover:opacity-80 transition-opacity">
                <h2 className="text-xl font-semibold text-purple-300">{item.title}</h2>
                <p className="text-sm text-gray-400 capitalize">{item.media_type === 'movie' ? 'Film' : 'Serial'}</p>
                {item.added_at && <p className="text-xs text-gray-500">Dodano: {new Date(item.added_at).toLocaleDateString()}</p>}
              </div>
            </Link>
            <button disabled={isLoading} className={`text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50 ${ confirmingDeleteMovieId === item.movie_id  ? 'bg-yellow-600 hover:bg-yellow-700'  : 'bg-red-600 hover:bg-red-700'}`}
              onClick={() => {
                if (confirmingDeleteMovieId === item.movie_id) {
                  executeDelete(item.movie_id, item.title);
                } else {
                  requestDeleteConfirmation(item.movie_id, item.title);
                }
              }}>
              {confirmingDeleteMovieId === item.movie_id ? 'Potwierdź Usunięcie' : 'Usuń z Listy'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WatchlistPage;
