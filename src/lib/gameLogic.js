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
  if (!word || word.length < 2) return { valid: false, msg: word.length === 1 ? 'Word must be at least 2 letters' : '', cells: [] };

  const cells = [];
  const rackNeeded = {};

  for (let i = 0; i < word.length; i++) {
    const r = dir === 'h' ? row : row + i;
    const c = dir === 'h' ? col + i : col;
    const letter = word[i];

    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE)
      return { valid: false, msg: `Word extends beyond the board edge (check ${dir === 'h' ? 'column' : 'row'} position)`, cells: [] };

    if (board[r][c]) {
      if (board[r][c].letter !== letter)
        return { valid: false, msg: `Letter "${letter}" conflicts with "${board[r][c].letter}" at (${r + 1},${c + 1})`, cells: [] };
    } else {
      rackNeeded[letter] = (rackNeeded[letter] || 0) + 1;
      cells.push({ r, c, letter });
    }
  }

  const available = rack.filter(t => !t.placed).map(t => t.letter);
  const tempRack = [...available];
  const missing = [];

  for (const [l, n] of Object.entries(rackNeeded)) {
    let count = 0;
    for (let i = 0; i < n; i++) {
      const idx = tempRack.indexOf(l);
      if (idx === -1) {
        missing.push(l);
        break;
      }
      tempRack.splice(idx, 1);
      count++;
    }
  }

  if (missing.length > 0) {
    const missingLetters = [...new Set(missing)].join(', ');
    return { valid: false, msg: `Not enough tiles in rack (need: ${missingLetters})`, cells: [] };
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
