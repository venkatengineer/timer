import React, { useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  CircleDot,
  Pause,
  Play,
  LogOut,
  RotateCw,
} from 'lucide-react'
import type { MissionStatus } from '../../types/mission'

interface MissionHeaderProps {
  status: MissionStatus
  soundEnabled: boolean
  onToggleSound: () => void
  onTogglePause: () => void
  onOpenOrganizer: () => void
  onLogout?: () => void
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  status,
  soundEnabled,
  onToggleSound,
  onTogglePause,
  onOpenOrganizer,
  onLogout,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [telemetryTime, setTelemetryTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTelemetryTime(now.toUTCString().replace('GMT', 'UTC'))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'standby':
        return {
          text: 'MISSION STANDBY',
          bg: 'bg-[#8D8BA0]/15',
          border: 'border-[#8D8BA0]/30',
          dot: 'bg-[#8D8BA0]',
          color: 'text-[#8D8BA0]',
        }
      case 'launching':
        return {
          text: 'LAUNCHING',
          bg: 'bg-[#6DADEB]/15',
          border: 'border-[#6DADEB]/40',
          dot: 'bg-[#6DADEB] animate-ping',
          color: 'text-[#6DADEB]',
        }
      case 'active':
        return {
          text: 'ORBIT ACTIVE',
          bg: 'bg-[#A78BFA]/15',
          border: 'border-[#A78BFA]/40',
          dot: 'bg-[#A78BFA] animate-pulse',
          color: 'text-[#C4B5FD]',
        }
      case 'paused':
        return {
          text: 'TIMELINE FROZEN',
          bg: 'bg-[#FBBF24]/15',
          border: 'border-[#FBBF24]/40',
          dot: 'bg-[#FBBF24]',
          color: 'text-[#FBBF24]',
        }
      case 'completed':
        return {
          text: 'MISSION COMPLETE',
          bg: 'bg-[#34D399]/15',
          border: 'border-[#34D399]/40',
          dot: 'bg-[#34D399]',
          color: 'text-[#34D399]',
        }
    }
  }

  const badge = getStatusBadge()

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:px-8 md:py-4 pointer-events-auto border-b border-[#A78BFA]/10 bg-[#05050A]/60 backdrop-blur-md">
      {/* Space Agency Telemetry Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-[#100B20] border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA]">
          <CircleDot className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#F3F2FA] uppercase flex items-center space-x-2">
            <span>SEDS REC</span>
            <span className="text-[#8D8BA0] font-normal">•</span>
            <span className="text-[#A78BFA] font-medium">FLIGHT OPERATIONS</span>
          </div>
          <div className="text-[10px] font-mono text-[#8D8BA0] tracking-wider hidden sm:block">
            LUNAR CLOCK TELEMETRY MATRIX
          </div>
        </div>
      </div>

      {/* Center Status Badge & UTC Clock */}
      <div className="hidden lg:flex items-center space-x-4 font-mono text-xs">
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${badge.bg} ${badge.border} ${badge.color}`}
        >
          <div className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span className="font-semibold tracking-wider">{badge.text}</span>
        </div>

        <div className="text-[#8D8BA0] text-[11px] tracking-wider">
          {telemetryTime}
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center space-x-2">
        {/* Pause/Resume button for quick organizer control */}
        {(status === 'active' || status === 'paused') && (
          <button
            onClick={onTogglePause}
            className={`p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              status === 'paused'
                ? 'bg-[#FBBF24]/20 border-[#FBBF24] text-[#FBBF24]'
                : 'bg-[#100B20]/80 border-[#A78BFA]/30 text-[#C4B5FD] hover:border-[#A78BFA]'
            }`}
            title={status === 'paused' ? 'Resume Mission Clock' : 'Pause Mission Clock'}
          >
            {status === 'paused' ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-[#100B20]/90 border-[#A78BFA] text-[#C4B5FD]'
              : 'bg-[#100B20]/50 border-[#8D8BA0]/20 text-[#8D8BA0] hover:text-[#F3F2FA]'
          }`}
          title={soundEnabled ? 'Mute Audio [M]' : 'Enable Audio [M]'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-1 px-2.5 py-2 rounded-lg bg-[#100B20]/80 border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] text-xs font-mono transition-all cursor-pointer"
          title="Refresh Application"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">REFRESH</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-[#100B20]/80 border border-[#A78BFA]/30 hover:border-[#A78BFA] text-[#C4B5FD] text-xs font-mono transition-all cursor-pointer hidden sm:block"
          title="Toggle Fullscreen [F]"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>

        {/* Organizer Panel Button */}
        <button
          onClick={onOpenOrganizer}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#100B20] border border-[#A78BFA]/40 hover:border-[#A78BFA] text-[#F3F2FA] text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(167,139,250,0.15)]"
          title="Organizer Mission Controls [O]"
        >
          <Settings className="w-4 h-4 text-[#A78BFA]" />
          <span className="hidden md:inline">CONTROLS</span>
        </button>

        {/* Lock / Log Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-[#100B20]/80 border border-red-500/20 hover:border-red-500/50 text-[#8D8BA0] hover:text-red-400 text-xs font-mono transition-all cursor-pointer"
            title="Lock Console / Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}
