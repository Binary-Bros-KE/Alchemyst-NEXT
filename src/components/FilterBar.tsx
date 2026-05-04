'use client';

import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

// Common service types for the filter
const COMMON_SERVICES = [
  'Massage',
  'Dinner Dates',
  'Travel Companion',
  'GFE (Girlfriend Experience)',
  'PSE (Pornstar Experience)',
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

// Options that match your model
const GENDER_OPTIONS = ['Female', 'Male', 'Trans', 'Non-binary', 'Other'];
const BODY_TYPE_OPTIONS = ['Petite', 'Average', 'Curvy', 'Thick', 'BBW', 'Muscular'];
const BREAST_SIZE_OPTIONS = [
  'Small Breasts',
  'Medium Breast',
  'Big Natural',
  'Extra Large',
  'No Breasts',
];
const SERVES_WHO_OPTIONS = ['Men', 'Women', 'Both Men and Women', 'Queer Only'];
const ETHNICITY_OPTIONS = ['Black', 'White', 'Mixed', 'Somali', 'Arabic', 'Hindi', 'Other'];
const ORIENTATION_OPTIONS = [
  'Straight',
  'Gay',
  'Bisexual',
  'Heterosexual',
  'Pansexual',
  'Asexual',
  'Queer',
  'Other',
];

interface Filters {
  userType?: string;
  gender?: string;
  bodyType?: string;
  breastSize?: string;
  serviceType?: string;
  sexualOrientation?: string;
  ethnicity?: string;
  servesWho?: string;
  specificService?: string;
  ageRange?: { min: number; max: number | null };
}

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters, apply?: boolean) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyButton, setShowApplyButton] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    // Mark that filters have been changed but don't apply immediately
    setShowApplyButton(true);

    // Create new filters object to prevent mutations
    const newFilters = { ...filters, [key]: value };

    // Update the filters in state but don't trigger the actual filtering yet
    onFilterChange(newFilters, false);
  };

  const handleApplyFilters = () => {
    // Apply the filters and scroll to results
    onFilterChange(filters, true);
    setShowApplyButton(false);

    // Scroll to results section
    setTimeout(() => {
      const resultsSection = document.getElementById('profiles-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAgeChange = (type: 'min' | 'max', value: string) => {
    const newAgeRange = { ...(filters.ageRange || { min: 18, max: null }) };

    if (type === 'min') {
      // Ensure minimum age is at least 18
      const minValue = Math.max(18, parseInt(value) || 18);
      newAgeRange.min = minValue;

      // Only adjust max if it exists AND is less than the new min
      if (newAgeRange.max !== null && newAgeRange.max < minValue) {
        newAgeRange.max = minValue;
      }
    } else {
      // For max age
      const maxValue = value === '' ? null : parseInt(value);

      if (maxValue === null) {
        newAgeRange.max = null;
      } else {
        // Ensure max is at least 18 and at least equal to min
        newAgeRange.max = Math.max(newAgeRange.min || 18, maxValue);
      }
    }

    setShowApplyButton(true);
    onFilterChange({ ...filters, ageRange: newAgeRange }, false);
  };

  const clearFilters = () => {
    onFilterChange(
      {
        userType: 'all',
        gender: 'all',
        bodyType: 'all',
        breastSize: 'all',
        serviceType: 'all',
        sexualOrientation: 'all',
        ethnicity: 'all',
        servesWho: 'all',
        ageRange: { min: 18, max: null },
      },
      true
    );
    setShowApplyButton(false);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'ageRange') {
        const ageRange = value as { min: number; max: number | null };
        return ageRange.min > 18 || ageRange.max !== null;
      }
      return value !== 'all' && value !== null && value !== undefined;
    }).length;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <FiFilter />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white rounded-full text-xs">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        {showApplyButton && (
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all cursor-pointer"
          >
            Apply Filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 p-6 bg-card border border-border rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Age Range */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-foreground mb-3">Age Range</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Min</label>
                <input
                  type="number"
                  min="18"
                  max={filters.ageRange?.max || 99}
                  value={filters.ageRange?.min || 18}
                  onChange={(e) => handleAgeChange('min', e.target.value)}
                  onBlur={(e) => {
                    // Force minimum of 18 on blur
                    if (parseInt(e.target.value) < 18) {
                      handleAgeChange('min', '18');
                    }
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="pt-5 text-muted-foreground">-</div>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Max</label>
                <input
                  type="number"
                  min={filters.ageRange?.min || 18}
                  max="99"
                  value={filters.ageRange?.max || ''}
                  onChange={(e) => handleAgeChange('max', e.target.value)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Service Type</label>
            <select
              value={filters.serviceType || 'all'}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Service Types</option>
              <option value="incall">Incalls Only</option>
              <option value="outcall">Outcalls Only</option>
              <option value="both">Both Incalls & Outcalls</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
            <select
              value={filters.gender || 'all'}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Genders</option>
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender} value={gender.toLowerCase()}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Body Type</label>
            <select
              value={filters.bodyType || 'all'}
              onChange={(e) => handleFilterChange('bodyType', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Body Types</option>
              {BODY_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Breast Size */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Breast Size</label>
            <select
              value={filters.breastSize || 'all'}
              onChange={(e) => handleFilterChange('breastSize', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Breast Sizes</option>
              {BREAST_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size.toLowerCase()}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Serves Who */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Serves</label>
            <select
              value={filters.servesWho || 'all'}
              onChange={(e) => handleFilterChange('servesWho', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Clients</option>
              {SERVES_WHO_OPTIONS.map((serve) => (
                <option key={serve} value={serve.toLowerCase()}>
                  {serve}
                </option>
              ))}
            </select>
          </div>

          {/* Sexual Orientation */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sexual Orientation
            </label>
            <select
              value={filters.sexualOrientation || 'all'}
              onChange={(e) => handleFilterChange('sexualOrientation', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Orientations</option>
              {ORIENTATION_OPTIONS.map((orientation) => (
                <option key={orientation} value={orientation.toLowerCase()}>
                  {orientation}
                </option>
              ))}
            </select>
          </div>

          {/* Ethnicity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ethnicity</label>
            <select
              value={filters.ethnicity || 'all'}
              onChange={(e) => handleFilterChange('ethnicity', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Ethnicities</option>
              {ETHNICITY_OPTIONS.map((ethnicity) => (
                <option key={ethnicity} value={ethnicity.toLowerCase()}>
                  {ethnicity}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Services */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Specific Services
            </label>
            <select
              value={filters.specificService || 'all'}
              onChange={(e) => handleFilterChange('specificService', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Services</option>
              {COMMON_SERVICES.map((service) => (
                <option key={service} value={service.toLowerCase()}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="md:col-span-2 lg:col-span-4 flex justify-between items-center pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {getActiveFilterCount() > 0 && `${getActiveFilterCount()} active filters`}
            </div>
            <div className="flex gap-3">
              {showApplyButton && (
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              )}
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
