export type MissionStatus = 'standby' | 'launching' | 'active' | 'paused' | 'completed'

export interface HackathonPhase {
  id: string
  name: string
  description: string
  startFraction: number // 0.0 to 1.0
  endFraction: number   // 0.0 to 1.0
  color: string
}

export interface MissionMilestone {
  id: string
  label: string
  targetFraction: number // 0.0 to 1.0
  hourMark: number       // e.g. 0, 6, 12, 18, 23, 23.98, 24
  announced: boolean
  description: string
}

export interface MissionConfig {
  missionName: string
  tagline: string
  totalDurationSeconds: number // e.g. 86400 for 24 hours
  initialOrbitalAngle: number  // in radians
  orbitalRadius: number
  orbitalInclination: number   // in radians (e.g. 0.35 rad ~ 20 deg)
  soundEnabled: boolean
  skipLaunchSequence: boolean
  reducedMotion: boolean
  visualQuality: 'low' | 'medium' | 'high' | 'ultra'
}

export interface MissionTimerState {
  status: MissionStatus
  startTimestamp: number | null
  deadlineTimestamp: number | null
  accumulatedPausedMs: number
  lastPauseTimestamp: number | null
  elapsedSeconds: number
  remainingSeconds: number
  elapsedFraction: number // 0.0 to 1.0
  orbitalAngle: number    // radians
  currentPhase: HackathonPhase | null
  activeMilestone: MissionMilestone | null
  isFinalMinute: boolean
  isFinalTenSeconds: boolean
  finalCountdownDigit: number | null
}
