import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
}

export function useUser () {
  const [user, setUser ] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser () {
      const session = supabase.auth.getSession();
      const { data: { session: currentSession } } = await session;
      if (!currentSession) {
        setUser (null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from<UserProfile>('user_profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (error) {
        setUser (null);
      } else {
        setUser (data);
      }
      setLoading(false);
    }

    fetchUser ();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser ();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}