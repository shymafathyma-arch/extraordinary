import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Handle initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setCurrentUser({
        uid: user.id,
        email: user.email,
        displayName: data.display_name,
        role: data.role || 'customer',
        tier: data.tier || 'VIP',
        ...data
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setCurrentUser({ uid: user.id, email: user.email, role: 'customer', tier: 'VIP' });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Database is not connected. Please check your environment variables.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, name) => {
    if (!isSupabaseConfigured) {
      throw new Error("Database is not connected. Please check your environment variables.");
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const user = data?.user;

    if (user) {
      // Create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, email, display_name: name, role: 'customer', tier: 'VIP' }]);
      
      if (profileError) console.error("Error creating profile:", profileError);
    }
    return data;
  };


  const logout = async () => {
    if (!isSupabaseConfigured) {
      setCurrentUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const getUsers = async () => {
    if (!isSupabaseConfigured) {
      return [];
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data.map(p => ({
        uid: p.id,
        email: p.email,
        displayName: p.display_name,
        role: p.role,
        tier: p.tier
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const deleteUser = async (uid) => {
    if (!isSupabaseConfigured) {
      return;
    }
    // Deleting from profiles table (auth deletion requires Admin API)
    await supabase.from('profiles').delete().eq('id', uid);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    getUsers,
    deleteUser,
    isSupabaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};



