import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthInterceptor() {
  const navigate = useNavigate();

  useEffect(() => {
    // Intercept URL hash for invites before Supabase clears it
    const hash = window.location.hash;
    if (hash && hash.includes('type=invite')) {
      // It's an invite link!
      // Navigate to set-password page. 
      // Note: Supabase client will still process the token and log them in in the background.
      navigate('/set-password');
    } else if (hash && hash.includes('type=recovery')) {
      // For password recovery
      navigate('/set-password');
    }

    // Also listen to auth state changes as a fallback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/set-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null; // This component doesn't render anything
}
