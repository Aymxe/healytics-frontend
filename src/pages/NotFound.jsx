import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const home = user?.role === 'Doctor' ? '/doctor'
    : user?.role === 'Admin' ? '/admin'
    : user ? '/patient'
    : '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-8xl font-bold text-gray-200 mb-2">404</div>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
          🏥
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate(home)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          ← Go back home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
