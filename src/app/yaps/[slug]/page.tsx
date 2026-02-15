import { Metadata } from 'next'
import SingleYapClient from './SingleYapClient'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const { slug } = await params;

  try {
    if (apiEndpoint) {
      const response = await fetch(`${apiEndpoint}/public/yaps/${slug}`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (response.ok) {
        const yap = await response.json();
        const content = yap.content || '';
        const truncatedContent = content.length > 200 ? content.substring(0, 197) + '...' : content;
        const authorName = yap.display_name || yap.username || 'CampoSocial User';
        const mediaUrl = yap.media && yap.media.length > 0 ? yap.media[0].url : '/camposocial_logo.png';

        return {
          title: `${authorName} on CampoSocial`,
          description: truncatedContent || `View this yap by ${authorName} on CampoSocial`,
          openGraph: {
            title: `${authorName} on CampoSocial`,
            description: truncatedContent || `View this yap by ${authorName} on CampoSocial`,
            type: 'article',
            url: `https://camposocial.app/yaps/${slug}`,
            images: [
              {
                url: mediaUrl,
                width: 1200,
                height: 630,
                alt: `Yap by ${authorName}`,
              },
            ],
            siteName: 'CampoSocial',
          },
          twitter: {
            card: 'summary_large_image',
            title: `${authorName} on CampoSocial`,
            description: truncatedContent || `View this yap by ${authorName}`,
            images: [mediaUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for yap:', error);
  }

  // Fallback metadata
  return {
    title: 'Yap | CampoSocial',
    description: 'View this yap on CampoSocial - Your Campus Connected',
  };
}

export default async function SingleYapPage({ params }: Props) {
  const { slug } = await params;
  return <SingleYapClient slug={slug} />
}