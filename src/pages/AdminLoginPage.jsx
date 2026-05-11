import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { ShieldAlert, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import './AuthPage.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Authenticate with Supabase Auth
      const data = await login(email, password);
      const user = data?.user;

      if (!user) {
        throw new Error("Login failed: User data missing.");
      }

      // 2. Fetch profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile && profile.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Unauthorized access. Admin credentials required.');
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-sphere sphere-1" style={{ background: 'var(--accent-neon)' }}></div>
        <div className="gradient-sphere sphere-2" style={{ background: 'var(--accent-gold)' }}></div>
      </div>
      
      <motion.div 
        className="auth-box glass-panel admin-login-box"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <ShieldAlert className="brand-icon" size={40} color="var(--accent-neon)" />
          <h1 className="text-gradient-gold">ADMIN ACCESS</h1>
          <p className="subtitle">Secure portal for fleet management.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Security Key" 
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="glass-button primary submit-btn admin-submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Authenticate'}
            {!isLoading && <ChevronRight size={18} />}
          </button>
        </form>

        <p className="toggle-auth">
          Not an admin? <span onClick={() => navigate('/login')}>Customer Login</span>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
