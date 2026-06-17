import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function EmailAuth({ onComplete }) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
    } else if (res.message) {
      setMessage(res.message);
      // Optional: Clear fields on success message (like "check email")
      setEmail('');
      setPassword('');
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="email-auth">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="word-input"
          style={{ width: '100%', fontSize: '14px', padding: '8px', height: 'auto', letterSpacing: 'normal' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="word-input"
          style={{ width: '100%', fontSize: '14px', padding: '8px', height: 'auto', letterSpacing: 'normal' }}
        />
        <button type="submit" className="btn btn--primary btn--sm" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Processing...' : 'Login or Sign Up'}
        </button>
        {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
        {message && <p style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>{message}</p>}
      </form>
    </div>
  );
}
