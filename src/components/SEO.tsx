import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string;
}

export default function SEO({
  title = "EB's Closet - Beautiful Dresses for Girls 7-13",
  description = "Premium collection of beautiful dresses for girls aged 7-13. Perfect for any occasion. Shop EB's Closet for high-quality, stylish girls' fashion.",
  canonical = "https://www.ebscloset.com.au",
  ogTitle,
  ogDescription,
  ogImage = "https://www.ebscloset.com.au/logo.png",
  twitterImage,
  keywords = "girls dresses, teen fashion, special occasion dresses, kids clothing, 7-13 years dresses, EB's Closet",
}: SEOProps) {
  const fullTitle = title.includes("EB's Closet") ? title : `${title} | EB's Closet`;
  const defaultOgImage = "https://www.ebscloset.com.au/logo.png"; // Fallback to logo if no specific image is provided
  
  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:url" content={ogUrl || canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage || defaultOgImage} />
    </Helmet>
  );
}
