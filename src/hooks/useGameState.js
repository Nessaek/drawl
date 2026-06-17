import { useState, useCallback, useEffect, useRef } from 'react';
import {
  shuffle, emptyBoard, computePreview, calcWordScore, checkConnected,
} from '../lib/gameLogic';
import {
  CONSONANT_BAG, VOWEL_BAG, LETTER_SCORES,
} from '../lib/constants';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'drawl_game_state';

export function useGameState() {
  const { user } = useAuth();
  const [gameId, setGameId] = useState(() => {
    const hash = window.location.hash.slice(1);
    // If hash contains '=', it's likely an OAuth fragment (access_token=...), not a gameId
    if (hash && !hash.includes('=')) {
      return hash;
    }
    return null;
  });
  const [phase, setPhase] = useState('setup'); // setup | play
  const [board, setBoard] = useState(() => emptyBoard());
  const [players, setPlayers] = useState([
    { name: 'Player 1', score: 0, rack: [] },
    { name: 'Player 2', score: 0, rack: [] },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [turnNum, setTurnNum] = useState(1);
  const [firstWord, setFirstWord] = useState(true);
  const [wordInput, setWordInput] = useState('');
  const [position, setPosition] = useState({ row: 8, col: 8, dir: 'h' });
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [preview, setPreview] = useState([]);

  const isRemoteUpdate = useRef(false);
  const applyState = useCallback((data) => {
    setPhase(data.phase || 'setup');
    setBoard(data.board || emptyBoard());
    setPlayers(data.players || [
      { name: 'Player 1', score: 0, rack: [] },
      { name: 'Player 2', score: 0, rack: [] },
    ]);
    setCurrentPlayerIndex(data.currentPlayerIndex || 0);
    setHistory(data.history || []);
    setTurnNum(data.turnNum || 1);
    setFirstWord(data.firstWord ?? true);
  }, []);

  // Sync gameId to URL
  useEffect(() => {
    if (gameId) {
      window.location.hash = gameId;
    }
  }, [gameId]);

  // Load state from Supabase
  useEffect(() => {
    if (!gameId) return;

    // Fetch initial state
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('state')
        .eq('id', gameId)
        .single();
      
      if (data && data.state) {
        applyState(data.state);
      } else if (error && error.code === 'PGRST116') {
        // Game doesn't exist yet
      }
    };

    fetchData();

    // Listen for updates
    const channel = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, (payload) => {
        if (payload.new && payload.new.state) {
          isRemoteUpdate.current = true;
          applyState(payload.new.state);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, applyState]);

  const saveState = useCallback(async (newState) => {
    if (!gameId) {
      // Fallback to local storage if no gameId
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return;
    }

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const { error } = await supabase
      .from('games')
      .upsert({ 
        id: gameId, 
        state: newState, 
        updated_at: new Date(),
        owner_id: user?.id || null 
      });
    
    // We only log critical network errors, ignoring duplicate/expected conflicts if any
    if (error && error.code !== '409') {
      console.error('Supabase Sync Error:', error.message);
    }
  }, [gameId, user]);

  // Save on changes
  useEffect(() => {
    if (phase === 'play') {
      const stateToSave = {
        phase, board, players, currentPlayerIndex, history, turnNum, firstWord
      };
      saveState(stateToSave);
    }
  }, [phase, board, players, currentPlayerIndex, history, turnNum, firstWord, saveState]);

  const createGame = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 9);
    setGameId(newId);
  }, []);

  const joinGame = useCallback((id) => {
    if (id) {
      setGameId(id);
      setPhase('setup'); // Back to setup to see deal button or wait for sync
    }
  }, []);


  const deal = useCallback((numCons, numVow) => {
    const cb = shuffle(CONSONANT_BAG);
    const vb = shuffle(VOWEL_BAG);
    
    const generateRack = (offset) => {
      const rack = [];
      for (let i = 0; i < numCons; i++) {
        const l = cb[(offset + i) % cb.length];
        rack.push({ letter: l, id: offset + i, type: 'consonant', score: LETTER_SCORES[l] || 1, placed: false });
      }
      for (let i = 0; i < numVow; i++) {
        const l = vb[(offset + numCons + i) % vb.length];
        rack.push({ letter: l, id: offset + numCons + i, type: 'vowel', score: LETTER_SCORES[l] || 1, placed: false });
      }
      return shuffle(rack);
    };

    const newPlayers = [
      { name: 'Player 1', score: 0, rack: generateRack(0) },
      { name: 'Player 2', score: 0, rack: generateRack(20) }, // Offset so bags don't start the same
    ];

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setBoard(emptyBoard());
    setHistory([]);
    setTurnNum(1);
    setFirstWord(true);
    setWordInput('');
    setPreview([]);
    setStatus({ msg: '', type: '' });
    setPhase('play');
  }, []);

  const resetToSetup = useCallback(() => {
    setPhase('setup');
    setWordInput('');
    setPreview([]);
    setStatus({ msg: '', type: '' });
    localStorage.removeItem(STORAGE_KEY);
    setGameId(null);
    window.location.hash = '';
  }, []);

  const currentRack = players[currentPlayerIndex].rack;

  const dropTileOnBoard = useCallback((tile, r, c) => {
    setBoard(prev => {
      if (prev[r][c]) return prev; // Don't overwrite existing tiles
      const next = prev.map(row => [...row]);
      next[r][c] = { letter: tile.letter, score: tile.score, isNew: true, tileId: tile.id };
      
      // Try to auto-detect word from current isNew tiles
      const newTiles = [];
      next.forEach((row, ri) => row.forEach((cell, ci) => {
        if (cell?.isNew) newTiles.push({ r: ri, c: ci, letter: cell.letter });
      }));

      if (newTiles.length >= 1) {
        // Find if they are in a line
        const rows = [...new Set(newTiles.map(t => t.r))].sort((a,b) => a-b);
        const cols = [...new Set(newTiles.map(t => t.c))].sort((a,b) => a-b);

        let startR = rows[0], startC = cols[0];

        if (rows.length === 1) {
          // Find full extent of word including existing tiles
          let minC = cols[0];
          while (minC > 0 && next[startR][minC - 1]) minC--;
          startC = minC;
          let word = '';
          let currC = startC;
          while (currC < 15 && next[startR][currC]) {
            word += next[startR][currC].letter;
            currC++;
          }
          if (word.length >= 2) {
            setWordInput(word);
            setPosition({ row: startR + 1, col: startC + 1, dir: 'h' });
          }
        } else if (cols.length === 1) {
          let minR = rows[0];
          while (minR > 0 && next[minR - 1][startC]) minR--;
          startR = minR;
          let word = '';
          let currR = startR;
          while (currR < 15 && next[currR][startC]) {
            word += next[currR][startC].letter;
            currR++;
          }
          if (word.length >= 2) {
            setWordInput(word);
            setPosition({ row: startR + 1, col: startC + 1, dir: 'v' });
          }
        }
      }

      return next;
    });

    setPlayers(prev => {
      const next = [...prev];
      const p = next[currentPlayerIndex];
      const newRack = p.rack.map(t => 
        t.id === tile.id ? { ...t, placed: true } : t
      );
      next[currentPlayerIndex] = { ...p, rack: newRack };
      return next;
    });
  }, [currentPlayerIndex]);

  const removeTileFromBoard = useCallback((r, c) => {
    let tileId = null;
    setBoard(prev => {
      if (!prev[r][c]?.isNew) return prev;
      tileId = prev[r][c].tileId;
      const next = prev.map(row => [...row]);
      next[r][c] = null;

      // Re-detect word
      const newTiles = [];
      next.forEach((row, ri) => row.forEach((cell, ci) => {
        if (cell?.isNew) newTiles.push({ r: ri, c: ci, letter: cell.letter });
      }));

      if (newTiles.length >= 1) {
        const rows = [...new Set(newTiles.map(t => t.r))].sort((a,b) => a-b);
        const cols = [...new Set(newTiles.map(t => t.c))].sort((a,b) => a-b);
        let startR = rows[0], startC = cols[0];

        if (rows.length === 1) {
          let minC = cols[0];
          while (minC > 0 && next[startR][minC - 1]) minC--;
          startC = minC;
          let word = '';
          let currC = startC;
          while (currC < 15 && next[startR][currC]) {
            word += next[startR][currC].letter;
            currC++;
          }
          setWordInput(word);
          setPosition({ row: startR + 1, col: startC + 1, dir: 'h' });
        } else if (cols.length === 1) {
          let minR = rows[0];
          while (minR > 0 && next[minR - 1][startC]) minR--;
          startR = minR;
          let word = '';
          let currR = startR;
          while (currR < 15 && next[currR][startC]) {
            word += next[currR][startC].letter;
            currR++;
          }
          setWordInput(word);
          setPosition({ row: startR + 1, col: startC + 1, dir: 'v' });
        } else {
          setWordInput(newTiles[0].letter);
          setPosition({ row: newTiles[0].r + 1, col: newTiles[0].c + 1, dir: 'h' });
        }
      } else {
        setWordInput('');
        setPreview([]);
        setStatus({ msg: '', type: '' });
      }

      return next;
    });

    if (tileId !== null) {
      setPlayers(prev => {
        const next = [...prev];
        const p = next[currentPlayerIndex];
        const newRack = p.rack.map(t => t.id === tileId ? { ...t, placed: false } : t);
        next[currentPlayerIndex] = { ...p, rack: newRack };
        return next;
      });
    }
  }, [currentPlayerIndex]);

  const recallTiles = useCallback(() => {
    setBoard(prev => prev.map(row => row.map(cell => (cell?.isNew ? null : cell))));
    setPlayers(prev => {
      const next = [...prev];
      const p = next[currentPlayerIndex];
      next[currentPlayerIndex] = {
        ...p,
        rack: p.rack.map(t => ({ ...t, placed: false }))
      };
      return next;
    });
    setWordInput('');
    setPreview([]);
    setStatus({ msg: '', type: '' });
  }, [currentPlayerIndex]);

  const updateWordInput = useCallback((raw, currentBoard, activeRack) => {
    const word = raw.toUpperCase().replace(/[^A-Z]/g, '');
    setWordInput(word);
    if (word.length < 2) {
      setPreview([]);
      setStatus({ msg: '', type: '' });
      return;
    }
    const result = computePreview(
      word,
      position.row - 1,
      position.col - 1,
      position.dir,
      currentBoard,
      activeRack
    );
    if (!result.valid) {
      setPreview([]);
      if (result.msg) setStatus({ msg: result.msg, type: 'err' });
      return;
    }
    setPreview(result.cells);
    setStatus({ msg: '', type: '' });
  }, [position]);

  const updatePosition = useCallback((newPos, word, currentBoard, activeRack) => {
    setPosition(prev => {
      const merged = { ...prev, ...newPos };
      if (word && word.length >= 2) {
        const result = computePreview(
          word,
          merged.row - 1,
          merged.col - 1,
          merged.dir,
          currentBoard,
          activeRack
        );
        setPreview(result.valid ? result.cells : []);
        setStatus(result.valid ? { msg: '', type: '' } : { msg: result.msg, type: 'err' });
      }
      return merged;
    });
  }, []);

  const placeWord = useCallback((wordSet, currentBoard, activeRack) => {
    const word = wordInput;
    if (word.length < 2) return { ok: false };
    if (!wordSet) { setStatus({ msg: 'Dictionary loading…', type: 'info' }); return { ok: false }; }
    if (!wordSet.has(word)) { setStatus({ msg: `"${word}" is not a valid word`, type: 'err' }); return { ok: false }; }

    const row = position.row - 1;
    const col = position.col - 1;
    const dir = position.dir;

    const result = computePreview(word, row, col, dir, currentBoard, activeRack);
    if (!result.valid) { setStatus({ msg: result.msg, type: 'err' }); return { ok: false }; }

    const allCells = [];
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'h' ? row : row + i;
      const c = dir === 'h' ? col + i : col;
      allCells.push({ r, c, letter: word[i] });
    }

    const newCells = result.cells;
    if (!checkConnected(newCells.length > 0 ? newCells : allCells, currentBoard, firstWord)) {
      const msg = firstWord
        ? 'First word must cover the centre ★ (row 8, col 8)'
        : 'Word must connect to existing tiles';
      setStatus({ msg, type: 'err' });
      return { ok: false };
    }

    const pts = calcWordScore(word, row, col, dir, currentBoard);
    const newBoard = currentBoard.map(r => [...r]);
    const newRack = [...activeRack];

    for (let i = 0; i < word.length; i++) {
      const r = dir === 'h' ? row : row + i;
      const c = dir === 'h' ? col + i : col;
      const l = word[i];
      if (!newBoard[r][c] || newBoard[r][c].isNew) {
        newBoard[r][c] = { letter: l, score: LETTER_SCORES[l] || 1 };
      } else {
        // If it was already there (not isNew), it stays there.
      }
    }

    // Clean up isNew flags for the whole board
    const finalBoard = newBoard.map(r => r.map(c => c ? { ...c, isNew: false, tileId: undefined } : null));

    setBoard(finalBoard);
    
    // Update current player's score and rack
    setPlayers(pList => {
      const next = [...pList];
      next[currentPlayerIndex] = {
        ...next[currentPlayerIndex],
        score: next[currentPlayerIndex].score + pts,
        rack: newRack
      };
      return next;
    });

    setHistory(h => [...h, { word, pts, player: players[currentPlayerIndex].name }]);
    setTurnNum(t => t + 1);
    setFirstWord(false);
    setWordInput('');
    setPreview([]);
    setStatus({ msg: `"${word}" — +${pts} pts!`, type: 'ok' });

    // Switch player
    setCurrentPlayerIndex(prevIdx => (prevIdx + 1) % players.length);

    setTimeout(() => setStatus(s => s.msg.includes(word) ? { msg: '', type: '' } : s), 2500);

    return { ok: true, newBoard, newRack };
  }, [wordInput, position, firstWord, currentPlayerIndex, players]);

  const doShuffleRack = useCallback(() => {
    setPlayers(prev => {
      const next = [...prev];
      const p = next[currentPlayerIndex];
      const unplaced = shuffle(p.rack.filter(t => !t.placed));
      const placed = p.rack.filter(t => t.placed);
      next[currentPlayerIndex] = { ...p, rack: [...unplaced, ...placed] };
      return next;
    });
  }, [currentPlayerIndex]);

  return {
    gameId, createGame, joinGame,
    phase, board, players, currentPlayerIndex, history, turnNum, firstWord,
    wordInput, position, status, preview, currentRack,
    deal, resetToSetup, updateWordInput, updatePosition,
    placeWord, doShuffleRack, setWordInput, setPreview, setStatus, dropTileOnBoard, recallTiles, removeTileFromBoard,
  };
}
