import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

/* ==========================================================================
   Layout state

   - One provider owns ALL layout UI state: sidebar collapse, mobile drawer,
     and which sub-menus are open.
   - Persisted preferences (collapsed + open sub-menus) are stored per
     tenant (and optionally per user) so switching tenants restores THAT
     tenant's layout instead of leaking the previous one.
   - Persisted state is synced across browser tabs.
   - Transient state (mobile drawer) is never persisted.
   - Knows nothing about what is rendered inside the sidebar or header.
   ========================================================================== */

export type LayoutDirection = 'ltr' | 'rtl'

const DEFAULT_STORAGE_PREFIX = 'layout:v1'
const LARGE_SCREEN_QUERY = '(min-width: 1024px)' // keep in sync with Tailwind's `lg`

/* ---- environment helpers ------------------------------------------------ */

export function getDocumentDirection(): LayoutDirection {
  if (typeof document === 'undefined') return 'ltr'
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
}

function subscribeToLargeScreen(onChange: () => void) {
  const query = window.matchMedia(LARGE_SCREEN_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const getLargeScreenSnapshot = () => window.matchMedia(LARGE_SCREEN_QUERY).matches
const getLargeScreenServerSnapshot = () => true

function isEditableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return Boolean(
    element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName))
  )
}

/* ---- persistence -------------------------------------------------------- */

type PersistedLayout = {
  sidebarCollapsed: boolean
  openSubmenus: Record<string, boolean>
}

const DEFAULT_PERSISTED: PersistedLayout = { sidebarCollapsed: false, openSubmenus: {} }

export function buildLayoutStorageKey(
  tenantId?: string,
  userId?: string,
  prefix: string = DEFAULT_STORAGE_PREFIX
) {
  return [prefix, tenantId ?? 'default', userId ?? 'shared'].join(':')
}

function parsePersisted(raw: string | null): PersistedLayout {
  if (!raw) return DEFAULT_PERSISTED
  try {
    const parsed = JSON.parse(raw)
    return {
      sidebarCollapsed: Boolean(parsed?.sidebarCollapsed),
      openSubmenus:
        parsed?.openSubmenus && typeof parsed.openSubmenus === 'object' ? parsed.openSubmenus : {},
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
    /* storage unavailable (private mode / quota): state still works in memory */
  }
}

/* ---- reducer ------------------------------------------------------------ */

type Toggle = boolean | 'toggle'

type LayoutState = PersistedLayout & {
  /** Storage key this state was hydrated from (guards against cross-tenant writes). */
  key: string
  mobileSidebarOpen: boolean
}

type LayoutAction =
  | { type: 'hydrate'; key: string; persisted: PersistedLayout } // tenant / user switched
  | { type: 'sync'; persisted: PersistedLayout } // another tab changed the preferences
  | { type: 'collapsed'; value: Toggle }
  | { type: 'mobile'; value: Toggle }
  | { type: 'submenu'; id: string; value: Toggle }
  | { type: 'reset' }

const resolve = (current: boolean, value: Toggle) => (value === 'toggle' ? !current : value)

function reducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.persisted, key: action.key, mobileSidebarOpen: false }
    case 'sync':
      return { ...state, ...action.persisted }
    case 'collapsed':
      return { ...state, sidebarCollapsed: resolve(state.sidebarCollapsed, action.value) }
    case 'mobile':
      return { ...state, mobileSidebarOpen: resolve(state.mobileSidebarOpen, action.value) }
    case 'submenu':
      return {
        ...state,
        openSubmenus: {
          ...state.openSubmenus,
          [action.id]: resolve(Boolean(state.openSubmenus[action.id]), action.value),
        },
      }
    case 'reset':
      return { ...state, ...DEFAULT_PERSISTED, mobileSidebarOpen: false }
  }
}

/* ---- context ------------------------------------------------------------ */

export type LayoutContextValue = {
  tenantId?: string
  /** Text direction the layout renders in. */
  dir: LayoutDirection
  /** `true` at the `lg` breakpoint and above (sidebar is a column, not a drawer). */
  isDesktop: boolean

  /** User preference: the desktop sidebar is collapsed to an icon rail. */
  sidebarCollapsed: boolean
  /** What actually renders: collapsed AND on desktop (the mobile drawer is never compact). */
  sidebarCompact: boolean
  mobileSidebarOpen: boolean

  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void
  /** Responsive toggle: collapses the rail on desktop, opens the drawer on mobile. */
  toggleSidebar: () => void

  isSubmenuOpen: (id: string) => boolean
  setSubmenuOpen: (id: string, open: boolean) => void
  toggleSubmenu: (id: string) => void

  resetLayout: () => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used inside <Layout> (or <LayoutProvider>).')
  return context
}

/* ---- provider ----------------------------------------------------------- */

export type LayoutProviderProps = {
  children: ReactNode
  /** Preferences are stored per tenant so they never bleed between tenants. */
  tenantId?: string
  /** Optional: also scope the preferences to the logged-in user. */
  userId?: string
  /** Text direction. Defaults to the document's `dir`. */
  dir?: LayoutDirection
  /** localStorage key prefix. Change it to namespace your app or to invalidate old preferences. */
  storagePrefix?: string
  /** Key that toggles the sidebar together with Ctrl/Cmd. `false` disables the shortcut. */
  shortcut?: string | false
}

export function LayoutProvider({
  children,
  tenantId,
  userId,
  dir,
  storagePrefix = DEFAULT_STORAGE_PREFIX,
  shortcut = 'b',
}: LayoutProviderProps) {
  const direction = dir ?? getDocumentDirection()
  const storageKey = buildLayoutStorageKey(tenantId, userId, storagePrefix)
  const isDesktop = useSyncExternalStore(
    subscribeToLargeScreen,
    getLargeScreenSnapshot,
    getLargeScreenServerSnapshot
  )

  const [state, dispatch] = useReducer(
    reducer,
    storageKey,
    (key): LayoutState => ({ ...readPersisted(key), key, mobileSidebarOpen: false })
  )

  // Tenant / user switched: load THAT scope's layout during render, so there is no stale frame.
  if (state.key !== storageKey) {
    dispatch({ type: 'hydrate', key: storageKey, persisted: readPersisted(storageKey) })
  }

  /* Persist preferences. */
  useEffect(() => {
    writePersisted(storageKey, {
      sidebarCollapsed: state.sidebarCollapsed,
      openSubmenus: state.openSubmenus,
    })
  }, [storageKey, state.sidebarCollapsed, state.openSubmenus])

  /* Keep other tabs in sync. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        dispatch({ type: 'sync', persisted: parsePersisted(event.newValue) })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  /* The drawer only exists below `lg`: close it when the viewport grows. */
  useEffect(() => {
    if (isDesktop) dispatch({ type: 'mobile', value: false })
  }, [isDesktop])

  /* Open drawer: close on Escape and lock body scroll. */
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

  /* `dispatch` is stable, so these callbacks are created once. */
  const actions = useMemo(
    () => ({
      setSidebarCollapsed: (collapsed: boolean) => dispatch({ type: 'collapsed', value: collapsed }),
      toggleSidebarCollapsed: () => dispatch({ type: 'collapsed', value: 'toggle' }),
      openMobileSidebar: () => dispatch({ type: 'mobile', value: true }),
      closeMobileSidebar: () => dispatch({ type: 'mobile', value: false }),
      toggleMobileSidebar: () => dispatch({ type: 'mobile', value: 'toggle' }),
      setSubmenuOpen: (id: string, open: boolean) => dispatch({ type: 'submenu', id, value: open }),
      toggleSubmenu: (id: string) => dispatch({ type: 'submenu', id, value: 'toggle' }),
      resetLayout: () => dispatch({ type: 'reset' }),
    }),
    []
  )

  const { toggleSidebarCollapsed, toggleMobileSidebar } = actions
  const toggleSidebar = useCallback(
    () => (isDesktop ? toggleSidebarCollapsed() : toggleMobileSidebar()),
    [isDesktop, toggleSidebarCollapsed, toggleMobileSidebar]
  )

  /* Ctrl/Cmd + <shortcut> toggles the sidebar (ignored while typing). */
  useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      toggleSidebar()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcut, toggleSidebar])

  const { openSubmenus } = state
  const isSubmenuOpen = useCallback((id: string) => Boolean(openSubmenus[id]), [openSubmenus])

  const value = useMemo<LayoutContextValue>(
    () => ({
      tenantId,
      dir: direction,
      isDesktop,
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarCompact: state.sidebarCollapsed && isDesktop,
      mobileSidebarOpen: state.mobileSidebarOpen,
      toggleSidebar,
      isSubmenuOpen,
      ...actions,
    }),
    [
      tenantId,
      direction,
      isDesktop,
      state.sidebarCollapsed,
      state.mobileSidebarOpen,
      toggleSidebar,
      isSubmenuOpen,
      actions,
    ]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}