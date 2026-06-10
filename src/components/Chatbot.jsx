import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

const WELCOME = 'Hi! I am your Healytics AI assistant. Describe your symptoms and I will help identify the right specialist and urgency level. 🏥';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.send(updatedMessages.filter((m) => m.role !== 'bot' || m.text !== WELCOME));
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (err) {
      const errText = err.response?.data?.message || 'Connection error. Please try again.';
      setMessages((prev) => [...prev, { role: 'bot', text: `⚠️ ${errText}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'bot', text: WELCOME }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-xl border flex flex-col" style={{ height: '440px' }}>
          {/* Header */}
          <div className="p-3 border-b flex items-center gap-2 bg-blue-600 rounded-t-2xl">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-white font-medium text-sm flex-1">Healytics AI</span>
            <button
              onClick={handleReset}
              className="text-white/70 hover:text-white text-xs mr-1"
              title="New conversation"
            >
              ↺
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-green-100 text-lg leading-none">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs mr-1.5 mt-auto flex-shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[220px] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-end gap-1.5">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">
                  🤖
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms..."
              disabled={loading}
              className="flex-1 border rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors ml-auto"
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;
