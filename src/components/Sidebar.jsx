import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const patientMenu = [
    { label: 'Home', icon: '🏠', path: '/patient' },
    { label: 'Medical File', icon: '📋', path: '/patient/medical-file' },
    { label: 'Appointments', icon: '📅', path: '/patient/appointments' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/patient/doctors' },
    { label: 'Pharmacies', icon: '💊', path: '/patient/pharmacies' },
    { label: 'Hospitals', icon: '🏥', path: '/patient/hospitals' },
  ];

  const doctorMenu = [
    { label: 'Dashboard', icon: '🏠', path: '/doctor' },
    { label: 'My Schedule', icon: '📅', path: '/doctor/schedule' },
    { label: 'Patient Search', icon: '🔍', path: '/doctor/patients' },
  ];

  const adminMenu = [
    { label: 'Dashboard', icon: '🏠', path: '/admin' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/admin/doctors' },
    { label: 'Patients', icon: '🧑‍⚕️', path: '/admin/patients' },
    { label: 'Activity Log', icon: '📊', path: '/admin/logs' },
  ];

  const getMenu = () => {
    if (user?.role === 'Patient') return patientMenu;
    if (user?.role === 'Doctor') return doctorMenu;
    if (user?.role === 'Admin') return adminMenu;
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    Patient: 'bg-green-500',
    Doctor: 'bg-blue-500',
    Admin: 'bg-purple-500',
  };

  return (
    <div className="w-52 min-h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b flex items-center gap-2">
        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">H</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">Healytics</span>
      </div>

      {/* Menu */}
      <div className="flex-1 py-3">
        <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
          Menu
        </div>
        {getMenu().map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm transition-all mb-1 ${
              location.pathname === item.path
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
            style={{ width: 'calc(100% - 8px)' }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* User */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-full ${roleColors[user?.role] || 'bg-gray-400'} flex items-center justify-center`}>
            <span className="text-white text-xs font-medium">
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">{user?.fullName}</div>
            <div className="text-xs text-gray-400">{user?.role}</div>
          </div>
        </div>
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