/** @type {import('next').NextConfig} */

const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.intra.42.fr',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'http',
                hostname: process.env.IP_ADDRESS,
                port: process.env.BACKEND_PORT,
                pathname: '/user/avatars/*',
            },
            {
                protocol: 'http',
                hostname: process.env.IP_ADDRESS,
                port: process.env.BACKEND_PORT,
                pathname: '/user/themes/*',
            },
        ],
    },
}

module.exports = nextConfig;
