"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Note, NoteIn, NoteUpdateData, getNotesByMovieId, 
  getNotes, createNote, updateNote, deleteNote } from '@/services/apiService';
import { getMediaDetails as fetchTmdbMediaDetails, MediaDetails as TmdbMediaDetails } from '@/services/tmdbService';
import SimpleAlert from '@/components/common/SimpleAlert';
import Image from 'next/image';
import Link from 'next/link'; 

interface NotesSectionProps {
  mediaId?: string;
  mediaType?: "movie" | "tv";
  title?: string; 
}

const NotesSection: React.FC<NotesSectionProps> = ({ mediaId, mediaType, title }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [mediaDetailsCache, setMediaDetailsCache] = useState<Record<string, TmdbMediaDetails>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMediaDetails, setIsLoadingMediaDetails] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [currentMediaId, setCurrentMediaId] = useState<string | undefined>(mediaId);
  const [currentMediaType, setCurrentMediaType] = useState<"movie" | "tv" | undefined>(mediaType);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [showSimpleAlert, setShowSimpleAlert] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const displayAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowSimpleAlert(true);
    setTimeout(() => setShowSimpleAlert(false), 5000); 
  };

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedNotes: Note[];
      if (mediaId) { 
        fetchedNotes = await getNotesByMovieId(mediaId);
      } else { 
        fetchedNotes = await getNotes();
        fetchedNotes.forEach(note => {
          if (note.movie_id && !mediaDetailsCache[note.movie_id]) {
            fetchAndCacheMediaDetails(note.movie_id, note.media_type as "movie" | "tv");
          }
        });
      }
      setNotes(fetchedNotes.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()));
    } catch (err: any) {
      console.error("Nie udało się załadować notatek:", err);
      setError(err.message || 'Nie udało się załadować notatek.');
      displayAlert(err.message || 'Nie udało się załadować notatek.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [mediaId, mediaDetailsCache]); 

  const fetchAndCacheMediaDetails = useCallback(async (id: string, type: "movie" | "tv") => {
    if (!id || !type || mediaDetailsCache[id]) return;
    setIsLoadingMediaDetails(prev => ({ ...prev, [id]: true }));
    try {
      const details = await fetchTmdbMediaDetails(id, type); 
      setMediaDetailsCache(prev => ({ ...prev, [id]: details }));
    } catch (err) {
      console.error(`Nie udało się pobrać szczegółów dla ${type} ID ${id}:`, err);
    } finally {
      setIsLoadingMediaDetails(prev => ({ ...prev, [id]: false }));
    }
  }, [mediaDetailsCache]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    setCurrentMediaId(mediaId);
    setCurrentMediaType(mediaType);
  }, [mediaId, mediaType]);

  const handleAddNewNote = () => {
    setEditingNote(null);
    setNoteContent('');
    setShowForm(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setCurrentMediaId(note.movie_id); 
    setCurrentMediaType(note.media_type as "movie" | "tv");
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setNoteContent('');
    setCurrentMediaId(mediaId);
    setCurrentMediaType(mediaType);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      displayAlert("Treść notatki nie może być pusta.", "error");
      return;
    }

    if (!currentMediaId || !currentMediaType) {
      displayAlert("Brak informacji o filmie/serialu dla tej notatki.", "error");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (editingNote) {
        const updateData: NoteUpdateData = { content: noteContent };
        await updateNote(editingNote._id, updateData);
      } else {
        const newNoteData: NoteIn = {
          movie_id: currentMediaId,
          content: noteContent,
          media_type: currentMediaType,
        };
        await createNote(newNoteData);
      }
      setShowForm(false);
      setEditingNote(null);
      setNoteContent('');
      setCurrentMediaId(mediaId); 
      setCurrentMediaType(mediaType); 
      fetchNotes(); 
      displayAlert(editingNote ? 'Notatka zaktualizowana!' : 'Notatka utworzona!', 'success');
    } catch (err: any) {
      console.error("Nie udało się zapisać notatki:", err);
      displayAlert(err.message || 'Nie udało się zapisać notatki.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNoteRequest = (noteId: string) => {
    setConfirmingDelete(noteId);
    displayAlert('Czy na pewno chcesz usunąć tę notatkę? Kliknij ponownie Usuń aby potwierdzić.', 'info');
  };

  const confirmDelete = async () => {
    if (!confirmingDelete) return;

    setIsLoading(true);
    setError(null);
    try {
      await deleteNote(confirmingDelete);
      fetchNotes(); 
      displayAlert('Notatka usunięta.', 'success');
    } catch (err: any) {
      console.error("Nie udało się usunąć notatki:", err);
      displayAlert(err.message || 'Nie udało się usunąć notatki.', 'error');
    } finally {
      setIsLoading(false);
      setConfirmingDelete(null);
    }
  };

  const getMediaTitleForNote = (note: Note) => {
    if (mediaId && title) return title;
    const details = mediaDetailsCache[note.movie_id];
    if (isLoadingMediaDetails[note.movie_id]) return "Ładowanie tytułu...";
    if (!details) return `Film/Serial ID: ${note.movie_id}`; 
    return details.title || details.name || "Nieznany tytuł";
  };

  const getPosterPathForNote = (note: Note) => {
    if (mediaId) return null;
    const details = mediaDetailsCache[note.movie_id];
    if (!details || !details.poster_path) return null;
    return details.poster_path ? `https://image.tmdb.org/t/p/w200${details.poster_path}` : null;
  };
  
  const sectionTitle = mediaId && title ? `Notatki dla: ${title}` : "";

  return (
    <div className="mt-1 p-4 rounded-lg shadow-md relative">
      {showSimpleAlert && alertMessage && (
        <SimpleAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowSimpleAlert(false)}
        />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-white">{sectionTitle}</h3>
        { (mediaId && mediaType && !showForm) && (
             <button onClick={handleAddNewNote} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg shadow transition-colors text-sm" disabled={isLoading}>Dodaj Notatkę</button>
        )}
      </div>

      {error && !showSimpleAlert && <p className="text-red-400 bg-red-900 p-3 rounded mb-4">Błąd: {error}</p>}

      {showForm ? (
        <div className="bg-gray-600 p-4 rounded-md">
          <h4 className="text-xl font-medium mb-3 text-white">{editingNote ? `Edytuj Notatkę dla: ${getMediaTitleForNote(editingNote)}` : (currentMediaId && mediaDetailsCache[currentMediaId] ? `Dodaj Notatkę dla: ${mediaDetailsCache[currentMediaId]?.title || mediaDetailsCache[currentMediaId]?.name}` : (title ? `Dodaj Notatkę dla: ${title}` : "Dodaj Nową Notatkę"))}</h4>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Wpisz swoją notatkę tutaj..."
            className="w-full h-40 p-3 bg-gray-500 text-white border border-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition mb-4"
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <button onClick={handleSaveNote} disabled={isLoading || !noteContent.trim() || (!editingNote && (!currentMediaId || !currentMediaType)) } className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50">
              {isLoading ? (editingNote ? 'Zapisywanie...': 'Dodawanie...') : (editingNote ? 'Zapisz Zmiany' : 'Dodaj Notatkę')}
            </button>
            <button onClick={handleCancelForm} disabled={isLoading} className="bg-gray-400 hover:bg-gray-500 text-black font-semibold py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50">Anuluj</button>
          </div>
        </div>
      ) : (
        <>
          {isLoading && notes.length === 0 && <p className="text-gray-300">Ładowanie notatek...</p>}
          {!isLoading && notes.length === 0 && !error && <p className="text-gray-400">Brak notatek. {mediaId ? "Dodaj pierwszą notatkę dla tego tytułu!" : "Możesz je dodawać przeglądając filmy/seriale."}</p>}
          
          <div className="space-y-6">
            {notes.map((note) => {
              const posterPath = getPosterPathForNote(note);
              const noteTitle = getMediaTitleForNote(note);
              return (
                <div key={note._id} className="bg-gray-600 p-4 rounded-md shadow flex gap-4">
                  {posterPath && (
                    <div className="flex-shrink-0 w-24 h-36 relative">
                       <Image src={posterPath} alt={`Plakat dla ${noteTitle}`} layout="fill" objectFit="cover" className="rounded" />
                    </div>
                  )}
                  <div className="flex-grow">
                    {(!mediaId || note.movie_id !== mediaId) ? (
                        <Link href={`/explore/${note.movie_id}?mediaType=${note.media_type}`} passHref>
                          <h4 className="text-lg font-semibold text-purple-300 mb-1 hover:text-purple-200 cursor-pointer transition-colors">{noteTitle}</h4>
                        </Link>
                    ) : (
                        <h4 className="text-lg font-semibold text-purple-300 mb-1">{noteTitle}</h4>
                    )}
                    <p className="text-gray-200 whitespace-pre-wrap mb-2">{note.content}</p>
                    <p className="text-xs text-gray-400">Ostatnia modyfikacja: {new Date(note.updated_at || note.created_at || Date.now()).toLocaleString('pl-PL')}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEditNote(note)} disabled={isLoading} className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded shadow disabled:opacity-50">Edytuj</button>
                      <button disabled={isLoading} className={`text-sm text-white py-1 px-3 rounded shadow disabled:opacity-50 ${confirmingDelete === note._id ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'}`} 
                        onClick={() => {
                          if (confirmingDelete === note._id) {
                            confirmDelete();
                          } else {
                            handleDeleteNoteRequest(note._id);
                          }
                        }}>
                        {confirmingDelete === note._id ? 'Potwierdź Usunięcie' : 'Usuń'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default NotesSection;
