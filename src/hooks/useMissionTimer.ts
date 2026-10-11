import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  MissionStatus,
  MissionConfig,
  MissionTimerState,
  HackathonPhase,
  MissionMilestone,
} from '../types/mission'
import {
  calculateElapsedFraction,
  calculateOrbitalAngle,
  DEFAULT_INITIAL_ANGLE,
} from '../utils/orbitalMechanics'
import {
  DEFAULT_HACKATHON_PHASES,
  DEFAULT_MILESTONES,
} from '../utils/timeFormatters'

const STORAGE_KEY = 'seds_lunar_clock_persisted_state_v1'

interface PersistedStorageData {
  status: MissionStatus
  missionName: string
  configuredDurationSeconds: number
  startTimestamp: number | null
  deadlineTimestamp: number | null
  accumulatedPausedMs: number
  lastPauseTimestamp: number | null
  announcedMilestoneIds: string[]
}

export function useMissionTimer(config: MissionConfig) {
  // Core authoritative state
  const [status, setStatus] = useState<MissionStatus>('standby')
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null)
  const [deadlineTimestamp, setDeadlineTimestamp] = useState<number | null>(null)
  const [accumulatedPausedMs, setAccumulatedPausedMs] = useState<number>(0)
  const [lastPauseTimestamp, setLastPauseTimestamp] = useState<number | null>(null)

  // Computed state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(config.totalDurationSeconds)
  const [elapsedFraction, setElapsedFraction] = useState<number>(0)
  const [orbitalAngle, setOrbitalAngle] = useState<number>(DEFAULT_INITIAL_ANGLE)
  const [currentPhase, setCurrentPhase] = useState<HackathonPhase | null>(DEFAULT_HACKATHON_PHASES[0])
  const [activeMilestone, setActiveMilestone] = useState<MissionMilestone | null>(null)
  const [phases] = useState<HackathonPhase[]>(DEFAULT_HACKATHON_PHASES)
  const [milestones, setMilestones] = useState<MissionMilestone[]>(DEFAULT_MILESTONES)

  // Final 60s states
  const [isFinalMinute, setIsFinalMinute] = useState<boolean>(false)
  const [isFinalTenSeconds, setIsFinalTenSeconds] = useState<boolean>(false)
  const [finalCountdownDigit, setFinalCountdownDigit] = useState<number | null>(null)

  // Simulation scrub override (when organizer scrubs time for testing)
  const isScrubbingRef = useRef<boolean>(false)
  const scrubbedFractionRef = useRef<number | null>(null)

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: PersistedStorageData = JSON.parse(saved)
        if (parsed && typeof parsed.status === 'string') {
          setStatus(parsed.status)
          setStartTimestamp(parsed.startTimestamp)
          setDeadlineTimestamp(parsed.deadlineTimestamp)
          setAccumulatedPausedMs(parsed.accumulatedPausedMs || 0)
          setLastPauseTimestamp(parsed.lastPauseTimestamp || null)

          if (parsed.announcedMilestoneIds && Array.isArray(parsed.announcedMilestoneIds)) {
            setMilestones((prev) =>
              prev.map((m) => ({
                ...m,
                announced: parsed.announcedMilestoneIds.includes(m.id),
              }))
            )
          }
        }
      }
    } catch (e) {
      console.warn('Failed to recover previous mission state from localStorage:', e)
    }
  }, [])

  // Persist state to localStorage on state changes
  useEffect(() => {
    try {
      const data: PersistedStorageData = {
        status,
        missionName: config.missionName,
        configuredDurationSeconds: config.totalDurationSeconds,
        startTimestamp,
        deadlineTimestamp,
        accumulatedPausedMs,
        lastPauseTimestamp,
        announcedMilestoneIds: milestones.filter((m) => m.announced).map((m) => m.id),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to persist mission state to localStorage:', e)
    }
  }, [
    status,
    config.missionName,
    config.totalDurationSeconds,
    startTimestamp,
    deadlineTimestamp,
    accumulatedPausedMs,
    lastPauseTimestamp,
    milestones,
  ])

  // Primary authoritative update calculation function
  const updateTick = useCallback(() => {
    if (isScrubbingRef.current && scrubbedFractionRef.current !== null) {
      const frac = scrubbedFractionRef.current
      const elap = frac * config.totalDurationSeconds
      const rem = Math.max(0, config.totalDurationSeconds - elap)
      setElapsedFraction(frac)
      setElapsedSeconds(elap)
      setRemainingSeconds(rem)
      setOrbitalAngle(calculateOrbitalAngle(frac, config.initialOrbitalAngle))
      setIsFinalMinute(rem <= 60 && rem > 0)
      setIsFinalTenSeconds(rem <= 10 && rem > 0)
      setFinalCountdownDigit(rem <= 10 && rem > 0 ? Math.ceil(rem) : null)
      return
    }

    if (status === 'standby') {
      setElapsedSeconds(0)
      setRemainingSeconds(config.totalDurationSeconds)
      setElapsedFraction(0)
      setOrbitalAngle(calculateOrbitalAngle(0, config.initialOrbitalAngle))
      setIsFinalMinute(false)
      setIsFinalTenSeconds(false)
      setFinalCountdownDigit(null)
      setCurrentPhase(phases[0] || null)
      return
    }

    if (status === 'completed') {
      setElapsedSeconds(config.totalDurationSeconds)
      setRemainingSeconds(0)
      setElapsedFraction(1)
      setOrbitalAngle(calculateOrbitalAngle(1, config.initialOrbitalAngle))
      setIsFinalMinute(false)
      setIsFinalTenSeconds(false)
      setFinalCountdownDigit(null)
      setCurrentPhase(phases[phases.length - 1] || null)
      return
    }

    if (!startTimestamp || !deadlineTimestamp) return

    const now = Date.now()

    let effectiveNow = now
    if (status === 'paused' && lastPauseTimestamp) {
      effectiveNow = lastPauseTimestamp
    }

    const elapsedMs = Math.max(0, effectiveNow - startTimestamp - accumulatedPausedMs)
    const elapSec = elapsedMs / 1000

    const frac = calculateElapsedFraction(elapSec, config.totalDurationSeconds)
    const remSec = Math.max(0, config.totalDurationSeconds - elapSec)

    setElapsedSeconds(elapSec)
    setRemainingSeconds(remSec)
    setElapsedFraction(frac)
    setOrbitalAngle(calculateOrbitalAngle(frac, config.initialOrbitalAngle))

    // Check final 60s and final 10s
    if (remSec <= 60 && remSec > 0 && status === 'active') {
      setIsFinalMinute(true)
    } else {
      setIsFinalMinute(false)
    }

    if (remSec <= 10 && remSec > 0 && status === 'active') {
      setIsFinalTenSeconds(true)
      setFinalCountdownDigit(Math.ceil(remSec))
    } else {
      setIsFinalTenSeconds(false)
      setFinalCountdownDigit(null)
    }

    // Determine current hackathon phase
    const matchedPhase = phases.find(
      (p) => frac >= p.startFraction && frac < p.endFraction
    ) || phases[phases.length - 1]
    setCurrentPhase(matchedPhase)

    // Milestone announcement detection
    milestones.forEach((m) => {
      if (!m.announced && frac >= m.targetFraction) {
        setActiveMilestone(m)
        setMilestones((prev) =>
          prev.map((item) => (item.id === m.id ? { ...item, announced: true } : item))
        )
      }
    })

    // Mission completion check
    if (remSec <= 0 && status === 'active') {
      setStatus('completed')
    }
  }, [
    status,
    startTimestamp,
    deadlineTimestamp,
    accumulatedPausedMs,
    lastPauseTimestamp,
    config.totalDurationSeconds,
    config.initialOrbitalAngle,
    phases,
    milestones,
  ])

  // High-frequency RAF loop for ultra-smooth 3D animation & accurate timer display
  useEffect(() => {
    let animId: number
    const loop = () => {
      updateTick()
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animId)
  }, [updateTick])

  // Handle visibility change (tab sleep / restore recovery)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateTick()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [updateTick])

  // Controls

  const startMission = useCallback(() => {
    const now = Date.now()
    const deadline = now + config.totalDurationSeconds * 1000
    setStartTimestamp(now)
    setDeadlineTimestamp(deadline)
    setAccumulatedPausedMs(0)
    setLastPauseTimestamp(null)
    setStatus('active')
    isScrubbingRef.current = false
    scrubbedFractionRef.current = null
  }, [config.totalDurationSeconds])

  const pauseMission = useCallback(() => {
    if (status !== 'active') return
    const now = Date.now()
    setLastPauseTimestamp(now)
    setStatus('paused')
  }, [status])

  const resumeMission = useCallback(() => {
    if (status !== 'paused' || !lastPauseTimestamp) return
    const now = Date.now()
    const pauseDuration = now - lastPauseTimestamp
    setAccumulatedPausedMs((prev) => prev + pauseDuration)
    if (deadlineTimestamp) {
      setDeadlineTimestamp((prev) => (prev ? prev + pauseDuration : null))
    }
    setLastPauseTimestamp(null)
    setStatus('active')
  }, [status, lastPauseTimestamp, deadlineTimestamp])

  const addTime = useCallback(
    (secondsToAdd: number) => {
      if (!deadlineTimestamp) return
      setDeadlineTimestamp((prev) => (prev ? prev + secondsToAdd * 1000 : null))
    },
    [deadlineTimestamp]
  )

  const subtractTime = useCallback(
    (secondsToSub: number) => {
      if (!deadlineTimestamp || !startTimestamp) return
      const subMs = secondsToSub * 1000
      setDeadlineTimestamp((prev) => {
        if (!prev) return null
        const now = Date.now()
        // Ensure new deadline is not in the past
        return Math.max(now + 1000, prev - subMs)
      })
    },
    [deadlineTimestamp, startTimestamp]
  )

  const resetMission = useCallback(() => {
    setStatus('standby')
    setStartTimestamp(null)
    setDeadlineTimestamp(null)
    setAccumulatedPausedMs(0)
    setLastPauseTimestamp(null)
    setElapsedSeconds(0)
    setRemainingSeconds(config.totalDurationSeconds)
    setElapsedFraction(0)
    setOrbitalAngle(calculateOrbitalAngle(0, config.initialOrbitalAngle))
    setIsFinalMinute(false)
    setIsFinalTenSeconds(false)
    setFinalCountdownDigit(null)
    setActiveMilestone(null)
    isScrubbingRef.current = false
    scrubbedFractionRef.current = null
    setMilestones(DEFAULT_MILESTONES.map((m) => ({ ...m, announced: false })))
    localStorage.removeItem(STORAGE_KEY)
  }, [config.totalDurationSeconds, config.initialOrbitalAngle])

  const setLaunchStatus = useCallback(() => {
    setStatus('launching')
  }, [])

  const scrubFraction = useCallback((frac: number | null) => {
    if (frac === null) {
      isScrubbingRef.current = false
      scrubbedFractionRef.current = null
    } else {
      isScrubbingRef.current = true
      scrubbedFractionRef.current = Math.max(0, Math.min(1, frac))
    }
  }, [])

  const clearActiveMilestone = useCallback(() => {
    setActiveMilestone(null)
  }, [])

  const timerState: MissionTimerState = {
    status,
    startTimestamp,
    deadlineTimestamp,
    accumulatedPausedMs,
    lastPauseTimestamp,
    elapsedSeconds,
    remainingSeconds,
    elapsedFraction,
    orbitalAngle,
    currentPhase,
    activeMilestone,
    isFinalMinute,
    isFinalTenSeconds,
    finalCountdownDigit,
  }

  return {
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
    milestones,
  }
}
