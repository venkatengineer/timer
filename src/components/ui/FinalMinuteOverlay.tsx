import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Flame, Award } from 'lucide-react'
import type { MissionStatus } from '../../types/mission'

interface FinalMinuteOverlayProps {
  status: MissionStatus
  remainingSeconds: number
  isFinalMinute: boolean
  isFinalTenSeconds: boolean
  finalCountdownDigit: number | null
  sounds: {
    playFinalHeartbeat: () => void
    playCompletionFanfare: () => void
    playCountdownTick: (pitch?: number) => void
  }
}

export const FinalMinuteOverlay: React.FC<FinalMinuteOverlayProps> = ({
  status,
  isFinalMinute,
  isFinalTenSeconds,
  finalCountdownDigit,
  sounds,
}) => {
  // Sound pulse triggers
  useEffect(() => {
    if (isFinalTenSeconds && finalCountdownDigit !== null && finalCountdownDigit > 0) {
      sounds.playCountdownTick(750 + (10 - finalCountdownDigit) * 35)
    } else if (isFinalMinute && !isFinalTenSeconds) {
      sounds.playFinalHeartbeat()
    }
  }, [finalCountdownDigit, isFinalTenSeconds, isFinalMinute, sounds])

  // Celebration fanfare & confetti upon completion
  useEffect(() => {
    if (status === 'completed') {
      sounds.playCompletionFanfare()

      // Launch celebratory particle confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#A78BFA', '#6DADEB', '#F3F2FA', '#FBBF24'],
        })
      } catch (e) {
        console.warn('Confetti launch error:', e)
      }
    }
  }, [status, sounds])

  // Completed State Celebration Banner
  if (status === 'completed') {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center p-4 bg-[#05050A]/70 backdrop-blur-md select-none animate-in fade-in duration-700">
        <div className="max-w-xl w-full p-8 rounded-2xl bg-[#100B20]/90 border border-[#A78BFA] text-center space-y-6 shadow-[0_0_60px_rgba(167,139,250,0.4)]">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#A78BFA]/20 border border-[#A78BFA] flex items-center justify-center text-[#A78BFA] shadow-[0_0_30px_rgba(167,139,250,0.5)]">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono tracking-[0.4em] text-[#A78BFA] uppercase">
              360° ORBITAL REVOLUTION COMPLETE
            </div>
            <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#F3F2FA]">
              MISSION COMPLETE
            </h2>
            <p className="text-sm font-mono text-[#8D8BA0] tracking-wider pt-1">
              ALL HACKATHON STAGES CONCLUDED • TIME LOCKED AT 00:00:00
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#05050A]/70 border border-[#A78BFA]/20 font-mono text-xs text-[#C4B5FD] space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[#8D8BA0]">FINAL STATUS:</span>
              <span className="text-[#34D399] font-bold">100.00% COMPLETED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8D8BA0]">CELESTIAL REVOLUTION:</span>
              <span className="text-[#F3F2FA]">EXACT 1.000 ORBIT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8D8BA0]">CODE SUBMISSIONS:</span>
              <span className="text-[#FBBF24] font-semibold">LOCKED FOR JUDGING</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#8D8BA0]">
            Thank you hackers and organizers. Flight Operations standby for presentations.
          </div>
        </div>
      </div>
    )
  }

  // T-10 through T-01 Terminal Countdown overlay
  if (isFinalTenSeconds && finalCountdownDigit !== null && finalCountdownDigit > 0) {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-center p-4 bg-[#05050A]/40 backdrop-blur-[2px] select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 font-mono text-xs tracking-widest uppercase animate-pulse">
            <Flame className="w-4 h-4 text-red-400" />
            <span>TERMINAL ORBITAL INSERTION</span>
          </div>

          <div className="text-9xl md:text-[14rem] font-mono font-black text-red-400 drop-shadow-[0_0_80px_rgba(239,68,68,0.8)] tracking-wider">
            T−{finalCountdownDigit.toString().padStart(2, '0')}
          </div>

          <div className="text-sm font-mono text-[#F3F2FA] tracking-[0.3em] uppercase font-bold">
            PREPARE FOR MISSION COMPLETE
          </div>
        </div>
      </div>
    )
  }

  // Final 60 Seconds Subtle Banner
  if (isFinalMinute) {
    return (
      <div className="fixed top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-500/60 text-red-300 font-mono text-xs tracking-widest uppercase backdrop-blur-md animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>FINAL ORBIT • CODE FREEZE IN PROGRESS</span>
        </div>
      </div>
    )
  }

  return null
}
