import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('online');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor browser online/offline status
    const handleOnline = () => {
      setStatus('online');
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    };

    const handleOffline = () => {
      setStatus('offline');
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor Supabase realtime connection
    const channel = supabase.channel('connection-monitor');

    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          if (payload.status === 'ok') {
            setStatus('online');
          }
        }
      })
      .subscribe((connectionStatus) => {
        if (connectionStatus === 'SUBSCRIBED') {
          setStatus('online');
        } else if (connectionStatus === 'CHANNEL_ERROR' || connectionStatus === 'TIMED_OUT') {
          setStatus('reconnecting');
          setIsVisible(true);
        } else if (connectionStatus === 'CLOSED') {
          setStatus('offline');
          setIsVisible(true);
        }
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isVisible && status === 'online') return null;

  const config = {
    online: {
      icon: '✓',
      text: 'Back online',
      className: 'connection-status--online',
    },
    offline: {
      icon: '⚠',
      text: 'No connection',
      className: 'connection-status--offline',
    },
    reconnecting: {
      icon: '↻',
      text: 'Reconnecting...',
      className: 'connection-status--reconnecting',
    },
  };

  const current = config[status];

  return (
    <div className={`connection-status ${current.className}`}>
      <span className="connection-status__icon">{current.icon}</span>
      <span className="connection-status__text">{current.text}</span>
    </div>
  );
}
