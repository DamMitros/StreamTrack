"use client";

import { useState, useEffect } from "react";
import { searchTMDB } from "@/services/tmdbService";
import { useKeycloak } from "@react-keycloak/web";
import { getNotes, createNote, deleteNote, Note, NoteIn } from "@/services/apiService";

interface SearchResultItem {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
}

export default function HomePage() {
  const { keycloak, initialized } = useKeycloak();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [selectedMovieIdForNote, setSelectedMovieIdForNote] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const fetchUserNotes = async () => {
    if (keycloak.authenticated) {
      setLoadingNotes(true);
      setNoteError(null);
      try {
        const notes = await getNotes();
        notes.forEach((n) => {
          if (!n || typeof n._id !== "string" || !n._id.trim()) {
            console.error("Fetched note in fetchUserNotes has invalid _id:",
                          n, "typeof _id:", typeof n._id);
          }
        });
        setUserNotes(notes);
      } catch (err) {
        setNoteError((err as Error).message);
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoadingNotes(false);
      }
    }
  };

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      fetchUserNotes();
    }
  }, [initialized, keycloak.authenticated]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchTMDB(searchTerm);
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedMovieIdForNote) {
      setNoteError("Movie ID and content are required to create a note.");
      return;
    }
    if (!keycloak.authenticated) {
      setNoteError("You must be logged in to create notes.");
      return;
    }

    setNoteError(null);
    try {
      const newNoteData: NoteIn = {
        movie_id: selectedMovieIdForNote,
        content: noteContent,
      };
      const createdNote = await createNote(newNoteData); 
      setNoteContent("");
      setSelectedMovieIdForNote(null); 
      fetchUserNotes(); 
    } catch (err) {
      setNoteError((err as Error).message);
      console.error("Failed to create note:", err);
    }
  };

  const handleDeleteNote = async (noteId: string | undefined) => {
    if (!keycloak.authenticated) {
      setNoteError("You must be logged in to delete notes.");
      return;
    }

    if (!noteId || typeof noteId !== "string" || !noteId.trim()) {
      setNoteError("Cannot delete note: ID is missing or invalid.");
      console.error("handleDeleteNote called with invalid noteId:",
                     noteId, "typeof noteId:", typeof noteId);
      return;
    }
    setNoteError(null);
    try {
      await deleteNote(noteId);
      fetchUserNotes(); 
    } catch (err) {
      setNoteError((err as Error).message);
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div>
      <h2>Witaj w Streamtrack!</h2>
      <p>
        To jest strona główna Twojej aplikacji. Możesz zacząć od przeglądania
        dostępnych funkcji lub zalogować się, aby uzyskać dostęp do
        spersonalizowanych treści.
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>Wyszukaj filmy i seriale</h3>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Np. Incepcja, Friends..."
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 15px" }}>
          {loading ? "Szukam..." : "Szukaj"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Błąd: {error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Wyniki wyszukiwania:</h4>
          <ul>
            {results.map((item) => (
              <li key={item.id}>
                {item.title || item.name} ({item.media_type})
                {keycloak.authenticated && (
                  <button onClick={() => {
                    setSelectedMovieIdForNote(String(item.id)); 
                    setNoteContent("");
                    }}
                    style={{ marginLeft: "10px", padding: "3px 6px" }}>
                    Dodaj notatkę
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {keycloak.authenticated && selectedMovieIdForNote && (
        <div style={{marginTop: "20px",border: "1px solid #eee",padding: "15px",}}>
          <h4>Dodaj notatkę dla filmu/serialu ID: {selectedMovieIdForNote}</h4>
          <form onSubmit={handleCreateNote}>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Twoja notatka..."
              rows={3}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <button type="submit" style={{ padding: "8px 15px" }}>Zapisz notatkę</button>
          </form>
        </div>
      )}

      {keycloak.authenticated && (
        <div style={{ marginTop: "30px" }}>
          <h3>Twoje Notatki</h3>
          {loadingNotes && <p>Ładowanie notatek...</p>}
          {noteError && (
            <p style={{ color: "red" }}>Błąd notatek: {noteError}</p>
          )}
          {userNotes.length > 0 ? (
            <ul>
              {userNotes.map((note) => {
                if (!note || typeof note._id !== "string" || !note._id.trim()) {
                  console.warn(
                    "Render: Skipping note due to missing or invalid _id:",
                    note,
                    "typeof _id:",
                    note ? typeof note._id : "note is undefined"
                  );
                  return null; 
                }
                return (
                  <li key={note._id} style={{marginBottom: "10px", padding: "10px", border: "1px solid #ddd",}}>
                    <strong>Film/Serial ID: {note.movie_id}</strong>
                    <p>{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note._id)} // note._id is a valid string here
                      style={{padding: "5px 10px", backgroundColor: "lightcoral", color: "white", border: "none", cursor: "pointer",}}>
                      Usuń
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            !loadingNotes && <p>Nie masz jeszcze żadnych notatek.</p>
          )}
        </div>
      )}
    </div>
  );
}
