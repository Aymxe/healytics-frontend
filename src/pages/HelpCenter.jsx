import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { messagesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const STATUS_BADGE = {
  Unread:  'bg-yellow-100 text-yellow-700',
  Read:    'bg-gray-100 text-gray-500',
  Replied: 'bg-green-100 text-green-700',
};

const STATUS_LABEL = {
  Unread:  'Sent',
  Read:    'Seen by Admin',
  Replied: '✓ Admin replied',
};

const HelpCenter = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await messagesAPI.getMine();
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSelect = async (msg) => {
    setSelected(msg);
    setShowNew(false);
    // Mark reply as seen if it's a new reply the patient hasn't read
    if (msg.Status === 'Replied' && !msg.PatientRead) {
      await messagesAPI.markSeen(msg.MessageID).catch(() => {});
      setMessages((prev) =>
        prev.map((m) =>
          m.MessageID === msg.MessageID ? { ...m, PatientRead: 1 } : m
        )
      );
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await messagesAPI.send(subject.trim() || 'Support Request', body.trim());
      showToast('Message sent! The support team will reply shortly.', 'success');
      setSubject('');
      setBody('');
      setShowNew(false);
      await fetchMessages();
    } catch (err) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const newReplies = messages.filter((m) => m.Status === 'Replied' && !m.PatientRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/patient')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <span className="text-sm font-medium text-gray-800 flex-1">Help Center</span>
          <div className="flex items-center gap-3">
            {newReplies > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {newReplies} new {newReplies === 1 ? 'reply' : 'replies'}
              </span>
            )}
            <button
              onClick={() => { setShowNew(true); setSelected(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
            >
              + New message
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Message list */}
          <div className="w-72 border-r bg-white flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                My messages ({messages.length})
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-12 px-4">
                  <div className="text-3xl mb-2">💬</div>
                  No messages yet.<br />Click "+ New message" to get help.
                </div>
              ) : (
                messages.map((msg) => {
                  const isFromAdmin = msg.Direction === 'ToUser';
                  const hasNewReply = msg.Status === 'Replied' && !msg.PatientRead;
                  const isUnreadAdminMsg = isFromAdmin && msg.Status === 'Unread';
                  return (
                    <button
                      key={msg.MessageID}
                      onClick={() => handleSelect(msg)}
                      className={`w-full text-left px-4 py-3 border-b transition-colors ${
                        selected?.MessageID === msg.MessageID
                          ? 'bg-blue-50 border-l-2 border-l-blue-600'
                          : isUnreadAdminMsg
                          ? 'bg-purple-50 hover:bg-purple-100'
                          : hasNewReply
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isFromAdmin
                            ? 'bg-purple-100 text-purple-700'
                            : STATUS_BADGE[msg.Status]
                        }`}>
                          {isFromAdmin ? 'From Admin' : STATUS_LABEL[msg.Status]}
                        </span>
                        {(isUnreadAdminMsg || hasNewReply) && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                        )}
                      </div>
                      <div className={`text-sm truncate ${(isUnreadAdminMsg || hasNewReply) ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                        {msg.Subject}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(msg.SentAt).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail / New message panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* New message form */}
            {showNew && (
              <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-2xl border p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl">
                      💬
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-800">New support message</div>
                      <div className="text-xs text-gray-400">Our team will reply as soon as possible</div>
                    </div>
                  </div>

                  <form onSubmit={handleSend}>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Subject <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Appointment issue, Account problem..."
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                        required
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={!body.trim() || sending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-xl disabled:opacity-40 transition-colors"
                      >
                        {sending ? 'Sending...' : 'Send message'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNew(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-5 py-3 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Message detail */}
            {selected && !showNew && (
              <div className="max-w-xl mx-auto">
                {selected.Direction === 'ToUser' ? (
                  /* Admin-initiated message */
                  <div className="bg-white rounded-2xl border p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        A
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Healytics Admin</div>
                        <div className="text-xs text-gray-400">{new Date(selected.SentAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">{selected.Subject}</div>
                    <div className="bg-purple-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selected.Body}
                    </div>
                    <button
                      onClick={() => { setShowNew(true); setSubject(`Re: ${selected.Subject}`); setSelected(null); }}
                      className="mt-4 text-xs text-purple-700 hover:underline font-medium"
                    >
                      Reply to Admin →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* User-sent message */}
                    <div className="bg-white rounded-2xl border p-5 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold text-gray-800">{selected.Subject}</div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[selected.Status]}`}>
                          {STATUS_LABEL[selected.Status]}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">
                        Sent on {new Date(selected.SentAt).toLocaleString()}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selected.Body}
                      </div>
                    </div>

                    {/* Admin reply */}
                    {selected.ReplyBody ? (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            H
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-green-800">Healytics Support</div>
                            <div className="text-xs text-green-600">
                              {selected.RepliedAt ? new Date(selected.RepliedAt).toLocaleString() : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">
                          {selected.ReplyBody}
                        </div>
                        <button
                          onClick={() => { setShowNew(true); setSubject(`Re: ${selected.Subject}`); setSelected(null); }}
                          className="mt-4 text-xs text-green-700 hover:underline font-medium"
                        >
                          Send a follow-up →
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                        <div className="text-sm text-amber-700 font-medium mb-1">Waiting for reply</div>
                        <div className="text-xs text-amber-600">
                          Our support team has received your message and will reply soon.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Empty state */}
            {!selected && !showNew && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-5xl mb-4">🎧</div>
                <div className="text-sm font-medium text-gray-600 mb-1">Healytics Help Center</div>
                <div className="text-xs text-center max-w-xs">
                  Have a question or issue? Send a message and our support team will get back to you.
                </div>
                <button
                  onClick={() => setShowNew(true)}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Send your first message →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
