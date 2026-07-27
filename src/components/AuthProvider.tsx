'use client';

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/authSlice';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const supabase = createClient();

  React.useEffect(() => {
    // Initial fetch of session to populate Redux
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('taskskill-ext-auth', JSON.stringify(session));
        }
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name,
          })
        );
      }
    });

    // Listen for changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('taskskill-ext-auth', JSON.stringify(session));
        }
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name,
          })
        );
      } else {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('taskskill-ext-auth');
        }
        dispatch(setUser(null));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch, supabase.auth]);

  return <>{children}</>;
}
