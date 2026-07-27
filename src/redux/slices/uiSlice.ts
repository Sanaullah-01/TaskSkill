import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean; // Determines if the sidebar is visible (mostly for mobile/tablet)
  sidebarCollapsed: boolean; // Determines if the sidebar is in icon-only mode (desktop)
}

const initialState: UiState = {
  sidebarOpen: false,
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapse: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleSidebarCollapse, setSidebarCollapse } = uiSlice.actions;
export default uiSlice.reducer;
