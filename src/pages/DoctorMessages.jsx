import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { messagesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const DoctorMessages = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [messages, setMessages]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [sending, setSending]     = useState(false);

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
    const isUnreadAdminMsg = msg.Direction === 'ToUser' && !msg.PatientRead;
    const isUnreadReply    = msg.Status === 'Replied' && !msg.PatientRead;
    if (isUnreadAdminMsg || isUnreadReply) {
      await messagesAPI.markSeen(msg.MessageID).catch(() => {});
      setMessages((prev) => prev.map((m) => m.MessageID === msg.MessageID ? { ...m, PatientRead: 1 } : m));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await messagesAPI.send(subject.trim() || 'Doctor Inquiry', body.trim());
      showToast('Message sent to admin.', 'success');
      setSubject('');
      setBody('');
      setShowNew(false);
      await fetchMessages();
    } catch {
      showToast('Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const newCount = messages.filter(
    (m) => (m.Direction === 'ToUser' && !m.PatientRead) || (m.Status === 'Replied' && !m.PatientRead)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/doctor')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">Messages</span>
          {newCount > 0 && (
            <span className="bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {newCount} new
            </span>
          )}
          <button
            onClick={() => { setShowNew(true); setSelected(null); }}
            className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-4 py-2 rounded-lg transition-colors"
          >
            + New message
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Message list */}
          <div className="w-72 border-r bg-white flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Messages ({messages.length})
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-12 px-4">
                  <div className="text-3xl mb-2">💬</div>
                  No messages yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isFromAdmin  = msg.Direction === 'ToUser';
                  const isNew        = isFromAdmin ? !msg.PatientRead : (msg.Status === 'Replied' && !msg.PatientRead);
                  return (
                    <button
                      key={msg.MessageID}
                      onClick={() => handleSelect(msg)}
                      className={`w-full text-left px-4 py-3 border-b transition-colors ${
                        selected?.MessageID === msg.MessageID
                          ? 'bg-teal-50 border-l-2 border-l-teal-500'
                          : isNew
                          ? 'bg-teal-50 hover:bg-teal-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isFromAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isFromAdmin ? 'From Admin' : (msg.Status === 'Replied' ? '✓ Replied' : 'Sent')}
                        </span>
                        {isNew && <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></span>}
                      </div>
                      <div className={`text-sm truncate ${isNew ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                        {msg.Subject || '(no subject)'}
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
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xl">💬</div>
                    <div>
                      <div className="text-base font-semibold text-gray-800">Message Admin</div>
                      <div className="text-xs text-gray-400">Send a message to the system administrator</div>
                    </div>
                  </div>
                  <form onSubmit={handleSend}>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject <span className="text-gray-400">(optional)</span></label>
                      <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Schedule issue, Patient concern..."
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Message <span className="text-red-400">*</span></label>
                      <textarea value={body} onChange={(e) => setBody(e.target.value)}
                        placeholder="Describe your issue or question..."
                        rows={5} required
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={!body.trim() || sending}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-3 rounded-xl disabled:opacity-40 transition-colors"
                      >
                        {sending ? 'Sending...' : 'Send message'}
                      </button>
                      <button type="button" onClick={() => setShowNew(false)}
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
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
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
                    {/* Doctor-sent message */}
                    <div className="bg-white rounded-2xl border p-5 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold text-gray-800">{selected.Subject || '(no subject)'}</div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          selected.Status === 'Replied' ? 'bg-green-100 text-green-700' :
                          selected.Status === 'Read'    ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selected.Status === 'Replied' ? '✓ Admin replied' : selected.Status === 'Read' ? 'Seen by Admin' : 'Sent'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">Sent on {new Date(selected.SentAt).toLocaleString()}</div>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selected.Body}
                      </div>
                    </div>

                    {selected.ReplyBody ? (
                      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                          <div>
                            <div className="text-sm font-semibold text-teal-800">Healytics Support</div>
                            <div className="text-xs text-teal-600">{selected.RepliedAt ? new Date(selected.RepliedAt).toLocaleString() : ''}</div>
                          </div>
                        </div>
                        <div className="text-sm text-teal-900 leading-relaxed whitespace-pre-wrap">{selected.ReplyBody}</div>
                        <button
                          onClick={() => { setShowNew(true); setSubject(`Re: ${selected.Subject}`); setSelected(null); }}
                          className="mt-4 text-xs text-teal-700 hover:underline font-medium"
                        >
                          Send a follow-up →
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                        <div className="text-sm text-amber-700 font-medium mb-1">Waiting for reply</div>
                        <div className="text-xs text-amber-600">The admin will reply to your message soon.</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Empty state */}
            {!selected && !showNew && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-5xl mb-4">💬</div>
                <div className="text-sm font-medium text-gray-600 mb-1">Doctor Messages</div>
                <div className="text-xs text-center max-w-xs">Messages from admin appear here. You can also send messages to admin.</div>
                <button onClick={() => setShowNew(true)}
                  className="mt-5 bg-teal-500 hover:bg-teal-600 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Send a message →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
