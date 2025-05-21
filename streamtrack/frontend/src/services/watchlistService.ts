import keycloak from "@/utils/keycloak";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface WatchlistItem {
  id: string;
  _id: string;
  user_id: string;
  movie_id: string;
  title: string;
  media_type: string;
  added_at?: string;
}

export interface WatchlistItemIn {
  movie_id: string;
  title: string;
  media_type: string;
}

const getAuthHeaders = () => {
  if (!keycloak.token) {
    console.error("User not authenticated, no token available.");
    throw new Error("User not authenticated");
  }
  return {
    Authorization: `Bearer ${keycloak.token}`,
    "Content-Type": "application/json",
  };
};


export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  const response = await fetch(`${API_URL}/watchlist`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  return response.json();
};

export const addToWatchlist = async (item: WatchlistItemIn): Promise<WatchlistItem> => {
  const response = await fetch(`${API_URL}/watchlist`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to add to watchlist" }));
    throw new Error(errorData.detail || "Failed to add to watchlist");
  }
  return response.json();
};

export const removeFromWatchlist = async (movieId: string): Promise<{ message: string; removed_movie_id: string }> => {
  const response = await fetch(`${API_URL}/watchlist/${movieId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to remove from watchlist" }));
    throw new Error(errorData.detail || "Failed to remove from watchlist");
  }
  return response.json();
};

export const checkWatchlistItem = async (movieId: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/watchlist/check/${movieId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) { 
        return false;
    }
    throw new Error("Failed to check watchlist item");
  }
  try {
    const data = await response.json();
    return Boolean(data); 
  } catch (e) {
    if (response.headers.get("content-length") === "0" || response.status === 204) {
        return false; 
    }
    console.error("Failed to parse checkWatchlistItem response:", e);
    throw new Error("Invalid response from check watchlist item");
  }
};