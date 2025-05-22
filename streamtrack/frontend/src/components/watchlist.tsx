"use client";

import { useState, useEffect, useCallback } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { getWatchlist, WatchlistItem } from "@/services/watchlistService";

const MyWatchlistComponent = () => {
  const { keycloak, initialized } = useKeycloak();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserWatchlist = useCallback(async () => {
    if (!keycloak.authenticated) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await getWatchlist();
      setWatchlistItems(items);
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to fetch watchlist:", err);
    } finally {
      setLoading(false);
    }
  }, [keycloak.authenticated]); 

  useEffect(() => {
    if (initialized) {
      if (keycloak.authenticated) {
        fetchUserWatchlist();
      } else {
        setWatchlistItems([]);
        setError(null); 
      }
    }
  }, [initialized, keycloak.authenticated, fetchUserWatchlist]);

  if (!initialized) {
    return <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">Ładowanie informacji o użytkowniku...</div>;
  }

  if (!keycloak.authenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Twoja Watchlista</h3>
        <p className="text-gray-600 dark:text-gray-400">Zaloguj się, aby zobaczyć swoją watchlistę.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Twoja Watchlista</h3>
        <p className="text-gray-600 dark:text-gray-400">Ładowanie watchlisty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Twoja Watchlista</h3>
        <p className="text-red-500">Błąd ładowania watchlisty: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Twoja Watchlista</h3>
      {watchlistItems.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {watchlistItems.map((item) => (
            <li key={item._id} className="py-3">
              <span className="text-gray-700 dark:text-gray-300">{item.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Twoja watchlista jest pusta.</p>
      )}
    </div>
  );
};

export default MyWatchlistComponent;
