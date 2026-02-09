import { Metadata } from 'next'
import SingleProductPage from './ProductClient'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const slug = params.slug;

  try {
    if (apiEndpoint) {
      // Try to fetch product by slug
      const response = await fetch(`${apiEndpoint}/products/${slug}`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (response.ok) {
        const product = await response.json();
        const title = product.title || product.name || 'CampoSocial Product';
        const description = product.description || '';
        const truncatedDescription = description.length > 200 ? description.substring(0, 197) + '...' : description;
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : (product.image_url || '/camposocial_logo.png');
        const price = product.price || 0;
        const sellerName = product.seller?.name || 'CampoSocial Seller';

        return {
          title: `${title} | CampoSocial Marketplace`,
          description: truncatedDescription || `${title} - KES ${price.toFixed(2)} on CampoSocial Marketplace`,
          openGraph: {
            title: title,
            description: truncatedDescription || `${title} - KES ${price.toFixed(2)}`,
            type: 'product',
            url: `https://camposocial.app/marketplace/products/${slug}`,
            images: [
              {
                url: imageUrl,
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
            description: truncatedDescription || `${title} - KES ${price.toFixed(2)}`,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for product:', error);
  }

  // Fallback metadata
  return {
    title: 'Product | CampoSocial Marketplace',
    description: 'View this product on CampoSocial Marketplace - Your Campus Connected',
  };
}

export default function ProductPage({ params }: Props) {
  return <SingleProductPage />
}
