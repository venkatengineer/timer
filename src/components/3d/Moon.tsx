import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateMoonTexture } from '../../utils/textureGenerator'
import { calculateOrbitalPosition, DEFAULT_INITIAL_ANGLE } from '../../utils/orbitalMechanics'

interface MoonProps {
  orbitalAngle: number
  orbitalRadius?: number
  orbitalInclination?: number
  moonRadius?: number
  isFinalMinute?: boolean
  isCompleted?: boolean
}

export const Moon: React.FC<MoonProps> = ({
  orbitalAngle,
  orbitalRadius = 6.4,
  orbitalInclination = (23.5 * Math.PI) / 180,
  moonRadius = 0.52,
  isFinalMinute = false,
  isCompleted = false,
}) => {
  const moonGroupRef = useRef<THREE.Group>(null)
  const probeGroupRef = useRef<THREE.Group>(null)
  const beaconLightRef = useRef<THREE.PointLight>(null)

  const textureLoader = useMemo(() => new THREE.TextureLoader(), [])
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

  // NASA High-Resolution Moon Texture Map
  const moonTexture = useMemo(() => {
    const tex = textureLoader.load(
      `${basePath}textures/moon_1024.jpg`,
      undefined,
      undefined,
      () => generateMoonTexture(1024, 512)
    )
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [textureLoader, basePath])

  // Exact 3D position derived strictly from authoritative orbitalAngle
  const position = useMemo(() => {
    return calculateOrbitalPosition(
      orbitalAngle ?? DEFAULT_INITIAL_ANGLE,
      orbitalRadius,
      orbitalInclination
    )
  }, [orbitalAngle, orbitalRadius, orbitalInclination])

  useFrame((state) => {
    if (moonGroupRef.current) {
      moonGroupRef.current.position.set(position[0], position[1], position[2])
      // Tidally lock the Moon to always face Earth at [0, 0, 0]
      moonGroupRef.current.lookAt(0, 0, 0)
    }

    // Micro orbital probe rotation around the Moon
    if (probeGroupRef.current) {
      probeGroupRef.current.rotation.y = state.clock.elapsedTime * 0.8
    }

    // Subtle technical telemetry beacon pulse
    if (beaconLightRef.current) {
      const pulseSpeed = isFinalMinute ? 8.0 : 1.5
      beaconLightRef.current.intensity =
        0.4 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3
    }
  })

  return (
    <group ref={moonGroupRef} position={position}>
      {/* 3D Lunar Body with Real NASA Surface Material & Sunlight Shadowing */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[moonRadius, 64, 64]} />
        <meshStandardMaterial
          map={moonTexture}
          roughness={0.92}
          metalness={0.05}
          bumpMap={moonTexture}
          bumpScale={0.03}
        />
      </mesh>

      {/* Discrete Technical Orbital Marker Probe (Tiny research satellite in low lunar orbit) */}
      <group ref={probeGroupRef}>
        <mesh position={[moonRadius * 1.35, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Tiny solar panels on probe */}
        <mesh position={[moonRadius * 1.35, 0, 0.06]}>
          <boxGeometry args={[0.08, 0.01, 0.03]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[moonRadius * 1.35, 0, -0.06]}>
          <boxGeometry args={[0.08, 0.01, 0.03]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* Telemetry Point Light (Soft subtle beacon) */}
      <pointLight
        ref={beaconLightRef}
        color={isFinalMinute || isCompleted ? '#F472B6' : '#C4B5FD'}
        distance={2.5}
        decay={2}
        intensity={0.5}
      />
    </group>
  )
}
