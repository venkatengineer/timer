import React, { useEffect } from 'react'
import { Sparkles, X, Orbit } from 'lucide-react'
import type { MissionMilestone } from '../../types/mission'

interface MilestoneToastProps {
  milestone: MissionMilestone | null
  onDismiss: () => void
  onPlayChime: () => void
}

export const MilestoneToast: React.FC<MilestoneToastProps> = ({
  milestone,
  onDismiss,
  onPlayChime,
}) => {
  useEffect(() => {
    if (milestone) {
      onPlayChime()
      const timer = setTimeout(() => {
        onDismiss()
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [milestone, onDismiss, onPlayChime])

  if (!milestone) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl bg-[#100B20]/95 border border-[#A78BFA] shadow-[0_0_30px_rgba(167,139,250,0.35)] backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 text-[#A78BFA]">
          <Orbit className="w-4 h-4 animate-spin" />
          <span className="text-[11px] font-mono tracking-widest uppercase font-bold">
            ORBITAL MILESTONE REACHED
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#8D8BA0] hover:text-[#F3F2FA] transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-mono font-bold text-[#F3F2FA] tracking-wide">
          {milestone.label}
        </h4>
        <p className="text-xs font-sans text-[#8D8BA0] pt-1 leading-relaxed">
          {milestone.description}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-[#A78BFA]/15 flex items-center justify-between text-[10px] font-mono text-[#A78BFA]">
        <span>CHECKPOINT VERIFIED</span>
        <span className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-[#6DADEB]" />
          <span>{Math.round(milestone.targetFraction * 100)}% ORBIT</span>
        </span>
      </div>
    </div>
  )
}
