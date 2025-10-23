import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default async function middleware(req) {
  const ipHeader = req.headers.get('x-epfl-internal');
  let isAllowed = false;
  if (ipHeader == "TRUE") {
    isAllowed = true;
  }
  if (!isAllowed) {
    return new NextResponse('Accès interdit depuis ce réseau', { status: 403 });
  }
  return auth(req);
}


export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  runtime: 'nodejs',
};