import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileDropdown({ user, onSignOut, onOpenSettings, onJoinGame }) {
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const dropdownRef = useRef(null);

  const metaEmoji = user?.user_metadata?.avatar_emoji;
  const metaColor = user?.user_metadata?.avatar_color;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const { data } = await supabase
          .from('games')
          .select('id, state, updated_at')
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });
        if (data) {
          setGames(data);
        }
      } catch (err) {
        console.error('Error fetching user games:', err);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGames();
  }, [user, isOpen]);

  if (!user) return null;

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        className="profile-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Profile Menu"
      >
        <div 
          className="profile-trigger-avatar"
          style={{
            background: metaEmoji ? 'rgba(255,255,255,0.08)' : (metaColor || 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'),
            fontSize: metaEmoji ? '16px' : '11px',
          }}
        >
          {metaEmoji ? metaEmoji : displayName.slice(0, 2).toUpperCase()}
        </div>
        <span className="profile-trigger-name">{displayName}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transition: 'transform 0.2s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'none',
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="profile-dropdown-menu animate-slide-up">
          {/* User Profile Info Card */}
          <div className="profile-menu-card">
            <div 
              className="profile-card-avatar"
              style={{
                background: metaEmoji ? 'rgba(255,255,255,0.08)' : (metaColor || 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'),
                fontSize: metaEmoji ? '24px' : '16px',
              }}
            >
              {metaEmoji ? metaEmoji : displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="profile-card-info">
              <h4 className="profile-card-name">{displayName}</h4>
              <p className="profile-card-email">{user.email}</p>
            </div>
            
            <button 
              className="profile-card-settings-btn"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              title="Edit Profile"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>

          {/* Active Games Section */}
          <div className="profile-menu-games-section">
            <h5 className="profile-menu-section-title">My Active Games</h5>
            
            {loadingGames ? (
              <div className="profile-menu-loading">
                <svg className="auth-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"></circle>
                </svg>
                <span>Loading games...</span>
              </div>
            ) : games.length === 0 ? (
              <div className="profile-menu-empty-games">
                No online games found. Create one to get started!
              </div>
            ) : (
              <div className="profile-menu-games-list">
                {games.map((game) => {
                  const state = game.state;
                  if (!state || !state.players) return null;
                  
                  const isP1 = state.players[0]?.id === user.id;
                  const opponent = isP1 ? state.players[1] : state.players[0];
                  const opponentName = opponent?.name || 'Waiting...';
                  const activeIndex = state.currentPlayerIndex;
                  const isMyTurn = (isP1 && activeIndex === 0) || (!isP1 && activeIndex === 1);
                  
                  const myScore = isP1 ? state.players[0]?.score : state.players[1]?.score;
                  const oppScore = isP1 ? state.players[1]?.score : state.players[0]?.score;

                  return (
                    <div key={game.id} className="profile-game-card">
                      <div className="profile-game-card-details">
                        <div className="profile-game-card-header">
                          <span className="profile-game-id">#{game.id}</span>
                          <span className={`profile-game-turn-pill ${isMyTurn ? 'profile-game-turn-pill--your-turn' : ''}`}>
                            {isMyTurn ? 'Your Turn' : "Opp's Turn"}
                          </span>
                        </div>
                        <p className="profile-game-opponent">vs {opponentName}</p>
                        <p className="profile-game-score">{myScore} - {oppScore}</p>
                      </div>
                      <button 
                        className="btn btn--primary btn--sm profile-game-resume-btn"
                        onClick={() => {
                          setIsOpen(false);
                          onJoinGame(game.id);
                        }}
                      >
                        Play
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Sign Out Button */}
          <div className="profile-menu-footer">
            <button 
              className="profile-menu-signout-btn"
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
