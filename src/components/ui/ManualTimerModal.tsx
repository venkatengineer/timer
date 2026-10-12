import React, { useState, useEffect } from 'react'
import {
  X,
  Play,
  Pause,
  Clock,
  Plus,
  Minus,
} from 'lucide-react'

interface ManualTimerModalProps {
  isOpen: boolean
  onClose: () => void
  onSetAndPlay: (totalSeconds: number) => void
  onSetAndPause?: (totalSeconds: number) => void
  initialSeconds?: number
}

export const ManualTimerModal: React.FC<ManualTimerModalProps> = ({
  isOpen,
  onClose,
  onSetAndPlay,
  onSetAndPause,
  initialSeconds = 86400,
}) => {
  const [hours, setHours] = useState(24)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Initialize values when opened
  useEffect(() => {
    if (isOpen) {
      const totalSec = Math.max(1, Math.round(initialSeconds))
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      setHours(h)
      setMinutes(m)
      setSeconds(s)
    }
  }, [isOpen, initialSeconds])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const calculateTotalSeconds = (): number => {
    const total =
      (Math.max(0, hours) * 3600) +
      (Math.max(0, Math.min(59, minutes)) * 60) +
      Math.max(0, Math.min(59, seconds))
    return Math.max(1, total)
  }

  const handleApplyAndPlay = () => {
    const totalSec = calculateTotalSeconds()
    onSetAndPlay(totalSec)
    onClose()
  }

  const handleApplyAndPause = () => {
    const totalSec = calculateTotalSeconds()
    if (onSetAndPause) {
      onSetAndPause(totalSec)
    } else {
      onSetAndPlay(totalSec)
    }
    onClose()
  }

  const setPreset = (h: number, m: number, s: number = 0) => {
    setHours(h)
    setMinutes(m)
    setSeconds(s)
  }

  const adjustHours = (delta: number) => {
    setHours((prev) => Math.max(0, prev + delta))
  }

  const adjustMinutes = (delta: number) => {
    setMinutes((prev) => {
      const next = prev + delta
      if (next < 0) return 0
      if (next > 59) return 59
      return next
    })
  }

  const adjustSeconds = (delta: number) => {
    setSeconds((prev) => {
      const next = prev + delta
      if (next < 0) return 0
      if (next > 59) return 59
      return next
    })
  }

  const totalCalculated = calculateTotalSeconds()
  const displayHours = String(hours).padStart(2, '0')
  const displayMinutes = String(minutes).padStart(2, '0')
  const displaySeconds = String(seconds).padStart(2, '0')

  return (
    <div
      data-manual-timer-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05050A]/85 backdrop-blur-md select-none animate-in fade-in duration-200"
    >
      <div className="relative max-w-xl w-full p-6 sm:p-8 rounded-2xl bg-[#100B20]/95 border border-[#A78BFA]/50 shadow-[0_0_60px_rgba(167,139,250,0.35)] space-y-6">
        
        {/* Header with Title and Shortcut Badge */}
        <div className="flex items-center justify-between border-b border-[#A78BFA]/20 pb-4">
          <div className="flex items-center space-x-3 text-[#A78BFA]">
            <Clock className="w-6 h-6 text-[#6DADEB]" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-mono font-bold tracking-wide uppercase text-[#F3F2FA]">
                  MANUAL MISSION TIMER
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A78BFA]/20 text-[#C4B5FD] border border-[#A78BFA]/30">
                  CTRL + A
                </span>
              </div>
              <p className="text-xs text-[#8D8BA0] font-mono">
                Set custom mission time and launch directly to the live countdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#8D8BA0]/20 hover:border-[#8D8BA0] text-[#8D8BA0] hover:text-[#F3F2FA] transition-all cursor-pointer"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Digital Display Preview */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-[#05050A]/70 border border-[#A78BFA]/30 text-center space-y-1">
          <div className="text-[11px] font-mono tracking-widest text-[#6DADEB] uppercase">
            CONFIGURED COUNTDOWN TARGET
          </div>
          <div className="text-4xl sm:text-6xl font-mono font-extrabold text-[#F3F2FA] tracking-tight tabular-nums drop-shadow-[0_0_25px_rgba(167,139,250,0.4)]">
            <span>{displayHours}</span>
            <span className="text-[#8D8BA0]/40 mx-1">:</span>
            <span>{displayMinutes}</span>
            <span className="text-[#8D8BA0]/40 mx-1">:</span>
            <span className="text-[#A78BFA]">{displaySeconds}</span>
          </div>
          <div className="text-xs font-mono text-[#8D8BA0] tracking-wider pt-1">
            TOTAL DURATION: <span className="text-[#C4B5FD]">{totalCalculated.toLocaleString()} SECONDS</span>
          </div>
        </div>

        {/* Direct Numerical Inputs & Adjusters */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 font-mono text-center">
          
          {/* Hours Block */}
          <div className="p-3 rounded-xl bg-[#100B20] border border-[#A78BFA]/30 space-y-2">
            <span className="text-[11px] text-[#8D8BA0] tracking-widest block uppercase">
              HOURS
            </span>
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => adjustHours(-1)}
                className="w-7 h-7 rounded bg-[#1A1829] hover:bg-[#A78BFA]/30 border border-[#A78BFA]/30 text-[#C4B5FD] flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Subtract 1 hour"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="0"
                max="999"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-14 sm:w-16 py-1 text-center bg-[#05050A] border border-[#A78BFA]/40 rounded text-xl font-bold text-[#F3F2FA] focus:outline-none focus:border-[#6DADEB]"
              />
              <button
                onClick={() => adjustHours(1)}
                className="w-7 h-7 rounded bg-[#1A1829] hover:bg-[#A78BFA]/30 border border-[#A78BFA]/30 text-[#C4B5FD] flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Add 1 hour"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex justify-center space-x-1 text-[10px] text-[#8D8BA0]">
              <button
                onClick={() => adjustHours(-5)}
                className="px-1.5 py-0.5 rounded bg-[#1A1829]/60 hover:text-[#F3F2FA] transition-all cursor-pointer"
              >
                -5h
              </button>
              <button
                onClick={() => adjustHours(5)}
                className="px-1.5 py-0.5 rounded bg-[#1A1829]/60 hover:text-[#F3F2FA] transition-all cursor-pointer"
              >
                +5h
              </button>
            </div>
          </div>

          {/* Minutes Block */}
          <div className="p-3 rounded-xl bg-[#100B20] border border-[#A78BFA]/30 space-y-2">
            <span className="text-[11px] text-[#8D8BA0] tracking-widest block uppercase">
              MINUTES
            </span>
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => adjustMinutes(-1)}
                className="w-7 h-7 rounded bg-[#1A1829] hover:bg-[#A78BFA]/30 border border-[#A78BFA]/30 text-[#C4B5FD] flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Subtract 1 minute"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0
                  setMinutes(Math.max(0, Math.min(59, val)))
                }}
                className="w-14 sm:w-16 py-1 text-center bg-[#05050A] border border-[#A78BFA]/40 rounded text-xl font-bold text-[#F3F2FA] focus:outline-none focus:border-[#6DADEB]"
              />
              <button
                onClick={() => adjustMinutes(1)}
                className="w-7 h-7 rounded bg-[#1A1829] hover:bg-[#A78BFA]/30 border border-[#A78BFA]/30 text-[#C4B5FD] flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Add 1 minute"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex justify-center space-x-1 text-[10px] text-[#8D8BA0]">
              <button
                onClick={() => adjustMinutes(-10)}
                className="px-1.5 py-0.5 rounded bg-[#1A1829]/60 hover:text-[#F3F2FA] transition-all cursor-pointer"
              >
                -10m
              </button>
              <button
                onClick={() => adjustMinutes(10)}
                className="px-1.5 py-0.5 rounded bg-[#1A1829]/60 hover:text-[#F3F2FA] transition-all cursor-pointer"
              >
                +10m
              </button>
            </div>
          </div>

          {/* Seconds Block */}
          <div className="p-3 rounded-xl bg-[#100B20] border border-[#A78BFA]/30 space-y-2">
            <span className="text-[11px] text-[#8D8BA0] tracking-widest block uppercase">
              SECONDS
            </span>
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => adjustSeconds(-1)}
                className="w-7 h-7 rounded bg-[#1A1829] hover:bg-[#A78BFA]/30 border border-[#A78BFA]/30 text-[#C4B5FD] flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Subtract 1 second"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0
                  setSeconds(Math.max(0, Math.min(59, val)))
                }}
                className="w-14 sm:w-16 py-1 text-center bg-[#05050A] border border-[#A78BFA]/40 rounded text-xl font-bold text-[#A78BFA] focus:outline-none focus:border-[#6DADEB]"
              />
              <button
                onClick={() => adjustSeconds(1)}
                className="w-7 h-7 rounded bg-[#1A1829] hover:bg-[#A78BFA]/30 border border-[#A78BFA]/30 text-[#C4B5FD] flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Add 1 second"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex justify-center space-x-1 text-[10px] text-[#8D8BA0]">
              <button
                onClick={() => adjustSeconds(-10)}
                className="px-1.5 py-0.5 rounded bg-[#1A1829]/60 hover:text-[#F3F2FA] transition-all cursor-pointer"
              >
                -10s
              </button>
              <button
                onClick={() => adjustSeconds(10)}
                className="px-1.5 py-0.5 rounded bg-[#1A1829]/60 hover:text-[#F3F2FA] transition-all cursor-pointer"
              >
                +10s
              </button>
            </div>
          </div>

        </div>

        {/* Quick Presets (1-Click Fill) */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#8D8BA0] uppercase tracking-wider block">
            QUICK PRESETS
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              onClick={() => setPreset(24, 0)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              24h (Full Event)
            </button>
            <button
              onClick={() => setPreset(18, 0)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              18h
            </button>
            <button
              onClick={() => setPreset(12, 0)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              12h (Half Orbit)
            </button>
            <button
              onClick={() => setPreset(6, 0)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              6h (Quarter)
            </button>
            <button
              onClick={() => setPreset(1, 0)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              1h
            </button>
            <button
              onClick={() => setPreset(0, 30)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              30m
            </button>
            <button
              onClick={() => setPreset(0, 10)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              10m
            </button>
            <button
              onClick={() => setPreset(0, 1)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              1m (Final Minute)
            </button>
            <button
              onClick={() => setPreset(0, 0, 10)}
              className="px-2.5 py-1 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] hover:bg-[#A78BFA]/10 transition-all cursor-pointer"
            >
              10s (Test Finish)
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#A78BFA]/20 font-mono">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#8D8BA0]/30 hover:border-[#8D8BA0] text-[#8D8BA0] hover:text-[#F3F2FA] text-xs transition-all cursor-pointer"
          >
            CANCEL
          </button>

          <button
            onClick={handleApplyAndPause}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1A1829] hover:bg-[#2A243D] border border-[#A78BFA]/40 text-[#C4B5FD] text-xs font-semibold tracking-wider transition-all cursor-pointer"
          >
            <Pause className="w-4 h-4 text-[#FBBF24]" />
            <span>SET & PAUSE</span>
          </button>

          {/* User's explicitly requested "LATER PLAY IT GOES TO MAIN SCREEN" button */}
          <button
            onClick={handleApplyAndPlay}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A78BFA] via-[#6DADEB] to-[#34D399] text-[#05050A] text-xs font-bold tracking-widest transition-all cursor-pointer shadow-[0_0_25px_rgba(167,139,250,0.4)] hover:opacity-95 active:scale-98"
          >
            <Play className="w-4 h-4 fill-current text-[#05050A]" />
            <span>PLAY & GO TO MAIN SCREEN</span>
          </button>
        </div>

      </div>
    </div>
  )
}
