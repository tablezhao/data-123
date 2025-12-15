import { create } from 'zustand';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { getCurrentUser } from '@/services/userService';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session?.user) {
      set({ user: data.session.user });
      await useAuthStore.getState().loadProfile(data.session.user.id);
    }
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session?.user) {
      set({ user: data.session.user });
      await useAuthStore.getState().loadProfile(data.session.user.id);
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null, isAdmin: false });
  },

  loadProfile: async (userId: string) => {
    try {
      const profileData = await getCurrentUser();
      set({ 
        profile: profileData, 
        isAdmin: profileData?.role === 'admin',
        loading: false 
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
      set({ profile: null, isAdmin: false, loading: false });
    }
  },

  refreshUser: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        const profileData = await getCurrentUser();
        set({ 
          profile: profileData, 
          isAdmin: profileData?.role === 'admin',
          loading: false 
        });
      } else {
        set({ user: null, profile: null, isAdmin: false, loading: false });
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      set({ loading: false });
    }
  },
}));

// 初始化认证状态
export const initializeAuth = async () => {
  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    useAuthStore.setState({ user: session.user });
    await useAuthStore.getState().loadProfile(session.user.id);
  } else {
    useAuthStore.setState({ user: null, profile: null, isAdmin: false, loading: false });
  }
  
  // 监听认证状态变化
  const { 
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      useAuthStore.setState({ user: session.user });
      useAuthStore.getState().loadProfile(session.user.id);
    } else {
      useAuthStore.setState({ user: null, profile: null, isAdmin: false, loading: false });
    }
  });
  
  return subscription;
};
