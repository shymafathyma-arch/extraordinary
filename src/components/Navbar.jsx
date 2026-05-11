import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Menu, X, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, currencies, changeCurrency } = useData();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="navbar-container">
        <div className="logo text-gradient-gold">EXTRAORDINARY</div>
        
        <div className="nav-links desktop-only">
          <a href="#fleet" className="nav-link">Fleet</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#locations" className="nav-link">Locations</a>
          <button onClick={() => navigate('/compare')} className="nav-link-btn">Compare</button>
          {currentUser?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="admin-link-nav">
              <ShieldCheck size={16} /> Admin Panel
            </button>
          )}
        </div>

        <div className="nav-actions desktop-only">
          <div className="user-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <User size={18} />
            <span>{currentUser?.displayName || 'Guest'}</span>
            {currentUser?.tier && (
              <span className={`tier-badge tier-${currentUser.tier.toLowerCase()}`}>
                {currentUser.tier}
              </span>
            )}
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
          </button>
          <button onClick={toggleTheme} className="theme-toggle-nav">
            {theme === 'midnight' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="currency-selector glass-panel">
            <select value={currency} onChange={(e) => changeCurrency(e.target.value)}>
              {Object.keys(currencies).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="mobile-menu glass-panel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <a href="#fleet" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Fleet</a>
          <button onClick={() => { navigate('/compare'); setMobileMenuOpen(false); }} className="nav-link-btn">Compare</button>
          <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</a>
          <div className="divider"></div>
          <div className="mobile-actions">
            <button onClick={toggleTheme} className="theme-toggle-nav">
              {theme === 'midnight' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <select value={currency} onChange={(e) => changeCurrency(e.target.value)} className="mobile-currency">
              {Object.keys(currencies).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <button onClick={logout} className="glass-button primary">Sign Out</button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
