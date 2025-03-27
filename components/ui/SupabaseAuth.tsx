'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';

export default function SupabaseAuth() {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        // Send the access token to the extension
        window.postMessage(
          {
            type: 'EXTENSION_AUTH',
            token: session.access_token
          },
          '*'
        );
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        window.postMessage(
          {
            type: 'EXTENSION_AUTH',
            token: session.access_token
          },
          '*'
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  return null;
} 