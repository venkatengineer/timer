import { useEffect } from 'react'

interface ShortcutHandlers {
  onToggleOrganizer: () => void
  onToggleSound: () => void
  onTogglePause: () => void
  onOpenManualTimer?: () => void
}

export function useKeyboardShortcuts({
  onToggleOrganizer,
  onToggleSound,
  onTogglePause,
  onOpenManualTimer,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement

      // Global shortcut: Ctrl + A (or Cmd + A) opens the Manual Timer Window
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        const isInsideManualModal = target?.closest?.('[data-manual-timer-modal]')
        if (!isInsideManualModal) {
          e.preventDefault()
          onOpenManualTimer?.()
          return
        }
      }

      // Don't trigger single-key shortcuts if typing into input or textarea
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
  }, [onToggleOrganizer, onToggleSound, onTogglePause, onOpenManualTimer])
}
