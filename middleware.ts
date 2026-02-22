import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Block Vercel deployment URL from being indexed
  if (host.includes('takshashila26.vercel.app')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
