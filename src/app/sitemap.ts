import { MetadataRoute } from 'next';
import counties from '@/data/counties.json';
import { blogs } from '@/data/blogs';
import { areaToUrl, generateProfilePath, generateSeoPath } from '@/utils/urlHelpers';

const BASE_URL = 'https://alchemyst.co.ke';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alchemyst-node-tjam.onrender.com';

type SitemapEntry = MetadataRoute.Sitemap[number];

interface County {
  name: string;
  sub_counties?: string[];
}

interface Blog {
  id: string;
  publishDate?: string;
}

interface Profile {
  _id: string;
  id?: string;
  username: string;
  userType: string;
  age?: number;
  gender?: string;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
  location?: {
    county?: string;
    location?: string;
    area?: string | string[];
    areas?: string[];
  };
}

const now = new Date();

const withBaseUrl = (path: string) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const toDate = (value?: string) => {
  if (!value) return now;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
};

const addUnique = (entries: SitemapEntry[], seen: Set<string>, entry: SitemapEntry) => {
  if (seen.has(entry.url)) return;
  seen.add(entry.url);
  entries.push(entry);
};

const getProfileAreas = (profile: Profile) => {
  const areas = profile.location?.areas || profile.location?.area || [];
  return (Array.isArray(areas) ? areas : [areas]).filter(Boolean);
};

const normalizeProfileForUrl = (profile: Profile) => ({
  ...profile,
  _id: profile._id || profile.id || '',
  location: {
    ...profile.location,
    areas: getProfileAreas(profile),
  },
});

async function fetchProfiles() {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/all`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const profiles: Profile[] = data.profiles || data || [];

    return profiles.filter((profile) => profile._id && profile.username && profile.isActive !== false);
  } catch (error) {
    console.error('Sitemap: Failed to fetch profiles', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const profiles = await fetchProfiles();

  [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/escorts', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/masseuses', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/of-models', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/spas', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.2, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.4, changeFrequency: 'monthly' as const },
  ].forEach((page) => {
    addUnique(entries, seen, {
      url: withBaseUrl(page.path),
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  });

  (blogs as Blog[]).forEach((blog) => {
    addUnique(entries, seen, {
      url: withBaseUrl(`/blog/${blog.id}`),
      lastModified: toDate(blog.publishDate),
      changeFrequency: 'monthly',
      priority: 0.65,
    });
  });

  (counties as County[]).forEach((county) => {
    addUnique(entries, seen, {
      url: withBaseUrl(generateSeoPath({ county: county.name })),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.82,
    });

    county.sub_counties?.forEach((location) => {
      addUnique(entries, seen, {
        url: withBaseUrl(generateSeoPath({ county: county.name, location })),
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.76,
      });
    });
  });

  profiles.forEach((profile) => {
    const normalizedProfile = normalizeProfileForUrl(profile);
    const lastModified = toDate(profile.updatedAt || profile.createdAt);
    const isSpa = profile.userType === 'spa';

    addUnique(entries, seen, {
      url: withBaseUrl(generateProfilePath(normalizedProfile)),
      lastModified,
      changeFrequency: isSpa ? 'weekly' : 'daily',
      priority: isSpa ? 0.72 : 0.68,
    });

    const county = profile.location?.county;
    const location = profile.location?.location;

    if (county && location) {
      getProfileAreas(profile).forEach((area) => {
        addUnique(entries, seen, {
          url: withBaseUrl(
            `${generateSeoPath({ county, location })}/${areaToUrl(area)}`
          ),
          lastModified,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }
  });

  return entries;
}
