import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  isSidebarCollapsed: boolean
}

interface LayoutActions {
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void
  toggleSidebar: () => void
}

type LayoutStore = LayoutState & LayoutActions

const initialState: LayoutState = {
  isSidebarCollapsed: false,
}

export const useLayoutSettings = create<LayoutStore>()(
  persist(
    (set) => ({
      ...initialState,
      setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: 'portal-layout-settings',
      partialize: (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed }),
    }
  )
)