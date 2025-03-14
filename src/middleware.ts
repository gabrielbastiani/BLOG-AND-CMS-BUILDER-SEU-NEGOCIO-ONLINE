import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rotas de autenticação (usuário autenticado não deve acessá-las)
const PUBLIC_AUTH_ROUTES = [
  '/login',
  '/register',
  '/recovery_password'
];

// Rotas que requerem autenticação e controle de acesso por role
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

// Rotas restritas por role
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  SUPER_ADMIN: [
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
  ],
  ADMIN: [
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
  ],
  EMPLOYEE: [
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/dashboard',
    '/categories/all_categories',
    '/user/profile',
    '/central_notifications'
  ]
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Se a rota não for protegida nem for de autenticação, permite acesso livre
  if (!PROTECTED_ROUTES.includes(pathname) && !PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Obtém o token do cookie
  const token = req.cookies.get('@cmsblog.token')?.value;

  // Se não houver token e a rota for protegida, redireciona para o login
  if (!token) {
    if (PROTECTED_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  let payload: any;
  try {
    // A chave secreta deve estar definida (por exemplo, em process.env.JWT_SECRET)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload: verifiedPayload } = await jwtVerify(token, secret);
    payload = verifiedPayload;
  } catch (error) {
    // Se ocorrer erro na verificação, limpa o cookie e redireciona para o login
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('@cmsblog.token');
    return response;
  }

  // Se o usuário autenticado tentar acessar uma rota de autenticação (ex: /login),
  // redireciona para o dashboard
  if (PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Para rotas protegidas, verifica se o token contém a propriedade "role" e se essa role tem acesso à rota
  if (PROTECTED_ROUTES.includes(pathname)) {
    const userRole = payload.role;
    if (!userRole || !hasAccessToRoute(userRole, pathname)) {
      // Se não houver role ou a role não permitir acesso, limpa o cookie e redireciona para o login
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('@cmsblog.token');
      return response;
    }
  }

  return NextResponse.next();
}

// Função que verifica se a role do usuário permite o acesso à rota solicitada
function hasAccessToRoute(userRole: string, pathname: string): boolean {
  const allowedRoutes = ROLE_BASED_ROUTES[userRole];
  return allowedRoutes ? allowedRoutes.includes(pathname) : false;
}

export const config = {
  matcher: [
    // Aplica o middleware a todas as rotas, exceto arquivos estáticos e favicon
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/',
    '/(.*)'
  ]
};