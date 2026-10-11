import React, { useEffect, useState, useRef } from 'react'
import { FastForward } from 'lucide-react'
import { gsap } from 'gsap'

interface LaunchOverlayProps {
  onComplete: () => void
  onSkip: () => void
  onProgressUpdate: (progress: number) => void
  sounds: {
    playTelemetryScan: () => void
    playCountdownTick: (pitch?: number) => void
    playIgnitionRumble: () => void
    playWhoosh: () => void
    playMissionActive: () => void
  }
}

type Act = 'void' | 'reveal' | 'launch' | 'insertion' | 'active'

export const LaunchOverlay: React.FC<LaunchOverlayProps> = ({
  onComplete,
  onSkip,
  onProgressUpdate,
  sounds,
}) => {
  const [currentAct, setCurrentAct] = useState<Act>('void')
  const [countdownDigit, setCountdownDigit] = useState<number | null>(null)
  const [actLabel, setActLabel] = useState<string>('ACT I — THE VOID')
  const [telemetryText, setTelemetryText] = useState<string>('DEEP SPACE STANDBY')

  const containerRef = useRef<HTMLDivElement>(null)
  const digitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const proxy = { progress: 0 }

    // Master 15.0-second cinematic GSAP sequence
    const tl = gsap.timeline({
      onUpdate: () => {
        onProgressUpdate(proxy.progress)
      },
      onComplete: () => {
        onComplete()
      },
    })

    // Continuous 0.0 -> 1.0 progress interpolation driving 3D camera & rocket
    tl.to(
      proxy,
      {
        progress: 1.0,
        duration: 15.0,
        ease: 'power1.inOut',
      },
      0
    )

    // ACT I: THE VOID (0.0s - 3.2s)
    tl.call(() => {
      setCurrentAct('void')
      setActLabel('ACT I // THE VOID')
      setTelemetryText('DEEP SPACE STANDBY')
    }, [], 0.1)

    // ACT II: PLANETARY REVEAL (3.2s - 6.6s)
    tl.call(() => {
      setCurrentAct('reveal')
      setActLabel('ACT II // PLANETARY REVEAL')
      setTelemetryText('CELESTIAL ALIGNMENT CONFIRMED • ATMOSPHERIC HORIZON ACQUIRED')
      sounds.playTelemetryScan()
    }, [], 3.2)

    // ACT III: LAUNCH COUNTDOWN & IGNITION (6.6s - 10.8s)
    tl.call(() => {
      setCurrentAct('launch')
      setActLabel('ACT III // LAUNCH SEQUENCE')
      setTelemetryText('PROPULSION ARMED • T-MINUS COUNTDOWN COMMENCING')
    }, [], 6.6)

    // T-05 to T-01 countdown beats
    const countdownNumbers = [5, 4, 3, 2, 1]
    countdownNumbers.forEach((num, index) => {
      const time = 6.9 + index * 0.72
      tl.call(() => {
        setCountdownDigit(num)
        sounds.playCountdownTick(num === 1 ? 880 : 540 + (5 - num) * 65)
        if (digitRef.current) {
          gsap.fromTo(
            digitRef.current,
            { scale: 1.35, opacity: 0 },
            { scale: 1.0, opacity: 1, duration: 0.28, ease: 'power2.out' }
          )
        }
      }, [], time)
    })

    // Ignition & Liftoff (at 10.5s)
    tl.call(() => {
      setCountdownDigit(null)
      setTelemetryText('MAIN ENGINE IGNITION • LIFTOFF CONFIRMED')
      sounds.playIgnitionRumble()
    }, [], 10.5)

    // ACT IV: ORBITAL INSERTION (10.8s - 13.5s)
    tl.call(() => {
      setCurrentAct('insertion')
      setActLabel('ACT IV // ORBITAL INSERTION')
      setTelemetryText('ORBITAL PLANE ESTABLISHED • INCLINATION 23.5°')
      sounds.playWhoosh()
    }, [], 11.2)

    // ACT V: MISSION CLOCK ACTIVATION (13.5s - 15.0s)
    tl.call(() => {
      setCurrentAct('active')
      setActLabel('ACT V // MISSION CLOCK')
      setTelemetryText('SYNCHRONIZING AUTHORITATIVE 24-HOUR LUNAR TIMER')
      sounds.playMissionActive()
    }, [], 13.6)

    return () => {
      tl.kill()
    }
  }, [onComplete, onProgressUpdate, sounds])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-12 pointer-events-none select-none"
    >
      {/* Top Telemetry Header & Skip Button */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="w-2 h-2 rounded-full bg-[#6DADEB] animate-ping" />
          <span className="text-[#6DADEB] tracking-widest uppercase font-semibold">
            {actLabel}
          </span>
          <span className="hidden sm:inline text-[#8D8BA0]/60">•</span>
          <span className="hidden sm:inline text-[#8D8BA0] text-[11px] tracking-wider">
            {telemetryText}
          </span>
        </div>

        <button
          onClick={onSkip}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#100B20]/80 border border-[#A78BFA]/40 hover:border-[#A78BFA] text-[#C4B5FD] text-xs font-mono transition-all backdrop-blur-md cursor-pointer hover:bg-[#A78BFA]/20 active:scale-95 shadow-[0_0_15px_rgba(167,139,250,0.2)]"
          title="Skip Launch Sequence & Start Mission Clock"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>SKIP SEQUENCE</span>
        </button>
      </div>

      {/* Center Cinematic Content Area */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        {/* ACT I: THE VOID — Understated cinematic mission title */}
        {currentAct === 'void' && (
          <div className="space-y-3 animate-in fade-in duration-1000 max-w-lg">
            <div className="text-xs font-mono tracking-[0.4em] text-[#8D8BA0] uppercase">
              SEDS REC PRESENTS
            </div>
            <h1 className="text-4xl sm:text-6xl font-sans font-light tracking-tight text-[#F3F2FA]">
              LUNAR <span className="font-semibold text-[#A78BFA]">CLOCK</span>
            </h1>
            <p className="text-sm font-mono text-[#8D8BA0] tracking-widest pt-2">
              ONE REVOLUTION. ONE DAY. ONE MISSION.
            </p>
          </div>
        )}

        {/* ACT II: PLANETARY REVEAL — Fine horizon alignment typography */}
        {currentAct === 'reveal' && (
          <div className="space-y-2 animate-in fade-in duration-700">
            <div className="text-[11px] font-mono tracking-[0.3em] text-[#6DADEB] uppercase">
              SECTOR SCAN // ORBITAL SYNCHRONIZATION
            </div>
            <div className="text-2xl sm:text-3xl font-mono text-[#F3F2FA] font-light tracking-wider">
              EARTH — MOON SYSTEM ACQUIRED
            </div>
          </div>
        )}

        {/* ACT III: LAUNCH — Large Centered Countdown Digits */}
        {currentAct === 'launch' && countdownDigit !== null && (
          <div
            ref={digitRef}
            className="flex flex-col items-center justify-center space-y-2"
          >
            <div className="text-xs font-mono tracking-[0.4em] text-[#6DADEB] uppercase">
              TERMINAL COUNTDOWN
            </div>
            <div className="text-7xl sm:text-9xl font-mono font-extrabold text-[#F3F2FA] tracking-tight drop-shadow-[0_0_35px_rgba(109,173,235,0.4)]">
              T−0{countdownDigit}
            </div>
          </div>
        )}

        {/* ACT III: Liftoff Announcement */}
        {currentAct === 'launch' && countdownDigit === null && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-sm font-mono tracking-[0.3em] text-[#FF9F43] uppercase">
              IGNITION & ASCENT
            </div>
            <div className="text-3xl sm:text-5xl font-mono font-bold text-[#F3F2FA] tracking-wider">
              LIFTOFF CONFIRMED
            </div>
          </div>
        )}

        {/* ACT IV: ORBITAL INSERTION */}
        {currentAct === 'insertion' && (
          <div className="space-y-2 animate-in fade-in duration-500">
            <div className="text-xs font-mono tracking-[0.3em] text-[#A78BFA] uppercase">
              ORBITAL INSERTION COMPLETE
            </div>
            <div className="text-2xl sm:text-4xl font-mono font-light text-[#F3F2FA] tracking-wide">
              SYNCHRONIZING CELESTIAL TRAJECTORY
            </div>
          </div>
        )}

        {/* ACT V: MISSION CLOCK ACTIVATION */}
        {currentAct === 'active' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-xs font-mono tracking-[0.4em] text-[#34D399] uppercase font-semibold">
              MISSION STATUS: ACTIVE
            </div>
            <div className="text-5xl sm:text-7xl font-mono font-extrabold text-[#F3F2FA] tracking-tight tabular-nums drop-shadow-[0_0_40px_rgba(167,139,250,0.5)]">
              24:00:00
            </div>
            <div className="text-xs font-mono text-[#A78BFA] tracking-widest">
              ORBIT 0.0% COMPLETE • AUTHORITATIVE CLOCK RUNNING
            </div>
          </div>
        )}
      </div>

      {/* Bottom Technical Status Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#8D8BA0]/70 border-t border-[#A78BFA]/15 pt-4">
        <span>SEDS REC SPACE OPERATIONS</span>
        <span className="tracking-widest">FLIGHT COMPUTER T-MINUS 15S SEQUENCE</span>
      </div>
    </div>
  )
}
