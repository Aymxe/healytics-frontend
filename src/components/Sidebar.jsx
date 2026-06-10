import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { adminAPI, messagesAPI } from '../services/api';

const HELP_ITEMS = [
  {
    q: 'How do I update my appointment status?',
    a: 'Open any appointment from your Dashboard or Schedule, then click "✓ Done" or "✕ Cancel" to update its status.',
  },
  {
    q: 'How do I add a medical record for a patient?',
    a: 'Go to Patient Search, select the patient, then click "+ Add Medical Record" at the bottom of the detail panel.',
  },
  {
    q: 'Where can I see my weekly schedule?',
    a: 'Click "My Schedule" in the sidebar. Your working days and hours are shown at the top, followed by all appointments grouped by date.',
  },
  {
    q: 'What does "Pending" status mean?',
    a: '"Pending" means the appointment is booked but not yet confirmed or seen. Mark it as "Completed" after the visit.',
  },
  {
    q: 'Who do I contact for technical issues?',
    a: 'Use the "Contact Admin" tab in this panel to reach the system administrator directly.',
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [adminContacts, setAdminContacts] = useState([]);
  const [openHelp, setOpenHelp] = useState(null);
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgUnread, setMsgUnread] = useState(0);
  const [helpUnread, setHelpUnread] = useState(0);

  const panelRef = useRef(null);

  // Fetch unread counts based on role
  useEffect(() => {
    if (user?.role === 'Admin') {
      messagesAPI.getUnreadCount()
        .then((res) => setMsgUnread(res.data.count))
        .catch(() => {});
    }
    if (user?.role === 'Patient' || user?.role === 'Doctor') {
      messagesAPI.getNewReplies()
        .then((res) => setHelpUnread(res.data.count))
        .catch(() => {});
    }
  }, [user]);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load admin contacts when panel opens on Contact tab
  useEffect(() => {
    if (profileOpen && activeTab === 'contact' && adminContacts.length === 0) {
      adminAPI.getContact()
        .then((res) => setAdminContacts(res.data))
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileOpen, activeTab]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      await messagesAPI.send(
        msgSubject.trim() || 'Support Request',
        messageText.trim()
      );
      setMessageSent(true);
      setMessageText('');
      setMsgSubject('');
      setTimeout(() => setMessageSent(false), 4000);
    } catch (err) {
      console.error('Failed to send message:', err.response?.data || err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const patientMenu = [
    { label: 'Home', icon: '🏠', path: '/patient' },
    { label: 'Medical File', icon: '📋', path: '/patient/medical-file' },
    { label: 'Appointments', icon: '📅', path: '/patient/appointments' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/patient/doctors' },
    { label: 'Pharmacies', icon: '💊', path: '/patient/pharmacies' },
    { label: 'Hospitals', icon: '🏥', path: '/patient/hospitals' },
    { label: 'Help Center', icon: '🎧', path: '/patient/help', badge: helpUnread },
  ];

  const doctorMenu = [
    { label: 'Dashboard', icon: '🏠', path: '/doctor' },
    { label: 'My Schedule', icon: '📅', path: '/doctor/schedule' },
    { label: 'Patient Search', icon: '🔍', path: '/doctor/patients' },
    { label: 'Messages', icon: '📨', path: '/doctor/messages', badge: helpUnread },
  ];

  const adminMenu = [
    { label: 'Dashboard', icon: '🏠', path: '/admin' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/admin/doctors' },
    { label: 'Patients', icon: '🧑‍⚕️', path: '/admin/patients' },
    { label: 'Messages', icon: '📨', path: '/admin/messages', badge: msgUnread },
    { label: 'Activity Log', icon: '📊', path: '/admin/logs' },
  ];

  const getMenu = () => {
    if (user?.role === 'Patient') return patientMenu;
    if (user?.role === 'Doctor') return doctorMenu;
    if (user?.role === 'Admin') return adminMenu;
    return [];
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColors = {
    Patient: 'bg-blue-600',
    Doctor: 'bg-teal-500',
    Admin: 'bg-purple-600',
  };

  const tabs = user?.role === 'Admin'
    ? [{ id: 'settings', label: 'Settings', icon: '⚙️' }]
    : [
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'help', label: 'Help', icon: '❓' },
        { id: 'contact', label: 'Admin', icon: '📨' },
      ];

  return (
    <div className="w-52 min-h-screen bg-white border-r flex flex-col relative">
      {/* Logo */}
      <div className="p-4 border-b flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">H</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">Healytics</span>
      </div>

      {/* Menu */}
      <div className="flex-1 py-3">
        <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
          Menu
        </div>
        {getMenu().map((item) => {
          const isAppointments = item.path === '/patient/appointments';
          const showNotifBadge = isAppointments && unreadCount > 0;
          const showMsgBadge = item.badge > 0;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (item.path === '/admin/messages') setMsgUnread(0);
                if (item.path === '/patient/help') setHelpUnread(0);
                if (item.path === '/doctor/messages') setHelpUnread(0);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm transition-all mb-1 ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
              style={{ width: 'calc(100% - 8px)' }}
            >
              <span>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {showNotifBadge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {showMsgBadge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile section — clickable */}
      <div className="p-3 border-t relative" ref={panelRef}>

        {/* Profile popup panel */}
        {profileOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-700 mb-3">Profile</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${roleColors[user?.role] || 'bg-gray-400'} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-semibold text-sm">{user?.fullName?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{user?.fullName}</div>
                    <div className="text-xs text-gray-400">{user?.role}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-400">ID</span>
                    <span className="font-mono text-gray-600">{user?.refID || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-400">Email</span>
                    <span className="text-gray-600 truncate max-w-[100px]">{user?.email || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-400">Role</span>
                    <span className={`font-medium ${
                      user?.role === 'Doctor' ? 'text-blue-600' :
                      user?.role === 'Patient' ? 'text-green-600' : 'text-purple-600'
                    }`}>{user?.role}</span>
                  </div>
                </div>

                {user?.role !== 'Admin' && (
                  <div className="mt-4 p-2.5 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">
                    To update your profile, contact the system administrator.
                  </div>
                )}
              </div>
            )}

            {/* Help tab */}
            {activeTab === 'help' && (
              <div className="p-3 max-h-72 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-700 mb-3">Frequently Asked Questions</div>
                <div className="space-y-1">
                  {HELP_ITEMS.map((item, i) => (
                    <div key={i} className="rounded-lg border overflow-hidden">
                      <button
                        onClick={() => setOpenHelp(openHelp === i ? null : i)}
                        className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-2"
                      >
                        <span>{item.q}</span>
                        <span className="text-gray-400 flex-shrink-0">{openHelp === i ? '▲' : '▼'}</span>
                      </button>
                      {openHelp === i && (
                        <div className="px-3 pb-3 pt-1 text-xs text-gray-500 bg-blue-50 border-t">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Admin tab */}
            {activeTab === 'contact' && (
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-700 mb-3">System Administrators</div>

                {adminContacts.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-3">Loading...</div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {adminContacts.map((admin, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                            {admin.FullName?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-800">{admin.FullName}</div>
                            <div className="text-xs text-gray-400">{admin.Role}</div>
                          </div>
                        </div>
                        {admin.Email && (
                          <a
                            href={`mailto:${admin.Email}`}
                            className="text-xs text-blue-500 hover:underline block truncate"
                          >
                            ✉️ {admin.Email}
                          </a>
                        )}
                        {admin.Phone && (
                          <div className="text-xs text-gray-500 mt-0.5">📞 {admin.Phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs font-medium text-gray-700 mb-2">Send a message</div>
                {messageSent ? (
                  <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="font-semibold mb-0.5">✓ Message sent!</div>
                    <div className="text-green-500">The admin will reply shortly.</div>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      placeholder="Subject (optional)"
                      className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 mb-2"
                    />
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Describe your issue or question..."
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:border-blue-400 mb-2"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendingMsg}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 rounded-lg disabled:opacity-40 transition-colors"
                    >
                      {sendingMsg ? 'Sending...' : 'Send to admin →'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Clickable profile row */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`w-full flex items-center gap-2 mb-2 rounded-lg px-1 py-1 transition-colors ${
            profileOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <div className={`w-7 h-7 rounded-full ${roleColors[user?.role] || 'bg-gray-400'} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xs font-medium">
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-gray-800 truncate">{user?.fullName}</div>
            <div className="text-xs text-gray-400">{user?.role}</div>
          </div>
          <span className="text-gray-400 text-xs">{profileOpen ? '▼' : '▲'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-xs text-red-500 hover:text-red-600 py-1 text-left px-1"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
