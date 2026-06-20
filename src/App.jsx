import { useCallback, useState, useEffect, useRef } from 'react';
import { useDictionary } from './hooks/useDictionary';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useNotifications } from './hooks/useNotifications';
import Board from './components/Board';
import SetupPanel from './components/SetupPanel';
import PlayPanel from './components/PlayPanel';
import AuthModal from './components/AuthModal';
import ProfileDropdown from './components/ProfileDropdown';
import EditProfileModal from './components/EditProfileModal';
import TutorialModal from './components/TutorialModal';
import ConnectionStatus from './components/ConnectionStatus';
import './App.css';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { wordSet, status: dictStatus } = useDictionary();
  const game = useGameState();
  const { playSound, hapticFeedback } = useSoundEffects();
  const { requestPermission, notifyTurn } = useNotifications();
  const prevPlayerIndexRef = useRef(game.currentPlayerIndex);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    return window.location.hash.includes('type=recovery');
  });
  const [authModalMode, setAuthModalMode] = useState(() => {
    return window.location.hash.includes('type=recovery') ? 'update' : 'login';
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Show tutorial for first-time users
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('drawl_tutorial_seen');
    if (!hasSeenTutorial && !loading) {
      setTimeout(() => setIsTutorialOpen(true), 1000);
    }
  }, [loading]);

  // Request notification permission after tutorial
  useEffect(() => {
    if (user && game.phase === 'play' && game.gameId) {
      const hasRequestedNotif = localStorage.getItem('drawl_notif_requested');
      if (!hasRequestedNotif) {
        setTimeout(() => {
          requestPermission().then((granted) => {
            if (granted) {
              localStorage.setItem('drawl_notif_requested', 'true');
            }
          });
        }, 3000);
      }
    }
  }, [user, game.phase, game.gameId, requestPermission]);

  // Notify when turn changes
  useEffect(() => {
    if (game.phase !== 'play' || !user || !game.gameId) return;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const isMyTurn = currentPlayer?.id === user.id;

    // Check if turn just changed to this player
    if (isMyTurn && prevPlayerIndexRef.current !== game.currentPlayerIndex) {
      const prevPlayer = game.players[prevPlayerIndexRef.current];
      if (prevPlayer && document.hidden) {
        // Only notify if tab is not focused
        notifyTurn(prevPlayer.name);
        playSound('turnChange');
      }
    }

    prevPlayerIndexRef.current = game.currentPlayerIndex;
  }, [game.currentPlayerIndex, game.phase, game.players, game.gameId, user, notifyTurn, playSound]);

  const handleCellClick = useCallback((row, col) => {
    game.updatePosition({ row, col }, game.wordInput, game.board, game.myRack);
  }, [game]);

  const handleDragStart = useCallback((e, tile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tile));
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('rack-tile--dragging');
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove('rack-tile--dragging');
  }, []);

  const handleDropTile = useCallback((tile, r, c) => {
    game.dropTileOnBoard(tile, r, c);
    playSound('tileDrop');
    hapticFeedback('light');
  }, [game, playSound, hapticFeedback]);

  const handleRemoveTile = useCallback((r, c) => {
    game.removeTileFromBoard(r, c);
    playSound('tileRecall');
    hapticFeedback('light');
  }, [game, playSound, hapticFeedback]);

  const handleWordChange = useCallback((val) => {
    game.updateWordInput(val, game.board, game.myRack);
  }, [game]);

  const handlePositionChange = useCallback((newPos) => {
    game.updatePosition(newPos, game.wordInput, game.board, game.myRack);
  }, [game]);

  const handlePlace = useCallback(() => {
    const result = game.placeWord(wordSet, game.board, game.myRack);
    if (result.ok) {
      playSound('wordPlaced');
      hapticFeedback('success');
    } else {
      playSound('wordInvalid');
      hapticFeedback('error');
    }
  }, [game, wordSet, playSound, hapticFeedback]);

  if (loading) {
    return <div className="app-loading">Loading DRAWL...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className="logo-text">DRAWL</span>
          {game.gameId && <span className="game-id-badge">#{game.gameId}</span>}
        </div>

        <div className="header-actions">
          {game.phase === 'play' && (
            <div className="header-pills">
              {game.players.map((p, idx) => (
                <div key={idx} className={`header-pill ${game.currentPlayerIndex === idx ? 'header-pill--active' : ''}`}>
                  <span className="pill-label">{p.name}</span>
                  <span className="pill-value">{p.score}</span>
                </div>
              ))}
              <div className="header-pill">
                <span className="pill-label">Turn</span>
                <span className="pill-value">{game.turnNum}</span>
              </div>
            </div>
          )}

          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setIsTutorialOpen(true)}
            title="How to play"
            aria-label="Show tutorial"
          >
            ?
          </button>

          {user ? (
            <ProfileDropdown
              user={user}
              onSignOut={signOut}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onJoinGame={game.joinGame}
            />
          ) : (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {game.notifications.length > 0 && (
          <div className="notifications-container">
            {game.notifications.map(n => (
              <div key={n.id} className="notification-toast">
                {n.msg}
              </div>
            ))}
          </div>
        )}
        <div className="board-area">
          <Board
            board={game.board}
            preview={game.preview}
            onCellClick={handleCellClick}
            onDropTile={handleDropTile}
            onRemoveTile={handleRemoveTile}
          />
        </div>

        <aside className="sidebar">
          {game.phase === 'setup' ? (
            <SetupPanel 
              onDeal={game.deal} 
              dictStatus={dictStatus} 
              gameId={game.gameId} 
              onCreateGame={game.createGame} 
              onJoinGame={game.joinGame}
              user={user}
              onSignInClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
            />
          ) : (
            <PlayPanel
              rack={game.myRack}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              players={game.players}
              currentPlayerIndex={game.currentPlayerIndex}
              history={game.history}
              turnNum={game.turnNum}
              dictStatus={dictStatus}
              wordInput={game.wordInput}
              position={game.position}
              status={game.status}
              onWordChange={handleWordChange}
              onPositionChange={handlePositionChange}
              onPlace={handlePlace}
              onShuffle={game.doShuffleRack}
              onRecall={game.recallTiles}
              onNewGame={game.resetToSetup}
              user={user}
              gameId={game.gameId}
            />
          )}
        </aside>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

      <EditProfileModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <ConnectionStatus />
    </div>
  );
}
