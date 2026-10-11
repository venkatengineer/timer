import type { HackathonPhase } from '../../types/mission'
import { formatCountdown, formatPercentage } from '../../utils/timeFormatters'

interface PhaseTimelineProps {
  elapsedFraction: number
  elapsedSeconds: number
  remainingSeconds: number
  phases: HackathonPhase[]
  currentPhase: HackathonPhase | null
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  elapsedFraction,
  elapsedSeconds,
  remainingSeconds,
  phases,
  currentPhase,
}) => {
  const elapsed = formatCountdown(elapsedSeconds)
  const remaining = formatCountdown(remainingSeconds)
  const pct = formatPercentage(elapsedFraction, 1)

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-xl bg-[#100B20]/60 border border-[#A78BFA]/20 backdrop-blur-md select-none pointer-events-auto">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono pb-3 border-b border-[#A78BFA]/10 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-[#8D8BA0] uppercase">ORBIT COMPLETION:</span>
          <span className="font-bold text-[#A78BFA] text-sm tabular-nums">{pct}</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-[#8D8BA0]">
          <div>
            <span>ELAPSED: </span>
            <span className="text-[#F3F2FA] font-medium">
              {elapsed.hours}H {elapsed.minutes}M
            </span>
          </div>
          <span className="text-[#8D8BA0]/30">•</span>
          <div>
            <span>REMAINING: </span>
            <span className="text-[#6DADEB] font-medium">
              {remaining.hours}H {remaining.minutes}M
            </span>
          </div>
        </div>
      </div>

      {/* 360-Degree Continuous Orbital Progress Track */}
      <div className="relative pt-4 pb-2">
        {/* Track Bar */}
        <div className="relative h-2 w-full rounded-full bg-[#05050A] border border-[#A78BFA]/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6DADEB] via-[#A78BFA] to-[#C4B5FD] transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, elapsedFraction * 100)}%` }}
          />
        </div>

        {/* Milestone Tick Marks: 00h, 06h, 12h, 18h, 24h */}
        <div className="relative w-full flex justify-between pt-2 text-[10px] font-mono text-[#8D8BA0]">
          {[
            { label: '00H', pct: '0%' },
            { label: '06H (Q1)', pct: '25%' },
            { label: '12H (MID)', pct: '50%' },
            { label: '18H (Q3)', pct: '75%' },
            { label: '24H (COMPL)', pct: '100%' },
          ].map((mark, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-0.5 h-1.5 bg-[#A78BFA]/40 mb-1" />
              <span className="tracking-wider">{mark.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hackathon Phases Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-[#A78BFA]/10">
        {phases.map((phase) => {
          const isCurrent = currentPhase?.id === phase.id
          const isPassed = elapsedFraction >= phase.endFraction

          return (
            <div
              key={phase.id}
              className={`p-2 rounded-lg border text-left font-mono transition-all duration-300 ${
                isCurrent
                  ? 'bg-[#A78BFA]/15 border-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.15)]'
                  : isPassed
                  ? 'bg-[#05050A]/40 border-[#A78BFA]/10 opacity-70'
                  : 'bg-[#05050A]/20 border-white/5 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-[#8D8BA0] pb-1">
                <span className="truncate">{phase.id.replace('phase-', '').toUpperCase()}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-ping" />
                )}
              </div>
              <div
                className={`text-[11px] font-semibold truncate ${
                  isCurrent ? 'text-[#F3F2FA]' : 'text-[#8D8BA0]'
                }`}
              >
                {phase.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
