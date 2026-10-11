import type { HackathonPhase, MissionMilestone } from '../types/mission'

export function padZero(num: number, length: number = 2): string {
  return Math.floor(Math.max(0, num)).toString().padStart(length, '0')
}

export function formatCountdown(totalSeconds: number): {
  days: string
  hours: string
  minutes: string
  seconds: string
  formattedHHMMSS: string
} {
  const safeSec = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(safeSec / 86400)
  const hours = Math.floor((safeSec % 86400) / 3600)
  const minutes = Math.floor((safeSec % 3600) / 60)
  const seconds = safeSec % 60

  const dStr = padZero(days)
  const hStr = padZero(hours)
  const mStr = padZero(minutes)
  const sStr = padZero(seconds)

  let formattedHHMMSS = `${hStr}:${mStr}:${sStr}`
  if (days > 0) {
    formattedHHMMSS = `${dStr}d ${hStr}:${mStr}:${sStr}`
  }

  return {
    days: dStr,
    hours: hStr,
    minutes: mStr,
    seconds: sStr,
    formattedHHMMSS,
  }
}

export function formatElapsedTime(seconds: number): string {
  const { hours, minutes, seconds: s } = formatCountdown(seconds)
  return `${hours}:${minutes}:${s}`
}

export function formatPercentage(fraction: number, decimals: number = 2): string {
  const pct = Math.max(0, Math.min(100, fraction * 100))
  return `${pct.toFixed(decimals)}%`
}

export const DEFAULT_HACKATHON_PHASES: HackathonPhase[] = [
  {
    id: 'phase-ideation',
    name: 'IDEATION & SYSTEM DESIGN',
    description: 'Problem framing, architectural breakdown, and project repository setup.',
    startFraction: 0.0,
    endFraction: 0.1667, // First 4 hours of 24h
    color: '#6DADEB',
  },
  {
    id: 'phase-dev',
    name: 'CORE DEVELOPMENT SPRINT',
    description: 'Feature implementation, prototype building, and primary systems engineering.',
    startFraction: 0.1667,
    endFraction: 0.75, // 4h to 18h
    color: '#A78BFA',
  },
  {
    id: 'phase-test',
    name: 'INTEGRATION & HARDENING',
    description: 'Edge case testing, UI/UX polish, bug fixes, and telemetry verification.',
    startFraction: 0.75,
    endFraction: 0.9167, // 18h to 22h
    color: '#F472B6',
  },
  {
    id: 'phase-submission',
    name: 'FINAL SUBMISSION & DEPLOYMENT',
    description: 'Code freeze preparation, video pitch recording, and final portal upload.',
    startFraction: 0.9167,
    endFraction: 1.0, // 22h to 24h
    color: '#FBBF24',
  },
]

export const DEFAULT_MILESTONES: MissionMilestone[] = [
  {
    id: 'm-launch',
    label: 'MISSION LAUNCH',
    targetFraction: 0.0,
    hourMark: 0,
    announced: false,
    description: 'Orbital insertion confirmed. 24-hour mission clock initiated.',
  },
  {
    id: 'm-q1',
    label: 'FIRST QUARTER ORBIT',
    targetFraction: 0.25,
    hourMark: 6,
    announced: false,
    description: '6 hours elapsed (25%). Architecture locked and core APIs operational.',
  },
  {
    id: 'm-half',
    label: 'HALF ORBIT — MIDPOINT',
    targetFraction: 0.5,
    hourMark: 12,
    announced: false,
    description: '12 hours elapsed (50%). Mid-mission checkpoint achieved.',
  },
  {
    id: 'm-q3',
    label: 'FINAL QUARTER ORBIT',
    targetFraction: 0.75,
    hourMark: 18,
    announced: false,
    description: '18 hours elapsed (75%). Commencing final integration & testing phase.',
  },
  {
    id: 'm-final-hour',
    label: 'FINAL ORBIT HOUR',
    targetFraction: 23 / 24, // ~0.9583
    hourMark: 23,
    announced: false,
    description: '60 minutes remaining. Code freeze countdown initiated.',
  },
  {
    id: 'm-final-min',
    label: 'TERMINAL COUNTDOWN',
    targetFraction: (24 * 3600 - 60) / (24 * 3600), // ~0.9993
    hourMark: 23.98,
    announced: false,
    description: 'Final 60 seconds. Preparing for mission completion.',
  },
  {
    id: 'm-complete',
    label: 'MISSION COMPLETE',
    targetFraction: 1.0,
    hourMark: 24,
    announced: false,
    description: 'Full 360° orbit completed. Hackathon submissions officially concluded.',
  },
]
