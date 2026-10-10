'use client'

import { useEffect, useRef } from 'react'

/**
 * Shared behaviour for modal surfaces: Escape to close, scroll lock, focus
 * move-in on open and focus restore on close, plus a simple focus trap.
 */
export function useModalBehaviour(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const container = containerRef.current
    const focusables = () =>
      Array.from(
        container?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true')

    /*
     * Move focus into the dialog synchronously so screen readers announce it.
     * Deliberately NOT inside requestAnimationFrame: rAF is paused while the
     * tab is backgrounded, which would leave focus stranded behind the scrim.
     */
    const [firstFocusable] = focusables()
    ;(firstFocusable ?? container)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      restoreTo.current?.focus?.()
    }
  }, [open, onClose])

  return containerRef
}

export function Scrim({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 animate-fade-in bg-navy/25"
      onClick={onClick}
      aria-hidden="true"
    />
  )
}
