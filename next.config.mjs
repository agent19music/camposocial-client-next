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
            hostname: 'pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev', // Cloudflare R2 hostname
            port: '',
            pathname: '/**', // This allows all paths under this hostname
          },
        ],
        domains: ['m.media-amazon.com', 'ke.jumia.is',  'www.maccosmetics.com',
          'blushbox.store',
          'm.cremedelamer.com',
          'bluemercury.com',
          'www.cultbeauty.com',
          'www.eve.co.ke',
          'beautinow.com',
          'cdn.cosmostore.org',
          'static.thcdn.com'], 
      },
};

export default nextConfig;
