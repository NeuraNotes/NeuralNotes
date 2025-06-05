import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import { ChevronDown } from 'lucide-react';
import { useLayoutMode } from '../contexts/LayoutModeContext';
// Assuming ThemeToggle and LayoutModeSwitcher are used elsewhere or were part of a larger context not shown
// import ThemeToggle from './ThemeToggle';
// import LayoutModeSwitcher from './LayoutModeSwitcher';
import type { LabelOut, FolderOut } from '../types/backend'; // Import types using type-only import
import { useDeleteNote } from '../hooks/useNotes'; // Import the delete hook

const ITEMS_PER_LOAD = 8;

// Define NoteData interface based on backend NoteOut schema
interface NoteData {
  id: number; // Changed to number based on backend schema
  title: string;
  content: string; // Changed to required based on backend schema
  owner_id: number; // Added based on backend schema
  label_id: number | null; // Added based on backend schema
  folders: FolderOut[]; // Added based on backend schema
  label: LabelOut | null; // Added based on backend schema
  date?: string; // Keep date as optional for now, not present in backend schema
  imageUrl?: string; // Keep optional imageUrl from mock data
  isStarred?: boolean; // Keep optional isStarred from mock data
  // Note: The backend NoteOut does not include imageUrl or isStarred.
  // You may need to add these to the backend schema or handle them frontend-only.
}

// Tag interface to match what TagFilter expects
interface Tag {
    id: string; // TagFilter seems to expect string ids
    label: string;
}


const RecentNotesDisplay: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  // Change to selectedLabelIds, expecting number[] or string[] depending on TagFilter
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  
  const [originalNotes, setOriginalNotes] = useState<NoteData[]>([]); // Holds all notes from API
  const [filteredNotes, setFilteredNotes] = useState<NoteData[]>([]); // Holds notes after search/tag filters
  const [displayedNotes, setDisplayedNotes] = useState<NoteData[]>([]); // Paginated notes for display
  
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_LOAD); // Will be adjusted by effects
  const [loading, setLoading] = useState(true);
  const { layoutMode } = useLayoutMode(); // Removed setLayoutMode as it's not used here
  const { mutate: deleteNote } = useDeleteNote(); // Get the delete mutation function

  // Available labels derived from the original full dataset
  const availableLabels: Tag[] = useMemo(() => {
    const uniqueLabels = new Map<number, string>();
    originalNotes.forEach(note => {
      if (note.label) {
        uniqueLabels.set(note.label.id, note.label.name);
      }
    });
    // Map backend LabelOut to frontend Tag interface
    return Array.from(uniqueLabels.entries()).map(([id, name]) => ({
      id: String(id), // Convert ID to string for TagFilter compatibility
      label: t(`labels.${name}`, name) // Use label name as fallback
    }));
  }, [originalNotes, t]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Update handler to work with label IDs (as strings for TagFilter)
  const handleLabelToggle = (labelId: string) => {
    setSelectedLabelIds(prev => 
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  // Handler to delete a note
  const handleDeleteNote = useCallback((noteId: number) => {
    console.log('Attempting to delete note with ID:', noteId);
    // Call the delete mutation
    deleteNote(noteId, {
      onSuccess: () => {
        console.log('Note deleted successfully. Updating UI...');
        // Manually update the state to remove the deleted note
        setOriginalNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        // The useEffect depending on originalNotes will handle updating filteredNotes and displayedNotes
      },
      onError: (error) => {
        console.error('Error deleting note:', error);
        alert(t('notes.deleteError', 'Failed to delete note.') + ` ${error instanceof Error ? error.message : String(error)}`);
      },
    });
  }, [deleteNote, t]);

  // Effect to fetch notes once on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/notes/'); // Replace with your backend URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: NoteData[] = await response.json();
        // Add a placeholder date for now if needed by NoteCard
        const dataWithPlaceholderDate = data.map(note => ({
          ...note,
          date: note.date || 'No Date', // Use existing date or add placeholder
        }));
        setOriginalNotes(dataWithPlaceholderDate);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setOriginalNotes([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []); // Empty dependency array: fetch only once

  // Effect to filter notes whenever search, selected labels, original data, or layout mode changes
  useEffect(() => {
    let currentFiltered = [...originalNotes];

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Update filtering logic to use selectedLabelIds and note.label.id
    if (selectedLabelIds.length > 0) {
      currentFiltered = currentFiltered.filter(note =>
        note.label && selectedLabelIds.includes(String(note.label.id)) // Check if note has a label and its ID is in selectedLabelIds
      );
    }
    
    setFilteredNotes(currentFiltered);

    const initialItemsToDisplay = layoutMode === 'masonry' 
      ? Math.min(currentFiltered.length, ITEMS_PER_LOAD * 2) 
      : Math.min(currentFiltered.length, ITEMS_PER_LOAD);
    
    setDisplayedNotes(currentFiltered.slice(0, initialItemsToDisplay));
    setLoadedCount(initialItemsToDisplay);

  }, [searchTerm, selectedLabelIds, originalNotes, layoutMode]); // Depend on selectedLabelIds

  const loadMoreNotes = useCallback(() => {
    const itemsToLoadNext = layoutMode === 'masonry' ? ITEMS_PER_LOAD * 2 : ITEMS_PER_LOAD;
    const newLoadedCount = Math.min(filteredNotes.length, loadedCount + itemsToLoadNext);
    
    setDisplayedNotes(filteredNotes.slice(0, newLoadedCount));
    setLoadedCount(newLoadedCount);
  }, [loadedCount, filteredNotes, layoutMode]);

  const notesContainerClass = layoutMode === 'grid'
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    : "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6";

  return (
    <section className="w-full max-w-full mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} onClearSearch={clearSearch} />
          </div>
          {/* Pass availableLabels and selectedLabelIds to TagFilter */}
          <TagFilter availableTags={availableLabels} selectedTags={selectedLabelIds} onSelectTag={handleLabelToggle} />
        </div>
        {/* Placeholder for ThemeToggle and LayoutModeSwitcher if they were intended here */}
        {/* <div className="flex items-center gap-2">
          <ThemeToggle />
          <LayoutModeSwitcher />
        </div> */}
      </div>
      
      <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-6 text-left">
        {t('notes.recentNotes', 'Recent Notes')}
      </h2>

      {loading ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">Loading notes...</p>
      ) : displayedNotes.length > 0 ? (
        <motion.div
          className={notesContainerClass}
          key={layoutMode} // Re-trigger animations when layout mode changes
        >
          <AnimatePresence>
            {displayedNotes.map(note => (
              <NoteCard
                key={note.id}
                // Destructure and pass note properties, excluding any potential onClick, and explicitly passing the required props
                {...note}
                id={String(note.id)} // Ensure id is passed as a string for the NoteCard's id prop
                noteId={note.id} // Pass the numerical id to noteId prop
                date={note.date || 'No Date'} // Use existing date or placeholder
                layoutMode={layoutMode}
                onDeleteClick={handleDeleteNote} // Pass the delete handler
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">
          {searchTerm || selectedLabelIds.length > 0 // Update check for selectedLabelIds
            ? t('notes.noNotesFoundCriteria', 'No notes found matching your criteria.')
            : t('notes.noNotesAvailable', 'No notes available.')
          }
        </p>
      )}

      {!loading && loadedCount < filteredNotes.length && (
        <div className="text-center mt-10">
          <motion.button
            onClick={loadMoreNotes}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-8 rounded-lg flex items-center justify-center mx-auto gap-2 transition-colors duration-200 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 0 }}
          >
            {t('common.loadMore', 'Load More')}
            <ChevronDown size={20} />
          </motion.button>
        </div>
      )}
    </section>
  );
};

export default RecentNotesDisplay;