/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'apiblog.builderseunegocioonline.com.br',
                port: '',
                pathname: '/files/**',
            },
        ],
    },
};

export default nextConfig;