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
    return <div>Ładowanie informacji o użytkowniku...</div>;
  }

  if (!keycloak.authenticated) {
    return (
      <div style={{ marginTop: "30px" }}>
        <h3>Twoja Watchlista</h3>
        <p>Zaloguj się, aby zobaczyć swoją watchlistę.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ marginTop: "30px" }}>
        <h3>Twoja Watchlista</h3>
        <p>Ładowanie watchlisty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: "30px" }}>
        <h3>Twoja Watchlista</h3>
        <p style={{ color: "red" }}>Błąd ładowania watchlisty: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Twoja Watchlista</h3>
      {watchlistItems.length > 0 ? (
        <ul>
          {watchlistItems.map((item) => (
            <li key={item._id}>
              {item.title}{" "}
            </li>
          ))}
        </ul>
      ) : (
        <p>Twoja watchlista jest pusta.</p>
      )}
    </div>
  );
};

export default MyWatchlistComponent;
