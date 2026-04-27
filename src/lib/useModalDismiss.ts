import { useEffect, useRef } from 'react'

/**
 * A11y modal helper. Returns a ref to attach to the modal container; when
 * mounted it:
 *   - moves focus to the first focusable element inside the modal (so
 *     screen readers announce the dialog)
 *   - traps Tab so focus never leaves the modal
 *   - closes the modal on Escape
 *   - restores focus to the previously focused element on unmount
 */
export function useModalDismiss<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = (): HTMLElement[] => {
      if (!ref.current) return []
      return Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
    }

    // Move focus into the modal so keyboard / screen-reader users land here.
    const els = focusables()
    if (els.length > 0 && !ref.current?.contains(document.activeElement)) {
      els[0].focus()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    // Snapshot the ref node now so the cleanup uses the same DOM element
    // we attached listeners to, even if React unmounts it before cleanup runs.
    const currentNode = ref.current

    return () => {
      document.removeEventListener('keydown', onKey)
      // Restore focus only if it's still inside the modal that's unmounting -
      // otherwise the user may have manually focused something else already.
      if (currentNode?.contains(document.activeElement) || document.activeElement === document.body) {
        previouslyFocused?.focus?.()
      }
    }
  }, [onClose])

  return ref
}
