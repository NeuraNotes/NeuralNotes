import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Paperclip, Image as ImageIcon, Send as SendIcon } from 'lucide-react';
import RecentNotesDisplay from '../components/RecentNotesDisplay';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const userName = "User";
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSend = async () => {
    if (message.trim() === '') return;

    // 1. Set up the initial conversation in sessionStorage
    const initialConversation = [{ sender: 'user', text: message }];
    sessionStorage.setItem('chatConversation', JSON.stringify(initialConversation));

    // 2. Navigate to the chat page. No need to pass state, as the new page will read from sessionStorage.
    navigate('/ai-chat');

    // 3. Send the message to the backend in the background.
    // The AIChatPage will handle fetching and displaying the response.
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error("Failed to send initial message:", error);
      // Optionally, you can store an error state in sessionStorage for AIChatPage to display
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.header
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-800 dark:text-neutral-100">
          {t('chat.greeting', 'Hi there,')} <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">{userName}</span>
        </h1>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-neutral-700 dark:text-neutral-300">
          {t('chat.mainQuestion', "How can I help with your notes?")}
        </h2>
        <p className="mt-4 text-xl text-neutral-500 dark:text-neutral-400">
          {t('chat.promptSuggestionIntro', 'Ask me anything about your notes!')}
        </p>
      </motion.header>

      <motion.section
        className="w-full max-w-3xl bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <textarea
          className="w-full p-3 border-none rounded-md resize-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          rows={3}
          placeholder={t('chat.inputPlaceholder', 'Ask whatever you want....')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400">
              <Paperclip size={16} className="stroke-current" />
              {t('chat.addAttachment', 'Add Attachment')}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400">
              <ImageIcon size={16} className="stroke-current" />
              {t('chat.useImage', 'Use Image')}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-3 py-1.5 rounded-md">
              gemini-2.5-pro
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">0/1000</span>
            <button
              className="p-2 text-white rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:from-purple-700 hover:via-pink-600 hover:to-red-700 transition-all duration-300 ease-in-out flex items-center justify-center"
              onClick={handleSend}
            >
              <SendIcon size={20} className="fill-current" />
            </button>
          </div>
        </div>
      </motion.section>

      <RecentNotesDisplay />

    </div>
  );
};

export default ChatPage;