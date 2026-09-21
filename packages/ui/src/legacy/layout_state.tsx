import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

/* ==========================================================================
   Layout state for Teachedo (multi-tenant)

   - One provider owns ALL layout UI state (sidebar collapse, mobile drawer,
     which sub-menu groups are open).
   - Persisted preferences (collapsed + open groups) are stored per
     tenant (and optionally per user), so switching tenants restores THAT
     tenant's layout instead of leaking the previous one.
   - Persisted state is synced across browser tabs.
   - Transient state (mobile drawer) is never persisted.
   ========================================================================== */

const STORAGE_PREFIX = 'teachedo:layout:v1'
const LARGE_SCREEN_QUERY = '(min-width: 1024px)'

type PersistedLayout = {
  sidebarCollapsed: boolean
  openGroups: Record<string, boolean>
}

type LayoutState = PersistedLayout & {
  /** Storage key this state was hydrated from (guards against cross-tenant writes). */
  key: string
  mobileSidebarOpen: boolean
}

type Toggle = boolean | 'toggle'

type LayoutAction =
  | { type: 'hydrate'; key: string; persisted: PersistedLayout }
  | { type: 'collapsed'; value: Toggle }
  | { type: 'mobile'; value: Toggle }
  | { type: 'group'; id: string; value: Toggle }
  | { type: 'reset' }

const DEFAULT_PERSISTED: PersistedLayout = { sidebarCollapsed: false, openGroups: {} }

export function buildLayoutStorageKey(tenantId?: string, userId?: string) {
  return [STORAGE_PREFIX, tenantId ?? 'default', userId ?? 'shared'].join(':')
}

function parsePersisted(raw: string | null): PersistedLayout {
  if (!raw) return DEFAULT_PERSISTED
  try {
    const parsed = JSON.parse(raw)
    return {
      sidebarCollapsed: Boolean(parsed?.sidebarCollapsed),
      openGroups:
        parsed?.openGroups && typeof parsed.openGroups === 'object' ? parsed.openGroups : {},
    }
  } catch {
    return DEFAULT_PERSISTED
  }
}

function readPersisted(key: string): PersistedLayout {
  try {
    return parsePersisted(window.localStorage.getItem(key))
  } catch {
    return DEFAULT_PERSISTED
  }
}

function writePersisted(key: string, value: PersistedLayout) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode / quota) — state still works in memory */
  }
}

const resolve = (current: boolean, value: Toggle) => (value === 'toggle' ? !current : value)

function reducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.persisted, key: action.key, mobileSidebarOpen: false }
    case 'collapsed':
      return { ...state, sidebarCollapsed: resolve(state.sidebarCollapsed, action.value) }
    case 'mobile':
      return { ...state, mobileSidebarOpen: resolve(state.mobileSidebarOpen, action.value) }
    case 'group':
      return {
        ...state,
        openGroups: {
          ...state.openGroups,
          [action.id]: resolve(Boolean(state.openGroups[action.id]), action.value),
        },
      }
    case 'reset':
      return { ...state, ...DEFAULT_PERSISTED, mobileSidebarOpen: false }
  }
}

export type LayoutContextValue = {
  tenantId?: string
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void
  isGroupOpen: (id: string) => boolean
  setGroupOpen: (id: string, open: boolean) => void
  toggleGroup: (id: string) => void
  resetLayout: () => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({
  tenantId,
  userId,
  children,
}: {
  /** Layout preferences are stored per tenant so they never bleed between tenants. */
  tenantId?: string
  /** Optional: also scope the preferences to the logged-in user. */
  userId?: string
  children: ReactNode
}) {
  const storageKey = buildLayoutStorageKey(tenantId, userId)

  const [state, dispatch] = useReducer(reducer, storageKey, (key): LayoutState => ({
    ...readPersisted(key),
    key,
    mobileSidebarOpen: false,
  }))

  /* Tenant / user switched → load THAT scope's saved layout. */
  useEffect(() => {
    if (state.key !== storageKey) {
      dispatch({ type: 'hydrate', key: storageKey, persisted: readPersisted(storageKey) })
    }
  }, [storageKey, state.key])

  /* Persist — skipped until the state belongs to the current key. */
  useEffect(() => {
    if (state.key !== storageKey) return
    writePersisted(storageKey, {
      sidebarCollapsed: state.sidebarCollapsed,
      openGroups: state.openGroups,
    })
  }, [storageKey, state.key, state.sidebarCollapsed, state.openGroups])

  /* Keep other tabs in sync. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        dispatch({ type: 'hydrate', key: storageKey, persisted: parsePersisted(event.newValue) })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  /* Mobile drawer: close on desktop, close on Escape, lock body scroll while open. */
  useEffect(() => {
    const mql = window.matchMedia(LARGE_SCREEN_QUERY)
    const onChange = () => mql.matches && dispatch({ type: 'mobile', value: false })
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!state.mobileSidebarOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch({ type: 'mobile', value: false })
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [state.mobileSidebarOpen])

  /* Ctrl/Cmd + B toggles the sidebar (ignored while typing). */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'b') return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      event.preventDefault()
      dispatch({ type: 'collapsed', value: 'toggle' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const setSidebarCollapsed = useCallback((v: boolean) => dispatch({ type: 'collapsed', value: v }), [])
  const toggleSidebarCollapsed = useCallback(() => dispatch({ type: 'collapsed', value: 'toggle' }), [])
  const openMobileSidebar = useCallback(() => dispatch({ type: 'mobile', value: true }), [])
  const closeMobileSidebar = useCallback(() => dispatch({ type: 'mobile', value: false }), [])
  const toggleMobileSidebar = useCallback(() => dispatch({ type: 'mobile', value: 'toggle' }), [])
  const setGroupOpen = useCallback((id: string, open: boolean) => dispatch({ type: 'group', id, value: open }), [])
  const toggleGroup = useCallback((id: string) => dispatch({ type: 'group', id, value: 'toggle' }), [])
  const resetLayout = useCallback(() => dispatch({ type: 'reset' }), [])

  const { openGroups } = state
  const isGroupOpen = useCallback((id: string) => Boolean(openGroups[id]), [openGroups])

  const value = useMemo<LayoutContextValue>(
    () => ({
      tenantId,
      sidebarCollapsed: state.sidebarCollapsed,
      mobileSidebarOpen: state.mobileSidebarOpen,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      isGroupOpen,
      setGroupOpen,
      toggleGroup,
      resetLayout,
    }),
    [
      tenantId,
      state.sidebarCollapsed,
      state.mobileSidebarOpen,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      isGroupOpen,
      setGroupOpen,
      toggleGroup,
      resetLayout,
    ]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used inside <LayoutProvider> (LayoutShell provides it).')
  return context
}