import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span style={{ color: '#4285F4' }}>E</span>
          <span style={{ color: '#EA4335' }}>x</span>
          <span style={{ color: '#FBBC05' }}>a</span>
          <span style={{ color: '#34A853' }}>m</span>
          <span style={{ color: '#5f6368', marginLeft: '4px', fontWeight: '400' }}>OS</span>
        </Link>
      </div>
      <div className="nav-links">
        <button onClick={toggleDarkMode} className="icon-btn" style={{ marginRight: '1rem' }} title="Toggle Dark Mode">
          {darkMode ? <Sun size={20} color="#fbbc05" /> : <Moon size={20} color="#5f6368" />}
        </button>
        {user ? (
          <>
            <span className="user-info">
              <User size={18} /> {user.username} ({user.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
