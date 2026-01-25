/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
            hostname: '6eb9d92e84a9ebc29025971e4cef544e.r2.cloudflarestorage.com', // Cloudflare R2 hostname
            port: '',
            pathname: '/**', // This allows all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'www.eve.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'beautinow.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cosmostore.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tapback.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.thcdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
