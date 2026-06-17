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
      
      // If we just handled a redirect (hash contains access_token), clear it
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (provider) => {
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
    // Attempt to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!signInError) {
      return { error: null };
    }

    // Handle specific error: Email not confirmed
    if (signInError.message === 'Email not confirmed') {
      return { message: 'Please confirm your email address before signing in.' };
    }

    // If sign in fails, it might be because the user doesn't exist yet.
    // We attempt to sign up. 
    // Note: Supabase logs a 400 for the failed signIn attempt below. This is normal.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (signUpError) {
      if (signUpError.status === 400 && signInError.message === 'Invalid login credentials') {
        return { error: signInError };
      }
      return { error: signUpError };
    }

    // If auto-confirm is off, user is created but session is null
    if (signUpData.user && !signUpData.session) {
      console.info('Signup successful, awaiting email confirmation:', signUpData.user.email);
      return { message: 'Account created! Check your email for a confirmation link.' };
    }
    
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
