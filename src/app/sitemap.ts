import { MetadataRoute } from 'next';
import counties from '@/data/counties.json';
import { countyToUrl } from '@/utils/urlHelpers';

const BASE_URL = 'https://alchemyst.co.ke';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alchemyst-node-tjam.onrender.com';

interface Profile {
  _id: string;
  username: string;
  userType: string;
  age?: number;
  gender?: string;
  location?: {
    county?: string;
    location?: string;
    areas?: string[];
  };
  updatedAt?: string;
}

function generateProfileSlug(profile: Profile): string {
  const parts: string[] = [];

  const username = profile.username
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'user';
  parts.push(username);

  const isSpa = profile.userType === 'spa';

  if (!isSpa) {
    if (profile.age) {
      parts.push('a', profile.age.toString(), 'years', 'old');
    }
    if (profile.gender) {
      parts.push(profile.gender.toLowerCase().replace(/\s+/g, '-'));
    }
  }

  parts.push(profile.userType?.toLowerCase().replace(/\s+/g, '-') || 'escort');

  if (profile.location?.county) {
    parts.push('from');
    parts.push(
      profile.location.county.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    );
    if (profile.location.location) {
      parts.push('in');
      parts.push(
        profile.location.location.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      );
      if (profile.location.areas && profile.location.areas.length > 0) {
        parts.push('in');
        parts.push(
          profile.location.areas[0].toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        );
      }
    }
  }

  return parts.join('-');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/escorts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/masseuses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/of-models`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/spas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // County pages
  const countyPages: MetadataRoute.Sitemap = counties.map((county) => ({
    url: `${BASE_URL}/${countyToUrl(county.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Fetch all profiles from API
  let profilePages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/all`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (response.ok) {
      const data = await response.json();
      const profiles: Profile[] = data.profiles || data || [];

      profilePages = profiles.map((profile) => {
        const userType = profile.userType?.toLowerCase() || 'escort';
        const slug = generateProfileSlug(profile);

        return {
          url: `${BASE_URL}/profile/${userType}/${slug}?id=${profile._id}`,
          lastModified: profile.updatedAt ? new Date(profile.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch (error) {
    console.error('Sitemap: Failed to fetch profiles', error);
  }

  return [...staticPages, ...countyPages, ...profilePages];
}
