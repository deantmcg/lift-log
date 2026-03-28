import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';

export function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      await storage.login(username.trim(), password.trim());
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="xscreen" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: 24, background: 'var(--surf)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}>Lift<span style={{ color: 'var(--accent)' }}>Log</span></div>
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Log in to access your workouts</div>
        
        {error && <div style={{ background: '#ff3d5c20', color: '#ff3d5c', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="flbl" style={{ marginBottom: 6 }}>Username or Email</div>
            <input 
              className="fin" 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Username" 
              autoComplete="username" 
            />
          </div>
          <div>
            <div className="flbl" style={{ marginBottom: 6 }}>Password</div>
            <input 
              className="fin" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              autoComplete="current-password" 
            />
          </div>
          <button 
            type="submit" 
            className="new-tmpl-btn" 
            style={{ marginTop: 8 }} 
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

LoginScreen.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired
};
