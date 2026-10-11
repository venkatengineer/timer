import { useEffect } from 'react'

interface ShortcutHandlers {
  onToggleOrganizer: () => void
  onToggleSound: () => void
  onTogglePause: () => void
}

export function useKeyboardShortcuts({
  onToggleOrganizer,
  onToggleSound,
  onTogglePause,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing into input or textarea
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const key = e.key.toLowerCase()

      if (key === 'o') {
        e.preventDefault()
        onToggleOrganizer()
      } else if (key === 'm') {
        e.preventDefault()
        onToggleSound()
      } else if (e.code === 'Space') {
        e.preventDefault()
        onTogglePause()
      } else if (key === 'f') {
        e.preventDefault()
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleOrganizer, onToggleSound, onTogglePause])
}
