"use client";

import Head from 'next/head';
import StructuredData from './StructuredData';
import { SEOHeadProps } from '@/types';

export default function SEOHead({
  title = "CampoSocial - Your Campus Connected",
  description = "The ultimate social platform designed for university life. Connect with your campus community, discover epic events, trade in the marketplace, and build lasting friendships.",
  keywords = [],
  image = "/camposocial_logo.png",
  url = "https://camposocial.app",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  structuredData,
  noindex = false,
  canonical
}: SEOHeadProps) {
  const fullTitle = title.includes('CampoSocial') ? title : `${title} | CampoSocial`;
  const fullDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  
  const defaultKeywords = [
    "campus social network",
    "university social platform", 
    "student community",
    "campus events",
    "student marketplace",
    "college social app"
  ];
  
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={fullDescription} />
        <meta name="keywords" content={allKeywords.join(', ')} />
        <meta name="author" content={author || "CampoSocial Team"} />
        
        {/* Canonical URL */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* Robots */}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={fullDescription} />
        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="CampoSocial" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@camposocial" />
        <meta name="twitter:creator" content="@camposocial" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={fullDescription} />
        <meta name="twitter:image" content={image} />
        
        {/* Article specific meta tags */}
        {type === 'article' && publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {type === 'article' && modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {type === 'article' && author && (
          <meta property="article:author" content={author} />
        )}
        
        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/camposocial_logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/camposocial_logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/camposocial_logo.png" />
        <link rel="mask-icon" href="/camposocial_logo.png" color="#8B5CF6" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      
      {/* Structured Data */}
      {structuredData && (
        <StructuredData 
          type={type === 'article' ? 'article' : type === 'event' ? 'event' : type === 'product' ? 'product' : 'website'} 
          data={structuredData} 
        />
      )}
    </>
  );
}

