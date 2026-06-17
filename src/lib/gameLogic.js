import { BOARD_SIZE, CENTER, LETTER_SCORES, PREMIUM, TW, DW, TL, DL, ST } from './constants';

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export function computePreview(word, row, col, dir, board, rack) {
  if (!word || word.length < 2) return { valid: false, msg: '', cells: [] };

  const cells = [];
  const rackNeeded = {};

  for (let i = 0; i < word.length; i++) {
    const r = dir === 'h' ? row : row + i;
    const c = dir === 'h' ? col + i : col;
    const letter = word[i];

    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE)
      return { valid: false, msg: 'Word goes off the board', cells: [] };

    if (board[r][c]) {
      if (board[r][c].letter !== letter)
        return { valid: false, msg: `Conflicts with tile at (${r + 1},${c + 1})`, cells: [] };
    } else {
      rackNeeded[letter] = (rackNeeded[letter] || 0) + 1;
      cells.push({ r, c, letter });
    }
  }

  const available = rack.filter(t => !t.placed).map(t => t.letter);
  const tempRack = [...available];
  for (const [l, n] of Object.entries(rackNeeded)) {
    for (let i = 0; i < n; i++) {
      const idx = tempRack.indexOf(l);
      if (idx === -1) return { valid: false, msg: `You don't have the letter "${l}"`, cells: [] };
      tempRack.splice(idx, 1);
    }
  }

  return { valid: true, msg: '', cells };
}

export function calcWordScore(word, row, col, dir, board) {
  let wordMult = 1;
  let pts = 0;
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'h' ? row : row + i;
    const c = dir === 'h' ? col + i : col;
    const l = word[i];
    let lScore = LETTER_SCORES[l] || 1;
    if (!board[r][c]) {
      const p = PREMIUM[r][c];
      if (p === TL) lScore *= 3;
      else if (p === DL) lScore *= 2;
      else if (p === TW) wordMult *= 3;
      else if (p === DW || p === ST) wordMult *= 2;
    }
    pts += lScore;
  }
  return pts * wordMult;
}

export function checkConnected(cells, board, firstWord) {
  if (firstWord) {
    return cells.some(p => p.r === CENTER && p.c === CENTER);
  }
  return cells.some(p =>
    [[p.r - 1, p.c], [p.r + 1, p.c], [p.r, p.c - 1], [p.r, p.c + 1]].some(
      ([nr, nc]) => nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc]
    )
  );
}
