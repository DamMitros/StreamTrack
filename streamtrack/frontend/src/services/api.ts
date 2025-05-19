import { useKeycloak } from '@react-keycloak/web';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TMDB_PROXY_URL = process.env.NEXT_PUBLIC_TMDB_PROXY_URL || 'http://localhost:8001';

export const useApiClient = () => {
  const { keycloak } = useKeycloak();
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (keycloak?.token) {
      headers['Authorization'] = `Bearer ${keycloak.token}`;
    }
    
    return headers;
  };

  const searchMedia = async (query: string) => {
    try {
      const response = await fetch(`${TMDB_PROXY_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Search media error:', error);
      throw error;
    }
  };

  const getUserNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get notes error:', error);
      throw error;
    }
  };

  const createNote = async (movieId: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          movie_id: movieId,
          content: content
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create note error:', error);
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Delete note error:', error);
      throw error;
    }
  };

  return {
    searchMedia,
    getUserNotes,
    createNote,
    deleteNote
  };
};