import React, { useState } from 'react'
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  Info,
  Clock,
} from 'lucide-react'
import type { MissionConfig, MissionTimerState } from '../../types/mission'

interface OrganizerModalProps {
  isOpen: boolean
  onClose: () => void
  config: MissionConfig
  onUpdateConfig: (newConfig: Partial<MissionConfig>) => void
  timerState: MissionTimerState
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onAddTime: (seconds: number) => void
  onSubtractTime: (seconds: number) => void
  onReset: () => void
  onScrubFraction: (fraction: number | null) => void
}

export const OrganizerModal: React.FC<OrganizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  timerState,
  onStart,
  onPause,
  onResume,
  onAddTime,
  onSubtractTime,
  onReset,
  onScrubFraction,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [tempMissionName, setTempMissionName] = useState(config.missionName)
  const [tempDurationHours, setTempDurationHours] = useState(
    Math.round((config.totalDurationSeconds / 3600) * 10) / 10
  )
  const [activeTab, setActiveTab] = useState<'controls' | 'simulation' | 'config'>('controls')

  if (!isOpen) return null

  const handleSaveConfig = () => {
    onUpdateConfig({
      missionName: tempMissionName,
      totalDurationSeconds: Math.max(60, tempDurationHours * 3600),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05050A]/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="max-w-2xl w-full max-h-[90vh] flex flex-col rounded-2xl bg-[#100B20] border border-[#A78BFA]/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#A78BFA]/20 bg-[#05050A]/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-[#F3F2FA] tracking-wide uppercase">
                FLIGHT OPERATIONS • ORGANIZER CONSOLE
              </h3>
              <p className="text-xs font-mono text-[#8D8BA0]">
                Authoritative mission clock control & telemetry parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8D8BA0] hover:text-[#F3F2FA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#A78BFA]/15 bg-[#05050A]/20 px-5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'controls'
                ? 'border-[#A78BFA] text-[#F3F2FA]'
                : 'border-transparent text-[#8D8BA0] hover:text-[#F3F2FA]'
            }`}
          >
            ACTIVE CONTROLS
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'simulation'
                ? 'border-[#A78BFA] text-[#F3F2FA]'
                : 'border-transparent text-[#8D8BA0] hover:text-[#F3F2FA]'
            }`}
          >
            TIMELINE SCRUB & SIMULATION
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-[#A78BFA] text-[#F3F2FA]'
                : 'border-transparent text-[#8D8BA0] hover:text-[#F3F2FA]'
            }`}
          >
            MISSION CONFIGURATION
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm font-mono">
          {/* TAB 1: ACTIVE CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Mission State Controls */}
              <div className="p-4 rounded-xl bg-[#05050A]/50 border border-[#A78BFA]/20 space-y-4">
                <div className="text-xs text-[#8D8BA0] uppercase tracking-wider">
                  MISSION TIMELINE STATE: <span className="text-[#A78BFA] font-bold">{timerState.status.toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timerState.status === 'standby' && (
                    <button
                      onClick={() => {
                        onStart()
                        onClose()
                      }}
                      className="flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#05050A] font-bold transition-all cursor-pointer shadow-[0_0_20px_rgba(167,139,250,0.3)]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>START NOW</span>
                    </button>
                  )}

                  {timerState.status === 'active' && (
                    <button
                      onClick={onPause}
                      className="flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24] hover:bg-[#FBBF24]/30 text-[#FBBF24] font-bold transition-all cursor-pointer"
                    >
                      <Pause className="w-4 h-4" />
                      <span>PAUSE CLOCK</span>
                    </button>
                  )}

                  {timerState.status === 'paused' && (
                    <button
                      onClick={onResume}
                      className="flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#34D399]/20 border border-[#34D399] hover:bg-[#34D399]/30 text-[#34D399] font-bold transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>RESUME CLOCK</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center justify-center space-x-2 py-3 rounded-lg border border-red-500/30 hover:border-red-500 text-red-400 hover:bg-red-950/30 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RESET MISSION</span>
                  </button>
                </div>
              </div>

              {/* Adjust Deadline / Add Time */}
              <div className="p-4 rounded-xl bg-[#05050A]/50 border border-[#A78BFA]/20 space-y-3">
                <div className="text-xs text-[#8D8BA0] uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#6DADEB]" />
                  <span>EXTEND OR SHORTEN COUNTDOWN DEADLINE</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => onAddTime(300)}
                    className="p-2.5 rounded-lg border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+5 MIN</span>
                  </button>
                  <button
                    onClick={() => onAddTime(900)}
                    className="p-2.5 rounded-lg border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+15 MIN</span>
                  </button>
                  <button
                    onClick={() => onAddTime(3600)}
                    className="p-2.5 rounded-lg border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+1 HOUR</span>
                  </button>
                  <button
                    onClick={() => onSubtractTime(900)}
                    className="p-2.5 rounded-lg border border-[#8D8BA0]/30 hover:border-red-400 text-[#8D8BA0] hover:text-red-400 flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                    <span>-15 MIN</span>
                  </button>
                </div>
              </div>

              {/* Quick Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#05050A]/50 border border-[#A78BFA]/20 flex items-center justify-between">
                  <span className="text-[#8D8BA0]">AUDIO SYNTHESIZER:</span>
                  <button
                    onClick={() => onUpdateConfig({ soundEnabled: !config.soundEnabled })}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border cursor-pointer ${
                      config.soundEnabled
                        ? 'border-[#A78BFA] text-[#C4B5FD] bg-[#A78BFA]/10'
                        : 'border-[#8D8BA0]/20 text-[#8D8BA0]'
                    }`}
                  >
                    {config.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{config.soundEnabled ? 'ENABLED' : 'MUTED'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#05050A]/50 border border-[#A78BFA]/20 flex items-center justify-between">
                  <span className="text-[#8D8BA0]">REDUCED MOTION:</span>
                  <button
                    onClick={() => onUpdateConfig({ reducedMotion: !config.reducedMotion })}
                    className={`px-3 py-1.5 rounded border cursor-pointer ${
                      config.reducedMotion
                        ? 'border-[#A78BFA] text-[#C4B5FD] bg-[#A78BFA]/10'
                        : 'border-[#8D8BA0]/20 text-[#8D8BA0]'
                    }`}
                  >
                    {config.reducedMotion ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE SCRUB & SIMULATION */}
          {activeTab === 'simulation' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#05050A]/60 border border-[#A78BFA]/20 space-y-3">
                <div className="flex items-center space-x-2 text-[#A78BFA]">
                  <Sparkles className="w-4 h-4 text-[#6DADEB]" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    FLIGHT REHEARSAL & SCRUB ENGINE
                  </span>
                </div>
                <p className="text-xs text-[#8D8BA0] font-sans leading-relaxed">
                  Scrub the orbital timeline to verify milestones, test phase transitions,
                  or inspect the final 60-second and 10-second sequences. Click "Return to Live" to restore normal clock operation.
                </p>

                {/* Jump presets */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <button
                    onClick={() => onScrubFraction(0.0)}
                    className="p-2 rounded border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] cursor-pointer"
                  >
                    LAUNCH (0h / 0%)
                  </button>
                  <button
                    onClick={() => onScrubFraction(0.25)}
                    className="p-2 rounded border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] cursor-pointer"
                  >
                    Q1 (6h / 25%)
                  </button>
                  <button
                    onClick={() => onScrubFraction(0.5)}
                    className="p-2 rounded border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] cursor-pointer"
                  >
                    HALF ORBIT (12h / 50%)
                  </button>
                  <button
                    onClick={() => onScrubFraction(0.75)}
                    className="p-2 rounded border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] cursor-pointer"
                  >
                    Q3 (18h / 75%)
                  </button>
                  <button
                    onClick={() => onScrubFraction((config.totalDurationSeconds - 55) / config.totalDurationSeconds)}
                    className="p-2 rounded border border-red-500/40 hover:border-red-500 text-red-300 cursor-pointer"
                  >
                    FINAL 60 SECONDS
                  </button>
                  <button
                    onClick={() => onScrubFraction((config.totalDurationSeconds - 9) / config.totalDurationSeconds)}
                    className="p-2 rounded border border-red-500/60 hover:border-red-500 text-red-400 font-bold cursor-pointer"
                  >
                    FINAL 10 SECONDS
                  </button>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#A78BFA]/10">
                  <button
                    onClick={() => onScrubFraction(null)}
                    className="px-4 py-2 rounded-lg bg-[#6DADEB]/20 border border-[#6DADEB] text-[#6DADEB] hover:bg-[#6DADEB]/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    RETURN TO AUTHORITATIVE LIVE TIME
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MISSION CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#8D8BA0] uppercase">HACKATHON DESIGNATION</label>
                <input
                  type="text"
                  value={tempMissionName}
                  onChange={(e) => setTempMissionName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 focus:border-[#A78BFA] text-[#F3F2FA] text-xs font-mono outline-none"
                  placeholder="e.g. SEDS REC HACKATHON 2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8D8BA0] uppercase">
                  EVENT DURATION (HOURS FOR 1 COMPLETE 360° ORBIT)
                </label>
                <input
                  type="number"
                  min="0.05"
                  step="0.5"
                  value={tempDurationHours}
                  onChange={(e) => setTempDurationHours(parseFloat(e.target.value) || 24)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#05050A] border border-[#A78BFA]/30 focus:border-[#A78BFA] text-[#F3F2FA] text-xs font-mono outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#05050A] text-xs font-bold transition-all cursor-pointer"
                >
                  SAVE PARAMETERS
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#05050A]/40 border border-[#8D8BA0]/20 text-[11px] text-[#8D8BA0] flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#6DADEB] shrink-0 mt-0.5" />
                <span>
                  Notice: State is persisted locally via browser LocalStorage. Multiple browser windows on different machines will run from their respective system clocks.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#A78BFA]/15 bg-[#05050A]/50 flex items-center justify-between text-xs text-[#8D8BA0]">
          <div>SEDS REC TELEMETRY PROTOCOL V2.4</div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#F3F2FA] text-xs transition-colors cursor-pointer"
          >
            DISMISS CONSOLE
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#05050A]/90 backdrop-blur-md">
            <div className="max-w-md w-full p-6 rounded-2xl bg-[#100B20] border border-red-500/50 space-y-4">
              <div className="flex items-center space-x-3 text-red-400">
                <ShieldAlert className="w-6 h-6" />
                <h4 className="text-base font-bold uppercase">CONFIRM MISSION RESET</h4>
              </div>

              <p className="text-xs text-[#8D8BA0] font-sans leading-relaxed">
                Resetting the mission will terminate the current hackathon clock, reset the Moon
                back to the starting orbital position, and clear all logged milestones.
                This action cannot be undone.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-[#8D8BA0]/30 text-[#8D8BA0] hover:text-[#F3F2FA] text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false)
                    onReset()
                    onClose()
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  CONFIRM RESET
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
