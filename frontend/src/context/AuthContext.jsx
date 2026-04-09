import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Set default base URL for API calls
const rawUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
let normalizedUrl = rawUrl;

// Ensure it starts with https:// if it looks like a domain and lacks it
if (normalizedUrl && !normalizedUrl.startsWith('http')) {
  normalizedUrl = `https://${normalizedUrl}`;
}

// Aggressively strip trailing slashes and /api because our routes add it
if (normalizedUrl.endsWith('/')) normalizedUrl = normalizedUrl.slice(0, -1);
if (normalizedUrl.endsWith('/api')) normalizedUrl = normalizedUrl.slice(0, -4);

axios.defaults.baseURL = normalizedUrl;
console.log('[API] Initialized with Base URL:', axios.defaults.baseURL);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data.data);
        } catch (err) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
