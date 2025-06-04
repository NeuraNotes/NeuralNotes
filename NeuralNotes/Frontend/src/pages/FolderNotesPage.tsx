import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Assuming a Note type exists, similar to the backend schema
interface Note {
  id: number;
  title: string;
  content: string; // Or a short excerpt
  folder_id: number;
  // add other fields as needed
}

const FolderNotesPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!folderId) return; // Don't fetch if folderId is not available

      setLoading(true);
      setError(null);
      try {
        // Use the new backend endpoint to fetch notes by folder ID
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/by_folder/${folderId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Note[] = await response.json();
        setNotes(data);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setError(t('folderNotes.fetchError', 'Failed to load notes.'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [folderId, t]); // Re-run effect if folderId or translation function changes

  if (loading) {
    return <div className="p-4 md:p-6">{t('common.loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
        {t('folderNotes.title', 'Folder')}: {folderId ? folderId.charAt(0).toUpperCase() + folderId.slice(1) : 'Unknown'}
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        {notes.length > 0
          ? t('folderNotes.notesAvailable', 'Notes in this folder:')
          : t('folderNotes.noNotes', 'No notes found in this folder.')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {notes.map(note => (
          <div key={note.id} className="bg-white dark:bg-neutral-800/50 shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
              {note.title}
            </h3>
            {/* Display a short excerpt or part of the content if available */}
            {note.content && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                {note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}
              </p>
            )}
            <Link
              to={`/note/${note.id}`} // Assuming a route for single note view like /note/:noteId
              className="text-sm text-[rgb(var(--primary-rgb))] hover:underline"
            >
              {t('folderNotes.readMore', 'Read more')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderNotesPage; 