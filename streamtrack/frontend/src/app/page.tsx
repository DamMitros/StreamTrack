"use client";

import { useState, useEffect } from "react";
import { searchMultiTMDB } from "@/services/tmdbService";
import { useKeycloak } from "@react-keycloak/web";
import { getNotes, createNote, deleteNote, Note, NoteIn } from "@/services/apiService";
import MyWatchlistComponent from "@/components/watchlist";

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
        setUserNotes(notes);
      } catch (err) {
        setNoteError((err as Error).message);
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
      const data = await searchMultiTMDB(searchTerm);
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedMovieIdForNote) {
      setNoteError("Movie ID i treść notatki są wymagane.");
      return;
    }
    if (!keycloak.authenticated) {
      setNoteError("Musisz być zalogowany, aby dodawać notatki.");
      return;
    }

    try {
      const newNoteData: NoteIn = {
        movie_id: selectedMovieIdForNote,
        content: noteContent,
        media_type: ""
      };
      await createNote(newNoteData);
      setNoteContent("");
      setSelectedMovieIdForNote(null);
      fetchUserNotes();
    } catch (err) {
      setNoteError((err as Error).message);
    }
  };

  const handleDeleteNote = async (noteId: string | undefined) => {
    if (!keycloak.authenticated || !noteId?.trim()) {
      setNoteError("Błąd przy usuwaniu notatki.");
      return;
    }

    try {
      await deleteNote(noteId);
      fetchUserNotes();
    } catch (err) {
      setNoteError((err as Error).message);
    }
  };
return (
  <div className="max-w-4xl mx-auto pb-12 px-4 flex-grow space-y-12">
    <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Streamtrack</h1>

    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Witaj!</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">Możesz przeszukiwać filmy i seriale, zapisywać notatki, a także tworzyć własną watchlistę.</p>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Wyszukiwarka</h3>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Np. Incepcja, Friends..."
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        />
        <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition disabled:bg-blue-300 dark:disabled:bg-blue-700">{loading ? "Szukam..." : "Szukaj"}</button>
      </form>

      {error && <p className="text-red-500 mt-4">Błąd: {error}</p>}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Wyniki:</h4>
          <ul className="space-y-3">
            {results.map((item) => (
              <li key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                <span className="text-gray-800 dark:text-gray-200">
                  {item.title || item.name}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({item.media_type})</span>
                </span>
                {keycloak.authenticated && (
                  <button className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                    onClick={() => {
                      setSelectedMovieIdForNote(String(item.id));
                      setNoteContent("");
                    }}
                  >Dodaj notatkę</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {keycloak.authenticated && selectedMovieIdForNote && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Dodaj notatkę dla ID: {selectedMovieIdForNote}</h4>
        <form onSubmit={handleCreateNote}>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Twoja notatka..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition">Zapisz notatkę</button>
        </form>
      </div>
    )}

    {keycloak.authenticated && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Twoje Notatki</h3>
        {loadingNotes && <p className="text-gray-500">Ładowanie notatek...</p>}
        {noteError && <p className="text-red-500">Błąd notatek: {noteError}</p>}

        {userNotes.length > 0 ? (
          <ul className="space-y-4">
            {userNotes.map((note) => {
              if (!note || typeof note._id !== "string" || !note._id.trim()) return null;
              return (
                <li key={note._id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <strong>ID: {note.movie_id}</strong>
                  </p>
                  <p className="text-gray-800 dark:text-gray-100">{note.content}</p>
                  <button onClick={() => handleDeleteNote(note._id)} className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">Usuń</button>
                </li>
              );
            })}
          </ul>
        ) : (
          !loadingNotes && <p className="text-gray-500 dark:text-gray-400">Nie masz jeszcze żadnych notatek.</p>
        )}
      </div>
    )}

    <MyWatchlistComponent />
  </div>
);

}
