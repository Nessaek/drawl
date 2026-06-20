import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      const pendingGameId = localStorage.getItem('drawl_pending_game_id');
      if (pendingGameId) {
        localStorage.removeItem('drawl_pending_game_id');
        window.location.hash = pendingGameId;
      } else if (window.location.hash.includes('access_token') && !window.location.hash.includes('type=recovery')) {
        // If we just handled a redirect (hash contains access_token) and no pending game ID, clear it
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        console.info('Password recovery mode enabled');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (provider) => {
    // Save current game hash so we can redirect back to it after OAuth redirect
    const currentHash = window.location.hash;
    if (currentHash && !currentHash.includes('access_token')) {
      localStorage.setItem('drawl_pending_game_id', currentHash.replace('#', ''));
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error(`Error signing in with ${provider}:`, error.message);
  };

  const signInWithGoogle = () => signIn('google');

  const signInWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message === 'Email not confirmed') {
        return { message: 'Please confirm your email address before signing in.' };
      }
      if (error.status === 400 || error.message.includes('Invalid login credentials')) {
        // We could also check specifically for 'User not found' but Supabase often returns generic error for security.
        // However, if we want to be helpful we can try to differentiate if possible.
        return { error, userNotFound: error.message.includes('Invalid login credentials') };
      }
      return { error };
    }
    
    return { error: null };
  };

  const signUpWithEmail = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        }
      }
    });
    
    if (error) {
      return { error };
    }
    
    if (data.user && !data.session) {
      return { message: 'Account created! Check your email for a confirmation link.' };
    }
    
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const resetPassword = async (email) => {
    const currentHash = window.location.hash;
    if (currentHash && !currentHash.includes('access_token')) {
      localStorage.setItem('drawl_pending_game_id', currentHash.replace('#', ''));
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const updateProfile = async ({ fullName, avatarColor, avatarEmoji }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_color: avatarColor,
        avatar_emoji: avatarEmoji,
      }
    });
    if (data?.user) {
      setUser(data.user);
    }
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, resetPassword, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
