import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { APP_NAME } from '../config/constants';
import React, { useState, useEffect, useRef } from 'react';
import { useNote, useUpdateNote, useDeleteNote } from '../hooks/useNotes';
import type { NoteOut, FolderOut, LabelOut, NoteUpdate } from '../types/backend'; // Import NoteOut, FolderOut, LabelOut and NoteUpdate types
import { Trash2 } from 'lucide-react'; // Import Trash2 icon

/**
 * Tekil not sayfası bileşeni
 * URL parametresinden not ID'sini alır ve ilgili notu gösterir
 */
const NotePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const noteId = id ? parseInt(id, 10) : undefined;
  const { data: note, isLoading, error } = useNote(noteId as number); // note will be of type NoteOut | undefined
  const { mutate: updateNote } = useUpdateNote();
  const { mutate: deleteNote } = useDeleteNote(); // Get the delete mutation function

  const [editableTitle, setEditableTitleState] = useState('');
  const [editableContent, setEditableContentState] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);

  // Ref to store the timeout ID for debouncing
  const saveTimeoutRef = useRef<number | null>(null);
  // Refs to store the latest values of title and content for cleanup save
  const latestTitleRef = useRef('');
  const latestContentRef = useRef('');

  // Custom state setters that also update refs
  const setEditableTitle = (value: string) => {
      setEditableTitleState(value);
      latestTitleRef.current = value;
  };

  const setEditableContent = (value: string) => {
      setEditableContentState(value);
      latestContentRef.current = value;
  };

  // Function to clear any existing save timeout
  const clearSaveTimeout = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  // Handle saving changes with optional immediate save
  // Updated to take values from refs if immediate save is on cleanup
  const handleSave = (field: 'title' | 'content', immediate = false) => {
    if (!noteId || !note) {
      console.log('Save skipped: Missing noteId or note data.');
      return;
    }

    // Use values from refs for immediate save (on cleanup), otherwise use state
    const currentTitle = immediate ? latestTitleRef.current : editableTitle;
    const currentContent = immediate ? latestContentRef.current : editableContent;

    console.log(`handleSave called for ${field}. Immediate: ${immediate}. Current editable: ${field === 'title' ? currentTitle : currentContent}. Original: ${field === 'title' ? note.title : note.content}`);

    // Explicitly type updatedData to match the NoteUpdate schema
    const updatedData: NoteUpdate = {
      title: currentTitle, // Use current title (from ref or state)
      content: currentContent, // Use current content (from ref or state)
      label_id: note.label_id, // Always include current label_id
      folder_ids: note.folders.map((folder: FolderOut) => folder.id), // Always include current folder IDs
    };

    let hasChanges = false;

    // Check for changes in title or content
    if (currentTitle !== note.title || currentContent !== note.content) {
      hasChanges = true;
    }

    if (hasChanges) {
      console.log('Saving changes:', updatedData);
      updateNote({ noteId, data: updatedData });
      console.log('updateNote mutation triggered.');
    } else {
      console.log('No changes detected for saving.');
    }
  };

  // Debounced save function
  const debouncedSave = (field: 'title' | 'content') => {
    clearSaveTimeout();
    saveTimeoutRef.current = window.setTimeout(() => {
      handleSave(field);
    }, 1000); // Save after 1 second of inactivity
  };

  // Handler to delete the current note
  const handleDeleteClick = () => {
    if (noteId) {
      console.log('Attempting to delete note with ID:', noteId);
      // Call the delete mutation
      deleteNote(noteId, {
        onSuccess: () => {
          console.log('Note deleted successfully. Navigating back...');
          // Navigate back after successful deletion
          navigate(-1); // Navigate back to the previous page
        },
        onError: (error) => {
          console.error('Error deleting note:', error);
          alert(t('notes.deleteError', 'Failed to delete note.') + ` ${error instanceof Error ? error.message : String(error)}`);
        },
      });
    }
  };

  useEffect(() => {
    // Only set initial state if note data is available
    if (note) {
      setEditableTitle(note.title);
      setEditableContent(note.content || '');
    }

    // Cleanup function to save the latest state on unmount
    return () => {
      console.log('NotePage cleanup function running.');
      // Call handleSave with immediate=true to use the latest values from refs
      handleSave('title', true);
      handleSave('content', true);
      clearSaveTimeout(); // Ensure any pending debounced save is cleared
    };
  }, [note, noteId]); // Depend on note and noteId to re-run effect when note loads or changes

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">{t('common.loading', 'Loading note...')}</div>;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return <div className="max-w-4xl mx-auto p-6 text-red-500">{t('notePage.fetchError', 'Failed to load note:') + ` ${errorMessage}`}</div>;
  }

  if (!note) {
    return <div className="max-w-4xl mx-auto p-6 text-yellow-600">{t('notePage.notFound', 'Note not found.')}</div>;
  }

  const characterCount = editableContent.length;

  const noteDate = new Date().toISOString(); // Consider using a real date from the note if available
  const formattedDate = new Date(noteDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  console.log('Attempting to render NotePage with note:', note);

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
    >
      {/* Combined header for date, character count, and delete button */}
      <div className="mb-6 flex justify-end items-center text-gray-500 dark:text-gray-400 text-sm gap-4">
        <span>{formattedDate}</span>
        <span>{characterCount} {t('notePage.characters', 'characters')}</span>
        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 transition-colors duration-200"
          title={t('notePage.deleteNote', 'Delete Note')}
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        {isTitleEditing ? (
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => {
              setEditableTitle(e.target.value);
              debouncedSave('title');
            }}
            onBlur={() => setIsTitleEditing(false)}
            autoFocus
            className="text-2xl font-bold mb-4 w-full bg-transparent outline-none border-b border-blue-500 dark:border-blue-400"
          />
        ) : (
          <h1
            className={`text-2xl font-bold mb-4 cursor-text ${editableTitle ? '' : 'text-neutral-400 dark:text-neutral-600'}`}
            onClick={() => setIsTitleEditing(true)}
          >
            {editableTitle || "Untitled Note"}
          </h1>
        )}

        <div className="prose dark:prose-invert max-w-none mb-6">
          {isContentEditing ? (
            <textarea
              value={editableContent}
              onChange={(e) => {
                setEditableContent(e.target.value);
                debouncedSave('content');
              }}
              onBlur={() => setIsContentEditing(false)}
              autoFocus
              className="w-full min-h-[300px] bg-transparent outline-none border border-blue-500 dark:border-blue-400 p-2 rounded"
            />
          ) : (
            <p
              className={`whitespace-pre-line cursor-text ${editableContent ? '' : 'text-neutral-400 dark:text-neutral-600'}`}
              onClick={() => setIsContentEditing(true)}
            >
              {editableContent || t('notePage.startTyping', 'Start typing...')}
            </p>
          )}
        </div>

        {/* Tags section - if you add tags to your Note schema and backend */}
        {/*
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        */}
      </div>
    </motion.div>
  );
};

export default NotePage;
