import { useState } from 'react';
import EmailAuth from './EmailAuth';

export default function SetupPanel({ onDeal, dictStatus, gameId, onCreateGame, onJoinGame, user, onSignInGoogle }) {
  const [numCons, setNumCons] = useState(5);
  const [numVow, setNumVow] = useState(4);
  const [joinId, setJoinId] = useState('');
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  const total = numCons + numVow;

  function handleCons(v) {
    let c = parseInt(v), vow = numVow;
    if (c + vow > 9) vow = 9 - c;
    if (c + vow < 4) vow = Math.max(1, 4 - c);
    setNumCons(c); setNumVow(vow);
  }
  function handleVow(v) {
    let vow = parseInt(v), c = numCons;
    if (c + vow > 9) c = 9 - vow;
    if (c + vow < 4) c = Math.max(1, 4 - vow);
    setNumVow(vow); setNumCons(c);
  }

  const shareUrl = gameId 
    ? `${window.location.origin}${window.location.pathname}#${gameId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="setup-panel">
      <h2 className="setup-title">New game</h2>
      
      {!gameId ? (
        <div style={{ marginBottom: 24 }}>
          <p className="setup-desc">Start a private game to play with a friend.</p>
          
          {user ? (
            <button className="btn btn--primary" onClick={onCreateGame} style={{ width: '100%', marginBottom: 16 }}>
              Create Online Game
            </button>
          ) : (
            <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ fontSize: 12, marginBottom: 8 }}>Please sign in to create online games.</p>
              {showEmailAuth ? (
                <EmailAuth onComplete={() => setShowEmailAuth(false)} />
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--primary btn--sm" onClick={onSignInGoogle} style={{ flex: 1 }}>
                    Google
                  </button>
                  <button className="btn btn--primary btn--sm" onClick={() => setShowEmailAuth(true)} style={{ flex: 1 }}>
                    Email
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--ui-border)', paddingTop: 16 }}>
            <p className="pill-label">Or Join Existing</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input 
                className="word-input"
                style={{ flex: 1, fontSize: 14, padding: '6px 10px', height: 'auto', letterSpacing: 'normal' }}
                placeholder="Game ID (e.g. abc123)"
                value={joinId}
                onChange={e => setJoinId(e.target.value.toLowerCase())}
              />
              <button 
                className="btn btn--ghost" 
                onClick={() => onJoinGame(joinId)}
                disabled={!joinId}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px dashed var(--ui-border)' }}>
          <p className="pill-label">Game Link</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input 
              readOnly 
              value={shareUrl} 
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--ui-text)', fontSize: 11, outline: 'none' }}
              onClick={e => e.target.select()}
            />
            <button className="btn btn--ghost btn--sm" onClick={handleCopy} style={{ padding: '4px 8px' }}>
              Copy
            </button>
          </div>
          <p style={{ fontSize: 10, color: 'var(--ui-muted)', marginTop: 8 }}>Share this URL with your opponent</p>
        </div>
      )}

      <p className="setup-desc">Choose how many consonants and vowels you want — like Countdown, but on a Scrabble board.</p>

      <div className="slider-group">
        <div className="slider-row">
          <label className="slider-label">Consonants</label>
          <input type="range" min="1" max="8" value={numCons} onChange={e => handleCons(e.target.value)} />
          <span className="slider-val">{numCons}</span>
        </div>
        <div className="slider-row">
          <label className="slider-label">Vowels</label>
          <input type="range" min="1" max="6" value={numVow} onChange={e => handleVow(e.target.value)} />
          <span className="slider-val">{numVow}</span>
        </div>
        <div className="slider-total">
          {total} tile{total !== 1 ? 's' : ''} total
        </div>
      </div>

      <button
        className="btn btn--primary"
        onClick={() => onDeal(numCons, numVow)}
        disabled={dictStatus === 'loading'}
      >
        {dictStatus === 'loading' ? 'Loading dictionary…' : 'Deal letters →'}
      </button>

      <div className="board-legend">
        <div className="legend-title">Premium squares</div>
        <div className="legend-grid">
          <div className="legend-item"><span className="legend-sq legend-sq--tw" />Triple word</div>
          <div className="legend-item"><span className="legend-sq legend-sq--dw" />Double word</div>
          <div className="legend-item"><span className="legend-sq legend-sq--tl" />Triple letter</div>
          <div className="legend-item"><span className="legend-sq legend-sq--dl" />Double letter</div>
        </div>
      </div>

      {dictStatus === 'fallback' && (
        <p className="dict-warning">⚠ Offline — using built-in word list</p>
      )}
    </div>
  );
}
