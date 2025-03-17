'use client';

import { useEffect, useState } from 'react';

export default function ExtensionCallbackHandler({ session }) {
  const [message, setMessage] = useState('Processing extension authentication...');

  useEffect(() => {
    // Get the stored extension ID
    const extensionId = sessionStorage.getItem('extension_id');
    
    if (!extensionId || !session) {
      setMessage('No extension data found or authentication failed.');
      return;
    }

    // Try to communicate with the Chrome extension
    try {
      if (window.chrome && window.chrome.runtime) {
        window.chrome.runtime.sendMessage(
          extensionId,
          { 
            action: 'authCallback', 
            session: {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: new Date().getTime() + (session.expires_in * 1000),
              user: session.user
            }
          },
          (response) => {
            if (response && response.success) {
              setMessage('Authentication successful! You can close this page.');
            } else {
              setMessage('Failed to communicate with the extension. Please try again.');
            }
          }
        );
      } else {
        // Fallback when chrome API isn't available
        setMessage('Authentication successful! You can now close this window and return to the extension.');
      }
    } catch (error) {
      console.error('Error communicating with extension:', error);
      setMessage('Authentication complete. You can close this window and return to the extension.');
    }
    
    // Clear the stored extension ID
    sessionStorage.removeItem('extension_id');
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-5">Authentication Complete</h1>
      <p>{message}</p>
    </div>
  );
}
