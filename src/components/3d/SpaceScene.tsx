import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Earth } from './Earth'
import { Moon } from './Moon'
import { OrbitPath } from './OrbitPath'
import { StarField } from './StarField'
import { RocketLaunch } from './RocketLaunch'
import type { MissionStatus } from '../../types/mission'

interface SpaceSceneProps {
  status: MissionStatus
  orbitalAngle: number
  elapsedFraction: number
  orbitalRadius: number
  orbitalInclination: number
  launchProgress: number
  isFinalMinute: boolean
  reducedMotion?: boolean
}

// Cinematic Camera Director for Standby, 5-Act Launch Sequence, Active Countdown & Final Minute
const CameraDirector: React.FC<{
  status: MissionStatus
  launchProgress: number
  isFinalMinute: boolean
  reducedMotion: boolean
}> = ({ status, launchProgress, isFinalMinute, reducedMotion }) => {
  const { camera } = useThree()
  // Master composition framing: Earth gracefully elevated, spacious negative space below for HUD
  const targetPos = useRef(new THREE.Vector3(0, 1.4, 16.2))
  const targetLook = useRef(new THREE.Vector3(0, 0.4, 0))

  useFrame((state, delta) => {
    if (reducedMotion) return

    if (status === 'standby') {
      // Gentle cinematic breathing motion in deep space
      const t = state.clock.elapsedTime
      targetPos.current.set(
        Math.sin(t * 0.08) * 0.6,
        1.4 + Math.cos(t * 0.1) * 0.3,
        16.2
      )
      targetLook.current.set(0, 0.4, 0)
    } else if (status === 'launching') {
      if (launchProgress < 0.20) {
        // ACT I: THE VOID — Distant deep-space approach
        const t = launchProgress / 0.20
        targetPos.current.set(0, 4.0 - t * 1.2, 24.0 - t * 4.0)
        targetLook.current.set(0, 0.2, 0)
      } else if (launchProgress < 0.44) {
        // ACT II: PLANETARY REVEAL — Horizon glide revealing atmosphere & Moon in distance
        const t = (launchProgress - 0.20) / 0.24
        targetPos.current.set(2.8 * t, 2.8 - t * 0.5, 20.0 - t * 6.5)
        targetLook.current.set(t * 0.5, 0.8, -t * 0.8)
      } else if (launchProgress < 0.74) {
        // ACT III: LAUNCH — Tracking camera following rocket liftoff & gravity turn
        const t = (launchProgress - 0.44) / 0.30
        const altitude = 2.4 + Math.pow(t, 2) * 6.8
        targetPos.current.set(t * 1.5 + 0.6, altitude * 0.6 + 2.4, 6.2 + t * 4.5)
        targetLook.current.set(t * 2.2, altitude, -t * 1.4)

        // Subtle liftoff vibration during initial powered flight
        if (t < 0.4) {
          const shake = (Math.random() - 0.5) * 0.035 * (1.0 - t / 0.4)
          targetPos.current.x += shake
          targetPos.current.y += shake
        }
      } else if (launchProgress < 0.90) {
        // ACT IV: ORBITAL INSERTION — Smooth pull-back into wide Earth-Moon system
        const t = (launchProgress - 0.74) / 0.16
        targetPos.current.lerp(new THREE.Vector3(0, 1.4, 16.2), t)
        targetLook.current.lerp(new THREE.Vector3(0, 0.4, 0), t)
      } else {
        // ACT V: MISSION CLOCK — Settle into master active composition
        targetPos.current.set(0, 1.4, 16.2)
        targetLook.current.set(0, 0.4, 0)
      }
    } else if (status === 'active' || status === 'paused') {
      if (isFinalMinute) {
        // Dramatic subtle push-in during final 60 seconds
        targetPos.current.set(0, 1.2, 14.8)
        targetLook.current.set(0, 0.3, 0)
      } else {
        targetPos.current.set(0, 1.4, 16.2)
        targetLook.current.set(0, 0.4, 0)
      }
    } else if (status === 'completed') {
      const t = state.clock.elapsedTime
      targetPos.current.set(
        Math.sin(t * 0.08) * 0.8,
        1.6 + Math.cos(t * 0.1) * 0.4,
        17.0
      )
      targetLook.current.set(0, 0.4, 0)
    }

    camera.position.lerp(targetPos.current, delta * 2.5)
    camera.lookAt(targetLook.current)
  })

  return null
}

export const SpaceScene: React.FC<SpaceSceneProps> = ({
  status,
  orbitalAngle,
  elapsedFraction,
  orbitalRadius = 6.4,
  orbitalInclination = (23.5 * Math.PI) / 180,
  launchProgress,
  isFinalMinute,
  reducedMotion = false,
}) => {
  // Dynamically control sunlight intensity during launch Acts (Act I begins dimmed)
  const sunIntensity = useMemo(() => {
    if (status === 'launching') {
      if (launchProgress < 0.20) {
        return 0.6 + (launchProgress / 0.20) * 1.2
      } else if (launchProgress < 0.44) {
        return 1.8 + ((launchProgress - 0.20) / 0.24) * 1.4
      }
    }
    return 3.2
  }, [status, launchProgress])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#05050A]">
      <Canvas
        camera={{ position: [0, 1.4, 16.2], fov: 42, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#05050A']} />

        {/* Cinematic Directional Solar Illumination */}
        <ambientLight intensity={0.22} color="#100B20" />
        <directionalLight
          position={[12, 4, 12]}
          intensity={sunIntensity}
          color="#FFF8EB"
          castShadow
        />
        {/* Subtle deep-space fill illumination */}
        <directionalLight
          position={[-12, -3, -10]}
          intensity={0.24}
          color="#2E1065"
        />

        {/* Astronomical Multi-depth Starfield */}
        <StarField count={3000} reducedMotion={reducedMotion} />

        <Suspense fallback={null}>
          {/* Photorealistic NASA Earth at [0, 0, 0] */}
          <Earth radius={2.4} reducedMotion={reducedMotion} />

          {/* Precision 3D Orbital Trajectory & Completed Lavender Trail */}
          <OrbitPath
            orbitalAngle={orbitalAngle}
            elapsedFraction={elapsedFraction}
            orbitalRadius={orbitalRadius}
            orbitalInclination={orbitalInclination}
            isFinalMinute={isFinalMinute}
          />

          {/* Photorealistic NASA Moon on Orbital Path */}
          <Moon
            orbitalAngle={orbitalAngle}
            orbitalRadius={orbitalRadius}
            orbitalInclination={orbitalInclination}
            moonRadius={0.52}
            isFinalMinute={isFinalMinute}
            isCompleted={status === 'completed'}
          />

          {/* 3D Rocket during Standby and Launch Sequence */}
          <RocketLaunch
            progress={launchProgress}
            visible={status === 'launching'}
            isStandby={status === 'standby'}
          />
        </Suspense>

        {/* Dynamic Cinematic Camera Director */}
        <CameraDirector
          status={status}
          launchProgress={launchProgress}
          isFinalMinute={isFinalMinute}
          reducedMotion={reducedMotion}
        />

        {/* Subtle interactive inspection controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={6}
          maxDistance={28}
          rotateSpeed={0.4}
          zoomSpeed={0.8}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.35}
          minPolarAngle={Math.PI / 4 - 0.35}
        />
      </Canvas>
    </div>
  )
}
