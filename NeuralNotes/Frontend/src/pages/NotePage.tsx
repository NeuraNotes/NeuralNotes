import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { APP_NAME } from '../config/constants';
import React, { useState, useEffect } from 'react';

// Assuming a Note type exists, similar to the backend schema
interface Note {
  id: number;
  title: string;
  content: string;
  folder_id: number | null; // Allow null as per schema
  label_id: number | null; // Allow null as per schema
  owner_id: number;
  // add other fields as needed, like creation/update dates
}

/**
 * Tekil not sayfası bileşeni
 * URL parametresinden not ID'sini alır ve ilgili notu gösterir
 */
const NotePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError(t('notePage.errorMissingId', 'Note ID is missing.'));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Use the backend endpoint to fetch a single note by ID
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${id}`);
        if (!response.ok) {
          // Attempt to read error message from backend if available
          const errorData = await response.json();
          console.error('Failed to fetch note:', response.status, errorData);
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        const data: Note = await response.json();
        setNote(data);
      } catch (err: any) {
        console.error("Error fetching note:", err);
        setError(t('notePage.fetchError', 'Failed to load note:') + ` ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, t]); // Re-run effect if note ID or translation function changes

  // Animasyon için varyantlar
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // Handle loading, error, and note not found states
  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">{t('common.loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-red-500">{error}</div>;
  }

  if (!note) {
    return <div className="max-w-4xl mx-auto p-6 text-yellow-600">{t('notePage.notFound', 'Note not found.')}</div>;
  }

  // Tarih formatını düzenle - Assuming your backend returns a date/timestamp field, e.g., 'created_at' or 'updated_at'
  // For now, I'll use a placeholder or add a dummy date if your schema doesn't have one
  // If your backend Note schema includes a datetime field, replace 'new Date().toISOString()' with 'note.your_date_field'
  const noteDate = new Date().toISOString(); // Placeholder - replace with actual note date if available
  const formattedDate = new Date(noteDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 dark:text-primary-400 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('common.back')}
        </button>

        {/* Display date if available */}
        {/* Replace formattedDate with note.your_date_field if available in backend schema */}
        <div className="text-gray-500 dark:text-gray-400 text-sm">
           {formattedDate}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-4">
          {note.title || `${APP_NAME} Not`}
        </h1>

        <div className="prose dark:prose-invert max-w-none mb-6">
          {/* Display note content */}
          <p className="whitespace-pre-line">
            {note.content}
          </p>
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
