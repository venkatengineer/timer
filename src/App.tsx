import React, { useState, useCallback } from 'react'
import { SpaceScene } from './components/3d/SpaceScene'
import { StandbyScreen } from './components/ui/StandbyScreen'
import { LaunchOverlay } from './components/ui/LaunchOverlay'
import { MissionHeader } from './components/ui/MissionHeader'
import { MissionCockpit } from './components/ui/MissionCockpit'
import { FinalMinuteOverlay } from './components/ui/FinalMinuteOverlay'
import { MilestoneToast } from './components/ui/MilestoneToast'
import { OrganizerModal } from './components/ui/OrganizerModal'
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
  skipLaunchSequence: false,
  reducedMotion: false,
  visualQuality: 'high',
}

const AUTH_STORAGE_KEY = 'seds_lunar_clock_auth_state_v1'

export const App: React.FC = () => {
  const [config, setConfig] = useState<MissionConfig>(DEFAULT_CONFIG)
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false)
  const [launchProgress, setLaunchProgress] = useState(0)
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
    setLaunchStatus,
    scrubFraction,
    clearActiveMilestone,
    phases,
  } = useMissionTimer(config)

  // Launch Sequence Handlers
  const handleInitiateMission = useCallback(() => {
    sounds.initAudio()
    if (config.skipLaunchSequence) {
      startMission()
    } else {
      setLaunchStatus()
    }
  }, [config.skipLaunchSequence, sounds, startMission, setLaunchStatus])

  const handleLaunchComplete = useCallback(() => {
    startMission()
  }, [startMission])

  const handleLaunchSkip = useCallback(() => {
    startMission()
  }, [startMission])

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
    } catch {}
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {}
  }, [])

  // Keyboard shortcuts (O, M, Space, F)
  useKeyboardShortcuts({
    onToggleOrganizer: handleToggleOrganizer,
    onToggleSound: handleToggleSound,
    onTogglePause: handleTogglePause,
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

      {/* 3D Celestial WebGL Canvas: Earth, Moon on Orbit, Stars, Rocket */}
      <SpaceScene
        status={timerState.status}
        orbitalAngle={timerState.orbitalAngle}
        elapsedFraction={timerState.elapsedFraction}
        orbitalRadius={config.orbitalRadius}
        orbitalInclination={config.orbitalInclination}
        launchProgress={launchProgress}
        isFinalMinute={timerState.isFinalMinute}
        reducedMotion={config.reducedMotion}
      />

      {/* EXPERIENCE A: Mission Standby Screen */}
      {timerState.status === 'standby' && (
        <StandbyScreen
          config={config}
          onInitiateMission={handleInitiateMission}
          onOpenOrganizer={() => setIsOrganizerOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* EXPERIENCE B: Cinematic Rocket Launch Sequence */}
      {timerState.status === 'launching' && (
        <LaunchOverlay
          onComplete={handleLaunchComplete}
          onSkip={handleLaunchSkip}
          onProgressUpdate={setLaunchProgress}
          sounds={sounds}
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
            onLogout={handleLogout}
          />

          {/* Clean, Non-overlapping Bottom Flight Operations Cockpit */}
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
