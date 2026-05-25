'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiMapPin, FiRefreshCw, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllProfiles, applyFilters, type Profile } from '@/lib/features/profiles/profilesSlice';
import { setFilters, setSelectedCounty } from '@/lib/features/ui/uiSlice';
import type { RootState } from '@/lib/store';

import ProfileCard from '@/components/ProfileCard';
import FilterBar from '@/components/FilterBar';
import locationsData from '@/data/counties.json';

export default function MasseusesClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const { allProfiles, filteredProfiles, loading, error, lastFetchTime, totalCount } = useAppSelector(
    (state: RootState) => state.profiles
  );
  const { filters, selectedCounty } = useAppSelector((state: RootState) => state.ui);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{
    type: string;
    value: string;
    county?: string;
    service?: string;
    bodyType?: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Shuffle array utility
  const shuffleArray = useCallback((array: Profile[]): Profile[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Check for active filters
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.userType && filters.userType !== 'all') ||
      (filters.gender && filters.gender !== 'all') ||
      (filters.bodyType && filters.bodyType !== 'all') ||
      (filters.breastSize && filters.breastSize !== 'all') ||
      (filters.serviceType && filters.serviceType !== 'all') ||
      (filters.sexualOrientation && filters.sexualOrientation !== 'all') ||
      (filters.ethnicity && filters.ethnicity !== 'all') ||
      (filters.servesWho && filters.servesWho !== 'all') ||
      (filters.specificService && filters.specificService !== 'all') ||
      (filters.ageRange?.max !== null)
    );
  }, [filters]);

  // Display profiles - shuffled if no filters active
  const displayProfiles = useMemo(() => {
    if (hasActiveFilters) {
      return filteredProfiles;
    } else {
      return shuffleArray(filteredProfiles);
    }
  }, [filteredProfiles, hasActiveFilters, shuffleArray]);

  // Set userType to masseuse on mount and fetch profiles - runs once
  useEffect(() => {
    // Only set filters and fetch on initial mount
    const userType = searchParams.get('userType') || 'masseuse';
    dispatch(
      setFilters({
        userType: userType as any,
        gender: 'all',
        bodyType: 'all',
        breastSize: 'all',
        serviceType: 'all',
        sexualOrientation: 'all',
        ethnicity: 'all',
        servesWho: 'all',
        specificService: 'all',
        ageRange: { min: 18, max: null },
      })
    );

    // Fetch profiles on mount
    dispatch(fetchAllProfiles());
  }, []); // Empty dependency array - run once on mount

  // Apply filters whenever filters/county/data change
  useEffect(() => {
    if (allProfiles.length > 0) {
      dispatch(
        applyFilters({
          ...filters,
          county: selectedCounty !== 'all' ? selectedCounty : null,
        })
      );
    }
  }, [dispatch, filters, selectedCounty, allProfiles]);

  // Enhanced search suggestions with better matching
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const normalizedQuery = value.toLowerCase().trim();
    const matches: Array<{
      type: string;
      value: string;
      county?: string;
      service?: string;
      bodyType?: string;
    }> = [];

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
      if ((county as any).popular_areas) {
        (county as any).popular_areas.forEach((area: string) => {
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

    // Search services
    const servicesList = [
      'Massage',
      'Dinner Dates',
      'Travel Companion',
      'GFE',
      'PSE',
      'Couples',
      'Sleepovers',
      'Threesomes',
      'Role Play',
      'Lesbian Shows',
      'Anal',
      'BDSM',
      'BJ',
      'Raw BJ',
      'Rimming',
      'Raw Sex',
      'Golden Shower',
      'Sex Toys',
    ];

    const serviceMatches = servicesList.filter((service) =>
      service.toLowerCase().includes(normalizedQuery)
    );

    serviceMatches.forEach((service) => {
      matches.push({
        type: 'service',
        value: service,
        service: service,
      });
    });

    // Search body types
    const bodyTypesList = ['Petite', 'Average', 'Curvy', 'Thick', 'BBW', 'Muscular'];
    const bodyTypeMatches = bodyTypesList.filter((type) => type.toLowerCase().includes(normalizedQuery));

    bodyTypeMatches.forEach((type) => {
      matches.push({
        type: 'bodyType',
        value: type,
        bodyType: type,
      });
    });

    setSuggestions(matches.slice(0, 8));
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: (typeof suggestions)[0]) => {
    setSearchQuery('');
    setShowSuggestions(false);

    if (suggestion.type === 'county') {
      dispatch(setSelectedCounty(suggestion.county!));
    } else if (suggestion.type === 'location') {
      dispatch(setSelectedCounty(suggestion.county!));
    } else if (suggestion.type === 'area') {
      dispatch(setSelectedCounty(suggestion.county!));
    } else if (suggestion.type === 'service') {
      dispatch(
        setFilters({
          ...filters,
          specificService: suggestion.service!,
        })
      );
    } else if (suggestion.type === 'bodyType') {
      dispatch(
        setFilters({
          ...filters,
          bodyType: suggestion.bodyType!,
        })
      );
    }
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
        dispatch(setSelectedCounty(countyMatch.name));
      }
    }

    setSearchQuery('');
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const formatLastUpdate = () => {
    if (!lastFetchTime) return 'Never';
    const minutes = Math.floor((Date.now() - lastFetchTime) / 60000);
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    return 'Over an hour ago';
  };

  const refreshProfiles = () => {
    dispatch(fetchAllProfiles());
  };

  const updateCounty = (county: string) => {
    dispatch(setSelectedCounty(county));
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760970216/alchemyst-escorts-banner_tvwm7r.png')] max-md:bg-[url('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969895/alchemyst-escorts_wiitx6.jpg')] bg-cover bg-center py-10 px-4 max-md:py-10">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-text-inverse mb-4 max-md:flex max-md:flex-col">
              Alchemyst
              <span className="bg-[url('/graphic/scratch.png')] bg-cover bg-center bg-no-repeat py-2 px-2">
                {' '}
                masseuses{' '}
              </span>
            </h1>
          </motion.div>

          <div className="bg-card rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="flex max-md:flex-col gap-2">
                  <select
                    value={selectedCounty}
                    onChange={(e) => updateCounty(e.target.value)}
                    className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-md:flex-1"
                  >
                    <option value="all">All Counties</option>
                    {(locationsData as any[]).map((county) => (
                      <option key={county.name} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 relative">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search masseuses by location, services, body type..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Search Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 flex items-center gap-3"
                          >
                            {suggestion.type === 'county' && <FiMapPin className="text-blue-500" />}
                            {suggestion.type === 'location' && <FiMapPin className="text-green-500" />}
                            {suggestion.type === 'area' && <FiMapPin className="text-purple-500" />}
                            {suggestion.type === 'service' && <FiSearch className="text-orange-500" />}
                            {suggestion.type === 'bodyType' && <FiSearch className="text-pink-500" />}
                            <div>
                              <div className="font-medium text-foreground">{suggestion.value}</div>
                              <div className="text-sm text-muted-foreground capitalize">{suggestion.type}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={refreshProfiles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Filters Section - Collapsible on Mobile */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-all w-full justify-center"
          >
            <FiFilter />
            Filters
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <div className={`md:block ${showFilters ? 'block' : 'hidden'}`}>
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Available Masseuses
              {selectedCounty !== 'all' && (
                <span className="text-lg text-muted-foreground font-normal ml-2">
                  in {selectedCounty}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{displayProfiles.length} masseuses found</span>
              {lastFetchTime && (
                <>
                  <span>•</span>
                  <span>Last updated {formatLastUpdate()}</span>
                  {Date.now() - lastFetchTime > 5 * 60 * 1000 && (
                    <button
                      onClick={refreshProfiles}
                      className="flex items-center gap-1 text-primary hover:text-primary/80"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : displayProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {allProfiles.length === 0
                ? 'No masseuses available. Check back later!'
                : 'No masseuses found. Try adjusting your filters.'}
            </p>
            {allProfiles.length > 0 && displayProfiles.length === 0 && (
              <button
                onClick={() => {
                  dispatch(
                    setFilters({
                      userType: 'masseuse',
                      gender: 'all',
                      bodyType: 'all',
                      breastSize: 'all',
                      serviceType: 'all',
                      sexualOrientation: 'all',
                      ethnicity: 'all',
                      servesWho: 'all',
                      specificService: 'all',
                      ageRange: { min: 18, max: null },
                    })
                  );
                }}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-md:gap-2">
            {displayProfiles.map((profile: Profile) => (
              <ProfileCard key={profile._id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
