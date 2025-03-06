/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
    },
    env: {
        SITE_URL: process.env.NEXT_PUBLIC_URL_BLOG || 'http://localhost:3000',
    }
};

export default nextConfig;