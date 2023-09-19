import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { get } from 'http';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  //create middleware client
  const supabase = createMiddlewareClient({ req, res });
  //creating a refreshed token for the user
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  const emailLinkError = 'Email link is invalid or has expired';
  if (
    req.nextUrl.searchParams.get('error_description') === emailLinkError &&
    req.nextUrl.pathname !== '/signup'
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?error_description=${req.nextUrl.searchParams.get(
          'error_description'
        )}`,
        req.url
      )
    );
  }

  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  //next
  return res;
}
