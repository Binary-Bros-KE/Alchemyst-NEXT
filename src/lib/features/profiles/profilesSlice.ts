import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Profile {
  _id: string;
  id?: string;
  username: string;
  name?: string;
  age: number;
  userType: 'escort' | 'masseuse' | 'of-model' | 'spa';
  gender: string;
  serviceType: string;
  phone?: string;
  location?: {
    county?: string;
    location?: string;
    area?: string;
  };
  county?: string;
  bodyType?: string;
  breastSize?: string;
  image?: string;
  profileImage?: { url: string };
  bio?: string;
  rating?: number;
  verified?: boolean;
  verification?: { profileVerified: boolean };
  services?: Array<{ name: string }>;
  rates?: Record<string, number>;
  isActive?: boolean;
  servesWho?: string;
  sexualOrientation?: string;
  ethnicity?: string;
  contact?: { phoneNumber: string; hasWhatsApp?: boolean };
  currentPackage?: { packageType: string; status: string };
}

interface ProfilesState {
  allProfiles: Profile[];
  filteredProfiles: Profile[];
  filteredSpas: Profile[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  totalCount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Async thunk to fetch ALL profiles
export const fetchAllProfiles = createAsyncThunk(
  'profiles/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/all`);

      return {
        profiles: response.data.profiles || response.data || [],
        timestamp: Date.now(),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profiles');
      }
      return rejectWithValue('Failed to fetch profiles');
    }
  }
);

const initialState: ProfilesState = {
  allProfiles: [],
  filteredProfiles: [],
  filteredSpas: [],
  loading: false,
  error: null,
  lastFetchTime: null,
  totalCount: 0,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    // Apply filters to allProfiles (INSTANT - no API call)
    applyFilters: (state, action) => {
      const filters = action.payload;
      let filtered = state.allProfiles;

      // Apply userType filter FIRST
      if (filters.userType && filters.userType !== 'all') {
        filtered = filtered.filter((profile) => profile.userType === filters.userType);
      }

      // Now apply profile-specific filters
      filtered = filtered.filter((profile) => {
        const isSpa = profile.userType === 'spa';

        // Gender filter - skip for spas
        if (filters.gender && filters.gender !== 'all') {
          if (profile.gender?.toLowerCase() !== filters.gender.toLowerCase()) return false;
        }

        // Body Type filter - skip for spas
        if (filters.bodyType && filters.bodyType !== 'all') {
          if (profile.bodyType?.toLowerCase() !== filters.bodyType.toLowerCase()) return false;
        }

        // Breast Size filter - skip for spas
        if (filters.breastSize && filters.breastSize !== 'all') {
          if (profile.breastSize?.toLowerCase() !== filters.breastSize.toLowerCase()) return false;
        }

        // Serves Who filter - skip for spas
        if (filters.servesWho && filters.servesWho !== 'all') {
          if (profile.servesWho?.toLowerCase() !== filters.servesWho.toLowerCase()) return false;
        }

        // Sexual Orientation filter - skip for spas
        if (filters.sexualOrientation && filters.sexualOrientation !== 'all') {
          if (profile.sexualOrientation?.toLowerCase() !== filters.sexualOrientation.toLowerCase())
            return false;
        }

        // Ethnicity filter - skip for spas
        if (filters.ethnicity && filters.ethnicity !== 'all') {
          if (profile.ethnicity?.toLowerCase() !== filters.ethnicity.toLowerCase()) return false;
        }

        // Age range filter - skip for spas
        if (!isSpa && filters.ageRange) {
          const minAge = Math.max(18, filters.ageRange.min || 18);
          const maxAge = filters.ageRange.max || 99;
          const age = profile.age;

          if (!age || age < 18) return false;
          if (age < minAge || age > maxAge) return false;
        }

        // Service Type filter - applies to ALL including spas
        if (filters.serviceType && filters.serviceType !== 'all') {
          if (profile.serviceType?.toLowerCase() !== filters.serviceType.toLowerCase()) return false;
        }

        // Specific service filter - applies to ALL including spas
        if (filters.specificService && filters.specificService !== 'all') {
          const hasService = profile.services?.some((service) =>
            service.name?.toLowerCase().includes(filters.specificService.toLowerCase())
          );
          if (!hasService) return false;
        }

        // County filter - applies to ALL
        if (filters.county) {
          const profileCounty =
            profile.location?.county?.toLowerCase() || profile.county?.toLowerCase();
          if (profileCounty !== filters.county.toLowerCase()) return false;
        }

        return true;
      });

      // Separate into profiles and spas
      const newProfiles = filtered.filter((p) => p.userType !== 'spa');
      const newSpas = filtered.filter((p) => p.userType === 'spa');

      state.filteredProfiles = newProfiles;
      state.filteredSpas = newSpas;
      state.totalCount = filtered.length;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        const { profiles, timestamp } = action.payload;

        state.loading = false;
        state.allProfiles = profiles;
        state.filteredProfiles = profiles.filter((p: Profile) => p.userType !== 'spa');
        state.filteredSpas = profiles.filter((p: Profile) => p.userType === 'spa');
        state.lastFetchTime = timestamp;
        state.totalCount = profiles.length;
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch profiles';
      });
  },
});

export const { applyFilters, clearError } = profilesSlice.actions;

export default profilesSlice.reducer;
