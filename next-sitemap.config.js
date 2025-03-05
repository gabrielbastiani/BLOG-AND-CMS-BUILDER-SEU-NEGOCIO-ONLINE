module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_URL_BLOG || 'https://blog.builderseunegocioonline.com.br',
  generateRobotsTxt: true,
  exclude: [
    '/dashboard*',
    '/user*',
    '/contacts_form*',
    '/newsletter',
    '/categories*',
    '/tags*',
    '/posts*',
    '/marketing_publication*',
    '/configurations*',
    '/server-sitemap.xml',
    '/email*',
    '/login',
    '/register',
    '/recover*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/user',
          '/contacts_form',
          '/categories',
          '/tags',
          '/posts',
          '/marketing_publication',
          '/configurations'
        ]
      }
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_URL_BLOG}/sitemap.xml`
    ],
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  }
}