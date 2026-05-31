import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">H</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">Healytics</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{user?.fullName}</span>
        <span className={`text-xs text-white px-2 py-1 rounded-full ${roleColors[user?.role] || 'bg-gray-400'}`}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Navbar;