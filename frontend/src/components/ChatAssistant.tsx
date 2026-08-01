import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Send, Sparkles, X } from 'lucide-react';
import { ChatMessage, streamChat } from '../api/chatApi';

interface ChatAssistantProps {
  authed: boolean;
}

export function ChatAssistant({ authed }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!authed) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const history: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setInput('');
    setMessages([...history, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    const appendToLastAssistantMessage = (token: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + token };
        return updated;
      });
    };

    try {
      await streamChat(history, appendToLastAssistantMessage);
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "Sorry, I couldn't respond just now. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Ask the Netflix Assistant"
        className="fixed bottom-24 right-3 sm:bottom-6 sm:right-6 z-[65] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-600/40 transition text-white"
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-40 right-3 left-3 sm:left-auto sm:bottom-24 sm:right-6 z-[65] sm:w-[380px] h-[60vh] sm:h-[520px] bg-[#181818] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-[#1f1f1f] shrink-0">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h3 className="text-white text-sm font-bold">Netflix Assistant</h3>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
              {messages.length === 0 && (
                <p className="text-zinc-500 text-xs">
                  Ask me what to watch tonight - I know everything in the catalog.
                </p>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'self-end bg-red-600 text-white'
                      : 'self-start bg-white/10 text-zinc-100'
                  }`}
                >
                  {m.content || (isStreaming && idx === messages.length - 1 ? '...' : '')}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#1f1f1f] shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a movie or show..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white shrink-0 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
