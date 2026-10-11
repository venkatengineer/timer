import React from 'react'
import type {
  MissionTimerState,
  MissionConfig,
} from '../../types/mission'
import {
  formatCountdown,
  formatElapsedTime,
  formatPercentage,
} from '../../utils/timeFormatters'

interface CountdownDisplayProps {
  timerState: MissionTimerState
  config: MissionConfig
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  timerState,
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
  const orbitPct = formatPercentage(elapsedFraction, 2)

  return (
    <div className="flex flex-col items-center text-center select-none pointer-events-auto">
      {/* Flight Operations Mission Subheader */}
      <div className="flex items-center space-x-2 text-xs font-mono tracking-[0.25em] text-[#8D8BA0] uppercase pb-1">
        <span>SEDS REC</span>
        <span>•</span>
        <span className="text-[#A78BFA]">LUNAR CLOCK</span>
      </div>

      <div className="text-[11px] md:text-xs font-mono tracking-[0.3em] text-[#6DADEB] uppercase font-semibold pb-3">
        TIME UNTIL MISSION COMPLETE
      </div>

      {/* Primary Giant Digital Countdown */}
      <div
        className={`font-mono font-extrabold tracking-tight transition-all duration-300 ${
          isFinalMinute
            ? 'text-red-400 drop-shadow-[0_0_35px_rgba(248,113,113,0.6)] animate-pulse'
            : 'text-[#F3F2FA] drop-shadow-[0_0_30px_rgba(167,139,250,0.35)]'
        }`}
      >
        <div className="flex items-baseline justify-center space-x-2 md:space-x-4">
          {parseInt(countdown.days, 10) > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl md:text-8xl tabular-nums">
                {countdown.days}
              </span>
              <span className="text-[10px] md:text-xs font-mono text-[#8D8BA0] tracking-widest uppercase pt-1">
                DAYS
              </span>
            </div>
          )}

          {parseInt(countdown.days, 10) > 0 && (
            <span className="text-3xl sm:text-5xl md:text-7xl text-[#8D8BA0]/40">:</span>
          )}

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl tabular-nums">
              {countdown.hours}
            </span>
            <span className="text-[10px] md:text-xs font-mono text-[#8D8BA0] tracking-widest uppercase pt-1">
              HOURS
            </span>
          </div>

          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#8D8BA0]/40">:</span>

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl tabular-nums">
              {countdown.minutes}
            </span>
            <span className="text-[10px] md:text-xs font-mono text-[#8D8BA0] tracking-widest uppercase pt-1">
              MINUTES
            </span>
          </div>

          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#8D8BA0]/40">:</span>

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl tabular-nums text-[#A78BFA]">
              {countdown.seconds}
            </span>
            <span className="text-[10px] md:text-xs font-mono text-[#8D8BA0] tracking-widest uppercase pt-1">
              SECONDS
            </span>
          </div>
        </div>
      </div>

      {/* Live Authoritative Telemetry Matrix */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-6 px-4 py-3 rounded-xl bg-[#100B20]/75 border border-[#A78BFA]/20 backdrop-blur-md max-w-xl w-full">
        <div className="text-left font-mono">
          <div className="text-[10px] text-[#8D8BA0] tracking-wider uppercase">
            ORBIT PROGRESS
          </div>
          <div className="text-sm sm:text-base font-bold text-[#A78BFA] tabular-nums">
            {orbitPct}
          </div>
        </div>

        <div className="text-center font-mono border-x border-[#A78BFA]/15 px-2">
          <div className="text-[10px] text-[#8D8BA0] tracking-wider uppercase">
            MISSION ELAPSED
          </div>
          <div className="text-sm sm:text-base font-medium text-[#F3F2FA] tabular-nums">
            {elapsedFormatted}
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-[#8D8BA0] tracking-wider uppercase">
            MISSION STATUS
          </div>
          <div
            className={`text-sm sm:text-base font-bold uppercase tracking-wider ${
              status === 'paused'
                ? 'text-[#FBBF24]'
                : isFinalMinute
                ? 'text-red-400'
                : 'text-[#34D399]'
            }`}
          >
            {isFinalMinute ? 'FINAL ORBIT' : status}
          </div>
        </div>
      </div>

      {/* Active Phase Badge */}
      {currentPhase && (
        <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#100B20]/60 border border-[#A78BFA]/20 text-[11px] font-mono text-[#C4B5FD] backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
          <span className="text-[#8D8BA0]">PHASE:</span>
          <span className="font-semibold text-[#F3F2FA]">{currentPhase.name}</span>
        </div>
      )}
    </div>
  )
}
