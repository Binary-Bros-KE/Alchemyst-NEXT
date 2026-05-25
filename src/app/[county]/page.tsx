'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllProfiles } from '@/lib/features/profiles/profilesSlice';
import type { RootState } from '@/lib/store';
import ProfileCard from '@/components/ProfileCard';
import SpaCard from '@/components/SpaCard';
import locationsData from '@/data/counties.json';
import { generateSeoPath, urlToCounty, urlToLocation, urlToArea } from '@/utils/urlHelpers';
import { FiArrowLeft } from 'react-icons/fi';
import { IoStarOutline } from 'react-icons/io5';
import { MdOutlineLocalFireDepartment } from 'react-icons/md';
import { LuLeaf, LuSpade, LuSearchCheck } from 'react-icons/lu';
import { CgGirl } from 'react-icons/cg';
import { GiSelfLove, GiCurlyMask, GiDualityMask } from 'react-icons/gi';

interface Profile {
  _id: string;
  username?: string;
  userType: string;
  packageType?: string;
  serviceType?: string;
  age?: number;
  gender?: string;
  bio?: string;
  profileImage?: { url: string };
  secondaryImages?: { url: string }[];
  location?: {
    county?: string;
    location?: string;
    area?: string[];
  };
  contact?: {
    phoneNumber?: string;
    hasWhatsApp?: boolean;
  };
  services?: { name: string }[];
  currentPackage?: {
    packageType?: string;
    status?: string;
  };
  verification?: {
    profileVerified?: boolean;
  };
  [key: string]: any;
}

interface ProfilesByTier {
  elite: Profile[];
  premium: Profile[];
  basic: Profile[];
}

interface RenderSectionProps {
  tier: 'elite' | 'premium' | 'basic';
  icon: React.ReactNode;
  items: Profile[];
  title: string;
  description: string;
}

export default function LocationPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  // Parse URL params - could be /:county, /:county/:location, /:county/:location/:area
  const countyParam = params.county as string;
  const locationParam = (params as any).location as string | undefined;
  const areaParam = (params as any).area as string | undefined;

  // Decode URL slugs to actual names
  const county = countyParam ? urlToCounty(countyParam) : null;
  const location = locationParam ? urlToLocation(locationParam) : null;
  const area = areaParam ? urlToArea(areaParam) : null;

  const { allProfiles, loading } = useAppSelector(
    (state: RootState) => state.profiles
  );

  const [bgImage, setBgImage] = useState(
    'https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969542/alchemyst-escorts_e0cdbo.png'
  );
  const [locationsList, setLocationsList] = useState<string[]>([]);
  const [areasList, setAreasList] = useState<string[]>([]);
  const [profilesByTier, setProfilesByTier] = useState<ProfilesByTier>({
    elite: [],
    premium: [],
    basic: [],
  });
  const [spasByTier, setSpasByTier] = useState<ProfilesByTier>({
    elite: [],
    premium: [],
    basic: [],
  });
  const [localLoading, setLocalLoading] = useState(false);

  // Fetch profiles on mount
  useEffect(() => {
    dispatch(fetchAllProfiles());
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Update background image based on county
  useEffect(() => {
    if (!county) return;
    const countyData = (locationsData as any[]).find(
      (c) => c.name.toLowerCase() === county.toLowerCase()
    );
    setBgImage(
      countyData?.coverImage ||
        'https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969542/alchemyst-escorts_e0cdbo.png'
    );
  }, [county]);

  // Filter profiles and extract locations/areas from URL params
  useEffect(() => {
    if (!county || allProfiles.length === 0) return;

    setLocalLoading(true);

    const timer = setTimeout(() => {
      let filtered = allProfiles.filter(
        (p: Profile) => p.location?.county?.toLowerCase() === county.toLowerCase()
      );

      const locations = [
        ...new Set(
          filtered
            .map((p: Profile) => p.location?.location)
            .filter(Boolean) as string[]
        ),
      ].sort();
      setLocationsList(locations);

      if (location && location !== 'all') {
        filtered = filtered.filter(
          (p: Profile) => p.location?.location?.toLowerCase() === location.toLowerCase()
        );

        const areas = [
          ...new Set(
            filtered
              .flatMap((p: Profile) => p.location?.area || [])
              .filter(Boolean) as string[]
          ),
        ].sort();
        setAreasList(areas);
      } else {
        setAreasList([]);
      }

      if (area && area !== 'all') {
        filtered = filtered.filter((p: Profile) =>
          p.location?.area?.some((a) => a?.toLowerCase() === area.toLowerCase())
        );
      }

      const newProfiles: ProfilesByTier = { elite: [], premium: [], basic: [] };
      const newSpas: ProfilesByTier = { elite: [], premium: [], basic: [] };

      filtered.forEach((profile: Profile) => {
        const activePackage =
          profile.currentPackage?.status === 'active'
            ? profile.currentPackage
            : profile.purchasedPackages?.find((p: { status?: string }) => p.status === 'active');
        const tier = (activePackage?.packageType || 'basic').toLowerCase() as
          | 'elite'
          | 'premium'
          | 'basic';

        if (profile.userType === 'spa') {
          newSpas[tier].push(profile);
        } else {
          newProfiles[tier].push(profile);
        }
      });

      setProfilesByTier(newProfiles);
      setSpasByTier(newSpas);
      setLocalLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [allProfiles, county, location, area]);

  const handleLocationClick = (loc: string) => {
    if (loc === 'all') {
      const path = generateSeoPath({ county: county || undefined });
      router.push(path);
    } else {
      const path = generateSeoPath({ county: county || undefined, location: loc });
      router.push(path);
    }
  };

  const handleAreaClick = (areaName: string) => {
    if (areaName === 'all') {
      const path = generateSeoPath({ county: county || undefined, location: location || undefined });
      router.push(path);
    } else {
      const path = generateSeoPath({
        county: county || undefined,
        location: location || undefined,
        area: areaName,
      });
      router.push(path);
    }
  };

  const renderProfileSection = ({
    tier,
    icon,
    items,
    title,
    description,
  }: RenderSectionProps) => {
    if (items.length === 0) return null;

    const bgColor =
      tier === 'elite'
        ? 'bg-yellow-50 border-yellow-400'
        : tier === 'premium'
          ? 'bg-purple-50 border-purple-400'
          : 'bg-gray-50 border-gray-400';

    const iconColor =
      tier === 'elite'
        ? 'text-yellow-400'
        : tier === 'premium'
          ? 'text-purple-400'
          : 'text-gray-400';

    return (
      <div key={`profiles-${tier}`} className="mb-12">
        <div className={`p-6 max-md:p-2 rounded-lg mb-6 border-l-4 ${bgColor}`}>
          <div className={`flex items-center gap-2 mb-2 ${iconColor}`}>
            <span>{icon}</span>
            <h2 className="text-2xl max-md:text-sm font-bold text-foreground">{title}</h2>
          </div>
          <p className="text-muted-foreground max-md:text-xs">{description}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((profile) => (
            <ProfileCard key={profile._id} profile={profile as any} />
          ))}
        </div>
      </div>
    );
  };

  const renderSpaSection = ({
    tier,
    icon,
    items,
    title,
    description,
  }: RenderSectionProps) => {
    if (items.length === 0) return null;

    const bgColor =
      tier === 'elite'
        ? 'bg-yellow-50 border-yellow-400'
        : tier === 'premium'
          ? 'bg-purple-50 border-purple-400'
          : 'bg-gray-50 border-gray-400';

    const iconColor =
      tier === 'elite'
        ? 'text-yellow-400'
        : tier === 'premium'
          ? 'text-purple-400'
          : 'text-gray-400';

    return (
      <div key={`spas-${tier}`} className="mb-12">
        <div className={`p-6 max-md:p-2 rounded-lg mb-6 border-l-4 ${bgColor}`}>
          <div className={`flex items-center gap-2 mb-2 ${iconColor}`}>
            <span>{icon}</span>
            <h2 className="text-2xl max-md:text-sm font-bold text-foreground">{title}</h2>
          </div>
          <p className="text-muted-foreground max-md:text-xs">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((spa) => (
            <SpaCard key={spa._id} profile={spa as any} />
          ))}
        </div>
      </div>
    );
  };

  const totalProfiles =
    profilesByTier.elite.length +
    profilesByTier.premium.length +
    profilesByTier.basic.length;
  const totalSpas =
    spasByTier.elite.length + spasByTier.premium.length + spasByTier.basic.length;

  const getPageTitle = () => {
    if (area) return `${area} Escorts`;
    if (location) return `${location} Call Girls`;
    return `${county} Escorts`;
  };

  const getPageSubtitle = () => {
    if (area) return `Location: ${location}, County: ${county}`;
    if (location) return `County: ${county}`;
    return `Browse all locations in ${county} County`;
  };

  const showLoading = (loading && allProfiles.length === 0) || localLoading;
  const showNoResults =
    !showLoading && allProfiles.length > 0 && totalProfiles === 0 && totalSpas === 0;
  const showContent = !showLoading && !showNoResults;

  if (!county) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-muted">County not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center py-10 px-4 relative"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto max-w-7xl z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-inverse/80 hover:text-text-inverse mb-6 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <h1 className="text-4xl font-bold text-text-inverse mb-2 capitalize">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-text-inverse/70 capitalize">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {locationsList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {location ? 'Other Locations' : 'Browse by Location'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {locationsList.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocationClick(loc)}
                  className={`px-4 py-1 rounded-full border transition-all text-sm cursor-pointer ${
                    location === loc
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-foreground border-border hover:bg-gray-50'
                  }`}
                >
                  {loc}
                </button>
              ))}
              {location && (
                <button
                  onClick={() => handleLocationClick('all')}
                  className="px-4 py-1 text-sm rounded-full border border-border bg-white text-foreground hover:bg-gray-50 transition-all cursor-pointer"
                >
                  All Locations
                </button>
              )}
            </div>
          </div>
        )}

        {areasList.length > 0 && (
          <div className="mb-0">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {area ? 'Other Areas' : 'Browse by Area'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {areasList.map((areaName, idx) => (
                <button
                  key={`${areaName}-${idx}`}
                  onClick={() => handleAreaClick(areaName)}
                  className={`px-4 py-1 rounded-full border transition-all text-sm cursor-pointer ${
                    area === areaName
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-foreground border-border hover:bg-gray-50'
                  }`}
                >
                  {areaName}
                </button>
              ))}
              {area && (
                <button
                  onClick={() => handleAreaClick('all')}
                  className="px-4 py-1 text-sm rounded-full border border-border bg-white text-foreground hover:bg-gray-50 transition-all"
                >
                  All Areas
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {showLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : showNoResults ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">
              No profiles found in this location.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
            >
              Go Back
            </button>
          </div>
        ) : (
          showContent && (
            <>
              {/* VIP Spas */}
              {renderSpaSection({
                tier: 'elite',
                icon: <IoStarOutline size={30} />,
                items: spasByTier.elite,
                title: 'VIP LUXURY SPAS & PARLORS',
                description: `Step into ultimate luxury with ${area || location || county}'s most exclusive adult entertainment venues. These premium spas offer VIP treatment, elite services, and complete discretion.`,
              })}

              {/* VIP Escorts */}
              {renderProfileSection({
                tier: 'elite',
                icon: <MdOutlineLocalFireDepartment size={30} />,
                items: profilesByTier.elite,
                title: 'VIP ESCORTS & MODELS',
                description: `These are the sexiest call girls, escorts, masseuses and OF models in ${area || location || county}. Step into a world of pleasure with verified profiles.`,
              })}

              {/* Premium Spas */}
              {renderSpaSection({
                tier: 'premium',
                icon: <LuLeaf size={30} />,
                items: spasByTier.premium,
                title: 'PREMIUM RELAXATION SPOTS',
                description: `Discover ${area || location || county}'s finest massage parlors and adult spas with professional services.`,
              })}

              {/* Premium Escorts */}
              {renderProfileSection({
                tier: 'premium',
                icon: <CgGirl size={30} />,
                items: profilesByTier.premium,
                title: 'FEATURED INDEPENDENT MODELS',
                description: `Meet ${area || location || county}'s most sought-after independent escorts with premium companionship services.`,
              })}


              {/* Basic Spas */}
              {renderSpaSection({
                tier: 'basic',
                icon: <LuSpade size={30} />,
                items: spasByTier.basic,
                title: 'QUALITY SPAS & MASSAGE CENTERS',
                description: `Reliable and affordable spa services in ${area || location || county} with verified credentials.`,
              })}

              {/* Basic Escorts */}
              {renderProfileSection({
                tier: 'basic',
                icon: <GiSelfLove size={30} />,
                items: profilesByTier.basic,
                title: 'LOCAL INDEPENDENT SERVICE PROVIDERS',
                description: `Browse through ${area || location || county}'s diverse selection of independent escorts and models.`,
              })}
            </>
          )
        )}

        {/* SEO Content Section */}
        {showContent && (
          <div className="border-t border-border">
            <div className="container mx-auto px-4 pt-10 max-w-7xl max-md:px-2">
              <div className="bg-white rounded-2xl py-8 max-md:py-0">
                <div className="prose prose-lg max-w-none text-gray-700">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 max-md:text-lg">
                    Find the Best Escorts, Call Girls & Adult Services in{' '}
                    <span className="capitalize">
                      {location || county}
                    </span>
                  </h2>

                  <p className="text-xl leading-relaxed mb-6 max-md:text-sm">
                    Welcome to Alchemyst's exclusive directory of premium adult
                    entertainment in{' '}
                    <strong className="capitalize">
                      {location || county}
                    </strong>
                    . Whether you're looking for <strong>sexy escorts</strong>,{' '}
                    <strong>professional masseuses</strong>,{' '}
                    <strong>exclusive OF-models</strong>, or{' '}
                    <strong>luxurious spas</strong>, we've curated the finest
                    selection of verified service providers.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 max-md:text-lg max-md:mt-4">
                    Premium Adult Entertainment in{' '}
                    <span className="capitalize">
                      {location || county}
                    </span>
                  </h3>

                  <p className="leading-relaxed mb-6">
                    <span className="capitalize">
                      {location ? `${location}, ${county}` : county}
                    </span>{' '}
                    is known for its vibrant nightlife and adult entertainment
                    scene. Our platform connects you with{' '}
                    <strong>verified independent models</strong>,{' '}
                    <strong>professional escorts</strong>, and{' '}
                    <strong>reputable spas</strong>.
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 my-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 max-md:p-4">
                      <h4 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2 max-md:text-lg">
                        <GiCurlyMask />
                        What to Expect in{' '}
                        <span className="capitalize">
                          {location || county}
                        </span>
                      </h4>
                      <ul className="space-y-3 text-blue-800">
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Verified Profiles</strong> - All models and
                            spas are thoroughly verified
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Direct Contact</strong> - No middlemen,
                            communicate directly
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Complete Discretion</strong> - Your privacy
                            is our priority
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Competitive Rates</strong> - Fair pricing
                            with no hidden costs
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 max-md:p-4">
                      <h4 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2 max-md:text-lg">
                        <GiDualityMask />
                        Popular Services
                      </h4>
                      <ul className="space-y-3 text-purple-800">
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Escort Services</strong> - Premium companionship
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Therapeutic Massage</strong> - Professional
                            bodywork
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>Spa Experiences</strong> - Luxury adult
                            entertainment
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>
                            <strong>OF-Model Content</strong> - Exclusive digital
                            experiences
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                    How to Connect with{' '}
                    <span className="capitalize">{location || county}</span> Service
                    Providers
                  </h3>

                  <p className="leading-relaxed mb-6">
                    Getting in touch with our verified escorts, masseuses, and
                    spas is simple and straightforward. Browse through our
                    carefully curated profiles, check availability, and contact
                    directly via phone or WhatsApp.
                  </p>

                  <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-white my-8 max-md:p-4">
                    <h4 className="text-2xl font-bold mb-4 text-center">
                      Join {location || county}'s Premier Adult Entertainment
                      Community
                    </h4>
                    <p className="text-lg text-center mb-6 opacity-90 max-md:text-sm">
                      Whether you're a service provider or seeking premium adult
                      entertainment, Alchemyst offers the perfect platform for
                      discreet, professional connections.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push('/sign-up')}
                        className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg cursor-pointer"
                      >
                        Find Services
                      </button>
                      <button
                        onClick={() => router.push('/sign-up?type=provider')}
                        className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition-all cursor-pointer"
                      >
                        List Your Services
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gray-100 rounded-lg border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <LuSearchCheck />
                      Popular Searches in{' '}
                      <span className="capitalize">{location || county}</span>:
                    </h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-white px-3 py-1 rounded-full border">
                        escorts {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        call girls {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        massage services {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        spas {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        of-models {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        adult entertainment {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        independent models {location || county}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        hookup {location || county}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
