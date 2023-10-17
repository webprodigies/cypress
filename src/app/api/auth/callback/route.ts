import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  // Parse the URL to extract the 'code' parameter from the query string
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  // If a 'code' parameter is present in the query string, attempt to exchange it for a user session
  if (code) {
    // Create a client for route handlers with provided cookies
    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the 'code' for a user session using Supabase authentication
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the '/dashboard' page after successful processing
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
