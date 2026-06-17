export default function Rack({ rack, onDragStart, onDragEnd }) {
  const tiles = rack.filter(t => !t.placed);

  return (
    <div className="rack">
      {tiles.length === 0 ? (
        <span className="rack-empty">Rack empty — start a new game</span>
      ) : (
        tiles.map(t => (
          <div
            key={t.id}
            className={`rack-tile rack-tile--${t.type}`}
            draggable
            onDragStart={(e) => onDragStart(e, t)}
            onDragEnd={onDragEnd}
          >
            <span className="rack-tile-letter">{t.letter}</span>
            <span className="rack-tile-pts">{t.score}</span>
          </div>
        ))
      )}
    </div>
  );
}
