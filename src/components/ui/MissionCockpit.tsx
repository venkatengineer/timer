import React from 'react'
import type { MissionTimerState, HackathonPhase } from '../../types/mission'
import {
  formatCountdown,
  formatElapsedTime,
  formatPercentage,
} from '../../utils/timeFormatters'
import { Orbit, Activity } from 'lucide-react'

interface MissionCockpitProps {
  timerState: MissionTimerState
  phases?: HackathonPhase[]
}

export const MissionCockpit: React.FC<MissionCockpitProps> = ({
  timerState,
  phases = [],
}) => {
  const {
    status,
    remainingSeconds,
    elapsedSeconds,
    elapsedFraction,
    currentPhase,
    isFinalMinute,
  } = timerState

  const countdown = formatCountdown(remainingSeconds)
  const elapsedFormatted = formatElapsedTime(elapsedSeconds)
  const orbitPct = formatPercentage(elapsedFraction, 1)

  // Current quadrant (Q1: 0-6h, Q2: 6-12h, Q3: 12-18h, Q4: 18-24h)
  const quadrant = Math.min(4, Math.floor(elapsedFraction * 4) + 1)

  return (
    <div className="absolute inset-x-0 bottom-6 sm:bottom-10 z-20 pointer-events-none select-none flex flex-col items-center justify-center px-4">
      {/* Cinematic HUD Container — Seamlessly integrated into deep space negative space with zero heavy footer card */}
      <div className="flex flex-col items-center text-center space-y-3 pointer-events-auto">
        
        {/* 1. Header Telemetry Line: Mission Identity & Current Hackathon Phase */}
        <div className="flex items-center space-x-3 text-xs font-mono tracking-widest uppercase">
          <div className="flex items-center space-x-1.5 text-[#A78BFA]">
            <Orbit className="w-3.5 h-3.5 animate-spin" />
            <span className="font-semibold">{currentPhase ? currentPhase.name : 'MISSION ORBIT'}</span>
          </div>
          <span className="text-[#8D8BA0]/50">•</span>
          <span className="text-[#6DADEB] font-medium tracking-wider">
            QUADRANT 0{quadrant} // 24H ORBIT
          </span>
        </div>

        {/* 2. Primary Authoritative Mission Countdown */}
        <div
          className={`flex items-baseline space-x-2 sm:space-x-4 font-mono font-extrabold tracking-tight tabular-nums transition-colors duration-300 ${
            isFinalMinute
              ? 'text-red-400 drop-shadow-[0_0_35px_rgba(248,113,113,0.8)] animate-pulse'
              : 'text-[#F3F2FA] drop-shadow-[0_0_25px_rgba(167,139,250,0.3)]'
          }`}
        >
          {parseInt(countdown.days, 10) > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span className="text-5xl sm:text-7xl md:text-8xl">{countdown.days}</span>
                <span className="text-[10px] sm:text-xs text-[#8D8BA0] font-normal tracking-[0.25em] pt-1">
                  DAYS
                </span>
              </div>
              <span className="text-3xl sm:text-5xl md:text-6xl text-[#8D8BA0]/40">:</span>
            </>
          )}

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl md:text-8xl">{countdown.hours}</span>
            <span className="text-[10px] sm:text-xs text-[#8D8BA0] font-normal tracking-[0.25em] pt-1">
              HOURS
            </span>
          </div>

          <span className="text-3xl sm:text-5xl md:text-6xl text-[#8D8BA0]/40">:</span>

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl md:text-8xl">{countdown.minutes}</span>
            <span className="text-[10px] sm:text-xs text-[#8D8BA0] font-normal tracking-[0.25em] pt-1">
              MINS
            </span>
          </div>

          <span className="text-3xl sm:text-5xl md:text-6xl text-[#8D8BA0]/40">:</span>

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl md:text-8xl text-[#A78BFA]">
              {countdown.seconds}
            </span>
            <span className="text-[10px] sm:text-xs text-[#8D8BA0] font-normal tracking-[0.25em] pt-1">
              SECS
            </span>
          </div>
        </div>

        {/* 3. Orbital Progress Bridge — Directly connects the countdown to the Moon's 3D orbit */}
        <div className="flex flex-col items-center space-y-2 pt-1 max-w-md w-full">
          <div className="flex items-center justify-between w-full text-xs font-mono">
            <span className="text-[#C4B5FD] font-semibold tracking-wider">
              ORBIT {orbitPct} COMPLETE
            </span>
            <span className="text-[#8D8BA0] tabular-nums text-[11px]">
              ELAPSED: {elapsedFormatted}
            </span>
          </div>

          {/* Micro Orbit Track with the 4 Milestone Checkpoints */}
          <div className="relative w-full h-1 rounded-full bg-[#100B20] border border-[#A78BFA]/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6DADEB] via-[#A78BFA] to-[#C4B5FD] transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, elapsedFraction * 100)}%` }}
            />
          </div>

          {/* Quadrant & Phase Milestones */}
          <div className="flex justify-between w-full text-[10px] font-mono text-[#8D8BA0]/80">
            {phases && phases.length > 0 ? (
              phases.map((p) => {
                const isCurrent = currentPhase?.id === p.id
                return (
                  <span
                    key={p.id}
                    className={isCurrent ? 'text-[#C4B5FD] font-semibold' : ''}
                  >
                    {p.name.length > 12 ? p.name.slice(0, 10) + '..' : p.name}
                  </span>
                )
              })
            ) : (
              <>
                <span className={elapsedFraction >= 0 ? 'text-[#C4B5FD] font-medium' : ''}>
                  00H LAUNCH
                </span>
                <span className={elapsedFraction >= 0.25 ? 'text-[#C4B5FD] font-medium' : ''}>
                  06H Q1
                </span>
                <span className={elapsedFraction >= 0.5 ? 'text-[#C4B5FD] font-medium' : ''}>
                  12H MID
                </span>
                <span className={elapsedFraction >= 0.75 ? 'text-[#C4B5FD] font-medium' : ''}>
                  18H Q3
                </span>
                <span className={elapsedFraction >= 1 ? 'text-[#C4B5FD] font-medium' : ''}>
                  24H COMPL
                </span>
              </>
            )}
          </div>
        </div>

        {/* 4. Live Flight Operations Status Pill */}
        <div className="pt-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#100B20]/60 border border-[#A78BFA]/20 backdrop-blur-sm text-[11px] font-mono">
            <Activity className="w-3 h-3 text-[#34D399]" />
            <span className="text-[#8D8BA0] uppercase">STATUS:</span>
            <span
              className={`font-semibold tracking-wider ${
                status === 'paused'
                  ? 'text-[#FBBF24]'
                  : isFinalMinute
                  ? 'text-red-400'
                  : 'text-[#34D399]'
              }`}
            >
              {isFinalMinute ? 'FINAL ORBIT' : status.toUpperCase()}
            </span>
            <span className="text-[#8D8BA0]/40">•</span>
            <span className="text-[#8D8BA0]">INCLINATION: 23.5°</span>
          </div>
        </div>

      </div>
    </div>
  )
}
