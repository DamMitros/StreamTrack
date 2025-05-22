import keycloak from "@/utils/keycloak";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Note {
  _id: string;
  user_id: string;
  movie_id: string;
  content: string;
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

export const getNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/notes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
};

export const createNote = async (note: NoteIn): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to create note" }));
    throw new Error(errorData.detail || "Failed to create note");
  }
  return response.json();
};

export const deleteNote = async (noteId: string): Promise<{ message: string; deleted_note_id: string }> => {
  const response = await fetch(`${API_URL}/notes/${noteId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to delete note" }));
    throw new Error(errorData.detail || "Failed to delete note");
  }
  return response.json();
};

export const updateNote = async (noteId: string, noteUpdateData: NoteUpdateData): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes/${noteId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(noteUpdateData),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to update note" }));
    throw new Error(errorData.detail || "Failed to update note");
  }
  return response.json();
};

export const getNotesByMovieId = async (movieId: string): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/notes/media/${movieId}`, { 
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch notes for media item");
  }
  return response.json();
};
