import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi! I am your Healytics assistant. Describe your symptoms and I will recommend the right doctor or hospital. 🏥',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const symptomResponses = {
    chest: { reply: 'Chest pain can be serious. I recommend seeing a Cardiologist immediately. Koç University Hospital and Acıbadem Maslak Hospital have excellent cardiology departments.', urgency: '🔴 Urgent' },
    headache: { reply: 'Persistent headaches may need a Neurologist. Florence Nightingale Hospital and Acıbadem Maslak have great neurology teams.', urgency: '🟡 Routine' },
    fever: { reply: 'For fever, a General Practitioner is usually the first step. Okmeydanı Training Hospital or Medipol Mega are good options.', urgency: '🟡 Routine' },
    back: { reply: 'Back pain is often treated by a Physiotherapist or Orthopedic specialist. Memorial Şişli and Hisar Intercontinental Hospital are recommended.', urgency: '🟡 Routine' },
    child: { reply: 'For children, you need a Pediatrician. Amerikan Hastanesi and Anadolu Medical Center have excellent pediatrics departments.', urgency: '🟡 Routine' },
    knee: { reply: 'Knee or joint pain is handled by Orthopedic specialists. Memorial Şişli Hospital is highly recommended.', urgency: '🟡 Routine' },
    stomach: { reply: 'Stomach issues are usually treated by a General Practitioner. Start with Okmeydanı Training Hospital or Medipol Mega.', urgency: '🟢 Routine' },
    breath: { reply: 'Breathing difficulties can be serious. Please visit a Cardiologist or General Emergency. Medipol Mega and Koç University Hospital are recommended.', urgency: '🔴 Urgent' },
  };

  const getResponse = (text) => {
    const lower = text.toLowerCase();
    for (const [keyword, response] of Object.entries(symptomResponses)) {
      if (lower.includes(keyword)) {
        return `${response.urgency}\n\n${response.reply}\n\n⚠️ This is not a medical diagnosis. Please consult a doctor.`;
      }
    }
    return "I understand you're not feeling well. Could you describe your symptoms in more detail? For example: chest pain, headache, fever, back pain, etc.\n\n⚠️ This is not a medical diagnosis.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const botReply = { role: 'bot', text: getResponse(input) };
      setMessages((prev) => [...prev, botReply]);
      setLoading(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat window */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-xl border flex flex-col" style={{ height: '420px' }}>
          {/* Header */}
          <div className="p-3 border-b flex items-center gap-2 bg-green-500 rounded-t-2xl">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-white font-medium text-sm">Healytics Assistant</span>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-white hover:text-green-100 text-lg">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms..."
              className="flex-1 border rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-green-400"
            />
            <button
              onClick={sendMessage}
              className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 flex-shrink-0"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors ml-auto"
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;