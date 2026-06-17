import Rack from './Rack';

export default function PlayPanel({
  rack, onDragStart, onDragEnd, players, currentPlayerIndex, history, turnNum,
  wordInput, position, status,
  onWordChange, onPositionChange, onPlace, onShuffle, onRecall, onNewGame,
}) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') onPlace();
    if (e.key === 'Escape') onWordChange('');
  }

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="play-panel">
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

        <div className="action-row">
          <button className="btn btn--primary btn--sm" onClick={onPlace} disabled={wordInput.length < 2}>
            Place word
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => onWordChange('')}>Clear</button>
          <button className="btn btn--ghost btn--sm" onClick={onShuffle}>Shuffle</button>
          <button className="btn btn--ghost btn--sm" onClick={onRecall}>Recall</button>
          <button className="btn btn--ghost btn--sm" onClick={onNewGame}>New game</button>
        </div>
        <p className="hint">Click any empty cell to set position · Enter to place</p>
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
