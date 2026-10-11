import { useRef, useCallback, useEffect } from 'react'

/**
 * Web Audio API Sound Synthesizer
 * 100% procedural sound effects — zero external audio dependencies.
 * Adheres strictly to browser autoplay policies.
 */

export function useSoundEffects(soundEnabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const master = ctx.createGain()
        master.gain.value = soundEnabled ? 0.35 : 0
        master.connect(ctx.destination)
        audioCtxRef.current = ctx
        masterGainRef.current = master
      }
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }, [soundEnabled])

  // Synchronize master gain with soundEnabled prop
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        soundEnabled ? 0.35 : 0,
        audioCtxRef.current.currentTime,
        0.05
      )
    }
  }, [soundEnabled])

  // Crisp telemetry beep
  const playBeep = useCallback((freq = 920, duration = 0.08, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(master)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  }, [soundEnabled, initAudio])

  // Multi-tone telemetry scan for pre-launch checks
  const playTelemetryScan = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const tones = [587.33, 739.99, 880.0, 1174.66]
    tones.forEach((freq, idx) => {
      setTimeout(() => {
        playBeep(freq, 0.06, 'triangle')
      }, idx * 70)
    })
  }, [soundEnabled, initAudio, playBeep])

  // Countdown tick (T-05, T-04, etc.)
  const playCountdownTick = useCallback((pitch = 660) => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(pitch, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

    osc.connect(gain)
    gain.connect(master)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }, [soundEnabled, initAudio])

  // Rocket ignition deep rumble & thruster roar
  const playIgnitionRumble = useCallback((duration = 3.5) => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    // Noise buffer
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02 // Brown noise simulation
      lastOut = data[i]
      data[i] *= 3.5
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer

    // Filter to simulate low-end thruster acoustic cavity
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(140, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(450, ctx.currentTime + 1.2)
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.01, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.6)
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + duration - 0.8)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    noiseSource.connect(filter)
    filter.connect(gain)
    gain.connect(master)

    noiseSource.start(ctx.currentTime)
    noiseSource.stop(ctx.currentTime + duration)
  }, [soundEnabled, initAudio])

  // Orbital insertion sweep
  const playWhoosh = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8)

    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.4)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85)

    osc.connect(gain)
    gain.connect(master)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.85)
  }, [soundEnabled, initAudio])

  // Mission Active activation chord
  const playMissionActive = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const freqs = [440, 554.37, 659.25, 880] // A major chord
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08)

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.08 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 1.2)

      osc.connect(gain)
      gain.connect(master)

      osc.start(ctx.currentTime + i * 0.08)
      osc.stop(ctx.currentTime + i * 0.08 + 1.2)
    })
  }, [soundEnabled, initAudio])

  // Milestone reached harmonic chime
  const playMilestoneChime = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const freqs = [523.25, 659.25, 783.99, 1046.5] // C Major
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.1)

      gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 1.0)

      osc.connect(gain)
      gain.connect(master)

      osc.start(ctx.currentTime + idx * 0.1)
      osc.stop(ctx.currentTime + idx * 0.1 + 1.0)
    })
  }, [soundEnabled, initAudio])

  // Final 60-second radar heartbeat
  const playFinalHeartbeat = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(110, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.28, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(master)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.16)
  }, [soundEnabled, initAudio])

  // Mission Complete Fanfare
  const playCompletionFanfare = useCallback(() => {
    if (!soundEnabled) return
    initAudio()
    const ctx = audioCtxRef.current
    const master = masterGainRef.current
    if (!ctx || !master) return

    const chords = [
      [392.0, 493.88, 587.33], // G major
      [440.0, 554.37, 659.25], // A major
      [523.25, 659.25, 783.99, 1046.5] // C major triumphant
    ]

    chords.forEach((chord, cIdx) => {
      const startTime = ctx.currentTime + cIdx * 0.45
      chord.forEach((freq) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.16, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4)

        osc.connect(gain)
        gain.connect(master)

        osc.start(startTime)
        osc.stop(startTime + 1.4)
      })
    })
  }, [soundEnabled, initAudio])

  return {
    initAudio,
    playBeep,
    playTelemetryScan,
    playCountdownTick,
    playIgnitionRumble,
    playWhoosh,
    playMissionActive,
    playMilestoneChime,
    playFinalHeartbeat,
    playCompletionFanfare,
  }
}
