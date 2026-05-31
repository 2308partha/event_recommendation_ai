import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '../../types/github_types';
import { useApi } from '../../hooks/useApi';

const HELP_PROMPTS = [
  "Is there any hackathon happening?",
  "When is the Competitive Programming meetup?",
  "How do I register for an event?",
  "Tell me about Decibel Music Fest"
];

export const ChatbotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const api = useApi();
  
  // Track conversational session ID
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: "Hi! I am Nexus AI, your campus assistant. 🧠✨ Ask me about upcoming hackathons, tech workshops, music fests, or how to register and earn coins!",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Send chat message to real FastAPI backend /chat
      const res = await api.post('/api/v1/github-feed/chat', {
        session_id: sessionId,
        message: textToSend
      });
      
      const replyText = res.data?.reply || res.data?.response || res.data?.message || "Sorry, I couldn't process that.";
      
      setMessages(prev => [...prev, {
        id: `reply_${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        sender: 'bot',
        text: "Sorry, I ran into a connection glitch.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white flex items-center justify-center shadow-2xl shadow-violet-500/30 hover:from-violet-750 hover:to-fuchsia-600 transition-all glow-primary relative"
          aria-label="Toggle Chat Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          
          {/* Subtle heartbeat dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-fuchsia-400 border-2 border-white dark:border-slate-950 animate-ping" />
          )}
        </motion.button>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[500px] rounded-3xl glassmorphism shadow-2xl border border-slate-200/50 dark:border-slate-800/50 z-40 overflow-hidden flex flex-col justify-between"
          >
            
            {/* Header info */}
            <div className="p-4 bg-gradient-to-r from-violet-600/90 to-fuchsia-500/90 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-200" />
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm leading-none">Nexus AI</h4>
                  <p className="text-[10px] text-violet-200 mt-1 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online Assistant (RAG Enabled)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Conversational Bubbles Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs text-left ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-500/10'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-none px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Nexus AI is thinking...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick helper questions list (shown when chat has only welcome/low messages) */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 py-2 bg-slate-50/20 dark:bg-slate-950/10 border-t border-slate-200/10 text-left">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Suggested Questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {HELP_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[10px] text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-900 dark:hover:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/10 transition-colors font-semibold cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar Footer */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputValue);
                }}
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/60 border border-transparent focus:border-violet-500/50 dark:focus:border-violet-400/50 outline-none text-slate-700 dark:text-slate-300 transition-all"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-white transition-colors cursor-pointer flex-shrink-0 glow-primary shadow-md shadow-violet-500/5"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
