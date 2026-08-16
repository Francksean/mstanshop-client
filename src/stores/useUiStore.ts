import { create } from "zustand"

interface UiState {
  isMobileNavOpen: boolean
  isFiltersSheetOpen: boolean
  isAdminSidebarCollapsed: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void
  openFiltersSheet: () => void
  closeFiltersSheet: () => void
  toggleAdminSidebar: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  isMobileNavOpen: false,
  isFiltersSheetOpen: false,
  isAdminSidebarCollapsed: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  openFiltersSheet: () => set({ isFiltersSheetOpen: true }),
  closeFiltersSheet: () => set({ isFiltersSheetOpen: false }),
  toggleAdminSidebar: () =>
    set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
}))
