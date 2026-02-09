import { Metadata } from 'next'
import ProfilePageClient from './ProfilePageClient'

type Props = {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const username = params.username;

  try {
    if (apiEndpoint) {
      const response = await fetch(`${apiEndpoint}/public/yaps/profile/${username}`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (response.ok) {
        const profile = await response.json();
        
        if (profile.is_private) {
          return {
            title: `${profile.display_name || profile.username} | CampoSocial`,
            description: 'This account is private',
            robots: {
              index: false,
              follow: false,
            },
          };
        }

        const displayName = profile.display_name || profile.username || 'CampoSocial User';
        const bio = profile.bio || '';
        const truncatedBio = bio.length > 200 ? bio.substring(0, 197) + '...' : bio;
        const avatarUrl = profile.avatar || '/camposocial_logo.png';
        const headerImageUrl = profile.yap_header_img || '/camposocial_logo.png';

        return {
          title: `${displayName} (@${profile.username}) | CampoSocial`,
          description: truncatedBio || `${displayName} on CampoSocial - ${profile.yaps_count || 0} yaps, ${profile.followers_count || 0} followers`,
          openGraph: {
            title: `${displayName} (@${profile.username})`,
            description: truncatedBio || `${displayName} on CampoSocial`,
            type: 'profile',
            url: `https://camposocial.app/yaps/profile/${username}`,
            images: [
              {
                url: headerImageUrl,
                width: 1200,
                height: 630,
                alt: `${displayName}'s profile header`,
              },
              {
                url: avatarUrl,
                width: 400,
                height: 400,
                alt: `${displayName}'s profile picture`,
              },
            ],
            siteName: 'CampoSocial',
          },
          twitter: {
            card: 'summary_large_image',
            title: `${displayName} (@${profile.username})`,
            description: truncatedBio || `${displayName} on CampoSocial`,
            images: [headerImageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for profile:', error);
  }

  // Fallback metadata
  return {
    title: `${username} | CampoSocial`,
    description: `View ${username}'s profile on CampoSocial - Your Campus Connected`,
  };
}

export default function ProfilePage({ params }: Props) {
  return <ProfilePageClient />
}
