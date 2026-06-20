import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

export const GRADIENTS = [
  'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', // Red
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Green
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // Orange
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
];

export const EMOJIS = ['🧩', '🎲', '🎯', '👾', '🦊', '🐼', '🦁', '🦉', '🚀', '💡', '🏆', '✨'];

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarType, setAvatarType] = useState('gradient'); // 'gradient' | 'emoji'
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const modalRef = useRef(null);

  // Sync state with user metadata when opened
  useEffect(() => {
    if (isOpen && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(user.user_metadata?.full_name || '');
      
      const metaEmoji = user.user_metadata?.avatar_emoji;
      const metaColor = user.user_metadata?.avatar_color;

      if (metaEmoji) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvatarType('emoji');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedEmoji(metaEmoji);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvatarType('gradient');
        if (metaColor && GRADIENTS.includes(metaColor)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedGradient(metaColor);
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage('');
    }
  }, [isOpen, user]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await updateProfile({
        fullName,
        avatarColor: avatarType === 'gradient' ? selectedGradient : null,
        avatarEmoji: avatarType === 'emoji' ? selectedEmoji : null,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update profile.');
      } else {
        setMessage('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay animate-fade-in" onClick={handleOverlayClick}>
      <div className="auth-modal" ref={modalRef} style={{ maxWidth: '480px' }}>
        <button className="auth-modal__close" onClick={onClose} aria-label="Close modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-modal__header">
          <div className="auth-modal__logo-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className="auth-modal__title">Edit Profile</h2>
          <p className="auth-modal__subtitle">Customize your player name and board appearance</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert--error animate-slide-up">
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="auth-alert auth-alert--success animate-slide-up">
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal__form">
          <div className="auth-input-wrapper">
            <label className="auth-label">Display Name</label>
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
                placeholder="Guest Player"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-wrapper">
            <label className="auth-label">Avatar Style</label>
            <div className="auth-modal__tabs" style={{ marginBottom: 12 }}>
              <button 
                className={`auth-modal__tab ${avatarType === 'gradient' ? 'auth-modal__tab--active' : ''}`}
                onClick={() => setAvatarType('gradient')}
                type="button"
              >
                Gradient + Initials
              </button>
              <button 
                className={`auth-modal__tab ${avatarType === 'emoji' ? 'auth-modal__tab--active' : ''}`}
                onClick={() => setAvatarType('emoji')}
                type="button"
              >
                Emoji Icon
              </button>
            </div>

            {avatarType === 'gradient' ? (
              <div>
                <p style={{ fontSize: 11, color: 'var(--ui-muted)', marginBottom: 8 }}>Choose Background Gradient</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {GRADIENTS.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedGradient(g)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        background: g,
                        border: selectedGradient === g ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: selectedGradient === g ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                        cursor: 'pointer',
                        transform: selectedGradient === g ? 'scale(1.05)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title="Select background color"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 11, color: 'var(--ui-muted)', marginBottom: 8 }}>Choose Emoji Character</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {EMOJIS.map((e, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedEmoji(e)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: selectedEmoji === e ? '2px solid var(--ui-accent)' : '1px solid rgba(255,255,255,0.08)',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transform: selectedEmoji === e ? 'scale(1.05)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title="Select Emoji"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visual Avatar Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: avatarType === 'gradient' ? selectedGradient : 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: avatarType === 'gradient' ? '18px' : '28px',
                fontWeight: '700',
                color: '#fff',
                textTransform: 'uppercase',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            >
              {avatarType === 'gradient' ? (fullName ? fullName.slice(0, 2) : 'GP') : selectedEmoji}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{fullName || 'Guest Player'}</p>
              <p style={{ fontSize: 11, color: 'var(--ui-muted)' }}>Avatar Preview</p>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn--primary auth-submit-btn" 
            disabled={loading}
            style={{ marginTop: 16 }}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
