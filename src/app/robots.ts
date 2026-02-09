import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://camposocial.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/yaps',
          '/yaps/*',
          '/events',
          '/events/*',
          '/marketplace',
          '/marketplace/products/*',
        ],
        disallow: [
          '/api/',
          '/friends',
          '/chat',
          '/messages',
          '/userprofile',
          '/profilesettings',
          '/sellerdashboard',
          '/addevent',
          '/complete-profile',
          '/login',
          '/signup',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
