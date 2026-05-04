'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { GiCurlyMask, GiDualityMask } from 'react-icons/gi';
import { LuSearchCheck } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, FreeMode } from 'swiper/modules';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllProfiles } from '@/lib/features/profiles/profilesSlice';
import { setFilters, setSelectedCounty, clearFilters } from '@/lib/features/ui/uiSlice';
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

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { filteredProfiles: profiles, filteredSpas: spas, loading, error } = useAppSelector(
    (state: RootState) => state.profiles
  );
  const { filters, selectedCounty } = useAppSelector((state: RootState) => state.ui);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch profiles on component mount - only once
  useEffect(() => {
    dispatch(fetchAllProfiles());
  }, []); // Empty dependency array - only run once

  const updateCounty = (county: string) => {
    dispatch(setSelectedCounty(county));
  };

  const updateFilters = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  // Enhanced search suggestions with better matching
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedQuery = value.toLowerCase().trim();
    const matches: any[] = [];

    if (selectedCounty === 'all') {
      // Search counties when "All Counties" is selected
      (locationsData as any[]).forEach((county) => {
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
      const county = (locationsData as any[]).find((c) => c.name === selectedCounty);
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

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'county') {
      router.push(`/${suggestion.value.toLowerCase()}`);
    } else if (suggestion.type === 'location') {
      router.push(`/${suggestion.county.toLowerCase()}/${suggestion.value.toLowerCase().replace(/\s+/g, '-')}`);
    } else if (suggestion.type === 'area') {
      router.push(`/${suggestion.county.toLowerCase()}/${suggestion.value.toLowerCase().replace(/\s+/g, '-')}`);
    }
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
      return;
    }

    if (selectedCounty === 'all') {
      const countyMatch = (locationsData as any[]).find((county) =>
        county.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (countyMatch) {
        router.push(`/${countyMatch.name.toLowerCase()}`);
      }
    } else {
      const county = (locationsData as any[]).find((c) => c.name === selectedCounty);
      if (county) {
        const locationMatch = county.sub_counties.find((loc: string) =>
          loc.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (locationMatch) {
          router.push(`/${selectedCounty.toLowerCase()}/${locationMatch.toLowerCase().replace(/\s+/g, '-')}`);
        } else {
          router.push(`/${selectedCounty.toLowerCase()}?search=${searchQuery}`);
        }
      }
    }

    setSearchQuery('');
  };

  const handleFilterChange = (newFilters: any) => {
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
            <p className="text-lg text-text-inverse/70">
              Listing thousands of independent adult entertainers. Escorts, Masseuse, Spas, OF-Models and much more.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="flex max-md:flex-col gap-2">
                  <select
                    value={selectedCounty}
                    onChange={(e) => {
                      updateCounty(e.target.value);
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="max-md:w-full max-md:mb-2 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Counties</option>
                    {(locationsData as any[]).map((county) => (
                      <option key={county.code} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={
                        selectedCounty === 'all'
                          ? 'Search counties, locations...'
                          : 'Search locations, areas...'
                      }
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowSuggestions(suggestions.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2"
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
                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSearch />
                Search
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
        />

        {selectedCounty && <PopularAreas county={selectedCounty} />}

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
                {spas.map((spa: any) => (
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
                {spas.slice(0, 10).map((spa: any) => (
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
              {profiles.map((profile: any) => (
                <ProfileCard key={profile._id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEO Content Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white py-5 px-4 border-t border-b border-gray-200"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="prose prose-lg max-w-none text-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Find the Best Escorts, Kenyan OF-Models, Masseuses & Spas on Alchemyst
            </h1>

            <p className="text-xl leading-relaxed mb-6">
              Welcome to <strong>Alchemyst</strong> - Kenya&apos;s premier platform for connecting with
              <strong> premium escorts</strong>, <strong>skilled masseuses</strong>,
              <strong> exclusive OF-models</strong>, and <strong>luxurious spas</strong>. Discover
              thousands of verified profiles offering discreet, professional services with{' '}
              <strong>no hook-up fees</strong> and complete privacy protection.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <GiCurlyMask />
                  Why Choose Alchemyst?
                </h3>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>No Hook-Up Fees</strong> - Connect directly with service providers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>Thousands of Profiles</strong> - Largest selection in Kenya
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>Discreet Services</strong> - Complete privacy guaranteed
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>Independent Models</strong> - Direct communication
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <GiDualityMask />
                  What We Offer
                </h3>
                <ul className="space-y-3 text-purple-800">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>Kenyan Escorts</strong> - Premium companionship services
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>OF-Models</strong> - Exclusive content creators
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>Masseuses</strong> - Professional therapeutic services
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      <strong>Spas & Parlors</strong> - Luxury adult entertainment
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-100 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <LuSearchCheck />
                Popular Searches:
              </h4>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-white px-3 py-1 rounded-full border">escorts nairobi</span>
                <span className="bg-white px-3 py-1 rounded-full border">kenyan of-models</span>
                <span className="bg-white px-3 py-1 rounded-full border">
                  massage services mombasa
                </span>
                <span className="bg-white px-3 py-1 rounded-full border">spas in kisumu</span>
                <span className="bg-white px-3 py-1 rounded-full border">
                  independent call girls
                </span>
                <span className="bg-white px-3 py-1 rounded-full border">
                  discreet adult services
                </span>
                <span className="bg-white px-3 py-1 rounded-full border">premium companions</span>
                <span className="bg-white px-3 py-1 rounded-full border">luxury spas kenya</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

