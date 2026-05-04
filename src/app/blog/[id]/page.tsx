import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailsClient from '@/components/blog/BlogDetailsClient';
import { blogs } from '@/data/blogs';

const SITE_URL = 'https://alchemyst.co.ke';

type Params = { id: string };

export function generateStaticParams() {
  return (blogs as any[]).map((blog) => ({ id: blog.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const blog = (blogs as any[]).find((b) => b.id === id);

  if (!blog) {
    return {
      title: 'Blog Not Found | Alchemyst',
      description: 'The requested blog article could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${blog.id}`;
  const description = blog.excerpt || 'Read this article on Alchemyst blog.';

  return {
    title: `${blog.title} | Alchemyst Blog`,
    description,
    keywords: [
      ...(blog.tags || []),
      blog.category || 'Alchemyst Blog',
      'Alchemyst Kenya',
      'Kenya blog',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description,
      url: canonicalUrl,
      siteName: 'Alchemyst',
      locale: 'en_KE',
      type: 'article',
      publishedTime: blog.publishDate,
      authors: blog.author ? [blog.author] : undefined,
      tags: blog.tags || undefined,
      images: blog.coverImage
        ? [
            {
              url: blog.coverImage,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.coverImage ? [blog.coverImage] : undefined,
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
}

export default async function BlogDetailsPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const blog = (blogs as any[]).find((b) => b.id === id);

  if (!blog) {
    notFound();
  }

  return <BlogDetailsClient id={id} />;
}
