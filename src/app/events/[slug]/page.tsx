import { Metadata } from 'next'
import SingleEventCard from './SingleEventClient'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const eventId = params.slug;

  try {
    if (apiEndpoint) {
      const response = await fetch(`${apiEndpoint}/public/events/${eventId}`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (response.ok) {
        const event = await response.json();
        const title = event.title || 'CampoSocial Event';
        const description = event.description || '';
        const truncatedDescription = description.length > 200 ? description.substring(0, 197) + '...' : description;
        const posterUrl = event.poster || '/camposocial_logo.png';
        const location = event.location || '';
        const date = event.date || event.date_of_event || '';
        const startTime = event.start_time || '';

        return {
          title: `${title} | CampoSocial`,
          description: truncatedDescription || `${title} on CampoSocial${date ? ` - ${date}` : ''}${location ? ` at ${location}` : ''}`,
          openGraph: {
            title: title,
            description: truncatedDescription || `${title} on CampoSocial`,
            type: 'event',
            url: `https://camposocial.app/events/${eventId}`,
            images: [
              {
                url: posterUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
            siteName: 'CampoSocial',
          },
          twitter: {
            card: 'summary_large_image',
            title: title,
            description: truncatedDescription || `${title} on CampoSocial`,
            images: [posterUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for event:', error);
  }

  // Fallback metadata
  return {
    title: 'Event | CampoSocial',
    description: 'View this event on CampoSocial - Your Campus Connected',
  };
}

export default function SingleEventPage({ params }: Props) {
  return <SingleEventCard />
}
