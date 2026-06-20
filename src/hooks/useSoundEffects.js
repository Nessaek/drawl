import { useCallback, useRef, useEffect } from 'react';

// Simple sound generator using Web Audio API
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = localStorage.getItem('drawl_sounds_enabled') !== 'false';
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(frequency, duration = 0.1, type = 'sine') {
    if (!this.enabled) return;
    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  tileDrop() {
    this.playTone(440, 0.08, 'triangle');
  }

  tileRecall() {
    this.playTone(330, 0.08, 'triangle');
  }

  wordPlaced() {
    // Success chord
    this.playTone(523.25, 0.15, 'sine'); // C
    setTimeout(() => this.playTone(659.25, 0.15, 'sine'), 50); // E
    setTimeout(() => this.playTone(783.99, 0.15, 'sine'), 100); // G
  }

  wordInvalid() {
    this.playTone(200, 0.2, 'sawtooth');
  }

  turnChange() {
    this.playTone(660, 0.1, 'sine');
    setTimeout(() => this.playTone(880, 0.1, 'sine'), 100);
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('drawl_sounds_enabled', this.enabled);
    return this.enabled;
  }
}

export function useSoundEffects() {
  const soundManager = useRef(new SoundManager());

  const playSound = useCallback((soundName) => {
    if (soundManager.current[soundName]) {
      soundManager.current[soundName]();
    }
  }, []);

  const toggleSounds = useCallback(() => {
    return soundManager.current.toggle();
  }, []);

  const hapticFeedback = useCallback((style = 'light') => {
    // Try to use Haptic Feedback API if available (iOS Safari 13+)
    if (window.navigator && window.navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [20, 50, 20, 50, 20],
      };
      window.navigator.vibrate(patterns[style] || patterns.light);
    }
  }, []);

  return {
    playSound,
    toggleSounds,
    hapticFeedback,
    enabled: soundManager.current.enabled,
  };
}
