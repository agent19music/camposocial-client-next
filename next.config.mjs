/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment (reduces image size by 80%)
  output: 'standalone',

  // Cloud Run optimizations
  compress: true,
  poweredByHeader: false,

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
        hostname: 'pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev', // Cloudflare R2 hostname
        port: '',
        pathname: '/**', // This allows all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'pub-0a313ba028f9423cba4b9803d081b5db.r2.dev', // Cloudflare R2 hostname
        port: '',
        pathname: '/**', // This allows all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'pub-abe4a6405e724602a7fac9bf761e290c.r2.dev', // Cloudflare R2 hostname
        port: '',
        pathname: '/**', // This allows all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Cloudflare R2 hostname
        port: '',
        pathname: '/**', // This allows all paths under this hostname
      },
    ],
    domains: ['m.media-amazon.com', 'ke.jumia.is', 'www.maccosmetics.com',
      'blushbox.store',
      'm.cremedelamer.com',
      'bluemercury.com',
      'www.cultbeauty.com',
      'www.eve.co.ke',
      'beautinow.com',
      'cdn.cosmostore.org',
      'tapback.co',
      'static.thcdn.com',
      'placehold.co'
    ],
  },

  // WebAssembly support for @signalapp/libsignal-client
  webpack: (config, { isServer }) => {
    // Enable async WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Fix for WASM modules in Next.js
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Exclude libsignal from server-side bundling (client-only)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@signalapp/libsignal-client');
    }

    return config;
  },
};

export default nextConfig;