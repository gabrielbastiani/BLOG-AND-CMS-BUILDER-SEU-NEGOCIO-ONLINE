// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = (phase) => {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = !isDev;

  return {
    env: {
      // Força o carregamento das variáveis do .env.local
      API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    reactStrictMode: true,

    // Configurações de Imagens (Dinâmica por ambiente)
    images: {
      remotePatterns: [
        ...(isDev ?
          [
            // Permissões para desenvolvimento
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '3333'
            },
            {
              protocol: 'http',
              hostname: '127.0.0.1',
              port: '3333'
            }
          ] :
          [
            // Permissões para produção
            {
              protocol: 'https',
              hostname: 'apiblog.builderseunegocioonline.com.br'
            }
          ])
      ],
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: isDev ? 0 : 60
    },

    // Configurações Experimentais
    experimental: {
      typedRoutes: true,
      serverActions: {
        enabled: true,
        allowedOrigins: isProd ? ['apiblog.builderseunegocioonline.com.br'] : undefined
      }
    },

    // Compilador
    compiler: {
      styledComponents: {
        ssr: true,
        displayName: isDev,
        minify: isProd
      }
    },

    // Validações
    typescript: {
      ignoreBuildErrors: isDev // Mantém checagem rigorosa em produção
    },
    eslint: {
      ignoreDuringBuilds: isDev
    },

    // Otimizações para produção
    ...(isProd && {
      output: 'standalone',
      swcMinify: true,
      compress: true
    }),

    // Webpack (Configuração compartilhada)
    webpack: (config) => {
      if (isDev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300
        };
      }
      return config;
    },
    output: 'standalone',
    productionBrowserSourceMaps: false,
    logging: {
      level: isDev ? 'debug' : 'error'
    },
    headers: async () => {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            }
          ],
        },
      ]
    }
  };
};

export default nextConfig;