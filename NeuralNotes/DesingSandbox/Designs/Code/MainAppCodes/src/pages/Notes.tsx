import React, { useState } from 'react';

// Sample note data
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  icon?: string;
  isFavorite?: boolean;
  lastEdited?: string;
  type: 'page' | 'database';
  tags?: string[];
}

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Getting Started',
    content: 'Welcome to NeuralNotes! This is your first note.',
    date: '2025-05-10',
    icon: '📝',
    isFavorite: true,
    lastEdited: '2 hours ago',
    type: 'page',
    tags: ['welcome']
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Discussed new features for the app including dark mode and offline support.',
    date: '2025-05-12',
    icon: '🗓️',
    lastEdited: 'Yesterday at 3:45 PM',
    type: 'page',
    tags: ['meeting', 'work']
  },
  {
    id: '3',
    title: 'Learning Resources',
    content: 'React hooks, TypeScript advanced types, and Tailwind CSS best practices.',
    date: '2025-05-13',
    icon: '📚',
    lastEdited: '3 days ago',
    type: 'database',
    tags: ['learning', 'resources']
  },
  {
    id: '4',
    title: 'Weekly Goals',
    content: 'Complete sidebar component, implement notes page, and add search functionality.',
    date: '2025-05-14',
    icon: '🎯',
    isFavorite: true,
    lastEdited: '2 days ago',
    type: 'page',
    tags: ['goals', 'planning']
  },
  {
    id: '5',
    title: 'Book Recommendations',
    content: 'Atomic Habits by James Clear, Deep Work by Cal Newport.',
    date: '2025-05-15',
    icon: '📖',
    lastEdited: '5 hours ago',
    type: 'database',
    tags: ['books', 'recommendations']
  },
  {
    id: '6',
    title: 'Design Inspiration',
    content: 'Check Dribbble and Behance for modern UI design patterns for note-taking apps.',
    date: '2025-05-15',
    icon: '🎨',
    lastEdited: 'Just now',
    type: 'page',
    tags: ['design', 'inspiration']
  }
];

const Notes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'list' | 'gallery'>('list');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Get all unique tags
  const allTags = Array.from(new Set(sampleNotes.flatMap(note => note.tags || [])));
  
  // Filter notes based on search term, selected tag, and favorites
  const filteredNotes = sampleNotes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === null || (note.tags && note.tags.includes(selectedTag));
    
    const matchesFavorite = !showFavoritesOnly || note.isFavorite;
    
    return matchesSearch && matchesTag && matchesFavorite;
  });
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Notion-like header with breadcrumb and actions */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center text-gray-400 text-sm">
          <span>NeuralNotes</span>
          <svg className="w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">Notes</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">📝</span>
            <h1 className="text-3xl font-bold text-white">Notes</h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* View toggle */}
            <div className="flex bg-[#222] rounded-md p-1">
              <button 
                className={`p-1 rounded ${viewType === 'list' ? 'bg-[#333]' : ''}`}
                onClick={() => setViewType('list')}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                className={`p-1 rounded ${viewType === 'gallery' ? 'bg-[#333]' : ''}`}
                onClick={() => setViewType('gallery')}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            
            {/* Filter button */}
            <button className="bg-[#222] hover:bg-[#333] p-2 rounded-md">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            
            {/* Sort button */}
            <button className="bg-[#222] hover:bg-[#333] p-2 rounded-md">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
            
            {/* Add Note button */}
            <button className="bg-[#222] hover:bg-[#333] text-white font-medium py-2 px-4 rounded-md flex items-center mr-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Note</span>
            </button>
            
            {/* New button */}
            <button className="bg-[#222] hover:bg-[#333] text-white font-medium py-2 px-4 rounded-md flex items-center">
              <span className="mr-1">New</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search bar - Notion style */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="bg-[#222] text-white w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Recently in Notes section (smaller) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-sm font-medium text-gray-400">Recently in Notes</h2>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-2 space-x-3 hide-scrollbar">
          {sampleNotes
            .sort((a, b) => a.lastEdited && b.lastEdited ? 
              (a.lastEdited.includes('Just now') ? -1 : 
               b.lastEdited.includes('Just now') ? 1 : 
               a.lastEdited.includes('hour') ? -1 : 
               b.lastEdited.includes('hour') ? 1 : 0) : 0)
            .slice(0, 4)
            .map(note => (
              <div 
                key={note.id} 
                className="flex-shrink-0 w-48 bg-[#222] rounded-lg p-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer border border-[#333]"
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{note.icon}</span>
                  <h3 className="text-sm font-medium text-white truncate">{note.title}</h3>
                </div>
                <p className="text-gray-400 text-xs">{note.lastEdited}</p>
              </div>
            ))}
        </div>
      </div>
      
      {/* Favorites section */}
      {sampleNotes.some(note => note.isFavorite) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-lg font-medium text-white">Favorites</h2>
            </div>
            <button 
              className="text-sm text-gray-400 hover:text-white"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              {showFavoritesOnly ? 'Show all' : 'Show favorites only'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sampleNotes
              .filter(note => note.isFavorite)
              .map(note => (
                <div 
                  key={note.id} 
                  className="bg-[#222] rounded-lg p-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer border border-[#333] flex items-start"
                >
                  <div className="text-xl mr-3">{note.icon}</div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{note.title}</h3>
                    <p className="text-gray-400 text-xs">{note.lastEdited}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Main notes list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-white">All Notes</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{filteredNotes.length} items</span>
          </div>
        </div>
        
        {/* List view */}
        {viewType === 'list' && (
          <div className="border border-[#333] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#222] border-b border-[#333]">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last edited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {filteredNotes.map(note => (
                  <tr key={note.id} className="bg-[#1a1a1a] hover:bg-[#222] transition-colors cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{note.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{note.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">{note.content}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {note.tags && note.tags.map(tag => (
                          <span key={tag} className="bg-[#333] text-xs text-gray-300 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">{note.lastEdited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Gallery view */}
        {viewType === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className="bg-[#222] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer border border-[#333]"
              >
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">{note.icon}</span>
                  <h3 className="text-base font-medium text-white">{note.title}</h3>
                </div>
                <p className="text-gray-300 mb-3 text-sm line-clamp-2">{note.content}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {note.tags && note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-[#333] text-xs text-gray-300 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {note.tags && note.tags.length > 2 && (
                      <span className="bg-[#333] text-xs text-gray-300 px-2 py-0.5 rounded-full">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{note.lastEdited}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Empty State - Notion style */}
      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-[#222] rounded-full p-4 mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-1">No notes found</h3>
          <p className="text-gray-400 text-center max-w-md">
            {searchTerm || selectedTag ? 
              "Try adjusting your search or filter to find what you're looking for." : 
              "Create your first note by clicking the 'New' button above."}
          </p>
          {!searchTerm && !selectedTag && (
            <button className="mt-4 bg-[#333] hover:bg-[#444] text-white font-medium py-2 px-4 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          )}
        </div>
      )}
      
      {/* Floating action button - mobile only */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notes;
