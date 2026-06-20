import { useEffect, useRef, useCallback } from 'react';

export function useNotifications() {
  const permissionGranted = useRef(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      permissionGranted.current = Notification.permission === 'granted';
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === 'granted';
      return permission === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (!permissionGranted.current) return;

    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'drawl-game',
      renotify: true,
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Focus window when clicked
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  const notifyTurn = useCallback((playerName) => {
    sendNotification('It\'s your turn!', {
      body: `${playerName} just played. Make your move!`,
    });
  }, [sendNotification]);

  const notifyGameJoined = useCallback((playerName) => {
    sendNotification('Player joined', {
      body: `${playerName} joined your game!`,
    });
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    notifyTurn,
    notifyGameJoined,
    hasPermission: permissionGranted.current,
  };
}
