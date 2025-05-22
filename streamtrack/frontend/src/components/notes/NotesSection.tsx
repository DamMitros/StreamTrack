'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Note, NoteIn, NoteUpdateData, getNotesByMovieId, createNote, updateNote, deleteNote } from '@/services/apiService';
import SimpleAlert from '@/components/common/SimpleAlert'; 

interface NotesSectionProps {
  mediaId: string;
  mediaType: string;
  title: string; 
}

const NotesSection: React.FC<NotesSectionProps> = ({ mediaId, mediaType, title }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [showSimpleAlert, setShowSimpleAlert] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null); 

  const displayAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowSimpleAlert(true);
  };

  const fetchNotes = useCallback(async () => {
    if (!mediaId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotes = await getNotesByMovieId(mediaId);
      setNotes(fetchedNotes.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()));
    } catch (err: any) {
      console.error("Failed to fetch notes:", err);
      setError(err.message || 'Nie udało się załadować notatek.'); 
    } finally {
      setIsLoading(false);
    }
  }, [mediaId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNewNote = () => {
    setEditingNote(null);
    setNoteContent('');
    setShowForm(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setNoteContent('');
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      displayAlert("Treść notatki nie może być pusta.", "error");
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
          movie_id: mediaId,
          content: noteContent,
          media_type: mediaType,
        };
        await createNote(newNoteData);
      }
      setShowForm(false);
      setEditingNote(null);
      setNoteContent('');
      fetchNotes(); 
      displayAlert(editingNote ? 'Notatka zaktualizowana!' : 'Notatka utworzona!', 'success');
    } catch (err: any) {
      console.error("Failed to save note:", err);
      displayAlert(err.message || 'Nie udało się zapisać notatki.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
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
      console.error("Failed to delete note:", err);
      displayAlert(err.message || 'Nie udało się usunąć notatki.', 'error');
    } finally {
      setIsLoading(false);
      setConfirmingDelete(null); 
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-md relative"> 
      {showSimpleAlert && alertMessage && (
        <SimpleAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowSimpleAlert(false)}
        />
      )}
      
      <h3 className="text-2xl font-semibold mb-4 text-white">Notatki dla: <span className="text-purple-300">{title}</span></h3>

      {error && <p className="text-red-400 bg-red-900 p-3 rounded mb-4">Błąd: {error}</p>}

      {!showForm ? (
        <>
          <button onClick={handleAddNewNote} className="mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors">Dodaj Nową Notatkę</button>
          {isLoading && notes.length === 0 && <p className="text-gray-300">Ładowanie notatek...</p>}
          {!isLoading && notes.length === 0 && !error && <p className="text-gray-400">Brak notatek. Dodaj pierwszą!</p>}
          
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-gray-600 p-4 rounded-md shadow">
                <p className="text-gray-200 whitespace-pre-wrap mb-2">{note.content}</p>
                <p className="text-xs text-gray-400">Ostatnia modyfikacja: {new Date(note.updated_at || note.created_at || Date.now()).toLocaleString()}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleEditNote(note)} disabled={isLoading} className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded shadow disabled:opacity-50">Edytuj</button>
                  <button disabled={isLoading} className={`text-sm text-white py-1 px-3 rounded shadow disabled:opacity-50 ${confirmingDelete === note._id ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={() => {
                      if (confirmingDelete === note._id) {
                        confirmDelete();
                      } else {
                        handleDeleteNote(note._id);
                      }
                    }}
                  >
                    {confirmingDelete === note._id ? 'Potwierdź Usunięcie' : 'Usuń'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-gray-600 p-4 rounded-md">
          <h4 className="text-xl font-medium mb-3 text-white">{editingNote ? 'Edytuj Notatkę' : 'Dodaj Nową Notatkę'}</h4>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Wpisz swoją notatkę tutaj..."
            className="w-full h-40 p-3 bg-gray-500 text-white border border-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition mb-4"
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <button onClick={handleSaveNote} disabled={isLoading || !noteContent.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50">
              {isLoading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
            <button onClick={handleCancelForm} disabled={isLoading} className="bg-gray-400 hover:bg-gray-500 text-black font-semibold py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50">Anuluj</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
