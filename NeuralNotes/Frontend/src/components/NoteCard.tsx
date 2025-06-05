import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { FolderOut, LabelOut } from '../types/backend';
// import { useTranslation } from 'react-i18next'; // t function not used currently
import { Star, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Not kartı özellikleri
 */
interface NoteCardProps {
  id: string;
  title: string;
  content?: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
  isStarred?: boolean;
  onClick: (noteId: number) => void;
  layoutMode?: 'grid' | 'masonry'; // Added to potentially adjust styles based on layout
  label: LabelOut | null;
  folders: FolderOut[];
  noteId: number;
  onDeleteClick: (noteId: number) => void;
}

/**
 * Basit not kartı bileşeni
 */
const NoteCard: React.FC<NoteCardProps> = ({
  id,
  title,
  content,
  date,
  imageUrl,
  isStarred = false, // Default to false if not provided
  tags = [],
  onClick,
  layoutMode = 'grid', // Default to grid
  label,
  folders,
  noteId,
  onDeleteClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    onClick(parseInt(id, 10));
    navigate(`/note/${id}`);
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteClick(noteId);
  };

  const truncateContent = (text: string | undefined, limit: number) => {
    if (!text) return '';
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: layoutMode === 'masonry' ? 0 : 20 }} // No y-animation for masonry items to prevent jumping during column layout
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: layoutMode === 'masonry' ? 0 : -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={handleCardClick}
      className={`relative rounded-lg shadow-md overflow-hidden transition-all duration-200 ease-in-out cursor-pointer ${layoutMode === 'masonry' ? 'break-inside-avoid' : ''} hover:shadow-lg transform hover:-translate-y-1 bg-white dark:bg-neutral-800`}
    >
      <Link to={`/note/${id}`} className="block cursor-pointer">
        {imageUrl && (
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 group overflow-hidden">
            {/* For masonry, image height is auto to maintain aspect ratio */}
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" 
            />
          </div>
        )}
        {/* Removed min-height for text-only cards to allow natural height in masonry */}
        <div className={`p-4 flex flex-col flex-grow`}> 
          <h3 
            className={`font-semibold text-neutral-800 dark:text-neutral-100 mb-1 truncate ${imageUrl ? 'text-md' : 'text-lg'}`}
          >
            {title}
          </h3>
          {content && (
            // Removed line-clamp for masonry to see full content, adjust if needed
            <p className={`text-sm text-neutral-600 dark:text-neutral-300 flex-grow ${imageUrl ? 'mb-1' : 'mb-2'}`}>
              {truncateContent(content, 150)}
            </p>
          )}
          <div className="mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">{date}</span>
            {isStarred && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
          </div>
        </div>
      </Link>

      <motion.button
        onClick={handleDeleteClick}
        className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <Trash2 size={20} />
      </motion.button>
    </motion.div>
  );
};

export default React.memo(NoteCard);
