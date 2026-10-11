import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Earth } from './Earth'
import { Moon } from './Moon'
import { OrbitPath } from './OrbitPath'
import { StarField } from './StarField'
import type { MissionStatus } from '../../types/mission'

interface SpaceSceneProps {
  status: MissionStatus
  orbitalAngle: number
  elapsedFraction: number
  orbitalRadius: number
  orbitalInclination: number
  isFinalMinute: boolean
  reducedMotion?: boolean
}

// Cinematic Camera Director for Standby, Active Countdown & Final Minute
const CameraDirector: React.FC<{
  status: MissionStatus
  isFinalMinute: boolean
  reducedMotion: boolean
}> = ({ status, isFinalMinute, reducedMotion }) => {
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
  isFinalMinute,
  reducedMotion = false,
}) => {
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

        {/* Directional Sunlight Illumination */}
        <ambientLight intensity={0.22} color="#100B20" />
        <directionalLight
          position={[12, 4, 12]}
          intensity={3.2}
          color="#FFF8EB"
          castShadow
        />
        {/* Deep-space fill illumination */}
        <directionalLight
          position={[-12, -3, -10]}
          intensity={0.24}
          color="#2E1065"
        />

        {/* Multi-depth Astronomical Starfield */}
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
        </Suspense>

        {/* Dynamic Camera Director */}
        <CameraDirector
          status={status}
          isFinalMinute={isFinalMinute}
          reducedMotion={reducedMotion}
        />

        {/* Interactive inspection controls */}
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
