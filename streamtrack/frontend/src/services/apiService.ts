import keycloak from "@/utils/keycloak";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Note {
  _id: string;
  user_id: string;
  movie_id: string;
  content: string;
  media_type: "movie" | "tv"; 
  created_at?: string; 
  updated_at?: string; 
}

export interface NoteIn {
  movie_id: string;
  content: string;
  media_type: string; 
}

export interface NoteUpdateData {
  content?: string;
}

export const getNotes = async (): Promise<Note[]> => {
  return apiCall('/api/notes');
};

export const createNote = async (note: NoteIn): Promise<Note> => {
  return apiCall('/api/notes', {
    method: "POST",
    body: JSON.stringify(note),
  });
};

export const deleteNote = async (noteId: string): Promise<{ message: string; deleted_note_id: string }> => {
  return apiCall(`/api/notes/${noteId}`, {
    method: "DELETE",
  });
};

export const updateNote = async (noteId: string, noteUpdateData: NoteUpdateData): Promise<Note> => {
  return apiCall(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(noteUpdateData),
  });
};

export const getNotesByMovieId = async (movieId: string): Promise<Note[]> => {
  try {
    return await apiCall(`/api/notes/media/${movieId}`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return [];
    }
    throw new Error("Failed to fetch notes for media item");
  }
};

export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_URL}${endpoint}`;  
  const defaultHeaders: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (keycloak.token) {
    defaultHeaders['Authorization'] = `Bearer ${keycloak.token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'Wystąpił błąd';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
};
