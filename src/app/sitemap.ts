import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const baseUrl = 'https://camposocial.app';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/yaps`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Fetch public yaps, events, products, and profiles from API
  try {
    if (apiEndpoint) {
      // Fetch top yaps
      try {
        const yapsRes = await fetch(`${apiEndpoint}/public/yaps/top?limit=50`, {
          next: { revalidate: 3600 } // Revalidate every hour
        });
        if (yapsRes.ok) {
          const yapsData = await yapsRes.json();
          if (yapsData.yaps) {
            yapsData.yaps.forEach((yap: any) => {
              // Generate slug from yap ID (format: yapId-nanoid)
              // For sitemap, we'll use just the yap ID
              routes.push({
                url: `${baseUrl}/yaps/${yap.id}`,
                lastModified: yap.timestamp ? new Date(yap.timestamp) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            });
          }
        }
      } catch (e) {
        console.error('Error fetching yaps for sitemap:', e);
      }

      // Fetch top events
      try {
        const eventsRes = await fetch(`${apiEndpoint}/public/events/top?limit=50`, {
          next: { revalidate: 3600 }
        });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (eventsData.events) {
            eventsData.events.forEach((event: any) => {
              routes.push({
                url: `${baseUrl}/events/${event.eventId}`,
                lastModified: event.date_of_event ? new Date(event.date_of_event) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            });
          }
        }
      } catch (e) {
        console.error('Error fetching events for sitemap:', e);
      }

      // Fetch featured products
      try {
        const productsRes = await fetch(`${apiEndpoint}/public/products/featured?limit=50`, {
          next: { revalidate: 3600 }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData.products) {
            productsData.products.forEach((product: any) => {
              routes.push({
                url: `${baseUrl}/marketplace/products/${product.slug || product.id}`,
                lastModified: product.created_at ? new Date(product.created_at) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
              });
            });
          }
        }
      } catch (e) {
        console.error('Error fetching products for sitemap:', e);
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
