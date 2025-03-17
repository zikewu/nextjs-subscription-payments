import { createClient } from '@/utils/supabase/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const extensionId = requestUrl.searchParams.get('extension_id') || null;

  if (code) {
    // Create both clients - we'll use the appropriate one based on the context
    const cookieStore = cookies();
    const supabase = createClient();
    const supabaseRouteHandler = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Use the appropriate client based on whether this is an extension flow
      const clientToUse = extensionId ? supabaseRouteHandler : supabase;
      const { error } = await clientToUse.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/signin`,
            error.name,
            "Sorry, we weren't able to log you in. Please try again."
          )
        );
      }

      // If this is an extension authentication, redirect to extension handler
      if (extensionId) {
        return NextResponse.redirect(
          new URL(`/auth/callback/extension?extension_id=${extensionId}`, requestUrl.origin)
        );
      }

      // Normal authentication flow - URL to redirect to after sign in process completes
      return NextResponse.redirect(
        getStatusRedirect(
          `${requestUrl.origin}/account`,
          'Success!',
          'You are now signed in.'
        )
      );
    } catch (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          'Authentication Error',
          'An unexpected error occurred during authentication. Please try again.'
        )
      );
    }
  }

  // No code provided, handle error
  return NextResponse.redirect(
    getErrorRedirect(
      `${requestUrl.origin}/auth/auth-error`,
      'Invalid Request',
      'No authentication code provided.'
    )
  );
}
