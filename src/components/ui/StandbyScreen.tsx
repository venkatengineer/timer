import React, { useState } from 'react'
import { Rocket, Settings, ShieldAlert, Sparkles, Clock, Globe, RotateCw } from 'lucide-react'
import type { MissionConfig } from '../../types/mission'
import { formatCountdown } from '../../utils/timeFormatters'

interface StandbyScreenProps {
  config: MissionConfig
  onInitiateMission: () => void
  onOpenOrganizer: () => void
  onOpenManualTimer?: () => void
  onLogout?: () => void
}

export const StandbyScreen: React.FC<StandbyScreenProps> = ({
  config,
  onInitiateMission,
  onOpenOrganizer,
  onOpenManualTimer,
  onLogout,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const duration = formatCountdown(config.totalDurationSeconds)

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-20">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-pulse" />
          <div className="text-xs font-mono tracking-widest text-[#A78BFA] uppercase">
            SEDS REC • FLIGHT READINESS STANDBY
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Custom Timer [Ctrl+A] Button */}
          {onOpenManualTimer && (
            <button
              onClick={onOpenManualTimer}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#100B20]/80 border border-[#A78BFA]/40 hover:border-[#A78BFA] text-[#C4B5FD] text-xs font-mono transition-all backdrop-blur-md cursor-pointer"
              title="Set Custom Timer [Ctrl+A]"
            >
              <Clock className="w-3.5 h-3.5 text-[#6DADEB]" />
              <span className="hidden sm:inline">SET TIMER</span>
              <span className="text-[10px] bg-[#A78BFA]/20 px-1 py-0.2 rounded text-[#A78BFA]">^A</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#100B20]/80 border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] text-xs font-mono transition-all backdrop-blur-md cursor-pointer"
            title="Refresh Application"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>

          <button
            onClick={onOpenOrganizer}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-[#100B20]/80 border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] text-xs font-mono transition-all backdrop-blur-md cursor-pointer"
            title="Open Flight Operations Control (Press 'O')"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>MISSION CONTROLS [O]</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#100B20]/80 border border-red-500/20 hover:border-red-500/50 text-[#8D8BA0] hover:text-red-400 text-xs font-mono transition-all backdrop-blur-md cursor-pointer"
              title="Lock Console / Sign Out"
            >
              <span>LOCK</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Mission Hero Briefing */}
      <div className="max-w-2xl mx-auto text-center pointer-events-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#100B20]/60 border border-[#A78BFA]/20 text-[#A78BFA] text-xs font-mono tracking-wider backdrop-blur-sm">
          <Globe className="w-3.5 h-3.5 text-[#6DADEB]" />
          <span>MISSION TARGET: 360° SYNCHRONIZED ORBIT</span>
        </div>

        <div className="space-y-2">
          <div className="text-xs md:text-sm font-mono tracking-[0.3em] text-[#8D8BA0] uppercase">
            SEDS REC PRESENTS
          </div>
          <h1 className="text-5xl md:text-7xl font-sans font-light tracking-tight text-[#F3F2FA] uppercase">
            LUNAR <span className="font-semibold text-[#A78BFA]">CLOCK</span>
          </h1>
          <p className="text-base md:text-lg font-mono text-[#8D8BA0] tracking-widest pt-2">
            ONE PLANET. ONE MISSION. 24 HOURS.
          </p>
        </div>

        {/* Hackathon Specs Card */}
        <div className="p-4 md:p-6 rounded-xl bg-[#100B20]/70 border border-[#A78BFA]/20 backdrop-blur-md text-left space-y-4">
          <div className="flex items-center justify-between border-b border-[#A78BFA]/10 pb-3">
            <span className="text-xs font-mono text-[#8D8BA0]">EVENT DESIGNATION</span>
            <span className="text-sm font-mono font-medium text-[#F3F2FA]">
              {config.missionName}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-[#A78BFA]/10 pb-3">
            <span className="text-xs font-mono text-[#8D8BA0]">EVENT DURATION</span>
            <span className="text-sm font-mono font-semibold text-[#6DADEB] flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{duration.formattedHHMMSS} (1 COMPLETE ORBIT)</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8D8BA0]">SYNCHRONIZATION</span>
            <span className="text-xs font-mono text-[#A78BFA] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% REALTIME ACCELERATED TRAJECTORY</span>
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="group relative inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#6DADEB] text-[#05050A] font-sans font-semibold tracking-wider hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_0_35px_rgba(167,139,250,0.35)] cursor-pointer"
          >
            <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="text-base uppercase tracking-widest">INITIATE MISSION</span>
          </button>
          <div className="text-[11px] font-mono text-[#8D8BA0] pt-2.5">
            Mission clock remains paused until launch sequence confirmation.
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-[#8D8BA0]/70 pt-6 border-t border-[#A78BFA]/10 pointer-events-auto">
        <div>ORBITAL MECHANICS ENGINE: ACTIVE (TILT 23.5°)</div>
        <div className="mt-2 md:mt-0">SEDS REC SPACE OPERATIONS • MISSION CONTROL</div>
      </div>

      {/* Mission Start Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05050A]/85 backdrop-blur-lg pointer-events-auto">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#100B20] border border-[#A78BFA]/40 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-[#A78BFA]">
              <ShieldAlert className="w-6 h-6 text-[#6DADEB]" />
              <h3 className="text-lg font-mono font-bold tracking-wide uppercase text-[#F3F2FA]">
                CONFIRM MISSION START
              </h3>
            </div>

            <p className="text-sm text-[#8D8BA0] font-sans leading-relaxed">
              Initiating the mission will immediately start the authoritative <span className="text-[#F3F2FA] font-mono font-medium">24-hour hackathon countdown</span> and synchronized lunar orbital timeline.
            </p>

            <div className="p-3 rounded-lg bg-[#05050A]/60 border border-[#A78BFA]/20 text-xs font-mono text-[#C4B5FD] space-y-1">
              <div>• Clock starts immediately at 24:00:00</div>
              <div>• Moon begins real-time synchronized orbit</div>
              <div>• Flight operations HUD becomes active</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-lg border border-[#8D8BA0]/30 hover:border-[#8D8BA0] text-[#8D8BA0] hover:text-[#F3F2FA] text-xs font-mono transition-all cursor-pointer"
              >
                ABORT / RETURN
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  onInitiateMission()
                }}
                className="px-5 py-2.5 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#05050A] text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(167,139,250,0.4)]"
              >
                START MISSION NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
