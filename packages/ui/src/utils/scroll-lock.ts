// utils/scroll-lock.ts
// Reference-counted so nested/stacked modals don't unlock the page
// early when the *inner* one closes while an outer one is still open.
let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''

export function lockScroll() {
  if (lockCount === 0) {
    // Compensate for the scrollbar disappearing so page content doesn't
    // visibly shift sideways the moment the modal opens.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    originalOverflow = document.body.style.overflow
    originalPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(getComputedStyle(document.body).paddingRight || '0')
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }
  }
  lockCount++
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow
    document.body.style.paddingRight = originalPaddingRight
  }
}