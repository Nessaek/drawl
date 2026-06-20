import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, updatePassword } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot' | 'update'
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showSignUpHint, setShowSignUpHint] = useState(false);

  const modalRef = useRef(null);

  // Sync mode with initialMode if it changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(initialMode);
    setError('');
    setMessage('');
    setShowSignUpHint(false);
  }, [initialMode, isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && mode !== 'update') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mode]);

  if (!isOpen) return null;

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setShowSignUpHint(false);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking direct backdrop, and not in recovery update mode
    if (modalRef.current && !modalRef.current.contains(e.target) && mode !== 'update') {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Form validations
    if (mode === 'signup' || mode === 'update') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          if (res.userNotFound) {
            setError('No account found with this email. Would you like to create one?');
            // We can add a helper state to show a "Sign Up instead" button more prominently
            setShowSignUpHint(true);
          } else {
            setError(res.error.message || 'Invalid login credentials.');
          }
        } else if (res.message) {
          setMessage(res.message);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setError(res.error.message || 'Registration failed.');
        } else if (res.message) {
          setMessage(res.message);
          setEmail('');
          setFullName('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setMessage('Sign up successful! Please check your email.');
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.error) {
          setError(res.error.message || 'Failed to send reset email.');
        } else {
          setMessage('Password reset link sent! Check your email.');
          setEmail('');
        }
      } else if (mode === 'update') {
        const res = await updatePassword(password);
        if (res.error) {
          setError(res.error.message || 'Failed to update password.');
        } else {
          setMessage('Password updated successfully!');
          setPassword('');
          setConfirmPassword('');
          // Clear URL hash recovery param
          if (window.location.hash.includes('type=recovery')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay animate-fade-in" onClick={handleOverlayClick}>
      <div className="auth-modal" ref={modalRef}>
        {mode !== 'update' && (
          <button className="auth-modal__close" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        <div className="auth-modal__header">
          <div className="auth-modal__logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h2 className="auth-modal__title">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'update' && 'Update Password'}
          </h2>
          <p className="auth-modal__subtitle">
            {mode === 'login' && 'Sign in to sync your online scrabble board'}
            {mode === 'signup' && 'Register to play online games with friends'}
            {mode === 'forgot' && 'Enter your email to receive a recovery link'}
            {mode === 'update' && 'Enter your new account password'}
          </p>
        </div>

        {/* Tabs for Login / Signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="auth-modal__tabs">
            <button 
              className={`auth-modal__tab ${mode === 'login' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => handleTabChange('login')}
              type="button"
            >
              Log In
            </button>
            <button 
              className={`auth-modal__tab ${mode === 'signup' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => handleTabChange('signup')}
              type="button"
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div className="auth-alert auth-alert--error animate-slide-up">
            <svg className="auth-alert__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span>{error}</span>
              {showSignUpHint && (
                <button 
                  type="button"
                  className="btn btn--primary btn--sm" 
                  onClick={() => handleTabChange('signup')}
                  style={{ width: 'fit-content' }}
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className="auth-alert auth-alert--success animate-slide-up">
            <svg className="auth-alert__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal__form">
          {/* Display Name input (used in signup) */}
          {mode === 'signup' && (
            <div className="auth-input-wrapper">
              <label className="auth-label">Display Name / Full Name</label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. WordMaster"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email input (used in login, signup, forgot) */}
          {mode !== 'update' && (
            <div className="auth-input-wrapper">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Password input (used in login, signup, update) */}
          {mode !== 'forgot' && (
            <div className="auth-input-wrapper">
              <div className="auth-label-row">
                <label className="auth-label">
                  {mode === 'update' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    className="auth-text-link auth-text-link--sm" 
                    onClick={() => setMode('forgot')}
                    tabIndex="-1"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password input (used in signup, update) */}
          {(mode === 'signup' || mode === 'update') && (
            <div className="auth-input-wrapper">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-container">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn--primary auth-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner-container">
                <svg className="auth-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"></circle>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {mode === 'login' && 'Log In'}
                {mode === 'signup' && 'Sign Up'}
                {mode === 'forgot' && 'Send Reset Link'}
                {mode === 'update' && 'Update Password'}
              </>
            )}
          </button>
        </form>

      {/* Alternative Actions / Back to login */}
      {mode === 'forgot' && (
        <button 
          type="button" 
          className="btn btn--ghost auth-back-btn" 
          onClick={() => handleTabChange('login')}
          disabled={loading}
        >
          Back to Log In
        </button>
      )}

      {/* Social Authentication (Google) */}
      {(mode === 'login' || mode === 'signup') && (
        <>
          <div className="auth-divider">
            <span>or</span>
          </div>
          
          <button 
            type="button" 
            className="google-auth-btn" 
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="google-auth-btn__logo">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </>
      )}
    </div>
  </div>
);
}
