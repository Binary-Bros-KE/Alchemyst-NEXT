import type { Metadata } from 'next';
import BlogsPageClient from '@/components/blog/BlogsPageClient';

const SITE_URL = 'https://alchemyst.co.ke';

export const metadata: Metadata = {
  title: 'Blog | Alchemyst Kenya',
  description:
    'Explore Alchemyst blog articles on relationships, intimacy, sex education, escorts, spas, and industry insights in Kenya.',
  keywords: [
    'Alchemyst blog',
    'Kenya blog',
    'sex education Kenya',
    'escort blog Kenya',
    'spa reviews Kenya',
    'relationship tips',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog | Alchemyst Kenya',
    description:
      'Explore featured and latest Alchemyst articles on intimacy, wellness, and lifestyle in Kenya.',
    url: `${SITE_URL}/blog`,
    siteName: 'Alchemyst',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dowxcmeyy/image/upload/v1760962804/alchemyst-sex-talk_fhazdb.png',
        width: 1200,
        height: 630,
        alt: 'Alchemyst Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Alchemyst Kenya',
    description: 'Explore featured and latest Alchemyst articles in Kenya.',
    images: ['https://res.cloudinary.com/dowxcmeyy/image/upload/v1760962804/alchemyst-sex-talk_fhazdb.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function BlogPage() {
  return <BlogsPageClient />;
}
