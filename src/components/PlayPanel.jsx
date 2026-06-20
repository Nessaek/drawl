import Rack from './Rack';

export default function PlayPanel({
  rack, onDragStart, onDragEnd, players, currentPlayerIndex, history, turnNum,
  wordInput, position, status,
  onWordChange, onPositionChange, onPlace, onShuffle, onRecall, onNewGame,
  user,
  gameId,
}) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') onPlace();
    if (e.key === 'Escape') onWordChange('');
  }

  const currentPlayer = players[currentPlayerIndex];
  const isYourTurn = !gameId || (user && currentPlayer.id === user.id);

  return (
    <div className={`play-panel ${!isYourTurn ? 'play-panel--disabled' : ''}`}>
      <div className="score-bar">
        {players.map((p, idx) => (
          <div key={idx} className={`score-pill ${currentPlayerIndex === idx ? 'score-pill--active' : ''}`}>
            <span className="pill-label">{p.name}</span>
            <span className="pill-value">{p.score}</span>
          </div>
        ))}
        <div className="score-pill">
          <span className="pill-label">Turn</span>
          <span className="pill-value">{turnNum}</span>
        </div>
      </div>

      <section className="panel-section">
        <div className="section-label">{currentPlayer.name}'s rack</div>
        <Rack rack={rack} onDragStart={onDragStart} onDragEnd={onDragEnd} />
        {rack.filter(t => !t.placed).length === 0 && (
          <p className="hint" style={{ marginTop: 8, fontStyle: 'italic' }}>
            All tiles used! {isYourTurn ? 'Place your word to continue.' : `Waiting for ${currentPlayer.name} to finish their turn.`}
          </p>
        )}
      </section>

      <section className="panel-section">
        <div className="section-label">Word</div>
        <input
          className="word-input"
          type="text"
          value={wordInput}
          onChange={e => onWordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a word…"
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
        <div className="section-label" style={{ marginTop: 12 }}>Position</div>
        <div className="pos-grid">
          <div className="pos-field">
            <label>Row</label>
            <input
              type="number" min="1" max="15"
              value={position.row}
              onChange={e => onPositionChange({ row: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="pos-field">
            <label>Col</label>
            <input
              type="number" min="1" max="15"
              value={position.col}
              onChange={e => onPositionChange({ col: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="pos-field">
            <label>Direction</label>
            <select value={position.dir} onChange={e => onPositionChange({ dir: e.target.value })}>
              <option value="h">Across →</option>
              <option value="v">Down ↓</option>
            </select>
          </div>
        </div>

        {status.msg && (
          <div className={`status-msg status-msg--${status.type}`}>{status.msg}</div>
        )}

        {!isYourTurn && currentPlayer.id && (
          <div className="status-msg status-msg--info">Waiting for {currentPlayer.name}...</div>
        )}

        <div className="action-row">
          <button className="btn btn--primary btn--sm" onClick={onPlace} disabled={wordInput.length < 2 || !isYourTurn}>
            Place word
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => onWordChange('')} disabled={!isYourTurn}>Clear</button>
          <button className="btn btn--ghost btn--sm" onClick={onShuffle} disabled={!isYourTurn}>Shuffle</button>
          <button className="btn btn--ghost btn--sm" onClick={onRecall} disabled={!isYourTurn}>Recall</button>
          <button className="btn btn--ghost btn--sm" onClick={onNewGame}>New game</button>
        </div>
        {isYourTurn ? (
          <div className="keyboard-shortcuts">
            <p className="hint">
              <kbd>Enter</kbd> to place · <kbd>Esc</kbd> to clear · Click board to set position
            </p>
          </div>
        ) : (
          <p className="hint">Viewing {currentPlayer.name}'s turn</p>
        )}
      </section>

      {history.length > 0 && (
        <section className="panel-section">
          <div className="section-label">Words placed</div>
          <div className="word-history">
            {[...history].reverse().map((h, i) => (
              <span key={i} className="word-chip">
                {h.player && <span style={{ opacity: 0.6, marginRight: 4 }}>{h.player}:</span>}
                {h.word} <strong>+{h.pts}</strong>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
