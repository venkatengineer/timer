import React, { useState, useCallback } from 'react'
import { SpaceScene } from './components/3d/SpaceScene'
import { StandbyScreen } from './components/ui/StandbyScreen'
import { MissionHeader } from './components/ui/MissionHeader'
import { MissionCockpit } from './components/ui/MissionCockpit'
import { FinalMinuteOverlay } from './components/ui/FinalMinuteOverlay'
import { MilestoneToast } from './components/ui/MilestoneToast'
import { OrganizerModal } from './components/ui/OrganizerModal'
import { ManualTimerModal } from './components/ui/ManualTimerModal'
import { LoginScreen } from './components/ui/LoginScreen'
import { useMissionTimer } from './hooks/useMissionTimer'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { MissionConfig } from './types/mission'
import {
  DEFAULT_ORBITAL_RADIUS,
  DEFAULT_ORBITAL_INCLINATION,
  DEFAULT_INITIAL_ANGLE,
} from './utils/orbitalMechanics'

const DEFAULT_CONFIG: MissionConfig = {
  missionName: 'SEDS REC HACKATHON 2026',
  tagline: 'ONE PLANET. ONE MISSION. 24 HOURS.',
  totalDurationSeconds: 86400, // 24 hours
  initialOrbitalAngle: DEFAULT_INITIAL_ANGLE,
  orbitalRadius: DEFAULT_ORBITAL_RADIUS,
  orbitalInclination: DEFAULT_ORBITAL_INCLINATION,
  soundEnabled: true,
  skipLaunchSequence: true,
  reducedMotion: false,
  visualQuality: 'high',
}

const AUTH_STORAGE_KEY = 'seds_lunar_clock_auth_state_v1'

export const App: React.FC = () => {
  const [config, setConfig] = useState<MissionConfig>(DEFAULT_CONFIG)
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false)
  const [isManualTimerOpen, setIsManualTimerOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'granted'
    } catch {
      return false
    }
  })

  // Web Audio sound synthesizer
  const sounds = useSoundEffects(config.soundEnabled)

  // Authoritative mission countdown engine
  const {
    timerState,
    startMission,
    pauseMission,
    resumeMission,
    addTime,
    subtractTime,
    resetMission,
    scrubFraction,
    clearActiveMilestone,
    setManualTimer,
    phases,
  } = useMissionTimer(config)

  // Direct Mission Start Handler (No launch sequence delay)
  const handleInitiateMission = useCallback(() => {
    sounds.initAudio()
    sounds.playMissionActive()
    startMission()
  }, [sounds, startMission])

  // Manual Timer Setting: "Later play it goes to main screen"
  const handleSetAndPlayManualTimer = useCallback((seconds: number) => {
    sounds.initAudio()
    sounds.playMissionActive()
    setConfig((prev) => ({ ...prev, totalDurationSeconds: seconds }))
    setManualTimer(seconds, true)
    setIsAuthenticated(true)
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'granted')
    } catch {
      // storage unavailable
    }
    setIsManualTimerOpen(false)
  }, [sounds, setManualTimer])

  const handleSetAndPauseManualTimer = useCallback((seconds: number) => {
    sounds.initAudio()
    setConfig((prev) => ({ ...prev, totalDurationSeconds: seconds }))
    setManualTimer(seconds, false)
    setIsAuthenticated(true)
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'granted')
    } catch {
      // storage unavailable
    }
    setIsManualTimerOpen(false)
  }, [sounds, setManualTimer])

  const handleTogglePause = useCallback(() => {
    if (timerState.status === 'active') {
      pauseMission()
      sounds.playBeep(440, 0.1)
    } else if (timerState.status === 'paused') {
      resumeMission()
      sounds.playBeep(880, 0.1)
    }
  }, [timerState.status, pauseMission, resumeMission, sounds])

  const handleToggleSound = useCallback(() => {
    setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }, [])

  const handleToggleOrganizer = useCallback(() => {
    setIsOrganizerOpen((prev) => !prev)
  }, [])

  const handleUpdateConfig = useCallback((newConfig: Partial<MissionConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'granted')
    } catch {
      // storage unavailable
    }
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // storage unavailable
    }
  }, [])

  // Keyboard shortcuts (O, M, Space, F, and Ctrl+A / Cmd+A)
  useKeyboardShortcuts({
    onToggleOrganizer: handleToggleOrganizer,
    onToggleSound: handleToggleSound,
    onTogglePause: handleTogglePause,
    onOpenManualTimer: () => setIsManualTimerOpen(true),
  })

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05050A]">
      {/* Security Clearance Gate */}
      {!isAuthenticated && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onPlayBeep={sounds.playBeep}
          onPlaySuccess={sounds.playMissionActive}
        />
      )}

      {/* 3D Celestial WebGL Canvas: Earth, Moon on Orbit, Stars */}
      <SpaceScene
        status={timerState.status}
        orbitalAngle={timerState.orbitalAngle}
        elapsedFraction={timerState.elapsedFraction}
        orbitalRadius={config.orbitalRadius}
        orbitalInclination={config.orbitalInclination}
        isFinalMinute={timerState.isFinalMinute}
        reducedMotion={config.reducedMotion}
      />

      {/* EXPERIENCE A: Mission Standby Screen */}
      {timerState.status === 'standby' && (
        <StandbyScreen
          config={config}
          onInitiateMission={handleInitiateMission}
          onOpenOrganizer={() => setIsOrganizerOpen(true)}
          onOpenManualTimer={() => setIsManualTimerOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* EXPERIENCE C: Main Earth-Moon Countdown & Flight Operations */}
      {(timerState.status === 'active' ||
        timerState.status === 'paused' ||
        timerState.status === 'completed') && (
        <>
          {/* Top Mission Header */}
          <MissionHeader
            status={timerState.status}
            soundEnabled={config.soundEnabled}
            onToggleSound={handleToggleSound}
            onTogglePause={handleTogglePause}
            onOpenOrganizer={() => setIsOrganizerOpen(true)}
            onOpenManualTimer={() => setIsManualTimerOpen(true)}
            onLogout={handleLogout}
          />

          {/* Integrated Cinematic HUD floating in deep space negative space */}
          <MissionCockpit
            timerState={timerState}
            phases={phases}
          />

          {/* Final 60-Second and 10-Second Terminal Overlay */}
          <FinalMinuteOverlay
            status={timerState.status}
            remainingSeconds={timerState.remainingSeconds}
            isFinalMinute={timerState.isFinalMinute}
            isFinalTenSeconds={timerState.isFinalTenSeconds}
            finalCountdownDigit={timerState.finalCountdownDigit}
            sounds={sounds}
          />

          {/* Milestone Toast Slide-in */}
          <MilestoneToast
            milestone={timerState.activeMilestone}
            onDismiss={clearActiveMilestone}
            onPlayChime={sounds.playMilestoneChime}
          />
        </>
      )}

      {/* Manual Timer Modal (Triggered by Ctrl+A or Header Button) */}
      <ManualTimerModal
        isOpen={isManualTimerOpen}
        onClose={() => setIsManualTimerOpen(false)}
        onSetAndPlay={handleSetAndPlayManualTimer}
        onSetAndPause={handleSetAndPauseManualTimer}
        initialSeconds={timerState.remainingSeconds || config.totalDurationSeconds}
      />

      {/* Organizer Control Panel Modal */}
      <OrganizerModal
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        timerState={timerState}
        onStart={startMission}
        onPause={pauseMission}
        onResume={resumeMission}
        onAddTime={addTime}
        onSubtractTime={subtractTime}
        onReset={resetMission}
        onScrubFraction={scrubFraction}
      />
    </main>
  )
}

export default App
