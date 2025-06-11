import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Send as SendIcon, User, Bot } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AIChatPage: React.FC = () => {
  const { t } = useTranslation();
  const [conversation, setConversation] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load conversation from sessionStorage on initial render and fetch AI response
  useEffect(() => {
    const storedConversation = sessionStorage.getItem('chatConversation');
    if (storedConversation) {
      const parsedConversation: Message[] = JSON.parse(storedConversation);
      setConversation(parsedConversation);

      // If the last message was from the user, fetch the AI response
      if (parsedConversation.length > 0 && parsedConversation[parsedConversation.length - 1].sender === 'user') {
        fetchAIResponse(parsedConversation[parsedConversation.length - 1].text);
      }
    }
  }, []);

  // Scroll to the bottom of the chat when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const fetchAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      
      const aiMessage: Message = { sender: 'ai', text: data.response };
      
      // Update conversation state and sessionStorage
      setConversation(prev => {
        const updatedConversation = [...prev, aiMessage];
        sessionStorage.setItem('chatConversation', JSON.stringify(updatedConversation));
        return updatedConversation;
      });

    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      const errorMessage: Message = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (newMessage.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: newMessage };
    
    // Update state immediately for a responsive UI
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    sessionStorage.setItem('chatConversation', JSON.stringify(updatedConversation));

    setNewMessage('');
    fetchAIResponse(newMessage);
  };

  return (
    <motion.div
      className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300"
    >
      <div className="flex flex-col flex-grow p-4 gap-4">
        {/* Chat Messages Area */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 min-h-0">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <Bot className="w-6 h-6 text-purple-500 flex-shrink-0" />}
              <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-neutral-800'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
              {msg.sender === 'user' && <User className="w-6 h-6 text-blue-500 flex-shrink-0" />}
            </div>
          ))}
          {isLoading && (
              <div className="flex items-start gap-3">
                  <Bot className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <div className="max-w-xl p-3 rounded-lg bg-white dark:bg-neutral-800">
                      <div className="flex items-center justify-center space-x-1">
                          <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse"></div>
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
          <div className="flex items-center">
            <textarea
              className="w-full p-3 border-none rounded-md resize-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              rows={1}
              placeholder={t('chat.inputPlaceholder', 'Ask whatever you want....')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              className="ml-3 p-3 text-white rounded-lg bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-700 transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50"
              onClick={handleSend}
              disabled={isLoading || !newMessage.trim()}
            >
              <SendIcon size={20} className="fill-current" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIChatPage;