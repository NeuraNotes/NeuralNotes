import React from 'react';
import { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutModeProvider } from './contexts/LayoutModeContext';
import useTheme from './hooks/useTheme';
import './styles/globals.css';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';
import SettingsPage from './pages/SettingsPage';
import FolderNotesPage from './pages/FolderNotesPage';
import NewNotePage from './pages/NewNotePage';
import NotePage from './pages/NotePage';
import AIChatPage from './pages/AIChatPage';

// Import i18n
import './i18n/i18n';

// Define a type for Folder
export interface Folder {
  id: string;
  name: string;
}

/**
 * Ana uygulama bileşeni.
 * - Tema kontrolü
 * - Routing
 * - i18n desteği
 */
function App() {
  const { t, i18n } = useTranslation();
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/folders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Folder[] = await response.json();
        setFolders(data);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        // Optionally set an error state or show a message
      }
    };

    fetchFolders();
  }, []);

  const addFolder = (folderName: string) => {
    const newFolder: Folder = {
      id: String(Date.now()),
      name: folderName,
    };
    setFolders((prevFolders) => [...prevFolders, newFolder]);
    console.log(t('folders.folderAdded', 'Folder added:'), newFolder);
  };

  useTheme(); // Initialize theme

  // Example: Set document language and direction based on i18n
  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  // Set up global listeners for system theme changes
  useEffect(() => {
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const prefersDark = e.matches;
      const currentTheme = localStorage.getItem('theme');
      
      // Only update if user hasn't explicitly set a theme preference
      if (!currentTheme) {
        if (prefersDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    // Initial check (in case useEffect runs after theme is already set)
    if (!localStorage.getItem('theme')) {
      const prefersDark = mediaQuery.matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return (
    <LayoutModeProvider>
      <Router>
        <Suspense fallback={<div className="flex-center h-screen w-screen">{t('common.loading')}</div>}>
          <Routes>
            <Route path="/" element={<MainLayout folders={folders} addFolder={addFolder} />}>
              <Route index element={<Home />} />
              <Route path="note/:id" element={<NotePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="folders/:folderId" element={<FolderNotesPage />}  />
              <Route path="notes/new" element={<NewNotePage folders={folders} />} />
              <Route path="ai-chat" element={<AIChatPage />} />
              <Route path="*" element={
                <div className="flex-center h-[80vh] flex-col gap-4">
                  <h1 className="text-2xl font-bold">404</h1>
                  <p>{t('common.error')}</p>
                </div>
              } />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </LayoutModeProvider>
  );
}

export default App;
