import { useCallback, useState } from 'react';
import { useDictionary } from './hooks/useDictionary';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import Board from './components/Board';
import SetupPanel from './components/SetupPanel';
import PlayPanel from './components/PlayPanel';
import EmailAuth from './components/EmailAuth';
import './App.css';

export default function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const { wordSet, status: dictStatus } = useDictionary();
  const game = useGameState();

  const handleCellClick = useCallback((row, col) => {
    game.updatePosition({ row, col }, game.wordInput, game.board, game.currentRack);
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
  }, [game]);

  const handleRemoveTile = useCallback((r, c) => {
    game.removeTileFromBoard(r, c);
  }, [game]);

  const handleWordChange = useCallback((val) => {
    game.updateWordInput(val, game.board, game.currentRack);
  }, [game]);

  const handlePositionChange = useCallback((newPos) => {
    game.updatePosition(newPos, game.wordInput, game.board, game.currentRack);
  }, [game]);

  const handlePlace = useCallback(() => {
    game.placeWord(wordSet, game.board, game.currentRack);
  }, [game, wordSet]);

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

          {user ? (
            <div className="user-profile">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="user-avatar" />
              )}
              <span className="user-name">{user.user_metadata?.full_name || user.email}</span>
              <button className="btn btn--ghost btn--sm" onClick={signOut}>Sign Out</button>
            </div>
          ) : (
            <div className="auth-group">
              {showEmailAuth ? (
                <EmailAuth onComplete={() => setShowEmailAuth(false)} />
              ) : (
                <>
                  <button className="btn btn--primary btn--sm" onClick={signInWithGoogle}>
                    Google
                  </button>
                  <button className="btn btn--primary btn--sm" onClick={() => setShowEmailAuth(true)}>
                    Email
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="main">
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
              onSignInGoogle={signInWithGoogle}
            />
          ) : (
            <PlayPanel
              rack={game.currentRack}
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
            />
          )}
        </aside>
      </main>
    </div>
  );
}
