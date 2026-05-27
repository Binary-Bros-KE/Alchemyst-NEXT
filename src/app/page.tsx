'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiMapPin, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { GiCurlyMask, GiDualityMask } from 'react-icons/gi';
import { LuSearchCheck } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, FreeMode } from 'swiper/modules';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllProfiles, type Profile } from '@/lib/features/profiles/profilesSlice';
import { setFilters, setSelectedCounty, clearFilters } from '@/lib/features/ui/uiSlice';
import type { Filters } from '@/lib/features/ui/uiSlice';
import type { RootState } from '@/lib/store';
import ProfileCard from '@/components/ProfileCard';
import SpaCard from '@/components/SpaCard';
import CategoryButtons from '@/components/CategoryButtons';
import PopularAreas from '@/components/PopularAreas';
import FilterBar from '@/components/FilterBar';
import locationsData from '@/data/counties.json';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

type CountyData = {
  code?: string | number;
  name: string;
  sub_counties: string[];
  popular_areas?: string[];
};

type SearchSuggestion = {
  type: 'county' | 'location' | 'area';
  value: string;
  county: string;
};

const counties = locationsData as CountyData[];

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { filteredProfiles: profiles, filteredSpas: spas, loading, error } = useAppSelector(
    (state: RootState) => state.profiles
  );
  const { filters, selectedCounty } = useAppSelector((state: RootState) => state.ui);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const locationNavigationPending = isNavigating || isPending;

  // Fetch profiles on component mount - only once
  useEffect(() => {
    dispatch(fetchAllProfiles());
  }, [dispatch]);

  const updateCounty = (county: string) => {
    dispatch(setSelectedCounty(county));
  };

  const updateFilters = (newFilters: unknown) => {
    dispatch(setFilters(newFilters as Partial<Filters>));
  };

  const navigateTo = (path: string) => {
    setIsNavigating(true);
    setShowSuggestions(false);
    startTransition(() => {
      router.push(path);
    });
  };

  const locationSlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

  // Enhanced search suggestions with better matching
  const handleSearchChange = (value: string) => {
    if (locationNavigationPending) return;

    setSearchQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedQuery = value.toLowerCase().trim();
    const matches: SearchSuggestion[] = [];

    if (selectedCounty === 'all') {
      // Search counties when "All Counties" is selected
      counties.forEach((county) => {
        const countyName = county.name.toLowerCase();
        const subCounties = county.sub_counties.map((sc: string) => sc.toLowerCase());

        // Exact match for county name
        if (countyName === normalizedQuery) {
          matches.push({
            type: 'county',
            value: county.name,
            county: county.name,
          });
        }

        // Partial match for county name
        if (countyName.includes(normalizedQuery) && !matches.some((m) => m.value === county.name)) {
          matches.push({
            type: 'county',
            value: county.name,
            county: county.name,
          });
        }

        // Search in sub-counties (locations) with county context
        subCounties.forEach((subCounty: string, index: number) => {
          if (subCounty.includes(normalizedQuery)) {
            matches.push({
              type: 'location',
              value: county.sub_counties[index],
              county: county.name,
            });
          }
        });
      });
    } else {
      // Search within selected county
      const county = counties.find((c) => c.name === selectedCounty);
      if (!county) return;

      // Search locations (sub_counties)
      county.sub_counties.forEach((location: string) => {
        const normalizedLocation = location.toLowerCase();

        // Exact match
        if (normalizedLocation === normalizedQuery) {
          matches.push({
            type: 'location',
            value: location,
            county: county.name,
          });
        }

        // Partial match
        if (normalizedLocation.includes(normalizedQuery)) {
          matches.push({
            type: 'location',
            value: location,
            county: county.name,
          });
        }

        // Word boundary matching for better results
        const words = normalizedLocation.split(' ');
        if (words.some((word) => word.startsWith(normalizedQuery))) {
          if (!matches.some((m) => m.value === location)) {
            matches.push({
              type: 'location',
              value: location,
              county: county.name,
            });
          }
        }
      });

      // Search popular areas if they exist
      if (county.popular_areas) {
        county.popular_areas.forEach((area: string) => {
          const normalizedArea = area.toLowerCase();
          if (normalizedArea.includes(normalizedQuery)) {
            matches.push({
              type: 'area',
              value: area,
              county: county.name,
            });
          }
        });
      }
    }

    // Remove duplicates and limit results
    const uniqueMatches = matches
      .filter(
        (match, index, self) =>
          index ===
          self.findIndex(
            (m) => m.type === match.type && m.value === match.value && m.county === match.county
          )
      )
      .slice(0, 8);

    setSuggestions(uniqueMatches);
    setShowSuggestions(uniqueMatches.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (locationNavigationPending) return;

    let path = '';

    if (suggestion.type === 'county') {
      path = `/${locationSlug(suggestion.value)}`;
    } else if (suggestion.type === 'location') {
      path = `/${locationSlug(suggestion.county)}/${locationSlug(suggestion.value)}`;
    } else if (suggestion.type === 'area') {
      path = `/${locationSlug(suggestion.county)}/${locationSlug(suggestion.value)}`;
    }

    if (path) {
      setSearchQuery(suggestion.value);
      navigateTo(path);
    }

    setShowSuggestions(false);
  };

  const handleSearchSubmit = () => {
    if (locationNavigationPending || !searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
      return;
    }

    if (selectedCounty === 'all') {
      const countyMatch = counties.find((county) =>
        county.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (countyMatch) {
        navigateTo(`/${locationSlug(countyMatch.name)}`);
      }
    } else {
      const county = counties.find((c) => c.name === selectedCounty);
      if (county) {
        const locationMatch = county.sub_counties.find((loc: string) =>
          loc.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (locationMatch) {
          navigateTo(`/${locationSlug(selectedCounty)}/${locationSlug(locationMatch)}`);
        } else {
          navigateTo(`/${locationSlug(selectedCounty)}?search=${encodeURIComponent(searchQuery)}`);
        }
      }
    }
  };

  const handleFilterChange = (newFilters: unknown) => {
    updateFilters(newFilters);
  };

  const refreshProfiles = () => {
    dispatch(fetchAllProfiles());
  };

  const hasSpaFilters = () => {
    return (
      (filters.serviceType && filters.serviceType !== 'all') ||
      (filters.specificService && filters.specificService !== 'all')
    );
  };

  const getProfilesTitle = () => {
    const categoryTitles: Record<string, string> = {
      escort: 'Escorts',
      masseuse: 'Masseuses',
      'of-model': 'OF Models',
      spa: 'Spas',
      all: 'Profiles',
    };

    const category = filters.userType || 'all';
    const title = categoryTitles[category] || 'Profiles';

    return `Available ${title} ${selectedCounty !== 'all' ? `in ${selectedCounty}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760970216/alchemyst-escorts-banner_tvwm7r.png')] max-md:bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969895/alchemyst-escorts_wiitx6.jpg')] bg-cover bg-center py-16 px-4 max-md:py-10">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto max-w-6xl">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-text-inverse mb-4 max-md:flex max-md:flex-col">
              Home of
              <span className="bg-[url('/graphic/scratch.png')] bg-cover bg-center bg-no-repeat py-2 px-2">
                {' '}
                independent{' '}
              </span>
              escorts
            </h1>
            <p className="text-sm text-text-inverse/70">
              Kenya’s largest directory of verified escorts, hot and sexy call girls, kenyan prostitutes, luxury spas and massage services. Whether you're looking for casual hook-ups, sensual massage with happy ending, of-models, or discreet video calls – we connect you directly with independent providers.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="flex max-md:flex-col gap-2">
                  <select
                    value={selectedCounty}
                    disabled={locationNavigationPending}
                    onChange={(e) => {
                      updateCounty(e.target.value);
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="max-md:w-full max-md:mb-2 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="all">All Counties</option>
                    {counties.map((county) => (
                      <option key={county.code} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      disabled={locationNavigationPending}
                      placeholder={
                        locationNavigationPending
                          ? 'Opening location...'
                          : selectedCounty === 'all'
                            ? 'Search counties, locations...'
                            : 'Search locations, areas...'
                      }
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => {
                        if (!locationNavigationPending) setShowSuggestions(suggestions.length > 0);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={locationNavigationPending}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FiMapPin className="text-primary" />
                            <div className="flex-1">
                              <span className="text-foreground block">{suggestion.value}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {suggestion.type} • {suggestion.county}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchSubmit}
                disabled={locationNavigationPending}
                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationNavigationPending ? <FiLoader className="animate-spin" /> : <FiSearch />}
                {locationNavigationPending ? 'Opening...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-7xl mb-10">
        {/* Refresh Button*/}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={refreshProfiles}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Refresh profiles data"
            >
              <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>

            {loading && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading profiles...
              </span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={refreshProfiles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        <CategoryButtons
          onCategorySelect={(category) =>
            handleFilterChange({ ...filters, userType: category })
          }
          selectedCategory={filters.userType}
          disabled={locationNavigationPending}
          onNavigate={navigateTo}
        />

        {selectedCounty && (
          <PopularAreas
            county={selectedCounty}
            disabled={locationNavigationPending}
            onNavigate={navigateTo}
          />
        )}

        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        <div id="profiles-results"></div>

        {/* Spas Section */}
        {spas.length > 0 && (filters.userType === 'all' || filters.userType === 'spa') && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Spas & Parlors
                {filters.userType === 'spa' && (
                  <span className="text-lg text-muted-foreground font-normal ml-2">
                    ({spas.length} {spas.length === 1 ? 'spa' : 'spas'})
                  </span>
                )}
              </h2>
              {filters.userType === 'all' && spas.length > 3 && (
                <button
                  onClick={() => {
                    updateFilters({ ...filters, userType: 'spa' });
                    setTimeout(() => {
                      const resultsSection = document.getElementById('profiles-results');
                      if (resultsSection) {
                        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="text-primary hover:text-primary/80 font-medium cursor-pointer"
                >
                  See all →
                </button>
              )}
            </div>

            {/* Show grid when spa category is selected OR when filters are active */}
            {filters.userType === 'spa' || hasSpaFilters() ? (
              // Grid view when spa category selected or filters active
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {spas.map((spa: Profile) => (
                  <SpaCard key={spa._id} profile={spa} />
                ))}
              </div>
            ) : (
              // Carousel view only when "All" is selected and no filters
              <Swiper
                modules={[Navigation, Autoplay, FreeMode]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={spas.length > 3}
                freeMode={true}
                grabCursor={true}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="spas-carousel"
              >
                {spas.slice(0, 10).map((spa: Profile) => (
                  <SwiperSlide key={spa._id}>
                    <SpaCard profile={spa} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        )}

        {/* Profiles Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">{getProfilesTitle()}</h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No profiles found. Try adjusting your filters.
              </p>
              <button
                onClick={() => dispatch(clearFilters())}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-md:gap-2">
              {profiles.map((profile: Profile) => (
                <ProfileCard key={profile._id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded SEO Content Section - Paste below your existing motion.section content */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white py-12 px-4 border-t border-b border-gray-200"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="prose prose-lg max-w-none text-gray-700">

            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Kenyan Escorts | Prostitutes & Erotic Services | Sexy and hot Call Girls | Nairobi Sex Girls | Massage Services | Alchemyst
            </h1>

            <p className="text-xl leading-relaxed mb-6">
              Welcome to <strong>Alchemyst.co.ke</strong> – Kenya’s premier destination for <strong>Nairobi escorts</strong>,
              <strong>Kenyan prostitutes</strong>, <strong>hot call girls</strong>,
              <strong> erotic services</strong>, and premium adult entertainment. Whether you’re searching for
              <strong>sex for money Nairobi</strong>, discreet <strong>hookups Nairobi</strong>, or professional
              <strong> erotic massage</strong>, we connect you directly with verified independent providers across Kenya.
              No hook-up fees, real photos, and complete privacy guaranteed.
            </p>

            <p className="mb-8">
              If you’re looking for <strong>Kenya escorts</strong>, <strong>escorts in Nairobi</strong>,
         or <strong>sexy call girls</strong> who know how to deliver unforgettable experiences,
              you’re in the right place. Our platform features thousands of profiles including <strong>erotic masseuses</strong>,
              <strong>luxury spas Nairobi</strong>, <strong>Kenyan OF models</strong>, and more. From quick <strong>hook-ups near me </strong>
              to overnight <strong>girlfriend experience Nairobi</strong>, we have options for every desire.
            </p>

            {/* Section 1: Core Services */}
            <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-6">Why Choose Alchemyst for Nairobi Escorts & Erotic Services</h2>

            <p className="mb-6">
              We took time to understand what Kenyan men and visitors want. Our <strong>Nairobi escorts</strong> and
              <strong> Kenyan sexy call girls and prostitutes</strong> are carefully selected for beauty, professionalism, and skill. Whether you want
              <strong> prostitutes in Nairobi</strong> for short-time fun, <strong>sexy call girls Kenya</strong> for a night of passion,
              our providers deliver. We also specialize in
              <strong> hookups Nairobi</strong>, <strong>free hook-ups</strong>, and <strong>hook-ups near me</strong> –
              connecting you fast with local talent in Westlands, Kilimani, Thika Road, and beyond.
            </p>

            <p className="mb-8">
              Unlike other sites, we list <strong>independent escorts</strong>, <strong>verified escorts</strong>,
              <strong> mature escorts Nairobi</strong>, <strong>BBW escorts Kenya</strong>, college call girls, and curvy beauties.
              Many offer <strong>full escort services</strong>, <strong>threesome services</strong>, <strong>anal services</strong>,
              and <strong>video call sex Kenya</strong>. Some of our <strong>OnlyFans Kenya</strong> models also do real-life meetups.
            </p>

            {/* Section 2: Erotic Massage & Spas */}
            <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-6">Erotic Massage Nairobi, Sensual Massage & Luxury Spas</h2>

            <p className="mb-6">
              Looking for <strong>erotic massage Nairobi</strong>, <strong>sensual massage</strong>, <strong>nuru massage Kenya</strong>,
              or <strong>happy ending massage</strong>? Our <strong>erotic masseuse</strong> and <strong>professional masseuses Nairobi </strong>
              section is one of the strongest in Kenya. Enjoy <strong>body to body massage</strong> in top <strong>erotic spas</strong> and
              <strong> massage parlours with extras</strong> across Nairobi, Kisumu, Mombasa, and Nakuru.
            </p>

            <p className="mb-8">
              From <strong>luxury spas Nairobi</strong> offering full relaxation to discreet parlors on Mombasa Road and Thika Road,
              we have everything. Many combine <strong>erotic massage</strong> with escort services for the ultimate experience.
            </p>

            {/* Section 3: Hookups & Explicit Services */}
            <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-6">Hookups Nairobi, Sex for Money & Discreet Adult Services</h2>

            <p className="mb-6">
              Searching for <strong>hookups Nairobi</strong>, <strong>hook-ups near me</strong>, or <strong>free hook-ups</strong>?
              Alchemyst is the fastest way to find real connections. Our members regularly post for same-day <strong>sex for money Kenya</strong>,
              <strong> sex services</strong>, and casual encounters. We have <strong>cheap prostitutes Nairobi tonight</strong>,
              <strong>short time escorts</strong>, and <strong>overnight sex</strong> options.
            </p>

            <p className="mb-8">
              Explore <strong>girlfriend experience Nairobi</strong>, <strong>mature women escorts</strong>, <strong>college girls call girls</strong>,
              and more. Many providers offer <strong>discreet hotel escorts</strong> and <strong>road side escorts Thika Road</strong>.
            </p>

            {/* Section 4: Locations */}
            <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-6">Escorts & Call Girls Across Kenya – Location Guide</h2>

            <p className="mb-6">
              We cover the entire country. Find <strong>escorts in Kilimani</strong>, <strong>Westlands call girls</strong>,
              <strong>Githurai prostitutes</strong>, <strong>Thika Road prostitutes</strong>, <strong>Kisumu escorts</strong>,
              <strong>Mombasa call girls Bamburi</strong>, <strong>Nakuru prostitutes</strong>, and more.
              Popular areas include Roysambu, Ruiru, Embakasi, Kasarani, Rongai, Juja, and Parklands.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-10">
              <div>
                <h3 className="font-semibold mb-4">Nairobi Hotspots</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Escorts in Kilimani</strong>, Westlands, Lavington</li>
                  <li><strong>Githurai prostitutes</strong> and Kasarani prostitutes</li>
                  <li><strong>Thika Road escorts</strong> and Mombasa Road call girls</li>
                  <li><strong>Nairobi airport escorts</strong> and CBD options</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Other Counties</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Kisumu escorts</strong> and call girls</li>
                  <li><strong>Mombasa Bamburi call girls</strong></li>
                  <li><strong>Nakuru adult services</strong></li>
                  <li><strong>Eldoret escorts</strong>, Thika, Naivasha, and Coast Kenya prostitutes</li>
                </ul>
              </div>
            </div>

            <p className="mb-8">
              Major roads where you can easily find services: Mombasa Rd, Thika Road, Waiyaki Way, Ngong Road, Outering Road,
              Kangundo Rd, Kiambu Rd, and many more. Search <strong>escorts near me Nairobi</strong> for instant results.
            </p>

            {/* Section 5: OF Models & Unique Offerings */}
            <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-6">Kenyan OF Models, Video Call Sex & Premium Companions</h2>

            <p className="mb-6">
              Stand out with our <strong>Kenyan OF models</strong>, <strong>OnlyFans Kenya</strong> section. Some offer
              <strong> OF models Nairobi meetup</strong>, content creation, and real dates. Perfect for those seeking
              <strong> video call sex Kenya</strong> or exclusive experiences.
            </p>

            <p className="mb-8">
              We also feature <strong>premium adult services in Kenya</strong>, <strong>luxury escorts</strong>, and discreet services
              for visitors and locals alike.
            </p>

            {/* Section 6: Trust & Call to Action */}
            <div className="bg-gray-100 p-8 rounded-xl border-l-4 border-primary my-12">
              <h3 className="font-bold text-2xl mb-4">Why Kenyan Gentlemen Choose Alchemyst escorts</h3>
              <ul className="space-y-4">
                <li className="flex gap-3"><span className="text-green-600">✓</span> Verified independent profiles</li>
                <li className="flex gap-3"><span className="text-green-600">✓</span> Fresh daily listings for <strong>hookups Nairobi</strong> and <strong>adult services</strong></li>
                <li className="flex gap-3"><span className="text-green-600">✓</span> Direct contact with providers – no middlemen or hook-up fees</li>
                <li className="flex gap-3"><span className="text-green-600">✓</span> Wide variety of services – from <strong>erotic massage</strong> to <strong>girlfriend experience</strong></li>
                <li className="flex gap-3"><span className="text-green-600">✓</span> Discreet and secure platform for all your adult needs</li>
                <li className="flex gap-3"><span className="text-green-600">✓</span> Find Escorts offering services at affordable prices</li>
                <li className="flex gap-3"><span className="text-green-600">✓</span> Premium escorts and sex girls for men who appreciate beauty and sophistication</li>
              </ul>
              <p className="mt-6 font-medium">Start exploring now – find your perfect match today.</p>
            </div>

            {/* Popular Searches Pills */}
            <div className="mt-12 p-8 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-xl mb-6 flex items-center gap-2">
                Popular Searches on Alchemyst
              </h4>
              <div className="flex flex-wrap gap-3">
                {["nairobi escorts", "prostitutes nairobi", "call girls nairobi", "kenyan prostitutes", "erotic massage nairobi",
                  "hookups nairobi", "erotic services", "kisumu escorts", "westlands call girls", "onlyfans kenya",
                  "happy ending massage", "thika road escorts", "sex for money kenya", "mombasa call girls", "Nairobi Sex Girls", "premium escorts",
                  "luxury adult services", "Hot Kenyan Escorts", "adult services"].map((term, i) => (
                    <a key={i} href={`/${term.replace(/\s+/g, '-')}`}
                      className="bg-white px-5 py-2.5 rounded-full border text-sm hover:bg-primary hover:text-white transition-colors">
                      {term}
                    </a>
                  ))}
              </div>
            </div>

          </div>
        </div>
      </motion.section>
    </div>
  );
}
