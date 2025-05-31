import { apiCall } from './apiService';

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

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  return apiCall('/api/watchlist');
};

export const addToWatchlist = async (item: WatchlistItemIn): Promise<WatchlistItem> => {
  return apiCall('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify(item),
  });
};

export const removeFromWatchlist = async (movieId: string): Promise<{ message: string; removed_movie_id: string }> => {
  return apiCall(`/api/watchlist/${movieId}`, {
    method: 'DELETE',
  });
};

export const checkWatchlistItem = async (movieId: string): Promise<boolean> => {
  try {
    const result = await apiCall(`/api/watchlist/check/${movieId}`);
    return Boolean(result);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return false;
    }
    throw error;
  }
};