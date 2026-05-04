/**
 * Smart URL utilities that work dynamically without manual mappings
 */

// SEO keywords to append to county/location URLs
const SEO_SUFFIXES = {
  county: ['escorts', 'massage', 'call-girls'],
  location: ['escorts'],
  area: [],
};

/**
 * Convert county name to SEO-friendly URL
 * "Nairobi" → "nairobi-escorts-massage-call-girls"
 */
export const countyToUrl = (countyName: string): string => {
  if (!countyName) return '';

  const base = countyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const suffix = SEO_SUFFIXES.county.join('-');
  return `${base}-${suffix}`;
};

/**
 * Extract county name from SEO URL
 * "nairobi-escorts-massage-call-girls" → "Nairobi"
 * "nairobi" → "Nairobi"
 */
export const urlToCounty = (urlSlug: string): string | null => {
  if (!urlSlug) return null;

  // Split by hyphen and get the first part (before SEO keywords)
  const parts = urlSlug.toLowerCase().split('-');

  // Remove common SEO keywords
  const seoKeywords = [
    'escorts',
    'massage',
    'call',
    'girls',
    'services',
    'spa',
    'hot',
    'independent',
  ];
  const countyParts = parts.filter((part) => !seoKeywords.includes(part));

  // Take the first part(s) as county name
  // Handle multi-word counties like "Trans Nzoia"
  const countyName = countyParts[0] || parts[0];

  // Capitalize first letter
  return countyName.charAt(0).toUpperCase() + countyName.slice(1);
};

/**
 * Convert location name to SEO-friendly URL
 * "South B" → "south-b-escorts"
 * "Westlands" → "westlands-escorts"
 */
export const locationToUrl = (locationName: string): string => {
  if (!locationName) return '';

  const base = locationName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const suffix = SEO_SUFFIXES.location.join('-');
  return suffix ? `${base}-${suffix}` : base;
};

/**
 * Extract location name from SEO URL
 * "south-b-escorts" → "South B"
 * "westlands-escorts" → "Westlands"
 */
export const urlToLocation = (urlSlug: string): string | null => {
  if (!urlSlug) return null;

  // Split by hyphen
  const parts = urlSlug.toLowerCase().split('-');

  // Remove common SEO keywords from the end
  const seoKeywords = ['escorts', 'massage', 'call', 'girls', 'services', 'spa'];
  const locationParts = parts.filter((part) => !seoKeywords.includes(part));

  // Join remaining parts and capitalize each word
  return locationParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Convert area name to URL-friendly slug
 * "Kilimani Area" → "kilimani-area"
 */
export const areaToUrl = (areaName: string): string => {
  if (!areaName) return '';

  return areaName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

/**
 * Extract area name from URL slug
 * "kilimani-area" → "Kilimani Area"
 */
export const urlToArea = (urlSlug: string): string | null => {
  if (!urlSlug) return null;

  return urlSlug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Generate full SEO path for navigation
 */
export const generateSeoPath = ({
  county,
  location,
  area,
}: {
  county?: string;
  location?: string;
  area?: string;
}): string => {
  const parts: string[] = [];

  if (county) {
    parts.push(countyToUrl(county));
  }

  if (location) {
    parts.push(locationToUrl(location));
  }

  if (area) {
    parts.push(areaToUrl(area));
  }

  return '/' + parts.join('/');
};

/**
 * Parse SEO path to get actual names
 * "/nairobi-escorts-massage-call-girls/westlands-escorts/kilimani"
 * → { county: "Nairobi", location: "Westlands", area: "Kilimani" }
 */
export const parseSeoPath = (
  path: string
): { county: string | null; location: string | null; area: string | null } => {
  const parts = path.split('/').filter(Boolean);

  return {
    county: parts[0] ? urlToCounty(parts[0]) : null,
    location: parts[1] ? urlToLocation(parts[1]) : null,
    area: parts[2] ? urlToArea(parts[2]) : null,
  };
};

/**
 * Validate if URL matches actual data (optional - for 404 handling)
 */
export const validateCountyUrl = (urlSlug: string, countyName: string): boolean => {
  const extractedCounty = urlToCounty(urlSlug);
  return extractedCounty ? extractedCounty.toLowerCase() === countyName.toLowerCase() : false;
};

/**
 * Generate SEO-optimized profile URL slug
 * For escorts/masseuse/of-models: "username-a-25-years-old-male-escort-from-nairobi-in-south-b-in-kilimani"
 * For spas: "username-spa-from-nairobi-in-south-b-in-kilimani"
 */
export const generateProfileSlug = (profile: {
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
}): string => {
  const parts: string[] = [];
  
  // Username
  const username = profile.username
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'user';
  parts.push(username);

  const isSpa = profile.userType === 'spa';

  // Age and gender (not for spas)
  if (!isSpa) {
    if (profile.age) {
      parts.push('a', profile.age.toString(), 'years', 'old');
    }
    
    if (profile.gender) {
      const gender = profile.gender.toLowerCase().replace(/\s+/g, '-');
      parts.push(gender);
    }
  }

  // User type
  const userType = profile.userType?.toLowerCase().replace(/\s+/g, '-') || 'escort';
  parts.push(userType);

  // Location
  if (profile.location?.county) {
    parts.push('from');
    const county = profile.location.county
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    parts.push(county);

    if (profile.location.location) {
      parts.push('in');
      const location = profile.location.location
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      parts.push(location);

      // First area if available
      if (profile.location.areas && profile.location.areas.length > 0) {
        parts.push('in');
        const area = profile.location.areas[0]
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        parts.push(area);
      }
    }
  }

  // Note: ID is no longer embedded in slug - it's passed as query param instead
  return parts.join('-');
};

/**
 * Parse profile slug to extract ID
 * "scott881-a-25-years-old-male-escort-from-nairobi-in-south-b-in-kilimani-68eeaf22609154982347101e"
 * → "68eeaf22609154982347101e"
 */
export const parseProfileSlug = (slug: string): string | null => {
  if (!slug) return null;
  
  // ID is always the last part and is 24 characters (MongoDB ObjectId)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if it looks like a MongoDB ObjectId (24 hex characters)
  if (lastPart && /^[a-f0-9]{24}$/i.test(lastPart)) {
    return lastPart;
  }
  
  return null;
};

/**
 * Generate full profile URL path with ID as query parameter
 * Example: /profile/escort/username-a-25-years-old-male-escort-from-nairobi-in-langata?id=69766963a678f91a6c58991f
 */
export const generateProfilePath = (profile: {
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
}): string => {
  const userType = profile.userType?.toLowerCase() || 'escort';
  const slug = generateProfileSlug(profile);
  return `/profile/${userType}/${slug}?id=${profile._id}`;
};
