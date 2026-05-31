import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('Patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password, role: activeTab });
      login(response.data.user, response.data.token);
      if (activeTab === 'Patient') navigate('/patient');
      else if (activeTab === 'Doctor') navigate('/doctor');
      else if (activeTab === 'Admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Patient', 'Doctor', 'Admin'];
  const tabColors = {
    Patient: 'bg-green-500',
    Doctor: 'bg-blue-500',
    Admin: 'bg-purple-500',
  };
  const btnColors = {
    Patient: 'bg-green-500 hover:bg-green-600',
    Doctor: 'bg-blue-500 hover:bg-blue-600',
    Admin: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Healytics</div>
          <div className="text-xs text-gray-500">Secure Healthcare Intelligence Platform</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border w-full max-w-md p-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm text-gray-600 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${btnColors[activeTab]} text-white py-3 rounded-xl text-sm font-medium mt-4 transition-colors disabled:opacity-50`}
            >
              {loading ? 'Signing in...' : `Sign in as ${activeTab}`}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-400">
            Secured with end-to-end encryption · Healytics v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;