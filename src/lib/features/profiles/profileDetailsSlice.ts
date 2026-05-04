import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ProfileDetail {
  _id: string;
  userType: string;
  [key: string]: any;
}

interface ProfileDetailsState {
  currentProfile: ProfileDetail | null;
  similarProfiles: ProfileDetail[];
  profileCache: Record<string, ProfileDetail>;
  loading: boolean;
  loadingSimilar: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Async thunk for fetching profile details
export const fetchProfileDetails = createAsyncThunk(
  'profileDetails/fetchProfileDetails',
  async (
    { userType, userId }: { userType: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/${userType}/${userId}`);
      return {
        profile: response.data.data,
        userType,
        userId,
        timestamp: Date.now(),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Profile not found');
      }
      return rejectWithValue('Failed to fetch profile details');
    }
  }
);

// Async thunk for fetching similar profiles
export const fetchSimilarProfiles = createAsyncThunk(
  'profileDetails/fetchSimilarProfiles',
  async (
    {
      profileId,
      county,
      location,
      userType,
    }: {
      profileId: string;
      county: string;
      location: string;
      userType: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/similar`, {
        params: {
          profileId,
          county,
          location,
          userType,
          limit: 10,
        },
      });
      return response.data.data?.profiles || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch similar profiles');
      }
      return rejectWithValue('Failed to fetch similar profiles');
    }
  }
);

const initialState: ProfileDetailsState = {
  currentProfile: null,
  similarProfiles: [],
  profileCache: {},
  loading: false,
  loadingSimilar: false,
  error: null,
};

const profileDetailsSlice = createSlice({
  name: 'profileDetails',
  initialState,
  reducers: {
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
      state.similarProfiles = [];
      state.error = null;
    },
    clearSimilarProfiles: (state) => {
      state.similarProfiles = [];
    },
    setSimilarProfiles: (state, action: PayloadAction<ProfileDetail[]>) => {
      state.similarProfiles = action.payload;
    },
    updateCachedProfile: (state, action: PayloadAction<ProfileDetail>) => {
      const updatedProfile = action.payload;
      if (state.profileCache[updatedProfile._id]) {
        state.profileCache[updatedProfile._id] = {
          ...state.profileCache[updatedProfile._id],
          ...updatedProfile,
        };
      }
      if (state.currentProfile?._id === updatedProfile._id) {
        state.currentProfile = { ...state.currentProfile, ...updatedProfile };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { profile, userId } = action.payload;
        state.currentProfile = profile;
        state.profileCache[userId] = profile;
      })
      .addCase(fetchProfileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSimilarProfiles.pending, (state) => {
        state.loadingSimilar = true;
      })
      .addCase(fetchSimilarProfiles.fulfilled, (state, action) => {
        state.loadingSimilar = false;
        state.similarProfiles = action.payload;
      })
      .addCase(fetchSimilarProfiles.rejected, (state, action) => {
        state.loadingSimilar = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCurrentProfile,
  clearSimilarProfiles,
  setSimilarProfiles,
  updateCachedProfile,
} = profileDetailsSlice.actions;

export default profileDetailsSlice.reducer;
