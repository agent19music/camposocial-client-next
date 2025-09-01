"use client";

import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'event' | 'product' | 'article';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Create new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [data]);

  return null; // This component doesn't render anything
}

// Predefined structured data schemas
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CampoSocial",
  "alternateName": "CampoSocial - Your Campus Connected",
  "url": "https://camposocial.com",
  "description": "The ultimate social platform designed for university life. Connect with your campus community, discover epic events, trade in the marketplace, and build lasting friendships.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://camposocial.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://twitter.com/camposocial",
    "https://instagram.com/camposocial",
    "https://facebook.com/camposocial"
  ]
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CampoSocial",
  "url": "https://camposocial.com",
  "logo": "https://camposocial.com/camposocial_logo.png",
  "description": "The ultimate social platform designed for university life",
  "foundingDate": "2024",
  "sameAs": [
    "https://twitter.com/camposocial",
    "https://instagram.com/camposocial",
    "https://facebook.com/camposocial"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@camposocial.com"
  }
};

export const eventSchema = (eventData: any) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": eventData.title,
  "description": eventData.description,
  "startDate": eventData.startDate,
  "endDate": eventData.endDate,
  "location": {
    "@type": "Place",
    "name": eventData.location,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": eventData.city,
      "addressRegion": eventData.state,
      "addressCountry": "US"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "CampoSocial"
  },
  "offers": {
    "@type": "Offer",
    "price": eventData.price,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
});

export const productSchema = (productData: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": productData.name,
  "description": productData.description,
  "image": productData.image,
  "offers": {
    "@type": "Offer",
    "price": productData.price,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Person",
      "name": productData.sellerName
    }
  }
});

export const articleSchema = (articleData: any) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": articleData.title,
  "description": articleData.description,
  "image": articleData.image,
  "author": {
    "@type": "Person",
    "name": articleData.authorName
  },
  "publisher": {
    "@type": "Organization",
    "name": "CampoSocial",
    "logo": {
      "@type": "ImageObject",
      "url": "https://camposocial.com/camposocial_logo.png"
    }
  },
  "datePublished": articleData.publishedDate,
  "dateModified": articleData.modifiedDate
});

