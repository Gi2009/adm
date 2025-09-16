import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './src/lib/supabaseClient';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;

  if (!token) {
    // Redireciona para login se não autenticado
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verifica se usuário é admin para rotas /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Aqui você pode chamar uma API interna para verificar role
    // Ou usar Supabase REST API para verificar is_admin
    // Exemplo simplificado: assume que token é válido e role está no cookie (ideal: verificar via API)
    const isAdmin = req.cookies.get('is-admin')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/tickets/:path*', '/'], // rotas protegidas
};
