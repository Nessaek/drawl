import { useState } from 'react';
import { BOARD_SIZE, PREMIUM, PREMIUM_LABELS, TW, DW, TL, DL, ST } from '../lib/constants';

const CELL_CLASSES = {
  [TW]: 'cell--tw',
  [DW]: 'cell--dw',
  [TL]: 'cell--tl',
  [DL]: 'cell--dl',
  [ST]: 'cell--center',
};

export default function Board({ board, preview, onCellClick, onDropTile, onRemoveTile }) {
  const [dragOverCell, setDragOverCell] = useState(null);
  const previewMap = {};
  preview.forEach(p => { previewMap[`${p.r},${p.c}`] = p.letter; });

  const handleDragOver = (e, r, c) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell(`${r},${c}`);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e, r, c) => {
    e.preventDefault();
    setDragOverCell(null);
    const tileData = e.dataTransfer.getData('application/json');
    if (tileData) {
      try {
        const tile = JSON.parse(tileData);
        onDropTile(tile, r, c);
      } catch {
        // Silently fail if data is not valid JSON
      }
    }
  };

  return (
    <div className="board-outer">
      <div className="board-grid" role="grid" aria-label="Game board, 15 by 15 grid">
        {Array.from({ length: BOARD_SIZE }, (_, r) =>
          Array.from({ length: BOARD_SIZE }, (_, c) => {
            const key = `${r},${c}`;
            const placed = board[r][c];
            const inPreview = previewMap[key];
            const premium = PREMIUM[r][c];
            const label = PREMIUM_LABELS[premium] || '';

            if (placed) {
              return (
                <div
                  key={key}
                  className={`cell cell--placed ${placed.isNew ? 'cell--preview' : ''}`}
                  onClick={placed.isNew ? () => onRemoveTile(r, c) : undefined}
                  role="gridcell"
                  aria-label={`${placed.letter} at row ${r + 1}, column ${c + 1}${placed.isNew ? ', click to remove' : ''}`}
                  tabIndex={placed.isNew ? 0 : -1}
                  onKeyDown={placed.isNew ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRemoveTile(r, c); } } : undefined}
                >
                  <span className="cell-letter">{placed.letter}</span>
                  <span className="cell-pts">{placed.score}</span>
                </div>
              );
            }
            if (inPreview) {
              return (
                <div
                  key={key}
                  className="cell cell--preview"
                  role="gridcell"
                  aria-label={`Preview: ${inPreview} at row ${r + 1}, column ${c + 1}`}
                >
                  <span className="cell-letter">{inPreview}</span>
                  <span className="cell-pts">{}</span>
                </div>
              );
            }
            return (
              <div
                key={key}
                className={`cell ${CELL_CLASSES[premium] || ''} ${dragOverCell === key ? 'cell--drop-target' : ''}`}
                onClick={() => onCellClick(r + 1, c + 1)}
                onDragOver={(e) => handleDragOver(e, r, c)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, r, c)}
                role="gridcell"
                aria-label={`Empty cell at row ${r + 1}, column ${c + 1}${label ? `, ${label}` : ''}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCellClick(r + 1, c + 1); } }}
              >
                {label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
