import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken, logID = null) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (logID) {
      localStorage.setItem('logID', logID);
      localStorage.setItem('loginTimestamp', Date.now().toString());
    }
  };

  const logout = async () => {
    const logID = localStorage.getItem('logID');
    const loginTimestamp = parseInt(localStorage.getItem('loginTimestamp') || '0');
    const durationMin = loginTimestamp ? (Date.now() - loginTimestamp) / 60000 : 0;
    try {
      await authAPI.logout(logID, durationMin);
    } catch (_) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('logID');
    localStorage.removeItem('loginTimestamp');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
