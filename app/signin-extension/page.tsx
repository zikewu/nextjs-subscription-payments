'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignInExtension() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Initializing sign in...');
  const [error, setError] = useState(null);
  const extensionId = searchParams?.get('extension_id');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!extensionId) {
      setError('Extension ID is missing. Please try again.');
      return;
    }

    setMessage('Please sign in to continue...');
    
    // Store extension ID in session storage so we can retrieve it post-authentication
    sessionStorage.setItem('extension_id', extensionId);
    
    // Redirect to the built-in sign-in page
    router.push('/signin');
  }, [extensionId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-5">Extension Authentication</h1>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="text-center">
          <p className="mb-4">{message}</p>
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
}
