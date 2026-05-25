import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Filters {
  userType?: 'escort' | 'masseuse' | 'of-model' | 'spa' | 'all';
  gender?: 'all' | string;
  bodyType?: 'all' | string;
  breastSize?: 'all' | string;
  servesWho?: 'all' | string;
  sexualOrientation?: 'all' | string;
  ethnicity?: 'all' | string;
  ageRange?: { min: number; max: number | null };
  serviceType?: 'all' | string;
  specificService?: 'all' | string;
  county?: string;
  location?: string | null;
  area?: string | null;
}

interface UIState {
  selectedCounty: string;
  filters: Filters;
  searchQuery: string;
  mobileMenuOpen: boolean;
  adultConsentGiven: boolean;
}

const initialState: UIState = {
  selectedCounty: 'all',
  filters: {
    userType: 'all',
    gender: 'all',
    bodyType: 'all',
    breastSize: 'all',
    location: null,
    area: null,
  },
  searchQuery: '',
  mobileMenuOpen: false,
  adultConsentGiven: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedCounty: (state, action: PayloadAction<string>) => {
      state.selectedCounty = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        userType: 'all',
        gender: 'all',
        bodyType: 'all',
        breastSize: 'all',
        location: null,
        area: null,
      };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setAdultConsentGiven: (state, action: PayloadAction<boolean>) => {
      state.adultConsentGiven = action.payload;
    },
  },
});

export const {
  setSelectedCounty,
  setFilters,
  clearFilters,
  setSearchQuery,
  setMobileMenuOpen,
  toggleMobileMenu,
  setAdultConsentGiven,
} = uiSlice.actions;

export default uiSlice.reducer;
