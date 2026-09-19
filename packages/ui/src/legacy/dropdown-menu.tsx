// dropdown-menu.tsx
import {
  cloneElement,
  createContext,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Check } from 'lucide-react'
import { Popover } from './popover'
import { Input } from './input'
import { cn } from 'cn'
import type { FloatingAlign, FloatingSide } from '../utils/floating'

// ── Context: lets items close the menu without prop-drilling ────────
const CloseCtx = createContext<() => void>(() => { })

// ── DropdownMenu ──────────────────────────────────────────────────

type DropdownMenuProps = {
  trigger: ReactElement
  children: ReactNode
  side?: FloatingSide
  align?: FloatingAlign
  offset?: number
  menuClassName?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void

  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Auto-hide items whose text doesn't match. Set false if you're
   *  driving filtering yourself (e.g. server-side search). */
  filterItems?: boolean
  noResultsLabel?: ReactNode
}

export function DropdownMenu({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  offset = 4,
  menuClassName,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  searchable = false,
  searchPlaceholder = 'بحث',
  searchValue,
  onSearchChange,
  filterItems = true,
  noResultsLabel = 'No results',
}: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const [internalSearch, setInternalSearch] = useState('')
  const search = searchValue ?? internalSearch
  const [visibleCount, setVisibleCount] = useState<number | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  // Reset stale search state whenever the menu closes.
  useEffect(() => {
    if (isOpen) return
    setInternalSearch('')
    setVisibleCount(null)
  }, [isOpen])

  // Autofocus search on open — real focus, not a DOM query hack.
  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus()
  }, [isOpen, searchable])

  const setSearch = (value: string) => {
    if (searchValue === undefined) setInternalSearch(value)
    onSearchChange?.(value)
  }

  // Filters by reading rendered menuitem text — items are arbitrary
  // ReactNode so we can't inspect their content without mounting them
  // first. `hidden` (not inline `display`) is used because it's the
  // correct semantic primitive: browsers drop hidden elements from the
  // accessibility tree and tab order for free, so keyboard nav below
  // doesn't need to duplicate that logic.
  useLayoutEffect(() => {
    if (!isOpen || !searchable || !filterItems || !listRef.current) return
    const items = listRef.current.querySelectorAll<HTMLElement>('[role^="menuitem"]')
    const query = search.trim().toLowerCase()
    let shown = 0
    for (const item of items) {
      const matches = query === '' || (item.textContent ?? '').toLowerCase().includes(query)
      item.hidden = !matches
      if (matches) shown++
    }
    setVisibleCount(shown)
  }, [isOpen, searchable, filterItems, search, children])

  const getFocusableItems = () =>
    [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button[role^="menuitem"]:not(:disabled)') ?? [])].filter(
      (el) => !el.hidden,
    )

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    const items = getFocusableItems()
    if (items.length === 0) return
    const active = document.activeElement as HTMLButtonElement
    const idx = items.indexOf(active)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[idx === -1 ? 0 : (idx + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[idx === -1 ? items.length - 1 : (idx - 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  return (
    <Popover
      trigger={cloneElement(trigger, { 'aria-haspopup': 'menu' } as any)}
      side={side}
      align={align}
      offset={offset}
      open={isOpen}
      onOpenChange={setOpen}
      contentClassName={cn(
        'flex max-h-60 min-w-50 flex-col gap-1 rounded-sm p-1.5',
        menuClassName,
      )}
    >
      <div role="menu" onKeyDown={handleKeyDown} className="flex flex-col gap-1">
        {searchable && (
          <Input
            ref={searchRef}
            type="text"
            role="searchbox"
            size="sm"
            variant="outline"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        )}

        <div ref={listRef} className="flex flex-col gap-0.5 overflow-auto">
          <CloseCtx.Provider value={() => setOpen(false)}>{children}</CloseCtx.Provider>
          {searchable && filterItems && visibleCount === 0 && (
            <div className="select-none px-1.5 py-1 text-[12px] text-text-muted">{noResultsLabel}</div>
          )}
        </div>
      </div>
    </Popover>
  )
}

// ── DropdownMenuItem ─────────────────────────────────────────────

type DropdownMenuItemProps = {
  icon?: ReactNode
  shortcut?: string
  variant?: 'default' | 'danger'
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
  className?: string
  children: ReactNode
}

export function DropdownMenuItem({
  icon,
  shortcut,
  variant = 'default',
  selected = false,
  disabled,
  onSelect,
  children,
  className,
}: DropdownMenuItemProps) {
  const close = useContext(CloseCtx)

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onSelect?.()
        close()
      }}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-sm border-none px-1.5 py-1 text-left',
        'cursor-pointer font-[inherit] text-[11px] font-medium outline-none transition-colors duration-100',
        'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1',
        'disabled:pointer-events-none disabled:opacity-40',
        variant === 'danger' &&
        'text-destructive-subtle-foreground hover:bg-destructive-subtle focus:bg-destructive-subtle',
        variant === 'default' &&
        (selected
          ? 'bg-primary text-primary-foreground hover:bg-primary cursor-auto focus:bg-primary-hover'
          : 'text-text hover:bg-neutral-100 focus:bg-neutral-100'),
        className,
      )}
    >
      <span className="flex items-center gap-2">
        {icon && (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center opacity-65 [&>svg]:h-full [&>svg]:w-full">
            {icon}
          </span>
        )}
        {children}
      </span>
      {shortcut && (
        <kbd
          className={cn(
            'rounded-sm px-1.5 py-px font-[inherit] text-[11px]',
            variant === 'danger' ? 'bg-destructive-subtle text-destructive-subtle-foreground/70' : 'bg-surface-secondary text-text-muted',
          )}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  )
}

// ── DropdownMenuCheckItem ────────────────────────────────────────
// Toggle only. (The old `group` prop was dead — declared in the type
// but never wired to anything, so a single-select radio group never
// actually worked. That's a job for the consumer's own state, one
// level up, not something this component can fake safely.)

type DropdownMenuCheckItemProps = {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  children: ReactNode
  className?: string
  closeOnSelect?: boolean
}

export function DropdownMenuCheckItem({
  checked,
  onCheckedChange,
  children,
  className,
  closeOnSelect = false,
}: DropdownMenuCheckItemProps) {
  const close = useContext(CloseCtx)

  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => {
        onCheckedChange(!checked)
        if (closeOnSelect) close()
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm border-none px-1.5 py-1 text-left',
        'cursor-pointer font-[inherit] text-[11px] outline-none transition-colors duration-100',
        'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1',
        checked ? 'bg-primary text-primary-foreground' : 'text-text hover:bg-neutral-100 focus:bg-neutral-100',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-opacity',
          checked ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Check className="h-full w-full" strokeWidth={2.5} />
      </span>
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div role="separator" className="h-px bg-border" />
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="select-none px-1 pb-0 pt-1 text-[10px] font-bold uppercase tracking-widest text-text-faint">
      {children}
    </div>
  )
}