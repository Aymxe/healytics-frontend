import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { messagesAPI, adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ROLE_COLOR = {
  Doctor:  'bg-blue-100 text-blue-700',
  Patient: 'bg-green-100 text-green-700',
  Admin:   'bg-purple-100 text-purple-700',
};

const STATUS_COLOR = {
  Unread:  'bg-red-100 text-red-600',
  Read:    'bg-gray-100 text-gray-500',
  Replied: 'bg-green-100 text-green-700',
};

const AdminMessages = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [view, setView]           = useState('inbox'); // 'inbox' | 'sent'
  const [messages, setMessages]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading]     = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying]   = useState(false);

  // Compose
  const [composeOpen, setComposeOpen]           = useState(false);
  const [composeType, setComposeType]           = useState('Patient');
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject]     = useState('');
  const [composeBody, setComposeBody]           = useState('');
  const [composeSending, setComposeSending]     = useState(false);
  const [recipientList, setRecipientList]       = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const fetchMessages = async (v = view, role = roleFilter) => {
    setLoading(true);
    try {
      const res = await messagesAPI.getAll(
        v === 'sent' ? 'All' : role,
        v === 'sent' ? 'sent' : 'incoming'
      );
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(view, roleFilter); }, [view, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = async (msg) => {
    setSelected(msg);
    setReplyText('');
    if (msg.Status === 'Unread' && view === 'inbox') {
      await messagesAPI.markRead(msg.MessageID).catch(() => {});
      setMessages((prev) => prev.map((m) => m.MessageID === msg.MessageID ? { ...m, Status: 'Read' } : m));
      setSelected((prev) => prev && { ...prev, Status: 'Read' });
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setReplying(true);
    try {
      await messagesAPI.reply(selected.MessageID, replyText);
      showToast('Reply sent.', 'success');
      setMessages((prev) => prev.map((m) => m.MessageID === selected.MessageID ? { ...m, Status: 'Replied', ReplyBody: replyText } : m));
      setSelected((prev) => prev && { ...prev, Status: 'Replied', ReplyBody: replyText });
      setReplyText('');
    } catch {
      showToast('Failed to send reply.', 'error');
    } finally {
      setReplying(false);
    }
  };

  const openCompose = async (type = 'Patient') => {
    setComposeType(type);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
    setComposeOpen(true);
    loadRecipients(type);
  };

  const loadRecipients = async (type) => {
    setLoadingRecipients(true);
    try {
      const res = type === 'Doctor' ? await adminAPI.getDoctors() : await adminAPI.getPatients();
      setRecipientList(res.data);
    } catch {
      setRecipientList([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleComposeTypeChange = (type) => {
    setComposeType(type);
    setComposeRecipient('');
    loadRecipients(type);
  };

  const selectedRecipientName = () => {
    const idKey = composeType === 'Doctor' ? 'DoctorID' : 'PatientID';
    const r = recipientList.find((x) => x[idKey] === composeRecipient);
    return r?.Name || composeRecipient;
  };

  const handleComposeSend = async () => {
    if (!composeRecipient || !composeBody.trim()) return;
    setComposeSending(true);
    try {
      await messagesAPI.sendAsAdmin(composeRecipient, selectedRecipientName(), composeSubject, composeBody);
      showToast('Message sent successfully.', 'success');
      setComposeOpen(false);
      if (view === 'sent') fetchMessages('sent', roleFilter);
    } catch {
      showToast('Failed to send message.', 'error');
    } finally {
      setComposeSending(false);
    }
  };

  const unread = messages.filter((m) => m.Status === 'Unread').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">Messages & Support</span>
          {view === 'inbox' && unread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} unread</span>
          )}
          <button
            onClick={() => openCompose('Patient')}
            className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Compose
          </button>
        </div>

        {/* View toggle: Inbox / Sent */}
        <div className="bg-white border-b px-6 flex gap-1">
          {[['inbox', 'Inbox'], ['sent', 'Sent']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => { setView(v); setSelected(null); setRoleFilter('All'); }}
              className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-colors ${
                view === v ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Message list panel */}
          <div className="w-80 border-r bg-white flex flex-col flex-shrink-0">
            {/* Role filter — only for inbox */}
            {view === 'inbox' && (
              <div className="flex border-b">
                {['All', 'Doctors', 'Patients'].map((f) => {
                  const val = f === 'Doctors' ? 'Doctor' : f === 'Patients' ? 'Patient' : 'All';
                  return (
                    <button
                      key={f}
                      onClick={() => { setRoleFilter(val); setSelected(null); }}
                      className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                        roleFilter === val
                          ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-12">No messages</div>
              ) : (
                messages.map((msg) => (
                  <button
                    key={msg.MessageID}
                    onClick={() => handleSelect(msg)}
                    className={`w-full text-left px-4 py-3 border-b transition-colors ${
                      selected?.MessageID === msg.MessageID
                        ? 'bg-purple-50 border-l-2 border-l-purple-500'
                        : view === 'inbox' && msg.Status === 'Unread'
                        ? 'bg-blue-50 hover:bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {view === 'sent' ? (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-700">
                            To: {msg.RecipientName || msg.RecipientID}
                          </span>
                        ) : (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLOR[msg.SenderRole] || 'bg-gray-100 text-gray-600'}`}>
                            {msg.SenderRole}
                          </span>
                        )}
                        {view === 'inbox' && msg.Status === 'Unread' && (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(msg.SentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`text-sm truncate ${view === 'inbox' && msg.Status === 'Unread' ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                      {view === 'sent' ? (msg.Subject || '(no subject)') : msg.SenderName}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {view === 'sent' ? msg.Body?.slice(0, 50) : msg.Subject}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-4xl mb-3">{view === 'sent' ? '📤' : '📨'}</div>
                <div className="text-sm font-medium">Select a message to view</div>
                <div className="text-xs mt-1">
                  {view === 'sent' ? 'Messages you sent to doctors and patients' : 'Messages from doctors and patients'}
                </div>
              </div>
            ) : view === 'sent' ? (
              /* ── Sent message detail ── */
              <div className="p-6 max-w-2xl">
                <div className="bg-white rounded-xl border p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm flex-shrink-0">
                        A
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">You (Admin)</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          To: <span className="font-medium text-gray-600">{selected.RecipientName || selected.RecipientID}</span>
                          <span className="ml-1 text-gray-400">({selected.RecipientID})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(selected.SentAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-3">Subject: {selected.Subject}</div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selected.Body}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Inbox message detail ── */
              <div className="p-6 max-w-2xl">
                <div className="bg-white rounded-xl border p-5 mb-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                        selected.SenderRole === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {selected.SenderName?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{selected.SenderName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLOR[selected.SenderRole]}`}>
                            {selected.SenderRole}
                          </span>
                          <span className="text-xs text-gray-400">ID: {selected.SenderID}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[selected.Status]}`}>
                        {selected.Status}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">{new Date(selected.SentAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Subject: {selected.Subject}</div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selected.Body}
                  </div>
                </div>

                {selected.ReplyBody && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <div className="text-xs font-semibold text-purple-700 mb-2">
                      Your reply — {selected.RepliedAt ? new Date(selected.RepliedAt).toLocaleString() : ''}
                    </div>
                    <div className="text-sm text-purple-800 whitespace-pre-wrap">{selected.ReplyBody}</div>
                  </div>
                )}

                <div className="bg-white rounded-xl border p-5">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    {selected.ReplyBody ? 'Update reply' : 'Reply to message'}
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none mb-3"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || replying}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl disabled:opacity-40 transition-colors"
                  >
                    {replying ? 'Sending...' : 'Send reply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <span className="text-sm font-semibold text-gray-800">New Message</span>
              <button onClick={() => setComposeOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                {['Patient', 'Doctor'].map((t) => (
                  <button key={t} onClick={() => handleComposeTypeChange(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      composeType === t ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                    }`}
                  >{t}</button>
                ))}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Recipient</label>
                {loadingRecipients ? (
                  <div className="text-xs text-gray-400 py-2">Loading...</div>
                ) : (
                  <select value={composeRecipient} onChange={(e) => setComposeRecipient(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select {composeType}...</option>
                    {recipientList.map((r) => {
                      const id = r[composeType === 'Doctor' ? 'DoctorID' : 'PatientID'];
                      return <option key={id} value={id}>{r.Name} ({id})</option>;
                    })}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subject</label>
                <input type="text" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Schedule update"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Message</label>
                <textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message..." rows={4}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setComposeOpen(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
              <button onClick={handleComposeSend} disabled={!composeRecipient || !composeBody.trim() || composeSending}
                className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-6 py-2 rounded-xl disabled:opacity-40 transition-colors"
              >
                {composeSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
