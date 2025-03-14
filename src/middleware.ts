// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

interface JWTPayload {
  role?: string;
  [key: string]: any;
}

// Rotas públicas de autenticação
const PUBLIC_AUTH_ROUTES = [
  '/login',
  '/register',
  '/recovery_password'
];

// Todas as rotas que requerem autenticação
const PROTECTED_ROUTES = [
  '/configurations/seo_pages',
  '/marketing_publication/config_interval_banner',
  '/marketing_publication/add_marketing_publication',
  '/marketing_publication/all_marketing_publication',
  '/marketing_publication',
  '/user/users_blog',
  '/posts/comments',
  '/posts/all_posts/post',
  '/posts/all_posts',
  '/posts/add_post',
  '/posts',
  '/tags',
  '/tags/all_tags',
  '/categories',
  '/categories/add_category',
  '/categories/all_categories',
  '/newsletter',
  '/dashboard',
  '/user/profile',
  '/user/all_users',
  '/user/add_user',
  '/contacts_form/all_contacts',
  '/central_notifications'
];

// Mapeamento de roles para rotas permitidas
const ROLE_BASED_ACCESS: Record<string, Set<string>> = {
  SUPER_ADMIN: new Set([
    '/configurations/seo_pages',
    '/marketing_publication/config_interval_banner',
    '/marketing_publication/add_marketing_publication',
    '/marketing_publication/all_marketing_publication',
    '/marketing_publication',
    '/user/users_blog',
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/tags',
    '/tags/all_tags',
    '/categories',
    '/categories/add_category',
    '/categories/all_categories',
    '/newsletter',
    '/dashboard',
    '/user/profile',
    '/user/all_users',
    '/user/add_user',
    '/contacts_form/all_contacts',
    '/central_notifications'
  ]),
  ADMIN: new Set([
    '/configurations/seo_pages',
    '/marketing_publication/config_interval_banner',
    '/marketing_publication/add_marketing_publication',
    '/marketing_publication/all_marketing_publication',
    '/marketing_publication',
    '/user/users_blog',
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/tags',
    '/tags/all_tags',
    '/categories',
    '/categories/add_category',
    '/categories/all_categories',
    '/dashboard',
    '/newsletter',
    '/user/profile',
    '/user/all_users',
    '/user/add_user',
    '/contacts_form/all_contacts',
    '/central_notifications'
  ]),
  EMPLOYEE: new Set([
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/dashboard',
    '/categories/all_categories',
    '/user/profile',
    '/central_notifications'
  ])
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);

  // Liberar rotas não protegidas
  if (!isProtectedRoute && !isPublicAuthRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('@cmsblog.token')?.value;
  const response = NextResponse.next();

  // Redirecionar para login se tentar acessar rota protegida sem token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar token JWT
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify<JWTPayload>(token, secret);

      // Redirecionar usuários autenticados que tentam acessar rotas públicas
      if (isPublicAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Verificar permissões de acesso
      if (isProtectedRoute && payload.role) {
        const allowedRoutes = ROLE_BASED_ACCESS[payload.role];
        const hasAccess = allowedRoutes?.has(pathname);

        if (!hasAccess) {
          const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
          redirectResponse.cookies.delete('@cmsblog.token');
          return redirectResponse;
        }
      }

    } catch (error) {
      // Token inválido - limpar cookie e redirecionar
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      redirectResponse.cookies.delete('@cmsblog.token');
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Aplicar middleware a todas as rotas exceto arquivos estáticos
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)'
  ]
};