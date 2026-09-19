// hooks/use-pinned-offsets.ts
import { type RefObject, useLayoutEffect, useState } from 'react'

/** Measures real rendered widths of pinned header cells and returns a
 *  px offset per column index. Kept as our own logic (not TanStack's
 *  built-in pinning) because: (1) our columns are auto-width /
 *  whitespace-nowrap, so a declared-size model would be wrong, and
 *  (2) we position with insetInlineStart/End, which already handles
 *  RTL/LTR for free — no left/right translation needed anywhere. */
export function usePinnedOffsets(
  wrapperRef: RefObject<HTMLDivElement>,
  headerCellRefs: RefObject<(HTMLTableCellElement | null)[]>,
  pinnedMap: Record<number, 'start' | 'end'>,
  colCount: number,
) {
  const [offsets, setOffsets] = useState<Record<number, number>>({})
  const hasPinned = Object.keys(pinnedMap).length > 0

  useLayoutEffect(() => {
    if (!hasPinned) return

    const compute = () => {
      const next: Record<number, number> = {}
      let runningStart = 0
      for (let i = 0; i < colCount; i++) {
        if (pinnedMap[i] === 'start') {
          next[i] = runningStart
          runningStart += headerCellRefs.current?.[i]?.offsetWidth ?? 0
        }
      }
      let runningEnd = 0
      for (let i = colCount - 1; i >= 0; i--) {
        if (pinnedMap[i] === 'end') {
          next[i] = runningEnd
          runningEnd += headerCellRefs.current?.[i]?.offsetWidth ?? 0
        }
      }
      setOffsets((prev) => {
        const prevKeys = Object.keys(prev)
        const nextKeys = Object.keys(next)
        if (prevKeys.length !== nextKeys.length) return next
        for (const key of nextKeys) if (prev[+key] !== next[+key]) return next
        return prev
      })
    }

    compute()
    const ro = new ResizeObserver(compute)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [pinnedMap, colCount, hasPinned, wrapperRef, headerCellRefs])

  return offsets
}